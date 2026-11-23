import { SUSPICIOUS_CATEGORIES } from "../constants.js";

export const checkGrammar = async (body) => {
    const result = { check: "grammar", status: "ok", score: 0, reasons: [] };

    try {
        const response = await fetch("https://api.languagetool.org/v2/check", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                text: body.slice(0, 5000),
                language: "auto",
                preferredVariants: "en-US,pt-PT",
            }),
        });

        if (!response.ok) {
            result.status = "failed";
            result.reasons.push("Could not check grammar");
            return result;
        }

        const json = await response.json();

        // Filter matches to only include those in suspicious categories
        const relevantIssues = json.matches.filter((issue) =>
            SUSPICIOUS_CATEGORIES.includes(issue.rule.category.id),
        );

        // If there are relevant issues, update the result with the score and reasons
        if (relevantIssues.length > 0) {
            result.status = "ok";
            result.score = relevantIssues.length * 5;
            result.reasons.push(
                "Spelling or grammar errors (" + relevantIssues.length + ")",
            );
        }

        return result;

    } catch (error) {
        console.error("Grammar check failed:", error);
        result.status = "failed";
        result.reasons.push("Could not check grammar");
        return result;
    }
};