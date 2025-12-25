import fs from "fs";
import path from "path";
import { test } from "bun:test";
import sharp from "sharp";

test("generate snapshot", async () => {
    const buf = fs.readFileSync("./images/audi.png");
    const img = await sharp(buf).resize(400, 200).toBuffer();

    // Save snapshot
    const snapshotPath = path.join(__dirname, "__expected_snapshots__", "audi-rs(400,200).png");
    fs.writeFileSync(snapshotPath, img);
});
