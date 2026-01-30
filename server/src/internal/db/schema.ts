import z from "zod";

const DEFAULT_IMG_QUALITY = 80;

export function zodToRedis<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
    return schema.transform(obj => Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, String(v)])
    ));
}

export const AccountSettingsSchema = z.object({
    useBestFormat: z.coerce.boolean().default(true),
    defaultQuality: z.coerce.number().min(10).max(100).default(DEFAULT_IMG_QUALITY),
    dataSaveMode: z.coerce.boolean().default(false),
}).strict();

export type AccountSettings = z.infer<typeof AccountSettingsSchema>;

export const RedisAccountSettingsSchema = zodToRedis(AccountSettingsSchema);
export type RedisAccountSettings = z.infer<typeof RedisAccountSettingsSchema>;


