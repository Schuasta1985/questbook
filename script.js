// Globale Variablen für XP, Level und Benutzerstatus
let xp = 0;  // Nur EINMAL deklarieren
let level = 1;
let currentUser = null;
let isAdmin = false; // Admin Login Status

// Fortschritte beim Laden der Seite wiederherstellen
window.onload = function () {
    zeigeStartseite(); // Zeigt nur die Login-Seite
};

// Startseite anzeigen, ohne das gesamte HTML zu überschreiben
function zeigeStartseite() {
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
    const benutzername = document.getElementById("benutzerDropdown").value;
    const passwort = document.getElementById("benutzerPasswort").value;

    const benutzerPasswoerter = {
        Thomas: "passwort1",
        Elke: "passwort2",
        Jamie: "passwort3",
        Massel: "1234",
    };

    if (benutzername && benutzerPasswoerter[benutzername] && passwort === benutzerPasswoerter[benutzername]) {
        currentUser = benutzername;
        localStorage.setItem("currentUser", currentUser);
        ladeFortschritte();
        aktualisiereXPAnzeige();
        ladeQuestStatus(); // Lade den Status der Quests des aktuellen Benutzers
        zeigeQuestbook();
        zeigeAvatar(); // Avatar anzeigen

        // Sichtbarkeit der Abschnitte aktualisieren
        document.getElementById("xp-counter").style.display = "block";
        document.getElementById("quests-section").style.display = "block";
        document.getElementById("logout-button").style.display = "block";

        // Login-Bereich ausblenden
        document.getElementById("login-section").style.display = "none";
    } else {
        alert("Bitte wähle einen Benutzer und gib das richtige Passwort ein.");
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
    return "https://via.placeholder.com/100?text=Avatar"; // Platzhalter-Avatar
}

// Avatar anzeigen
function zeigeAvatar() {
    const avatarContainer = document.getElementById("avatar-container");
    if (!avatarContainer) {
        console.error("Avatar-Container wurde nicht gefunden.");
        return;
    }

    const avatarUrl = getAvatarForUser(currentUser);
    console.log("Avatar URL: ", avatarUrl);  // Debug: Überprüfen, ob der richtige Pfad ausgegeben wird

    avatarContainer.innerHTML = `<video src="${avatarUrl}" autoplay loop muted width="150"></video>`;
}

// Fortschritte speichern
function speichereFortschritte() {
    if (currentUser) {
        localStorage.setItem(`${currentUser}_xp`, xp);
        localStorage.setItem(`${currentUser}_level`, level);
    }
}

// Fortschritte laden (überarbeitet)
function ladeFortschritte() {
    if (currentUser) {
        const gespeicherteXP = localStorage.getItem(`${currentUser}_xp`);
        const gespeichertesLevel = localStorage.getItem(`${currentUser}_level`);

        if (gespeicherteXP !== null) {
            xp = parseInt(gespeicherteXP, 10);
        }

        if (gespeichertesLevel !== null) {
            level = parseInt(gespeichertesLevel, 10);
        }

        aktualisiereXPAnzeige();
    }
}

// Quest-Status laden
function ladeQuestStatus() {
    if (currentUser) {
        const gespeicherterQuestStatus = localStorage.getItem(`${currentUser}_questStatus`);
        if (gespeicherterQuestStatus) {
            const questStatus = JSON.parse(gespeicherterQuestStatus);
            const questItems = document.querySelectorAll("#quests li");
            questItems.forEach((questItem, index) => {
                if (questStatus[index]) {
                    questItem.style.textDecoration = "line-through";
                    questItem.style.opacity = "0.6";
                    const erledigtButton = questItem.querySelector("button:not(.edit-button)");
                    if (erledigtButton) {
                        erledigtButton.disabled = true;
                    }
                }
            });
        }
    }
}

// Ausloggen
function ausloggen() {
    currentUser = null;
    isAdmin = false;
    localStorage.removeItem("currentUser");

    // Abschnitte wieder verstecken
    document.getElementById("xp-counter").style.display = "none";
    document.getElementById("quests-section").style.display = "none";
    document.getElementById("logout-button").style.display = "none";

    // Login-Bereich wieder anzeigen
    document.getElementById("login-section").style.display = "block";
    zeigeStartseite();
}

// XP-Anzeige und Level-Up überprüfen
function aktualisiereXPAnzeige() {
    const xpElement = document.getElementById('xp');
    const levelElement = document.getElementById('level');

    if (xpElement) {
        xpElement.textContent = xp;
    }

    if (levelElement) {
        levelElement.textContent = level;
    }

    // Fortschrittsbalken zum nächsten Level
    const xpFürLevelUp = level <= 10 ? 100 : 200 + ((Math.floor((level - 1) / 10)) * 100);
    const xpProgressElement = document.getElementById('xp-progress');

    if (xpProgressElement) {
        const progress = Math.min((xp / xpFürLevelUp) * 100, 100); // Sicherstellen, dass der Fortschritt nicht über 100% geht
        xpProgressElement.style.width = `${progress}%`;
    }

    überprüfeLevelAufstieg(); // Überprüfen, ob Level-Up erforderlich ist
    speichereFortschritte();
}

// Level-Aufstieg überprüfen
function überprüfeLevelAufstieg() {
    const xpFürLevelUp = level <= 10 ? 100 : 200 + ((Math.floor((level - 1) / 10)) * 100);

    while (xp >= xpFürLevelUp) {
        xp -= xpFürLevelUp;
        level++;
        aktualisiereXPAnzeige();
        zeigeLevelUpAnimation();  // Level-Up Animation aufrufen
    }
}

// Animation bei Level-Up anzeigen
function zeigeLevelUpAnimation() {
    const avatarContainer = document.getElementById('avatar-container');
    if (avatarContainer) {
        avatarContainer.innerHTML += '<div class="level-up-animation">Level Up!</div>';
        setTimeout(() => {
            const animationElement = avatarContainer.querySelector('.level-up-animation');
            if (animationElement) {
                animationElement.remove();
            }
        }, 2000);
    }
}

// Questbuch anzeigen ohne Überschreiben des gesamten Body-Inhalts
function zeigeQuestbook() {
    const questContainer = document.getElementById("quests");
    if (questContainer) {
        questContainer.innerHTML = ''; // Vorhandene Quests löschen

        // Beispielquests erstellen
        ladeQuests();
    }

    const xpElement = document.getElementById("xp");
    const levelElement = document.getElementById("level");

    if (xpElement && levelElement) {
        xpElement.textContent = xp;
        levelElement.textContent = level;
    }

    // Zeige Admin Funktionen falls nötig
    if (isAdmin) {
        zeigeAdminFunktionen();
    }
}

// Admin-Funktionen anzeigen
function zeigeAdminFunktionen() {
    if (isAdmin) {
        const questItems = document.querySelectorAll("#quests li");
        questItems.forEach((questItem, index) => {
            if (!questItem.querySelector(".edit-button")) {
                const editButton = document.createElement("button");
                editButton.textContent = "Bearbeiten";
                editButton.className = "edit-button";
                editButton.onclick = () => questBearbeiten(index + 1);
                questItem.appendChild(editButton);
            }
        });

        // Überprüfe, ob der Container bereits Schaltflächen enthält, bevor neue hinzugefügt werden
        if (!document.getElementById("admin-buttons-container")) {
            const questbookContainer = document.getElementById("quests");

            // Erstelle einen Container für die Admin-Schaltflächen
            const adminButtonsContainer = document.createElement("div");
            adminButtonsContainer.id = "admin-buttons-container";

            const createButton = document.createElement("button");
            createButton.textContent = "Neue Quest erstellen";
            createButton.id = "createQuestButton";
            createButton.onclick = neueQuestErstellen;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Alle Quests löschen";
            deleteButton.id = "deleteQuestsButton";
            deleteButton.onclick = questsLöschen;

            // Füge die Schaltflächen zum Container hinzu
            adminButtonsContainer.appendChild(createButton);
            adminButtonsContainer.appendChild(deleteButton);

            // Füge den Container zum Quests-Bereich hinzu
            questbookContainer.appendChild(adminButtonsContainer);
        }
    }
}

// Admin-Login (ohne die HTML-Struktur zu überschreiben)
function adminLogin() {
    const username = document.getElementById("adminBenutzername").value;
    const password = document.getElementById("adminPasswort").value;

    if (username === "admin" && password === "1234") {
        alert("Admin erfolgreich eingeloggt!");
        isAdmin = true;
        zeigeQuestbook();
        zeigeAdminFunktionen();  // Zeige die Admin-Funktionen an
    } else {
        alert("Falsche Anmeldedaten!");
    }
}

// Quests laden
function ladeQuests() {
    const gespeicherteQuests = localStorage.getItem("quests");

    if (gespeicherteQuests) {
        const quests = JSON.parse(gespeicherteQuests);
        const questList = document.getElementById("quests");
        questList.innerHTML = "";  // Quests vorher löschen

        quests.forEach((quest, index) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                <span class="quest-text"><strong>Quest ${index + 1}:</strong> ${quest.beschreibung}</span>
                <button onclick="questErledigt(${index + 1})">Erledigt</button>
            `;
            listItem.setAttribute("data-xp", quest.xp);
            questList.appendChild(listItem);
        });

        // Admin-Funktionen anzeigen, falls der Admin eingeloggt ist
        if (isAdmin) {
            zeigeAdminFunktionen();
        }
    } else {
        // Wenn keine Quests gespeichert sind, initialisiere sie
        const defaultQuests = [
            { beschreibung: "Hausarbeit machen", xp: 10 },
            { beschreibung: "Einkaufen gehen", xp: 20 },
            { beschreibung: "Joggen", xp: 15 }
        ];

        // Speichere die Standardquests, wenn sie nicht existieren
        localStorage.setItem("quests", JSON.stringify(defaultQuests));
        ladeQuests();  // Jetzt laden wir die gespeicherten Quests
    }
}

// Quest erledigt markieren
function questErledigt(questNummer) {
    const quest = document.querySelector(`#quests li:nth-child(${questNummer})`);

    if (quest) {
        const xpWert = parseInt(quest.getAttribute("data-xp"), 10) || 10;
        xp += xpWert;
        aktualisiereXPAnzeige();
        überprüfeLevelAufstieg();

        quest.style.textDecoration = "line-through";
        quest.style.opacity = "0.6";
        const erledigtButton = quest.querySelector("button:not(.edit-button)");
        if (erledigtButton) {
            erledigtButton.disabled = true;
        }
        speichereQuestStatus();
    }
}

// Neue Funktion: Alle Quests löschen
function questsLöschen() {
    if (confirm("Möchtest du wirklich alle Quests löschen?")) {
        const questList = document.getElementById("quests");
        questList.innerHTML = ""; // Alle Quests aus der UI löschen

        // Speicher löschen
        localStorage.removeItem("quests");
        console.log("Alle Quests wurden gelöscht.");
    }
}

// Speichern des Quest-Status
function speichereQuestStatus() {
    const questItems = document.querySelectorAll("#quests li");
    const questStatus = [];

    questItems.forEach(questItem => {
        const istErledigt = questItem.style.textDecoration === "line-through";
        questStatus.push(istErledigt);
    });

    if (currentUser) {
        localStorage.setItem(`${currentUser}_questStatus`, JSON.stringify(questStatus));
    }
}
