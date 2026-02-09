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
      draft: 'secondary',
      submitted: 'warning',
      approved: 'success',
      rejected: 'danger',
      converted_to_po: 'primary',
      cancelled: 'dark',
    };
    return (
      <Badge bg={variants[status] || 'secondary'}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  const getApprovalStatusBadge = (status?: string) => {
    if (!status) return null;
    const variants: Record<string, string> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      archived: 'secondary',
    };
    return (
      <Badge bg={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

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
              <strong>Request Status</strong>
              <p>{getStatusBadge(request.status)}</p>
            </div>
            <div className="col-md-3">
              <strong>Approval Status</strong>
              <p>{getApprovalStatusBadge(request.approval_status)}</p>
            </div>
            <div className="col-md-3">
              <strong>Project</strong>
              <p>{request.project_id}</p>
            </div>
            <div className="col-md-3">
              <strong>Created</strong>
              <p>{new Date(request.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {request.approval_notes && (
            <Alert variant="info">
              <strong>Notes:</strong> {request.approval_notes}
            </Alert>
          )}

          <h5 className="mt-4 mb-3">Materials</h5>
          <Table bordered size="sm">
            <thead>
              <tr>
                <th>Material ID</th>
                <th style={{ textAlign: 'right' }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {request.materials && request.materials.length > 0 ? (
                request.materials.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.material_id}</td>
                    <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center' }}>
                    No materials added
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {request.status === 'submitted' && (
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
