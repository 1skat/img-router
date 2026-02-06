import type { Collection } from "mongodb";
import z from "zod";

// export function zodToRedis<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
//     return schema.transform(obj => Object.fromEntries(
//         Object.entries(obj).map(([k, v]) => [k, String(v)])
//     ));
// };

export const AccountSettingsSchema = z.object({
    useBestFormat: z.coerce.boolean().default(true),
    defaultQuality: z.coerce.number().min(10).max(100).default(80),
    dataSaveMode: z.coerce.boolean().default(false),
}).strict();

export type AccountSettings = z.infer<typeof AccountSettingsSchema>;

// export const RedisAccountSettingsSchema = zodToRedis(AccountSettingsSchema);
// export type RedisAccountSettings = z.infer<typeof RedisAccountSettingsSchema>;

export const ApiKeyDocSchema = z.object({
    keyHash: z.string(),
    accountId: z.string(),
    createdAt: z.date(),
});

export const AccountDocSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.date(),
});

export const AccountSettingsDocSchema = z.object({
    accountId: z.string(),
    settings: AccountSettingsSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type AccountDoc = z.infer<typeof AccountDocSchema>;
export type AccountSettingsDoc = z.infer<typeof AccountSettingsDocSchema>;
export type ApiKeyDoc = z.infer<typeof ApiKeyDocSchema>;





