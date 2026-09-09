process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/link_shortener";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.BASE_URL = "http://localhost:3000";
process.env.REDIS_TTL_SECONDS = "3600";
