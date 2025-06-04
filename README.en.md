# 🎮 noob.gg

<p align="center">
  <img src="docs/noobgg-logo.png" alt="noob.gg logo" height="120" />
  <br/>
  <em>Modern Gaming Platform</em>
</p>

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.0.0-000000?style=flat&logo=bun)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=next.js)](https://nextjs.org)
[![Hono](https://img.shields.io/badge/Hono.js-3.0-000000?style=flat&logo=hono)](https://hono.dev)

</div>

## 📝 Overview

This project consists of a Hono.js backend API and a Next.js 15 frontend application. Follow the instructions below to set up the development environment and start working on the project.

> **Note:** The primary documentation for this project is in Turkish and can be found in [README.tr.md](./README.tr.md). This document provides an English overview.

## 🚀 Getting Started

This project is a monorepo managed using [Turborepo](https://turbo.build/repo). The package manager is [Bun](https://bun.sh/).

### 📋 Prerequisites

* Node.js (see the `engines` section in the main `package.json` for the recommended version)
* Bun ([Installation Guide](https://bun.sh/docs/installation))

### 💻 Installation

1. Clone the project repository:
   ```bash
   git clone https://github.com/altudev/noobgg.git
   cd noob.gg
   ```

2. Install the dependencies:
   ```bash
   bun install
   ```

### 🏃‍♂️ Starting the Development Servers

To start both the backend and frontend development servers simultaneously, run:

```bash
turbo dev
```

This command will:
* Start the backend API on `http://localhost:3000`
* Start the frontend Next.js application on `http://localhost:3001`

## 📁 Project Structure

```
noob.gg/
├── apps/                    # Application code
│   ├── api/                # Hono.js backend API
│   └── web/                # Next.js frontend application
├── packages/               # Shared packages and libraries
│   ├── ui/                # UI components
│   ├── tsconfig/          # TypeScript configurations
│   └── eslint-config/     # ESLint rules
├── package.json           # Main project dependencies
└── turbo.json            # Turborepo configuration
```

## 🛠️ Technologies Used

### 🔙 Backend (API)

| Technology | Description |
|------------|-------------|
| [Hono.js](https://hono.dev/) | A fast and lightweight web framework |
| [Drizzle ORM](https://orm.drizzle.team/) | A modern TypeScript-based SQL query builder |
| PostgreSQL 16 | Database (integrated with Drizzle ORM) |
| AWS SDK | For S3 interactions |
| dotenv | Environment variables management |

### 🔜 Frontend (Web)

| Technology | Description |
|------------|-------------|
| [Next.js 15](https://nextjs.org/) | React framework with SSR/SSG capabilities |
| [React](https://react.dev/) | UI Library |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |

### 🛠️ Development Tools

| Tool | Purpose |
|------|---------|
| [Turborepo](https://turbo.build/repo) | Monorepo management |
| [Bun](https://bun.sh/) | Package manager |
| TypeScript | Static typing |
| ESLint | Code quality and consistency |

## 🤝 Contributing

Contributions are welcome! Please review the contributing guidelines (if available) or support the project by:
* Opening an issue
* Submitting a pull request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## 👥 Contributors

A big thank you to all our friends who participated in our streams and supported us during the development process! 🙏

<div align="center">

<a href="https://github.com/altudev"><img width="60px" alt="altudev" src="https://github.com/altudev.png" title="altudev"/></a>
<a href="https://github.com/furkanczay"><img width="60px" alt="Furkan Özay" src="https://github.com/furkanczay.png" title="Furkan Özay"/></a>
<a href="https://github.com/HikmetMelikk"><img width="60px" alt="Hikmet Melik" src="https://github.com/HikmetMelikk.png" title="Hikmet Melik"/></a>
<a href="https://github.com/gurgenufuk12"><img width="60px" alt="Ufuk Gürgen" src="https://github.com/gurgenufuk12.png" title="Ufuk Gürgen"/></a>
<a href="https://github.com/apps/google-labs-jules"><img width="60px" alt="Jules (Google Labs AI)" src="https://avatars.githubusercontent.com/in/842251?s=41&u=e6ce41f2678ba45349e003a9b1d8719b7f414a6f&v=4" title="Jules (Google Labs AI)"/></a>
<a href="https://github.com/apps/devin-ai-integration"><img width="60px" alt="DevinAI Integration" src="https://avatars.githubusercontent.com/in/811515?s=41&u=22ae8177548c8cd6cccb497ac571937d080c80bc&v=4" title="DevinAI Integration"/></a>

</div>

---
<div align="center">
Made with ❤️ by the noob.gg team
</div>
