import Redis from "ioredis";
import { RedisOptions } from "bullmq";
import logger from "../utils/logger";

export const redisConnection: RedisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  username: process.env.REDIS_USERNAME || undefined,
  db: parseInt(process.env.REDIS_DB || "0"),
  maxRetriesPerRequest: null,
  retryStrategy(times: number) {
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
};

export const redisClient = new Redis({
  ...redisConnection,
  maxRetriesPerRequest: 3,
});

redisClient.on("connect", () => {
  logger.info("✅ Redis connected successfully");
});

redisClient.on("error", (err: Error) => {
  logger.warn(`⚠️ Redis connection error: ${err.message}`);
});

redisClient.on("close", () => {
  logger.warn("⚠️ Redis connection closed");
});
