import { setAccountSettings } from "@/db/redis";
import type { AccountSettings } from "@/db/schema";
import { tryCatch, tryCatchAsync } from "@/utils/try-catch";
import Elysia from "elysia";

export const adminRoutes = new Elysia({ prefix: "/admin" })
    .post("/account/:id/settings", async (c) => {
        const accId = c.params.id;
        const settings = c.body as AccountSettings;
        const [_, err] = await tryCatchAsync(setAccountSettings(accId, settings));

        if (err) {
            c.set.status = 400;
            return { error: err.message }
        };

        c.set.status = 200
        return { success: true };
    });
