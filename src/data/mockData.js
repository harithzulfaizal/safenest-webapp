export const mockUserProfile = {
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    memberSince: '2023-01-15',
    accountType: 'Premium',
    personalDetails: {
      netHouseholdIncome: '$85,000',
      employmentStatus: 'Full-time',
      householdComposition: {
        dependentAdults: 0,
        dependentChildren: 1,
      },
      emergencyFundSavingsLevel: '$10,000 / $15,000 Target',
    },
    financialGoals: [
      { id: 'g1', title: 'Accelerate debt repayment', description: 'I want to finish off my short term debt within 5 years' },
      { id: 'g2', title: 'Build up emergency savings', description: 'I want to build up emergency savings to cover 6 months of expenses' },
      { id: 'g3', title: 'Save for Downpayment', description: 'Aiming for a 20% downpayment on a house in 7 years.' },
    ],
    financialKnowledge: {
      budgeting: { level: 'Intermediate', description: 'Can manage cash flow well, knows which budgeting style fits their lifestyle and approach to money.' },
      creditDebt: { level: 'Novice', description: 'Can explain impact of credit usage on score, avoids high-interest debt.' },
      investing: { level: 'Intermediate', description: 'Understands concept of risk and returns and inherent risks of different asset class.' },
      retirement: { level: 'Beginner', description: 'Knows concept of retirement savings, understand basic retirement account types.' },
    },
    financialProfile: {
      netWorth: '$150,000', 
      assets: '$200,000', 
      savingsAmount: '$50,000', 
      liabilities: '$50,000', 
      totalDebt: '$30,000', 
      dti: '15%',
      spendingHabit: { 
        topCategory: 'Dining Out', 
        style: 'Moderate Spender' 
      },
      savingsHabit: { 
        savingsRate: '18%', 
        emergencyFundStatus: 'Partially Funded' 
      },
    },
  };
  
  export const mockInsights = [
    { 
      id: 1, 
      title: 'Optimize Subscription Spending', 
      explanation: 'Review recurring subscriptions to identify potential savings.', 
      impact: '$30-50/month potential savings', 
      nextSteps: [
        'Go to Transactions page', 
        'Filter by "Subscription" category', 
        'Cancel unused services'
      ] 
    },
    { 
      id: 2, 
      title: 'Increase Emergency Fund Contribution', 
      explanation: 'Your emergency fund is slightly below the recommended 3-6 months of expenses.', 
      impact: 'Improved financial security', 
      nextSteps: [
        'Set up automatic transfer of $100/month to savings', 
        'Review budget for areas to cut back'
      ] 
    },
    { 
      id: 3, 
      title: 'Consider Investment Diversification', 
      explanation: 'A large portion of your investments is concentrated in tech stocks.', 
      impact: 'Reduced portfolio risk', 
      nextSteps: [
        'Research index funds or ETFs', 
        'Consult with a financial advisor', 
        'Allocate 10% to bonds'
      ] 
    },
  ];
  
  export const mockTransactions = [
    { id: 't1', date: '2025-04-08', description: 'Grocery Store', category: 'Expenses', amount: -75.50, type: 'expense' },
    { id: 't2', date: '2025-04-07', description: 'Salary Deposit', category: 'Income', amount: 2500.00, type: 'income' },
    { id: 't3', date: '2025-04-06', description: 'Student Loan Payment', category: 'Debts', amount: -250.00, type: 'debt' },
    { id: 't4', date: '2025-04-05', description: 'Netflix Subscription', category: 'Expenses', amount: -15.99, type: 'expense' },
    { id: 't5', date: '2025-04-04', description: 'Stock Purchase - AAPL', category: 'Investments', amount: -500.00, type: 'investment' },
    { id: 't6', date: '2025-04-03', description: 'Restaurant Dinner', category: 'Expenses', amount: -45.00, type: 'expense' },
    { id: 't7', date: '2025-04-02', description: 'Dividend Income', category: 'Investments', amount: 55.20, type: 'income' },
    { id: 't8', date: '2025-04-01', description: 'Rent Payment', category: 'Expenses', amount: -1200.00, type: 'expense' },
  ];