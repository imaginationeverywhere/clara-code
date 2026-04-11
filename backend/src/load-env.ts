import dotenv from "dotenv";
import { join } from "path";

const envFile = process.env.ENV_FILE || ".env.local";
dotenv.config({ path: join(__dirname, "..", envFile) });
