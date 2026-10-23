# 🪔 Diwali Celebration Lunch: Invitation App

A festive, single-page invitation for a Diwali lunch at home. Guests open the link, see the
invite and are asked to RSVP. The **Yes** button sets off full-screen fireworks and opens a
short form (name, email, number of guests, food preference, a Diwali wish). The **No**
button… can't be clicked. It runs away from the mouse (or finger) and says something new
each time: *"Nope"*, *"Catch me!"*, *"Almost there"*, *"Too slow!"*, *"The ladoos will miss
you"*, *"Error 404: No not found"* and more.

RSVPs are saved to a free **Supabase** database, and the host sees them on a private
**admin page**.

It's a plain static site (HTML, CSS, JavaScript, no build step), so it runs on
**GitHub Pages** for free.

## What's inside

| Feature | Details |
| --- | --- |
| Runaway **No** button | Flees on hover (desktop) or touch (phone), cycles through ~20 playful messages, shrinks a little while the Yes button grows |
| Fireworks | Full-screen canvas drawn *above* the pop-up, on Yes and again after submitting. Click the night sky for a bonus burst |
| RSVP form | Name, email, guests, food preference (Veg / Vegan / Jain / No preference), optional wish |
| Diwali theme | Glowing card, spinning rangoli, swinging lanterns, falling marigold petals, twinkling stars, golden cursor sparkles |
| Countdown | Live days / hours / minutes / seconds to the lunch |
| Add to calendar | Downloads an `.ics` file that works with Google, Apple and Outlook calendars |
| Share | Uses the phone's share sheet (WhatsApp, Messages…) or copies the link |
| Festive sounds | Optional chime and firework booms (toggle 🔇/🔊 top-right, off by default) |
| Admin page | `admin.html`: sign in, see totals, guest count, food-preference summary, search, delete, export CSV |
| Demo mode | Works before the database is set up: RSVPs are kept in the visitor's own browser so you can try everything |

## Files

```
index.html     the invitation
styles.css     all the Diwali styling
app.js         runaway button, form, countdown, petals, sounds, calendar, share
fireworks.js   the fireworks engine
db.js          saves/loads RSVPs (Supabase, or browser storage in demo mode)
config.js      ← THE ONE FILE TO EDIT: host, date, address, database keys
admin.html / admin.js / admin.css   the admin page
supabase.sql   creates the database table and its security rules
```

---

## 1. Personalise it (2 minutes)

Open **`config.js`** and change the values:

```js
hostName: "The Patel Family",
eventStart: "2026-11-08T12:30:00",   // date + start time
eventEnd:   "2026-11-08T16:00:00",
address: "123 Festival Lane, Your City, ST 00000",   // ← placeholder, put the real address here
dressCode: "...",
note: "...",
```

The address is a placeholder. Change that one line and it updates everywhere, including the
Google Maps link and the calendar file. You can edit the file right on github.com: open
it, click the ✏️ pencil, edit, then **Commit changes**.

---

## 2. Share this repo with your friend (for Kuldip)

Pick **one** of these:

### Option A: Use it as a template (recommended)
Your friend gets her own clean copy that she fully owns.

1. In this repo, go to **Settings → General** and tick **Template repository**.
2. Send her the repo link. She clicks the green **Use this template → Create a new repository**,
   chooses her account, names it (e.g. `diwali-lunch`) and sets it to **Public**.

### Option B: Fork it
1. Make sure this repo is **Public** (Settings → General → Danger Zone → Change visibility).
2. Send her the link. She clicks **Fork → Create fork**.
   (Forks keep a link back to your repo, which is handy if you want to send her updates later.)

### Option C: Add her as a collaborator
1. Go to **Settings → Collaborators → Add people**, enter her GitHub username.
2. She accepts the email invite. She can now edit and push to *your* repo, but the site would
   be hosted under *your* account, so use A or B if she should host it.

> Free GitHub Pages needs the repository to be **public**. That's fine. Nothing secret is
> stored in the code (see "Is it safe?" below).

---

## 3. Set up the database (Supabase, free, about 10 minutes)

Your friend does this once, in her own Supabase account.

1. Go to <https://supabase.com>, sign up (GitHub login works) and click **New project**.
   Pick any name and region, set a database password (save it somewhere), and wait about 1 minute.
2. Open **SQL Editor → New query**, paste the whole contents of [`supabase.sql`](supabase.sql)
   and click **Run**. This creates the `rsvps` table and the security rules.
3. Create the admin login: **Authentication → Users → Add user → Create new user**.
   Enter her email and a password, and tick **Auto Confirm User**.
4. Turn off public sign-ups so nobody else can create an account:
   **Authentication → Sign In / Providers** (called *Providers* or *Settings* in some versions)
   → turn **off** "Allow new users to sign up" → Save.
5. Copy the keys: **Project Settings → API** (or the **Connect** button on the project home).
   - **Project URL**, like `https://abcdxyz.supabase.co`
   - **anon public** key (newer projects call it the **publishable** key, starting `sb_publishable_`;
     either works). **Do not** use the `service_role` / secret key.
6. Put them in `config.js` and commit:

   ```js
   supabaseUrl: "https://abcdxyz.supabase.co",
   supabaseAnonKey: "eyJhbGciOi...",
   ```

---

## 4. Put it online with GitHub Pages (about 3 minutes)

In her copy of the repo:

1. **Settings → Pages**.
2. Under **Build and deployment**, Source: **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)** → **Save**.
4. Wait 1 to 2 minutes and refresh. The link appears at the top, like
   `https://<her-username>.github.io/<repo-name>/`.

That's the link to send to friends. 🎉

- Admin page: `https://<her-username>.github.io/<repo-name>/admin.html` (sign in with the user from step 3.3).
- Every time she commits a change (like the address), the site redeploys automatically within a minute or two.

---

## 5. Test it

1. Open the site, try to catch the **No** button 😄, click **Yes**, fill in the form.
2. Open `admin.html`, sign in, and the RSVP should be there. Delete the test entry with **Delete**.

To try it on your own computer first, run `python3 -m http.server` in this folder and open
<http://localhost:8000>. Until the Supabase keys are filled in, it runs in **demo mode**:
RSVPs are saved only in that browser, and the admin page shows them without a login.

---

## Is it safe to put the Supabase key in public code?

Yes, the **anon / publishable** key is designed to be public. What protects the data is the
**Row Level Security** set up by `supabase.sql`:

- Anyone can **add** an RSVP (that's the point of the invite).
- Only a **signed-in** user can **read** or **delete** RSVPs, and since sign-ups are turned off,
  that's only the admin account.

Never put the `service_role` / secret key in this repo.

## Good to know

- Supabase pauses free projects after about a week with no activity. If the admin page stops
  loading, open the Supabase dashboard and click **Restore project**. Opening the invite or
  admin page every few days keeps it awake.
- Want a custom domain like `diwali.yourname.com`? Settings → Pages → Custom domain.
- People with "reduce motion" turned on in their phone settings get a calmer version
  (fewer fireworks, no falling petals).

Shubh Deepavali! 🪔✨
