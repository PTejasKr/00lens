import mongoose from 'mongoose';

const groupSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String }, // Legacy, will use avatar
    avatar: { type: String, default: 'https://res.cloudinary.com/demo/image/upload/v1622550114/sample.jpg' },
    banner: { type: String, default: 'https://res.cloudinary.com/demo/image/upload/v1622550114/sample.jpg' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
