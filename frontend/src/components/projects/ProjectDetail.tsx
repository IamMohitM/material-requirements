import { Card, Badge, Row, Col, Button } from 'react-bootstrap';
import { Project } from '../../services/projectsApi';

interface ProjectDetailProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onEdit, onDelete }) => {
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
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title className="mb-0">{project.name}</Card.Title>
        <div>
          <Button
            variant="outline-primary"
            size="sm"
            className="me-2"
            onClick={() => onEdit(project)}
          >
            Edit
          </Button>
          <Button variant="outline-danger" size="sm" onClick={() => onDelete(project)}>
            Delete
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Row className="mb-3">
          <Col md={3}>
            <strong>Status:</strong>
            <div>{getStatusBadge(project.status)}</div>
          </Col>
          <Col md={3}>
            <strong>Budget:</strong>
            <div>{formatCurrency(project.budget)}</div>
          </Col>
          <Col md={3}>
            <strong>Start Date:</strong>
            <div>{formatDate(project.start_date)}</div>
          </Col>
          <Col md={3}>
            <strong>End Date:</strong>
            <div>{project.end_date ? formatDate(project.end_date) : '-'}</div>
          </Col>
        </Row>

        {project.description && (
          <Row className="mb-3">
            <Col>
              <strong>Description:</strong>
              <div>{project.description}</div>
            </Col>
          </Row>
        )}

        <Row className="text-muted small">
          <Col md={6}>
            <div>Created: {formatDate(project.created_at)}</div>
          </Col>
          <Col md={6}>
            <div>Updated: {formatDate(project.updated_at)}</div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
