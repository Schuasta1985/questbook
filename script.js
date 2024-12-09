// Globale Variablen für XP, Level und Benutzerstatus
let xp = 0;
let level = 1;
let currentUser = null;
let isAdmin = false;

// Fortschritte beim Laden der Seite wiederherstellen
window.onload = function () {
    console.log("window.onload aufgerufen");
    zeigeStartseite();
    ladeSpielerInformationen(); // Spielerinformationen laden
    document.getElementById("npcLoginButton").onclick = npcLogin;
};

// Startseite anzeigen
function zeigeStartseite() {
    console.log("zeigeStartseite() aufgerufen");
    const loginSection = document.getElementById("login-section");

    if (loginSection) {
loginSection.innerHTML = `
    <label for="spielerDropdown">Spieler auswählen:</label>
    <select id="spielerDropdown">
        <option value="">-- Bitte wählen --</option>
        <option value="Thomas">Thomas</option>
        <option value="Elke">Elke</option>
        <option value="Jamie">Jamie</option>
        <option value="Massel">Massel</option>
    </select>
    <input type="password" id="spielerPasswort" placeholder="Passwort eingeben">
    <button onclick="benutzerAnmeldung()">Anmelden</button>

        `;
        loginSection.style.display = "block";
    }

    // Verstecke andere Sektionen
    document.getElementById("quests-section").style.display = "none";
    document.getElementById("xp-counter").style.display = "none";
    document.getElementById("logout-button").style.display = "none";
    document.getElementById("npc-login-section").style.display = "block"; // Nur auf der Startseite sichtbar
}


// Questbuch anzeigen
function zeigeQuestbook() {
    console.log("zeigeQuestbook() aufgerufen");
    // Sichtbarkeit der relevanten Elemente aktivieren
    document.getElementById('quests-section').style.display = 'block';
    document.getElementById('xp-counter').style.display = 'block';
    document.getElementById('logout-button').style.display = 'block';
    
    // Die Login-Sektion ausblenden, sobald der Benutzer angemeldet ist
    document.getElementById('login-section').style.display = 'none';
}

// Benutzeranmeldung
function benutzerAnmeldung() {
    console.log("benutzerAnmeldung() aufgerufen");

    const benutzernameInput = document.getElementById("spielerDropdown");
    const passwortInput = document.getElementById("spielerPasswort");

    if (!benutzernameInput || !passwortInput) {
        console.error("Fehler: Spieler-Dropdown oder Passwortfeld nicht gefunden!");
        return;
    }

    const benutzername = benutzernameInput.value;
    const passwort = passwortInput.value;

    const benutzerPasswoerter = {
        Thomas: "12345",
        Elke: "julian0703",
        Jamie: "602060",
        Massel: "1234",
    };

    if (benutzername && benutzerPasswoerter[benutzername] && passwort === benutzerPasswoerter[benutzername]) {
        currentUser = benutzername;
        isAdmin = false;

        // Login-Bereich ausblenden
        console.log("Verstecke login-section");
        const loginSection = document.getElementById("login-section");
        loginSection.style.display = "none";

        // Quests und XP-Bereich anzeigen
        zeigeQuestbook();
        ladeFortschritte();
        zeigeAvatar();
        ladeGlobaleQuests();
    } else {
        alert("Bitte wähle einen Spieler und gib das richtige Passwort ein.");
    }
}


// NPC Login
function npcLogin() {
    console.log("npcLogin() aufgerufen");
    const username = document.getElementById("npcBenutzername").value;
    const password = document.getElementById("npcPasswort").value;

    if (username === "npc" && password === "1234") {
        console.log("NPC erfolgreich eingeloggt!");
        isAdmin = true; // Admin-Status aktivieren
        currentUser = null; // Kein regulärer Benutzer

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
            level: level
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
function ladeFortschritte() {
    if (currentUser) {
        firebase.database().ref(`benutzer/${currentUser}/fortschritte`).get()
        .then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                xp = data.xp || 0;
                level = data.level || 1;
                aktualisiereXPAnzeige();
            } else {
                console.log("Keine Fortschrittsdaten gefunden für den Benutzer:", currentUser);
            }
        })
        .catch((error) => {
            console.error("Fehler beim Laden der Fortschritte:", error);
        });
    }
}
// Beispiel: Nach ladeGlobaleQuests()
function ladeGlobaleQuests() {
    console.log("ladeGlobaleQuests() aufgerufen");
    // ...
}

