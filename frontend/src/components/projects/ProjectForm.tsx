import { useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createProject, updateProject } from '../../store/slices/projectsSlice';
import { Project, CreateProjectRequest } from '../../services/projectsApi';

interface ProjectFormProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Project | null;
  isEditing?: boolean;
}

interface FormData {
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  budget: number;
  status: string;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  show,
  onClose,
  onSuccess,
  initialData,
  isEditing = false,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.projects);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      start_date: initialData?.start_date ? initialData.start_date.split('T')[0] : '',
      end_date: initialData?.end_date ? initialData.end_date.split('T')[0] : '',
      budget: initialData?.budget || 0,
      status: initialData?.status || 'planning',
    },
  });

  const startDate = watch('start_date');

  useEffect(() => {
    if (show && initialData) {
      reset({
        name: initialData.name,
        description: initialData.description,
        start_date: initialData.start_date.split('T')[0],
        end_date: initialData.end_date ? initialData.end_date.split('T')[0] : '',
        budget: initialData.budget,
        status: initialData.status,
      });
    } else if (show) {
      reset({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        budget: 0,
        status: 'planning',
      });
    }
  }, [show, initialData, reset]);

  const onSubmit = async (data: FormData) => {
    if (!data.name.trim()) {
      return;
    }

    const payload: CreateProjectRequest = {
      name: data.name.trim(),
      description: data.description?.trim(),
      start_date: data.start_date,
      end_date: data.end_date || undefined,
      budget: parseFloat(data.budget.toString()),
      status: data.status,
    };

    try {
      let result;
      if (isEditing && initialData?.id) {
        result = await dispatch(updateProject({ id: initialData.id, data: payload }));
      } else {
        result = await dispatch(createProject(payload));
      }

      if (result.meta.requestStatus === 'fulfilled') {
        reset();
        onClose();
        onSuccess();
      }
    } catch (error) {
      // Error is handled by Redux
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Edit Project' : 'Create New Project'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>
              Project Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...register('name', { required: 'Project name is required' })}
              placeholder="Enter project name"
              isInvalid={!!errors.name}
            />
            {errors.name && <Form.Text className="text-danger">{errors.name.message}</Form.Text>}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              {...register('description')}
              as="textarea"
              rows={3}
              placeholder="Project description (optional)"
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>
                  Start Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  {...register('start_date', { required: 'Start date is required' })}
                  type="date"
                  isInvalid={!!errors.start_date}
                />
                {errors.start_date && (
                  <Form.Text className="text-danger">{errors.start_date.message}</Form.Text>
                )}
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  {...register('end_date', {
                    validate: (value) => {
                      if (value && startDate && new Date(value) < new Date(startDate)) {
                        return 'End date must be after start date';
                      }
                      return true;
                    },
                  })}
                  type="date"
                  isInvalid={!!errors.end_date}
                />
                {errors.end_date && (
                  <Form.Text className="text-danger">{errors.end_date.message}</Form.Text>
                )}
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>
              Budget <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              {...register('budget', {
                required: 'Budget is required',
                min: { value: 0, message: 'Budget must be positive' },
              })}
              type="number"
              placeholder="0.00"
              step="0.01"
              isInvalid={!!errors.budget}
            />
            {errors.budget && (
              <Form.Text className="text-danger">{errors.budget.message}</Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select {...register('status')}>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="complete">Complete</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" className="me-2" animation="border" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditing ? (
                'Update Project'
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
