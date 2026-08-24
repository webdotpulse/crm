import React, { useState } from 'react'
import {
  FolderKanban,
  Plus,
  Search,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  CheckSquare,
  ChevronRight,
  Edit2,
  Trash2,
  Play,
} from 'lucide-react'
import { Project, ProjectStatus } from '../../types'
import { useApp } from '../../context/AppContext'
import { ProjectModal } from './ProjectModal'
import { ProjectDetailView } from './ProjectDetailView'

interface ProjectsViewProps {
  onOpenQuickModal: (type: 'deal' | 'quote' | 'project' | 'invoice' | 'company') => void
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onOpenQuickModal }) => {
  const {
    projects,
    tasks,
    timeEntries,
    companies,
    selectedProjectId,
    setSelectedProjectId,
    deleteProject,
    startTimer,
  } = useApp()

  const [activeFilter, setActiveFilter] = useState<'all' | 'in_progress' | 'planning' | 'review' | 'completed'>('all')
  const [localSearch, setLocalSearch] = useState('')
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  // If a project is currently open in detail view:
  if (selectedProjectId) {
    return (
      <ProjectDetailView
        projectId={selectedProjectId}
        onBack={() => setSelectedProjectId(null)}
      />
    )
  }

  const filteredProjects = projects.filter((p) => {
    if (activeFilter !== 'all' && p.status !== activeFilter) return false
    if (!localSearch.trim()) return true
    const s = localSearch.toLowerCase()
    const comp = companies.find((c) => c.id === p.companyId)
    return p.title.toLowerCase().includes(s) || (comp && comp.name.toLowerCase().includes(s))
  })

  return (
    <div style={{ padding: '2rem', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Project Planning & Execution</h1>
          <p style={{ color: 'var(--sb-body)' }}>
            Track client milestones, allocate developer sprints, manage billable hours, and monitor budget caps.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProject(null)
            setIsProjectModalOpen(true)
          }}
          className="btn-sandbox btn-sandbox-primary"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div
        className="card-sandbox"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Projects (${projects.length})` },
            { id: 'in_progress', label: `In Progress (${projects.filter((p) => p.status === 'in_progress').length})` },
            { id: 'planning', label: `Planning (${projects.filter((p) => p.status === 'planning').length})` },
            { id: 'review', label: `In Review (${projects.filter((p) => p.status === 'review').length})` },
            { id: 'completed', label: `Completed (${projects.filter((p) => p.status === 'completed').length})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`btn-sandbox btn-sandbox-sm ${activeFilter === f.id ? 'btn-sandbox-primary' : 'btn-sandbox-secondary'}`}
              style={{ borderRadius: 'var(--sb-radius-pill)' }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--sb-body-subtle)' }} />
          <input
            type="text"
            placeholder="Search projects..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="form-input-sandbox"
            style={{
              paddingLeft: '32px',
              height: '34px',
              fontSize: '0.8rem',
              borderRadius: 'var(--sb-radius-pill)',
            }}
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {filteredProjects.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--sb-body-subtle)' }}>No projects matching your filter criteria.</p>
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const comp = companies.find((c) => c.id === proj.companyId)
            const projTasks = tasks.filter((t) => t.projectId === proj.id)
            const projTimes = timeEntries.filter((t) => t.projectId === proj.id)
            const loggedHours = projTimes.reduce((sum, t) => sum + t.hours, 0)
            const budgetPercent = Math.min(100, Math.round((loggedHours / (proj.budgetHours || 1)) * 100))

            return (
              <div
                key={proj.id}
                className="card-sandbox card-sandbox-hover"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  {/* Top line: Client & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                      <Building2 size={14} color="var(--sb-body-subtle)" />
                      <span style={{ fontWeight: 600 }}>{comp?.name || 'Internal'}</span>
                    </div>

                    <span
                      className={`badge-soft badge-soft-${
                        proj.status === 'completed'
                          ? 'success'
                          : proj.status === 'in_progress'
                          ? 'primary'
                          : proj.status === 'review'
                          ? 'warning'
                          : 'dark'
                      }`}
                    >
                      {proj.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Project Title */}
                  <h3
                    onClick={() => setSelectedProjectId(proj.id)}
                    style={{ fontSize: '1.2rem', marginBottom: '0.5rem', cursor: 'pointer' }}
                  >
                    {proj.title}
                  </h3>

                  {proj.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                      {proj.description}
                    </p>
                  )}

                  {/* Progress Bar & Hours */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--sb-body-subtle)' }}>
                        Budget: {loggedHours.toFixed(1)} / {proj.budgetHours} hrs
                      </span>
                      <strong style={{ color: budgetPercent > 90 ? 'var(--sb-danger)' : 'var(--sb-primary)' }}>
                        {budgetPercent}% used
                      </strong>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--sb-bg)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${budgetPercent}%`,
                          backgroundColor: budgetPercent > 90 ? 'var(--sb-danger)' : proj.color || 'var(--sb-primary)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Meta Strip */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.78rem',
                      color: 'var(--sb-body)',
                      padding: '0.65rem 0',
                      borderTop: '1px solid var(--sb-border)',
                      borderBottom: '1px solid var(--sb-border)',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={13} color="var(--sb-body-subtle)" />
                      <span>Due: {proj.endDate}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckSquare size={13} color="var(--sb-body-subtle)" />
                      <span>
                        {projTasks.filter((t) => t.status === 'done').length}/{projTasks.length} Tasks
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => startTimer(proj.id, undefined, `${proj.title} Session`)}
                    className="btn-sandbox btn-sandbox-sm btn-sandbox-soft-primary"
                  >
                    <Play size={12} />
                    <span>Track Time</span>
                  </button>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      onClick={() => {
                        setEditingProject(proj)
                        setIsProjectModalOpen(true)
                      }}
                      className="btn-sandbox btn-icon btn-sandbox-secondary"
                      style={{ width: '28px', height: '28px' }}
                      title="Edit Project"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="btn-sandbox btn-icon btn-sandbox-danger"
                      style={{ width: '28px', height: '28px' }}
                      title="Delete Project"
                    >
                      <Trash2 size={12} />
                    </button>
                    <button
                      onClick={() => setSelectedProjectId(proj.id)}
                      className="btn-sandbox btn-sandbox-sm btn-sandbox-primary"
                    >
                      <span>Open</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {isProjectModalOpen && (
        <ProjectModal
          project={editingProject}
          onClose={() => setIsProjectModalOpen(false)}
        />
      )}
    </div>
  )
}
