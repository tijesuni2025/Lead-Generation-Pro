/**
 * BluestarAI Proprietary Lead Scoring Engine
 *
 * Multi-dimensional, industry-aware scoring system that dynamically adjusts
 * scoring logic based on industry, sub-vertical, and use case context.
 *
 * Scoring Dimensions:
 *  1. Qualification Fit (does the lead meet hard criteria?)
 *  2. Behavioral Signal (engagement, responsiveness, recency)
 *  3. Timing/Urgency (contract expirations, enrollment windows, timelines)
 *  4. Financial Capacity (budget readiness, revenue thresholds, asset levels)
 *  5. Intent Signal (explicit interest indicators, pain points)
 *  6. Contextual Boost (industry-specific multipliers, seasonal factors)
 *
 * @module services/leadScoringEngine
 */

import { INDUSTRIES, isDeregulated, getActiveEnrollmentPeriods, getDeregulationLevel } from './industryConfig';

// =============================================================================
// CORE SCORING ENGINE
// =============================================================================

/**
 * Calculate a comprehensive lead score for any industry/sub-vertical
 * @param {Object} lead - The lead data object
 * @param {string} industryId - Industry identifier
 * @param {string} subVerticalId - Sub-vertical identifier
 * @param {Object} options - Scoring options (date override, custom weights, etc.)
 * @returns {Object} Detailed score breakdown
 */
export const scoreIndustryLead = (lead, industryId, subVerticalId, options = {}) => {
  const { referenceDate = new Date() } = options;

  // Resolve the scoring strategy
  const strategy = SCORING_STRATEGIES[industryId]?.[subVerticalId];
  if (!strategy) {
    return fallbackScore(lead);
  }

  // Run all scoring dimensions
  const dimensions = strategy(lead, referenceDate);

  // Get weights from industry config
  const industry = Object.values(INDUSTRIES).find(i => i.id === industryId);
  const subVertical = industry ? Object.values(industry.subVerticals).find(sv => sv.id === subVerticalId) : null;
  const weights = subVertical?.scoringWeights || {};

  // Calculate weighted composite score
  let totalWeight = 0;
  let weightedSum = 0;

  Object.entries(dimensions).forEach(([key, dim]) => {
    const weight = weights[key] || dim.defaultWeight || 0.1;
    totalWeight += weight;
    weightedSum += dim.score * weight;
  });

  const rawScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Apply contextual boost
  const boost = computeContextualBoost(lead, industryId, subVerticalId, referenceDate);
  const finalScore = Math.min(100, Math.round(rawScore * (1 + boost.multiplier)));

  // Determine lead grade and recommended status
  const grade = getLeadGrade(finalScore);
  const recommendedStatus = getRecommendedStatus(finalScore, dimensions);
  const conversionProbability = estimateConversion(finalScore, industryId, subVerticalId, dimensions);

  return {
    score: finalScore,
    grade,
    recommendedStatus,
    conversionProbability,
    dimensions,
    boost,
    qualificationFlags: checkQualificationFlags(lead, industryId, subVerticalId),
    nextBestAction: recommendNextAction(lead, industryId, subVerticalId, dimensions, finalScore),
    scoredAt: referenceDate.toISOString(),
  };
};

// =============================================================================
// SCORING STRATEGIES BY INDUSTRY + SUB-VERTICAL
// =============================================================================

