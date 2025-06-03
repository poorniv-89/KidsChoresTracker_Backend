import express from 'express';
import Parent from '../models/parentsSchema.mjs';

const router = express.Router();

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

export default router;