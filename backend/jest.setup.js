process.env.DATABASE_URL = process.env.DATABASE_URL || "postgres://test:test@127.0.0.1:5432/test";
process.env.NODE_ENV = "test";
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "sk_test_placeholder";
