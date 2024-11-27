import { adminLogin, zeigeAdminFunktionen } from './admin.js';
import { benutzerAnmeldung } from './user.js';
import { questHinzufuegen, questEntfernen, questErledigt } from './quests.js';
import { aktualisiereXP } from './levelup.js';
import { zeigeAvatar } from './avatars.js';

const users = {
    "Thomas": { password: "passwort1" },
    "Elke": { password: "passwort2" },
    "Jamie": { password: "passwort3" }
};

let currentUser = null;

// App Initialisierung
document.addEventListener("DOMContentLoaded", () => {
    console.log("QuestBook App geladen.");

    // Benutzeranmeldung
    document.getElementById('loginButton').addEventListener('click', () => {
        currentUser = benutzerAnmeldung(users, currentUser);
        if (currentUser) {
            const avatarSrc = zeigeAvatar(currentUser);
            document.getElementById('avatar-container').innerHTML = `
                <img src="${avatarSrc}" alt="Avatar von ${currentUser}" style="width: 100px; border-radius: 50%;">
            `;
            console.log(`Benutzer ${currentUser} angemeldet.`);
        }
    });

    // Admin-Login
    document.getElementById('adminLoginButton').addEventListener('click', () => {
        if (adminLogin()) {
            zeigeAdminFunktionen();
            console.log("Admin angemeldet.");
        }
    });

    // Quests hinzufügen
    document.getElementById('addQuestButton').addEventListener('click', () => {
        const description = prompt("Beschreibung der neuen Quest eingeben:");
        const xpValue = parseInt(prompt("XP-Wert der Quest eingeben:"), 10);
        if (description && xpValue) {
            questHinzufuegen(description, xpValue);
        }
    });

    // Quests entfernen
    document.getElementById('removeQuestButton').addEventListener('click', () => {
        questEntfernen();
    });

    // Quest abschließen
    document.getElementById('quests').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const index = Array.from(e.target.parentNode.parentNode.children).indexOf(e.target.parentNode);
            const xpGained = questErledigt(index);
            const { xp, level } = aktualisiereXP(xpGained);
            console.log(`XP: ${xp}, Level: ${level}`);
        }
    });
});
