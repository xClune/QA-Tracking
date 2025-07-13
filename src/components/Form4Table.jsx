import React from 'react';

const Form4Table = ({ form4Data, testingRequirements, onUpdateWorkStatus, onUpdateCheckboxField }) => {
  if (!form4Data || form4Data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
        No Form 4 data available. Please upload a Form 4 Excel file.
      </div>
    );
  }

  const completedLines = form4Data.filter(entry => entry.line_complete).length;
  const totalLines = form4Data.length;
  const completionPercentage = totalLines > 0 ? (completedLines / totalLines) * 100 : 0;

  const totalTests = testingRequirements?.length || 0;
  const completedTests = testingRequirements?.filter(test => test.status === 'completed').length || 0;
  const testCompletionPercentage = totalTests > 0 ? (completedTests / totalTests) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with Progress Summary */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Form 4 Treatment Progress</h3>
          
          {/* Progress Indicators */}
          <div className="flex items-center gap-6">
            {/* Lines Completion Gauge */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-16 h-16 mb-2">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPercentage / 100)}`}
                    className="text-green-500 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-green-600">
                    {completionPercentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600">Lines Complete</div>
            </div>

            {/* Testing Completion Gauge */}
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-16 h-16 mb-2">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - testCompletionPercentage / 100)}`}
                    className="text-orange-500 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-orange-600">
                    {testCompletionPercentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600">Tests Complete</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">{completedLines}/{totalLines}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Line
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chainage
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Treatment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Photos
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ITP
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Complete
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {form4Data.map((entry) => {
              const length = parseFloat(entry.finish_ch) - parseFloat(entry.start_ch);
              
              return (
                <tr key={entry.id} className={entry.line_complete ? 'bg-green-50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.line_no}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{entry.start_ch} - {entry.finish_ch}</div>
                    <div className="text-xs text-gray-500">
                      Length: {length.toFixed(0)}m
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="font-medium">{entry.treatment_code}</div>
                    <div className="text-gray-500 text-xs max-w-xs truncate" title={entry.treatment_type}>
                      {entry.treatment_type}
                    </div>
                    {entry.additional_description && (
                      <div className="text-gray-400 text-xs">{entry.additional_description}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{entry.quantity?.toLocaleString()} {entry.unit}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="space-y-1">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={entry.photos_received || false}
                          onChange={(e) => onUpdateCheckboxField(entry.id, 'photos_received', e.target.checked)}
                          className="mr-2 rounded"
                        />
                        <span className="text-xs">Received</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={entry.photos_reviewed || false}
                          onChange={(e) => onUpdateCheckboxField(entry.id, 'photos_reviewed', e.target.checked)}
                          className="mr-2 rounded"
                        />
                        <span className="text-xs">Reviewed</span>
                      </label>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <input
                      type="checkbox"
                      checked={entry.itp_received || false}
                      onChange={(e) => onUpdateCheckboxField(entry.id, 'itp_received', e.target.checked)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={entry.status}
                      onChange={(e) => onUpdateWorkStatus(entry.id, e.target.value)}
                      className={`text-sm border border-gray-300 rounded px-2 py-1 ${
                        entry.status === 'completed' ? 'bg-green-50 text-green-800' :
                        entry.status === 'in-progress' ? 'bg-yellow-50 text-yellow-800' :
                        'bg-gray-50 text-gray-800'
                      }`}
                    >
                      <option value="planned">Planned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                    <input
                      type="checkbox"
                      checked={entry.line_complete || false}
                      onChange={(e) => onUpdateCheckboxField(entry.id, 'line_complete', e.target.checked)}
                      className="rounded scale-125"
                    />
                    {entry.line_complete && (
                      <div className="text-xs text-green-600 mt-1">✓ Complete</div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Summary Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Total: {form4Data.length} treatments</span>
          <div className="flex gap-4">
            <span>Planned: {form4Data.filter(e => e.status === 'planned').length}</span>
            <span>In Progress: {form4Data.filter(e => e.status === 'in-progress').length}</span>
            <span>Completed: {form4Data.filter(e => e.status === 'completed').length}</span>
            <span className="font-medium">Lines Complete: {form4Data.filter(e => e.line_complete).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form4Table;