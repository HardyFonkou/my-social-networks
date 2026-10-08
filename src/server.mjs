import express from 'express';

const Server = class Server {
    constructor() {
        this.app = express();
    }

    middleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    routes() {
        this.app.use((req, res) => {
            res.status(404).json({
                code: 404,
                message: 'Not Found'
            });
        });
    }

    async run() {
        try {
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