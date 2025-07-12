import * as XLSX from 'xlsx';
import { getQRACode } from './treatmentMapping';
import { getTestingRequirements } from './testingRequirements';

// Process uploaded Form 4 Excel file
export const processForm4Upload = async (file) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON starting from row 10 (headers)
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    range: 10, // Start from row 10 where headers are
    defval: ""
  });

  // Process the Form 4 data
  const processedData = jsonData.map((row, index) => {
    const treatmentCode = getQRACode(row['Treatment Type']);
    const area = row['Damage Length (m)'] * row['Damage Width (m)'] || row['Quantity'];
    
    return {
      id: Date.now() + index,
      line_no: row['Line No.'],
      start_ch: row['Start\r\nCH. (m)'] || row['Start CH. (m)'],
      finish_ch: row['Finish\r\nCH. (m)'] || row['Finish CH. (m)'],
      damage_length: row['Damage Length (m)'],
      damage_width: row['Damage Width (m)'],
      damage_depth: row['Damage Depth\r\n(m)'] || row['Damage Depth (m)'],
      treatment_type: row['Treatment Type'],
      treatment_code: treatmentCode,
      additional_description: row['Additional Description'],
      quantity: row['Quantity'],
      unit: row['Unit'],
      area: area,
      status: 'planning',
      photos_received: false,
      photos_reviewed: false,
      compaction_required: row['Treatment Type'].includes('stabilisation') || 
                        row['Treatment Type'].includes('overlay') ||
                        row['Treatment Type'].includes('Reconstruct'),
      itp_received: false,
      line_complete: false,
      date_created: new Date().toISOString()
    };
  }).filter(row => row.line_no); // Filter out empty rows

  // Generate testing requirements
  const allTestRequirements = [];
  processedData.forEach(entry => {
    const tests = getTestingRequirements(
      entry.treatment_type, 
      entry.quantity, 
      entry.unit, 
      entry.area,
      entry.line_no
    );
    allTestRequirements.push(...tests.map(test => ({
      ...test,
      entryId: entry.id,
      status: 'pending',
      chainage: `${entry.start_ch} - ${entry.finish_ch}`,
      treatmentType: entry.treatment_type
    })));
  });

  return {
    form4Data: processedData,
    testingRequirements: allTestRequirements
  };
};

// Export project data to Excel
export const exportToExcel = (project) => {
  if (!project || !project.form4Data.length) {
    alert('No data to export');
    return;
  }

  const wb = XLSX.utils.book_new();

  // Form 4 Progress Sheet
  const form4Data = project.form4Data.map(entry => ({
    'Line No.': entry.line_no,
    'Start CH (m)': entry.start_ch,
    'Finish CH (m)': entry.finish_ch,
    'Length (m)': parseFloat(entry.finish_ch) - parseFloat(entry.start_ch),
    'Width (m)': entry.damage_width,
    'Treatment Code': entry.treatment_code,
    'Treatment Type': entry.treatment_type,
    'Quantity': entry.quantity,
    'Unit': entry.unit,
    'Area (m²)': entry.area,
    'Additional Description': entry.additional_description,
    'Photos Received': entry.photos_received ? 'Y' : 'N',
    'Photos Reviewed': entry.photos_reviewed ? 'Y' : 'N',
    'ITP Received': entry.itp_received ? 'Y' : 'N',
    'Status': entry.status,
    'Line Complete': entry.line_complete ? 'Y' : 'N',
    'Compaction Required': entry.compaction_required ? 'Y' : 'N'
  }));

  const ws1 = XLSX.utils.json_to_sheet(form4Data);
  XLSX.utils.book_append_sheet(wb, ws1, "Form 4 Progress");

  // Testing Requirements Sheet
  if (project.testingRequirements && project.testingRequirements.length) {
    const testData = project.testingRequirements.map(test => ({
      'Line No.': test.lineNo,
      'Chainage': test.chainage,
      'Treatment Type': test.treatmentType,
      'Test Type': test.test,
      'Description': test.description,
      'Standard': test.standard,
      'Frequency': test.frequency,
      'Priority': test.priority,
      'Target SMDD': test.targetSMDD || '',
      'Target UCS': test.targetUCS || '',
      'Target Thickness': test.targetThickness || '',
      'Target Retention': test.targetRetention || '',
      'Status': test.status,
      'Date Created': test.dateCreated ? new Date(test.dateCreated).toLocaleDateString() : ''
    }));

    const ws2 = XLSX.utils.json_to_sheet(testData);
    XLSX.utils.book_append_sheet(wb, ws2, "Testing Requirements");
  }

  // Project Summary Sheet
  const summaryData = [
    { Metric: 'Project Name', Value: project.name },
    { Metric: 'Date Created', Value: project.created },
    { Metric: 'Total Treatments', Value: project.form4Data.length },
    { Metric: 'Total Tests Required', Value: project.testingRequirements?.length || 0 },
    { Metric: 'Tests Completed', Value: project.testingRequirements?.filter(t => t.status === 'completed').length || 0 },
    { Metric: 'Lines Complete', Value: project.form4Data.filter(e => e.line_complete).length },
    { Metric: 'Treatments in Progress', Value: project.form4Data.filter(e => e.status === 'in-progress').length },
    { Metric: 'Treatments Completed', Value: project.form4Data.filter(e => e.status === 'completed').length },
    { Metric: 'Export Date', Value: new Date().toLocaleString() }
  ];

  const ws3 = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws3, "Project Summary");

  // Treatment Summary by Type
  const treatmentSummary = {};
  project.form4Data.forEach(entry => {
    const key = entry.treatment_code;
    if (!treatmentSummary[key]) {
      treatmentSummary[key] = {
        'Treatment Code': key,
        'Treatment Description': entry.treatment_type,
        'Count': 0,
        'Total Quantity': 0,
        'Unit': entry.unit,
        'Completed': 0,
        'In Progress': 0,
        'Planning': 0
      };
    }
    treatmentSummary[key].Count++;
    treatmentSummary[key]['Total Quantity'] += parseFloat(entry.quantity) || 0;
    treatmentSummary[key][entry.status === 'completed' ? 'Completed' : 
                          entry.status === 'in-progress' ? 'In Progress' : 'Planning']++;
  });

  const ws4 = XLSX.utils.json_to_sheet(Object.values(treatmentSummary));
  XLSX.utils.book_append_sheet(wb, ws4, "Treatment Summary");

  // Style the workbook (basic formatting)
  const fileName = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_QA_Progress_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

