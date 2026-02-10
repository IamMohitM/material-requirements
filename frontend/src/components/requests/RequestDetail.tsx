import { useEffect, useMemo, useState } from 'react';
import { Card, Badge, Table, Button, Alert } from 'react-bootstrap';
import { Request } from '../../store/slices/requestsSlice';
import { fetchMaterials } from '../../store/slices/materialsSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { materialsApi } from '../../services/materialsApi';

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
  const dispatch = useAppDispatch();
  const { materials } = useAppSelector((state) => state.materials);
  const [materialNames, setMaterialNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (materials.length === 0) {
      dispatch(fetchMaterials({ pageSize: 200 }));
    }
  }, [dispatch, materials.length]);

  useEffect(() => {
    if (materials.length === 0) return;
    setMaterialNames((prev) => {
      const next = { ...prev };
      for (const material of materials) {
        next[material.id] = material.name;
      }
      return next;
    });
  }, [materials]);

  useEffect(() => {
    if (!request?.materials || request.materials.length === 0) return;
    const missingIds = request.materials
      .map((item) => item.material_id)
      .filter((id) => !materialNames[id]);

    if (missingIds.length === 0) return;

    let isActive = true;

    Promise.all(
      missingIds.map(async (id) => {
        try {
          const material = await materialsApi.getMaterialById(id);
          return { id: material.id, name: material.name };
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (!isActive) return;
      setMaterialNames((prev) => {
        const next = { ...prev };
        for (const result of results) {
          if (result) {
            next[result.id] = result.name;
          }
        }
        return next;
      });
    });

    return () => {
      isActive = false;
    };
  }, [request?.materials, materialNames]);

  const materialNameById = useMemo(() => {
    return new Map(Object.entries(materialNames));
  }, [materialNames]);

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
              <p>{request.project_name || request.project_id}</p>
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
                <th>Material</th>
                <th style={{ textAlign: 'right' }}>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {request.materials && request.materials.length > 0 ? (
                request.materials.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      {item.material_name ||
                        materialNameById.get(item.material_id) ||
                        item.material_id}
                    </td>
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
