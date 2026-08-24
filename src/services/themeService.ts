import { CustomThemeConfig, ThemePresetId } from '../types'

export interface ThemePreset {
  id: ThemePresetId
  name: string
  description: string
  previewColors: {
    primary: string
    secondary: string
    sidebar: string
    navbar: string
    bg: string
  }
  config: CustomThemeConfig
}

export const defaultThemeConfig: CustomThemeConfig = {
  preset: 'standard-white',
  primaryColor: '#3f78e0',
  primaryHoverColor: '#3164c0',
  primarySoftColor: '#eef3fc',
  secondaryColor: '#605dba',
  sidebarBgMode: 'white',
  navbarBgMode: 'white',
  borderRadius: 'modern',
  fontFamily: 'Urbanist',
  density: 'comfortable',
  customCss: '',
  customBrandName: 'PulseWork',
}

export const themePresets: ThemePreset[] = [
  {
    id: 'standard-white',
    name: 'Standard Crisp White',
    description: 'Clean enterprise look with pure white navigation and vibrant modern blue.',
    previewColors: {
      primary: '#3f78e0',
      secondary: '#605dba',
      sidebar: '#ffffff',
      navbar: '#ffffff',
      bg: '#f8fafc',
    },
    config: {
      preset: 'standard-white',
      primaryColor: '#3f78e0',
      primaryHoverColor: '#3164c0',
      primarySoftColor: '#eef3fc',
      secondaryColor: '#605dba',
      sidebarBgMode: 'white',
      navbarBgMode: 'white',
      borderRadius: 'modern',
      fontFamily: 'Urbanist',
      density: 'comfortable',
    },
  },
  {
    id: 'elemis-blue',
    name: 'Elemis Indigo & Slate',
    description: 'Deep royal indigo with refined slate borders and high contrast.',
    previewColors: {
      primary: '#4f46e5',
      secondary: '#7c3aed',
      sidebar: '#ffffff',
      navbar: '#ffffff',
      bg: '#f8fafc',
    },
    config: {
      preset: 'elemis-blue',
      primaryColor: '#4f46e5',
      primaryHoverColor: '#4338ca',
      primarySoftColor: '#eef2ff',
      secondaryColor: '#7c3aed',
      sidebarBgMode: 'white',
      navbarBgMode: 'white',
      borderRadius: 'modern',
      fontFamily: 'Plus Jakarta Sans',
      density: 'comfortable',
    },
  },
  {
    id: 'emerald-growth',
    name: 'Emerald Growth',
    description: 'Fresh botanical green tailored for high-growth SaaS and finance teams.',
    previewColors: {
      primary: '#10b981',
      secondary: '#059669',
      sidebar: '#ffffff',
      navbar: '#ffffff',
      bg: '#f8fafc',
    },
    config: {
      preset: 'emerald-growth',
      primaryColor: '#10b981',
      primaryHoverColor: '#059669',
      primarySoftColor: '#ecfdf5',
      secondaryColor: '#3b82f6',
      sidebarBgMode: 'white',
      navbarBgMode: 'white',
      borderRadius: 'modern',
      fontFamily: 'Inter',
      density: 'comfortable',
    },
  },
  {
    id: 'royal-violet',
    name: 'Royal Violet',
    description: 'Luxurious violet tones with modern typography and sleek accents.',
    previewColors: {
      primary: '#7c3aed',
      secondary: '#9333ea',
      sidebar: '#ffffff',
      navbar: '#ffffff',
      bg: '#faf5ff',
    },
    config: {
      preset: 'royal-violet',
      primaryColor: '#7c3aed',
      primaryHoverColor: '#6d28d9',
      primarySoftColor: '#f5f3ff',
      secondaryColor: '#ec4899',
      sidebarBgMode: 'white',
      navbarBgMode: 'white',
      borderRadius: 'rounded',
      fontFamily: 'Outfit',
      density: 'comfortable',
    },
  },
  {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    description: 'Nordic cyan and deep teal with calm, focused executive aesthetics.',
    previewColors: {
      primary: '#0891b2',
      secondary: '#0e7490',
      sidebar: '#ffffff',
      navbar: '#ffffff',
      bg: '#f0fdfa',
    },
    config: {
      preset: 'ocean-teal',
      primaryColor: '#0891b2',
      primaryHoverColor: '#0e7490',
      primarySoftColor: '#ecfeff',
      secondaryColor: '#2563eb',
      sidebarBgMode: 'white',
      navbarBgMode: 'white',
      borderRadius: 'modern',
      fontFamily: 'Manrope',
      density: 'comfortable',
    },
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber & Bronze',
    description: 'Warm gold and amber accents designed for creative and marketing agencies.',
    previewColors: {
      primary: '#d97706',
      secondary: '#b45309',
      sidebar: '#ffffff',
      navbar: '#ffffff',
      bg: '#fffbeb',
    },
    config: {
      preset: 'sunset-amber',
      primaryColor: '#d97706',
      primaryHoverColor: '#b45309',
      primarySoftColor: '#fef3c7',
      secondaryColor: '#ef4444',
      sidebarBgMode: 'white',
      navbarBgMode: 'white',
      borderRadius: 'modern',
      fontFamily: 'Space Grotesk',
      density: 'comfortable',
    },
  },
  {
    id: 'crimson-rose',
    name: 'Crimson Rose',
    description: 'Vibrant ruby red and rose gradients for bold leadership.',
    previewColors: {
      primary: '#e11d48',
      secondary: '#be123c',
      sidebar: '#ffffff',
      navbar: '#ffffff',
      bg: '#fff1f2',
    },
    config: {
      preset: 'crimson-rose',
      primaryColor: '#e11d48',
      primaryHoverColor: '#be123c',
      primarySoftColor: '#ffe4e6',
      secondaryColor: '#8b5cf6',
      sidebarBgMode: 'white',
      navbarBgMode: 'white',
      borderRadius: 'modern',
      fontFamily: 'Urbanist',
      density: 'comfortable',
    },
  },
  {
    id: 'minimal-slate',
    name: 'Dark Contrast Navigation',
    description: 'Crisp dark slate sidebar paired with a clean white topbar and workspace.',
    previewColors: {
      primary: '#3f78e0',
      secondary: '#605dba',
      sidebar: '#0f172a',
      navbar: '#ffffff',
      bg: '#f8fafc',
    },
    config: {
      preset: 'minimal-slate',
      primaryColor: '#3f78e0',
      primaryHoverColor: '#3164c0',
      primarySoftColor: '#eef3fc',
      secondaryColor: '#605dba',
      sidebarBgMode: 'dark',
      navbarBgMode: 'white',
      borderRadius: 'subtle',
      fontFamily: 'Inter',
      density: 'comfortable',
    },
  },
  {
    id: 'midnight-obsidian',
    name: 'Midnight Obsidian',
    description: 'Deep space dark mode theme with neon blue highlights and glass textures.',
    previewColors: {
      primary: '#38bdf8',
      secondary: '#818cf8',
      sidebar: '#0b1120',
      navbar: '#0b1120',
      bg: '#030712',
    },
    config: {
      preset: 'midnight-obsidian',
      primaryColor: '#38bdf8',
      primaryHoverColor: '#0ea5e9',
      primarySoftColor: 'rgba(56, 189, 248, 0.18)',
      secondaryColor: '#818cf8',
      sidebarBgMode: 'dark',
      navbarBgMode: 'dark',
      borderRadius: 'modern',
      fontFamily: 'Plus Jakarta Sans',
      density: 'comfortable',
    },
  },
]

