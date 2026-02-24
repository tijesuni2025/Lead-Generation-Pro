/**
 * Industry Configuration System
 * Defines all industry verticals, sub-verticals, custom lead columns,
 * scoring weights, and qualification criteria.
 *
 * Proprietary to BluestarAI LeadGen Pro
 * @module services/industryConfig
 */

// =============================================================================
// INDUSTRY DEFINITIONS
// =============================================================================

export const INDUSTRIES = {
  HEALTHCARE: {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'Heart',
    color: '#10b981',
    description: 'Medicare, ACA, Vision, Dental, and supplemental insurance leads',
    subVerticals: {
      MEDICARE: {
        id: 'medicare',
        name: 'Medicare Products',
        description: 'Medicare Advantage, Medigap, Part D prescription drug plans',
        leadTypes: ['Medicare Advantage', 'Medigap/Supplement', 'Part D', 'Medicare + Medicaid (Dual)'],
        columns: [
          { key: 'age', label: 'Age', type: 'number', sortable: true },
          { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', sortable: true },
          { key: 'medicareEligibilityDate', label: 'Medicare Eligibility', type: 'date', sortable: true },
          { key: 'currentCoverage', label: 'Current Coverage', type: 'select', options: ['None', 'Original Medicare', 'Medicare Advantage', 'Medigap', 'Employer', 'Medicaid'], sortable: true },
          { key: 'partAEffective', label: 'Part A Effective', type: 'date', sortable: false },
          { key: 'partBEffective', label: 'Part B Effective', type: 'date', sortable: false },
          { key: 'enrollmentPeriod', label: 'Enrollment Period', type: 'select', options: ['IEP', 'AEP', 'OEP', 'SEP', 'GI', 'N/A'], sortable: true },
          { key: 'zipCode', label: 'ZIP Code', type: 'text', sortable: true },
          { key: 'county', label: 'County', type: 'text', sortable: true },
          { key: 'prescriptionDrugs', label: 'Rx Drugs (count)', type: 'number', sortable: true },
          { key: 'preferredDoctors', label: 'Preferred Doctors', type: 'text', sortable: false },
          { key: 'chronicConditions', label: 'Chronic Conditions', type: 'multiselect', options: ['Diabetes', 'Heart Disease', 'COPD', 'Cancer', 'Kidney Disease', 'None'], sortable: false },
          { key: 'incomeLevel', label: 'Income Bracket', type: 'select', options: ['Below $22K', '$22K-$35K', '$35K-$55K', '$55K-$85K', '$85K+'], sortable: true },
          { key: 'preferredCarrier', label: 'Preferred Carrier', type: 'text', sortable: true },
          { key: 'tobaccoUse', label: 'Tobacco Use', type: 'boolean', sortable: true },
          { key: 'dualEligible', label: 'Dual Eligible (Medicaid)', type: 'boolean', sortable: true },
        ],
        scoringWeights: {
          enrollmentTiming: 0.25,
          coverageGap: 0.20,
          ageProximity: 0.15,
          engagementSignal: 0.15,
          healthComplexity: 0.10,
          incomeQualification: 0.10,
          geographicFit: 0.05,
        },
        qualificationCriteria: {
          minAge: 64,
          maxAge: 100,
          requiredFields: ['age', 'zipCode', 'enrollmentPeriod'],
          disqualifiers: ['Under 64 with no disability', 'Already enrolled and satisfied'],
        },
      },

      ACA: {
        id: 'aca',
        name: 'ACA Marketplace',
        description: 'Affordable Care Act marketplace plans, subsidies, and special enrollment',
        leadTypes: ['Individual', 'Family', 'Small Group', 'COBRA Transition', 'Medicaid Referral'],
        columns: [
          { key: 'age', label: 'Age', type: 'number', sortable: true },
          { key: 'householdSize', label: 'Household Size', type: 'number', sortable: true },
          { key: 'annualIncome', label: 'Annual Income', type: 'currency', sortable: true },
          { key: 'fpl', label: 'FPL %', type: 'number', sortable: true },
          { key: 'currentCoverage', label: 'Current Coverage', type: 'select', options: ['None/Uninsured', 'COBRA', 'Short-Term', 'Employer Ending', 'ACA Plan', 'Medicaid'], sortable: true },
          { key: 'subsIdyEligible', label: 'Subsidy Eligible', type: 'boolean', sortable: true },
          { key: 'estimatedSubsidy', label: 'Est. Subsidy ($/mo)', type: 'currency', sortable: true },
          { key: 'enrollmentPeriod', label: 'Enrollment Period', type: 'select', options: ['OEP', 'SEP - Job Loss', 'SEP - Life Event', 'SEP - Medicaid Loss', 'N/A'], sortable: true },
          { key: 'zipCode', label: 'ZIP Code', type: 'text', sortable: true },
          { key: 'state', label: 'State', type: 'text', sortable: true },
          { key: 'preExistingConditions', label: 'Pre-existing Conditions', type: 'boolean', sortable: true },
          { key: 'preferredPlanType', label: 'Preferred Plan', type: 'select', options: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Catastrophic', 'Undecided'], sortable: true },
          { key: 'tobaccoUse', label: 'Tobacco Use', type: 'boolean', sortable: true },
          { key: 'sepQualifyingEvent', label: 'SEP Qualifying Event', type: 'text', sortable: false },
          { key: 'sepEventDate', label: 'SEP Event Date', type: 'date', sortable: true },
        ],
        scoringWeights: {
          subsidyEligibility: 0.20,
          enrollmentTiming: 0.20,
          coverageUrgency: 0.20,
          incomeQualification: 0.15,
          engagementSignal: 0.10,
          healthNeed: 0.10,
          geographicFit: 0.05,
        },
        qualificationCriteria: {
          minAge: 0,
          maxAge: 64,
          requiredFields: ['age', 'householdSize', 'annualIncome', 'zipCode'],
          disqualifiers: ['Medicare eligible', 'Medicaid enrolled and satisfied'],
        },
      },

      VISION: {
        id: 'vision',
        name: 'Vision Insurance',
        description: 'Individual and family vision coverage plans',
        leadTypes: ['Individual', 'Family', 'Employer Add-On', 'Senior Vision'],
        columns: [
          { key: 'age', label: 'Age', type: 'number', sortable: true },
          { key: 'currentVisionCoverage', label: 'Current Coverage', type: 'select', options: ['None', 'Employer Plan', 'Individual Plan', 'Medicare Vision', 'Medicaid Vision'], sortable: true },
          { key: 'lastEyeExam', label: 'Last Eye Exam', type: 'date', sortable: true },
          { key: 'wearsCorrectiveLenses', label: 'Corrective Lenses', type: 'boolean', sortable: true },
          { key: 'familyMembers', label: 'Family Members', type: 'number', sortable: true },
          { key: 'zipCode', label: 'ZIP Code', type: 'text', sortable: true },
          { key: 'preferredProvider', label: 'Preferred Provider', type: 'text', sortable: false },
          { key: 'annualSpend', label: 'Annual Vision Spend', type: 'currency', sortable: true },
          { key: 'diabetic', label: 'Diabetic', type: 'boolean', sortable: true },
          { key: 'employerOffersVision', label: 'Employer Offers Vision', type: 'boolean', sortable: true },
        ],
        scoringWeights: {
          coverageGap: 0.25,
          healthNeed: 0.20,
          engagementSignal: 0.20,
          spendPotential: 0.15,
          familySize: 0.10,
          geographicFit: 0.10,
        },
        qualificationCriteria: {
          requiredFields: ['age', 'zipCode'],
          disqualifiers: ['Full employer coverage and satisfied'],
        },
      },

      DENTAL: {
        id: 'dental',
        name: 'Dental Insurance',
        description: 'Individual and family dental coverage plans',
        leadTypes: ['Individual', 'Family', 'Senior Dental', 'Orthodontic', 'Employer Add-On'],
        columns: [
          { key: 'age', label: 'Age', type: 'number', sortable: true },
          { key: 'currentDentalCoverage', label: 'Current Coverage', type: 'select', options: ['None', 'Employer Plan', 'Individual Plan', 'Medicare Dental', 'Medicaid Dental', 'Discount Plan'], sortable: true },
          { key: 'lastDentalVisit', label: 'Last Dental Visit', type: 'date', sortable: true },
          { key: 'dentalNeeds', label: 'Dental Needs', type: 'multiselect', options: ['Preventive Only', 'Basic Restorative', 'Major Restorative', 'Orthodontics', 'Implants', 'Cosmetic'], sortable: false },
          { key: 'familyMembers', label: 'Family Members', type: 'number', sortable: true },
          { key: 'zipCode', label: 'ZIP Code', type: 'text', sortable: true },
          { key: 'annualBudget', label: 'Annual Budget', type: 'currency', sortable: true },
          { key: 'preferredDentist', label: 'Preferred Dentist', type: 'text', sortable: false },
          { key: 'pendingProcedures', label: 'Pending Procedures', type: 'boolean', sortable: true },
          { key: 'employerOffersDental', label: 'Employer Offers Dental', type: 'boolean', sortable: true },
        ],
        scoringWeights: {
          coverageGap: 0.25,
          procedureUrgency: 0.20,
          engagementSignal: 0.20,
          spendPotential: 0.15,
          familySize: 0.10,
          geographicFit: 0.10,
        },
        qualificationCriteria: {
          requiredFields: ['age', 'zipCode'],
          disqualifiers: ['Full employer coverage and satisfied'],
        },
      },
    },
  },

  FINANCIAL_SERVICES: {
    id: 'financial_services',
    name: 'Financial Services',
    icon: 'DollarSign',
    color: '#3b82f6',
    description: 'Business loans, exit/liquidity planning, portfolio and wealth management',
    subVerticals: {
      BUSINESS_LOANS: {
        id: 'business_loans',
        name: 'Business Loans',
        description: 'Businesses seeking capital with minimum $100K monthly revenue',
        leadTypes: ['Term Loan', 'Line of Credit', 'SBA Loan', 'Equipment Financing', 'Invoice Factoring', 'Merchant Cash Advance'],
        columns: [
          { key: 'businessName', label: 'Business Name', type: 'text', sortable: true },
          { key: 'ownerName', label: 'Owner/Contact', type: 'text', sortable: true },
          { key: 'industry', label: 'Industry', type: 'text', sortable: true },
          { key: 'monthlyRevenue', label: 'Monthly Revenue', type: 'currency', sortable: true },
          { key: 'annualRevenue', label: 'Annual Revenue', type: 'currency', sortable: true },
          { key: 'yearsInBusiness', label: 'Years in Business', type: 'number', sortable: true },
          { key: 'creditScore', label: 'Credit Score', type: 'number', sortable: true },
          { key: 'requestedAmount', label: 'Requested Amount', type: 'currency', sortable: true },
          { key: 'loanPurpose', label: 'Loan Purpose', type: 'select', options: ['Expansion', 'Working Capital', 'Equipment', 'Real Estate', 'Inventory', 'Debt Consolidation', 'Payroll'], sortable: true },
          { key: 'currentDebt', label: 'Current Debt', type: 'currency', sortable: true },
          { key: 'dscr', label: 'DSCR', type: 'number', sortable: true },
          { key: 'collateralAvailable', label: 'Collateral Available', type: 'boolean', sortable: true },
          { key: 'bankStatements', label: 'Bank Statements (months)', type: 'number', sortable: false },
          { key: 'state', label: 'State', type: 'text', sortable: true },
          { key: 'entityType', label: 'Entity Type', type: 'select', options: ['LLC', 'S-Corp', 'C-Corp', 'Sole Proprietor', 'Partnership'], sortable: true },
          { key: 'urgency', label: 'Funding Urgency', type: 'select', options: ['Immediate (< 1 week)', 'Short-term (1-4 weeks)', 'Medium (1-3 months)', 'Planning (3+ months)'], sortable: true },
        ],
        scoringWeights: {
          revenueStrength: 0.25,
          creditworthiness: 0.20,
          businessMaturity: 0.15,
          debtServiceCapacity: 0.15,
          urgencySignal: 0.10,
          engagementSignal: 0.10,
          collateralPosition: 0.05,
        },
        qualificationCriteria: {
          minMonthlyRevenue: 100000,
          minYearsInBusiness: 1,
          minCreditScore: 550,
          requiredFields: ['businessName', 'monthlyRevenue', 'yearsInBusiness', 'requestedAmount'],
          disqualifiers: ['Monthly revenue under $100K', 'Startup with no revenue history'],
        },
      },

      EXIT_LIQUIDITY: {
        id: 'exit_liquidity',
        name: 'Business Exit / Liquidity',
        description: 'Business owners planning exits, mergers, acquisitions, or liquidity events',
        leadTypes: ['Full Sale', 'Partial Sale/Recapitalization', 'Merger', 'Management Buyout', 'ESOP', 'IPO Readiness'],
        columns: [
          { key: 'businessName', label: 'Business Name', type: 'text', sortable: true },
          { key: 'ownerName', label: 'Owner/Contact', type: 'text', sortable: true },
          { key: 'industry', label: 'Industry', type: 'text', sortable: true },
          { key: 'annualRevenue', label: 'Annual Revenue', type: 'currency', sortable: true },
          { key: 'ebitda', label: 'EBITDA', type: 'currency', sortable: true },
          { key: 'businessValuation', label: 'Est. Valuation', type: 'currency', sortable: true },
          { key: 'yearsInBusiness', label: 'Years in Business', type: 'number', sortable: true },
          { key: 'ownerAge', label: 'Owner Age', type: 'number', sortable: true },
          { key: 'exitTimeline', label: 'Exit Timeline', type: 'select', options: ['Immediate (< 6 months)', '6-12 months', '1-2 years', '2-5 years', 'Exploring options'], sortable: true },
          { key: 'exitType', label: 'Preferred Exit', type: 'select', options: ['Full Sale', 'Partial Sale', 'Merger', 'MBO', 'ESOP', 'IPO', 'Undecided'], sortable: true },
          { key: 'hasAdvisor', label: 'Has M&A Advisor', type: 'boolean', sortable: true },
          { key: 'employeeCount', label: 'Employees', type: 'number', sortable: true },
          { key: 'recurringRevenue', label: 'Recurring Revenue %', type: 'number', sortable: true },
          { key: 'successionPlan', label: 'Succession Plan', type: 'boolean', sortable: true },
          { key: 'state', label: 'State', type: 'text', sortable: true },
        ],
        scoringWeights: {
          businessValue: 0.25,
          exitReadiness: 0.20,
          timelineUrgency: 0.20,
          financialHealth: 0.15,
          engagementSignal: 0.10,
          advisorGap: 0.10,
        },
        qualificationCriteria: {
          minAnnualRevenue: 500000,
          requiredFields: ['businessName', 'annualRevenue', 'exitTimeline'],
          disqualifiers: ['No intention to sell', 'Pre-revenue startup'],
        },
      },

      WEALTH_MANAGEMENT: {
        id: 'wealth_management',
        name: 'Portfolio / Wealth Management',
        description: 'Individuals and companies seeking portfolio management, financial planning, and wealth advisory',
        leadTypes: ['High Net Worth Individual', 'Ultra High Net Worth', 'Corporate Treasury', 'Family Office', 'Retirement Planning', 'Trust & Estate'],
        columns: [
          { key: 'contactName', label: 'Contact Name', type: 'text', sortable: true },
          { key: 'entityName', label: 'Entity/Company', type: 'text', sortable: true },
          { key: 'clientType', label: 'Client Type', type: 'select', options: ['Individual', 'Couple', 'Family', 'Corporate', 'Trust', 'Foundation'], sortable: true },
          { key: 'investableAssets', label: 'Investable Assets', type: 'currency', sortable: true },
          { key: 'totalNetWorth', label: 'Total Net Worth', type: 'currency', sortable: true },
          { key: 'annualIncome', label: 'Annual Income', type: 'currency', sortable: true },
          { key: 'currentAdvisor', label: 'Current Advisor', type: 'text', sortable: false },
          { key: 'advisorSatisfaction', label: 'Advisor Satisfaction', type: 'select', options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'No Advisor'], sortable: true },
          { key: 'investmentGoals', label: 'Investment Goals', type: 'multiselect', options: ['Growth', 'Income', 'Preservation', 'Tax Optimization', 'Retirement', 'Education', 'Legacy'], sortable: false },
          { key: 'riskTolerance', label: 'Risk Tolerance', type: 'select', options: ['Conservative', 'Moderate-Conservative', 'Moderate', 'Moderate-Aggressive', 'Aggressive'], sortable: true },
          { key: 'age', label: 'Age', type: 'number', sortable: true },
          { key: 'retirementTimeline', label: 'Retirement Timeline', type: 'select', options: ['Already Retired', '< 5 years', '5-10 years', '10-20 years', '20+ years'], sortable: true },
          { key: 'lifeEvent', label: 'Recent Life Event', type: 'select', options: ['None', 'Inheritance', 'Business Sale', 'Divorce', 'Retirement', 'Windfall', 'Death of Spouse'], sortable: true },
          { key: 'state', label: 'State', type: 'text', sortable: true },
        ],
        scoringWeights: {
          assetLevel: 0.25,
          advisorDissatisfaction: 0.20,
          lifeEventTrigger: 0.15,
          engagementSignal: 0.15,
          wealthGrowthPotential: 0.10,
          complexityNeed: 0.10,
          geographicFit: 0.05,
        },
        qualificationCriteria: {
          minInvestableAssets: 250000,
          requiredFields: ['contactName', 'investableAssets'],
          disqualifiers: ['Under $250K investable assets', 'Very satisfied with current advisor'],
        },
      },
    },
  },

  REAL_ESTATE: {
    id: 'real_estate',
    name: 'Real Estate',
    icon: 'Building',
    color: '#8b5cf6',
    description: 'Residential and commercial property buyer leads',
    subVerticals: {
      RESIDENTIAL_SFH: {
        id: 'residential_sfh',
        name: 'Residential - Single Family',
        description: 'Buyer leads for single-family homes',
        leadTypes: ['First-Time Buyer', 'Move-Up Buyer', 'Downsizer', 'Investor', 'Relocation', 'Vacation Home'],
        columns: [
          { key: 'buyerName', label: 'Buyer Name', type: 'text', sortable: true },
          { key: 'buyerType', label: 'Buyer Type', type: 'select', options: ['First-Time', 'Move-Up', 'Downsizer', 'Investor', 'Relocation', 'Vacation'], sortable: true },
          { key: 'budgetMin', label: 'Budget Min', type: 'currency', sortable: true },
          { key: 'budgetMax', label: 'Budget Max', type: 'currency', sortable: true },
          { key: 'preApproved', label: 'Pre-Approved', type: 'boolean', sortable: true },
          { key: 'preApprovalAmount', label: 'Pre-Approval Amt', type: 'currency', sortable: true },
          { key: 'lender', label: 'Lender', type: 'text', sortable: false },
          { key: 'downPaymentReady', label: 'Down Payment Ready', type: 'boolean', sortable: true },
          { key: 'downPaymentPercent', label: 'Down Payment %', type: 'number', sortable: true },
          { key: 'preferredLocations', label: 'Preferred Locations', type: 'text', sortable: false },
          { key: 'bedrooms', label: 'Bedrooms', type: 'number', sortable: true },
          { key: 'bathrooms', label: 'Bathrooms', type: 'number', sortable: true },
          { key: 'sqftMin', label: 'Min Sq Ft', type: 'number', sortable: true },
          { key: 'purchaseTimeline', label: 'Timeline', type: 'select', options: ['Immediate', '1-3 months', '3-6 months', '6-12 months', '12+ months'], sortable: true },
          { key: 'hasAgent', label: 'Has Agent', type: 'boolean', sortable: true },
          { key: 'currentHousing', label: 'Current Housing', type: 'select', options: ['Renting', 'Own - Selling', 'Own - Keeping', 'Living with Family', 'Other'], sortable: true },
          { key: 'mustSellFirst', label: 'Must Sell First', type: 'boolean', sortable: true },
          { key: 'creditScore', label: 'Credit Score', type: 'number', sortable: true },
          { key: 'state', label: 'State', type: 'text', sortable: true },
        ],
        scoringWeights: {
          financialReadiness: 0.25,
          timelineUrgency: 0.20,
          preApprovalStatus: 0.15,
          engagementSignal: 0.15,
          motivationLevel: 0.10,
          marketAlignment: 0.10,
          agentStatus: 0.05,
        },
        qualificationCriteria: {
          requiredFields: ['buyerName', 'budgetMax', 'purchaseTimeline'],
          disqualifiers: ['No financing plan', 'Timeline over 18 months with no urgency'],
        },
      },

      RESIDENTIAL_MFH: {
        id: 'residential_mfh',
        name: 'Residential - Multifamily',
        description: 'Buyer leads for multifamily/investment residential properties',
        leadTypes: ['Duplex/Triplex', 'Small Apartment (5-20 units)', 'Mid-Size (20-100 units)', 'Large Complex (100+)', 'House Hack', 'Portfolio Builder'],
        columns: [
          { key: 'buyerName', label: 'Buyer/Entity Name', type: 'text', sortable: true },
          { key: 'investorType', label: 'Investor Type', type: 'select', options: ['First-Time Investor', 'Experienced', 'Institutional', 'Syndicator', 'House Hacker', '1031 Exchange'], sortable: true },
          { key: 'budgetMin', label: 'Budget Min', type: 'currency', sortable: true },
          { key: 'budgetMax', label: 'Budget Max', type: 'currency', sortable: true },
          { key: 'unitCountTarget', label: 'Target Units', type: 'text', sortable: true },
          { key: 'preferredCapRate', label: 'Min Cap Rate %', type: 'number', sortable: true },
          { key: 'cashOnCashTarget', label: 'Target Cash-on-Cash %', type: 'number', sortable: true },
          { key: 'financingType', label: 'Financing', type: 'select', options: ['Conventional', 'FHA', 'VA', 'Commercial', 'Hard Money', 'Cash', 'Seller Finance', '1031 Exchange'], sortable: true },
          { key: 'preApproved', label: 'Pre-Approved', type: 'boolean', sortable: true },
          { key: 'proofOfFunds', label: 'Proof of Funds', type: 'boolean', sortable: true },
          { key: 'existingPortfolio', label: 'Existing Units Owned', type: 'number', sortable: true },
          { key: 'preferredLocations', label: 'Target Markets', type: 'text', sortable: false },
          { key: 'purchaseTimeline', label: 'Timeline', type: 'select', options: ['Immediate', '1-3 months', '3-6 months', '6-12 months', '12+ months'], sortable: true },
          { key: 'valueAddInterest', label: 'Value-Add Interest', type: 'boolean', sortable: true },
          { key: 'managementPreference', label: 'Management', type: 'select', options: ['Self-Managed', 'Property Manager', 'Undecided'], sortable: true },
          { key: 'state', label: 'State', type: 'text', sortable: true },
        ],
        scoringWeights: {
          financialCapacity: 0.25,
          investorExperience: 0.15,
          timelineUrgency: 0.20,
          financingReadiness: 0.15,
          engagementSignal: 0.10,
          portfolioGrowth: 0.10,
          marketKnowledge: 0.05,
        },
        qualificationCriteria: {
          requiredFields: ['buyerName', 'budgetMax', 'purchaseTimeline'],
          disqualifiers: ['No capital or financing plan', 'No investment experience and no education interest'],
        },
      },

      COMMERCIAL: {
        id: 'commercial',
        name: 'Commercial Property',
        description: 'Buyer leads for commercial real estate (office, retail, industrial, mixed-use)',
        leadTypes: ['Office', 'Retail', 'Industrial/Warehouse', 'Mixed-Use', 'Land/Development', 'NNN/Triple Net', 'Self-Storage', 'Medical Office'],
        columns: [
          { key: 'buyerName', label: 'Buyer/Entity Name', type: 'text', sortable: true },
          { key: 'entityType', label: 'Entity Type', type: 'select', options: ['Individual', 'LLC', 'Corporation', 'REIT', 'Fund', 'Partnership', 'Trust'], sortable: true },
          { key: 'propertyType', label: 'Property Type', type: 'select', options: ['Office', 'Retail', 'Industrial', 'Mixed-Use', 'Land', 'NNN', 'Self-Storage', 'Medical', 'Hospitality'], sortable: true },
          { key: 'budgetMin', label: 'Budget Min', type: 'currency', sortable: true },
          { key: 'budgetMax', label: 'Budget Max', type: 'currency', sortable: true },
          { key: 'preferredCapRate', label: 'Min Cap Rate %', type: 'number', sortable: true },
          { key: 'noi', label: 'Target NOI', type: 'currency', sortable: true },
          { key: 'sqftTarget', label: 'Target Sq Ft', type: 'text', sortable: false },
          { key: 'financingType', label: 'Financing', type: 'select', options: ['Commercial Loan', 'SBA 504', 'Bridge Loan', 'Cash', 'Seller Finance', '1031 Exchange', 'CMBS'], sortable: true },
          { key: 'proofOfFunds', label: 'Proof of Funds', type: 'boolean', sortable: true },
          { key: 'existingPortfolio', label: 'Portfolio Value', type: 'currency', sortable: true },
          { key: 'preferredLocations', label: 'Target Markets', type: 'text', sortable: false },
          { key: 'purchaseTimeline', label: 'Timeline', type: 'select', options: ['Immediate', '1-3 months', '3-6 months', '6-12 months', '12+ months'], sortable: true },
          { key: 'is1031', label: '1031 Exchange', type: 'boolean', sortable: true },
          { key: 'tenantStatus', label: 'Tenant Preference', type: 'select', options: ['Fully Leased', 'Partially Leased', 'Value-Add/Vacant', 'Owner-Occupied', 'Any'], sortable: true },
          { key: 'state', label: 'State', type: 'text', sortable: true },
        ],
        scoringWeights: {
          financialCapacity: 0.25,
          timelineUrgency: 0.20,
          investorSophistication: 0.15,
          financingReadiness: 0.15,
          engagementSignal: 0.10,
          dealFlow1031: 0.10,
          marketAlignment: 0.05,
        },
        qualificationCriteria: {
          minBudget: 250000,
          requiredFields: ['buyerName', 'propertyType', 'budgetMax'],
          disqualifiers: ['No financing or proof of funds', 'No commercial experience and no advisor'],
        },
      },
    },
  },

  ENERGY: {
    id: 'energy',
    name: 'Energy',
    icon: 'Zap',
    color: '#f59e0b',
    description: 'Energy switching, AT&T products, independent sales agents, and CAT buyer landscape',
    subVerticals: {
      END_CUSTOMER_BUSINESS: {
        id: 'end_customer_business',
        name: 'Business Energy Customers',
        description: 'Businesses in deregulated states switching energy suppliers or signing up for AT&T products',
        leadTypes: ['Energy Switching', 'AT&T Business Products', 'Bundle (Energy + Telecom)', 'Renewable Energy', 'Demand Response'],
        columns: [
          { key: 'businessName', label: 'Business Name', type: 'text', sortable: true },
          { key: 'contactName', label: 'Decision Maker', type: 'text', sortable: true },
          { key: 'contactTitle', label: 'Title', type: 'text', sortable: true },
          { key: 'industry', label: 'Industry', type: 'text', sortable: true },
          { key: 'state', label: 'State', type: 'text', sortable: true },
          { key: 'deregulatedMarket', label: 'Deregulated Market', type: 'boolean', sortable: true },
          { key: 'currentProvider', label: 'Current Provider', type: 'text', sortable: true },
          { key: 'monthlyBill', label: 'Monthly Energy Bill', type: 'currency', sortable: true },
          { key: 'annualUsageKwh', label: 'Annual Usage (kWh)', type: 'number', sortable: true },
          { key: 'contractEndDate', label: 'Contract End Date', type: 'date', sortable: true },
          { key: 'contractStatus', label: 'Contract Status', type: 'select', options: ['No Contract', 'Month-to-Month', 'Expiring < 3 months', 'Expiring 3-6 months', 'Locked 6+ months'], sortable: true },
          { key: 'estimatedSavings', label: 'Est. Monthly Savings', type: 'currency', sortable: true },
          { key: 'interestedInATT', label: 'Interested in AT&T', type: 'boolean', sortable: true },
          { key: 'currentTelecom', label: 'Current Telecom', type: 'text', sortable: false },
          { key: 'numLocations', label: 'Locations', type: 'number', sortable: true },
          { key: 'employeeCount', label: 'Employees', type: 'number', sortable: true },
          { key: 'greenInterest', label: 'Green Energy Interest', type: 'boolean', sortable: true },
        ],
        scoringWeights: {
          contractTiming: 0.25,
          savingsPotential: 0.20,
          deregulatedStatus: 0.15,
          billSize: 0.15,
          engagementSignal: 0.10,
          multiLocationValue: 0.10,
          bundleOpportunity: 0.05,
        },
        qualificationCriteria: {
          requiredFields: ['businessName', 'state', 'monthlyBill'],
          disqualifiers: ['Regulated market only', 'Locked in long-term contract with early termination fee'],
        },
      },

      END_CUSTOMER_CONSUMER: {
        id: 'end_customer_consumer',
        name: 'Consumer Energy Customers',
        description: 'Consumers in deregulated states switching energy suppliers or signing up for AT&T products',
        leadTypes: ['Energy Switching', 'AT&T Consumer Products', 'Bundle (Energy + Telecom)', 'Solar Interest', 'Green Energy'],
        columns: [
          { key: 'consumerName', label: 'Consumer Name', type: 'text', sortable: true },
          { key: 'state', label: 'State', type: 'text', sortable: true },
          { key: 'zipCode', label: 'ZIP Code', type: 'text', sortable: true },
          { key: 'deregulatedMarket', label: 'Deregulated Market', type: 'boolean', sortable: true },
          { key: 'currentProvider', label: 'Current Provider', type: 'text', sortable: true },
          { key: 'monthlyBill', label: 'Monthly Bill', type: 'currency', sortable: true },
          { key: 'annualUsageKwh', label: 'Annual Usage (kWh)', type: 'number', sortable: true },
          { key: 'contractEndDate', label: 'Contract End Date', type: 'date', sortable: true },
          { key: 'contractStatus', label: 'Contract Status', type: 'select', options: ['No Contract', 'Month-to-Month', 'Expiring < 3 months', 'Expiring 3-6 months', 'Locked 6+ months'], sortable: true },
          { key: 'estimatedSavings', label: 'Est. Monthly Savings', type: 'currency', sortable: true },
          { key: 'homeOwner', label: 'Homeowner', type: 'boolean', sortable: true },
          { key: 'interestedInATT', label: 'Interested in AT&T', type: 'boolean', sortable: true },
          { key: 'currentTelecom', label: 'Current Telecom', type: 'text', sortable: false },
          { key: 'householdSize', label: 'Household Size', type: 'number', sortable: true },
          { key: 'solarInterest', label: 'Solar Interest', type: 'boolean', sortable: true },
          { key: 'creditWorthy', label: 'Credit Worthy', type: 'boolean', sortable: true },
        ],
        scoringWeights: {
          contractTiming: 0.25,
          savingsPotential: 0.20,
          deregulatedStatus: 0.15,
          homeownership: 0.10,
          engagementSignal: 0.15,
          bundleOpportunity: 0.10,
          creditWorthiness: 0.05,
        },
        qualificationCriteria: {
          requiredFields: ['consumerName', 'state', 'zipCode'],
          disqualifiers: ['Regulated market only', 'Locked in long-term contract'],
        },
      },

      INDEPENDENT_AGENTS: {
        id: 'independent_agents',
        name: 'Independent Sales Agents',
        description: 'Finding independent salespeople/closers to join the Utility Network as 1099 agents',
        leadTypes: ['Experienced Energy Agent', 'Telecom Sales Pro', 'Insurance Agent Crossover', 'D2D Sales Veteran', 'Business Owner with Network', 'MLM/Network Marketing Pro'],
        columns: [
          { key: 'agentName', label: 'Agent Name', type: 'text', sortable: true },
          { key: 'currentRole', label: 'Current Role', type: 'text', sortable: true },
          { key: 'salesExperience', label: 'Sales Experience (years)', type: 'number', sortable: true },
          { key: 'industryBackground', label: 'Industry Background', type: 'multiselect', options: ['Energy', 'Telecom', 'Insurance', 'Real Estate', 'D2D', 'B2B', 'Retail', 'MLM/Network Marketing'], sortable: false },
          { key: 'existingCustomerBase', label: 'Existing Customer Base', type: 'number', sortable: true },
          { key: 'existingNetwork', label: 'Has Existing Network', type: 'boolean', sortable: true },
          { key: 'networkSize', label: 'Network Size', type: 'number', sortable: true },
          { key: 'closingAbility', label: 'Closing Ability', type: 'select', options: ['Proven Closer', 'Good', 'Average', 'Learning', 'Unknown'], sortable: true },
          { key: 'availability', label: 'Availability', type: 'select', options: ['Full-Time', 'Part-Time', 'Side Hustle', 'Weekend Only'], sortable: true },
          { key: 'state', label: 'State', type: 'text', sortable: true },
          { key: 'licensedStates', label: 'Licensed States', type: 'text', sortable: false },
          { key: 'monthlyIncomeGoal', label: 'Monthly Income Goal', type: 'currency', sortable: true },
          { key: 'currentMonthlyIncome', label: 'Current Monthly Income', type: 'currency', sortable: true },
          { key: 'willingTo1099', label: 'Willing to 1099', type: 'boolean', sortable: true },
          { key: 'hasOwnTransportation', label: 'Own Transportation', type: 'boolean', sortable: true },
          { key: 'bilingualLanguages', label: 'Languages', type: 'text', sortable: false },
          { key: 'linkedinProfile', label: 'LinkedIn', type: 'text', sortable: false },
          { key: 'referralSource', label: 'Referral Source', type: 'text', sortable: true },
        ],
        scoringWeights: {
          existingCustomerBase: 0.25,
          salesExperience: 0.20,
          closingAbility: 0.15,
          networkSize: 0.15,
          availability: 0.10,
          industryRelevance: 0.10,
          incomeMotivation: 0.05,
        },
        qualificationCriteria: {
          requiredFields: ['agentName', 'salesExperience', 'state'],
          preferredFields: ['existingCustomerBase', 'closingAbility'],
          disqualifiers: ['No sales experience', 'Not willing to 1099', 'No transportation in field role'],
        },
      },

      CAT_BUYER: {
        id: 'cat_buyer',
        name: 'CAT Buyer Landscape',
        description: 'Customer Acquisition Tool buyer leads across the energy and telecom ecosystem',
        leadTypes: ['Energy Retailer', 'Telecom Reseller', 'Solar Installer', 'HVAC Company', 'Home Services', 'Insurance Agency', 'Real Estate Brokerage'],
        columns: [
          { key: 'companyName', label: 'Company Name', type: 'text', sortable: true },
          { key: 'contactName', label: 'Contact Name', type: 'text', sortable: true },
          { key: 'contactTitle', label: 'Title', type: 'text', sortable: true },
          { key: 'companyType', label: 'Company Type', type: 'select', options: ['Energy Retailer', 'Telecom Reseller', 'Solar Installer', 'HVAC', 'Home Services', 'Insurance Agency', 'Real Estate Brokerage', 'Other'], sortable: true },
          { key: 'annualRevenue', label: 'Annual Revenue', type: 'currency', sortable: true },
          { key: 'employeeCount', label: 'Employees', type: 'number', sortable: true },
          { key: 'currentCAT', label: 'Current CAT Tool', type: 'text', sortable: true },
          { key: 'catBudget', label: 'CAT Budget (annual)', type: 'currency', sortable: true },
          { key: 'agentCount', label: 'Sales Agents', type: 'number', sortable: true },
          { key: 'marketsCovered', label: 'Markets Covered', type: 'text', sortable: false },
          { key: 'painPoints', label: 'Pain Points', type: 'multiselect', options: ['Lead Quality', 'Lead Volume', 'Cost Per Lead', 'CRM Integration', 'Compliance', 'Agent Management', 'Reporting'], sortable: false },
          { key: 'decisionTimeline', label: 'Decision Timeline', type: 'select', options: ['Immediate', '1-3 months', '3-6 months', '6+ months', 'Evaluating'], sortable: true },
          { key: 'contractEndDate', label: 'Current Contract End', type: 'date', sortable: true },
          { key: 'state', label: 'HQ State', type: 'text', sortable: true },
        ],
        scoringWeights: {
          companySize: 0.20,
          catBudget: 0.20,
          decisionTimeline: 0.20,
          painPointSeverity: 0.15,
          engagementSignal: 0.10,
          agentScale: 0.10,
          currentToolGap: 0.05,
        },
        qualificationCriteria: {
          requiredFields: ['companyName', 'contactName', 'companyType'],
          disqualifiers: ['No budget for CAT tools', 'Recently signed long-term contract'],
        },
      },
    },
  },
};

// =============================================================================
// DEREGULATED STATES REFERENCE
// =============================================================================

export const DEREGULATED_STATES = {
  electricity: {
    full: ['TX', 'PA', 'OH', 'IL', 'NJ', 'MD', 'CT', 'MA', 'NY', 'ME', 'NH', 'RI', 'DE', 'DC'],
    partial: ['CA', 'MI', 'VA', 'OR', 'MT', 'NV', 'GA'],
  },
  naturalGas: {
    full: ['OH', 'PA', 'NJ', 'NY', 'MD', 'CT', 'MA', 'GA', 'VA', 'IL'],
    partial: ['CA', 'MI', 'IN', 'KY', 'WY', 'NV'],
  },
};

export const isDeregulated = (state, utilityType = 'electricity') => {
  const stateUpper = state?.toUpperCase();
  const config = DEREGULATED_STATES[utilityType];
  if (!config) return false;
  return config.full.includes(stateUpper) || config.partial.includes(stateUpper);
};

export const getDeregulationLevel = (state, utilityType = 'electricity') => {
  const stateUpper = state?.toUpperCase();
  const config = DEREGULATED_STATES[utilityType];
  if (!config) return 'regulated';
  if (config.full.includes(stateUpper)) return 'full';
  if (config.partial.includes(stateUpper)) return 'partial';
  return 'regulated';
};

// =============================================================================
// ENROLLMENT PERIOD LOGIC (HEALTHCARE)
// =============================================================================

export const getActiveEnrollmentPeriods = (date = new Date()) => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const periods = [];

  // AEP: Oct 15 - Dec 7 (Medicare)
  if ((month === 10 && day >= 15) || month === 11 || (month === 12 && day <= 7)) {
    periods.push({ id: 'AEP', name: 'Annual Enrollment Period (Medicare)', priority: 'critical' });
  }
  // OEP: Jan 1 - Mar 31 (Medicare Advantage)
  if (month >= 1 && month <= 3) {
    periods.push({ id: 'OEP', name: 'Open Enrollment Period (Medicare Advantage)', priority: 'high' });
  }
  // ACA OEP: Nov 1 - Jan 15
  if (month >= 11 || (month === 1 && day <= 15)) {
    periods.push({ id: 'ACA_OEP', name: 'ACA Open Enrollment Period', priority: 'critical' });
  }
  // IEP is always active (individual-specific)
  periods.push({ id: 'IEP', name: 'Initial Enrollment Period', priority: 'medium' });
  // SEP is always possible
  periods.push({ id: 'SEP', name: 'Special Enrollment Period', priority: 'medium' });

  return periods;
};

