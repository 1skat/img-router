import { Ratelimit } from "@upstash/ratelimit";
import { RedisClient, S3Client } from "bun";
import { Redis } from "@upstash/redis";
import { LRUCache } from 'lru-cache';
import { AccountDocSchema, AccountSettingsDocSchema, AccountSettingsSchema, ApiKeyDocSchema, type AccountDoc, type AccountSettings, type AccountSettingsDoc, type ApiKeyDoc } from "./internal/schema";
import type z from "zod";
import { MongoClient } from "mongodb";

const pathToMongo = envOrThrow("MONGO_URL");
const pathToRedis = envOrThrow("REDIS_URL");
const apiPort = envOrThrow("API_ROUTE_PORT");
const imgPort = envOrThrow("IMG_ROUTE_PORT");
const bucketName = envOrThrow("S3_BUCKET_NAME");
const s3Endpoint = envOrThrow("S3_ENDPOINT");
const s3Region = envOrThrow("S3_REGION");
const s3AccessKeyId = envOrThrow("ACCESS_KEY_ID");
const s3SecretAccessKey = envOrThrow("SECRET_ACCESS_KEY");

const mongoClient = new MongoClient(pathToMongo);
const mongo = mongoClient.db("img_db");
const db = {
    accounts: mongo.collection<AccountDoc>("accounts"),
    settings: mongo.collection<AccountSettingsDoc>("account_settings"),
    apiKeys: mongo.collection<ApiKeyDoc>("api_keys"),

    async safeInsertAccount(data: AccountDoc) {
        const validated = AccountDocSchema.parse(data);
        return await db.accounts.insertOne(validated);
    },
    async safeInsertSettings(data: AccountSettingsDoc) {
        const validated = AccountSettingsDocSchema.parse(data);
        return await db.settings.insertOne(validated);
    },
    async updateSettings(accountId: string, data: AccountSettings) {
        return await db.settings.updateOne({ accountId }, {
            $set: {
                settings: data,
                updatedAt: new Date(),
            }
        })
    },
    async safeInsertApiKey(data: ApiKeyDoc) {
        const validated = ApiKeyDocSchema.parse(data);
        return await db.apiKeys.insertOne(validated);
    },
};
type Db = typeof db;

const rsCache = new RedisClient(pathToRedis);
const s3 = new S3Client({
    accessKeyId: s3AccessKeyId,
    secretAccessKey: s3SecretAccessKey,
    bucket: bucketName,
    endpoint: s3Endpoint,
    region: s3Region,
});

// const apiRL = new Ratelimit({
//     redis: new Redis({
//         url: pathToRedis,
//         token: "",
//     }),
//     limiter: Ratelimit.slidingWindow(10, "1 m")
// });

export async function connectServices() {
    try {
        await rsCache.connect();
        console.log("Redis connected successfully");

        await mongoClient.connect();
        console.log("Mongo connected successfully");

        await mongo.command({ ping: 1 });

    } catch (err) {
        console.error("Failed to connect to Redis or MongoDB:", err);
        process.exit(1);
    }
};

const lruCaches = {
    settings: new LRUCache<string, AccountSettings>({ max: 10_000, ttl: 60 * 60 * 1000 }),
    accounts: new LRUCache<string, string>({ max: 10_000, ttl: 60 * 60 * 1000 }),
    apiKeys: new LRUCache<string, string>({ max: 10_000, ttl: 60 * 60 * 1000 }),
};

type lruCachesType = typeof lruCaches;

export type ApiConfig = {
    db: Db,
    rsCache: RedisClient,
    lruCaches: lruCachesType,
    s3: S3Client,
    apiPort: string;
    imgPort: string;
    bucketName: string;
    s3Endpoint: string;
    s3Region: string;
    bunEnv: "production" | "development";
    // apiRL: Ratelimit,
};

export const cfg: ApiConfig = {
    db,
    rsCache,
    s3,
    lruCaches,
    apiPort,
    imgPort,
    bucketName,
    s3Endpoint,
    s3Region,
    bunEnv: "development",
};

function envOrThrow(key: string) {
    const envVar = process.env[key];
    if (!envVar) {
        throw new Error(`${key} must be set`);
    }
    return envVar;
}

