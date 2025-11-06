import React, { memo, useId } from 'react';
import PropTypes from 'prop-types';

// Memoized component for performance
const SGPAInput = memo(function SGPAInput({ 
  name, 
  placeholder, 
  value, 
  onChange, 
  error, 
  disabled,
  onBlur,
  autoFocus,
  maxLength = "5",
  required = false,
  testId
}) {
  const inputId = useId();
  const errorId = useId();

  return (
    <div className="form-group sgpa-input-group">
      <label 
        htmlFor={inputId} 
        className="sr-only"
      >
        {placeholder}
      </label>
      <div className="input-wrapper">
        <input
          type="text"
          id={inputId}
          name={name}
          className={`sgpa-input ${error ? 'input-error' : ''} ${value ? 'has-value' : ''}`}
          placeholder={placeholder}
          value={value || ''}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          maxLength={maxLength}
          autoFocus={autoFocus}
          inputMode="decimal" // Mobile keyboard with numbers
          autoComplete="off"
          spellCheck="false"
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
          data-testid={testId}
        />
        {/* Clear button */}
        {value && !disabled && (
          <button
            type="button"
            className="clear-button"
            onClick={() => onChange({ target: { name, value: '' } })}
            aria-label={`Clear ${placeholder}`}
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </div>
      {/* Error display */}
      {error && (
        <span 
          id={errorId} 
          className="error-text" 
          role="alert"
          aria-live="polite"
        >
          <span className="error-icon" aria-hidden="true">⚠</span>
          {error}
        </span>
      )}
    </div>
  );
});

SGPAInput.propTypes = {
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  onBlur: PropTypes.func,
  autoFocus: PropTypes.bool,
  maxLength: PropTypes.string,
  required: PropTypes.bool,
  testId: PropTypes.string,
};

SGPAInput.defaultProps = {
  disabled: false,
  autoFocus: false,
  maxLength: "5",
  required: false,
};

export default SGPAInput;
