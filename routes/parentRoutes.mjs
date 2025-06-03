import express from 'express';
import Parent from '../models/parentsSchema.mjs';

const router = express.Router();

//Adding new parent
router.post('/', async (req, res, next) => {

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
});

//Adding new chores to existing parent 
router.post('/:parentId/chores', async (req, res, next) => {
    try{
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
    catch(err)
    {
        next(err);
    }
})



export default router;