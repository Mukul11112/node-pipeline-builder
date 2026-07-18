// NodeField.js
// Renders one declarative field spec. Adding a new control type here
// makes it instantly available to every node in the app.

export const NodeField = ({ field, value, onChange }) => {
  const { label, type = 'text', options = [], placeholder, min, max, step } = field;

  const control = () => {
    switch (type) {
      case 'select':
        return (
          <select
            className="field__control"
            value={value ?? options[0]?.value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            className="field__control field__control--area"
            value={value ?? ''}
            placeholder={placeholder}
            rows={3}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case 'number':
        return (
          <input
            className="field__control"
            type="number"
            value={value ?? ''}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case 'checkbox':
        return (
          <label className="field__switch">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
            />
            <span className="field__switch-track" />
          </label>
        );

      default:
        return (
          <input
            className="field__control"
            type="text"
            value={value ?? ''}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className="field field--inline">
        <span className="field__label">{label}</span>
        {control()}
      </div>
    );
  }

  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {control()}
    </label>
  );
};
