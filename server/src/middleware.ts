import type { BunRequest } from "bun";
import { cfg, type ApiConfig } from "./config";
import { tryCatchAsync } from "./utils/try-catch";
import { respondWithJSON } from "./utils/response";
import Elysia, { NotFoundError, type ErrorHandler } from 'elysia';
import { BadRequestError, UserForbiddenError, UserNotAuthenticatedError } from "./errors";
import { getAccountIdFromName, hashApiKey } from "./internal/db/redis";
import { accountHandlers } from "./routes/accounts";

async function verifyApiKey(cfg: ApiConfig, apiKey: string) {
    const hashedKey = hashApiKey(apiKey);
    const cachedLru = cfg.lruCaches.apiKeys.get(hashedKey);
    if (cachedLru) return cachedLru;

    const cachedRedis = await cfg.rsCache.get(`apiKeyHash:${hashedKey}:accountId`);
    if (cachedRedis) return cachedRedis;

    const doc = await cfg.db.apiKeys.findOne({ keyHash: hashedKey });
    if (!doc) return;

    cfg.lruCaches.apiKeys.set(hashedKey, doc.accountId);
    await cfg.rsCache.set(`apiKeyHash:${hashedKey}:accountId`, doc.accountId);

    return doc.accountId;
};

export const withAuth = async ({ cfg, headers }: {
    cfg: ApiConfig,
    headers: Record<string, string | undefined>,
}) => {
    const apiKey = headers["x-api-key"];
    if (!apiKey) {
        throw new UserNotAuthenticatedError("Missing x-api-key header");
    };

    const accountId = await verifyApiKey(cfg, apiKey);
    if (!accountId) {
        throw new UserForbiddenError("Forbidden");
    }

    return { apiKey, accountId };
};

export const requireOwnership = async ({ cfg, accountId, params }: {
    cfg: ApiConfig,
    accountId: string,
    params: { accountName: string },
}) => {
    const reqAccountId = await getAccountIdFromName(cfg, params.accountName);
    if (accountId !== reqAccountId) {
        throw new UserForbiddenError("Forbidden");
    };

    return { accountId, accountName: params.accountName };
};

export const handlerServerError: ErrorHandler = ({ code, error, set }) => {
    set.status = 500;
    let message = "Something went wrong on our end";

    if (code === 'VALIDATION') {
        set.status = 400;
        message = "Bad request"
    }
    else if (error instanceof BadRequestError) {
        set.status = 400;
        message = error.message;
    } else if (error instanceof UserNotAuthenticatedError) {
        set.status = 401;
        message = error.message;
    } else if (error instanceof UserForbiddenError) {
        set.status = 403;
        message = error.message;
    } else if (error instanceof NotFoundError) {
        set.status = 404;
        message = error.message;
    } else if (cfg.bunEnv !== "production") {
        if (error instanceof Error) message = error.message;
        else if (typeof error === "string") message = error;
    };

    return { error: message };
};

export const withConfig = new Elysia()
    .decorate("cfg", cfg);
