/**
 * Industry-Specific Lead Data Generator
 *
 * Generates realistic mock leads for each industry and sub-vertical
 * with plausible data distributions. Used for demo/prototype purposes.
 *
 * @module services/leadDataGenerator
 */

import { DEREGULATED_STATES } from './industryConfig';
import { batchScoreLeads } from './leadScoringEngine';

// =============================================================================
// RANDOM HELPERS
// =============================================================================

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const chance = (pct) => Math.random() * 100 < pct;
const pastDate = (maxDaysAgo, minDaysAgo = 0) => {
  const daysAgo = randInt(minDaysAgo, maxDaysAgo);
  return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
};
const futureDate = (minDaysAhead, maxDaysAhead) => {
  const days = randInt(minDaysAhead, maxDaysAhead);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
};
const uuid = () => `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// =============================================================================
// NAME POOLS
// =============================================================================

const FIRST_NAMES = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Carlos', 'Maria', 'Luis', 'Rosa', 'Ahmed', 'Fatima', 'Wei', 'Ming', 'Raj', 'Priya', 'Jamal', 'Keisha', 'Dmitri', 'Olga', 'Hiroshi', 'Yuki'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Patel', 'Kim', 'Chen', 'Singh'];
const randomName = () => `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;

const STATES = ['TX', 'PA', 'OH', 'IL', 'NJ', 'MD', 'CT', 'MA', 'NY', 'FL', 'CA', 'GA', 'VA', 'NC', 'AZ', 'CO', 'MI', 'MN', 'WA', 'OR'];
const DEREGULATED_ONLY = ['TX', 'PA', 'OH', 'IL', 'NJ', 'MD', 'CT', 'MA', 'NY', 'ME', 'NH', 'RI'];
const SOURCES = ['LinkedIn', 'Website', 'Referral', 'Native Ad', 'Database', 'Outbound', 'Webinar', 'Partner', 'Social Media', 'Cold Call'];
const STATUSES = ['Hot', 'Warm', 'Cold', 'New'];

const BUSINESS_NAMES_POOL = ['Apex Industries', 'Summit Enterprises', 'Vanguard Solutions', 'Pinnacle Group', 'Horizon Corp', 'Atlas Holdings', 'Meridian Services', 'Stellar Systems', 'Nova Technologies', 'Quantum Dynamics', 'Nexus Partners', 'Vertex Capital', 'Keystone Manufacturing', 'Liberty Logistics', 'Pacific Rim Trading', 'Continental Resources', 'Metropolitan Services', 'Precision Engineering', 'Greenfield Organics', 'Blue Ridge Consulting', 'Ironworks Fabrication', 'Coastline Properties', 'Oakwood Developments', 'Riverside Healthcare', 'Harbor Financial', 'Eagle Eye Security', 'Silverline Auto', 'Golden Gate Foods', 'Redwood Analytics', 'Cypress Medical Group'];

const ENERGY_PROVIDERS = ['Duke Energy', 'Dominion Energy', 'Southern Company', 'Exelon', 'NextEra', 'AES', 'Entergy', 'Eversource', 'ConEdison', 'Direct Energy', 'TXU Energy', 'Reliant', 'Ambit Energy', 'Champion Energy', 'Green Mountain Energy'];
const TELECOM_PROVIDERS = ['AT&T', 'Verizon', 'T-Mobile', 'Spectrum', 'Comcast', 'Cox', 'Frontier', 'CenturyLink', 'Windstream'];

// =============================================================================
// HEALTHCARE GENERATORS
// =============================================================================

