# ✨ SparkleTrack

A lightweight, local-first issue tracker built for hobby developers who just want to keep track of their personal projects without spinning up a cloud service, handing over their data, or paying a monthly subscription.

All your data lives in a SQLite file on your machine. No accounts. No internet required. Just you and your issues.

---

## 🌸 What is this?

SparkleTrack is a kanban-style project tracker with a girly pop inspired design. It was built as a personal side project to scratch the itch of wanting a Linear/Jira-style tool that was actually mine — no workspace limits, no teammates I don't have, no pricing tiers.

It's got projects, issues, labels, comments, a rich text editor, a kanban board with drag-and-drop, an activity feed, a dashboard, and a command palette. It's also packaged as an Electron desktop app so you can install it like a normal application.

If you're a developer who keeps a list of side project todos in a notes app and wishes you had something a little more structured — this is for you.

---

## 📸 Features

- **Projects** — create as many as you want, each with a prefix, color, and emoji icon
- **Issues** — full CRUD with title, description (rich text), type, priority, status, and labels
- **Kanban board** — drag and drop issues between status columns, reorder within columns
- **List view** — sortable table view with filters for status, type, and priority
- **Labels** — create custom labels per project with color coding
- **Comments & activity feed** — leave comments on issues, track status changes over time
- **Rich text editor** — Tiptap-powered description editor with bold, italic, lists, and code blocks
- **Dashboard** — stat cards, project health bars, and a global activity feed
- **Command palette** — `Cmd+K` to search across all issues and projects
- **Keyboard shortcuts** — `N` for new issue, `?` for shortcuts help
- **Data export** — one-click JSON export of everything for backup
- **Local SQLite storage** — your data never leaves your machine

---

## 🛠️ Tech Stack

This was built as a monorepo with a clear separation between frontend and backend.

**Frontend**
- Vue 3 (Composition API + `<script setup>`)
- Vite
- Pinia for state management
- Vue Router
- SCSS with a custom design token system
- Tiptap for rich text editing
- Vue Draggable (SortableJS) for the kanban board

**Backend**
- Node.js + Express
- Drizzle ORM
- SQLite via better-sqlite3
- Zod for request validation

**Desktop**
- Electron for packaging as a native desktop app
- electron-builder for generating installers

---

## 💾 Installation

### Download the app

Head to the [Releases](../../releases) page and grab the installer for your platform:

| Platform | File |
|----------|------|
| Windows  | `SparkleTrack-Setup-x.x.x.exe` |
| Mac      | `SparkleTrack-x.x.x.dmg` |
| Linux    | `SparkleTrack-x.x.x.AppImage` |

> **Note for Windows users:** You may see a SmartScreen warning on first launch since the app isn't code-signed. Click "More info" → "Run anyway" to proceed. This is normal for indie apps distributed outside the Microsoft Store.

> **Note for Mac users:** You may need to right-click → Open the first time due to Gatekeeper.

### Your data lives here

SparkleTrack stores everything in a local SQLite database:

- **Windows:** `%APPDATA%\SparkleTrack\sparkletrack.db`
- **Mac:** `~/Library/Application Support/SparkleTrack/sparkletrack.db`
- **Linux:** `~/.config/SparkleTrack/sparkletrack.db`

You can back this file up, copy it between machines, or open it with any SQLite viewer.

---

## 🧑‍💻 Running from Source

Want to poke around the code or contribute? Here's how to get it running locally.

**Prerequisites**
- Node.js 18+
- npm 9+

```bash
# Clone the repo
git clone https://github.com/yourusername/sparkletrack
cd sparkletrack

# Install all dependencies
npm install

# Run database migrations
cd packages/backend
npm run db:migrate
cd ../..

# Start the dev server (frontend + backend)
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:3001`.

**To run in Electron dev mode:**

```bash
npm run dev:electron
```

**To build the desktop app:**

```bash
npm run build:electron
```

Installers will be output to `dist-electron/`.

---

## 🗂️ Project Structure

```
sparkletrack/
├── electron/               # Electron main process + preload
│   ├── main.js
│   ├── preload.js
│   └── icons/
├── packages/
│   ├── backend/            # Express API + Drizzle + SQLite
│   │   ├── src/
│   │   │   ├── db/         # Schema, migrations, client
│   │   │   └── routes/     # API route handlers
│   │   └── server.js
│   └── frontend/           # Vue 3 app
│       ├── src/
│       │   ├── components/ # Reusable UI components
│       │   ├── views/      # Page-level components
│       │   ├── stores/     # Pinia stores
│       │   ├── composables/
│       │   ├── api/        # Axios instance
│       │   └── styles/     # SCSS tokens + global styles
│       └── index.html
└── package.json            # Monorepo root
```

---

## 🤝 Contributing

SparkleTrack is open source and contributions are very welcome! Whether it's a bug fix, a feature idea, or just a typo in the docs — please open an issue or a PR.

**Found a bug?** [Open a bug report](../../issues/new)

**Have a feature idea?** [Start a discussion](../../issues/new)

**Want to contribute code?**

1. Fork the repo
2. Create a branch (`git checkout -b feature/my-cool-thing`)
3. Make your changes
4. Open a pull request with a description of what you changed and why

There are no strict contribution guidelines — just be kind and write code you'd be happy for someone else to read. 🌸

---

## 📋 Roadmap

Some things that would be nice to add someday:

- [ ] Due dates on issues
- [ ] Multiple assignees / team mode (optional, local only)
- [ ] Issue templates
- [ ] Markdown import/export per issue
- [ ] Themes (dark mode 👀)
- [ ] Mobile-friendly layout
- [ ] More robust selection for project icons

If any of these appeal to you, feel free to take a stab at it!

---

## 📄 License

MIT — do whatever you want with it. If you build something cool on top of it, I'd love to hear about it.

---

* Built with love and much cuteness in mind *