// =============================================================================
// HELPER UTILITIES
// =============================================================================

export const getIndustry = (industryId) => {
  return Object.values(INDUSTRIES).find(i => i.id === industryId);
};

export const getSubVertical = (industryId, subVerticalId) => {
  const industry = getIndustry(industryId);
  if (!industry) return null;
  return Object.values(industry.subVerticals).find(sv => sv.id === subVerticalId);
};

export const getAllSubVerticals = () => {
  const result = [];
  Object.values(INDUSTRIES).forEach(industry => {
    Object.values(industry.subVerticals).forEach(sv => {
      result.push({ ...sv, industryId: industry.id, industryName: industry.name, industryColor: industry.color });
    });
  });
  return result;
};

export const getColumnsForSubVertical = (industryId, subVerticalId) => {
  const sv = getSubVertical(industryId, subVerticalId);
  if (!sv) return [];
  // Always include base columns
  const baseColumns = [
    { key: 'id', label: 'ID', type: 'text', sortable: false, system: true },
    { key: 'status', label: 'Status', type: 'select', options: ['Hot', 'Warm', 'Cold', 'New', 'Qualified', 'Disqualified'], sortable: true, system: true },
    { key: 'score', label: 'Score', type: 'number', sortable: true, system: true },
    { key: 'source', label: 'Source', type: 'text', sortable: true, system: true },
    { key: 'createdAt', label: 'Created', type: 'date', sortable: true, system: true },
    { key: 'lastContact', label: 'Last Contact', type: 'date', sortable: true, system: true },
    { key: 'assignedTo', label: 'Assigned To', type: 'text', sortable: true, system: true },
    { key: 'notes', label: 'Notes', type: 'text', sortable: false, system: true },
  ];
  return [...baseColumns, ...sv.columns];
};

export default INDUSTRIES;
