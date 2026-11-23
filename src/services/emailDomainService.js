import { KNOWN_BRAND_DOMAINS } from "../constants.js";
import { getDomain, findImitatedBrand, isRealBrandDomain } from "../utils/utils.js";

// Returns the brand mentioned in the sender name ("PayPal Support"), or null
const findBrandInName = (senderName) => {
    const words = senderName.toLowerCase().split(/[^a-z0-9]+/);

    // Whole words, plus neighbouring words joined ("Pay Pal" -> "paypal").
    // Matching whole words only avoids false hits like "Groups Team" -> "steam"
    const candidates = [...words];
    for (let i = 0; i < words.length - 1; i++) {
        candidates.push(words[i] + words[i + 1]);
    }

    for (const brand of Object.keys(KNOWN_BRAND_DOMAINS)) {
        if (candidates.includes(brand)) return brand;
    }
    return null;
};

export const checkEmailDomain = (senderEmail, senderName = "") => {
    const result = {
        check: "emailDomain",
        status: "ok",
        score: 0,
        reasons: [],
    };

    const domain = getDomain(senderEmail);

    if (domain === "") {
        result.status = "failed";
        result.reasons.push("Could not read the sender domain");
        return result;
    }

    const imitation = findImitatedBrand(domain);
    if (imitation) {
        result.score += 40;
        if (imitation.lookalike) {
            result.reasons.push(
                "Domain " +
                    domain +
                    " uses lookalike characters to imitate " +
                    imitation.brand,
            );
        } else {
            result.reasons.push("Domain " + domain + " imitates " + imitation.brand);
        }
    }

    // Display name claims a brand the domain doesn't belong to ("PayPal" <x@gmail.com>)
    const nameBrand = findBrandInName(senderName);
    if (
        nameBrand &&
        !isRealBrandDomain(nameBrand, domain) &&
        (!imitation || imitation.brand !== nameBrand)
    ) {
        result.score += 40;
        result.reasons.push(
            'Sender name says "' + senderName + '" but the email comes from ' + domain,
        );
    }

    // Punycode domains
    if (domain.includes("xn--")) {
        result.score += 20;
        result.reasons.push("Domain uses lookalike characters");
    }

    return result;
};
