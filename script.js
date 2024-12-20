// Globale Variablen für XP, Level und Benutzerstatus
let xp = 0;
let level = 1;
let currentUser = null;
let isAdmin = false;

window.onload = function () {
    console.log("window.onload aufgerufen");
    
    initialisiereSpezialfähigkeitenFürAlleSpieler(); // Spezialfähigkeiten für alle Spieler prüfen und speichern
    
    erstelleLogbuch(); 
    const logbuchContainer = document.getElementById("logbuch-container");
    if (logbuchContainer) {
        logbuchContainer.style.display = "none";
    }
    const logbuchButton = document.getElementById("logbuch-button");
    if (logbuchButton) {
        logbuchButton.style.display = "none"; // Button beim Start ausblenden
    }
    setTimeout(() => {
        steuerungLogbuch(false); // Zusätzliche Sicherheit für das Logbuch
    }, 0);
    const heutigesDatum = new Date().toDateString();
    const letzterTag = localStorage.getItem("letzteHPRegeneration");

    // HP einmal am Tag regenerieren
    if (letzterTag !== heutigesDatum) {
        täglicheHPRegeneration();
        täglicheMPRegeneration();
        localStorage.setItem("letzteHPRegeneration", heutigesDatum);
    }

    zeigeStartseite();
    ladeLogbuch();
    ladeAktionen();
    initialisiereSpezialfähigkeiten();
};

// Startseite initialisieren
function initialisiereSpezialfähigkeiten() {
    fügeSpezialfähigkeitenButtonHinzu();
    fügeFähigkeitenÜbersichtHinzu();
}

// Logbuch nur auf der Startseite ausblenden
function steuerungLogbuch(anzeigen) {
    const logbuchButton = document.getElementById("logbuch-button");
    if (logbuchButton) {
        logbuchButton.style.display = anzeigen ? "block" : "none";
    } else {
        console.warn("Logbuch-Button wurde noch nicht erstellt.");
    }
}

function erstelleLogbuch() {
    console.log("Logbuch wird erstellt...");

    // Container für das Logbuch erstellen
    const logbuchContainer = document.createElement("div");
    logbuchContainer.id = "logbuch-container";
    logbuchContainer.innerHTML = "<h3>Logbuch</h3><ul id='logbuch-list'></ul>";
    document.body.appendChild(logbuchContainer);

    // Button für das Öffnen/Schließen des Logbuchs
    const logbuchButton = document.createElement("button");
    logbuchButton.id = "logbuch-button";
    logbuchButton.textContent = "Logbuch";

    logbuchButton.addEventListener("click", () => {
        if (logbuchContainer.style.display === "none") {
            logbuchContainer.style.display = "block";
        } else {
            logbuchContainer.style.display = "none";
        }
    });

    document.body.appendChild(logbuchButton);
    console.log("Logbuch-Button und Container erstellt.");
}

function logbuchEintrag(questBeschreibung, benutzername, xp) {
    console.log("Neuer Logbuch-Eintrag wird erstellt...");
    const logbuchListe = document.getElementById("logbuch-list");

    const datum = new Date();
    const zeitstempel = datum.toLocaleString();

    const eintrag = document.createElement("li");
    eintrag.style.marginBottom = "10px";
    eintrag.innerHTML = `
        <strong>${questBeschreibung}</strong><br>
        Erledigt von: ${benutzername}<br>
        XP: ${xp}<br>
        Am: ${zeitstempel}
    `;

    // Füge den neuen Eintrag oben hinzu (chronologisch absteigend)
    logbuchListe.prepend(eintrag);

    // Optional: Eintrag in Firebase speichern (falls benötigt)
    if (currentUser) {
        firebase.database().ref("logbuch").push({
            quest: questBeschreibung,
            benutzer: benutzername,
            xp: xp,
            zeit: zeitstempel
        }).then(() => {
            console.log("Logbuch-Eintrag erfolgreich gespeichert.");
        }).catch((error) => {
            console.error("Fehler beim Speichern des Logbuch-Eintrags:", error);
        });
    }
}

function ladeLogbuch() {
    firebase.database().ref("logbuch").get().then((snapshot) => {
        if (snapshot.exists()) {
            const daten = snapshot.val();
            const logbuchListe = document.getElementById("logbuch-list");
            logbuchListe.innerHTML = ""; // Liste zurücksetzen

            Object.values(daten).forEach((eintrag) => {
                const listItem = document.createElement("li");
                listItem.style.marginBottom = "10px";
                listItem.innerHTML = `
                    <strong>${eintrag.quest}</strong><br>
                    Erledigt von: ${eintrag.benutzer}<br>
                    XP: ${eintrag.xp}<br>
                    Am: ${eintrag.zeit}
                `;
                logbuchListe.prepend(listItem); // Chronologisch absteigend
            });
        } else {
            console.log("Keine Logbuch-Einträge gefunden.");
        }
    }).catch((error) => {
        console.error("Fehler beim Laden des Logbuchs:", error);
    });
}

function zeigeStartseite() {
    console.log('zeigeStartseite() aufgerufen');

    steuerungLogbuch(false); // Logbuch-Button ausblenden

    const loginSection = document.getElementById('login-section');
    if (loginSection) {
        loginSection.innerHTML = `
            <label for="spielerDropdown">Spieler auswählen:</label>
            <select id="spielerDropdown">
                <option value="">-- Bitte wählen --</option>
                <option value="Thomas">Thomas</option>
                <option value="Elke">Elke</option>
                <option value="Jamie">Jamie</option>
            </select>
            <input type="password" id="spielerPasswort" placeholder="Passwort eingeben">
            <button id="benutzerLoginButton">Anmelden</button>
        `;
        loginSection.style.display = 'block';

        const benutzerLoginButton = document.getElementById('benutzerLoginButton');
        if (benutzerLoginButton) {
            benutzerLoginButton.onclick = benutzerAnmeldung;
        }
    }

    // Spezialfähigkeiten-Aktionen zur Startseite hinzufügen
    fügeAktionenZurStartseiteHinzu();

    ladeBenutzerdaten();
}

function zeigeQuestbook() {
    document.getElementById("quests-section").style.display = "block";
    document.getElementById("xp-counter").style.display = "block";
    document.getElementById("logout-button").style.display = "block";
    document.getElementById("login-section").style.display = "none";

    const logbuchButton = document.getElementById("logbuch-button");
    if (logbuchButton) {
        logbuchButton.style.display = "block";
    }
}

