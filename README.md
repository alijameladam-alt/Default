# The Fokal Edit

The Fokal Studios DaVinci Resolve training course. It teaches the studio's exact
Resolve workflow and house style through short embedded videos. It is for anyone
brought on to edit at Fokal, in-house or freelance, now or later.

The whole course is one self-contained static file: **`index.html`**. There is no
build step, no framework, no npm, and no server. Open the file in a browser and it
works. The only external thing it loads is Google Fonts.

The site is public. There is no login or password.

---

## How the course is maintained

All course content lives in a single, clearly commented data object called `COURSE`
at the **bottom of `index.html`**, inside the `<script>` tag. That block is the only
thing you edit to maintain the course. Layout, styling and logic sit above it and you
never need to touch them.

The maintenance loop is one step:

1. Add or update lessons and embed codes in the `COURSE` block.
2. Save.
3. Redeploy (see below).

That's it. Adding a lesson is a copy-one-block operation.

---

## How to add a lesson

1. Open `index.html` and scroll to the `COURSE` block at the bottom of the script.
2. Find the module you want the lesson in (each is `{ id, title, lessons: [...] }`).
3. Copy an existing lesson block and paste it into that module's `lessons` array.
4. Edit the fields:

```js
{
  id: "unique-tag",     // short, no spaces, unique across the whole course
  title: "Shown in menu and heading",
  embed: ``,            // paste the full embed code between the backticks
  studioOnly: false,    // true shows the Studio badge and a marker in the menu
  notes: ""             // optional. \n = new line, "- " at the start of a line = a bullet
}
```

Lessons appear in the menu in the same order they sit in the array.

---

## How to add a module

1. In the `COURSE` block, copy an existing module:

```js
{
  id: "module-tag",
  title: "Module title",
  lessons: [
    { id: "first-lesson", title: "First lesson", embed: ``, studioOnly: false, notes: "" }
  ]
}
```

2. Paste it into the `modules` array where you want it to appear.
3. Give it a unique `id` and a title, and add its lessons.

Module numbers (01, 02, 03 ...) are generated automatically from the order of the
`modules` array. You never type a number.

---

## How to paste an embed code correctly

Each lesson holds a **full embed code**, not a video ID. This is host-agnostic, so
YouTube, Vimeo, Wistia, Loom or anything else works the same way.

1. In the video host, choose **Embed** (not "share link") and copy the whole snippet
   it gives you. That is usually a full `<iframe ...></iframe>`, but some hosts
   (Wistia, Loom) give a `<div>` plus a `<script>`. Copy all of it.
2. Paste it **between the backticks** of the lesson's `embed` field:

```js
embed: `<iframe src="https://player.vimeo.com/video/123456789" width="640" height="360" frameborder="0" allowfullscreen></iframe>`,
```

Why backticks: the embed code contains lots of double quotes. Backticks (template
strings) let those quotes live inside the value without breaking it. Always keep the
embed inside the backticks.

You do not need to change the embed's own `width` and `height`. The player drops the
embed into a fixed 16:9 frame and forces whatever you paste to fill it.

Leave `embed` empty (just two backticks: `` `` ``) until the video exists. An empty
embed shows a tidy "no video linked yet" state that names the lesson and the field to
edit, so nothing looks broken.

---

## Notes formatting

The optional `notes` field is plain text with two conveniences:

- `\n` starts a new line.
- A line beginning with `- ` becomes a bullet point.

Example:

```js
notes: "Set the timeline to 1080x1920 for vertical.\n- Use 30 fps for social.\n- Keep handles on every clip."
```

---

## How to redeploy

The site is hosted on Netlify as a static site.

**If your Netlify site is connected to this Git repository (recommended):**
commit and push your change to the deploy branch and Netlify rebuilds automatically.

```bash
git add index.html
git commit -m "Add embed for <lesson>"
git push
```

**If you deploy by drag and drop:** go to your site in the Netlify dashboard, open
**Deploys**, and drag this folder (or just `index.html`) onto the deploy area.

**If you use the Netlify CLI:**

```bash
netlify deploy --prod --dir .
```

There is no build command and no publish subfolder. The site is just `index.html` at
the project root.

---

## Design and copy rules (keep these)

- Single self-contained static HTML file. No framework, build step, bundler or npm.
- All content stays in the `COURSE` block. Never move it into separate files.
- Strict monochrome only. No colour, shadows, gradients or glows.
- Two typefaces only: Playfair Display (headings) and Inter (body and UI).
- Headlines in sentence case. Eyebrows in uppercase.
- Australian English spelling. No em dashes in any visible text.
- It stays public. No login, password or access gate.

---

## Project structure

```
.
├── index.html     The entire course: layout, styles, logic, and the COURSE data block
├── README.md      This file
└── .gitignore
```
