import { AccountSettingsSchema, RedisAccountSettingsSchema, type AccountSettings, type RedisAccountSettings } from "@/internal/db/schema";
import { generateAccountId, generateApiKey } from "@/internal/auth/auth";
import { tryCatchAsync } from "@/utils/try-catch";
import { BadRequestError, UserForbiddenError } from "@/errors";
import { cfg, type ApiConfig } from "@/configs/api_config";

// const REDIS_URL = process.env.REDIS_URL || "redis://imgstream-redis:6379";
// export const rdClient = new RedisClient(REDIS_URL);

// to-do pass it as an arg in functions below

export async function connectRedis() {
    try {
        await cfg.db.connect();
        console.log("Conneced to redis");
    } catch (err) {
        console.error("Failed to connect to redis", err);
        process.exit(1);
    }
};

export async function createApiKey(cfg: ApiConfig, name: string) {
    const apiKey = generateApiKey();
    const accountId = generateAccountId();

    const ok = await cfg.db.set(`accountName:${name}`, accountId, "NX");
    if (!ok) {
        throw new BadRequestError("Account name already taken");
    }

    await cfg.db.hset(`apiKey:${apiKey}`, {
        createdAt: new Date().toISOString(),
    });
    // await cfg.db.hsetnx(
    //     `apiKey:${apiKey}`,
    //     "createdAt",
    //     new Date().toISOString()
    // );

    await cfg.db.sadd(`apiKey:${apiKey}:accounts`, accountId);

    const defaultSettings: RedisAccountSettings = RedisAccountSettingsSchema.parse({});

    await cfg.db.hset(`account:${accountId}:settings`, defaultSettings);

    return { apiKey, accountId, name };
};


export async function proveOwnership(apiKey: string, accountId: string): Promise<boolean> {
    const { accountIds } = await verifyApiKey(apiKey);
    return accountIds.includes(accountId);
};

export async function getAccountSettings(accountId: string) {
    if (!accountId) throw new Error("account id required");

    const data = await rdClient.hgetall(`account:${accountId}:settings`);
    if (!data || Object.keys(data).length === 0) throw new Error(`failed to get account settings: ${accountId}`);

    const parsed = AccountSettingsSchema.safeParse(data);
    if (!parsed.success) throw new Error(`Received invalid settings`);

    return parsed.data;
};

export async function updateAccountSettings(accountId: string, settings: AccountSettings) {
    if (!accountId) throw new Error("account id required");

    const parsed = RedisAccountSettingsSchema.safeParse(settings); // validated raw, converted to string
    if (!parsed.success) throw new Error(`Invalid settings: ${JSON.stringify(settings)}`);

    const validatedSettings = parsed.data;
    const key = `account:${accountId}:settings`;

    const exists = await rdClient.exists(key);
    if (!exists) throw new Error(`account not found`);

    await rdClient.hset(key, validatedSettings);
};