const SCORING_STRATEGIES = {
  // ---- HEALTHCARE ----
  healthcare: {
    medicare: (lead, refDate) => ({
      enrollmentTiming: {
        score: scoreMedicareEnrollmentTiming(lead, refDate),
        label: 'Enrollment Timing',
        defaultWeight: 0.25,
      },
      coverageGap: {
        score: scoreCoverageGap(lead, 'medicare'),
        label: 'Coverage Gap',
        defaultWeight: 0.20,
      },
      ageProximity: {
        score: scoreMedicareAgeProximity(lead),
        label: 'Age Proximity',
        defaultWeight: 0.15,
      },
      engagementSignal: {
        score: scoreEngagement(lead),
        label: 'Engagement',
        defaultWeight: 0.15,
      },
      healthComplexity: {
        score: scoreHealthComplexity(lead),
        label: 'Health Complexity',
        defaultWeight: 0.10,
      },
      incomeQualification: {
        score: scoreMedicareIncomeQualification(lead),
        label: 'Income Qualification',
        defaultWeight: 0.10,
      },
      geographicFit: {
        score: scoreGeographicFit(lead, 'healthcare'),
        label: 'Geographic Fit',
        defaultWeight: 0.05,
      },
    }),

    aca: (lead, refDate) => ({
      subsidyEligibility: {
        score: scoreACASubsidyEligibility(lead),
        label: 'Subsidy Eligibility',
        defaultWeight: 0.20,
      },
      enrollmentTiming: {
        score: scoreACAEnrollmentTiming(lead, refDate),
        label: 'Enrollment Timing',
        defaultWeight: 0.20,
      },
      coverageUrgency: {
        score: scoreCoverageUrgency(lead),
        label: 'Coverage Urgency',
        defaultWeight: 0.20,
      },
      incomeQualification: {
        score: scoreACAIncomeQualification(lead),
        label: 'Income Qualification',
        defaultWeight: 0.15,
      },
      engagementSignal: {
        score: scoreEngagement(lead),
        label: 'Engagement',
        defaultWeight: 0.10,
      },
      healthNeed: {
        score: scoreHealthNeed(lead),
        label: 'Health Need',
        defaultWeight: 0.10,
      },
      geographicFit: {
        score: scoreGeographicFit(lead, 'healthcare'),
        label: 'Geographic Fit',
        defaultWeight: 0.05,
      },
    }),

    vision: (lead, refDate) => ({
      coverageGap: {
        score: scoreCoverageGap(lead, 'vision'),
        label: 'Coverage Gap',
        defaultWeight: 0.25,
      },
      healthNeed: {
        score: scoreVisionNeed(lead),
        label: 'Vision Need',
        defaultWeight: 0.20,
      },
      engagementSignal: {
        score: scoreEngagement(lead),
        label: 'Engagement',
        defaultWeight: 0.20,
      },
      spendPotential: {
        score: scoreVisionSpendPotential(lead),
        label: 'Spend Potential',
        defaultWeight: 0.15,
      },
      familySize: {
        score: scoreFamilySize(lead),
        label: 'Family Size',
        defaultWeight: 0.10,
      },
      geographicFit: {
        score: scoreGeographicFit(lead, 'healthcare'),
        label: 'Geographic Fit',
        defaultWeight: 0.10,
      },
    }),

    dental: (lead, refDate) => ({
      coverageGap: {
        score: scoreCoverageGap(lead, 'dental'),
        label: 'Coverage Gap',
        defaultWeight: 0.25,
      },
      procedureUrgency: {
        score: scoreDentalUrgency(lead),
        label: 'Procedure Urgency',
        defaultWeight: 0.20,
      },
      engagementSignal: {
        score: scoreEngagement(lead),
        label: 'Engagement',
        defaultWeight: 0.20,
      },
      spendPotential: {
        score: scoreDentalSpendPotential(lead),
        label: 'Spend Potential',
        defaultWeight: 0.15,
      },
      familySize: {
        score: scoreFamilySize(lead),
        label: 'Family Size',
        defaultWeight: 0.10,
      },
      geographicFit: {
        score: scoreGeographicFit(lead, 'healthcare'),
        label: 'Geographic Fit',
        defaultWeight: 0.10,
      },
    }),
  },

  // ---- FINANCIAL SERVICES ----
  financial_services: {
    business_loans: (lead, refDate) => ({
      revenueStrength: {
        score: scoreRevenueStrength(lead),
        label: 'Revenue Strength',
        defaultWeight: 0.25,
      },
      creditworthiness: {
        score: scoreCreditworthiness(lead),
        label: 'Creditworthiness',
        defaultWeight: 0.20,
      },
      businessMaturity: {
        score: scoreBusinessMaturity(lead),
        label: 'Business Maturity',
        defaultWeight: 0.15,
      },
      debtServiceCapacity: {
        score: scoreDebtServiceCapacity(lead),
        label: 'Debt Service Capacity',
        defaultWeight: 0.15,
      },
      urgencySignal: {
        score: scoreFundingUrgency(lead),
        label: 'Funding Urgency',
        defaultWeight: 0.10,
      },
      engagementSignal: {
        score: scoreEngagement(lead),
        label: 'Engagement',
        defaultWeight: 0.10,
      },
      collateralPosition: {
        score: scoreCollateralPosition(lead),
        label: 'Collateral Position',
        defaultWeight: 0.05,
      },
    }),

    exit_liquidity: (lead, refDate) => ({
      businessValue: {
        score: scoreBusinessValue(lead),
        label: 'Business Value',
        defaultWeight: 0.25,
      },
      exitReadiness: {
        score: scoreExitReadiness(lead),
        label: 'Exit Readiness',
        defaultWeight: 0.20,
      },
      timelineUrgency: {
        score: scoreExitTimeline(lead),
        label: 'Timeline Urgency',
        defaultWeight: 0.20,
      },
      financialHealth: {
        score: scoreExitFinancialHealth(lead),
        label: 'Financial Health',
        defaultWeight: 0.15,
      },
      engagementSignal: {
        score: scoreEngagement(lead),
        label: 'Engagement',
        defaultWeight: 0.10,
      },
      advisorGap: {
        score: scoreAdvisorGap(lead),
        label: 'Advisor Gap',
        defaultWeight: 0.10,
      },
    }),

    wealth_management: (lead, refDate) => ({
      assetLevel: {
        score: scoreAssetLevel(lead),
        label: 'Asset Level',
        defaultWeight: 0.25,
      },
      advisorDissatisfaction: {
        score: scoreAdvisorDissatisfaction(lead),
        label: 'Advisor Dissatisfaction',
        defaultWeight: 0.20,
      },
      lifeEventTrigger: {
        score: scoreLifeEventTrigger(lead),
        label: 'Life Event Trigger',
        defaultWeight: 0.15,
      },
      engagementSignal: {
        score: scoreEngagement(lead),
        label: 'Engagement',
        defaultWeight: 0.15,
      },
      wealthGrowthPotential: {
        score: scoreWealthGrowthPotential(lead),
        label: 'Wealth Growth Potential',
        defaultWeight: 0.10,
      },
      complexityNeed: {
        score: scoreComplexityNeed(lead),
        label: 'Complexity Need',
        defaultWeight: 0.10,
      },
      geographicFit: {
        score: scoreGeographicFit(lead, 'financial_services'),
        label: 'Geographic Fit',
        defaultWeight: 0.05,
      },
    }),
  },

  // ---- REAL ESTATE ----
  real_estate: {
    residential_sfh: (lead, refDate) => ({
      financialReadiness: {
        score: scoreResidentialFinancialReadiness(lead),
        label: 'Financial Readiness',
        defaultWeight: 0.25,
      },
      timelineUrgency: {
        score: scorePurchaseTimeline(lead),
        label: 'Timeline Urgency',
        defaultWeight: 0.20,
      },
      preApprovalStatus: {
        score: scorePreApprovalStatus(lead),
        label: 'Pre-Approval Status',
        defaultWeight: 0.15,
      },
      engagementSignal: {
        score: scoreEngagement(lead),
        label: 'Engagement',
        defaultWeight: 0.15,
      },
      motivationLevel: {
        score: scoreBuyerMotivation(lead),
        label: 'Motivation Level',
        defaultWeight: 0.10,
      },
      marketAlignment: {
        score: scoreMarketAlignment(lead),
        label: 'Market Alignment',
        defaultWeight: 0.10,
      },
      agentStatus: {
        score: scoreAgentStatus(lead),
        label: 'Agent Status',
        defaultWeight: 0.05,
      },
    }),

    residential_mfh: (lead, refDate) => ({
      financialCapacity: {
        score: scoreMFHFinancialCapacity(lead),
        label: 'Financial Capacity',
        defaultWeight: 0.25,
      },
      investorExperience: {
        score: scoreInvestorExperience(lead),
        label: 'Investor Experience',
        defaultWeight: 0.15,
      },
      timelineUrgency: {
        score: scorePurchaseTimeline(lead),
        label: 'Timeline Urgency',
        defaultWeight: 0.20,
      },
      financingReadiness: {
        score: scoreFinancingReadiness(lead),
        label: 'Financing Readiness',
        defaultWeight: 0.15,
      },
      engagementSignal: {
        score: scoreEngagement(lead),
        label: 'Engagement',
        defaultWeight: 0.10,
      },
      portfolioGrowth: {
        score: scorePortfolioGrowth(lead),
        label: 'Portfolio Growth',
        defaultWeight: 0.10,
      },
      marketKnowledge: {
        score: scoreMarketKnowledge(lead),
        label: 'Market Knowledge',
        defaultWeight: 0.05,
      },
    }),

    commercial: (lead, refDate) => ({
      financialCapacity: {
        score: scoreCommercialFinancialCapacity(lead),
        label: 'Financial Capacity',
        defaultWeight: 0.25,
      },
      timelineUrgency: {
        score: scorePurchaseTimeline(lead),
        label: 'Timeline Urgency',
        defaultWeight: 0.20,
      },
      investorSophistication: {
        score: scoreCommercialSophistication(lead),
        label: 'Investor Sophistication',
        defaultWeight: 0.15,
      },
      financingReadiness: {
        score: scoreCommercialFinancingReadiness(lead),
        label: 'Financing Readiness',
        defaultWeight: 0.15,
      },
      engagementSignal: {
        score: scoreEngagement(lead),
        label: 'Engagement',
        defaultWeight: 0.10,
      },
      dealFlow1031: {
        score: score1031Exchange(lead),
        label: '1031 Exchange',
        defaultWeight: 0.10,
      },
      marketAlignment: {
        score: scoreCommercialMarketAlignment(lead),
        label: 'Market Alignment',
        defaultWeight: 0.05,
      },
    }),
  },

  // ---- ENERGY ----
  energy: {
    end_customer_business: (lead, refDate) => ({
      contractTiming: {
        score: scoreContractTiming(lead, refDate),
        label: 'Contract Timing',
        defaultWeight: 0.25,
      },
      savingsPotential: {
        score: scoreSavingsPotential(lead),
        label: 'Savings Potential',
        defaultWeight: 0.20,
      },
      deregulatedStatus: {
        score: scoreDeregulatedStatus(lead),
        label: 'Deregulated Status',
        defaultWeight: 0.15,
      },
      billSize: {
        score: scoreBillSize(lead, 'business'),
        label: 'Bill Size',
        defaultWeight: 0.15,
      },
      engagementSignal: {
        score: scoreEngagement(lead),
        label: 'Engagement',
        defaultWeight: 0.10,
      },
      multiLocationValue: {
        score: scoreMultiLocation(lead),
        label: 'Multi-Location Value',
        defaultWeight: 0.10,
      },
      bundleOpportunity: {
        score: scoreBundleOpportunity(lead),
        label: 'Bundle Opportunity',
        defaultWeight: 0.05,
      },
    }),

    end_customer_consumer: (lead, refDate) => ({
      contractTiming: {
        score: scoreContractTiming(lead, refDate),
        label: 'Contract Timing',
        defaultWeight: 0.25,
      },
      savingsPotential: {
        score: scoreSavingsPotential(lead),
        label: 'Savings Potential',
        defaultWeight: 0.20,
      },
      deregulatedStatus: {
        score: scoreDeregulatedStatus(lead),
        label: 'Deregulated Status',
        defaultWeight: 0.15,
      },
      homeownership: {
        score: scoreHomeownership(lead),
        label: 'Homeownership',
        defaultWeight: 0.10,
      },
      engagementSignal: {
        score: scoreEngagement(lead),
        label: 'Engagement',
        defaultWeight: 0.15,
      },
      bundleOpportunity: {
        score: scoreBundleOpportunity(lead),
        label: 'Bundle Opportunity',
        defaultWeight: 0.10,
      },
      creditWorthiness: {
        score: scoreConsumerCredit(lead),
        label: 'Credit Worthiness',
        defaultWeight: 0.05,
      },
    }),

    independent_agents: (lead, refDate) => ({
      existingCustomerBase: {
        score: scoreExistingCustomerBase(lead),
        label: 'Customer Base',
        defaultWeight: 0.25,
      },
      salesExperience: {
        score: scoreSalesExperience(lead),
        label: 'Sales Experience',
        defaultWeight: 0.20,
      },
      closingAbility: {
        score: scoreClosingAbility(lead),
        label: 'Closing Ability',
        defaultWeight: 0.15,
      },
      networkSize: {
        score: scoreNetworkSize(lead),
        label: 'Network Size',
        defaultWeight: 0.15,
      },
      availability: {
        score: scoreAgentAvailability(lead),
        label: 'Availability',
        defaultWeight: 0.10,
      },
      industryRelevance: {
        score: scoreIndustryRelevance(lead),
        label: 'Industry Relevance',
        defaultWeight: 0.10,
      },
      incomeMotivation: {
        score: scoreIncomeMotivation(lead),
        label: 'Income Motivation',
        defaultWeight: 0.05,
      },
    }),

    cat_buyer: (lead, refDate) => ({
      companySize: {
        score: scoreCATCompanySize(lead),
        label: 'Company Size',
        defaultWeight: 0.20,
      },
      catBudget: {
        score: scoreCATBudget(lead),
        label: 'CAT Budget',
        defaultWeight: 0.20,
      },
      decisionTimeline: {
        score: scoreCATDecisionTimeline(lead),
        label: 'Decision Timeline',
        defaultWeight: 0.20,
      },
      painPointSeverity: {
        score: scorePainPointSeverity(lead),
        label: 'Pain Point Severity',
        defaultWeight: 0.15,
      },
      engagementSignal: {
        score: scoreEngagement(lead),
        label: 'Engagement',
        defaultWeight: 0.10,
      },
      agentScale: {
        score: scoreCATAgentScale(lead),
        label: 'Agent Scale',
        defaultWeight: 0.10,
      },
      currentToolGap: {
        score: scoreCATToolGap(lead),
        label: 'Current Tool Gap',
        defaultWeight: 0.05,
      },
    }),
  },
};

