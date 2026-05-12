// Simple AI career recommendation based on skills similarity
const careerPaths = {
  'javascript': ['Full Stack Developer', 'Frontend Developer', 'React Developer'],
  'python': ['Data Scientist', 'Backend Developer', 'AI Engineer'],
  'java': ['Backend Developer', 'Android Developer', 'Enterprise Developer'],
  'react': ['Frontend Developer', 'React Native Developer'],
  'node': ['Full Stack Developer', 'Backend Developer'],
  // Add more
};

const recommendCareers = (userSkills) => {
  const recommendations = new Set();
  userSkills.forEach(skill => {
    if (careerPaths[skill.toLowerCase()]) {
      careerPaths[skill.toLowerCase()].forEach(career => recommendations.add(career));
    }
  });
  return Array.from(recommendations);
};

const matchMentors = (menteeSkills, mentors) => {
  return mentors.map(mentor => ({
    mentor,
    score: menteeSkills.filter(skill => mentor.skills.includes(skill)).length
  })).sort((a, b) => b.score - a.score).slice(0, 5);
};

module.exports = { recommendCareers, matchMentors };
