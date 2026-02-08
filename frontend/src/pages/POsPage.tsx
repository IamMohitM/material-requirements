import { Container, Button } from 'react-bootstrap';

function POsPage() {
  return (
    <Container className="container-main">
      <div className="page-header">
        <h1>Purchase Orders</h1>
        <p>Manage purchase orders and approvals</p>
      </div>
      <Button variant="primary" className="mb-3">
        Create New PO
      </Button>
      {/* TODO: Implement POs list */}
      <p>Purchase orders list coming soon...</p>
    </Container>
  );
}

export default POsPage;
