import React from 'react';

const TreatmentTypeProgress = ({ form4Data, onToggleVisibility }) => {
  if (!form4Data || form4Data.length === 0) return null;

  // Group treatments by type and calculate stats
  const treatmentTypeStats = {};
  form4Data.forEach(entry => {
    const type = entry.treatment_code || 'OTHER';
    if (!treatmentTypeStats[type]) {
      treatmentTypeStats[type] = {
        code: type,
        description: entry.treatment_type,
        total: 0,
        completed: 0,
        inProgress: 0,
        planned: 0,
        totalQuantity: 0,
        unit: entry.unit || 'm',
        // Only track area for treatments that actually have meaningful areas
        totalArea: 0,
        hasArea: false
      };
    }
    
    treatmentTypeStats[type].total++;
    treatmentTypeStats[type].totalQuantity += parseFloat(entry.quantity) || 0;
    
    // Only accumulate area for treatments where area is meaningful
    // Check if this treatment type should track area (stab, patches, recon)
    const treatmentDesc = (entry.treatment_type || '').toLowerCase();
    const isAreaBased = treatmentDesc.includes('stab') || 
                       treatmentDesc.includes('patch') || 
                       treatmentDesc.includes('recon') ||
                       treatmentDesc.includes('mill') ||
                       entry.unit === 'm2' || entry.unit === 'm²';
    
    if (isAreaBased && entry.area && entry.area > 0) {
      treatmentTypeStats[type].totalArea += parseFloat(entry.area) || 0;
      treatmentTypeStats[type].hasArea = true;
    }
    
    if (entry.line_complete) {
      treatmentTypeStats[type].completed++;
    } else if (entry.status === 'completed') {
      treatmentTypeStats[type].completed++;
    } else if (entry.status === 'in-progress') {
      treatmentTypeStats[type].inProgress++;
    } else {
      treatmentTypeStats[type].planned++;
    }
  });

  // Sort by total count descending
  const sortedStats = Object.values(treatmentTypeStats).sort((a, b) => b.total - a.total);

  const totalTreatments = form4Data.length;
  const totalCompleted = form4Data.filter(e => e.line_complete || e.status === 'completed').length;
  const overallProgress = totalTreatments > 0 ? (totalCompleted / totalTreatments) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Treatment Type Progress</h3>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Overall: {totalCompleted}/{totalTreatments} complete ({overallProgress.toFixed(1)}%)
          </div>
          <button
            onClick={() => onToggleVisibility && onToggleVisibility(false)}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Hide
          </button>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Project Progress</span>
          <span className="text-sm text-gray-600">{overallProgress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Planned: {form4Data.filter(e => e.status === 'planned').length}</span>
          <span>In Progress: {form4Data.filter(e => e.status === 'in-progress').length}</span>
          <span>Completed: {totalCompleted}</span>
        </div>
      </div>

      {/* Treatment Type Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedStats.map((stats) => {
          const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
          const progressRate = stats.total > 0 ? ((stats.completed + stats.inProgress) / stats.total) * 100 : 0;

          return (
            <div
              key={stats.code}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 text-sm leading-tight mb-1" title={stats.description}>
                    {stats.description}
                  </h4>
                  <p className="text-xs text-gray-600 font-mono">{stats.code}</p>
                  <p className="text-xs text-gray-500">Total: {stats.total}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{stats.completed}</div>
                  <div className="text-xs text-gray-500">complete</div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-2 mb-3">
                {/* Completion Progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Completed</span>
                    <span>{completionRate.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-green-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Overall Progress (including in-progress) */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progressRate.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-400 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${progressRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Planned:</span>
                  <span className="font-medium">{stats.planned}</span>
                </div>
                <div className="flex justify-between">
                  <span>In Progress:</span>
                  <span className="font-medium text-yellow-600">{stats.inProgress}</span>
                </div>
                {/* Only show area if this treatment type tracks area */}
                {stats.hasArea && stats.totalArea > 0 && (
                  <div className="flex justify-between">
                    <span>Area:</span>
                    <span className="font-medium">{stats.totalArea.toLocaleString()} m²</span>
                  </div>
                )}
              </div>

              {/* Treatment Description Tooltip - Remove since it's now in header */}
            </div>
          );
        })}
      </div>

      {/* Summary Stats - Simplified */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{sortedStats.length}</div>
            <div className="text-sm text-gray-600">Treatment Types</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {overallProgress.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Overall Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentTypeProgress;