# Postman — Тестирование API комментариев (001-news-comments)

## 0. Подготовка окружения

### Переменные окружения Postman (Environment)

Создай окружение `news-portal-local` и добавь переменные:

| Переменная | Начальное значение | Описание |
|---|---|---|
| `base_url` | `http://localhost:8080` | Базовый URL сервера |
| `token` | *(пусто)* | JWT-токен, заполняется автоматически после логина |
| `news_id` | *(пусто)* | ID новости для тестирования |
| `comment_id` | *(пусто)* | ID созданного комментария |

> **Как добавить:** Environments → New → вставь переменные → Save

---

## 1. Аутентификация — получить JWT-токен

### POST `/auth` — Логин

**Метод:** `POST`
**URL:** `{{base_url}}/auth`
**Требует токен:** Нет (публичный эндпоинт)

**Headers:**
```
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "username": "sokolova_dev",
  "password": "Password123!"
}
```

> Используем обычного approved-пользователя, у которого есть доступ к комментариям.
> Можно также логиниться под `admin` или `editor_volkova` — у всех один пароль `Password123!`

**Tests (вкладка Tests в Postman) — сохранить токен автоматически:**
```javascript
const response = pm.response.json();
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

**Ошибка (401) — неверный пароль:**
```json
{
  "message": "Invalid credentials",
  "status": 401
}
```

---

## 2. Получить список новостей — узнать news_id

### GET `/news` — Список всех новостей

**Метод:** `GET`
**URL:** `{{base_url}}/news`
**Требует токен:** Нет (публичный эндпоинт)

**Tests — сохранить ID первой новости:**
```javascript
const response = pm.response.json();
if (response.data && response.data.length > 0) {
  pm.environment.set("news_id", response.data[0].id);
}
```

**Ожидаемый ответ (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Запуск нового корпоративного портала",
      "content": "...",
      "image": null,
      "author": {
        "id": "...",
        "firstName": "Анна",
        "lastName": "Волкова",
        "surname": null,
        "avatarUrl": null
      },
      "tags": [],
      "status": "published",
      "publishedAt": "2026-03-15T10:00:00.000Z",
      "category": {
        "id": "...",
        "name": "Корпоративные новости"
      },
      "commentCount": 0
    }
  ],
  "message": "News fetched successfully",
  "status": 200
}
```

> Скопируй `id` любой новости и вставь в переменную `news_id` вручную, если скрипт не сработал.

---

## 3. Комментарии — основные сценарии

> **Для всех запросов ниже** добавь заголовок Authorization:
> ```
> Authorization: Bearer {{token}}
> ```

---

### 3.1. GET `/news/:newsId/comments` — Получить комментарии к новости

**Метод:** `GET`
**URL:** `{{base_url}}/news/{{news_id}}/comments`
**Требует токен:** Да (approved-пользователь)

**Headers:**
```
Authorization: Bearer {{token}}
```

**Ожидаемый ответ — пустой список, если комментариев нет (200 OK):**
```json
{
  "data": [],
  "message": "Comments fetched successfully",
  "status": 200
}
```

**Ожидаемый ответ — список с комментариями (200 OK):**
```json
{
  "data": [
    {
      "id": "7f3c9a10-1234-4abc-b567-8def90123456",
      "content": "Отличная статья! Спасибо за информацию.",
      "author": {
        "id": "...",
        "username": "sokolova_dev",
        "firstName": "Светлана",
        "lastName": "Соколова"
      },
      "newsId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2026-03-31T12:00:00.000Z",
      "editedAt": null
    }
  ],
  "message": "Comments fetched successfully",
  "status": 200
}
```

**Ошибка (401) — без токена:**
```json
{
  "message": "Unauthorized",
  "status": 401
}
```

---

### 3.2. POST `/news/:newsId/comments` — Создать комментарий

**Метод:** `POST`
**URL:** `{{base_url}}/news/{{news_id}}/comments`
**Требует токен:** Да (approved-пользователь)

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "content": "Отличная статья! Очень полезная информация для всей команды."
}
```

> Поле `content` — обязательное, от 1 до 2000 символов.

**Tests — сохранить ID нового комментария:**
```javascript
const response = pm.response.json();
pm.environment.set("comment_id", response.data.id);
```

**Ожидаемый ответ (201 Created):**
```json
{
  "data": {
    "id": "7f3c9a10-1234-4abc-b567-8def90123456",
    "content": "Отличная статья! Очень полезная информация для всей команды.",
    "author": {
      "id": "abc123...",
      "username": "sokolova_dev",
      "firstName": "Светлана",
      "lastName": "Соколова"
    },
    "newsId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-03-31T12:00:00.000Z",
    "editedAt": null
  },
  "message": "Comment created successfully",
  "status": 201
}
```

**Ошибка (400) — пустой контент:**
```json
// Body: { "content": "" }
{
  "message": ["content must be longer than or equal to 1 characters"],
  "status": 400
}
```

**Ошибка (400) — контент слишком длинный:**
```json
// Body: { "content": "а".repeat(2001) }
{
  "message": ["content must be shorter than or equal to 2000 characters"],
  "status": 400
}
```

**Ошибка (404) — несуществующая новость:**
```json
// URL: /news/00000000-0000-0000-0000-000000000000/comments
{
  "message": "News not found",
  "status": 404
}
```

---

### 3.3. PUT `/comments/:id` — Обновить комментарий

**Метод:** `PUT`
**URL:** `{{base_url}}/comments/{{comment_id}}`
**Требует токен:** Да (approved-пользователь, только свой комментарий)

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "content": "Обновлённый комментарий: действительно очень полезная статья для всей команды!"
}
```

