export const initialMessages = [
  {
    id: 1,
    text: "Hi, we're here to help you.",
    sender: 'bot'
  },
  {
    id: 2,
    text: "Select one of the options below or type your query",
    sender: 'bot',
    type: 'options',
    options: [
      {
        text: 'What is the status of job application',
        type: 'action',
        isHighlighted: true
      },
      {
        text: 'Current job opportunities',
        type: 'action',
        isHighlighted: false
      },
      {
        text: 'FAQ',
        type: 'faq',
        isHighlighted: false
      },
      {
        text: 'Other',
        type: 'other',
        isHighlighted: false
      }
    ]
  }
];

export const options = {
  main: {
    text: 'What would you like to know?',
    options: [
      { text: 'What is the status of job application', type: 'action' },
      { text: 'Current job opportunities', type: 'action' },
      { text: 'FAQ', type: 'faq' },
      { text: 'Other', type: 'other' }
    ]
  },
  faq: {
    text: 'Please select an FAQ option:',
    options: [
      { text: 'Application process', type: 'response' },
      { text: 'Interview process', type: 'response' },
      { text: 'Required documents', type: 'response' },
      { text: 'Job benefits', type: 'response' },
      { text: 'Contact HR', type: 'response' },
      { text: 'Back to main menu', type: 'back' }
    ]
  },
  applicationStatus: {
    text: 'Let me help you check your application status. How would you like to proceed?',
    options: [
      { text: 'Check by Application ID', type: 'input', placeholder: 'Enter your Application ID' },
      { text: 'Check by Email', type: 'input', placeholder: 'Enter your registered email' },
      { text: 'Back to main menu', type: 'back' }
    ]
  },
  jobOpportunities: {
    text: 'Here are options for job opportunities:',
    options: [
      { text: 'View all open positions', type: 'response' },
      { text: 'Filter by department', type: 'response' },
      { text: 'Back to main menu', type: 'back' }
    ]
  }
};

export const responses = {
  'Application process': 'Our application process involves submitting your resume, completing an online application, and going through our screening process. You can track your application status in your candidate portal.',
  'Interview process': 'Our interview process typically includes a phone screening, followed by one or more interviews with the hiring team. Some positions may require technical assessments or case studies.',
  'Required documents': 'You will need to submit your updated resume, a cover letter, and any relevant certifications. Some positions may require additional documents like a portfolio or writing samples.',
  'Job benefits': 'We offer competitive salaries, health insurance, retirement plans, paid time off, professional development opportunities, and a flexible work environment.',
  'Contact HR': 'You can reach our HR team at hr@company.com or call us at (555) 123-4567 during business hours (9 AM - 5 PM, Monday to Friday).',
  'View all open positions': 'Here are our current open positions: [List of positions will be displayed here]',
  'Filter by department': 'Please select a department: [Department list will be shown here]'
};
