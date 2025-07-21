chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "get_synonyms") {
        chrome.storage.local.get("wanikani_api_key", async ({ wanikani_api_key: apiKey }) => {
            let url = "https://api.wanikani.com/v2/subjects";
            let allSynonyms = new Set();

            try {
                while (url) {
                    const response = await fetch(url, {
                        headers: {
                            "Authorization": `Bearer ${apiKey}`
                        }
                    });

                    if (!response.ok) {
                        let errorText = await response.text();
                        sendResponse({ success: false, error: `HTTP ${response.status}: ${errorText}` });
                        return;
                    }

                    const json = await response.json();

                    if (!json.data) {
                        sendResponse({ success: false, error: "No data found in response: " + json });
                        return;
                    }

                    for (const datum of json.data) {
                        for (const meaning of datum.data.meanings) {
                            allSynonyms.add(meaning.meaning.toLowerCase());
                        }

                        for (const meaning of datum.data.auxiliary_meanings) {
                            allSynonyms.add(meaning.meaning.toLowerCase());
                        }
                    }

                    url = json.pages?.next_url;
                }

                let synonyms = Array.from(allSynonyms).sort((a, b) => a.length - b.length);
                sendResponse({ success: true, synonyms: synonyms });
            } catch (e) {
                sendResponse({ success: false, error: e.toString() });
            }
        });

        return true;
    }
});
