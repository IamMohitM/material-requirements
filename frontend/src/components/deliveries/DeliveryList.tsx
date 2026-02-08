import { useEffect, useState } from 'react';
import { Table, Button, Badge, Form, Row, Col, Card, Pagination, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchDeliveries, setFilters, setPage, DeliveryFilters } from '../../store/slices/deliveriesSlice';
import { Delivery } from '../../store/slices/deliveriesSlice';

interface DeliveryListProps {
  onCreateClick: () => void;
  onRowClick: (delivery: Delivery) => void;
}

export const DeliveryList: React.FC<DeliveryListProps> = ({ onCreateClick, onRowClick }) => {
  const dispatch = useAppDispatch();
  const { list, isLoading, filters, pagination } = useAppSelector((state) => state.deliveries);

  const [localFilters, setLocalFilters] = useState<DeliveryFilters>(filters);

  useEffect(() => {
    dispatch(fetchDeliveries({ page: pagination.page, pageSize: pagination.pageSize, filters }));
  }, [dispatch, filters, pagination.page, pagination.pageSize]);

  const handleFilterChange = (newFilters: DeliveryFilters) => {
    setLocalFilters(newFilters);
    dispatch(setFilters(newFilters));
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: 'secondary',
      PARTIAL: 'warning',
      COMPLETE: 'success',
    };
    return (
      <Badge bg={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getQualityColor = (score: number) => {
    if (score >= 95) return 'success';
    if (score >= 90) return 'warning';
    return 'danger';
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
    <div className="delivery-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Deliveries</h2>
        <Button variant="primary" onClick={onCreateClick}>
          + Create Delivery
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Filters</h5>
          <Row>
            <Col md={3} className="mb-2">
              <Form.Group>
                <Form.Label>PO Number</Form.Label>
                <Form.Control
                  placeholder="Filter by PO"
                  value={localFilters.poId || ''}
                  onChange={(e) =>
                    handleFilterChange({ ...localFilters, poId: e.target.value || undefined })
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
                  <option value="PENDING">Pending</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="COMPLETE">Complete</option>
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
          <p className="mt-2">Loading deliveries...</p>
        </div>
      ) : list.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-0">No deliveries found</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Delivery #</th>
                  <th>PO #</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Quality %</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {list.map((delivery) => (
                  <tr key={delivery.id} onClick={() => onRowClick(delivery)} style={{ cursor: 'pointer' }}>
                    <td>
                      <strong>{delivery.delivery_number}</strong>
                    </td>
                    <td>{delivery.po_id}</td>
                    <td>{new Date(delivery.delivery_date).toLocaleDateString()}</td>
                    <td>{getStatusBadge(delivery.status)}</td>
                    <td>
                      <Badge bg={getQualityColor(delivery.quality_score)}>
                        {delivery.quality_score}%
                      </Badge>
                    </td>
                    <td>{delivery.line_items.length}</td>
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
