import mongoose from 'mongoose';

const codeSnippetSchema = mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, default: '' },
        language: { type: String, required: true },
        code: { type: String, required: true },
        output: { type: String, default: '' },
        isPublic: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const CodeSnippet = mongoose.model('CodeSnippet', codeSnippetSchema);

export default CodeSnippet;
