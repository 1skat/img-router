import { createApiKey } from "@/internal/db/redis";
import type { ApiAppWithConfig } from "@/middleware";
import { tryCatchAsync } from "@/utils/try-catch";
import Elysia, { t } from "elysia";

const reqBody = t.Object({
    name: t.String({
        pattern: "^[a-z0-9_-]{3,32}$"
    }),
});

export const keyHandlers = (app: ApiAppWithConfig) =>
    app.post("/keys", async ({ cfg, body, set }) => {
        const res = await createApiKey(cfg, body.name);
        set.status = 201;
        return res;
    }, { body: reqBody });
