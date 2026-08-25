import React, { useState } from 'react'
import { X, User, Shield, Mail, Phone, Building, Check, Trash2, Key } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { UserAccount, UserRole } from '../../types'

interface UserManagementModalProps {
  userToEdit?: UserAccount | null
  onClose: () => void
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ userToEdit, onClose }) => {
  const { addUser, updateUser, deleteUser, setTwoFactorSetupModalUser } = useApp()

  const [name, setName] = useState(userToEdit?.name || '')
  const [email, setEmail] = useState(userToEdit?.email || '')
  const [role, setRole] = useState<UserRole>(userToEdit?.role || 'sales')
  const [department, setDepartment] = useState(userToEdit?.department || '')
  const [phone, setPhone] = useState(userToEdit?.phone || '')
  const [status, setStatus] = useState<'active' | 'suspended' | 'invited'>(
    userToEdit?.status || 'active'
  )
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(userToEdit?.twoFactorEnabled || false)

  const roleLabels: Record<UserRole, string> = {
    owner: 'Managing Director & Super Admin',
    admin: 'System Administrator',
    finance: 'Finance & Invoicing Director',
    sales: 'Senior Account Executive',
    project_manager: 'Technical Project Lead',
    accountant: 'External Chartered Auditor (Read-Only)',
    hr: 'HR & People Operations',
    support: 'Customer Support Lead',
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (userToEdit) {
      updateUser({
        ...userToEdit,
        name,
        email,
        role,
        roleLabel: roleLabels[role],
        department,
        phone,
        status,
        twoFactorEnabled,
      })
    } else {
      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        name,
        email,
        role,
        roleLabel: roleLabels[role],
        department,
        phone,
        status,
        twoFactorEnabled: false,
        lastLogin: new Date().toISOString(),
      }
      addUser(newUser)
      if (twoFactorEnabled) {
        setTwoFactorSetupModalUser(newUser)
      }
    }
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="card-sandbox"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--sb-surface)',
          borderRadius: 'var(--sb-radius-lg)',
          boxShadow: 'var(--sb-shadow-lg)',
          border: '1px solid var(--sb-border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--sb-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(63, 120, 224, 0.08) 0%, rgba(96, 93, 186, 0.08) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--sb-primary-soft)',
                color: 'var(--sb-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                {userToEdit ? 'Edit Team Member & Permissions' : 'Invite New Team Member'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)', margin: '0.15rem 0 0 0' }}>
                Role-Based Access Control (RBAC) & 2FA Configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-sandbox btn-sandbox-ghost"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Van den Berg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-sandbox"
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. alex@pulsework.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-sandbox"
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                RBAC Security Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="input-sandbox"
                style={{ width: '100%', boxSizing: 'border-box' }}
              >
                <option value="owner">Super Admin / Owner (Full Access)</option>
                <option value="admin">System Administrator</option>
                <option value="finance">Finance & Invoicing (Peppol, Tax)</option>
                <option value="sales">Sales & Commercial</option>
                <option value="project_manager">Project Manager & Delivery</option>
                <option value="accountant">External Auditor (Read-Only)</option>
                <option value="hr">HR & People Operations</option>
                <option value="support">Customer Support Specialist</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Executive / Sales / Finance"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+32 470 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-sandbox"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                Account Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="input-sandbox"
                style={{ width: '100%', boxSizing: 'border-box' }}
              >
                <option value="active">Active</option>
                <option value="invited">Invited / Pending Acceptance</option>
                <option value="suspended">Suspended / Locked</option>
              </select>
            </div>
          </div>

          {/* 2FA Protection Toggle */}
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--sb-bg-alt)',
              borderRadius: 'var(--sb-radius)',
              border: '1px solid var(--sb-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                Two-Factor Authentication (2FA)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                {twoFactorEnabled
                  ? 'TOTP Authenticator Protection is Active.'
                  : 'Require user to configure 2FA upon next login.'}
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--sb-primary)' }}
              />
            </label>
          </div>

          {/* Modal Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--sb-border)',
            }}
          >
            {userToEdit && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to revoke and delete ${userToEdit.name}'s account?`)) {
                    deleteUser(userToEdit.id)
                    onClose()
                  }
                }}
                className="btn-sandbox btn-sandbox-danger"
                style={{ gap: '0.35rem', fontSize: '0.8rem' }}
              >
                <Trash2 size={14} /> Revoke Access
              </button>
            )}

            <div style={{ display: 'flex', gap: '0.6rem', marginLeft: 'auto' }}>
              <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-outline">
                Cancel
              </button>
              <button type="submit" className="btn-sandbox btn-sandbox-primary" style={{ gap: '0.4rem', fontWeight: 800 }}>
                <Check size={16} /> {userToEdit ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
