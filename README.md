# Comprehensive Color Sets

A feature-rich, interactive viewer for common developer and designer color palettes.

**Go to [Comprehensive Color Sets](https://dcog989.github.io/CSS-Named-Colors/)**.

![Comprehensive Color Sets Screenshot](images/screen-1.webp)

## Features

- **Multiple Color Palettes:** Displays several useful color sets including:
  - W3C CSS Named Colors
  - Windows Terminal / PowerShell
  - Tailwind CSS Default Palette
  - Tableau 20
  - Resistor Color Code
  - xterm-256
- **Interactive UI:**
  - Click any color's name or hex value to copy it to the clipboard.
  - Clicking the copy icon or swatch background also copies the hex value.
  - Visual "Copied!" notification appears at the cursor location.
- **Powerful Controls:**
  - Sticky header with global controls that are always visible.
  - Sort all palettes simultaneously by Name, Hue, or Luminosity.
  - Switch between Light, Dark, or System-preferred themes.
- **Bulk Copy Actions:**
  - Copy all color names from a set in one click.
  - Copy all hex values formatted as a CSS theme block with custom properties.

## Tech Stack

- HTML5
- Modern CSS (Grid, Flexbox, Custom Properties)
- JavaScript (ES6+)
  - DOM Manipulation
  - Clipboard API
  - Intersection Observer API
- [GoatColorToolbox.js](js/GoatColorToolbox.js) (included color utility library)

## Project Structure

- `index.html`: The main webpage structure.
- `css/main.css`: All custom styles for the application.
- `js/main.js`: Core application logic, color set definitions, and event handling.
- `js/GoatColorToolbox.js`: The powerful color utility library.
- `images/`: Contains SVG icons and screenshots.
- `package.json`: Project manifest with scripts and metadata.
- `LICENSE`: MIT License file.
