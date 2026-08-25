import { Invoice, Company, IndividualClient, LegalEntity } from '../types'

export interface SepaCollectionItem {
  invoice: Invoice
  debtorName: string
  debtorIban: string
  debtorBic: string
  mandateId: string
  mandateDate: string
}

/**
 * Generates ISO 20022 / EPC SEPA Direct Debit pain.008.001.02 XML
 */
export function generateSepaDirectDebitXml(options: {
  batchReference: string
  collectionDate: string // YYYY-MM-DD
  creditor: LegalEntity
  items: SepaCollectionItem[]
}): string {
  const { batchReference, collectionDate, creditor, items } = options
  const msgId = `SDD-${Date.now()}`
  const creationDateTime = new Date().toISOString().replace(/\.\d+Z$/, '')
  const totalAmount = items.reduce((sum, item) => sum + (item.invoice.total - item.invoice.amountPaid), 0)
  const numberOfTransactions = items.length

  const cleanIban = (creditor.iban || '').replace(/\s+/g, '')
  const cleanBic = (creditor.bic || '').replace(/\s+/g, '')
  const creditorId = `BE99ZZZ${(creditor.vatNumber || '').replace(/\D/g, '').padEnd(10, '0')}`

  const txNodes = items
    .map((item, idx) => {
      const remainingAmt = (item.invoice.total - item.invoice.amountPaid).toFixed(2)
      const debtorIban = (item.debtorIban || '').replace(/\s+/g, '')
      const debtorBic = (item.debtorBic || '').replace(/\s+/g, '')
      const mandateId = item.mandateId || `MAND-${item.invoice.id}`
      const mandateDate = item.mandateDate || '2025-01-01'
      const endToEndId = `E2E-${item.invoice.number}`

      return `      <DrctDbtTxInf>
        <PmtId>
          <EndToEndId>${endToEndId}</EndToEndId>
        </PmtId>
        <InstdAmt Ccy="EUR">${remainingAmt}</InstdAmt>
        <DrctDbtTx>
          <MndtRltdInf>
            <MndtId>${mandateId}</MndtId>
            <DtOfSgntr>${mandateDate}</DtOfSgntr>
            <AmdmntInd>false</AmdmntInd>
          </MndtRltdInf>
        </DrctDbtTx>
        <DbtrAgt>
          <FinInstnId>
            <BIC>${debtorBic || 'GENOBEBB'}</BIC>
          </FinInstnId>
        </DbtrAgt>
        <Dbtr>
          <Nm>${escapeXml(item.debtorName)}</Nm>
        </Dbtr>
        <DbtrAcct>
          <Id>
            <IBAN>${debtorIban}</IBAN>
          </Id>
        </DbtrAcct>
        <RmtInf>
          <Strd>
            <CdtrRefInf>
              <Tp>
                <CdOrPrtry>
                  <Cd>SCOR</Cd>
                </CdOrPrtry>
                <Issr>BBA</Issr>
              </Tp>
              <Ref>${item.invoice.structuredReference.replace(/[^0-9]/g, '') || item.invoice.number}</Ref>
            </CdtrRefInf>
          </Strd>
        </RmtInf>
      </DrctDbtTxInf>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <CstmrDrctDbtInitn>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${creationDateTime}</CreDtTm>
      <NbOfTxs>${numberOfTransactions}</NbOfTxs>
      <CtrlSum>${totalAmount.toFixed(2)}</CtrlSum>
      <InitgPty>
        <Nm>${escapeXml(creditor.legalName || creditor.name)}</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${batchReference}</PmtInfId>
      <PmtMtd>DD</PmtMtd>
      <NbOfTxs>${numberOfTransactions}</NbOfTxs>
      <CtrlSum>${totalAmount.toFixed(2)}</CtrlSum>
      <PmtTpInf>
        <SvcLvl>
          <Cd>SEPA</Cd>
        </SvcLvl>
        <LclInstrm>
          <Cd>CORE</Cd>
        </LclInstrm>
        <SeqTp>RCUR</SeqTp>
      </PmtTpInf>
      <ReqdColltnDt>${collectionDate}</ReqdColltnDt>
      <Cdtr>
        <Nm>${escapeXml(creditor.legalName || creditor.name)}</Nm>
      </Cdtr>
      <CdtrAcct>
        <Id>
          <IBAN>${cleanIban}</IBAN>
        </Id>
        <Ccy>EUR</Ccy>
      </CdtrAcct>
      <CdtrAgt>
        <FinInstnId>
          <BIC>${cleanBic}</BIC>
        </FinInstnId>
      </CdtrAgt>
      <CdtrSchmeId>
        <Id>
          <PrvtId>
            <Othr>
              <Id>${creditorId}</Id>
              <SchmeNm>
                <Prtry>SEPA</Prtry>
              </SchmeNm>
            </Othr>
          </PrvtId>
        </Id>
      </CdtrSchmeId>
${txNodes}
    </PmtInf>
  </CstmrDrctDbtInitn>
</Document>`
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
