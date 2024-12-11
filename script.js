// Globale Variablen für XP, Level und Benutzerstatus
let xp = 0;
let level = 1;
let currentUser = null;
let isAdmin = false;

// Fortschritte beim Laden der Seite wiederherstellen
window.onload = function () {
    console.log("window.onload aufgerufen");
    zeigeStartseite();

    const npcLoginButton = document.getElementById("npcLoginButton");
    if (npcLoginButton) {
        npcLoginButton.onclick = npcLogin;
    }
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

    // Benutzerinformationen laden und anzeigen
    ladeBenutzerdaten();

    // Verstecke andere Sektionen
    document.getElementById("quests-section").style.display = "none";
    document.getElementById("xp-counter").style.display = "none";
    document.getElementById("logout-button").style.display = "none";
    document.getElementById("npc-login-section").style.display = "block"; // Nur auf der Startseite sichtbar
}

// Questbuch anzeigen
function zeigeQuestbook() {
    console.log("zeigeQuestbook() aufgerufen");
    document.getElementById("quests-section").style.display = "block";
    document.getElementById("xp-counter").style.display = "block";
    document.getElementById("logout-button").style.display = "block";
    document.getElementById("login-section").style.display = "none";
}

// Benutzeranmeldung
function benutzerAnmeldung() {
    console.log("benutzerAnmeldung() aufgerufen");
    // Verstecke Begrüßungstext
    document.getElementById("welcome-text").style.display = "none";
    // Blende die HP- und MP-Bereiche ein
    document.getElementById("hp-bar-container").style.display = "block";
    document.getElementById("mp-bar-container").style.display = "flex";


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

    // Benutzername-Passwort-Paar
    const benutzerPasswoerter = {
        Thomas: "12345",
        Elke: "julian0703",
        Jamie: "602060",
    };

    // Überprüfen, ob Benutzername und Passwort korrekt sind
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

    // Verstecke Benutzerübersicht
    if (benutzerContainer) {
        benutzerContainer.style.display = "none";
    }

    // Lade Benutzerinformationen
    zeigeQuestbook();          // Quests anzeigen
    ladeFortschritte();        // HP und MP laden
    zeigeAvatar();             // Avatar anzeigen
    ladeGlobaleQuests();       // Globale Quests laden

    // Optional: Animation oder Feedback hinzufügen
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
            mp: aktuelleMP || berechneMaxMP(level), // Ergänzung
            maxMP: maxMP || berechneMaxMP(level) // Ergänzung
        })
        .then(() => {
            console.log("Fortschritte erfolgreich gespeichert.");
        })
        .catch((error) => {
            console.error("Fehler beim Speichern der Fortschritte:", error);
        });
    }
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

        // Avatar-Video einfügen
        avatarContainer.innerHTML = `
            <video autoplay loop muted class="${currentUser === 'Jamie' ? 'avatar-jamie' : 'avatar-general'}">
                <source src="${avatarPath}" type="video/mp4">
                Dein Browser unterstützt das Video-Tag nicht.
            </video>
        `;

        avatarContainer.style.display = "flex"; // Avatar sichtbar machen
        avatarContainer.style.marginTop = "20px"; // Platz schaffen
    } else {
        console.error("Kein Benutzer angemeldet. Avatar kann nicht angezeigt werden.");
    }
}



// Ausloggen
function ausloggen() {
    console.log("ausloggen() aufgerufen");
    document.getElementById("welcome-text").style.display = "block";
    document.getElementById("mp-bar-container").style.display = "none";
    currentUser = null;
    isAdmin = false; // Admin-Status zurücksetzen

    // Platz für den Avatar zurücksetzen
    const questsSection = document.getElementById("quests-section");
    if (questsSection) {
        questsSection.style.marginTop = "0px";
    }

    // Level-Set-Container verstecken
    const levelSetContainer = document.getElementById("level-set-container");
    if (levelSetContainer) {
        levelSetContainer.style.display = "none";
    }

    // Avatar-Container zurücksetzen
    const avatarContainer = document.getElementById("avatar-container");
    if (avatarContainer) {
        avatarContainer.style.display = "none"; // Avatar ausblenden
        avatarContainer.innerHTML = ""; // Inhalt zurücksetzen
    }
    // Alle nicht benötigten Bereiche ausblenden
    document.getElementById('quests-section').style.display = 'none';
    document.getElementById('xp-counter').style.display = 'none';
    document.getElementById('logout-button').style.display = 'none';

    // NPC-Login-Bereich sichtbar machen
    const npcLoginSection = document.getElementById("npc-login-section");
    if (npcLoginSection) {
        npcLoginSection.style.display = "block";
    }

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
    // HP-Anzeige ausblenden
    const hpContainer = document.getElementById("hp-bar-container");
    if (hpContainer) {
        hpContainer.style.display = "none";
    }

    // Benutzerübersicht einblenden
    const benutzerContainer = document.getElementById("benutzer-container");
    if (benutzerContainer) {
        benutzerContainer.style.display = "flex"; // Benutzerübersicht anzeigen
    }

    // Zurück zur Startseite (Login-Bereich wieder sichtbar machen
        zeigeStartseite();
}
    

// Globale Variable für alle Benutzer
let benutzerDaten = [];

// Funktion zum Laden der Benutzerdaten
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

