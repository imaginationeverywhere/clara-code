import rateLimit from "express-rate-limit";

/** 5 waitlist signups per IP per 15 minutes */
export const waitlistLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many signups from this IP. Try again later." },
});

/** 20 TTS requests per IP per minute */
export const voiceLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Voice rate limit exceeded. Slow down." },
});

/** 10 API key creations per user per hour */
export const apiKeyCreateLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many API keys created. Try again later." },
	keyGenerator: (req) => req.headers["x-forwarded-for"]?.toString() || req.ip || "unknown",
});
