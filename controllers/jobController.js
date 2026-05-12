const Job = require('../models/Job');
const { estimateSalary } = require('../utils/salaryEstimator');

// @desc Get all jobs
// @route GET /api/jobs
const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .populate('postedBy', 'name avatar company')
      .populate('applicants.user', 'name avatar')
      .sort('-createdAt')
      .limit(20);
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    next(error);
  }
};

// @desc Create job
// @route POST /api/jobs
const createJob = async (req, res, next) => {
  try {
    req.body.postedBy = req.user.id;
    // Ensure job is active when created
    req.body.isActive = true;
    const job = await Job.create(req.body);
    res.status(201).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// @desc Get single job
// @route GET /api/jobs/:id
const getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name avatar company')
      .populate('applicants.user', 'name avatar');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// @desc Apply to job
// @route PUT /api/jobs/:id/apply
const applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    const existingApplication = job.applicants.find(app => app.user.toString() === req.user.id);
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'Already applied' });
    }
    
    job.applicants.push({ user: req.user.id });
    await job.save();
    
    res.json({ success: true, message: 'Application submitted' });
  } catch (error) {
    next(error);
  }
};

// @desc Estimate salary
// @route GET /api/jobs/salary-estimate
const salaryEstimate = async (req, res, next) => {
  try {
    const { experienceYears, skillCount, location, university } = req.query;
    const locationMultiplier = location === 'SF' ? 1.5 : location === 'NYC' ? 1.3 : 1.0;
    const uniPrestige = university === 'Stanford' || university === 'MIT' ? 1.2 : 1.0;
    
    const estimatedSalary = estimateSalary(
      parseInt(experienceYears),
      parseInt(skillCount),
      locationMultiplier,
      uniPrestige
    );
    
    res.json({ success: true, estimatedSalary });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  createJob,
  getJob,
  applyToJob,
  salaryEstimate
};
