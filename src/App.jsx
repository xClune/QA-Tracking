import React, { useState } from 'react';
import ProjectSelector from './components/ProjectSelector';
import Dashboard from './components/Dashboard';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [projects, setProjects] = useLocalStorage('qra-projects', []);
  const [currentProject, setCurrentProject] = useState(null);

  const createNewProject = (projectName) => {
    const newProject = {
      id: Date.now(),
      name: projectName,
      created: new Date().toLocaleDateString(),
      form4Data: [],
      testingRequirements: []
    };
    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
  };

  const updateProject = (updatedProject) => {
    setCurrentProject(updatedProject);
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const deleteProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
    if (currentProject && currentProject.id === projectId) {
      setCurrentProject(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!currentProject ? (
        <ProjectSelector
          projects={projects}
          onCreateProject={createNewProject}
          onSelectProject={setCurrentProject}
          onDeleteProject={deleteProject}
        />
      ) : (
        <Dashboard
          project={currentProject}
          onUpdateProject={updateProject}
          onBackToProjects={() => setCurrentProject(null)}
        />
      )}
    </div>
  );
}

export default App;