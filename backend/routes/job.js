const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Job = require('../models/Job');

const router = express.Router();

// CREATE JOB
router.post(
  '/create',
  authMiddleware,
  roleMiddleware('employer', 'admin'),
  async (req, res) => {
    try {
      const { title, description, location, salary } = req.body;
      const job = new Job({
        title,
        description,
        location,
        salary,
        postedBy: req.user.id
      });
      await job.save();
      res.status(201).json({ message: 'Job posted successfully', job });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// GET ALL JOBS
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name email role');
    res.json(jobs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET JOB BY ID
router.get('/:jobId', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId).populate('postedBy', 'name email role');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE JOB
router.put('/:jobId', authMiddleware, roleMiddleware('employer', 'admin'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { title, description, location, salary } = req.body;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (req.user.role === 'employer' && job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    job.title = title || job.title;
    job.description = description || job.description;
    job.location = location || job.location;
    job.salary = salary || job.salary;

    await job.save();
    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE JOB
router.delete('/:jobId', authMiddleware, roleMiddleware('employer', 'admin'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (req.user.role === 'employer' && job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await job.remove();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
