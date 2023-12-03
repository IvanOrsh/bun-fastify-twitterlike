# bun-fastify-twitterlike

## db setup

1. Create migration (if needed)

```sh
bunx prisma migrate dev --name init
```

2. deploy docker by running

```sh
sh deploy.sh
```

3. deploy test data by running

```sh
psql -h localhost -p 5432 -d fastserver -U fastserver -a -f testdata.sql
```
