import { homedir } from "node:os";
import { join } from "node:path";

export const CLARA_CONFIG_DIR = join(homedir(), ".clara");
export const CLARA_CONFIG_FILE = join(CLARA_CONFIG_DIR, "config.json");
