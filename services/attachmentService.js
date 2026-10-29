import { CONFIG } from "../config.js";
import { RISKY_EXTENSION, DOUBLE_EXTENSION } from "../constants.js";

const { VT_API_KEY } = CONFIG;

const sha256 = async (buffer) => {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const bytes = new Uint8Array(hashBuffer);

    let hex = "";
    for (const byte of bytes) {
        hex += byte.toString(16).padStart(2, "0");
    }
    return hex;
};

// Downloads the attachment and returns its hash, or null if anything fails
const getHash = async (url) => {
    try {
        const response = await fetch(url, { credentials: "include" });
        if (!response.ok) return null;

        const buffer = await response.arrayBuffer();
        return await sha256(buffer);
    } catch (error) {
        console.error("Could not download attachment:", error);
        return null;
    }
};

export const checkAttachments = async (attachments) => {
    const result = { check: "attachments", status: "ok", score: 0, reasons: [] };
    let failedCount = 0;

    for (const attachment of attachments) {
        // Check attachment name rules
        if (RISKY_EXTENSION.test(attachment.name) || DOUBLE_EXTENSION.test(attachment.name)) {
            result.score = Math.max(result.score, 30);
            result.reasons.push("Risky attachment type: " + attachment.name);
        }

        // Download and hash the attachment
        const hash = await getHash(attachment.url);
        if (hash === null) {
            failedCount++;
            result.reasons.push("Could not check " + attachment.name);
            continue;
        }

        // VirusTotal API check
        try {
            const response = await fetch(
                `https://www.virustotal.com/api/v3/files/${hash}`,
                { headers: { "x-apikey": VT_API_KEY, accept: "application/json" } },
            );

            // VirusTotal returns 404 if the file is not in the database.
            if (response.status === 404) {
                result.score += 10;
                result.reasons.push("Attachment unknown to VirusTotal: " + attachment.name);
                continue;
            }

            if (!response.ok) {
                failedCount++;
                result.reasons.push("Could not check " + attachment.name);
                continue;
            }

            const json = await response.json();
            const attributes = json.data ? json.data.attributes : null;
            if (!attributes || !attributes.last_analysis_stats) {
                failedCount++;
                result.reasons.push("Could not check " + attachment.name);
                continue;
            }

            const malicious = attributes.last_analysis_stats.malicious || 0;
            // If the attachment is flagged by 3 or more engines, dangerous
            if (malicious >= 3) {
                result.score = 100;
                result.reasons.push("Attachment flagged as malicious: " + attachment.name);
            // If the attachment is flagged by 1 or 2 engines, suspicious
            } else if (malicious >= 1) {
                result.score = Math.max(result.score, 50);
                result.reasons.push("Attachment flagged by some engines: " + attachment.name);
            }
        } catch (error) {
            console.error("Attachment check failed:", error);
            failedCount++;
            result.reasons.push("Could not check " + attachment.name);
        }
    }

    if (result.score > 0) {
        result.status = "flagged";
    } else if (failedCount > 0) {
        result.status = "failed";
    }

    return result;
};