# QuizForge - Syllabus to Approved Quiz

Static front end (`index.html`) + one serverless function (`api/generate.js`) + Supabase (login + database).
Features: register/login, private per-teacher workspace, PDF to questions, approve/edit/reject, analytics, student quiz, Moodle/Forms/exam-paper export.

## 1. Supabase (5 min)
1. https://supabase.com -> New project (save the DB password).
2. SQL Editor -> New query -> paste `supabase/schema.sql` -> Run.
3. Authentication -> Sign In / Providers -> Email: enabled. For a hackathon demo, turn OFF "Confirm email" so sign-up works instantly.
4. Project Settings -> API: copy **Project URL** and the **anon public** key.
5. Put them in `config.js`. (Never put the `service_role` key anywhere in this project.)

## 2. AI key
Create an API key at https://console.anthropic.com (this is what the server function uses to write questions).

## 3. Run locally
```
npm i -g vercel
cp .env.example .env.local     # fill in the 3 values
vercel dev                     # open http://localhost:3000
```
(Plain `npx serve` will NOT work because the AI function needs `vercel dev`.)

## 4. Deploy to Vercel (your public link)
1. Create a GitHub repo, push this folder (`.env.local` is git-ignored).
2. https://vercel.com -> Add New -> Project -> import the repo. Framework preset: **Other**. No build command.
3. Settings -> Environment Variables: add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`.
4. Deploy. Your link is `https://<project-name>.vercel.app`.
5. Supabase -> Authentication -> URL Configuration: set **Site URL** to that link (needed for email confirmation links).
(CLI alternative: `vercel --prod`, then add the env vars in the dashboard and redeploy.)

## Security built in
- Passwords handled by Supabase Auth (hashed, never stored by the app).
- Row Level Security: each teacher can read/write only their own workspace.
- AI endpoint rejects requests without a valid Supabase session; API key lives only in Vercel env vars.
- Prompt size limit on the server. All user text is HTML-escaped before display.

## Troubleshooting
- "Setup needed" screen: `config.js` still has placeholders.
- "Session expired": sign out and in again.
- AI request failed: check `ANTHROPIC_API_KEY` in Vercel env vars, then redeploy.
- Sign-up says "check your email": disable Confirm email (step 1.3) or confirm via the email.
