require("reflect-metadata");
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://test:test@127.0.0.1:5432/test";
process.env.NODE_ENV = "test";
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "sk_test_placeholder";
process.env.SOUL_ENCRYPTION_KEY = process.env.SOUL_ENCRYPTION_KEY || "a".repeat(64);
process.env.CLARA_VOICE_URL = process.env.CLARA_VOICE_URL || "https://voice.test.example/graphql";
