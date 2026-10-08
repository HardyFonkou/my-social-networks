import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import routes from './routes.mjs';

const Server = class Server {
    constructor() {
        this.app = express();
        this.dbHost = process.env.mongodb;
    }

    async dbConnect() {
        try {
            if (!this.dbHost) {
                throw new Error('dbHost is not defined');
            }
            await mongoose.connect(this.dbHost);

            const close = () => {
                //@ts-ignore
                mongoose.connection.close((error) => {
                    if (error) {
                        console.error('[ERROR] api dbConnect() close() => mongodb error', error.message);
                    } else {
                        console.log('[ERROR] api dbConnect() close() => mongodb closed');
                    }
                });
            }

            mongoose.connection.on('error', (err) => {
                setTimeout(async () => {
                    console.error('[ERROR] api dbConnect() => mongodb error', err.message);
                    await this.dbConnect();
                }, 5000);
            });

            mongoose.connection.on('disconnected', (err) => {
                setTimeout(async () => {
                    console.error('[ERROR] api dbConnect() => mongodb disconnected');
                    this.dbConnect();
                }, 5000);
            });

            process.on('SIGINT', () => {
                close();
                process.exit(0);
            })
        } catch (error) {
            //@ts-ignore
            console.error(`[ERROR] api dbConnect() => ${error.message}`);   
        }
    }

    //@ts-ignore
    authToken(req, res, next) {
        if (!req.cookies.access_token) return res.sendStatus(401);
        const token = req.cookies.access_token;
        const jwtSecret = process.env.jwtsecret;
        if (!jwtSecret) {
            throw new Error('jwtSecret is not defined');
        }
        //@ts-expect-error
        jwt.verify(token, jwtSecret, (err, user) => {
            if (err) return res.status(401).json({
                code: 401,
                message: 'Accès refusé'
            });

            req.user = user;

            next();
        });
    }

    middleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    routes() {
        new routes.Auth(this.app);
        this.app.use((req, res) => {
            res.status(404).json({
                code: 404,
                message: 'Not Found'
            });
        });
    }

    async run() {
        try {
            await this.dbConnect();
            this.middleware();
            this.routes();
            this.app.listen(3000);
        } catch (error) {
            //@ts-ignore
            console.error(error.message);
        }
    }
}

export default Server;