import Event from "../models/event.mjs";

const Events = class Events {
    //@ts-ignore
    constructor(app, authToken) {
        this.app = app;
        this.authToken = authToken;

        this.run();
    }

    createEvent() {
        //@ts-ignore
        this.app.post('/event', this.authToken, async (req, res) => {
            try {
                const user = req.user.id;
                const event = new Event({
                    ...req.body,
                    organizers: [user.id],
                    participants: [user.id],
                });
                await event.save();
                return res.status(201).json({
                    code: 201,
                    message: 'Event successfully created'
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

    addParticipant() {
        //@ts-ignore
        this.app.patch('/event/:idevent/participant/:idparticipant', this.authToken, async (req, res) => {
            try {
                const eventId = req.params.idevent;
                const participantId = req.params.idparticipant;
                const userId = req.user.id;

                const event = await Event.find({ _id: eventId });

                if (!event) {
                    return res.status(404).json({
                        code: 404,
                        message: 'Event Not Found'
                    });
                }

                //@ts-ignore
                const userIsAnOrganizer = event.organizers.includes(userId);
                
                if (!userIsAnOrganizer) {
                    return res.status(401).json({
                        code: 401,
                        message: "Vous n'êtes pas autorisé à rajouter des participants à cet événement"
                    });
                }
                
                const updatedEvent = await Event.findByIdAndUpdate(
                    eventId,
                    { $push: { participants: participantId }},
                    { new: true, runValidators: true }
                );
                return res.status(201).json({
                    code: 201,
                    message: 'Participant successfully added',
                    data: {...updatedEvent}
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
        this.createEvent();
        this.addParticipant();
    }
}

export default Events;