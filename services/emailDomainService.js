import { KNOWN_BRAND_DOMAINS } from "../constants.js";
import { getDomain } from "./utils.js";

const isKnownRealDomain = (domain) => {
    const brands = Object.keys(KNOWN_BRAND_DOMAINS);
    for (const brand of brands) {
        for (const real of KNOWN_BRAND_DOMAINS[brand]) {
            if (domain === real || domain.endsWith("." + real)) {
                return true;
            }
        }
    }
    return false;
};

// Normalize lookalike characters in the domain to detect impersonation attempts
const normalizeLookalikes = (domain) => {
    let normalized = domain;
    normalized = normalized.replace(/0/g, "o");
    normalized = normalized.replace(/1/g, "l");
    normalized = normalized.replace(/3/g, "e");
    normalized = normalized.replace(/5/g, "s");
    normalized = normalized.replace(/rn/g, "m");
    normalized = normalized.replace(/vv/g, "w");
    return normalized;
};

export const checkEmailDomain = (senderEmail) => {
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

    // A genuine brand domain
    if (isKnownRealDomain(domain)) return result;

    const normalized = normalizeLookalikes(domain);
    const brands = Object.keys(KNOWN_BRAND_DOMAINS);

    for (const brand of brands) {
        // short names can give false matches
        if (brand.length < 5) continue;

        // Brand name inside the domain (paypal123.com)
        if (domain.includes(brand)) {
            result.score += 40;
            result.reasons.push("Domain " + domain + " imitates " + brand);
            break;
        }

        // Brand name hidden behind lookalike characters (paypa1.com, rnicrosoft.com)
        if (normalized.includes(brand)) {
            result.score += 40;
            result.reasons.push(
                "Domain " +
                    domain +
                    " uses lookalike characters to imitate " +
                    brand,
            );
            break;
        }
    }

    // Punycode domains
    if (domain.includes("xn--")) {
        result.score += 20;
        result.reasons.push("Domain uses lookalike characters");
    }

    return result;
};
