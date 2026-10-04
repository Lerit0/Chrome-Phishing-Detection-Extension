const btn = document.querySelector(".scan-btn");
const status_circle = document.querySelector(".status");
const text = document.querySelector(".status__text");
const detail = document.querySelector(".status__detail");

// TODO: Check this
const SUSPICIOUS_CATEGORIES = [
    "TYPOS",
    "GRAMMAR",
    "CONFUSED_WORDS",
    "REDUNDANCY",
];

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
    document.body.dataset.state = "danger"
    text.textContent = "DANGER"
    detail.hidden = false;
    detail.textContent = "Possible phishing email"
}

const checkGrammar = async (body) => {
    const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ text: body, language: "en-US" }),
    });
    const data = await res.json();
    return data.matches;
};

const scan_email = async () => {
    setScanning();
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });
    // Check sender email
    // Check grammar
    // Check files
    try {
        const emailData = await chrome.tabs.sendMessage(tab.id, {
            type: "GET_EMAIL_INFO",
        });

        // Checking sender email

        // Checking email grammar
        const grammarIssues = await checkGrammar(emailData.body);
        const relevantIssues = grammarIssues.filter((issue) =>
            SUSPICIOUS_CATEGORIES.includes(issue.rule.category.id),
        );
        
        console.log (relevantIssues)
        if(relevantIssues.length > 0) {
            setDanger();
            return;
        }
    } catch (err) {
        console.error("FAILED at try block:", err);
    }
    setIdle();
};

btn.addEventListener("click", scan_email);
