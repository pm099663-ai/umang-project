const { randomUUID } = require('node:crypto');

const allowed = {
  gender: ['Male', 'Female', 'Other'],
  married: ['Yes', 'No'],
  education: ['Graduate', 'Not Graduate'],
  selfEmployed: ['Yes', 'No'],
  property: ['Urban', 'Semiurban', 'Rural']
};

module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const input = req.body && typeof req.body === 'object' ? req.body : {};
  const fields = {};
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (name.length < 2 || name.length > 100) fields.name = 'Enter a name between 2 and 100 characters.';
  for (const [key, choices] of Object.entries(allowed)) {
    if (typeof input[key] !== 'string' || !choices.includes(input[key])) fields[key] = 'Choose a valid option.';
  }
  if (![0, 1].includes(Number(input.credit))) fields.credit = 'Choose a valid credit history.';

  const income = Number(input.income);
  const coIncome = Number(input.coIncome);
  const loanAmount = Number(input.loanAmount);
  const duration = Number(input.duration);
  if (!Number.isFinite(income) || income < 0 || income > 1e9) fields.income = 'Enter a valid income.';
  if (!Number.isFinite(coIncome) || coIncome < 0 || coIncome > 1e9) fields.coIncome = 'Enter a valid co-applicant income.';
  if (!Number.isFinite(loanAmount) || loanAmount <= 0 || loanAmount > 1e12) fields.loanAmount = 'Enter a valid loan amount.';
  if (!Number.isInteger(duration) || duration < 1 || duration > 600) fields.duration = 'Duration must be between 1 and 600 months.';
  if (Object.keys(fields).length) return res.status(400).json({ error: 'Please correct the application details.', fields });

  // Educational heuristic only; no form data is stored by this function.
  const monthlyIncome = income + coIncome;
  const paymentRatio = (loanAmount / duration) / Math.max(monthlyIncome, 1);
  const likelyEligible = Number(input.credit) === 1 && monthlyIncome > 0 && paymentRatio <= 0.6;
  return res.status(200).json({
    applicationId: randomUUID(),
    prediction: likelyEligible ? 'likely_eligible' : 'needs_review',
    message: likelyEligible
      ? 'Demo estimate: your details may be eligible. A lender must make the actual decision.'
      : 'Demo estimate: your details need further review. A lender must make the actual decision.',
    disclaimer: 'Educational estimate only; not a credit decision or a guarantee of approval.'
  });
};
