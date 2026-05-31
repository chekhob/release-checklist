import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProject, deleteProject, toggleStep } from '../services/api'
import './ProjectDetail.css'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    getProject(id)
      .then((data) => {
        if (!cancelled) {
          setProject(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProject(null)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [id, tick])

  async function handleToggle(stepId) {
    await toggleStep(id, stepId)
    setTick((t) => t + 1)
  }

  async function handleDelete() {
    await deleteProject(id)
    navigate('/')
  }

  if (loading) return <p className="empty">Loading...</p>
  if (!project) return <p className="empty">Project not found.</p>

  return (
    <section className="detail">
      <Link to="/" className="back-link">&larr; Back to projects</Link>

      <div className="detail-header">
        <div>
          <h1 className="detail-title">{project.name}</h1>
          <span className={`badge badge-${project.status}`}>{project.status}</span>
        </div>
        <button className="btn btn-danger" onClick={handleDelete}>
          Delete Project
        </button>
      </div>

      <div className="progress-bar-wrapper">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${project.steps.length ? (project.steps.filter((s) => s.status).length / project.steps.length) * 100 : 0}%`,
            }}
          />
        </div>
        <span className="progress-text">
          {project.steps.filter((s) => s.status).length}/{project.steps.length} steps completed
        </span>
      </div>

      <div className="checklist">
        {project.steps.map((step) => (
          <label
            className={`checklist-item ${step.status ? 'completed' : ''}`}
            key={step.order}
          >
            <input
              type="checkbox"
              checked={step.status}
              onChange={() => handleToggle(step.order)}
            />
            <span className="step-label">{step.question}</span>
            <span className={`step-status ${step.status ? 'done' : 'pending'}`}>
              {step.status ? 'Done' : 'Pending'}
            </span>
          </label>
        ))}
      </div>
    </section>
  )
}
