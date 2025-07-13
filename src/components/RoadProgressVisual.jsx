import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, RotateCcw, Eye, EyeOff } from 'lucide-react';

const RoadProgressVisual = ({ form4Data, onToggleVisibility }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [viewControls, setViewControls] = useState({
    startCh: '',
    endCh: '',
    autoFit: true,
    chunkSize: 1000,
    currentChunk: 0,
    viewMode: 'smart',
    initialized: false
  });

  // Determine treatment position in road cross-section
  const getTreatmentPosition = (entry) => {
    const treatmentType = (entry.treatment_type || '').toLowerCase();
    const treatmentCode = entry.treatment_code || '';
    const additionalDescription = (entry.additional_description || '').toLowerCase();
    
    // Extract LHS/RHS from additional description field
    let side = 'CENTRE';
    if (additionalDescription.includes('lhs') || additionalDescription.includes('left')) {
      side = 'LHS';
    } else if (additionalDescription.includes('rhs') || additionalDescription.includes('right')) {
      side = 'RHS';
    }
    
    // Determine road element type
    let element = 'pavement'; // default
    if (treatmentType.includes('table drain') || treatmentType.includes('drain')) {
      element = 'table_drain';
    } else if (treatmentType.includes('shoulder') || treatmentType.includes('verge')) {
      element = 'shoulder';
    } else if (treatmentType.includes('edge') || treatmentCode.includes('EB')) {
      element = 'edge';
    } else if (treatmentType.includes('patch') || treatmentType.includes('repair')) {
      element = 'patch_repair';
    }
    
    // Calculate position offsets (in road cross-section coordinates)
    // Negative values = LHS (top of display), Positive values = RHS (bottom of display)
    const positions = {
      table_drain: { lhs: -5.5, rhs: 5.5, centre: 0, width: 1.5 },    // Table drains at edges
      shoulder: { lhs: -3.8, rhs: 3.8, centre: 0, width: 1.2 },       // Shoulders between table drain and pavement
      edge: { lhs: -3.5, rhs: 3.5, centre: 0, width: 0.8 },          // Edge treatments at pavement edge
      pavement: { lhs: -2, rhs: 2, centre: 0, width: 7 },             // Wide pavement zone
      patch_repair: { lhs: -4, rhs: 4, centre: 0, width: 8 }          // Full 8m pavement width for patches
    };
    
    const pos = positions[element];
    let offset = pos.centre;
    let width = pos.width;
    
    // Special handling for patch repairs - position based on width and side
    if (element === 'patch_repair') {
      const damageWidth = parseFloat(entry.damage_width) || 2; // Default 2m if not specified
      const pavementHalfWidth = 4; // 8m total pavement / 2
      
      if (side === 'LHS') {
        // Position on LHS, offset from centreline
        offset = -pavementHalfWidth + (damageWidth / 2);
      } else if (side === 'RHS') {
        // Position on RHS, offset from centreline  
        offset = pavementHalfWidth - (damageWidth / 2);
      } else {
        // Centre - use actual width
        offset = 0;
      }
      width = damageWidth; // Use actual damage width
    } else {
      // For other elements, use standard positioning
      if (element === 'table_drain' || element === 'shoulder') {
        if (side === 'LHS') {
          offset = pos.lhs;
        } else if (side === 'RHS') {
          offset = pos.rhs;
        } else {
          offset = pos.lhs; // Default to LHS for these elements
        }
      } else {
        // For pavement and edge treatments, respect the side designation
        if (side === 'LHS') {
          offset = pos.lhs;
        } else if (side === 'RHS') {
          offset = pos.rhs;
        }
      }
    }
    
    return {
      element,
      offset,
      width,
      side
    };
  };

  const visualData = useMemo(() => {
    if (!form4Data || form4Data.length === 0) return null;

    // Use actual project bounds instead of starting from 0
    const dataMinCh = Math.min(...form4Data.map(entry => parseFloat(entry.start_ch)));
    const dataMaxCh = Math.max(...form4Data.map(entry => parseFloat(entry.finish_ch)));
    const totalProjectLength = dataMaxCh - dataMinCh;

    // Initialize view controls to actual data bounds on first load
    if (!viewControls.initialized && viewControls.autoFit) {
      setViewControls(prev => ({
        ...prev,
        startCh: dataMinCh.toString(),
        endCh: dataMaxCh.toString(),
        initialized: true
      }));
    }

    let minCh, maxCh, viewMode;
    
    if (viewControls.viewMode === 'chunks') {
      const chunkStart = dataMinCh + (viewControls.currentChunk * viewControls.chunkSize);
      minCh = chunkStart;
      maxCh = Math.min(chunkStart + viewControls.chunkSize, dataMaxCh);
      viewMode = 'chunks';
    } else if (!viewControls.autoFit && viewControls.startCh && viewControls.endCh) {
      minCh = parseFloat(viewControls.startCh);
      maxCh = parseFloat(viewControls.endCh);
      viewMode = 'custom';
    } else {
      // Use actual data bounds when auto-fitting
      minCh = dataMinCh;
      maxCh = dataMaxCh;
      viewMode = 'auto';
    }
    
    const totalLength = maxCh - minCh;
    const totalChunks = Math.ceil(totalProjectLength / viewControls.chunkSize);

    const statusCounts = {
      planned: form4Data.filter(entry => entry.status === 'planned').length,
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
    if (!form4Data || form4Data.length === 0) return;
    
    const dataMinCh = Math.min(...form4Data.map(entry => parseFloat(entry.start_ch)));
    const dataMaxCh = Math.max(...form4Data.map(entry => parseFloat(entry.finish_ch)));
    
    setViewControls(prev => ({
      ...prev,
      startCh: dataMinCh.toString(),
      endCh: dataMaxCh.toString(),
      autoFit: true,
      viewMode: 'smart',
      currentChunk: 0,
      initialized: true
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

  if (!form4Data || form4Data.length === 0) {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 border-l-4 border-blue-500">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Project Progress Visualization</h3>
              <p className="text-sm text-gray-600">
                {form4Data.length} treatments • {((form4Data.filter(e => e.line_complete).length / form4Data.length) * 100).toFixed(1)}% complete
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(true);
              onToggleVisibility && onToggleVisibility(true);
            }}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Show Details
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status, isComplete = false) => {
    if (isComplete) return 'bg-green-600 border-green-700';
    switch (status) {
      case 'completed': return 'bg-green-500 border-green-600';
      case 'in-progress': return 'bg-yellow-500 border-yellow-600';
      case 'planned': return 'bg-gray-400 border-gray-500';
      default: return 'bg-gray-400 border-gray-500';
    }
  };

  const getTreatmentColor = (treatmentCode) => {
    const colorMap = {
      'SPR_STB': 'bg-purple-500',
      'SPR_GO': 'bg-blue-500',
      'SPR_RR': 'bg-red-500',
      'USP_LFG': 'bg-orange-500',
      'USP_MFG': 'bg-orange-600',
      'USP_HFG': 'bg-orange-700',
      'EB': 'bg-pink-500',
      'CS': 'bg-teal-500',
      'TD': 'bg-brown-500',
      'SH': 'bg-green-500'
    };
    
    // Find matching code
    for (const [code, color] of Object.entries(colorMap)) {
      if (treatmentCode && treatmentCode.includes(code)) {
        return color;
      }
    }
    return 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-6 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Project Progress Visualization</h3>
          <button
            onClick={() => {
              setIsVisible(false);
              onToggleVisibility && onToggleVisibility(false);
            }}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Hide
          </button>
        </div>
        
        {/* View Controls */}
        <div className="mt-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">View:</label>
            <select 
              value={viewControls.chunkSize}
              onChange={(e) => setChunkSize(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={500}>500m chunks</option>
              <option value={1000}>1000m chunks</option>
              <option value={2000}>2000m chunks</option>
              <option value={visualData.totalProjectLength}>Full project</option>
            </select>
          </div>
          
          {viewControls.viewMode === 'chunks' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateChunk(-1)}
                disabled={viewControls.currentChunk === 0}
                className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm">
                Chunk {viewControls.currentChunk + 1} of {visualData.totalChunks}
              </span>
              <button
                onClick={() => navigateChunk(1)}
                disabled={viewControls.currentChunk >= visualData.totalChunks - 1}
                className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <label className="text-sm">Start CH:</label>
            <input
              type="number"
              value={viewControls.startCh}
              onChange={(e) => handleChainageUpdate('startCh', e.target.value)}
              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Auto"
            />
            <label className="text-sm">End CH:</label>
            <input
              type="number"
              value={viewControls.endCh}
              onChange={(e) => handleChainageUpdate('endCh', e.target.value)}
              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Auto"
            />
            <button
              onClick={resetView}
              className="p-1 border border-gray-300 rounded hover:bg-gray-100"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Progress Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{visualData.completionStats.completed}</div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{visualData.statusCounts['in-progress']}</div>
            <div className="text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{visualData.statusCounts.planned}</div>
            <div className="text-gray-600">Planned</div>
          </div>
        </div>
      </div>

      {/* Road Cross-Section Visualization */}
      <div className="p-6">
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">
            CH {visualData.minCh.toFixed(0)}m - {visualData.maxCh.toFixed(0)}m 
            ({visualData.visibleTreatments.length}/{form4Data.length} treatments)
          </div>
          
          {/* Chainage Scale */}
          <div className="relative h-6 bg-gray-100 rounded mb-2">
            <div className="absolute inset-0 flex justify-between items-center px-2 text-xs text-gray-600">
              <span>{visualData.minCh.toFixed(0)}m</span>
              <span>{((visualData.minCh + visualData.maxCh) / 2).toFixed(0)}m</span>
              <span>{visualData.maxCh.toFixed(0)}m</span>
            </div>
          </div>
        </div>

        {/* Enhanced Road Cross-Section with Reference Lines */}
        <div className="relative mb-4 flex items-center gap-4">
          {/* Labels on the left */}
          <div className="flex flex-col justify-between h-48 text-xs text-gray-700 font-medium py-2">
            <div className="text-blue-700">LHS Table Drain</div>
            <div className="text-green-700">LHS Shoulder</div>
            <div className="text-gray-700">LHS Pavement Edge</div>
            <div className="text-yellow-700">Centreline</div>
            <div className="text-gray-700">RHS Pavement Edge</div>
            <div className="text-green-700">RHS Shoulder</div>
            <div className="text-blue-700">RHS Table Drain</div>
          </div>
          
          {/* Road visualization */}
          <div className="relative h-48 flex-1 bg-gradient-to-b from-green-100 via-gray-100 to-green-100 rounded-lg overflow-hidden border-2 border-gray-300">
            
            {/* Road Infrastructure Lines (horizontal - cross-section elements) */}
            {/* Table Drain Lines */}
            <div className="absolute left-0 right-0 h-0.5 bg-blue-600 opacity-60" style={{ top: '8%' }}></div>
            <div className="absolute left-0 right-0 h-0.5 bg-blue-600 opacity-60" style={{ top: '92%' }}></div>
            
            {/* Pavement Edge Lines (these are also shoulder edges) */}
            <div className="absolute left-0 right-0 h-0.5 bg-gray-700 opacity-80" style={{ top: '22%' }}></div>
            <div className="absolute left-0 right-0 h-0.5 bg-gray-700 opacity-80" style={{ top: '78%' }}></div>
            
            {/* Centreline */}
            <div className="absolute left-0 right-0 h-1 bg-yellow-400 opacity-80" style={{ top: '50%' }}></div>
            
            {/* Road Surface Background - Much expanded pavement area */}
            <div className="absolute left-0 right-0 bg-gray-300 opacity-40" style={{ 
              top: '22%', 
              height: '56%' 
            }}></div>
            
            {/* Treatment blocks positioned by cross-section location */}
            {visualData.visibleTreatments.map((entry) => {
              const start = parseFloat(entry.start_ch);
              const end = parseFloat(entry.finish_ch);
              const length = end - start;
              const leftPercent = Math.max(0, ((start - visualData.minCh) / visualData.totalLength) * 100);
              const widthPercent = Math.min(100 - leftPercent, (length / visualData.totalLength) * 100);

              // Get cross-section position
              const position = getTreatmentPosition(entry);
              
              // Convert offset to percentage from top (LHS) to bottom (RHS)
              // LHS (-ve) = top of screen, RHS (+ve) = bottom of screen
              // -5.5m (LHS table drain) to +5.5m (RHS table drain) = 11m total width
              const crossSectionPercent = ((position.offset + 5.5) / 11) * 100; // LHS at top, RHS at bottom
              const treatmentHeightPercent = (position.width / 11) * 100;
              
              // Ensure minimum visibility
              const displayWidth = Math.max(widthPercent, 0.8);
              const displayCrossHeight = Math.max(treatmentHeightPercent, 4);

              return (
                <div
                  key={entry.id}
                  className={`absolute ${getStatusColor(entry.status, entry.line_complete)} 
                            ${getTreatmentColor(entry.treatment_code)}
                            opacity-85 border border-white hover:opacity-100 transition-all duration-200 
                            cursor-pointer hover:scale-105 hover:z-20 rounded-sm shadow-sm`}
                  style={{
                    left: `${leftPercent}%`,
                    width: `${displayWidth}%`,
                    top: `${crossSectionPercent - (displayCrossHeight / 2)}%`,
                    height: `${displayCrossHeight}%`,
                    transform: 'translateZ(0)',
                    minHeight: '6px',
                    minWidth: '3px'
                  }}
                  title={`Line ${entry.line_no}: Ch ${entry.start_ch}-${entry.finish_ch}
Treatment: ${entry.treatment_type}
Side: ${position.side}
Element: ${position.element.replace('_', ' ')}
Width: ${entry.damage_width || 'N/A'}m
Status: ${entry.status}
${entry.line_complete ? '✓ Complete' : ''}
${entry.photos_received ? '📷 Photos' : ''} ${entry.itp_received ? '📋 ITP' : ''}`}
                >
                  {/* Treatment identifier for larger blocks */}
                  {widthPercent > 2 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold drop-shadow">
                        {entry.line_no}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-medium text-gray-700">Status</div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span>Complete</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>Planned</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="font-medium text-gray-700">Road Elements</div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-blue-600"></div>
              <span>Table Drain</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-gray-700"></div>
              <span>Pavement Edge</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-yellow-400"></div>
              <span>Centreline</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="font-medium text-gray-700">Treatment Types</div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Stabilization</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Unsealed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-pink-500 rounded"></div>
              <span>Edge Break</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="font-medium text-gray-700">Navigation</div>
            <div className="text-gray-600">Hover blocks for details</div>
            <div className="text-gray-600">Use controls to zoom</div>
            <div className="text-gray-600">Set custom chainage range</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadProgressVisual;