import express from 'express';
import Child from '../models/ChildSchema.mjs';
import Parent from '../models/parentsSchema.mjs';

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
//  router.get('/:childId')


export default router;