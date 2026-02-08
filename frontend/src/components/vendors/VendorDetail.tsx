import { useEffect } from 'react';
import { Card, Badge, Table, Button, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchVendorRateHistory, Vendor } from '../../store/slices/vendorsSlice';

interface VendorDetailProps {
  vendor: Vendor | null;
  onClose: () => void;
}

export const VendorDetail: React.FC<VendorDetailProps> = ({ vendor, onClose }) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.vendors);

  useEffect(() => {
    if (vendor?.id) {
      dispatch(fetchVendorRateHistory(vendor.id));
    }
  }, [vendor?.id, dispatch]);

  if (!vendor) return null;

  return (
    <div>
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">{vendor.name}</h4>
            <Button variant="outline-secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="row mb-4">
            <div className="col-md-3">
              <strong>Status</strong>
              <p>
                <Badge bg={vendor.is_active ? 'success' : 'secondary'}>
                  {vendor.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </p>
            </div>
            <div className="col-md-3">
              <strong>Rating</strong>
              <p>
                {vendor.rating ? (
                  <Badge bg="info">⭐ {vendor.rating.toFixed(1)}</Badge>
                ) : (
                  <span className="text-muted">Not rated</span>
                )}
              </p>
            </div>
            <div className="col-md-3">
              <strong>Lead Time</strong>
              <p>
                {vendor.delivery_lead_time_days
                  ? `${vendor.delivery_lead_time_days} days`
                  : '-'}
              </p>
            </div>
            <div className="col-md-3">
              <strong>Payment Terms</strong>
              <p>{vendor.payment_terms || '-'}</p>
            </div>
          </div>

          <h5 className="mt-4 mb-3">Contact Information</h5>
          <div className="row mb-4">
            <div className="col-md-6">
              <strong>Contact Person:</strong>
              <p>{vendor.contact_person || '-'}</p>
            </div>
            <div className="col-md-6">
              <strong>Email:</strong>
              <p>{vendor.email || '-'}</p>
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-md-6">
              <strong>Phone:</strong>
              <p>{vendor.phone || '-'}</p>
            </div>
            <div className="col-md-6">
              <strong>Address:</strong>
              <p>
                {vendor.address && (
                  <>
                    {vendor.address}
                    <br />
                  </>
                )}
                {vendor.city && `${vendor.city}, `}
                {vendor.state && `${vendor.state} `}
                {vendor.zip_code && vendor.zip_code}
              </p>
            </div>
          </div>

          {vendor.specialties && vendor.specialties.length > 0 && (
            <>
              <h5 className="mt-4 mb-3">Specialties</h5>
              <div className="mb-4">
                {vendor.specialties.map((specialty, idx) => (
                  <Badge key={idx} bg="light" text="dark" className="me-2 mb-2">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </>
          )}

          {vendor.rates && vendor.rates.length > 0 && (
            <>
              <h5 className="mt-4 mb-3">Current Rates</h5>
              <Table bordered size="sm" className="mb-4">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {vendor.rates.map((rate, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{rate.material_name}</strong>
                        <br />
                        <small className="text-muted">{rate.material_id}</small>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        ${rate.price.toFixed(2)}
                      </td>
                      <td>{rate.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}

          {vendor.rate_history && vendor.rate_history.length > 0 && (
            <>
              <h5 className="mt-4 mb-3">Price History</h5>
              {isLoading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" role="status" size="sm" />
                </div>
              ) : (
                <Table bordered size="sm">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th style={{ textAlign: 'right' }}>Old Price</th>
                      <th style={{ textAlign: 'right' }}>New Price</th>
                      <th style={{ textAlign: 'right' }}>Change %</th>
                      <th>Effective Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendor.rate_history.map((history, idx) => (
                      <tr key={idx}>
                        <td>{history.material_id}</td>
                        <td style={{ textAlign: 'right' }}>
                          ${history.price_old.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          ${history.price_new.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Badge
                            bg={
                              history.change_percentage > 0
                                ? 'danger'
                                : 'success'
                            }
                          >
                            {history.change_percentage > 0 ? '+' : ''}
                            {history.change_percentage.toFixed(1)}%
                          </Badge>
                        </td>
                        <td>
                          {new Date(history.effective_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};
