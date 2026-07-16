import { ChevronDown } from 'lucide-react'

export function AccordionSection({ icon: Icon, title, subtitle, open, onToggle, children }) {
  return (
    <section className={`accordion-section ${open ? 'is-open' : ''}`}>
      <button className="accordion-trigger" type="button" onClick={onToggle} aria-expanded={open}>
        <span className="accordion-title">
          <Icon size={18} />
          <span>
            <strong>{title}</strong>
            {subtitle ? <small>{subtitle}</small> : null}
          </span>
        </span>
        <ChevronDown className="accordion-chevron" size={18} />
      </button>
      {open ? <div className="accordion-content">{children}</div> : null}
    </section>
  )
}
