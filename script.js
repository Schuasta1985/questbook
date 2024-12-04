// Firebase-Initialisierung: Importiere die Firebase-Funktionen
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

// Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Globale Variablen für XP, Level und Benutzerstatus
let xp = 0;
let level = 1;
let currentUser = null;
let isAdmin = false;

// Fortschritte beim Laden der Seite wiederherstellen
window.onload = function () {
    console.log("window.onload aufgerufen");
    zeigeStartseite();
};

// Startseite anzeigen
function zeigeStartseite() {
    console.log("zeigeStartseite() aufgerufen");
    const loginSection = document.getElementById("login-section");

    if (loginSection) {
        loginSection.innerHTML = `
            <label for="benutzerDropdown">Benutzer auswählen:</label>
            <select id="benutzerDropdown">
                <option value="">-- Bitte wählen --</option>
                <option value="Thomas">Thomas</option>
                <option value="Elke">Elke</option>
                <option value="Jamie">Jamie</option>
                <option value="Massel">Massel</option>
            </select>
            <input type="password" id="benutzerPasswort" placeholder="Passwort eingeben">
            <button onclick="benutzerAnmeldung()">Anmelden</button>
        `;
    }
}

// Benutzeranmeldung
function benutzerAnmeldung() {
    console.log("benutzerAnmeldung() aufgerufen");
    const benutzername = document.getElementById("benutzerDropdown").value;
    const passwort = document.getElementById("benutzerPasswort").value;

    const benutzerPasswoerter = {
        Thomas: "passwort1",
        Elke: "julian0703",
        Jamie: "602060",
        Massel: "1234",
    };

    if (benutzername && benutzerPasswoerter[benutzername] && passwort === benutzerPasswoerter[benutzername]) {
        currentUser = benutzername;
        isAdmin = false;

        ladeFortschritte();
        zeigeQuestbook();
        zeigeAvatar();
        ladeQuests();
    } else {
        alert("Bitte wähle einen Benutzer und gib das richtige Passwort ein.");
    }
}

// Admin Login
function adminLogin() {
    console.log("adminLogin() aufgerufen");
    const username = document.getElementById("adminBenutzername").value;
    const password = document.getElementById("adminPasswort").value;

    if (username === "admin" && password === "1234") {
        alert("Admin erfolgreich eingeloggt!");
        isAdmin = true;
        zeigeQuestbook();
        ladeQuests();
    } else {
        alert("Falsche Anmeldedaten!");
    }
}

