# Royalty Management REST API

A simple Node.js and Express REST API for authors to view book sales, royalty earnings, balances, and create withdrawal requests.

## Tech stack

- Node.js
- Express
- In-memory JavaScript arrays (no database)
- CORS
- Nodemon for development
- Jest and Supertest for tests

## Setup

```bash
npm install
npm run dev
```

The API runs on `http://localhost:3000` by default. Set `PORT` to use another port.

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/authors` | List authors with total earnings and balance |
| GET | `/authors/:id` | Author details, books, earnings, withdrawals and balance |
| GET | `/authors/:id/sales` | Sales for an author's books |
| POST | `/withdrawals` | Create a withdrawal request |
| GET | `/authors/:id/withdrawals` | Withdrawal history for an author |

## Example requests

### Create withdrawal

`POST /withdrawals`

```json
{
  "author_id": 1,
  "amount": 500
}
```

Amounts must be numeric and at least ₹500. The request is rejected if the author does not exist or their available balance is insufficient.

## Business rules and assumptions

- Total earnings are calculated as `sum(copiesSold * royaltyPerCopy)` across an author's books.
- Balance is calculated dynamically as total earnings minus withdrawals whose status is not `rejected`.
- A new withdrawal is created with `pending` status.
- The sample seed data is illustrative. Replace it with the exact assessment dataset if one was supplied.
- Data is stored in process memory, so writes are lost when the server restarts or redeploys. This is intended only for an in-memory assessment.

## Tests

```bash
npm test
```

## Deployment

The app listens on `process.env.PORT` when deployed and defaults to port 3000 locally.


## AI ticket triage (Groq)

Set these variables in the server `.env` file (never commit the key):

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
```

When a ticket is submitted, the API returns the created ticket immediately and runs AI analysis in the background. The AI stores a suggested category, priority, and draft reply in `aiCategory`, `aiPriority`, and `aiDraftReply`. Admins can click **Analyze with AI** / **Regenerate AI** in ticket details to run it on demand. AI-generated replies are suggestions only; an admin must choose **Use AI Draft**, review/edit the text, and click **Send Response**. If the key is missing or the provider fails, the ticket is still created and the admin can retry after fixing configuration.
