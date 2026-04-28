import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Optional for group messages
        },
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: false,
        },
        text: {
            type: String,
            default: '',
        },
        image: {
            type: String,
            default: '',
        },
        video: {
            type: String,
            default: '',
        },
        document: {
            type: String,
            default: '',
        },
        documentName: {
            type: String,
            default: '',
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index for fast conversation lookups
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
