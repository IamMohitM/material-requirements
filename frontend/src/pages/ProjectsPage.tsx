import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useAppDispatch } from '../hooks/redux';
import { fetchProjects, deleteProject } from '../store/slices/projectsSlice';
import { Project } from '../services/projectsApi';
import { ProjectList, ProjectForm, ProjectDetail } from '../components/projects';

export const ProjectsPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProjects({ pageSize: 100 }));
  }, [dispatch]);

  const handleCreateClick = () => {
    setIsEditing(false);
    setSelectedProject(null);
    setShowCreateForm(true);
  };

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setIsEditing(true);
    setShowCreateForm(true);
  };

  const handleDeleteClick = async (project: Project) => {
    setDeleteError(null);

    try {
      const result = await dispatch(deleteProject(project.id));
      if (result.meta.requestStatus === 'fulfilled') {
        setSelectedProject(null);
      } else {
        setDeleteError('Failed to delete project');
      }
    } catch (error: any) {
      setDeleteError(error.message || 'Failed to delete project');
    }
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setSelectedProject(null);
    setIsEditing(false);
  };

  const handleFormSuccess = () => {
    dispatch(fetchProjects({ pageSize: 100 }));
    handleFormClose();
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h1>Projects Management</h1>
        <p className="text-muted">Manage all construction projects and their details</p>
      </div>

      {deleteError && <div className="alert alert-danger">{deleteError}</div>}

      <ProjectList
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {selectedProject && (
        <div className="mt-4">
          <h3>Project Details</h3>
          <ProjectDetail
            project={selectedProject}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </div>
      )}

      <ProjectForm
        show={showCreateForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        initialData={isEditing ? selectedProject : null}
        isEditing={isEditing}
      />
    </Container>
  );
};
