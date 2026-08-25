import React, { useState } from 'react'
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Video,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Briefcase,
  Filter,
} from 'lucide-react'
import { CalendarEvent, CalendarEventType } from '../../types'
import { useApp } from '../../context/AppContext'

export const CalendarView: React.FC = () => {
  const {
    events,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    companies,
    individuals,
    projects,
    deals,
    users,
    currentUser,
  } = useApp()

  const [currentDate, setCurrentDate] = useState(new Date('2026-08-25T00:00:00'))
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [modalFormData, setModalFormData] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    eventType: 'meeting',
    startDate: '2026-08-26T10:00',
    endDate: '2026-08-26T11:00',
    allDay: false,
    clientType: 'company',
    clientId: '',
    assignee: currentUser?.name || 'Administrator',
    location: '',
    videoMeetingUrl: '',
    status: 'scheduled',
    color: '#3f78e0',
  })

  // Open modal helper
  const handleOpenNewEvent = (dateStr?: string) => {
    const start = dateStr ? `${dateStr}T10:00` : '2026-08-26T10:00'
    const end = dateStr ? `${dateStr}T11:00` : '2026-08-26T11:00'
    setEditingEvent(null)
    setModalFormData({
      title: '',
      description: '',
      eventType: 'meeting',
      startDate: start,
      endDate: end,
      allDay: false,
      clientType: 'company',
      clientId: companies[0]?.id || '',
      assignee: currentUser?.name || 'Administrator',
      location: '',
      videoMeetingUrl: '',
      status: 'scheduled',
      color: '#3f78e0',
    })
    setIsModalOpen(true)
  }

  const handleEditEvent = (evt: CalendarEvent) => {
    setEditingEvent(evt)
    setModalFormData(evt)
    setIsModalOpen(true)
  }

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalFormData.title || !modalFormData.startDate) return

    let clientName = ''
    if (modalFormData.clientType === 'individual') {
      const ind = individuals.find((i) => i.id === modalFormData.clientId)
      clientName = ind ? `${ind.firstName} ${ind.lastName}` : ''
    } else {
      const comp = companies.find((c) => c.id === modalFormData.clientId)
      clientName = comp ? comp.name : ''
    }

    if (editingEvent) {
      updateCalendarEvent({
        ...editingEvent,
        ...(modalFormData as CalendarEvent),
        clientName,
      })
    } else {
      const newEvt: CalendarEvent = {
        id: `evt-${Date.now()}`,
        title: modalFormData.title || '',
        description: modalFormData.description,
        eventType: (modalFormData.eventType as CalendarEventType) || 'meeting',
        startDate: modalFormData.startDate || '2026-08-26T10:00',
        endDate: modalFormData.endDate || '2026-08-26T11:00',
        allDay: Boolean(modalFormData.allDay),
        clientType: modalFormData.clientType,
        clientId: modalFormData.clientId,
        clientName,
        projectId: modalFormData.projectId,
        dealId: modalFormData.dealId,
        assignee: modalFormData.assignee || currentUser?.name || 'Administrator',
        location: modalFormData.location,
        videoMeetingUrl: modalFormData.videoMeetingUrl,
        status: modalFormData.status || 'scheduled',
        color: modalFormData.color || '#3f78e0',
        createdAt: new Date().toISOString(),
      }
      addCalendarEvent(newEvt)
    }
    setIsModalOpen(false)
  }

  const filteredEvents = events.filter((evt) => {
    if (typeFilter !== 'all' && evt.eventType !== typeFilter) return false
    return true
  })

  // Date Navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const monthYearLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  // Days in Month
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7 // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendarDays = []
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d)
  }

  const getEventTypeColor = (type: CalendarEventType) => {
    switch (type) {
      case 'meeting':
        return '#3f78e0'
      case 'call':
        return '#fab758'
      case 'site_visit':
        return '#38b995'
      case 'deadline':
        return '#e2626b'
      case 'task_milestone':
        return '#605dba'
      case 'quote_followup':
        return '#24949a'
      default:
        return '#60697b'
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Calendar & Team Planner</h1>
          <p style={{ color: 'var(--sb-body)' }}>
            Schedule client meetings, calls, project milestones, on-site visits, and critical delivery deadlines.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--sb-border)', borderRadius: 'var(--sb-radius)', padding: '0.2rem' }}>
            <button
              onClick={() => setViewMode('month')}
              className={`btn-sandbox ${viewMode === 'month' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`btn-sandbox ${viewMode === 'agenda' ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.82rem' }}
            >
              Agenda List
            </button>
          </div>

          <button onClick={() => handleOpenNewEvent()} className="btn-sandbox btn-sandbox-primary">
            <Plus size={16} />
            <span>Schedule Event</span>
          </button>
        </div>
      </div>

      {/* Month Navigator & Filter Header */}
      <div
        className="card-sandbox"
        style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.35rem', minWidth: '180px' }}>{monthYearLabel}</h2>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button onClick={handlePrevMonth} className="btn-sandbox btn-sandbox-ghost" style={{ padding: '0.4rem' }}>
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date('2026-08-25T00:00:00'))}
              className="btn-sandbox btn-sandbox-secondary"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              Today
            </button>
            <button onClick={handleNextMonth} className="btn-sandbox btn-sandbox-ghost" style={{ padding: '0.4rem' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Event Type Filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Events' },
            { id: 'meeting', label: 'Meetings', color: '#3f78e0' },
            { id: 'call', label: 'Calls', color: '#fab758' },
            { id: 'site_visit', label: 'Site Visits', color: '#38b995' },
            { id: 'deadline', label: 'Deadlines', color: '#e2626b' },
          ].map((flt) => (
            <button
              key={flt.id}
              onClick={() => setTypeFilter(flt.id)}
              className={`btn-sandbox ${typeFilter === flt.id ? 'btn-sandbox-primary' : 'btn-sandbox-ghost'}`}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              {flt.color && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: flt.color,
                    display: 'inline-block',
                    marginRight: '0.35rem',
                  }}
                />
              )}
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {/* MONTH GRID VIEW */}
      {viewMode === 'month' && (
        <div className="card-sandbox" style={{ overflow: 'hidden', padding: 0 }}>
          {/* Day Names Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              borderBottom: '1px solid var(--sb-border)',
              backgroundColor: 'var(--sb-card-bg)',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.82rem',
              color: 'var(--sb-body)',
            }}
          >
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} style={{ padding: '0.75rem 0.5rem' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Cells Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridAutoRows: 'minmax(130px, auto)',
              backgroundColor: 'var(--sb-border)',
              gap: '1px',
            }}
          >
            {calendarDays.map((dayNum, idx) => {
              if (!dayNum) {
                return (
                  <div
                    key={`empty-${idx}`}
                    style={{
                      backgroundColor: 'var(--sb-bg)',
                      opacity: 0.4,
                      minHeight: '130px',
                    }}
                  />
                )
              }

              const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
              const isToday = dayString === '2026-08-25'
              const dayEvents = filteredEvents.filter((e) => e.startDate.startsWith(dayString))

              return (
                <div
                  key={dayString}
                  onClick={() => handleOpenNewEvent(dayString)}
                  style={{
                    backgroundColor: 'var(--sb-card-bg)',
                    padding: '0.5rem',
                    minHeight: '130px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.4rem',
                    }}
                  >
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.82rem',
                        fontWeight: isToday ? 800 : 600,
                        backgroundColor: isToday ? 'var(--sb-primary)' : 'transparent',
                        color: isToday ? '#ffffff' : 'var(--sb-heading)',
                      }}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--sb-body)', fontWeight: 600 }}>
                        {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                      </span>
                    )}
                  </div>

                  {/* Events in cell */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
                    {dayEvents.map((evt) => {
                      const color = getEventTypeColor(evt.eventType)
                      const timeFormatted = evt.startDate.includes('T') ? evt.startDate.split('T')[1].slice(0, 5) : ''

                      return (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditEvent(evt)
                          }}
                          style={{
                            padding: '0.25rem 0.45rem',
                            borderRadius: '6px',
                            backgroundColor: `${color}18`,
                            borderLeft: `3px solid ${color}`,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--sb-heading)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                          title={`${evt.title} (${timeFormatted})`}
                        >
                          {timeFormatted && <span style={{ opacity: 0.8, fontSize: '0.68rem' }}>{timeFormatted}</span>}
                          <span>{evt.title}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* AGENDA LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="card-sandbox" style={{ overflow: 'hidden' }}>
          <table className="table-sandbox">
            <thead>
              <tr>
                <th>Event & Type</th>
                <th>Date & Time</th>
                <th>Client / Account</th>
                <th>Assignee</th>
                <th>Location / Video Link</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--sb-body)' }}>
                    No events scheduled matching filters.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const color = getEventTypeColor(evt.eventType)
                  return (
                    <tr key={evt.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: color,
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--sb-heading)' }}>{evt.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)', textTransform: 'capitalize' }}>
                              {evt.eventType.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {evt.startDate.replace('T', ' ')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                          to {evt.endDate.replace('T', ' ')}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {evt.clientName || 'General / Internal'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                          {evt.clientType === 'individual' ? 'Private Client' : 'Company Account'}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{evt.assignee}</div>
                      </td>

                      <td>
                        {evt.videoMeetingUrl ? (
                          <a
                            href={evt.videoMeetingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-sandbox btn-sandbox-ghost"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: 'var(--sb-primary)' }}
                          >
                            <Video size={13} style={{ marginRight: '0.25rem' }} />
                            <span>Join Video Call</span>
                          </a>
                        ) : evt.location ? (
                          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <MapPin size={13} color="var(--sb-body)" />
                            <span>{evt.location}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>—</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`badge-sandbox ${
                            evt.status === 'completed'
                              ? 'badge-soft-success'
                              : evt.status === 'cancelled'
                              ? 'badge-soft-danger'
                              : 'badge-soft-primary'
                          }`}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {evt.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleEditEvent(evt)}
                            className="btn-sandbox btn-sandbox-ghost"
                            style={{ padding: '0.4rem' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete event ${evt.title}?`)) {
                                deleteCalendarEvent(evt.id)
                              }
                            }}
                            className="btn-sandbox btn-sandbox-ghost"
                            style={{ padding: '0.4rem', color: 'var(--sb-danger)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* EVENT CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--sb-primary-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--sb-primary)',
                  }}
                >
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '0.15rem' }}>
                    {editingEvent ? 'Edit Calendar Event' : 'Schedule New Event'}
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                    Coordinate team schedules, client reviews, calls, and milestones.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-sandbox btn-sandbox-ghost"
                style={{ padding: '0.4rem' }}
              >
                <X size={18} />
              </button>
            </div>            <form onSubmit={handleSaveModal} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="modal-body">
                {/* Event Title */}
                <div>
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q3 Strategic Review with Marc Vandamme"
                    value={modalFormData.title}
                    onChange={(e) => setModalFormData({ ...modalFormData, title: e.target.value })}
                    className="form-input-sandbox"
                  />
                </div>

                {/* Event Type & Assignee */}
                <div className="modal-form-grid">
                  <div>
                    <label className="form-label">Event Type</label>
                    <select
                      value={modalFormData.eventType}
                      onChange={(e) => setModalFormData({ ...modalFormData, eventType: e.target.value as any })}
                      className="form-select-sandbox"
                    >
                      <option value="meeting">Meeting 🤝</option>
                      <option value="call">Phone / Audio Call 📞</option>
                      <option value="site_visit">On-Site Client Visit 📍</option>
                      <option value="deadline">Delivery Deadline ⚠️</option>
                      <option value="task_milestone">Task Milestone 🚀</option>
                      <option value="quote_followup">Quote Follow-up 📝</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Team Assignee</label>
                    <select
                      value={modalFormData.assignee}
                      onChange={(e) => setModalFormData({ ...modalFormData, assignee: e.target.value })}
                      className="form-select-sandbox"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.roleLabel || u.role})
                        </option>
                      ))}
                      {!users.some((u) => u.name === currentUser?.name) && currentUser?.name && (
                        <option value={currentUser.name}>{currentUser.name}</option>
                      )}
                      <option value="Unassigned">Unassigned</option>
                    </select>
                  </div>
                </div>

                {/* Dates & Times */}
                <div className="modal-form-grid">
                  <div>
                    <label className="form-label">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={modalFormData.startDate}
                      onChange={(e) => setModalFormData({ ...modalFormData, startDate: e.target.value })}
                      className="form-input-sandbox"
                    />
                  </div>

                  <div>
                    <label className="form-label">End Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={modalFormData.endDate}
                      onChange={(e) => setModalFormData({ ...modalFormData, endDate: e.target.value })}
                      className="form-input-sandbox"
                    />
                  </div>
                </div>

                {/* Client Link (B2B or B2C) */}
                <div className="modal-form-grid">
                  <div>
                    <label className="form-label">Client Type</label>
                    <select
                      value={modalFormData.clientType}
                      onChange={(e) =>
                        setModalFormData({
                          ...modalFormData,
                          clientType: e.target.value as any,
                          clientId:
                            e.target.value === 'individual'
                              ? individuals[0]?.id || ''
                              : companies[0]?.id || '',
                        })
                      }
                      className="form-select-sandbox"
                    >
                      <option value="company">🏢 Company (B2B)</option>
                      <option value="individual">👤 Private Person (B2C)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Select Client</label>
                    {modalFormData.clientType === 'individual' ? (
                      <select
                        value={modalFormData.clientId}
                        onChange={(e) => setModalFormData({ ...modalFormData, clientId: e.target.value })}
                        className="form-select-sandbox"
                      >
                        {individuals.map((ind) => (
                          <option key={ind.id} value={ind.id}>
                            {ind.firstName} {ind.lastName} ({ind.city})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={modalFormData.clientId}
                        onChange={(e) => setModalFormData({ ...modalFormData, clientId: e.target.value })}
                        className="form-select-sandbox"
                      >
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.city})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Location & Video Link */}
                <div className="modal-form-grid">
                  <div>
                    <label className="form-label">Physical Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Antwerp HQ or Havenlaan 88"
                      value={modalFormData.location}
                      onChange={(e) => setModalFormData({ ...modalFormData, location: e.target.value })}
                      className="form-input-sandbox"
                    />
                  </div>

                  <div>
                    <label className="form-label">Video Meeting URL</label>
                    <input
                      type="url"
                      placeholder="https://teams.microsoft.com/meet/..."
                      value={modalFormData.videoMeetingUrl}
                      onChange={(e) => setModalFormData({ ...modalFormData, videoMeetingUrl: e.target.value })}
                      className="form-input-sandbox"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="form-label">Agenda & Meeting Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Key talking points, deliverables to review, or client questions..."
                    value={modalFormData.description}
                    onChange={(e) => setModalFormData({ ...modalFormData, description: e.target.value })}
                    className="form-input-sandbox"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-sandbox btn-sandbox-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-sandbox btn-sandbox-primary">
                  {editingEvent ? 'Save Changes' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
