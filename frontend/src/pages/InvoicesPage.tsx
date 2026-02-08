import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { InvoiceList } from '../components/invoices/InvoiceList';
import { InvoiceForm } from '../components/invoices/InvoiceForm';
import { Invoice } from '../store/slices/invoicesSlice';

export const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateClick = () => {
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    // Optionally refresh the list here
  };

  const handleRowClick = (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}`);
  };

  return (
    <Container fluid className="py-5">
      <InvoiceList
        onCreateClick={handleCreateClick}
        onRowClick={handleRowClick}
      />

      <InvoiceForm
        show={showCreateForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </Container>
  );
};

export default InvoicesPage;
