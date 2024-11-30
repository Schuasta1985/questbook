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
        ladeGlobalenQuestStatus();
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
    return "https://via.placeholder.com/100?text=Avatar"; // Platzhalter-Avatar
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

// Quest-Status laden
function ladeGlobalenQuestStatus() {
    const gespeicherterQuestStatus = localStorage.getItem("globalQuestStatus");
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

// Speichern des globalen Quest-Status
function speichereGlobalenQuestStatus() {
    const questItems = document.querySelectorAll("#quests li");
    const questStatus = [];

    questItems.forEach(questItem => {
        const istErledigt = questItem.style.textDecoration === "line-through";
        questStatus.push(istErledigt);
    });

    localStorage.setItem("globalQuestStatus", JSON.stringify(questStatus));
}

// XP-Anzeige und Level-Up überprüfen
function aktualisiereXPAnzeige() {
    const levelElement = document.getElementById('level-display');
    const xpProgressElement = document.getElementById('xp-progress');

    if (levelElement) {
        levelElement.textContent = level;
    }

    if (xpProgressElement) {
        const xpFürLevelUp = level <= 10 ? 100 : 200 + ((Math.floor((level - 1) / 10)) * 100);
        const progress = Math.min((xp / xpFürLevelUp) * 100, 100);
        xpProgressElement.style.width = `${progress}%`;

        const fehlendeXP = xpFürLevelUp - xp;
        xpProgressElement.textContent = `Noch ${fehlendeXP} XP bis zum nächsten Level-Up`;
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

// Level-Up Animation
function zeigeLevelUpAnimation() {
    const canvas = document.getElementById('level-up-canvas');
    if (!canvas) {
        console.error("Canvas für Level-Up-Animation nicht gefunden.");
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Canvas-Kontext nicht verfügbar.");
        return;
    }

    // Bildschirm Schwarz machen
    document.body.style.backgroundColor = 'black';
    setTimeout(() => {
        document.body.style.backgroundColor = '';
    }, 3000);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let progress = 0;
    const maxProgress = 100;
    let fireworks = [];

    function createFirework(x, y) {
        const particles = [];
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: x,
                y: y,
                radius: Math.random() * 5 + 2,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                angle: Math.random() * 2 * Math.PI,
                speed: Math.random() * 5 + 2,
                life: Math.random() * 50 + 50
            });
        }
        return particles;
    }

    function drawFireworks() {
        for (let i = fireworks.length - 1; i >= 0; i--) {
            const p = fireworks[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed;
            p.life--;
            if (p.life <= 0) {
                fireworks.splice(i, 1);
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (progress < maxProgress) {
            progress += 1;
            requestAnimationFrame(animate);
        } else {
            if (fireworks.length === 0) {
                fireworks = createFirework(canvas.width / 2, canvas.height / 2);
            }
            drawFireworks();
            if (fireworks.length === 0) {
                showLevelUp();
            } else {
                requestAnimationFrame(animate);
            }
        }
    }

    function showLevelUp() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "100px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`Level ${level}`, canvas.width / 2, canvas.height / 2);
        setTimeout(() => {
            canvas.style.display = 'none';  // Das Canvas wird ausgeblendet, nachdem die Level-Up-Anzeige angezeigt wurde
        }, 2000);
    }

    canvas.style.display = 'block';
    animate();
}

// Quests erledigen
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
        speichereGlobalenQuestStatus(); // Speichern, damit die Quest auch beim erneuten Einloggen als erledigt markiert bleibt
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

// Questbuch anzeigen ohne Überschreiben des gesamten Body-Inhalts
function zeigeQuestbook() {
    const questContainer = document.getElementById("quests");
    if (questContainer) {
        questContainer.innerHTML = ''; // Vorhandene Quests löschen
        ladeQuests(); // Quests laden
    }

    const levelElement = document.getElementById("level-display");
    const xpProgressElement = document.getElementById("xp-progress");

    if (levelElement && xpProgressElement) {
        aktualisiereXPAnzeige();
    }

    // Zeige Admin Funktionen falls nötig
    if (isAdmin) {
        zeigeAdminFunktionen();
    }
}

// Admin Login
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
            deleteButton.textContent = "Alle Quests zurücksetzen";
            deleteButton.id = "deleteQuestsButton";
            deleteButton.onclick = questsZuruecksetzen;

            // Füge die Schaltflächen zum Container hinzu
            adminButtonsContainer.appendChild(createButton);
            adminButtonsContainer.appendChild(deleteButton);

            // Füge den Container zum Quests-Bereich hinzu
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
        quests.push({ beschreibung: questBeschreibung, xp: questXP });
        localStorage.setItem("quests", JSON.stringify(quests));
        ladeQuests();
    } else {
        alert("Ungültige Eingabe. Bitte versuche es erneut.");
    }
}

// Quests zurücksetzen
function questsZuruecksetzen() {
    if (confirm("Möchtest du wirklich alle Quests zurücksetzen?")) {
        const questList = document.getElementById("quests");
        questList.innerHTML = ""; // Alle Quests aus der UI löschen

        // Speicher löschen
        localStorage.removeItem("globalQuestStatus");
        console.log("Alle Quests wurden zurückgesetzt.");
        ladeQuests(); // Quests neu laden
    }
}
