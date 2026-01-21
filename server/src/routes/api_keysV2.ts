import type { ApiConfig } from "@/configs/api_config";
import { BadRequestError } from "@/errors";
import { createApiKey } from "@/internal/db/redis";
import { respondWithJSON } from "@/utils/json";
import { Ratelimit } from "@upstash/ratelimit";

export async function handlerKeys(cfg: ApiConfig, req: Request) {
    const { name } = await req.json();
    if (!name) {
        throw new BadRequestError("Account name required");
    };
    const res = await createApiKey(name);

    return respondWithJSON(201, res);
};
