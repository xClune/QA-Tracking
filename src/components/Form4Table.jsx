import React from 'react';

const Form4Table = ({ form4Data, onUpdateWorkStatus, onUpdateCheckboxField }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <h3 className="text-lg font-semibold p-6 border-b bg-gray-50">Form 4 Treatments</h3>
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
            {form4Data.map((entry) => (
              <tr key={entry.id} className={entry.line_complete ? 'bg-green-50' : 'hover:bg-gray-50'}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry.line_no}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{entry.start_ch} - {entry.finish_ch}</div>
                  <div className="text-xs text-gray-500">
                    {((parseFloat(entry.finish_ch) - parseFloat(entry.start_ch)) / 1000).toFixed(2)} km
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
                  {entry.area && (
                    <div className="text-xs text-gray-500">{entry.area.toLocaleString()} m²</div>
                  )}
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
                    <option value="planning">Planning</option>
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
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Total: {form4Data.length} treatments</span>
          <div className="flex gap-4">
            <span>Planning: {form4Data.filter(e => e.status === 'planning').length}</span>
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