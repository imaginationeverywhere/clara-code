import { getAuth, requireAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { logger } from "@/utils/logger";

/** Auth result from Clerk getAuth(); used for typing the auth getter on request. */
export type ClerkAuthResult = Awaited<ReturnType<typeof getAuth>>;

export interface AuthenticatedRequest extends Request {
	/** Lazy getter for Clerk auth (set by withAuth). Call auth?.() to get current auth. */
	auth?: () => ClerkAuthResult | Promise<ClerkAuthResult>;
	user?: unknown;
}

// Middleware to add Clerk auth to request (optional auth)
export const withAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
	try {
		req.auth = () => getAuth(req);
		return next();
	} catch (error) {
		logger.error("Clerk auth error:", error);
		return next(); // Continue without auth for optional auth
	}
};

// Re-export the built-in requireAuth from Clerk
export { requireAuth };

// Custom middleware to sync user data with database
export const syncUserMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	try {
		const auth = await (req.auth?.() ?? null);
		if (auth?.userId) {
			// CommonJS require to avoid circular dependency — no .js extension needed in CJS
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const { User } = require("../models/User") as typeof import("../models/User");

			// Fetch user data from database
			const user = await User.findByClerkId(auth.userId);

			if (user) {
				req.user = user;
				logger.info(`User synced: ${user.id}`, { clerkId: auth.userId, role: user.role });
			} else {
				logger.warn(`User not found in database: ${auth.userId}`);
				// You might want to create the user here or fetch from Clerk API
			}
		}
		return next();
	} catch (error) {
		logger.error("Error syncing user data:", error);
		return res.status(500).json({ error: "Internal server error" });
	}
};

// Role-based authorization middleware
export const requireRole = (allowedRoles: string[]) => {
	return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		const auth = await (req.auth?.() ?? null);
		if (!auth?.userId) {
			return res.status(401).json({ error: "Authentication required" });
		}

		// Get user role from session claims or user metadata
		const metadata = auth.sessionClaims?.metadata as { role?: string } | undefined;
		const userRole = metadata?.role || "customer";

		if (!allowedRoles.includes(userRole)) {
			return res.status(403).json({ error: "Insufficient permissions" });
		}

		return next();
	};
};

// Legacy auth middleware for backward compatibility
export const authMiddleware = withAuth;
