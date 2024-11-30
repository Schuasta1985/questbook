// Globale Variablen für XP, Level und Benutzerstatus
let xp = 0;
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
    };

    if (benutzername && benutzerPasswoerter[benutzername] && passwort === benutzerPasswoerter[benutzername]) {
        currentUser = benutzername;
        localStorage.setItem("currentUser", currentUser);
        ladeFortschritte();
        aktualisiereXPAnzeige();
        ladeQuestStatus();
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

function zeigeAvatar() {
    const avatarElement = document.getElementById("avatar");
    if (!avatarElement) {
        console.error("Avatar-Element wurde nicht gefunden.");
        return;
    }
    const avatarUrl = getAvatarForUser(currentUser);
    avatarElement.src = avatarUrl;
}

// Fortschritte speichern und laden
function speichereFortschritte() {
    if (currentUser) {
        localStorage.setItem(`${currentUser}_xp`, xp);
        localStorage.setItem(`${currentUser}_level`, level);
    }
}

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

// XP-Anzeige und Fortschrittsbalken aktualisieren
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

    speichereFortschritte();
}
// Quest bearbeiten
function questBearbeiten(questNummer) {
    const quest = document.querySelector(`#quests li:nth-child(${questNummer})`);

    const neueBeschreibung = prompt("Neue Quest-Beschreibung:", "Hausarbeit machen");
    const neueXP = prompt("Neue XP für diese Quest:", "10");

    if (neueBeschreibung) {
        quest.innerHTML = "";

        const beschreibungSpan = document.createElement("span");
        beschreibungSpan.className = "quest-text";
        beschreibungSpan.textContent = neueBeschreibung;

        const xpWert = parseInt(neueXP, 10) || 10;
        quest.setAttribute("data-xp", xpWert);

        const erledigtButton = document.createElement("button");
        erledigtButton.textContent = "Erledigt";
        erledigtButton.onclick = () => {
            xp += xpWert;
            aktualisiereXPAnzeige();
            überprüfeLevelAufstieg();
            erledigtButton.disabled = true;
            quest.style.textDecoration = "line-through";
            quest.style.opacity = "0.6";
            speichereQuestStatus();
        };

        const editButton = document.createElement("button");
        editButton.textContent = "Bearbeiten";
        editButton.className = "edit-button";
        editButton.onclick = () => questBearbeiten(questNummer);

        quest.appendChild(beschreibungSpan);
        quest.appendChild(erledigtButton);
        quest.appendChild(editButton);

        quest.style.textDecoration = "none";
        quest.style.opacity = "1";

        // Speichere die Änderungen im localStorage
        speichereQuestÄnderungen();

        console.log("Quest bearbeitet und Änderungen gespeichert.");
    }
}

// Quests speichern
function speichereQuestÄnderungen() {
    const questItems = document.querySelectorAll("#quests li");
    const quests = [];

    questItems.forEach(questItem => {
        const beschreibung = questItem.querySelector(".quest-text").textContent;
        const xp = questItem.getAttribute("data-xp");
        quests.push({ beschreibung, xp });
    });

    localStorage.setItem("quests", JSON.stringify(quests));
    console.log("Quests gespeichert:", quests);
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

function neueQuestErstellen() {
    const beschreibung = prompt("Bitte gib die Beschreibung der neuen Quest ein:");
    const xpWert = parseInt(prompt("XP für diese Quest:", "10"), 10);

    if (beschreibung) {
        const questList = document.getElementById("quests");
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <span class="quest-text"><strong>Quest:</strong> ${beschreibung}</span>
            <button onclick="questErledigt(${questList.children.length + 1})">Erledigt</button>
        `;
        listItem.setAttribute("data-xp", xpWert || 10);
        questList.appendChild(listItem);

        speichereQuestÄnderungen();
        console.log("Neue Quest wurde erstellt:", beschreibung);
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

// Ausloggen
function ausloggen() {
    currentUser = null;
    isAdmin = false;
    localStorage.removeItem("currentUser");
    zeigeStartseite();
}

// Level-Aufstieg überprüfen
function überprüfeLevelAufstieg() {
    const xpFürLevelUp = level <= 10 ? 100 : 200 + ((Math.floor((level - 1) / 10)) * 100);

    console.log(`Prüfe Level-Up: XP = ${xp}, Level = ${level}, Benötigte XP = ${xpFürLevelUp}`);

    while (xp >= xpFürLevelUp) {
        xp -= xpFürLevelUp;
        level++;
        console.log(`Level-Up erfolgt! Neues Level: ${level}`);
        aktualisiereXPAnzeige();
        zeigeLevelUpAnimation();  // Level-Up Animation aufrufen
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
