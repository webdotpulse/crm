import React, { useState } from 'react'
import { X, Clock, DollarSign } from 'lucide-react'
import { TimeEntry } from '../../types'
import { useApp } from '../../context/AppContext'

interface TimeEntryModalProps {
  projectId: string
  onClose: () => void
}

export const TimeEntryModal: React.FC<TimeEntryModalProps> = ({ projectId, onClose }) => {
  const { addTimeEntry, projects, tasks, users, currentUser } = useApp()

  const project = projects.find((p) => p.id === projectId)
  const projectTasks = tasks.filter((t) => t.projectId === projectId)

  const [taskId, setTaskId] = useState<string>(projectTasks[0]?.id || '')
  const [memberName, setMemberName] = useState(currentUser?.name || 'Team Member')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [hours, setHours] = useState(1.0)
  const [description, setDescription] = useState('')
  const [isBillable, setIsBillable] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || hours <= 0) return

    addTimeEntry({
      projectId,
      taskId: taskId || undefined,
      memberName,
      date,
      hours: Number(hours),
      description,
      isBillable,
      hourlyRate: project?.hourlyRate || 110,
    })

    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Log Work Hours</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--sb-body-subtle)' }}>
                {project?.title}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-icon btn-sandbox-secondary" style={{ borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Linked Task</label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="form-select-sandbox"
            >
              <option value="">-- General Project Work (No Task) --</option>
              {projectTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.status})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Team Member</label>
              <select
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="form-select-sandbox"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name}
                  </option>
                ))}
                {!users.some((u) => u.name === currentUser?.name) && currentUser?.name && (
                  <option value={currentUser.name}>{currentUser.name}</option>
                )}
              </select>
            </div>
            <div>
              <label className="form-label">Hours *</label>
              <input
                type="number"
                min="0.25"
                step="0.25"
                required
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input-sandbox"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Work Description *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you accomplish during this session?"
              className="form-textarea-sandbox"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="billable"
              checked={isBillable}
              onChange={(e) => setIsBillable(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--sb-primary)' }}
            />
            <label htmlFor="billable" style={{ fontSize: '0.85rem', color: 'var(--sb-heading)', cursor: 'pointer' }}>
              Billable to client (€{project?.hourlyRate || 110}/hr)
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-sandbox btn-sandbox-primary">
              Log Time Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
