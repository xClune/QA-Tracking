import React, { useState } from 'react';
import { CheckSquare, Square, Filter, Download, Upload } from 'lucide-react';

const BulkActions = ({ form4Data, onBulkUpdate, onBulkExport }) => {
  const [selectedLines, setSelectedLines] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectAll = () => {
    if (selectedLines.size === form4Data.length) {
      setSelectedLines(new Set());
    } else {
      setSelectedLines(new Set(form4Data.map(entry => entry.id)));
    }
  };

  const handleSelectLine = (lineId) => {
    const newSelected = new Set(selectedLines);
    if (newSelected.has(lineId)) {
      newSelected.delete(lineId);
    } else {
      newSelected.add(lineId);
    }
    setSelectedLines(newSelected);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedLines.size === 0) return;

    setIsProcessing(true);
    
    const updates = {};
    switch (bulkAction) {
      case 'mark-completed':
        updates.status = 'completed';
        break;
      case 'mark-in-progress':
        updates.status = 'in-progress';
        break;
      case 'mark-planned':
        updates.status = 'planned';
        break;
      case 'photos-received':
        updates.photos_received = true;
        break;
      case 'photos-reviewed':
        updates.photos_reviewed = true;
        break;
      case 'itp-received':
        updates.itp_received = true;
        break;
      case 'line-complete':
        updates.line_complete = true;
        break;
    }

    await onBulkUpdate(Array.from(selectedLines), updates);
    setSelectedLines(new Set());
    setBulkAction('');
    setIsProcessing(false);
  };

  const filteredData = form4Data.filter(entry => {
    switch (filterBy) {
      case 'planned':
        return entry.status === 'planned';
      case 'in-progress':
        return entry.status === 'in-progress';
      case 'completed':
        return entry.status === 'completed';
      case 'line-complete':
        return entry.line_complete;
      case 'missing-photos':
        return !entry.photos_received;
      case 'missing-itp':
        return !entry.itp_received;
      default:
        return true;
    }
  });

  const getStatusStats = () => {
    return {
      total: form4Data.length,
      planned: form4Data.filter(e => e.status === 'planned').length,
      inProgress: form4Data.filter(e => e.status === 'in-progress').length,
      completed: form4Data.filter(e => e.status === 'completed').length,
      lineComplete: form4Data.filter(e => e.line_complete).length,
      missingPhotos: form4Data.filter(e => !e.photos_received).length,
      missingITP: form4Data.filter(e => !e.itp_received).length
    };
  };

  const stats = getStatusStats();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Bulk Actions & Filters</h3>
        <div className="text-sm text-gray-600">
          {selectedLines.size > 0 && `${selectedLines.size} line${selectedLines.size > 1 ? 's' : ''} selected`}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-lg font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded">
          <div className="text-lg font-bold text-gray-500">{stats.planned}</div>
          <div className="text-xs text-gray-600">Planned</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded">
          <div className="text-lg font-bold text-yellow-600">{stats.inProgress}</div>
          <div className="text-xs text-gray-600">In Progress</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded">
          <div className="text-lg font-bold text-green-600">{stats.completed}</div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded">
          <div className="text-lg font-bold text-blue-600">{stats.lineComplete}</div>
          <div className="text-xs text-gray-600">Line Complete</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded">
          <div className="text-lg font-bold text-red-600">{stats.missingPhotos}</div>
          <div className="text-xs text-gray-600">Missing Photos</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded">
          <div className="text-lg font-bold text-orange-600">{stats.missingITP}</div>
          <div className="text-xs text-gray-600">Missing ITP</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="all">All Lines ({stats.total})</option>
            <option value="planned">Planned ({stats.planned})</option>
            <option value="in-progress">In Progress ({stats.inProgress})</option>
            <option value="completed">Completed ({stats.completed})</option>
            <option value="line-complete">Line Complete ({stats.lineComplete})</option>
            <option value="missing-photos">Missing Photos ({stats.missingPhotos})</option>
            <option value="missing-itp">Missing ITP ({stats.missingITP})</option>
          </select>
        </div>

        {/* Select All */}
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          {selectedLines.size === form4Data.length ? (
            <CheckSquare className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          {selectedLines.size === form4Data.length ? 'Deselect All' : 'Select All'}
        </button>

        {/* Bulk Action */}
        {selectedLines.size > 0 && (
          <>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Select Action...</option>
              <optgroup label="Status Updates">
                <option value="mark-planned">Mark as Planned</option>
                <option value="mark-in-progress">Mark as In Progress</option>
                <option value="mark-completed">Mark as Completed</option>
                <option value="line-complete">Mark Line Complete</option>
              </optgroup>
              <optgroup label="QA Updates">
                <option value="photos-received">Mark Photos Received</option>
                <option value="photos-reviewed">Mark Photos Reviewed</option>
                <option value="itp-received">Mark ITP Received</option>
              </optgroup>
            </select>

            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || isProcessing}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Apply to ${selectedLines.size} line${selectedLines.size > 1 ? 's' : ''}`}
            </button>
          </>
        )}

        {/* Export Selected */}
        {selectedLines.size > 0 && (
          <button
            onClick={() => onBulkExport(Array.from(selectedLines))}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export Selected
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="border-t pt-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const plannedLines = form4Data.filter(e => e.status === 'planned').map(e => e.id);
              setSelectedLines(new Set(plannedLines));
              setBulkAction('mark-in-progress');
            }}
            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200"
          >
            Start All Planned ({stats.planned})
          </button>
          
          <button
            onClick={() => {
              const completedLines = form4Data.filter(e => e.status === 'completed' && !e.line_complete).map(e => e.id);
              setSelectedLines(new Set(completedLines));
              setBulkAction('line-complete');
            }}
            className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
          >
            Complete All Finished ({form4Data.filter(e => e.status === 'completed' && !e.line_complete).length})
          </button>
          
          <button
            onClick={() => {
              const missingPhotos = form4Data.filter(e => !e.photos_received).map(e => e.id);
              setSelectedLines(new Set(missingPhotos));
              setBulkAction('photos-received');
            }}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
          >
            Mark Photos Received ({stats.missingPhotos})
          </button>
        </div>
      </div>

      {/* Selected Lines Preview */}
      {selectedLines.size > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-900 mb-2">
            Selected Lines ({selectedLines.size}):
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.from(selectedLines).slice(0, 20).map(lineId => {
              const line = form4Data.find(e => e.id === lineId);
              return line ? (
                <span
                  key={lineId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs"
                >
                  Line {line.line_no}
                  <button
                    onClick={() => handleSelectLine(lineId)}
                    className="hover:bg-blue-300 rounded"
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
            {selectedLines.size > 20 && (
              <span className="px-2 py-1 text-blue-600 text-xs">
                +{selectedLines.size - 20} more...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;