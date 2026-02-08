import { useState } from 'react';
import { Form, Button, Modal, Alert, Row, Col, Card } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { submitInvoice } from '../../store/slices/invoicesSlice';
import { InvoiceLineItem } from '../../store/slices/invoicesSlice';

interface InvoiceFormProps {
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
  onSuccess: (analysis: any) => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  show,
  poId,
  poLineItems = [],
  onClose,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.invoices);

  const [formData, setFormData] = useState({
    po_id: poId || '',
    vendor_id: '',
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total_amount: 0,
    line_items: poLineItems.map((item) => ({
      material_id: item.material_id,
      material_name: item.material_name,
      quantity: 0,
      unit_price: item.unit_price,
      total_price: 0,
      brand_invoiced: '',
    })) as InvoiceLineItem[],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleLineItemChange = (index: number, field: string, value: any) => {
    const newLineItems = [...formData.line_items];
    const item = newLineItems[index];

    if (field === 'quantity') {
      item.quantity = parseFloat(value) || 0;
      item.total_price = item.quantity * item.unit_price;
    } else if (field === 'unit_price') {
      item.unit_price = parseFloat(value) || 0;
      item.total_price = item.quantity * item.unit_price;
    } else if (field === 'brand_invoiced') {
      item.brand_invoiced = value;
    }

    const newTotal = newLineItems.reduce((sum, li) => sum + li.total_price, 0);
    setFormData({ ...formData, line_items: newLineItems, total_amount: newTotal });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!formData.po_id) errors.po_id = 'PO is required';
    if (!formData.vendor_id) errors.vendor_id = 'Vendor is required';
    if (!formData.invoice_number) errors.invoice_number = 'Invoice number is required';
    if (!formData.invoice_date) errors.invoice_date = 'Invoice date is required';
    if (!formData.due_date) errors.due_date = 'Due date is required';
    if (formData.line_items.length === 0) errors.line_items = 'At least one line item required';
    if (formData.total_amount === 0) errors.total_amount = 'Total amount must be greater than 0';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const result = await dispatch(
        submitInvoice({
          po_id: formData.po_id,
          vendor_id: formData.vendor_id,
          invoice_number: formData.invoice_number,
          invoice_date: formData.invoice_date,
          due_date: formData.due_date,
          total_amount: formData.total_amount,
          line_items: formData.line_items,
        })
      ).unwrap();

      setFormData({
        po_id: '',
        vendor_id: '',
        invoice_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        total_amount: 0,
        line_items: [],
      });
      setValidationErrors({});
      onSuccess(result.match_analysis);
      onClose();
    } catch (err) {
      console.error('Failed to submit invoice:', err);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Submit Invoice</Modal.Title>
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
              <Form.Label>Vendor ID *</Form.Label>
              <Form.Control
                placeholder="Enter vendor ID"
                value={formData.vendor_id}
                onChange={(e) =>
                  setFormData({ ...formData, vendor_id: e.target.value })
                }
                isInvalid={!!validationErrors.vendor_id}
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="6">
              <Form.Label>Invoice Number *</Form.Label>
              <Form.Control
                placeholder="e.g., INV-2026-001"
                value={formData.invoice_number}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_number: e.target.value })
                }
                isInvalid={!!validationErrors.invoice_number}
              />
            </Form.Group>

            <Form.Group as={Col} md="6">
              <Form.Label>Invoice Date *</Form.Label>
              <Form.Control
                type="date"
                value={formData.invoice_date}
                onChange={(e) =>
                  setFormData({ ...formData, invoice_date: e.target.value })
                }
                isInvalid={!!validationErrors.invoice_date}
              />
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="6">
              <Form.Label>Due Date *</Form.Label>
              <Form.Control
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                isInvalid={!!validationErrors.due_date}
              />
            </Form.Group>

            <Form.Group as={Col} md="6">
              <Form.Label>Total Amount</Form.Label>
              <Form.Control
                disabled
                value={`$${formData.total_amount.toFixed(2)}`}
              />
            </Form.Group>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Line Items *</Form.Label>
            <Card>
              <Card.Body>
                {formData.line_items.length === 0 ? (
                  <p className="text-muted">No items to invoice</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Material</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th>Total</th>
                          <th>Brand</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.line_items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.material_name}</td>
                            <td>
                              <Form.Control
                                type="number"
                                min="0"
                                size="sm"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleLineItemChange(index, 'quantity', e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <Form.Control
                                type="number"
                                min="0"
                                step="0.01"
                                size="sm"
                                value={item.unit_price}
                                onChange={(e) =>
                                  handleLineItemChange(index, 'unit_price', e.target.value)
                                }
                              />
                            </td>
                            <td className="font-weight-bold">
                              ${item.total_price.toFixed(2)}
                            </td>
                            <td>
                              <Form.Control
                                size="sm"
                                placeholder="Brand"
                                value={item.brand_invoiced || ''}
                                onChange={(e) =>
                                  handleLineItemChange(
                                    index,
                                    'brand_invoiced',
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
          {isLoading ? 'Submitting...' : 'Submit Invoice'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
