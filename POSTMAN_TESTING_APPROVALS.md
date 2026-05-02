# Postman — Тестирование API согласования новостей (TASK-005)

## 0. Переменные окружения

Добавь в окружение `news-portal-local` дополнительные переменные (к уже существующим):

| Переменная | Начальное значение | Описание |
|---|---|---|
| `base_url` | `http://localhost:8080` | Базовый URL сервера |
| `token` | *(пусто)* | JWT-токен текущего пользователя |
| `editor_token` | *(пусто)* | JWT-токен редактора |
| `admin_token` | *(пусто)* | JWT-токен администратора |
| `news_id` | *(пусто)* | ID новости для тестирования |
| `approval_id` | *(пусто)* | ID записи согласования |

---

## 1. Получить токены для обоих ролей

### 1.1. Логин редактора

**Метод:** `POST`
**URL:** `{{base_url}}/auth`

**Body (raw → JSON):**
```json
{
  "username": "editor_volkova",
  "password": "Password123!"
}
```

**Tests — сохранить токен редактора:**
```javascript
const response = pm.response.json();
pm.environment.set("editor_token", response.data.token);
pm.environment.set("token", response.data.token);
```

**Ожидаемый ответ (200 OK):**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Successfully authenticated",
  "status": 200
}
```

---

### 1.2. Логин администратора

**Метод:** `POST`
**URL:** `{{base_url}}/auth`

**Body (raw → JSON):**
```json
{
  "username": "admin",
  "password": "Password123!"
}
```

**Tests — сохранить токен администратора:**
```javascript
const response = pm.response.json();
pm.environment.set("admin_token", response.data.token);
```

---

## 2. Подготовка — создать черновик новости (редактор)

### 2.1. POST `/news` — Создать черновик

**Метод:** `POST`
**URL:** `{{base_url}}/news`

**Headers:**
```
Authorization: Bearer {{editor_token}}
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "title": "Тестовая новость для согласования",
  "content": "Это тестовый контент для проверки процесса согласования новостей.",
  "image": null,
  "categoryId": "ПОДСТАВЬ_ID_КАТЕГОРИИ",
  "tags": []
}
```

> Чтобы узнать ID категории, сделай `GET {{base_url}}/categories` без токена.

**Tests — сохранить ID новости:**
```javascript
const response = pm.response.json();
pm.environment.set("news_id", response.data.id);
```

**Ожидаемый ответ (201 Created):**
```json
{
  "data": {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "title": "Тестовая новость для согласования",
    "content": "Это тестовый контент...",
    "image": null,
    "author": { "id": "...", "firstName": "Анна", "lastName": "Волкова" },
    "tags": [],
    "publishedAt": null,
    "category": { "id": "...", "name": "..." },
    "commentCount": 0
  },
  "message": "News created",
  "status": 201
}
```

> Новость создаётся в статусе `draft`. Редактор не может передать `status` напрямую — поле игнорируется.

---

## 3. Отправить новость на согласование (редактор)

### POST `/news/:id/submit-for-approval`

**Метод:** `POST`
**URL:** `{{base_url}}/news/{{news_id}}/submit-for-approval`

**Headers:**
```
Authorization: Bearer {{editor_token}}
Content-Type: application/json
```

**Body (raw → JSON) — вариант A: конкретному администратору:**
```json
{
  "adminId": "UUID_АДМИНИСТРАТОРА"
}
```

**Body (raw → JSON) — вариант B: любому администратору:**
```json
{}
```

**Tests — сохранить ID согласования:**
```javascript
const response = pm.response.json();
pm.environment.set("approval_id", response.data.id);
```

**Ожидаемый ответ (201 Created):**
```json
{
  "data": {
    "id": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
    "newsId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "editorId": "...",
    "submittedToAdminId": null,
    "adminId": null,
    "status": "pending",
    "comment": null,
    "seenByAdminAt": null,
    "seenByEditorAt": null,
    "reviewedAt": null,
    "createdAt": "2026-04-15T10:00:00.000Z"
  },
  "message": "Submitted for approval",
  "status": 201
}
```

> После этого статус новости в БД меняется с `draft` на `pending_review`.

**Ошибка (400) — новость не в статусе `draft`:**
```json
{
  "message": "Cannot submit news with status \"pending_review\" for review",
  "status": 400
}
```

**Ошибка (403) — не редактор:**
```json
{
  "message": "Forbidden resource",
  "status": 403
}
```

---

## 4. Получить список ожидающих согласования (администратор)

### GET `/news-approvals/pending`

**Метод:** `GET`
**URL:** `{{base_url}}/news-approvals/pending`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Tests — сохранить ID первого согласования (если не сохранён):**
```javascript
const response = pm.response.json();
if (response.data && response.data.length > 0) {
  pm.environment.set("approval_id", response.data[0].id);
}
```

**Ожидаемый ответ (200 OK):**
```json
{
  "data": [
    {
      "id": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
      "newsId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "editorId": "...",
      "submittedToAdminId": null,
      "adminId": null,
      "status": "pending",
      "comment": null,
      "seenByAdminAt": null,
      "seenByEditorAt": null,
      "reviewedAt": null,
      "createdAt": "2026-04-15T10:00:00.000Z"
    }
  ],
  "message": "Pending approvals",
  "status": 200
}
```

**Ошибка (403) — вызов от имени редактора:**
```json
{
  "message": "Forbidden resource",
  "status": 403
}
```

---

## 5. Получить запись согласования по ID

### GET `/news-approvals/:id`

**Метод:** `GET`
**URL:** `{{base_url}}/news-approvals/{{approval_id}}`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Ожидаемый ответ (200 OK):**
```json
{
  "data": {
    "id": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
    "newsId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "editorId": "...",
    "submittedToAdminId": null,
    "adminId": null,
    "status": "pending",
    "comment": null,
    "seenByAdminAt": null,
    "seenByEditorAt": null,
    "reviewedAt": null,
    "createdAt": "2026-04-15T10:00:00.000Z"
  },
  "message": "Approval retrieved",
  "status": 200
}
```

**Ошибка (404) — согласование не найдено:**
```json
{
  "message": "Approval not found",
  "status": 404
}
```

---

## 6. Отметить согласование как просмотренное

### PATCH `/news-approvals/:id/seen`

Отмечает, что администратор или редактор просмотрели запись. Поле `seenByAdminAt` / `seenByEditorAt` заполняется в зависимости от роли вызывающего.

**Метод:** `PATCH`
**URL:** `{{base_url}}/news-approvals/{{approval_id}}/seen`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Тело запроса:** Не нужно

**Ожидаемый ответ (200 OK):**
```json
{
  "data": null,
  "message": "Marked as seen",
  "status": 200
}
```

---

## 7. Получить счётчик бейджа уведомлений

### GET `/news-approvals/badge`

Возвращает количество непросмотренных записей:
- Для **ADMIN**: число `pending`-согласований без `seenByAdminAt`.
- Для **EDITOR**: число решённых (`approved`/`rejected`) без `seenByEditorAt`.

**Метод:** `GET`
**URL:** `{{base_url}}/news-approvals/badge`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Ожидаемый ответ (200 OK):**
```json
{
  "data": { "count": 1 },
  "message": "Badge count",
  "status": 200
}
```

---

## 8. Одобрить новость (администратор)

### POST `/news-approvals/:id/process` — статус `approved`

**Метод:** `POST`
**URL:** `{{base_url}}/news-approvals/{{approval_id}}/process`

**Headers:**
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "status": "approved",
  "comment": "Хорошая статья, одобряю."
}
```

