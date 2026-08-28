import type { MemeTemplate } from '../features/templates/types'

type TemplateSelectorProps = {
  templates: MemeTemplate[]
  value: string
  onChange: (value: string) => void
}

export function TemplateSelector({ templates, value, onChange }: TemplateSelectorProps) {
  const activeTemplate = templates.find((template) => template.id === value)

  return (
    <label className="template-control">
      <span className="sr-only">Choose meme template</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label="Choose meme template">
        {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
      </select>
      <span className="template-description">{activeTemplate?.description}</span>
    </label>
  )
}
