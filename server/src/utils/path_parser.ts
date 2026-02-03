import { BadRequestError } from "@/errors";
import { z } from "zod";

const PathMatchSchema = z.object({
    full: z.string(),
    accountName: z.string().min(1),
    fnString: z.string().optional(),
    assetPath: z.string().min(1),
});

export function parsePath(fullPath: string): { accountName: string, fnString: string | null, assetPath: string } {
    const match = fullPath.match(/^\/?([^/]+)\/(?:fn:([^/]+)\/)?(.+)$/);
    if (!match) {
        throw new BadRequestError("Invalid path");
    };

    const pathMatch = PathMatchSchema.safeParse({
        full: match[0],
        accountName: match[1],
        fnString: match[2],
        assetPath: match[3],
    });

    if (!pathMatch.success) {
        throw new BadRequestError("Invalid path");
    };

    return {
        accountName: pathMatch.data.accountName,
        fnString: pathMatch.data.fnString ?? null,
        assetPath: pathMatch.data.assetPath,
    };
};
