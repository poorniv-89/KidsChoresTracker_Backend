import express from 'express';
import Parent from '../models/parentsSchema.mjs';

const router = express.Router();

//Adding new parent
router.post('/', async (req, res, next) => {
    try {
        const existingParent = await Parent.findOne({ email: req.body.email });
        if (existingParent) {
            const error = new Error('You are already a registered user!');
            error.status = 400;
            return next(error);
        }

        const newParent = new Parent(req.body);
        await newParent.save();

        res.status(201).json({
            message: 'New user created!',
            parent: {
                id: newParent._id,
                name: newParent.name,
                email: newParent.email
            }
        });
    }
    catch (err) {
        next(err);
    }
});

//Adding new chores to existing parent 
router.post('/:parentId/chores', async (req, res, next) => {
    try {
        const { parentId } = req.params;
        const newChores = req.body;

        const choresToAdd = Array.isArray(newChores) ? newChores : [newChores];
        const parent = await Parent.findById(parentId);
        if (!parent) {
            const error = new Error('Parent not found!');
            error.status = 404;
            return next(error);
        }

        if (!choresToAdd.length) {
            const error = new Error('Please provide at least one chore!');
            error.status = 400;
            return next(error);

        }

        parent.chores.push(...choresToAdd);
        await parent.save();

        res.status(200).json({
            message: 'Chores added successfully',
            chores: parent.chores
        });
    }
    catch (err) {
        next(err);
    }
})

//adding new rewards to an existing parent
router.post('/:parentId/rewards', async (req, res, next) => {
    try {
        const { parentId } = req.params;
        const newRewards = req.body;

        const rewardsToAdd = Array.isArray(newRewards) ? newRewards : [newRewards];
        const parent = await Parent.findById(parentId);
        if (!parent) {
            const error = new Error('Parent not found!');
            error.status = 404;
            return next(error);
        }

        if (!rewardsToAdd.length) {
            const error = new Error('Please provide at least one rewards to add!');
            error.status = 400;
            return next(error);

        }

        parent.rewards.push(...rewardsToAdd);
        await parent.save();

        res.status(200).json({
            message: 'Rewards added successfully',
            rewards: parent.rewards
        });
    }
    catch (err) {
        next(err);
    }
})

//Getting the parent profile to display
router.get('/:parentId', async (req, res, next) => {
    try {
        const { parentId } = req.params;
        const parent = await Parent.findById(parentId).select('-password');
        if (!parent) {
            const error = new Error('Parent not found!');
            error.status = 404;
            return next(error);
        }

        res.status(200).json({
            message: "Parent Details retrieved successfully",
            parentDetails: parent
        })
    }
    catch (err) {
        next(err);
    }
})

// Deleting an existing reward
router.delete('/:parentId/rewards/:rewardId', async (req, res, next) => {
    try {
        const { parentId, rewardId } = req.params;

        const parent = await Parent.findById(parentId);
        if (!parent) {
            const error = new Error('Parent not found!');
            error.status = 404;
            return next(error);
        }

        const initialLength = parent.rewards.length;
        parent.rewards = parent.rewards.filter(reward => reward._id.toString() !== rewardId);

        if (parent.rewards.length === initialLength) {
            const error = new Error('Reward not found!');
            error.status = 404;
            return next(error);
        }

        await parent.save();
        res.status(200).json({ message: 'Reward deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;