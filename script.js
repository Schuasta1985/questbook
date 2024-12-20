// 1. Globale Variablen und Konfigurationen
// -----------------------------------------
let xp = 0;
let level = 1;
let currentUser = null;
let isAdmin = false;
let benutzerDaten = [];

// 2. Fenster-Onload-Ereignis (wird beim Laden der Seite ausgeführt)
// -----------------------------------------------------------------
window.onload = function () {
    console.log("window.onload aufgerufen");

    // Logbuch erstellen und initialisieren
    erstelleLogbuch();
    steuerungLogbuch(false);

    // Tägliche HP- und MP-Regeneration prüfen
    const heutigesDatum = new Date().toDateString();
    const letzterTag = localStorage.getItem("letzteHPRegeneration");

    if (letzterTag !== heutigesDatum) {
        täglicheHPRegeneration();
        täglicheMPRegeneration();
        localStorage.setItem("letzteHPRegeneration", heutigesDatum);
    }

    // Startseite anzeigen
    zeigeStartseite();

    // Logbuch und Aktionen laden
    ladeLogbuch();
    ladeAktionen();
};

// 3. Logbuch-Funktionen
// ----------------------
function erstelleLogbuch() {
    console.log("Logbuch wird erstellt...");

    const logbuchContainer = document.createElement("div");
    logbuchContainer.id = "logbuch-container";
    logbuchContainer.innerHTML = "<h3>Logbuch</h3><ul id='logbuch-list'></ul>";
    document.body.appendChild(logbuchContainer);

    const logbuchButton = document.createElement("button");
    logbuchButton.id = "logbuch-button";
    logbuchButton.textContent = "Logbuch";
    logbuchButton.style.display = "none"; // Button standardmäßig ausblenden

    logbuchButton.addEventListener("click", () => {
        logbuchContainer.style.display = logbuchContainer.style.display === "none" ? "block" : "none";
    });

    document.body.appendChild(logbuchButton);
    console.log("Logbuch und Button erstellt.");
}

function steuerungLogbuch(anzeigen) {
    const logbuchButton = document.getElementById("logbuch-button");
    if (logbuchButton) {
        logbuchButton.style.display = anzeigen ? "block" : "none";
    } else {
        console.warn("Logbuch-Button wurde noch nicht erstellt.");
    }
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

    logbuchListe.prepend(eintrag);

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
                logbuchListe.prepend(listItem);
            });
        } else {
            console.log("Keine Logbuch-Einträge gefunden.");
        }
    }).catch((error) => {
        console.error("Fehler beim Laden des Logbuchs:", error);
    });
}

// 4. Benutzer-Funktionen
// -----------------------
function benutzerAnmeldung() {
    console.log("benutzerAnmeldung() aufgerufen");

    const benutzernameInput = document.getElementById("spielerDropdown");
    const passwortInput = document.getElementById("spielerPasswort");

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

    currentUser = benutzername;
    isAdmin = false;
    console.log(`${benutzername} erfolgreich angemeldet`);

    zeigeQuestbook();
    ladeFortschritte();
    täglicheHPRegeneration();
    zeigeAvatar();
    ladeGlobaleQuests();
}

// 5. Startseite-Funktionen
// -------------------------
function zeigeStartseite() {
    console.log("zeigeStartseite() aufgerufen");

    steuerungLogbuch(false); // Logbuch-Button ausblenden

    const loginSection = document.getElementById("login-section");
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
        loginSection.style.display = "block";

        const benutzerLoginButton = document.getElementById("benutzerLoginButton");
        if (benutzerLoginButton) {
            benutzerLoginButton.onclick = benutzerAnmeldung;
        }
    }

    // Verstecke andere Sektionen
    document.getElementById("quests-section").style.display = "none";
    document.getElementById("xp-counter").style.display = "none";
    document.getElementById("logout-button").style.display = "none";
    document.getElementById("npc-login-section").style.display = "block";

    ladeBenutzerdaten();
}
// 6. Questbuch anzeigen
// ----------------------
function zeigeQuestbook() {
    console.log("zeigeQuestbook() aufgerufen");
    document.getElementById("quests-section").style.display = "block";
    document.getElementById("xp-counter").style.display = "block";
    document.getElementById("logout-button").style.display = "block";
    document.getElementById("login-section").style.display = "none";

    const logbuchButton = document.getElementById("logbuch-button");
    if (logbuchButton) {
        logbuchButton.style.display = "block";
    }
}

