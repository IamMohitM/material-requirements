import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { RequestList, RequestForm, RequestDetail } from '../components/requests';
import { Request } from '../store/slices/requestsSlice';

export const RequestsPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleCreateClick = () => {
    setShowCreateForm(true);
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
  };

  const handleRowClick = (request: Request) => {
    setSelectedRequest(request);
    setShowDetail(true);
  };

  const handleDetailClose = () => {
    setShowDetail(false);
    setSelectedRequest(null);
  };

  return (
    <Container fluid className="py-5">
      {showDetail ? (
        <RequestDetail
          request={selectedRequest}
          onClose={handleDetailClose}
        />
      ) : (
        <>
          <RequestList
            onCreateClick={handleCreateClick}
            onRowClick={handleRowClick}
          />

          <RequestForm
            show={showCreateForm}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </>
      )}
    </Container>
  );
};

export default RequestsPage;
