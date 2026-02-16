import { requireOwnership, withAuth, withConfig } from "@/middleware";
import Elysia from "elysia";
import sharp from "sharp";
import z from "zod";

export const imageHandlers = new Elysia() // e.g /api/danny004/upload
    .use(withConfig)
    .derive(withAuth)
    .group(":accountName/", (app) => app
        .derive(requireOwnership)
        .post("/upload", async ({ cfg, accountId, accountName, body }) => {
            const { file, fileName, folder, isPrivate, transformations } = body;

            const buf = await file.arrayBuffer();
            const metadata = await sharp(buf).metadata();

            const normalizedFolder = folder.replace(/^\/+|\/+$/g, '') + '/';
            const s3Key = `${accountId}/${normalizedFolder}/${fileName}`;

            await cfg.s3.write(s3Key, buf);

            await cfg.db.safeInsertImage({
                accountId: accountId,
                path: s3Key,
                isPrivate: isPrivate,
                transformations: transformations ?? null,
                fileSize: metadata.size,
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                folder: folder,
                fileName: fileName,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }, {
            body: z.object({
                file: z.instanceof(File),
                fileName: z.string(),
                folder: z.string().default("/"),
                isPrivate: z.boolean().default(false),
                transformations: z.string().optional(),
            })
        })
    );