// 7. NPC Login und Admin-Funktionen
// ---------------------------------
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

function zeigeAdminFunktionen() {
    console.log("zeigeAdminFunktionen() aufgerufen");

    const adminButtonsContainer = document.getElementById("admin-buttons-container");

    if (isAdmin) {
        console.log("Admin-Modus aktiv, zeige Admin-Funktionen");

        if (!adminButtonsContainer) {
            const questbookContainer = document.getElementById("quests-section");
            const newAdminButtonsContainer = document.createElement("div");
            newAdminButtonsContainer.id = "admin-buttons-container";

            const createButton = document.createElement("button");
            createButton.textContent = "Neue Quest erstellen";
            createButton.onclick = neueQuestErstellen;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Alle Quests zurücksetzen";
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

// 8. Benutzerfortschritte speichern und laden
// --------------------------------------------
function speichereFortschritte() {
    if (currentUser) {
        firebase.database().ref(`benutzer/${currentUser}/fortschritte`).set({
            xp: xp,
            level: level,
            hp: aktuelleHP || berechneMaxHP(level),
            mp: aktuelleMP || berechneMaxMP(level)
        })
        .then(() => {
            console.log("Fortschritte erfolgreich gespeichert.");
        })
        .catch((error) => {
            console.error("Fehler beim Speichern der Fortschritte:", error);
        });
    }
}

function ladeFortschritte() {
    if (currentUser) {
        firebase.database().ref(`benutzer/${currentUser}/fortschritte`).get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                const daten = snapshot.val();
                xp = daten.xp || 0;
                level = daten.level || 1;
                aktuelleHP = daten.hp || berechneMaxHP(level);
                aktuelleMP = daten.mp || berechneMaxMP(level);

                aktualisiereXPAnzeige();
                aktualisiereHPLeiste(aktuelleHP, level);
                aktualisiereMPLeiste(aktuelleMP, level);
            }
        })
        .catch((error) => {
            console.error("Fehler beim Laden der Fortschrittsdaten:", error);
        });
    }
}

// 9. HP- und MP-Regeneration
// ---------------------------
function täglicheHPRegeneration() {
    console.log("täglicheHPRegeneration() aufgerufen");
    if (currentUser) {
        firebase.database().ref(`benutzer/${currentUser}/fortschritte`).get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                const daten = snapshot.val();
                const neueHP = Math.min(daten.hp + 100, berechneMaxHP(level));

                firebase.database().ref(`benutzer/${currentUser}/fortschritte/hp`).set(neueHP)
                .then(() => console.log(`HP erfolgreich regeneriert: ${neueHP}`))
                .catch((error) => console.error("Fehler beim HP-Update:", error));
            }
        })
        .catch((error) => {
            console.error("Fehler beim Abrufen der HP-Daten:", error);
        });
    }
}

function täglicheMPRegeneration() {
    console.log("täglicheMPRegeneration() aufgerufen");
    if (currentUser) {
        firebase.database().ref(`benutzer/${currentUser}/fortschritte`).get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                const daten = snapshot.val();
                const maxMP = berechneMaxMP(level);

                firebase.database().ref(`benutzer/${currentUser}/fortschritte/mp`).set(maxMP)
                .then(() => console.log(`MP erfolgreich regeneriert: ${maxMP}`))
                .catch((error) => console.error("Fehler beim MP-Update:", error));
            }
        })
        .catch((error) => {
            console.error("Fehler beim Abrufen der MP-Daten:", error);
        });
    }
}

