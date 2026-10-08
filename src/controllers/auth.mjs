import jwt from 'jsonwebtoken';

import User from '../models/user.mjs';

const Auth = class Auth {
    //@ts-ignore
    constructor(app) {
        this.app = app;

        this.run();
    }

    auth() {
        //@ts-ignore
        this.app.get('/auth', async (req, res) => {
            try {
                const jwtSecret = process.env.jwtsecret;
                if (!jwtSecret) {
                    throw new Error('jwtSecret is not defined');
                }
                const { firstname, lastname, email } = req.body;

                const user = new User({ firstname, lastname, email });
                const savedUser = await user.save();

                const token = jwt.sign({ firstname, lastname, email, id: savedUser._id }, jwtSecret);
                res.cookie('access_token', token, { expires: new Date(Date.now() + 24 * 12 * 3600000) });
                return res.status(201).json({
                    code: 201,
                    message: 'Le compte a bien été créé',
                    token // TODO: à retirer
                });
            } catch (error) {
                //@ts-expect-error
                if (error.code === 11000) {
                    return res.status(400).json({
                        message: 'Cet email est déjà utilisé par un utilisateur',
                    });
                }
                //@ts-expect-error
                console.error(error.message);
                return res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error',
                });
            }
        })
    }

    run() {
        this.auth();
    }
}

export default Auth;