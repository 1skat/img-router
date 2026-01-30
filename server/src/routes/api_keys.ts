import { createApiKey } from "@/internal/db/redis";
import { withConfig } from "@/middleware";
// import type { ApiAppWithConfig } from "@/middleware";
// import type { ApiAppWithConfig } from "@/middleware";
import { tryCatchAsync } from "@/utils/try-catch";
import { Elysia, t } from "elysia";

export const keyHandlers = new Elysia()
    .use(withConfig)
    .post("/keys", async ({ cfg, body, set }) => {
        const res = await createApiKey(cfg, body.name);
        set.status = 201;
        return res;
    }, {
        body: t.Object({
            name: t.String({
                pattern: "^[a-z0-9_-]{3,32}$"
            }),
        })
    });
