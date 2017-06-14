# api.talky.io

## Getting started
Make sure that postgres and psql are installed on your machine

1. Create the database `npm run createdb`
2. Run the migration `npm run migrate`
3. Seed the DB `npm run seed`

I think it's safe for us to just work out of the [initial migrations]('./migrations/20170614103301_initial.js') file for now as we get the schema's correct.  To roll back and re-migrate you can run `knex migrate:rollback && npm run migrate`

If you want to destroy the DB and start over just run `npm run destroydb`