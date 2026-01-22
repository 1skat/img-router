import { Ratelimit } from "@upstash/ratelimit";
import { RedisClient } from "bun";
import { Redis } from "@upstash/redis";


export type ApiConfig = {
    db: RedisClient
    port: string;
    // apiRL: Ratelimit,
};

const pathToRedis = envOrThrow("REDIS_URL");
const port = envOrThrow("API_ROUTE_PORT");

const db = new RedisClient(pathToRedis);
// const apiRL = new Ratelimit({
//     redis: new Redis({
//         url: pathToRedis,
//         token: "",
//     }),
//     limiter: Ratelimit.slidingWindow(10, "1 m")
// });

export const cfg: ApiConfig = {
    db,
    port,
    // apiRL,
};

function envOrThrow(key: string) {
    const envVar = process.env[key];
    if (!envVar) {
        throw new Error(`${key} must be set`);
    }
    return envVar;
}

