import type { Collection } from "mongodb";
import z from "zod";

export const AccountSettingsSchema = z.object({
    useBestFormat: z.coerce.boolean().default(true),
    defaultQuality: z.coerce.number().min(10).max(100).default(80),
    dataSaveMode: z.coerce.boolean().default(false),
}).strict();
export type AccountSettings = z.infer<typeof AccountSettingsSchema>;


export const ApiKeyDocSchema = z.object({
    keyHash: z.string(),
    accountId: z.string(),
    createdAt: z.date(),
});
export type AccountDoc = z.infer<typeof AccountDocSchema>;

export const AccountDocSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.date(),
});
export type ApiKeyDoc = z.infer<typeof ApiKeyDocSchema>;

export const AccountSettingsDocSchema = z.object({
    accountId: z.string(),
    settings: AccountSettingsSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
});
export type AccountSettingsDoc = z.infer<typeof AccountSettingsDocSchema>;






