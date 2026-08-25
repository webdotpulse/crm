import React, { useState } from 'react'
import { X, FolderKanban, Building2, DollarSign, Clock } from 'lucide-react'
import { Project, ProjectStatus } from '../../types'
import { useApp } from '../../context/AppContext'

interface ProjectModalProps {
  project?: Project | null
  onClose: () => void
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const { companies, addProject, updateProject } = useApp()

  const [title, setTitle] = useState(project?.title || '')
  const [companyId, setCompanyId] = useState(project?.companyId || companies[0]?.id || '')
  const [status, setStatus] = useState<ProjectStatus>(project?.status || 'planning')
  const [startDate, setStartDate] = useState(project?.startDate || new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(
    project?.endDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  )
  const [budgetHours, setBudgetHours] = useState(project?.budgetHours || 0)
  const [hourlyRate, setHourlyRate] = useState(project?.hourlyRate || 0)
  const [budgetAmount, setBudgetAmount] = useState(project?.budgetAmount || 0)
  const [progressPercent, setProgressPercent] = useState(project?.progressPercent || 0)
  const [description, setDescription] = useState(project?.description || '')
  const [color, setColor] = useState(project?.color || '#3f78e0')

  const handleHoursChange = (hrs: number) => {
    setBudgetHours(hrs)
    setBudgetAmount(hrs * hourlyRate)
  }

  const handleRateChange = (rate: number) => {
    setHourlyRate(rate)
    setBudgetAmount(budgetHours * rate)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !companyId) return

    const payload = {
      title,
      companyId,
      status,
      startDate,
      endDate,
      budgetHours: Number(budgetHours),
      budgetAmount: Number(budgetAmount),
      hourlyRate: Number(hourlyRate),
      progressPercent: Number(progressPercent),
      description,
      color,
    }

    if (project) {
      updateProject({ ...project, ...payload })
    } else {
      addProject(payload)
    }

    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--sb-primary-soft)',
                color: 'var(--sb-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FolderKanban size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>{project ? 'Edit Project' : 'New Project'}</h3>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-icon btn-sandbox-secondary" style={{ borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Project Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Telematics Fleet Portal"
              className="form-input-sandbox"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Client Company *</label>
              <select
                required
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="form-select-sandbox"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="form-select-sandbox"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review & QA</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Deadline / Delivery Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input-sandbox"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Budget Hours</label>
              <input
                type="number"
                min="1"
                value={budgetHours}
                onChange={(e) => handleHoursChange(Number(e.target.value))}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Hourly Rate (€/hr)</label>
              <input
                type="number"
                min="0"
                value={hourlyRate}
                onChange={(e) => handleRateChange(Number(e.target.value))}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Budget Cap (€)</label>
              <input
                type="number"
                min="0"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(Number(e.target.value))}
                className="form-input-sandbox"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Project Description & Scope</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Milestone goals, architecture requirements, deliverables..."
              className="form-textarea-sandbox"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-sandbox btn-sandbox-primary">
              {project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
