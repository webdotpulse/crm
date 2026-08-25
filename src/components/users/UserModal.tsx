import React, { useState } from 'react'
import {
  X,
  User,
  Shield,
  Mail,
  Phone,
  Building,
  Check,
  Trash2,
  KeyRound,
  Sparkles,
  Lock,
  Smartphone,
  CheckCircle2,
  Briefcase,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { UserAccount, UserPermission, UserRole } from '../../types'
import {
  ROLE_DEFINITIONS,
  generateSecurePassword,
  hashPassword,
} from '../../services/securityService'

interface UserModalProps {
  userToEdit?: UserAccount | null
  onClose: () => void
}

const ALL_AVAILABLE_PERMISSIONS: { key: UserPermission; label: string; description: string; category: string }[] = [
  { key: 'manage_crm', label: 'CRM & Customer Pipeline', description: 'Deals, clients, contacts, quotations', category: 'Commercial' },
  { key: 'manage_invoices', label: 'Invoices & Billing', description: 'Create, issue, edit and credit invoices', category: 'Finance' },
  { key: 'manage_peppol', label: 'Peppol BIS E-Invoicing', description: 'Transmit and receive e-invoices over Peppol', category: 'Finance' },
  { key: 'export_financials', label: 'Financials & Tax Export', description: 'Export accounting ledger, VAT and OSS returns', category: 'Finance' },
  { key: 'manage_inventory', label: 'Inventory & Warehousing', description: 'Stock transfers, procurement, serial numbers', category: 'Operations' },
  { key: 'manage_hr', label: 'PulseHR & Staff Capacity', description: 'Leave requests, capacities, expense batches', category: 'People' },
  { key: 'manage_support', label: 'PulseDesk Helpdesk', description: 'Customer tickets, canned responses, live chat', category: 'Support' },
  { key: 'manage_users', label: 'User & Team Administration', description: 'Create accounts, assign roles, reset passwords', category: 'Administration' },
  { key: 'manage_settings', label: 'Workspace Settings & Themes', description: 'Company profile, branding, presets, modules', category: 'Administration' },
  { key: 'manage_api_keys', label: 'API Keys & Webhooks', description: 'Developer keys, Zapier, Webhook endpoints', category: 'Administration' },
  { key: 'view_audit_logs', label: 'Security & Audit Trails', description: 'Inspect SHA-256 tamper-evident logs', category: 'Security' },
]

export const UserModal: React.FC<UserModalProps> = ({ userToEdit, onClose }) => {
  const { addUser, updateUser, deleteUser, setTwoFactorSetupModalUser, currentUser } = useApp()

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'permissions'>('profile')

  // Form Fields
  const [name, setName] = useState(userToEdit?.name || '')
  const [email, setEmail] = useState(userToEdit?.email || '')
  const [role, setRole] = useState<UserRole>(userToEdit?.role || 'sales')
  const [department, setDepartment] = useState(userToEdit?.department || 'Commercial')
  const [jobTitle, setJobTitle] = useState(userToEdit?.jobTitle || '')
  const [phone, setPhone] = useState(userToEdit?.phone || '')
  const [status, setStatus] = useState<'active' | 'suspended' | 'invited'>(
    userToEdit?.status || 'active'
  )
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(userToEdit?.twoFactorEnabled || false)
  const [pinCode, setPinCode] = useState(userToEdit?.pinCode || '1234')

  // New User Password Fields
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mustChangePassword, setMustChangePassword] = useState(
    userToEdit ? userToEdit.mustChangePassword || false : true
  )

  // Custom Permissions
  const [permissions, setPermissions] = useState<UserPermission[]>(() => {
    if (userToEdit?.customPermissions) return userToEdit.customPermissions
    return ROLE_DEFINITIONS[role]?.defaultPermissions || []
  })

  // Track if permissions have been manually modified
  const [customPermissionsModified, setCustomPermissionsModified] = useState(Boolean(userToEdit?.customPermissions))

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole)
    if (!customPermissionsModified) {
      setPermissions(ROLE_DEFINITIONS[newRole]?.defaultPermissions || [])
    }
  }

  const togglePermission = (permKey: UserPermission) => {
    setCustomPermissionsModified(true)
    setPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((k) => k !== permKey) : [...prev, permKey]
    )
  }

  const handleGeneratePassword = () => {
    const generated = generateSecurePassword(14)
    setPassword(generated)
    setShowPassword(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const roleMeta = ROLE_DEFINITIONS[role] || {
      label: 'Team Member',
      description: '',
      defaultPermissions: [],
    }

    if (userToEdit) {
      let passwordHash = userToEdit.passwordHash
      if (password.trim()) {
        passwordHash = await hashPassword(password.trim())
      }

      updateUser({
        ...userToEdit,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        roleLabel: roleMeta.label,
        department: department.trim(),
        jobTitle: jobTitle.trim(),
        phone: phone.trim(),
        status,
        twoFactorEnabled,
        pinCode: pinCode.trim(),
        customPermissions: permissions,
        passwordHash,
        mustChangePassword,
      })
    } else {
      const generatedPwd = password.trim() || generateSecurePassword(12)
      const passHash = await hashPassword(generatedPwd)

      const newUser: UserAccount = {
        id: `usr-${Date.now().toString(36)}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        roleLabel: roleMeta.label,
        department: department.trim() || 'General',
        jobTitle: jobTitle.trim() || roleMeta.label,
        phone: phone.trim(),
        status,
        twoFactorEnabled: false,
        pinCode: pinCode.trim() || '1234',
        passwordHash: passHash,
        customPermissions: permissions,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        mustChangePassword,
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
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="card-sandbox"
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: 'var(--sb-surface)',
          borderRadius: 'var(--sb-radius-lg)',
          boxShadow: 'var(--sb-shadow-lg)',
          border: '1px solid var(--sb-border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
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
                width: '42px',
                height: '42px',
                borderRadius: '12px',
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
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--sb-heading)', margin: 0 }}>
                {userToEdit ? `Edit Profile: ${userToEdit.name}` : 'Create New Team Member'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)', margin: '0.15rem 0 0 0' }}>
                Role-Based Access Control (RBAC), Credentials & Security Settings
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-sandbox-ghost" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--sb-border)',
            backgroundColor: 'var(--sb-bg-alt)',
            padding: '0 1.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'none',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: activeTab === 'profile' ? 'var(--sb-primary)' : 'var(--sb-body)',
              borderBottom: activeTab === 'profile' ? '2px solid var(--sb-primary)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            1. Profile & Identity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'none',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: activeTab === 'permissions' ? 'var(--sb-primary)' : 'var(--sb-body)',
              borderBottom: activeTab === 'permissions' ? '2px solid var(--sb-primary)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            2. Role & Permissions ({permissions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={{
              padding: '0.75rem 1rem',
              border: 'none',
              background: 'none',
              fontSize: '0.84rem',
              fontWeight: 700,
              color: activeTab === 'security' ? 'var(--sb-primary)' : 'var(--sb-body)',
              borderBottom: activeTab === 'security' ? '2px solid var(--sb-primary)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            3. Credentials & 2FA
          </button>
        </div>

        {/* Form Form Container */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* TAB 1: Profile & Identity */}
            {activeTab === 'profile' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Marie Dubois"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-sandbox"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. marie@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-sandbox"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Finance, Sales, Operations"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="input-sandbox"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                      Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Financial Controller"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="input-sandbox"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+32 470 12 34 56"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-sandbox"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                      Account Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="input-sandbox"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    >
                      <option value="active">Active (Granted Access)</option>
                      <option value="invited">Invited (Pending Confirmation)</option>
                      <option value="suspended">Suspended (Blocked Access)</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: Roles & Permissions */}
            {activeTab === 'permissions' && (
              <>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                    RBAC Role Blueprint *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="input-sandbox"
                    style={{ width: '100%', boxSizing: 'border-box', fontWeight: 600 }}
                  >
                    <option value="owner">Managing Director & Super Admin (Full Unrestricted Access)</option>
                    <option value="admin">System Administrator (Settings, Users & Audit Logs)</option>
                    <option value="finance">Finance & Invoicing Director (Peppol, Tax & Billing)</option>
                    <option value="sales">Senior Account Executive (CRM, Pipeline & Quotes)</option>
                    <option value="project_manager">Technical Project Lead (Delivery & Stock)</option>
                    <option value="accountant">External Chartered Auditor (Read-Only Financials)</option>
                    <option value="hr">HR & People Operations Lead (Capacities & Leave)</option>
                    <option value="support">Customer Support Specialist (PulseDesk Tickets)</option>
                  </select>
                  <div style={{ fontSize: '0.74rem', color: 'var(--sb-body)', marginTop: '0.35rem' }}>
                    {ROLE_DEFINITIONS[role]?.description}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--sb-heading)' }}>
                      Granular Module Permissions Matrix
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setPermissions(ROLE_DEFINITIONS[role]?.defaultPermissions || [])
                        setCustomPermissionsModified(false)
                      }}
                      className="btn-sandbox btn-sandbox-ghost"
                      style={{ fontSize: '0.74rem', padding: '0.15rem 0.5rem', color: 'var(--sb-primary)' }}
                    >
                      Reset to Role Defaults
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.6rem',
                      maxHeight: '260px',
                      overflowY: 'auto',
                      padding: '0.2rem',
                    }}
                  >
                    {ALL_AVAILABLE_PERMISSIONS.map((perm) => {
                      const isChecked = permissions.includes(perm.key)
                      return (
                        <label
                          key={perm.key}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.6rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: 'var(--sb-radius)',
                            backgroundColor: isChecked ? 'var(--sb-primary-soft)' : 'var(--sb-bg-alt)',
                            border: isChecked ? '1px solid var(--sb-primary)' : '1px solid var(--sb-border)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(perm.key)}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--sb-primary)', marginTop: '2px' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                              {perm.label}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--sb-body)', lineHeight: 1.25 }}>
                              {perm.description}
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: Credentials & 2FA */}
            {activeTab === 'security' && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                      {userToEdit ? 'Update Password (leave empty to keep current)' : 'Initial Password *'}
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="btn-sandbox btn-sandbox-ghost"
                      style={{ fontSize: '0.74rem', padding: '0.15rem 0.4rem', color: 'var(--sb-primary)', gap: '0.25rem' }}
                    >
                      <Sparkles size={13} /> Generate Strong Password
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={userToEdit ? '••••••••••••' : 'Set a secure temporary password...'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-sandbox"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        paddingRight: '2.5rem',
                        fontFamily: password ? 'var(--sb-font-mono)' : 'inherit',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--sb-body)',
                        cursor: 'pointer',
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sb-heading)', display: 'block', marginBottom: '0.35rem' }}>
                      Screen Lock PIN (4 digits)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="1234"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="input-sandbox"
                      style={{ width: '100%', boxSizing: 'border-box', letterSpacing: '0.1em' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '1.2rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--sb-heading)' }}>
                      <input
                        type="checkbox"
                        checked={mustChangePassword}
                        onChange={(e) => setMustChangePassword(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--sb-primary)' }}
                      />
                      <span>Must change password on next sign-in</span>
                    </label>
                  </div>
                </div>

                {/* 2FA Status Toggle */}
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--sb-bg-alt)',
                    borderRadius: 'var(--sb-radius)',
                    border: '1px solid var(--sb-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Smartphone size={22} color="var(--sb-primary)" />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--sb-heading)' }}>
                        Two-Factor Authentication (2FA)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sb-body)' }}>
                        {twoFactorEnabled
                          ? 'TOTP Authenticator Protection is configured for this account.'
                          : 'Require team member to configure Google/MS Authenticator.'}
                      </div>
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
              </>
            )}
          </div>

          {/* Modal Actions Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--sb-border)',
              backgroundColor: 'var(--sb-surface)',
            }}
          >
            {userToEdit && userToEdit.id !== currentUser.id ? (
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
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-outline">
                Cancel
              </button>
              <button type="submit" className="btn-sandbox btn-sandbox-primary" style={{ gap: '0.4rem', fontWeight: 800 }}>
                <Check size={16} /> {userToEdit ? 'Save Account Changes' : 'Create User Account'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
