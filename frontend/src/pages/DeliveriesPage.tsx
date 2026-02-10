import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { DeliveryList, DeliveryForm, DeliveryDetail } from '../components/deliveries';
import { Delivery } from '../store/slices/deliveriesSlice';

export const DeliveriesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateClick = () => {
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  const handleFormSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleRowClick = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
  };

  const handleDetailClose = () => {
    setSelectedDelivery(null);
  };

  const handleDetailUpdate = () => {
    setSelectedDelivery(null);
    setRefreshKey((prev) => prev + 1);
  };

  if (selectedDelivery) {
    return (
      <Container className="py-4">
        <DeliveryDetail
          deliveryId={selectedDelivery.id}
          onClose={handleDetailClose}
          onUpdate={handleDetailUpdate}
        />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <DeliveryList
        key={refreshKey}
        onCreateClick={handleCreateClick}
        onRowClick={handleRowClick}
      />

      <DeliveryForm
        show={showForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </Container>
  );
};