> Поле `comment` — необязательное при одобрении.

**Ожидаемый ответ (201 Created):**
```json
{
  "data": {
    "id": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
    "newsId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "editorId": "...",
    "adminId": "...",
    "status": "approved",
    "comment": "Хорошая статья, одобряю.",
    "seenByAdminAt": null,
    "seenByEditorAt": null,
    "reviewedAt": "2026-04-15T10:05:00.000Z",
    "createdAt": "2026-04-15T10:00:00.000Z"
  },
  "message": "Approval processed",
  "status": 201
}
```

> После одобрения статус новости в БД меняется с `pending_review` на `approved`.

**Ошибка (400) — статус уже `approved` или `rejected`:**
```json
{
  "message": "Cannot approve news with status \"approved\"",
  "status": 400
}
```

**Ошибка (403) — вызов от имени редактора:**
```json
{
  "message": "Forbidden resource",
  "status": 403
}
```

---

## 9. Опубликовать одобренную новость (редактор)

### POST `/news/:id/publish`

Доступно только если статус новости — `approved`.

**Метод:** `POST`
**URL:** `{{base_url}}/news/{{news_id}}/publish`

**Headers:**
```
Authorization: Bearer {{editor_token}}
```

**Тело запроса:** Не нужно

**Ожидаемый ответ (201 Created):**
```json
{
  "data": {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "title": "Тестовая новость для согласования",
    "content": "...",
    "publishedAt": "2026-04-15T10:10:00.000Z",
    "commentCount": 0
  },
  "message": "News published",
  "status": 201
}
```

