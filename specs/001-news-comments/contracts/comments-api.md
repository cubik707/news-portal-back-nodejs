# API Contracts: Comments

**Branch**: `001-news-comments` | **Date**: 2026-03-24

All responses follow the existing `{ data: T, message: string }` envelope.

---

## GET /news/:newsId/comments

Retrieve all comments for a news article, oldest first.

**Auth**: JWT + Approved (`JwtAuthGuard` + `ApprovedGuard`)

**Response 200**
```json
{
  "data": [
    {
      "id": "019571c4-...",
      "content": "Great article!",
      "author": {
        "id": "019571c4-...",
        "username": "nikitin_dev",
        "firstName": "Ivan",
        "lastName": "Nikitin"
      },
      "newsId": "019571c4-...",
      "createdAt": "2026-03-24T10:00:00.000Z",
      "editedAt": null
    }
  ],
  "message": "Comments retrieved"
}
```

**Response 401** — not authenticated
**Response 403** — account not approved
**Response 404** — news article not found

---

## POST /news/:newsId/comments

Post a new comment on a news article.

**Auth**: JWT + Approved (`JwtAuthGuard` + `ApprovedGuard`)

**Request body**
```json
{
  "content": "Great article!"
}
```

**Validation**:
- `content`: string, 1–2000 characters, required

**Response 201**
```json
{
  "data": {
    "id": "019571c4-...",
    "content": "Great article!",
    "author": { "id": "...", "username": "...", "firstName": "...", "lastName": "..." },
    "newsId": "019571c4-...",
    "createdAt": "2026-03-24T10:00:00.000Z",
    "editedAt": null
  },
  "message": "Comment created"
}
```

**Response 400** — validation failure (empty or too long)
**Response 401** — not authenticated
**Response 403** — account not approved
**Response 404** — news article not found

---

## PUT /comments/:id

Edit the text of an existing comment. Only the comment's author may call this.

**Auth**: JWT + Approved

**Request body**
```json
{
  "content": "Updated text."
}
```

**Validation**:
- `content`: string, 1–2000 characters, required

**Response 200**
```json
{
  "data": {
    "id": "019571c4-...",
    "content": "Updated text.",
    "author": { "id": "...", "username": "...", "firstName": "...", "lastName": "..." },
    "newsId": "019571c4-...",
    "createdAt": "2026-03-24T10:00:00.000Z",
    "editedAt": "2026-03-24T10:05:00.000Z"
  },
  "message": "Comment updated"
}
```

**Response 400** — validation failure
**Response 401** — not authenticated
**Response 403** — not the comment's author
**Response 404** — comment not found

---

## DELETE /comments/:id

Delete a comment. The comment's author OR an ADMIN may call this.

**Auth**: JWT + Approved

**Response 200**
```json
{
  "data": null,
  "message": "Comment deleted"
}
```

**Response 401** — not authenticated
**Response 403** — not the author and not ADMIN
**Response 404** — comment not found
