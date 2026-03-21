import { redisClient } from "../config/redis";
import logger from "../utils/logger";

export class CacheService {
    /**
     * Get cached data by key
     */
    static async get<T>(key: string): Promise<T | null> {
        try {
            if (redisClient.status !== "ready") return null;
            const data = await redisClient.get(key);
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch (error) {
            logger.warn(`Cache GET error for key "${key}":`, error);
            return null;
        }
    }

    /**
     * Set cached data with TTL (in seconds)
     */
    static async set(key: string, data: any, ttlSeconds: number): Promise<void> {
        try {
            if (redisClient.status !== "ready") return;
            await redisClient.setex(key, ttlSeconds, JSON.stringify(data));
        } catch (error) {
            logger.warn(`Cache SET error for key "${key}":`, error);
        }
    }

    /**
     * Cache-aside pattern: return cached data or fetch, cache, and return
     */
    static async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlSeconds: number
    ): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== null) {
            logger.debug(`Cache HIT: ${key}`);
            return cached;
        }

        logger.debug(`Cache MISS: ${key}`);
        const data = await fetcher();
        await this.set(key, data, ttlSeconds);
        return data;
    }

    /**
     * Invalidate a specific cache key
     */
    static async invalidate(key: string): Promise<void> {
        try {
            if (redisClient.status !== "ready") return;
            await redisClient.del(key);
            logger.debug(`Cache INVALIDATED: ${key}`);
        } catch (error) {
            logger.warn(`Cache INVALIDATE error for key "${key}":`, error);
        }
    }

    /**
     * Invalidate all keys matching a pattern (e.g., "dashboard:*")
     * Uses SCAN to avoid blocking Redis
     */
    static async invalidatePattern(pattern: string): Promise<void> {
        try {
            if (redisClient.status !== "ready") return;

            let cursor = "0";
            let totalDeleted = 0;

            do {
                const [nextCursor, keys] = await redisClient.scan(
                    cursor,
                    "MATCH",
                    pattern,
                    "COUNT",
                    100
                );
                cursor = nextCursor;

                if (keys.length > 0) {
                    await redisClient.del(...keys);
                    totalDeleted += keys.length;
                }
            } while (cursor !== "0");

            if (totalDeleted > 0) {
                logger.debug(
                    `Cache INVALIDATED pattern "${pattern}": ${totalDeleted} keys`
                );
            }
        } catch (error) {
            logger.warn(
                `Cache INVALIDATE PATTERN error for "${pattern}":`,
                error
            );
        }
    }

    /**
     * Build a cache key from parts, including query params for paginated endpoints
     */
    static buildKey(prefix: string, params?: Record<string, any>): string {
        if (!params || Object.keys(params).length === 0) return prefix;

        const sortedParams = Object.entries(params)
            .filter(([, v]) => v !== undefined && v !== null && v !== "")
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}=${v}`)
            .join(":");

        return sortedParams ? `${prefix}:${sortedParams}` : prefix;
    }
}
