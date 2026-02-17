import Elysia from "elysia";
import { connectServices } from "./config";
import { handlerServerError } from "./middleware";
import { serverImage } from "./routes/images";
import { keyHandlers } from "./routes/api/keys";
import { accountHandlers } from "./routes/api/accounts";
import { imageHandlers } from "./routes/api/images";

await connectServices();
const imageApp = new Elysia()
    .onRequest(({ set }) => {
        set.headers['Accept-CH'] = [
            'Sec-CH-DPR',
            'Sec-CH-Width',
            'Sec-CH-Viewport-Width',
            'Save-Data',
            'ECT',
            'RTT',
            'Downlink'
        ].join(', ');
        set.headers['Vary'] = [
            'Sec-CH-DPR',
            'Sec-CH-Width',
            'Sec-CH-Viewport-Width',
            'Save-Data',
            'ECT',
            'RTT',
            'Downlink'
        ].join(', ');
    })
    .use(serverImage);

const apiApp = new Elysia({ prefix: "/api" })
    .onError(handlerServerError)
    .use(keyHandlers)
    .use(accountHandlers)
    .use(imageHandlers);

imageApp.listen({
    hostname: "0.0.0.0",
    port: 3001
});
console.log("server is running on port 3001");

apiApp.listen({
    hostname: "0.0.0.0",
    port: 3002
});
console.log("server is running on port 3002");

