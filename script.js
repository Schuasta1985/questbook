// Globale Variablen für XP, Level und Benutzerstatus
let xp = 0;
let level = 1;
let currentUser = null;
let isAdmin = false;

// Fortschritte beim Laden der Seite wiederherstellen
window.onload = function () {
    zeigeStartseite();
};

// Startseite anzeigen
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
        zeigeQuestbook();
        zeigeAvatar();
        ladeQuests(); // Lade die Quests jetzt, nachdem sich der Benutzer erfolgreich angemeldet hat
        
        document.getElementById("xp-counter").style.display = "block";
        document.getElementById("quests-section").style.display = "block";
        document.getElementById("logout-button").style.display = "block";
        document.getElementById("login-section").style.display = "none";
    } else {
        alert("Bitte wähle einen Benutzer und gib das richtige Passwort ein.");
    }
}

// Admin Login
function adminLogin() {
    const username = document.getElementById("adminBenutzername").value;
    const password = document.getElementById("adminPasswort").value;

    if (username === "admin" && password === "1234") {
        alert("Admin erfolgreich eingeloggt!");
        isAdmin = true;
        localStorage.setItem("isAdmin", isAdmin);
        zeigeQuestbook(); // Admin sieht das Questbook, ohne dass ein Benutzer eingeloggt sein muss
         ladeQuests(); // Quests laden, wenn der Admin eingeloggt ist
    } else {
        alert("Falsche Anmeldedaten!");
    }
}

// Ausloggen
function ausloggen() {
    currentUser = null;
    isAdmin = false;
    localStorage.removeItem("currentUser");

    document.getElementById("xp-counter").style.display = "none";
    document.getElementById("quests-section").style.display = "none";
    document.getElementById("logout-button").style.display = "none";
    document.getElementById("login-section").style.display = "block";
    zeigeStartseite();
}

// Avatar anzeigen, je nach Benutzer
function zeigeAvatar() {
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

// Fortschritte speichern
function speichereFortschritte() {
    if (currentUser) {
        localStorage.setItem(`${currentUser}_xp`, xp);
        localStorage.setItem(`${currentUser}_level`, level);
    }
}

// Fortschritte laden
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

// Quest-Status laden (benutzerspezifisch)
function ladeGlobalenQuestStatus() {
    if (currentUser) {
        const gespeicherterQuestStatus = localStorage.getItem(`${currentUser}_questStatus`);
        if (gespeicherterQuestStatus) {
            const questStatus = JSON.parse(gespeicherterQuestStatus);
            const questItems = document.querySelectorAll("#quests li");
            questItems.forEach((questItem, index) => {
                if (questStatus[index] && questStatus[index].erledigt) {
                    questItem.style.display = "none"; // Quest ausblenden, wenn erledigt
                }
            });
        }
    }
}

// Speichern des globalen Quest-Status (benutzerspezifisch)
function speichereGlobalenQuestStatus() {
    if (currentUser) {
        const questItems = document.querySelectorAll("#quests li");
        const questStatus = [];

        questItems.forEach((questItem) => {
            const istErledigt = questItem.style.display === "none";
            questStatus.push({ erledigt: istErledigt });
        });

        localStorage.setItem(`${currentUser}_questStatus`, JSON.stringify(questStatus));
    }
}

// XP-Anzeige und Level-Up überprüfen
function aktualisiereXPAnzeige() {
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
    const xpFürLevelUp = level <= 10 ? 100 : 200 + ((Math.floor((level - 1) / 10)) * 100);

    while (xp >= xpFürLevelUp) {
        xp -= xpFürLevelUp;
        level++;
        aktualisiereXPAnzeige();
        zeigeLevelUpAnimation();
    }
}

// Level-Up Animation mit Video im Vollbildmodus und zeitgesteuerter Entfernung
function zeigeLevelUpAnimation() {
    const videoContainer = document.createElement('div');
    videoContainer.id = 'level-up-video-container';
    videoContainer.style.position = 'fixed';
    videoContainer.style.top = '0';
    videoContainer.style.left = '0';
    videoContainer.style.width = '100%';
    videoContainer.style.height = '100%';
    videoContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Schwarzer, leicht transparenter Hintergrund
    videoContainer.style.zIndex = '500'; // Sicherstellen, dass es über allem anderen angezeigt wird

    const video = document.createElement('video');
    video.src = 'avatars/lvlup.mp4';
    video.autoplay = true;
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'contain'; // Anpassung von 'cover' zu 'contain'
    
    videoContainer.appendChild(video);
    document.body.appendChild(videoContainer);

    // Das Video nach der angegebenen Zeit automatisch entfernen (z.B. nach 10 Sekunden)
    const videoEndeZeit = 10000; // Zeit in Millisekunden (10 Sekunden)
    setTimeout(() => {
        if (videoContainer && document.body.contains(videoContainer)) {
            video.pause(); // Das Video anhalten
            document.body.removeChild(videoContainer);
        }
    }, videoEndeZeit);
}

// Quests erledigen
function questErledigt(questNummer) {
    const quest = document.querySelector(`#quests li:nth-child(${questNummer})`);

    if (quest) {
        const xpWert = parseInt(quest.getAttribute("data-xp"), 10) || 10;
        xp += xpWert;
        aktualisiereXPAnzeige();
        überprüfeLevelAufstieg();
        speichereFortschritte(); // Verschiebe dies hierhin

        quest.style.display = "none"; // Quest ausblenden, wenn erledigt
        speichereGlobalenQuestStatus();
    }
}

// Questbuch anzeigen
function zeigeQuestbook() {
    ladeQuests();
    if (currentUser) {
        aktualisiereXPAnzeige();
    }
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
    }
}

