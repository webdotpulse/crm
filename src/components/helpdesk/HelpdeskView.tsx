import React, { useState } from 'react'
import {
  Headphones,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  Building2,
  Receipt,
  FolderKanban,
  Zap,
  Tag,
  Paperclip,
  Check,
  ChevronDown,
  X,
  FileText,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { SupportTicket, SupportTicketMessage, TicketPriority, TicketStatus, TicketCategory } from '../../types'

export const HelpdeskView: React.FC = () => {
  const {
    tickets,
    addTicket,
    updateTicket,
    addTicketMessage,
    cannedResponses,
    convertTicketToTask,
    convertTicketToInvoice,
    companies,
    individuals,
    projects,
    setCurrentView,
    currentUser,
  } = useApp()

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  // Reply state
  const [replyBody, setReplyBody] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [showCannedPicker, setShowCannedPicker] = useState(false)

  // New ticket modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newCompanyId, setNewCompanyId] = useState(companies[0]?.id || '')
  const [newContactName, setNewContactName] = useState('')
  const [newContactEmail, setNewContactEmail] = useState('')
  const [newPriority, setNewPriority] = useState<TicketPriority>('medium')
  const [newCategory, setNewCategory] = useState<TicketCategory>('technical')
  const [newInitialMessage, setNewInitialMessage] = useState('')

  // Conversion feedback toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0]

  // KPI Calculations
  const openTicketsCount = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length
  const urgentTicketsCount = tickets.filter((t) => t.priority === 'urgent' && t.status !== 'resolved').length
  const resolvedTicketsCount = tickets.filter((t) => t.status === 'resolved').length

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter
    const cleanQ = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !cleanQ ||
      t.ticketNumber.toLowerCase().includes(cleanQ) ||
      t.subject.toLowerCase().includes(cleanQ) ||
      t.contactName.toLowerCase().includes(cleanQ) ||
      t.contactEmail.toLowerCase().includes(cleanQ)
    return matchesStatus && matchesPriority && matchesSearch
  })

  const handleSendReply = () => {
    if (!replyBody.trim() || !activeTicket) return

    addTicketMessage(activeTicket.id, {
      senderType: isInternalNote ? 'agent' : 'agent',
      senderName: currentUser?.name || 'Support Agent',
      senderEmail: currentUser?.email || 'support@localhost',
      body: replyBody,
      isInternalNote,
    })

    setReplyBody('')
    setIsInternalNote(false)
  }

  const handleApplyCannedResponse = (content: string) => {
    setReplyBody((prev) => (prev ? `${prev}\n${content}` : content))
    setShowCannedPicker(false)
  }

  const handleConvertToTask = () => {
    if (!activeTicket || projects.length === 0) return
    const targetProject = projects[0]
    const createdTask = convertTicketToTask(activeTicket.id, targetProject.id)
    if (createdTask) {
      setToastMessage(`Converted to project task "${createdTask.title}" in ${targetProject.title}`)
      setTimeout(() => setToastMessage(null), 4000)
    }
  }

  const handleConvertToInvoice = () => {
    if (!activeTicket) return
    const invoice = convertTicketToInvoice(activeTicket.id, 185.00, `Support Resolution: ${activeTicket.subject}`)
    if (invoice) {
      setToastMessage(`Generated commercial invoice ${invoice.number} for €185.00 (+21% VAT)`)
      setTimeout(() => setToastMessage(null), 4000)
    }
  }

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubject.trim()) return

    const selectedCompany = companies.find((c) => c.id === newCompanyId)
    const ticketNum = `TCK-${new Date().getFullYear()}-${String(tickets.length + 1).padStart(3, '0')}`

    const newTicket: SupportTicket = {
      id: `tck-${Date.now()}`,
      ticketNumber: ticketNum,
      subject: newSubject,
      clientType: 'company',
      companyId: newCompanyId,
      contactName: newContactName || selectedCompany?.name || 'Client Contact',
      contactEmail: newContactEmail || selectedCompany?.email || 'client@localhost',
      priority: newPriority,
      status: 'open',
      category: newCategory,
      assignee: currentUser?.name || 'Support Agent',
      slaResponseDue: new Date(Date.now() + 4 * 3600000).toISOString(),
      slaResolutionDue: new Date(Date.now() + 24 * 3600000).toISOString(),
      slaBreached: false,
      tags: ['Support', newCategory],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          ticketId: `tck-${Date.now()}`,
          senderType: 'client',
          senderName: newContactName || selectedCompany?.name || 'Client Contact',
          senderEmail: newContactEmail || selectedCompany?.email || 'client@domain.be',
          body: newInitialMessage || newSubject,
          timestamp: new Date().toISOString(),
        },
      ],
    }

    addTicket(newTicket)
    setSelectedTicketId(newTicket.id)
    setIsCreateModalOpen(false)
    setNewSubject('')
    setNewInitialMessage('')
  }

  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(63, 120, 224, 0.12)',
                color: 'var(--sb-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Headphones size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
              PulseDesk: Helpdesk & Omnichannel
            </h1>
          </div>
          <p style={{ color: 'var(--sb-body)', margin: '0.35rem 0 0', fontSize: '0.88rem' }}>
            SLA Countdown Tracking, Canned Responses, and 1-Click Ticket-to-Invoice Conversion.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-sandbox btn-sandbox-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.25rem', fontWeight: 800 }}
        >
          <Plus size={16} /> New Support Ticket
        </button>
      </div>

      {/* SLA & Ticket Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="card-sandbox" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Active Open Tickets</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.2rem' }}>{openTicketsCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-primary)', marginTop: '0.15rem' }}>● In SLA window</div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Urgent Priority</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-danger)', marginTop: '0.2rem' }}>{urgentTicketsCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.15rem' }}>Requires immediate response</div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Avg First Response</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38b995', marginTop: '0.2rem' }}>24m</div>
          <div style={{ fontSize: '0.72rem', color: '#38b995', marginTop: '0.15rem' }}>✓ 98.4% SLA Compliance</div>
        </div>

        <div className="card-sandbox" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>Resolved Total</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--sb-heading)', marginTop: '0.2rem' }}>{resolvedTicketsCount}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)', marginTop: '0.15rem' }}>CSAT Rating: 4.9 / 5.0</div>
        </div>
      </div>

      {toastMessage && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: 'rgba(56, 185, 149, 0.15)',
            color: 'var(--sb-success-text)',
            borderRadius: 'var(--sb-radius)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 700,
            fontSize: '0.85rem',
            boxShadow: 'var(--sb-shadow-xs)',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', height: '680px' }}>
        {/* Left Column: Tickets List & Filter Bar */}
        <div className="card-sandbox" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Filter / Search Bar */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--sb-border)', display: 'flex', flexDirection: 'column', gap: '0.65rem', backgroundColor: 'var(--sb-bg)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sb-body)' }} />
              <input
                type="text"
                placeholder="Search ticket # or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', paddingLeft: '2rem', fontSize: '0.8rem', padding: '0.45rem 0.65rem 0.45rem 2rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-sandbox"
                style={{ flex: 1, fontSize: '0.74rem', padding: '0.35rem' }}
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_client">Waiting Client</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="input-sandbox"
                style={{ flex: 1, fontSize: '0.74rem', padding: '0.35rem' }}
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Ticket Items Scroll Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {filteredTickets.map((ticket) => {
              const isSelected = ticket.id === activeTicket?.id
              const isUrgent = ticket.priority === 'urgent'

              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--sb-radius)',
                    marginBottom: '0.4rem',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--sb-primary-soft)' : 'transparent',
                    border: isSelected ? '1px solid var(--sb-primary)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isSelected ? 'var(--sb-primary)' : 'var(--sb-heading)' }}>
                      {ticket.ticketNumber}
                    </span>
                    <span
                      className={`badge-sandbox badge-soft-${
                        ticket.priority === 'urgent' ? 'danger' : ticket.priority === 'high' ? 'warning' : 'primary'
                      }`}
                      style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}
                    >
                      {ticket.priority}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--sb-heading)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ticket.subject}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--sb-body)' }}>
                    <span>{ticket.contactName}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Clock size={11} /> {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )
            })}

            {filteredTickets.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--sb-body)', fontSize: '0.84rem' }}>
                No support tickets found matching criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Ticket Conversation Thread & Conversion Actions */}
        {activeTicket ? (
          <div className="card-sandbox" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Ticket Header & Action Toolbar */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--sb-primary)' }}>
                    {activeTicket.ticketNumber}
                  </span>
                  <span className={`badge-sandbox badge-soft-${activeTicket.status === 'resolved' ? 'success' : 'primary'}`} style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>
                    {activeTicket.status.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                    Assignee: <strong>{activeTicket.assignee}</strong>
                  </span>
                </div>

                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 0.25rem' }}>
                  {activeTicket.subject}
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--sb-body)' }}>
                  From: <strong>{activeTicket.contactName}</strong> ({activeTicket.contactEmail})
                </div>
              </div>

              {/* 1-Click Action Conversion Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={handleConvertToTask}
                  className="btn-sandbox btn-sandbox-outline"
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.8rem', fontWeight: 700, gap: '0.35rem' }}
                  title="Convert this ticket directly into a Project Task"
                >
                  <FolderKanban size={14} color="var(--sb-primary)" />
                  <span>Convert to Task</span>
                </button>

                <button
                  onClick={handleConvertToInvoice}
                  className="btn-sandbox btn-sandbox-outline"
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.8rem', fontWeight: 700, gap: '0.35rem' }}
                  title="Create a Commercial Invoice for this ticket work"
                >
                  <Receipt size={14} color="var(--sb-success)" />
                  <span>Bill to Invoice</span>
                </button>

                <button
                  onClick={() => updateTicket({ ...activeTicket, status: activeTicket.status === 'resolved' ? 'open' : 'resolved' })}
                  className={`btn-sandbox ${activeTicket.status === 'resolved' ? 'btn-sandbox-ghost' : 'btn-sandbox-primary'}`}
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem', fontWeight: 700 }}
                >
                  {activeTicket.status === 'resolved' ? 'Reopen Ticket' : '✓ Resolve'}
                </button>
              </div>
            </div>

            {/* Conversation Messages Thread */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeTicket.messages.map((msg) => {
                const isAgent = msg.senderType === 'agent'
                const isInternal = msg.isInternalNote

                return (
                  <div
                    key={msg.id}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--sb-radius)',
                      backgroundColor: isInternal
                        ? 'rgba(250, 183, 88, 0.12)'
                        : isAgent
                        ? 'var(--sb-primary-soft)'
                        : 'var(--sb-bg)',
                      border: isInternal
                        ? '1px dashed #fab758'
                        : '1px solid var(--sb-border)',
                      alignSelf: isAgent ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--sb-heading)' }}>
                          {msg.senderName}
                        </span>
                        {isInternal && (
                          <span className="badge-sandbox badge-soft-warning" style={{ fontSize: '0.62rem' }}>
                            Internal Note (Hidden from client)
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--sb-body)' }}>
                        {new Date(msg.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.84rem', color: 'var(--sb-heading)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {msg.body}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Reply Composer & Canned Responses Dropdown */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--sb-border)', backgroundColor: 'var(--sb-surface)' }}>
              {/* Canned responses helper chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--sb-body)' }}>
                  Quick Canned Replies:
                </span>
                {cannedResponses.map((cr) => (
                  <button
                    key={cr.id}
                    onClick={() => handleApplyCannedResponse(cr.content)}
                    className="btn-sandbox btn-sandbox-ghost"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', border: '1px solid var(--sb-border)', borderRadius: '9999px' }}
                    title={cr.content}
                  >
                    {cr.shortcut} ({cr.category})
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                placeholder="Type your response to the client (or write internal team note)..."
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem', marginBottom: '0.65rem' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--sb-body)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                  />
                  <span>Post as Internal Staff Note (Yellow Highlight)</span>
                </label>

                <button
                  onClick={handleSendReply}
                  className="btn-sandbox btn-sandbox-primary"
                  style={{ padding: '0.55rem 1.25rem', fontWeight: 800, gap: '0.4rem' }}
                  disabled={!replyBody.trim()}
                >
                  <Send size={14} /> Send Reply
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-sandbox" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sb-body)' }}>
            Select a ticket from the left column to view the thread.
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="card-sandbox"
            style={{
              width: '540px',
              maxWidth: '100%',
              backgroundColor: 'var(--sb-surface)',
              borderRadius: 'var(--sb-radius-lg)',
              padding: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                Create Support Ticket
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="btn-sandbox btn-sandbox-ghost" style={{ padding: '0.3rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.3rem' }}>
                  Client / Company
                </label>
                <select
                  value={newCompanyId}
                  onChange={(e) => setNewCompanyId(e.target.value)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.55rem' }}
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.vatNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.3rem' }}>
                  Ticket Subject / Issue Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peppol validation error on invoice #BE-INV-001"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.55rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.3rem' }}>
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="input-sandbox"
                    style={{ width: '100%', padding: '0.55rem' }}
                  >
                    <option value="urgent">🔴 Urgent (4h SLA)</option>
                    <option value="high">🟠 High (8h SLA)</option>
                    <option value="medium">🔵 Medium (24h SLA)</option>
                    <option value="low">🟢 Low (48h SLA)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.3rem' }}>
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="input-sandbox"
                    style={{ width: '100%', padding: '0.55rem' }}
                  >
                    <option value="billing">Billing & Invoicing</option>
                    <option value="technical">Technical Support</option>
                    <option value="sla_breach">SLA & Contract</option>
                    <option value="feature_request">Feature Request</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.3rem' }}>
                  Initial Message / Client Issue Details
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide full description of the reported issue..."
                  value={newInitialMessage}
                  onChange={(e) => setNewInitialMessage(e.target.value)}
                  className="input-sandbox"
                  style={{ width: '100%', padding: '0.55rem', fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-sandbox btn-sandbox-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-sandbox btn-sandbox-primary" style={{ fontWeight: 800 }}>
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
export default HelpdeskView
