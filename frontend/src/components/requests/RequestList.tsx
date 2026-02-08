import { useEffect, useState } from 'react';
import { Table, Button, Badge, Form, Row, Col, Card, Pagination, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchRequests, setFilters, setPage, RequestFilters, Request } from '../../store/slices/requestsSlice';

interface RequestListProps {
  onCreateClick: () => void;
  onRowClick: (request: Request) => void;
}

export const RequestList: React.FC<RequestListProps> = ({ onCreateClick, onRowClick }) => {
  const dispatch = useAppDispatch();
  const { list, isLoading, filters, pagination } = useAppSelector((state) => state.requests);

  const [localFilters, setLocalFilters] = useState<RequestFilters>(filters);

  useEffect(() => {
    dispatch(fetchRequests({ page: pagination.page, pageSize: pagination.pageSize, filters }));
  }, [dispatch, filters, pagination.page, pagination.pageSize]);

  const handleFilterChange = (newFilters: RequestFilters) => {
    setLocalFilters(newFilters);
    dispatch(setFilters(newFilters));
  };

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

  const handlePaginationClick = (pageNum: number) => {
    dispatch(setPage(pageNum));
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize) || 1;
  const paginationItems = [];

  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(
      <Pagination.Item
        key={i}
        active={i === pagination.page}
        onClick={() => handlePaginationClick(i)}
      >
        {i}
      </Pagination.Item>
    );
  }

  return (
    <div className="request-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Material Requests</h2>
        <Button variant="primary" onClick={onCreateClick}>
          + Create Request
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Filters</h5>
          <Row>
            <Col md={3} className="mb-2">
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <Form.Control
                  placeholder="Search by request #"
                  value={localFilters.searchTerm || ''}
                  onChange={(e) =>
                    handleFilterChange({ ...localFilters, searchTerm: e.target.value || undefined })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={3} className="mb-2">
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={localFilters.status || ''}
                  onChange={(e) =>
                    handleFilterChange({
                      ...localFilters,
                      status: (e.target.value as any) || undefined,
                    })
                  }
                >
                  <option value="">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="QUOTED">Quoted</option>
                  <option value="PO_CREATED">PO Created</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="mb-2">
              <Form.Group>
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={localFilters.dateRange?.[0] || ''}
                  onChange={(e) => {
                    const from = e.target.value;
                    const to = localFilters.dateRange?.[1] || '';
                    handleFilterChange({
                      ...localFilters,
                      dateRange: from && to ? [from, to] : undefined,
                    });
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={3} className="mb-2">
              <Form.Group>
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={localFilters.dateRange?.[1] || ''}
                  onChange={(e) => {
                    const from = localFilters.dateRange?.[0] || '';
                    const to = e.target.value;
                    handleFilterChange({
                      ...localFilters,
                      dateRange: from && to ? [from, to] : undefined,
                    });
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Loading requests...</p>
        </div>
      ) : list.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-0">No requests found</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Request #</th>
                  <th>Requester</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Delivery Date</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {list.map((request) => (
                  <tr key={request.id} onClick={() => onRowClick(request)} style={{ cursor: 'pointer' }}>
                    <td>
                      <strong>{request.request_number}</strong>
                    </td>
                    <td>{request.requester_name}</td>
                    <td>{request.line_items.length}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>
                      {request.delivery_date
                        ? new Date(request.delivery_date).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First
                  onClick={() => handlePaginationClick(1)}
                  disabled={pagination.page === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePaginationClick(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                />
                {paginationItems.slice(Math.max(0, pagination.page - 3), Math.min(totalPages, pagination.page + 2))}
                <Pagination.Next
                  onClick={() => handlePaginationClick(Math.min(totalPages, pagination.page + 1))}
                  disabled={pagination.page === totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePaginationClick(totalPages)}
                  disabled={pagination.page === totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
};
