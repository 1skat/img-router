import { createApiKey } from "@/internal/db/redis";
import Elysia, { t } from "elysia";

const reqBody = t.Object({
    name: t.Optional(t.String())
})

export const keyRoutes = new Elysia()
    .post("/keys",
        async ({ body, set }) => {
            const res = await createApiKey(body.name);
            set.status = 201;
            return res;
        }, { body: reqBody }
    );
