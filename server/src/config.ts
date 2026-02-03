import { Ratelimit } from "@upstash/ratelimit";
import { RedisClient, S3Client } from "bun";
import { Redis } from "@upstash/redis";
import { LRUCache } from 'lru-cache';
import type { AccountSettings } from "./internal/db/schema";

export type ApiConfig = {
    db: RedisClient
    s3: S3Client,
    lruCache: LRUCache<string, AccountSettings>,
    apiPort: string;
    imgPort: string;
    bucketName: string;
    s3Endpoint: string;
    s3Region: string;
    bunEnv: "production" | "development";
    // apiRL: Ratelimit,
};

const pathToRedis = envOrThrow("REDIS_URL");
const apiPort = envOrThrow("API_ROUTE_PORT");
const imgPort = envOrThrow("IMG_ROUTE_PORT");
const bucketName = envOrThrow("S3_BUCKET_NAME");
const s3Endpoint = envOrThrow("S3_ENDPOINT");
const s3Region = envOrThrow("S3_REGION");
const s3AccessKeyId = envOrThrow("ACCESS_KEY_ID");
const s3SecretAccessKey = envOrThrow("SECRET_ACCESS_KEY");

const db = new RedisClient(pathToRedis);
const s3 = new S3Client({
    accessKeyId: s3AccessKeyId,
    secretAccessKey: s3SecretAccessKey,
    bucket: bucketName,
    endpoint: s3Endpoint,
    region: s3Region,
});
const lruCache = new LRUCache<string, AccountSettings>({ max: 10_000, ttl: 60 * 60 * 1000 });

// const apiRL = new Ratelimit({
//     redis: new Redis({
//         url: pathToRedis,
//         token: "",
//     }),
//     limiter: Ratelimit.slidingWindow(10, "1 m")
// });

export const cfg: ApiConfig = {
    db,
    s3,
    lruCache,
    apiPort,
    imgPort,
    bucketName,
    s3Endpoint,
    s3Region,
    bunEnv: "production",
};

function envOrThrow(key: string) {
    const envVar = process.env[key];
    if (!envVar) {
        throw new Error(`${key} must be set`);
    }
    return envVar;
}

