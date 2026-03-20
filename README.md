# Digital Reporting System

This is the Barangay Digital Reporting System frontend built with `Vite` and `React`.

## Run Locally

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`
3. Build for production:
   `npm run build`

## Deploy To Vercel

This project is ready for Vercel deployment.

Recommended Vercel settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

The project already includes `vercel.json` so React app routes like `/admin/dashboard` and `/user/my-reports` work after deployment.

## Turn It Into A Real Multi-Device System

This app now supports a real shared backend with Supabase.

Setup steps:

1. Create a Supabase project.
2. In the Supabase SQL Editor, run `supabase/schema.sql`.
3. Copy `.env.example` to `.env` and fill in:
   `VITE_SUPABASE_URL`
   `VITE_SUPABASE_ANON_KEY`
4. Run the app:
   `npm run dev`
5. Deploy the frontend to Vercel with the same environment variables added in the Vercel project settings.

Current real-backend notes:

- Shared auth, profiles, reports, announcements, and system settings are wired for Supabase.
- The Super Admin `reset another user's password` action now uses the Supabase edge function in `supabase/functions/server/index.ts`.
- Deploy that function in your Supabase project so password resets work in production:
  `supabase functions deploy server`
- Some older demo-oriented UI text may still mention mock behavior, but the app data layer now expects Supabase when the environment variables are present.

### Deploy From GitHub

1. Push this project to a GitHub repository.
2. Go to Vercel and click `Add New Project`.
3. Import your GitHub repository.
4. Confirm the settings above.
5. Click `Deploy`.

### Deploy From CLI

1. Install the Vercel CLI:
   `npm install -g vercel`
2. Log in:
   `vercel login`
3. Deploy:
   `vercel`
4. For production:
   `vercel --prod`

## Important Note

This app currently uses mock/local browser storage for accounts, reports, and admin actions. That means deployed data is per browser/device and is best for demo use unless you connect it to a real backend/database.
