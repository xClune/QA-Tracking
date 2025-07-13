import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit3, Save, X } from 'lucide-react';

const TestingRequirements = ({ testingRequirements, onUpdateTestStatus, onUpdateTestDetails, isVisible = true, onToggleVisibility }) => {
  const [groupBy, setGroupBy] = useState('line');
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [editingTest, setEditingTest] = useState(null);
  const [editValues, setEditValues] = useState({});

  const toggleGroup = (groupKey) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const startEditing = (test) => {
    setEditingTest(test.id);
    setEditValues({
      testsRequired: test.frequency || 0,
      testsCompleted: test.testsCompleted || 0,
      testsInProgress: test.testsInProgress || 0,
      testsPending: (test.frequency || 0) - (test.testsCompleted || 0) - (test.testsInProgress || 0)
    });
  };

  const saveEditing = () => {
    if (editingTest && onUpdateTestDetails) {
      const test = testingRequirements.find(t => t.id === editingTest);
      if (test) {
        const updatedTest = {
          ...test,
          frequency: parseInt(editValues.testsRequired) || 0,
          testsCompleted: parseInt(editValues.testsCompleted) || 0,
          testsInProgress: parseInt(editValues.testsInProgress) || 0,
          // Auto-calculate status based on completion (simplified: only pending/completed)
          status: editValues.testsCompleted >= editValues.testsRequired ? 'completed' : 'pending'
        };
        onUpdateTestDetails(editingTest, updatedTest);
      }
    }
    setEditingTest(null);
    setEditValues({});
  };

  const cancelEditing = () => {
    setEditingTest(null);
    setEditValues({});
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

  // Calculate test metrics with manual tracking (simplified)
  const calculateTestMetrics = () => {
    const totalRequired = testingRequirements.reduce((sum, test) => sum + (test.frequency || 0), 0);
    const totalCompleted = testingRequirements.reduce((sum, test) => sum + (test.testsCompleted || 0), 0);
    const totalInProgress = testingRequirements.reduce((sum, test) => sum + (test.testsInProgress || 0), 0);
    const totalPending = totalRequired - totalCompleted - totalInProgress;

    return {
      totalRequired,
      totalCompleted,
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
            onClick={() => onToggleVisibility(true)}
            className="text-purple-600 hover:text-purple-800 font-medium text-sm"
          >
            Show Details
          </button>
        </div>
      </div>
    );
  }

  return (
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
              onClick={() => onToggleVisibility(false)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Hide
            </button>
          </div>
        </div>
        
        {/* Enhanced Summary Stats with Manual Tracking (simplified) */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{metrics.totalRequired}</div>
            <div className="text-gray-600">Total Required</div>
            <div className="text-xs text-gray-500">Tests planned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.totalPending}</div>
            <div className="text-gray-600">Pending</div>
            <div className="text-xs text-gray-500">Not started</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.totalCompleted}</div>
            <div className="text-gray-600">Completed</div>
            <div className="text-xs text-gray-500">Results received</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.completionRate.toFixed(1)}%</div>
            <div className="text-gray-600">Complete</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {Object.entries(groupedTests).map(([groupKey, tests]) => {
          const isExpanded = expandedGroups.has(groupKey);
          const groupCompleted = tests.reduce((sum, test) => sum + (test.testsCompleted || 0), 0);
          const groupTotal = tests.reduce((sum, test) => sum + (test.frequency || 0), 0);
          
          return (
            <div key={groupKey} className="border-b border-gray-200">
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="font-medium text-gray-900">{groupKey}</div>
                  <div className="text-sm text-gray-500">
                    ({groupCompleted}/{groupTotal} tests completed)
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 w-20">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${groupTotal > 0 ? (groupCompleted / groupTotal) * 100 : 0}%` }}
                    />
                  </div>
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
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Complete</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">In Progress</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests.map((test) => {
                        const isEditing = editingTest === test.id;
                        const testsCompleted = test.testsCompleted || 0;
                        const testsInProgress = test.testsInProgress || 0;
                        const testsRequired = test.frequency || 0;
                        const testsPending = testsRequired - testsCompleted - testsInProgress;

                        return (
                          <tr key={test.id} className="border-t border-gray-200">
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
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={editValues.testsRequired}
                                  onChange={(e) => setEditValues(prev => ({
                                    ...prev,
                                    testsRequired: parseInt(e.target.value) || 0
                                  }))}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              ) : (
                                testsRequired
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  max={editValues.testsRequired}
                                  value={editValues.testsCompleted}
                                  onChange={(e) => setEditValues(prev => ({
                                    ...prev,
                                    testsCompleted: parseInt(e.target.value) || 0
                                  }))}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-green-600">{testsCompleted}</span>
                                  {testsCompleted > 0 && testsRequired > 0 && (
                                    <div className="w-8 bg-gray-200 rounded-full h-1">
                                      <div
                                        className="bg-green-500 h-1 rounded-full"
                                        style={{ width: `${(testsCompleted / testsRequired) * 100}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  max={editValues.testsRequired - editValues.testsCompleted}
                                  value={editValues.testsInProgress}
                                  onChange={(e) => setEditValues(prev => ({
                                    ...prev,
                                    testsInProgress: parseInt(e.target.value) || 0
                                  }))}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              ) : (
                                <span className="text-yellow-600 font-medium">{testsInProgress}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {isEditing ? (
                                <div className="text-xs">
                                  {editValues.testsCompleted >= editValues.testsRequired ? (
                                    <span className="text-green-600 font-medium">Complete</span>
                                  ) : (
                                    <span className="text-orange-600 font-medium">Pending</span>
                                  )}
                                </div>
                              ) : (
                                <select
                                  value={test.status}
                                  onChange={(e) => onUpdateTestStatus(test.id, e.target.value)}
                                  className={`text-xs border border-gray-300 rounded px-2 py-1 ${getStatusBadgeClass(test.status)}`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="completed">Completed</option>
                                </select>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {isEditing ? (
                                <div className="flex gap-1">
                                  <button
                                    onClick={saveEditing}
                                    className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                                    title="Save Changes"
                                  >
                                    <Save className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                    title="Cancel"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startEditing(test)}
                                  className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                  title="Edit Test Details"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
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
      </div>

      {/* Enhanced Footer with Action Summary (simplified) */}
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
  );
};

export default TestingRequirements;