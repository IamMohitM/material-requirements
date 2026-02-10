import { useEffect, useState } from 'react';
import { Table, Button, Badge, Form, Row, Col, Card, Pagination, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchVendors, setFilters, setPage, VendorFilters, Vendor } from '../../store/slices/vendorsSlice';

interface VendorListProps {
  onCreateClick: () => void;
  onRowClick: (vendor: Vendor) => void;
}

export const VendorList: React.FC<VendorListProps> = ({ onCreateClick, onRowClick }) => {
  const dispatch = useAppDispatch();
  const { list, isLoading, filters, pagination } = useAppSelector((state) => state.vendors);

  const [localFilters, setLocalFilters] = useState<VendorFilters>(filters);

  useEffect(() => {
    dispatch(fetchVendors({ page: pagination.page, pageSize: pagination.pageSize, filters }));
  }, [dispatch, filters, pagination.page, pagination.pageSize]);

  const handleFilterChange = (newFilters: VendorFilters) => {
    setLocalFilters(newFilters);
    dispatch(setFilters(newFilters));
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
    <div className="vendor-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Vendor Management</h2>
        <Button variant="primary" onClick={onCreateClick}>
          + Add New Vendor
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Filters</h5>
          <Row>
            <Col md={4} className="mb-2">
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <Form.Control
                  placeholder="Search by vendor name or email"
                  value={localFilters.searchTerm || ''}
                  onChange={(e) =>
                    handleFilterChange({ ...localFilters, searchTerm: e.target.value || undefined })
                  }
                />
              </Form.Group>
            </Col>
            <Col md={4} className="mb-2">
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={localFilters.isActive === undefined ? '' : localFilters.isActive.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange({
                      ...localFilters,
                      isActive: value === '' ? undefined : value === 'true',
                    });
                  }}
                >
                  <option value="">All Vendors</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="mb-2">
              <Form.Group>
                <Form.Label>Minimum Rating</Form.Label>
                <Form.Select
                  value={localFilters.rating || ''}
                  onChange={(e) =>
                    handleFilterChange({
                      ...localFilters,
                      rating: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                >
                  <option value="">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="5">5 Stars</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Loading vendors...</p>
        </div>
      ) : list.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-0">No vendors found</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {list.map((vendor) => (
                  <tr key={vendor.id} onClick={() => onRowClick(vendor)} style={{ cursor: 'pointer' }}>
                    <td>
                      <strong>{vendor.name}</strong>
                    </td>
                    <td>{vendor.contact_person || '-'}</td>
                    <td>{vendor.email || '-'}</td>
                    <td>
                      {vendor.rating && !isNaN(Number(vendor.rating)) ? (
                        <Badge bg="info">
                          ⭐ {Number(vendor.rating).toFixed(1)}
                        </Badge>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <Badge bg={vendor.is_active ? 'success' : 'secondary'}>
                        {vendor.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>
                      {vendor.city && vendor.state ? `${vendor.city}, ${vendor.state}` : '-'}
                    </td>
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
