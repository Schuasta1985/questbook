export let quests = [];

export function questHinzufuegen(description, xpValue) {
    quests.push({ description, xp: xpValue, completed: false });
    console.log(`Quest hinzugefügt: ${description}`);
}

export function questEntfernen() {
    if (quests.length > 0) {
        const removedQuest = quests.pop();
        console.log(`Quest entfernt: ${removedQuest.description}`);
    } else {
        console.log("Keine Quests zum Entfernen!");
    }
}

export function questErledigt(index) {
    if (quests[index]) {
        quests[index].completed = true;
        console.log(`Quest ${index + 1} erledigt.`);
        return quests[index].xp;
    } else {
        console.log("Ungültige Questnummer!");
        return 0;
    }
}
