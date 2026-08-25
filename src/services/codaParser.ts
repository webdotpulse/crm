import { BankStatement, BankTransaction } from '../types'

/**
 * Format a 12-digit number into Belgian OGM format +++123/4567/89012+++
 */
export function formatBelgianOgm(digits: string): string {
  const clean = digits.replace(/\D/g, '')
  if (clean.length === 12) {
    return `+++${clean.slice(0, 3)}/${clean.slice(3, 7)}/${clean.slice(7, 12)}+++`
  }
  return digits
}

/**
 * Detect structured communication in arbitrary text (e.g. +++090/9337/55493+++ or +++123/4567/89012+++)
 */
export function extractStructuredReference(text: string): string | undefined {
  if (!text) return undefined

  // Match +++123/4567/89012+++
  const ogmRegex = /\+{3}(\d{3})\/(\d{4})\/(\d{5})\+{3}/
  const ogmMatch = text.match(ogmRegex)
  if (ogmMatch) {
    return ogmMatch[0]
  }

  // Match +++123456789012+++ or 123/4567/89012
  const looseMatch = text.match(/(\d{3})\/(\d{4})\/(\d{5})/)
  if (looseMatch) {
    return `+++${looseMatch[1]}/${looseMatch[2]}/${looseMatch[3]}+++`
  }

  // Match ***123/4567/89012***
  const starMatch = text.match(/\*{3}(\d{3})\/(\d{4})\/(\d{5})\*{3}/)
  if (starMatch) {
    return `+++${starMatch[1]}/${starMatch[2]}/${starMatch[3]}+++`
  }

  return undefined
}

/**
 * Parse Belgian CODA 2.2 file contents
 */
export function parseCodaFile(fileContent: string, fileName: string): { statement: BankStatement; transactions: BankTransaction[] } {
  const lines = fileContent.split(/\r?\n/)
  const transactions: BankTransaction[] = []
  let accountIban = ''
  let statementNumber = `CODA-${new Date().toISOString().slice(0, 10)}`
  let openingBalance = 0
  let closingBalance = 0

  let currentTx: Partial<BankTransaction> | null = null

  lines.forEach((line, index) => {
    if (line.length < 2) return
    const recordType = line.charAt(0)

    if (recordType === '0') {
      // Header record
      const stmtNum = line.substring(2, 5).trim()
      if (stmtNum) statementNumber = `CODA-${stmtNum.padStart(3, '0')}`
    } else if (recordType === '1') {
      // Old balance
      const sign = line.charAt(42) === '1' ? -1 : 1
      const rawAmt = parseInt(line.substring(43, 58) || '0', 10) / 1000
      openingBalance = sign * rawAmt
      const iban = line.substring(5, 39).trim()
      if (iban) accountIban = iban
    } else if (recordType === '2') {
      const subType = line.charAt(1)
      if (subType === '1') {
        // Movement 2.1
        if (currentTx && currentTx.id) {
          transactions.push(currentTx as BankTransaction)
        }

        const dateStr = line.substring(11, 17) // YYMMDD
        const year = `20${dateStr.substring(0, 2)}`
        const month = dateStr.substring(2, 4)
        const day = dateStr.substring(4, 6)
        const date = `${year}-${month}-${day}`

        const sign = line.charAt(31) === '1' ? -1 : 1
        const rawAmt = parseInt(line.substring(32, 47) || '0', 10) / 1000
        const amount = sign * rawAmt

        const structComm = line.substring(62, 74).trim()
        const structuredRef = structComm.length === 12 ? formatBelgianOgm(structComm) : undefined

        currentTx = {
          id: `tx-coda-${Date.now()}-${index}`,
          date,
          valueDate: date,
          amount,
          currency: 'EUR',
          counterpartyName: 'Counterparty',
          counterpartyIban: '',
          description: line.substring(74).trim() || 'CODA Bank Transfer',
          structuredReference: structuredRef,
          reconciled: false,
        }
      } else if (subType === '2' && currentTx) {
        // Movement 2.2 - contains counterparty name & communication
        const comm = line.substring(10, 63).trim()
        if (comm) {
          currentTx.description = (currentTx.description ? currentTx.description + ' ' : '') + comm
          if (!currentTx.structuredReference) {
            currentTx.structuredReference = extractStructuredReference(comm)
          }
        }
      } else if (subType === '3' && currentTx) {
        // Movement 2.3 - contains counterparty account & name
        const iban = line.substring(10, 44).trim()
        const name = line.substring(47, 82).trim()
        if (iban) currentTx.counterpartyIban = iban
        if (name) currentTx.counterpartyName = name
      }
    } else if (recordType === '8') {
      // New balance
      const sign = line.charAt(41) === '1' ? -1 : 1
      const rawAmt = parseInt(line.substring(42, 57) || '0', 10) / 1000
      closingBalance = sign * rawAmt
    }
  })

  if (currentTx && currentTx.id) {
    transactions.push(currentTx as BankTransaction)
  }

  const statement: BankStatement = {
    id: `stmt-${Date.now()}`,
    statementNumber,
    accountIban: accountIban || 'Main Operating Account',
    accountName: 'Imported CODA Account',
    fileName,
    importDate: new Date().toISOString(),
    format: 'coda',
    openingBalance,
    closingBalance: closingBalance || (openingBalance + transactions.reduce((acc, t) => acc + t.amount, 0)),
    currency: 'EUR',
    transactionCount: transactions.length,
    reconciledCount: 0,
  }

  return { statement, transactions }
}

