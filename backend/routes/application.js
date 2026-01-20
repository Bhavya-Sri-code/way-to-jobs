const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Application = require('../models/Application');
const Job = require('../models/Job');
const router = express.Router();
router.post('/apply/:jobId',
    authMiddleware,
    roleMiddleware('jobSeeker'),
    async (req, res) => {
        try {
            const jobId = req.params.jobId;
            const job = await Job.findById(jobId);
            if (!job) {
                return res.status(404).json({ message: 'Job not found' });
            }
            const alreadyApplied = await Application.findOne({
                job: jobId,
                applicant: req.user.id
            });

            if (alreadyApplied) {
                return res.status(400).json({ message: 'Already applied for this job' });
            }

            const application = new Application({
                job: jobId,
                applicant: req.user.id
            });

            await application.save();

            res.status(201).json({
                message: 'Job applied successfully',
                application
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

router.get('/job/:jobId',
  authMiddleware,
  roleMiddleware('employer', 'admin'),
  async (req, res) => {
    try {
      const { jobId } = req.params;

      const applications = await Application.find({ job: jobId })
        .populate('applicant', 'name email role')
        .populate('job', 'title');

      if (!applications.length) {
        return res.status(404).json({ message: 'No applications found' });
      }

      res.json(applications);

    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.put(
  '/:applicationId/status',
  authMiddleware,
  roleMiddleware('employer', 'admin'),
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status } = req.body;

      if (!['shortlisted', 'rejected', 'accepted'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const application = await Application.findById(applicationId);

      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }

      application.status = status;
      await application.save();

      res.json({
        message: 'Application status updated',
        application
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);
module.exports = router;
