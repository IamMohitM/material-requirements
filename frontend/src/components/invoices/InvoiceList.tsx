import { useEffect, useState } from 'react';
import { Table, Button, Badge, Form, Row, Col, Card, Pagination, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchInvoices, setFilters, setPage, InvoiceFilters } from '../../store/slices/invoicesSlice';
import { Invoice } from '../../store/slices/invoicesSlice';

interface InvoiceListProps {
  onCreateClick: () => void;
  onRowClick: (invoice: Invoice) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ onCreateClick, onRowClick }) => {
  const dispatch = useAppDispatch();
  const { list, isLoading, filters, pagination } = useAppSelector((state) => state.invoices);

  const [localFilters, setLocalFilters] = useState<InvoiceFilters>(filters);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchInvoices({ page: pagination.page, pageSize: pagination.pageSize, filters }));
  }, [dispatch, filters, pagination.page, pagination.pageSize]);

  const handleFilterChange = (newFilters: InvoiceFilters) => {
    setLocalFilters(newFilters);
    dispatch(setFilters(newFilters));
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    handleFilterChange({ ...localFilters, searchTerm: value || undefined });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      SUBMITTED: 'info',
      APPROVED: 'success',
      REJECTED: 'danger',
    };
    return (
      <Badge bg={variants[status] || 'secondary'}>
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
    };
    const labels: Record<string, string> = {
      FULLY_MATCHED: 'Fully Matched',
      PARTIAL_MATCHED: 'Partially Matched',
      MISMATCHED: 'Mismatched',
      UNMATCHED: 'Unmatched',
    };
    return (
      <Badge bg={variants[status] || 'secondary'}>
        {labels[status] || status}
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
    <div className="invoice-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Invoices</h2>
        <Button variant="primary" onClick={onCreateClick}>
          + Submit Invoice
        </Button>
      </div>

      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Search & Filters</h5>
          <Row className="mb-3">
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Search Invoice Number</Form.Label>
                <Form.Control
                  placeholder="Search by invoice number..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
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
                <Form.Label>Vendor</Form.Label>
                <Form.Control
                  placeholder="Filter by vendor"
                  value={localFilters.vendorId || ''}
                  onChange={(e) =>
                    handleFilterChange({ ...localFilters, vendorId: e.target.value || undefined })
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
                  <option value="SUBMITTED">Submitted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="mb-2">
              <Form.Group>
                <Form.Label>Matching Status</Form.Label>
                <Form.Select
                  value={localFilters.matchingStatus || ''}
                  onChange={(e) =>
                    handleFilterChange({
                      ...localFilters,
                      matchingStatus: (e.target.value as any) || undefined,
                    })
                  }
                >
                  <option value="">All</option>
                  <option value="FULLY_MATCHED">Fully Matched</option>
                  <option value="PARTIAL_MATCHED">Partially Matched</option>
                  <option value="MISMATCHED">Mismatched</option>
                  <option value="UNMATCHED">Unmatched</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Loading invoices...</p>
        </div>
      ) : list.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="text-muted mb-0">No invoices found</p>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Card className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Vendor</th>
                  <th>PO #</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Match Status</th>
                  <th>Issues</th>
                </tr>
              </thead>
              <tbody>
                {list.map((invoice) => (
                  <tr key={invoice.id} onClick={() => onRowClick(invoice)} style={{ cursor: 'pointer' }}>
                    <td>
                      <strong>{invoice.invoice_number}</strong>
                    </td>
                    <td>{invoice.vendor_id}</td>
                    <td>{invoice.po_id}</td>
                    <td>${invoice.total_amount.toFixed(2)}</td>
                    <td>{getStatusBadge(invoice.status)}</td>
                    <td>{getMatchingBadge(invoice.matching_status)}</td>
                    <td>
                      {invoice.match_analysis && invoice.match_analysis.discrepancies > 0 ? (
                        <Badge bg="warning">{invoice.match_analysis.discrepancies}</Badge>
                      ) : (
                        <Badge bg="success">0</Badge>
                      )}
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
