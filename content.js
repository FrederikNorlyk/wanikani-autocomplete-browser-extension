let apiKey;
let answers;
let match;
let tooltipTimeout;

chrome.storage.local.get("wanikani_api_key", (data) => {
    if (data.wanikani_api_key) {
        apiKey = data.wanikani_api_key;
        console.log("Loaded API key.");
        fetchSynonyms();
    } else {
        console.error("No API key saved.")
    }
});

document.addEventListener("keydown", (e) => {

    if (e.key === "Tab") {
        e.preventDefault(); // prevent actual tab

        removeTooltip();

        const target = document.querySelector("#user-response");

        if (match && target) {
            target.value = match;
            match = undefined;
        }

        return;
    } else if (e.key === "Escape" || e.key === "Enter") {
        removeTooltip();
        match = undefined;
        return;
    }

    match = undefined;
    clearTimeout(tooltipTimeout);

    tooltipTimeout = setTimeout(() => {
        const target = document.querySelector("#user-response");

        if (!target) {
            console.error("Could not find user response input field")
            return;
        }

        const value = target.value.trim().toLocaleLowerCase();

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
    }, 1000);
});

function showTooltip(message) {
    removeTooltip();

    const target = document.querySelector("#user-response");

    if (!target) {
        console.error("Could not find user response input");
        return;
    }

    const tooltip = document.createElement("div");
    tooltip.className = "my-tooltip";
    tooltip.textContent = message;

    const rect = target.getBoundingClientRect();
    tooltip.style.top = `${rect.top + window.scrollY}px`;

    let x = window.innerWidth / 2;
    x += target.value.length * 7;
    tooltip.style.left = `${x}px`;

    document.body.appendChild(tooltip);
}

function removeTooltip() {
    document.querySelector(".my-tooltip")?.remove();
}

async function fetchSynonyms() {
    chrome.runtime.sendMessage({type: "get_synonyms"}, (res) => {
        if (res.success) {
            answers = res.synonyms.map(s => s.toLowerCase()).sort((a, b) => a.length - b.length);
            console.dir(answers.sort());
            return res.synonyms;
        } else {
            console.error("Error:", res.error);
            return [];
        }
    });
}
