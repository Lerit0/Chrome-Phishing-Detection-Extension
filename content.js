// extract email info, sender, body, footer

console.log("content script loaded");

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "GET_EMAIL_INFO") {
        const sender = document
            .querySelector(".gD")
            ?.getAttribute("email") ?? "";

        const body = document
                .querySelector(".a3s")
                ?.textContent.trim()
                .replace(/\s+/g, " ") ?? "";

        sendResponse({sender, body});
    }
});
