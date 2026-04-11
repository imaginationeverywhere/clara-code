import { type Request, type Response, Router } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
	res.json({ status: "ok" });
});

export default router;
