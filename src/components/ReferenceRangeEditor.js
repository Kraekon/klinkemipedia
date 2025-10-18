import React from 'react';
import { Table, Button } from 'react-bootstrap';

const ReferenceRangeEditor = ({ value = [], onChange }) => {
  const handleAddRange = () => {
    onChange([...value, { parameter: '', range: '', unit: '', ageGroup: 'All', notes: '' }]);
  };

  const handleRemoveRange = (index) => {
    if (value.length > 1) {
      const newRanges = value.filter((_, i) => i !== index);
      onChange(newRanges);
    }
  };

  const handleChange = (index, field, newValue) => {
    const newRanges = [...value];
    newRanges[index] = { ...newRanges[index], [field]: newValue };
    onChange(newRanges);
  };

  return (
    <div className="reference-range-editor">
      <Table bordered responsive className="reference-range-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Range</th>
            <th>Unit</th>
            <th>Age Group</th>
            <th>Notes</th>
            <th style={{ width: '80px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {value.map((range, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={range.parameter || ''}
                  onChange={(e) => handleChange(index, 'parameter', e.target.value)}
                  placeholder="e.g., Sodium"
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={range.range || ''}
                  onChange={(e) => handleChange(index, 'range', e.target.value)}
                  placeholder="e.g., 136-145"
                />
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={range.unit || ''}
                  onChange={(e) => handleChange(index, 'unit', e.target.value)}
                  placeholder="e.g., mmol/L"
                />
              </td>
              <td>
                <select
                  className="form-select"
                  value={range.ageGroup || 'All'}
                  onChange={(e) => handleChange(index, 'ageGroup', e.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Adult">Adult</option>
                  <option value="Pediatric">Pediatric</option>
                  <option value="Neonatal">Neonatal</option>
                  <option value="Geriatric">Geriatric</option>
                </select>
              </td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={range.notes || ''}
                  onChange={(e) => handleChange(index, 'notes', e.target.value)}
                  placeholder="Optional notes"
                />
              </td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveRange(index)}
                  disabled={value.length === 1}
                  title={value.length === 1 ? 'Cannot delete last range' : 'Delete range'}
                >
                  ✕
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button variant="primary" onClick={handleAddRange} className="mt-2">
        + Add Range
      </Button>
    </div>
  );
};

export default ReferenceRangeEditor;
