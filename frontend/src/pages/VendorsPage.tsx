import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { VendorList, VendorForm, VendorDetail } from '../components/vendors';
import { Vendor } from '../store/slices/vendorsSlice';

export const VendorsPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleCreateClick = () => {
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
  };

  const handleRowClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowDetail(true);
  };

  const handleDetailClose = () => {
    setShowDetail(false);
    setSelectedVendor(null);
  };

  return (
    <Container fluid className="py-5">
      {showDetail ? (
        <VendorDetail
          vendor={selectedVendor}
          onClose={handleDetailClose}
        />
      ) : (
        <>
          <VendorList
            onCreateClick={handleCreateClick}
            onRowClick={handleRowClick}
          />

          <VendorForm
            show={showCreateForm}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </>
      )}
    </Container>
  );
};

export default VendorsPage;
