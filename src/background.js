chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "get_synonyms") {
    return;
  }

  chrome.storage.local.get(
    "wanikani_api_key",
    async ({ wanikani_api_key: apiKey }) => {
      let url = "https://api.wanikani.com/v2/subjects";
      let kanji = new Set();
      let vocabulary = new Set();

      try {
        while (url) {
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          });

          if (!response.ok) {
            let errorText = await response.text();
            sendResponse({
              success: false,
              error: `HTTP ${response.status}: ${errorText}`,
            });
            return;
          }

          const json = await response.json();

          if (!json.data) {
            sendResponse({
              success: false,
              error: "No data found in response: " + json,
            });
            return;
          }

          for (const datum of json.data) {
            const isVocabulary = datum.object === "vocabulary";
            const collection = isVocabulary ? vocabulary : kanji;

            for (const meaning of datum.data.meanings) {
              collection.add(meaning.meaning.toLowerCase());
            }

            for (const meaning of datum.data.auxiliary_meanings) {
              collection.add(meaning.meaning.toLowerCase());
            }
          }

          url = json.pages?.next_url;
        }

        const kanjiArray = Array.from(kanji).sort(
          (a, b) => a.length - b.length,
        );

        const vocabularyArray = Array.from(vocabulary).sort(
          (a, b) => a.length - b.length,
        );

        sendResponse({
          success: true,
          kanji: kanjiArray,
          vocabulary: vocabularyArray,
        });
      } catch (e) {
        sendResponse({ success: false, error: e.toString() });
      }
    },
  );

  return true;
});
