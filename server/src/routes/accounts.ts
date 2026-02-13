import { getAccountSettings, updateAccountSettings } from "@/internal/db";
import { AccountSettingsSchema } from "@/internal/schema";
import { requireOwnership, withAuth, withConfig } from "@/middleware";
import Elysia from "elysia";
import z from "zod";

export const accountHandlers = new Elysia()
    .use(withConfig)
    .derive(withAuth)
    // .post("/account", async ({ cfg, apiKey, set, body }) => {
    //     const res = await createAccount(cfg, apiKey, body.name);
    //     set.status = 201;
    //     return res;
    // }, {
    //     body: t.Object({
    //         name: t.String({ pattern: "^[a-z0-9_-]{3,32}$" }),
    //     })
    // })
    .group("account/:accountName", (app) => app
        .derive(requireOwnership)
        .get("/settings", async ({ cfg, accountId, accountName }) => {
            return await getAccountSettings(cfg, accountId);
        })
        .post("/settings", async ({ cfg, accountId, body }) => {
            return await updateAccountSettings(cfg, accountId, body.settings);
        }, {
            body: z.object({
                settings: AccountSettingsSchema,
            }),
        }),
    );
