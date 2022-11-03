const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


const todoListSchema = mongoose.Schema({
        userName: String,
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            minLength: [3, 'Subject must be at least 3 character'],
            maxLength: [500, 'Subject must be at least less than 500 character'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Description is required']
        },
        status: {
            type: String,
            enum: {
                values: ['new', 'completed', 'cancel'],
                message: 'Status {VALUE} is incorrect, correct value is new, competed, cancel'
            },
            default: 'new'
        }

}, {versionKey: false, timestamps: true});



const TodoListModel = mongoose.model('TodoList', todoListSchema);

module.exports = TodoListModel;

