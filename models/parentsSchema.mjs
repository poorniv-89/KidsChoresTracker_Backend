import mongoose, { mongo } from "mongoose";

const parentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    kids: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Child'
    }],
    chores: [{
        title: {
            type: String,
            required: true
        },
        description: String,
        points: {
            type: Number,
            required: true
        },
        deleted: {
            type: Boolean,
            default: false
        }
    }],
    rewards: [{
        title: {
            type: String,
            required: true
        },
        description: String,
        pointsCost: {
            type: Number,
            required: true
        },
        deleted: {
            type: Boolean,
            default: false
        }
    }],
})

export default mongoose.model('Parent', parentSchema);