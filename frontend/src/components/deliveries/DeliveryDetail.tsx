import { useEffect } from 'react';
import { Card, Button, Badge, Row, Col, Alert, Spinner, Table } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchDeliveryDetail, completeDelivery } from '../../store/slices/deliveriesSlice';

interface DeliveryDetailProps {
  deliveryId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export const DeliveryDetail: React.FC<DeliveryDetailProps> = ({ deliveryId, onClose, onUpdate }) => {
  const dispatch = useAppDispatch();
  const { detail, isLoading, error } = useAppSelector((state) => state.deliveries);

  useEffect(() => {
    if (deliveryId) {
      dispatch(fetchDeliveryDetail(deliveryId));
    }
  }, [dispatch, deliveryId]);

  const handleCompleteDelivery = async () => {
    if (!detail) return;

    try {
      await dispatch(completeDelivery(detail.id)).unwrap();
      onUpdate();
    } catch (err) {
      console.error('Failed to complete delivery:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: 'secondary',
      PARTIAL: 'warning',
      COMPLETE: 'success',
    };
    return (
      <Badge bg={variants[status] || 'secondary'} className="fs-6">
        {status}
      </Badge>
    );
  };

  const getQualityColor = (score: number) => {
    if (score >= 95) return 'success';
    if (score >= 90) return 'warning';
    return 'danger';
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Loading delivery detail...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (!detail) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <p className="text-muted">Delivery not found</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="delivery-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Delivery #{detail.delivery_number}</h2>
          <p className="text-muted mb-0">PO: {detail.po_id}</p>
        </div>
        <Button variant="secondary" onClick={onClose}>
          Back to List
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="bg-light">
            <Card.Body>
              <small className="text-muted">Status</small>
              <div className="mt-2">{getStatusBadge(detail.status)}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-light">
            <Card.Body>
              <small className="text-muted">Quality Score</small>
              <div className="mt-2">
                <Badge bg={getQualityColor(detail.quality_score)} className="fs-6">
                  {detail.quality_score}%
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-light">
            <Card.Body>
              <small className="text-muted">Delivery Date</small>
              <div className="mt-2">
                <strong>{new Date(detail.delivery_date).toLocaleDateString()}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-light">
            <Card.Body>
              <small className="text-muted">Items Received</small>
              <div className="mt-2">
                <strong>{detail.line_items.length} items</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header>
          <Card.Title className="mb-0">Delivery Details</Card.Title>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <div className="mb-3">
                <strong>Location:</strong>
                <p className="text-muted">{detail.delivery_location || 'Not specified'}</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <strong>Received By:</strong>
                <p className="text-muted">{detail.received_by_id}</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <Card.Title className="mb-0">Received Items</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Material ID</th>
                  <th>Good Qty</th>
                  <th>Damaged Qty</th>
                  <th>Ordered</th>
                  <th>Brand Ordered</th>
                  <th>Brand Received</th>
                  <th>Quality %</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {detail.line_items.map((item, index) => {
                  const qualityScore =
                    item.good_qty + item.damaged_qty === 0
                      ? 0
                      : Math.round(
                          (item.good_qty /
                            (item.good_qty + item.damaged_qty)) *
                            100
                        );

                  return (
                    <tr key={index}>
                      <td>{item.material_id}</td>
                      <td>{item.good_qty}</td>
                      <td>{item.damaged_qty}</td>
                      <td>{item.quantity_ordered}</td>
                      <td>{item.brand_ordered || '-'}</td>
                      <td>{item.brand_received || '-'}</td>
                      <td>
                        <Badge bg={getQualityColor(qualityScore)}>
                          {qualityScore}%
                        </Badge>
                      </td>
                      <td>{item.damage_notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {detail.status === 'PENDING' && (
        <div className="d-flex gap-2">
          <Button variant="success" onClick={handleCompleteDelivery} size="lg">
            Mark as Complete
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};
