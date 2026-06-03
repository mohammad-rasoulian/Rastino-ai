# Rastino AI

Persian AI SaaS platform.

Public portfolio repository. Not open source.

## License

All rights reserved.

## Development

npm install
cp .env.example .env.local
npx prisma generate
npx prisma migrate dev
npm run dev

## Build

npx prisma generate
npm run lint
NODE_ENV=production npm run build

## Security

Secrets, databases, downloaded books, generated files, and backups are intentionally ignored.
