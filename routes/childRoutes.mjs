import express from 'express';
import Child from '../models/ChildSchema.mjs';
import Parent from '../models/parentsSchema.mjs';
import mongoose from 'mongoose';
const router = express.Router();

//Creating a new Kid profile
router.post('/', async (req, res, next) => {
  try {
    const { parent: parentId, name } = req.body;

    if (!parentId) {
      const error = new Error('Parent ID is required');
      error.status = 400;
      return next(error);
    }

    // Create child document
    const child = new Child(req.body);
    await child.save();

    // Add child's ID to parent's kids array
    const parent = await Parent.findById(parentId);
    if (!parent) {
      const error = new Error('Parent not found');
      error.status = 404;
      return next(error);
    }

    parent.kids.push(child._id);
    await parent.save();
    const childLink = `http://localhost:5173/child/${child._id}`;

    res.status(201).json({
      message: "New Child Profile created!",
      child,
      childLink
    });
  } catch (err) {
    next(err);
  }
});


//Getting child Profile to be displayed
router.get('/:childId', async (req, res, next) => {
  try {
    const { childId } = req.params;
    const child = await Child.findById(childId);
    if (!child) {
      const error = new Error('Child profile not found');
      error.status = 404;
      return next(error);
    }
    return res.status(200).json({
      message: "Child profile found!",
      details: child
    })

  } catch (error) {
    next(error);
  }
})

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


export default router;