import mongoose from 'mongoose';
const gameEntrySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    startTimeStamp: { type: Number, required: true}
})

// Export Mongoose "GameEntry" model
export default mongoose.model('GameEntry', gameEntrySchema);
