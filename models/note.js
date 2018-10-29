'use strict'
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String, required: true
    },
    content: String,
    folder_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
});

noteSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

noteSchema.set('timestamps', true);

const noteModel = mongoose.model('Note', noteSchema);
module.exports = noteModel;