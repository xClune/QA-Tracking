import React, { useMemo } from 'react';

const RoadProgressVisual = ({ form4Data }) => {
  // Memoize calculations to prevent unnecessary re-renders
  const visualData = useMemo(() => {
    if (!form4Data || form4Data.length === 0) {
      return null;
    }

    const minCh = Math.min(...form4Data.map(entry => parseFloat(entry.start_ch)));
    const maxCh = Math.max(...form4Data.map(entry => parseFloat(entry.finish_ch)));
    const totalLength = maxCh - minCh;

    const statusCounts = {
      planning: form4Data.filter(entry => entry.status === 'planning').length,
      'in-progress': form4Data.filter(entry => entry.status === 'in-progress').length,
      completed: form4Data.filter(entry => entry.status === 'completed').length
    };

    const completionStats = {
      total: form4Data.length,
      completed: form4Data.filter(entry => entry.line_complete).length,
      photosReceived: form4Data.filter(entry => entry.photos_received).length,
      itpReceived: form4Data.filter(entry => entry.itp_received).length
    };

    return {
      minCh,
      maxCh,
      totalLength,
      statusCounts,
      completionStats
    };
  }, [form4Data]);

  if (!visualData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Project Progress Visualization</h3>
        <div className="text-center text-gray-500 py-8">
          Upload a Form 4 file to see project progress visualization
        </div>
      </div>
    );
  }

  const getStatusColor = (status, isComplete = false) => {
    if (isComplete) return 'bg-green-600 border-green-700';
    switch (status) {
      case 'completed': return 'bg-green-500 border-green-600';
      case 'in-progress': return 'bg-yellow-500 border-yellow-600';
      case 'planning': return 'bg-gray-400 border-gray-500';
      default: return 'bg-gray-400 border-gray-500';
    }
  };

  const { minCh, maxCh, totalLength, statusCounts, completionStats } = visualData;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Project Progress Visualization</h3>
        <div className="text-sm text-gray-600">
          {completionStats.completed}/{completionStats.total} lines complete 
          ({((completionStats.completed / completionStats.total) * 100).toFixed(1)}%)
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-24 bg-gray-200 rounded-lg overflow-hidden mb-4 border">
        {form4Data.map((entry) => {
          const start = parseFloat(entry.start_ch);
          const end = parseFloat(entry.finish_ch);
          const length = end - start;
          const leftPercent = ((start - minCh) / totalLength) * 100;
          const widthPercent = (length / totalLength) * 100;

          return (
            <div
              key={entry.id}
              className={`absolute h-full ${getStatusColor(entry.status, entry.line_complete)} 
                        opacity-90 border-r border-white hover:opacity-100 transition-all duration-200 
                        cursor-pointer hover:scale-105 hover:z-10`}
              style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                transform: 'translateZ(0)' // Force hardware acceleration
              }}
              title={`Line ${entry.line_no}: Ch ${entry.start_ch}-${entry.finish_ch}
Treatment: ${entry.treatment_type}
Status: ${entry.status}
${entry.line_complete ? '✓ Complete' : ''}
${entry.photos_received ? '📷 Photos' : ''} ${entry.itp_received ? '📋 ITP' : ''}`}
            >
              <div className="p-1 text-xs text-white font-medium truncate">
                L{entry.line_no}
                {entry.line_complete && (
                  <div className="text-xs">✓</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chainage Labels */}
      <div className="flex justify-between text-sm text-gray-600 mb-6">
        <span>Ch {minCh.toLocaleString()}</span>
        <span className="font-medium">Total Length: {(totalLength / 1000).toFixed(1)} km</span>
        <span>Ch {maxCh.toLocaleString()}</span>
      </div>

      {/* Enhanced Legend */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Status Legend</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded border border-gray-500"></div>
              <span>Planning ({statusCounts.planning})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded border border-yellow-600"></div>
              <span>In Progress ({statusCounts['in-progress']})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded border border-green-600"></div>
              <span>Completed ({statusCounts.completed})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded border border-green-700"></div>
              <span>Line Complete ({completionStats.completed})</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">QA Progress</h4>
          <div className="text-sm space-y-1">
            <div>Photos: {completionStats.photosReceived}/{completionStats.total} received</div>
            <div>ITPs: {completionStats.itpReceived}/{completionStats.total} received</div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Stats */}
      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">
              {statusCounts.planning}
            </div>
            <div className="text-gray-600">Planning</div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div 
                className="bg-gray-400 h-1 rounded-full transition-all duration-500"
                style={{ width: `${(statusCounts.planning / completionStats.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {statusCounts['in-progress']}
            </div>
            <div className="text-gray-600">In Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div 
                className="bg-yellow-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${(statusCounts['in-progress'] / completionStats.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {statusCounts.completed}
            </div>
            <div className="text-gray-600">Completed</div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div 
                className="bg-green-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${(statusCounts.completed / completionStats.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {completionStats.completed}
            </div>
            <div className="text-gray-600">Lines Complete</div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
              <div 
                className="bg-green-600 h-1 rounded-full transition-all duration-500"
                style={{ width: `${(completionStats.completed / completionStats.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadProgressVisual;