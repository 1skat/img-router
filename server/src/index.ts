import { Elysia } from 'elysia';
import { keyHandlers } from './routes/api_keys';
import { accountRoutes } from './routes/accounts';
import { imageRoutes } from './routes/images';
import { hostname } from 'os';
import { handlerServerErrorV2, withConfigV2, withConfig } from './middleware';
import { cfg } from './config';
import { accountHandlers } from './routes/accounts';

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
    .use(imageRoutes)

const apiApp = new Elysia({ prefix: "/api" })
    .use(withConfigV2)
    .onError(handlerServerErrorV2)
    .use(keyHandlers)
    .use(accountHandlers)

imageApp.listen({
    hostname: "0.0.0.0",
    port: 3001
});

apiApp.listen({
    hostname: "0.0.0.0",
    port: 3002
});

console.log("server is running on port 3001");
