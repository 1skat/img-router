import { z } from "zod";

const PathMatchSchema = z.object({
    full: z.string(),
    accountId: z.string(),
    trString: z.string().optional(),
    assetPath: z.string(),
});

export function parsePath(fullPath: string): { accountId: string, trString: string | null, assetPath: string } {
    const match = fullPath.match(/^\/?([^/]+)\/(?:tr:([^/]+)\/)?(.+)$/);
    if (!match) throw new Error("Invalid path");

    const pathMatch = PathMatchSchema.safeParse({
        full: match[0],
        accountId: match[1],
        trString: match[2],
        assetPath: match[3],
    });

    if (!pathMatch.success) throw new Error("parsePath:", pathMatch.error);

    return {
        accountId: pathMatch.data.accountId,
        trString: pathMatch.data.trString ?? null,
        assetPath: pathMatch.data.assetPath,
    };
};
