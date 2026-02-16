import { getAccountSettings, updateAccountSettings } from "@/internal/db";
import { AccountSettingsSchema } from "@/internal/schema";
import { requireOwnership, withAuth, withConfig } from "@/middleware";
import Elysia from "elysia";
import z from "zod";

export const accountHandlers = new Elysia()
    .use(withConfig)
    .derive(withAuth)
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
