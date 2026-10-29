import { CONFIG } from "../config.js";

const { VT_API_KEY } = CONFIG;

const getDomain = (email) => {
    const parts = email.split("@");
    if (parts.length < 2) return "";
    return parts[1].toLowerCase();
};

export const checkDomainReputation = async (senderEmail) => {
    const result = {
        check: "domainReputation",
        status: "ok",
        score: 0,
        reasons: [],
    };

    // Ge the domain from the sender email
    const domain = getDomain(senderEmail);
    if (domain === "") {
        result.status = "failed";
        result.reasons.push("Could not read the sender domain");
        return result;
    }

    try {
        // VirusTotal API check
        const response = await fetch(
            `https://www.virustotal.com/api/v3/domains/${domain}`,
            { headers: { "x-apikey": VT_API_KEY, accept: "application/json" } },
        );

        // VirusTotal has never seen this domain
        if (response.status === 404) {
            result.status = "ok";
            result.score = 10;
            result.reasons.push("Sender domain unknown to VirusTotal");
            return result;
        }

        if (!response.ok) {
            result.status = "failed";
            result.reasons.push("Could not check the domain on VirusTotal");
            return result;
        }


        const json = await response.json();
        const attributes = json.data ? json.data.attributes : null;
        if (!attributes) {
            result.status = "failed";
            result.reasons.push("Could not check the domain on VirusTotal");
            return result;
        }

        const stats = attributes.last_analysis_stats;
        if (stats) {
            const malicious = stats.malicious || 0;
            const suspicious = stats.suspicious || 0;

            // If the domain is flagged by 3 or more engines,dangerous
            if (malicious >= 3) {
                result.score = 100;
                result.reasons.push("Sender domain flagged by VirusTotal");
                return result;
            }
            // If the domain is flagged by 1 or 2 engines, suspicious
            if (malicious >= 1) {
                result.score += 40;
                result.reasons.push(
                    "Sender domain flagged by some VirusTotal engines",
                );
            // If the domain is flagged as suspicious by 1 or more engines, suspicious
            } else if (suspicious >= 1) {
                result.score += 15;
                result.reasons.push(
                    "Sender domain marked suspicious by VirusTotal",
                );
            }
        }

        // Domain age
        if (attributes.creation_date) {
            const creationMs = attributes.creation_date * 1000;
            const ageInDays = (Date.now() - creationMs) / (1000 * 60 * 60 * 24);

            if (ageInDays < 7) {
                result.score += 35;
                result.reasons.push("Domain registered less than a week ago");
            } else if (ageInDays < 30) {
                result.score += 25;
                result.reasons.push("Domain registered less than a month ago");
            } else if (ageInDays < 90) {
                result.score += 10;
                result.reasons.push("Domain registered less than 3 months ago");
            }
        }

        return result;

    } catch (error) {
        console.error("Domain reputation check failed:", error);
        result.status = "failed";
        result.reasons.push("Could not check the domain on VirusTotal");
        return result;
    }
};
