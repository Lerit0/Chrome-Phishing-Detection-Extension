import { checkGrammar } from "./grammarService.js";
import { checkEmailDomain } from "./emailDomainService.js";
import { checkDomainReputation } from "./domainReputationService.js";
import { checkAttachments } from "./attachmentService.js";

export const analyzeEmail = async (email) => {
    // allSettled: one check crashing does not stop the others
    const settled = await Promise.allSettled([
        checkEmailDomain(email.sender),
        checkDomainReputation(email.sender),
        checkGrammar(email.body),
        checkAttachments(email.attachments),
    ]);
 
    // allSettled returns { status, value } wrappers
    // unwrap them to { check, status, score, reasons } objects
    const results = [];
    for (const item of settled) {
        if (item.status === "fulfilled") {
            results.push(item.value);
        } else {
            console.error("A check crashed:", item.reason);
            results.push({
                check: "unknown",
                status: "failed",
                score: 0,
                reasons: ["A check could not run"],
            });
        }
    }
 
    return results;
};