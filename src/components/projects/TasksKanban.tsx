import React from 'react'
import {
  CheckSquare,
  Clock,
  Play,
  Calendar,
  User,
  Edit2,
  Trash2,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { Task, TaskStatus, TaskPriority } from '../../types'
import { useApp } from '../../context/AppContext'

interface TasksKanbanProps {
  projectId: string
  onAddTask: () => void
  onEditTask: (task: Task) => void
}

const TASK_COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: '#60697b' },
  { id: 'in_progress', label: 'In Progress', color: '#3f78e0' },
  { id: 'review', label: 'In Review', color: '#fab758' },
  { id: 'done', label: 'Done', color: '#38b995' },
]

export const TasksKanban: React.FC<TasksKanbanProps> = ({
  projectId,
  onAddTask,
  onEditTask,
}) => {
  const { tasks, moveTaskStatus, deleteTask, startTimer } = useApp()

  const projectTasks = tasks.filter((t) => t.projectId === projectId)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem' }}>Tasks Board</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>
            Manage sprints, assign deliverables, and track real-time progress.
          </p>
        </div>
        <button onClick={onAddTask} className="btn-sandbox btn-sandbox-sm btn-sandbox-primary">
          <Plus size={14} />
          <span>Add Task</span>
        </button>
      </div>

      <div className="kanban-board" style={{ minHeight: '480px' }}>
        {TASK_COLUMNS.map((col) => {
          const colTasks = projectTasks.filter((t) => t.status === col.id)
          return (
            <div key={col.id} className="kanban-col">
              <div className="kanban-col-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: col.color,
                    }}
                  />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--sb-heading)' }}>
                    {col.label}
                  </span>
                </div>
                <span className="badge-soft badge-soft-dark" style={{ fontSize: '0.7rem' }}>
                  {colTasks.length}
                </span>
              </div>

              <div className="kanban-col-body">
                {colTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--sb-body-subtle)', fontSize: '0.78rem' }}>
                    No tasks in {col.label.toLowerCase()}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div key={task.id} className="kanban-card">
                      {/* Priority and Title */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                        <span
                          className={`badge-soft badge-soft-${
                            task.priority === 'urgent'
                              ? 'danger'
                              : task.priority === 'high'
                              ? 'warning'
                              : task.priority === 'medium'
                              ? 'primary'
                              : 'dark'
                          }`}
                          style={{ fontSize: '0.65rem' }}
                        >
                          {task.priority.toUpperCase()}
                        </span>

                        <button
                          onClick={() => startTimer(task.projectId, task.id, task.title)}
                          className="btn-sandbox btn-icon btn-sandbox-soft-primary"
                          style={{ width: '22px', height: '22px', padding: 0 }}
                          title="Start live timer on task"
                        >
                          <Play size={11} />
                        </button>
                      </div>

                      <h4 style={{ fontSize: '0.88rem', color: 'var(--sb-heading)', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                        {task.title}
                      </h4>

                      {task.description && (
                        <p
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--sb-body)',
                            marginBottom: '0.6rem',
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {task.description}
                        </p>
                      )}

                      {/* Hours & Assignee */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--sb-body-subtle)', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <User size={12} />
                          <span>{task.assignee}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} />
                          <span>
                            {task.loggedHours.toFixed(1)} / {task.estimatedHours}h
                          </span>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div
                        style={{
                          borderTop: '1px solid var(--sb-border)',
                          paddingTop: '0.45rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <select
                          value={task.status}
                          onChange={(e) => moveTaskStatus(task.id, e.target.value as TaskStatus)}
                          className="form-select-sandbox"
                          style={{
                            padding: '0.15rem 0.35rem',
                            fontSize: '0.7rem',
                            height: '24px',
                            width: 'auto',
                          }}
                        >
                          {TASK_COLUMNS.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                            </option>
                          ))}
                        </select>

                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            onClick={() => onEditTask(task)}
                            className="btn-sandbox btn-icon btn-sandbox-secondary"
                            style={{ width: '24px', height: '24px', padding: 0 }}
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="btn-sandbox btn-icon btn-sandbox-danger"
                            style={{ width: '24px', height: '24px', padding: 0 }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
