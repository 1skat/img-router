import type { BunRequest } from "bun";
import type { ApiConfig } from "./configs/api_config";
import { UserForbiddenError, UserNotAuthenticatedError } from "./errors";
import { tryCatchAsync } from "./utils/try-catch";
import { verifyApiKey } from "./internal/db/redis";
import { respondWithJSON } from "./utils/json";

type HandlerWithConfig = (cfg: ApiConfig, req: Request) => Promise<Response>;

export function withConfig(cfg: ApiConfig, handler: HandlerWithConfig) {
    return (req: BunRequest) => handler(cfg, req);
};

export function withAuth(
    next: (req: Request) => Response | Promise<Response>,
): (req: Request) => Promise<Response> {
    return async function (req: Request): Promise<Response> {
        const apiKey = req.headers.get("x-api-key");
        if (!apiKey) {
            throw new UserNotAuthenticatedError("Missing x-api-key header");
        };

        const [_, err] = await tryCatchAsync(() => verifyApiKey(apiKey));
        if (err) {
            throw new UserNotAuthenticatedError("Invalid API key");
        };

        return await next(req);
    };
};

