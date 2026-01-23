// import type { ApiConfig } from "@/config";
// import { BadRequestError } from "@/errors";
// import { generateAccountId, generateApiKey } from "@/internal/auth/auth";
// import { createApiKey } from "@/internal/db/redis";
// import { RedisAccountSettingsSchema, type RedisAccountSettings } from "@/internal/db/schema";
// import { respondWithJSON } from "@/utils/response";
// import { tryCatchAsync } from "@/utils/try-catch";
// import { Ratelimit } from "@upstash/ratelimit";

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

