const express = require('express');
const {
  getAlumniProfiles,
  getAlumniProfile,
  sendConnectionRequest,
  addEndorsement
} = require('../controllers/alumniController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAlumniProfiles);
router.get('/:id', getAlumniProfile);
router.put('/:id/connect', protect, sendConnectionRequest);
router.put('/:id/endorse', protect, addEndorsement);

module.exports = router;
