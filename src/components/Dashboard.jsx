import React, { useState } from 'react';
import { Upload, Download, ArrowLeft } from 'lucide-react';
import RoadProgressVisual from './RoadProgressVisual';
import TreatmentTypeProgress from './TreatmentTypeProgress';
import Form4Table from './Form4Table';
import TestingRequirements from './TestingRequirements';
import TestingConfiguration from './TestingConfiguration';
import { processForm4Upload } from '../utils/excelUtils';
import { exportToExcel } from '../utils/excelUtils';

const Dashboard = ({ project, onUpdateProject, onBackToProjects }) => {
  const [showTestingRequirements, setShowTestingRequirements] = useState(false);
  const [showProgressVisualization, setShowProgressVisualization] = useState(true);
  const [showTreatmentTypeProgress, setShowTreatmentTypeProgress] = useState(true);
  const [showForm4Table, setShowForm4Table] = useState(true);
  const [uploadStatus, setUploadStatus] = useState('');

  // Debug logging
  console.log('Dashboard render - project:', project);
  console.log('Testing requirements length:', project.testingRequirements?.length || 0);
  console.log('Show testing requirements:', showTestingRequirements);

  const handleForm4Upload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadStatus('Processing Form 4...');
    
    try {
      const { form4Data, testingRequirements } = await processForm4Upload(file);
      
      console.log('Processed form4Data:', form4Data.length, 'entries');
      console.log('Processed testingRequirements:', testingRequirements.length, 'tests');
      
      const updatedProject = {
        ...project,
        form4Data,
        testingRequirements
      };

      console.log('Updated project:', updatedProject);
      onUpdateProject(updatedProject);
      setUploadStatus(`Successfully processed ${form4Data.length} Form 4 entries with ${testingRequirements.length} testing requirements`);
      
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Error processing Form 4:', error);
      setUploadStatus('Error processing Form 4 file. Please check the file format.');
      setTimeout(() => setUploadStatus(''), 3000);
    }

    event.target.value = '';
  };

  const updateWorkStatus = (entryId, status) => {
    const updatedProject = {
      ...project,
      form4Data: project.form4Data.map(entry =>
        entry.id === entryId ? { ...entry, status } : entry
      )
    };
    onUpdateProject(updatedProject);
  };

  const updateCheckboxField = (entryId, field, value) => {
    const updatedProject = {
      ...project,
      form4Data: project.form4Data.map(entry =>
        entry.id === entryId ? { ...entry, [field]: value } : entry
      )
    };
    onUpdateProject(updatedProject);
  };

  const updateTestStatus = (testId, status) => {
    const updatedProject = {
      ...project,
      testingRequirements: project.testingRequirements.map(test =>
        test.id === testId ? { ...test, status } : test
      )
    };
    onUpdateProject(updatedProject);
  };

  const updateTestDetails = (testId, updatedTest) => {
    const updatedProject = {
      ...project,
      testingRequirements: project.testingRequirements.map(test =>
        test.id === testId ? updatedTest : test
      )
    };
    onUpdateProject(updatedProject);
  };

  const handleExport = () => {
    exportToExcel(project);
  };

  const completedTests = project.testingRequirements?.filter(test => test.status === 'completed').length || 0;
  const completedLines = project.form4Data?.filter(entry => entry.line_complete).length || 0;

  // Enhanced button click handler with debugging
  const handleShowTestingRequirements = () => {
    console.log('Button clicked - current state:', showTestingRequirements);
    console.log('Testing requirements available:', project.testingRequirements?.length || 0);
    setShowTestingRequirements(!showTestingRequirements);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">QRA Quality Assurance Tracking</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={!project.form4Data?.length}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={onBackToProjects}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </button>
          </div>
        </div>

        {/* Progress Visualization - Above Treatment Type Progress */}
        {showProgressVisualization && project.form4Data?.length > 0 && (
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
              Project Progress Visualization: {project.form4Data.length} treatments • {((project.form4Data.filter(e => e.line_complete).length / project.form4Data.length) * 100).toFixed(1)}% complete
            </div>
            <RoadProgressVisual form4Data={project.form4Data} />
          </div>
        )}

        {/* Treatment Type Progress */}
        {showTreatmentTypeProgress && project.form4Data?.length > 0 && (
          <div className="mb-6">
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded-lg mb-4">
              Treatment Type Progress: Progress by treatment category
            </div>
            <TreatmentTypeProgress form4Data={project.form4Data} />
          </div>
        )}

        {/* Testing Configuration */}
        {project.form4Data?.length > 0 && (
          <TestingConfiguration
            project={project}
            onUpdateProject={onUpdateProject}
          />
        )}

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Total Treatments</h3>
            <p className="text-3xl font-bold text-blue-600">{project.form4Data?.length || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Tests Required</h3>
            <p className="text-3xl font-bold text-orange-600">
              {project.testingRequirements?.reduce((sum, test) => sum + (test.frequency || 0), 0) || 0}
            </p>
            <p className="text-sm text-gray-500">
              {project.testingRequirements?.length || 0} test types
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Tests Completed</h3>
            <p className="text-3xl font-bold text-green-600">
              {project.testingRequirements?.reduce((sum, test) => sum + (test.testsCompleted || 0), 0) || 0}
            </p>
            <p className="text-sm text-gray-500">
              {completedTests} test types complete
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Lines Complete</h3>
            <p className="text-3xl font-bold text-purple-600">{completedLines}</p>
          </div>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
            {uploadStatus}
          </div>
        )}

        {/* Action Buttons - Simplified */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <label className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer">
            <Upload className="w-5 h-5" />
            Upload Form 4 Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleForm4Upload}
              className="hidden"
            />
          </label>
        </div>

        {/* Testing Requirements - Show ABOVE Form 4 when visible */}
        {showTestingRequirements && (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-4">
              Testing Requirements: {project.testingRequirements?.length || 0} test types • {project.testingRequirements?.reduce((sum, test) => sum + (test.frequency || 0), 0) || 0} total tests required
            </div>
            {project.testingRequirements?.length > 0 ? (
              <TestingRequirements
                testingRequirements={project.testingRequirements}
                onUpdateTestStatus={updateTestStatus}
                onUpdateTestDetails={updateTestDetails}
              />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                No testing requirements found. Make sure to upload a Form 4 file with pavement works.
              </div>
            )}
          </div>
        )}

        {/* Form 4 Table*/}
        {showForm4Table && project.form4Data?.length > 0 && (
          <div className="mb-6">
            <div className="bg-teal-50 border border-teal-200 text-teal-700 px-4 py-3 rounded-lg mb-4">
              Form 4 Treatments: {project.form4Data.length} total treatments • {project.form4Data.filter(e => e.line_complete).length} lines complete
            </div>
            <Form4Table
              form4Data={project.form4Data}
              testingRequirements={project.testingRequirements || []}
              onUpdateWorkStatus={updateWorkStatus}
              onUpdateCheckboxField={updateCheckboxField}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;