// Hier füge die neue Funktion ein
function ladeSpielerInformationen() {
    console.log("ladeSpielerInformationen() aufgerufen");

    const spielerInfoContainer = document.getElementById("spieler-info-container");
    const spielerList = document.getElementById("spieler-list");

    // Firebase-Daten abrufen
    firebase.database().ref('benutzer').get().then((snapshot) => {
        if (snapshot.exists()) {
            const benutzerDaten = snapshot.val();
            spielerList.innerHTML = ""; // Liste zurücksetzen

            Object.keys(benutzerDaten).forEach((spielerName) => {
                const spielerData = benutzerDaten[spielerName].fortschritte;
                const spielerLevel = spielerData ? spielerData.level || 1 : 1;

                const listItem = document.createElement("li");
                listItem.textContent = `${spielerName}: Level ${spielerLevel}`;
                spielerList.appendChild(listItem);
            });

            spielerInfoContainer.style.display = "block"; // Container anzeigen
        } else {
            console.log("Keine Benutzerdaten gefunden.");
            spielerList.innerHTML = "<li>Keine Spieler vorhanden</li>";
        }
    }).catch((error) => {
        console.error("Fehler beim Laden der Spielerinformationen:", error);
    });
}



// Quests speichern in Firebase
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

// Quests aus Firebase laden
// Globale Quests aus Firebase laden
function ladeGlobaleQuests() {
    console.log("ladeGlobaleQuests() aufgerufen");
    firebase.database().ref('quests').get()  // Ändere den Pfad zu 'quests' für globale Quests
    .then((snapshot) => {
        if (snapshot.exists()) {
            const gespeicherteQuests = snapshot.val();
            console.log("Globale Quests:", gespeicherteQuests);

            const questList = document.getElementById("quests");
            questList.innerHTML = ""; // Liste der Quests zurücksetzen

            gespeicherteQuests.forEach((quest, index) => {
                const listItem = document.createElement("li");
                const istErledigt = quest.erledigt || false;

                listItem.innerHTML = `
                    <span class="quest-text" style="text-decoration: ${istErledigt ? 'line-through' : 'none'};">
                        <strong>Quest ${index + 1}:</strong> ${quest.beschreibung} <span class="xp-display">( ${quest.xp} XP )</span>
                    </span>
                    ${!istErledigt && !isAdmin ? `<button onclick="questErledigt(${index})">Erledigt</button>` : ""}
                `;

                listItem.setAttribute("data-xp", quest.xp);
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



// Restliche Funktionen bleiben unverändert wie im letzten Beitrag

// XP-Anzeige und Level-Up überprüfen
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

// Level-Aufstieg überprüfen
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

// Level-Up Animation
function zeigeLevelUpAnimation() {
    console.log("zeigeLevelUpAnimation() aufgerufen");
    const videoContainer = document.createElement('div');
    videoContainer.id = 'level-up-video-container';
    videoContainer.style.position = 'fixed';
    videoContainer.style.top = '0';
    videoContainer.style.left = '0';
    videoContainer.style.width = '100%';
    videoContainer.style.height = '100%';
    videoContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Schwarzer, leicht transparenter Hintergrund
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
            if (quests[questNummer]) {
                quests[questNummer].erledigt = true; // Markiere die Quest als erledigt
                xp += quests[questNummer].xp; // XP hinzufügen
                speichereFortschritte(); // Fortschritte speichern
                firebase.database().ref('quests').set(quests) // Speichere die aktualisierten Quests
                    .then(() => {
                        aktualisiereXPAnzeige(); // XP-Anzeige aktualisieren
                        ladeGlobaleQuests(); // Quests neu laden
                        console.log(`Quest ${questNummer} wurde als erledigt markiert.`);
                    })
                    .catch((error) => {
                        console.error("Fehler beim Speichern der Quest als erledigt:", error);
                    });
            }
        }
    })
    .catch((error) => {
        console.error("Fehler beim Markieren der Quest als erledigt:", error);
    });
}
function neueQuestErstellen() {
    console.log("neueQuestErstellen() aufgerufen");
    const neueQuestBeschreibung = prompt("Bitte die Beschreibung für die neue Quest eingeben:");
    const neueQuestXP = parseInt(prompt("Wie viele XP soll diese Quest geben?"), 10);

    if (neueQuestBeschreibung && !isNaN(neueQuestXP)) {
        const neueQuest = {
            beschreibung: neueQuestBeschreibung,
            xp: neueQuestXP,
            erledigt: false
        };

        // Speichern der neuen Quest in der globalen Quests-Liste
        firebase.database().ref('quests').once('value')
            .then((snapshot) => {
                let quests = snapshot.exists() ? snapshot.val() : [];

                // Sicherstellen, dass wir ein Array haben
                if (!Array.isArray(quests)) {
                    console.error("Fehler: Erwartete eine Array-Struktur für die Quests.");
                    quests = [];
                }

                quests.push(neueQuest); // Füge die neue Quest hinzu

                return firebase.database().ref('quests').set(quests);
            })
            .then(() => {
                console.log("Neue Quest erfolgreich erstellt.");
                ladeGlobaleQuests(); // Lade die aktualisierten Quests neu
            })
            .catch((error) => {
                console.error("Fehler beim Speichern der neuen Quest:", error);
            });
    } else {
        alert("Ungültige Eingabe. Bitte gib eine gültige Beschreibung und XP ein.");
    }
}

function zeigeAdminFunktionen() {
    console.log("zeigeAdminFunktionen() aufgerufen");

    const levelSetContainer = document.getElementById("level-set-container");
    const adminButtonsContainer = document.getElementById("admin-buttons-container");

    if (isAdmin) {
        // Admin-spezifische Funktionen aktivieren
        console.log("Admin-Modus aktiv, zeige Admin-Funktionen");

        // Bearbeiten-Button für Quests hinzufügen
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

        // Admin-Buttons erstellen, falls sie nicht existieren
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
        } else {
            console.log("Admin-Buttons sind bereits vorhanden.");
        }

        // Level-Set-Container anzeigen
        if (levelSetContainer) {
            levelSetContainer.style.display = "block"; // Nur für Admin sichtbar
            const setLevelButton = document.getElementById("setLevelButton");
            if (setLevelButton) {
                setLevelButton.onclick = levelSetzen;
            }
        }
    } else {
        // Admin-spezifische Elemente ausblenden oder entfernen
        console.log("Kein Admin-Modus, verstecke Admin-Funktionen");

        if (adminButtonsContainer) {
            adminButtonsContainer.remove(); // Admin-Buttons entfernen
        }

        if (levelSetContainer) {
            levelSetContainer.style.display = "none"; // Level-Set-Container verstecken
        }

        // Bearbeiten-Buttons von Quests entfernen
        const editButtons = document.querySelectorAll(".edit-button");
        editButtons.forEach((editButton) => {
            editButton.remove();
        });
    }
}


// Level eines Benutzers setzen
function levelSetzen() {
    console.log("levelSetzen() aufgerufen");
    const benutzername = document.getElementById("benutzerDropdownLevel").value;
    const neuesLevel = parseInt(document.getElementById("levelInput").value, 10);

    if (benutzername && !isNaN(neuesLevel) && neuesLevel > 0) {
        firebase.database().ref(`benutzer/${benutzername}/fortschritte/level`).set(neuesLevel)
        .then(() => {
            console.log(`Level für ${benutzername} auf ${neuesLevel} gesetzt.`);
            if (currentUser === benutzername) {
                level = neuesLevel;
                aktualisiereXPAnzeige();
            }
            alert(`Das Level von ${benutzername} wurde erfolgreich auf ${neuesLevel} gesetzt.`);
        })
        .catch((error) => {
            console.error("Fehler beim Setzen des Levels:", error);
        });
    } else {
        alert("Bitte wähle einen Benutzer aus und gib ein gültiges Level ein.");
    }
}

// Quests zurücksetzen
function questsZuruecksetzen() {
    console.log("questsZuruecksetzen() aufgerufen");
    if (confirm("Möchtest du wirklich alle Quests zurücksetzen?")) {
        // Setze die globalen Quests zurück
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


// Funktion zum Bearbeiten von Quests
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


// Avatar anzeigen
function zeigeAvatar() {
    console.log("zeigeAvatar() aufgerufen für Benutzer:", currentUser);
    if (currentUser) {
        const avatarElement = document.getElementById("avatar-container");
        const avatarPath = getAvatarForUser(currentUser);

        if (avatarElement) {
            avatarElement.innerHTML = `
                <video autoplay loop muted>
                    <source src="${avatarPath}" type="video/mp4">
                    Dein Browser unterstützt das Video-Tag nicht.
                </video>
            `;
        }
    }
}

// Ausloggen
function ausloggen() {
    console.log("ausloggen() aufgerufen");
    currentUser = null;
    isAdmin = false; // Admin-Status zurücksetzen

    // Level-Set-Container verstecken
    const levelSetContainer = document.getElementById("level-set-container");
    if (levelSetContainer) {
        levelSetContainer.style.display = "none";
    }

    // Alle nicht benötigten Bereiche ausblenden
    document.getElementById('quests-section').style.display = 'none';
    document.getElementById('xp-counter').style.display = 'none';
    document.getElementById('logout-button').style.display = 'none';

    // NPC-Login-Bereich sichtbar machen
    const npcLoginSection = document.getElementById("npc-login-section");
    if (npcLoginSection) npcLoginSection.style.display = "block";

    // Avatar entfernen
    const avatarContainer = document.getElementById("avatar-container");
    if (avatarContainer) avatarContainer.innerHTML = "";

    // Quests zurücksetzen (leeren)
    const questList = document.getElementById("quests");
    if (questList) {
        questList.innerHTML = ""; // Löscht alle Einträge in der Quest-Liste
    }
        // Admin-Bereich entfernen
    const adminButtonsContainer = document.getElementById("admin-buttons-container");
    if (adminButtonsContainer) {
        adminButtonsContainer.remove(); // Löscht den Admin-Bereich vollständig
    }

    // Zurück zur Startseite (Login-Bereich wieder sichtbar machen)
    zeigeStartseite();
}

// Avatar für Benutzer festlegen
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
