import express from 'express';
import Child from '../models/ChildSchema.mjs';
import Parent from '../models/parentsSchema.mjs';
import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

//Adding new Child
router.post('/', async (req, res, next) => {
  try {
    const { name, parent } = req.body;

    const token = crypto.randomBytes(8).toString('hex');

    const newChild = new Child({
      name,
      parent,
      publicLinkToken: token,
    });

    await newChild.save();

    // ✅ Add new child's ID to parent's kids array
    await Parent.findByIdAndUpdate(parent, {
      $push: { kids: newChild._id },
    });
    console.log(' CLIENT_BASE_URL:', process.env.CLIENT_BASE_URL);
    const childLink = `${process.env.CLIENT_BASE_URL || 'http://localhost:5173'}/child/token/${token}`;

    res.status(201).json({
      message: 'Child created successfully!',
      childLink,
    });
  } catch (err) {
    next(err);
  }
});

//Getting child Profile to be displayed
// Get child by token
router.get('/token/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const child = await Child.findOne({ publicLinkToken: token });
    if (!child) {
      return res.status(404).json({ message: 'Child not found with this token' });
    }
    res.status(200).json({ child });
  } catch (err) {
    next(err);
  }
});

// Token-based route to mark a chore as complete
router.put('/token/:token/choreComplete', async (req, res, next) => {
  try {
    const { token } = req.params;
    const { choreId } = req.body;

    const child = await Child.findOne({ publicLinkToken: token }).populate('parent');
    if (!child) {
      return res.status(404).json({ message: 'Child not found with this token' });
    }

    const parent = child.parent;
    const chore = parent.chores.id(choreId);
    if (!chore) {
      return res.status(404).json({ message: 'Chore not found for this child\'s parent' });
    }

    const now = new Date();
    const alreadyDoneToday = child.completedChores.some((ch) =>
      ch.choreTitle === chore.title &&
      new Date(ch.dateCompleted).toDateString() === now.toDateString() &&
      ch.status !== 'rejected'
    );

    if (alreadyDoneToday) {
      return res.status(400).json({ message: 'This chore has already been completed today' });
    }

    child.completedChores.push({
      choreTitle: chore.title,
      dateCompleted: now,
      pointsEarned: chore.points,
      status: 'pending'
    });

    await child.save();

    res.status(200).json({
      message: 'Chore marked as pending for approval',
      updatedPoints: child.points,
      completedChores: child.completedChores
    });
  } catch (error) {
    next(error);
  }
});

//Updating chore completion and sending for approval
router.put('/:childId/choreComplete', async (req, res, next) => {
  try {
    const { childId } = req.params;
    const { choreId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(childId) || !mongoose.Types.ObjectId.isValid(choreId)) {
      const error = new Error('Invalid child or chore ID');
      error.status = 400;
      return next(error);
    }

    const child = await Child.findById(childId).populate('parent');
    if (!child) {
      const error = new Error('Child not found');
      error.status = 404;
      return next(error);
    }

    const parent = await Parent.findById(child.parent);
    const chore = parent.chores.id(choreId);
    if (!chore) {
      const error = new Error('Chore not found for this child\'s parent');
      error.status = 404;
      return next(error);
    }

    const now = new Date();

    const alreadyDoneToday = child.completedChores.some((ch) =>
      ch.choreTitle === chore.title &&
      new Date(ch.dateCompleted).toDateString() === now.toDateString() &&
      ch.status !== 'rejected' 
    );

    if (alreadyDoneToday) {
      return res.status(400).json({ message: 'This chore has already been completed today' });
    }

    child.completedChores.push({
      choreTitle: chore.title,
      dateCompleted: now,
      pointsEarned: chore.points,
      status: 'pending'
    });

    await child.save();

    res.status(200).json({
      message: 'Chore marked as pending for approval',
      updatedPoints: child.points,
      completedChores: child.completedChores
    });

  } catch (error) {
    next(error);
  }
});

//Redeeming rewards for the child and taking away the points
router.patch('/:childId/redeem', async (req, res, next) => {
  try {
    const { childId } = req.params;
    const { rewardId } = req.body;

    const child = await Child.findById(childId);
    if (!child) {
      const error = new Error('Child not found');
      error.status = 404;
      return next(error);
    }

    const parent = await Parent.findOne({ kids: childId });
    if (!parent) {
      const error = new Error('Parent not found');
      error.status = 404;
      return next(error);
    }
    const reward = parent.rewards.id(rewardId);
    if (!reward) {
      const error = new Error('Reward not found');
      error.status = 404;
      return next(error);
    }
    child.pendingRewards.push({
      rewardId,
      title: reward.title,
      pointsCost: reward.pointsCost,
      dateRequested: new Date(),
      approved: false,
      rejected: false
    });
    await child.save();
    res.status(200).json({ message: 'Reward request sent to parent for approval' });
  } catch (error) {
    next(error);
  }
});

// Redeeming reward using token instead of childId
router.patch('/token/:token/redeem', async (req, res, next) => {
  try {
    const { token } = req.params;
    const { rewardId } = req.body;

    // Find child by token
    const child = await Child.findOne({ publicLinkToken: token });
    if (!child) {
      return res.status(404).json({ message: 'Child not found with this token' });
    }

    // Find parent and reward
    const parent = await Parent.findOne({ kids: child._id });
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found for this child' });
    }

    const reward = parent.rewards.id(rewardId);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    // Add reward request to child
    child.pendingRewards.push({
      rewardId,
      title: reward.title,
      pointsCost: reward.pointsCost,
      dateRequested: new Date(),
      approved: false,
      rejected: false,
    });

    await child.save();

    res.status(200).json({ message: 'Reward request sent to parent for approval' });
  } catch (err) {
    next(err);
  }
});

//Getting all the available chores and rewards possible for the child
router.get('/:childId/available', async (req, res, next) => {
  try {
    const { childId } = req.params;
    const child = await Child.findById(childId).populate({
      path: 'parent',
      populate: ['chores', 'rewards']
    });
    if (!child) {
      const error = new Error('Child not found');
      error.status = 404;
      return next(error);
    }
    const parent = child.parent;
    if (!parent) {
      const error = new Error('Parent not found for this child');
      error.status = 404;
      return next(error);
    }
    const chores = parent.chores;
    const rewards = parent.rewards.filter(reward => !reward.deleted);
    res.status(200).json({
      message: 'Available chores and rewards for child',
      chores,
      rewards,
      childPoints: child.points
    });
  } catch (error) {
    next(error);
  }
});

//Getting all the available chores and rewards possible for the child with token
router.get('/token/:token/available', async (req, res, next) => {
  try {
    const { token } = req.params;
    const child = await Child.findOne({ publicLinkToken: token }).populate({
      path: 'parent',
      populate: ['chores', 'rewards']
    });
    if (!child) {
      return res.status(404).json({ message: 'Child not found with this token' });
    }

    const parent = child.parent;
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found for this child' });
    }

    const chores = parent.chores;
    const rewards = parent.rewards.filter(reward => !reward.deleted);

    res.status(200).json({
      message: 'Available chores and rewards for child (by token)',
      chores,
      rewards,
      childPoints: child.points
    });
  } catch (error) {
    next(error);
  }
});

export default router;