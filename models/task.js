const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    taskName: { type: String, required: true },
    taskDescription: { type: String, required: true },
    taskPriority: { type: String, enum: ['High', 'Moderate', 'Low'], required: true },
    creationDate: { type: Date, required: true, default: Date.now }, // Automatically set to current date if not provided
    expectedCompletionDate: { type: Date, required: true },
    taskStatus: { type: String, enum: ['Not started', 'Ongoing', 'Done', 'Fail'], required: true },
    remark: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to User model
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;