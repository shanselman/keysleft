export const LIMITS = Object.freeze({
    minimumAge: 1,
    maximumAge: 89,
    minimumWpm: 1,
    maximumWpm: 1000
});

export const ASSUMPTIONS = Object.freeze({
    lifespan: 90,
    hoursTypingPerDay: 4,
    averageWordLength: 5,
    workingWeeksPerYear: 48,
    postLength: 280,
    emailLengthInWords: 1000,
    loveLetterLengthInWords: 2000,
    novelLengthInWords: 600000,
    programSizeInKeystrokes: 500000,
    secondsPerYear: 31557600
});

function parseInteger(value) {
    if (typeof value === "string" && value.trim() === "") {
        return Number.NaN;
    }

    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : Number.NaN;
}

export function validateInputs(ageValue, wpmValue) {
    const age = parseInteger(ageValue);
    const wpm = parseInteger(wpmValue);
    const errors = [];

    if (!Number.isInteger(age) || age < LIMITS.minimumAge || age > LIMITS.maximumAge) {
        errors.push(`Age must be a whole number from ${LIMITS.minimumAge} to ${LIMITS.maximumAge}.`);
    }

    if (!Number.isInteger(wpm) || wpm < LIMITS.minimumWpm || wpm > LIMITS.maximumWpm) {
        errors.push(`Typing speed must be a whole number from ${LIMITS.minimumWpm} to ${LIMITS.maximumWpm} WPM.`);
    }

    return Object.freeze({
        valid: errors.length === 0,
        errors: Object.freeze(errors),
        age,
        wpm
    });
}

export function deriveCounts(keystrokes) {
    const numericKeystrokes = Number(keystrokes);
    if (!Number.isFinite(numericKeystrokes)) {
        throw new TypeError("Keystroke count must be a finite number.");
    }

    const remaining = Math.max(0, Math.floor(numericKeystrokes));
    const charactersPerEmail = ASSUMPTIONS.emailLengthInWords * ASSUMPTIONS.averageWordLength;
    const charactersPerLoveLetter = ASSUMPTIONS.loveLetterLengthInWords * ASSUMPTIONS.averageWordLength;
    const charactersPerNovel = ASSUMPTIONS.novelLengthInWords * ASSUMPTIONS.averageWordLength;

    return Object.freeze({
        keystrokesLeft: remaining,
        postsLeft: Math.floor(remaining / ASSUMPTIONS.postLength),
        emailsLeft: Math.floor(remaining / charactersPerEmail),
        loveLettersLeft: Math.floor(remaining / charactersPerLoveLetter),
        novelsLeft: Math.floor(remaining / charactersPerNovel),
        programsLeft: Math.floor(remaining / ASSUMPTIONS.programSizeInKeystrokes)
    });
}

export function calculateKeysLeft(ageValue, wpmValue) {
    const validation = validateInputs(ageValue, wpmValue);
    if (!validation.valid) {
        throw new RangeError(validation.errors.join(" "));
    }

    const yearsLeft = ASSUMPTIONS.lifespan - validation.age;
    const keystrokes = yearsLeft
        * ASSUMPTIONS.workingWeeksPerYear
        * ASSUMPTIONS.hoursTypingPerDay
        * 60
        * validation.wpm
        * ASSUMPTIONS.averageWordLength;
    const secondsLeft = ASSUMPTIONS.secondsPerYear * yearsLeft;

    return Object.freeze({
        age: validation.age,
        wpm: validation.wpm,
        yearsLeft,
        charactersPerSecond: secondsLeft > 0 ? keystrokes / secondsLeft : 0,
        ...deriveCounts(keystrokes)
    });
}

export function calculateAge(dateOfBirth, today = new Date()) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOfBirth ?? "");
    if (!match || !(today instanceof Date) || Number.isNaN(today.getTime())) {
        return null;
    }

    const [, yearText, monthText, dayText] = match;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const birthDate = new Date(year, month - 1, day);

    if (
        birthDate.getFullYear() !== year
        || birthDate.getMonth() !== month - 1
        || birthDate.getDate() !== day
        || birthDate > today
    ) {
        return null;
    }

    let age = today.getFullYear() - year;
    const birthdayHasPassed = today.getMonth() > month - 1
        || (today.getMonth() === month - 1 && today.getDate() >= day);

    if (!birthdayHasPassed) {
        age -= 1;
    }

    return age;
}

export function getInitialValues(url, today = new Date()) {
    const parsedUrl = new URL(url);
    const ageFromQuery = parsedUrl.searchParams.get("age");
    const dobFromQuery = parsedUrl.searchParams.get("dob");
    const wpmFromQuery = parsedUrl.searchParams.get("wpm");
    const calculatedAge = ageFromQuery === null && dobFromQuery !== null
        ? calculateAge(dobFromQuery, today)
        : ageFromQuery;
    const validation = validateInputs(calculatedAge, wpmFromQuery);

    return Object.freeze({
        age: Number.isInteger(validation.age)
            && validation.age >= LIMITS.minimumAge
            && validation.age <= LIMITS.maximumAge
            ? validation.age
            : null,
        wpm: Number.isInteger(validation.wpm)
            && validation.wpm >= LIMITS.minimumWpm
            && validation.wpm <= LIMITS.maximumWpm
            ? validation.wpm
            : null
    });
}

export function createShareUrl(currentUrl, age, wpm) {
    const validation = validateInputs(age, wpm);
    if (!validation.valid) {
        throw new RangeError(validation.errors.join(" "));
    }

    const shareUrl = new URL(currentUrl);
    shareUrl.search = "";
    shareUrl.hash = "";
    shareUrl.searchParams.set("age", String(validation.age));
    shareUrl.searchParams.set("wpm", String(validation.wpm));
    return shareUrl.toString();
}

export function createShareText(shareUrl, keystrokesLeft) {
    const count = Math.max(0, Math.floor(Number(keystrokesLeft)));
    if (!Number.isFinite(count)) {
        throw new TypeError("Keystroke count must be a finite number.");
    }

    const parsedShareUrl = new URL(shareUrl);
    if (parsedShareUrl.protocol !== "https:" && parsedShareUrl.protocol !== "http:") {
        throw new TypeError("Share URL must use HTTP or HTTPS.");
    }

    return `I have only ${count.toLocaleString("en-US")} keystrokes left before I die. How many do you have left? ${parsedShareUrl}`;
}