// =============================================================================
// HEALTHCARE SCORING FUNCTIONS
// =============================================================================

function scoreMedicareEnrollmentTiming(lead, refDate) {
  const period = lead.enrollmentPeriod;
  const activePeriods = getActiveEnrollmentPeriods(refDate).map(p => p.id);

  if (period === 'IEP') return 95; // Initial enrollment is highest priority
  if (period === 'AEP' && activePeriods.includes('AEP')) return 90;
  if (period === 'OEP' && activePeriods.includes('OEP')) return 85;
  if (period === 'SEP') return 80;
  if (period === 'GI') return 75;
  // Out of active enrollment
  if (period === 'AEP' && !activePeriods.includes('AEP')) return 40;
  return 30;
}

function scoreMedicareAgeProximity(lead) {
  const age = lead.age;
  if (!age) return 30;
  if (age === 64) return 95; // Turning 65 soon - IEP approaching
  if (age === 65) return 90; // In IEP window
  if (age >= 66 && age <= 70) return 75; // Recent Medicare eligibles
  if (age > 70 && age <= 80) return 60;
  if (age > 80) return 50;
  if (age >= 62 && age < 64) return 45; // Pre-Medicare, start planning
  return 20;
}

function scoreMedicareIncomeQualification(lead) {
  const income = lead.incomeLevel;
  if (!income) return 50;
  // Lower income = more likely to benefit from Dual/Extra Help
  if (income === 'Below $22K') return 90; // Likely dual-eligible
  if (income === '$22K-$35K') return 80;
  if (income === '$35K-$55K') return 65;
  if (income === '$55K-$85K') return 55;
  if (income === '$85K+') return 45; // IRMAA concerns but higher value
  return 50;
}

