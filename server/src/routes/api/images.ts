import { BadRequestError } from "@/errors";
import { requireOwnership, withAuth, withConfig } from "@/middleware";
import Elysia from "elysia";
import sharp from "sharp";
import z from "zod";

export const imageHandlers = new Elysia() // e.g /api/danny004/upload
    .use(withConfig)
    .derive(withAuth)
    .group("/:accountName", (app) => app
        .derive(requireOwnership)
        .post("/upload", async ({ cfg, accountId, accountName, body }) => {
            const { file, fileName, folder, isPrivate, transformations } = body;
            console.log(fileName, folder, isPrivate, transformations);
            if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
                throw new BadRequestError("Invalid file type");
            };

            const buf = await file.arrayBuffer();
            // to-do: checl the file size done in cfg
            // validate transformations

            const metadata = await sharp(buf).metadata();

            const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
            console.log("normalized", normalizedFolder);
            const s3Key = `${accountId}/${normalizedFolder}/${fileName}`;

            await cfg.s3.write(s3Key, buf);

            await cfg.db.safeUpsertImage({
                accountId: accountId,
                path: s3Key,
                isPrivate: isPrivate,
                transformations: transformations ?? null,
                fileSize: metadata.size ?? buf.byteLength,
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                folder: folder,
                fileName: fileName,
            });

            return { url: `${accountName}/${normalizedFolder}/${fileName}` };
        }, {
            body: z.object({
                file: z.instanceof(File),
                fileName: z.string(),
                folder: z.string().default("/"),
                isPrivate: z.string().transform(val => val === "true").default(false),
                transformations: z.string().optional(),
            })
        })
    );