// Neue Quest erstellen
function neueQuestErstellen() {
    const questBeschreibung = prompt("Gib die Beschreibung der neuen Quest ein:");
    const questXP = parseInt(prompt("Gib die XP für diese Quest ein:"), 10);

    if (questBeschreibung && !isNaN(questXP)) {
        const quests = JSON.parse(localStorage.getItem("quests")) || [];
        quests.push({ beschreibung: questBeschreibung, xp: questXP, erledigt: false });
        localStorage.setItem("quests", JSON.stringify(quests));
        ladeQuests();
    } else {
        alert("Ungültige Eingabe. Bitte versuche es erneut.");
    }
}

function ladeQuests() {
    const gespeicherteQuests = JSON.parse(localStorage.getItem(`${currentUser}_quests`)) || [
        { beschreibung: "Hausarbeit machen", xp: 10, erledigt: false },
        { beschreibung: "Einkaufen gehen", xp: 20, erledigt: false },
        { beschreibung: "Joggen", xp: 15, erledigt: false }
    ];

    const questList = document.getElementById("quests");
    questList.innerHTML = ""; // Liste der Quests zurücksetzen

    gespeicherteQuests.forEach((quest, index) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <span class="quest-text" style="text-decoration: ${quest.erledigt ? 'line-through' : 'none'};"><strong>Quest ${index + 1}:</strong> ${quest.beschreibung}</span>
            <button onclick="questErledigt(${index})" ${quest.erledigt ? 'disabled' : ''}>Erledigt</button>
        `;
        listItem.setAttribute("data-xp", quest.xp);
        questList.appendChild(listItem);
    });

    if (isAdmin) {
        zeigeAdminFunktionen();
    }
}

// Quest erledigt markieren
function questErledigt(questNummer) {
    const quests = JSON.parse(localStorage.getItem(`${currentUser}_quests`)) || [];
    if (quests[questNummer]) {
        quests[questNummer].erledigt = true; // Markiere als erledigt
        xp += parseInt(quests[questNummer].xp, 10); // XP hinzufügen
        aktualisiereXPAnzeige(); // XP-Anzeige aktualisieren
        überprüfeLevelAufstieg(); // Levelaufstieg überprüfen
        localStorage.setItem(`${currentUser}_quests`, JSON.stringify(quests)); // Speichern in localStorage
        ladeQuests(); // Quests neu laden, damit der Status aktualisiert wird
    }
}

// Quests zurücksetzen
function questsZuruecksetzen() {
    if (confirm("Möchtest du wirklich alle Quests zurücksetzen?")) {
        localStorage.removeItem("quests");
        console.log("Alle Quests wurden zurückgesetzt.");
        ladeQuests();
    }
}

// Funktion zum Bearbeiten von Quests
function questBearbeiten(questNummer) {
    const quests = JSON.parse(localStorage.getItem("quests")) || [];
    if (quests[questNummer - 1]) {
        const neueBeschreibung = prompt("Neue Beschreibung der Quest:", quests[questNummer - 1].beschreibung);
        const neueXP = parseInt(prompt("Neue XP für diese Quest:", quests[questNummer - 1].xp), 10);

        if (neueBeschreibung && !isNaN(neueXP)) {
            quests[questNummer - 1].beschreibung = neueBeschreibung;
            quests[questNummer - 1].xp = neueXP;
            localStorage.setItem("quests", JSON.stringify(quests));
            ladeQuests();
        } else {
            alert("Ungültige Eingabe. Bitte versuche es erneut.");
        }
    }
}
