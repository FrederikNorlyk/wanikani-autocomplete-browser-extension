# WaniKani Autocomplete Browser Extension

Browser extension for [WaniKani](https://www.wanikani.com), which adds autocomplete functionality for English answers.

<img width="300" src="screenshot.png" alt="Screenshot of the autocomplete functionality">

## Development

For Firefox, go to [about:debugging](about:debugging), and select "Load Temporary Add-on...". Then select [manifest.json](src/manifest.json) as the addon.

### Distribution

To package the extension run:

```bash
. build.sh
```
