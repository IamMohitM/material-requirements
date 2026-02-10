import { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { createRequest } from '../../store/slices/requestsSlice';
import { fetchProjects, searchProjects, createProject } from '../../store/slices/projectsSlice';
import { fetchMaterials, searchMaterials, createMaterial } from '../../store/slices/materialsSlice';
import { SearchableSelect } from '../common/SearchableSelect';
import { CreateItemModal } from '../common/CreateItemModal';
import { UnitSelector } from '../common/UnitSelector';
import { UNIT_OPTIONS, MATERIAL_CATEGORIES } from '../../utils/unitConstants';
import { Project } from '../../services/projectsApi';

interface RequestFormProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  project_id: string;
  approval_notes?: string;
}

interface MaterialLineItem {
  material_id: string;
  quantity: number;
  unit?: string;
  material_name?: string;
}

export const RequestForm: React.FC<RequestFormProps> = ({ show, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { isLoading: requestLoading, error: requestError } = useAppSelector(
    (state) => state.requests
  );
  const { projects, isLoading: projectsLoading, error: projectsError } = useAppSelector(
    (state) => state.projects
  );
  const { materials, isLoading: materialsLoading, error: materialsError } = useAppSelector(
    (state) => state.materials
  );
  const { user } = useAppSelector((state) => state.auth);

  const [materials_list, setMaterials] = useState<MaterialLineItem[]>([
    { material_id: '', quantity: 0, unit: '' },
  ]);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateMaterial, setShowCreateMaterial] = useState(false);

  const isAdmin = user?.role === 'admin';

  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      project_id: '',
      approval_notes: '',
    },
  });

  // Fetch projects and materials on mount
  useEffect(() => {
    dispatch(fetchProjects({ pageSize: 100 }));
    dispatch(fetchMaterials({ pageSize: 100 }));
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    const validMaterials = materials_list.filter(
      (item) => item.material_id && item.quantity > 0 && item.unit
    );

    if (validMaterials.length === 0) {
      alert('Please add at least one material with quantity and unit');
      return;
    }

    const payload: any = {
      project_id: selectedProject?.id || data.project_id,
      materials: validMaterials.map((m) => ({
        material_id: m.material_id,
        quantity: m.quantity,
        unit: m.unit,
      })),
    };

    // Only include approval_notes if it has a value
    if (data.approval_notes?.trim()) {
      payload.approval_notes = data.approval_notes;
    }

    try {
      const result = await dispatch(
        createRequest(payload)
      );

      if (result.meta.requestStatus === 'fulfilled') {
        reset();
        setMaterials([{ material_id: '', quantity: 0, unit: '' }]);
        setSelectedProject(null);
        onSuccess();
      }
    } catch (error) {
      // Error is handled by Redux and displayed in UI
    }
  };

  const handleProjectSearch = (query: string) => {
    if (query.trim()) {
      dispatch(searchProjects(query));
    } else {
      dispatch(fetchProjects({ pageSize: 100 }));
    }
  };

  const handleMaterialSearch = (query: string) => {
    if (query.trim()) {
      dispatch(searchMaterials(query));
    } else {
      dispatch(fetchMaterials({ pageSize: 100 }));
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCreateProject = async (projectData: any) => {
    const payload: any = {
      name: projectData.name,
      start_date: projectData.start_date,
      budget: parseFloat(projectData.budget),
      status: projectData.status || 'planning',
    };

    // Only add optional fields if they have values
    if (projectData.description?.trim()) {
      payload.description = projectData.description.trim();
    }
    if (projectData.end_date) {
      payload.end_date = projectData.end_date;
    }

    const result = await dispatch(createProject(payload));

    if (result.meta.requestStatus === 'fulfilled') {
      setSelectedProject(result.payload as Project);
      setShowCreateProject(false);
    }
  };

  const handleCreateMaterial = async (materialData: any) => {
    const payload: any = {
      name: materialData.name,
    };

    // Only add optional fields if they have values
    if (materialData.description?.trim()) {
      payload.description = materialData.description.trim();
    }
    if (materialData.unit) {
      payload.unit = materialData.unit;
    }
    if (materialData.category) {
      payload.category = materialData.category;
    }

    const result = await dispatch(createMaterial(payload));

    if (result.meta.requestStatus === 'fulfilled') {
      setShowCreateMaterial(false);
      // Material will be available in materials list for selection
    }
  };

  const addMaterial = () => {
    setMaterials([...materials_list, { material_id: '', quantity: 0, unit: '' }]);
  };

  const removeMaterial = (index: number) => {
    if (materials_list.length > 1) {
      setMaterials(materials_list.filter((_, i) => i !== index));
    }
  };

  const updateMaterial = (index: number, field: string, value: any) => {
    const newMaterials = [...materials_list];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    setMaterials(newMaterials);
  };

  const projectOptions = projects.map((p) => ({
    id: p.id,
    label: p.name,
    description: `Budget: $${p.budget} • Status: ${p.status}`,
  }));

  const materialOptions = materials.map((m) => ({
    id: m.id,
    label: m.name,
    description: `Code: ${m.material_code} • Unit: ${m.unit}`,
    badge: m.category,
  }));

  return (
    <>
      <Modal show={show} onHide={onClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Material Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {requestError && <Alert variant="danger">{requestError}</Alert>}
          {projectsError && <Alert variant="warning">Project error: {projectsError}</Alert>}
          {materialsError && <Alert variant="warning">Material error: {materialsError}</Alert>}

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>
                Project * <small className="text-muted">(search or create new)</small>
              </Form.Label>
              <SearchableSelect
                placeholder="Search projects by name..."
                options={projectOptions}
                isLoading={projectsLoading}
                onSearch={handleProjectSearch}
                onSelect={(opt) => {
                  const found = projects.find((p) => p.id === opt.id);
                  handleProjectSelect(found!);
                }}
                onCreateNew={isAdmin ? () => setShowCreateProject(true) : undefined}
                canCreate={isAdmin}
                selectedLabel={selectedProject?.name}
              />
              <input type="hidden" {...register('project_id')} value={selectedProject?.id || ''} />
              {!selectedProject && <Form.Text className="text-danger">Project is required</Form.Text>}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                {...register('approval_notes')}
                as="textarea"
                rows={3}
                placeholder="Add any notes or special instructions for this request"
              />
            </Form.Group>

            <div className="mb-4">
              <h5>
                Materials <small className="text-muted">(quantity only, no pricing)</small>
              </h5>
              {materials_list.map((item, index) => (
                <div key={index} className="mb-3 p-3 border rounded">
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <Form.Label>Material *</Form.Label>
                      <SearchableSelect
                        placeholder="Search materials..."
                        options={materialOptions}
                        isLoading={materialsLoading}
                        onSearch={handleMaterialSearch}
                        onSelect={(opt) => {
                          const newMaterials = [...materials_list];
                          newMaterials[index] = {
                            ...newMaterials[index],
                            material_id: opt.id,
                            material_name: opt.label,
                          };
                          setMaterials(newMaterials);
                        }}
                        onCreateNew={
                          isAdmin
                            ? () => setShowCreateMaterial(true)
                            : undefined
                        }
                        canCreate={isAdmin}
                        selectedLabel={
                          materials_list[index].material_name ||
                          (item.material_id
                            ? materials.find((m) => m.id === item.material_id)?.name
                            : '')
                        }
                      />
                      <Form.Text className="text-muted d-block mt-1">
                        {materialsLoading ? 'Loading...' : `${materialOptions.length} options available`}
                      </Form.Text>
                      {!item.material_id && (
                        <Form.Text className="text-danger d-block mt-1">
                          Material is required
                        </Form.Text>
                      )}
                    </div>
                    <div className="col-md-2 mb-2">
                      <Form.Label>Quantity *</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="0"
                        value={item.quantity}
                        onChange={(e) =>
                          updateMaterial(index, 'quantity', parseFloat(e.target.value) || 0)
                        }
                        isInvalid={!!(item.quantity <= 0 && item.material_id)}
                      />
                      {item.quantity <= 0 && item.material_id && (
                        <Form.Text className="text-danger">Quantity must be greater than 0</Form.Text>
                      )}
                    </div>
                    <div className="col-md-2 mb-2">
                      <Form.Label>Unit *</Form.Label>
                      <UnitSelector
                        value={item.unit}
                        onChange={(unit) => updateMaterial(index, 'unit', unit)}
                        isInvalid={!!(item.material_id && !item.unit)}
                      />
                      {item.material_id && !item.unit && (
                        <Form.Text className="text-danger">Unit is required</Form.Text>
                      )}
                    </div>
                    <div className="col-md-2 mb-2 d-flex align-items-end">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeMaterial(index)}
                        disabled={materials_list.length === 1}
                        className="w-100"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                  {item.material_id && item.quantity > 0 && item.unit && (
                    <Form.Text className="text-success d-block mt-2">
                      ✓ {item.quantity} {item.unit}
                    </Form.Text>
                  )}
                </div>
              ))}
              <Button variant="outline-secondary" onClick={addMaterial} className="mb-3">
                + Add Material
              </Button>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={onClose} disabled={requestLoading}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={requestLoading}>
                {requestLoading ? (
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

      {/* Create Project Modal */}
      <CreateItemModal
        show={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onSubmit={handleCreateProject}
        title="Project"
        isLoading={projectsLoading}
        fields={[
          { name: 'name', label: 'Project Name', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'start_date', label: 'Start Date', type: 'date', required: true },
          { name: 'end_date', label: 'End Date', type: 'date' },
          { name: 'budget', label: 'Budget ($)', type: 'number', required: true },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: 'planning', label: 'Planning' },
              { value: 'active', label: 'Active' },
              { value: 'paused', label: 'Paused' },
              { value: 'complete', label: 'Complete' },
            ],
          },
        ]}
      />

      {/* Create Material Modal */}
      <CreateItemModal
        show={showCreateMaterial}
        onClose={() => setShowCreateMaterial(false)}
        onSubmit={handleCreateMaterial}
        title="Material"
        isLoading={materialsLoading}
        fields={[
          { name: 'name', label: 'Material Name *', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          {
            name: 'unit',
            label: 'Unit of Measure',
            type: 'select',
            options: UNIT_OPTIONS.map((u) => ({ value: u.value, label: u.label })),
          },
          {
            name: 'category',
            label: 'Category',
            type: 'select',
            options: MATERIAL_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
          },
        ]}
      />
    </>
  );
};
