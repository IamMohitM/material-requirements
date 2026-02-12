import { useState, useEffect } from 'react';
import { Container, Button, Alert, Spinner, Table, Badge, Modal, Form } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchPODetail, submitPO, approvePO, rejectPO, deletePO, fetchPOs } from '../../store/slices/posSlice';
import { POLineItemRow } from './POLineItemRow';

interface PODetailProps {
  poId: string;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'secondary',
  sent: 'info',
  approved: 'success',
  received: 'primary',
  cancelled: 'danger',
};

const APPROVAL_COLORS: Record<string, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  archived: 'secondary',
};

export const PODetail: React.FC<PODetailProps> = ({ poId, onClose }) => {
  const dispatch = useAppDispatch();
  const { detail: po, isLoading, error } = useAppSelector((state) => state.pos);
  const { user } = useAppSelector((state) => state.auth);
  const { pagination } = useAppSelector((state) => state.pos);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalLimit, setApprovalLimit] = useState(0);
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // Fetch PO detail on mount or when poId changes
  useEffect(() => {
    dispatch(fetchPODetail(poId));
  }, [dispatch, poId]);

  const handleSubmit = async () => {
    const result = await dispatch(submitPO(poId));
    if (result.meta.requestStatus === 'fulfilled') {
      alert('PO submitted for approval');
    }
  };

  const handleApprove = async () => {
    if (approvalLimit <= 0) {
      alert('Please enter your approval limit');
      return;
    }

    const result = await dispatch(
      approvePO({
        id: poId,
        approval_limit: approvalLimit,
        comments: approvalComments.trim() || undefined,
      })
    );

    if (result.meta.requestStatus === 'fulfilled') {
      setShowApproveModal(false);
      setApprovalLimit(0);
      setApprovalComments('');
      alert('PO approved successfully');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    const result = await dispatch(rejectPO({ id: poId, reason: rejectReason }));

    if (result.meta.requestStatus === 'fulfilled') {
      setShowRejectModal(false);
      setRejectReason('');
      alert('PO rejected successfully');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this PO?')) {
      const result = await dispatch(deletePO(poId));
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(fetchPOs({ page: pagination.page, pageSize: pagination.pageSize }));
        onClose();
      }
    }
  };

  const isOwner = po && user?.id === po.created_by;
  const canApprove = po && po.status === 'sent' && po.approval_status === 'pending';
  const canReject = po && po.status === 'sent' && po.approval_status === 'pending';
  const canSubmit = po && po.status === 'draft' && isOwner;
  const canDelete = po && po.status === 'draft' && isOwner;

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" className="me-2" />
        Loading PO details...
      </Container>
    );
  }

  if (!po) {
    return (
      <Container className="py-5">
        <Alert variant="danger">PO not found</Alert>
        <Button variant="outline-secondary" onClick={onClose}>
          Back
        </Button>
      </Container>
    );
  }

  const totalAmount = po.line_items.reduce((sum, item) => sum + item.total, 0);

  return (
    <Container fluid className="py-4">
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>{po.po_number}</h2>
          <p className="text-muted">
            {po.project_name} • {po.vendor_name}
          </p>
        </div>
        <div className="text-end">
          <Badge bg={STATUS_COLORS[po.status] || 'secondary'} className="me-2 mb-2">
            {po.status}
          </Badge>
          <Badge bg={APPROVAL_COLORS[po.approval_status] || 'secondary'} className="mb-2">
            {po.approval_status}
          </Badge>
        </div>
      </div>

      {/* PO Details */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Order Date</h6>
              <p className="card-text">{new Date(po.order_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Required Delivery</h6>
              <p className="card-text">{new Date(po.required_delivery_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Total Amount</h6>
              <p className="card-text">
                <strong>₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title">Created By</h6>
              <p className="card-text">{po.created_by_name || po.created_by}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="card mb-4">
        <div className="card-header">
          <h6 className="mb-0">Line Items</h6>
        </div>
        <div className="table-responsive">
          <Table striped bordered size="sm" className="mb-0">
            <thead>
              <tr>
                <th>Material</th>
                <th className="text-end" style={{ width: '80px' }}>Qty</th>
                <th style={{ width: '70px' }}>Unit</th>
                <th className="text-end" style={{ width: '100px' }}>Unit Price</th>
                <th className="text-end" style={{ width: '90px' }}>Discount</th>
                <th className="text-end" style={{ width: '100px' }}>GST (18%)</th>
                <th className="text-end" style={{ width: '100px' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {po.line_items.map((item, index) => (
                <POLineItemRow key={index} item={item} editable={false} />
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Special Instructions */}
      {po.special_instructions && (
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">Special Instructions</h6>
          </div>
          <div className="card-body">
            <p className="mb-0">{po.special_instructions}</p>
          </div>
        </div>
      )}

      {/* Delivery Address */}
      {po.delivery_address && (
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">Delivery Address</h6>
          </div>
          <div className="card-body">
            <p className="mb-0">{po.delivery_address.address || JSON.stringify(po.delivery_address)}</p>
          </div>
        </div>
      )}

      {/* Approval Chain */}
      {po.approval_chain && po.approval_chain.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">Approval Chain</h6>
          </div>
          <div className="card-body">
            <div className="timeline">
              {po.approval_chain.map((entry, index) => (
                <div key={index} className="mb-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{entry.approver_name || entry.approver_id}</h6>
                      <p className="text-muted small mb-1">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      <Badge bg={entry.action === 'approved' ? 'success' : 'danger'} className="me-2">
                        {entry.action}
                      </Badge>
                      <span className="text-muted small">Limit: ₹{entry.approval_limit.toLocaleString()}</span>
                    </div>
                  </div>
                  {entry.comments && <p className="text-muted small mt-2 mb-0">{entry.comments}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="d-flex gap-2 mb-4">
        {canSubmit && (
          <Button variant="primary" onClick={handleSubmit}>
            Submit for Approval
          </Button>
        )}
        {canApprove && (
          <Button variant="success" onClick={() => setShowApproveModal(true)}>
            Approve
          </Button>
        )}
        {canReject && (
          <Button variant="danger" onClick={() => setShowRejectModal(true)}>
            Reject
          </Button>
        )}
        {canDelete && (
          <Button variant="outline-danger" onClick={handleDelete}>
            Delete
          </Button>
        )}
        <Button variant="outline-secondary" onClick={onClose}>
          Back
        </Button>
      </div>

      {/* Approve Modal */}
      <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Approve Purchase Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Your Approval Limit (₹)</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={approvalLimit}
              onChange={(e) => setApprovalLimit(Number(e.target.value))}
              placeholder="Enter your approval limit"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Comments (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={approvalComments}
              onChange={(e) => setApprovalComments(e.target.value)}
              placeholder="Add any approval comments"
            />
          </Form.Group>
          {approvalLimit > 0 && totalAmount > approvalLimit && (
            <Alert variant="warning" className="mt-3">
              Warning: PO amount (₹{totalAmount.toLocaleString()}) exceeds your approval limit (₹
              {approvalLimit.toLocaleString()})
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleApprove}
            disabled={approvalLimit === 0 || (totalAmount > approvalLimit)}
          >
            Approve
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Purchase Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Rejection Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this PO is being rejected"
            />
          </Form.Group>
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
    </Container>
  );
};
