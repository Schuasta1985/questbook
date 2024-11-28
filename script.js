// Globale Variablen für XP, Level und Benutzerstatus
let xp = 0;  // Nur EINMAL deklarieren
let level = 1;
let currentUser = null;
let isAdmin = false; // Admin Login Status

// Fortschritte beim Laden der Seite wiederherstellen
window.onload = function () {
    zeigeStartseite(); // Aufruf der Funktion für die Startseite
};

// Startseite anzeigen
function zeigeStartseite() {
    document.body.innerHTML = `
        <div id="startseite">
            <h1>Willkommen im Questbook</h1>
            <div>
                <label for="benutzerDropdown">Benutzer auswählen:</label>
                <select id="benutzerDropdown">
                    <option value="">-- Bitte wählen --</option>
                    <option value="Thomas">Thomas</option>
                    <option value="Elke">Elke</option>
                    <option value="Jamie">Jamie</option>
                </select>
                <input type="password" id="benutzerPasswort" placeholder="Passwort eingeben">
                <button onclick="benutzerAnmeldung()">Anmelden</button>
            </div>
            <div>
                <h2>Admin Login</h2>
                <input type="text" id="adminBenutzername" placeholder="Admin Benutzername">
                <input type="password" id="adminPasswort" placeholder="Admin Passwort">
                <button onclick="adminLogin()">Admin Anmelden</button>
            </div>
        </div>
    `;
}

// Level-Up-Animation
function zeigeLevelUpAnimation() {
    const canvas = document.getElementById('level-up-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let progress = 0;
    let explosionRadius = 0;
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

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(0.5, 'yellow');
        gradient.addColorStop(1, 'green');
        ctx.fillStyle = gradient;
        ctx.fillRect(100, canvas.height / 2 - 20, (progress / maxProgress) * (canvas.width - 200), 40);

        if (progress === maxProgress) {
            drawFireworks();
            if (fireworks.length === 0) {
                fireworks = createFirework(canvas.width / 2, canvas.height / 2);
            }
            explosionRadius += 5;
            if (fireworks.length === 0) {
                showLevelUp();
                return;
            }
        }

        progress += 1;
        if (progress < maxProgress) {
            requestAnimationFrame(animate);
        } else {
            requestAnimationFrame(() => {
                drawFireworks();
                if (fireworks.length > 0) {
                    requestAnimationFrame(animate);
                }
            });
        }
    }

    function showLevelUp() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "100px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(`Level ${level}`, canvas.width / 2, canvas.height / 2);
        setTimeout(() => {
            canvas.style.display = 'none';
        }, 2000);
    }

    canvas.style.display = 'block';
    animate();
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
    } else {
        alert("Bitte wähle einen Benutzer und gib das richtige Passwort ein.");
    }
}

// Admin-Login
function adminLogin() {
    const username = document.getElementById("adminBenutzername").value;
    const password = document.getElementById("adminPasswort").value;

    if (username === "admin" && password === "1234") {
        alert("Admin erfolgreich eingeloggt!");
        isAdmin = true;
        zeigeQuestbook();
    } else {
        alert("Falsche Anmeldedaten!");
    }
}

// Questbuch anzeigen
function zeigeQuestbook() {
    document.body.innerHTML = `
        <div id="questbook">
            <h1>Questbook für ${currentUser ? currentUser : "Admin"}</h1>
            <ul id="quests">
                <!-- Quests werden hier dynamisch eingefügt -->
            </ul>
            <p>Level: <span id="level">${level}</span></p>
            <p>XP: <span id="xp">${xp}</span></p>
            <button onclick="ausloggen()">Ausloggen</button>
            
            <!-- Canvas für Level-Up Animation -->
            <canvas id="level-up-canvas" style="display: none; position: absolute; top: 0; left: 0;"></canvas>
        </div>
    `;

    // Quests laden
    ladeQuests();
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
    }
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
        const progress = (xp / xpFürLevelUp) * 100;
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
    localStorage.setItem(`${currentUser}_xp`, xp);
    localStorage.setItem(`${currentUser}_level`, level);
}

// Fortschritte laden
function ladeFortschritte() {
    const gespeicherteXP = localStorage.getItem(`${currentUser}_xp`);
    const gespeichertesLevel = localStorage.getItem(`${currentUser}_level`);

    if (gespeicherteXP !== null) {
        xp = parseInt(gespeicherteXP, 10);
    }

    if (gespeichertesLevel !== null) {
        level = parseInt(gespeichertesLevel, 10);
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
