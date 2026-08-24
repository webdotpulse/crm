import { SupportedCurrency, ExchangeRate } from '../types'

export const defaultExchangeRates: Record<SupportedCurrency, ExchangeRate> = {
  EUR: {
    currency: 'EUR',
    symbol: '€',
    rateToEur: 1.0,
    lastUpdated: '2026-08-25T00:00:00Z',
  },
  USD: {
    currency: 'USD',
    symbol: '$',
    rateToEur: 1.092, // 1 EUR = 1.092 USD
    lastUpdated: '2026-08-25T00:00:00Z',
  },
  GBP: {
    currency: 'GBP',
    symbol: '£',
    rateToEur: 0.854, // 1 EUR = 0.854 GBP
    lastUpdated: '2026-08-25T00:00:00Z',
  },
  CHF: {
    currency: 'CHF',
    symbol: 'CHF',
    rateToEur: 0.958, // 1 EUR = 0.958 CHF
    lastUpdated: '2026-08-25T00:00:00Z',
  },
}

export function formatCurrency(
  amount: number,
  currency: string = 'EUR',
  locale: string = 'nl-BE'
): string {
  const symbol =
    currency === 'EUR' || currency === '€'
      ? '€'
      : currency === 'USD' || currency === '$'
      ? '$'
      : currency === 'GBP' || currency === '£'
      ? '£'
      : currency === 'CHF'
      ? 'CHF '
      : `${currency} `

  const formatted = Math.abs(amount).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const sign = amount < 0 ? '-' : ''
  if (symbol === '$' || symbol === '£') {
    return `${sign}${symbol}${formatted}`
  }
  return `${sign}${symbol} ${formatted}`
}

export function convertAmount(
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency,
  customRates?: Record<SupportedCurrency, ExchangeRate>
): number {
  if (fromCurrency === toCurrency) return amount
  const rates = customRates || defaultExchangeRates
  const fromRate = rates[fromCurrency]?.rateToEur || 1
  const toRate = rates[toCurrency]?.rateToEur || 1

  // Amount in EUR
  const eurAmount = fromCurrency === 'EUR' ? amount : amount / fromRate
  // Amount in target currency
  const targetAmount = toCurrency === 'EUR' ? eurAmount : eurAmount * toRate
  return Math.round(targetAmount * 100) / 100
}