// Benutzerfortschritte speichern in Firebase
function speichereFortschritte() {
    if (currentUser) {
        set(ref(database, `benutzer/${currentUser}/fortschritte`), {
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
        get(ref(database, `benutzer/${currentUser}/fortschritte`))
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

// Quests speichern in Firebase
function speichereQuestsInFirebase(quests) {
    if (currentUser) {
        set(ref(database, `benutzer/${currentUser}/quests`), quests)
        .then(() => {
            console.log("Quests erfolgreich gespeichert.");
        })
        .catch((error) => {
            console.error("Fehler beim Speichern der Quests:", error);
        });
    }
}

// Quests aus Firebase laden
function ladeQuests() {
    console.log("ladeQuests() aufgerufen");
    if (currentUser) {
        get(ref(database, `benutzer/${currentUser}/quests`))
        .then((snapshot) => {
            if (snapshot.exists()) {
                const gespeicherteQuests = snapshot.val();
                console.log("Gespeicherte Quests:", gespeicherteQuests);

                const questList = document.getElementById("quests");
                questList.innerHTML = ""; // Liste der Quests zurücksetzen

                gespeicherteQuests.forEach((quest, index) => {
                    const listItem = document.createElement("li");
                    const istErledigt = quest.erledigt || false;

                    listItem.innerHTML = `
                        <span class="quest-text" style="text-decoration: ${istErledigt ? 'line-through' : 'none'};"><strong>Quest ${index + 1}:</strong> ${quest.beschreibung}</span>
                        ${!istErledigt && !isAdmin ? `<button onclick="questErledigt(${index})">Erledigt</button>` : ""}
                    `;
                    listItem.setAttribute("data-xp", quest.xp);
                    questList.appendChild(listItem);
                });

                if (isAdmin) {
                    zeigeAdminFunktionen();
                }
            } else {
                console.log("Keine Quests gefunden für den Benutzer.");
            }
        })
        .catch((error) => {
            console.error("Fehler beim Laden der Quests:", error);
        });
    }
}

// ... Restlicher Code bleibt unverändert


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

// Admin-spezifische Funktionen anzeigen
function zeigeAdminFunktionen() {
    console.log("zeigeAdminFunktionen() aufgerufen");
    if (isAdmin) {
        const questItems = document.querySelectorAll("#quests li");
        questItems.forEach((questItem, index) => {
            if (!questItem.querySelector(".edit-button")) {
                const editButton = document.createElement("button");
                editButton.textContent = "Bearbeiten";
                editButton.className = "edit-button";
                editButton.onclick = () => questBearbeiten(index);
                questItem.appendChild(editButton);
            }
        });

        if (!document.getElementById("admin-buttons-container")) {
            const questbookContainer = document.getElementById("quests");
            const adminButtonsContainer = document.createElement("div");
            adminButtonsContainer.id = "admin-buttons-container";

            const createButton = document.createElement("button");
            createButton.textContent = "Neue Quest erstellen";
            createButton.id = "createQuestButton";
            createButton.onclick = neueQuestErstellen;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Alle Quests zurücksetzen";
            deleteButton.id = "deleteQuestsButton";
            deleteButton.onclick = questsZuruecksetzen;

            adminButtonsContainer.appendChild(createButton);
            adminButtonsContainer.appendChild(deleteButton);
            questbookContainer.appendChild(adminButtonsContainer);
        }

        const levelSetContainer = document.getElementById("level-set-container");
        if (levelSetContainer) {
            levelSetContainer.style.display = "block"; // Nur für Admin sichtbar
            const setLevelButton = document.getElementById("setLevelButton");
            setLevelButton.onclick = levelSetzen;
        }
    }
}

// Level eines Benutzers setzen
function levelSetzen() {
    console.log("levelSetzen() aufgerufen");
    const benutzername = document.getElementById("benutzerDropdownLevel").value;
    const neuesLevel = parseInt(document.getElementById("levelInput").value, 10);

    if (benutzername && !isNaN(neuesLevel) && neuesLevel > 0) {
        set(ref(database, `benutzer/${benutzername}/fortschritte/level`), neuesLevel)
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
        set(ref(database, `benutzer/${currentUser}/quests`), [])
        .then(() => {
            console.log("Alle Quests wurden zurückgesetzt.");
            ladeQuests();
        })
        .catch((error) => {
            console.error("Fehler beim Zurücksetzen der Quests:", error);
        });
    }
}

// Funktion zum Bearbeiten von Quests
function questBearbeiten(questNummer) {
    console.log("questBearbeiten() aufgerufen für QuestNummer:", questNummer);
    get(ref(database, `benutzer/${currentUser}/quests`))
    .then((snapshot) => {
        if (snapshot.exists()) {
            const quests = snapshot.val();
            if (quests[questNummer]) {
                const neueBeschreibung = prompt("Neue Beschreibung der Quest:", quests[questNummer].beschreibung);
                const neueXP = parseInt(prompt("Neue XP für diese Quest:", quests[questNummer].xp), 10);

                if (neueBeschreibung && !isNaN(neueXP)) {
                    quests[questNummer].beschreibung = neueBeschreibung;
                    quests[questNummer].xp = neueXP;
                    speichereQuestsInFirebase(quests);
                    ladeQuests();
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

