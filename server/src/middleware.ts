import type { BunRequest } from "bun";
import { cfg, type ApiConfig } from "./config";
import { tryCatchAsync } from "./utils/try-catch";
import { respondWithJSON } from "./utils/response";
import { checkOwnership } from "./internal/db/redis";
import Elysia, { NotFoundError, type ErrorHandler } from 'elysia';
import { BadRequestError, UserForbiddenError, UserNotAuthenticatedError } from "./errors";


// type HandlerWithConfig = (cfg: ApiConfig, req: Request) => Promise<Response>;

// export interface AuthenticatedRequest extends Request {
//     apiKey?: string;
//     accountId?: string;
// };

// export function withConfig(cfg: ApiConfig, handler: HandlerWithConfig) {
//     return (req: BunRequest) => handler(cfg, req);
// };

// export const withAuthV2 = (app: ApiAppWithConfig) =>
//     app.derive(async ({ cfg, headers, set }) => {

//         const apiKey = headers["x-api-key"];
//         if (!apiKey) {
//             throw new UserNotAuthenticatedError("Missing x-api-key header");
//         };

//         const exists = await cfg.db.exists(`apiKey:${apiKey}`);
//         if (!exists) {
//             throw new UserForbiddenError("Forbidden");
//         };

//         return { apiKey };
//     });

export const withAuth = async ({ cfg, headers }: {
    cfg: ApiConfig,
    headers: Record<string, string | undefined>,
}) => {
    const apiKey = headers["x-api-key"];
    if (!apiKey) {
        throw new UserNotAuthenticatedError("Missing x-api-key header");
    };

    const exists = await cfg.db.exists(`apiKey:${apiKey}`);
    if (!exists) {
        throw new UserForbiddenError("Forbidden");
    };

    return { apiKey };
};

export const requireOwnership = async ({ cfg, apiKey, params }: {
    cfg: ApiConfig,
    apiKey: string,
    params: { accountName: string },
}) => {
    // Account name exists globaly
    const accountId = await cfg.db.get(`accountName:${params.accountName}`);
    if (!accountId) {
        throw new NotFoundError("Account name not found");
    };

    // Account name belongs to the API key
    const ok = await cfg.db.sismember(`apiKey:${apiKey}:accounts`, accountId);
    if (!ok) {
        throw new UserForbiddenError("Forbidden");
    };

    return { accountId };
};


// export function withAuth(
//     next: HandlerWithConfig,
// ): HandlerWithConfig {
//     return async function (cfg: ApiConfig, req: Request): Promise<Response> {
//         const apiKey = req.headers.get("X-API-KEY");
//         if (!apiKey) {
//             throw new UserNotAuthenticatedError("Missing X-API-KEY header");
//         };

//         const exists = await cfg.db.exists(`apiKey:${apiKey}`);
//         if (!exists) {
//             throw new UserForbiddenError("Forbidden");
//         };

//         (req as AuthenticatedRequest).apiKey = apiKey;

//         return await next(cfg, req);
//     };
// };

// function getPathSegments(req: Request): string[] {
//     return new URL(req.url).pathname.split("/").filter(Boolean);
// };

// export function requireOwnership(
//     next: HandlerWithConfig
// ): HandlerWithConfig {
//     return async function (cfg: ApiConfig, req: Request): Promise<Response> {
//         const apiKey = (req as AuthenticatedRequest).apiKey;
//         const accountName = new URL(req.url).pathname.split("/").filter(Boolean)[2];
//         // if (!accountName || !/^[a-z0-9-]+$/i.test(accountName)) {
//         //     throw new BadRequestError("Invalid account name");
//         // };

//         // await checkOwnership(cfg, apiKey, accountName);
//         const accountId = await cfg.db.get(`accountName:${accountName}`);
//         if (!accountId) {
//             throw new NotFoundError("Account name not found");
//         };

//         const ok = await cfg.db.sismember(`apiKey:${apiKey}:accounts`, accountId);
//         if (!ok) {
//             throw new UserForbiddenError("Forbidden");
//         }

//         (req as AuthenticatedRequest).accountId = accountId;

//         return await next(cfg, req);
//     };
// };

// app.derive(async ({ cfg, apiKey }) => {

//     });
// export function handlerServerError(err: unknown) {
//     let statusCode = 500;
//     let message = "Something went wrong on our end";

//     if (err instanceof BadRequestError) {
//         statusCode = 400;
//         message = err.message;
//     }
//     else if (err instanceof UserNotAuthenticatedError) {
//         statusCode = 401;
//         message = err.message;
//     }
//     else if (err instanceof UserForbiddenError) {
//         statusCode = 403;
//         message = err.message;
//     }
//     else if (err instanceof NotFoundError) {
//         statusCode = 404;
//         message = err.message;
//     }
//     if (statusCode >= 500) {
//         message = ((err: unknown) => {
//             if (typeof err === "string") return err;
//             if (err instanceof Error) return err.message;
//             return "Unknown message occured";
//         })(err);
//     };

//     return respondWithJSON(statusCode, message);
// };

type SingletonWithCfg = {
    decorator: {
        cfg: ApiConfig;
    };
    store: Record<string, any>
    derive: Record<string, any>
    resolve: Record<string, any>
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