function scoreHealthComplexity(lead) {
  const conditions = lead.chronicConditions;
  const rxCount = lead.prescriptionDrugs || 0;
  let score = 30;

  if (Array.isArray(conditions)) {
    score += Math.min(conditions.length * 15, 40);
  }
  if (rxCount >= 5) score += 20;
  else if (rxCount >= 3) score += 15;
  else if (rxCount >= 1) score += 10;

  return Math.min(score, 100);
}

function scoreACASubsidyEligibility(lead) {
  if (lead.subsIdyEligible === true) return 90;
  const fpl = lead.fpl;
  if (!fpl) return 50;
  if (fpl >= 100 && fpl <= 150) return 95; // Max subsidy
  if (fpl > 150 && fpl <= 250) return 85;
  if (fpl > 250 && fpl <= 400) return 70;
  if (fpl > 400) return 40; // May still qualify under enhanced subsidies
  return 30;
}

function scoreACAEnrollmentTiming(lead, refDate) {
  const period = lead.enrollmentPeriod;
  const activePeriods = getActiveEnrollmentPeriods(refDate);
  const hasACAOEP = activePeriods.some(p => p.id === 'ACA_OEP');

  if (period?.startsWith('SEP')) return 90; // Active qualifying event
  if (period === 'OEP' && hasACAOEP) return 85;
  if (period === 'OEP' && !hasACAOEP) return 35;

  // Check SEP event date recency
  if (lead.sepEventDate) {
    const daysSince = (refDate - new Date(lead.sepEventDate)) / (24 * 60 * 60 * 1000);
    if (daysSince <= 30) return 95; // Within 30-day SEP window
    if (daysSince <= 60) return 75;
  }
  return 40;
}

function scoreCoverageUrgency(lead) {
  const coverage = lead.currentCoverage;
  if (coverage === 'None/Uninsured') return 95;
  if (coverage === 'COBRA') return 85; // COBRA is expensive and temporary
  if (coverage === 'Short-Term') return 80;
  if (coverage === 'Employer Ending') return 90;
  if (coverage === 'ACA Plan') return 40; // Already covered, shopping
  return 50;
}

function scoreCoverageGap(lead, type) {
  if (type === 'medicare') {
    const coverage = lead.currentCoverage;
    if (coverage === 'None') return 95;
    if (coverage === 'Original Medicare') return 80; // No supplement
    if (coverage === 'Employer') return 60;
    if (coverage === 'Medicare Advantage') return 45; // Plan switching
    return 50;
  }
  if (type === 'vision') {
    if (lead.currentVisionCoverage === 'None') return 95;
    if (lead.currentVisionCoverage === 'Employer Plan' && lead.employerOffersVision === false) return 90;
    return 40;
  }
  if (type === 'dental') {
    if (lead.currentDentalCoverage === 'None') return 95;
    if (lead.currentDentalCoverage === 'Discount Plan') return 75;
    return 40;
  }
  return 50;
}

function scoreACAIncomeQualification(lead) {
  const income = lead.annualIncome;
  if (!income) return 50;
  // Sweet spot for subsidies
  if (income >= 15000 && income <= 40000) return 90;
  if (income > 40000 && income <= 60000) return 75;
  if (income > 60000 && income <= 80000) return 60;
  if (income > 80000) return 40;
  if (income < 15000) return 70; // May qualify for Medicaid
  return 50;
}

function scoreHealthNeed(lead) {
  if (lead.preExistingConditions) return 80;
  return 40;
}

function scoreVisionNeed(lead) {
  let score = 30;
  if (lead.wearsCorrectiveLenses) score += 25;
  if (lead.diabetic) score += 30; // Diabetic retinopathy screening
  if (lead.lastEyeExam) {
    const monthsSince = (Date.now() - new Date(lead.lastEyeExam).getTime()) / (30 * 24 * 60 * 60 * 1000);
    if (monthsSince > 24) score += 20;
    else if (monthsSince > 12) score += 10;
  } else {
    score += 15; // No exam on record
  }
  return Math.min(score, 100);
}

function scoreVisionSpendPotential(lead) {
  const spend = lead.annualSpend || 0;
  if (spend >= 500) return 90;
  if (spend >= 300) return 75;
  if (spend >= 150) return 60;
  return 40;
}

function scoreDentalUrgency(lead) {
  if (lead.pendingProcedures) return 90;
  const needs = lead.dentalNeeds;
  if (Array.isArray(needs)) {
    if (needs.includes('Implants') || needs.includes('Major Restorative')) return 85;
    if (needs.includes('Orthodontics')) return 75;
    if (needs.includes('Basic Restorative')) return 60;
  }
  return 30;
}

function scoreDentalSpendPotential(lead) {
  const budget = lead.annualBudget || 0;
  if (budget >= 2000) return 90;
  if (budget >= 1000) return 75;
  if (budget >= 500) return 60;
  return 40;
}

function scoreFamilySize(lead) {
  const members = lead.familyMembers || 1;
  if (members >= 4) return 90;
  if (members >= 3) return 75;
  if (members >= 2) return 60;
  return 40;
}

// =============================================================================
// FINANCIAL SERVICES SCORING FUNCTIONS
// =============================================================================

function scoreRevenueStrength(lead) {
  const monthly = lead.monthlyRevenue || 0;
  if (monthly >= 500000) return 95;
  if (monthly >= 300000) return 85;
  if (monthly >= 200000) return 75;
  if (monthly >= 100000) return 65; // Minimum threshold
  if (monthly >= 50000) return 35;
  return 15;
}

function scoreCreditworthiness(lead) {
  const score = lead.creditScore;
  if (!score) return 50;
  if (score >= 750) return 95;
  if (score >= 700) return 85;
  if (score >= 680) return 75;
  if (score >= 650) return 60;
  if (score >= 600) return 45;
  if (score >= 550) return 30;
  return 15;
}

function scoreBusinessMaturity(lead) {
  const years = lead.yearsInBusiness;
  if (!years) return 40;
  if (years >= 10) return 90;
  if (years >= 5) return 80;
  if (years >= 3) return 65;
  if (years >= 2) return 50;
  if (years >= 1) return 35;
  return 15;
}

function scoreDebtServiceCapacity(lead) {
  const dscr = lead.dscr;
  if (!dscr) {
    // Estimate from revenue vs debt
    const revenue = lead.monthlyRevenue || 0;
    const debt = lead.currentDebt || 0;
    if (debt === 0) return 80;
    const ratio = (revenue * 12) / debt;
    if (ratio > 5) return 85;
    if (ratio > 3) return 70;
    if (ratio > 1.5) return 50;
    return 25;
  }
  if (dscr >= 2.0) return 95;
  if (dscr >= 1.5) return 80;
  if (dscr >= 1.25) return 65;
  if (dscr >= 1.0) return 45;
  return 20;
}

