import React from 'react';

export const InputField = ({ label, type = 'text', value, onChange, placeholder, required = false, disabled = false }) => (
  <div className="form-field">
    <label>{label}{required && ' *'}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="form-input"
    />
  </div>
);

export const SelectField = ({ label, value, onChange, options, required = false }) => (
  <div className="form-field">
    <label>{label}{required && ' *'}</label>
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="form-select"
    >
      <option value="">Seleccionar...</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export const RadioGroup = ({ label, options, value, onChange }) => (
  <div className="form-field">
    <label>{label}</label>
    <div className="radio-group">
      {options.map((option) => (
        <label key={option.value} className="radio-option">
          <input
            type="radio"
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);