// Import existing QA tracking spreadsheet
export const importQATrackingSheet = async (file) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  
  // Look for specific sheets
  const form4Sheet = workbook.Sheets['Form4'] || workbook.Sheets['Form 4'];
  const compactionSheet = workbook.Sheets['CompactionTesting'] || workbook.Sheets['Compaction Testing'];
  
  let form4Data = [];
  let existingTests = [];

  if (form4Sheet) {
    const form4Json = XLSX.utils.sheet_to_json(form4Sheet, { range: 3, defval: "" });
    
    form4Data = form4Json.map((row, index) => ({
      id: Date.now() + index,
      line_no: row['LINE NO.'],
      start_ch: row['START\r\nCH. (m)'] || row['START CH. (m)'],
      finish_ch: row['FINISH\r\nCH. (m)'] || row['FINISH CH. (m)'],
      treatment_type: row['TREATMENT TYPE'],
      treatment_code: getQRACode(row['TREATMENT TYPE']),
      quantity: row['QUANTITY'],
      unit: row['UNIT'],
      photos_received: row['PHOTOS RECEIVED Y/N'] === 'Y',
      photos_reviewed: row['PHOTOS REVIEWED Y/N'] === 'Y',
      itp_received: row["ITP'S RECEIVED Y/N"] === 'Y',
      line_complete: row['LINE COMPLETE Y/N'] === 'Y',
      compaction_required: row['COMPACTION TESTING REQUIRED Y/N'] === 'YES',
      status: row['LINE COMPLETE Y/N'] === 'Y' ? 'completed' : 'planning'
    })).filter(row => row.line_no);
  }

  if (compactionSheet) {
    const compactionJson = XLSX.utils.sheet_to_json(compactionSheet, { range: 3, defval: "" });
    
    existingTests = compactionJson.map((row, index) => ({
      id: Date.now() + index + 10000,
      lineNo: row['LINE NO.'],
      test: 'Compaction Testing',
      standard: 'MRTS04',
      frequency: (row['NO. TESTS SAND REPLACEMENT'] || 0) + (row['NO. TESTS NUC DENSOMETER'] || 0),
      status: row['CV result'] ? 'completed' : 'pending',
      targetSMDD: row['TARGET SMDD %'] + '%'
    })).filter(row => row.lineNo);
  }

  return {
    form4Data,
    existingTests
  };
};

// Validate Form 4 data
export const validateForm4Data = (data) => {
  const errors = [];
  const warnings = [];

  data.forEach((entry, index) => {
    const rowNum = index + 1;
    
    // Required fields
    if (!entry.line_no) errors.push(`Row ${rowNum}: Missing Line Number`);
    if (!entry.start_ch) errors.push(`Row ${rowNum}: Missing Start Chainage`);
    if (!entry.finish_ch) errors.push(`Row ${rowNum}: Missing Finish Chainage`);
    if (!entry.treatment_type) errors.push(`Row ${rowNum}: Missing Treatment Type`);
    if (!entry.quantity) errors.push(`Row ${rowNum}: Missing Quantity`);

    // Data validation
    if (entry.start_ch && entry.finish_ch) {
      if (parseFloat(entry.finish_ch) <= parseFloat(entry.start_ch)) {
        errors.push(`Row ${rowNum}: Finish chainage must be greater than start chainage`);
      }
    }

    if (entry.quantity && parseFloat(entry.quantity) <= 0) {
      warnings.push(`Row ${rowNum}: Quantity should be greater than 0`);
    }

    // Treatment code mapping
    if (entry.treatment_type && !getQRACode(entry.treatment_type)) {
      warnings.push(`Row ${rowNum}: Treatment type "${entry.treatment_type}" not recognized`);
    }
  });

  return { errors, warnings };
};