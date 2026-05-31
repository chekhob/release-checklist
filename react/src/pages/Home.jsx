import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProjects, createProject } from '../services/api'
import './Home.css'

const DEFAULT_STEPS = [
  'Code review',
  'Tests passing',
  'Documentation updated',
  'Changelog updated',
  'Version bumped',
]

export default function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [steps, setSteps] = useState(DEFAULT_STEPS)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    const validSteps = steps.filter((s) => s.trim())
    const stepObjects = validSteps.map((question, i) => ({
      question,
      order: i,
      status: false,
    }))
    await createProject({
      name: name.trim(),
      steps: stepObjects,
    })
    setName('')
    setSteps(DEFAULT_STEPS)
    setShowForm(false)
    setCreating(false)
    await loadProjects()
  }

  function addStep() {
    setSteps([...steps, ''])
  }

  function updateStep(index, value) {
    const next = [...steps]
    next[index] = value
    setSteps(next)
  }

  function removeStep(index) {
    if (steps.length <= 1) return
    setSteps(steps.filter((_, i) => i !== index))
  }

  return (
    <section className="home">
      <div className="home-header">
        <h1>Release Checklist</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {showForm && (
        <form className="create-form" onSubmit={handleCreate}>
          <input
            className="input"
            type="text"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="steps-editor">
            <label className="steps-label">Checklist Steps</label>
            {steps.map((step, i) => (
              <div className="step-input-row" key={i}>
                <input
                  className="input"
                  type="text"
                  placeholder={`Step ${i + 1}`}
                  value={step}
                  onChange={(e) => updateStep(i, e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => removeStep(i)}
                  disabled={steps.length <= 1}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-sm"
              onClick={addStep}
            >
              + Add step
            </button>
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={!name.trim() || creating}
          >
            {creating ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="empty">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="empty">No projects yet. Create one to get started.</p>
      ) : (
        <div className="project-list">
          {projects.map((p) => (
            <Link to={`/project/${p.id}`} className="project-card" key={p.id}>
              <div className="project-card-top">
                <h2 className="project-name">{p.name}</h2>
                <span className={`badge badge-${p.status}`}>{p.status}</span>
              </div>
              <p className="project-meta">
                {p.steps.filter((s) => s.status).length}/{p.steps.length} steps completed
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
