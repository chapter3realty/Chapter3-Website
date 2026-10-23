/**
 * HTML for the listing search (contract v1). The CRM sends raw JSON; every word,
 * number format and layout is made here. Everything from the CRM is untrusted
 * text: every string goes through esc(), and only https URLs are used (§10).
 *
 * MLS display rules (§8) this file carries: the listing firm on every results card and
 * listing page, no smaller than the listing's own text (16.14); the guide-page strip cards
 * show the price only (owner's decision, 2026-10-23); source, disclaimer and "Updated"
 * on every page with listings (16.16, 16.17); our full firm name linked home
 * (16.9); a way to report a mistake (16.11); format, never change (16.13);
 * address null = town only, no street (16.5).
 */
import { SMS_CONSENT_TEXT, TERMS_TITLE, TERMS_PARAGRAPHS } from "./terms.js";

export function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const money = (n) => (typeof n === "number" && isFinite(n) ? usd.format(n) : "");
export const safeUrl = (u) => (typeof u === "string" && /^https:\/\/[^\s"'<>]+$/.test(u) ? u : null);
const num = (n) => (typeof n === "number" && isFinite(n) ? n.toLocaleString("en-US") : "");

const STATUS = { Active: "For sale", ActiveUnderContract: "Under contract", Pending: "Pending", Closed: "Sold" };
export const statusWord = (s) => STATUS[s] || "";
/** RESO words come joined ("SingleFamilyResidence"): space them, never change them. */
export const spaced = (s) => String(s ?? "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

export function headlinePrice(l) {
  if (l.status === "Closed") return typeof l.soldPrice === "number" ? `Sold for ${money(l.soldPrice)}` : "Sold";
  return money(l.listPrice);
}

export function factsLine(l) {
  const bits = [];
  if (typeof l.beds === "number") bits.push(`${l.beds} bd`);
  if (typeof l.baths === "number") bits.push(`${l.baths} ba`);
  if (typeof l.sqft === "number") bits.push(`${num(l.sqft)} sq ft`);
  if (l.propertySubType) bits.push(spaced(l.propertySubType));
  return bits.join(" · ");
}

export function addressLine(l) {
  const town = [l.city, l.state].filter(Boolean).join(", ");
  return l.address ? `${l.address}, ${town}` : town || "Grand Strand";
}

const slug = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

/** /homes/<MLS#>-<street>-<city>/, or /homes/<MLS#>/ when the address is withheld (16.5). */
export function listingPath(l) {
  const mls = String(l.mlsNumber || "").replace(/[^A-Za-z0-9]/g, "");
  const tail = l.address ? slug(`${l.address} ${l.city || ""}`) : "";
  return `/homes/${mls}${tail ? `-${tail}` : ""}/`;
}

const HEART = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.4 1.1 5 3 1.6-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>';
const TOUR = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>';

export function heartButton(l, hearted, small) {
  return `<button type="button" class="hx-heart${small ? " hx-heart-sm" : ""}" data-mls="${esc(l.mlsNumber)}" aria-pressed="${hearted ? "true" : "false"}" aria-label="Save ${esc(addressLine(l))}">${HEART}</button>`;
}
const ASK = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/></svg>';

/** Opens the tour form. interest "question" opens the same form as "Ask about this home" (§7e). */
export function tourButton(l, label, interest, cls) {
  const q = interest === "question";
  return `<button type="button" class="hx-tour${cls ? ` ${cls}` : ""}" data-mls="${esc(l.mlsNumber)}" data-addr="${esc(addressLine(l))}" data-interest="${q ? "question" : "tour"}">${q ? ASK : TOUR}<span>${esc(label || "Tour")}</span></button>`;
}

/** A results card: photo, status, price, facts, address, the listing firm, a heart and a tour button. */
export function card(l, opts = {}) {
  const photo = safeUrl(l.photo);
  const miles = typeof l.miles === "number" ? `<span class="hx-miles">${esc(l.miles)} mi</span>` : "";
  return `<article class="hx-card"><a class="hx-card-link" href="${esc(listingPath(l))}">`
    + `<div class="hx-photo">${photo ? `<img src="${esc(photo)}" alt="${esc(addressLine(l))}" width="480" height="360" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : `<div class="hx-nophoto">No photo</div>`}`
    + `<span class="hx-status">${esc(statusWord(l.status))}</span>${miles}</div>`
    + `<div class="hx-card-body"><p class="hx-price">${esc(headlinePrice(l))}</p><p class="hx-facts">${esc(factsLine(l))}</p>`
    + `<p class="hx-addr">${esc(addressLine(l))}</p><p class="hx-firm">Listed by ${esc(l.listingFirm || "the listing brokerage")}</p></div></a>`
    + `<div class="hx-actions">${heartButton(l, opts.hearted)}${tourButton(l)}</div></article>`;
}

export function grid(listings, hearts) {
  if (!listings.length) return `<p class="hx-empty">No homes match right now. New listings arrive every few minutes.</p>`;
  const h = new Set(hearts || []);
  return `<div class="hx-grid">${listings.map((l) => card(l, { hearted: h.has(l.mlsNumber) })).join("")}</div>`;
}

/**
 * A strip card on a guide page: the photo and the price, nothing else (owner, 2026-10-23:
 * the strip cards need no listing firm). The firm shows on the results cards and on the
 * listing page each card opens.
 */
export function stripCard(l, hearted) {
  const photo = safeUrl(l.photo);
  return `<div class="hx-s-card"><a class="hx-s-link" href="${esc(listingPath(l))}" draggable="false"><span class="hx-s-photo">`
    + (photo ? `<img src="${esc(photo)}" alt="${esc(addressLine(l))}" width="480" height="360" loading="lazy" decoding="async" referrerpolicy="no-referrer" draggable="false">` : "")
    + `<span class="hx-s-chip"><b>${esc(headlinePrice(l))}</b></span></span></a>`
    + `${heartButton(l, hearted, true)}</div>`;
}

const tz = (iso, o) => {
  try { return new Date(iso).toLocaleString("en-US", { timeZone: "America/New_York", ...o }); } catch { return ""; }
};
export const updatedLine = (iso) => (iso ? `Updated ${tz(iso, { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })} ET.` : "");
export const dayLong = (ymd) => (/^\d{4}-\d{2}-\d{2}$/.test(ymd || "") ? tz(`${ymd}T12:00:00Z`, { month: "long", day: "numeric", year: "numeric" }) : "");

/** The block every page with listings carries (16.9, 16.11, 16.16, 16.17), and Equal Housing. */
export function disclaimer(meta) {
  const m = meta || {};
  return `<aside class="hx-disclaimer" aria-label="Listing data notice">`
    + `<p>${esc(updatedLine(m.refreshedAt))} Source: ${esc(m.source || "Coastal Carolinas Association of REALTORS® Multiple Listing Service (CCMLS)")}.</p>`
    + (m.disclaimer ? `<p>${esc(m.disclaimer)}</p>` : "")
    + `<p><a href="/">Chapter3 Realty, Corp.</a>, Myrtle Beach, SC. (854) 333-2135. See something wrong in a listing? <a href="mailto:hello@chapter3realty.com?subject=Listing%20error">Email us</a>. <a href="/fair-housing/">Equal Housing Opportunity</a>. <a href="/homes/terms/">Listing search terms</a>.</p></aside>`;
}

/** The free sign-up: name, email and phone; the terms box unticked and required; texts optional. */
export function signupDialog(siteKey) {
  return `<dialog id="hx-signup" class="hx-dialog" aria-labelledby="hx-signup-title">
<form id="hx-signup-form" novalidate>
<button type="button" class="hx-x" data-hx-close aria-label="Close">&times;</button>
<h2 id="hx-signup-title">See every photo and the full details</h2>
<p class="hx-small">Free. Sign up once to see every photo, the description, HOA fees, taxes, days on market and recent sales, and to save homes.</p>
<div class="hx-row2"><label>First name<input name="firstName" autocomplete="given-name" required maxlength="80"></label><label>Last name<input name="lastName" autocomplete="family-name" required maxlength="80"></label></div>
<label>Email<input name="email" type="email" autocomplete="email" required maxlength="200"></label>
<label>Phone<input name="phone" type="tel" autocomplete="tel" required maxlength="40"></label>
<input name="website" class="hx-hp" tabindex="-1" autocomplete="off" aria-hidden="true" value="">
<label class="hx-check"><input type="checkbox" name="termsAccepted"><span>I agree to the <a href="/homes/terms/" target="_blank" rel="noopener">listing search terms of use</a>.</span></label>
<details class="hx-terms"><summary>Read the terms here</summary><h3>${esc(TERMS_TITLE)}</h3>${TERMS_PARAGRAPHS.map((p) => `<p>${esc(p)}</p>`).join("")}</details>
<label class="hx-check"><input type="checkbox" name="smsConsent"><span>Optional. ${esc(SMS_CONSENT_TEXT)}</span></label>
${siteKey ? `<div class="cf-turnstile" data-sitekey="${esc(siteKey)}"></div>` : ""}
<p class="hx-error" role="alert" hidden></p>
<button class="btn btn-brass" type="submit" disabled>See full details</button>
</form></dialog>`;
}

/** "Tour this home": an ordinary lead form, straight to the CRM's /api/forms/lead (§7e). */
export function tourDialog() {
  return `<dialog id="hx-tourd" class="hx-dialog" aria-labelledby="hx-tour-title">
<form id="hx-tour-form" novalidate>
<button type="button" class="hx-x" data-hx-close aria-label="Close">&times;</button>
<h2 id="hx-tour-title">Tour this home</h2>
<p class="hx-small" id="hx-tour-addr"></p>
<label>Name<input name="name" autocomplete="name" required maxlength="120"></label>
<label>Phone<input name="phone" type="tel" autocomplete="tel" required maxlength="40"></label>
<label>Email<input name="email" type="email" autocomplete="email" required maxlength="200"></label>
<label><span id="hx-tour-msg-label">Anything we should know? (optional)</span><textarea name="message" rows="3" maxlength="1000"></textarea></label>
<label class="hx-check form-consent"><input type="checkbox" name="consent"><span>${esc(SMS_CONSENT_TEXT)}</span></label>
<input name="website" class="hx-hp" tabindex="-1" autocomplete="off" aria-hidden="true" value="">
<p class="hx-error" role="alert" hidden></p>
<button class="btn btn-brass" type="submit">Request a tour</button>
</form></dialog>`;
}

/** After 5 seconds on a listing page: a small card, bottom right, offering more information or a tour. */
export function listingToast(l) {
  return `<div class="hx-toast" id="hx-toast" role="complementary" aria-label="Questions about this home" hidden>
<button type="button" class="hx-x" data-hx-toast-close aria-label="Close">&times;</button>
<p class="hx-toast-t">Want more information or a tour?</p>
<p class="hx-toast-s">A Chapter3 agent can answer your questions about this home or set up a showing.</p>
<div class="hx-toast-b">${tourButton(l, "Tour this home", "tour", "hx-primary")}${tourButton(l, "Ask a question", "question")}</div></div>`;
}

const I = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${d}</svg>`;
export const ICONS = {
  bed: I('<path d="M3 18V7"/><path d="M3 14h18v4"/><path d="M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/>'),
  bath: I('<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M6 12V6a2 2 0 0 1 3.5-1.3"/><path d="M7 19l-1 2M17 19l1 2"/>'),
  area: I('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h5V4M20 15h-5v5"/>'),
  lot: I('<path d="M3 20h18"/><path d="M6 20v-6l4-3 4 3v6"/><path d="M17 20v-4a2 2 0 1 1 4 0"/>'),
  year: I('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>'),
  home: I('<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/>'),
  lock: I('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  camera: I('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
};

export const STYLE = `<style>
.hx-wrap{max-width:1180px;margin:0 auto;padding:1.5rem 1.25rem 3rem;color:var(--navy)}
.hx-wrap h1{font-family:var(--serif);font-size:clamp(1.7rem,4vw,2.4rem);line-height:1.15;margin:.4rem 0 .6rem}
.hx-lead{font-size:1.02rem;line-height:1.6;max-width:760px}.hx-small{font-size:.85rem;color:var(--muted);line-height:1.5}
.hx-crumbs{font-size:.8rem;margin:.2rem 0}.hx-crumbs a{color:var(--brass)}
.hx-form{display:flex;flex-wrap:wrap;gap:.6rem .8rem;align-items:flex-end;margin:1rem 0 1.4rem;padding:.9rem 1rem;border-radius:16px;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.8);box-shadow:0 6px 18px rgba(28,32,40,.08)}
.hx-form label{display:flex;flex-direction:column;font-size:.8rem;gap:.2rem}.hx-form select,.hx-form input{padding:.45rem .5rem;border-radius:8px;border:1px solid var(--rule,#d9d2c6);background:#fff;font:inherit}
.hx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem}
.hx-card{position:relative;background:#fff;border:1px solid var(--rule,#e6dfd3);border-radius:16px;overflow:hidden;box-shadow:0 4px 14px rgba(28,32,40,.06)}
.hx-card-link{color:inherit;text-decoration:none;display:block}
.hx-photo{position:relative;aspect-ratio:4/3;background:#e8e1d6}.hx-photo img{width:100%;height:100%;object-fit:cover;display:block}
.hx-nophoto{display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:.85rem}
.hx-status,.hx-miles{position:absolute;top:.6rem;background:rgba(28,32,40,.72);color:#f4efe8;font-size:.72rem;padding:.2rem .55rem;border-radius:999px;backdrop-filter:blur(6px)}
.hx-status{left:.6rem}.hx-miles{right:3rem}
.hx-card-body{padding:.75rem .9rem .4rem}.hx-card-body p{margin:0 0 .25rem;font-size:.85rem;line-height:1.4}
.hx-price{font-size:1.15rem!important;font-weight:650}.hx-addr{color:var(--muted)}
.hx-actions{display:flex;justify-content:space-between;align-items:center;padding:.2rem .7rem .7rem}
.hx-heart{border:0;background:rgba(255,255,255,.85);border-radius:999px;width:2.2rem;height:2.2rem;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;color:#1c2028}
.hx-heart svg{fill:none;stroke:currentColor;stroke-width:1.8}.hx-heart[aria-pressed="true"] svg{fill:#c4553a;stroke:#c4553a}
.hx-tour{display:inline-flex;align-items:center;gap:.35rem;border:1px solid var(--rule,#d9d2c6);background:#fff;border-radius:999px;padding:.35rem .8rem;font:inherit;font-size:.85rem;cursor:pointer;color:var(--navy)}
.hx-pager{display:flex;gap:1rem;align-items:center;justify-content:center;margin:1.4rem 0}
.hx-signup-cta{margin:1.5rem 0;padding:1.1rem 1.2rem;border-radius:16px;background:rgba(255,255,255,.65);border:1px solid rgba(255,255,255,.85);box-shadow:0 6px 18px rgba(28,32,40,.08)}
.hx-locked{position:relative;margin:1rem 0;padding:1rem;border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.4),rgba(255,255,255,.9))}
.hx-keyfacts{display:flex;flex-wrap:wrap;gap:.4rem 1.2rem;align-items:baseline;font-size:1rem}.hx-keyfacts strong{font-size:1.6rem}
.hx-firm-line{font-size:1rem}
.hx-signout{display:inline;margin-left:.4rem}
.hx-signout button,.hx-more-photos{border:0;background:none;padding:0;font:inherit;color:var(--navy);text-decoration:underline;cursor:pointer}
button.hx-heart{border-radius:999px}
.hx-gallery{display:flex;gap:.5rem;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}.hx-gallery::-webkit-scrollbar{display:none}
.hx-gallery img{height:340px;width:auto;max-width:90vw;object-fit:cover;border-radius:12px;scroll-snap-align:start}
.hx-hero-photo img{width:100%;max-height:520px;object-fit:cover;border-radius:16px}
.hx-table{border-collapse:collapse;width:100%;max-width:760px;font-size:.92rem}.hx-table th{text-align:left;font-weight:600;padding:.4rem .6rem .4rem 0;width:40%;vertical-align:top}.hx-table td{padding:.4rem 0}.hx-table tr{border-bottom:1px solid var(--rule,#e6dfd3)}
.hx-remarks{white-space:pre-line;line-height:1.65;max-width:760px}
.hx-disclaimer{margin-top:2rem;font-size:.78rem;color:var(--muted);line-height:1.55;max-width:900px}.hx-disclaimer a{color:var(--navy)}
.hx-dialog{border:0;border-radius:18px;padding:0;max-width:30rem;width:calc(100% - 2rem);box-shadow:0 20px 60px rgba(28,32,40,.3)}.hx-dialog::backdrop{background:rgba(28,32,40,.45);backdrop-filter:blur(3px)}
.hx-dialog form{position:relative;padding:1.4rem 1.3rem 1.2rem;display:flex;flex-direction:column;gap:.6rem;max-height:90vh;overflow:auto}
.hx-dialog h2{font-family:var(--serif);font-size:1.35rem;margin:0}.hx-dialog label{display:flex;flex-direction:column;gap:.2rem;font-size:.85rem}
.hx-dialog input:not([type=checkbox]){padding:.55rem .6rem;border-radius:8px;border:1px solid var(--rule,#d9d2c6);font:inherit}
.hx-row2{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}.hx-check{flex-direction:row!important;align-items:flex-start;gap:.5rem!important;font-size:.78rem!important;line-height:1.45}
.hx-terms{font-size:.78rem;line-height:1.5}.hx-terms h3{font-size:.85rem;margin:.4rem 0}
.hx-hp{position:absolute!important;left:-9999px;width:1px;height:1px;opacity:0}
.hx-x{position:absolute;top:.5rem;right:.6rem;border:0;background:none;font-size:1.6rem;cursor:pointer;color:var(--muted)}
.hx-error{color:#a3361f;font-size:.85rem;margin:0}.hx-ok{color:#2c6b3f;font-size:.9rem}
.hx-dialog textarea{padding:.55rem .6rem;border-radius:8px;border:1px solid var(--rule,#d9d2c6);font:inherit;resize:vertical}
.hx-tour.hx-primary{background:var(--brass-ink,#91592b);border-color:var(--brass-ink,#91592b);color:#fff}
.hx-glass{background:rgba(255,255,255,.64);border:1px solid rgba(255,255,255,.85);box-shadow:0 10px 30px rgba(28,32,40,.08);backdrop-filter:blur(18px) saturate(1.3);-webkit-backdrop-filter:blur(18px) saturate(1.3)}
.hx-l-media{display:grid;gap:.6rem;margin:.7rem 0 1.4rem}
.hx-l-hero,.hx-l-tile{position:relative;border-radius:20px;overflow:hidden;background:linear-gradient(135deg,#e8e1d6,#d9cfc1)}
.hx-l-hero{aspect-ratio:4/3}.hx-l-hero img,.hx-l-tile img{width:100%;height:100%;object-fit:cover;display:block}
.hx-l-tile{display:none}.hx-l-tile.hx-blur img{filter:blur(16px) saturate(1.15);transform:scale(1.2)}
.hx-l-tilebtn{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.45rem;border:0;background:rgba(28,32,40,.30);color:#fff;font:inherit;font-weight:600;font-size:1.05rem;cursor:pointer;text-align:center;padding:1rem;text-decoration:none}
.hx-l-tilebtn svg,.hx-l-count svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8}
.hx-l-tilebtn.hx-l-ask{border-radius:0;border:0;background:rgba(255,255,255,.58);color:var(--navy);font-size:1.05rem}
.hx-l-tilebtn small{font-weight:500;font-size:.85rem;opacity:.9}.hx-l-tile.hx-soft img{filter:blur(22px) saturate(1.1);transform:scale(1.3);object-position:20% 80%}
.hx-l-chip{position:absolute;top:.8rem;left:.8rem;padding:.3rem .75rem;border-radius:999px;font-size:.85rem;font-weight:600;color:#fff;background:rgba(28,32,40,.45);border:1px solid rgba(255,255,255,.35);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.hx-l-count{position:absolute;right:.8rem;bottom:.8rem;display:inline-flex;align-items:center;gap:.4rem;padding:.45rem .85rem;border-radius:999px;border:1px solid rgba(255,255,255,.4);background:rgba(28,32,40,.5);color:#fff;font:inherit;font-size:.9rem;font-weight:600;cursor:pointer;text-decoration:none;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.hx-l-hero .hx-heart{position:absolute;top:.8rem;right:.8rem}
@media (min-width:900px){.hx-l-media{grid-template-columns:2fr 1fr;grid-template-rows:1fr 1fr;height:min(64vh,540px)}.hx-l-hero{grid-row:1/3;aspect-ratio:auto}.hx-l-tile{display:block}.hx-l-media.hx-one{grid-template-columns:1fr}.hx-l-media.hx-one .hx-l-hero{grid-row:auto}}
.hx-l-grid{display:grid;gap:1.6rem}@media (min-width:900px){.hx-l-grid{grid-template-columns:minmax(0,1fr) 330px;gap:2.6rem}}
.hx-l-price{font-family:var(--serif);font-size:clamp(2rem,5vw,2.9rem);font-weight:600;line-height:1.05;margin:0;letter-spacing:-.01em}
.hx-wrap h1.hx-l-addr{font-family:var(--sans);font-size:1.15rem;font-weight:500;line-height:1.4;margin:.35rem 0 .9rem;color:var(--slate,#5c6b78)}
.hx-pills{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 .9rem;padding:0;list-style:none}
.hx-pill{display:inline-flex;align-items:center;gap:.45rem;padding:.5rem .85rem;border-radius:999px;background:#fff;border:1px solid var(--rule,#e6dfd3);font-size:1rem}
.hx-pill svg,.hx-fact svg,.hx-teaser svg{width:18px;height:18px;flex:none;fill:none;stroke:var(--brass-ink,#91592b);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.hx-facts-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem;margin:1.3rem 0}@media (min-width:600px){.hx-facts-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
.hx-fact{padding:.85rem .95rem;border-radius:16px}.hx-fact span{display:block;font-size:.75rem;letter-spacing:.06em;text-transform:uppercase;color:var(--slate,#5c6b78)}.hx-fact b{display:block;font-size:1.05rem;font-weight:600;margin-top:.15rem;overflow-wrap:anywhere}
.hx-side{position:sticky;top:9rem;align-self:start;padding:1.3rem;border-radius:22px;display:flex;flex-direction:column;gap:.7rem}
.hx-side .hx-l-price{font-size:1.9rem}.hx-side p{margin:0}
.hx-side .hx-tour{justify-content:center;padding:.75rem 1rem;font-size:1rem;font-weight:600}
.hx-side-row{display:flex;align-items:center;gap:.6rem;font-size:.9rem;color:var(--slate,#5c6b78)}.hx-side-row .hx-heart{border:1px solid var(--rule,#e6dfd3)}
.hx-teaser{margin:1.6rem 0;padding:1.3rem 1.3rem 1.1rem;border-radius:22px}
.hx-teaser h2{font-family:var(--serif);font-size:1.35rem;margin:0 0 .3rem}.hx-teaser ul{list-style:none;margin:.6rem 0 1rem;padding:0}
.hx-teaser li{display:flex;align-items:center;gap:.6rem;padding:.7rem 0;border-bottom:1px solid var(--rule,#e6dfd3);font-size:1rem}
.hx-teaser li em{margin-left:auto;display:inline-block;width:6.5rem;height:.8rem;border-radius:6px;background:linear-gradient(90deg,#d9cfc1,#efe8dd);filter:blur(1.5px)}
.hx-wrap h2{font-family:var(--serif);font-size:1.45rem;margin:2rem 0 .6rem}
.hx-gallery img{height:360px}
.hx-toast{position:fixed;right:1rem;bottom:1rem;z-index:60;width:min(23rem,calc(100% - 2rem));padding:1.05rem 1.1rem 1rem;border-radius:20px;background:rgba(255,255,255,.78);border:1px solid rgba(255,255,255,.9);box-shadow:0 18px 50px rgba(28,32,40,.22);backdrop-filter:blur(18px) saturate(1.3);-webkit-backdrop-filter:blur(18px) saturate(1.3);transform:translateY(16px);opacity:0;transition:transform .45s ease,opacity .45s ease}
.hx-toast.hx-in{transform:none;opacity:1}.hx-toast p{margin:0}.hx-toast-t{font-family:var(--serif);font-size:1.15rem;font-weight:600;padding-right:1.6rem}.hx-toast-s{font-size:.88rem;color:var(--slate,#5c6b78);margin:.25rem 0 .75rem!important;line-height:1.45}
.hx-toast-b{display:flex;gap:.5rem;flex-wrap:wrap}.hx-toast .hx-x{top:.35rem;right:.5rem}
@media (max-width:600px){.hx-toast{left:.75rem;right:.75rem;bottom:.75rem;width:auto;padding:.7rem .8rem .75rem;border-radius:16px}.hx-toast-t{font-size:1rem}.hx-toast-s{display:none}.hx-toast-b{margin-top:.5rem}.hx-toast .hx-tour{padding:.4rem .75rem;font-size:.85rem}}
@media (prefers-reduced-motion:reduce){.hx-toast{transition:opacity .2s;transform:none}}
@media (prefers-reduced-transparency:reduce){.hx-glass,.hx-toast{backdrop-filter:none;-webkit-backdrop-filter:none;background:#fff}}
</style>`;

/* The strip on a guide page: one row that pans sideways, no scroll bar; drag with a mouse,
   swipe on a phone. Glass price chip; the firm under the price at the same size (16.14). */
export const STRIP_STYLE = `<style>
main#main .hx-strip:empty{display:none}main#main .hx-strip:not(:empty)+.hx-fallback{display:none}
main#main .hx-strip{margin:1.2rem 0 .4rem;max-width:760px;position:relative}
main#main .hx-s-head{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;margin:0 0 .55rem;font-size:.95rem;color:var(--navy)}
main#main .hx-s-head a{color:var(--brass);font-size:.9rem;white-space:nowrap}
.hx-s-note{margin:-.3rem 0 .55rem;font-size:.85rem;color:var(--muted,#5a5f6a)}
main#main .hx-s-row{display:flex;align-items:flex-start;gap:.75rem;overflow-x:auto;scroll-behavior:auto;scroll-snap-type:x proximity;padding:.15rem .15rem .6rem;margin:0 -.15rem;scrollbar-width:none;-ms-overflow-style:none;cursor:grab;user-select:none;-webkit-user-select:none}
main#main .hx-s-row::-webkit-scrollbar{display:none}main#main .hx-s-row.hx-dragging{cursor:grabbing;scroll-snap-type:none}
main#main .hx-s-card{position:relative;flex:0 0 62%;max-width:16rem;scroll-snap-align:start;border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(28,32,40,.10)}
@media (min-width:700px){main#main .hx-s-card{flex-basis:24%}}
main#main .hx-s-link{display:block;color:inherit;text-decoration:none}
main#main .hx-s-photo{position:relative;display:block;aspect-ratio:4/3;background:linear-gradient(135deg,#e8e1d6,#d9cfc1)}
main#main .hx-s-photo img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
main#main .hx-s-chip{position:absolute;left:.5rem;right:.5rem;bottom:.5rem;display:flex;flex-direction:column;padding:.35rem .65rem;border-radius:12px;font-size:.95rem;line-height:1.3;color:#fff;background:rgba(28,32,40,.42);border:1px solid rgba(255,255,255,.3);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
main#main .hx-s-chip b{font-weight:700}main#main .hx-s-chip span{font-weight:400;opacity:.95;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
main#main .hx-heart-sm{position:absolute;top:.5rem;right:.5rem;width:2rem;height:2rem}
main#main .hx-s-all{flex:0 0 40%;max-width:12rem;align-self:stretch;display:flex;align-items:center;justify-content:center;text-align:center;padding:1rem;border-radius:16px;font-weight:600;color:var(--navy);background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.75);text-decoration:none}
@media (min-width:700px){main#main .hx-s-all{flex-basis:18%}}
@media (prefers-reduced-transparency:reduce){main#main .hx-s-chip{backdrop-filter:none;-webkit-backdrop-filter:none;background:#1c2028}}
</style>`;

/**
 * The page script. It touches only our own elements; nothing from the CRM is ever
 * written with innerHTML. data-hx-signed on <body> says whether the visitor is signed up.
 */
export const SCRIPT = `<script>(function(){
var signed=document.body.getAttribute("data-hx-signed")==="1";
function $(s,r){return (r||document).querySelector(s)}function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function post(u,b){return fetch(u,{method:"POST",headers:{"content-type":"application/json"},credentials:"same-origin",body:JSON.stringify(b)}).then(function(r){return r.json().catch(function(){return{}}).then(function(j){j._status=r.status;return j})})}
function openD(d){if(!d)return;if(d.showModal)d.showModal();else d.setAttribute("open","")}
$$("[data-hx-close]").forEach(function(b){b.addEventListener("click",function(){var d=b.closest("dialog");if(d)d.close()})});
/* Pan the strips with a mouse; a phone swipes them natively. A drag never opens a card. */
$$(".hx-s-row").forEach(function(row){var down=false,moved=false,x0=0,s0=0;
 row.addEventListener("pointerdown",function(e){if(e.pointerType!=="mouse")return;down=true;moved=false;x0=e.clientX;s0=row.scrollLeft});
 row.addEventListener("pointermove",function(e){if(!down)return;var dx=e.clientX-x0;if(Math.abs(dx)>4){moved=true;row.classList.add("hx-dragging")}row.scrollTo({left:s0-dx,behavior:"instant"})});
 function up(){down=false;setTimeout(function(){row.classList.remove("hx-dragging")},0)}
 row.addEventListener("pointerup",up);row.addEventListener("pointerleave",up);
 row.addEventListener("click",function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false}},true)});
/* Sign-up */
var sd=$("#hx-signup"),sf=$("#hx-signup-form");var tsLoaded=false;
function askSignup(pending){if(pending)try{sessionStorage.setItem("c3_idx_heart",pending)}catch(e){}
 if(!tsLoaded&&$(".cf-turnstile",sd)){tsLoaded=true;var s=document.createElement("script");s.src="https://challenges.cloudflare.com/turnstile/v0/api.js";s.async=true;document.head.appendChild(s)}openD(sd)}
$$("[data-hx-signup]").forEach(function(b){b.addEventListener("click",function(){askSignup()})});
if(sf){var tb=sf.elements.termsAccepted,sb=sf.querySelector("button[type=submit]");tb.addEventListener("change",function(){sb.disabled=!tb.checked});
 sf.addEventListener("submit",function(e){e.preventDefault();var err=sf.querySelector(".hx-error");err.hidden=true;sb.disabled=true;
  var prior=[];try{prior=JSON.parse(localStorage.getItem("c3_idx_prior")||"[]")}catch(x){}
  var t=sf.querySelector("[name=cf-turnstile-response]");
  post("/homes/api/register",{firstName:sf.elements.firstName.value,lastName:sf.elements.lastName.value,email:sf.elements.email.value,phone:sf.elements.phone.value,
   termsAccepted:tb.checked,smsConsent:sf.elements.smsConsent.checked,website:sf.elements.website.value,page:location.pathname,priorViews:prior,turnstileToken:t?t.value:""})
  .then(function(j){if(j.ok){try{localStorage.removeItem("c3_idx_prior")}catch(x){}var h=null;try{h=sessionStorage.getItem("c3_idx_heart");sessionStorage.removeItem("c3_idx_heart")}catch(x){}
    return (h?post("/homes/api/hearts",{mlsNumber:h,loved:true}):Promise.resolve()).then(function(){location.reload()})}
   err.textContent=j.message||"Please check the form and try again.";err.hidden=false;sb.disabled=!tb.checked;if(window.turnstile)try{turnstile.reset()}catch(x){}})
  .catch(function(){err.textContent="Sign-up is unavailable right now. Please call (854) 333-2135.";err.hidden=false;sb.disabled=!tb.checked})})}
/* Hearts */
$$(".hx-heart").forEach(function(b){b.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();var m=b.getAttribute("data-mls");
 if(!signed){askSignup(m);return}var on=b.getAttribute("aria-pressed")!=="true";b.setAttribute("aria-pressed",on?"true":"false");
 post("/homes/api/hearts",{mlsNumber:m,loved:on}).then(function(j){if(j._status===401){location.reload()}})})});
/* Tour this home: the site's ordinary lead form, with the home's MLS number. */
var td=$("#hx-tourd"),tf=$("#hx-tour-form"),tm=null,ta="",ti="tour";
function hideToast(){var t=$("#hx-toast");if(t){t.classList.remove("hx-in");t.hidden=true}}
$$(".hx-tour[data-mls]").forEach(function(b){b.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();tm=b.getAttribute("data-mls");ta=b.getAttribute("data-addr")||"";ti=b.getAttribute("data-interest")==="question"?"question":"tour";
 var a=$("#hx-tour-addr");if(a)a.textContent=ta;var h=$("#hx-tour-title");if(h)h.textContent=ti==="question"?"Ask about this home":"Tour this home";
 var l=$("#hx-tour-msg-label");if(l)l.textContent=ti==="question"?"Your question":"Anything we should know? (optional)";
 var s=tf&&tf.querySelector("button[type=submit]");if(s)s.textContent=ti==="question"?"Send my question":"Request a tour";hideToast();openD(td)})});
if(tf){tf.addEventListener("submit",function(e){e.preventDefault();var err=tf.querySelector(".hx-error");err.hidden=true;
 if(!tf.elements.consent.checked){err.textContent="Please tick the box so an agent can reach you about the tour.";err.hidden=false;return}
 var ct=(tf.querySelector(".form-consent span").textContent||"").replace(/\\s+/g," ").trim();
 fetch("https://app.chapter3realty.com/api/forms/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({formType:"contact",name:tf.elements.name.value,phone:tf.elements.phone.value,email:tf.elements.email.value,
  consent:true,consentText:ct,website:tf.elements.website.value,page:location.pathname,formName:ti==="question"?"Ask about this home":"Tour this home",interest:ti,mls_number:tm,
  message:(ti==="question"?"Question about ":"I'd like to tour ")+ta+(tf.elements.message.value.trim()?": "+tf.elements.message.value.trim().slice(0,1000):"")})})
 .then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(r.ok&&j.ok){tf.innerHTML="";var p=document.createElement("p");p.className="hx-ok";p.textContent=ti==="question"?"Thank you. An agent will answer your question soon.":"Thank you. An agent will contact you to set up the tour.";tf.appendChild(p);try{sessionStorage.setItem("c3_toast_off","1")}catch(x){}}
  else{err.textContent="Please check your name, phone and email.";err.hidden=false}})}).catch(function(){err.textContent="Please call (854) 333-2135 and we will set up the tour.";err.hidden=false})})}
/* After 5 seconds on a listing page: the small card bottom right, once a visit, never over an open form. */
var toast=$("#hx-toast");if(toast){var off=false;try{off=sessionStorage.getItem("c3_toast_off")==="1"}catch(x){}
 var tc=toast.querySelector("[data-hx-toast-close]");if(tc)tc.addEventListener("click",function(){hideToast();try{sessionStorage.setItem("c3_toast_off","1")}catch(x){}});
 if(!off)setTimeout(function(){if(document.querySelector("dialog[open]"))return;toast.hidden=false;requestAnimationFrame(function(){requestAnimationFrame(function(){toast.classList.add("hx-in")})})},5000)}
/* Seconds on a listing page (contract 7c, 7d). */
var main=$("[data-hx-mls]");if(main){var vid=main.getAttribute("data-view-id"),mls=main.getAttribute("data-hx-mls"),secs=0,since=document.visibilityState==="visible"?Date.now():null;
 function total(){return Math.min(3600,Math.floor(secs+(since?(Date.now()-since)/1000:0)))}
 function send(){if(vid){try{fetch("/homes/api/views",{method:"POST",keepalive:true,credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({viewId:vid,seconds:total()})})}catch(x){}}
  else if(!signed){try{var L=JSON.parse(localStorage.getItem("c3_idx_prior")||"[]").filter(function(x){return x&&x.mlsNumber!==mls&&Date.now()-Date.parse(x.viewedAt)<2592e6});
   L.unshift({mlsNumber:mls,seconds:total(),viewedAt:new Date().toISOString()});localStorage.setItem("c3_idx_prior",JSON.stringify(L.slice(0,20)))}catch(x){}}}
 document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden"){secs=total();since=null;send()}else since=Date.now()});
 addEventListener("pagehide",send);setInterval(function(){if(since)send()},60000)}
})();</script>`;
