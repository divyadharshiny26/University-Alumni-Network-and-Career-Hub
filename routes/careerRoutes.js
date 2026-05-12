const express = require('express');
const {
  getCareerRecommendations,
  getMentorshipMatches,
  requestMentorship,
  chatWithAI,
  mockInterview
} = require('../controllers/careerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/recommendations', protect, getCareerRecommendations);
router.get('/mentorship-matches', protect, getMentorshipMatches);
router.post('/mentorship-request', protect, requestMentorship);
router.post('/chat', protect, chatWithAI);
router.post('/mock-interview', protect, mockInterview);

module.exports = router;
