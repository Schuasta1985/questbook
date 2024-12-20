// 1. Globale Variablen
// --------------------------------------------
let xp = 0;
let level = 1;
let currentUser = null;
let isAdmin = false;

// 2. Event: Seite wird geladen
// --------------------------------------------
window.onload = function () {
    console.log("window.onload aufgerufen");

    // Logbuch erstellen und Steuerung initialisieren
    erstelleLogbuch(); 
    steuerungLogbuch(false);

    // Tägliche HP- und MP-Regeneration prüfen und durchführen
    const heutigesDatum = new Date().toDateString();
    const letzterTag = localStorage.getItem("letzteHPRegeneration");

    if (letzterTag !== heutigesDatum) {
        täglicheHPRegeneration();
        täglicheMPRegeneration();
        localStorage.setItem("letzteHPRegeneration", heutigesDatum);
    }

    // Startseite und weitere Funktionen laden
    zeigeStartseite();
    ladeLogbuch();
    ladeAktionen();
};


// 3. Logbuch-Funktionen
// --------------------------------------------
function erstelleLogbuch() {
    console.log("Logbuch wird erstellt...");
    // Container für das Logbuch
    const logbuchContainer = document.createElement("div");
    logbuchContainer.id = "logbuch-container";
    logbuchContainer.innerHTML = "<h3>Logbuch</h3><ul id='logbuch-list'></ul>";
    document.body.appendChild(logbuchContainer);

    // Button zum Öffnen des Logbuchs
    const logbuchButton = document.createElement("button");
    logbuchButton.id = "logbuch-button";
    logbuchButton.textContent = "Logbuch";
    logbuchButton.style.display = "none";
    logbuchButton.addEventListener("click", () => {
        logbuchContainer.style.display = logbuchContainer.style.display === "none" ? "block" : "none";
    });
    document.body.appendChild(logbuchButton);
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
}

// 4. Funktionen für Benutzer
// --------------------------------------------
function benutzerAnmeldung() {
    console.log("benutzerAnmeldung() aufgerufen");
    const benutzername = document.getElementById("spielerDropdown").value.trim();
    const passwort = document.getElementById("spielerPasswort").value.trim();
    const benutzerPasswoerter = {
        Thomas: "12345",
        Elke: "julian0703",
        Jamie: "602060"
    };
    if (!benutzerPasswoerter[benutzername] || passwort !== benutzerPasswoerter[benutzername]) {
        alert("Falsches Passwort oder Benutzername!");
        return;
    }
    currentUser = benutzername;
    isAdmin = false;
    zeigeQuestbook();
    ladeFortschritte();
    täglicheHPRegeneration();
    zeigeAvatar();
    ladeGlobaleQuests();
    console.log(`${benutzername} erfolgreich angemeldet`);
}

// 5. Quest-Funktionen
// --------------------------------------------
function ladeGlobaleQuests() {
    console.log("ladeGlobaleQuests() aufgerufen");
    firebase.database().ref('quests').get().then((snapshot) => {
        if (snapshot.exists()) {
            const quests = snapshot.val();
            const questList = document.getElementById("quests");
            questList.innerHTML = ""; // Liste zurücksetzen
            quests.forEach((quest, index) => {
                const questHTML = `
                    <li>
                        <span>${quest.beschreibung}</span>
                        <button onclick="questErledigt(${index})">Erledigt</button>
                    </li>
                `;
                questList.innerHTML += questHTML;
            });
        }
    }).catch((error) => console.error("Fehler beim Laden der Quests:", error));
}

// 6. Zauber-System
// --------------------------------------------
function zeigeZauberMenu() {
    console.log("zeigeZauberMenu() aufgerufen");
    const zauberMenu = document.createElement("div");
    zauberMenu.id = "zauber-menu";
    zauberMenu.innerHTML = `
        <h3>Zauber</h3>
        <button onclick="heilen()">Heilen</button>
        <button onclick="schadenZufügen()">Schaden zufügen</button>
        <button onclick="document.body.removeChild(document.getElementById('zauber-menu'))">Schließen</button>
    `;
    document.body.appendChild(zauberMenu);
}

function heilen() {
    const zielSpieler = document.getElementById("spieler-dropdown").value;
    const heilung = parseInt(prompt("Wie viel möchtest du heilen?"), 10);
    if (!zielSpieler || isNaN(heilung) || heilung <= 0) {
        alert("Ungültige Eingabe.");
        return;
    }
    console.log(`${currentUser} heilt ${zielSpieler} um ${heilung} HP.`);
}

// 7. Weitere Funktionen
// --------------------------------------------
function täglicheHPRegeneration() {
    console.log("täglicheHPRegeneration() aufgerufen");
    const maxHP = berechneMaxHP(level);
    aktuelleHP = Math.min(aktuelleHP + 50, maxHP);
}

function täglicheMPRegeneration() {
    console.log("täglicheMPRegeneration() aufgerufen");
    const maxMP = berechneMaxMP(level);
    aktuelleMP = maxMP; // MP voll regenerieren
}

function berechneMaxHP(level) {
    return 100 + (level * 20);
}

function berechneMaxMP(level) {
    return 50 + (level * 10);
}

// 8. Funktionen zur Verwaltung von Fortschritten
// --------------------------------------------
function speichereFortschritte() {
    console.log("speichereFortschritte() aufgerufen");
    if (currentUser) {
        firebase.database().ref(`benutzer/${currentUser}/fortschritte`).set({
            xp: xp,
            level: level,
            hp: aktuelleHP || berechneMaxHP(level),
            mp: aktuelleMP || berechneMaxMP(level)
        }).then(() => {
            console.log("Fortschritte erfolgreich gespeichert.");
        }).catch((error) => {
            console.error("Fehler beim Speichern der Fortschritte:", error);
        });
    }
}

