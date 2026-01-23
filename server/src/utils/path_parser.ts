import { BadRequestError } from "@/errors";
import { z } from "zod";

const PathMatchSchema = z.object({
    full: z.string(),
    accountId: z.string().min(1),
    fnString: z.string().optional(),
    assetPath: z.string().min(1),
});

export function parsePath(fullPath: string): { accountId: string, fnString: string | null, assetPath: string } {
    const match = fullPath.match(/^\/?([^/]+)\/(?:fn:([^/]+)\/)?(.+)$/);
    if (!match) {
        throw new BadRequestError("Invalid path");
    };

    const pathMatch = PathMatchSchema.safeParse({
        full: match[0],
        accountId: match[1],
        fnString: match[2],
        assetPath: match[3],
    });

    if (!pathMatch.success) {
        throw new BadRequestError("Invalid path");
    };

    return {
        accountId: pathMatch.data.accountId,
        fnString: pathMatch.data.fnString ?? null,
        assetPath: pathMatch.data.assetPath,
    };
};
