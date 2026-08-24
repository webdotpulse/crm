import React, { useState } from 'react'
import { X, CheckSquare, Clock, User } from 'lucide-react'
import { Task, TaskPriority, TaskStatus } from '../../types'
import { useApp } from '../../context/AppContext'

interface TaskModalProps {
  task?: Task | null
  projectId: string
  onClose: () => void
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, projectId, onClose }) => {
  const { addTask, updateTask } = useApp()

  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [assignee, setAssignee] = useState(task?.assignee || 'Koen De Vries')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium')
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo')
  const [estimatedHours, setEstimatedHours] = useState(task?.estimatedHours || 8)
  const [startDate, setStartDate] = useState(task?.startDate || new Date().toISOString().slice(0, 10))
  const [dueDate, setDueDate] = useState(
    task?.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const payload = {
      projectId,
      title,
      description,
      assignee,
      priority,
      status,
      estimatedHours: Number(estimatedHours),
      startDate,
      dueDate,
    }

    if (task) {
      updateTask({ ...task, ...payload })
    } else {
      addTask(payload)
    }

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
              <CheckSquare size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>{task ? 'Edit Task' : 'New Project Task'}</h3>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-icon btn-sandbox-secondary" style={{ borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement UBL XML export & schema validation"
              className="form-input-sandbox"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Assignee</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="form-select-sandbox"
              >
                <option value="Koen De Vries">Koen De Vries</option>
                <option value="Lucas Dubois">Lucas Dubois</option>
                <option value="Elena Rostova">Elena Rostova</option>
                <option value="Unassigned">Unassigned</option>
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="form-select-sandbox"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="form-select-sandbox"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="form-label">Est. Hours</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="form-input-sandbox"
              />
            </div>
            <div>
              <label className="form-label">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="form-input-sandbox"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Task Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Acceptance criteria, technical notes, links..."
              className="form-textarea-sandbox"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-sandbox btn-sandbox-primary">
              {task ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
