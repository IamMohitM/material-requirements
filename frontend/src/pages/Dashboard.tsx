import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';

function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const quickActions = [
    {
      title: 'Create Request',
      description: 'Start a new material request for your project.',
      cta: 'Create',
      to: '/requests?create=1',
    },
    {
      title: 'View Requests',
      description: 'Review submitted requests and track status.',
      cta: 'Open',
      to: '/requests',
    },
    {
      title: 'Manage Vendors',
      description: 'Update vendor records and rate history.',
      cta: 'Manage',
      to: '/vendors',
    },
    {
      title: 'Track Deliveries',
      description: 'Log deliveries and track partial receipts.',
      cta: 'Track',
      to: '/deliveries',
    },
    {
      title: 'Manage Invoices',
      description: 'Review invoices and matching status.',
      cta: 'Review',
      to: '/invoices',
    },
  ];

  return (
    <Container className="container-main">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name}!</p>
      </div>

      <Row>
        <Col md={3} sm={6} className="mb-4">
          <Card>
            <Card.Body>
              <h5>Total Requests</h5>
              <h2>12</h2>
              <small className="text-muted">This month</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-4">
          <Card>
            <Card.Body>
              <h5>Pending Approvals</h5>
              <h2>3</h2>
              <small className="text-muted">Awaiting action</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-4">
          <Card>
            <Card.Body>
              <h5>Active POs</h5>
              <h2>8</h2>
              <small className="text-muted">In progress</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6} className="mb-4">
          <Card>
            <Card.Body>
              <h5>Vendors</h5>
              <h2>24</h2>
              <small className="text-muted">Active suppliers</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="mt-4">
        <Card className="quick-actions-card">
          <Card.Header className="quick-actions-header">
            <Card.Title className="mb-0">Quick Actions</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              {quickActions.map((action) => (
                <Col key={action.title} xs={12} sm={6} lg={4}>
                  <Card className="quick-action-tile h-100">
                    <Card.Body>
                      <div className="quick-action-title">{action.title}</div>
                      <div className="quick-action-description">{action.description}</div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(action.to)}
                      >
                        {action.cta}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default Dashboard;
