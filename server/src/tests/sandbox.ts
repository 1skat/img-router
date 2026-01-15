import fs from "fs"
import path from "path"
import sharp from "sharp"
const buf = fs.readFileSync(path.join(__dirname, "./audi.png"))


// const inst = sharp(buf)
//     .extract({ "left": 300, "top": 347, "width": 600, "height": 200 })
//     .resize({ width: 1200, height: 400, fit: "fill" })
//     .extract({ left: 100, top: 300, width: 200, height: 600 })
//     .rotate(90);

const inst = sharp(buf)
    .resize({ width: 400, height: 900 })
    .rotate(90)


inst.toFile(path.join(__dirname, "./audi-new1.png"));
