import React from 'react'
import { Calendar, User, Clock } from 'lucide-react'
import { Project, Task } from '../../types'
import { useApp } from '../../context/AppContext'

interface GanttChartProps {
  project: Project
  tasks: Task[]
}

export const GanttChart: React.FC<GanttChartProps> = ({ project, tasks }) => {
  // Generate 8-week timeline columns based on project dates
  const startDate = new Date(project.startDate || '2026-06-01')
  const endDate = new Date(project.endDate || '2026-09-30')
  const totalDurationMs = Math.max(1, endDate.getTime() - startDate.getTime())

  // Generate 8 timeline checkpoints
  const numSteps = 8
  const stepMs = totalDurationMs / numSteps
  const timeHeaders: string[] = []
  for (let i = 0; i <= numSteps; i++) {
    const d = new Date(startDate.getTime() + i * stepMs)
    timeHeaders.push(
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    )
  }

  const getBarPosition = (task: Task) => {
    const taskStart = task.startDate ? new Date(task.startDate) : startDate
    const taskEnd = task.dueDate ? new Date(task.dueDate) : endDate

    const startOffsetMs = Math.max(0, taskStart.getTime() - startDate.getTime())
    const durationMs = Math.max(86400000 * 3, taskEnd.getTime() - taskStart.getTime())

    const leftPercent = Math.min(90, Math.max(0, (startOffsetMs / totalDurationMs) * 100))
    const widthPercent = Math.min(100 - leftPercent, Math.max(8, (durationMs / totalDurationMs) * 100))

    return { left: `${leftPercent}%`, width: `${widthPercent}%` }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h3 style={{ fontSize: '1.15rem' }}>Interactive Gantt & Milestone Timeline</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>
          Visualize task durations, cross-functional dependencies, and delivery milestones.
        </p>
      </div>

      <div className="gantt-container card-sandbox" style={{ overflowX: 'auto' }}>
        {/* Timeline Header */}
        <div className="gantt-header" style={{ minWidth: '960px' }}>
          <div className="gantt-label-col" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} color="var(--sb-primary)" />
            <span>Task Deliverable</span>
          </div>

          <div className="gantt-timeline-area">
            {timeHeaders.slice(0, -1).map((th, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--sb-body)',
                  borderRight: '1px dashed var(--sb-border)',
                  textAlign: 'center',
                }}
              >
                {th}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Task Rows */}
        <div style={{ minWidth: '960px' }}>
          {tasks.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--sb-body-subtle)' }}>
              No tasks currently planned in this project.
            </div>
          ) : (
            tasks.map((task) => {
              const { left, width } = getBarPosition(task)
              const isDone = task.status === 'done'
              const isInProgress = task.status === 'in_progress'

              return (
                <div key={task.id} className="gantt-row">
                  {/* Left Label */}
                  <div className="gantt-label-col">
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--sb-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--sb-body-subtle)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span>{task.assignee}</span>
                      <span>•</span>
                      <span>{task.estimatedHours}h est</span>
                    </div>
                  </div>

                  {/* Right Timeline Canvas */}
                  <div className="gantt-timeline-area">
                    {/* Grid Background Lines */}
                    {timeHeaders.slice(0, -1).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: '100%',
                          borderRight: '1px dashed var(--sb-border)',
                        }}
                      />
                    ))}

                    {/* Task Bar */}
                    <div
                      className="gantt-bar"
                      style={{
                        left,
                        width,
                        top: '12px',
                        backgroundColor: isDone ? 'var(--sb-success)' : isInProgress ? 'var(--sb-primary)' : 'var(--sb-secondary)',
                        background: isDone
                          ? 'linear-gradient(135deg, #38b995, #2ea382)'
                          : isInProgress
                          ? 'linear-gradient(135deg, #3f78e0, #605dba)'
                          : 'linear-gradient(135deg, #7452d6, #5b3fb8)',
                      }}
                      title={`${task.title} (${task.status.toUpperCase()}) - ${task.assignee}`}
                    >
                      <span
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {task.title}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
