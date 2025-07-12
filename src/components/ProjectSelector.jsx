import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const ProjectSelector = ({ projects, onCreateProject, onSelectProject, onDeleteProject }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectName, setProjectName] = useState('');

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (projectName.trim()) {
      onCreateProject(projectName.trim());
      setProjectName('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            QRA Quality Assurance Tracker
          </h1>
          <p className="text-lg text-gray-600">
            Track quality assurance for Queensland road construction projects funded by QRA
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {!showCreateForm ? (
            <div className="text-center">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-3 mx-auto text-lg"
              >
                <Plus className="w-6 h-6" />
                Create New Project
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateProject} className="max-w-md mx-auto">
              <div className="mb-4">
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Doomadgee East Road Package 4"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setProjectName('');
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {projects.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Existing Projects</h2>
              <div className="grid gap-4">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <button
                      onClick={() => onSelectProject(project)}
                      className="flex-1 text-left"
                    >
                      <div className="font-semibold text-lg text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-600">
                        Created: {project.created} • {project.form4Data?.length || 0} treatments • {project.testingRequirements?.length || 0} tests
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
                          onDeleteProject(project.id);
                        }
                      }}
                      className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectSelector;