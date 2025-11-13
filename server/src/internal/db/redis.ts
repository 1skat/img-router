import { AccountSettingsSchema, RedisAccountSettingsSchema, type AccountSettings, type RedisAccountSettings } from "@/internal/db/schema";
import { generateAccountId, generateApiKey } from "@/internal/auth/auth";
import { tryCatchAsync } from "@/utils/try-catch";
import { RedisClient } from "bun";

const rdClient = new RedisClient("redis://localhost:6379");

export async function connectRedis() {
    try {
        await rdClient.connect();
    } catch (err) {
        console.error("Failed to connect to redis", err);
        process.exit(1);
    }
};

export async function createApiKey(name?: string) {
    const apiKey = generateApiKey();
    const accountId = generateAccountId();

    await rdClient.hset(`apiKey:${apiKey}`, {
        name: name ?? "anon",
        createdAt: new Date().toISOString(),
        accountIds: JSON.stringify([accountId]),
    });

    const defaultSettings: RedisAccountSettings = RedisAccountSettingsSchema.parse({});

    await rdClient.hset(`account:${accountId}:settings`, defaultSettings);

    return { apiKey, accountId };
};

export async function verifyApiKey(apiKey: string) {
    const data = await rdClient.hgetall(`apiKey:${apiKey}`);
    const { name, accountIds } = data;
    if (!name || !accountIds) throw new Error("invalid api key");

    return { name: name, accountIds: JSON.parse(accountIds) };
};

export async function createAccount(apiKey: string) {
    const [data, dataErr] = await tryCatchAsync(verifyApiKey(apiKey));
    if (dataErr) throw new Error(`create account: ${dataErr.message}`);

    const newAccountId = generateAccountId();
    data.accountIds.push(newAccountId);

    await rdClient.hset(`apikey:${apiKey}`, {
        accountIds: JSON.stringify(data.accountIds),
    });

    const defaultSettings: RedisAccountSettings = RedisAccountSettingsSchema.parse({});
    await rdClient.hset(`account:${newAccountId}:settings`, defaultSettings);

    return newAccountId;
};

export async function proveOwnership(apiKey: string, accountId: string): Promise<boolean> {
    const { accountIds } = await verifyApiKey(apiKey);
    return accountIds.includes(accountId);
};

export async function getAccountSettings(accountId: string) {
    if (!accountId) throw new Error("account id required");

    const data = await rdClient.hgetall(`account:${accountId}:settings`);
    if (!data || Object.keys(data).length === 0) throw new Error(`failed to get account settings: ${accountId}`);
    console.log(`data: ${JSON.stringify(data)}`);

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