function ladeFortschritte(callback) {
    console.log("ladeFortschritte() aufgerufen");
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
                    if (typeof callback === "function") {
                        callback();
                    }
                }
            }).catch((error) => {
                console.error("Fehler beim Laden der Fortschrittsdaten:", error);
            });
    }
}

// 9. Animationen und Anzeigen
// --------------------------------------------
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
        if (document.body.contains(videoContainer)) {
            video.pause();
            document.body.removeChild(videoContainer);
        }
    }, 10000);
}

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

// 10. NPC-Funktionen
// --------------------------------------------
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

// 11. Layout- und Anzeige-Funktionen
// --------------------------------------------
function zeigeAvatar() {
    console.log("zeigeAvatar() aufgerufen");
    const avatarContainer = document.getElementById("avatar-container");
    if (!avatarContainer) {
        console.error("Avatar-Container nicht gefunden!");
        return;
    }

    const avatarPath = getAvatarForUser(currentUser);
    if (!avatarPath) {
        console.error(`Kein Avatar gefunden für Benutzer: ${currentUser}`);
        return;
    }

    avatarContainer.innerHTML = `
        <video autoplay loop muted style="border-radius: 50%; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);">
            <source src="${avatarPath}" type="video/mp4">
        </video>
    `;
    avatarContainer.style.display = "flex";
    avatarContainer.style.flexDirection = "column";
    avatarContainer.style.alignItems = "center";
    avatarContainer.style.marginTop = "20px";
}
// 12. Funktionen zur Zauber-Verwaltung
// --------------------------------------------
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

    zauberMenu.innerHTML = `<h3>Zauber</h3>`;
    zauberMenu.appendChild(spielerDropdown);
    zauberMenu.innerHTML += `
        <button onclick="schadenZufügen()">Schaden zufügen</button>
        <button onclick="heilen()">Heilen</button>
        <button onclick="document.body.removeChild(document.getElementById('zauber-menu'))">Schließen</button>
    `;
    document.body.appendChild(zauberMenu);
}

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

// 13. Aktionen-Verwaltung
// --------------------------------------------
function ladeAktionen() {
    console.log("ladeAktionen() aufgerufen");
    firebase.database().ref(`benutzer/${currentUser}/aktionen`).get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                const aktionen = snapshot.val();
                const aktionenContainer = document.createElement("div");
                aktionenContainer.id = "aktionen-container";
                aktionenContainer.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
                aktionenContainer.style.color = "#FFD700";
                aktionenContainer.style.padding = "10px";
                aktionenContainer.style.borderRadius = "5px";
                aktionenContainer.style.margin = "20px";
                aktionenContainer.style.textAlign = "center";

                aktionenContainer.innerHTML = "<h3>Letzte Aktionen:</h3>";
                Object.values(aktionen).forEach((aktion) => {
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
        }).catch((error) => {
            console.error("Fehler beim Laden der Aktionen:", error);
        });
}
// 14. Layout-Anpassungen und visuelle Elemente
// --------------------------------------------
function aktualisiereLayout() {
    console.log("aktualisiereLayout() aufgerufen");
    const hpContainer = document.getElementById("hp-bar-container");
    const questsSection = document.getElementById("quests-section");

    if (hpContainer && questsSection) {
        questsSection.style.marginTop = "20px";
    }
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

function getAvatarForUser(user) {
    console.log("getAvatarForUser() aufgerufen für Benutzer:", user);

    if (user === "Thomas") {
        return "avatars/thomas.mp4";
    } else if (user === "Elke") {
        return "avatars/elke.mp4";
    } else if (user === "Jamie") {
        return "avatars/jamie.mp4";
    }
    return "https://via.placeholder.com/100?text=Avatar";
}

// 15. Berechnungen für HP und MP
// --------------------------------------------
function berechneMaxHP(level) {
    console.log(`berechneMaxHP() aufgerufen für Level: ${level}`);
    return 100 + Math.floor((level - 1) / 10) * 200;
}

function berechneMaxMP(level) {
    console.log(`berechneMaxMP() aufgerufen für Level: ${level}`);
    return 50 + Math.floor((level - 1) / 10) * 50;
}

function berechneHPFarbe(prozent) {
    console.log(`berechneHPFarbe() aufgerufen für Prozentsatz: ${prozent}`);
    if (prozent > 75) return "green";
    if (prozent > 50) return "yellow";
    if (prozent > 25) return "orange";
    return "red";
}

function aktualisiereHPLeiste(aktuelleHP, level) {
    console.log(`aktualisiereHPLeiste() aufgerufen: ${aktuelleHP} HP bei Level ${level}`);
    const maxHP = berechneMaxHP(level);
    const hpProgress = document.getElementById("hp-progress");

    if (hpProgress) {
        const prozent = (aktuelleHP / maxHP) * 100;
        hpProgress.style.width = `${prozent}%`;
        hpProgress.textContent = `${aktuelleHP} / ${maxHP} HP`;

        hpProgress.style.backgroundColor = berechneHPFarbe(prozent);
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

// 16. Admin-spezifische Funktionen
// --------------------------------------------
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
                                console.error("Fehler beim Bearbeiten der Quest:", error);
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
// 17. Benutzerverwaltung und Fortschritte
// ----------------------------------------
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

        benutzerContainer.appendChild(benutzerElement);
    }
}

// 18. Logout-Funktion
// ----------------------------------------
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

// 19. Fehlerbehandlung und Debugging
// ----------------------------------------
window.onerror = function (message, source, lineno, colno, error) {
    console.error(`Fehler: ${message} in ${source} (Zeile ${lineno}, Spalte ${colno})`);
};

