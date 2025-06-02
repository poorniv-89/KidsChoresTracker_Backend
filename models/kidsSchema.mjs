import mongoose from "mongoose";

const childSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 0,
    },
    completedChores: [{
        choreTitle: String,
        dateCompleted: Date,
        pointsEarned: Number,
    }]
})

export default mongoose.model('Child', childSchema)