# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep the UI in React components that render only the API-provided data, using the shared client and accessible loading/empty/error states rather than inline fetch logic.
- Logic tier decision: Implement the Express routes and TypeScript services around the documented `/api/*` contract, validating inputs before database writes and returning deliberate 4xx status codes instead of uncaught cast errors.
- Data tier decision: Define Mongoose schemas with required fields, array defaults, typed relationships, and idempotent seed logic so data integrity is enforced before API logic depends on it.
- Activity tracking approach: Accept `userId`, `teamId`, `type`, and `minutes`, verify both references exist, then persist `user`, `team`, `type`, `minutes`, computed `points`, and `occurredAt` in a single valid document.
- Team management approach: Require a team name and preserve `mascot` plus members array semantics; allow existing users to be attached as valid members without leaking invalid IDs into the model.
- Leaderboard approach: Aggregate activity points by team, sort descending by total points, and assign a 1-based rank based on the ordered list so each team entry has `teamName`, `totalPoints`, and `rank`.
- Workout suggestions approach: Match the current user by email, inspect recent activity patterns or fitness goals, then return the most relevant workout suggestions with a rationale string explaining the match.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — validates schema requirements and idempotent seed behavior; failures here mean the persistence layer is not enforcing the contract before API logic runs.
- API command: `npm run test:api --prefix octofit-tracker/backend` — validates the `/api` behavior and responses; failures here indicate the route logic, validation, aggregation, or recommendation logic is still incomplete.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — validates rendering, loading/empty/error states, and accessibility requirements; failures here show the presentation layer is not consuming the shared client contract correctly.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — catches TypeScript or runtime compatibility problems in the Express service and model layer before final validation.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — confirms the Vite/React UI compiles successfully with the API client and route-based components.
