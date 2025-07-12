import React from 'react';

const RoadProgressVisual = ({ form4Data }) => {
  if (!form4Data || form4Data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Project Progress Visualization</h3>
        <div className="text-center text-gray-500 py-8">
          Upload a Form 4 file to see project progress visualization
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'planning': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const minCh = Math.min(...form4Data.map(entry => parseFloat(entry.start_ch)));
  const maxCh = Math.max(...form4Data.map(entry => parseFloat(entry.finish_ch)));
  const totalLength = maxCh - minCh;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">Project Progress Visualization</h3>
      
      {/* Progress Bar */}
      <div className="relative h-20 bg-gray-200 rounded-lg overflow-hidden mb-4">
        {form4Data.map((entry) => {
          const start = parseFloat(entry.start_ch);
          const end = parseFloat(entry.finish_ch);
          const length = end - start;
          const leftPercent = ((start - minCh) / totalLength) * 100;
          const widthPercent = (length / totalLength) * 100;

          return (
            <div
              key={entry.id}
              className={`absolute h-full ${getStatusColor(entry.status)} opacity-80 border-r border-white hover:opacity-100 transition-opacity cursor-pointer`}
              style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`
              }}
              title={`Line ${entry.line_no}: Ch ${entry.start_ch}-${entry.finish_ch} - ${entry.treatment_type}`}
            >
              <div className="p-1 text-xs text-white font-medium truncate">
                L{entry.line_no}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chainage Labels */}
      <div className="flex justify-between text-sm text-gray-600 mb-4">
        <span>Ch {minCh.toLocaleString()}</span>
        <span>Total Length: {(totalLength / 1000).toFixed(1)} km</span>
        <span>Ch {maxCh.toLocaleString()}</span>
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span>Planning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Completed</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">
              {form4Data.filter(entry => entry.status === 'planning').length}
            </div>
            <div className="text-gray-600">Planning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {form4Data.filter(entry => entry.status === 'in-progress').length}
            </div>
            <div className="text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {form4Data.filter(entry => entry.status === 'completed').length}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadProgressVisual;