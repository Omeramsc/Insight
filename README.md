# Photoshop Gemini Plugin

A Photoshop UXP plugin that integrates with Google's Gemini API to provide professional photography critiques and editing advice.

## Features

- **Scan & Critique**: Analyzes the currently open image in Photoshop.
- **Interactive Chat**: Ask follow-up questions about the critique.
- **Model Selection**: Choose between different Gemini models (Flash, Pro, etc.).
- **Mock Mode**: Test the UI without making API calls.

## Project Structure

- `src/`: Source code
  - `main.js`: Entry point and main logic.
  - `services/`: API and Imaging services.
  - `ui/`: UI helper functions.
  - `utils/`: General utilities (e.g., Markdown parsing).
- `index.html`: Main plugin UI.
- `styles.css`: Stylesheet.

## Installation

1.  Ensure you have the **Adobe UXP Developer Tool** installed.
2.  Clone this repository.
3.  Run `npm install` to install development dependencies (ESLint, Prettier).
4.  Add the plugin to the UXP Developer Tool pointing to the `manifest.json` file.

## Development

- **Linting**: Run `npx eslint .` to check for code quality issues.
- **Formatting**: Run `npx prettier --write .` to format code.

## Troubleshooting

### "File ... npm.ps1 cannot be loaded"
If you see a PowerShell error about execution policies when running `npm`:
1.  Run the command using `cmd`: `cmd /c npm test`
2.  Or change your execution policy (allows local scripts):
    ```powershell
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
    ```

## Requirements

- Adobe Photoshop 2024 (v25.0) or later.
- An active Google Gemini API Key.
