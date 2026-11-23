import { analyzeEmail } from "../services/phishingService.js";
import { calculateRisk } from "../scoring/riskScorer.js";

const btn = document.querySelector(".scan-btn");
const text = document.querySelector(".status__text");
const resultsPanel = document.querySelector(".results");
const scoreValue = document.querySelector(".score__value");
const scoreFill = document.querySelector(".score__fill");
const checksList = document.querySelector(".checks__list");

const checkLabels = {
    emailDomain: "Sender domain",
    domainReputation: "Domain reputation",
    grammar: "Message grammar",
    attachments: "Attachments",
    links: "Links",
};

const formatCheckName = (check) =>
    checkLabels[check] || check.replace(/([A-Z])/g, " $1").trim();

const formatStatus = (result) => {
    if (result.status === "failed") return "Unavailable";
    if (result.score > 0) return "Flagged";
    return "Passed";
};

const renderResults = (verdict, results) => {
    resultsPanel.hidden = false;
    scoreValue.textContent = `${verdict.score}/100`;
    scoreFill.style.width = `${verdict.score}%`;
    checksList.replaceChildren();

    for (const result of results) {
        const item = document.createElement("li");
        item.className = "check";
        item.dataset.status = result.status === "failed"
            ? "failed"
            : result.score > 0
                ? "flagged"
                : "passed";

        const name = document.createElement("span");
        name.className = "check__name";
        name.textContent = formatCheckName(result.check);

        const status = document.createElement("span");
        status.className = "check__status";
        status.textContent = formatStatus(result);

        item.append(name, status);

        if (result.reasons.length > 0) {
            const reasons = document.createElement("ul");
            reasons.className = "check__reasons";
            for (const reason of result.reasons) {
                const reasonItem = document.createElement("li");
                reasonItem.textContent = reason;
                reasons.append(reasonItem);
            }
            item.append(reasons);
        }

        checksList.append(item);
    }
};

const setScanning = () => {
    document.body.dataset.state = "scanning";
    text.textContent = "Scanning";
    resultsPanel.hidden = true;
};
 
const setSafe = () => {
    document.body.dataset.state = "safe";
    text.textContent = "No red flags found";
};
 
const setSuspicious = () => {
    document.body.dataset.state = "suspicious";
    text.textContent = "Suspicious";
};
 
const setDanger = () => {
    document.body.dataset.state = "danger";
    text.textContent = "DANGER";
};
 
const showError = (message) => {
    document.body.dataset.state = "idle";
    text.textContent = message;
    resultsPanel.hidden = true;
};

const showVerdict = (verdict, results) => {
    renderResults(verdict, results);

    if (verdict.level === "danger") {
        setDanger();
    } else if (verdict.level === "suspicious") {
        setSuspicious();
    } else if (verdict.level === "unknown") {
        showError("Could not run any check");
    } else {
        setSafe();
    }
};

const collectEmail = async (tab) => {
    const emailData = await chrome.tabs.sendMessage(tab.id, {
        type: "GET_EMAIL_INFO",
    });
    return emailData;
};

btn.addEventListener("click", async () => {
    setScanning();
 
    try {
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        const tab = tabs[0];
 
        if (!tab || !tab.url || !tab.url.includes("mail.google.com")) {
            showError("Open Gmail to scan an email");
            return;
        }
 
        // Collect email data
        // { sender: "a@b.com", senderName, body: "text", links: [{ text, href }], attachments: [{ name, url }] }
        let email = null;
        try {
            email = await collectEmail(tab);
        } catch (error) {
            // Usually means the content script is not loaded in this tab
            console.error("Could not reach the content script:", error);
            showError("Reload the Gmail tab and try again");
            return;
        }
 
        if (!email || !email.sender) {
            showError("Open an email first");
            return;
        }
 
        // Run every check
        // [ { check, status, score, reasons }, ... ]
        const results = await analyzeEmail(email);
 
        // Combine into one verdict: { score, level, reasons }
        const verdict = calculateRisk(results);

        // Render
        showVerdict(verdict, results);
    } catch (error) {
        showError("Can't analyze email");
    }
});
