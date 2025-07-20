chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "get_synonyms") {
        chrome.storage.local.get("wanikani_api_key", async ({ wanikani_api_key }) => {
            let url = "https://api.wanikani.com/v2/study_materials";
            let allSynonyms = [];

            try {
                while (url) {
                    const res = await fetch(url, {
                        headers: {
                            "Authorization": `Bearer ${wanikani_api_key}`
                        }
                    });

                    if (!res.ok) {
                        let errorText = await res.text();
                        errorText += ` api key: ${wanikani_api_key}`;
                        sendResponse({ success: false, error: `HTTP ${res.status}: ${errorText}` });
                        return;
                    }

                    const json = await res.json();

                    if (!json.data) {
                        sendResponse({ success: false, error: "No data found in response: " + json });
                        return;
                    }

                    allSynonyms.push(...json.data.flatMap(d => d.data.meaning_synonyms));
                    url = json.pages?.next_url;
                }

                sendResponse({ success: true, synonyms: allSynonyms });
            } catch (e) {
                sendResponse({ success: false, error: e.toString() });
            }
        });

        return true; // Keep message channel open for async
    }
});
