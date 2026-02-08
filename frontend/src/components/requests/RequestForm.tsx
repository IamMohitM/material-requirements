import { useState } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createRequest } from '../../store/slices/requestsSlice';

interface RequestFormProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  project_id: string;
  requester_id: string;
  requester_name: string;
  line_items: Array<{
    material_id: string;
    material_name: string;
    quantity: number;
    unit_price: number;
    description?: string;
  }>;
  priority?: string;
  delivery_date?: string;
}

export const RequestForm: React.FC<RequestFormProps> = ({ show, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.requests);
  const { user } = useAppSelector((state) => state.auth);
  const [lineItems, setLineItems] = useState([
    { material_id: '', material_name: '', quantity: 0, unit_price: 0, description: '' },
  ]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      requester_id: user?.id || '',
      requester_name: user?.name || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    const validLineItems = lineItems.filter(
      (item) => item.material_id && item.quantity > 0
    );

    if (validLineItems.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    const result = await dispatch(
      createRequest({
        ...data,
        requester_id: user?.id || '',
        requester_name: user?.name || '',
        line_items: validLineItems,
      })
    );

    if (result.meta.requestStatus === 'fulfilled') {
      reset();
      setLineItems([{ material_id: '', material_name: '', quantity: 0, unit_price: 0, description: '' }]);
      onSuccess();
    }
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { material_id: '', material_name: '', quantity: 0, unit_price: 0, description: '' },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLineItems(newItems);
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create Material Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Project</Form.Label>
            <Form.Control
              {...register('project_id', { required: 'Project is required' })}
              as="select"
              isInvalid={!!errors.project_id}
            >
              <option value="">Select a project</option>
              {/* TODO: Load projects from API */}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {errors.project_id?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Priority</Form.Label>
            <Form.Select {...register('priority')}>
              <option value="">Select priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Delivery Date</Form.Label>
            <Form.Control
              {...register('delivery_date')}
              type="date"
              isInvalid={!!errors.delivery_date}
            />
            <Form.Control.Feedback type="invalid">
              {errors.delivery_date?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="mb-4">
            <h5>Line Items</h5>
            {lineItems.map((item, index) => (
              <div key={index} className="mb-3 p-3 border rounded">
                <div className="row">
                  <div className="col-md-3 mb-2">
                    <Form.Label>Material ID</Form.Label>
                    <Form.Control
                      placeholder="Material ID"
                      value={item.material_id}
                      onChange={(e) => updateLineItem(index, 'material_id', e.target.value)}
                    />
                  </div>
                  <div className="col-md-3 mb-2">
                    <Form.Label>Material Name</Form.Label>
                    <Form.Control
                      placeholder="Material Name"
                      value={item.material_name}
                      onChange={(e) => updateLineItem(index, 'material_name', e.target.value)}
                    />
                  </div>
                  <div className="col-md-2 mb-2">
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="col-md-2 mb-2">
                    <Form.Label>Unit Price</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0.00"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="col-md-2 mb-2 d-flex align-items-end">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      disabled={lineItems.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Item description (optional)"
                    value={item.description || ''}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  />
                </Form.Group>
              </div>
            ))}
            <Button variant="outline-secondary" onClick={addLineItem} className="mb-3">
              + Add Line Item
            </Button>
          </div>

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
                'Create Request'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
