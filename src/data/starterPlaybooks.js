export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'home', label: 'Home' },
  { id: 'work', label: 'Work' },
  { id: 'errands', label: 'Errands' },
  { id: 'health', label: 'Health' },
  { id: 'travel', label: 'Travel' },
];

export const CATEGORY_COLORS = {
  home: '#2F5D4F',
  work: '#2F5D4F',
  errands: '#C78B4A',
  health: '#4A7C68',
  travel: '#2F5D4F',
};

export const CATEGORY_LABELS = {
  home: 'Home',
  work: 'Work',
  errands: 'Errands',
  health: 'Health',
  travel: 'Travel',
};

export const STARTER_PLAYBOOKS = [
  {
    id: 'starter-get-ready-for-work',
    title: 'Get ready for work',
    category: 'work',
    description: 'A calm, reliable morning routine to leave the house feeling prepared.',
    duration: '25 min',
    steps: [
      'Wake up and drink a glass of water',
      'Do 5 minutes of light stretching or breathing',
      'Shower and get dressed',
      'Check the day\'s calendar and top priorities',
      'Pack bag, lunch, and keys',
      'Leave with a 10-minute buffer',
    ],
  },
  {
    id: 'starter-plan-grocery-run',
    title: 'Plan a grocery run',
    category: 'errands',
    description: 'Turn a quick errand into an efficient, stress-free trip.',
    duration: '20 min',
    steps: [
      'Review pantry and fridge for what is missing',
      'Write the shopping list in meal order',
      'Check coupons or store deals',
      'Set a budget for the trip',
      'Group items by store section',
      'Plan the route through the store',
    ],
  },
  {
    id: 'starter-prepare-for-meeting',
    title: 'Prepare for a meeting',
    category: 'work',
    description: 'Walk through a focused prep routine before any important meeting.',
    duration: '15 min',
    steps: [
      'Confirm meeting time, location, and attendees',
      'Review the agenda and your goals',
      'Gather any notes, data, or documents',
      'Prepare 2-3 talking points',
      'Test technology if it is virtual',
      'Arrive or log in 3 minutes early',
    ],
  },
  {
    id: 'starter-reset-kitchen',
    title: 'Reset the kitchen',
    category: 'home',
    description: 'Quickly tidy and reset the kitchen so it feels ready for tomorrow.',
    duration: '15 min',
    steps: [
      'Clear dishes from counters and table',
      'Load dishwasher or wash by hand',
      'Wipe countertops and stovetop',
      'Sweep or vacuum the floor',
      'Put away stray items',
      'Fill the kettle for the morning',
    ],
  },
  {
    id: 'starter-pack-overnight-trip',
    title: 'Pack for an overnight trip',
    category: 'travel',
    description: 'Pack light and smart for a single night away from home.',
    duration: '20 min',
    steps: [
      'Check the weather forecast',
      'Lay out clothes for one day and night',
      'Pack toiletries in a small bag',
      'Charge phone and pack charger',
      'Bring any needed documents or cards',
      'Double-check you have keys and home items',
    ],
  },
  {
    id: 'starter-wind-down-for-bed',
    title: 'Wind down for bed',
    category: 'health',
    description: 'A gentle evening routine to help your mind and body settle.',
    duration: '20 min',
    steps: [
      'Set tomorrow\'s alarm and lay out clothes',
      'Write down 3 things from today',
      'Dim the lights and screen brightness',
      'Do 5 minutes of slow breathing or stretching',
      'Read a book (not a screen)',
      'Get into bed and let go of the day',
    ],
  },
];