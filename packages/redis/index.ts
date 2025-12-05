import { Redis } from "ioredis";

export const redis = new Redis(process.env.REDIS_URL!, {
  lazyConnect: true,
});

redis.on("error", (err: unknown) => console.error("Redis error:", err));
redis.on("connect", () => console.log("Redis connected"));
