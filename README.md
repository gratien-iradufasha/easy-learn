# Easy Learn

Easy Learn teaches basic digital skills to people in rural areas. It works on smartphones and laptops through the web, and on any phone through USSD when there is no internet.

Languages: Kinyarwanda, English and French.

## What is inside

| Part | What it does |
| --- | --- |
| `frontend/` | React web app (installable as a PWA). Lessons with video, language switcher, login, progress, and the chat helper. Works on small phones and laptops. |
| `backend/` | Node and Express API with SQLite. Accounts (phone number and 4 digit PIN), lessons, progress, the chat helper, and the USSD endpoint. |

How the pieces fit:

* Lessons live in one file, `backend/src/content/lessons.js`. The web app and USSD both read from it, so you write each lesson once.
* The chat helper calls Claude when `ANTHROPIC_API_KEY` is set. Without a key it still answers common questions from built in answers, so the app never breaks.
* Learners who finish lessons on USSD are matched to their web account by phone number.
* The service worker keeps lessons available when the connection drops.

## Run it on your computer

You need Node 22.13 or newer.

```
npm run setup
cp backend/.env.example backend/.env
```

Open `backend/.env` and set `JWT_SECRET` to a long random string. Then use two terminals:

```
npm run dev:backend
npm run dev:frontend
```

Open http://localhost:5173.

Check the backend with `npm test`. It runs a full pass through registration, login, lessons, the chat helper and the USSD menus.

## Put it online

Build the frontend once and the backend serves everything from one address:

```
npm run build
npm start
```

Any small server works (a cheap VPS, Render, Railway, Fly.io). Set these environment variables there:

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | Long random string. Required in production. |
| `DB_PATH` | Where the SQLite file lives. Put it on a persistent disk. |
| `ANTHROPIC_API_KEY` | Optional. Turns on the AI chat helper. |
| `CHAT_MODEL` | Optional. Defaults to `claude-haiku-5-5`. |
| `PORT` | Defaults to 4000. |

Serve it over HTTPS. Installing the app on a phone and the service worker both need it.

## Set up USSD

The endpoint is `POST /api/ussd`. It uses the Africa's Talking format: the gateway sends `sessionId`, `serviceCode`, `phoneNumber` and `text`, and the app replies with text starting with `CON` (keep the session open) or `END` (close it).

1. Get a USSD short code. In Rwanda this comes through the mobile operators or an aggregator such as Africa's Talking. Ask them about cost, approval time and who pays for the sessions.
2. Point the callback URL of your short code at `https://your domain/api/ussd`.
3. Set `VITE_USSD_CODE` before building the frontend so the banner shows your real code. The default `*123#` is only a placeholder.

The USSD flow: choose a language, then Lessons, Common questions or My progress. Lessons are shown one step at a time. Every screen stays under about 160 characters.

## Add or change lessons

Edit `backend/src/content/lessons.js`. Each lesson has a title, a summary and four steps in all three languages. To add a video, paste a YouTube embed link into `videoUrl` for that language, for example `https://www.youtube.com/embed/VIDEO_ID`. Leave it empty to show "Video coming soon".

Interface text is in `frontend/src/locales/` (`rw.json`, `en.json`, `fr.json`).

## Before you launch

* **Have the Kinyarwanda and French reviewed.** I wrote the lesson and interface text in all three languages, but it needs a careful read by native speakers, ideally including people from the village you are serving.
* **Test with real learners.** Watch where they hesitate. Simplify wording and add steps wherever someone gets stuck.
* **Read aloud** uses the voices installed on the phone. English and French usually work. Kinyarwanda voices are rare, so the button only appears when a voice exists. Recorded audio per lesson is the reliable fix.
* **The PIN** is four digits, which suits a learning app. Do not store sensitive personal data. Check Rwanda's data protection requirements before collecting phone numbers at scale.
* **SQLite** is fine for a pilot with thousands of learners. Move to PostgreSQL if you grow beyond that.

## Ideas for what to build next

1. **Short videos, small files.** Two to three minutes each, 360p, with captions in the lesson language. Let hubs download them to a local computer or Raspberry Pi so learners without data can still watch.
2. **Digital hubs.** Pair the app with a community facilitator and a shared device. Many first time learners progress faster with a person beside them.
3. **Quizzes and certificates.** A three question check at the end of each lesson, and a simple certificate a learner can show an employer.
4. **Audio lessons over a phone call (IVR).** This reaches people who cannot read well.
5. **Lesson requests.** Let learners tell you what they want to learn, such as mobile money, farming prices or job applications.
6. **Simple reports for you.** Lessons finished, by language and by channel (web or USSD), so you can show impact to partners and funders.
