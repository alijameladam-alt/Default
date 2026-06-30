# Coconut Water — Brand Mood Board

A single-page, self-contained web mood board for a potential coconut water
brand. No build step, no frameworks — just open `index.html`.

## What's inside

- **Hero** — brand name + tagline
- **Essence** — vibe statement and mood keywords
- **Colour palette** — editable hex swatches
- **Visual texture** — a masonry photo grid (self-hosted images)
- **Motion & mood** — embedded reference videos (YouTube / Vimeo)
- **On Social** — live Instagram reel embeds (currently @h2coco)
- **Live from Pinterest** — an optional live board embed
- **Typography** — font specimens

## The hybrid approach (why it looks good *and* stays flexible)

| Content | Best method | Why |
|---|---|---|
| Photos / stills | **Self-host** in `/images` | Pixel-perfect grid, fast, full control |
| Video | **Embed** (YouTube/Vimeo iframe) | Reliable, lightweight, always current |
| Pinterest | **Embed** a live board/pin | Stays up to date automatically |
| Instagram / TikTok | **Screenshot → self-host** | Their embeds are flaky (login walls) |

## How to add your real content

### 1. Photos
Create an `images/` folder, drop your saved photos in, then in `index.html`
replace a placeholder tile:
```html
<div class="tile tile--tall ph ph--1"><span>Beach &amp; coastline</span></div>
```
with:
```html
<figure class="tile tile--tall">
  <img src="images/beach.jpg" alt="sunlit coastline" />
</figure>
```
Keep `tile--tall` / `tile--wide` to shape the layout.

### 2. Video
On YouTube: **Share → Embed → copy the iframe**, or just swap the video ID in
`https://www.youtube.com/embed/VIDEO_ID`. Vimeo works the same way.

### 3. Instagram reels
Copy a reel/post URL and add a block inside `.social-grid`:
```html
<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/REEL_ID/" data-instgrm-version="14"></blockquote>
```
Instagram's `embed.js` (already loaded) renders the full card automatically.

### 4. Pinterest
Replace the `href` in the `data-pin-do="embedBoard"` block with the brand's
real board URL. The Pinterest script renders it automatically.

## Colours
Edit the hex values in the `.swatch` blocks (`index.html`) and the `:root`
variables at the top of `styles.css`.

## Deploying a shareable link
This is static, so it works on any static host:
- **Netlify** — drag-and-drop the folder, or connect this repo
- **GitHub Pages** — enable Pages on the branch
- **Vercel / Cloudflare Pages** — point at the repo

> All imagery is placeholder until final assets are added.
