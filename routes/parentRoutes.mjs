import express from 'express';
import Parent from '../models/parentsSchema.mjs';
import Child from '../models/ChildSchema.mjs';

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

// Parent login route
router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const parent = await Parent.findOne({ email });
    if (!parent) {
      const error = new Error('Parent not found');
      error.status = 404;
      return next(error);
    }

    if (parent.password !== password) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      return next(error);
    }

    res.status(200).json({
      message: 'Login successful',
      parent: {
        id: parent._id,
        name: parent.name,
        email: parent.email,
      }
    });
  } catch (err) {
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

    // Fetch all children of the parent
    const children = await Child.find({ parent: parentId });

    // Extract pending chores from all children
    const pendingChores = [];

    children.forEach(child => {
      child.completedChores.forEach((chore, index) => {
        if (chore.status === 'pending') {
          pendingChores.push({
            kidName: child.name,
            childId: child._id,
            choreTitle: chore.choreTitle,
            dateCompleted: chore.dateCompleted,
            pointsEarned: chore.pointsEarned,
            choreIndex: index
          });
        }
      });
    });

    res.status(200).json({
      message: "Parent Details retrieved successfully",
      parentDetails: parent,
      pendingChores: pendingChores
    });
  } catch (err) {
    next(err);
  }
});

//Approving a pending chore
router.post('/:parentId/approveChore', async (req, res, next) => {
  try {
    const { childId, choreId } = req.body;
    const { parentId } = req.params;
    const parent = await Parent.findById(parentId).select('-password');
    if (!parent) {
      const error = new Error('Parent not found!');
      error.status = 404;
      return next(error);
    }

    const child = await Child.findById(childId);
    if (!child) return next(new Error('Child not found'));

    const choreEntry = child.completedChores.find(c => c._id.toString() === choreId);

    if (!choreEntry)
      return next(new Error('Chore not found'));

    if (choreEntry.status === 'approved') {
      return res.status(400).json({ message: 'Chore already approved and cannot be changed' });
    }

    if (choreEntry.status !== 'approved') {
      // Only increasing points if it was not already approved
      child.points += choreEntry.pointsEarned;
    }

    choreEntry.rejectionComment = '';
    choreEntry.status = 'approved';
    await child.save();

    res.status(200).json({ message: 'Chore approved successfully', points: child.points });

  } catch (err) {
    next(err);
  }
});

//Approving a pending reward
router.post('/:parentId/approveReward', async (req, res, next) => {
  try {
    const { parentId } = req.params;
    const { childId, rewardId } = req.body;

    const parent = await Parent.findById(parentId).select('-password');
    if (!parent) {
      console.log('🔥 Parent not found block hit');
      const error = new Error('Parent not found!');
      error.status = 404;
      return next(error);
    }


    const child = await Child.findById(childId);
    if (!child) 
      return next(new Error('Child not found'));

    const rewardRequest = child.pendingRewards.find(
      (reward) => reward.rewardId?.toString() === rewardId
    );
    console.log('Pending rewards:', child.pendingRewards);
    console.log(rewardId);

    if (!rewardRequest)
      return next(new Error('Reward request not found'));

    if (rewardRequest.approved) {
      return res.status(400).json({ message: 'Reward already approved and cannot be changed' });
    }

    if (child.points < rewardRequest.pointsCost) {
      return res.status(400).json({ message: 'Not enough points to approve this reward' });
    }

    // Approve and apply reward
    child.points -= rewardRequest.pointsCost;
    rewardRequest.approved = true;
    rewardRequest.rejected = false;

    child.redeemedRewards.push({
      title: rewardRequest.title,
      pointsCost: rewardRequest.pointsCost,
      dateRedeemed: new Date()
    });

    await child.save();

    res.status(200).json({
      message: `Reward '${rewardRequest.title}' approved and redeemed!`,
      remainingPoints: child.points
    });
  } catch (err) {
    next(err);
  }
});

// Parent rejects a pending chore request
router.post('/:parentId/rejectChore', async (req, res, next) => {
  try {
    const { childId, choreId, comment } = req.body;

    const child = await Child.findById(childId);
    if (!child) return next(new Error('Child not found'));

    const choreEntry = child.completedChores.find(c => c._id.toString() === choreId);

    if (!choreEntry) return next(new Error('Chore not found'));

    if (choreEntry.approved) {
      return res.status(400).json({ message: 'Chore already approved and cannot be rejected' });
    }

    choreEntry.rejected = true;
    choreEntry.rejectionComment = comment || '';
    await child.save();

    res.status(200).json({ message: 'Chore rejected', rejectionComment: choreEntry.rejectionComment });

  } catch (err) {
    next(err);
  }
});

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

    const reward = parent.rewards.id(rewardId);
    if (!reward) {
      const error = new Error('Reward not found!');
      error.status = 404;
      return next(error);
    }

    if (reward.deleted) {
      return res.status(400).json({ message: 'Reward already deleted' });
    }

    reward.deleted = true;
    await parent.save();

    res.status(200).json({ message: 'Reward deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get all rewards and chores for a specific parent
router.get('/:parentId/tasks', async (req, res, next) => {
  try {
    const { parentId } = req.params;
    const parent = await Parent.findById(parentId);

    if (!parent) {
      const error = new Error('Parent not found!');
      error.status = 404;
      return next(error);
    }
    res.status(200).json({
      message: 'Chores and Rewards retrieved successfully',
      chores: parent.chores,
      rewards: parent.rewards,
    });
  } catch (err) {
    next(err);
  }
});

export default router;