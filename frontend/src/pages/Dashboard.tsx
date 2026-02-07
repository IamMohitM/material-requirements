import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';

function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);

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
        <Card>
          <Card.Header>
            <Card.Title className="mb-0">Quick Actions</Card.Title>
          </Card.Header>
          <Card.Body>
            <Button variant="primary" className="me-2 mb-2">
              Create Request
            </Button>
            <Button variant="outline-primary" className="me-2 mb-2">
              View Requests
            </Button>
            <Button variant="outline-primary" className="me-2 mb-2">
              Manage Vendors
            </Button>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}

export default Dashboard;
