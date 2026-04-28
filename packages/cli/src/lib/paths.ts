import { homedir } from "node:os";
import { join } from "node:path";

export const CLARA_CONFIG_DIR = join(homedir(), ".clara");
export const CLARA_CONFIG_FILE = join(CLARA_CONFIG_DIR, "config.json");
export const CLARA_CREDENTIALS_FILE = join(CLARA_CONFIG_DIR, "credentials.json");
/** Written by CLI commands on failure; read by `clara doctor`. */
export const CLARA_LAST_ERROR_FILE = join(CLARA_CONFIG_DIR, "last-error.json");
