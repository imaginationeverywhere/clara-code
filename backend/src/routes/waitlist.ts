import { type Request, type Response, Router } from "express";
import { waitlistLimiter } from "@/middleware/rate-limit";
import { WaitlistEntry } from "@/models/WaitlistEntry";
import { logger } from "@/utils/logger";

const router = Router();

// POST /api/waitlist — capture waitlist signup
router.post("/", waitlistLimiter, async (req: Request, res: Response): Promise<void> => {
	try {
		const { email, name, role } = req.body as { email?: string; name?: string; role?: string };
		if (!email) {
			res.status(400).json({ error: "Email is required" });
			return;
		}

		// Validate format before hitting DB — Sequelize errors are not user-friendly
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			res.status(400).json({ error: "Invalid email address" });
			return;
		}

		const [entry, created] = await WaitlistEntry.findOrCreate({
			where: { email: email.toLowerCase().trim() },
			defaults: {
				email: email.toLowerCase().trim(),
				name: name ?? null,
				role: role ?? null,
			},
		});

		if (!created) {
			res.json({ success: true, message: "Already on the waitlist" });
			return;
		}

		logger.info(`Waitlist signup: ${email}`);
		res.status(201).json({ success: true, message: "Added to waitlist", id: entry.id });
	} catch (error) {
		logger.error("Waitlist signup error:", error);
		res.status(500).json({ error: "Failed to join waitlist" });
	}
});

export default router;
