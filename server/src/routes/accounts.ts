import { requireOwnership, withAuth } from "@/internal/auth/middleware";
import { createAccount, getAccountSettings, updateAccountSettings } from "@/internal/db/redis";
import { AccountSettingsSchema } from "@/internal/db/schema";
import { tryCatchAsync } from "@/utils/try-catch";
import Elysia, { t } from "elysia";

export const accountRoutes = new Elysia({ prefix: "/accounts" })
    .use(withAuth)
    .post("/", async ({ apiKey, set }) => {
        console.log(apiKey);
        const [accountId, err] = await tryCatchAsync(createAccount(apiKey));

        if (err) {
            set.status = 401;
            return { error: `failed to create account: ${err.message}` }
        }
        set.status = 201;
        return { accountId };
    })
    .group("/:id", (app) => app
        .use(requireOwnership)
        .get("/settings", async ({ params, set }) => {
            const [settings, err] = await tryCatchAsync(getAccountSettings(params.id));
            if (err) {
                set.status = 404;
                return { error: `failed to get settings: ${err.message}` }
            }

            set.status = 201;
            return settings;
        })
        .post("/settings", async ({ params, body, set }) => {
            const [_, err] = await tryCatchAsync(updateAccountSettings(params.id, body))
            if (err) {
                set.status = 404;
                return { error: `update settings: ${err.message}` };
            };

            set.status = 201;
        }, { body: AccountSettingsSchema })
    );
