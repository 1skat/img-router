import type { ApiConfig } from "@/configs/api_config";
import { BadRequestError } from "@/errors";
import { createApiKey } from "@/internal/db/redis";
import { respondWithJSON } from "@/utils/json";
import { tryCatchAsync } from "@/utils/try-catch";
import { Ratelimit } from "@upstash/ratelimit";

export async function handlerKeys(cfg: ApiConfig, req: Request) {
    const [body, err] = await tryCatchAsync(() => req.json());
    if (err) {
        throw new BadRequestError("Invalid JSON");
    };

    if (!body || typeof body !== "object") {
        throw new BadRequestError("Account name required");
    };

    const { name } = body;

    if (typeof name !== "string" || !name.trim() || !/^[a-z0-9-]+$/i.test(name)) {
        throw new BadRequestError("Invalid account name");
    }

    const res = await createApiKey(cfg, name);

    return respondWithJSON(201, res);
};