// 10. Quest-Logik
// ----------------
function ladeGlobaleQuests() {
    console.log("ladeGlobaleQuests() aufgerufen");
    firebase.database().ref('quests').get()
    .then((snapshot) => {
        if (snapshot.exists()) {
            const quests = snapshot.val();
            const questList = document.getElementById("quests");
            questList.innerHTML = ""; // Liste zurücksetzen

            quests.forEach((quest, index) => {
                const istErledigt = quest.erledigtVon?.[currentUser] || false;

                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <span class="quest-text" style="text-decoration: ${istErledigt ? 'line-through' : 'none'};">
                        ${quest.beschreibung} (${quest.xp || 0} XP)
                    </span>
                    ${
                        !istErledigt
                        ? `<button onclick="questErledigt(${index})">Erledigt</button>`
                        : ""
                    }
                `;
                questList.appendChild(listItem);
            });
        }
    })
    .catch((error) => console.error("Fehler beim Laden der Quests:", error));
}

// 11. Benutzer ausloggen
// -----------------------
function ausloggen() {
    console.log("ausloggen() aufgerufen");

    currentUser = null;
    isAdmin = false;

    document.getElementById("quests-section").style.display = "none";
    document.getElementById("xp-counter").style.display = "none";
    document.getElementById("logout-button").style.display = "none";
    document.getElementById("login-section").style.display = "block";

    const logbuchButton = document.getElementById("logbuch-button");
    if (logbuchButton) {
        logbuchButton.style.display = "none";
    }
}
// 12. Quests abschließen und Logbuch aktualisieren
// ------------------------------------------------
function questErledigt(questNummer) {
    console.log(`questErledigt() aufgerufen für QuestNummer: ${questNummer}`);
    firebase.database().ref('quests').get()
    .then((snapshot) => {
        if (snapshot.exists()) {
            const quests = snapshot.val();
            const quest = quests[questNummer];

            if (quest) {
                const xpGutschrift = quest.xp || 0;
                xp += xpGutschrift;

                if (!quest.erledigtVon) {
                    quest.erledigtVon = {};
                }

                quest.erledigtVon[currentUser] = true;

                speichereFortschritte();
                logbuchEintrag(quest.beschreibung, currentUser, xpGutschrift);

                firebase.database().ref('quests').set(quests)
                .then(() => {
                    aktualisiereXPAnzeige();
                    ladeGlobaleQuests();
                    console.log(`Quest ${questNummer} wurde abgeschlossen.`);
                })
                .catch((error) => {
                    console.error("Fehler beim Speichern der Quest als erledigt:", error);
                });
            }
        }
    })
    .catch((error) => console.error("Fehler beim Abschließen der Quest:", error));
}

// 13. Fortschritt der XP-Anzeige aktualisieren
// --------------------------------------------
function aktualisiereXPAnzeige() {
    console.log("aktualisiereXPAnzeige() aufgerufen");
    const levelElement = document.getElementById('level');
    const xpProgressElement = document.getElementById('xp-progress');
    const xpLabelElement = document.getElementById("xp-label");

    if (levelElement) {
        levelElement.textContent = level;
    }

    const xpFürLevelUp = berechneXPFürLevelUp(level);

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
    const xpFürLevelUp = berechneXPFürLevelUp(level);

    while (xp >= xpFürLevelUp) {
        xp -= xpFürLevelUp;
        level++;
        aktualisiereXPAnzeige();
        zeigeLevelUpAnimation();
    }
}

function berechneXPFürLevelUp(level) {
    return level <= 10 ? 100 : 200 + ((Math.floor((level - 1) / 10)) * 100);
}

// 14. Level-Up Animation
// -----------------------
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

// 15. HP- und MP-Anzeige aktualisieren
// -------------------------------------
function berechneMaxHP(level) {
    return 100 + Math.floor((level - 1) / 10) * 200;
}

function berechneMaxMP(level) {
    return 50 + Math.floor((level - 1) / 10) * 50;
}

function aktualisiereHPLeiste(aktuelleHP, level) {
    console.log(`aktualisiereHPLeiste() aufgerufen: ${aktuelleHP} HP bei Level ${level}`);
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

function aktualisiereMPLeiste(aktuelleMP, level) {
    console.log(`aktualisiereMPLeiste() aufgerufen: ${aktuelleMP} MP bei Level ${level}`);
    const maxMP = berechneMaxMP(level);
    const mpProgress = document.getElementById("mp-progress");

    if (mpProgress) {
        const prozent = (aktuelleMP / maxMP) * 100;
        mpProgress.style.width = `${prozent}%`;
        mpProgress.textContent = `${aktuelleMP} / ${maxMP} MP`;
    }
}

// 16. Zauber-Menü
// ----------------
function zeigeZauberMenu() {
    console.log("zeigeZauberMenu() aufgerufen");
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
// 17. Zauber-Funktionen
// ----------------------
function schadenZufügen() {
    console.log("schadenZufügen() aufgerufen");
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

                const neueMP = daten.mp - schaden;
                firebase.database().ref(`benutzer/${currentUser}/fortschritte/mp`).set(neueMP)
                    .then(() => console.log(`MP erfolgreich abgezogen: ${neueMP}`))
                    .catch((error) => console.error("Fehler beim MP-Update:", error));

                firebase.database().ref(`benutzer/${zielSpieler}/fortschritte`).get()
                    .then((zielSnapshot) => {
                        if (zielSnapshot.exists()) {
                            const zielDaten = zielSnapshot.val();
                            const neueHP = Math.max(0, zielDaten.hp - schaden);

                            firebase.database().ref(`benutzer/${zielSpieler}/fortschritte/hp`).set(neueHP)
                                .then(() => {
                                    console.log(`Schaden erfolgreich zugefügt: ${zielSpieler} hat jetzt ${neueHP} HP.`);
                                    if (neueHP <= 0) {
                                        alert(`${zielSpieler} ist gestorben.`);
                                    }
                                }).catch((error) => console.error("Fehler beim HP-Update:", error));
                        } else {
                            console.error("Zielspieler nicht gefunden:", zielSpieler);
                        }
                    }).catch((error) => console.error("Fehler beim Abrufen der Zielspieler-Daten:", error));
            } else {
                console.error("Fehler beim Abrufen der aktuellen Benutzer-Daten.");
            }
        }).catch((error) => console.error("Fehler beim Abrufen der MP-Daten:", error));
}

function heilen() {
    console.log("heilen() aufgerufen");
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

                const neueMP = daten.mp - heilung;
                firebase.database().ref(`benutzer/${currentUser}/fortschritte/mp`).set(neueMP);

                firebase.database().ref(`benutzer/${zielSpieler}/fortschritte`).get()
                    .then((zielSnapshot) => {
                        if (zielSnapshot.exists()) {
                            const zielDaten = zielSnapshot.val();
                            const maxHP = berechneMaxHP(zielDaten.level);
                            const neueHP = Math.min(zielDaten.hp + heilung, maxHP);

                            firebase.database().ref(`benutzer/${zielSpieler}/fortschritte/hp`).set(neueHP)
                                .then(() => {
                                    console.log(`Heilung erfolgreich durchgeführt: ${zielSpieler} hat jetzt ${neueHP} HP.`);
                                }).catch((error) => console.error("Fehler beim HP-Update:", error));
                        }
                    }).catch((error) => console.error("Fehler beim Abrufen der Zielspieler-Daten:", error));
            }
        }).catch((error) => console.error("Fehler beim Abrufen der MP-Daten:", error));
}

// 18. Aktionen-Verwaltung
// ------------------------
function ladeAktionen() {
    console.log("ladeAktionen() aufgerufen");
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

                firebase.database().ref(`benutzer/${currentUser}/aktionen`).remove();
            } else {
                console.log("Keine Aktionen für den Benutzer vorhanden.");
            }
        })
        .catch((error) => console.error("Fehler beim Laden der Aktionen:", error));
}

// 19. Layout-Anpassungen
// -----------------------
function aktualisiereLayout() {
    console.log("aktualisiereLayout() aufgerufen");
    const hpContainer = document.getElementById("hp-bar-container");
    const questsSection = document.getElementById("quests-section");

    if (hpContainer && questsSection) {
        questsSection.style.marginTop = "20px";
    }
}




