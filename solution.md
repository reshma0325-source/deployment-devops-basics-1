# Solution: Git & GitHub Integration with Node.js Project

## Objective

Push a full Node.js app to GitHub using best practices: a working API, a repository that excludes secrets and bulky generated files, and a documented commit/push/branch workflow.

## What was built

| File                | Purpose                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `app.js`            | Zero-dependency HTTP server built on `node:http` and `node:url`. Routes requests, parses JSON bodies, sends JSON responses with correct status codes, and shuts down gracefully on SIGINT/SIGTERM. |
| `routes/products.js` | Product module: seed data (6 items) plus the `list`, `getById`, `validate`, and `create` helpers that `app.js` uses. Makes the `routes/` folder from the case-study tree real and functional. |
| `package.json`      | Manifest for `my-api-app` v1.0.0, `private: true`, `main: app.js`, `engines.node >= 20.0.0`, scripts `start` and `dev` (`node --watch app.js`). No `dependencies` field at all. |
| `.env`              | Local runtime config (`PORT=3000`, `NODE_ENV=development`). Gitignored.                                        |
| `.env.example`      | Committed template documenting every environment key with short comments.                                     |
| `.gitignore`        | Excludes `node_modules/`, `.env`, and `logs/`.                                                                 |
| `README.md`         | Project overview, endpoint table, run instructions, Git workflow, structure, and the `.env` rationale.         |
| `solution.md`       | This write-up.                                                                                                |

Design notes:

- Only Node.js built-in modules are used, so the project runs immediately with `node app.js` and never needs `npm install` (which is why no `node_modules/` folder exists here).
- Every response is JSON: `200` for reads, `201` for a created resource, `400` for invalid or malformed input, `404` for unknown products and unknown routes, `500` for unexpected errors.
- Route matching splits the pathname into segments, so `GET /api/products/999` is distinguishable from `GET /api/products`.
- The body reader caps payloads at 1MB and `JSON.parse` failures are converted to a `400 {status:"error", message:"Malformed JSON in request body"}`.

## Git best practices applied

- `.gitignore` keeps `node_modules/` (huge, machine-specific, regenerable), `.env` (secrets and per-machine config), and `logs/` (noisy generated output) out of the repository, exactly as the case study's `echo "node_modules\n.env\nlogs/" > .gitignore` command specifies.
- `.env.example` is committed instead of `.env`, so collaborators know which keys to define without exposing real values.
- Lockfile policy: this project has zero dependencies, so there is intentionally no `package-lock.json`. Once dependencies are added, `package-lock.json` **should** be committed (it pins exact versions for reproducible installs) while `node_modules/` stays ignored. Never commit `npm-shrinkwrap.json` or your local `.npmrc` with tokens.
- `package.json` is `private: true` so the app can never be published to npm by accident.
- Commits are made only after `.gitignore` exists, so the first commit can never contain secrets.

## Step-by-step git commands

The assignment's sequence:

```bash
git init
echo "node_modules\n.env\nlogs/" > .gitignore
git add .
git commit -m "🚀 Initial commit"
git remote add origin https://github.com/username/my-api-app.git
git push -u origin main
```

(On newer Git versions where the default branch is `master`, rename it first with `git branch -M main` before pushing.)

## Practice steps solved

1. **Clone the repo on another system**

   ```bash
   git clone https://github.com/username/my-api-app.git
   cd my-api-app
   ```

   The clone contains everything needed to run (`node app.js`) except `.env`, which each developer recreates locally by copying `.env.example`.

2. **Modify `README.md` and push again**

   ```bash
   # edit README.md
   git add README.md
   git commit -m "Update README"
   git push origin main
   ```

3. **Add a branch**

   ```bash
   git checkout -b dev
   ```

   Work is committed on `dev` and merged back into `main` through a pull request once reviewed.

## How it was verified locally

- `node --check app.js` and `node --check routes/products.js` - both pass with no syntax errors.
- Server started with `PORT=3401` and exercised with `Invoke-WebRequest`:

  | Request                    | Expected | Observed |
  | -------------------------- | -------- | -------- |
  | `GET /health`              | 200      | 200      |
  | `GET /api/products`        | 200 (6 items) | 200  |
  | `GET /api/products/1`      | 200      | 200      |
  | `GET /api/products/999`    | 404      | 404      |
  | `POST /api/products` (empty `name`) | 400 | 400   |
  | `POST /api/products` (valid body)   | 201 | 201   |

- The process was stopped with `Stop-Process`, and it was confirmed that no `node_modules/` folder was created, no `npm install` was run, and no `git` command was executed during the build.
