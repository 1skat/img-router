import { Elysia } from 'elysia';
import { keyHandlers } from './routes/api_keys';
import { hostname } from 'os';
import { handlerServerError } from './middleware';
import { cfg, connectServices } from './config';
import { accountHandlers } from './routes/accounts';
import { imageHandler } from './routes/images';

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
    .use(imageHandler)

const apiApp = new Elysia({ prefix: "/api" })
    .onError(handlerServerError)
    .use(keyHandlers)
    .use(accountHandlers)

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

