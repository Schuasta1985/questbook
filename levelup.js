export let xp = 0;
export let level = 1;

export function zeigeLevelUpAnimation(newLevel) {
    console.log(`Level-Up! Neues Level: ${newLevel}`);
    // Hier könntest du eine Animation für den Level-Up implementieren.
}

export function aktualisiereXP(newXP) {
    xp += newXP;
    console.log(`Neue XP: ${xp}`);
    const xpForNextLevel = 100 + (level - 1) * 20;
    if (xp >= xpForNextLevel) {
        level++;
        xp -= xpForNextLevel;
        zeigeLevelUpAnimation(level);
    }
    return { xp, level };
}
