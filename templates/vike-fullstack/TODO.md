Follow the steps below to finish setting up your application.

## Cloudflare D1

Create the `my-vike-demo-database` database:

```sh
bun wrangler d1 create my-vike-demo-database
```

Then migrate:

```sh
bun drizzle:migrate
```

More infos can be found at https://developers.cloudflare.com/d1/get-started/

## Drizzle

First, ensure that `DATABASE_URL` is configured in `.env` file, then create the database:

```bash
bun drizzle:generate # a script that executes drizzle-kit generate.
bun drizzle:migrate # a script that executes drizzle-kit migrate.
```

> \[!NOTE]
> The `drizzle-kit generate` command is used to generate SQL migration files based on your Drizzle schema.
>
> The `drizzle-kit migrate` command is used to apply the generated migrations to your database.

Read more on [Drizzle ORM documentation](https://orm.drizzle.team/docs/overview)

## Cloudflare Workers

Run [`wrangler types`](https://developers.cloudflare.com/workers/wrangler/commands/#types) to generate the `worker-configuration.d.ts` file:

```sh
bunx wrangler types
```

> Re-run it whenever you change your Cloudflare configuration to update `worker-configuration.d.ts`.

Then commit `worker-configuration.d.ts`:

```sh
git commit -am "add cloudflare types"
```

See also: https://vike.dev/cloudflare#typescript

