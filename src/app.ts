import express from 'express';
import http from 'http';
import path from 'path';
import ejs from 'ejs';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import { RouterHandle, Router } from './base/RouterHandle';
import { ConnectionDatabase, CloseConnection } from './base/SqlService';
import * as controllers from './controller';
import { appConfigInterface } from './common/appConfig';
const appConfig: appConfigInterface = require('../config/app.json');

const app = express();

// const viewPath = path.join(path.parse(__dirname).dir, 'bin/views');
// const publicPath = path.join(path.parse(__dirname).dir, 'dust');

app.set('views', path.join(path.parse(__dirname).dir, 'bin/views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.use(express.static('dist'))
app.use(favicon(path.join(path.parse(__dirname).dir, 'dist/favicon.ico')))

ConnectionDatabase();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// parse an HTML body into a string
app.use(bodyParser.text({ type: 'text/html' }))

app.use(cookieParser())

RouterHandle(app, controllers);
app.use(Router);

app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const xrw = req.header('X-Requested-With') || req.header('x-requested-with');
    if (xrw && xrw.toLowerCase() === 'xmlhttprequest') {
        let status = (error as any).status || 500;
        res.status(status).send({
            resCode: status,
            msg: error.message,
            data: {}
        });
    } else {
        res.render('error.html', { status: (error as any).status, message: error.message }, (err, html) => {
            if (err) {
                res.send(err);
            } else {
                res.send(html);
            }
            res.end();
        });
    }
});
process.on('uncaughtException', error => {
    console.log('进程异常：', error);
});
process.on('SIGINT', async () => {
    console.log('进程退出(SIGINT)');
    await CloseConnection();
});
process.on('SIGTERM', async () => {
    console.log('进程退出(SIGTERM)');
    await CloseConnection();
});
http.createServer(app).listen(appConfig.server.port, () => {
    console.log('node服务端启动完成，端口号：' + appConfig.server.port);
})