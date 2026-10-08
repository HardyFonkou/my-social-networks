import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    icon: String,
    coverPhoto: String,
    visibility: {
        type: String,
        enum: {
            values: ['public', 'private', 'secret'],
            message: '{VALUE} n\'est pas un type de visibilité valide.',
        },
        required: true,
    },
    isMembersCanPublish: Boolean,
    isMembersCanCreateEvent: Boolean,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    administrators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
});

const Group = mongoose.model('Group', Schema);

export default Group;