> Статус новости становится `published`, заполняется `publishedAt`.

**Ошибка (400) — новость не в статусе `approved`:**
```json
{
  "message": "Cannot publish news with status \"pending_review\"",
  "status": 400
}
```

**Ошибка (403) — публикация чужой новости:**
```json
{
  "message": "Forbidden resource",
  "status": 403
}
```

---

## 10. Отклонить новость (администратор)

### POST `/news-approvals/:id/process` — статус `rejected`

> **Важно:** перед этим тестом нужна новая новость в статусе `pending_review` (повтори шаги 2–3).

**Метод:** `POST`
**URL:** `{{base_url}}/news-approvals/{{approval_id}}/process`

**Headers:**
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "status": "rejected",
  "comment": "Необходимо добавить ссылки на источники."
}
```

**Ожидаемый ответ (201 Created):**
```json
{
  "data": {
    "id": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
    "newsId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "editorId": "...",
    "adminId": "...",
    "status": "rejected",
    "comment": "Необходимо добавить ссылки на источники.",
    "reviewedAt": "2026-04-15T10:15:00.000Z",
    "createdAt": "2026-04-15T10:00:00.000Z"
  },
  "message": "Approval processed",
  "status": 201
}
```

> После отклонения статус новости возвращается к `draft`. Редактор может снова отправить на проверку.

**Ошибка (400) — `comment` отсутствует при отклонении:**

Поле `comment` технически необязательно (`@IsOptional`), но по бизнес-логике стоит передавать причину.

**Ошибка (400) — невалидный `status`:**
```json
// Body: { "status": "pending" }
{
  "message": ["status must be one of the following values: approved, rejected"],
  "status": 400
}
```

---

## 11. Получить историю согласований редактора

### GET `/news-approvals/my-activity`

Возвращает все согласования, где `editorId` совпадает с текущим пользователем.

**Метод:** `GET`
**URL:** `{{base_url}}/news-approvals/my-activity`

**Headers:**
```
Authorization: Bearer {{editor_token}}
```

**Ожидаемый ответ (200 OK):**
```json
{
  "data": [
    {
      "id": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
      "newsId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "editorId": "...",
      "status": "rejected",
      "comment": "Необходимо добавить ссылки на источники.",
      "reviewedAt": "2026-04-15T10:15:00.000Z",
      "createdAt": "2026-04-15T10:00:00.000Z"
    }
  ],
  "message": "Activity retrieved",
  "status": 200
}
```

**Ошибка (403) — вызов от имени администратора:**
```json
{
  "message": "Forbidden resource",
  "status": 403
}
```

---

## 12. Негативные сценарии

### 12.1. Редактор пытается отправить на проверку новость не в статусе `draft`

```
POST {{base_url}}/news/{{news_id}}/submit-for-approval
Authorization: Bearer {{editor_token}}
```

Если новость уже в `pending_review`:
```json
{
  "message": "Cannot submit news with status \"pending_review\" for review",
  "status": 400
}
```

---

### 12.2. Редактор пытается опубликовать неодобренную новость

```
POST {{base_url}}/news/{{news_id}}/publish
Authorization: Bearer {{editor_token}}
```

Если новость в `draft` или `pending_review`:
```json
{
  "message": "Cannot publish news with status \"draft\"",
  "status": 400
}
```

---

### 12.3. Редактор пытается вызвать `/news-approvals/pending`

```
GET {{base_url}}/news-approvals/pending
Authorization: Bearer {{editor_token}}
```

```json
{
  "message": "Forbidden resource",
  "status": 403
}
```

---

### 12.4. Администратор пытается вызвать `/news-approvals/my-activity`

```
GET {{base_url}}/news-approvals/my-activity
Authorization: Bearer {{admin_token}}
```

```json
{
  "message": "Forbidden resource",
  "status": 403
}
```

---

### 12.5. Обработка уже обработанного согласования

```
POST {{base_url}}/news-approvals/{{approval_id}}/process
Authorization: Bearer {{admin_token}}
Body: { "status": "rejected", "comment": "..." }
```

Если статус `approval` уже `approved` или `rejected`:
```json
{
  "message": "Approval already processed",
  "status": 400
}
```

---

## 13. Рекомендуемый порядок тестирования — полный цикл

### Сценарий A: Одобрение → Публикация

```
1. POST /auth (editor_volkova)              → editor_token
2. POST /auth (admin)                       → admin_token
3. GET  /categories                         → узнать categoryId
4. POST /news                               → создать черновик → news_id
5. POST /news/{{news_id}}/submit-for-approval → approval_id, статус → pending_review
6. GET  /news-approvals/pending (admin)     → видим нашу заявку
7. GET  /news-approvals/{{approval_id}}     → детали
8. PATCH /news-approvals/{{approval_id}}/seen (admin) → seenByAdminAt заполнен
9. POST /news-approvals/{{approval_id}}/process { "status": "approved" }
10. GET /news-approvals/badge (editor)      → count = 1
11. POST /news/{{news_id}}/publish          → статус новости = published
```

---

### Сценарий B: Отклонение → Правка → Повторная отправка

```
1. POST /auth (editor_volkova)              → editor_token
2. POST /auth (admin)                       → admin_token
3. POST /news                               → создать черновик → news_id
4. POST /news/{{news_id}}/submit-for-approval → approval_id
5. POST /news-approvals/{{approval_id}}/process { "status": "rejected", "comment": "..." }
   → статус новости возвращается к draft
