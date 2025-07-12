// Testing requirements based on Queensland MRTS standards - PAVEMENT WORKS ONLY

export const getTestingRequirements = (treatment, quantity, unit, area, lineNo) => {
  const tests = [];
  
  // Calculate effective area in m²
  let effectiveArea = 0;
  if (unit === 'm2' || unit === 'm²') {
    effectiveArea = quantity;
  } else if (area && area > 0) {
    effectiveArea = area;
  } else {
    // For linear treatments, we can't determine area without width
    // Only generate tests if we have a valid area
    return tests;
  }

  // Only generate tests for PAVEMENT WORKS that require compaction testing
  const requiresTesting = isPavementWork(treatment);
  
  if (!requiresTesting) {
    console.log(`No testing required for: ${treatment}`);
    return tests;
  }

  console.log(`Testing required for: ${treatment}, Area: ${effectiveArea}m²`);

  // MRTS04 Compaction Testing - Primary testing requirement for pavement works
  if (effectiveArea > 0) {
    // Sand replacement tests: 1 per 1000m²
    const sandTests = Math.max(1, Math.ceil(effectiveArea / 1000));
    tests.push({
      test: 'Sand Replacement Test (MRTS04)',
      frequency: sandTests,
      description: 'Field density testing of compacted pavement layers',
      standard: 'MRTS04',
      targetSMDD: '≥100% SMDD',
      priority: 'high',
      method: 'Sand Replacement'
    });
    
    // Nuclear densometer tests: 2 per 1000m² (higher frequency for QC)
    const nucTests = Math.max(2, Math.ceil(effectiveArea / 500)); // 2 per 1000m² = 1 per 500m²
    tests.push({
      test: 'Nuclear Densometer Test (MRTS04)',
      frequency: nucTests,
      description: 'Nuclear density testing for ongoing quality control',
      standard: 'MRTS04',
      targetSMDD: '≥100% SMDD',
      priority: 'high',
      method: 'Nuclear Densometer'
    });

    // Additional testing for stabilized materials
    if (isStabilizedMaterial(treatment)) {
      // UCS Testing for stabilized materials
      const ucsTests = Math.max(1, Math.ceil(effectiveArea / 2000)); // 1 per 2000m²
      tests.push({
        test: 'UCS Testing (MRTS07a)',
        frequency: ucsTests,
        description: 'Unconfined compressive strength at 7 days',
        standard: 'MRTS07a',
        targetUCS: '≥1.5 MPa @ 7 days',
        priority: 'high',
        method: 'Laboratory Testing'
      });

      // 28-day UCS for larger areas
      if (effectiveArea > 5000) {
        const ucs28Tests = Math.max(1, Math.ceil(effectiveArea / 5000));
        tests.push({
          test: 'UCS Testing 28-day (MRTS07a)',
          frequency: ucs28Tests,
          description: 'Unconfined compressive strength at 28 days',
          standard: 'MRTS07a',
          targetUCS: '≥2.0 MPa @ 28 days',
          priority: 'medium',
          method: 'Laboratory Testing'
        });
      }
    }

    // CBR testing for granular pavement materials
    if (isGranularPavement(treatment)) {
      const cbrTests = Math.max(1, Math.ceil(effectiveArea / 3000)); // 1 per 3000m²
      tests.push({
        test: 'CBR Testing (MRTS05)',
        frequency: cbrTests,
        description: 'California Bearing Ratio testing of pavement material',
        standard: 'MRTS05',
        targetUCS: '≥80% @ 95% SMDD',
        priority: 'medium',
        method: 'Laboratory Testing'
      });
    }
  }

  return tests.map(test => ({
    ...test,
    lineNo,
    id: Date.now() + Math.random(),
    status: 'pending',
    dateCreated: new Date().toISOString(),
    areaUsed: effectiveArea
  }));
};

