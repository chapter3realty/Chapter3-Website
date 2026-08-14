# Restoring Paul Hankins

Paul was removed on 2026-07-28 in commit `4e139f2`. He is expected back. This
file is the map so putting him back is mechanical instead of archaeology.

**The fastest route:** `git show 4e139f2` is the complete removal diff. Every
block below came out of `4e139f2^` (the commit immediately before).

Do **not** `git revert 4e139f2`. That commit also fixed `.team-grid`, which had
a hard-coded `repeat(4,1fr)`. The current `auto-fit` value is correct for three
people *and* four, so it must survive. Restore the four blocks by hand instead.

---

## The five places he appeared

The count has gone up twice. An initial pass found three; the fourth has no
leading comma, so a regex written for the array entry silently misses it. The
fifth was found two weeks later and never contained his name at all. Check all
five, and see the note at the end of 5 before assuming there is no sixth.

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

### 5. "Legal rigor" card — **`/about/` only** — removed later, 2026-08-14

Found two weeks after the removal, in commit `2dc8dd1`. It never contained the
string "Paul", which is why the original pass missed it: it described him by his
title instead of his name, so with him gone the site claimed a legal officer it
did not have.

Last card in the "Why buyers and investors trust us" grid, after "Permit
intelligence":

```html
<div style="background:var(--navy);padding:1.75rem"><div style="font-family:var(--serif);font-size:1.6rem;color:var(--brass-2);margin-bottom:.4rem">Legal rigor</div><p style="color:rgba(244,239,232,.6);font-size:.88rem;line-height:1.6">Having a dedicated legal officer on the ownership team is rare at this size, and it shapes how carefully we handle paperwork.</p></div>
```

The grid is `repeat(auto-fit,minmax(230px,1fr))`, so it took three cards and
takes four back without a change. Note the wording says "ownership team", which
is the phrasing the owner rejected elsewhere on 2026-07-30: Chapter3 does not own
BrickWood. Do not restore this card verbatim without asking him about that word.

**The lesson, which generalises past Paul:** grep for what a person *is*, not
only for their name. Titles, roles and "our in-house X" claims outlive a name
removal silently.

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
