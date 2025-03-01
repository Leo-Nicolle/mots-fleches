# Mots Flex server

## How to start the database (developement)

```bash
docker-compose --env-file .env --profile development up -d
```

## How to stop the database

```bash
docker compose down
```

## How to start the server (developement)

```bash
npm run dev
```

## How to start the server (production)

```bash
docker-compose --env-file .env.production --profile production up -d --build
```

## How to stop the server

```bash
docker compose down
```