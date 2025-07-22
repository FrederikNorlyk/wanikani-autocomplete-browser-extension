let apiKey;
let answers;
let match;
let tooltipTimeout;

createTooltip();

chrome.storage.local.get("wanikani_api_key", (data) => {
    if (data.wanikani_api_key) {
        apiKey = data.wanikani_api_key;
    } else {
        apiKey = prompt("Please specify an API token.")
        chrome.storage.local.set({ wanikani_api_key: apiKey });
    }

    if (!apiKey) {
        console.warn("No API key found.");
        return;
    }

    fetchAnswers();
});

document.addEventListener("keydown", (e) => {

    const ignoredKeys = [
        "Control", "Shift", "Alt", "AltGraph", "Meta",
        "CapsLock", "Fn", "FnLock",
        "NumLock", "ScrollLock", "Pause",
        "Insert", "PrintScreen", "ContextMenu",
        "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
        "PageUp", "PageDown", "Home", "End",
    ];

    if (ignoredKeys.includes(e.key)) {
        return;
    }

    removeTooltip();
    clearTimeout(tooltipTimeout);

    // Only do autocomplete for English answers
    if (getInputLanguage() === "ja") {
        return;
    }

    if (e.key === "Tab") {
        e.preventDefault(); // prevent actual tab

        if (!match) {
            console.warn("No match found")
            return;
        }

        setInputValue(match);
        match = undefined;

        return;
    } else if (e.key === "Escape" || e.key === "Enter") {
        match = undefined;
        return;
    }

    tooltipTimeout = setTimeout(() => {
        const value = getInputValue();

        if (!value) {
            console.warn("No value found in user response input field")
            return;
        }

        match = answers.find(s => s.startsWith(value));

        if (match) {
            showTooltip(match);
        } else {
            console.log(`No match found for value: '${value}'`)
        }
    }, 200);
});

function getInput() {
     return document.querySelector("#user-response");
}

function getInputValue() {
    const input = getInput();

    if (!input) {
        console.error("Could not find user response input field")
        return undefined;
    }

    return input.value.toLocaleLowerCase();
}

function setInputValue(value) {
    const input = getInput();

    if (!input) {
        console.error("Could not find user response input field")
        return;
    }

    input.value = value;
}

function getInputLanguage() {
    const input = getInput();

    if (!input) {
        console.error("Could not find user response input field")
        return undefined;
    }

    return input.lang;
}

function createTooltip() {
    const tooltip = document.createElement("div");
    tooltip.className = "wanikani-autocomplete-tooltip";
    document.body.appendChild(tooltip);
}

function getTooltip() {
    let tooltip = document.querySelector(".wanikani-autocomplete-tooltip");

    if (!tooltip) {
        throw Error("Could not find tooltip");
    }

    return tooltip;
}

function showTooltip(message) {
    const input = getInput();

    if (!input) {
        console.error("Could not find user response input");
        return;
    }

    const tooltip = getTooltip();
    tooltip.textContent = message;

    const rect = input.getBoundingClientRect();
    tooltip.style.top = `${rect.top + window.scrollY}px`;

    let x = window.innerWidth / 2;
    x += input.value.length * 7;
    tooltip.style.left = `${x}px`;

    tooltip.classList.add("show");
}

function removeTooltip() {
    getTooltip().classList.remove("show");
}

async function fetchAnswers() {
    chrome.runtime.sendMessage({type: "get_synonyms"}, (res) => {
        if (res.success) {
            answers = res.synonyms;
            return res.synonyms;
        } else {
            console.error("Error:", res.error);
            return [];
        }
    });
}
