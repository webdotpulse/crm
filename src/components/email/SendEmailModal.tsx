import React, { useState, useEffect } from 'react'
import {
  X,
  Mail,
  Send,
  Sparkles,
  FileText,
  Building2,
  CheckCircle2,
  Paperclip,
  Eye,
} from 'lucide-react'
import { EmailTemplate, Quotation, Invoice } from '../../types'
import { useApp } from '../../context/AppContext'

interface SendEmailModalProps {
  recipientEmail: string
  recipientName: string
  documentType?: 'quote' | 'invoice' | 'deal' | 'project'
  document?: Quotation | Invoice | any
  onClose: () => void
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  recipientEmail,
  recipientName,
  documentType,
  document,
  onClose,
}) => {
  const {
    emailTemplates,
    activeLegalEntity,
    sendEmail,
  } = useApp()

  // Pick initial template based on documentType
  const defaultTemplate =
    emailTemplates.find((t) =>
      documentType === 'quote'
        ? t.type === 'quote_send'
        : documentType === 'invoice'
        ? t.type === 'invoice_send'
        : t.type === 'welcome'
    ) || emailTemplates[0]

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(defaultTemplate?.id || '')
  const [toEmail, setToEmail] = useState(recipientEmail)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)

  // Perform dynamic variable substitution
  const replaceVariables = (text: string) => {
    let result = text
    const vars: Record<string, string> = {
      client_name: recipientName || 'Valued Client',
      company_name: activeLegalEntity.name,
      company_email: activeLegalEntity.email,
      company_phone: activeLegalEntity.phone,
      company_iban: activeLegalEntity.iban,
      company_bic: activeLegalEntity.bic,
      document_number: document?.number || 'DOC-2026',
      title: document?.title || document?.reference || 'Commercial Proposal',
      total_amount: document?.total ? `€${document.total.toFixed(2)}` : '€0.00',
      due_date: document?.dueDate || document?.validUntilDate || '30 days',
      issue_date: document?.issueDate || new Date().toISOString().slice(0, 10),
      payment_reference: document?.structuredReference || '+++000/0000/00000+++',
      signature_link: `https://portal.pulsework.io/sign/${document?.id || 'doc'}`,
    }

    for (const [key, val] of Object.entries(vars)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, val)
    }
    return result
  }

  // Update subject and body when template changes
  useEffect(() => {
    const tmpl = emailTemplates.find((t) => t.id === selectedTemplateId)
    if (tmpl) {
      setSubject(replaceVariables(tmpl.subject))
      setBody(replaceVariables(tmpl.bodyHtml))
    }
  }, [selectedTemplateId, activeLegalEntity, document])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)

    setTimeout(() => {
      sendEmail({
        to: toEmail,
        recipientName,
        subject,
        body,
        relatedType: documentType,
        relatedId: document?.id,
      })
      setIsSending(false)
      setIsSent(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    }, 800)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'var(--sb-primary-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sb-primary)',
              }}
            >
              <Mail size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.15rem' }}>
                Email Client & Document Dispatch
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--sb-body)' }}>
                Send professional messages with dynamic variables from {activeLegalEntity.name}.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-sandbox btn-sandbox-ghost" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {isSent ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--sb-success-soft)',
                color: 'var(--sb-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Email Dispatched Successfully!</h3>
            <p style={{ color: 'var(--sb-body)' }}>Message sent to {toEmail} with PDF document copy attached.</p>
          </div>
        ) : (
          <form onSubmit={handleSend}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Template Picker */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--sb-bg)',
                  borderRadius: 'var(--sb-radius)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="var(--sb-primary)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Template:</span>
                </div>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="form-select-sandbox"
                  style={{ width: 'auto', minWidth: '260px' }}
                >
                  {emailTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient & Sender */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">To (Recipient Email) *</label>
                  <input
                    type="email"
                    required
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    className="form-input-sandbox"
                  />
                </div>

                <div>
                  <label className="form-label">From (Issuing Entity)</label>
                  <input
                    type="text"
                    disabled
                    value={`${activeLegalEntity.name} <${activeLegalEntity.email}>`}
                    className="form-input-sandbox"
                    style={{ backgroundColor: 'var(--sb-bg)', opacity: 0.8 }}
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="form-label">Subject Line *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="form-input-sandbox"
                />
              </div>

              {/* Body */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Message Body</label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="btn-sandbox btn-sandbox-ghost"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: 'var(--sb-primary)' }}
                  >
                    <Eye size={13} style={{ marginRight: '0.25rem' }} />
                    <span>{showPreview ? 'Edit Raw Text' : 'Formatted Preview'}</span>
                  </button>
                </div>

                {showPreview ? (
                  <div
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--sb-border)',
                      borderRadius: 'var(--sb-radius)',
                      minHeight: '200px',
                      backgroundColor: 'var(--sb-card-bg)',
                      fontSize: '0.88rem',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {body}
                  </div>
                ) : (
                  <textarea
                    rows={8}
                    required
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="form-input-sandbox"
                    style={{ fontFamily: 'var(--sb-font-mono)', fontSize: '0.85rem' }}
                  />
                )}
              </div>

              {/* Attachment Pill */}
              {document && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--sb-border)',
                    borderRadius: 'var(--sb-radius)',
                    fontSize: '0.8rem',
                    width: 'fit-content',
                  }}
                >
                  <Paperclip size={14} color="var(--sb-primary)" />
                  <span style={{ fontWeight: 600 }}>{document.number || 'Document'}.pdf</span>
                  <span style={{ color: 'var(--sb-body)', fontSize: '0.72rem' }}>(Generated & attached automatically)</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn-sandbox btn-sandbox-secondary">
                Cancel
              </button>
              <button type="submit" disabled={isSending} className="btn-sandbox btn-sandbox-primary">
                <Send size={15} />
                <span>{isSending ? 'Dispatching...' : 'Send Message'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
