const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Application = require('../models/Application');
const Job = require('../models/Job');
const sendEmail = require('../utils/email'); // make sure you created this file
const router = express.Router();

/**
 * APPLY FOR JOB (Job Seeker)
 */
router.post(
  '/apply/:jobId',
  authMiddleware,
  roleMiddleware('jobSeeker'),
  async (req, res) => {
    try {
      const jobId = req.params.jobId;
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ message: 'Job not found' });

      const alreadyApplied = await Application.findOne({
        job: jobId,
        applicant: req.user.id
      });

      if (alreadyApplied)
        return res.status(400).json({ message: 'Already applied for this job' });

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

/**
 * GET APPLICATIONS FOR A JOB (Employer/Admin)
 */
router.get(
  '/job/:jobId',
  authMiddleware,
  roleMiddleware('employer', 'admin'),
  async (req, res) => {
    try {
      const { jobId } = req.params;

      const applications = await Application.find({ job: jobId })
        .populate('applicant', 'name email role')
        .populate('job', 'title');

      if (!applications.length)
        return res.status(404).json({ message: 'No applications found' });

      res.json(applications);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * UPDATE APPLICATION STATUS (Employer/Admin) WITH EMAIL NOTIFICATION
 */
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

      const application = await Application.findById(applicationId)
        .populate('applicant', 'name email')
        .populate('job', 'title');

      if (!application)
        return res.status(404).json({ message: 'Application not found' });

      application.status = status;
      await application.save();

      // Send email to applicant
      const emailText = `Hi ${application.applicant.name},\n\nYour application for the job "${application.job.title}" has been updated to "${status}".\n\nBest regards,\nWay to Jobs Team`;

      await sendEmail(application.applicant.email, 'Application Status Update', emailText);

      res.json({
        message: 'Application status updated and email sent',
        application
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * GET MY APPLICATIONS (Job Seeker)
 */
router.get(
  '/my-applications',
  authMiddleware,
  roleMiddleware('jobSeeker'),
  async (req, res) => {
    try {
      const applications = await Application.find({ applicant: req.user.id })
        .populate('job', 'title description location salary');

      if (!applications.length)
        return res.status(404).json({ message: 'No applications found' });

      res.json({
        message: 'Applications fetched successfully',
        applications
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;

