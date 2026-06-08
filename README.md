<div align="center">
  <img src="https://raw.githubusercontent.com/karidasd/MarkChem/main/public/logo.png" alt="MarkChem Logo" width="200"/>
  <h1>MarkChem</h1>
  <p><strong>A Modern, AI-Powered Chemistry Markdown Editor</strong></p>
  <br/>
  <img src="https://raw.githubusercontent.com/karidasd/MarkChem/main/assets/screenshot.png" alt="MarkChem Screenshot" width="800" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);"/>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Tauri](https://img.shields.io/badge/Tauri-V2-orange.svg)](https://tauri.app/)
  [![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
</div>

<hr/>

Writing chemistry notes in standard word processors is a nightmare. General markdown editors lack deep chemistry support out of the box. 

**MarkChem** is a specialized, open-source desktop editor that combines the speed of Markdown with deep integrations for chemical equations, molecular drawing, and AI assistance.

## ✨ Features

- ⚛️ **Native Chemistry Syntax**: Write chemical equations natively using `mhchem` (`\ce{H2O}`).
- 🧬 **Molecular Drawing (JSME)**: Draw 2D molecules via the built-in UI and insert them instantly as SMILES syntax. No external tools needed!
- 📊 **Periodic Table Integration**: Access an interactive periodic table to quickly lookup and insert atomic properties into your notes.
- 🤖 **Chem AI Assistant**: A built-in AI assistant powered by Google Gemini (BYOK). Select a chemical reaction and ask the AI to balance it, explain it, or brainstorm synthesis pathways.
- ⚡ **Lightning Fast**: Built on [Tauri](https://tauri.app/) and Rust. Uses a fraction of the RAM compared to Electron apps like MarkText or Obsidian.
- 📄 **Export to Word/PDF**: Seamlessly export your beautifully rendered chemistry notes to `.docx` or `.pdf` for submission.

## 🚀 Installation

*Note: Pre-compiled installers for Windows (.exe), macOS (.dmg), and Linux (.AppImage) are automatically generated via GitHub Actions.*

Go to the [Releases](https://github.com/karidasd/MarkChem/releases) page and download the installer for your operating system!

## 💻 Development Setup

If you want to build MarkChem from source or contribute to the project:

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- C++ Build Tools (Windows) or Xcode (macOS)

### Running Locally

```bash
# Clone the repository
git clone https://github.com/karidasd/MarkChem.git
cd MarkChem

# Install dependencies (use legacy-peer-deps due to React 19 + JSME compatibility)
npm install --legacy-peer-deps

# Run the development server
npm run tauri dev
```

## 🛠️ Built With
- **Tauri** (Desktop Application Framework)
- **React 19 & Vite** (Frontend UI)
- **Tailwind CSS** (Styling)
- **KaTeX & mhchem** (Math and Chemistry Rendering)
- **JSME** (Molecular Drawer)
- **CodeMirror 6** (Text Editor Engine)

## 🤝 Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License
Distributed under the MIT License. See `LICENSE` for more information.
