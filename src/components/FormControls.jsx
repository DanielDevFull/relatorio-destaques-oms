export function Field({ label, required = false, hint, children, className = '' }) {
  return (
    <label className={`field ${className}`}>
      <span className="field-label">
        {label}
        {required ? <span aria-hidden="true">*</span> : null}
      </span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  )
}

export function TextInput({ value, onChange, ...props }) {
  return (
    <input
      {...props}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

export function TextArea({ value, onChange, ...props }) {
  return (
    <textarea
      {...props}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

export function SelectInput({ value, onChange, children, ...props }) {
  return (
    <select {...props} value={value} onChange={(event) => onChange(event.target.value)}>
      {children}
    </select>
  )
}

export function InputWithSuffix({ value, onChange, suffix, ...props }) {
  return (
    <span className="input-suffix-wrap">
      <TextInput {...props} value={value} onChange={onChange} />
      <span>{suffix}</span>
    </span>
  )
}