function generateMedicareLead(i) {
  const age = randInt(64, 88);
  const enrollment = pick(['IEP', 'AEP', 'OEP', 'SEP', 'GI', 'N/A']);
  const conditions = [];
  if (chance(35)) conditions.push('Diabetes');
  if (chance(25)) conditions.push('Heart Disease');
  if (chance(15)) conditions.push('COPD');
  if (chance(8)) conditions.push('Cancer');
  if (chance(10)) conditions.push('Kidney Disease');
  if (conditions.length === 0 && chance(50)) conditions.push('None');

  return {
    id: uuid(),
    name: randomName(),
    email: `medicare.lead${i}@example.com`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
    status: pick(STATUSES),
    source: pick(SOURCES),
    interactions: randInt(0, 12),
    lastContact: pastDate(45),
    createdAt: pastDate(90),
    notes: '',
    assignedTo: '',
    // Medicare-specific
    age,
    dateOfBirth: new Date(Date.now() - age * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    medicareEligibilityDate: new Date(Date.now() - (age - 65) * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currentCoverage: pick(['None', 'Original Medicare', 'Medicare Advantage', 'Medigap', 'Employer', 'Medicaid']),
    partAEffective: age >= 65 ? pastDate(365 * (age - 65), 365 * Math.max(0, age - 66)).split('T')[0] : '',
    partBEffective: age >= 65 ? pastDate(365 * (age - 65), 365 * Math.max(0, age - 66)).split('T')[0] : '',
    enrollmentPeriod: enrollment,
    zipCode: `${randInt(10000, 99999)}`,
    county: pick(['Miami-Dade', 'Broward', 'Cook', 'Harris', 'Maricopa', 'Los Angeles', 'King', 'Clark', 'Hillsborough', 'Orange']),
    prescriptionDrugs: randInt(0, 12),
    preferredDoctors: chance(40) ? `Dr. ${pick(LAST_NAMES)}` : '',
    chronicConditions: conditions,
    incomeLevel: pick(['Below $22K', '$22K-$35K', '$35K-$55K', '$55K-$85K', '$85K+']),
    preferredCarrier: chance(30) ? pick(['UnitedHealthcare', 'Humana', 'Aetna', 'Cigna', 'Blue Cross', 'WellCare', 'Molina']) : '',
    tobaccoUse: chance(15),
    dualEligible: chance(20),
  };
}

function generateACALead(i) {
  const age = randInt(18, 64);
  const householdSize = randInt(1, 6);
  const income = randInt(15000, 120000);
  const fplBase = { 1: 15060, 2: 20440, 3: 25820, 4: 31200, 5: 36580, 6: 41960 };
  const fpl = Math.round((income / (fplBase[Math.min(householdSize, 6)] || 31200)) * 100);

  return {
    id: uuid(),
    name: randomName(),
    email: `aca.lead${i}@example.com`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
    status: pick(STATUSES),
    source: pick(SOURCES),
    interactions: randInt(0, 10),
    lastContact: pastDate(30),
    createdAt: pastDate(60),
    notes: '',
    assignedTo: '',
    age,
    householdSize,
    annualIncome: income,
    fpl,
    currentCoverage: pick(['None/Uninsured', 'COBRA', 'Short-Term', 'Employer Ending', 'ACA Plan', 'Medicaid']),
    subsIdyEligible: fpl >= 100 && fpl <= 400,
    estimatedSubsidy: fpl <= 250 ? randInt(200, 800) : fpl <= 400 ? randInt(50, 300) : 0,
    enrollmentPeriod: pick(['OEP', 'SEP - Job Loss', 'SEP - Life Event', 'SEP - Medicaid Loss', 'N/A']),
    zipCode: `${randInt(10000, 99999)}`,
    state: pick(STATES),
    preExistingConditions: chance(30),
    preferredPlanType: pick(['Bronze', 'Silver', 'Gold', 'Platinum', 'Catastrophic', 'Undecided']),
    tobaccoUse: chance(12),
    sepQualifyingEvent: chance(40) ? pick(['Job loss', 'Marriage', 'Moved', 'Had a baby', 'Lost coverage']) : '',
    sepEventDate: chance(40) ? pastDate(55) : '',
  };
}

function generateVisionLead(i) {
  return {
    id: uuid(),
    name: randomName(),
    email: `vision.lead${i}@example.com`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
    status: pick(STATUSES),
    source: pick(SOURCES),
    interactions: randInt(0, 8),
    lastContact: pastDate(40),
    createdAt: pastDate(75),
    notes: '',
    assignedTo: '',
    age: randInt(18, 80),
    currentVisionCoverage: pick(['None', 'Employer Plan', 'Individual Plan', 'Medicare Vision', 'Medicaid Vision']),
    lastEyeExam: chance(70) ? pastDate(900) : '',
    wearsCorrectiveLenses: chance(65),
    familyMembers: randInt(1, 5),
    zipCode: `${randInt(10000, 99999)}`,
    preferredProvider: chance(25) ? pick(['LensCrafters', 'Pearle Vision', 'Warby Parker', 'Private Practice']) : '',
    annualSpend: randInt(0, 800),
    diabetic: chance(12),
    employerOffersVision: chance(35),
  };
}

function generateDentalLead(i) {
  const needs = [];
  if (chance(60)) needs.push('Preventive Only');
  if (chance(25)) needs.push('Basic Restorative');
  if (chance(15)) needs.push('Major Restorative');
  if (chance(12)) needs.push('Orthodontics');
  if (chance(5)) needs.push('Implants');
  if (chance(8)) needs.push('Cosmetic');

  return {
    id: uuid(),
    name: randomName(),
    email: `dental.lead${i}@example.com`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
    status: pick(STATUSES),
    source: pick(SOURCES),
    interactions: randInt(0, 8),
    lastContact: pastDate(40),
    createdAt: pastDate(75),
    notes: '',
    assignedTo: '',
    age: randInt(18, 80),
    currentDentalCoverage: pick(['None', 'Employer Plan', 'Individual Plan', 'Medicare Dental', 'Medicaid Dental', 'Discount Plan']),
    lastDentalVisit: chance(75) ? pastDate(730) : '',
    dentalNeeds: needs.length > 0 ? needs : ['Preventive Only'],
    familyMembers: randInt(1, 5),
    zipCode: `${randInt(10000, 99999)}`,
    annualBudget: randInt(200, 3000),
    preferredDentist: chance(30) ? `Dr. ${pick(LAST_NAMES)}` : '',
    pendingProcedures: chance(25),
    employerOffersDental: chance(35),
  };
}

// =============================================================================
// FINANCIAL SERVICES GENERATORS
// =============================================================================

function generateBusinessLoanLead(i) {
  const monthlyRev = randInt(80000, 2000000);
  const annualRev = monthlyRev * 12;
  const industries = ['Restaurant', 'Construction', 'Trucking', 'Retail', 'Medical Practice', 'Auto Repair', 'Manufacturing', 'E-Commerce', 'Professional Services', 'Wholesale Distribution'];

  return {
    id: uuid(),
    name: randomName(),
    email: `bizloan.lead${i}@example.com`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
    status: pick(STATUSES),
    source: pick(SOURCES),
    interactions: randInt(0, 10),
    lastContact: pastDate(30),
    createdAt: pastDate(60),
    notes: '',
    assignedTo: '',
    businessName: pick(BUSINESS_NAMES_POOL),
    ownerName: randomName(),
    industry: pick(industries),
    monthlyRevenue: monthlyRev,
    annualRevenue: annualRev,
    yearsInBusiness: randInt(1, 30),
    creditScore: randInt(550, 800),
    requestedAmount: randInt(50000, 5000000),
    loanPurpose: pick(['Expansion', 'Working Capital', 'Equipment', 'Real Estate', 'Inventory', 'Debt Consolidation', 'Payroll']),
    currentDebt: randInt(0, 2000000),
    dscr: randFloat(0.8, 3.0),
    collateralAvailable: chance(55),
    bankStatements: pick([3, 6, 12]),
    state: pick(STATES),
    entityType: pick(['LLC', 'S-Corp', 'C-Corp', 'Sole Proprietor', 'Partnership']),
    urgency: pick(['Immediate (< 1 week)', 'Short-term (1-4 weeks)', 'Medium (1-3 months)', 'Planning (3+ months)']),
  };
}

function generateExitLiquidityLead(i) {
  const annualRev = randInt(500000, 50000000);
  const ebitdaMargin = randFloat(0.08, 0.35);
  const ebitda = Math.round(annualRev * ebitdaMargin);
  const multiple = randFloat(3, 8);

  return {
    id: uuid(),
    name: randomName(),
    email: `exit.lead${i}@example.com`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
    status: pick(STATUSES),
    source: pick(SOURCES),
    interactions: randInt(0, 8),
    lastContact: pastDate(45),
    createdAt: pastDate(90),
    notes: '',
    assignedTo: '',
    businessName: pick(BUSINESS_NAMES_POOL),
    ownerName: randomName(),
    industry: pick(['Manufacturing', 'Technology', 'Healthcare', 'Professional Services', 'Distribution', 'Construction', 'Retail', 'Food & Beverage']),
    annualRevenue: annualRev,
    ebitda,
    businessValuation: Math.round(ebitda * multiple),
    yearsInBusiness: randInt(5, 40),
    ownerAge: randInt(45, 75),
    exitTimeline: pick(['Immediate (< 6 months)', '6-12 months', '1-2 years', '2-5 years', 'Exploring options']),
    exitType: pick(['Full Sale', 'Partial Sale', 'Merger', 'MBO', 'ESOP', 'IPO', 'Undecided']),
    hasAdvisor: chance(35),
    employeeCount: randInt(5, 500),
    recurringRevenue: randInt(10, 90),
    successionPlan: chance(30),
    state: pick(STATES),
  };
}

function generateWealthManagementLead(i) {
  const assets = randInt(250000, 25000000);
  const age = randInt(30, 80);

  return {
    id: uuid(),
    name: randomName(),
    email: `wealth.lead${i}@example.com`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
    status: pick(STATUSES),
    source: pick(SOURCES),
    interactions: randInt(0, 10),
    lastContact: pastDate(35),
    createdAt: pastDate(75),
    notes: '',
    assignedTo: '',
    contactName: randomName(),
    entityName: chance(30) ? pick(BUSINESS_NAMES_POOL) : '',
    clientType: pick(['Individual', 'Couple', 'Family', 'Corporate', 'Trust', 'Foundation']),
    investableAssets: assets,
    totalNetWorth: Math.round(assets * randFloat(1.5, 5)),
    annualIncome: randInt(100000, 2000000),
    currentAdvisor: chance(50) ? pick(['Morgan Stanley', 'Merrill Lynch', 'Edward Jones', 'Raymond James', 'Schwab', 'Fidelity', 'Independent RIA', 'None']) : '',
    advisorSatisfaction: pick(['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'No Advisor']),
    investmentGoals: (() => {
      const goals = [];
      if (chance(60)) goals.push('Growth');
      if (chance(40)) goals.push('Income');
      if (chance(30)) goals.push('Preservation');
      if (chance(45)) goals.push('Tax Optimization');
      if (chance(50)) goals.push('Retirement');
      if (chance(20)) goals.push('Education');
      if (chance(15)) goals.push('Legacy');
      return goals.length > 0 ? goals : ['Growth'];
    })(),
    riskTolerance: pick(['Conservative', 'Moderate-Conservative', 'Moderate', 'Moderate-Aggressive', 'Aggressive']),
    age,
    retirementTimeline: age >= 65 ? 'Already Retired' : age >= 60 ? '< 5 years' : age >= 55 ? '5-10 years' : age >= 45 ? '10-20 years' : '20+ years',
    lifeEvent: pick(['None', 'None', 'None', 'Inheritance', 'Business Sale', 'Divorce', 'Retirement', 'Windfall', 'Death of Spouse']),
    state: pick(STATES),
  };
}

// =============================================================================
// REAL ESTATE GENERATORS
// =============================================================================

function generateResidentialSFHLead(i) {
  const budgetMax = randInt(150000, 1500000);
  const preApproved = chance(45);

  return {
    id: uuid(),
    name: randomName(),
    email: `resfh.lead${i}@example.com`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
    status: pick(STATUSES),
    source: pick(SOURCES),
    interactions: randInt(0, 15),
    lastContact: pastDate(25),
    createdAt: pastDate(60),
    notes: '',
    assignedTo: '',
    buyerName: randomName(),
    buyerType: pick(['First-Time', 'Move-Up', 'Downsizer', 'Investor', 'Relocation', 'Vacation']),
    budgetMin: Math.round(budgetMax * randFloat(0.6, 0.85)),
    budgetMax,
    preApproved,
    preApprovalAmount: preApproved ? randInt(budgetMax, Math.round(budgetMax * 1.2)) : 0,
    lender: preApproved ? pick(['Wells Fargo', 'Chase', 'Bank of America', 'Quicken Loans', 'US Bank', 'Local Credit Union']) : '',
    downPaymentReady: chance(55),
    downPaymentPercent: pick([3, 5, 10, 15, 20, 25]),
    preferredLocations: pick(['Downtown', 'Suburbs', 'North Side', 'Waterfront', 'School District A', 'Rural']),
    bedrooms: randInt(2, 5),
    bathrooms: randInt(1, 4),
    sqftMin: randInt(1000, 3000),
    purchaseTimeline: pick(['Immediate', '1-3 months', '3-6 months', '6-12 months', '12+ months']),
    hasAgent: chance(30),
    currentHousing: pick(['Renting', 'Own - Selling', 'Own - Keeping', 'Living with Family', 'Other']),
    mustSellFirst: chance(20),
    creditScore: randInt(580, 820),
    state: pick(STATES),
  };
}

function generateResidentialMFHLead(i) {
  const budgetMax = randInt(200000, 15000000);

  return {
    id: uuid(),
    name: randomName(),
    email: `remfh.lead${i}@example.com`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
    status: pick(STATUSES),
    source: pick(SOURCES),
    interactions: randInt(0, 12),
    lastContact: pastDate(30),
    createdAt: pastDate(75),
    notes: '',
    assignedTo: '',
    buyerName: chance(40) ? `${randomName()} (${pick(BUSINESS_NAMES_POOL)})` : randomName(),
    investorType: pick(['First-Time Investor', 'Experienced', 'Institutional', 'Syndicator', 'House Hacker', '1031 Exchange']),
    budgetMin: Math.round(budgetMax * randFloat(0.5, 0.8)),
    budgetMax,
    unitCountTarget: pick(['2-4', '5-10', '10-20', '20-50', '50-100', '100+']),
    preferredCapRate: randFloat(4, 10),
    cashOnCashTarget: randFloat(6, 15),
    financingType: pick(['Conventional', 'FHA', 'VA', 'Commercial', 'Hard Money', 'Cash', 'Seller Finance', '1031 Exchange']),
    preApproved: chance(40),
    proofOfFunds: chance(35),
    existingPortfolio: randInt(0, 200),
    preferredLocations: pick(['Sun Belt', 'Midwest', 'Northeast', 'Southeast', 'Pacific Northwest', 'Mountain West']),
    purchaseTimeline: pick(['Immediate', '1-3 months', '3-6 months', '6-12 months', '12+ months']),
    valueAddInterest: chance(55),
    managementPreference: pick(['Self-Managed', 'Property Manager', 'Undecided']),
    state: pick(STATES),
  };
}

function generateCommercialLead(i) {
  const budgetMax = randInt(500000, 50000000);

  return {
    id: uuid(),
    name: randomName(),
    email: `commercial.lead${i}@example.com`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
    status: pick(STATUSES),
    source: pick(SOURCES),
    interactions: randInt(0, 10),
    lastContact: pastDate(35),
    createdAt: pastDate(80),
    notes: '',
    assignedTo: '',
    buyerName: chance(60) ? `${pick(BUSINESS_NAMES_POOL)}` : randomName(),
    entityType: pick(['Individual', 'LLC', 'Corporation', 'REIT', 'Fund', 'Partnership', 'Trust']),
    propertyType: pick(['Office', 'Retail', 'Industrial', 'Mixed-Use', 'Land', 'NNN', 'Self-Storage', 'Medical', 'Hospitality']),
    budgetMin: Math.round(budgetMax * randFloat(0.5, 0.8)),
    budgetMax,
    preferredCapRate: randFloat(4, 10),
    noi: Math.round(budgetMax * randFloat(0.05, 0.09)),
    sqftTarget: `${randInt(2000, 100000)}+`,
    financingType: pick(['Commercial Loan', 'SBA 504', 'Bridge Loan', 'Cash', 'Seller Finance', '1031 Exchange', 'CMBS']),
    proofOfFunds: chance(45),
    existingPortfolio: randInt(0, 50000000),
    preferredLocations: pick(['CBD', 'Suburban', 'Industrial Corridor', 'Highway Frontage', 'Mixed-Use District']),
    purchaseTimeline: pick(['Immediate', '1-3 months', '3-6 months', '6-12 months', '12+ months']),
    is1031: chance(20),
    tenantStatus: pick(['Fully Leased', 'Partially Leased', 'Value-Add/Vacant', 'Owner-Occupied', 'Any']),
    state: pick(STATES),
  };
}

// =============================================================================
// ENERGY GENERATORS
// =============================================================================

function generateBusinessEnergyLead(i) {
  const state = pick(DEREGULATED_ONLY);
  const monthlyBill = randInt(500, 50000);

  return {
    id: uuid(),
    name: randomName(),
    email: `bizenergy.lead${i}@example.com`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
    status: pick(STATUSES),
    source: pick(SOURCES),
    interactions: randInt(0, 10),
    lastContact: pastDate(30),
    createdAt: pastDate(60),
    notes: '',
    assignedTo: '',
    businessName: pick(BUSINESS_NAMES_POOL),
    contactName: randomName(),
    contactTitle: pick(['Owner', 'CEO', 'CFO', 'Facilities Manager', 'Office Manager', 'Operations Director', 'Procurement Manager']),
    industry: pick(['Restaurant', 'Retail', 'Medical Office', 'Manufacturing', 'Warehouse', 'Office Building', 'Church', 'School', 'Gym/Fitness', 'Laundromat']),
    state,
    deregulatedMarket: true,
    currentProvider: pick(ENERGY_PROVIDERS),
    monthlyBill,
    annualUsageKwh: Math.round(monthlyBill * randFloat(8, 15)),
    contractEndDate: chance(60) ? futureDate(0, 365) : '',
    contractStatus: pick(['No Contract', 'Month-to-Month', 'Expiring < 3 months', 'Expiring 3-6 months', 'Locked 6+ months']),
    estimatedSavings: Math.round(monthlyBill * randFloat(0.05, 0.25)),
    interestedInATT: chance(35),
    currentTelecom: pick(TELECOM_PROVIDERS),
    numLocations: randInt(1, 15),
    employeeCount: randInt(5, 500),
    greenInterest: chance(25),
  };
}

function generateConsumerEnergyLead(i) {
  const state = pick(DEREGULATED_ONLY);
  const monthlyBill = randInt(80, 500);

  return {
    id: uuid(),
    name: randomName(),
    email: `energy.lead${i}@example.com`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
    status: pick(STATUSES),
    source: pick(SOURCES),
    interactions: randInt(0, 8),
    lastContact: pastDate(25),
    createdAt: pastDate(50),
    notes: '',
    assignedTo: '',
    consumerName: randomName(),
    state,
    zipCode: `${randInt(10000, 99999)}`,
    deregulatedMarket: true,
    currentProvider: pick(ENERGY_PROVIDERS),
    monthlyBill,
    annualUsageKwh: Math.round(monthlyBill * randFloat(8, 14)),
    contractEndDate: chance(50) ? futureDate(0, 365) : '',
    contractStatus: pick(['No Contract', 'Month-to-Month', 'Expiring < 3 months', 'Expiring 3-6 months', 'Locked 6+ months']),
    estimatedSavings: Math.round(monthlyBill * randFloat(0.05, 0.22)),
    homeOwner: chance(60),
    interestedInATT: chance(30),
    currentTelecom: pick(TELECOM_PROVIDERS),
    householdSize: randInt(1, 6),
    solarInterest: chance(20),
    creditWorthy: chance(70),
  };
}

function generateIndependentAgentLead(i) {
  const experience = randInt(0, 20);
  const backgrounds = [];
  if (chance(30)) backgrounds.push('Energy');
  if (chance(25)) backgrounds.push('Telecom');
  if (chance(35)) backgrounds.push('Insurance');
  if (chance(20)) backgrounds.push('Real Estate');
  if (chance(25)) backgrounds.push('D2D');
  if (chance(30)) backgrounds.push('B2B');
  if (chance(15)) backgrounds.push('MLM/Network Marketing');
  if (backgrounds.length === 0) backgrounds.push(pick(['B2B', 'Retail', 'D2D']));

  const hasNetwork = chance(50);
  const currentIncome = randInt(2000, 15000);

  return {
    id: uuid(),
    name: randomName(),
    email: `agent.lead${i}@example.com`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
    status: pick(STATUSES),
    source: pick(['LinkedIn', 'Referral', 'Indeed', 'Social Media', 'Website', 'Facebook Group', 'Job Fair']),
    interactions: randInt(0, 8),
    lastContact: pastDate(20),
    createdAt: pastDate(45),
    notes: '',
    assignedTo: '',
    agentName: randomName(),
    currentRole: pick(['Insurance Agent', 'Real Estate Agent', 'Outside Sales Rep', 'Account Executive', 'Business Owner', 'Freelancer', 'Retail Manager', 'Student', 'Unemployed']),
    salesExperience: experience,
    industryBackground: backgrounds,
    existingCustomerBase: experience > 3 ? randInt(0, 1000) : randInt(0, 50),
    existingNetwork: hasNetwork,
    networkSize: hasNetwork ? randInt(20, 5000) : 0,
    closingAbility: experience >= 7 ? pick(['Proven Closer', 'Good']) : experience >= 3 ? pick(['Good', 'Average']) : pick(['Average', 'Learning', 'Unknown']),
    availability: pick(['Full-Time', 'Part-Time', 'Side Hustle', 'Weekend Only']),
    state: pick(STATES),
    licensedStates: chance(40) ? `${pick(STATES)}, ${pick(STATES)}` : '',
    monthlyIncomeGoal: randInt(3000, 25000),
    currentMonthlyIncome: currentIncome,
    willingTo1099: chance(80),
    hasOwnTransportation: chance(85),
    bilingualLanguages: chance(25) ? pick(['Spanish', 'Mandarin', 'Hindi', 'Vietnamese', 'Korean', 'French']) : '',
    linkedinProfile: chance(50) ? `linkedin.com/in/${pick(FIRST_NAMES).toLowerCase()}${pick(LAST_NAMES).toLowerCase()}${randInt(10, 999)}` : '',
    referralSource: pick(['LinkedIn', 'Friend', 'Current Agent', 'Job Board', 'Facebook', 'Cold Outreach', 'Event']),
  };
}

function generateCATBuyerLead(i) {
  const pains = [];
  if (chance(50)) pains.push('Lead Quality');
  if (chance(35)) pains.push('Lead Volume');
  if (chance(40)) pains.push('Cost Per Lead');
  if (chance(25)) pains.push('CRM Integration');
  if (chance(30)) pains.push('Compliance');
  if (chance(20)) pains.push('Agent Management');
  if (chance(25)) pains.push('Reporting');
  if (pains.length === 0) pains.push('Lead Quality');

  return {
    id: uuid(),
    name: randomName(),
    email: `cat.lead${i}@example.com`,
    phone: `+1 (${randInt(200, 999)}) ${randInt(200, 999)}-${randInt(1000, 9999)}`,
    status: pick(STATUSES),
    source: pick(SOURCES),
    interactions: randInt(0, 10),
    lastContact: pastDate(30),
    createdAt: pastDate(65),
    notes: '',
    assignedTo: '',
    companyName: pick(BUSINESS_NAMES_POOL),
    contactName: randomName(),
    contactTitle: pick(['CEO', 'VP Sales', 'Director of Operations', 'Sales Manager', 'Marketing Director', 'COO']),
    companyType: pick(['Energy Retailer', 'Telecom Reseller', 'Solar Installer', 'HVAC', 'Home Services', 'Insurance Agency', 'Real Estate Brokerage', 'Other']),
    annualRevenue: randInt(500000, 50000000),
    employeeCount: randInt(5, 300),
    currentCAT: pick(['None', 'Spreadsheets', 'Manual', 'Salesforce', 'HubSpot', 'Custom CRM', 'Zoho', 'Other']),
    catBudget: randInt(5000, 200000),
    agentCount: randInt(3, 200),
    marketsCovered: `${pick(STATES)}, ${pick(STATES)}, ${pick(STATES)}`,
    painPoints: pains,
    decisionTimeline: pick(['Immediate', '1-3 months', '3-6 months', '6+ months', 'Evaluating']),
    contractEndDate: chance(40) ? futureDate(0, 365) : '',
    state: pick(STATES),
  };
}

// =============================================================================
// GENERATOR REGISTRY
// =============================================================================

const GENERATORS = {
  healthcare: {
    medicare: generateMedicareLead,
    aca: generateACALead,
    vision: generateVisionLead,
    dental: generateDentalLead,
  },
  financial_services: {
    business_loans: generateBusinessLoanLead,
    exit_liquidity: generateExitLiquidityLead,
    wealth_management: generateWealthManagementLead,
  },
  real_estate: {
    residential_sfh: generateResidentialSFHLead,
    residential_mfh: generateResidentialMFHLead,
    commercial: generateCommercialLead,
  },
  energy: {
    end_customer_business: generateBusinessEnergyLead,
    end_customer_consumer: generateConsumerEnergyLead,
    independent_agents: generateIndependentAgentLead,
    cat_buyer: generateCATBuyerLead,
  },
};

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Generate leads for a specific industry and sub-vertical
 * @param {string} industryId - Industry identifier
 * @param {string} subVerticalId - Sub-vertical identifier
 * @param {number} count - Number of leads to generate
 * @param {boolean} withScoring - Whether to run through scoring engine
 * @returns {Array} Generated (and optionally scored) leads
 */
export const generateLeadsForSubVertical = (industryId, subVerticalId, count = 25, withScoring = true) => {
  const generator = GENERATORS[industryId]?.[subVerticalId];
  if (!generator) {
    console.warn(`No generator for ${industryId}/${subVerticalId}`);
    return [];
  }

  const leads = Array.from({ length: count }, (_, i) => generator(i));

  if (withScoring) {
    return batchScoreLeads(leads, industryId, subVerticalId);
  }
  return leads;
};

/**
 * Generate leads for all sub-verticals in an industry
 * @param {string} industryId - Industry identifier
 * @param {number} countPerSubVertical - Leads per sub-vertical
 * @returns {Object} Map of subVerticalId -> leads array
 */
export const generateLeadsForIndustry = (industryId, countPerSubVertical = 20) => {
  const generators = GENERATORS[industryId];
  if (!generators) return {};

  const result = {};
  Object.keys(generators).forEach(svId => {
    result[svId] = generateLeadsForSubVertical(industryId, svId, countPerSubVertical);
  });
  return result;
};

/**
 * Generate leads for all industries and sub-verticals
 * @param {number} countPerSubVertical - Leads per sub-vertical
 * @returns {Object} Nested map of industryId -> subVerticalId -> leads
 */
export const generateAllLeads = (countPerSubVertical = 15) => {
  const result = {};
  Object.keys(GENERATORS).forEach(indId => {
    result[indId] = generateLeadsForIndustry(indId, countPerSubVertical);
  });
  return result;
};

export default { generateLeadsForSubVertical, generateLeadsForIndustry, generateAllLeads };
