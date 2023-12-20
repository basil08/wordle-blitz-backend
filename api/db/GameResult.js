import mongoose from 'mongoose';

const gameResultSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    wins: {
        type: Number,
        required: true
    },
    loses: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    averageTimePerSolve: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
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
})

// Export Mongoose "GameEntry" model
export default mongoose.model('GameResult', gameResultSchema);
