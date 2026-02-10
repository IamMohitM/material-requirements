import { useEffect, useState } from 'react';
import { Table, Button, Badge, Form, Card, Pagination, Spinner, Modal } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchProjects, searchProjects } from '../../store/slices/projectsSlice';
import { Project } from '../../services/projectsApi';

interface ProjectListProps {
  onCreateClick: () => void;
  onEditClick: (project: Project) => void;
  onDeleteClick: (project: Project) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  onCreateClick,
  onEditClick,
  onDeleteClick,
}) => {
  const dispatch = useAppDispatch();
  const { projects, isLoading, error, page, pageSize, total } = useAppSelector(
    (state) => state.projects
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  useEffect(() => {
    if (searchTerm.trim()) {
      dispatch(searchProjects(searchTerm));
    } else {
      dispatch(fetchProjects({ page, pageSize }));
    }
  }, [dispatch, searchTerm, page, pageSize]);

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      onDeleteClick(projectToDelete);
      setShowDeleteModal(false);
      setProjectToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      planning: 'info',
      active: 'success',
      paused: 'warning',
      complete: 'dark',
    };
    return (
      <Badge bg={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalPages = Math.ceil(total / pageSize) || 1;
  const paginationItems = [];

  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(
      <Pagination.Item key={i} active={i === page} onClick={() => {}}>
        {i}
      </Pagination.Item>
    );
  }

  return (
    <>
      <div className="project-list">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Projects</h2>
          <Button variant="primary" onClick={onCreateClick}>
            + Create Project
          </Button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <Card className="mb-4">
          <Card.Body>
            <h5 className="mb-3">Search</h5>
            <Form.Group>
              <Form.Control
                placeholder="Search projects by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Form.Group>
          </Card.Body>
        </Card>

        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : projects.length === 0 ? (
          <div className="alert alert-info">No projects found.</div>
        ) : (
          <>
            <Card>
              <Table hover responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th style={{ width: '150px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td className="fw-bold">{project.name}</td>
                      <td>{project.description || '-'}</td>
                      <td>{formatDate(project.start_date)}</td>
                      <td>{project.end_date ? formatDate(project.end_date) : '-'}</td>
                      <td>{formatCurrency(project.budget)}</td>
                      <td>{getStatusBadge(project.status)}</td>
                      <td>
                        <Button
                          variant="sm"
                          className="btn-sm"
                          onClick={() => onEditClick(project)}
                          title="Edit"
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="ms-2 btn-sm"
                          onClick={() => handleDeleteClick(project)}
                          title="Delete"
                        >
                          🗑️
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>

            {totalPages > 1 && (
              <Pagination className="mt-3">
                {paginationItems}
              </Pagination>
            )}
          </>
        )}
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the project <strong>{projectToDelete?.name}</strong>?
          <br />
          <small className="text-muted">This action cannot be undone.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
