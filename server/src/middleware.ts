import type { BunRequest } from "bun";
import type { ApiConfig } from "./config";
import { BadRequestError, NotFoundError, UserForbiddenError, UserNotAuthenticatedError } from "./errors";
import { tryCatchAsync } from "./utils/try-catch";
import { respondWithJSON } from "./utils/response";

type HandlerWithConfig = (cfg: ApiConfig, req: Request) => Promise<Response>;

export interface AuthenticatedRequest extends Request {
    apiKey?: string;
    accountId?: string;
};

export function withConfig(cfg: ApiConfig, handler: HandlerWithConfig) {
    return (req: BunRequest) => handler(cfg, req);
};

export function withAuth(
    next: HandlerWithConfig,
): HandlerWithConfig {
    return async function (cfg: ApiConfig, req: Request): Promise<Response> {
        const apiKey = req.headers.get("X-API-KEY");
        if (!apiKey) {
            throw new UserNotAuthenticatedError("Missing X-API-KEY header");
        };

        const exists = await cfg.db.exists(`apiKey:${apiKey}`);
        if (!exists) {
            throw new UserForbiddenError("Forbidden");
        };

        (req as AuthenticatedRequest).apiKey = apiKey;

        return await next(cfg, req);
    };
};

export function requireOwnership(
    next: HandlerWithConfig
): HandlerWithConfig {
    return async function (cfg: ApiConfig, req: Request): Promise<Response> {
        const apiKey = (req as AuthenticatedRequest).apiKey;
        const accountName = new URL(req.url).pathname.split("/").filter(Boolean)[2];
        if (!accountName || !/^[a-z0-9-]+$/i.test(accountName)) {
            throw new BadRequestError("Invalid account name");
        };

        const accountId = await cfg.db.get(`accountName:${accountName}`);
        if (!accountId) {
            throw new NotFoundError("Account name not found");
        };

        const ok = await cfg.db.sismember(`apiKey:${apiKey}:accounts`, accountId);
        if (!ok) {
            throw new UserForbiddenError("Forbidden");
        }

        (req as AuthenticatedRequest).accountId = accountId;

        return await next(cfg, req);
    };
};

export function handlerServerError(err: unknown) {
    let statusCode = 500;
    let message = "Something went wrong on our end";

    if (err instanceof BadRequestError) {
        statusCode = 400;
        message = err.message;
    }
    else if (err instanceof UserNotAuthenticatedError) {
        statusCode = 401;
        message = err.message;
    }
    else if (err instanceof UserForbiddenError) {
        statusCode = 403;
        message = err.message;
    }
    else if (err instanceof NotFoundError) {
        statusCode = 404;
        message = err.message;
    }
    if (statusCode >= 500) {
        message = ((err: unknown) => {
            if (typeof err === "string") return err;
            if (err instanceof Error) return err.message;
            return "Unknown message occured";
        })(err);
    };

    return respondWithJSON(statusCode, message);
};

