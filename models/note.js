const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String, required: true
    },
    content: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date
});

noteSchema.set('timestamps', true);

const noteModel = mongoose.model('Note', noteSchema);
module.exports = noteModel;