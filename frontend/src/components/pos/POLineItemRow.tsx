import { LineItem } from '../../services/posApi';

interface POLineItemRowProps {
  item: LineItem;
  editable?: boolean;
  gstPercent?: number;
  excludeGST?: boolean;
  onUpdate?: (item: LineItem) => void;
}

const calculateGST = (subtotal: number, gstPercent: number = 18): number => {
  return Math.round(subtotal * (gstPercent / 100) * 100) / 100;
};

const calculateTotal = (
  quantity: number,
  unitPrice: number,
  discountPercent: number = 0,
  gstPercent: number = 18,
  excludeGST: boolean = false
): number => {
  const discountAmount = unitPrice * (discountPercent / 100);
  const finalUnitPrice = unitPrice - discountAmount;
  const subtotal = finalUnitPrice * quantity;
  const gst = excludeGST ? 0 : calculateGST(subtotal, gstPercent);
  return Math.round((subtotal + gst) * 100) / 100;
};

export const POLineItemRow: React.FC<POLineItemRowProps> = ({
  item,
  editable = false,
  gstPercent = 18,
  excludeGST = false,
  onUpdate
}) => {
  if (!editable) {
    // Read-only mode
    return (
      <tr>
        <td>{item.material_name || item.material_id}</td>
        <td className="text-end">{item.quantity}</td>
        <td>{item.unit}</td>
        <td className="text-end">₹{item.unit_price.toFixed(2)}</td>
        <td className="text-end">{(item.discount_percent || 0).toFixed(1)}%</td>
        <td className="text-end">₹{item.gst_amount.toFixed(2)}</td>
        <td className="text-end fw-bold">₹{item.total.toFixed(2)}</td>
      </tr>
    );
  }

  // Editable mode
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = Math.max(0, Number(e.target.value) || 0);
    const discountPercent = item.discount_percent || 0;
    const gst = calculateGST(quantity * (item.unit_price * (1 - discountPercent / 100)), gstPercent);
    const total = calculateTotal(quantity, item.unit_price, discountPercent, gstPercent, excludeGST);

    onUpdate?.({
      ...item,
      quantity,
      gst_amount: excludeGST ? 0 : gst,
      total,
    });
  };

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const unitPrice = Math.max(0, Number(e.target.value) || 0);
    const discountPercent = item.discount_percent || 0;
    const gst = calculateGST(item.quantity * (unitPrice * (1 - discountPercent / 100)), gstPercent);
    const total = calculateTotal(item.quantity, unitPrice, discountPercent, gstPercent, excludeGST);

    onUpdate?.({
      ...item,
      unit_price: unitPrice,
      gst_amount: excludeGST ? 0 : gst,
      total,
    });
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const discountPercent = Math.min(100, Math.max(0, Number(e.target.value) || 0));
    const gst = calculateGST(item.quantity * (item.unit_price * (1 - discountPercent / 100)), gstPercent);
    const total = calculateTotal(item.quantity, item.unit_price, discountPercent, gstPercent, excludeGST);

    onUpdate?.({
      ...item,
      discount_percent: discountPercent,
      gst_amount: excludeGST ? 0 : gst,
      total,
    });
  };

  return (
    <tr>
      <td>{item.material_name || item.material_id}</td>
      <td className="text-end">
        <input
          type="number"
          min="0"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="form-control form-control-sm"
          style={{ width: '70px' }}
        />
      </td>
      <td>{item.unit}</td>
      <td className="text-end">
        <div className="input-group input-group-sm" style={{ width: '100px' }}>
          <span className="input-group-text">₹</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={item.unit_price}
            onChange={handleUnitPriceChange}
            className="form-control"
          />
        </div>
      </td>
      <td className="text-end">
        <div className="input-group input-group-sm" style={{ width: '80px' }}>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={(item.discount_percent || 0).toFixed(1)}
            onChange={handleDiscountChange}
            className="form-control"
          />
          <span className="input-group-text">%</span>
        </div>
      </td>
      <td className="text-end">₹{item.gst_amount.toFixed(2)}</td>
      <td className="text-end fw-bold">₹{item.total.toFixed(2)}</td>
    </tr>
  );
};