function scoreFundingUrgency(lead) {
  const urgency = lead.urgency;
  if (urgency === 'Immediate (< 1 week)') return 95;
  if (urgency === 'Short-term (1-4 weeks)') return 80;
  if (urgency === 'Medium (1-3 months)') return 60;
  if (urgency === 'Planning (3+ months)') return 35;
  return 50;
}

function scoreCollateralPosition(lead) {
  if (lead.collateralAvailable === true) return 85;
  if (lead.collateralAvailable === false) return 30;
  return 50;
}

function scoreBusinessValue(lead) {
  const valuation = lead.businessValuation || 0;
  const ebitda = lead.ebitda || 0;
  const value = valuation || (ebitda * 5);
  if (value >= 50000000) return 95;
  if (value >= 20000000) return 85;
  if (value >= 10000000) return 75;
  if (value >= 5000000) return 65;
  if (value >= 1000000) return 50;
  return 30;
}

function scoreExitReadiness(lead) {
  let score = 30;
  if (lead.successionPlan) score += 20;
  if (lead.recurringRevenue && lead.recurringRevenue > 50) score += 15;
  if (lead.ebitda && lead.ebitda > 0) score += 15;
  if (lead.hasAdvisor === false) score += 10; // Opportunity
  if (lead.employeeCount && lead.employeeCount > 10) score += 10;
  return Math.min(score, 100);
}

function scoreExitTimeline(lead) {
  const timeline = lead.exitTimeline;
  if (timeline === 'Immediate (< 6 months)') return 95;
  if (timeline === '6-12 months') return 80;
  if (timeline === '1-2 years') return 60;
  if (timeline === '2-5 years') return 40;
  if (timeline === 'Exploring options') return 50;
  return 35;
}

function scoreExitFinancialHealth(lead) {
  const revenue = lead.annualRevenue || 0;
  const ebitda = lead.ebitda || 0;
  const margin = revenue > 0 ? (ebitda / revenue) : 0;
  if (margin >= 0.3) return 90;
  if (margin >= 0.2) return 75;
  if (margin >= 0.15) return 60;
  if (margin >= 0.1) return 45;
  return 30;
}

function scoreAdvisorGap(lead) {
  if (lead.hasAdvisor === false) return 85; // No advisor = opportunity
  if (lead.hasAdvisor === true) return 30;
  return 55;
}

function scoreAssetLevel(lead) {
  const assets = lead.investableAssets || 0;
  if (assets >= 10000000) return 95; // UHNW
  if (assets >= 5000000) return 90;
  if (assets >= 2000000) return 80;
  if (assets >= 1000000) return 70;
  if (assets >= 500000) return 60;
  if (assets >= 250000) return 50; // Minimum
  return 20;
}

function scoreAdvisorDissatisfaction(lead) {
  const satisfaction = lead.advisorSatisfaction;
  if (satisfaction === 'No Advisor') return 90;
  if (satisfaction === 'Dissatisfied') return 95;
  if (satisfaction === 'Neutral') return 70;
  if (satisfaction === 'Satisfied') return 25;
  if (satisfaction === 'Very Satisfied') return 10;
  return 50;
}

function scoreLifeEventTrigger(lead) {
  const event = lead.lifeEvent;
  if (event === 'Inheritance') return 90;
  if (event === 'Business Sale') return 95;
  if (event === 'Divorce') return 85;
  if (event === 'Retirement') return 80;
  if (event === 'Windfall') return 85;
  if (event === 'Death of Spouse') return 80;
  if (event === 'None') return 20;
  return 30;
}

function scoreWealthGrowthPotential(lead) {
  const income = lead.annualIncome || 0;
  const assets = lead.investableAssets || 0;
  // High income relative to assets = growth potential
  if (income > 0 && assets > 0) {
    const ratio = income / assets;
    if (ratio > 0.5) return 85;
    if (ratio > 0.3) return 70;
    if (ratio > 0.15) return 55;
    return 40;
  }
  return 45;
}

function scoreComplexityNeed(lead) {
  let score = 30;
  const goals = lead.investmentGoals;
  if (Array.isArray(goals)) {
    score += Math.min(goals.length * 10, 40);
  }
  if (lead.clientType === 'Trust' || lead.clientType === 'Foundation') score += 20;
  if (lead.clientType === 'Family') score += 10;
  return Math.min(score, 100);
}

// =============================================================================
// REAL ESTATE SCORING FUNCTIONS
// =============================================================================

function scoreResidentialFinancialReadiness(lead) {
  let score = 20;
  if (lead.preApproved) score += 30;
  if (lead.downPaymentReady) score += 25;
  if (lead.creditScore && lead.creditScore >= 700) score += 15;
  else if (lead.creditScore && lead.creditScore >= 620) score += 10;
  if (lead.preApprovalAmount && lead.budgetMax && lead.preApprovalAmount >= lead.budgetMax) score += 10;
  return Math.min(score, 100);
}

function scorePurchaseTimeline(lead) {
  const timeline = lead.purchaseTimeline;
  if (timeline === 'Immediate') return 95;
  if (timeline === '1-3 months') return 80;
  if (timeline === '3-6 months') return 60;
  if (timeline === '6-12 months') return 40;
  if (timeline === '12+ months') return 20;
  return 50;
}

function scorePreApprovalStatus(lead) {
  if (lead.preApproved === true) return 90;
  if (lead.preApproved === false && lead.downPaymentReady) return 55;
  return 25;
}

function scoreBuyerMotivation(lead) {
  let score = 40;
  if (lead.currentHousing === 'Renting') score += 15;
  if (lead.currentHousing === 'Living with Family') score += 20;
  if (lead.mustSellFirst === false) score += 15;
  if (lead.buyerType === 'Relocation') score += 15;
  if (lead.buyerType === 'First-Time') score += 10;
  return Math.min(score, 100);
}

function scoreMarketAlignment(lead) {
  // Higher score if budget aligns well with preferred location
  if (lead.budgetMax && lead.budgetMax >= 200000) return 70;
  if (lead.budgetMax && lead.budgetMax >= 100000) return 50;
  return 35;
}

function scoreAgentStatus(lead) {
  if (lead.hasAgent === false) return 90; // No agent = opportunity
  if (lead.hasAgent === true) return 20;
  return 55;
}

function scoreMFHFinancialCapacity(lead) {
  let score = 20;
  const budget = lead.budgetMax || 0;
  if (budget >= 5000000) score += 35;
  else if (budget >= 1000000) score += 30;
  else if (budget >= 500000) score += 25;
  else if (budget >= 200000) score += 15;

  if (lead.proofOfFunds) score += 20;
  if (lead.preApproved) score += 15;
  if (lead.financingType === 'Cash') score += 10;
  return Math.min(score, 100);
}

