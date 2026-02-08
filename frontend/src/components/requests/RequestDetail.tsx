import { Card, Badge, Table, Button, Alert } from 'react-bootstrap';
import { Request } from '../../store/slices/requestsSlice';

interface RequestDetailProps {
  request: Request | null;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export const RequestDetail: React.FC<RequestDetailProps> = ({
  request,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!request) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      DRAFT: 'secondary',
      PENDING_APPROVAL: 'warning',
      APPROVED: 'success',
      REJECTED: 'danger',
      QUOTED: 'info',
      PO_CREATED: 'primary',
    };
    return (
      <Badge bg={variants[status] || 'secondary'}>
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const total = request.line_items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  return (
    <div>
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Request {request.request_number}</h4>
            <Button variant="outline-secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="row mb-4">
            <div className="col-md-3">
              <strong>Status</strong>
              <p>{getStatusBadge(request.status)}</p>
            </div>
            <div className="col-md-3">
              <strong>Requester</strong>
              <p>{request.requester_name}</p>
            </div>
            <div className="col-md-3">
              <strong>Created</strong>
              <p>{new Date(request.created_at).toLocaleDateString()}</p>
            </div>
            <div className="col-md-3">
              <strong>Delivery Date</strong>
              <p>
                {request.delivery_date
                  ? new Date(request.delivery_date).toLocaleDateString()
                  : '-'}
              </p>
            </div>
          </div>

          {request.approval_comments && (
            <Alert variant="info">
              <strong>Approval Comments:</strong> {request.approval_comments}
            </Alert>
          )}

          <h5 className="mt-4 mb-3">Line Items</h5>
          <Table bordered size="sm">
            <thead>
              <tr>
                <th>Material</th>
                <th style={{ textAlign: 'right' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {request.line_items.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{item.material_name}</strong>
                    <br />
                    <small className="text-muted">{item.material_id}</small>
                  </td>
                  <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>${item.unit_price.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>
                    ${(item.quantity * item.unit_price).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} style={{ textAlign: 'right' }}>
                  <strong>Total:</strong>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <strong>${total.toFixed(2)}</strong>
                </td>
              </tr>
            </tbody>
          </Table>

          {request.status === 'PENDING_APPROVAL' && (
            <div className="mt-4">
              <Button
                variant="success"
                onClick={onApprove}
                className="me-2"
              >
                Approve
              </Button>
              <Button
                variant="danger"
                onClick={onReject}
              >
                Reject
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};
