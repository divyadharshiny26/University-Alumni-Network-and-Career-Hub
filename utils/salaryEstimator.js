// Simple salary estimator based on alumni data
const estimateSalary = (experienceYears, skillCount, locationMultiplier = 1.0, uniPrestige = 1.0) => {
  let baseSalary = 50000;
  baseSalary += experienceYears * 5000;
  baseSalary += skillCount * 3000;
  baseSalary *= locationMultiplier; // e.g., SF=1.5, NYC=1.3
  baseSalary *= uniPrestige; // Top uni = 1.2
  return Math.round(baseSalary);
};

module.exports = { estimateSalary };
