# Comprehensive Color Sets (Svelte 5)

A feature-rich, interactive viewer for common developer and designer color palettes, now built with Svelte 5 and Vite.

**Go to [Comprehensive Color Sets](https://dcog989.github.io/CSS-Named-Colors/)**.

## Features

- **Multiple Color Palettes:**
  - W3C CSS Named Colors
  - Windows Terminal / PowerShell
  - Tailwind CSS Default Palette
  - Tableau 20
  - Resistor Color Code
  - xterm-256
- **Interactive UI:**
  - **Lazy Loading:** Efficiently renders large lists (like xterm-256) using Intersection Observers.
  - **Clipboard Integration:** Click any color's name, hex value, or swatch to copy.
  - **Toast Notifications:** Visual feedback upon successful copying.
- **Global Controls:**
  - Sort by Name, Hue, or Luminosity.
  - Toggle Light, Dark, or System themes.
- **Bulk Actions:**
  - Copy all names in a set.
  - Copy a set as a CSS Variable theme block.

## Tech Stack

- **Framework:** Svelte 5 (Runes)
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Native CSS (Variables/Custom Properties)

## Development

1. Install dependencies:
   ```bash
   npm install