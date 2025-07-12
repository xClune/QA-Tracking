import React, { useState } from 'react';
import { Settings, Save } from 'lucide-react';

const TestingConfiguration = ({ project, onUpdateProject }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    // Testing method selection
    compactionMethod: project.testingConfig?.compactionMethod || 'nuclear', // 'sand' or 'nuclear'
    
    // Frequency settings (tests per 1000m²)
    sandReplacementFreq: project.testingConfig?.sandReplacementFreq || 1,
    nuclearFreq: project.testingConfig?.nuclearFreq || 2,
    
    // Minimum tests per line
    minTestsPerLine: project.testingConfig?.minTestsPerLine || 2,
    
    // Optional UCS testing for stabilized materials
    includeUCS: project.testingConfig?.includeUCS || false,
    ucsFreq: project.testingConfig?.ucsFreq || 0.5, // 1 per 2000m²
    ucs28DayFreq: project.testingConfig?.ucs28DayFreq || 0.2, // 1 per 5000m²
    ucs28DayThreshold: project.testingConfig?.ucs28DayThreshold || 5000,
    
    // Material testing for imported materials (one-off per line)
    includeMaterialTesting: project.testingConfig?.includeMaterialTesting || false,
    
    // Area thresholds
    minAreaForTesting: project.testingConfig?.minAreaForTesting || 100 // Minimum 100m² for testing
  });

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const updatedProject = {
      ...project,
      testingConfig: config
    };
    
    // Regenerate testing requirements with new config
    if (project.form4Data?.length > 0) {
      const allTestRequirements = [];
      project.form4Data.forEach(entry => {
        const tests = generateTestingRequirementsWithConfig(
          entry.treatment_type, 
          entry.quantity, 
          entry.unit, 
          entry.area,
          entry.line_no,
          config
        );
        allTestRequirements.push(...tests.map(test => ({
          ...test,
          entryId: entry.id,
          status: 'pending',
          chainage: `${entry.start_ch} - ${entry.finish_ch}`,
          treatmentType: entry.treatment_type
        })));
      });
      
      updatedProject.testingRequirements = allTestRequirements;
    }
    
    onUpdateProject(updatedProject);
    setIsOpen(false);
  };

  const totalTests = project.testingRequirements?.reduce((sum, test) => sum + (test.frequency || 0), 0) || 0;

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Testing Configuration
            </h3>
            <div className="text-sm text-gray-600 mt-1">
              Method: {config.compactionMethod === 'sand' ? 'Sand Replacement' : 'Nuclear Densometer'} • 
              {config.compactionMethod === 'sand' ? config.sandReplacementFreq : config.nuclearFreq}/1000m² • 
              Min {config.minTestsPerLine} tests/line • 
              {config.includeUCS ? 'UCS ' : ''}{config.includeMaterialTesting ? 'Material Testing ' : ''}•
              {totalTests} total tests
            </div>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {isOpen ? 'Close' : 'Configure'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compaction Testing Method */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Compaction Testing Method</h4>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="compactionMethod"
                    value="sand"
                    checked={config.compactionMethod === 'sand'}
                    onChange={(e) => handleConfigChange('compactionMethod', e.target.value)}
                    className="form-radio"
                  />
                  <div>
                    <div className="font-medium">Sand Replacement (MRTS04)</div>
                    <div className="text-sm text-gray-600">Traditional sand cone method</div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="compactionMethod"
                    value="nuclear"
                    checked={config.compactionMethod === 'nuclear'}
                    onChange={(e) => handleConfigChange('compactionMethod', e.target.value)}
                    className="form-radio"
                  />
                  <div>
                    <div className="font-medium">Nuclear Densometer (MRTS04)</div>
                    <div className="text-sm text-gray-600">Electronic density gauge</div>
                  </div>
                </label>
              </div>

              {/* Test Frequencies */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sand Replacement (per 1000m²)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={config.sandReplacementFreq}
                    onChange={(e) => handleConfigChange('sandReplacementFreq', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    disabled={config.compactionMethod !== 'sand'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nuclear Densometer (per 1000m²)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={config.nuclearFreq}
                    onChange={(e) => handleConfigChange('nuclearFreq', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    disabled={config.compactionMethod !== 'nuclear'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Tests per Line
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.minTestsPerLine}
                  onChange={(e) => handleConfigChange('minTestsPerLine', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Ensures minimum testing even for small areas
                </div>
              </div>
            </div>

            {/* Additional Testing */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Additional Testing</h4>
              
              {/* UCS Testing Toggle */}
              <div className="p-4 border rounded-lg">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.includeUCS}
                    onChange={(e) => handleConfigChange('includeUCS', e.target.checked)}
                    className="form-checkbox"
                  />
                  <div>
                    <div className="font-medium">Include UCS Testing (MRTS07a)</div>
                    <div className="text-sm text-gray-600">For stabilized materials only</div>
                  </div>
                </label>

                {config.includeUCS && (
                  <div className="mt-4 space-y-3 pl-6 border-l-2 border-blue-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        7-Day UCS (per 1000m²)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={config.ucsFreq}
                        onChange={(e) => handleConfigChange('ucsFreq', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        28-Day UCS (per 1000m²)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={config.ucs28DayFreq}
                        onChange={(e) => handleConfigChange('ucs28DayFreq', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        28-Day UCS Threshold (m²)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={config.ucs28DayThreshold}
                        onChange={(e) => handleConfigChange('ucs28DayThreshold', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Minimum area for 28-day UCS testing
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Material Testing Toggle */}
              <div className="p-4 border rounded-lg">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.includeMaterialTesting}
                    onChange={(e) => handleConfigChange('includeMaterialTesting', e.target.checked)}
                    className="form-checkbox"
                  />
                  <div>
                    <div className="font-medium">Include Material Testing (MRTS05)</div>
                    <div className="text-sm text-gray-600">
                      One test per line for imported materials (grading, PI, CBR)
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Area for Testing (m²)
                </label>
                <input
                  type="number"
                  min="0"
                  value={config.minAreaForTesting}
                  onChange={(e) => handleConfigChange('minAreaForTesting', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Changes will regenerate all testing requirements for this project
              </div>
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to generate testing requirements with custom config
const generateTestingRequirementsWithConfig = (treatment, quantity, unit, area, lineNo, config) => {
  const tests = [];
  
  // Calculate effective area in m²
  let effectiveArea = 0;
  if (unit === 'm2' || unit === 'm²') {
    effectiveArea = quantity;
  } else if (area && area > 0) {
    effectiveArea = area;
  } else {
    return tests;
  }

  // Check if this is pavement work requiring testing
  if (!isPavementWork(treatment) || effectiveArea < config.minAreaForTesting) {
    return tests;
  }

  // Compaction testing - either sand replacement OR nuclear (not both)
  if (config.compactionMethod === 'sand') {
    const sandTests = Math.max(config.minTestsPerLine, Math.ceil(effectiveArea * config.sandReplacementFreq / 1000));
    tests.push({
      test: 'Sand Replacement Test (MRTS04)',
      frequency: sandTests,
      description: 'Field density testing of compacted pavement layers',
      standard: 'MRTS04',
      targetSMDD: '≥100% SMDD',
      priority: 'high',
      method: 'Sand Replacement'
    });
  } else {
    const nucTests = Math.max(config.minTestsPerLine, Math.ceil(effectiveArea * config.nuclearFreq / 1000));
    tests.push({
      test: 'Nuclear Densometer Test (MRTS04)',
      frequency: nucTests,
      description: 'Nuclear density testing for ongoing quality control',
      standard: 'MRTS04',
      targetSMDD: '≥100% SMDD',
      priority: 'high',
      method: 'Nuclear Densometer'
    });
  }

  // UCS testing for stabilized materials (only if enabled)
  if (config.includeUCS && isStabilizedMaterial(treatment)) {
    const ucsTests = Math.max(1, Math.ceil(effectiveArea * config.ucsFreq / 1000));
    tests.push({
      test: 'UCS Testing 7-day (MRTS07a)',
      frequency: ucsTests,
      description: 'Unconfined compressive strength at 7 days',
      standard: 'MRTS07a',
      targetUCS: '≥1.5 MPa @ 7 days',
      priority: 'high',
      method: 'Laboratory Testing'
    });

    // 28-day UCS for larger areas
    if (effectiveArea > config.ucs28DayThreshold) {
      const ucs28Tests = Math.max(1, Math.ceil(effectiveArea * config.ucs28DayFreq / 1000));
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

  // Material testing for imported materials (one per line if enabled)
  if (config.includeMaterialTesting && isPavementWork(treatment)) {
    tests.push({
      test: 'Material Testing (MRTS05)',
      frequency: 1, // One test per line
      description: 'Grading, Plasticity Index, and CBR testing of imported material',
      standard: 'MRTS05',
      targetUCS: 'PI ≤6, CBR ≥80%',
      priority: 'medium',
      method: 'Laboratory Testing'
    });
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

// Helper functions (same as before)
const isPavementWork = (treatment) => {
  if (!treatment) return false;
  const treatmentLower = treatment.toLowerCase();
  
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

  for (const keyword of nonPavementKeywords) {
    if (treatmentLower.includes(keyword)) return false;
  }
  
  if (treatmentLower.includes('seal') && 
      !treatmentLower.includes('stabilisation') && 
      !treatmentLower.includes('pavement') &&
      !treatmentLower.includes('overlay')) {
    return false;
  }

  for (const keyword of pavementKeywords) {
    if (treatmentLower.includes(keyword)) return true;
  }

  return false;
};

const isStabilizedMaterial = (treatment) => {
  if (!treatment) return false;
  const treatmentLower = treatment.toLowerCase();
  return treatmentLower.includes('stabilisation') || 
         treatmentLower.includes('stabilization') ||
         treatmentLower.includes('foamed bitumen') ||
         treatmentLower.includes('cement') ||
         treatmentLower.includes('lime');
};

const isGranularPavement = (treatment) => {
  if (!treatment) return false;
  const treatmentLower = treatment.toLowerCase();
  return (treatmentLower.includes('reconstruct unbound') || 
          treatmentLower.includes('granular overlay')) &&
         !isStabilizedMaterial(treatment);
};

export default TestingConfiguration;