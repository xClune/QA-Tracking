import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Plus, X, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

const TestingRequirements = ({ testingRequirements, onUpdateTestStatus, onUpdateTestDetails, isVisible = true, onToggleVisibility }) => {
  const [groupBy, setGroupBy] = useState('line');
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [reportForm, setReportForm] = useState({
    reportNumber: '',
    compactionResult: '',
    testDate: new Date().toISOString().split('T')[0],
    result: 'pass', // auto-calculated based on percentage
    notes: ''
  });

  const toggleGroup = (groupKey) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const openReportModal = (test) => {
    setSelectedTest(test);
    setShowReportModal(true);
    setReportForm({
      reportNumber: '',
      compactionResult: '',
      testDate: new Date().toISOString().split('T')[0],
      result: 'pass', // will be auto-calculated
      notes: ''
    });
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedTest(null);
    setReportForm({
      reportNumber: '',
      compactionResult: '',
      testDate: new Date().toISOString().split('T')[0],
      result: 'pass', // will be auto-calculated
      notes: ''
    });
  };

  const submitTestReport = () => {
    if (!selectedTest || !reportForm.reportNumber || !reportForm.compactionResult) return;

    const percentage = parseFloat(reportForm.compactionResult);
    const isPassing = percentage >= 100;

    const updatedTest = {
      ...selectedTest,
      testReports: [
        ...(selectedTest.testReports || []),
        {
          id: Date.now(),
          reportNumber: reportForm.reportNumber,
          compactionResult: percentage,
          testDate: reportForm.testDate,
          result: isPassing ? 'pass' : 'fail',
          notes: reportForm.notes,
          dateEntered: new Date().toISOString()
        }
      ]
    };

    // Update completion counts based on reports
    const completedReports = updatedTest.testReports.filter(r => r.result === 'pass').length;
    const failedReports = updatedTest.testReports.filter(r => r.result === 'fail').length;
    
    updatedTest.testsCompleted = completedReports;
    updatedTest.testsFailed = failedReports;
    updatedTest.testsInProgress = Math.max(0, (updatedTest.frequency || 0) - completedReports - failedReports);
    
    // Update status based on completion
    if (completedReports >= (updatedTest.frequency || 0)) {
      updatedTest.status = 'completed';
    } else if (completedReports > 0 || failedReports > 0) {
      updatedTest.status = 'in-progress';
    } else {
      updatedTest.status = 'pending';
    }

    onUpdateTestDetails(selectedTest.id, updatedTest);
    closeReportModal();
  };

  const removeTestReport = (test, reportId) => {
    const updatedTest = {
      ...test,
      testReports: (test.testReports || []).filter(r => r.id !== reportId)
    };

    // Recalculate completion counts
    const completedReports = updatedTest.testReports.filter(r => r.result === 'pass').length;
    const failedReports = updatedTest.testReports.filter(r => r.result === 'fail').length;
    
    updatedTest.testsCompleted = completedReports;
    updatedTest.testsFailed = failedReports;
    updatedTest.testsInProgress = Math.max(0, (updatedTest.frequency || 0) - completedReports - failedReports);
    
    // Update status
    if (completedReports >= (updatedTest.frequency || 0)) {
      updatedTest.status = 'completed';
    } else if (completedReports > 0 || failedReports > 0) {
      updatedTest.status = 'in-progress';
    } else {
      updatedTest.status = 'pending';
    }

    onUpdateTestDetails(test.id, updatedTest);
  };

  const groupTests = () => {
    const grouped = {};
    
    testingRequirements.forEach(test => {
      let key;
      switch (groupBy) {
        case 'line':
          key = `Line ${test.lineNo}`;
          break;
        case 'standard':
          key = test.standard;
          break;
        case 'status':
          key = test.status.charAt(0).toUpperCase() + test.status.slice(1);
          break;
        default:
          key = 'All Tests';
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(test);
    });

    return grouped;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStandardColor = (standard) => {
    switch (standard) {
      case 'MRTS04':
        return 'bg-blue-100 text-blue-800';
      case 'MRTS07a':
        return 'bg-purple-100 text-purple-800';
      case 'MRTS11':
        return 'bg-green-100 text-green-800';
      case 'MRTS05':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate test metrics using test reports
  const calculateTestMetrics = () => {
    const totalRequired = testingRequirements.reduce((sum, test) => sum + (test.frequency || 0), 0);
    const totalCompleted = testingRequirements.reduce((sum, test) => sum + (test.testsCompleted || 0), 0);
    const totalFailed = testingRequirements.reduce((sum, test) => sum + (test.testsFailed || 0), 0);
    const totalInProgress = testingRequirements.reduce((sum, test) => sum + (test.testsInProgress || 0), 0);
    const totalPending = totalRequired - totalCompleted - totalFailed - totalInProgress;

    return {
      totalRequired,
      totalCompleted,
      totalFailed,
      totalInProgress,
      totalPending,
      completionRate: totalRequired > 0 ? (totalCompleted / totalRequired) * 100 : 0
    };
  };

  const metrics = calculateTestMetrics();
  const groupedTests = groupTests();

  if (!testingRequirements || testingRequirements.length === 0) {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 border-l-4 border-purple-500">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Testing Requirements (MRTS Standards)</h3>
              <p className="text-sm text-gray-600">
                {testingRequirements.length} test types • {metrics.totalRequired} total tests required • {metrics.completionRate.toFixed(1)}% complete
              </p>
            </div>
          </div>
          <button
            onClick={() => onToggleVisibility && onToggleVisibility(true)}
            className="text-purple-600 hover:text-purple-800 font-medium text-sm"
          >
            Show Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6 border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Testing Requirements (MRTS Standards)</h3>
            <div className="flex items-center gap-4">
              <label className="text-sm">
                Group by:
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="ml-2 border border-gray-300 rounded px-2 py-1"
                >
                  <option value="line">Line Number</option>
                  <option value="standard">Test Standard</option>
                  <option value="status">Test Status</option>
                </select>
              </label>
              <button
                onClick={() => onToggleVisibility && onToggleVisibility(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Hide
              </button>
            </div>
          </div>
          
          {/* Enhanced Summary Stats */}
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{metrics.totalRequired}</div>
              <div className="text-gray-600">Total Required</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.totalPending}</div>
              <div className="text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalInProgress}</div>
              <div className="text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.totalCompleted}</div>
              <div className="text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.totalFailed}</div>
              <div className="text-gray-600">Failed</div>
            </div>
          </div>
        </div>

        {/* Test Groups */}
        {Object.entries(groupedTests).map(([groupKey, tests]) => {
          const isExpanded = expandedGroups.has(groupKey);
          const groupCompleted = tests.reduce((sum, test) => sum + (test.testsCompleted || 0), 0);
          const groupTotal = tests.reduce((sum, test) => sum + (test.frequency || 0), 0);
          const groupProgress = groupTotal > 0 ? (groupCompleted / groupTotal) * 100 : 0;

          return (
            <div key={groupKey} className="border-b border-gray-200 last:border-b-0">
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900">{groupKey}</span>
                  <span className="text-sm text-gray-500">({tests.length} tests)</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${groupProgress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">{groupProgress.toFixed(0)}%</span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="bg-gray-50">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Test Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chainage</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Standard</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests.map((test) => {
                        const testsCompleted = test.testsCompleted || 0;
                        const testsFailed = test.testsFailed || 0;
                        const testsRequired = test.frequency || 0;
                        const testReports = test.testReports || [];

                        return (
                          <tr key={test.id} className={`border-t border-gray-200 ${
                            testReports.some(r => r.result === 'fail') ? 'bg-red-50' : 
                            testsCompleted >= testsRequired ? 'bg-green-50' : ''
                          }`}>
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium text-gray-900">
                                {test.test?.replace('(MRTS04)', '').replace('MRTS04', '').trim()}
                              </div>
                              <div className="text-gray-500 text-xs">{test.description}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {test.chainage}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStandardColor(test.standard)}`}>
                                {test.standard}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {testsRequired}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-green-600 font-medium">{testsCompleted}</span>
                                </div>
                                {testsFailed > 0 && (
                                  <div className="flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <span className="text-red-600 font-medium">{testsFailed}</span>
                                  </div>
                                )}
                              </div>
                              {/* Test Reports List */}
                              {testReports.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {testReports.map((report) => (
                                    <div key={report.id} className={`flex items-center justify-between rounded px-2 py-1 text-xs ${
                                      report.result === 'pass' ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-gray-700">{report.reportNumber}</span>
                                        <span className={`font-medium ${
                                          report.result === 'pass' ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                          {report.compactionResult}% SMDD
                                        </span>
                                        <span className={`px-1 rounded text-xs font-medium ${
                                          report.result === 'pass' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                        }`}>
                                          {report.result === 'pass' ? 'PASS' : 'FAIL'}
                                        </span>
                                      </div>
                                      <button
                                        onClick={() => removeTestReport(test, report.id)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Remove Report"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(test.status)}`}>
                                {test.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                onClick={() => openReportModal(test)}
                                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                              >
                                <Plus className="w-3 h-3" />
                                Add Report
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex justify-between items-center text-sm">
            <div className="flex gap-6">
              <span className="text-gray-600">
                <span className="font-medium">{testingRequirements.length}</span> test types
              </span>
              <span className="text-gray-600">
                <span className="font-medium">{metrics.totalRequired}</span> total tests required
              </span>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-100 rounded"></div>
                Pending: {metrics.totalPending}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                Completed: {metrics.totalCompleted}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Report Modal */}
      {showReportModal && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Input Test Report
              </h3>
              <button onClick={closeReportModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">
                <div><strong>Test:</strong> {selectedTest.test}</div>
                <div><strong>Line:</strong> {selectedTest.lineNo}</div>
                <div><strong>Chainage:</strong> {selectedTest.chainage}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Number *
                </label>
                <input
                  type="text"
                  value={reportForm.reportNumber}
                  onChange={(e) => setReportForm(prev => ({ ...prev, reportNumber: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g. CR-001, SMDD-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compaction Result (% SMDD) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="200"
                    value={reportForm.compactionResult}
                    onChange={(e) => setReportForm(prev => ({ 
                      ...prev, 
                      compactionResult: e.target.value,
                      result: parseFloat(e.target.value) >= 100 ? 'pass' : 'fail'
                    }))}
                    className={`w-full border rounded px-3 py-2 pr-8 ${
                      reportForm.compactionResult 
                        ? parseFloat(reportForm.compactionResult) >= 100 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-red-500 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    placeholder="e.g. 98.5, 102.3"
                  />
                  <span className="absolute right-3 top-2 text-gray-500 text-sm">%</span>
                </div>
                {reportForm.compactionResult && (
                  <div className={`text-xs mt-1 ${
                    parseFloat(reportForm.compactionResult) >= 100 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {parseFloat(reportForm.compactionResult) >= 100 
                      ? '✓ Conforming (≥100% SMDD)' 
                      : '✗ Non-conforming (<100% SMDD)'
                    }
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Date
                </label>
                <input
                  type="date"
                  value={reportForm.testDate}
                  onChange={(e) => setReportForm(prev => ({ ...prev, testDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={reportForm.notes}
                  onChange={(e) => setReportForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="2"
                  placeholder="Additional notes or comments"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={submitTestReport}
                disabled={!reportForm.reportNumber || !reportForm.compactionResult}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Save Report
              </button>
              <button
                onClick={closeReportModal}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TestingRequirements;