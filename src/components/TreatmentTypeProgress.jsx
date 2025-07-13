import React from 'react';

const TreatmentTypeProgress = ({ form4Data, isVisible = true, onToggleVisibility }) => {
  if (!form4Data || form4Data.length === 0) {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 border-l-4 border-indigo-500">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Treatment Type Progress</h3>
              <p className="text-sm text-gray-600">
                Progress breakdown by treatment category
              </p>
            </div>
          </div>
          <button
            onClick={() => onToggleVisibility(true)}
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            Show Details
          </button>
        </div>
      </div>
    );
  }

  const getTreatmentColor = (treatmentCode) => {
    const colorMap = {
      'SPR_STB': 'bg-purple-500', // In-situ stabilisation
      'SPR_RR': 'bg-red-500',    // Reconstruct
      'SPR_GO': 'bg-blue-500',   // Granular overlay
      'USP_HFG': 'bg-orange-500', // Heavy formation grading
      'USP_HFG50': 'bg-orange-600', // Heavy formation grading 50mm
      'USP_HFG75': 'bg-orange-700', // Heavy formation grading 75mm
      'SPR_RSSR': 'bg-gray-600', // Seal
      'SPR_FBS': 'bg-purple-600', // Foamed bitumen
      'USP_LFG': 'bg-green-500', // Light formation grading
      'USP_MFG': 'bg-green-600', // Medium formation grading
      'USP_GR100': 'bg-yellow-500', // Gravel resheeting 100mm
      'USP_GR150': 'bg-yellow-600', // Gravel resheeting 150mm
      'SPR_PRL': 'bg-pink-500', // Pavement repair
      'SPR_POT': 'bg-red-400', // Pothole repair
      'SPR_RSAC': 'bg-indigo-500', // Asphalt surfacing
      'OTHER': 'bg-gray-400'
    };
    return colorMap[treatmentCode] || 'bg-gray-400';
  };

  // Calculate treatment type breakdown
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
        totalArea: 0
      };
    }
    treatmentTypeStats[type].total++;
    treatmentTypeStats[type].totalQuantity += parseFloat(entry.quantity) || 0;
    treatmentTypeStats[type].totalArea += parseFloat(entry.area) || 0;
    
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
            onClick={() => onToggleVisibility(false)}
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
            <div key={stats.code} className="bg-gray-50 p-4 rounded-lg border hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-4 h-4 rounded ${getTreatmentColor(stats.code)}`}></div>
                <div className="font-medium text-sm text-gray-900 truncate" title={stats.description}>
                  {stats.code}
                </div>
              </div>

              {/* Main Stats */}
              <div className="mb-3">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.completed}<span className="text-lg text-gray-500">/{stats.total}</span>
                </div>
                <div className="text-xs text-gray-600">{completionRate.toFixed(0)}% complete</div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-2 mb-3">
                {/* Completion Progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Complete</span>
                    <span>{completionRate.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
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
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span className="font-medium">{stats.totalQuantity.toLocaleString()} {stats.unit}</span>
                </div>
                {stats.totalArea > 0 && (
                  <div className="flex justify-between">
                    <span>Area:</span>
                    <span className="font-medium">{stats.totalArea.toLocaleString()} m²</span>
                  </div>
                )}
              </div>

              {/* Treatment Description Tooltip */}
              <div className="mt-2 text-xs text-gray-400 truncate" title={stats.description}>
                {stats.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{sortedStats.length}</div>
            <div className="text-sm text-gray-600">Treatment Types</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {sortedStats.reduce((sum, stats) => sum + stats.totalQuantity, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Quantity</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {sortedStats.reduce((sum, stats) => sum + stats.totalArea, 0).toLocaleString()} m²
            </div>
            <div className="text-sm text-gray-600">Total Area</div>
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