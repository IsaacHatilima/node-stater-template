import { createClient } from "redis";
export const redis = createClient({
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
});
redis.on("error", (err) => {
    // handle error
});
export async function initRedis() {
    if (!redis.isOpen) {
        await redis.connect();
    }
}