function benutzerAnmeldung() {
    console.log("benutzerAnmeldung() aufgerufen");

    const npcLoginSection = document.getElementById("npc-login-section");
    const logbuchButton = document.getElementById("logbuch-button");
    const benutzernameInput = document.getElementById("spielerDropdown");
    const passwortInput = document.getElementById("spielerPasswort");
    const benutzerContainer = document.getElementById("benutzer-container");

    if (!benutzernameInput || !passwortInput) {
        console.error("Fehler: Spieler-Dropdown oder Passwortfeld nicht gefunden!");
        alert("Es gab ein Problem beim Laden der Seite. Bitte versuche es später erneut.");
        return;
    }

    const benutzername = benutzernameInput.value.trim();
    const passwort = passwortInput.value.trim();

    const benutzerPasswoerter = {
        Thomas: "12345",
        Elke: "julian0703",
        Jamie: "602060",
    };

    if (!benutzername || !benutzerPasswoerter[benutzername]) {
        alert("Bitte wähle einen gültigen Benutzer aus.");
        return;
    }

    if (passwort !== benutzerPasswoerter[benutzername]) {
        alert("Das eingegebene Passwort ist falsch.");
        return;
    }

    // Benutzer erfolgreich angemeldet
    currentUser = benutzername;
    isAdmin = false;
    console.log(`${benutzername} erfolgreich angemeldet`);

    if (logbuchButton) {
        logbuchButton.style.display = "block";
    }

    if (npcLoginSection) npcLoginSection.style.display = "none";
    if (benutzerContainer) benutzerContainer.style.display = "none";

    zeigeQuestbook();
    ladeFortschritte();
    täglicheHPRegeneration();
    zeigeAvatar();
    ladeGlobaleQuests();

    console.log("Benutzeranmeldung abgeschlossen!");
}

// NPC Login
function npcLogin() {
    console.log("npcLogin() aufgerufen");
    const username = document.getElementById("npcBenutzername")?.value;
    const password = document.getElementById("npcPasswort")?.value;

    if (username === "npc" && password === "1234") {
        console.log("NPC erfolgreich eingeloggt!");
        isAdmin = true;
        currentUser = null;

        document.getElementById("npc-login-section").style.display = "none";
        zeigeQuestbook();
        ladeGlobaleQuests();
        zeigeAdminFunktionen();
    } else {
        alert("Falsche Anmeldedaten!");
    }
}


// Benutzerfortschritte speichern in Firebase
function speichereFortschritte() {
    if (currentUser) {
        firebase.database().ref(`benutzer/${currentUser}/fortschritte`).set({
            xp: xp,
            level: level,
            hp: aktuelleHP || berechneMaxHP(level),
            maxHP: maxHP || berechneMaxHP(level),
            mp: aktuelleMP || berechneMaxMP(level),
            maxMP: maxMP || berechneMaxMP(level)
        })
        .then(() => {
            console.log("Fortschritte erfolgreich gespeichert.");
        })
        .catch((error) => {
            console.error("Fehler beim Speichern der Fortschritte:", error);
        });
    }
}


// Benutzerfortschritte aus Firebase laden
function ladeFortschritte(callback) {
    if (currentUser) {
        firebase.database().ref(`benutzer/${currentUser}/fortschritte`).get()
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const daten = snapshot.val();
                    xp = daten.xp || 0;
                    level = daten.level || 1;
                    aktuelleHP = daten.hp !== undefined ? daten.hp : berechneMaxHP(level);
                    maxHP = berechneMaxHP(level);
                    aktuelleMP = daten.mp !== undefined ? daten.mp : berechneMaxMP(level);
                    maxMP = berechneMaxMP(level);

                    aktualisiereXPAnzeige();
                    aktualisiereHPLeiste(aktuelleHP, level);
                    aktualisiereMPLeiste(aktuelleMP, level);

                    // Callback aufrufen, wenn vorhanden
                    if (typeof callback === "function") {
                        callback();
                    }
                } else {
                    console.log("Keine Fortschrittsdaten gefunden für den Benutzer:", currentUser);
                }
            })
            .catch((error) => {
                console.error("Fehler beim Laden der Fortschrittsdaten:", error);
            });
    }
}



// Tägliche HP-Regeneration
function täglicheHPRegeneration() {
    if (!currentUser) return; // Sicherstellen, dass ein Benutzer angemeldet ist

    const heutigesDatum = new Date().toDateString();
    const letzterTag = localStorage.getItem("letzteHPRegeneration");

    if (letzterTag === heutigesDatum) {
        console.log("HP wurde heute bereits regeneriert.");
        return;
    }

    firebase.database().ref(`benutzer/${currentUser}/fortschritte`).get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                const daten = snapshot.val();
                const aktuelleHP = daten.hp || berechneMaxHP(daten.level);
                const maxHP = berechneMaxHP(daten.level);

                if (aktuelleHP < maxHP) {
                    const neueHP = Math.min(aktuelleHP + 100, maxHP);

                    firebase.database().ref(`benutzer/${currentUser}/fortschritte/hp`).set(neueHP)
                        .then(() => {
                            console.log(`Tägliche HP-Regeneration abgeschlossen: ${aktuelleHP} -> ${neueHP}`);
                            aktualisiereHPLeiste(neueHP, daten.level);
                            localStorage.setItem("letzteHPRegeneration", heutigesDatum);
                        })
                        .catch((error) => {
                            console.error("Fehler beim Speichern der regenerierten HP:", error);
                        });
                }
            }
        })
        .catch((error) => {
            console.error("Fehler beim Laden der Fortschrittsdaten:", error);
        });
}


function täglicheMPRegeneration() {
    if (currentUser) {
        firebase.database().ref(`benutzer/${currentUser}/fortschritte`).get()
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const daten = snapshot.val();
                    const maxMP = berechneMaxMP(daten.level);

                    // MP auf Maximum setzen
                    firebase.database().ref(`benutzer/${currentUser}/fortschritte/mp`).set(maxMP)
                        .then(() => {
                            console.log(`Tägliche MP-Regeneration abgeschlossen: ${maxMP}`);
                            aktualisiereMPLeiste(maxMP, daten.level);
                        })
                        .catch((error) => {
                            console.error("Fehler beim Speichern der regenerierten MP:", error);
                        });
                }
            })
            .catch((error) => {
                console.error("Fehler beim Laden der MP-Daten:", error);
            });
    }
}


function speichereQuestsInFirebase(quests) {
    if (currentUser) {
        firebase.database().ref(`benutzer/${currentUser}/quests`).set(quests)
        .then(() => {
            console.log("Quests erfolgreich gespeichert.");
        })
        .catch((error) => {
            console.error("Fehler beim Speichern der Quests:", error);
        });
    }
}

