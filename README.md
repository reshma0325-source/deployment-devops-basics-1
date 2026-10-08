# my-api-app

A zero-dependency Node.js HTTP JSON API that manages an in-memory product catalogue. It is built with nothing but Node.js built-in modules (`node:http`, `node:url`), so it starts instantly with `node app.js` and requires no `npm install`. The project exists to demonstrate Git & GitHub integration best practices for a Node.js codebase: a strict `.gitignore`, a committed `.env.example` instead of a real `.env`, and a clean commit/push workflow.

## Endpoints

| Method | Path                | Description                          | Success | Error  |
| ------ | ------------------- | ------------------------------------ | ------- | ------ |
| GET    | `/`                 | API index with the endpoint list     | 200     | -      |
| GET    | `/health`           | Health check with uptime and timestamp | 200   | -      |
| GET    | `/api/products`     | List all products                    | 200     | -      |
| GET    | `/api/products/:id` | Get a single product by its id       | 200     | 404    |
| POST   | `/api/products`     | Create a product (`name`, `price`)   | 201     | 400    |
| any    | any other route     | Unknown route                        | -       | 404    |

Example responses:

```json
{ "status": "ok", "uptime": 12.34, "timestamp": "2026-10-08T10:15:30.000Z" }
```

```json
{ "status": "success", "data": { "id": 1, "name": "Wireless Mouse", "price": 29.99 } }
```

```json
{ "status": "error", "message": "Route not found: DELETE /api/products" }
```

Create a product:

```bash
curl -X POST http://127.0.0.1:3000/api/products \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Desk Lamp\", \"price\": 24.5}"
```

## Run locally

Requires Node.js 20 or newer. No dependencies to install.

```bash
node app.js
```

Start with automatic restart on file changes (uses Node's built-in watcher, no nodemon needed):

```bash
node --watch app.js
```

Load environment variables from `.env` without any package (`--env-file` is built into Node.js 20.6+):

```bash
node --env-file=.env app.js
```

The same commands are available as npm scripts: `npm start` and `npm run dev`.

## Git & GitHub workflow

Initialize the repository and create the ignore file first, so secrets and bulky folders never enter history:

```bash
git init
echo "node_modules\n.env\nlogs/" > .gitignore
git add .
git commit -m "🚀 Initial commit"
git remote add origin https://github.com/username/my-api-app.git
git push -u origin main
```

Practice steps:

```bash
git clone https://github.com/username/my-api-app.git
```

Modify `README.md`, then push the change again:

```bash
git add README.md
git commit -m "Update README"
git push origin main
```

Create and switch to a development branch:

```bash
git checkout -b dev
```

## Project structure

```
my-api-app/
├── app.js
├── package.json
├── routes/
│   └── products.js
├── .env
├── .env.example
├── .gitignore
├── README.md
└── solution.md
```

## Why .env is gitignored

`.env` holds machine-specific configuration such as the port and the runtime environment, and in real projects it also holds secrets like API keys and database passwords. Committing it would leak those values to everyone with repository access and make local settings bleed into other machines. `.env.example` is committed instead: it documents every required key with safe placeholder values so a teammate can copy it to `.env` and run the app immediately.

## Changelog

- Initial release of the `my-api-app` products API with health check, validation and JSON error handling.
