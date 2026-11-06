export function initTitle() {
  const el = document.createElement('div')
  el.className = 'app-title'
  el.textContent = 'The Guardrail Effect'

  const date = document.createElement('div')
  date.className = 'app-subtitle'
  date.textContent = 'made march 2026'
  el.appendChild(date)

  document.body.appendChild(el)
}
