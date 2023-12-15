import mongoose from 'mongoose';
import User from './User.js';
var gameDataSchema = new mongoose.Schema({
    data: {
        type: [{
            round: Number,
            word: String,
            didWin: Boolean,
            didLose: Boolean,
            numGuesses: Number,
            timestamp: Number
        }],
        required: true
    },
    userId: { type: String, required: true }
})

// Export Mongoose "GameData" model
export default mongoose.model('GameData', gameDataSchema);
