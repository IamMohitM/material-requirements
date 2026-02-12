import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { InvoiceList, InvoiceForm, InvoiceDetail } from '../components/invoices';
import { Invoice } from '../store/slices/invoicesSlice';

export const InvoicesPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateClick = () => {
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleDetailClose = () => {
    setSelectedInvoice(null);
  };

  const handleDetailUpdate = () => {
    setSelectedInvoice(null);
    setRefreshKey((prev) => prev + 1);
  };

  if (selectedInvoice) {
    return (
      <Container className="py-4">
        <InvoiceDetail
          invoiceId={selectedInvoice.id}
          onClose={handleDetailClose}
          onUpdate={handleDetailUpdate}
        />
      </Container>
    );
  }

  return (
    <Container fluid className="py-5">
      <InvoiceList
        key={refreshKey}
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
