# Bells Rink on FreeWebsites

Bells Rink lives in the `bells` schema of the shared FreeWebsites Supabase project
(`nxhwqtqroyerbbklywyn`), with buckets `bells-photos` and `bells-community-uploads`.
The schema was applied as the migration `bells_0001_schema`; it is recorded in the
project's migration history.

- The public site only uses the publishable key: it reads blog, photo and hours data and
  inserts community photos and website form submissions.
- `/admin` is the owner's page (migration `bells_0002_simple_admin`). It shows
  `form_submissions` (the contact form and newsletter signup write a row each; anyone may
  insert, only a Bells admin may read) and edits the `hours` row of `site_settings`
  (public read, Bells admin update). `src/lib/hours.ts` holds the fallback hours.
- There is one admin login, `admin@bellsrink.com`. The `/admin` page fills in that email
  itself and asks only for the passcode, which is that login's password. To change the
  passcode, set a new password on that user in the Supabase dashboard (Authentication).
- `admin_*` tables and `supabase/functions/send-notification` belong to the
  `admin-dashboard-prototype` branch, which is not in production. The password that branch
  prints on its login page no longer works.
- The auth pool is shared with other sites. Anything that trusted "any signed-in user"
  on the old project requires `bells.is_member()` here (`app_metadata.tenants ? 'bells'`).
  Bells logins must carry that tag.
- To revive the prototype: add `db: { schema: 'bells' }` to the function's client and
  deploy it under a Bells-specific name.
