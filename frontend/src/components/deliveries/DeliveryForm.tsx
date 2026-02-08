import { useState } from 'react';
import { Form, Button, Modal, Alert, Row, Col, Card } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createDelivery } from '../../store/slices/deliveriesSlice';
import { DeliveryLineItem } from '../../store/slices/deliveriesSlice';
import './DeliveryForm.css';

export interface DeliveryFormProps {
  show: boolean;
  poId?: string;
  poLineItems?: Array<{
    id: string;
    material_id: string;
    material_name: string;
    quantity: number;
    unit_price: number;
  }>;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  show,
  poId,
  poLineItems = [],
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.deliveries);

  const [formData, setFormData] = useState({
    po_id: poId || '',
    delivery_date: new Date().toISOString().split('T')[0],
    received_by_id: '',
    delivery_location: '',
    line_items: poLineItems.map((item) => ({
      material_id: item.material_id,
      material_name: item.material_name,
      quantity_ordered: item.quantity,
      good_qty: 0,
      damaged_qty: 0,
      unit_price: item.unit_price,
      brand_ordered: '',
      brand_received: '',
      damage_notes: '',
    })) as DeliveryLineItem[],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleLineItemChange = (index: number, field: string, value: any) => {
    const newLineItems = [...formData.line_items];
    const item = newLineItems[index];

    if (field === 'good_qty' || field === 'damaged_qty') {
      const newValue = parseInt(value) || 0;
      item[field as keyof DeliveryLineItem] = newValue as never;

      // Validate cumulative quantity
      const totalReceived = (field === 'good_qty' ? newValue : item.good_qty) +
                           (field === 'damaged_qty' ? newValue : item.damaged_qty);
      if (totalReceived > item.quantity_ordered) {
        setValidationErrors((prev) => ({
          ...prev,
          [`line_${index}_qty`]: `Cannot receive more than ${item.quantity_ordered} units`,
        }));
      } else {
        setValidationErrors((prev) => {
          const { [`line_${index}_qty`]: _, ...rest } = prev;
          return rest;
        });
      }
    } else {
      item[field as keyof DeliveryLineItem] = value as never;
    }

    setFormData({ ...formData, line_items: newLineItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!formData.po_id) errors.po_id = 'PO is required';
    if (!formData.delivery_date) errors.delivery_date = 'Delivery date is required';
    if (!formData.received_by_id) errors.received_by_id = 'Received by is required';
    if (formData.line_items.length === 0) errors.line_items = 'At least one line item required';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await dispatch(
        createDelivery({
          po_id: formData.po_id,
          delivery_date: formData.delivery_date,
          received_by_id: formData.received_by_id,
          delivery_location: formData.delivery_location,
          status: 'PENDING',
          quality_score: 0,
          line_items: formData.line_items,
        })
      ).unwrap();

      setFormData({
        po_id: '',
        delivery_date: new Date().toISOString().split('T')[0],
        received_by_id: '',
        delivery_location: '',
        line_items: [],
      });
      setValidationErrors({});
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create delivery:', err);
    }
  };

  const calculateQualityScore = (item: DeliveryLineItem): number => {
    const total = item.good_qty + item.damaged_qty;
    if (total === 0) return 0;
    return Math.round((item.good_qty / total) * 100);
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create Delivery Receipt</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Form.Group as={Col} md="6">
              <Form.Label>PO Number *</Form.Label>
              <Form.Control
                disabled
                value={formData.po_id}
                isInvalid={!!validationErrors.po_id}
              />
            </Form.Group>

            <Form.Group as={Col} md="6">
              <Form.Label>Delivery Date *</Form.Label>
              <Form.Control
                type="date"
                value={formData.delivery_date}
                onChange={(e) =>
                  setFormData({ ...formData, delivery_date: e.target.value })
                }
                isInvalid={!!validationErrors.delivery_date}
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="6">
              <Form.Label>Received By (User ID) *</Form.Label>
              <Form.Control
                placeholder="Enter user ID"
                value={formData.received_by_id}
                onChange={(e) =>
                  setFormData({ ...formData, received_by_id: e.target.value })
                }
                isInvalid={!!validationErrors.received_by_id}
              />
            </Form.Group>

            <Form.Group as={Col} md="6">
              <Form.Label>Delivery Location</Form.Label>
              <Form.Control
                placeholder="e.g., Warehouse A, Site Zone 1"
                value={formData.delivery_location}
                onChange={(e) =>
                  setFormData({ ...formData, delivery_location: e.target.value })
                }
              />
            </Form.Group>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Line Items *</Form.Label>
            <Card>
              <Card.Body>
                {formData.line_items.length === 0 ? (
                  <p className="text-muted">No items to receive</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Material</th>
                          <th>Ordered</th>
                          <th>Good Qty</th>
                          <th>Damaged Qty</th>
                          <th>Quality %</th>
                          <th>Brand Received</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.line_items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.material_name}</td>
                            <td>{item.quantity_ordered}</td>
                            <td>
                              <Form.Control
                                type="number"
                                min="0"
                                max={item.quantity_ordered}
                                size="sm"
                                value={item.good_qty}
                                onChange={(e) =>
                                  handleLineItemChange(index, 'good_qty', e.target.value)
                                }
                                isInvalid={!!validationErrors[`line_${index}_qty`]}
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                min="0"
                                max={item.quantity_ordered}
                                size="sm"
                                value={item.damaged_qty}
                                onChange={(e) =>
                                  handleLineItemChange(index, 'damaged_qty', e.target.value)
                                }
                                isInvalid={!!validationErrors[`line_${index}_qty`]}
                              />
                            </td>
                            <td>
                              <strong>{calculateQualityScore(item)}%</strong>
                            </td>
                            <td>
                              <Form.Control
                                size="sm"
                                placeholder="Brand"
                                value={item.brand_received || ''}
                                onChange={(e) =>
                                  handleLineItemChange(
                                    index,
                                    'brand_received',
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
            </Card>
            {validationErrors.line_items && (
              <Form.Text className="text-danger">{validationErrors.line_items}</Form.Text>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Delivery'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
