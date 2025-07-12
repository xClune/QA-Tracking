import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TestingRequirements = ({ testingRequirements, onUpdateTestStatus }) => {
  const [groupBy, setGroupBy] = useState('line'); // 'line', 'standard', 'status'
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const toggleGroup = (groupKey) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
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
        return 'bg-yellow-100 text-yellow-800';
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedTests = groupTests();
  const totalTests = testingRequirements.length;
  const completedTests = testingRequirements.filter(test => test.status === 'completed').length;
  const inProgressTests = testingRequirements.filter(test => test.status === 'in-progress').length;
  const pendingTests = testingRequirements.filter(test => test.status === 'pending').length;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalTests}</div>
            <div className="text-gray-600">Total Tests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{pendingTests}</div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{inProgressTests}</div>
            <div className="text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedTests}</div>
            <div className="text-gray-600">Completed</div>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {Object.entries(groupedTests).map(([groupKey, tests]) => {
          const isExpanded = expandedGroups.has(groupKey);
          const groupCompletedTests = tests.filter(test => test.status === 'completed').length;
          const groupTotalTests = tests.length;
          
          return (
            <div key={groupKey} className="border-b border-gray-200">
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="font-medium text-gray-900">{groupKey}</div>
                  <div className="text-sm text-gray-500">
                    ({groupCompletedTests}/{groupTotalTests} completed)
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 w-20">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(groupCompletedTests / groupTotalTests) * 100}%` }}
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
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests.map((test) => (
                        <tr key={test.id} className="border-t border-gray-200">
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">{test.test}</div>
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
                            {test.frequency} test{test.frequency > 1 ? 's' : ''}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="text-xs">
                              {test.targetSMDD && <div>SMDD: {test.targetSMDD}</div>}
                              {test.targetUCS && <div>UCS: {test.targetUCS}</div>}
                              {test.targetThickness && <div>Thickness: {test.targetThickness}</div>}
                              {test.targetRetention && <div>Retention: {test.targetRetention}</div>}
                              {!test.targetSMDD && !test.targetUCS && !test.targetThickness && !test.targetRetention && 'As specified'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(test.priority)}`}>
                              {test.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <select
                              value={test.status}
                              onChange={(e) => onUpdateTestStatus(test.id, e.target.value)}
                              className={`text-xs border border-gray-300 rounded px-2 py-1 ${getStatusBadgeClass(test.status)}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestingRequirements;