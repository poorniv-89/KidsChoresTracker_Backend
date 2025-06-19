import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Parent from '../models/parentsSchema.mjs';
import Child from '../models/ChildSchema.mjs';
import { generateToken } from '../Utilities/jwt.mjs';
import { authenticateToken } from '../middlewares/auth.mjs'; 

const router = express.Router();
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

//Adding new parent
router.post('/', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingParent = await Parent.findOne({ email });
    if (existingParent) {
      return res.status(400).json({ message: 'You are already a registered user!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newParent = new Parent({ name, email, password: hashedPassword });
    await newParent.save();

    const token = jwt.sign({ id: newParent._id, role: 'parent' }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({
      message: 'New user created!',
      token, 
      parent: {
        id: newParent._id,
        name: newParent.name,
        email: newParent.email
      }
    });
  } catch (err) {
    next(err);
  }
});

// Parent login route
router.post('/signin', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const parent = await Parent.findOne({ email });
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    const isMatch = await bcrypt.compare(password, parent.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: parent._id, role: 'parent' });

    res.status(200).json({
      message: 'Login successful',
      token,
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
//Editing a chore that is already present
router.put('/:parentId/chores/:choreId', async (req, res, next) => {
  try {
    const { parentId, choreId } = req.params;
    const { title, points } = req.body;

    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    const chore = parent.chores.id(choreId);
    if (!chore) {
      return res.status(404).json({ message: 'Chore not found' });
    }

    if (title !== undefined) chore.title = title;
    if (points !== undefined) chore.points = points;

    await parent.save();

    res.status(200).json({ message: 'Chore updated successfully', chore });
  } catch (err) {
    next(err);
  }
});

// Deleting a chore by its ID
router.delete('/:parentId/chores/:choreId', async (req, res, next) => {
  const { parentId, choreId } = req.params;

  try {
    const parent = await Parent.findById(parentId);
    if (!parent) return res.status(404).json({ message: 'Parent not found' });

    const initialLength = parent.chores.length;
    parent.chores = parent.chores.filter(chore => chore._id.toString() !== choreId);

    if (parent.chores.length === initialLength) {
      return res.status(404).json({ message: 'Chore not found' });
    }

    await parent.save();

    res.status(200).json({ message: 'Chore deleted successfully' });
  } catch (err) {
    console.error('Error deleting chore:', err);
    next(err);
  }
});

//adding new rewards to an existing parent
router.post('/:parentId/rewards', async (req, res, next) => {
  try {
    const { parentId } = req.params;
    const { title, pointsCost } = req.body;

    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }

    parent.rewards.push({ title, pointsCost });
    await parent.save();

    res.status(200).json({ message: 'Reward added successfully', rewards: parent.rewards });
  } catch (err) {
    next(err);
  }
});
//Retrieving parent details for the parent dashboard
router.get('/:parentId', authenticateToken, async (req, res, next) => {
  try {
    const { parentId } = req.params;

    const parent = await Parent.findById(parentId)
    .populate('kids', 'name points completedChores pendingRewards publicLinkToken')
      .select('-password');

    if (!parent) {
      return res.status(404).json({ message: 'Parent not found!' });
    }

    const children = parent.kids || [];

    const pendingChores = [];
    const pendingRewards = [];

    children.forEach(child => {
      // Pending chores
      child.completedChores?.forEach(chore => {
        if (chore.status === 'pending') {
          pendingChores.push({
            kidName: child.name,
            childId: child._id,
            choreId: chore._id,
            choreTitle: chore.choreTitle,
            dateCompleted: chore.dateCompleted,
            pointsEarned: chore.pointsEarned
          });
        }
      });

      // Pending rewards (filter out approved or rejected)
      child.pendingRewards?.forEach(reward => {
        if (!reward.approved && !reward.rejected) {
          pendingRewards.push({
            kidName: child.name,
            childId: child._id,
            rewardId: reward.rewardId,
            title: reward.title,
            pointsCost: reward.pointsCost
          });
        }
      });
    });

    res.status(200).json({
      message: "Parent Details retrieved successfully",
      parentDetails: parent,
      pendingChores,
      pendingRewards
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
    child.pendingRewards = child.pendingRewards.filter(
      (reward) => reward.rewardId?.toString() !== rewardId
    );

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
    const { childId, choreId, rejectionComment } = req.body;

    const child = await Child.findById(childId);
    if (!child) {
      const error = new Error('Child not found');
      error.status = 404;
      return next(error);
    }

    const choreEntry = child.completedChores.find(c => c._id.toString() === choreId);

    if (!choreEntry) return next(new Error('Chore not found'));

    if (choreEntry.approved) {
      return res.status(400).json({ message: 'Chore already approved and cannot be rejected' });
    }
    choreEntry.status = 'rejected';
    choreEntry.rejectionComment = rejectionComment || '';
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
//Rejecting  pending reward
router.post('/:parentId/rejectReward', async (req, res, next) => {
  try {
    const { childId, rewardId, rejectionComment } = req.body;

    const child = await Child.findById(childId);
    if (!child) return res.status(404).json({ message: 'Child not found' });

    const rewardIndex = child.pendingRewards.findIndex(
      r => r.rewardId?.toString() === rewardId
    );

    if (rewardIndex === -1) {
      return res.status(404).json({ message: 'Reward request not found' });
    }

    child.pendingRewards[rewardIndex].rejected = true;
    child.pendingRewards[rewardIndex].approved = false;
    child.pendingRewards[rewardIndex].rejectionComment = rejectionComment || '';

    child.markModified('pendingRewards');

    await child.save();

    res.status(200).json({ message: 'Reward request rejected' });
  } catch (err) {
    next(err);
  }
});

export default router;