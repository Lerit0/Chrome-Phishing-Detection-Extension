// TODO: add more...
export const KNOWN_BRAND_DOMAINS = {
    // Payments / finance
    paypal: ["paypal.com", "paypal.pt"],
    stripe: ["stripe.com"],
    visa: ["visa.com"],
    mastercard: ["mastercard.com"],
    revolut: ["revolut.com"],
    wise: ["wise.com"],
    chase: ["chase.com"],
    wellsfargo: ["wellsfargo.com"],
    bankofamerica: ["bankofamerica.com"],

    // Big tech
    microsoft: ["microsoft.com", "microsoftonline.com", "outlook.com", "live.com"],
    google: ["google.com", "gmail.com"],
    apple: ["apple.com", "icloud.com"],
    amazon: ["amazon.com", "amazon.es", "amazon.co.uk", "amazon.de", "amazon.fr"],
    meta: ["meta.com", "facebook.com", "facebookmail.com", "instagram.com"],
    linkedin: ["linkedin.com"],
    github: ["github.com"],
    dropbox: ["dropbox.com", "dropboxmail.com"],
    adobe: ["adobe.com"],
    docusign: ["docusign.com", "docusign.net"],
    zoom: ["zoom.us"],

    // Entertainment / gaming
    netflix: ["netflix.com"],
    spotify: ["spotify.com"],
    steam: ["steampowered.com", "steamcommunity.com"],
    discord: ["discord.com"],

    // Shipping
    dhl: ["dhl.com", "dhl.de"],
    fedex: ["fedex.com"],
    ups: ["ups.com"],
    ctt: ["ctt.pt"],

    // Portugal: banks and payments
    santander: ["santander.com", "santander.pt"],
    millennium: ["millenniumbcp.pt", "bancomillennium.pt"],
    novobanco: ["novobanco.pt"],
    caixa: ["cgd.pt"],
    bpi: ["bancobpi.pt"],
    montepio: ["montepio.pt"],
    mbway: ["mbway.pt", "sibs.pt"],

    // Portugal: government and utilities
    financas: ["portaldasfinancas.gov.pt", "at.gov.pt"],
    segurancasocial: ["seg-social.pt"],
    edp: ["edp.pt"],
    meo: ["meo.pt"],
    vodafone: ["vodafone.pt"],
    viaverde: ["viaverde.pt"],
};

// TODO: Check this
export const SUSPICIOUS_CATEGORIES = [
    "TYPOS",
    "GRAMMAR",
    "CONFUSED_WORDS",
    "REDUNDANCY",
];

export const RISKY_EXTENSION = /\.(exe|scr|js|vbs|iso|lnk|html?|docm|xlsm|jar)$/i;
export const DOUBLE_EXTENSION = /\.(pdf|docx?|xlsx?|jpg|png)\.(exe|scr|js|vbs|lnk)$/i;