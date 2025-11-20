# Comprehensive Color Sets

A feature-rich, interactive viewer for common developer and designer color palettes, built with Svelte 5 and Vite.

**Go to [Comprehensive Color Sets](https://dcog989.github.io/CSS-Named-Colors/)**.

![Comprehensive Color Sets Screenshot](images/screen-1.webp)

## Features

- **Extensive Color Palettes:**
  - **W3C CSS Named Colors**
  - **Material Design (500)**
  - **Tailwind CSS Default (500)**
  - **Solarized**
  - **Windows Terminal / PowerShell**
  - **Tableau 20**
  - **Resistor Color Code**
  - **xterm-256**
- **Global Search:** Instantly filter all color sets by name or hex code.
- **Smart Sorting:** Order colors by Name, Hue, or Luminosity.
- **Interactive UI:**
  - **Click to Copy:** Copy color names or hex codes instantly.
  - **Toast Notifications:** visual feedback for actions.
  - **Theming:** Switch between Light, Dark, or System-preferred modes.
- **Bulk Actions:**
  - Copy all color names from a set.
  - Copy a set as a CSS Variable theme block.
- **Accessibility & Performance:**
  - WCAG AA compliant contrast ratios for text.
  - Full keyboard navigation support.
  - Optimized rendering for large lists using CSS `content-visibility`.
  - Lighthouse 100 for all categories.

## Tech Stack

- **Framework:** Svelte 5 (using Runes for fine-grained reactivity).
- **Build Tool:** Vite.
- **Language:** TypeScript.
- **Styling:** Native CSS Variables / Custom Properties.
- **Color Logic:** GoatColor library (Hex, HSL, OKLCH, Luminance).

## Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview the build:**
   ```bash
   npm run preview
   ```

## Project Structure

- `src/App.svelte`: Main application entry and global state (search, theme).
- `src/lib/ColorSet.svelte`: Component for rendering individual palettes with filtering logic.
- `src/lib/ColorItem.svelte`: Individual color swatch component with interaction logic.
- `src/lib/data/colorSets.ts`: Definitions for all color palettes.
- `src/lib/utils/GoatColor.ts`: Color parsing and conversion utility.
- `src/app.css`: Global styles and CSS variables.

## License

MIT License