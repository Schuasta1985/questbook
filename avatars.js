export function zeigeAvatar(user) {
    const avatars = {
        "Thomas": "avatars/thomas.mp4",
        "Elke": "avatars/elke.mp4",
        "Jamie": "avatars/jamie.mp4"
    };
    const avatarSrc = avatars[user] || "https://via.placeholder.com/100";
    console.log(`Avatar für ${user} geladen: ${avatarSrc}`);
    return avatarSrc;
}
