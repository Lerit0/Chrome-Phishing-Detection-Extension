const WEIGHTS = {
    emailDomain: 1,
    domainReputation: 1,
    grammar: 1,
    attachments: 1,
    links: 1,
};

const DANGER_THRESHOLD = 60;
const SUSPICIOUS_THRESHOLD = 25;

export const calculateRisk = (results) => {
    let score = 0;
    let failedCount = 0;
    let hasCritical = false;
    const reasons = [];
    const failedReasons = [];

    for (const result of results) {
        if (result.status === "failed") {
            failedCount++;
            for (const reason of result.reasons) {
                failedReasons.push(reason);
            }
            continue;
        }

        let weight = WEIGHTS[result.check];
        if (weight === undefined) weight = 1;

        score += result.score * weight;
        if (result.score >= 100) hasCritical = true;

        for (const reason of result.reasons) {
            reasons.push(reason);
        }
    }

    if (hasCritical) score = 100;
    if (score > 100) score = 100;

    let level = "safe";
    if (failedCount === results.length) {
        level = "unknown";
    } else if (score >= DANGER_THRESHOLD) {
        level = "danger";
    } else if (score >= SUSPICIOUS_THRESHOLD) {
        level = "suspicious";
    }

    for (const reason of failedReasons) {
        reasons.push(reason);
    }

    return { score: score, level: level, reasons: reasons };
};