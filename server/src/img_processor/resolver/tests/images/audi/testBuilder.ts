import fs from "fs";
import path from "path";
import sharp from "sharp";

(async function buildTests() {
    const buf = fs.readFileSync("original.png");

    const img = await sharp(buf).resize(400, 200).toBuffer();

    // Save snapshot
    const snapshotPath = path.join(__dirname, "audi-rs(400,200).png");
    fs.writeFileSync(snapshotPath, img);
})();
