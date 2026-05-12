const express = require('express');
const {
  getJobs,
  createJob,
  getJob,
  applyToJob,
  salaryEstimate
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getJobs);
router.post('/', protect, createJob);
router.get('/salary-estimate', salaryEstimate);
router.get('/:id', getJob);

module.exports = router;
