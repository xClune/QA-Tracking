// Testing requirements based on Queensland MRTS standards
export const getTestingRequirements = (treatment, quantity, unit, area, lineNo) => {
  const tests = [];
  const effectiveArea = unit === 'm2' ? quantity : area || (quantity * 8); // Default 8m width

  // MRTS04/05 Unbound Pavement Tests (In-situ stabilisation, granular works)
  if (treatment.includes('In-situ stabilisation') || 
      treatment.includes('Granular overlay') || 
      treatment.includes('Reconstruct unbound') ||
      treatment.includes('Foamed bitumen stabilisation')) {
    
    // Sand replacement tests (MRTS04)
    const sandTests = Math.max(1, Math.ceil(effectiveArea / 1000)); // 1 per 1000m2
    tests.push({
      test: 'Sand Replacement Test (MRTS04)',
      frequency: sandTests,
      description: 'Field density testing of compacted stabilised layers',
      standard: 'MRTS04',
      targetSMDD: '≥100%',
      priority: 'high'
    });
    
    // Nuclear densometer tests (higher frequency)
    const nucTests = Math.max(3, Math.ceil(effectiveArea / 500)); // 1 per 500m2, min 3
    tests.push({
      test: 'Nuclear Densometer Test (MRTS04)',
      frequency: nucTests,
      description: 'Nuclear density testing for ongoing QC',
      standard: 'MRTS04',
      targetSMDD: '≥100%',
      priority: 'high'
    });

    // Material sampling for UCS (stabilised materials)
    if (treatment.includes('In-situ stabilisation') || treatment.includes('Foamed bitumen stabilisation')) {
      tests.push({
        test: 'UCS Testing (MRTS07a)',
        frequency: Math.max(1, Math.ceil(effectiveArea / 2000)), // 1 per 2000m2
        description: 'Unconfined compressive strength at 7 days',
        standard: 'MRTS07a',
        targetUCS: '≥1.5 MPa @ 7 days',
        priority: 'high'
      });

      // Additional UCS at 28 days for critical works
      if (effectiveArea > 5000) {
        tests.push({
          test: 'UCS Testing 28-day (MRTS07a)',
          frequency: Math.max(1, Math.ceil(effectiveArea / 5000)),
          description: 'Unconfined compressive strength at 28 days',
          standard: 'MRTS07a',
          targetUCS: '≥2.0 MPa @ 28 days',
          priority: 'medium'
        });
      }
    }

    // CBR testing for granular materials
    if (treatment.includes('Granular overlay') || treatment.includes('Reconstruct unbound')) {
      tests.push({
        test: 'CBR Testing (MRTS05)',
        frequency: Math.max(1, Math.ceil(effectiveArea / 3000)), // 1 per 3000m2
        description: 'California Bearing Ratio testing',
        standard: 'MRTS05',
        targetUCS: '≥80% @ 95% SMDD',
        priority: 'medium'
      });
    }
  }

  // MRTS11 Seal Tests
  if (treatment.includes('Bitumen spray seal') || treatment.includes('Asphalt surfacing')) {
    tests.push({
      test: 'Seal Thickness Test (MRTS11)',
      frequency: Math.max(1, Math.ceil(effectiveArea / 2000)), // 1 per 2000m2
      description: 'Core sampling for thickness and seal quality',
      standard: 'MRTS11',
      targetThickness: 'As per specification',
      priority: 'high'
    });
    
    if (treatment.includes('Bitumen spray seal')) {
      tests.push({
        test: 'Aggregate Retention Test',
        frequency: Math.max(1, Math.ceil(effectiveArea / 3000)), // 1 per 3000m2
        description: 'Chip retention and embedment assessment',
        standard: 'MRTS11',
        targetRetention: '≥85%',
        priority: 'medium'
      });

      tests.push({
        test: 'Binder Application Rate Test',
        frequency: Math.max(1, Math.ceil(effectiveArea / 5000)), // 1 per 5000m2
        description: 'Verification of bitumen application rate',
        standard: 'MRTS11',
        targetRetention: 'As per design',
        priority: 'medium'
      });
    }

    if (treatment.includes('Asphalt surfacing')) {
      tests.push({
        test: 'Asphalt Density Test (MRTS11)',
        frequency: Math.max(1, Math.ceil(effectiveArea / 1000)), // 1 per 1000m2
        description: 'Core density testing of asphalt',
        standard: 'MRTS11',
        targetSMDD: '≥97%',
        priority: 'high'
      });
    }
  }

  // Shoulder and formation works
  if (treatment.includes('Heavy shoulder grading') || 
      treatment.includes('formation grading') ||
      treatment.includes('Reconstruct unsealed shoulder')) {
    tests.push({
      test: 'Compaction Test (MRTS04)',
      frequency: Math.max(1, Math.ceil(quantity / 500)), // 1 per 500m linear
      description: 'Density testing of shoulder material',
      standard: 'MRTS04',
      targetSMDD: '≥95%',
      priority: 'medium'
    });

    // Material quality testing for imported materials
    if (treatment.includes('imported material') || treatment.includes('50mm') || treatment.includes('75mm')) {
      tests.push({
        test: 'Material Quality Test (MRTS05)',
        frequency: Math.max(1, Math.ceil(quantity / 1000)), // 1 per 1000m
        description: 'Grading and plasticity testing of imported material',
        standard: 'MRTS05',
        targetUCS: 'Within specification limits',
        priority: 'medium'
      });
    }
  }

  // Drainage works
  if (treatment.includes('table drain') || treatment.includes('drainage')) {
    tests.push({
      test: 'Gradient and Alignment Check',
      frequency: Math.max(1, Math.ceil(quantity / 200)), // 1 per 200m
      description: 'Survey check of drainage grades and alignment',
      standard: 'Survey',
      targetUCS: 'As per design',
      priority: 'low'
    });
  }

  return tests.map(test => ({
    ...test,
    lineNo,
    id: Date.now() + Math.random(),
    status: 'pending',
    dateCreated: new Date().toISOString()
  }));
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
    methods: ['Sand Replacement', 'Nuclear Densometer'],
    targets: '≥95% SMDD (shoulders), ≥100% SMDD (pavement)'
  },
  'MRTS05': {
    title: 'Unbound Pavement - Material Testing',
    description: 'Laboratory testing of unbound pavement materials',
    methods: ['Grading', 'Plasticity Index', 'CBR'],
    targets: 'PI ≤6, CBR ≥80%'
  },
  'MRTS07a': {
    title: 'Stabilised Pavement - UCS Testing',
    description: 'Unconfined compressive strength testing',
    methods: ['Laboratory UCS', 'Field Core UCS'],
    targets: '≥1.5 MPa @ 7 days, ≥2.0 MPa @ 28 days'
  },
  'MRTS11': {
    title: 'Sprayed Bituminous Surfacing',
    description: 'Testing requirements for bituminous seals and surfacing',
    methods: ['Core Sampling', 'Thickness Measurement', 'Retention Testing'],
    targets: 'Thickness as per design, Retention ≥85%'
  }
};