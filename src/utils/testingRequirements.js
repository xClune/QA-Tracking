// Testing requirements based on Queensland MRTS standards - PAVEMENT WORKS ONLY

export const getTestingRequirements = (treatment, quantity, unit, area, lineNo) => {
  const tests = [];
  
  // Enhanced debugging for area calculation
  console.log(`=== Testing Check for Line ${lineNo} ===`);
  console.log(`Treatment: "${treatment}"`);
  console.log(`Quantity: ${quantity}`);
  console.log(`Unit: "${unit}"`);
  console.log(`Area passed: ${area}`);
  
  // Calculate effective area in m²
  let effectiveArea = 0;
  if (unit === 'm2' || unit === 'm²') {
    effectiveArea = quantity;
    console.log(`Using quantity as area (unit is ${unit}): ${effectiveArea}m²`);
  } else if (area && area > 0) {
    effectiveArea = area;
    console.log(`Using calculated area: ${effectiveArea}m²`);
  } else {
    console.log(`❌ No valid area found - quantity: ${quantity}, unit: ${unit}, area: ${area}`);
    return tests;
  }

  // Check if this is pavement work
  const requiresTesting = isPavementWork(treatment);
  console.log(`Is pavement work: ${requiresTesting}`);
  
  if (!requiresTesting) {
    console.log(`❌ No testing required for: ${treatment}`);
    return tests;
  }

  console.log(`✅ Testing required for: ${treatment}, Area: ${effectiveArea}m²`);

  // MRTS04 Compaction Testing - Primary testing requirement for pavement works
  if (effectiveArea > 0) {
    // Sand replacement tests: 1 per 1000m²
    const sandTests = Math.max(1, Math.ceil(effectiveArea / 1000));
    console.log(`Sand replacement tests: ${sandTests} (${effectiveArea}/1000)`);
    
    tests.push({
      test: 'Sand Replacement Test (MRTS04)',
      frequency: sandTests,
      description: 'Field density testing of compacted pavement layers',
      standard: 'MRTS04',
      targetSMDD: '≥100% SMDD',
      priority: 'high',
      method: 'Sand Replacement'
    });
    
    // Nuclear densometer tests: 2 per 1000m²
    const nucTests = Math.ceil(effectiveArea / 500); // 2 per 1000m² = 1 per 500m²
    console.log(`Nuclear densometer tests: ${nucTests} (${effectiveArea}/500)`);
    
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
      console.log(`✅ Stabilized material detected - adding UCS tests`);
      
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
    }

    // CBR testing for granular pavement materials
    if (isGranularPavement(treatment)) {
      console.log(`✅ Granular pavement detected - adding CBR tests`);
      
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

  console.log(`Total tests generated: ${tests.length}`);
  console.log(`=== End Testing Check ===\n`);

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
    'in situ stabilisation',
    'stabilisation',
    'granular overlay',
    'pavement',
    'foamed bitumen',
    'cement stabilisation',
    'lime stabilisation'
  ];

  // Works that DO NOT require testing (more specific matching)
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
    'bitumen spray seal',
    'spray seal',
    'asphalt surfacing'
  ];

  // Check exclusions first - but be more specific about seals
  for (const keyword of nonPavementKeywords) {
    if (treatmentLower.includes(keyword)) {
      console.log(`❌ Excluded by keyword: "${keyword}"`);
      return false;
    }
  }
  
  // Special check for seal work (but not if it's part of a pavement work description)
  if (treatmentLower.includes('seal') && 
      !treatmentLower.includes('stabilisation') && 
      !treatmentLower.includes('pavement') &&
      !treatmentLower.includes('overlay')) {
    console.log(`❌ Excluded as seal work (not part of pavement work)`);
    return false;
  }

  // Check if it's a pavement work
  for (const keyword of pavementKeywords) {
    if (treatmentLower.includes(keyword)) {
      console.log(`✅ Matched pavement keyword: "${keyword}"`);
      return true;
    }
  }

  console.log(`❌ No pavement keywords matched for: "${treatment}"`);
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

// Helper function to get testing summary for a treatment
export const getTestingSummary = (treatment, area) => {
  if (!isPavementWork(treatment) || !area || area <= 0) {
    return {
      testingRequired: false,
      reason: 'No testing required - not a pavement work or no area specified'
    };
  }

  const sandTests = Math.max(1, Math.ceil(area / 1000));
  const nucTests = Math.ceil(area / 500);
  
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