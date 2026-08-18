import {
    ASSUMPTIONS,
    calculateKeysLeft,
    createShareText,
    createShareUrl,
    deriveCounts,
    getInitialValues,
    validateInputs
} from "./keysleft.js";

const THEMES = Object.freeze([
    Object.freeze({ name: "dark", icon: "\u263e", label: "Switch to light theme" }),
    Object.freeze({ name: "light", icon: "\u2600", label: "Switch to retro theme" }),
    Object.freeze({ name: "geocities", icon: "\u2606", label: "Switch to dark theme" })
]);
const THEME_STORAGE_KEY = "keysleft-theme";
const numberFormatter = new Intl.NumberFormat();

function requireElement(id) {
    const element = document.getElementById(id);
    if (element === null) {
        throw new Error(`Required element #${id} was not found.`);
    }
    return element;
}

const form = requireElement("calculator-form");
const ageInput = requireElement("age");
const wpmInput = requireElement("wpm");
const errorMessage = requireElement("form-error");
const results = requireElement("results");
const resultsHeading = requireElement("results-heading");
const socialShareText = requireElement("social-share-text");
const copyShareButton = requireElement("copy-share-text");
const copyStatus = requireElement("copy-status");
const signatureLink = requireElement("signature-link");
const themeButton = requireElement("theme-toggle");
const themeIcon = requireElement("theme-icon");

const outputElements = Object.freeze({
    yearsLeft: requireElement("years-left"),
    keystrokesLeft: requireElement("keystrokes-left"),
    postsLeft: requireElement("posts-left"),
    emailsLeft: requireElement("emails-left"),
    loveLettersLeft: requireElement("love-letters-left"),
    novelsLeft: requireElement("novels-left"),
    programsLeft: requireElement("programs-left")
});

let countdownId = null;
let hasCalculated = false;

function isExpectedStorageError(error) {
    return error instanceof DOMException
        && (error.name === "SecurityError" || error.name === "QuotaExceededError");
}

function readStoredTheme() {
    try {
        return window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch (error) {
        if (!isExpectedStorageError(error)) {
            throw error;
        }
        return null;
    }
}

function storeTheme(theme) {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
        if (!isExpectedStorageError(error)) {
            throw error;
        }
    }
}

function getThemeIndex() {
    const currentTheme = document.documentElement.dataset.theme;
    const index = THEMES.findIndex((theme) => theme.name === currentTheme);
    return index >= 0 ? index : 0;
}

function applyTheme(themeName) {
    const index = THEMES.findIndex((theme) => theme.name === themeName);
    const safeIndex = index >= 0 ? index : 0;
    const theme = THEMES[safeIndex];

    document.documentElement.dataset.theme = theme.name;
    themeIcon.textContent = theme.icon;
    themeButton.setAttribute("aria-label", theme.label);
}

function initializeTheme() {
    const storedTheme = readStoredTheme();
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    const initialTheme = THEMES.some((theme) => theme.name === storedTheme)
        ? storedTheme
        : prefersLight ? "light" : "dark";

    applyTheme(initialTheme);
}

function renderCounts(counts) {
    for (const [name, element] of Object.entries(outputElements)) {
        element.textContent = numberFormatter.format(counts[name]);
    }
}

function stopCountdown() {
    if (countdownId !== null) {
        window.clearInterval(countdownId);
        countdownId = null;
    }
}

function startCountdown(calculation) {
    stopCountdown();
    const startedAt = performance.now();

    countdownId = window.setInterval(() => {
        const elapsedSeconds = (performance.now() - startedAt) / 1000;
        const remaining = calculation.keystrokesLeft
            - (elapsedSeconds * calculation.charactersPerSecond);
        renderCounts({
            yearsLeft: calculation.yearsLeft,
            ...deriveCounts(remaining)
        });
    }, 1000);
}

function showError(messages) {
    errorMessage.textContent = messages.join(" ");
    errorMessage.hidden = false;
    results.hidden = true;
    stopCountdown();
}

function calculateAndRender({ reportValidity }) {
    if (reportValidity && !form.reportValidity()) {
        return;
    }

    const validation = validateInputs(ageInput.value, wpmInput.value);
    if (!validation.valid) {
        showError(validation.errors);
        return;
    }

    const calculation = calculateKeysLeft(validation.age, validation.wpm);
    const shareUrl = createShareUrl(window.location.href, calculation.age, calculation.wpm);

    errorMessage.hidden = true;
    renderCounts(calculation);
    requireElement("lifespan").textContent = numberFormatter.format(ASSUMPTIONS.lifespan);
    requireElement("hours-typing").textContent = numberFormatter.format(ASSUMPTIONS.hoursTypingPerDay);
    requireElement("average-word-length").textContent = numberFormatter.format(ASSUMPTIONS.averageWordLength);
    socialShareText.value = createShareText(shareUrl, calculation.keystrokesLeft);
    copyStatus.textContent = "";
    signatureLink.href = shareUrl;
    results.hidden = false;
    hasCalculated = true;
    startCountdown(calculation);

    if (reportValidity) {
        resultsHeading.focus();
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculateAndRender({ reportValidity: true });
});

form.addEventListener("input", () => {
    if (hasCalculated) {
        calculateAndRender({ reportValidity: false });
    }
});

copyShareButton.addEventListener("click", async () => {
    socialShareText.focus();
    socialShareText.select();

    if (!window.isSecureContext || navigator.clipboard === undefined) {
        copyStatus.textContent = "The text is selected. Copy it using your browser or keyboard.";
        return;
    }

    try {
        await navigator.clipboard.writeText(socialShareText.value);
        copyStatus.textContent = "Copied. Paste it into any social media app.";
    } catch (error) {
        if (!(error instanceof DOMException)) {
            throw error;
        }
        copyStatus.textContent = "Copying was blocked. The text is selected so you can copy it manually.";
    }
});

themeButton.addEventListener("click", () => {
    const nextTheme = THEMES[(getThemeIndex() + 1) % THEMES.length];
    applyTheme(nextTheme.name);
    storeTheme(nextTheme.name);
});

initializeTheme();
requireElement("current-year").textContent = String(new Date().getFullYear());

const initialValues = getInitialValues(window.location.href);
if (initialValues.age !== null) {
    ageInput.value = String(initialValues.age);
}
if (initialValues.wpm !== null) {
    wpmInput.value = String(initialValues.wpm);
}
if (initialValues.age !== null && initialValues.wpm !== null) {
    calculateAndRender({ reportValidity: false });
}
