import { tryCatchAsync } from "@/utils/try-catch";
import Elysia from "elysia";
import { proveOwnership, verifyApiKey } from "@/internal/db/redis"

export const requireApiKey = new Elysia({ name: "auth" })
    .derive(async ({ headers, set }) => {
        const apiKey = headers["x-api-key"];
        if (!apiKey) {
            set.status = 401;
            throw new Error("missing X-API-KEY header")
        }

        const [_, err] = await tryCatchAsync(verifyApiKey(apiKey));
        if (err) {
            set.status = 401;
            throw new Error("invalid api key")
        }

        return { apiKey }
    });

export const requireOwnership = new Elysia({ name: "ownernship" })
    .use(requireApiKey)
    .derive(async ({ apiKey, params, set }) => {
        const accountId = params.id; // from the url content
        if (!accountId) throw new Error("account id required");

        const owns = await proveOwnership(apiKey, accountId);
        if (!owns) {
            set.status = 403;
            throw new Error("access deined");
        };
    })

