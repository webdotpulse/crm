import { Invoice, DunningCase, DunningNotice, DunningStage, Company, IndividualClient } from '../types'

// Statutory constants according to Belgian Code of Economic Law (Book XIX) & EU Directive 2011/7/EU
export const BELGIAN_STATUTORY_RECOVERY_FEE = 40.0 // €40 fixed compensation for recovery costs
export const STATUTORY_LATE_INTEREST_RATE = 0.125 // 12.5% per annum legal B2B interest rate in Belgium (2026)

export function calculateDunningEscalation(invoice: Invoice, clientName: string, clientEmail: string): DunningCase {
  const today = new Date()
  const due = new Date(invoice.dueDate)
  const diffTime = today.getTime() - due.getTime()
  const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)))
  const balanceDue = invoice.total - invoice.amountPaid

  let currentStage: DunningStage = 'reminder_1'
  let totalStatutoryFees = 0
  let totalInterest = 0

  if (daysOverdue >= 30) {
    currentStage = 'bailiff_notice'
    totalStatutoryFees = BELGIAN_STATUTORY_RECOVERY_FEE
    totalInterest = Math.round((balanceDue * (STATUTORY_LATE_INTEREST_RATE / 365) * daysOverdue) * 100) / 100
  } else if (daysOverdue >= 14) {
    currentStage = 'formal_notice'
    totalStatutoryFees = BELGIAN_STATUTORY_RECOVERY_FEE
    totalInterest = Math.round((balanceDue * (STATUTORY_LATE_INTEREST_RATE / 365) * daysOverdue) * 100) / 100
  } else {
    currentStage = 'reminder_1'
    totalStatutoryFees = 0
    totalInterest = 0
  }

  const totalClaim = balanceDue + totalStatutoryFees + totalInterest

  const notices: DunningNotice[] = []

  if (daysOverdue >= 7) {
    notices.push({
      id: `dun-not-1-${invoice.id}`,
      invoiceId: invoice.id,
      stage: 'reminder_1',
      stageNumber: 1,
      issuedDate: new Date(due.getTime() + 7 * 86400000).toISOString().slice(0, 10),
      dueDate: new Date(due.getTime() + 14 * 86400000).toISOString().slice(0, 10),
      daysOverdue: 7,
      principalAmount: balanceDue,
      statutoryFee: 0,
      interestAmount: 0,
      totalClaimAmount: balanceDue,
      paymentLinkUrl: `https://pay.pulsework.be/checkout/${invoice.id}?method=bancontact`,
      sentVia: 'email',
      status: 'sent',
      notes: 'Friendly payment reminder sent via email with Bancontact 1-click link.',
    })
  }

  if (daysOverdue >= 14) {
    notices.push({
      id: `dun-not-2-${invoice.id}`,
      invoiceId: invoice.id,
      stage: 'formal_notice',
      stageNumber: 2,
      issuedDate: new Date(due.getTime() + 14 * 86400000).toISOString().slice(0, 10),
      dueDate: new Date(due.getTime() + 21 * 86400000).toISOString().slice(0, 10),
      daysOverdue: 14,
      principalAmount: balanceDue,
      statutoryFee: BELGIAN_STATUTORY_RECOVERY_FEE,
      interestAmount: Math.round((balanceDue * (STATUTORY_LATE_INTEREST_RATE / 365) * 14) * 100) / 100,
      totalClaimAmount: balanceDue + BELGIAN_STATUTORY_RECOVERY_FEE + Math.round((balanceDue * (STATUTORY_LATE_INTEREST_RATE / 365) * 14) * 100) / 100,
      paymentLinkUrl: `https://pay.pulsework.be/checkout/${invoice.id}?method=bancontact`,
      sentVia: 'email',
      status: 'sent',
      notes: 'Formal Notice of Default (Ingebrekestelling) issued. Statutory €40.00 fee applied.',
    })
  }

  if (daysOverdue >= 30) {
    notices.push({
      id: `dun-not-3-${invoice.id}`,
      invoiceId: invoice.id,
      stage: 'bailiff_notice',
      stageNumber: 3,
      issuedDate: new Date(due.getTime() + 30 * 86400000).toISOString().slice(0, 10),
      dueDate: new Date(due.getTime() + 37 * 86400000).toISOString().slice(0, 10),
      daysOverdue: 30,
      principalAmount: balanceDue,
      statutoryFee: BELGIAN_STATUTORY_RECOVERY_FEE,
      interestAmount: totalInterest,
      totalClaimAmount: totalClaim,
      paymentLinkUrl: `https://pay.pulsework.be/checkout/${invoice.id}?method=bancontact`,
      sentVia: 'postal',
      status: 'escalated_to_bailiff',
      notes: 'Pre-Legal Notice issued. Ready for Unpaid.be / Modero Judicial Bailiff recovery.',
      bailiffDossierId: `BE-REC-${Math.floor(100000 + Math.random() * 900000)}`,
    })
  }

  return {
    invoiceId: invoice.id,
    invoiceNumber: invoice.number,
    clientName,
    clientEmail,
    originalAmount: invoice.total,
    amountPaid: invoice.amountPaid,
    balanceDue,
    dueDate: invoice.dueDate,
    daysOverdue,
    currentStage,
    totalStatutoryFees,
    totalInterest,
    totalClaim,
    status: daysOverdue >= 30 ? 'escalated_to_bailiff' : daysOverdue > 0 ? 'sent' : 'pending',
    notices,
    lastContactDate: notices[notices.length - 1]?.issuedDate || invoice.issueDate,
  }
}

export function generateBailiffClaimExportJson(dunningCase: DunningCase, creditorCompany: Company): string {
  const exportPayload = {
    recoveryPlatform: 'Unpaid.be & Modero Judicial Officers (Gerechtsdeurwaarders)',
    dossierReference: `UNP-2026-${dunningCase.invoiceNumber.replace(/[^0-9]/g, '')}`,
    exportDate: new Date().toISOString(),
    legalFramework: 'Belgian Judicial Code Art. 1394/20 (IOS Procedure B2B Incontestable Claims)',
    creditor: {
      name: creditorCompany.name,
      vatNumber: creditorCompany.vatNumber,
      iban: (creditorCompany as any).iban || '',
      email: creditorCompany.email,
      address: `${creditorCompany.address}, ${creditorCompany.postalCode} ${creditorCompany.city}`,
    },
    debtor: {
      name: dunningCase.clientName,
      email: dunningCase.clientEmail,
      phone: dunningCase.clientPhone || '+32',
    },
    claimDetails: {
      invoiceNumber: dunningCase.invoiceNumber,
      invoiceDueDate: dunningCase.dueDate,
      daysOverdue: dunningCase.daysOverdue,
      principalBalanceEur: dunningCase.balanceDue,
      statutoryCompensationEur: dunningCase.totalStatutoryFees,
      contractualInterestEur: dunningCase.totalInterest,
      totalClaimAmountEur: dunningCase.totalClaim,
    },
    evidences: [
      { type: 'PEPPOL_UBL_XML', file: `UBL_${dunningCase.invoiceNumber}.xml`, status: 'validated' },
      { type: 'SIGNED_DELIVERY_RECEIPT', file: `DELIVERY_${dunningCase.invoiceNumber}.pdf`, status: 'attached' },
      { type: 'FORMAL_NOTICE_DEFAULT', file: `NOTICE_14D_${dunningCase.invoiceNumber}.pdf`, status: 'delivered' },
    ],
  }

  return JSON.stringify(exportPayload, null, 2)
}
