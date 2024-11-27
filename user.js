export function benutzerAnmeldung(users, currentUser) {
    const username = document.getElementById('benutzerDropdown').value;
    const password = document.getElementById('benutzerPasswort').value;

    if (username in users && password === users[username].password) {
        console.log(`User ${username} logged in.`);
        currentUser = username;
        return currentUser;
    } else {
        alert("Ungültige Anmeldedaten!");
        return null;
    }
}