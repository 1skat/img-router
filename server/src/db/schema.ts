import z from "zod";

export const AccountSettingsSchema = z.object({
    useBestFormat: z.boolean(),
    defaultQuality: z.number().min(10).max(100),
    dataSaveMode: z.boolean(),
});

export type AccountSettings = z.infer<typeof AccountSettingsSchema>;
