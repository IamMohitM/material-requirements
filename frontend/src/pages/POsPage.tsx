import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { POList, POForm, PODetail } from '../components/pos';

function POsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);

  const handleSelectPO = (poId: string) => {
    setSelectedPOId(poId);
  };

  const handleCloseDetail = () => {
    setSelectedPOId(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  if (selectedPOId) {
    return <PODetail poId={selectedPOId} onClose={handleCloseDetail} />;
  }

  return (
    <Container className="container-main py-4">
      <div className="page-header mb-4">
        <h1>Purchase Orders</h1>
        <p>Manage purchase orders and approvals</p>
      </div>

      <POList onSelectPO={handleSelectPO} onCreateNew={() => setShowForm(true)} />

      <POForm show={showForm} onClose={() => setShowForm(false)} onSuccess={handleFormSuccess} />
    </Container>
  );
}

export default POsPage;
