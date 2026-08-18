import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
    ASSUMPTIONS,
    calculateAge,
    calculateKeysLeft,
    createShareText,
    createShareUrl,
    deriveCounts,
    getInitialValues,
    validateInputs
} from "../public/scripts/keysleft.js";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

test("calculates the original reference scenario", () => {
    const result = calculateKeysLeft(39, 60);

    assert.equal(result.yearsLeft, 51);
    assert.equal(result.keystrokesLeft, 176256000);
    assert.equal(result.postsLeft, 629485);
    assert.equal(result.emailsLeft, 35251);
    assert.equal(result.loveLettersLeft, 17625);
    assert.equal(result.novelsLeft, 58);
    assert.equal(result.programsLeft, 352);
    assert.ok(result.charactersPerSecond > 0);
});

test("validates age and typing speed boundaries", () => {
    assert.equal(validateInputs(1, 1).valid, true);
    assert.equal(validateInputs(89, 1000).valid, true);
    assert.equal(validateInputs(0, 60).valid, false);
    assert.equal(validateInputs(90, 60).valid, false);
    assert.equal(validateInputs(39, 0).valid, false);
    assert.equal(validateInputs(39, 1001).valid, false);
    assert.equal(validateInputs("39.5", "60").valid, false);
    assert.throws(() => calculateKeysLeft("<script>", 60), RangeError);
});

test("never derives negative counts", () => {
    assert.deepEqual(deriveCounts(-100), {
        keystrokesLeft: 0,
        postsLeft: 0,
        emailsLeft: 0,
        loveLettersLeft: 0,
        novelsLeft: 0,
        programsLeft: 0
    });
    assert.throws(() => deriveCounts(Number.NaN), TypeError);
});

test("calculates age from a strict ISO date", () => {
    const today = new Date(2026, 7, 18);

    assert.equal(calculateAge("1980-08-18", today), 46);
    assert.equal(calculateAge("1980-08-19", today), 45);
    assert.equal(calculateAge("2024-02-30", today), null);
    assert.equal(calculateAge("08/18/1980", today), null);
    assert.equal(calculateAge("2027-01-01", today), null);
});

test("reads safe initial values from query parameters", () => {
    const today = new Date(2026, 7, 18);

    assert.deepEqual(
        getInitialValues("https://keysleft.com/?age=39&wpm=60", today),
        { age: 39, wpm: 60 }
    );
    assert.deepEqual(
        getInitialValues("https://keysleft.com/?dob=1980-08-18&wpm=60", today),
        { age: 46, wpm: 60 }
    );
    assert.deepEqual(
        getInitialValues("https://keysleft.com/?age=%3Cscript%3E&wpm=fast", today),
        { age: null, wpm: null }
    );
});

test("creates a canonical share URL", () => {
    const result = createShareUrl("https://keysleft.com/path?old=value#fragment", 39, 60);
    assert.equal(result, "https://keysleft.com/path?age=39&wpm=60");
});

test("creates platform-neutral share text", () => {
    const shareUrl = "https://keysleft.com/?age=39&wpm=60";
    const result = createShareText(shareUrl, 123456);

    assert.equal(
        result,
        `I have only 123,456 keystrokes left before I die. How many do you have left? ${shareUrl}`
    );
    assert.throws(() => createShareText("javascript:alert(1)", 123456), TypeError);
});

test("keeps the assumptions internally consistent", () => {
    assert.equal(ASSUMPTIONS.postLength, 280);
    assert.equal(ASSUMPTIONS.lifespan, 90);
    assert.equal(ASSUMPTIONS.averageWordLength, 5);
});

test("publishes only the dependency-free site", async () => {
    const publicDirectory = join(repositoryRoot, "public");
    const entries = await readdir(publicDirectory, { recursive: true });
    const files = entries
        .map((entry) => entry.replaceAll("\\", "/"))
        .filter((entry) => entry.includes("."))
        .sort();

    assert.deepEqual(files, [
        "content/site.css",
        "favicon.svg",
        "index.html",
        "scripts/app.js",
        "scripts/keysleft.js",
        "staticwebapp.config.json"
    ]);

    const html = await readFile(join(publicDirectory, "index.html"), "utf8");
    const app = await readFile(join(publicDirectory, "scripts", "app.js"), "utf8");
    const calculator = await readFile(join(publicDirectory, "scripts", "keysleft.js"), "utf8");
    const publicSource = `${html}\n${app}\n${calculator}`;

    assert.doesNotMatch(html, /https?:\/\/[^"]+\.(?:css|js)/i);
    assert.doesNotMatch(html, /jquery|knockout|bootstrap|qunit|tailwind|cookieconsent|google-analytics/i);
    assert.doesNotMatch(html, /<script(?![^>]+\bsrc=)/i);
    assert.doesNotMatch(html, /style\s*=/i);
    assert.doesNotMatch(publicSource, /x\.com|twitter\.com|tweet/i);
    assert.ok(
        html.indexOf('class="breakdown"') < html.indexOf('class="card-grid share-grid"'),
        "Sharing controls should follow the result explanation."
    );
});

test("enforces restrictive production security headers", async () => {
    const configText = await readFile(
        join(repositoryRoot, "public", "staticwebapp.config.json"),
        "utf8"
    );
    const config = JSON.parse(configText);
    const policy = config.globalHeaders["Content-Security-Policy"];

    assert.match(policy, /default-src 'self'/);
    assert.match(policy, /script-src 'self'/);
    assert.match(policy, /style-src 'self'/);
    assert.match(policy, /frame-ancestors 'none'/);
    assert.doesNotMatch(policy, /unsafe-inline|unsafe-eval/);
    assert.equal(config.globalHeaders["X-Content-Type-Options"], "nosniff");
    assert.equal(config.globalHeaders["X-Frame-Options"], "DENY");
});
