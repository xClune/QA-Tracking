// QRA Treatment mapping from Form 4 descriptions to QRA codes
export const treatmentMapping = {
  'In-situ stabilisation - including 50mm corrector. Excludes seal': 'SPR_STB',
  'Bitumen spray seal, 2-coat': 'SPR_RSSR',
  'Reshape table drain': 'USP_RSTD',
  'Heavy shoulder grading': 'SPR_HSG',
  'Granular overlay - overlay with imported material (<150mm). Excludes seal': 'SPR_GO',
  'Reconstruct unbound granular pavement. Excludes seal': 'SPR_RR',
  'Reconstruct unbound granular base. Excludes seal': 'SPR_RB',
  'Heavy formation grading': 'USP_HFG',
  'Heavy formation grading incorporating 50mm of imported material': 'USP_HFG50',
  'Heavy formation grading incorporating 75mm of imported material': 'USP_HFG75',
  'Gravel resheeting 100mm': 'USP_GR100',
  'Gravel resheeting 150mm': 'USP_GR150',
  'Asphalt surfacing, ≤50mm thickness': 'SPR_RSAC',
  'Light formation grading': 'USP_LFG',
  'Medium formation grading': 'USP_MFG',
  'Gravel/material supply': 'USP_GMS',
  'Pavement repair - patch unbound pavement failure': 'SPR_PRL',
  'Pothole repair': 'SPR_POT',
  'Edge repair': 'SPR_PER',
  'Crack repair': 'SPR_SCR',
  'Reconstruct unsealed shoulder': 'SPR_USF',
  'Foamed bitumen stabilisation - including 50mm corrector. Excludes seal': 'SPR_FBS'
};

// QRA Treatment descriptions for reference
export const qraTreatments = {
  // Unsealed pavements
  'USP_LFG': 'Light formation grading',
  'USP_MFG': 'Medium formation grading', 
  'USP_HFG': 'Heavy formation grading',
  'USP_HFG50': 'Heavy formation grading inc. 50mm imported material',
  'USP_HFG75': 'Heavy formation grading inc. 75mm imported material',
  'USP_GR': 'Gravel resheeting (excludes supply)',
  'USP_GR100': 'Gravel resheeting 100mm',
  'USP_GR150': 'Gravel resheeting 150mm',
  'USP_GMS': 'Gravel/material supply',
  'USP_RSTD': 'Reshape table drain',
  
  // Sealed pavement repairs
  'SPR_STB': 'In-situ stabilisation - inc. 50mm corrector',
  'SPR_GO': 'Granular overlay',
  'SPR_FBS': 'Foamed bitumen stabilisation',
  'SPR_RR': 'Reconstruct unbound granular pavement',
  'SPR_RB': 'Reconstruct unbound granular base',
  'SPR_PRL': 'Pavement repair - patch unbound pavement failure',
  'SPR_POT': 'Pothole repair',
  'SPR_SCR': 'Crack repair',
  'SPR_PER': 'Edge repair',
  'SPR_USF': 'Reconstruct unsealed shoulder',
  'SPR_HSG': 'Heavy shoulder grading',
  'SPR_RSAC': 'Asphalt surfacing, ≤50mm thickness',
  'SPR_RSSR': 'Bitumen spray seal, 2-coat'
};

// Get QRA code from treatment description
export const getQRACode = (treatmentDescription) => {
  return treatmentMapping[treatmentDescription] || 'OTHER';
};

// Get treatment description from QRA code
export const getTreatmentDescription = (qraCode) => {
  return qraTreatments[qraCode] || qraCode;
};