import React, { useState } from 'react'
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Search,
  Filter,
  KeyRound,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Edit2,
  Trash2,
  Download,
  Eye,
  Check,
  UserCheck,
  UserX,
  Activity,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  Building,
  Briefcase,
  Clock,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { UserAccount, UserRole } from '../../types'
import { UserModal } from './UserModal'
import { ResetPasswordModal } from './ResetPasswordModal'
import { TwoFactorSetupModal } from '../security/TwoFactorSetupModal'
import { ROLE_DEFINITIONS } from '../../services/securityService'

export const UserManagementView: React.FC = () => {
  const {
    users,
    currentUser,
    switchUser,
    deleteUser,
    setUserSuspended,
    securityAuditLogs,
    activeSessions,
    twoFactorSetupModalUser,
    setTwoFactorSetupModalUser,
    setCurrentView,
  } = useApp()

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [twoFactorFilter, setTwoFactorFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [activeTab, setActiveTab] = useState<'directory' | 'roles_matrix' | 'audit_log'>('directory')

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount | null>(null)
  const [selectedUserForPasswordReset, setSelectedUserForPasswordReset] = useState<UserAccount | null>(null)

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.jobTitle && u.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter
    const matches2fa =
      twoFactorFilter === 'all' ||
      (twoFactorFilter === 'enabled' && u.twoFactorEnabled) ||
      (twoFactorFilter === 'disabled' && !u.twoFactorEnabled)

    return matchesSearch && matchesRole && matchesStatus && matches2fa
  })

  // Calculated Stats
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === 'active').length
  const twoFactorCount = users.filter((u) => u.twoFactorEnabled).length
  const twoFactorPercentage = totalUsers > 0 ? Math.round((twoFactorCount / totalUsers) * 100) : 0
  const adminCount = users.filter((u) => u.role === 'admin' || u.role === 'owner').length

  // Filtered Audit Logs for User Lifecycle
  const userAuditLogs = securityAuditLogs.filter(
    (l) => l.category === 'rbac' || l.category === 'auth' || l.category === '2fa'
  )

  const handleExportCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Department', 'Job Title', 'Phone', 'Status', '2FA Active', 'Last Login', 'Created At']
    const rows = users.map((u) => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${(u.department || '').replace(/"/g, '""')}"`,
      `"${(u.jobTitle || '').replace(/"/g, '""')}"`,
      `"${u.phone || ''}"`,
      `"${u.status}"`,
      `"${u.twoFactorEnabled ? 'YES' : 'NO'}"`,
      `"${u.lastLogin || ''}"`,
      `"${u.createdAt || ''}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', encodeURI(csvContent))
    downloadAnchor.setAttribute('download', `pulsework_users_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return { bg: 'rgba(116, 82, 214, 0.15)', text: 'var(--sb-purple-text)', border: 'rgba(116, 82, 214, 0.3)' }
      case 'admin':
        return { bg: 'rgba(63, 120, 224, 0.15)', text: 'var(--sb-primary-text)', border: 'rgba(63, 120, 224, 0.3)' }
      case 'finance':
        return { bg: 'rgba(56, 185, 149, 0.15)', text: 'var(--sb-success-text)', border: 'rgba(56, 185, 149, 0.3)' }
      case 'sales':
        return { bg: 'rgba(250, 183, 88, 0.15)', text: 'var(--sb-warning-text)', border: 'rgba(250, 183, 88, 0.3)' }
      case 'project_manager':
        return { bg: 'rgba(69, 183, 217, 0.15)', text: 'var(--sb-info-text)', border: 'rgba(69, 183, 217, 0.3)' }
      case 'accountant':
        return { bg: 'rgba(100, 116, 139, 0.15)', text: 'var(--sb-body)', border: 'rgba(100, 116, 139, 0.3)' }
      case 'hr':
        return { bg: 'rgba(236, 72, 153, 0.15)', text: '#be185d', border: 'rgba(236, 72, 153, 0.3)' }
      case 'support':
        return { bg: 'rgba(14, 165, 233, 0.15)', text: '#0369a1', border: 'rgba(14, 165, 233, 0.3)' }
      default:
        return { bg: 'var(--sb-bg-alt)', text: 'var(--sb-body)', border: 'var(--sb-border)' }
    }
  }

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never'
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString()
    } catch {
      return dateString
    }
  }

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Module Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--sb-primary-soft)',
                color: 'var(--sb-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={24} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  fontFamily: 'var(--sb-font-heading)',
                  color: 'var(--sb-heading)',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Team & User Management
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--sb-body)', margin: '0.15rem 0 0 0' }}>
                Role-Based Access Control (RBAC), credentials provisioning, and two-factor authentication security
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            onClick={handleExportCsv}
            className="btn-sandbox btn-sandbox-outline"
            style={{ gap: '0.4rem', fontSize: '0.82rem' }}
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={() => setCurrentView('security')}
            className="btn-sandbox btn-sandbox-outline"
            style={{ gap: '0.4rem', fontSize: '0.82rem' }}
          >
            <ShieldCheck size={15} color="var(--sb-success)" /> Security Hub
          </button>
          <button
            onClick={() => {
              setSelectedUserForEdit(null)
              setIsCreateModalOpen(true)
            }}
            className="btn-sandbox btn-sandbox-primary"
            style={{ gap: '0.45rem', fontSize: '0.85rem', fontWeight: 800 }}
          >
            <UserPlus size={16} /> Add New User
          </button>
        </div>
      </div>

      {/* KPI Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Total Users Card */}
        <div
          className="card-sandbox"
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--sb-surface)',
            borderRadius: 'var(--sb-radius)',
            border: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--sb-primary-soft)',
              color: 'var(--sb-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>
              Total Team Members
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)', lineHeight: 1.2 }}>
              {totalUsers}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--sb-success)', fontWeight: 600 }}>
              ● {activeUsers} active accounts
            </div>
          </div>
        </div>

        {/* Administrators Card */}
        <div
          className="card-sandbox"
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--sb-surface)',
            borderRadius: 'var(--sb-radius)',
            border: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--sb-purple-soft)',
              color: 'var(--sb-purple-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>
              Super Admins & Admins
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)', lineHeight: 1.2 }}>
              {adminCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>
              Full operational privileges
            </div>
          </div>
        </div>

        {/* 2FA Adoption Card */}
        <div
          className="card-sandbox"
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--sb-surface)',
            borderRadius: 'var(--sb-radius)',
            border: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: twoFactorPercentage >= 70 ? 'var(--sb-success-soft)' : 'var(--sb-warning-soft)',
              color: twoFactorPercentage >= 70 ? 'var(--sb-success-text)' : 'var(--sb-warning-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>
              2FA Security Coverage
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)', lineHeight: 1.2 }}>
              {twoFactorPercentage}%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>
              {twoFactorCount} of {totalUsers} accounts protected
            </div>
          </div>
        </div>

        {/* Active Sessions Card */}
        <div
          className="card-sandbox"
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--sb-surface)',
            borderRadius: 'var(--sb-radius)',
            border: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--sb-info-soft)',
              color: 'var(--sb-info-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sb-body)', textTransform: 'uppercase' }}>
              Active Sessions
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sb-heading)', lineHeight: 1.2 }}>
              {activeSessions.length || 1}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>
              Current user: {currentUser.name.split(' ')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--sb-border)',
          marginBottom: '1.25rem',
          gap: '0.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('directory')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: 800,
            color: activeTab === 'directory' ? 'var(--sb-primary)' : 'var(--sb-body)',
            borderBottom: activeTab === 'directory' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Users size={16} /> Team Directory ({filteredUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('roles_matrix')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: 800,
            color: activeTab === 'roles_matrix' ? 'var(--sb-primary)' : 'var(--sb-body)',
            borderBottom: activeTab === 'roles_matrix' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Layers size={16} /> RBAC Roles & Capabilities
        </button>

        <button
          onClick={() => setActiveTab('audit_log')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: 800,
            color: activeTab === 'audit_log' ? 'var(--sb-primary)' : 'var(--sb-body)',
            borderBottom: activeTab === 'audit_log' ? '2px solid var(--sb-primary)' : '2px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Clock size={16} /> User Audit Trail ({userAuditLogs.length})
        </button>
      </div>

      {/* TAB 1: TEAM DIRECTORY */}
      {activeTab === 'directory' && (
        <>
          {/* Filters and Search Bar */}
          <div
            className="card-sandbox"
            style={{
              padding: '1rem',
              backgroundColor: 'var(--sb-surface)',
              borderRadius: 'var(--sb-radius)',
              border: '1px solid var(--sb-border)',
              marginBottom: '1.25rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
              <input
                type="text"
                placeholder="Search team members by name, email, department, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '2.4rem', fontSize: '0.85rem' }}
              />
              <Search
                size={16}
                color="var(--sb-body)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>

            {/* Dropdown Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input-sandbox"
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
              >
                <option value="all">All Roles</option>
                <option value="owner">Super Admin / Owner</option>
                <option value="admin">System Administrator</option>
                <option value="finance">Finance Director</option>
                <option value="sales">Sales Executive</option>
                <option value="project_manager">Project Lead</option>
                <option value="accountant">External Auditor</option>
                <option value="hr">HR Operations</option>
                <option value="support">Customer Support</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-sandbox"
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="suspended">Suspended</option>
              </select>

              <select
                value={twoFactorFilter}
                onChange={(e) => setTwoFactorFilter(e.target.value)}
                className="input-sandbox"
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
              >
                <option value="all">All 2FA States</option>
                <option value="enabled">2FA Protected</option>
                <option value="disabled">2FA Not Configured</option>
              </select>

              {/* View Mode Toggle */}
              <div style={{ display: 'flex', border: '1px solid var(--sb-border)', borderRadius: 'var(--sb-radius)' }}>
                <button
                  onClick={() => setViewMode('table')}
                  className="btn-sandbox btn-sandbox-ghost"
                  style={{
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--sb-radius) 0 0 var(--sb-radius)',
                    backgroundColor: viewMode === 'table' ? 'var(--sb-primary-soft)' : 'transparent',
                    color: viewMode === 'table' ? 'var(--sb-primary)' : 'var(--sb-body)',
                  }}
                  title="Table View"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className="btn-sandbox btn-sandbox-ghost"
                  style={{
                    padding: '0.4rem 0.6rem',
                    borderRadius: '0 var(--sb-radius) var(--sb-radius) 0',
                    backgroundColor: viewMode === 'grid' ? 'var(--sb-primary-soft)' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--sb-primary)' : 'var(--sb-body)',
                  }}
                  title="Grid Cards View"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* TABLE VIEW */}
          {viewMode === 'table' && (
            <div
              className="card-sandbox"
              style={{
                backgroundColor: 'var(--sb-surface)',
                borderRadius: 'var(--sb-radius)',
                border: '1px solid var(--sb-border)',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--sb-bg-alt)', borderBottom: '1px solid var(--sb-border)' }}>
                    <th style={{ padding: '0.85rem 1.1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Team Member</th>
                    <th style={{ padding: '0.85rem 1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Role</th>
                    <th style={{ padding: '0.85rem 1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>2FA Security</th>
                    <th style={{ padding: '0.85rem 1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Department & Title</th>
                    <th style={{ padding: '0.85rem 1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Last Login</th>
                    <th style={{ padding: '0.85rem 1.1rem', color: 'var(--sb-heading)', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--sb-body)' }}>
                        No team members match the specified filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isCurrent = u.id === currentUser.id
                      const roleBadge = getRoleBadgeStyle(u.role)
                      return (
                        <tr
                          key={u.id}
                          style={{
                            borderBottom: '1px solid var(--sb-border)',
                            backgroundColor: isCurrent ? 'rgba(63, 120, 224, 0.04)' : 'transparent',
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          {/* Name, Email, Avatar */}
                          <td style={{ padding: '0.85rem 1.1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '50%',
                                  backgroundColor: isCurrent ? 'var(--sb-primary)' : 'var(--sb-bg-alt)',
                                  color: isCurrent ? '#ffffff' : 'var(--sb-heading)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.85rem',
                                  border: '1px solid var(--sb-border)',
                                }}
                              >
                                {u.name.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: 'var(--sb-heading)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  {u.name}
                                  {isCurrent && (
                                    <span
                                      style={{
                                        fontSize: '0.68rem',
                                        backgroundColor: 'var(--sb-primary-soft)',
                                        color: 'var(--sb-primary)',
                                        padding: '0.1rem 0.4rem',
                                        borderRadius: '9999px',
                                        fontWeight: 700,
                                      }}
                                    >
                                      You
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)' }}>{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                padding: '0.2rem 0.6rem',
                                borderRadius: '9999px',
                                backgroundColor: roleBadge.bg,
                                color: roleBadge.text,
                                border: `1px solid ${roleBadge.border}`,
                                display: 'inline-block',
                              }}
                            >
                              {u.roleLabel || u.role}
                            </span>
                          </td>

                          {/* 2FA Status */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {u.twoFactorEnabled ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  color: 'var(--sb-success)',
                                  fontWeight: 700,
                                  fontSize: '0.78rem',
                                }}
                              >
                                <ShieldCheck size={15} /> Active (TOTP)
                              </span>
                            ) : (
                              <button
                                onClick={() => setTwoFactorSetupModalUser(u)}
                                className="btn-sandbox btn-sandbox-ghost"
                                style={{
                                  padding: '0.2rem 0.5rem',
                                  color: 'var(--sb-warning)',
                                  fontSize: '0.75rem',
                                  gap: '0.25rem',
                                }}
                              >
                                <AlertTriangle size={13} /> Setup 2FA
                              </button>
                            )}
                          </td>

                          {/* Department & Title */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--sb-heading)', fontSize: '0.82rem' }}>
                              {u.jobTitle || '—'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--sb-body)' }}>
                              {u.department || 'General'}
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '9999px',
                                backgroundColor:
                                  u.status === 'active'
                                    ? 'var(--sb-success-soft)'
                                    : u.status === 'invited'
                                    ? 'var(--sb-warning-soft)'
                                    : 'var(--sb-danger-soft)',
                                color:
                                  u.status === 'active'
                                    ? 'var(--sb-success-text)'
                                    : u.status === 'invited'
                                    ? 'var(--sb-warning-text)'
                                    : 'var(--sb-danger-text)',
                              }}
                            >
                              ● {u.status.toUpperCase()}
                            </span>
                          </td>

                          {/* Last Login */}
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--sb-body)', fontSize: '0.78rem' }}>
                            {formatLastLogin(u.lastLogin)}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '0.85rem 1.1rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              {!isCurrent && (
                                <button
                                  onClick={() => switchUser(u.id)}
                                  className="btn-sandbox btn-sandbox-ghost"
                                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.74rem' }}
                                  title="Switch active session to this user"
                                >
                                  Switch
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedUserForPasswordReset(u)}
                                className="btn-sandbox btn-sandbox-ghost"
                                style={{ padding: '0.3rem 0.5rem', fontSize: '0.74rem' }}
                                title="Reset credentials"
                              >
                                <KeyRound size={14} />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedUserForEdit(u)
                                  setIsCreateModalOpen(true)
                                }}
                                className="btn-sandbox btn-sandbox-ghost"
                                style={{ padding: '0.3rem 0.5rem', fontSize: '0.74rem' }}
                                title="Edit user profile & permissions"
                              >
                                <Edit2 size={14} />
                              </button>

                              {!isCurrent && (
                                <button
                                  onClick={() => setUserSuspended(u.id, u.status !== 'suspended')}
                                  className="btn-sandbox btn-sandbox-ghost"
                                  style={{
                                    padding: '0.3rem 0.5rem',
                                    fontSize: '0.74rem',
                                    color: u.status === 'suspended' ? 'var(--sb-success)' : 'var(--sb-warning)',
                                  }}
                                  title={u.status === 'suspended' ? 'Re-activate account' : 'Suspend account'}
                                >
                                  {u.status === 'suspended' ? <UserCheck size={14} /> : <UserX size={14} />}
                                </button>
                              )}
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

          {/* GRID CARDS VIEW */}
          {viewMode === 'grid' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {filteredUsers.map((u) => {
                const isCurrent = u.id === currentUser.id
                const roleBadge = getRoleBadgeStyle(u.role)
                return (
                  <div
                    key={u.id}
                    className="card-sandbox"
                    style={{
                      backgroundColor: 'var(--sb-surface)',
                      borderRadius: 'var(--sb-radius)',
                      border: isCurrent ? '2px solid var(--sb-primary)' : '1px solid var(--sb-border)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      position: 'relative',
                    }}
                  >
                    {/* Top Row: Avatar & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            backgroundColor: isCurrent ? 'var(--sb-primary)' : 'var(--sb-bg-alt)',
                            color: isCurrent ? '#ffffff' : 'var(--sb-heading)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1rem',
                            border: '1px solid var(--sb-border)',
                          }}
                        >
                          {u.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--sb-body)' }}>{u.email}</div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '9999px',
                          backgroundColor:
                            u.status === 'active'
                              ? 'var(--sb-success-soft)'
                              : u.status === 'invited'
                              ? 'var(--sb-warning-soft)'
                              : 'var(--sb-danger-soft)',
                          color:
                            u.status === 'active'
                              ? 'var(--sb-success-text)'
                              : u.status === 'invited'
                              ? 'var(--sb-warning-text)'
                              : 'var(--sb-danger-text)',
                        }}
                      >
                        ● {u.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Role & Department */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.55rem',
                          borderRadius: '9999px',
                          backgroundColor: roleBadge.bg,
                          color: roleBadge.text,
                          border: `1px solid ${roleBadge.border}`,
                        }}
                      >
                        {u.roleLabel || u.role}
                      </span>
                      {u.department && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            backgroundColor: 'var(--sb-bg-alt)',
                            color: 'var(--sb-body)',
                          }}
                        >
                          {u.department}
                        </span>
                      )}
                    </div>

                    {/* Security & Activity Stats */}
                    <div
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--sb-radius-sm)',
                        backgroundColor: 'var(--sb-bg-alt)',
                        fontSize: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--sb-body)' }}>2FA Protection:</span>
                        {u.twoFactorEnabled ? (
                          <span style={{ color: 'var(--sb-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <ShieldCheck size={13} /> Active (TOTP)
                          </span>
                        ) : (
                          <span style={{ color: 'var(--sb-warning)', fontWeight: 600 }}>Not Configured</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--sb-body)' }}>Last Login:</span>
                        <span style={{ fontWeight: 600, color: 'var(--sb-heading)' }}>
                          {formatLastLogin(u.lastLogin)}
                        </span>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--sb-border)' }}>
                      {!isCurrent && (
                        <button
                          onClick={() => switchUser(u.id)}
                          className="btn-sandbox btn-sandbox-ghost"
                          style={{ flex: 1, padding: '0.4rem', fontSize: '0.76rem' }}
                        >
                          Switch
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedUserForPasswordReset(u)}
                        className="btn-sandbox btn-sandbox-ghost"
                        style={{ padding: '0.4rem', fontSize: '0.76rem' }}
                        title="Reset Password"
                      >
                        <KeyRound size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUserForEdit(u)
                          setIsCreateModalOpen(true)
                        }}
                        className="btn-sandbox btn-sandbox-outline"
                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.76rem', gap: '0.3rem' }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: RBAC ROLES & CAPABILITIES MATRIX */}
      {activeTab === 'roles_matrix' && (
        <div
          className="card-sandbox"
          style={{
            backgroundColor: 'var(--sb-surface)',
            borderRadius: 'var(--sb-radius)',
            border: '1px solid var(--sb-border)',
            padding: '1.5rem',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sb-heading)', margin: '0 0 0.35rem' }}>
              Standard Role Hierarchy & Permissions
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--sb-body)', margin: 0 }}>
              Each team member is assigned a blueprint role with default capabilities. Individual permissions can also be fine-tuned per user.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {Object.entries(ROLE_DEFINITIONS).map(([roleKey, meta]) => {
              const roleBadge = getRoleBadgeStyle(roleKey as UserRole)
              const userCountForRole = users.filter((u) => u.role === roleKey).length
              return (
                <div
                  key={roleKey}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--sb-radius)',
                    backgroundColor: 'var(--sb-bg-alt)',
                    border: '1px solid var(--sb-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        backgroundColor: roleBadge.bg,
                        color: roleBadge.text,
                        border: `1px solid ${roleBadge.border}`,
                      }}
                    >
                      {meta.label}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--sb-body)', fontWeight: 700 }}>
                      {userCountForRole} assigned
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)', margin: 0, lineHeight: 1.4 }}>
                    {meta.description}
                  </p>

                  <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--sb-border)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--sb-heading)', marginBottom: '0.35rem' }}>
                      Default Permissions ({meta.defaultPermissions.length}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {meta.defaultPermissions.map((p) => (
                        <span
                          key={p}
                          style={{
                            fontSize: '0.66rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            backgroundColor: 'var(--sb-surface)',
                            border: '1px solid var(--sb-border)',
                            color: 'var(--sb-body)',
                          }}
                        >
                          {p.replace('manage_', '').replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 3: USER AUDIT TRAIL */}
      {activeTab === 'audit_log' && (
        <div
          className="card-sandbox"
          style={{
            backgroundColor: 'var(--sb-surface)',
            borderRadius: 'var(--sb-radius)',
            border: '1px solid var(--sb-border)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--sb-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                User & Authentication Audit Records
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--sb-body)', margin: '0.15rem 0 0 0' }}>
                Immutable SHA-256 integrity chained logs for account creation, role changes, and sign-ins
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--sb-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={14} /> SHA-256 Integrity Verified
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--sb-bg-alt)', borderBottom: '1px solid var(--sb-border)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Timestamp</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Actor</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Action</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Details</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--sb-heading)', fontWeight: 700 }}>Severity</th>
              </tr>
            </thead>
            <tbody>
              {userAuditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--sb-body)' }}>
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                userAuditLogs.slice(0, 30).map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--sb-border)' }}>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--sb-body)', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--sb-heading)' }}>
                      {log.actorName}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--sb-body)' }}>
                      {log.details}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.1rem 0.45rem',
                          borderRadius: '9999px',
                          backgroundColor:
                            log.severity === 'critical'
                              ? 'var(--sb-danger-soft)'
                              : log.severity === 'warning'
                              ? 'var(--sb-warning-soft)'
                              : 'var(--sb-primary-soft)',
                          color:
                            log.severity === 'critical'
                              ? 'var(--sb-danger-text)'
                              : log.severity === 'warning'
                              ? 'var(--sb-warning-text)'
                              : 'var(--sb-primary-text)',
                        }}
                      >
                        {log.severity.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALS */}
      {isCreateModalOpen && (
        <UserModal
          userToEdit={selectedUserForEdit}
          onClose={() => {
            setIsCreateModalOpen(false)
            setSelectedUserForEdit(null)
          }}
        />
      )}

      {selectedUserForPasswordReset && (
        <ResetPasswordModal
          user={selectedUserForPasswordReset}
          onClose={() => setSelectedUserForPasswordReset(null)}
        />
      )}

      {twoFactorSetupModalUser && (
        <TwoFactorSetupModal
          user={twoFactorSetupModalUser}
          onClose={() => setTwoFactorSetupModalUser(null)}
        />
      )}
    </div>
  )
}