function ladeGlobaleQuests() {
    console.log("ladeGlobaleQuests() aufgerufen");
    firebase.database().ref('quests').get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                const gespeicherteQuests = snapshot.val();
                console.log("Globale Quests:", gespeicherteQuests);

                const questList = document.getElementById("quests");
                questList.innerHTML = ""; // Liste der Quests zurücksetzen

                gespeicherteQuests.forEach((quest, index) => {
                    const istErledigt = quest.alleBenutzer
                        ? quest.erledigtVon && quest.erledigtVon[currentUser]
                        : quest.erledigt;

                    const xpAnzeigen = quest.xpProEinheit
                        ? `${quest.xpProEinheit} XP je Einheit`
                        : `${quest.xp || 0} XP`;

                    const verbleibend = quest.maximaleMenge
                        ? ` (${quest.aktuelleMenge || 0}/${quest.maximaleMenge} erledigt)`
                        : "";

                    const listItem = document.createElement("li");
                    listItem.innerHTML = `
                        <span class="quest-text" style="text-decoration: ${istErledigt ? 'line-through' : 'none'};">
                            <strong>Quest ${index + 1}:</strong> ${quest.beschreibung} 
                            <span class="xp-display">( ${xpAnzeigen}${verbleibend} )</span>
                            ${
                                istErledigt
                                    ? `<br><small>Erledigt von: ${
                                        quest.erledigtVon ? Object.keys(quest.erledigtVon).join(", ") : "Unbekannt"
                                    }</small>`
                                    : ""
                            }
                        </span>
                        ${
                            !istErledigt && !isAdmin
                                ? `<button onclick="questErledigt(${index})">Erledigt</button>`
                                : ""
                        }
                    `;

                    listItem.setAttribute("data-xp", quest.xp || 0);
                    questList.appendChild(listItem);
                });

                if (isAdmin) {
                    zeigeAdminFunktionen();
                }
            } else {
                console.log("Keine globalen Quests gefunden.");
            }
        })
        .catch((error) => {
            console.error("Fehler beim Laden der globalen Quests:", error);
        });
}

function aktualisiereXPAnzeige() {
    console.log("aktualisiereXPAnzeige() aufgerufen");
    const levelElement = document.getElementById('level');
    const xpProgressElement = document.getElementById('xp-progress');
    const xpLabelElement = document.getElementById("xp-label");

    if (levelElement) {
        levelElement.textContent = level;
    }

    const xpFürLevelUp = level <= 10 ? 100 : 200 + ((Math.floor((level - 1) / 10)) * 100);

    if (xpProgressElement) {
        const progress = Math.min((xp / xpFürLevelUp) * 100, 100);
        xpProgressElement.style.width = `${progress}%`;
    }

    if (xpLabelElement) {
        xpLabelElement.textContent = `Noch ${xpFürLevelUp - xp} XP bis zum nächsten Level`;
    }

    überprüfeLevelAufstieg();
    speichereFortschritte();
}

function überprüfeLevelAufstieg() {
    console.log("überprüfeLevelAufstieg() aufgerufen");
    const xpFürLevelUp = level <= 10 ? 100 : 200 + ((Math.floor((level - 1) / 10)) * 100);

    while (xp >= xpFürLevelUp) {
        xp -= xpFürLevelUp;
        level++;
        aktualisiereXPAnzeige();
        zeigeLevelUpAnimation();
    }
}

function zeigeLevelUpAnimation() {
    console.log("zeigeLevelUpAnimation() aufgerufen");
    const videoContainer = document.createElement('div');
    videoContainer.id = 'level-up-video-container';
    videoContainer.style.position = 'fixed';
    videoContainer.style.top = '0';
    videoContainer.style.left = '0';
    videoContainer.style.width = '100%';
    videoContainer.style.height = '100%';
    videoContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    videoContainer.style.zIndex = '500';

    const video = document.createElement('video');
    video.src = 'avatars/lvlup.mp4';
    video.autoplay = true;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'contain';

    videoContainer.appendChild(video);
    document.body.appendChild(videoContainer);

    setTimeout(() => {
        if (videoContainer && document.body.contains(videoContainer)) {
            video.pause();
            document.body.removeChild(videoContainer);
        }
    }, 10000); // Video nach 10 Sekunden entfernen
}

function questErledigt(questNummer) {
    console.log("questErledigt() aufgerufen für QuestNummer:", questNummer);
    firebase.database().ref('quests').get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                let quests = snapshot.val() || [];
                let quest = quests[questNummer];

                if (quest) {
                    const verbleibendeMenge = quest.maximaleMenge - (quest.aktuelleMenge || 0);

                    if (verbleibendeMenge <= 0) {
                        alert("Diese Quest wurde bereits vollständig abgeschlossen.");
                        return;
                    }

                    const erledigteMenge = parseInt(prompt(`Wie viele Einheiten möchtest du erledigen? (Verfügbar: ${verbleibendeMenge})`), 10);

                    if (isNaN(erledigteMenge) || erledigteMenge <= 0 || erledigteMenge > verbleibendeMenge) {
                        alert("Ungültige Eingabe. Bitte gib eine gültige Menge ein.");
                        return;
                    }

                    const xpGutschrift = erledigteMenge * (quest.xpProEinheit || 0);
                    xp += xpGutschrift;

                    quest.aktuelleMenge = (quest.aktuelleMenge || 0) + erledigteMenge;
                    if (!quest.erledigtVon) {
                        quest.erledigtVon = {};
                    }
                    if (!quest.erledigtVon[currentUser]) {
                        quest.erledigtVon[currentUser] = 0;
                    }
                    quest.erledigtVon[currentUser] += erledigteMenge;

                    speichereFortschritte();

                    logbuchEintrag(quest.beschreibung, currentUser, xpGutschrift);

                    firebase.database().ref('quests').set(quests)
                        .then(() => {
                            aktualisiereXPAnzeige();
                            ladeGlobaleQuests();
                            console.log(`Quest ${questNummer} wurde um ${erledigteMenge} Einheiten ergänzt.`);
                        })
                        .catch((error) => {
                            console.error("Fehler beim Speichern der Quest als erledigt:", error);
                        });
                } else {
                    alert("Quest konnte nicht gefunden werden.");
                }
            } else {
                alert("Keine Quests vorhanden.");
            }
        })
        .catch((error) => {
            console.error("Fehler beim Markieren der Quest als erledigt:", error);
        });
}

function aktualisiereQuestImDOM(questNummer, quest) {
    const questList = document.getElementById("quests");
    const questElement = questList.children[questNummer];

    if (questElement) {
        const questText = questElement.querySelector(".quest-text");

        if (questText) {
            questText.style.textDecoration = "line-through";
            const erledigtInfo = quest.alleBenutzer
                ? `<br><small>Erledigt von: ${currentUser}</small>`
                : `<br><small>Erledigt von: ${quest.erledigtVon || 'Unbekannt'}</small>`;
            questText.innerHTML += erledigtInfo;
        }

        const erledigtButton = questElement.querySelector("button");
        if (erledigtButton) {
            erledigtButton.remove();
        }
    }
}

// Wichtig: Keine Funktion "erstelleLogbuchSchaltfläche()" mehr!
// Stelle sicher, dass diese Funktion nicht mehr existiert und nirgends aufgerufen wird.

