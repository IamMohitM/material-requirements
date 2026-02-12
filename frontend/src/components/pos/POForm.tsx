import { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner, Table, ProgressBar } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createPO, fetchPOs } from '../../store/slices/posSlice';
import { fetchRequests } from '../../store/slices/requestsSlice';
import { POLineItemRow } from './POLineItemRow';
import { LineItem } from '../../services/posApi';
import './POForm.css';

interface POFormProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const POForm: React.FC<POFormProps> = ({ show, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.pos);
  const { list: requests } = useAppSelector((state) => state.requests);
  const { projects } = useAppSelector((state) => state.projects);
  const { pagination } = useAppSelector((state) => state.pos);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [requiredDeliveryDate, setRequiredDeliveryDate] = useState('');
  const [gstPercent, setGstPercent] = useState(18);
  const [excludeGST, setExcludeGST] = useState(false);
  const { list: vendors } = useAppSelector((state) => state.vendors);

  // Fetch data on mount
  useEffect(() => {
    if (show) {
      dispatch(fetchRequests({ page: 1, pageSize: 100, filters: { status: 'approved' } }));
    }
  }, [show, dispatch]);

  // Populate line items when request is selected
  useEffect(() => {
    if (selectedRequest && selectedRequest.materials) {
      const items: LineItem[] = selectedRequest.materials.map((mat: any) => ({
        material_id: mat.material_id,
        material_name: mat.material_name,
        quantity: mat.quantity,
        unit: mat.unit,
        unit_price: 0,
        discount_percent: 0,
        gst_amount: 0,
        total: 0,
      }));
      setLineItems(items);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRequest]);

  const handleRequestSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const request = requests.find((r) => r.id === e.target.value);
    setSelectedRequest(request || null);
    setCurrentStep(2);
  };

  const handleLineItemUpdate = (index: number, updatedItem: LineItem) => {
    const updated = [...lineItems];
    updated[index] = updatedItem;
    setLineItems(updated);
  };

  const handleSubmit = async () => {
    if (!selectedRequest || !selectedVendor || lineItems.length === 0) {
      alert('Please select a request, vendor, and edit line items before submitting');
      return;
    }

    const payload = {
      request_id: selectedRequest.id,
      vendor_id: selectedVendor,
      quote_id: null, // No quote required for direct PO creation
      special_instructions: specialInstructions.trim() || undefined,
      delivery_address: deliveryAddress.trim() ? { address: deliveryAddress } : undefined,
    };

    try {
      const result = await dispatch(createPO(payload));

      if (result.meta.requestStatus === 'fulfilled') {
        // Reset form
        setCurrentStep(1);
        setSelectedRequest(null);
        setSelectedVendor('');
        setLineItems([]);
        setDeliveryAddress('');
        setSpecialInstructions('');
        setRequiredDeliveryDate('');
        setGstPercent(18);
        setExcludeGST(false);

        // Refresh list
        dispatch(fetchPOs({ page: pagination.page, pageSize: pagination.pageSize }));
        onSuccess();
      }
    } catch (error) {
      // Error is handled by Redux
    }
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || projectId;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="po-step-1">
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold fs-6">Select an Approved Request</Form.Label>
              <Form.Select
                value={selectedRequest?.id || ''}
                onChange={handleRequestSelect}
                className="po-select"
              >
                <option value="">-- Choose a request --</option>
                {requests
                  .filter((r) => r.status === 'approved')
                  .map((request) => (
                    <option key={request.id} value={request.id}>
                      REQ-{request.request_number.slice(-3)} • {getProjectName(request.project_id)} • {request.materials.length} items
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold fs-6">Select a Vendor</Form.Label>
              <Form.Select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="po-select"
              >
                <option value="">-- Choose a vendor --</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {selectedRequest && selectedVendor && (
              <div className="po-request-details">
                <div className="detail-row">
                  <span className="detail-label">📌 Project</span>
                  <span className="detail-value">{getProjectName(selectedRequest.project_id)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🏢 Vendor</span>
                  <span className="detail-value">{vendors.find((v) => v.id === selectedVendor)?.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📊 Materials</span>
                  <span className="detail-value">{selectedRequest.materials.length} items</span>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="po-step-2">
            <div className="po-gst-controls mb-4">
              <div className="row g-2">
                <div className="col-auto">
                  <Form.Group className="mb-0">
                    <Form.Label className="small fw-bold text-secondary">GST Rate</Form.Label>
                    <div className="input-group input-group-sm">
                      <Form.Control
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={gstPercent}
                        onChange={(e) => {
                          const newGst = Math.max(0, Number(e.target.value) || 0);
                          setGstPercent(newGst);
                          const updated = lineItems.map(item => {
                            const subtotal = item.quantity * (item.unit_price * (1 - (item.discount_percent || 0) / 100));
                            const newGstAmount = excludeGST ? 0 : Math.round(subtotal * (newGst / 100) * 100) / 100;
                            const newTotal = Math.round((subtotal + newGstAmount) * 100) / 100;
                            return { ...item, gst_amount: newGstAmount, total: newTotal };
                          });
                          setLineItems(updated);
                        }}
                        disabled={excludeGST}
                        style={{ width: '70px' }}
                      />
                      <span className="input-group-text">%</span>
                    </div>
                  </Form.Group>
                </div>
                <div className="col-auto d-flex align-items-end">
                  <Form.Check
                    type="checkbox"
                    label="No GST"
                    checked={excludeGST}
                    onChange={(e) => {
                      setExcludeGST(e.target.checked);
                      const updated = lineItems.map(item => {
                        const subtotal = item.quantity * (item.unit_price * (1 - (item.discount_percent || 0) / 100));
                        const newGstAmount = e.target.checked ? 0 : Math.round(subtotal * (gstPercent / 100) * 100) / 100;
                        const newTotal = Math.round((subtotal + newGstAmount) * 100) / 100;
                        return { ...item, gst_amount: newGstAmount, total: newTotal };
                      });
                      setLineItems(updated);
                    }}
                    className="mb-0"
                  />
                </div>
              </div>
            </div>

            <div className="table-responsive mb-3">
              <Table hover size="sm" className="po-materials-table">
                <thead>
                  <tr className="table-light">
                    <th>Material</th>
                    <th className="text-end" style={{ width: '70px' }}>Qty</th>
                    <th style={{ width: '60px' }}>Unit</th>
                    <th className="text-end" style={{ width: '90px' }}>Price</th>
                    <th className="text-end" style={{ width: '80px' }}>Discount</th>
                    <th className="text-end" style={{ width: '80px' }}>GST</th>
                    <th className="text-end" style={{ width: '100px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <POLineItemRow
                      key={index}
                      item={item}
                      editable={true}
                      gstPercent={gstPercent}
                      excludeGST={excludeGST}
                      onUpdate={(updated) => handleLineItemUpdate(index, updated)}
                    />
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="po-summary-bar">
              <span className="summary-item">
                <small className="text-muted">Items:</small> <strong>{lineItems.length}</strong>
              </span>
              <span className="summary-divider">•</span>
              <span className="summary-item text-end ms-auto">
                <small className="text-muted">Total:</small>
                <strong className="text-primary ms-2">
                  ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </strong>
              </span>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="po-step-3">
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold fs-6">Delivery Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="e.g., 123 Main Street, Downtown Plaza, Block A, Site Office"
                className="po-textarea"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold fs-6">Required Delivery Date</Form.Label>
              <Form.Control
                type="date"
                value={requiredDeliveryDate}
                onChange={(e) => setRequiredDeliveryDate(e.target.value)}
                className="po-date-input"
              />
              <small className="text-muted d-block mt-1">Optional - helps vendors plan their schedule</small>
            </Form.Group>

            <Form.Group>
              <Form.Label className="fw-bold fs-6">Special Instructions</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g., 'Deliver before 5pm', 'Call before arrival', 'Unload materials at site entrance'"
                className="po-textarea"
              />
              <small className="text-muted d-block mt-1">Optional - any special delivery requirements</small>
            </Form.Group>

            <div className="po-review-summary mt-4 pt-3 border-top">
              <div className="small text-muted mb-2">Order Summary:</div>
              <div className="summary-row">
                <span>Request:</span>
                <strong>{selectedRequest?.request_number}</strong>
              </div>
              <div className="summary-row">
                <span>Materials:</span>
                <strong>{lineItems.length} items</strong>
              </div>
              <div className="summary-row">
                <span>Total Amount:</span>
                <strong className="text-primary">
                  ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </strong>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    'Select Request',
    'Edit Materials & Pricing',
    'Delivery Details'
  ];

  return (
    <Modal show={show} onHide={onClose} size="xl" className="po-form-modal">
      <Modal.Header closeButton className="border-0 pb-2">
        <div className="w-100">
          <Modal.Title className="fs-5 fw-bold mb-3">
            📦 Create Purchase Order
          </Modal.Title>
          <div className="po-progress-container">
            <ProgressBar now={(currentStep / 3) * 100} className="po-progress-bar" />
            <div className="po-step-labels">
              {stepTitles.map((title, idx) => (
                <div
                  key={idx}
                  className={`po-step-label ${idx + 1 === currentStep ? 'active' : ''} ${
                    idx + 1 < currentStep ? 'completed' : ''
                  }`}
                >
                  <span className="step-number">{idx + 1}</span>
                  <span className="step-title">{title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="po-form-body">
        {error && (
          <Alert variant="danger" className="mb-3">
            <strong>Error:</strong> {error}
          </Alert>
        )}
        <div className="po-step-content">
          {renderStepContent()}
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-2">
        <Button variant="outline-secondary" onClick={onClose} size="sm">
          Cancel
        </Button>

        {currentStep > 1 && (
          <Button
            variant="outline-primary"
            onClick={() => setCurrentStep(currentStep - 1)}
            size="sm"
          >
            ← Previous
          </Button>
        )}

        {currentStep < 3 && selectedRequest && selectedVendor && (
          <Button
            variant="primary"
            onClick={() => setCurrentStep(currentStep + 1)}
            size="sm"
          >
            Next →
          </Button>
        )}

        {currentStep === 3 && (
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              '✓ Create PO'
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};
