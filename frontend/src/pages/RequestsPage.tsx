import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { RequestList, RequestForm, RequestDetail } from '../components/requests';
import { Request } from '../store/slices/requestsSlice';

export const RequestsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setShowCreateForm(true);
      setShowDetail(false);
      setSelectedRequest(null);
    }
  }, [searchParams]);

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setSearchParams({ create: '1' });
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setSearchParams({});
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setShowDetail(false);
    setSelectedRequest(null);
    setSearchParams({});
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
