import { requireApiKey, requireOwnership } from "@/internal/auth/middleware";
import { createAccount, getAccountSettings, updateAccountSettings } from "@/internal/db/redis";
import { AccountSettingsSchema, type AccountSettings } from "@/internal/db/schema";
import Elysia, { t } from "elysia";

export const accountRoutes = new Elysia({ prefix: "/accounts" })
    .use(requireApiKey)
    .post("/", async ({ apiKey, set }) => {
        const accountId = createAccount(apiKey);
        set.status = 201;
        return { accountId };
    })

    .use(requireOwnership)
    .get("/:id/settings", async ({ params }) => {
        return await getAccountSettings(params.id)
    })
    .post("/:id/settings", async ({ params, body }) => {
        await updateAccountSettings(params.id, body)
        return { success: true };
    }, { body: AccountSettingsSchema })


