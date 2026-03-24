# Feature Specification: News Article Comments

**Feature Branch**: `001-news-comments`
**Created**: 2026-03-24
**Status**: Draft
**Input**: User description: "Users can comment on news articles"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Read Comments on an Article (Priority: P1)

Any visitor — authenticated or not — opens a news article and sees all comments left by other users, ordered from oldest to newest, with the author's name and the time of posting visible for each comment.

**Why this priority**: Comments are primarily a reading experience. Displaying them to all visitors is the foundation every other story builds on.

**Independent Test**: Can be fully tested by opening any news article and verifying that existing comments are visible without logging in.

**Acceptance Scenarios**:

1. **Given** a published article with comments, **When** any visitor opens the article, **Then** all comments are shown in chronological order with author name and timestamp.
2. **Given** a published article with no comments, **When** any visitor opens the article, **Then** a "no comments yet" state is displayed and the comment count shows 0.

---

### User Story 2 — Post a Comment (Priority: P2)

A registered and approved user reads a news article and wants to share their thoughts. They type their comment and submit it. The comment immediately appears at the bottom of the list with their name and the current timestamp.

**Why this priority**: Posting is the core interactive action that makes the feature valuable.

**Independent Test**: Can be fully tested by logging in as an approved user, submitting a comment on an article, and verifying it appears in the list.

**Acceptance Scenarios**:

1. **Given** an approved user is viewing an article, **When** they submit a non-empty comment (max 2000 characters), **Then** the comment is saved and appears in the article's comment list.
2. **Given** an approved user tries to submit an empty comment, **When** they confirm submission, **Then** the system rejects it with a clear validation message.
3. **Given** an approved user tries to submit a comment exceeding 2000 characters, **When** they confirm submission, **Then** the system rejects it with a character-limit message.
4. **Given** a visitor who is not logged in views an article, **When** they attempt to comment, **Then** they are prompted to log in first.
5. **Given** a registered but not yet approved user is logged in, **When** they attempt to comment, **Then** access is denied with an appropriate message.

---

### User Story 3 — Edit Own Comment (Priority: P3)

An approved user realises they made a mistake in a comment they posted. They open the comment, edit the text, and save the change. The updated text is shown in place of the original, with a visible indication that it was edited.

**Why this priority**: Editing prevents the need to delete and re-post, and improves content quality.

**Independent Test**: Can be fully tested by posting a comment, editing it, and confirming the updated text and an "edited" marker appear.

**Acceptance Scenarios**:

1. **Given** an approved user views their own comment, **When** they edit and save new text, **Then** the comment displays the updated content with an "edited" marker.
2. **Given** an approved user tries to save an edited comment with empty text, **When** they confirm, **Then** the system rejects it with a validation message.
3. **Given** an approved user views someone else's comment, **When** they attempt to edit it, **Then** the edit option is not available to them.

---

### User Story 4 — Delete Own Comment (Priority: P4)

An approved user wants to remove a comment they posted. They choose to delete it and confirm the action. The comment is permanently removed from the article.

**Why this priority**: Deletion gives users control over their own content.

**Independent Test**: Can be fully tested by posting a comment, deleting it with confirmation, and verifying it no longer appears.

**Acceptance Scenarios**:

1. **Given** an approved user views their own comment, **When** they delete it and confirm, **Then** the comment is permanently removed and the count decreases by one.
2. **Given** an approved user views someone else's comment, **When** they attempt to delete it, **Then** the delete option is not available to them.

---

### User Story 5 — Admin Moderation (Priority: P5)

An admin reviews comments on an article and finds one that violates community guidelines. They delete the offending comment. The comment is permanently removed.

**Why this priority**: Moderation is essential for content quality but is an administrative concern secondary to the core user experience.

**Independent Test**: Can be fully tested by logging in as an admin and deleting any comment on any article.

**Acceptance Scenarios**:

1. **Given** an admin views any comment on any article, **When** they choose to delete it and confirm, **Then** the comment is permanently removed regardless of who authored it.

---

### Edge Cases

- What happens when a news article is deleted — are its comments deleted too?
- What happens when a comment author's account is deleted — are their comments deleted or attributed to a "deleted user" placeholder?
- What happens if a user submits the same comment twice in rapid succession (accidental double-submit)?
- How does the system behave when an article accumulates a very large number of comments (e.g., 500+)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all comments for a news article to any visitor without requiring authentication.
- **FR-002**: System MUST allow any registered and approved user to post a comment on any news article.
- **FR-003**: Comment text MUST NOT be empty and MUST NOT exceed 2000 characters.
- **FR-004**: Each comment MUST record and display the author's name and the date/time it was posted.
- **FR-005**: System MUST allow a comment author to edit the text of their own comment after posting.
- **FR-006**: Edited comments MUST display a visible indication that they have been modified.
- **FR-007**: System MUST allow a comment author to permanently delete their own comment.
- **FR-008**: System MUST allow an administrator to permanently delete any comment on any article.
- **FR-009**: A user who is not registered or not approved MUST NOT be able to post, edit, or delete comments.
- **FR-010**: A non-admin user MUST NOT be able to edit or delete another user's comment.
- **FR-011**: System MUST display the total number of comments per article.
- **FR-012**: Comments MUST be displayed in chronological order (oldest first).
- **FR-013**: When a news article is deleted, all its comments MUST be deleted as well.

### Key Entities

- **Comment**: A text message associated with a specific news article, authored by an approved user. Attributes: content (text, max 2000 characters), creation timestamp, optional edited timestamp, relationship to author (User) and article (News).
- **News Article**: Existing entity. Extended with an association to a collection of Comments and a derived comment count.
- **User**: Existing entity. Extended with an association to Comments they have authored.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An approved user can post a comment on a news article in under 30 seconds from opening the article.
- **SC-002**: Comments are visible to all visitors, including unauthenticated ones, with no additional steps required.
- **SC-003**: A comment author can successfully edit or delete their own comment from the same view where comments are displayed.
- **SC-004**: An administrator can remove any comment without navigating away from the article.
- **SC-005**: The comment count on an article accurately reflects the current number of comments immediately after any add or delete operation.
- **SC-006**: Attempts to post empty or oversized comments are rejected with a clear message before any data is saved.