// Convert HEX color to soft rgba
export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16)
    const g = parseInt(cleanHex[1] + cleanHex[1], 16)
    const b = parseInt(cleanHex[2] + cleanHex[2], 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return hex
}

// Adjust Hex Brightness (for hover colors)
export function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = ((num >> 8) & 0x00ff) + amt
  const B = (num & 0x0000ff) + amt
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  )
}

// Apply theme to document root
export function applyThemeConfig(config: CustomThemeConfig, isDarkMode: boolean) {
  const root = document.documentElement

  // 1. Primary Colors
  if (config.primaryColor) {
    root.style.setProperty('--sb-primary', config.primaryColor)
    const hoverColor = config.primaryHoverColor || adjustColorBrightness(config.primaryColor, -12)
    root.style.setProperty('--sb-primary-hover', hoverColor)
    root.style.setProperty(
      '--sb-primary-soft',
      config.primarySoftColor || hexToRgba(config.primaryColor, isDarkMode ? 0.2 : 0.1)
    )
    root.style.setProperty('--sb-primary-text', config.primaryColor)
  }

  // 2. Secondary Color
  if (config.secondaryColor) {
    root.style.setProperty('--sb-secondary', config.secondaryColor)
    root.style.setProperty(
      '--sb-secondary-soft',
      hexToRgba(config.secondaryColor, isDarkMode ? 0.2 : 0.1)
    )
  }

  // 3. Navigation Backgrounds
  if (!isDarkMode) {
    if (config.navbarBgMode === 'white') {
      root.style.setProperty('--sb-navbar-bg', '#ffffff')
      root.style.setProperty('--sb-navbar-border', '#e2e8f0')
      root.style.setProperty('--sb-navbar-text', '#1e293b')
    } else if (config.navbarBgMode === 'dark') {
      root.style.setProperty('--sb-navbar-bg', '#0f172a')
      root.style.setProperty('--sb-navbar-border', '#1e293b')
      root.style.setProperty('--sb-navbar-text', '#f8fafc')
    } else if (config.navbarBgMode === 'custom' && config.navbarBgCustom) {
      root.style.setProperty('--sb-navbar-bg', config.navbarBgCustom)
    }

    if (config.sidebarBgMode === 'white') {
      root.style.setProperty('--sb-sidebar-bg', '#ffffff')
      root.style.setProperty('--sb-sidebar-border', '#e2e8f0')
      root.style.setProperty('--sb-sidebar-text', '#334155')
      root.style.setProperty('--sb-sidebar-title-color', '#94a3b8')
      root.style.setProperty('--sb-sidebar-hover-bg', '#f1f5f9')
      root.style.setProperty('--sb-sidebar-active-bg', hexToRgba(config.primaryColor || '#3f78e0', 0.1))
      root.style.setProperty('--sb-sidebar-active-text', config.primaryColor || '#3f78e0')
    } else if (config.sidebarBgMode === 'dark') {
      root.style.setProperty('--sb-sidebar-bg', '#0f172a')
      root.style.setProperty('--sb-sidebar-border', '#1e293b')
      root.style.setProperty('--sb-sidebar-text', '#cbd5e1')
      root.style.setProperty('--sb-sidebar-title-color', '#64748b')
      root.style.setProperty('--sb-sidebar-hover-bg', '#1e293b')
      root.style.setProperty('--sb-sidebar-active-bg', hexToRgba(config.primaryColor || '#3f78e0', 0.25))
      root.style.setProperty('--sb-sidebar-active-text', '#ffffff')
    } else if (config.sidebarBgMode === 'brand') {
      root.style.setProperty('--sb-sidebar-bg', config.primaryColor || '#3f78e0')
      root.style.setProperty('--sb-sidebar-border', 'rgba(255, 255, 255, 0.12)')
      root.style.setProperty('--sb-sidebar-text', 'rgba(255, 255, 255, 0.85)')
      root.style.setProperty('--sb-sidebar-title-color', 'rgba(255, 255, 255, 0.6)')
      root.style.setProperty('--sb-sidebar-hover-bg', 'rgba(255, 255, 255, 0.12)')
      root.style.setProperty('--sb-sidebar-active-bg', 'rgba(255, 255, 255, 0.22)')
      root.style.setProperty('--sb-sidebar-active-text', '#ffffff')
    } else if (config.sidebarBgMode === 'custom' && config.sidebarBgCustom) {
      root.style.setProperty('--sb-sidebar-bg', config.sidebarBgCustom)
    }
  }

  // 4. Data Attributes for Modifiers
  root.setAttribute('data-radius', config.borderRadius || 'modern')
  root.setAttribute('data-font', config.fontFamily || 'Urbanist')
  root.setAttribute('data-density', config.density || 'comfortable')

  // 5. Injected Custom CSS
  let customStyleTag = document.getElementById('pulsework-custom-theme-css') as HTMLStyleElement | null
  if (!customStyleTag) {
    customStyleTag = document.createElement('style')
    customStyleTag.id = 'pulsework-custom-theme-css'
    document.head.appendChild(customStyleTag)
  }
  customStyleTag.textContent = config.customCss || ''
}
