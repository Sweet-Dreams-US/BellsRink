# Bells Rink on FreeWebsites

Bells Rink lives in the `bells` schema of the shared FreeWebsites Supabase project
(`nxhwqtqroyerbbklywyn`), with buckets `bells-photos` and `bells-community-uploads`.
The schema was applied as the migration `bells_0001_schema`; it is recorded in the
project's migration history.

- The public site only uses the publishable key: it reads blog and photo data and
  inserts community photos.
- `admin_*` tables, the one admin login and `supabase/functions/send-notification`
  belong to the `admin-dashboard-prototype` branch, which is not in production.
- The auth pool is shared with other sites. Anything that trusted "any signed-in user"
  on the old project requires `bells.is_member()` here (`app_metadata.tenants ? 'bells'`).
  Bells logins must carry that tag.
- To revive the prototype: add `db: { schema: 'bells' }` to the function's client and
  deploy it under a Bells-specific name.