// Benutzer auf der Startseite anzeigen
function zeigeBenutzerAufStartseite() {
    console.log("zeigeBenutzerAufStartseite() aufgerufen");
    const benutzerContainer = document.getElementById("benutzer-container");
    benutzerContainer.innerHTML = ""; // Vorherige Inhalte löschen

    for (const [benutzername, daten] of Object.entries(benutzerDaten)) {
        const benutzerElement = document.createElement("div");
        benutzerElement.className = "benutzer-item";

        // Avatar (Video)
        const avatarElement = document.createElement("video");
        avatarElement.src = getAvatarForUser(benutzername);
        avatarElement.autoplay = true;
        avatarElement.loop = true;
        avatarElement.muted = true;
        avatarElement.style.width = "100px"; // Anpassbare Größe

        // Benutzername
        const nameElement = document.createElement("h3");
        nameElement.textContent = benutzername;

        // Level
        const levelElement = document.createElement("div");
        levelElement.textContent = `Level: ${daten.fortschritte?.level || 1}`;
        levelElement.style.border = "2px solid gold";
        levelElement.style.padding = "5px";
        levelElement.style.borderRadius = "5px";
        levelElement.style.textAlign = "center";

        // MP-Leiste
        const maxMP = berechneMaxMP(daten.fortschritte?.level || 1); // Max MP basierend auf Level berechnen
        const aktuelleMP = daten.fortschritte?.mp || maxMP; // Aktuelle MP aus Daten oder Max MP verwenden
        const mpElement = document.createElement("div");
        mpElement.className = "mp-bar";
        const mpProzent = (aktuelleMP / maxMP) * 100;
        mpElement.innerHTML = `
            <div class="progress" style="width: ${mpProzent}%;"></div>
            <span class="mp-text">${aktuelleMP} / ${maxMP} MP</span>
        `;
        mpElement.title = `${aktuelleMP} / ${maxMP} MP`;

        // Alles zusammenfügen
        benutzerElement.appendChild(avatarElement);
        benutzerElement.appendChild(nameElement);
        benutzerElement.appendChild(levelElement);
        benutzerElement.appendChild(mpElement);

        benutzerContainer.appendChild(benutzerElement);
    }
}


// HP-Leiste mit Farbverlauf und Anzeige
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

// MP-Leiste mit Anzeige
const mpElement = document.createElement("div");
mpElement.className = "mp-bar";
const aktuelleMP = daten.fortschritte?.mp || 0;
const maxMP = 100 + (daten.fortschritte?.level || 1) * 10; // Beispiel-Formel
const mpProzent = (aktuelleMP / maxMP) * 100;
mpElement.innerHTML = `
    <div class="progress" style="width: ${mpProzent}%;"></div>
    <span class="mp-text">${aktuelleMP} / ${maxMP} MP</span>
`;
mpElement.title = `${aktuelleMP} / ${maxMP} MP`;

        // Alles zusammenfügen
        benutzerElement.appendChild(avatarElement);
        benutzerElement.appendChild(nameElement);
        benutzerElement.appendChild(levelElement);
        benutzerElement.appendChild(hpElement);
        benutzerElement.appendChild(mpElement);

        benutzerContainer.appendChild(benutzerElement);
    }
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
// Funktion zur Berechnung der maximalen HP basierend auf dem Level
function berechneMaxHP(level) {
    return 100 + Math.floor((level - 1) / 10) * 200;
}

function aktualisiereHPLeiste(aktuelleHP, level) {
    const maxHP = berechneMaxHP(level); // Berechnet das maximale HP basierend auf dem Level
    const hpProgress = document.getElementById("hp-progress");

    if (hpProgress) {
        const prozent = (aktuelleHP / maxHP) * 100;
        hpProgress.style.width = `${prozent}%`;
        hpProgress.textContent = `${aktuelleHP} / ${maxHP} HP`; // Zeigt sowohl aktuelle als auch maximale HP an

        // Dynamische Farbänderung der Leiste
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
// Funktion zur Berechnung der maximalen MP basierend auf dem Level
function berechneMaxMP(level) {
    return 50 + (level * 10); // Beispiel: 50 Basis + 10 pro Level
}

// Funktion zur Aktualisierung der MP-Leiste
function aktualisiereMPLeiste(aktuelleMP, maxMP) {
    const mpProgress = document.getElementById("mp-progress");
    if (mpProgress) {
        const prozent = (aktuelleMP / maxMP) * 100;
        mpProgress.style.width = `${prozent}%`;
        mpProgress.textContent = `${aktuelleMP} / ${maxMP} MP`;
    }
}


// Ergänze die MP-Leiste in ladeFortschritte()
function ladeFortschritte() {
    if (currentUser) {
        firebase.database().ref(`benutzer/${currentUser}/fortschritte`).get()
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    xp = data.xp || 0;
                    level = data.level || 1;
                    aktuelleHP = data.hp || berechneMaxHP(level);
                    maxHP = data.maxHP || berechneMaxHP(level);
                    aktuelleMP = data.mp || berechneMaxMP(level); // Ergänzung
                    maxMP = data.maxMP || berechneMaxMP(level); // Ergänzung
                    aktualisiereXPAnzeige();
                    aktualisiereHPLeiste(aktuelleHP, level);
                    aktualisiereMPLeiste(aktuelleMP, level); // Ergänzung
                }
            })
            .catch((error) => {
                console.error("Fehler beim Laden der Fortschrittsdaten:", error);
            });
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
        // Abstand zwischen HP-Leiste und Quests anpassen
        questsSection.style.marginTop = "20px"; // Mehr Platz oberhalb der Quests
    }
}
aktualisiereLayout();


