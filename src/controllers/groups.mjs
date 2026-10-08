import Group from "../models/group.mjs";

const Groups = class Groups {
    //@ts-ignore
    constructor(app, authToken) {
        this.app = app;
        this.authToken = authToken;

        this.run();
    }

    createGroup() {
        //@ts-ignore
        this.app.post('/group', this.authToken, async (req, res) => {
            try {
                const user = req.user;
                const payload = req.body;
                const group = new Group({
                    ...payload,
                    creator: user.id,
                    administrators: [...payload.administrators, user.id],
                    members: [...payload.members, user.id],
                });
                await group.save();
                return res.status(201).json({
                    code: 201,
                    message: 'Group successfully created'
                });
            } catch (error) {
                //@ts-expect-error
                if (error.name === 'ValidationError') {
                    const erreursFormatees = {};
                    //@ts-expect-error
                    Object.keys(error.errors).forEach((champ) => {
                        //@ts-expect-error
                        erreursFormatees[champ] = error.errors[champ].message;
                    });
                    return res.status(400).json({
                        code: 400,
                        message: 'Data validation error',
                        errors: erreursFormatees,
                    });
                }
                return res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error',
                });
            }
        })
    }

    addMember() {
        //@ts-ignore
        this.app.put('/group/:idgroup/member/:idmember', this.authToken, async (req, res) => {
            try {
                const groupId = req.params.idgroup;
                const memberId = req.params.idmember;
                const userId = req.user.id;

                const group = await Group.find({ _id: groupId });

                if (!group) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Group Not Found'
                    });
                }

                //@ts-ignore
                const userIsAnAdministrator = group.administrators.includes(userId);
                
                if (!userIsAnAdministrator) {
                    return res.status(401).json({
                        code: 401,
                        message: "Vous n'êtes pas autorisé à ajouter des membre à ce groupe"
                    });
                }
                
                const updatedGroup = await Group.findByIdAndUpdate(
                    groupId,
                    { $push: { members: memberId }},
                    { new: true, runValidators: true }
                );
                return res.status(201).json({
                    code: 201,
                    message: 'Member successfully added',
                    data: {...updatedGroup}
                });
            } catch (error) {
                //@ts-expect-error
                if (error.name === 'ValidationError') {
                    const erreursFormatees = {};
                    //@ts-expect-error
                    Object.keys(error.errors).forEach((champ) => {
                        //@ts-expect-error
                        erreursFormatees[champ] = error.errors[champ].message;
                    });
                    return res.status(400).json({
                        code: 400,
                        message: 'Data validation error',
                        errors: erreursFormatees,
                    });
                }
                return res.status(500).json({
                    code: 500,
                    message: 'Internal Server Error',
                });
            }
        })
    }

    async run() {
        this.createGroup();
        this.addMember();
    }
}

export default Groups;