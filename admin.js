export function adminLogin() {
    const username = document.getElementById('adminBenutzername').value;
    const password = document.getElementById('adminPasswort').value;

    if (username === "admin" && password === "1234") {
        console.log("Admin login successful.");
        return true;
    } else {
        alert("Falsche Anmeldedaten!");
        return false;
    }
}

export function zeigeAdminFunktionen() {
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
