import type { ApiConfig } from "@/configs/api_config";
import { BadRequestError, NotFoundError, UserForbiddenError } from "@/errors";
import { generateAccountId } from "@/internal/auth/auth";
import { createAccount } from "@/internal/db/redis";
import { AccountSettingsSchema, RedisAccountSettingsSchema, type RedisAccountSettings } from "@/internal/db/schema";
import { withAuth, type AuthenticatedRequest } from "@/middleware";
import { respondWithJSON } from "@/utils/json";
import { tryCatchAsync } from "@/utils/try-catch";

export async function handlerCreateAccount(cfg: ApiConfig, req: Request) {
    const apiKey = (req as AuthenticatedRequest).apiKey;
    const [body, err] = await tryCatchAsync(() => req.json());
    if (err) {
        throw new BadRequestError("Invalid JSON");
    }
    if (!body || typeof body !== "object") {
        throw new BadRequestError("Account name required");
    };

    const { name } = body;
    if (typeof name !== "string" || !name.trim() || !/^[a-z0-9-]+$/i.test(name)) {
        throw new BadRequestError("Invalid account name");
    };

    const newAccountId = generateAccountId();

    const ok = await cfg.db.set(`accountName:${name}`, newAccountId, "NX");
    if (!ok) {
        throw new BadRequestError("Account name already taken");
    }

    await cfg.db.sadd(`apiKey:${apiKey}:accounts`, newAccountId);

    const defaultSettings: RedisAccountSettings = RedisAccountSettingsSchema.parse({});
    await cfg.db.hset(`account:${newAccountId}:settings`, defaultSettings);

    return respondWithJSON(201, { apiKey, newAccountId, name });
};

export async function handlerGetAccountSettings(cfg: ApiConfig, req: Request) {
    const id = (req as AuthenticatedRequest).accountId;
    const exists = await cfg.db.exists(`account:${id}:settings`);
    if (!exists) {
        throw new NotFoundError("Account settings not found");
    };
    const data = await cfg.db.hgetall(`account:${id}:settings`);

    const parsed = AccountSettingsSchema.safeParse(data);
    if (!parsed.success) throw new Error(`Received invalid settings`);

    return respondWithJSON(200, parsed.data);
};