**Ожидаемый ответ (200 OK):**
```json
{
  "data": {
    "id": "7f3c9a10-1234-4abc-b567-8def90123456",
    "content": "Обновлённый комментарий: действительно очень полезная статья для всей команды!",
    "author": {
      "id": "abc123...",
      "username": "sokolova_dev",
      "firstName": "Светлана",
      "lastName": "Соколова"
    },
    "newsId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-03-31T12:00:00.000Z",
    "editedAt": "2026-03-31T12:05:00.000Z"
  },
  "message": "Comment updated successfully",
  "status": 200
}
```

> Обрати внимание: поле `editedAt` теперь заполнено — это подтверждает, что редактирование прошло успешно.

**Ошибка (403) — редактирование чужого комментария:**
```json
{
  "message": "Forbidden",
  "status": 403
}
```

**Ошибка (404) — комментарий не найден:**
```json
{
  "message": "Comment not found",
  "status": 404
}
```

---

### 3.4. DELETE `/comments/:id` — Удалить комментарий

**Метод:** `DELETE`
**URL:** `{{base_url}}/comments/{{comment_id}}`
**Требует токен:** Да (approved-пользователь)

**Headers:**
```
Authorization: Bearer {{token}}
```

**Тело запроса:** Не нужно

**Ожидаемый ответ (200 OK):**
```json
{
  "data": null,
  "message": "Comment deleted successfully",
  "status": 200
}
```

**Ошибка (403) — удаление чужого комментария (не admin):**
```json
{
  "message": "Forbidden",
  "status": 403
}
```

> **Примечание:** Admin может удалять любые комментарии. Обычный пользователь — только свои.

---

## 4. Граничные случаи и негативные сценарии

### 4.1. Запрос без токена

**URL:** `{{base_url}}/news/{{news_id}}/comments`
**Метод:** `GET`
**Headers:** *(без Authorization)*

**Ожидаемый ответ (401):**
```json
{
  "message": "Unauthorized",
  "status": 401
}
```

---

### 4.2. Неодобренный пользователь

Зарегистрируй нового пользователя через `POST /register`, не подтверждай его в админке, и попробуй получить комментарии.

**Ожидаемый ответ (403):**
```json
{
  "message": "Account is not approved",
  "status": 403
}
```

---

### 4.3. Пустой content при создании

**Body:**
```json
{
  "content": ""
}
```

**Ожидаемый ответ (400):**
```json
{
  "message": ["content must be longer than or equal to 1 characters"],
  "status": 400
}
```

---

### 4.4. Отсутствующее поле content

**Body:**
```json
{}
```

**Ожидаемый ответ (400):**
```json
{
  "message": [
    "content must be a string",
    "content should not be empty"
  ],
  "status": 400
}
```

---

## 5. Рекомендуемый порядок тестирования (коллекция)

Выстрой запросы в Postman-коллекции в таком порядке:

```
1. POST /auth                          → сохраняет {{token}}
2. GET  /news                          → сохраняет {{news_id}}
3. GET  /news/{{news_id}}/comments     → проверяем пустой список
4. POST /news/{{news_id}}/comments     → сохраняет {{comment_id}}
5. GET  /news/{{news_id}}/comments     → список с нашим комментарием
6. PUT  /comments/{{comment_id}}       → обновляем, editedAt заполнен
7. GET  /news/{{news_id}}/comments     → проверяем обновлённый текст
8. DELETE /comments/{{comment_id}}     → удаляем
9. GET  /news/{{news_id}}/comments     → снова пустой список
```

> Для запуска всей коллекции последовательно: **Run collection → Run news-portal-local**

---

## 6. Тестовые пользователи (из seed)

| Username | Роль | Пароль | Одобрен |
|---|---|---|---|
| `admin` | ADMIN | `Password123!` | ✅ |
| `editor_volkova` | EDITOR | `Password123!` | ✅ |
| `editor_morozov` | EDITOR | `Password123!` | ✅ |
| `sokolova_dev` | USER | `Password123!` | ✅ |
| `nikitin_dev` | USER | `Password123!` | ✅ |
| `lebedeva_qa` | USER | `Password123!` | ✅ |
| `orlov_devops` | USER | `Password123!` | ✅ |

> Для проверки удаления чужого комментария: создай комментарий под `sokolova_dev`,
> затем попробуй удалить его под `nikitin_dev` — должен вернуться `403 Forbidden`.
> Под `admin` — удаление должно пройти успешно.
