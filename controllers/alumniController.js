const User = require('../models/User');

// @desc Get all alumni profiles
// @route GET /api/alumni
const getAlumniProfiles = async (req, res, next) => {
  try {
    const alumni = await User.find({ role: { $in: ['alumni', 'student'] } })
      .select('name university graduationYear avatar skills bio')
      .limit(20);
    res.json({ success: true, count: alumni.length, alumni });
  } catch (error) {
    next(error);
  }
};

// @desc Get single alumni profile
// @route GET /api/alumni/:id
const getAlumniProfile = async (req, res, next) => {
  try {
    const alumni = await User.findById(req.params.id)
      .populate('connections', 'name avatar university')
      .populate('endorsements.endorser', 'name avatar');
    
    if (!alumni) {
      return res.status(404).json({ success: false, message: 'Alumni not found' });
    }
    res.json({ success: true, alumni });
  } catch (error) {
    next(error);
  }
};

// @desc Send connection request
// @route PUT /api/alumni/:id/connect
const sendConnectionRequest = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Add to pending connections logic here
    
    res.json({ success: true, message: 'Connection request sent' });
  } catch (error) {
    next(error);
  }
};

// @desc Add endorsement
// @route PUT /api/alumni/:id/endorse
const addEndorsement = async (req, res, next) => {
  try {
    const { skill } = req.body;
    const endorserId = req.user.id;
    
    const hash = require('crypto').createHash('sha256')
      .update(`${skill}-${endorserId}-${Date.now()}`)
      .digest('hex');

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          endorsements: {
            skill,
            endorser: endorserId,
            timestamp: new Date(),
            hash
          }
        }
      },
      { new: true }
    );

    res.json({ success: true, endorsement: { skill, hash } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlumniProfiles,
  getAlumniProfile,
  sendConnectionRequest,
  addEndorsement
};
