import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DeliveryList } from '../components/deliveries/DeliveryList';
import { DeliveryForm } from '../components/deliveries/DeliveryForm';
import { Delivery } from '../store/slices/deliveriesSlice';

export const DeliveriesPage: React.FC = () => {
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
  };

  const handleRowClick = (delivery: Delivery) => {
    navigate(`/deliveries/${delivery.id}`);
  };

  return (
    <Container fluid className="py-5">
      <DeliveryList
        onCreateClick={handleCreateClick}
        onRowClick={handleRowClick}
      />

      <DeliveryForm
        show={showCreateForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </Container>
  );
};

export default DeliveriesPage;