function scoreInvestorExperience(lead) {
  const type = lead.investorType;
  if (type === 'Institutional') return 90;
  if (type === 'Syndicator') return 85;
  if (type === 'Experienced') return 75;
  if (type === '1031 Exchange') return 70;
  if (type === 'First-Time Investor') return 45;
  if (type === 'House Hacker') return 40;
  return 50;
}

function scoreFinancingReadiness(lead) {
  let score = 30;
  if (lead.preApproved) score += 30;
  if (lead.proofOfFunds) score += 25;
  if (lead.financingType === 'Cash') score += 15;
  return Math.min(score, 100);
}

function scorePortfolioGrowth(lead) {
  const existing = lead.existingPortfolio || 0;
  if (existing > 50) return 85;
  if (existing > 20) return 75;
  if (existing > 5) return 65;
  if (existing > 0) return 55;
  return 35; // New investor
}

function scoreMarketKnowledge(lead) {
  if (lead.preferredLocations && lead.preferredLocations.length > 0) return 70;
  if (lead.preferredCapRate && lead.preferredCapRate > 0) return 65;
  return 40;
}

function scoreCommercialFinancialCapacity(lead) {
  const budget = lead.budgetMax || 0;
  if (budget >= 10000000) return 95;
  if (budget >= 5000000) return 85;
  if (budget >= 2000000) return 75;
  if (budget >= 1000000) return 65;
  if (budget >= 500000) return 50;
  return 30;
}

function scoreCommercialSophistication(lead) {
  const type = lead.entityType;
  if (type === 'REIT' || type === 'Fund') return 95;
  if (type === 'Corporation') return 75;
  if (type === 'LLC' || type === 'Partnership') return 65;
  if (type === 'Trust') return 60;
  if (type === 'Individual') return 40;
  return 50;
}

function scoreCommercialFinancingReadiness(lead) {
  let score = 25;
  if (lead.proofOfFunds) score += 30;
  if (lead.financingType === 'Cash') score += 25;
  if (lead.financingType === '1031 Exchange') score += 20;
  if (lead.existingPortfolio && lead.existingPortfolio > 0) score += 15;
  return Math.min(score, 100);
}

function score1031Exchange(lead) {
  if (lead.is1031 === true) return 95;
  if (lead.financingType === '1031 Exchange') return 90;
  return 20;
}

function scoreCommercialMarketAlignment(lead) {
  if (lead.preferredLocations && lead.tenantStatus) return 75;
  if (lead.preferredLocations || lead.noi) return 55;
  return 35;
}

// =============================================================================
// ENERGY SCORING FUNCTIONS
// =============================================================================

function scoreContractTiming(lead, refDate) {
  const status = lead.contractStatus;
  if (status === 'No Contract') return 90;
  if (status === 'Month-to-Month') return 85;
  if (status === 'Expiring < 3 months') return 95; // Imminent opportunity
  if (status === 'Expiring 3-6 months') return 70;
  if (status === 'Locked 6+ months') return 15;

  // Fall back to end date
  if (lead.contractEndDate) {
    const daysUntil = (new Date(lead.contractEndDate) - refDate) / (24 * 60 * 60 * 1000);
    if (daysUntil <= 0) return 95;
    if (daysUntil <= 30) return 90;
    if (daysUntil <= 90) return 75;
    if (daysUntil <= 180) return 50;
    return 15;
  }
  return 50;
}

function scoreSavingsPotential(lead) {
  const savings = lead.estimatedSavings || 0;
  const bill = lead.monthlyBill || 1;
  const savingsPercent = (savings / bill) * 100;
  if (savingsPercent >= 20) return 95;
  if (savingsPercent >= 15) return 85;
  if (savingsPercent >= 10) return 70;
  if (savingsPercent >= 5) return 55;
  return 30;
}

function scoreDeregulatedStatus(lead) {
  if (lead.deregulatedMarket === true) return 90;
  if (lead.state) {
    const level = getDeregulationLevel(lead.state);
    if (level === 'full') return 90;
    if (level === 'partial') return 60;
    return 10; // Regulated
  }
  return 40;
}

function scoreBillSize(lead, type) {
  const bill = lead.monthlyBill || 0;
  if (type === 'business') {
    if (bill >= 10000) return 95;
    if (bill >= 5000) return 85;
    if (bill >= 2000) return 70;
    if (bill >= 1000) return 55;
    return 30;
  }
  // Consumer
  if (bill >= 400) return 90;
  if (bill >= 250) return 75;
  if (bill >= 150) return 60;
  if (bill >= 100) return 45;
  return 25;
}

function scoreMultiLocation(lead) {
  const locations = lead.numLocations || 1;
  if (locations >= 10) return 95;
  if (locations >= 5) return 85;
  if (locations >= 3) return 70;
  if (locations >= 2) return 55;
  return 30;
}

function scoreBundleOpportunity(lead) {
  let score = 20;
  if (lead.interestedInATT) score += 40;
  if (lead.currentTelecom && lead.currentTelecom !== 'AT&T') score += 20;
  if (lead.greenInterest || lead.solarInterest) score += 15;
  return Math.min(score, 100);
}

function scoreHomeownership(lead) {
  if (lead.homeOwner === true) return 80;
  if (lead.homeOwner === false) return 35;
  return 50;
}

function scoreConsumerCredit(lead) {
  if (lead.creditWorthy === true) return 80;
  if (lead.creditWorthy === false) return 30;
  return 50;
}

// Agent scoring
function scoreExistingCustomerBase(lead) {
  const base = lead.existingCustomerBase || 0;
  if (base >= 500) return 95;
  if (base >= 200) return 85;
  if (base >= 100) return 75;
  if (base >= 50) return 65;
  if (base >= 20) return 50;
  if (base > 0) return 35;
  return 15;
}

function scoreSalesExperience(lead) {
  const years = lead.salesExperience || 0;
  if (years >= 10) return 90;
  if (years >= 7) return 80;
  if (years >= 5) return 70;
  if (years >= 3) return 60;
  if (years >= 1) return 45;
  return 20;
}

function scoreClosingAbility(lead) {
  const ability = lead.closingAbility;
  if (ability === 'Proven Closer') return 95;
  if (ability === 'Good') return 75;
  if (ability === 'Average') return 55;
  if (ability === 'Learning') return 35;
  return 40;
}

function scoreNetworkSize(lead) {
  if (lead.existingNetwork !== true) return 20;
  const size = lead.networkSize || 0;
  if (size >= 1000) return 95;
  if (size >= 500) return 85;
  if (size >= 200) return 70;
  if (size >= 50) return 55;
  return 35;
}

