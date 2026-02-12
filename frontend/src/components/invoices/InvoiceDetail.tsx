import { useEffect, useState } from 'react';
import { Card, Button, Badge, Row, Col, Alert, Spinner, Table, Form, Modal } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchInvoiceDetail, approveInvoice, rejectInvoice } from '../../store/slices/invoicesSlice';

interface InvoiceDetailProps {
  invoiceId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoiceId, onClose, onUpdate }) => {
  const dispatch = useAppDispatch();
  const { detail, isLoading, error } = useAppSelector((state) => state.invoices);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      dispatch(fetchInvoiceDetail(invoiceId));
    }
  }, [dispatch, invoiceId]);

  const handleApprove = async () => {
    if (!detail) return;
    try {
      await dispatch(approveInvoice({ id: detail.id, notes: approvalNotes })).unwrap();
      setShowApprovalModal(false);
      setApprovalNotes('');
      onUpdate();
    } catch (err) {
      console.error('Failed to approve invoice:', err);
    }
  };

  const handleReject = async () => {
    if (!detail) return;
    try {
      await dispatch(rejectInvoice({ id: detail.id, reason: rejectReason })).unwrap();
      setShowRejectModal(false);
      setRejectReason('');
      onUpdate();
    } catch (err) {
      console.error('Failed to reject invoice:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      SUBMITTED: 'info',
      APPROVED: 'success',
      REJECTED: 'danger',
    };
    return (
      <Badge bg={variants[status] || 'secondary'} className="fs-6">
        {status}
      </Badge>
    );
  };

  const getMatchingBadge = (status: string) => {
    const variants: Record<string, string> = {
      FULLY_MATCHED: 'success',
      PARTIAL_MATCHED: 'warning',
      MISMATCHED: 'danger',
      UNMATCHED: 'secondary',
      CRITICAL_ISSUE: 'danger',
    };
    return (
      <Badge bg={variants[status] || 'secondary'} className="fs-6">
        {status}
      </Badge>
    );
  };

  const getMatchStatusColor = (status: string) => {
    if (status === 'MATCHED') return 'success';
    if (status === 'WARNING') return 'warning';
    return 'danger';
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Loading invoice detail...</p>
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
          <p className="text-muted">Invoice not found</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="invoice-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Invoice #{detail.invoice_number}</h2>
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
              <small className="text-muted">Matching Status</small>
              <div className="mt-2">{getMatchingBadge(detail.matching_status)}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-light">
            <Card.Body>
              <small className="text-muted">Invoice Date</small>
              <div className="mt-2">
                <strong>{new Date(detail.invoice_date).toLocaleDateString()}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-light">
            <Card.Body>
              <small className="text-muted">Total Amount</small>
              <div className="mt-2">
                <strong>${Number(detail.total_amount).toFixed(2)}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header>
          <Card.Title className="mb-0">Invoice Details</Card.Title>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <div className="mb-3">
                <strong>Vendor ID:</strong>
                <p className="text-muted">{detail.vendor_id}</p>
              </div>
              <div className="mb-3">
                <strong>Invoice Date:</strong>
                <p className="text-muted">{new Date(detail.invoice_date).toLocaleDateString()}</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <strong>Due Date:</strong>
                <p className="text-muted">{new Date(detail.due_date).toLocaleDateString()}</p>
              </div>
              <div className="mb-3">
                <strong>Total Amount:</strong>
                <p className="text-muted">${Number(detail.total_amount).toFixed(2)}</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <Card.Title className="mb-0">Invoice Line Items</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Material ID</th>
                  <th>Material Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Price</th>
                  <th>Brand Invoiced</th>
                </tr>
              </thead>
              <tbody>
                {detail.line_items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.material_id}</td>
                    <td>{item.material_name}</td>
                    <td>{item.quantity}</td>
                    <td>${Number(item.unit_price).toFixed(2)}</td>
                    <td>${Number(item.total_price).toFixed(2)}</td>
                    <td>{item.brand_invoiced || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {detail.match_analysis && (
        <Card className="mb-4">
          <Card.Header>
            <Card.Title className="mb-0">3-Way Matching Analysis (PO-Delivery-Invoice)</Card.Title>
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Card className={`bg-light border-${getMatchStatusColor(detail.match_analysis.quantity_match.status)}`}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Quantity Match</strong>
                      <Badge bg={getMatchStatusColor(detail.match_analysis.quantity_match.status)}>
                        {detail.match_analysis.quantity_match.status}
                      </Badge>
                    </div>
                    <small className="text-muted">
                      Ordered: {detail.match_analysis.quantity_match.ordered} | Delivered:{' '}
                      {detail.match_analysis.quantity_match.delivered} | Invoiced:{' '}
                      {detail.match_analysis.quantity_match.invoiced}
                    </small>
                    <p className="mb-0 mt-2">{detail.match_analysis.quantity_match.message}</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className={`bg-light border-${getMatchStatusColor(detail.match_analysis.price_match.status)}`}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Price Match</strong>
                      <Badge bg={getMatchStatusColor(detail.match_analysis.price_match.status)}>
                        {detail.match_analysis.price_match.status}
                      </Badge>
                    </div>
                    <small className="text-muted">
                      PO: ${Number(detail.match_analysis.price_match.po_price).toFixed(2)} | Invoice: $
                      {Number(detail.match_analysis.price_match.invoice_price).toFixed(2)} | Variance:{' '}
                      {detail.match_analysis.price_match.variance_percent.toFixed(2)}%
                    </small>
                    <p className="mb-0 mt-2">{detail.match_analysis.price_match.message}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Card className={`bg-light border-${getMatchStatusColor(detail.match_analysis.brand_match.status)}`}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Brand Match</strong>
                      <Badge bg={getMatchStatusColor(detail.match_analysis.brand_match.status)}>
                        {detail.match_analysis.brand_match.status}
                      </Badge>
                    </div>
                    <small className="text-muted">
                      Ordered: {detail.match_analysis.brand_match.ordered || '-'} | Delivered:{' '}
                      {detail.match_analysis.brand_match.delivered || '-'} | Invoiced:{' '}
                      {detail.match_analysis.brand_match.invoiced || '-'}
                    </small>
                    <p className="mb-0 mt-2">{detail.match_analysis.brand_match.message}</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className={`bg-light border-${getMatchStatusColor(detail.match_analysis.timing_match.status)}`}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Timing Match</strong>
                      <Badge bg={getMatchStatusColor(detail.match_analysis.timing_match.status)}>
                        {detail.match_analysis.timing_match.status}
                      </Badge>
                    </div>
                    <small className="text-muted">
                      Delivery: {new Date(detail.match_analysis.timing_match.delivery_date).toLocaleDateString()} |
                      Invoice: {new Date(detail.match_analysis.timing_match.invoice_date).toLocaleDateString()}
                    </small>
                    <p className="mb-0 mt-2">{detail.match_analysis.timing_match.message}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Alert variant={detail.match_analysis.overall_status === 'FULLY_MATCHED' ? 'success' : 'warning'}>
              <strong>Overall Match Status:</strong> {detail.match_analysis.overall_status}
              {detail.match_analysis.discrepancies > 0 && ` (${detail.match_analysis.discrepancies} discrepancies)`}
            </Alert>
          </Card.Body>
        </Card>
      )}

      {detail.status === 'SUBMITTED' && (
        <div className="d-flex gap-2">
          <Button variant="success" onClick={() => setShowApprovalModal(true)} size="lg">
            Approve Invoice
          </Button>
          <Button variant="danger" onClick={() => setShowRejectModal(true)} size="lg">
            Reject Invoice
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      )}

      {detail.status === 'APPROVED' && (
        <Alert variant="success">
          <strong>Invoice Approved</strong>
          {detail.approved_at && ` on ${new Date(detail.approved_at).toLocaleDateString()}`}
          {detail.approval_notes && ` - ${detail.approval_notes}`}
        </Alert>
      )}

      {detail.status === 'REJECTED' && (
        <Alert variant="danger">
          <strong>Invoice Rejected</strong>
        </Alert>
      )}

      {/* Approval Modal */}
      <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Approve Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Approval Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter any approval notes..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleApprove}>
            Approve
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Rejection Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Rejection Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={!rejectReason.trim()}>
            Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
