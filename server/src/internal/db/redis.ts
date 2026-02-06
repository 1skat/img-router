import type { ApiConfig } from "@/config";
import { NotFoundError } from "elysia";
import { AccountSettingsSchema, RedisAccountSettingsSchema, type AccountSettings, type RedisAccountSettings } from "./schema";
import { generateAccountId, generateApiKey } from "../auth/auth";
import { BadRequestError, UserForbiddenError } from "@/errors";
import { tryCatchAsync } from "@/utils/try-catch";
import crypto from 'crypto';
import { keyHandlers } from "@/routes/api_keys";

export async function getAccountSettings(cfg: ApiConfig, accountId: string) {
    const cachedLRU = cfg.lruCaches.settings.get(accountId);
    if (cachedLRU) return cachedLRU;

    const cachedRedis = await cfg.rsCache.get(`settings:${accountId}`);
    if (cachedRedis) {
        const parsedSettings = AccountSettingsSchema.parse(JSON.parse(cachedRedis));
        cfg.lruCaches.settings.set(accountId, parsedSettings);
        return parsedSettings;
    };

    const doc = await cfg.db.settings.findOne({ accountId });
    if (!doc) {
        throw new NotFoundError("Account settings not found");
    };

    await cfg.rsCache.setex(`settings:${accountId}`, 3600, JSON.stringify(doc.settings));
    cfg.lruCaches.settings.set(accountId, doc.settings);

    return doc.settings;
};

export async function updateAccountSettings(cfg: ApiConfig, accountId: string, newSettings: AccountSettings) {
    const res = await cfg.db.updateSettings(accountId, newSettings);
    if (res.matchedCount === 0) {
        throw new Error("Account settings not found");
    };
    await cfg.rsCache.del(`settings:${accountId}`);
    cfg.lruCaches.settings.delete(accountId);

    return newSettings;
};

export function hashApiKey(apiKey: string): string {
    return crypto
        .createHash('sha256')
        .update(apiKey)
        .digest('hex');
}
export async function createApiKey(cfg: ApiConfig, accountName: string) {
    const apiKey = generateApiKey();
    const hashedKey = hashApiKey(apiKey);
    const accountId = generateAccountId();

    const exists = await cfg.db.accounts.findOne({ name: accountName });
    if (exists) {
        throw new BadRequestError("Account name already taken");
    };

    cfg.db.safeInsertApiKey({
        keyHash: hashedKey,
        accountId,
        createdAt: new Date(),
    });

    await cfg.db.safeInsertAccount({
        id: accountId,
        name: accountName,
        createdAt: new Date(),
    });

    const defaultSettings = AccountSettingsSchema.parse({});
    await cfg.db.safeInsertSettings({
        accountId,
        settings: defaultSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    await cfg.rsCache.setex(`accountName:${accountName}`, 3600, accountId)
    await cfg.rsCache.setex(`accountId:${accountId}`, 3600, accountName);
    await cfg.rsCache.setex(`settings:${accountId}`, 3600, JSON.stringify(defaultSettings));
    cfg.lruCaches.accounts.set(accountName, accountId);
    cfg.lruCaches.accounts.set(accountId, accountName);
    cfg.lruCaches.settings.set(accountId, defaultSettings);

    return { apiKey, accountId, accountName };
};

export async function getAccountIdFromName(cfg: ApiConfig, accountName: string): Promise<string> {
    const cachedLru = cfg.lruCaches.accounts.get(accountName);
    if (cachedLru) return cachedLru;

    const cachedRedis = await cfg.rsCache.get(`accountName:${accountName}`);
    if (cachedRedis) return cachedRedis;

    const account = await cfg.db.accounts.findOne({ name: accountName });
    if (!account) {
        throw new NotFoundError("Account name not found");
    };

    cfg.lruCaches.accounts.set(accountName, account.id);
    cfg.lruCaches.accounts.set(account.id, accountName);
    await cfg.rsCache.setex(`accountName:${accountName}`, 3600, account.id)
    await cfg.rsCache.setex(`accountId:${account.id}`, 3600, accountName);

    return account.id;
};