// Determine if treatment is pavement work requiring compaction testing
const isPavementWork = (treatment) => {
  if (!treatment) return false;
  
  const treatmentLower = treatment.toLowerCase();
  
  // Pavement works that require testing
  const pavementKeywords = [
    'heavy formation grading',
    'reconstruct unbound',
    'in-situ stabilisation',
    'insitu stabilisation', 
    'stabilisation',
    'granular overlay',
    'pavement',
    'foamed bitumen',
    'cement stabilisation',
    'lime stabilisation'
  ];

  // Works that DO NOT require testing
  const nonPavementKeywords = [
    'bulk fill',
    'reshape table drain',
    'table drain',
    'drainage',
    'shoulder grading',
    'light formation grading',
    'medium formation grading',
    'gravel resheeting',
    'pothole repair',
    'crack repair',
    'edge repair',
    'seal',
    'spray seal',
    'asphalt surfacing'
  ];

  // Check exclusions first
  for (const keyword of nonPavementKeywords) {
    if (treatmentLower.includes(keyword)) {
      return false;
    }
  }

  // Check if it's a pavement work
  for (const keyword of pavementKeywords) {
    if (treatmentLower.includes(keyword)) {
      return true;
    }
  }

  return false;
};

// Check if treatment involves stabilized materials
const isStabilizedMaterial = (treatment) => {
  if (!treatment) return false;
  
  const treatmentLower = treatment.toLowerCase();
  return treatmentLower.includes('stabilisation') || 
         treatmentLower.includes('stabilization') ||
         treatmentLower.includes('foamed bitumen') ||
         treatmentLower.includes('cement') ||
         treatmentLower.includes('lime');
};

// Check if treatment is granular pavement work
const isGranularPavement = (treatment) => {
  if (!treatment) return false;
  
  const treatmentLower = treatment.toLowerCase();
  return (treatmentLower.includes('reconstruct unbound') || 
          treatmentLower.includes('granular overlay')) &&
         !isStabilizedMaterial(treatment);
};

// Test priority levels
export const testPriorities = {
  high: { color: 'red', description: 'Critical for project acceptance' },
  medium: { color: 'yellow', description: 'Important for quality assurance' },
  low: { color: 'blue', description: 'Verification and documentation' }
};

// MRTS Standards reference
export const mrtsStandards = {
  'MRTS04': {
    title: 'Unbound Pavement - Density Testing',
    description: 'Field density testing procedures for unbound pavement materials',
    methods: ['Sand Replacement: 1 per 1000m²', 'Nuclear Densometer: 2 per 1000m²'],
    targets: '≥100% SMDD for pavement layers'
  },
  'MRTS05': {
    title: 'Unbound Pavement - Material Testing',
    description: 'Laboratory testing of unbound pavement materials',
    methods: ['Grading', 'Plasticity Index', 'CBR: 1 per 3000m²'],
    targets: 'PI ≤6, CBR ≥80%'
  },
  'MRTS07a': {
    title: 'Stabilised Pavement - UCS Testing',
    description: 'Unconfined compressive strength testing',
    methods: ['Laboratory UCS: 1 per 2000m²', 'Field Core UCS'],
    targets: '≥1.5 MPa @ 7 days, ≥2.0 MPa @ 28 days'
  },
  'MRTS11': {
    title: 'Sprayed Bituminous Surfacing',
    description: 'Testing requirements for bituminous seals and surfacing',
    methods: ['Core Sampling', 'Thickness Measurement', 'Retention Testing'],
    targets: 'Thickness as per design, Retention ≥85%'
  }
};

// Helper function to get testing summary for a treatment
export const getTestingSummary = (treatment, area) => {
  if (!isPavementWork(treatment) || !area || area <= 0) {
    return {
      testingRequired: false,
      reason: 'No testing required - not a pavement work or no area specified'
    };
  }

  const sandTests = Math.max(1, Math.ceil(area / 1000));
  const nucTests = Math.max(2, Math.ceil(area / 500));
  
  return {
    testingRequired: true,
    area: area,
    sandReplacementTests: sandTests,
    nuclearTests: nucTests,
    totalTests: sandTests + nucTests,
    isStabilized: isStabilizedMaterial(treatment),
    isGranular: isGranularPavement(treatment)
  };
};