import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createVendor } from '../../store/slices/vendorsSlice';

interface VendorFormProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  payment_terms?: string;
  delivery_lead_time_days?: number;
  is_active: boolean;
}

export const VendorForm: React.FC<VendorFormProps> = ({ show, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.vendors);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      is_active: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    const result = await dispatch(
      createVendor({
        ...data,
        is_active: data.is_active,
      })
    );

    if (result.meta.requestStatus === 'fulfilled') {
      reset();
      onSuccess();
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Vendor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Vendor Name *</Form.Label>
            <Form.Control
              {...register('name', { required: 'Vendor name is required' })}
              placeholder="Enter vendor name"
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contact Person</Form.Label>
            <Form.Control
              {...register('contact_person')}
              placeholder="Enter contact person name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              {...register('email')}
              type="email"
              placeholder="Enter email address"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              {...register('phone')}
              placeholder="Enter phone number"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              {...register('address')}
              placeholder="Enter street address"
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control
                  {...register('city')}
                  placeholder="Enter city"
                />
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group className="mb-3">
                <Form.Label>State</Form.Label>
                <Form.Control
                  {...register('state')}
                  placeholder="State"
                />
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group className="mb-3">
                <Form.Label>ZIP Code</Form.Label>
                <Form.Control
                  {...register('zip_code')}
                  placeholder="ZIP Code"
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Country</Form.Label>
            <Form.Control
              {...register('country')}
              placeholder="Enter country"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Payment Terms</Form.Label>
            <Form.Select {...register('payment_terms')}>
              <option value="">Select payment terms</option>
              <option value="NET_15">NET 15</option>
              <option value="NET_30">NET 30</option>
              <option value="NET_60">NET 60</option>
              <option value="COD">Cash on Delivery</option>
              <option value="PREPAID">Prepaid</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Delivery Lead Time (days)</Form.Label>
            <Form.Control
              {...register('delivery_lead_time_days', {
                valueAsNumber: true,
              })}
              type="number"
              placeholder="Enter lead time in days"
              min="0"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              {...register('is_active')}
              type="checkbox"
              label="Active"
              defaultChecked={true}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" className="me-2" animation="border" />
                  Creating...
                </>
              ) : (
                'Create Vendor'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
