# Deploying the Unpact site

Static site — no build step. Any static host works. Recommended: Cloudflare Pages
(free, fast, and gives you free email forwarding for support@unpact.app on the
same dashboard).

## Option A: Cloudflare Pages (recommended)

1. Buy the domain (e.g. unpact.app) — can be done at Cloudflare Registrar directly.
2. dash.cloudflare.com → Workers & Pages → Create → Pages → Upload assets
   (drag the contents of this `website/` folder), or connect the GitHub repo
   with `website` as the root directory.
3. Custom domains → add unpact.app.
4. Email Routing (in the domain's dashboard) → create address
   support@unpact.app → forward to your Gmail. Free.

## Option B: GitHub Pages

1. Push this repo to GitHub.
2. Repo → Settings → Pages → deploy from branch, folder `/website`
   (or copy these files to a separate repo's root).
3. Add the custom domain in the Pages settings and set the DNS records it shows
   at your registrar.
4. For support@unpact.app forwarding, use your registrar's email forwarding or
   an external service (Cloudflare Email Routing works even if hosting is on
   GitHub Pages, if DNS is on Cloudflare).

## Before going live

- [ ] Replace [YOUR STATE] in terms.html with your state (governing law).
- [ ] Set up support@unpact.app forwarding (pages reference it).
- [ ] When store listings go live: swap the hero badges in index.html for real
      App Store / Google Play badge links.
- [ ] Optionally replace the CSS phone mock with a real screenshot once the UI
      is final.

## Store submission URLs (what goes where)

- Privacy Policy URL (Apple + Google): https://unpact.app/privacy.html
- Terms/EULA link (Apple paywall + listing): https://unpact.app/terms.html
- Account deletion URL (Google Play data form): https://unpact.app/delete-account.html
- Support URL (App Store Connect): https://unpact.app
- Marketing URL (optional): https://unpact.app
