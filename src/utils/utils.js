import { KNOWN_BRAND_DOMAINS } from "../constants.js";

export const getDomain = (email) => {
    const parts = email.split("@");
    if (parts.length < 2) return "";
    return parts[1].toLowerCase();
};

// True if both hosts belong to the same site (www.paypal.com and paypal.com)
export const sameSite = (a, b) =>
    a === b || a.endsWith("." + b) || b.endsWith("." + a);

// True if the domain belongs to this brand
export const isRealBrandDomain = (brand, domain) => {
    for (const real of KNOWN_BRAND_DOMAINS[brand]) {
        if (domain === real || domain.endsWith("." + real)) {
            return true;
        }
    }
    return false;
};

// True if the domain belongs to any known brand
export const isKnownRealDomain = (domain) => {
    for (const brand of Object.keys(KNOWN_BRAND_DOMAINS)) {
        if (isRealBrandDomain(brand, domain)) return true;
    }
    return false;
};

// Normalize lookalike characters in the domain to detect impersonation attempts
export const normalizeLookalikes = (domain) => {
    let normalized = domain;
    normalized = normalized.replace(/0/g, "o");
    normalized = normalized.replace(/1/g, "l");
    normalized = normalized.replace(/3/g, "e");
    normalized = normalized.replace(/5/g, "s");
    normalized = normalized.replace(/rn/g, "m");
    normalized = normalized.replace(/vv/g, "w");
    return normalized;
};

// Returns { brand, lookalike } if the domain imitates a known brand, or null
export const findImitatedBrand = (domain) => {
    // A genuine brand domain
    if (isKnownRealDomain(domain)) return null;

    const normalized = normalizeLookalikes(domain);

    for (const brand of Object.keys(KNOWN_BRAND_DOMAINS)) {
        // short names can give false matches
        if (brand.length < 5) continue;

        // Brand name inside the domain (paypal123.com)
        if (domain.includes(brand)) {
            return { brand: brand, lookalike: false };
        }

        // Brand name hidden behind lookalike characters (paypa1.com, rnicrosoft.com)
        if (normalized.includes(brand)) {
            return { brand: brand, lookalike: true };
        }
    }

    return null;
};
