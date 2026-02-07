import React from 'react';
import { Container, Button } from 'react-bootstrap';

function RequestsPage() {
  return (
    <Container className="container-main">
      <div className="page-header">
        <h1>Material Requests</h1>
        <p>Manage material requests for your projects</p>
      </div>
      <Button variant="primary" className="mb-3">
        Create New Request
      </Button>
      {/* TODO: Implement requests list */}
      <p>Requests list coming soon...</p>
    </Container>
  );
}

export default RequestsPage;
