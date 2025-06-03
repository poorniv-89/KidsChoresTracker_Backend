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
  
      res.status(201).json({
        message: "New Child Profile created!",
        child
      });
    } catch (err) {
      next(err);
    }
  });
  

//Getting child Profile to be displayed
 router.get('/:childId', async(req, res, next)=>{
    try {
        const {childId} = req.params;
        const child = await Child.findById(childId);
        if(!child)
        {
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
  
      // Prevent duplicate entry
      const alreadyCompleted = child.completedChores.some(
        (ch) => ch.choreTitle === chore.title
      );
      if (alreadyCompleted) {
        return res.status(409).json({ message: 'Chore already completed' });
      }
  
      child.completedChores.push({
        choreTitle: chore.title,
        dateCompleted: new Date(),
        pointsEarned: chore.points,
      });
  
      child.points += chore.points;
      await child.save();
  
      res.status(200).json({
        message: 'Chore marked as completed',
        updatedPoints: child.points,
        completedChores: child.completedChores
      });
  
    } catch (error) {
      next(error);
    }
  });

 
export default router;