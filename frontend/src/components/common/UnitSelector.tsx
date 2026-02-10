import { Form } from 'react-bootstrap';
import { UNIT_OPTIONS } from '../../utils/unitConstants';

interface UnitSelectorProps {
  value?: string;
  onChange: (unit: string) => void;
  disabled?: boolean;
  isInvalid?: boolean;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  isInvalid = false,
}) => {
  return (
    <Form.Select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      isInvalid={isInvalid}
    >
      <option value="">Select unit...</option>
      {UNIT_OPTIONS.map((unit) => (
        <option key={unit.value} value={unit.value}>
          {unit.label}
        </option>
      ))}
    </Form.Select>
  );
};
