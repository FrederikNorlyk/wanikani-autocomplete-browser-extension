document.addEventListener("DOMContentLoaded", () => {
    // Load existing API key
    chrome.storage.local.get("wanikani_api_key", (data) => {
        document.getElementById("apiKey").value = data.wanikani_api_key || "";
    });

    // Save API key when form is submitted
    document.getElementById("apiForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const key = document.getElementById("apiKey").value;
        chrome.storage.local.set({ wanikani_api_key: key }, () => {
            document.getElementById("status").textContent = "Saved!";
            setTimeout(() => document.getElementById("status").textContent = "", 2000);
        });
    });
});
