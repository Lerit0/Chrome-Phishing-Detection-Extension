import { SUSPICIOUS_CATEGORIES } from "./constants.js";
import { KNOWN_BRAND_DOMAINS } from "./constants.js";
import { VT_API_KEY } from "./config.js";

const btn = document.querySelector(".scan-btn");
const status_circle = document.querySelector(".status");
const text = document.querySelector(".status__text");
const detail = document.querySelector(".status__detail");

const setScanning = () => {
    document.body.dataset.state = "scanning";
    text.textContent = "Scanning";
    detail.hidden = true;
};

const setIdle = () => {
    document.body.dataset.state = "idle";
    text.textContent = "Ready to check";
    detail.hidden = false;
};

const setDanger = () => {
    document.body.dataset.state = "danger";
    text.textContent = "DANGER";
    detail.hidden = false;
    detail.textContent = "Possible phishing email";
};

// const checkEmailLookAlike;
const checkDomain = async (domain) => {
    const res = { domainInAgeDays: null, domainVT: null, failed: null };
    try {
        // TODO: remove this later
        const res = await fetch(
            `https://www.virustotal.com/api/v3/domains/${domain}`,
            {
                method: "GET",
                headers: {
                    "x-apikey": VT_API_KEY,
                    accept: "application/json",
                },
            },
        );

        // Unkown domains
        if (res.status === 404) return res;

        const json = await res.json();
        const attributes = json.data?.attributes;
        if (!attributes) {
            result.failed = true;
            return result;
        }

        // Check the domain age
        if (attributes.creation_date) {
            const creationDateMs = attributes.creation_date * 1000;
            res.domainInAgeDays =
                (Date.now() - creationDateMs) / (1000 * 60 * 60 * 24);
        }

        // Check domain analysis
        const stats = attributes.last_analysis_stats;
        if (stats) {
            res.domainVT = {
                malicious: stats.malicious || 0,
                suspicious: stats.suspicious || 0,
            };
        }

        return res;
    } catch (error) {
        console.error(`Failed to analyze domain ${domain}:`, error);
        result.failed = true;
        return result;
    }
};

const checkFileHash = async (hash) => {
    const res = await fetch(`https://www.virustotal.com/api/v3/files/${hash}`, {
        method: "GET",
        headers: {
            "x-apikey": VT_API_KEY,
            accept: "application/json",
        },
    });
    const json = await res.json();
};

const checkGrammar = async (body) => {
    const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ text: body, language: "en-US" }),
    });

    const data = await res.json();
    
    const grammarIssues = data.matches;
    const relevantIssues = grammarIssues.filter((issue) =>
        SUSPICIOUS_CATEGORIES.includes(issue.rule.category.id),
    );

    return relevantIssues;
};

// const checkFileAttachmenet

const scan_email = async () => {
    setScanning();
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });

    try {
        const emailData = await chrome.tabs.sendMessage(tab.id, {
            type: "GET_EMAIL_INFO",
        });

        // Checking sender email
        const domain = senderEmail.split("@")[1]?.toLowerCase() ?? "";

        for (const [brand, realDomains] of Object.entries(
            KNOWN_BRAND_DOMAINS,
        )) {
            // Checks if the brand is mentioned in the email
            const mentionsBrand =
                emailBody.toLowerCase().includes(brand) ||
                senderEmail.toLowerCase().includes(brand);

            // Checks if it is a real domain
            const isRealDomain = realDomains.some(
                (d) => domain === d || domain.endsWith("." + d),
            );

            if (mentionsBrand && !isRealDomain) {
                setDanger();
                return;
            }
        }

        // Checking email grammar
        const grammarIssues = await checkGrammar(emailData.body);

        const relevantIssues = grammarIssues.filter((issue) =>
            SUSPICIOUS_CATEGORIES.includes(issue.rule.category.id),
        );

        if (relevantIssues.length > 0) {
            setDanger();
            return;
        }

        // Check files
    } catch (err) {
        console.error("FAILED at try block:", err);
    }
    setIdle();
};

btn.addEventListener("click", scan_email);