function scoreAgentAvailability(lead) {
  const avail = lead.availability;
  if (avail === 'Full-Time') return 90;
  if (avail === 'Part-Time') return 65;
  if (avail === 'Side Hustle') return 45;
  if (avail === 'Weekend Only') return 30;
  return 50;
}

function scoreIndustryRelevance(lead) {
  const bg = lead.industryBackground;
  if (!Array.isArray(bg)) return 40;
  let score = 20;
  if (bg.includes('Energy')) score += 30;
  if (bg.includes('Telecom')) score += 25;
  if (bg.includes('Insurance')) score += 15;
  if (bg.includes('D2D')) score += 15;
  if (bg.includes('B2B')) score += 10;
  return Math.min(score, 100);
}

function scoreIncomeMotivation(lead) {
  const goal = lead.monthlyIncomeGoal || 0;
  const current = lead.currentMonthlyIncome || 0;
  if (goal > 0 && current > 0) {
    const gap = (goal - current) / current;
    if (gap >= 1.0) return 90; // Wants to double income
    if (gap >= 0.5) return 75;
    if (gap >= 0.25) return 60;
    return 40;
  }
  if (goal >= 10000) return 75;
  if (goal >= 5000) return 60;
  return 45;
}

// CAT Buyer scoring
function scoreCATCompanySize(lead) {
  const revenue = lead.annualRevenue || 0;
  const employees = lead.employeeCount || 0;
  let score = 20;
  if (revenue >= 10000000) score += 40;
  else if (revenue >= 5000000) score += 30;
  else if (revenue >= 1000000) score += 20;

  if (employees >= 100) score += 25;
  else if (employees >= 50) score += 20;
  else if (employees >= 20) score += 15;
  else if (employees >= 5) score += 10;
  return Math.min(score, 100);
}

function scoreCATBudget(lead) {
  const budget = lead.catBudget || 0;
  if (budget >= 100000) return 95;
  if (budget >= 50000) return 80;
  if (budget >= 25000) return 65;
  if (budget >= 10000) return 50;
  return 30;
}

function scoreCATDecisionTimeline(lead) {
  const timeline = lead.decisionTimeline;
  if (timeline === 'Immediate') return 95;
  if (timeline === '1-3 months') return 80;
  if (timeline === '3-6 months') return 55;
  if (timeline === '6+ months') return 30;
  if (timeline === 'Evaluating') return 60;
  return 45;
}

function scorePainPointSeverity(lead) {
  const pains = lead.painPoints;
  if (!Array.isArray(pains)) return 40;
  let score = 20;
  score += Math.min(pains.length * 12, 50);
  if (pains.includes('Lead Quality')) score += 10;
  if (pains.includes('Compliance')) score += 10;
  return Math.min(score, 100);
}

function scoreCATAgentScale(lead) {
  const agents = lead.agentCount || 0;
  if (agents >= 100) return 95;
  if (agents >= 50) return 80;
  if (agents >= 20) return 65;
  if (agents >= 10) return 50;
  return 30;
}

function scoreCATToolGap(lead) {
  if (!lead.currentCAT || lead.currentCAT === '' || lead.currentCAT === 'None') return 85;
  if (lead.currentCAT === 'Spreadsheets' || lead.currentCAT === 'Manual') return 80;
  return 35; // Has existing tool
}

// =============================================================================
// UNIVERSAL SCORING FUNCTIONS
// =============================================================================

function scoreEngagement(lead) {
  let score = 20;
  const interactions = lead.interactions || 0;
  if (interactions >= 10) score += 30;
  else if (interactions >= 5) score += 25;
  else if (interactions >= 3) score += 15;
  else if (interactions >= 1) score += 10;

  // Recency of contact
  if (lead.lastContact) {
    const daysSince = (Date.now() - new Date(lead.lastContact).getTime()) / (24 * 60 * 60 * 1000);
    if (daysSince <= 1) score += 30;
    else if (daysSince <= 3) score += 25;
    else if (daysSince <= 7) score += 20;
    else if (daysSince <= 14) score += 10;
    else if (daysSince <= 30) score += 5;
  }

  // Source quality
  const sourceBoost = { 'Referral': 15, 'Website': 10, 'LinkedIn': 8, 'Outbound': 5, 'Native Ad': 5, 'Database': 3 };
  score += sourceBoost[lead.source] || 0;

  return Math.min(score, 100);
}

function scoreGeographicFit(lead, industry) {
  // Base score
  if (lead.state || lead.zipCode) return 65;
  return 40;
}

// =============================================================================
// CONTEXTUAL BOOST
// =============================================================================

function computeContextualBoost(lead, industryId, subVerticalId, refDate) {
  let multiplier = 0;
  const reasons = [];

  // Seasonal boost for healthcare during enrollment periods
  if (industryId === 'healthcare') {
    const periods = getActiveEnrollmentPeriods(refDate);
    const criticalPeriod = periods.find(p => p.priority === 'critical');
    if (criticalPeriod) {
      multiplier += 0.08;
      reasons.push(`Active ${criticalPeriod.name}`);
    }
  }

  // Q4 boost for financial services (tax planning)
  if (industryId === 'financial_services') {
    const month = refDate.getMonth() + 1;
    if (month >= 10 && month <= 12) {
      multiplier += 0.05;
      reasons.push('Q4 tax planning season');
    }
    if (month >= 1 && month <= 4) {
      multiplier += 0.03;
      reasons.push('Tax season');
    }
  }

  // Spring/summer boost for real estate
  if (industryId === 'real_estate') {
    const month = refDate.getMonth() + 1;
    if (month >= 3 && month <= 8) {
      multiplier += 0.05;
      reasons.push('Peak buying season');
    }
  }

  // Winter boost for energy (higher bills)
  if (industryId === 'energy') {
    const month = refDate.getMonth() + 1;
    if (month >= 11 || month <= 2) {
      multiplier += 0.05;
      reasons.push('High energy consumption season');
    }
    if (month >= 6 && month <= 8) {
      multiplier += 0.03;
      reasons.push('Summer cooling season');
    }
  }

  return { multiplier, reasons };
}

// =============================================================================
// GRADE, STATUS, CONVERSION, AND ACTION HELPERS
// =============================================================================

