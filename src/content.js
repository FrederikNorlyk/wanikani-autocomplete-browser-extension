let apiKey;
let answers;
let match;
let tooltipTimeout;

createTooltip();

chrome.storage.local.get("wanikani_api_key", (data) => {
    if (data.wanikani_api_key) {
        apiKey = data.wanikani_api_key;
        console.log("Loaded API key.");
    } else {
        apiKey = prompt("Please specify an API token.")
        chrome.storage.local.set({ wanikani_api_key: apiKey });
    }

    if (!apiKey) {
        console.log("No API key found.");
        return;
    }

    fetchSynonyms();
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

    const input = document.querySelector("#user-response");

    // Only do autocomplete for English answers
    if (input && input.lang === "ja") {
        return;
    }

    if (e.key === "Tab") {
        e.preventDefault(); // prevent actual tab

        removeTooltip();

        if (match && input) {
            input.value = match;
            match = undefined;
        }

        return;
    } else if (e.key === "Escape" || e.key === "Enter") {
        removeTooltip();
        match = undefined;
        return;
    }

    match = undefined;
    removeTooltip();
    clearTimeout(tooltipTimeout);

    tooltipTimeout = setTimeout(() => {
        const target = document.querySelector("#user-response");

        if (!target) {
            console.error("Could not find user response input field")
            return;
        }

        const value = target.value.toLocaleLowerCase();

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
    }, 300);
});

function createTooltip() {
    const tooltip = document.createElement("div");
    tooltip.className = "wanikani-autocomplete-tooltip";
    document.body.appendChild(tooltip);
}

function showTooltip(message) {
    const input = document.querySelector("#user-response");

    if (!input) {
        console.error("Could not find user response input");
        return;
    }

    const tooltip = document.querySelector(".wanikani-autocomplete-tooltip");

    if (!tooltip) {
        console.error("Coult not find tooltip");
        return
    }

    tooltip.textContent = message;

    const rect = input.getBoundingClientRect();
    tooltip.style.top = `${rect.top + window.scrollY}px`;

    let x = window.innerWidth / 2;
    x += input.value.length * 7;
    tooltip.style.left = `${x}px`;

    tooltip.classList.add("show");
}

function removeTooltip() {
    document.querySelector(".wanikani-autocomplete-tooltip")?.classList.remove("show");
}

async function fetchSynonyms() {
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
