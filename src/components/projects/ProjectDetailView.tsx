import React, { useState } from 'react'
import {
  ArrowLeft,
  FolderKanban,
  CheckSquare,
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Play,
  FileSignature,
  Receipt,
  User,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { Project, Task, TimeEntry } from '../../types'
import { useApp } from '../../context/AppContext'
import { TasksKanban } from './TasksKanban'
import { GanttChart } from './GanttChart'
import { TaskModal } from './TaskModal'
import { TimeEntryModal } from './TimeEntryModal'

interface ProjectDetailViewProps {
  projectId: string
  onBack: () => void
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ projectId, onBack }) => {
  const {
    projects,
    tasks,
    timeEntries,
    companies,
    deleteTimeEntry,
    invoiceProjectTimeEntries,
    setCurrentView,
    startTimer,
  } = useApp()

  const project = projects.find((p) => p.id === projectId)
  const [activeTab, setActiveTab] = useState<'tasks' | 'gantt' | 'timesheet' | 'finances'>('tasks')
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false)

  if (!project) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p>Project not found.</p>
        <button onClick={onBack} className="btn-sandbox btn-sandbox-primary" style={{ marginTop: '1rem' }}>
          Back to Projects
        </button>
      </div>
    )
  }

  const client = companies.find((c) => c.id === project.companyId)
  const projectTasks = tasks.filter((t) => t.projectId === projectId)
  const projectTimes = timeEntries.filter((t) => t.projectId === projectId)

  const totalLoggedHours = projectTimes.reduce((sum, t) => sum + t.hours, 0)
  const billableHours = projectTimes.filter((t) => t.isBillable).reduce((sum, t) => sum + t.hours, 0)
  const unbilledTimes = projectTimes.filter((t) => t.isBillable && !t.invoiceId)
  const unbilledHours = unbilledTimes.reduce((sum, t) => sum + t.hours, 0)
  const unbilledAmount = unbilledHours * (project.hourlyRate || 110)

  const budgetUsedPercent = Math.min(100, Math.round((totalLoggedHours / (project.budgetHours || 1)) * 100))

  const handleInvoiceUnbilled = () => {
    const inv = invoiceProjectTimeEntries(projectId)
    if (inv) {
      setCurrentView('invoices')
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Back Button & Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button onClick={onBack} className="btn-sandbox btn-sandbox-sm btn-sandbox-secondary">
          <ArrowLeft size={14} />
          <span>Projects</span>
        </button>
        <span style={{ color: 'var(--sb-body-subtle)' }}>/</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--sb-body)' }}>{client?.name}</span>
      </div>

      {/* Project Banner Card */}
      <div
        className="card-sandbox"
        style={{
          padding: '1.75rem',
          marginBottom: '1.5rem',
          backgroundColor: 'var(--sb-surface)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <h1 style={{ fontSize: '1.65rem' }}>{project.title}</h1>
              <span className="badge-soft badge-soft-primary" style={{ textTransform: 'uppercase' }}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <p style={{ color: 'var(--sb-body)', fontSize: '0.875rem' }}>
              Client: <strong>{client?.name}</strong> • Dates: {project.startDate} to {project.endDate}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={() => startTimer(project.id, undefined, `${project.title} Session`)}
              className="btn-sandbox btn-sandbox-primary"
            >
              <Play size={15} />
              <span>Start Timer</span>
            </button>
            <button
              onClick={() => setIsTimeModalOpen(true)}
              className="btn-sandbox btn-sandbox-secondary"
            >
              <Clock size={15} />
              <span>Log Time</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Chips */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            borderTop: '1px solid var(--sb-border)',
            paddingTop: '1.25rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--sb-body-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>
              HOURS LOGGED
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
              {totalLoggedHours.toFixed(1)} / {project.budgetHours} hrs
            </div>
            <div style={{ height: '5px', backgroundColor: 'var(--sb-bg)', borderRadius: '999px', marginTop: '0.3rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${budgetUsedPercent}%`, backgroundColor: budgetUsedPercent > 90 ? 'var(--sb-danger)' : 'var(--sb-primary)' }} />
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--sb-body-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>
              BILLABLE TOTAL
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--sb-success)' }}>
              €{(billableHours * (project.hourlyRate || 110)).toLocaleString()}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--sb-body-subtle)' }}>
              {billableHours.toFixed(1)} billable hrs @ €{project.hourlyRate}/h
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--sb-body-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>
              UNBILLED BALANCE
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--sb-warning)' }}>
              €{unbilledAmount.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--sb-body-subtle)' }}>
              {unbilledHours.toFixed(1)} hrs awaiting invoice
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--sb-body-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>
              COMPLETION RATE
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--sb-purple)' }}>
              {projectTasks.filter((t) => t.status === 'done').length} / {projectTasks.length} Tasks
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--sb-body-subtle)' }}>
              {project.progressPercent}% milestone progress
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--sb-border)',
          marginBottom: '1.5rem',
          gap: '0.5rem',
        }}
      >
        {[
          { id: 'tasks', label: `Tasks Kanban (${projectTasks.length})`, icon: <CheckSquare size={16} /> },
          { id: 'gantt', label: 'Timeline & Gantt', icon: <Calendar size={16} /> },
          { id: 'timesheet', label: `Timesheets (${projectTimes.length})`, icon: <Clock size={16} /> },
          { id: 'finances', label: 'Finances & Billing', icon: <DollarSign size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="btn-sandbox"
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 'var(--sb-radius-sm) var(--sb-radius-sm) 0 0',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--sb-primary)' : 'transparent'}`,
              backgroundColor: activeTab === tab.id ? 'var(--sb-surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--sb-primary)' : 'var(--sb-body)',
              fontWeight: 700,
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content Areas */}
      {activeTab === 'tasks' && (
        <TasksKanban
          projectId={projectId}
          onAddTask={() => {
            setEditingTask(null)
            setIsTaskModalOpen(true)
          }}
          onEditTask={(task) => {
            setEditingTask(task)
            setIsTaskModalOpen(true)
          }}
        />
      )}

      {activeTab === 'gantt' && <GanttChart project={project} tasks={projectTasks} />}

      {activeTab === 'timesheet' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Timesheet Logs</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                Detailed breakdown of billable and non-billable developer hours.
              </p>
            </div>
            <button onClick={() => setIsTimeModalOpen(true)} className="btn-sandbox btn-sandbox-primary">
              <Plus size={14} />
              <span>Log Time</span>
            </button>
          </div>

          <div className="card-sandbox" style={{ overflow: 'hidden' }}>
            <table className="table-sandbox">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Member</th>
                  <th>Task / Description</th>
                  <th>Hours</th>
                  <th>Rate</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projectTimes.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--sb-body-subtle)' }}>
                      No time entries logged yet.
                    </td>
                  </tr>
                ) : (
                  projectTimes.map((entry) => {
                    const task = tasks.find((t) => t.id === entry.taskId)
                    return (
                      <tr key={entry.id}>
                        <td>{entry.date}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                            <User size={13} color="var(--sb-body-subtle)" />
                            <span>{entry.memberName}</span>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--sb-heading)' }}>{entry.description}</div>
                            {task && <div style={{ fontSize: '0.72rem', color: 'var(--sb-body-subtle)' }}>Task: {task.title}</div>}
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--sb-primary)' }}>{entry.hours.toFixed(1)} hrs</strong>
                        </td>
                        <td>€{entry.hourlyRate}/hr</td>
                        <td>
                          {entry.invoiceId ? (
                            <span className="badge-soft badge-soft-success">INVOICED</span>
                          ) : entry.isBillable ? (
                            <span className="badge-soft badge-soft-warning">UNBILLED</span>
                          ) : (
                            <span className="badge-soft badge-soft-dark">NON-BILLABLE</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => deleteTimeEntry(entry.id)}
                            className="btn-sandbox btn-icon btn-sandbox-danger"
                            style={{ width: '26px', height: '26px', padding: 0 }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'finances' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
          {/* Left Financial Card */}
          <div className="card-sandbox" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Project Budget Consumption</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--sb-bg)', borderRadius: 'var(--sb-radius-sm)' }}>
                <span>Budget Cap:</span>
                <strong>€{project.budgetAmount.toLocaleString()} ({project.budgetHours} hrs)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--sb-bg)', borderRadius: 'var(--sb-radius-sm)' }}>
                <span>Total Work Logged:</span>
                <strong style={{ color: 'var(--sb-primary)' }}>€{(totalLoggedHours * (project.hourlyRate || 110)).toLocaleString()} ({totalLoggedHours.toFixed(1)} hrs)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--sb-bg)', borderRadius: 'var(--sb-radius-sm)' }}>
                <span>Unbilled Time Value:</span>
                <strong style={{ color: 'var(--sb-warning)' }}>€{unbilledAmount.toLocaleString()} ({unbilledHours.toFixed(1)} hrs)</strong>
              </div>
            </div>
          </div>

          {/* Right One-click Invoicing Card */}
          <div className="card-sandbox" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Receipt size={20} color="var(--sb-primary)" />
                <h3 style={{ fontSize: '1.15rem' }}>Invoice Unbilled Work</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--sb-body)', marginBottom: '1.25rem' }}>
                Automatically generate a compliant invoice (with structured payment reference and Peppol UBL export) for all {unbilledHours.toFixed(1)} pending billable hours.
              </p>

              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-heading)', marginBottom: '1rem' }}>
                €{unbilledAmount.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>Excl. VAT</span>
              </div>
            </div>

            <button
              onClick={handleInvoiceUnbilled}
              disabled={unbilledHours <= 0}
              className="btn-sandbox btn-sandbox-primary btn-sandbox-lg"
              style={{ width: '100%', gap: '0.6rem' }}
            >
              <Sparkles size={18} />
              <span>Generate Invoice ({unbilledHours.toFixed(1)} hrs)</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {isTaskModalOpen && (
        <TaskModal task={editingTask} projectId={projectId} onClose={() => setIsTaskModalOpen(false)} />
      )}

      {isTimeModalOpen && (
        <TimeEntryModal projectId={projectId} onClose={() => setIsTimeModalOpen(false)} />
      )}
    </div>
  )
}