/**
/**
 * Helper to find an element in an XML document/node by local tag name (ignoring namespace prefixes)
 */
function findXmlNode(parent: ParentNode | null | undefined, localTagName: string): Element | null {
  if (!parent) return null
  const target = localTagName.toLowerCase()
  const allElements = parent.querySelectorAll ? parent.querySelectorAll('*') : (parent as any).getElementsByTagName?.('*')
  if (allElements) {
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i]
      const local = (el.localName || el.nodeName.split(':').pop() || '').toLowerCase()
      if (local === target) {
        return el
      }
    }
  }
  return null
}

function findXmlNodes(parent: ParentNode | null | undefined, localTagName: string): Element[] {
  if (!parent) return []
  const target = localTagName.toLowerCase()
  const results: Element[] = []
  const allElements = parent.querySelectorAll ? parent.querySelectorAll('*') : (parent as any).getElementsByTagName?.('*')
  if (allElements) {
    for (let i = 0; i < allElements.length; i++) {
      const el = allElements[i]
      const local = (el.localName || el.nodeName.split(':').pop() || '').toLowerCase()
      if (local === target) {
        results.push(el)
      }
    }
  }
  return results
}

function getXmlText(parent: ParentNode | null | undefined, localTagName: string): string {
  const node = findXmlNode(parent, localTagName)
  return node?.textContent?.trim() || ''
}

/**
 * Parse CAMT.053 XML file (ISO 20022 Bank-to-Customer Statement)
 */
