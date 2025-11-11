import { RedisClient } from "bun";
import { AccountSettingsSchema, type AccountSettings } from "@/db/schema";

const rdClient = new RedisClient("redis://redis:6379");

export async function connectRedis() {
    try {
        await rdClient.connect();
    } catch (err) {
        console.error("Failed to connect to redis", err);
        process.exit(1);
    }
};

export async function getAccountSettings(accountId: string) {
    if (!accountId) throw new Error("account id required");

    const data = await rdClient.hgetall(`account:${accountId}`);
    if (!data || Object.keys(data).length === 0) throw new Error(`failed to get account settings: ${accountId}`);

    const parsed = AccountSettingsSchema.safeParse(data);
    if (!parsed.success) throw new Error(`Received invalid settings`);

    return parsed.data;
};

export async function setAccountSettings(accountId: string, settings: AccountSettings) {
    if (!accountId) throw new Error("account id required");

    const parsed = AccountSettingsSchema.safeParse(settings);
    if (!parsed.success) throw new Error(`Invalid settings: ${JSON.stringify(settings)}`);

    const validatedSettings = parsed.data;
    const key = `account:${accountId}`;

    const exists = await rdClient.exists(key);
    if (!exists) throw new Error(`account ${accountId} does not exist`);

    await rdClient.hset(
        key,
        Object.fromEntries(
            Object.entries(validatedSettings).map(([k, v]) => [k, String(v)])
        ));
};


