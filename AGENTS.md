# Repository instructions

## Deployment

- Vercel project `agent-development-knowledge-map` is the sole canonical production deployment for this repository.
- Deploy `main` to Vercel Production; use Vercel Preview deployments for pull requests and feature branches.
- Keep GitHub Pages disabled. Do not enable or use Pages as a production or fallback deployment target.
- Before reporting a deployment complete, verify that Vercel reports it Ready, the public site is reachable, and the deployed Git SHA matches the intended `main` SHA.
- This is a no-build native ES modules site. Publish the repository root so `index.html`, `styles/`, and `src/` are all available.
