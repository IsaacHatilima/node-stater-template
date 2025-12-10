import rateLimit from "express-rate-limit";
export const AuthLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    limit: 5, // max 5 requests per minute
    message: {
        errors: ["Too many attempts, please try again later."],
    },
    standardHeaders: true, // Return rate limit info in RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
});
