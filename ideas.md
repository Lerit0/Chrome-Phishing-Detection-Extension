https://www.youtube.com/shorts/46ONgKPjKdU

-> Hardcoded emails, generated via AI.

How to check if it's suspicious 
1) Email 
    - Extract sender email - done
    - compare it to hardcoded domains - done
    - lookalike check -> alg of levenhstein, distance
    - Virus Total API - done
    - Domain age from VT - done
2) Body
    - Grammar check - done
    - links?
3) Attachemtns
    - Compute sha-256 and look it up in Virus Total API
4) Conclusion
    - Use a points system?
    - Highlight reasons? 

-> Change the API calls to a background service worker

-> Explain the point system