export function parseCamt053File(xmlContent: string, fileName: string): { statement: BankStatement; transactions: BankTransaction[] } {
  const transactions: BankTransaction[] = []
  let accountIban = ''
  let statementNumber = `CAMT-${new Date().toISOString().slice(0, 10)}`
  let openingBalance = 0
  let closingBalance = 0

  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')

    const ibanText = getXmlText(findXmlNode(xmlDoc, 'Acct'), 'IBAN') || getXmlText(xmlDoc, 'IBAN')
    if (ibanText) accountIban = ibanText

    const idText = getXmlText(findXmlNode(xmlDoc, 'Stmt'), 'Id') || getXmlText(xmlDoc, 'Id')
    if (idText) statementNumber = idText

    // Balances
    const balNodes = findXmlNodes(xmlDoc, 'Bal')
    balNodes.forEach((bal) => {
      const cd = getXmlText(bal, 'Cd')
      const amt = parseFloat(getXmlText(bal, 'Amt') || '0')
      const cdtDbt = getXmlText(bal, 'CdtDbtInd')
      const signedAmt = cdtDbt === 'DBIT' ? -amt : amt
      if (cd === 'OPBD' || cd === 'PRCD') {
        openingBalance = signedAmt
      } else if (cd === 'CLBD' || cd === 'FWAV') {
        closingBalance = signedAmt
      }
    })

    const entryNodes = findXmlNodes(xmlDoc, 'Ntry')
    entryNodes.forEach((entry, idx) => {
      const amtNode = findXmlNode(entry, 'Amt')
      const cdtDbtNode = findXmlNode(entry, 'CdtDbtInd')
      const isCredit = cdtDbtNode?.textContent?.trim() === 'CRDT'
      const rawAmt = parseFloat(amtNode?.textContent?.trim() || '0')
      const amount = isCredit ? rawAmt : -rawAmt

      const bookgDt = findXmlNode(entry, 'BookgDt')
      const valDt = findXmlNode(entry, 'ValDt')
      const date = getXmlText(bookgDt || valDt || entry, 'Dt') || new Date().toISOString().split('T')[0]

      const rltdPties = findXmlNode(entry, 'RltdPties')
      const dbtr = findXmlNode(rltdPties || entry, 'Dbtr')
      const cdtr = findXmlNode(rltdPties || entry, 'Cdtr')
      const counterpartyName = getXmlText(dbtr || cdtr, 'Nm') || 'Counterparty'

      const dbtrAcct = findXmlNode(rltdPties || entry, 'DbtrAcct')
      const cdtrAcct = findXmlNode(rltdPties || entry, 'CdtrAcct')
      const counterpartyIban = getXmlText(dbtrAcct || cdtrAcct, 'IBAN') || ''

      const rmtInf = findXmlNode(entry, 'RmtInf')
      const ustrd = getXmlText(rmtInf, 'Ustrd')
      const strd = getXmlText(rmtInf, 'Ref')
      const description = ustrd || strd || 'Bank Transfer'
      const structuredReference = strd ? extractStructuredReference(strd) : extractStructuredReference(description)

      transactions.push({
        id: `tx-camt-${Date.now()}-${idx}`,
        date,
        amount,
        currency: amtNode?.getAttribute('Ccy') || 'EUR',
        counterpartyName,
        counterpartyIban,
        description,
        structuredReference,
        reconciled: false,
      })
    })
  } catch (err) {
    console.error('Error parsing CAMT.053 XML:', err)
  }

  const statement: BankStatement = {
    id: `stmt-${Date.now()}`,
    statementNumber,
    accountIban: accountIban || 'Main Operating Account',
    accountName: 'Imported CAMT.053 Account',
    fileName,
    importDate: new Date().toISOString(),
    format: 'camt053',
    openingBalance,
    closingBalance: closingBalance || (openingBalance + transactions.reduce((acc, t) => acc + t.amount, 0)),
    currency: 'EUR',
    transactionCount: transactions.length,
    reconciledCount: 0,
  }

  return { statement, transactions }
}

/**
 * Parse CSV Bank Statement
 */
export function parseCsvBankFile(csvContent: string, fileName: string): { statement: BankStatement; transactions: BankTransaction[] } {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0)
  const transactions: BankTransaction[] = []

  const startIdx = lines[0].toLowerCase().includes('date') || lines[0].toLowerCase().includes('datum') ? 1 : 0

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(/[;,]/).map((c) => c.trim().replace(/^"|"$/g, ''))
    if (cols.length >= 3) {
      const date = cols[0] || new Date().toISOString().split('T')[0]
      const name = cols[1] || 'Bank Transaction'
      const amountStr = cols[2].replace('EUR', '').replace('€', '').replace(',', '.').trim()
      const amount = parseFloat(amountStr) || 0
      const iban = cols[3] || ''
      const description = cols[4] || cols[1] || ''
      const structuredReference = extractStructuredReference(description) || extractStructuredReference(lines[i])

      transactions.push({
        id: `tx-csv-${Date.now()}-${i}`,
        date,
        amount,
        currency: 'EUR',
        counterpartyName: name,
        counterpartyIban: iban,
        description,
        structuredReference,
        reconciled: false,
      })
    }
  }

  const statement: BankStatement = {
    id: `stmt-${Date.now()}`,
    statementNumber: `CSV-${new Date().toISOString().slice(0, 10)}`,
    accountIban: 'Imported CSV Account',
    accountName: 'Imported CSV Account',
    fileName,
    importDate: new Date().toISOString(),
    format: 'csv',
    openingBalance: 0,
    closingBalance: transactions.reduce((acc, t) => acc + t.amount, 0),
    currency: 'EUR',
    transactionCount: transactions.length,
    reconciledCount: 0,
  }

  return { statement, transactions }
}
