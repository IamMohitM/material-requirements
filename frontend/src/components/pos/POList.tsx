import { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchPOs, setFilters, setPage } from '../../store/slices/posSlice';
import { POFilters } from '../../services/posApi';
import { fetchProjects } from '../../store/slices/projectsSlice';
import { fetchVendors } from '../../store/slices/vendorsSlice';

interface POListProps {
  onSelectPO: (poId: string) => void;
  onCreateNew: () => void;
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

export const POList: React.FC<POListProps> = ({ onSelectPO, onCreateNew }) => {
  const dispatch = useAppDispatch();
  const { list: pos, filters, pagination, isLoading, error } = useAppSelector((state) => state.pos);
  const { projects } = useAppSelector((state) => state.projects);
  const { list: vendors } = useAppSelector((state) => state.vendors);

  const [localFilters, setLocalFilters] = useState<POFilters>(filters);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchPOs({ page: pagination.page, pageSize: pagination.pageSize, filters }));
    dispatch(fetchProjects({ pageSize: 100 }));
    dispatch(fetchVendors({ pageSize: 100 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleFilterChange = (field: keyof POFilters, value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const handleApplyFilters = () => {
    dispatch(setFilters(localFilters));
    dispatch(fetchPOs({ page: 1, pageSize: pagination.pageSize, filters: localFilters }));
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    dispatch(setFilters({}));
    dispatch(fetchPOs({ page: 1, pageSize: pagination.pageSize }));
  };

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      dispatch(setPage(pagination.page - 1));
      dispatch(fetchPOs({ page: pagination.page - 1, pageSize: pagination.pageSize, filters }));
    }
  };

  const handleNextPage = () => {
    if (pagination.page * pagination.pageSize < pagination.total) {
      dispatch(setPage(pagination.page + 1));
      dispatch(fetchPOs({ page: pagination.page + 1, pageSize: pagination.pageSize, filters }));
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || projectId;
  };

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    return vendor?.name || vendorId;
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return (
    <Container fluid>
      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="card-title mb-3">Filter POs</h6>
          <Row className="g-2">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small">Status</Form.Label>
                <Form.Select
                  size="sm"
                  value={localFilters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="approved">Approved</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small">Project</Form.Label>
                <Form.Select
                  size="sm"
                  value={localFilters.projectId || ''}
                  onChange={(e) => handleFilterChange('projectId', e.target.value)}
                >
                  <option value="">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small">Vendor</Form.Label>
                <Form.Select
                  size="sm"
                  value={localFilters.vendorId || ''}
                  onChange={(e) => handleFilterChange('vendorId', e.target.value)}
                >
                  <option value="">All Vendors</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="small">Approval Status</Form.Label>
                <Form.Select
                  size="sm"
                  value={localFilters.approvalStatus || ''}
                  onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
                >
                  <option value="">All Approvals</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="archived">Archived</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <div className="mt-2">
            <Button size="sm" variant="primary" onClick={handleApplyFilters} className="me-2">
              Apply Filters
            </Button>
            <Button size="sm" variant="outline-secondary" onClick={handleClearFilters}>
              Clear
            </Button>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Table */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>Purchase Orders ({pagination.total})</span>
          <Button size="sm" variant="success" onClick={onCreateNew}>
            + Create New PO
          </Button>
        </div>

        {isLoading ? (
          <div className="card-body text-center py-5">
            <Spinner animation="border" className="me-2" />
            Loading POs...
          </div>
        ) : pos.length === 0 ? (
          <div className="card-body text-center py-5">
            <p className="text-muted">No POs found</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <Table striped bordered hover className="mb-0">
                <thead>
                  <tr>
                    <th>PO Number</th>
                    <th>Date</th>
                    <th>Project</th>
                    <th>Vendor</th>
                    <th className="text-end">Amount</th>
                    <th>Status</th>
                    <th>Approval</th>
                    <th style={{ width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pos.map((po) => (
                    <tr key={po.id}>
                      <td>
                        <strong>{po.po_number}</strong>
                      </td>
                      <td>{new Date(po.order_date).toLocaleDateString()}</td>
                      <td>{getProjectName(po.project_id)}</td>
                      <td>{getVendorName(po.vendor_id)}</td>
                      <td className="text-end">
                        ₹{po.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td>
                        <Badge bg={STATUS_COLORS[po.status] || 'secondary'}>{po.status}</Badge>
                      </td>
                      <td>
                        <Badge bg={APPROVAL_COLORS[po.approval_status] || 'secondary'}>
                          {po.approval_status}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => onSelectPO(po.id)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card-footer d-flex justify-content-between align-items-center">
                <span className="text-muted">
                  Page {pagination.page} of {totalPages}
                </span>
                <div>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={handlePrevPage}
                    disabled={pagination.page === 1}
                    className="me-2"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={handleNextPage}
                    disabled={pagination.page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
};
