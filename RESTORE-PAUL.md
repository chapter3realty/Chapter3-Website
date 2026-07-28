# Restoring Paul Hankins

Paul was removed on 2026-07-28 in commit `4e139f2`. He is expected back. This
file is the map so putting him back is mechanical instead of archaeology.

**The fastest route:** `git show 4e139f2` is the complete removal diff. Every
block below came out of `4e139f2^` (the commit immediately before).

Do **not** `git revert 4e139f2`. That commit also fixed `.team-grid`, which had
a hard-coded `repeat(4,1fr)`. The current `auto-fit` value is correct for three
people *and* four, so it must survive. Restore the four blocks by hand instead.

---

## The four places he appeared

There were four, not the three an initial pass found. The fourth has no leading
comma so a regex written for the array entry silently misses it. Check all four.

### 1. Employee array entry — **69 pages**

Inside the `RealEstateAgent` block with `"@id": "…/#org"`, at the END of the
`"employee"` array, immediately after Abdulla Hijazi:

```json
, {"@type": "Person", "name": "Paul Hankins", "jobTitle": "Legal Officer", "image": "https://chapter3realty.com/team/paul.jpg", "url": "https://chapter3realty.com/about/"}
```

Insert before the closing `]` of `"employee"`. Every indexable page carries this
block, so this is a 69-file edit. Validate that every JSON-LD block still parses
afterwards.

### 2. Standalone Person block — **`/about/` only**

Its own `<script>`, sitting after the Abdulla Person block and before
`<style id="c3-nohscroll">`:

```html
<script type="application/ld+json">{"@context": "https://schema.org", "@type": "Person", "@id": "https://chapter3realty.com/about/#paul-hankins", "name": "Paul Hankins", "jobTitle": "Legal Officer", "description": "Legal Officer, and owner of BrickWood Mortgage, NMLS 281393.", "worksFor": {"@id": "https://chapter3realty.com/#org"}, "url": "https://chapter3realty.com/about/", "image": "https://chapter3realty.com/team/paul.jpg"}</script>
```

`/about/` had 9 JSON-LD blocks before removal and has 8 now. That count is the
quickest check that this one is back.

### 3. Team card — **`/` and `/about/`**

Last card in `.team-grid`, after Timmy Fredrick Nash:

```html
<div class="team-card">
<img class="team-photo" src="/team/paul.jpg" alt="Paul Hankins, Legal Officer at Chapter3 Realty" width="104" height="124" loading="lazy" style="width:104px;height:124px;object-fit:cover;object-position:center top;border-radius:6px;margin-bottom:.75rem;display:block">
<h3 class="team-name">Paul Hankins</h3>
<p class="team-role">Legal Officer</p>
<p class="team-bio">Legal Officer. Paul brings more than 20 years in mortgage lending and oversees how we handle contracts, disclosures and compliance, which matters in a market full of out-of-state purchases and complex condo deals.</p>
</div>
```

The photo `chapter3realty/team/paul.jpg` was never deleted, so the `src` will
resolve the moment the card returns.

### 4. Bio paragraph — **`/about/` only**

In the leadership prose, directly after the Timmy Fredrick Nash paragraph:

```html
<p style="color:var(--muted);line-height:1.75;max-width:720px;margin-bottom:1rem"><strong style="color:var(--navy)">Paul Hankins</strong>, owner of <a href="https://brickwoodmortgage.com/" target="_blank" rel="noopener noreferrer" style="color:var(--brass);font-weight:600;text-decoration:none">BrickWood Mortgage</a>. More than 20 years in mortgage lending. NMLS 281393.</p>
```

---

## Things that are NOT part of this

- **The RESPA AfBA disclosure never mentioned Paul.** It names Chapter3 Realty
  Corp and BrickWood Mortgage NMLS #189497. All 73 disclosures were untouched by
  the removal and need nothing on restore.
- **`.team-grid` needs no change.** `auto-fit` already handles four cards.
- **Do not reinstate the old bio wording about contract review.** The owner
  specifically asked that we not claim Paul reviews every contract. The wording
  above is the corrected version and is safe to restore verbatim.

## After restoring

```
node build.js dates        # /about/ and / changed visibly, so their dates move
node build.js llmsfull
node build.js preflight    # must exit 0
```

Then measure the rendered team grid, do not just read the HTML: four cards, none
0x0, no trailing gap at 1280px, stacked with no sideways scroll at 375px.
