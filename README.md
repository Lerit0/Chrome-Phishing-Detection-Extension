# Phishing Detector

A Chrome extension that scans the email open in Gmail and gives it a phishing risk score.

## Setup

1. Get a free API key from [VirusTotal](https://www.virustotal.com/).
2. Create a `config.js` file in the project root:
   ```js
   export const CONFIG = { VT_API_KEY: "your-virustotal-api-key" };
   ```
3. Open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and select this folder.
4. Open an email in Gmail, click the extension icon and press scan.

## How it works

1. **`emailCollector.js`** is a content script that runs on Gmail. When the popup asks, it reads the open email's sender, body and attachments from the page.
2. **`popup.js`** runs when the scan button is clicked. It gets the email data from the content script and passes it to the checks.
3. **`services/phishingService.js`** runs all the checks at the same time and collects their results, so if one check crashes the others still run. Each check returns `{ check, status, score, reasons }`.
4. **`riskScorer.js`** adds the scores into one 0–100 score and picks a level:
   - **safe**: below 25
   - **suspicious**: 25 or more
   - **danger**: 60 or more, or any check that returns a score of 100
5. **`popup.js`** shows the verdict and the result of each check.

## Checks (`services/`)

| File | What it does |
| --- | --- |
| `emailDomainService.js` | Flags sender domains that imitate a known brand (`paypal123.com`), use lookalike characters (`paypa1.com`, `rnicrosoft.com`) or punycode (`xn--`) |
| `domainReputationService.js` | Looks up the sender's domain on VirusTotal |
| `grammarService.js` | Sends the body to the LanguageTool API and counts spelling/grammar mistakes |
| `attachmentService.js` | Flags risky or double file extensions (`invoice.pdf.exe`), then hashes each file and looks it up on VirusTotal |

## Other files

- **`constants.js`**: known brand domains, the grammar categories that count as suspicious, and the risky file extension patterns
- **`services/utils.js`**: shared helpers used by the checks (`getDomain`)
- **`config.js`**: holds the VirusTotal API key (`VT_API_KEY`). It's gitignored, so it isn't in the repo.
- **`manifest.json`**: the extension's settings: the Gmail content script, permissions, and the APIs it is allowed to call
- **`popup.html`** and **`style/`**: the popup's layout and styles

## Privacy

- The first 5000 characters of the email body are sent to the public [LanguageTool](https://languagetool.org/) API for the grammar check.
- The sender's domain and the SHA-256 hash of each attachment are sent to VirusTotal. The attachment files themselves are never uploaded.

## Limitations

- The content script reads Gmail's internal CSS classes (`.gD`, `.a3s`, `.aZo`). If Gmail changes them, the scan may stop finding the email.
- The free VirusTotal API allows 4 requests per minute, so emails with many attachments may hit the limit.
