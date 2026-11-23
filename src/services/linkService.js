import { URL_SHORTENERS } from "../constants.js";
import { sameSite, findImitatedBrand } from "../utils/utils.js";

// Link text that looks like an address (paypal.com, https://paypal.com/login)
const LOOKS_LIKE_URL = /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i;
const IP_ADDRESS = /^\d{1,3}(\.\d{1,3}){3}$/;

const parseUrl = (href) => {
    try {
        let url = new URL(href);

        // Gmail sometimes wraps links as https://www.google.com/url?q=<real link>
        if (url.hostname === "www.google.com" && url.pathname === "/url") {
            const real = url.searchParams.get("q");
            if (real) url = new URL(real);
        }

        if (url.protocol !== "http:" && url.protocol !== "https:") return null;
        return url;
    } catch (error) {
        return null;
    }
};

// Returns the host the link text shows, or null if the text isn't an address
const getShownHost = (text) => {
    if (!LOOKS_LIKE_URL.test(text)) return null;
    const withScheme = /^https?:\/\//i.test(text) ? text : "http://" + text;
    try {
        return new URL(withScheme).hostname;
    } catch (error) {
        return null;
    }
};

export const checkLinks = (links) => {
    const result = { check: "links", status: "ok", score: 0, reasons: [] };

    // Each rule only adds its score once, so many links don't stack up
    const flagged = new Set();
    const flag = (rule, score, reason) => {
        if (flagged.has(rule)) return;
        flagged.add(rule);
        result.score += score;
        result.reasons.push(reason);
    };

    for (const link of links) {
        const url = parseUrl(link.href);
        if (url === null) continue;
        const host = url.hostname.toLowerCase();

        // Text shows one address but the link goes to another
        const shownHost = getShownHost(link.text);
        if (shownHost && !sameSite(shownHost, host)) {
            flag("mismatch", 40, "Link shows " + shownHost + " but goes to " + host);
        }

        if (IP_ADDRESS.test(host)) {
            flag("ip", 30, "Link goes to an IP address: " + host);
        }

        if (URL_SHORTENERS.some((shortener) => sameSite(host, shortener))) {
            flag("shortener", 15, "Link uses a URL shortener: " + host);
        }

        const imitation = findImitatedBrand(host);
        if (imitation) {
            flag("brand", 40, "Link domain " + host + " imitates " + imitation.brand);
        }

        // Punycode domains
        if (host.includes("xn--")) {
            flag("punycode", 20, "Link domain uses lookalike characters: " + host);
        }
    }

    if (result.score > 0) result.status = "flagged";

    return result;
};
