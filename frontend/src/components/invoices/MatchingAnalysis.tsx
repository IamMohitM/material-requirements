import { Card, Badge, Alert, Row, Col } from 'react-bootstrap';
import { MatchAnalysis } from '../../store/slices/invoicesSlice';

interface MatchingAnalysisProps {
  analysis: MatchAnalysis | null;
}

export const MatchingAnalysisComponent: React.FC<MatchingAnalysisProps> = ({ analysis }) => {
  if (!analysis) {
    return (
      <Alert variant="info">
        No matching analysis available yet
      </Alert>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'MATCHED':
        return 'success';
      case 'WARNING':
        return 'warning';
      case 'CRITICAL':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getOverallVariant = (status: string) => {
    switch (status) {
      case 'FULLY_MATCHED':
        return 'success';
      case 'PARTIAL_MATCHED':
        return 'warning';
      case 'MISMATCHED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="matching-analysis">
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">3-Way Matching Analysis</h5>
            <Badge bg={getOverallVariant(analysis.overall_status)} style={{ fontSize: '0.875rem' }}>
              {analysis.overall_status.replace(/_/g, ' ')}
            </Badge>
          </div>
        </Card.Header>

        <Card.Body>
          <Row className="g-4">
            {/* Quantity Matching */}
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 bg-light">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h6 className="mb-0">Quantity Match</h6>
                    <Badge bg={getStatusVariant(analysis.quantity_match.status)} style={{ fontSize: '0.75rem' }}>
                      {analysis.quantity_match.status}
                    </Badge>
                  </div>
                  <div className="small">
                    <div className="mb-2">
                      <span className="text-muted">Ordered:</span>
                      <strong className="float-end">{analysis.quantity_match.ordered}</strong>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted">Delivered:</span>
                      <strong className="float-end">{analysis.quantity_match.delivered}</strong>
                    </div>
                    <div className="mb-2 border-top pt-2">
                      <span className="text-muted">Invoiced:</span>
                      <strong className="float-end">{analysis.quantity_match.invoiced}</strong>
                    </div>
                    <p className="mt-3 mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
                      {analysis.quantity_match.message}
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Price Matching */}
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 bg-light">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h6 className="mb-0">Price Match</h6>
                    <Badge bg={getStatusVariant(analysis.price_match.status)} style={{ fontSize: '0.75rem' }}>
                      {analysis.price_match.status}
                    </Badge>
                  </div>
                  <div className="small">
                    <div className="mb-2">
                      <span className="text-muted">PO Price:</span>
                      <strong className="float-end">${analysis.price_match.po_price.toFixed(2)}</strong>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted">Invoice Price:</span>
                      <strong className="float-end">${analysis.price_match.invoice_price.toFixed(2)}</strong>
                    </div>
                    <div className="mb-2 border-top pt-2">
                      <span className="text-muted">Variance:</span>
                      <strong className={`float-end ${analysis.price_match.variance_percent > 0 ? 'text-warning' : 'text-success'}`}>
                        {analysis.price_match.variance_percent > 0 ? '+' : ''}{analysis.price_match.variance_percent.toFixed(2)}%
                      </strong>
                    </div>
                    <p className="mt-3 mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
                      {analysis.price_match.message}
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Brand Matching */}
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 bg-light">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h6 className="mb-0">Brand Match</h6>
                    <Badge bg={getStatusVariant(analysis.brand_match.status)} style={{ fontSize: '0.75rem' }}>
                      {analysis.brand_match.status}
                    </Badge>
                  </div>
                  <div className="small">
                    <div className="mb-2">
                      <span className="text-muted">Ordered:</span>
                      <strong className="float-end" style={{ maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>
                        {analysis.brand_match.ordered || '—'}
                      </strong>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted">Delivered:</span>
                      <strong className="float-end" style={{ maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>
                        {analysis.brand_match.delivered || '—'}
                      </strong>
                    </div>
                    <div className="mb-2 border-top pt-2">
                      <span className="text-muted">Invoiced:</span>
                      <strong className="float-end" style={{ maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>
                        {analysis.brand_match.invoiced || '—'}
                      </strong>
                    </div>
                    <p className="mt-3 mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
                      {analysis.brand_match.message}
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Timing Matching */}
            <Col md={6} lg={3}>
              <Card className="h-100 border-0 bg-light">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h6 className="mb-0">Timing Match</h6>
                    <Badge bg={getStatusVariant(analysis.timing_match.status)} style={{ fontSize: '0.75rem' }}>
                      {analysis.timing_match.status}
                    </Badge>
                  </div>
                  <div className="small">
                    <div className="mb-2">
                      <span className="text-muted">Delivery:</span>
                      <strong className="float-end">
                        {new Date(analysis.timing_match.delivery_date).toLocaleDateString()}
                      </strong>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted">Invoice:</span>
                      <strong className="float-end">
                        {new Date(analysis.timing_match.invoice_date).toLocaleDateString()}
                      </strong>
                    </div>
                    <div className="mb-2 border-top pt-2">
                      <span className="text-muted">Sequence:</span>
                      <strong className="float-end" style={{ fontSize: '0.9rem' }}>
                        {new Date(analysis.timing_match.invoice_date) >= new Date(analysis.timing_match.delivery_date) ? '✓ Normal' : '✗ Early'}
                      </strong>
                    </div>
                    <p className="mt-3 mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
                      {analysis.timing_match.message}
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Discrepancies Section */}
      {analysis.discrepancies > 0 && (
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-light border-bottom">
            <h5 className="mb-0">
              Discrepancies Found <Badge bg="warning">{analysis.discrepancies}</Badge>
            </h5>
          </Card.Header>
          <Card.Body>
            <Alert variant="warning" className="mb-0">
              Please review the discrepancies above. Critical discrepancies must be resolved before approval.
            </Alert>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};
