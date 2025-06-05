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
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
          },
        rejectionComment: String
    }],
    pendingRewards: [{
        rewardId: mongoose.Schema.Types.ObjectId,
        title: String,
        pointsCost: Number,
        dateRequested: Date,
        approved: { type: Boolean, default: false },
        rejected: { type: Boolean, default: false },
      }],
    redeemedRewards: [{
        title: String,
        pointsCost: Number,
        dateRedeemed: Date,
    }],
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parent'
    }
})

export default mongoose.model('Child', childSchema);