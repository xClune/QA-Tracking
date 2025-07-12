import React, { useMemo, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const RoadProgressVisual = ({ form4Data }) => {
  // Chainage control state
  const [viewControls, setViewControls] = useState({
    startCh: '',
    endCh: '',
    autoFit: true,
    viewMode: 'smart', // 'smart', 'custom', 'chunks'
    chunkSize: 5000, // 5km chunks
    currentChunk: 0
  });

  // Memoize calculations to prevent unnecessary re-renders
  const visualData = useMemo(() => {
    if (!form4Data || form4Data.length === 0) {
      return null;
    }

    const dataMinCh = Math.min(...form4Data.map(entry => parseFloat(entry.start_ch)));
    const dataMaxCh = Math.max(...form4Data.map(entry => parseFloat(entry.finish_ch)));
    const totalProjectLength = dataMaxCh - dataMinCh;
    
    // Smart view mode: auto-chunk if project > 10km
    let minCh, maxCh, viewMode = viewControls.viewMode;
    
    if (viewMode === 'smart' && totalProjectLength > 10000) {
      // Auto-chunk for long projects
      viewMode = 'chunks';
      const chunkStart = dataMinCh + (viewControls.currentChunk * viewControls.chunkSize);
      minCh = chunkStart;
      maxCh = Math.min(chunkStart + viewControls.chunkSize, dataMaxCh);
    } else if (viewMode === 'chunks') {
      const chunkStart = dataMinCh + (viewControls.currentChunk * viewControls.chunkSize);
      minCh = chunkStart;
      maxCh = Math.min(chunkStart + viewControls.chunkSize, dataMaxCh);
    } else if (!viewControls.autoFit && viewControls.startCh && viewControls.endCh) {
      // Custom range
      minCh = parseFloat(viewControls.startCh);
      maxCh = parseFloat(viewControls.endCh);
      viewMode = 'custom';
    } else {
      // Auto-fit or short project
      minCh = dataMinCh;
      maxCh = dataMaxCh;
      viewMode = 'auto';
    }
    
    const totalLength = maxCh - minCh;
    const totalChunks = Math.ceil(totalProjectLength / viewControls.chunkSize);

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

    // Filter treatments within view range
    const visibleTreatments = form4Data.filter(entry => {
      const start = parseFloat(entry.start_ch);
      const end = parseFloat(entry.finish_ch);
      return start < maxCh && end > minCh;
    });

    return {
      minCh,
      maxCh,
      totalLength,
      totalProjectLength,
      statusCounts,
      completionStats,
      visibleTreatments,
      dataMinCh,
      dataMaxCh,
      viewMode,
      totalChunks,
      currentChunk: viewControls.currentChunk
    };
  }, [form4Data, viewControls]);

  const handleChainageUpdate = (field, value) => {
    setViewControls(prev => ({
      ...prev,
      [field]: value,
      autoFit: false,
      viewMode: 'custom'
    }));
  };

  const resetView = () => {
    setViewControls(prev => ({
      ...prev,
      startCh: '',
      endCh: '',
      autoFit: true,
      viewMode: 'smart',
      currentChunk: 0
    }));
  };

  const navigateChunk = (direction) => {
    setViewControls(prev => ({
      ...prev,
      currentChunk: Math.max(0, Math.min(
        prev.currentChunk + direction, 
        Math.ceil(visualData.totalProjectLength / prev.chunkSize) - 1
      )),
      viewMode: 'chunks',
      autoFit: false
    }));
  };

  const setChunkSize = (size) => {
    setViewControls(prev => ({
      ...prev,
      chunkSize: size,
      currentChunk: 0,
      viewMode: size < visualData.totalProjectLength ? 'chunks' : 'smart'
    }));
  };

  const zoomToSelection = () => {
    if (!visualData) return;
    
    const selectedTreatments = form4Data.filter(entry => entry.line_complete || entry.status === 'completed');
    if (selectedTreatments.length === 0) return;

    const selectionMin = Math.min(...selectedTreatments.map(entry => parseFloat(entry.start_ch)));
    const selectionMax = Math.max(...selectedTreatments.map(entry => parseFloat(entry.finish_ch)));
    
    setViewControls(prev => ({
      ...prev,
      startCh: selectionMin.toString(),
      endCh: selectionMax.toString(),
      autoFit: false,
      viewMode: 'custom'
    }));
  };

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

  const getTreatmentColor = (treatmentCode) => {
    // Different colors for different treatment types
    const colorMap = {
      'SPR_STB': 'bg-purple-500', // In-situ stabilisation
      'SPR_RR': 'bg-red-500',    // Reconstruct
      'SPR_GO': 'bg-blue-500',   // Granular overlay
      'USP_HFG': 'bg-orange-500', // Heavy formation grading
      'SPR_RSSR': 'bg-gray-600', // Seal
      'OTHER': 'bg-gray-400'
    };
    return colorMap[treatmentCode] || 'bg-gray-400';
  };

  const { minCh, maxCh, totalLength, statusCounts, completionStats, visibleTreatments } = visualData;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Project Progress Visualization</h3>
        <div className="text-sm text-gray-600">
          {completionStats.completed}/{completionStats.total} lines complete 
          ({((completionStats.completed / completionStats.total) * 100).toFixed(1)}%)
        </div>
      </div>

      {/* Enhanced Chainage Controls */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        {/* Project Overview */}
        <div className="mb-3 p-2 bg-white rounded border">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">
              Project: Ch {visualData.dataMinCh.toLocaleString()} - {visualData.dataMaxCh.toLocaleString()}
            </span>
            <span className="text-gray-600">
              Total: {(visualData.totalProjectLength / 1000).toFixed(1)} km
            </span>
          </div>
          
          {/* Project progress bar */}
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ 
                width: `${((visualData.maxCh - visualData.minCh) / visualData.totalProjectLength) * 100}%`,
                marginLeft: `${((visualData.minCh - visualData.dataMinCh) / visualData.totalProjectLength) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Chunk Navigation for Long Projects */}
          {visualData.viewMode === 'chunks' && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
              <button
                onClick={() => navigateChunk(-1)}
                disabled={visualData.currentChunk === 0}
                className="p-1 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-sm font-medium px-2">
                Section {visualData.currentChunk + 1} of {visualData.totalChunks}
              </span>
              
              <button
                onClick={() => navigateChunk(1)}
                disabled={visualData.currentChunk >= visualData.totalChunks - 1}
                className="p-1 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Chunk Size Selection */}
          {visualData.totalProjectLength > 5000 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">View:</label>
              <select
                value={viewControls.chunkSize}
                onChange={(e) => setChunkSize(parseInt(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={2000}>2km sections</option>
                <option value={5000}>5km sections</option>
                <option value={10000}>10km sections</option>
                <option value={visualData.totalProjectLength}>Full project</option>
              </select>
            </div>
          )}

          {/* Custom Range Inputs */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Custom:</label>
            <input
              type="number"
              value={viewControls.startCh}
              onChange={(e) => handleChainageUpdate('startCh', e.target.value)}
              placeholder={visualData.dataMinCh.toString()}
              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-sm text-gray-500">to</span>
            <input
              type="number"
              value={viewControls.endCh}
              onChange={(e) => handleChainageUpdate('endCh', e.target.value)}
              placeholder={visualData.dataMaxCh.toString()}
              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={resetView}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              <RotateCcw className="w-3 h-3" />
              Auto
            </button>
            
            <button
              onClick={zoomToSelection}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              disabled={visualData.completionStats.completed === 0}
            >
              <ZoomIn className="w-3 h-3" />
              Complete
            </button>
          </div>

          {/* Current View Info */}
          <div className="text-sm text-gray-600">
            <div>Viewing: Ch {visualData.minCh.toLocaleString()} - {visualData.maxCh.toLocaleString()}</div>
            <div>
              {(visualData.totalLength / 1000).toFixed(1)} km • 
              {visualData.visibleTreatments.length}/{form4Data.length} treatments
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar with Lane Visualization */}
      <div className="relative mb-4">
        {/* Main Road Visualization */}
        <div className="relative h-32 bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-300">
          {/* Road centerline */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-yellow-400 transform -translate-y-0.5 opacity-60"></div>
          
          {/* Treatment blocks */}
          {visibleTreatments.map((entry) => {
            const start = parseFloat(entry.start_ch);
            const end = parseFloat(entry.finish_ch);
            const length = end - start;
            const leftPercent = Math.max(0, ((start - minCh) / totalLength) * 100);
            const widthPercent = Math.min(100 - leftPercent, (length / totalLength) * 100);

            // Calculate width representation (assuming standard carriageway width if not specified)
            const treatmentWidth = entry.damage_width || 7; // Default 7m carriageway
            const maxWidth = 14; // Max display width for scaling
            const heightPercent = Math.min(90, (treatmentWidth / maxWidth) * 90);

            return (
              <div
                key={entry.id}
                className={`absolute ${getStatusColor(entry.status, entry.line_complete)} 
                          opacity-85 border-r border-white hover:opacity-100 transition-all duration-200 
                          cursor-pointer hover:scale-105 hover:z-20 rounded-sm`}
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`,
                  top: `${(100 - heightPercent) / 2}%`,
                  height: `${heightPercent}%`,
                  transform: 'translateZ(0)'
                }}
                title={`Line ${entry.line_no}: Ch ${entry.start_ch}-${entry.finish_ch}
Treatment: ${entry.treatment_type}
Width: ${entry.damage_width || 'N/A'}m
Area: ${entry.area?.toLocaleString() || 'N/A'}m²
Status: ${entry.status}
${entry.line_complete ? '✓ Complete' : ''}
${entry.photos_received ? '📷 Photos' : ''} ${entry.itp_received ? '📋 ITP' : ''}`}
              >
                <div className="p-1 text-xs text-white font-medium truncate">
                  <div>L{entry.line_no}</div>
                  <div className="text-xs">{entry.treatment_code}</div>
                  {entry.line_complete && (
                    <div className="text-xs">✓</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Treatment Type Legend Bar */}
        <div className="relative mt-2 h-4 bg-gray-100 rounded overflow-hidden">
          {visibleTreatments.map((entry) => {
            const start = parseFloat(entry.start_ch);
            const end = parseFloat(entry.finish_ch);
            const length = end - start;
            const leftPercent = Math.max(0, ((start - minCh) / totalLength) * 100);
            const widthPercent = Math.min(100 - leftPercent, (length / totalLength) * 100);

            return (
              <div
                key={`legend-${entry.id}`}
                className={`absolute h-full ${getTreatmentColor(entry.treatment_code)} opacity-70`}
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`
                }}
                title={`${entry.treatment_code}: ${entry.treatment_type}`}
              ></div>
            );
          })}
        </div>
      </div>

      {/* Chainage Scale with Smart Intervals */}
      <div className="relative mb-6">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Ch {minCh.toLocaleString()}</span>
          <span className="font-medium">Length: {(totalLength / 1000).toFixed(1)} km</span>
          <span>Ch {maxCh.toLocaleString()}</span>
        </div>
        
        {/* Smart chainage markers based on view range */}
        <div className="relative h-4 mt-1">
          {(() => {
            // Smart interval calculation based on view length
            let interval;
            if (totalLength <= 2000) interval = 200;      // 200m intervals for ≤2km
            else if (totalLength <= 5000) interval = 500;  // 500m intervals for ≤5km  
            else if (totalLength <= 10000) interval = 1000; // 1km intervals for ≤10km
            else interval = 2000;                          // 2km intervals for >10km

            const startMarker = Math.ceil(minCh / interval) * interval;
            const markers = [];
            
            for (let ch = startMarker; ch <= maxCh; ch += interval) {
              const position = ((ch - minCh) / totalLength) * 100;
              if (position >= 0 && position <= 100) {
                markers.push(
                  <div
                    key={ch}
                    className="absolute"
                    style={{ left: `${position}%` }}
                  >
                    <div className="w-px h-4 bg-gray-400"></div>
                    <div className="text-xs text-gray-500 mt-1 transform -translate-x-1/2">
                      {interval >= 1000 ? `${(ch / 1000).toFixed(0)}k` : ch}
                    </div>
                  </div>
                );
              }
            }
            return markers;
          })()}
        </div>
      </div>

      {/* Enhanced Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Status Legend</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
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
          <h4 className="text-sm font-medium text-gray-700 mb-2">Treatment Types</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Stabilisation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Reconstruct</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Overlay</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Formation</span>
            </div>
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