// Neue Quest erstellen
function neueQuestErstellen() {
    console.log("neueQuestErstellen() aufgerufen");
    const neueQuestBeschreibung = prompt("Bitte die Beschreibung für die neue Quest eingeben:");
    const xpProEinheit = parseInt(prompt("Wie viele XP soll jede Einheit dieser Quest geben?"), 10);
    const maximaleMenge = parseInt(prompt("Wie viele Einheiten sind maximal zu erledigen?"), 10);
    const alleBenutzer = confirm("Kann diese Quest von allen Benutzern abgeschlossen werden? (OK = Ja, Abbrechen = Nein)");

    if (neueQuestBeschreibung && !isNaN(xpProEinheit) && !isNaN(maximaleMenge)) {
        const neueQuest = {
            beschreibung: neueQuestBeschreibung,
            xpProEinheit: xpProEinheit,
            maximaleMenge: maximaleMenge,
            aktuelleMenge: 0,
            erledigtVon: {},
            alleBenutzer: alleBenutzer
        };

        firebase.database().ref('quests').once('value')
            .then((snapshot) => {
                let quests = snapshot.exists() ? snapshot.val() : [];

                if (!Array.isArray(quests)) {
                    console.error("Fehler: Erwartete eine Array-Struktur für die Quests.");
                    quests = [];
                }

                quests.push(neueQuest);

                return firebase.database().ref('quests').set(quests);
            })
            .then(() => {
                console.log("Neue Quest erfolgreich erstellt.");
                ladeGlobaleQuests();
            })
            .catch((error) => {
                console.error("Fehler beim Speichern der neuen Quest:", error);
            });
    } else {
        alert("Ungültige Eingabe. Bitte gib eine gültige Beschreibung, XP pro Einheit und maximale Menge ein.");
    }
}

function zeigeAdminFunktionen() {
    console.log("zeigeAdminFunktionen() aufgerufen");

    const levelSetContainer = document.getElementById("level-set-container");
    const adminButtonsContainer = document.getElementById("admin-buttons-container");

    if (isAdmin) {
        console.log("Admin-Modus aktiv, zeige Admin-Funktionen");

        const questItems = document.querySelectorAll("#quests li");
        questItems.forEach((questItem, index) => {
            if (!questItem.querySelector(".edit-button")) {
                const editButton = document.createElement("button");
                editButton.textContent = "Bearbeiten";
                editButton.className = "edit-button";
                editButton.onclick = () => questBearbeiten(index);
                questItem.appendChild(editButton);
                console.log(`Bearbeiten-Button für Quest ${index + 1} hinzugefügt.`);
            }
        });

        if (levelSetContainer) {
            levelSetContainer.style.display = "block";
        }

        if (!adminButtonsContainer) {
            console.log("Admin-Buttons werden erstellt.");
            const questbookContainer = document.getElementById("quests-section");
            const newAdminButtonsContainer = document.createElement("div");
            newAdminButtonsContainer.id = "admin-buttons-container";

            const createButton = document.createElement("button");
            createButton.textContent = "Neue Quest erstellen";
            createButton.id = "createQuestButton";
            createButton.onclick = neueQuestErstellen;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Alle Quests zurücksetzen";
            deleteButton.id = "deleteQuestsButton";
            deleteButton.onclick = questsZuruecksetzen;

            newAdminButtonsContainer.appendChild(createButton);
            newAdminButtonsContainer.appendChild(deleteButton);
            questbookContainer.appendChild(newAdminButtonsContainer);
        }
    } else {
        console.log("Kein Admin-Modus, verstecke Admin-Funktionen");

        if (adminButtonsContainer) {
            adminButtonsContainer.remove();
        }

        if (levelSetContainer) {
            levelSetContainer.style.display = "none";
        }

        const editButtons = document.querySelectorAll(".edit-button");
        editButtons.forEach((editButton) => {
            editButton.remove();
        });
    }
}

function questsZuruecksetzen() {
    console.log("questsZuruecksetzen() aufgerufen");
    if (confirm("Möchtest du wirklich alle Quests zurücksetzen?")) {
        firebase.database().ref('quests').set([])
        .then(() => {
            console.log("Alle Quests wurden zurückgesetzt.");
            ladeGlobaleQuests();
        })
        .catch((error) => {
            console.error("Fehler beim Zurücksetzen der Quests:", error);
        });
    }
}

function questBearbeiten(questNummer) {
    console.log("questBearbeiten() aufgerufen für QuestNummer:", questNummer);
    firebase.database().ref('quests').get()
    .then((snapshot) => {
        if (snapshot.exists()) {
            const quests = snapshot.val();
            if (quests[questNummer]) {
                const neueBeschreibung = prompt("Neue Beschreibung der Quest:", quests[questNummer].beschreibung);
                const neueXP = parseInt(prompt("Neue XP für diese Quest:", quests[questNummer].xp), 10);

                if (neueBeschreibung && !isNaN(neueXP)) {
                    quests[questNummer].beschreibung = neueBeschreibung;
                    quests[questNummer].xp = neueXP;
                    firebase.database().ref('quests').set(quests)
                        .then(() => {
                            console.log("Quest erfolgreich bearbeitet.");
                            ladeGlobaleQuests();
                        })
                        .catch((error) => {
                            console.error("Fehler beim Speichern der bearbeiteten Quest:", error);
                        });
                } else {
                    alert("Ungültige Eingabe. Bitte versuche es erneut.");
                }
            }
        }
    })
    .catch((error) => {
        console.error("Fehler beim Bearbeiten der Quest:", error);
    });
}

function zeigeAvatar() {
    console.log("zeigeAvatar() aufgerufen für Benutzer:", currentUser);

    if (currentUser) {
        const avatarContainer = document.getElementById("avatar-container");

        if (!avatarContainer) {
            console.error("Avatar-Container wurde nicht gefunden!");
            return;
        }

        const avatarPath = getAvatarForUser(currentUser);

        if (!avatarPath) {
            console.error(`Kein Avatar gefunden für Benutzer: ${currentUser}`);
            return;
        }

        avatarContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center;">
                <video autoplay loop muted style="border-radius: 50%; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);">
                    <source src="${avatarPath}" type="video/mp4">
                </video>
                <button id="zauber-button" onclick="zeigeZauberMenu()" 
                        style="margin-top: 15px; padding: 10px 20px; background-color: #FFD700; 
                               color: black; font-weight: bold; border: none; border-radius: 5px;
                               box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);">
                    Zauber
                </button>
            </div>
        `;

        fügeSpezialfähigkeitenButtonHinzu(); // Hier den Button für Spezialfähigkeiten hinzufügen
        avatarContainer.style.display = "flex";
        avatarContainer.style.flexDirection = "column";
        avatarContainer.style.alignItems = "center";
        avatarContainer.style.marginTop = "20px";
    } else {
        console.error("Kein Benutzer angemeldet. Avatar kann nicht angezeigt werden.");
    }

    const questsSection = document.getElementById("quests-section");
    if (questsSection) {
        questsSection.style.marginTop = "30px";
    }
}


function ausloggen() {
    console.log("ausloggen() aufgerufen");
    
    const logbuchButton = document.getElementById("logbuch-button");
    if (logbuchButton) {
        logbuchButton.style.display = "none";
    }

    const logbuchContainer = document.getElementById("logbuch-container");
    if (logbuchContainer) logbuchContainer.style.display = "none";

    currentUser = null;
    isAdmin = false;

    const avatarContainer = document.getElementById("avatar-container");
    if (avatarContainer) {
        avatarContainer.style.display = "none";
        avatarContainer.innerHTML = "";
    }

    document.getElementById("quests-section").style.display = "none";
    document.getElementById("xp-counter").style.display = "none";
    document.getElementById("logout-button").style.display = "none";

    const npcLoginSection = document.getElementById("npc-login-section");
    if (npcLoginSection) npcLoginSection.style.display = "block";

    const questList = document.getElementById("quests");
    if (questList) {
        questList.innerHTML = "";
    }

    const adminButtonsContainer = document.getElementById("admin-buttons-container");
    if (adminButtonsContainer) {
        adminButtonsContainer.remove();
    }

    const hpContainer = document.getElementById("hp-bar-container");
    if (hpContainer) {
        hpContainer.style.display = "none";
    }

    const mpContainer = document.getElementById("mp-bar-container");
    if (mpContainer) {
        mpContainer.style.display = "none";
    }

    const benutzerContainer = document.getElementById("benutzer-container");
    if (benutzerContainer) {
        benutzerContainer.style.display = "flex";
    }

    zeigeStartseite();
}

let benutzerDaten = [];

function ladeBenutzerdaten() {
    console.log("ladeBenutzerdaten() aufgerufen");
    firebase.database().ref('benutzer').get().then((snapshot) => {
        if (snapshot.exists()) {
            benutzerDaten = snapshot.val();
            zeigeBenutzerAufStartseite();
        } else {
            console.log("Keine Benutzerdaten gefunden.");
        }
    }).catch((error) => {
        console.error("Fehler beim Laden der Benutzerdaten:", error);
    });
}

function zeigeBenutzerAufStartseite() {
    console.log("zeigeBenutzerAufStartseite() aufgerufen");
    const benutzerContainer = document.getElementById("benutzer-container");
    benutzerContainer.innerHTML = "";

    for (const [benutzername, daten] of Object.entries(benutzerDaten)) {
        const benutzerElement = document.createElement("div");
        benutzerElement.className = "benutzer-item";

        const avatarElement = document.createElement("video");
        avatarElement.src = getAvatarForUser(benutzername);
        avatarElement.autoplay = true;
        avatarElement.loop = true;
        avatarElement.muted = true;
        avatarElement.style.width = "100px";

        const nameElement = document.createElement("h3");
        nameElement.textContent = benutzername;

        const levelElement = document.createElement("div");
        levelElement.textContent = `Level: ${daten.fortschritte?.level || 1}`;
        levelElement.style.border = "2px solid gold";
        levelElement.style.padding = "5px";
        levelElement.style.borderRadius = "5px";
        levelElement.style.textAlign = "center";

        const mpElement = document.createElement("div");
        mpElement.className = "mp-bar";
        const aktuelleMP = daten.fortschritte?.mp || 0;
        const maxMP = daten.fortschritte?.maxMP || berechneMaxMP(daten.fortschritte?.level || 1);
        const mpProzent = (aktuelleMP / maxMP) * 100;
        mpElement.innerHTML = `
            <div class="progress" style="width: ${mpProzent}%; background-color: blue;"></div>
            <span class="mp-text">${aktuelleMP} / ${maxMP} MP</span>
        `;
        mpElement.title = `${aktuelleMP} / ${maxMP} MP`;

        const hpElement = document.createElement("div");
        hpElement.className = "hp-bar";
        const aktuelleHP = daten.fortschritte?.hp || berechneMaxHP(1);
        const maxHP = berechneMaxHP(daten.fortschritte?.level || 1);
        const hpProzent = (aktuelleHP / maxHP) * 100;
        hpElement.innerHTML = `
            <div class="progress" style="width: ${hpProzent}%; background-color: ${berechneHPFarbe(hpProzent)};"></div>
            <span class="hp-text">${aktuelleHP} / ${maxHP} HP</span>
        `;
        hpElement.title = `${aktuelleHP} / ${maxHP} HP`;

        benutzerElement.appendChild(avatarElement);
        benutzerElement.appendChild(nameElement);
        benutzerElement.appendChild(levelElement);
        benutzerElement.appendChild(hpElement);
        benutzerElement.appendChild(mpElement);

        benutzerContainer.appendChild(benutzerElement);
    }
}

function getAvatarForUser(user) {
    if (user === "Thomas") {
        return "avatars/thomas.mp4";
    } else if (user === "Elke") {
        return "avatars/elke.mp4";
    } else if (user === "Jamie") {
        return "avatars/jamie.mp4";
    }
    return "https://via.placeholder.com/100?text=Avatar";
}

function berechneMaxHP(level) {
    return 100 + Math.floor((level - 1) / 10) * 200;
}

function aktualisiereHPLeiste(aktuelleHP, level) {
    const maxHP = berechneMaxHP(level);
    const hpProgress = document.getElementById("hp-progress");

    if (hpProgress) {
        const prozent = (aktuelleHP / maxHP) * 100;
        hpProgress.style.width = `${prozent}%`;
        hpProgress.textContent = `${aktuelleHP} / ${maxHP} HP`;

        if (prozent > 75) {
            hpProgress.style.backgroundColor = "green";
        } else if (prozent > 50) {
            hpProgress.style.backgroundColor = "yellow";
        } else if (prozent > 25) {
            hpProgress.style.backgroundColor = "orange";
        } else {
            hpProgress.style.backgroundColor = "red";
        }
    }
}

function berechneMaxMP(level) {
    return 50 + Math.floor((level - 1) / 10) * 50;
}

function aktualisiereMPLeiste(aktuelleMP, level) {
    const maxMP = berechneMaxMP(level);
    const mpProgress = document.getElementById("mp-progress");

    if (mpProgress) {
        const prozent = (aktuelleMP / maxMP) * 100;
        mpProgress.style.width = `${prozent}%`;
        mpProgress.textContent = `${aktuelleMP} / ${maxMP} MP`;
    }
}

function berechneHPFarbe(prozent) {
    if (prozent > 75) return "green";
    if (prozent > 50) return "yellow";
    if (prozent > 25) return "orange";
    return "red";
}

function aktualisiereLayout() {
    const hpContainer = document.getElementById("hp-bar-container");
    const questsSection = document.getElementById("quests-section");

    if (hpContainer && questsSection) {
        questsSection.style.marginTop = "20px";
    }
}
function zeigeZauberMenu() {
    const zauberMenu = document.createElement("div");
    zauberMenu.id = "zauber-menu";
    zauberMenu.style.position = "absolute";
    zauberMenu.style.top = "50%";
    zauberMenu.style.left = "50%";
    zauberMenu.style.transform = "translate(-50%, -50%)";
    zauberMenu.style.backgroundColor = "white";
    zauberMenu.style.padding = "20px";
    zauberMenu.style.border = "2px solid black";
    zauberMenu.style.borderRadius = "10px";

    const spielerDropdown = document.createElement("select");
    spielerDropdown.id = "spieler-dropdown";
    spielerDropdown.style.marginBottom = "15px";

    Object.keys(benutzerDaten).forEach((spieler) => {
        if (spieler !== currentUser) {
            const option = document.createElement("option");
            option.value = spieler;
            option.textContent = spieler;
            spielerDropdown.appendChild(option);
        }
    });

    zauberMenu.innerHTML = `
        <h3>Zauber</h3>
    `;
    zauberMenu.appendChild(spielerDropdown);
    zauberMenu.innerHTML += `
        <button onclick="schadenZufügen()">Schaden zufügen</button>
        <button onclick="heilen()">Heilen</button>
        <button onclick="document.body.removeChild(document.getElementById('zauber-menu'))">Schließen</button>
    `;
    document.body.appendChild(zauberMenu);
}

function schadenZufügen() {
    const zielSpieler = document.getElementById("spieler-dropdown").value;
    const schaden = parseInt(prompt("Wie viel Schaden möchtest du zufügen? (100 MP = 100 Schaden)"), 10);

    if (!zielSpieler || isNaN(schaden) || schaden <= 0) {
        alert("Ungültige Eingabe.");
        return;
    }

    firebase.database().ref(`benutzer/${currentUser}/fortschritte`).get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                const daten = snapshot.val();
                if (daten.mp < schaden) {
                    alert("Nicht genug MP.");
                    return;
                }

                // MP abziehen
                const neueMP = daten.mp - schaden;
                firebase.database().ref(`benutzer/${currentUser}/fortschritte/mp`).set(neueMP)
                    .then(() => console.log(`MP erfolgreich abgezogen: ${neueMP}`))
                    .catch((error) => console.error("Fehler beim MP-Update:", error));

                // Zielspieler Schaden zufügen
                firebase.database().ref(`benutzer/${zielSpieler}/fortschritte`).get()
                    .then((zielSnapshot) => {
                        if (zielSnapshot.exists()) {
                            const zielDaten = zielSnapshot.val();
                            const neueHP = Math.max(0, zielDaten.hp - schaden); // Verhindert negative HP

                            const aktion = {
                                typ: "schaden",
                                wert: schaden,
                                von: currentUser,
                                zeitpunkt: new Date().toLocaleString()
                            };

                            // Aktion speichern
                            firebase.database().ref(`benutzer/${zielSpieler}/aktionen`).push(aktion)
                                .then(() => console.log("Aktion erfolgreich gespeichert"))
                                .catch((error) => console.error("Fehler beim Speichern der Aktion:", error));

                            // HP aktualisieren
                            firebase.database().ref(`benutzer/${zielSpieler}/fortschritte/hp`).set(neueHP)
                                .then(() => {
                                    console.log(`HP erfolgreich aktualisiert: ${zielSpieler} hat jetzt ${neueHP} HP`);
                                    if (neueHP <= 0) {
                                        // Spieler stirbt
                                        const neuesLevel = Math.max(1, zielDaten.level - 1);
                                        const maxHP = berechneMaxHP(neuesLevel);

                                        firebase.database().ref(`benutzer/${zielSpieler}/fortschritte`).update({
                                            level: neuesLevel,
                                            hp: maxHP
                                        })
                                            .then(() => alert(`${zielSpieler} ist gestorben und hat ein Level verloren.`))
                                            .catch((error) => console.error("Fehler beim Spieler-Tod-Update:", error));
                                    }
                                })
                                .catch((error) => console.error("Fehler beim HP-Update:", error));
                        } else {
                            console.error("Zielspieler nicht gefunden:", zielSpieler);
                        }
                    })
                    .catch((error) => console.error("Fehler beim Abrufen des Zielspieler-Fortschritts:", error));
            } else {
                console.error("Fehler beim Abrufen der aktuellen Benutzer-Fortschritte.");
            }
        })
        .catch((error) => console.error("Fehler beim Abrufen der MP-Daten:", error));
}

function heilen() {
    const zielSpieler = document.getElementById("spieler-dropdown").value;
    const heilung = parseInt(prompt("Wie viel möchtest du heilen? (100 MP = 100 HP)"), 10);

    if (!zielSpieler || isNaN(heilung) || heilung <= 0) {
        alert("Ungültige Eingabe.");
        return;
    }


    firebase.database().ref(`benutzer/${currentUser}/fortschritte`).get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                const daten = snapshot.val();
                if (daten.mp < heilung) {
                    alert("Nicht genug MP.");
                    return;
                }

                // MP abziehen
                const neueMP = daten.mp - heilung;
                firebase.database().ref(`benutzer/${currentUser}/fortschritte/mp`).set(neueMP);

                // Zielspieler heilen
                firebase.database().ref(`benutzer/${zielSpieler}/fortschritte`).get()
                    .then((zielSnapshot) => {
                        if (zielSnapshot.exists()) {
                            const zielDaten = zielSnapshot.val();
                            const maxHP = berechneMaxHP(zielDaten.level);
                            const neueHP = Math.min(zielDaten.hp + heilung, maxHP);

                            const aktion = {
                                typ: "heilung",
                                wert: heilung,
                                von: currentUser,
                                zeitpunkt: new Date().toLocaleString()
                            };

                            firebase.database().ref(`benutzer/${zielSpieler}/aktionen`).push(aktion);

                            firebase.database().ref(`benutzer/${zielSpieler}/fortschritte/hp`).set(neueHP);
                        }
                    });
            }
        });
}
function ladeAktionen() {
    firebase.database().ref(`benutzer/${currentUser}/aktionen`).get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                const aktionen = snapshot.val();
                const aktionenArray = Object.values(aktionen);

                const aktionenContainer = document.createElement("div");
                aktionenContainer.id = "aktionen-container";
                aktionenContainer.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
                aktionenContainer.style.color = "#FFD700";
                aktionenContainer.style.padding = "10px";
                aktionenContainer.style.borderRadius = "5px";
                aktionenContainer.style.margin = "20px";
                aktionenContainer.style.textAlign = "center";

                aktionenContainer.innerHTML = "<h3>Letzte Aktionen:</h3>";

                aktionenArray.forEach((aktion) => {
                    const aktionElement = document.createElement("p");
                    aktionElement.textContent = `${aktion.typ === "schaden" ? "Schaden" : "Heilung"}: ${aktion.wert} von ${aktion.von} am ${aktion.zeitpunkt}`;
                    aktionenContainer.appendChild(aktionElement);
                });

                const avatarContainer = document.getElementById("avatar-container");
                avatarContainer.appendChild(aktionenContainer);

                // Aktionen nach Anzeige löschen
                firebase.database().ref(`benutzer/${currentUser}/aktionen`).remove();
            } else {
                console.log("Keine Aktionen für den Benutzer vorhanden.");
            }
        })
        .catch((error) => {
            console.error("Fehler beim Laden der Aktionen:", error);
        }); // <--- Stelle sicher, dass diese schließende Klammer vorhanden ist
}
// Spezialfähigkeiten: Button und Menü rechts neben dem Avatar
function zeigeSpezialfähigkeitenMenu() {
    const spezialfähigkeitenContainer = document.createElement('div');
    spezialfähigkeitenContainer.id = 'spezialfähigkeiten-container';
    spezialfähigkeitenContainer.style.position = 'absolute';
    spezialfähigkeitenContainer.style.top = '50%';
    spezialfähigkeitenContainer.style.left = '50%';
    spezialfähigkeitenContainer.style.transform = 'translate(-50%, -50%)';
    spezialfähigkeitenContainer.style.backgroundColor = 'white';
    spezialfähigkeitenContainer.style.padding = '20px';
    spezialfähigkeitenContainer.style.border = '2px solid black';
    spezialfähigkeitenContainer.style.borderRadius = '10px';
    spezialfähigkeitenContainer.style.zIndex = '1000';

    const titel = document.createElement('h3');
    titel.textContent = `Spezialfähigkeiten von ${currentUser}`;
    spezialfähigkeitenContainer.appendChild(titel);

    firebase.database().ref(`benutzer/${currentUser}/fähigkeiten`).get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                const fähigkeiten = snapshot.val();
                Object.entries(fähigkeiten).forEach(([name, details]) => {
                    const button = document.createElement('button');
                    button.textContent = `${name} (Kosten: ${details.levelKosten} Level)`;
                    button.style.marginBottom = '10px';

                    const erfolgswahrscheinlichkeit = 80 - (10 * (details.levelKosten - 1));
                    button.title = `Erfolgswahrscheinlichkeit: ${erfolgswahrscheinlichkeit}%`;

                    button.onclick = () => verwendeFähigkeit(name, details.levelKosten, erfolgswahrscheinlichkeit);
                    spezialfähigkeitenContainer.appendChild(button);
                });
            } else {
                const keineFähigkeiten = document.createElement('p');
                keineFähigkeiten.textContent = 'Keine Spezialfähigkeiten verfügbar.';
                spezialfähigkeitenContainer.appendChild(keineFähigkeiten);
            }
        })
        .catch((error) => console.error("Fehler beim Laden der Spezialfähigkeiten:", error));

    const schließenButton = document.createElement('button');
    schließenButton.textContent = 'Schließen';
    schließenButton.onclick = () => document.body.removeChild(spezialfähigkeitenContainer);
    spezialfähigkeitenContainer.appendChild(schließenButton);

    document.body.appendChild(spezialfähigkeitenContainer);
}


// Spezialfähigkeiten verwenden
function verwendeFähigkeit(name, kosten, erfolgswahrscheinlichkeit) {
    if (level < kosten) {
        alert('Nicht genügend Level, um diese Fähigkeit zu verwenden.');
        return;
    }

    const zielSpieler = prompt('Auf wen soll diese Fähigkeit angewendet werden? (Name eingeben)');
    if (!zielSpieler) {
        alert('Bitte gib einen gültigen Namen ein.');
        return;
    }

    const lustigerText = generiereLustigenText(name, currentUser, zielSpieler);

    // Log die Aktion in Firebase
    firebase.database().ref('aktionen').push({
        name,
        ausführer: currentUser,
        ziel: zielSpieler,
        text: lustigerText,
        zeitpunkt: new Date().toISOString()
    }).then(() => {
        console.log('Aktion erfolgreich gespeichert.');
        ladeAktionenVonFirebase();
    }).catch((error) => {
        console.error('Fehler beim Speichern der Aktion:', error);
    });

    alert(lustigerText);
}

function generiereLustigenText(fähigkeit, ausführer, ziel) {
    const lustigeTexte = {
        'Massiere mich': `${ausführer} zwingt ${ziel}, zur Massage anzutreten. Hände geschmeidig? Check!`,
        'Ich will gekuschelt werden': `${ziel} drückt ${ausführer} so fest, dass selbst ein Teddy neidisch wird.`,
        'Mach mir was zu essen': `${ziel} kocht für ${ausführer} ein 3-Sterne-Menü mit einem Hauch von Chaos.`,
        'Wunsch frei': `${ausführer} fordert von ${ziel} einen Wunsch – mit Glitzer und Drama!`
    };
    return lustigeTexte[fähigkeit] || `${ausführer} nutzt ${fähigkeit} auf ${ziel}, und die Magie passiert.`;
}
// Animation anzeigen
function zeigeAnimation(pfad, nachricht) {
    const animationContainer = document.createElement('div');
    animationContainer.style.position = 'fixed';
    animationContainer.style.top = '0';
    animationContainer.style.left = '0';
    animationContainer.style.width = '100%';
    animationContainer.style.height = '100%';
    animationContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    animationContainer.style.display = 'flex';
    animationContainer.style.justifyContent = 'center';
    animationContainer.style.alignItems = 'center';
    animationContainer.style.zIndex = '1000';

    const img = document.createElement('img');
    img.src = pfad;
    img.style.width = '50%';

    const text = document.createElement('p');
    text.textContent = nachricht;
    text.style.color = 'white';
    text.style.fontSize = '20px';
    text.style.marginTop = '20px';

    animationContainer.appendChild(img);
    animationContainer.appendChild(text);
    document.body.appendChild(animationContainer);

    setTimeout(() => {
        document.body.removeChild(animationContainer);
    }, 3000);
}

// Übersicht aktualisieren
function aktualisiereFähigkeitenÜbersicht(name, erfolg) {
    const listeContainer = document.getElementById('fähigkeiten-übersicht');
    if (!listeContainer) {
        console.warn('Fähigkeiten-Übersicht nicht gefunden!');
        return;
    }

    const eintrag = document.createElement('li');
    eintrag.textContent = `${currentUser} hat die Fähigkeit ${name} angewandt – ${erfolg ? 'erfolgreich' : 'nicht erfolgreich'}`;
    listeContainer.prepend(eintrag);
}

// Übersicht in die Startseite integrieren
function fügeSpezialfähigkeitenButtonHinzu() {
    const avatarContainer = document.getElementById('avatar-container');
    if (!avatarContainer) {
        console.warn('Avatar-Container nicht gefunden!');
        return;
    }

    const button = document.createElement('button');
    button.textContent = 'Spezialfähigkeiten';
    button.style.marginLeft = '10px';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#FFD700';
    button.style.color = 'black';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.3)';
    button.style.cursor = 'pointer';

    button.onclick = zeigeSpezialfähigkeitenMenu;

    avatarContainer.style.display = 'flex';
    avatarContainer.style.flexDirection = 'row'; // Button rechts vom Avatar
    avatarContainer.appendChild(button);
}
function initialisiereSpezialfähigkeitenFürAlleSpieler() {
    const spielerDaten = {
        "Thomas": {
            "Massiere mich": { levelKosten: 2 },
            "Ich will gekuschelt werden": { levelKosten: 1 },
            "Mach mir was zu essen": { levelKosten: 3 },
            "Wunsch frei": { levelKosten: 5 }
        },
        "Elke": {
            "Massiere mich": { levelKosten: 2 },
            "Ich will gekuschelt werden": { levelKosten: 1 },
            "Mach mir was zu essen": { levelKosten: 3 },
            "Wunsch frei": { levelKosten: 5 }
        },
        "Jamie": {
            "Massiere mich": { levelKosten: 2 },
            "Ich will gekuschelt werden": { levelKosten: 1 },
            "30 Min Gaming Zeit": { levelKosten: 2 },
            "Unendliche Spielzeit": { levelKosten: 5 }
        }
    };

    Object.entries(spielerDaten).forEach(([spielerName, fähigkeiten]) => {
        firebase.database().ref(`benutzer/${spielerName}/fähigkeiten`).once('value')
            .then((snapshot) => {
                if (!snapshot.exists()) {
                    return firebase.database().ref(`benutzer/${spielerName}/fähigkeiten`).set(fähigkeiten);
                }
            })
            .catch((error) => console.error(`Fehler beim Initialisieren der Fähigkeiten für ${spielerName}:`, error));
    });
}


function zeigeSpezialfähigkeitenMenu() {
    const spezialfähigkeitenContainer = document.createElement('div');
    spezialfähigkeitenContainer.id = 'spezialfähigkeiten-container';
    spezialfähigkeitenContainer.style.position = 'absolute';
    spezialfähigkeitenContainer.style.top = '20%';
    spezialfähigkeitenContainer.style.right = '10%';
    spezialfähigkeitenContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    spezialfähigkeitenContainer.style.border = '2px solid #FFD700';
    spezialfähigkeitenContainer.style.borderRadius = '10px';
    spezialfähigkeitenContainer.style.padding = '20px';
    spezialfähigkeitenContainer.style.width = '300px';
    spezialfähigkeitenContainer.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.5)';
    spezialfähigkeitenContainer.style.zIndex = '1000';

    const titel = document.createElement('h3');
    titel.textContent = `Wähle deine Spezialfähigkeit aus:`;
    spezialfähigkeitenContainer.appendChild(titel);

    firebase.database().ref(`benutzer`).get().then((snapshot) => {
        if (snapshot.exists()) {
            const benutzerDaten = snapshot.val();
            const auswahlContainer = document.createElement('select');

            Object.keys(benutzerDaten).forEach((spieler) => {
                const option = document.createElement('option');
                option.value = spieler;
                option.textContent = spieler;
                auswahlContainer.appendChild(option);
            });

            spezialfähigkeitenContainer.appendChild(auswahlContainer);

            // Buttons für Fähigkeiten
            ['Massiere mich', 'Ich will gekuschelt werden', 'Mach mir was zu essen', 'Wunsch frei'].forEach((fähigkeit, index) => {
                const button = document.createElement('button');
                button.textContent = `${fähigkeit} (Kosten: ${index + 1} Level)`;
                button.style.display = 'block';
                button.style.marginTop = '10px';
                button.style.padding = '10px';
                button.style.backgroundColor = '#FFD700';
                button.style.color = '#000';
                button.style.border = 'none';
                button.style.borderRadius = '5px';
                button.style.cursor = 'pointer';

                button.onclick = () => {
                    const zielSpieler = auswahlContainer.value;
                    if (!zielSpieler) {
                        alert('Bitte wähle einen Spieler aus!');
                        return;
                    }

                    const lustigerText = generiereLustigenText(fähigkeit, zielSpieler);
                    alert(lustigerText);

                    spezialfähigkeitenContainer.remove();
                };

                spezialfähigkeitenContainer.appendChild(button);
            });
        } else {
            alert('Keine Benutzer gefunden!');
        }
    });

    const schließenButton = document.createElement('button');
    schließenButton.textContent = 'Schließen';
    schließenButton.onclick = () => document.body.removeChild(spezialfähigkeitenContainer);
    spezialfähigkeitenContainer.appendChild(schließenButton);

    document.body.appendChild(spezialfähigkeitenContainer);
}

function generiereLustigenText(fähigkeit, zielSpieler) {
    const lustigeTexte = {
        'Massiere mich': `${zielSpieler} schwingt die magischen Hände und massiert so gut, dass selbst Steine entspannen!`,
        'Ich will gekuschelt werden': `${zielSpieler} kuschelt so warm und weich, dass du dich wie eine Wolke fühlst!`,
        'Mach mir was zu essen': `${zielSpieler} zaubert ein 5-Sterne-Menü aus Luft und Liebe!`,
        'Wunsch frei': `${zielSpieler} zaubert deinen Wunsch mit einer Extraportion Glitzer und Drama!`
    };
    return lustigeTexte[fähigkeit] || 'Diese Fähigkeit ist so mächtig, dass selbst die Sterne staunen!';
}
function fügeAktionenZurStartseiteHinzu() {
    const aktionenContainer = document.createElement('div');
    aktionenContainer.id = 'aktionen-container';
    aktionenContainer.style.marginTop = '20px';
    aktionenContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    aktionenContainer.style.border = '2px solid #FFD700';
    aktionenContainer.style.borderRadius = '10px';
    aktionenContainer.style.padding = '20px';
    aktionenContainer.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.5)';
    aktionenContainer.innerHTML = '<h3>Aktionen der Spezialfähigkeiten:</h3><ul id="aktionen-list"></ul>';
    document.getElementById('benutzer-container').appendChild(aktionenContainer);

    ladeAktionenVonFirebase();
}

function ladeAktionenVonFirebase() {
    const aktionenListe = document.getElementById('aktionen-list');
    aktionenListe.innerHTML = ''; // Liste zurücksetzen

    firebase.database().ref('aktionen').get().then((snapshot) => {
        if (snapshot.exists()) {
            const aktionen = snapshot.val();
            Object.values(aktionen).forEach((aktion) => {
                const listItem = document.createElement('li');
                listItem.style.marginBottom = '10px';
                listItem.innerHTML = `
                    <strong>${aktion.typ}</strong> - ${aktion.ausführer} hat ${aktion.ziel} mit der Fähigkeit "${aktion.name}" beglückt.<br>
                    <small>${aktion.text}</small>
                `;
                aktionenListe.appendChild(listItem);
            });
        } else {
            console.log('Keine Aktionen gefunden.');
        }
    }).catch((error) => {
        console.error('Fehler beim Laden der Aktionen:', error);
    });
}



aktualisiereLayout();
