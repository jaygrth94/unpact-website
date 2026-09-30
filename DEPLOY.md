# Deploying the Unpact site

The site is static and needs no build step. Its source and publishing repository
are separate:

- Source: [`jaygrth94/unpact`](https://github.com/jaygrth94/unpact), branch `main`,
  directory `website/`.
- Published files: [`jaygrth94/unpact-website`](https://github.com/jaygrth94/unpact-website),
  branch `main`, repository root. GitHub Pages serves this repository at
  [www.unpact.app](https://www.unpact.app/).

Pushing the source repository alone does not publish the website.

## Publishing an update

1. Run the applicable checks below, review the website diff, then commit and push
   the intended website changes to `jaygrth94/unpact` on `main`. Preserve unrelated
   local app changes.
2. Clone `jaygrth94/unpact-website` into a separate, clean directory and check out
   its current `main` branch. Keep deployment work isolated from the app checkout.
3. Copy the tracked contents of `website/` from the source commit into the
   publishing repository's root. An export such as `git archive <commit>:website`
   keeps untracked files and local artifacts out of the upload. Preserve the
   publishing repository's `.git`, `CNAME`, and `.nojekyll` files. Remove obsolete
   site files when the source commit deletes them; inspect the resulting diff
   before committing.
4. Commit the publishing changes with the source commit recorded in the message,
   then push `jaygrth94/unpact-website` on `main`.
5. Watch that repository's GitHub Pages deployment in
   [Actions](https://github.com/jaygrth94/unpact-website/actions) until it succeeds.
6. Fetch [the public homepage](https://www.unpact.app/) and the changed pages and
   assets. Verify that their content matches the published update, including demo
   media and download links where affected. A successful push alone is not proof
   that the public site has updated.

## Before going live

- [ ] Run `node scripts/sync-demo-media.mjs --check` from this directory. Native
      recordings and provenance are described in `assets/demo/README.md`;
      pending recordings retain text examples instead of broken video players.
- [ ] Run `node verify-responsive.mjs` from this directory.
- [ ] Run `node --test scripts/demo-media.test.mjs` when changing demo media or
      its playback and synchronization behavior.
- [ ] Replace [YOUR STATE] in terms.html with your state (governing law).
- [ ] Set up support@unpact.app forwarding (pages reference it).
- [ ] Verify the Windows and Android release download URLs.
- [ ] Confirm current iPhone availability before changing its neutral contact link.
- [ ] Verify changed feature claims against the released build capability matrix
      in `CAPABILITIES.md`.
- [ ] Replace product illustrations with sanitized current screenshots when available.
- [ ] Publish the authenticated browser portal separately; do not place it inside
      this public marketing-site directory.

## Store submission URLs (what goes where)

- Privacy Policy URL (Apple + Google): https://unpact.app/privacy.html
- Terms/EULA link (Apple paywall + listing): https://unpact.app/terms.html
- Account deletion URL (Google Play data form): https://unpact.app/delete-account.html
- Support URL (App Store Connect): https://unpact.app
- Marketing URL (optional): https://unpact.app
