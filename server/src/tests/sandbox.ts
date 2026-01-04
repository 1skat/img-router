import fs from "fs"
import path from "path"
import sharp from "sharp"
const buf = fs.readFileSync(path.join(__dirname, "./audi.png"))

// const inst = sharp(buf).resize({ width: 800, height: 200 }).extract({ width: 300, height: 100, left: 0, top: 0 }).rotate(90);
// const inst = sharp(buf).extract({ width: 600, height: 200, left: 0, top: 300 }).rotate(90).resize({ width: 400,  height: 300 })
// const inst = sharp(buf).extract({ width: 800, height: 200, left: 0, top: 200 }).resize({ width: 500, height: 100 }).rotate(90);

const inst = sharp(buf) // extr(800,350),rs(1000,500)
    .rotate(90)
    .resize({ height: 600, fit: "outside" })
// .rotate(90)
// .resize({ width: 100 })
// .resize({ height: 700 })
// .extract({ width: 800, height: 350, left: 200, top: 272 }) // now the currArea is 800x350
// .resize({ width: 700, height: 306 })

// .extract({ width: 800, height: 100, top: 0, left: 0 })

console.log(inst.options);

inst.toFile(path.join(__dirname, "./audi-new.png"));
