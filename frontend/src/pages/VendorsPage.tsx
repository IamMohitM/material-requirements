import React from 'react';
import { Container, Button } from 'react-bootstrap';

function VendorsPage() {
  return (
    <Container className="container-main">
      <div className="page-header">
        <h1>Vendor Management</h1>
        <p>Manage vendor information and ratings</p>
      </div>
      <Button variant="primary" className="mb-3">
        Add New Vendor
      </Button>
      {/* TODO: Implement vendors list */}
      <p>Vendors list coming soon...</p>
    </Container>
  );
}

export default VendorsPage;