6. GET  /news-approvals/my-activity (editor) → видим отклонённую заявку
7. PUT  /news/{{news_id}} (editor)          → исправляем статью
8. POST /news/{{news_id}}/submit-for-approval → новый approval_id
9. GET  /news-approvals/pending (admin)     → новая заявка
10. POST /news-approvals/{{approval_id}}/process { "status": "approved" }
11. POST /news/{{news_id}}/publish          → опубликовано
```

---

## 14. Тестовые пользователи из seed

| Username | Роль | Пароль | Одобрен |
|---|---|---|---|
| `admin` | ADMIN | `Password123!` | ✅ |
| `editor_volkova` | EDITOR | `Password123!` | ✅ |
| `editor_morozov` | EDITOR | `Password123!` | ✅ |
| `sokolova_dev` | USER | `Password123!` | ✅ |

---

## 15. Состояния новости — диаграмма

```
draft
  │
  │ POST /news/:id/submit-for-approval
  ▼
pending_review
  │
  ├─── POST /news-approvals/:id/process { status: "approved" }
  │    ▼
  │  approved
  │    │
  │    │ POST /news/:id/publish
  │    ▼
  │  published
  │
  └─── POST /news-approvals/:id/process { status: "rejected" }
       ▼
     draft  (возвращается обратно)
```
