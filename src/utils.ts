type NameParts = {
    firstName: string;
    middleName: string | null;
};

const namePrefixes = ['Mr.', 'Mrs.', 'Ms.', 'Miss.', 'Dr.'];
const nameSuffixes = ['Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];
const lastNamePrefixes = ['van', 'von', 'de', 'la', 'del', 'di', 'le', 'el'];

function getFirstAndMiddleName(fullName: string): NameParts {
    const nameParts = fullName.trim().split(/\s+/);

    // Remove prefixes and suffixes
    if (namePrefixes.includes(nameParts[0])) {
        nameParts.shift();
    }

    if (nameSuffixes.includes(nameParts[nameParts.length - 1])) {
        nameParts.pop();
    }

    // Check for compound last names with prefixes
    let endIndex = nameParts.length - 1;
    if (lastNamePrefixes.includes(nameParts[endIndex - 1].toLowerCase())) {
        endIndex--;
    }

    const firstName = nameParts[0];
    const middleName = endIndex > 1 ? nameParts.slice(1, endIndex).join(' ') : null;

    return { firstName, middleName };
}

export function getGivenName(fullName: string): string {
    const { firstName, middleName } = getFirstAndMiddleName(fullName);
    return firstName + (middleName != null ? ` ${middleName}` : '');
}


export function getRandomText(name: string): string {
    const messages = [
        "{name} har hoppet inn 🐇",
        "{name} er på plass 🚀",
        "{name} har ankommet 🚶‍♀️",
        "{name} har dukket opp 🌟",
        "{name} har kastet seg inn i miksen 🎧",
        "{name} er i spillet 🎮",
        "{name} har trådt inn i rommet 🚪",
        "{name} har landet 🛬",
        "{name} har sjekket inn 🏨",
        "{name} har entret scenen 🎭",
        "{name} har meldt seg på 📝",
        "{name} er med på laget ⚽",
        "{name} er med på festen 🥳",
        "{name} har tatt plass 🪑",
        "{name} har nådd målet 🎯",
        "{name} er i bygningen 🏢",
        "{name} har logget på 💻",
        "{name} har trykket play ▶️",
        "{name} er nå tilstede ✅",
        "{name} er nå online 💬",
        "{name} er klar for eventyr 🏕️",
        "{name} er med i teamet 🤝",
        "{name} har hoppet på 🚆",
        "{name} har registrert seg 📋",
        "{name} har koblet til 🌐",
        "{name} er tilkoblet 🔌",
        "{name} er nå på kursen 🧭",
        "{name} er med i løpet 🏃‍♂️",
        "{name} er på linjen 📞",
        "{name} har stemt i 🗳️",
        "{name} har hoppet på bølgen 🌊",
        "{name} har gått ombord 🚢",
        "{name} har tatt steget 🪜",
        "{name} er klar for avreise 🚀"
    ];
    const randomIndex = Math.floor(Math.random() * messages.length);
    const randomMessage = messages[randomIndex];
    return randomMessage.replace("{name}", name);
}
export function randomIntFromInterval(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}