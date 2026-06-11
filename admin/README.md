# Editing HT Mart's website content

This site has a simple admin panel at **/admin** where text, images, and
videos can be edited without touching any code.

## For the content writer (no technical knowledge needed)

1. Go to `https://<your-site-domain>/admin/`
2. Log in with the email/password you were given.
3. On the left, pick a section (e.g. "Hero Section", "Services", "Sample
   Work / Portfolio", "Testimonials", "Team", "Footer").
4. Edit the text fields, or click an image/video field to upload a new
   file from your computer.
5. Click **Save** (top right), then **Publish** if shown.
6. The live site updates automatically within a couple of minutes.

Everything you can edit lives in one place behind the scenes
(`content/site.json`) — you never need to open or understand that file
directly, the admin panel does it for you.

## One-time setup needed before this works (for the site owner)

The admin panel needs the site to be hosted on **Netlify** (free tier is
fine) with:
1. **Netlify Identity** turned on, and an account invited for the content
   writer.
2. **Git Gateway** enabled, so saves in /admin are written back to the
   `content/site.json` file in this GitHub repo and the site rebuilds.

Until that hosting step is done, /admin will load but won't be able to
log in or save changes.