function getLeadGrade(score) {
  if (score >= 90) return { letter: 'A+', label: 'Exceptional', color: '#10b981' };
  if (score >= 80) return { letter: 'A', label: 'Excellent', color: '#34d399' };
  if (score >= 70) return { letter: 'B+', label: 'Very Good', color: '#3b82f6' };
  if (score >= 60) return { letter: 'B', label: 'Good', color: '#60a5fa' };
  if (score >= 50) return { letter: 'C+', label: 'Above Average', color: '#fbbf24' };
  if (score >= 40) return { letter: 'C', label: 'Average', color: '#f59e0b' };
  if (score >= 30) return { letter: 'D', label: 'Below Average', color: '#F24C03' };
  return { letter: 'F', label: 'Poor Fit', color: '#ef4444' };
}

function getRecommendedStatus(score, dimensions) {
  if (score >= 80) return 'Hot';
  if (score >= 60) return 'Warm';
  if (score >= 40) return 'New';
  return 'Cold';
}

function estimateConversion(score, industryId, subVerticalId, dimensions) {
  // Base conversion curves per industry
  const curves = {
    healthcare: { base: 0.12, slope: 0.0065 },
    financial_services: { base: 0.06, slope: 0.005 },
    real_estate: { base: 0.04, slope: 0.0045 },
    energy: { base: 0.15, slope: 0.007 },
  };

  const curve = curves[industryId] || { base: 0.08, slope: 0.005 };
  const probability = Math.min(curve.base + (score * curve.slope), 0.85);
  return Math.round(probability * 100);
}

function checkQualificationFlags(lead, industryId, subVerticalId) {
  const flags = [];
  const industry = Object.values(INDUSTRIES).find(i => i.id === industryId);
  const sv = industry ? Object.values(industry.subVerticals).find(s => s.id === subVerticalId) : null;
  if (!sv) return flags;

  const criteria = sv.qualificationCriteria;
  if (!criteria) return flags;

  // Check required fields
  if (criteria.requiredFields) {
    criteria.requiredFields.forEach(field => {
      if (!lead[field] && lead[field] !== 0 && lead[field] !== false) {
        flags.push({ type: 'missing', field, message: `Missing: ${field}` });
      }
    });
  }

  // Industry-specific checks
  if (industryId === 'financial_services' && subVerticalId === 'business_loans') {
    if (lead.monthlyRevenue && lead.monthlyRevenue < 100000) {
      flags.push({ type: 'disqualifier', field: 'monthlyRevenue', message: 'Monthly revenue below $100K minimum' });
    }
  }

  if (industryId === 'energy' && (subVerticalId === 'end_customer_business' || subVerticalId === 'end_customer_consumer')) {
    if (lead.state && !isDeregulated(lead.state)) {
      flags.push({ type: 'warning', field: 'state', message: 'Not in a deregulated market' });
    }
    if (lead.contractStatus === 'Locked 6+ months') {
      flags.push({ type: 'warning', field: 'contractStatus', message: 'Contract locked for 6+ months' });
    }
  }

  return flags;
}

function recommendNextAction(lead, industryId, subVerticalId, dimensions, score) {
  if (score >= 80) {
    if (industryId === 'healthcare') return { action: 'Schedule enrollment call', priority: 'urgent', icon: 'Phone' };
    if (industryId === 'financial_services') return { action: 'Send proposal/term sheet', priority: 'urgent', icon: 'FileText' };
    if (industryId === 'real_estate') return { action: 'Schedule property showing', priority: 'urgent', icon: 'Calendar' };
    if (industryId === 'energy') {
      if (subVerticalId === 'independent_agents') return { action: 'Schedule onboarding call', priority: 'urgent', icon: 'Phone' };
      return { action: 'Send savings analysis', priority: 'urgent', icon: 'TrendingUp' };
    }
  }

  if (score >= 60) {
    return { action: 'Send personalized follow-up', priority: 'high', icon: 'Mail' };
  }

  if (score >= 40) {
    return { action: 'Add to nurture sequence', priority: 'medium', icon: 'Zap' };
  }

  return { action: 'Qualify via survey/form', priority: 'low', icon: 'ClipboardList' };
}

function fallbackScore(lead) {
  const baseScore = lead.score || 50;
  return {
    score: baseScore,
    grade: getLeadGrade(baseScore),
    recommendedStatus: getRecommendedStatus(baseScore, {}),
    conversionProbability: Math.round(baseScore * 0.5),
    dimensions: {},
    boost: { multiplier: 0, reasons: [] },
    qualificationFlags: [],
    nextBestAction: { action: 'Review and qualify', priority: 'medium', icon: 'Search' },
    scoredAt: new Date().toISOString(),
  };
}

// =============================================================================
// BATCH SCORING
// =============================================================================

/**
 * Score an array of leads for a given industry/sub-vertical
 * @param {Array} leads - Array of lead objects
 * @param {string} industryId - Industry identifier
 * @param {string} subVerticalId - Sub-vertical identifier
 * @param {Object} options - Scoring options
 * @returns {Array} Array of leads with score data attached
 */
export const batchScoreLeads = (leads, industryId, subVerticalId, options = {}) => {
  return leads.map(lead => {
    const scoreData = scoreIndustryLead(lead, industryId, subVerticalId, options);
    return {
      ...lead,
      score: scoreData.score,
      grade: scoreData.grade,
      recommendedStatus: scoreData.recommendedStatus,
      conversionProbability: scoreData.conversionProbability,
      scoreBreakdown: scoreData.dimensions,
      qualificationFlags: scoreData.qualificationFlags,
      nextBestAction: scoreData.nextBestAction,
      boost: scoreData.boost,
    };
  }).sort((a, b) => b.score - a.score);
};

/**
 * Get aggregate scoring analytics for a batch of scored leads
 * @param {Array} scoredLeads - Array of scored leads (output of batchScoreLeads)
 * @returns {Object} Aggregate analytics
 */
export const getScoreAnalytics = (scoredLeads) => {
  if (!scoredLeads || scoredLeads.length === 0) {
    return { total: 0, avgScore: 0, distribution: {}, statusBreakdown: {}, topDimensions: [] };
  }

  const total = scoredLeads.length;
  const avgScore = Math.round(scoredLeads.reduce((s, l) => s + l.score, 0) / total);

  const distribution = {
    excellent: scoredLeads.filter(l => l.score >= 80).length,
    good: scoredLeads.filter(l => l.score >= 60 && l.score < 80).length,
    average: scoredLeads.filter(l => l.score >= 40 && l.score < 60).length,
    poor: scoredLeads.filter(l => l.score < 40).length,
  };

  const statusBreakdown = {};
  scoredLeads.forEach(l => {
    const status = l.recommendedStatus || 'Unknown';
    statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
  });

  const avgConversion = Math.round(scoredLeads.reduce((s, l) => s + (l.conversionProbability || 0), 0) / total);

  return { total, avgScore, distribution, statusBreakdown, avgConversion };
};

export default { scoreIndustryLead, batchScoreLeads, getScoreAnalytics };
