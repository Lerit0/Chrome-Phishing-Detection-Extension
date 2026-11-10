console.log("content script loaded");

const getAttachments = () => {
    const chips = document.querySelectorAll("span.aZo[download_url]");
    const attachments = [];

    for (const chip of chips) {
        const raw = chip.getAttribute("download_url");
        // format is "mime:filename:url"
        const first = raw.indexOf(":");
        const second = raw.indexOf(":", first + 1);

        const name = raw.slice(first + 1, second);
        const url = raw.slice(second + 1);

        attachments.push({ name: name, url: url });
    }

    return attachments;
};

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "GET_EMAIL_INFO") {
        let sender = "";
        const senderElement = document.querySelector(".gD");
        if (senderElement) {
            sender = senderElement.getAttribute("email");
        }

        let body = "";
        const bodyElement = document.querySelector(".a3s");
        if (bodyElement) {
            body = bodyElement.textContent.trim().replace(/\s+/g, " ");
        }

        const attachments = getAttachments();

        sendResponse({
            sender: sender,
            body: body,
            attachments: attachments,
        });
    }
});
