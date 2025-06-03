# noob.gg
<p align="center">
  <img src="docs/noobgg-logo.png" alt="noob.gg logo" height="120" />
</p>

This project consists of a Hono.js backend API and a Next.js 15 frontend application. Follow the instructions below to set up the development environment and start working on the project.

**Note:** The primary documentation for this project is in Turkish and can be found in [README.tr.md](./README.tr.md). This document provides an English overview.

## Getting Started

This project is a monorepo managed using [Turborepo](https://turbo.build/repo). The package manager is [Bun](https://bun.sh/).

**Prerequisites:**

*   Node.js (see the `engines` section in the main `package.json` for the recommended version)
*   Bun ([Installation Guide](https://bun.sh/docs/installation))

**Installation:**

1.  Clone the project repository:
    ```bash
    git clone https://github.com/altudev/noob.gg.git
    cd noob.gg
    ```
2.  Install the dependencies:
    ```bash
    bun install
    ```

**Starting the Development Servers:**

To start both the backend and frontend development servers simultaneously, run:

```bash
turbo dev
```

This command will:
*   Start the backend API on `http://localhost:3000`.
*   Start the frontend Next.js application on `http://localhost:3001`.

## Project Structure

The project has the following folder structure:

*   `apps/`: Contains the application code.
    *   `api/`: Hono.js based backend API.
    *   `web/`: Next.js based frontend application.
*   `packages/`: Contains shared packages and libraries (e.g., UI components, shared TypeScript configurations, ESLint rules, etc.).
*   `package.json`: Defines main project dependencies and `turbo` scripts.
*   `turbo.json`: Turborepo configuration file.

## Technologies Used

### Backend (API)

*   **Framework**: [Hono.js](https://hono.dev/) - A fast and lightweight web framework.
*   **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - A modern TypeScript-based SQL query builder.
*   **Database**: PostgreSQL 16 (integrated with Drizzle ORM).
*   **Other Libraries**:
    *   `@aws-sdk/client-s3`: For interacting with AWS S3 (if used).
    *   `dotenv`: For managing environment variables.

### Frontend (Web)

*   **Framework**: [Next.js 15](https://nextjs.org/) - A React-based framework with server-side rendering (SSR) and static site generation (SSG) capabilities.
*   **UI Library**: [React](https://react.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (likely configured in `apps/web/tailwind.config.js` or a similar file).

### Development Tools

*   **Monorepo Management**: [Turborepo](https://turbo.build/repo)
*   **Package Manager**: [Bun](https://bun.sh/)
*   **TypeScript**: For static typing.
*   **ESLint**: For maintaining code quality and consistency.

## Contributing

Contributions are welcome! Please review the contributing guidelines (if available) or support the project by opening an issue or submitting a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Contributors

A big thank you to all our friends who participated in our streams and supported us during the development process! 🙏

<a href="https://github.com/altudev"><img width="60px" alt="altudev" src="https://github.com/altudev.png"/></a>
<a href="https://github.com/furkanczay"><img width="60px" alt="Furkan Özay" src="https://github.com/furkanczay.png"/></a>
<a href="https://github.com/apps/google-labs-jules"><img width="60px" alt="Jules (Google Labs AI)" src="https://avatars.githubusercontent.com/in/842251?s=41&u=e6ce41f2678ba45349e003a9b1d8719b7f414a6f&v=4"/></a>
<a href="https://github.com/apps/devin-ai-integration"><img width="60px" alt="DevinAI Integration" src="https://avatars.githubusercontent.com/in/811515?s=41&u=22ae8177548c8cd6cccb497ac571937d080c80bc&v=4"/></a>
