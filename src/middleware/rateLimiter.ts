import rateLimit from "express-rate-limit";

/**
 * Rate limiters using in-memory store (default MemoryStore).
 * Each limiter tracks requests per IP.
 */

// Auth routes — strict to prevent brute-force
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 login attempts per 15 min
    message: {
        success: false,
        error: "Too many authentication attempts, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Standard CRUD routes — moderate limit
export const standardRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: {
        success: false,
        error: "Too many requests, please try again shortly",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Heavy analytics/dashboard routes — stricter limit
export const analyticsRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: {
        success: false,
        error: "Too many analytics requests, please try again shortly",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Mutation routes (create/update/delete) — moderate limit
export const mutationRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 mutations per minute
    message: {
        success: false,
        error: "Too many write requests, please try again shortly",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
