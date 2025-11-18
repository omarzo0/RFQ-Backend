import Redis from "ioredis";
import { RedisOptions } from "bullmq";

export const redisConnection: RedisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || "0"),
  maxRetriesPerRequest: 3,
};

export const redisClient = new Redis(redisConnection);
