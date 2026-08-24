# Система нарядов (MVP)

Диспетчерская для полевых бригад. Операторы создают и назначают наряды, бригады видят только свои и меняют статус. Обновления приходят в реальном времени по WebSocket.

Домен абстрактный, не привязан к конкретной отрасли.

## Стек

| Слой            | Технологии                                        |
| --------------- | ------------------------------------------------- |
| Backend         | Node.js, Express, TypeScript, TypeORM, PostgreSQL |
| Сессии / 2FA    | Redis, `express-session` + `connect-redis`        |
| Очередь событий | RabbitMQ (`amqplib`)                              |
| Realtime        | Socket.IO                                         |
| Frontend        | React, TypeScript, Vite, React Router             |
| Валидация       | zod                                               |
| Пароли          | bcrypt                                            |
| Инфра           | Docker Compose                                    |

Монорепозиторий: `/backend`, `/frontend`, `/docker-compose.yml`.

## Как поднять

```bash
docker compose up -d
```

Подождать, пока Postgres, Redis и RabbitMQ станут healthy (`docker compose ps`).

**Backend**

```bash
cd backend
copy .env.example .env
npm install
npm run seed             # можно пропустить: при пустой БД seed запустится сам (AUTO_SEED=true)
npm run dev
```

API: http://localhost:3001  
Health: http://localhost:3001/health  
RabbitMQ UI: http://localhost:15672 (app / app)

**Frontend**

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

UI: http://localhost:5173

## Демо-аккаунты

Пароль у всех: `Passw0rd!`

| Email                 | Роль     | Бригада   |
| --------------------- | -------- | --------- |
| `operator@demo.local` | Оператор | —         |
| `team1@demo.local`    | Бригада  | Бригада 1 |
| `team2@demo.local`    | Бригада  | Бригада 2 |

После ввода пароля 6-значный код 2FA
