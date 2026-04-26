import winston from "winston";

// Create logger instance
export const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || "info",
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.errors({ stack: true }),
		winston.format.colorize({ all: true }),
		winston.format.printf(({ timestamp, level, message, stack }) => {
			return `${timestamp} [${level}]: ${stack || message}`;
		}),
	),
	transports: [
		// Console transport for all environments
		new winston.transports.Console({
			format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
		}),
	],
});

// Add file transport for production — write to /tmp/logs (writable by non-root container user)
if (process.env.NODE_ENV === "production") {
	const fs = require("fs");
	const logsDir = "/tmp/logs";
	if (!fs.existsSync(logsDir)) {
		fs.mkdirSync(logsDir, { recursive: true });
	}

	logger.add(
		new winston.transports.File({
			filename: "/tmp/logs/error.log",
			level: "error",
			format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
		}),
	);

	logger.add(
		new winston.transports.File({
			filename: "/tmp/logs/combined.log",
			format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
		}),
	);
}
