import type { ApiConfig } from "@/config";
import { BadRequestError, NotFoundError, UserForbiddenError } from "@/errors";
import { generateAccountId } from "@/internal/auth/auth";
import { getAccountSettings, updateAccountSettings } from "@/internal/db/redis";
// import { createAccount, createApiKey, getAccountSettings, updateAccountSettings } from "@/internal/db/redis";
import { AccountSettingsSchema, RedisAccountSettingsSchema, type RedisAccountSettings } from "@/internal/db/schema";
import { requireOwnership, withAuth, withConfig } from "@/middleware";
// import { requireOwnership, requireOwnershipV2, withAuth, withAuthV2, withConfig, type ApiAppWithConfig, type AuthenticatedRequest } from "@/middleware";
import { respondWithJSON } from "@/utils/response";
import { tryCatchAsync } from "@/utils/try-catch";
import Elysia, { t } from "elysia";
import z from "zod";

// export async function handlerCreateAccount(cfg: ApiConfig, req: Request) {
//     const apiKey = (req as AuthenticatedRequest).apiKey;
//     const [body, err] = await tryCatchAsync(() => req.json());
//     if (err) {
//         throw new BadRequestError("Invalid JSON");
//     }
//     if (!body || typeof body !== "object") {
//         throw new BadRequestError("Account name required");
//     };

//     const { name } = body;
//     if (typeof name !== "string" || !name.trim() || !/^[a-z0-9-]+$/i.test(name)) {
//         throw new BadRequestError("Invalid account name");
//     };

//     const res = createAccount(cfg, apiKey, name);

//     return respondWithJSON(201, res);
// };

// export async function handlerGetAccountSettings(cfg: ApiConfig, req: Request) {
//     const id = (req as AuthenticatedRequest).accountId;
//     const settings = await getAccountSettings(cfg, id);

//     return respondWithJSON(200, settings);
// };

// export async function handlerUpdateAccountSettings(cfg: ApiConfig, req: Request) {
//     const id = (req as AuthenticatedRequest).accountId;
//     const [body, err] = await tryCatchAsync(() => req.json());
//     if (err) {
//         throw new BadRequestError("Invalid JSON");
//     };
//     if (!body || typeof body !== "object") {
//         throw new BadRequestError("Settings required");
//     };

//     const { settings } = body;
//     const newSettings = await updateAccountSettings(cfg, id, settings)
//     return respondWithJSON(200, newSettings);
//     // const exists = await cfg.db.exists(`account:${id}:settings`);
//     // if (!exists) {
//     //     throw new NotFoundError("Account settings not found");
//     // };


//     // const parsedSettings = RedisAccountSettingsSchema.safeParse(settings);
//     // if (!parsedSettings.success) {
//     //     throw new BadRequestError(`Invalid settings: ${JSON.stringify(settings)}`);
//     // };

//     // const newSettings = parsedSettings.data;
//     // await cfg.db.hset(`account:${id}:settings`, newSettings)

// };

// export async function handlerKeys(cfg: ApiConfig, req: Request) {
//     const [body, err] = await tryCatchAsync(() => req.json());
//     if (err) {
//         throw new BadRequestError("Invalid JSON");
//     };

//     if (!body || typeof body !== "object") {
//         throw new BadRequestError("Account name required");
//     };

//     const { name } = body;
//     if (typeof name !== "string" || !name.trim() || !/^[a-z0-9-]+$/i.test(name)) {
//         throw new BadRequestError("Invalid account name");
//     }

//     const res = await createApiKey(cfg, name);
//     return respondWithJSON(201, res);
//     // const apiKey = generateApiKey();
//     // const accountId = generateAccountId();

//     // const ok = await cfg.db.set(`accountName:${name}`, accountId, "NX");
//     // if (!ok) {
//     //     throw new BadRequestError("Account name already taken");
//     // };

//     // await cfg.db.hset(`apiKey:${apiKey}`, {
//     //     createdAt: new Date().toISOString(),
//     // });

//     // await cfg.db.sadd(`apiKey:${apiKey}:accounts`, accountId);

//     // const defaultSettings: RedisAccountSettings = RedisAccountSettingsSchema.parse({});
//     // await cfg.db.hset(`account:${accountId}:settings`, defaultSettings);

// };

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

// .group("/:id", (app) => app
//     .use(requireOwnership)
//     .get("/settings", async ({ params, set }) => {
//         const [settings, err] = await tryCatchAsync(getAccountSettings(params.id));
//         if (err) {
//             set.status = 404;
//             return { error: `failed to get settings: ${err.message}` }
//         }

//         set.status = 201;
//         return settings;
//     })
//     .post("/settings", async ({ params, body, set }) => {
//         const [_, err] = await tryCatchAsync(updateAccountSettings(params.id, body));
//         if (err) {
//             set.status = 404;
//             return { error: `update settings: ${err.message}` };
//         };

//         set.status = 201;
//     }, { body: AccountSettingsSchema })
// );
