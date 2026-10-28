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
import { SMS_CONSENT_TEXT } from "./terms.js";
import { FILTER_SCRIPT, FILTER_STYLE } from "./filters.js";

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
  const photo = safeUrl(l.photo);
  return `<button type="button" class="hx-tour${cls ? ` ${cls}` : ""}" data-mls="${esc(l.mlsNumber)}" data-addr="${esc(addressLine(l))}" data-interest="${q ? "question" : "tour"}"${photo ? ` data-photo="${esc(photo)}"` : ""}>${q ? ASK : TOUR}<span>${esc(label || "Tour")}</span></button>`;
}

/**
 * One home card everywhere a few homes are shown: results, place pages, guide-page strips
 * and "more homes" (owner's template, 2026-10-25). The photo with one tag and a heart; the
 * price; beds | baths | sq ft | status; the address; then, small, the MLS number, the listing
 * firm and the source. The tag is a fact from the card, never an opinion.
 */
export function cardTag(l) {
  // The year is read here, per request: at module scope a Worker's clock reads 1970, and
  // every home built since 1969 was tagged "Built <year>" (fixed 2026-10-26).
  const THIS_YEAR = new Date().getUTCFullYear();
  if (l.status === "ActiveUnderContract") return "Under contract";
  if (l.status === "Pending") return "Pending";
  if (l.waterfront === true) return "Waterfront";
  if (typeof l.yearBuilt === "number" && l.yearBuilt >= THIS_YEAR - 1) return `Built ${l.yearBuilt}`;
  if (typeof l.lotAcres === "number" && l.lotAcres >= 1) return `${l.lotAcres >= 10 ? Math.round(l.lotAcres) : Math.round(l.lotAcres * 10) / 10}-acre lot`;
  return "";
}

/** "0.25", "1.5", "12": a lot size for a card, or "" when the listing has none. */
export const acres = (v) => (typeof v === "number" && isFinite(v) && v > 0 ? String(v >= 10 ? Math.round(v) : Math.round(v * 100) / 100) : "");

export function card(l, opts = {}) {
  const photo = safeUrl(l.photo);
  const tag = cardTag(l);
  const miles = typeof l.miles === "number" ? `<span class="hx-c-miles">${esc(l.miles)} mi</span>` : "";
  const bits = [];
  if (typeof l.beds === "number") bits.push(`<b>${esc(l.beds)}</b> bds`);
  if (typeof l.baths === "number") bits.push(`<b>${esc(l.baths)}</b> ba`);
  if (typeof l.sqft === "number") bits.push(`<b>${esc(num(l.sqft))}</b> sqft`);
  // The lot, on every card (owner, 2026-10-28).
  if (acres(l.lotAcres)) bits.push(`<b>${esc(acres(l.lotAcres))}</b> ${l.lotAcres === 1 ? "acre" : "acres"}`);
  if (statusWord(l.status)) bits.push(esc(statusWord(l.status)));
  const addr = l.address ? `${addressLine(l)}${l.postalCode ? `, ${l.postalCode}` : ""}` : addressLine(l);
  return `<article class="hx-c"><a class="hx-c-link" href="${esc(listingPath(l))}" draggable="false"><span class="hx-c-photo">`
    + (photo ? `<img src="${esc(photo)}" alt="${esc(addressLine(l))}" width="480" height="300" loading="lazy" decoding="async" referrerpolicy="no-referrer" draggable="false">` : `<span class="hx-nophoto">No photo yet</span>`)
    + `${tag ? `<span class="hx-c-tag">${esc(tag)}</span>` : ""}${miles}</span>`
    + `<span class="hx-c-body"><span class="hx-c-price">${esc(headlinePrice(l))}</span><span class="hx-c-facts">${bits.join('<i aria-hidden="true"></i>')}</span>`
    + `<span class="hx-c-addr">${esc(addr)}</span>`
    + `<span class="hx-c-firm">MLS #${esc(l.mlsNumber)}, ${esc(l.listingFirm || "listing brokerage")}. Listing provided by CCMLS.</span></span></a>`
    + `${heartButton(l, opts.hearted, true)}</article>`;
}

export function grid(listings, hearts) {
  if (!listings.length) return `<p class="hx-empty">No homes match right now. New listings arrive every few minutes.</p>`;
  const h = new Set(hearts || []);
  return `<div class="hx-grid">${listings.map((l) => card(l, { hearted: h.has(l.mlsNumber) })).join("")}</div>`;
}

/** The same card in a strip that pans sideways (guide pages, "more homes"). */
export const stripCard = (l, hearted) => card(l, { hearted });

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
    + `<p><a href="/">Chapter3 Realty, Corp.</a>, Myrtle Beach, SC. (854) 333-2135. See something wrong in a listing? <a href="mailto:info@chapter3realty.com?subject=Listing%20error">Email us</a>. <a href="/fair-housing/">Equal Housing Opportunity</a>. <a href="/homes/terms/">Listing search terms</a>.</p></aside>`;
}

/** The free sign-up, as short as the owner's model (2026-10-26): full name, email, phone; the terms box unticked and required; texts optional. */
export function signupDialog(siteKey) {
  return `<dialog id="hx-signup" class="hx-dialog" aria-labelledby="hx-signup-title">
<form id="hx-signup-form" novalidate>
<button type="button" class="hx-x" data-hx-close aria-label="Close">&times;</button>
<h2 id="hx-signup-title" class="hx-d-center">Free access</h2>
<p class="hx-d-sub hx-d-center">Every photo and detail, on every home.</p>
<input name="name" autocomplete="name" required maxlength="160" aria-label="Full name" placeholder="Full name">
<input name="email" type="email" autocomplete="email" inputmode="email" required maxlength="200" aria-label="Email" placeholder="Email">
<input name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="40" aria-label="Phone" placeholder="Phone">
<input name="website" class="hx-hp" tabindex="-1" autocomplete="off" aria-hidden="true" value="">
<label class="hx-check"><input type="checkbox" name="termsAccepted"><span>I agree to the <a href="/homes/terms/" target="_blank" rel="noopener">listing search terms of use</a>.</span></label>
<label class="hx-check hx-check-fine"><input type="checkbox" name="smsConsent"><span>Optional. ${esc(SMS_CONSENT_TEXT)}</span></label>
${siteKey ? `<div class="cf-turnstile" data-sitekey="${esc(siteKey)}"></div>` : ""}
<p class="hx-error" role="alert" hidden></p>
<button class="btn btn-brass" type="submit" disabled>Continue to photos &rsaquo;</button>
<p class="hx-d-center"><button type="button" class="hx-linkbtn" data-hx-returning>Already have an account?</button></p>
<p class="hx-d-fine hx-d-center">Free. We never sell your information.</p>
</form>
<form id="hx-returning-form" novalidate hidden>
<button type="button" class="hx-x" data-hx-close aria-label="Close">&times;</button>
<h2 class="hx-d-center">Welcome back</h2><p class="hx-d-sub hx-d-center">Your mobile number and first name are enough.</p>
<div class="hx-row2"><label>Mobile phone<input name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="40"></label><label>First name<input name="firstName" autocomplete="given-name" required maxlength="80"></label></div>
<label class="hx-check"><input type="checkbox" name="termsAccepted"><span>I agree to the <a href="/homes/terms/" target="_blank" rel="noopener">listing search terms of use</a>.</span></label>
${siteKey ? `<div class="cf-turnstile" data-sitekey="${esc(siteKey)}"></div>` : ""}
<p class="hx-error" role="alert" hidden></p>
<button class="btn btn-brass" type="submit" disabled>Sign in</button>
<p class="hx-d-fine"><button type="button" class="hx-linkbtn" data-hx-newsignup>New here? Sign up instead</button></p>
</form></dialog>`;
}

/** Our emails' links sign a client in; when the CRM needs the terms first, this one-tap box (contract §7g). */
export function welcomeDialog(w) {
  return `<dialog id="hx-welcome" class="hx-dialog" aria-labelledby="hx-welcome-title" data-k="${esc(w.k)}">
<form id="hx-welcome-form" novalidate>
<button type="button" class="hx-x" data-hx-close aria-label="Close">&times;</button>
<div class="hx-d-head"><div><h2 id="hx-welcome-title">${esc(w.firstName ? `Welcome back, ${w.firstName}` : "Welcome back")}</h2><p class="hx-d-sub">One tap and you see every photo and detail.</p></div></div>
<label class="hx-check"><input type="checkbox" name="termsAccepted"><span>I agree to the <a href="/homes/terms/" target="_blank" rel="noopener">listing search terms of use</a>.</span></label>
<p class="hx-error" role="alert" hidden></p>
<button class="btn btn-brass" type="submit" disabled>Continue</button>
</form></dialog>`;
}

/** "Tour this home" and "Ask a question": the site's ordinary lead form, straight to the CRM's /api/forms/lead (§7e). */
export function tourDialog() {
  const day = (v) => `<label><input type="radio" name="day" value="${v}"><span>${v}</span></label>`;
  return `<dialog id="hx-tourd" class="hx-dialog" aria-labelledby="hx-tour-title">
<form id="hx-tour-form" novalidate>
<button type="button" class="hx-x" data-hx-close aria-label="Close">&times;</button>
<div class="hx-d-head"><img class="hx-d-thumb" id="hx-tour-thumb" alt="" referrerpolicy="no-referrer" hidden><div><h2 id="hx-tour-title">Tour this home</h2><p class="hx-d-sub" id="hx-tour-addr"></p></div></div>
<fieldset class="hx-days" id="hx-tour-days"><legend>When works best?</legend>${["Today", "Tomorrow", "This weekend", "Next week"].map(day).join("")}</fieldset>
<label>Name<input name="name" autocomplete="name" required maxlength="120"></label>
<div class="hx-row2"><label>Phone<input name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="40"></label><label>Email<input name="email" type="email" autocomplete="email" inputmode="email" required maxlength="200"></label></div>
<label><span id="hx-tour-msg-label">Anything we should know? (optional)</span><textarea name="message" rows="3" maxlength="1000"></textarea></label>
<label class="hx-check form-consent"><input type="checkbox" name="consent"><span>${esc(SMS_CONSENT_TEXT)}</span></label>
<input name="website" class="hx-hp" tabindex="-1" autocomplete="off" aria-hidden="true" value="">
<p class="hx-error" role="alert" hidden></p>
<button class="btn btn-brass" type="submit">Request a tour</button>
</form></dialog>`;
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
.hx-crumbs{font-size:.8rem;margin:.2rem 0}.hx-crumbs a{color:var(--brass-ink,#91592b)}
.hx-form{display:flex;flex-wrap:wrap;gap:.6rem .8rem;align-items:flex-end;margin:1rem 0 1.4rem;padding:.9rem 1rem;border-radius:16px;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.8);box-shadow:0 6px 18px rgba(28,32,40,.08)}
.hx-form label{display:flex;flex-direction:column;font-size:.8rem;gap:.2rem}.hx-form select,.hx-form input{padding:.45rem .5rem;border-radius:8px;border:1px solid var(--rule,#d9d2c6);background:#fff;font:inherit}
.hx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem}
.hx-nophoto{display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:.85rem}
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
/* Every photo has a fixed box before it loads: a photo with no size counts as in view, and a gallery of
   33 then asked the MLS for all 33 at once, past its limit of 240 a minute for every visitor (2026-10-28). */
.hx-keys{display:grid;grid-template-columns:repeat(auto-fill,minmax(11rem,1fr));gap:.6rem;margin:0 0 1.4rem}
.hx-key{padding:.85rem 1rem;border-radius:14px;background:#fff;border:1px solid var(--rule,#e6dfd3)}
.hx-key span{display:block;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:var(--slate,#5c6b78);font-weight:700}
.hx-key b{display:block;margin-top:.2rem;font-size:1.2rem;color:var(--ink,#1c2028)}
.hx-key small{display:block;margin-top:.25rem;font-size:.78rem;line-height:1.4;color:var(--slate,#5c6b78)}
.hx-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:.5rem}.hx-gallery::-webkit-scrollbar{display:none}
.hx-gallery img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:12px;display:block}
.hx-gallery img:first-child{grid-column:1/-1;aspect-ratio:16/9}
/* A photo that has not come yet shows a calm panel, never its caption squeezed into a strip. */
.hx-gallery img,.hx-c-photo img,.hx-l-hero img,.hx-l-tile img{color:transparent;font-size:0;background:linear-gradient(135deg,#ece6dc,#ddd3c4)}
.hx-imgwait{position:relative}.hx-imgwait::after{content:"Photo loading";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.85rem;color:#6b7480;pointer-events:none}
.hx-gallery .hx-imgwait-i{outline:0}
.hx-hero-photo img{width:100%;max-height:520px;object-fit:cover;border-radius:16px}
.hx-table{border-collapse:collapse;width:100%;max-width:760px;font-size:.92rem}.hx-table th{text-align:left;font-weight:600;padding:.4rem .6rem .4rem 0;width:40%;vertical-align:top}.hx-table td{padding:.4rem 0}.hx-table tr{border-bottom:1px solid var(--rule,#e6dfd3)}
.hx-remarks{white-space:pre-line;line-height:1.65;max-width:760px}
.hx-disclaimer{margin-top:2rem;font-size:.78rem;color:var(--muted);line-height:1.55;max-width:900px}.hx-disclaimer a{color:var(--navy)}
.hx-terms{font-size:.78rem;line-height:1.5}.hx-terms h3{font-size:.85rem;margin:.4rem 0}
.hx-hp{position:absolute!important;left:-9999px;width:1px;height:1px;opacity:0}
.hx-error{color:#a3361f;font-size:.85rem;margin:0}.hx-ok{color:#2c6b3f;font-size:.95rem;padding:2rem 0;text-align:center}
main#main .hx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:1.1rem}
main#main .hx-c{position:relative;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 1px 2px rgba(28,32,40,.06),0 6px 18px rgba(28,32,40,.08);transition:box-shadow .2s ease,transform .2s ease}
main#main .hx-c:hover{box-shadow:0 2px 4px rgba(28,32,40,.08),0 14px 30px rgba(28,32,40,.14);transform:translateY(-2px)}
main#main .hx-c-link{display:block;color:var(--ink,#1c2028);text-decoration:none}
main#main .hx-c-photo{position:relative;display:block;aspect-ratio:16/10;background:linear-gradient(135deg,#e8e1d6,#d9cfc1)}
main#main .hx-c-photo img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
main#main .hx-c-photo .hx-nophoto{display:flex;align-items:center;justify-content:center;height:100%;color:var(--slate,#5c6b78);font-size:.85rem}
main#main .hx-c-tag{position:absolute;top:.6rem;left:.6rem;padding:.22rem .62rem;border-radius:999px;background:#b54a1a;color:#fff;font-size:.78rem;font-weight:700;line-height:1.35}
main#main .hx-c-miles{position:absolute;bottom:.6rem;left:.6rem;padding:.18rem .55rem;border-radius:999px;background:rgba(28,32,40,.6);color:#fff;font-size:.75rem;font-weight:600}
main#main .hx-c-body{display:block;padding:.7rem .95rem .85rem}
main#main .hx-c-price{display:block;font-family:var(--sans);font-size:1.4rem;font-weight:800;letter-spacing:-.01em;line-height:1.2}
main#main .hx-c-facts{display:flex;flex-wrap:wrap;align-items:center;gap:0 .45rem;margin:.2rem 0 .25rem;font-size:.95rem;line-height:1.4}
main#main .hx-c-facts b{font-weight:700}main#main .hx-c-facts i{display:inline-block;width:1px;height:1em;background:rgba(28,32,40,.3)}
main#main .hx-c-addr{display:block;font-size:.92rem;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
main#main .hx-c-firm{display:block;margin-top:.4rem;font-size:.72rem;line-height:1.4;color:var(--slate,#5c6b78)}
main#main .hx-c .hx-heart{position:absolute;top:.45rem;right:.45rem;width:2.6rem;height:2.6rem;background:none!important;color:#fff;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5))}
main#main .hx-c .hx-heart svg{width:30px;height:30px;stroke-width:2}
main#main .hx-s-row>.hx-c{flex:0 0 min(80%,19.5rem);scroll-snap-align:start}
main#main .hx-s-row>.hx-c:hover{transform:none}
.hx-dialog{position:fixed;inset:0;margin:auto;border:0;border-radius:22px;padding:0;max-width:27rem;width:calc(100% - 2rem);height:fit-content;max-height:calc(100% - 2rem);background:#fff;color:var(--ink,#1c2028);box-shadow:0 30px 80px rgba(28,32,40,.35)}
.hx-dialog[open]{animation:hx-pop .22s ease-out}@keyframes hx-pop{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}
.hx-dialog::backdrop{background:rgba(28,32,40,.5);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
.hx-dialog form{position:relative;padding:1.6rem 1.5rem 1.4rem;display:flex;flex-direction:column;gap:.75rem;max-height:calc(100vh - 2rem);overflow:auto}
.hx-dialog form[hidden]{display:none}
.hx-dialog .hx-d-head{display:flex;align-items:center;gap:.8rem;padding-right:2.4rem}
.hx-dialog .hx-d-thumb{width:3.6rem;height:3.6rem;flex:none;border-radius:12px;object-fit:cover;background:#e8e1d6}
.hx-dialog .hx-d-thumb[hidden]{display:none}
.hx-dialog h2{font-family:var(--serif);font-size:1.45rem;line-height:1.2;margin:0}
.hx-dialog .hx-d-sub{margin:.15rem 0 0;font-size:.88rem;color:var(--slate,#5c6b78)}
.hx-dialog label{display:flex;flex-direction:column;gap:.3rem;font-size:.82rem;font-weight:600;color:var(--slate,#5c6b78)}
.hx-dialog input:not([type=checkbox]):not([type=radio]),.hx-dialog textarea{width:100%;min-height:3rem;padding:.7rem .85rem;border-radius:12px;border:1px solid rgba(28,32,40,.16);background:#faf8f4;font:inherit;font-size:1rem;font-weight:400;color:var(--ink,#1c2028);transition:border-color .15s,box-shadow .15s,background .15s}
.hx-dialog textarea{min-height:5rem;resize:vertical}
.hx-dialog input:not([type=checkbox]):not([type=radio]):focus,.hx-dialog textarea:focus{outline:none;background:#fff;border-color:var(--brass-ink,#91592b);box-shadow:0 0 0 3px rgba(196,120,58,.18)}
.hx-row2{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}
.hx-check{flex-direction:row!important;align-items:flex-start;gap:.6rem!important;font-size:.74rem!important;line-height:1.45}
.hx-dialog .hx-check{font-weight:400;color:var(--slate,#5c6b78)}.hx-dialog .hx-check input{width:1.1rem;height:1.1rem;margin-top:.1rem;accent-color:var(--brass-ink,#91592b);flex:none}
.hx-dialog button[type=submit]{width:100%;min-height:3.1rem;border-radius:999px;font-size:1rem;font-weight:700;letter-spacing:0;text-transform:none;margin-top:.2rem}
.hx-dialog button[type=submit]:disabled{opacity:.5;cursor:not-allowed}
.hx-days{display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem;border:0;margin:0;padding:0}@media (max-width:420px){.hx-days{grid-template-columns:repeat(2,1fr)}}.hx-days legend{font-size:.82rem;font-weight:600;color:var(--slate,#5c6b78);margin-bottom:.3rem;padding:0}
.hx-days label{position:relative}.hx-days legend{grid-column:1/-1}
.hx-days input{position:absolute;opacity:0;pointer-events:none}
.hx-days span{display:block;text-align:center;white-space:nowrap;padding:.6rem .3rem;border-radius:12px;border:1px solid rgba(28,32,40,.16);background:#faf8f4;font-weight:600;font-size:.88rem;color:var(--ink,#1c2028);cursor:pointer}
.hx-days input:checked+span{background:var(--ink,#1c2028);border-color:var(--ink,#1c2028);color:#fff}.hx-days input:focus-visible+span{box-shadow:0 0 0 3px rgba(196,120,58,.35)}
.hx-x{position:absolute;top:.8rem;right:.8rem;width:2.2rem;height:2.2rem;border:0;border-radius:999px;background:#f1ece4;font-size:1.3rem;line-height:1;cursor:pointer;color:var(--ink,#1c2028);z-index:1}
.hx-x:hover{background:#e7dfd2}
.hx-vh{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.hx-search{margin:1rem 0 .7rem}
.hx-q{display:flex;align-items:center;gap:.5rem;padding:.35rem .35rem .35rem 1rem;border-radius:999px;background:#fff;border:1px solid rgba(28,32,40,.14);box-shadow:0 8px 26px rgba(28,32,40,.10);max-width:760px}
.hx-q:focus-within{border-color:var(--brass-ink,#91592b);box-shadow:0 0 0 3px rgba(196,120,58,.18),0 8px 26px rgba(28,32,40,.10)}
.hx-q svg{width:20px;height:20px;flex:none;fill:none;stroke:var(--slate,#5c6b78);stroke-width:2;stroke-linecap:round}
.hx-q input{flex:1;min-width:0;border:0;outline:none;background:none;font:inherit;font-size:1.02rem;padding:.6rem 0;color:var(--ink,#1c2028)}
.hx-q button{border:0;border-radius:999px;background:var(--ink,#1c2028);color:#fff;font:inherit;font-weight:700;padding:.7rem 1.3rem;cursor:pointer}
.hx-chips{display:flex;gap:.5rem;overflow-x:auto;scrollbar-width:none;padding:.2rem .1rem .6rem;margin:0 -.1rem}.hx-chips::-webkit-scrollbar{display:none}
.hx-chip{position:relative;flex:none;display:inline-flex;align-items:center;border-radius:999px;border:1px solid rgba(28,32,40,.18);background:#fff;font-size:.9rem;font-weight:600;color:var(--ink,#1c2028)}
.hx-chip.hx-on{background:var(--ink,#1c2028);border-color:var(--ink,#1c2028);color:#fff}
.hx-chip select{appearance:none;-webkit-appearance:none;border:0;background:transparent;font:inherit;color:inherit;padding:.55rem 2rem .55rem .95rem;cursor:pointer;border-radius:999px}
.hx-chip::after{content:"";position:absolute;right:.85rem;top:50%;width:.4rem;height:.4rem;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:translateY(-70%) rotate(45deg);pointer-events:none}
.hx-chip select option{color:#1c2028;background:#fff}
.hx-applied{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;margin:.2rem 0 .4rem}
.hx-applied-chip{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .45rem .3rem .75rem;border-radius:999px;background:#f1ece4;color:var(--ink,#1c2028);font-size:.85rem;font-weight:600;text-decoration:none}
.hx-applied-chip span{display:inline-flex;align-items:center;justify-content:center;width:1.2rem;height:1.2rem;border-radius:999px;background:rgba(28,32,40,.12);font-size:.9rem}
.hx-clear{font-size:.85rem;color:var(--brass-ink,#91592b);margin-left:.3rem}
.hx-count{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin:.6rem 0 1rem}.hx-count p{margin:0;font-size:1.05rem}.hx-count b{font-weight:800}
.hx-count-r{display:inline-flex;align-items:center;gap:.6rem}.hx-maplink{display:inline-flex;align-items:center;padding:.42rem .95rem;border-radius:999px;background:#1a73e8;color:#fff!important;font-weight:700;font-size:.9rem;text-decoration:none}
.hx-sort{display:inline-flex;align-items:center;gap:.4rem;font-size:.85rem;color:var(--slate,#5c6b78)}.hx-sort select{border:1px solid rgba(28,32,40,.18);border-radius:999px;background:#fff;font:inherit;font-size:.9rem;padding:.4rem .8rem;color:var(--ink,#1c2028)}
.hx-pager a,.hx-pager span{padding:.55rem 1rem;border-radius:999px;border:1px solid rgba(28,32,40,.15);background:#fff;text-decoration:none;color:var(--ink,#1c2028);font-weight:600}.hx-pager span{border:0;background:none}
.hx-maplist{color:var(--brass-ink,#91592b);font-weight:600}
.hx-loc h2{margin-top:1.6rem}
.hx-loc-map{position:relative;display:block;border-radius:18px;overflow:hidden;box-shadow:0 6px 20px rgba(28,32,40,.10);text-decoration:none}
.hx-loc-map img{display:block;width:100%;height:auto;aspect-ratio:640/280;object-fit:cover;background:#e9e5dc}
.hx-loc-cta{position:absolute;left:.8rem;bottom:.8rem;padding:.55rem 1rem;border-radius:999px;background:#1c2028;color:#fff;font-weight:700;font-size:.9rem;box-shadow:0 6px 18px rgba(0,0,0,.25)}
.hx-loc-map:hover .hx-loc-cta{background:#1a73e8}
.hx-d-fine{font-size:.72rem;color:var(--slate,#5c6b78);line-height:1.45;margin:0;text-align:center}
.hx-linkbtn{border:0;background:none;padding:0;font:inherit;font-weight:700;color:var(--brass-ink,#91592b);text-decoration:underline;cursor:pointer}
.hx-dialog .hx-d-center{text-align:center;margin:0}.hx-dialog h2.hx-d-center{padding:0 2rem}
.hx-dialog .hx-check-fine{font-size:.72rem;line-height:1.45}
.hx-dialog .hx-terms summary{cursor:pointer;color:var(--slate,#5c6b78)}
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
@media (min-width:900px){.hx-l-media{grid-template-columns:2fr 1fr;grid-template-rows:1fr 1fr;height:min(64vh,540px)}.hx-l-hero{grid-row:1/3;aspect-ratio:auto}.hx-l-tile{display:block}.hx-l-tile.hx-tall{grid-row:1/3}.hx-l-media.hx-one{grid-template-columns:1fr}.hx-l-media.hx-one .hx-l-hero{grid-row:auto}}
.hx-l-grid{display:flex;flex-direction:column;gap:1.4rem}.hx-l-info{display:contents}.hx-l-top{order:1}.hx-side{order:2}.hx-l-rest{order:3}
@media (min-width:900px){.hx-l-grid{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:0 2.6rem}.hx-l-info{display:block;grid-column:1}.hx-side{grid-column:2;grid-row:1}}
.hx-l-price{font-family:var(--serif);font-size:clamp(2rem,5vw,2.9rem);font-weight:600;line-height:1.05;margin:0;letter-spacing:-.01em}
.hx-wrap h1.hx-l-addr{font-family:var(--sans);font-size:1.15rem;font-weight:500;line-height:1.4;margin:.35rem 0 .9rem;color:var(--slate,#5c6b78)}
.hx-pills{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 .9rem;padding:0;list-style:none}
.hx-pill{display:inline-flex;align-items:center;gap:.45rem;padding:.5rem .85rem;border-radius:999px;background:#fff;border:1px solid var(--rule,#e6dfd3);font-size:1rem}
.hx-pill svg,.hx-fact svg,.hx-teaser svg{width:18px;height:18px;flex:none;fill:none;stroke:var(--brass-ink,#91592b);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.hx-facts-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem;margin:1.3rem 0}@media (min-width:600px){.hx-facts-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
.hx-fact{padding:.85rem .95rem;border-radius:16px}.hx-fact span{display:block;font-size:.75rem;letter-spacing:.06em;text-transform:uppercase;color:var(--slate,#5c6b78)}.hx-fact b{display:block;font-size:1.05rem;font-weight:600;margin-top:.15rem;overflow-wrap:anywhere}
.hx-side{position:sticky;top:9rem;align-self:start;padding:1.3rem;border-radius:22px;display:flex;flex-direction:column;gap:.7rem}
.hx-analyze{display:flex;align-items:center;justify-content:center;gap:.5rem;min-height:2.9rem;border-radius:999px;border:1.5px dashed rgba(28,32,40,.25);color:var(--ink,#1c2028);font-weight:700;font-size:.92rem;text-decoration:none}
.hx-analyze:hover{border-style:solid;border-color:var(--brass-ink,#91592b);background:#fbf6ef}
.hx-analyze svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.hx-side .hx-l-price{font-size:1.9rem}.hx-side p{margin:0}
@media (max-width:899px){.hx-side .hx-l-price,.hx-side .hx-small{display:none}.hx-side{position:static;padding:1rem}}
.hx-side .hx-tour{justify-content:center;padding:.75rem 1rem;font-size:1rem;font-weight:600}
.hx-side-row{display:flex;align-items:center;gap:.6rem;font-size:.9rem;color:var(--slate,#5c6b78)}.hx-side-row .hx-heart{border:1px solid var(--rule,#e6dfd3)}
.hx-teaser{margin:1.6rem 0;padding:1.3rem 1.3rem 1.1rem;border-radius:22px}
.hx-teaser h2{font-family:var(--serif);font-size:1.35rem;margin:0 0 .3rem}.hx-teaser ul{list-style:none;margin:.6rem 0 1rem;padding:0}
.hx-teaser li{display:flex;align-items:center;gap:.6rem;padding:.7rem 0;border-bottom:1px solid var(--rule,#e6dfd3);font-size:1rem}
.hx-teaser li em{margin-left:auto;display:inline-block;width:6.5rem;height:.8rem;border-radius:6px;background:linear-gradient(90deg,#d9cfc1,#efe8dd);filter:blur(1.5px)}
.hx-wrap h2{font-family:var(--serif);font-size:1.45rem;margin:2rem 0 .6rem}

@media (prefers-reduced-transparency:reduce){.hx-glass{backdrop-filter:none;-webkit-backdrop-filter:none;background:#fff}}
${FILTER_STYLE}
</style>`;

/* The strip on a guide page: one row that pans sideways, no scroll bar; drag with a mouse,
   swipe on a phone. Glass price chip; the firm under the price at the same size (16.14). */
export const STRIP_STYLE = `<style>
main#main .hx-strip:empty{display:none}main#main .hx-strip:not(:empty)+.hx-fallback{display:none}
main#main .hx-strip{margin:1.2rem 0 .4rem;max-width:760px;position:relative}
main#main .hx-s-head{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;margin:0 0 .55rem;font-size:.95rem;color:var(--navy)}
main#main .hx-s-head a{color:var(--brass-ink,#91592b);font-size:.9rem;white-space:nowrap}
main#main .hx-feed{background:var(--ivory-2,#f1ece4)}
main#main .hx-feed .hx-strip.hx-feed-strip{max-width:none;margin:0}
main#main .hx-feed-eb{font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass-ink,#91592b);margin:0 0 .45rem;font-weight:600}
main#main .hx-feed .hx-s-head{align-items:flex-end;margin-bottom:.9rem}
main#main .hx-feed-h{font-family:var(--serif);font-size:clamp(1.3rem,2.6vw,1.65rem);font-weight:600;line-height:1.25;color:var(--navy)}
@media (min-width:900px){main#main .hx-feed .hx-s-row>.hx-c{flex-basis:calc((100% - 2.25rem) / 3.4)}}
main#main section.hx-feed{padding:2rem 0 1.9rem!important}
@media (max-width:640px){main#main section.hx-feed{padding:1.5rem 0 1.4rem!important}}
main#main .hx-feed .hx-s-head{margin-bottom:.25rem}
main#main .hx-feed-sub{margin:0 0 .85rem;font-size:.9rem;line-height:1.45;color:var(--slate,#5c6b78);max-width:46rem}
main#main .hx-feed-q{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-top:.9rem}
main#main .hx-feed-q select{min-height:2.6rem;padding:0 2rem 0 .85rem;border-radius:999px;border:1px solid rgba(28,32,40,.16);background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%235c6b78' stroke-width='1.6'/%3E%3C/svg%3E") no-repeat right .8rem center;-webkit-appearance:none;appearance:none;font:inherit;font-size:.88rem;color:var(--ink,#1c2028);cursor:pointer}
main#main .hx-feed-q button{min-height:2.6rem;padding:0 1.2rem;border:0;border-radius:999px;background:var(--navy,#1c2028);color:#fff;font:inherit;font-size:.88rem;font-weight:700;cursor:pointer}
main#main .hx-feed-q button:hover{background:#2a3040}
@media (max-width:560px){main#main .hx-feed-q select{flex:1 1 calc(50% - .5rem);min-width:0}main#main .hx-feed-q button{flex:1 1 100%}}
.hx-s-note{margin:-.3rem 0 .55rem;font-size:.85rem;color:var(--muted,#5a5f6a)}
main#main .hx-s-row{display:flex;align-items:flex-start;gap:.75rem;overflow-x:auto;scroll-behavior:auto;scroll-snap-type:x proximity;padding:.15rem .15rem .6rem;margin:0 -.15rem;scrollbar-width:none;-ms-overflow-style:none;cursor:grab;user-select:none;-webkit-user-select:none}
main#main .hx-s-row::-webkit-scrollbar{display:none}main#main .hx-s-row.hx-dragging{cursor:grabbing;scroll-snap-type:none}main#main .hx-s-row.hx-auto{scroll-snap-type:none}
main#main .hx-s-all{flex:0 0 40%;max-width:12rem;align-self:stretch;display:flex;align-items:center;justify-content:center;text-align:center;padding:1rem;border-radius:16px;font-weight:600;color:var(--navy);background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.75);text-decoration:none}
@media (min-width:700px){main#main .hx-s-all{flex-basis:18%}}
</style>`;

/**
 * The page script. It touches only our own elements; nothing from the CRM is ever
 * written with innerHTML. data-hx-signed on <body> says whether the visitor is signed up.
 */
/** The photo server's connection opens while the page is still arriving: about a third of a second sooner. */
export const PHOTO_HINT = `<link rel="preconnect" href="https://api.cotality.com"><link rel="dns-prefetch" href="https://api.cotality.com">`;

export const SCRIPT = `<script>(function(){
var signed=document.body.getAttribute("data-hx-signed")==="1";
/* A listing photo that fails (the MLS photo server allows 240 a minute for every visitor together) is
   asked for once more a minute later, when its count starts over; until then a calm panel shows. */
document.addEventListener("error",function(e){var im=e.target;if(!im||im.tagName!=="IMG"||im.src.indexOf("https://api.cotality.com/")!==0)return;
 var box=im.parentNode;if(box&&box.classList&&!box.classList.contains("hx-gallery"))box.classList.add("hx-imgwait");
 if(im.getAttribute("data-retry"))return;im.setAttribute("data-retry","1");var u=im.src;setTimeout(function(){im.src=u+(u.indexOf("?")<0?"?r=1":"&r=1")},61000)},true);
document.addEventListener("load",function(e){var im=e.target;if(im&&im.tagName==="IMG"&&im.parentNode&&im.parentNode.classList)im.parentNode.classList.remove("hx-imgwait")},true);
function $(s,r){return (r||document).querySelector(s)}function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function post(u,b){return fetch(u,{method:"POST",headers:{"content-type":"application/json"},credentials:"same-origin",body:JSON.stringify(b)}).then(function(r){return r.json().catch(function(){return{}}).then(function(j){j._status=r.status;return j})})}
function openD(d){if(!d)return;if(d.showModal)d.showModal();else d.setAttribute("open","")}
$$("[data-hx-close]").forEach(function(b){b.addEventListener("click",function(){var d=b.closest("dialog");if(d)d.close()})});
/* Every row of homes scrolls slowly by itself (owner, 2026-10-26), and the reader can still drag it with a
   mouse or swipe it. It stops while a pointer is over it, while it is touched or has focus, and for a few
   seconds after the reader moves it; at the end it waits, then goes back to the start. Never with reduced motion. */
var still=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
function rig(row){if(row.hxRig)return;row.hxRig=1;var down=false,moved=false,x0=0,s0=0,hold=0,over=false,seen=false,pos=row.scrollLeft,wait=0;
 function rest(ms){hold=Date.now()+ms}
 row.addEventListener("pointerdown",function(e){rest(5000);if(e.pointerType!=="mouse")return;down=true;moved=false;x0=e.clientX;s0=row.scrollLeft});
 row.addEventListener("pointermove",function(e){if(!down)return;var dx=e.clientX-x0;if(Math.abs(dx)>4){moved=true;row.classList.add("hx-dragging")}row.scrollTo({left:s0-dx,behavior:"instant"})});
 function up(){down=false;rest(5000);setTimeout(function(){row.classList.remove("hx-dragging")},0)}
 row.addEventListener("pointerup",up);row.addEventListener("pointerleave",function(){over=false;up()});
 row.addEventListener("pointerenter",function(e){if(e.pointerType==="mouse")over=true});
 row.addEventListener("touchstart",function(){rest(6000)},{passive:true});
 row.addEventListener("wheel",function(){rest(5000)},{passive:true});
 row.addEventListener("focusin",function(){rest(8000)});
 row.addEventListener("click",function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false}},true);
 if(still||!window.requestAnimationFrame)return;
 if(window.IntersectionObserver)new IntersectionObserver(function(es){seen=es[0].isIntersecting}).observe(row);else seen=true;
 var last=0;function step(t){var dt=last?Math.min(64,t-last):16;last=t;
  if(seen&&!over&&!down&&Date.now()>hold&&!row.contains(document.activeElement)){var max=row.scrollWidth-row.clientWidth;
   if(max>8){if(Math.abs(row.scrollLeft-pos)>2)pos=row.scrollLeft;
    if(pos>=max-1){if(!wait)wait=Date.now()+1800;else if(Date.now()>wait){wait=0;pos=0;row.scrollTo({left:0,behavior:"smooth"});rest(1200)}}
    else{pos=Math.min(max,pos+dt*0.03);row.scrollLeft=pos}}}
  requestAnimationFrame(step)}
 /* No snapping on a row that moves by itself: a snap back to a card's edge reads as a jump. */
 row.classList.add("hx-auto");requestAnimationFrame(step)}
$$(".hx-s-row").forEach(rig);
if(window.MutationObserver)new MutationObserver(function(){$$(".hx-s-row").forEach(rig)}).observe(document.body,{childList:true,subtree:true});
/* The quick filters apply at once; empty choices stay out of the address. The sort menu goes to its link. */
$$("form[data-hx-instant]").forEach(function(f){f.addEventListener("change",function(){var u=new URLSearchParams();Array.prototype.forEach.call(f.elements,function(el){if(el.name&&el.value)u.set(el.name,el.value)});location.href="/homes/"+(u.toString()?"?"+u.toString():"")})});
$$("select[data-hx-go]").forEach(function(s){s.addEventListener("change",function(){if(s.value.indexOf("/homes/")===0)location.href=s.value})});
/* Sign-up */
var sd=$("#hx-signup"),sf=$("#hx-signup-form");var tsLoaded=false;
function askSignup(pending){if(pending)try{sessionStorage.setItem("c3_idx_heart",pending)}catch(e){}
 if(!tsLoaded&&$(".cf-turnstile",sd)){tsLoaded=true;var s=document.createElement("script");s.src="https://challenges.cloudflare.com/turnstile/v0/api.js";s.async=true;document.head.appendChild(s)}openD(sd)}
$$("[data-hx-signup]").forEach(function(b){b.addEventListener("click",function(){askSignup()})});
if(!signed&&/[?&]signup=1/.test(location.search))askSignup();
if(sf){var tb=sf.elements.termsAccepted,sb=sf.querySelector("button[type=submit]");tb.addEventListener("change",function(){sb.disabled=!tb.checked});
 sf.addEventListener("submit",function(e){e.preventDefault();var err=sf.querySelector(".hx-error");err.hidden=true;sb.disabled=true;
  var prior=[];try{prior=JSON.parse(localStorage.getItem("c3_idx_prior")||"[]")}catch(x){}
  var t=sf.querySelector("[name=cf-turnstile-response]");
  var nm=sf.elements.name.value.trim().split(" ").filter(Boolean),first=nm.shift()||"",last=nm.join(" ");
  if(!last){err.textContent="Please enter your first and last name.";err.hidden=false;sb.disabled=!tb.checked;sf.elements.name.focus();return}
  post("/homes/api/register",{firstName:first,lastName:last,email:sf.elements.email.value,phone:sf.elements.phone.value,
   termsAccepted:tb.checked,smsConsent:sf.elements.smsConsent.checked,website:sf.elements.website.value,page:location.pathname,priorViews:prior,turnstileToken:t?t.value:""})
  .then(function(j){if(j.ok){try{localStorage.removeItem("c3_idx_prior")}catch(x){}var h=null;try{h=sessionStorage.getItem("c3_idx_heart");sessionStorage.removeItem("c3_idx_heart")}catch(x){}
    return (h?post("/homes/api/hearts",{mlsNumber:h,loved:true}):Promise.resolve()).then(function(){location.reload()})}
   err.textContent=j.message||"Please check the form and try again.";err.hidden=false;sb.disabled=!tb.checked;if(window.turnstile)try{turnstile.reset()}catch(x){}})
  .catch(function(){err.textContent="Sign-up is unavailable right now. Please call (854) 333-2135.";err.hidden=false;sb.disabled=!tb.checked})})}
/* Already working with us? (contract §7g) */
var rf=$("#hx-returning-form");
function swap(toReturning){if(!sf||!rf)return;sf.hidden=toReturning;rf.hidden=!toReturning}
$$("[data-hx-returning]").forEach(function(b){b.addEventListener("click",function(){swap(true)})});
$$("[data-hx-newsignup]").forEach(function(b){b.addEventListener("click",function(){swap(false)})});
if(rf){var rt=rf.elements.termsAccepted,rb=rf.querySelector("button[type=submit]");rt.addEventListener("change",function(){rb.disabled=!rt.checked});
 rf.addEventListener("submit",function(e){e.preventDefault();var err=rf.querySelector(".hx-error");err.hidden=true;rb.disabled=true;var t=rf.querySelector("[name=cf-turnstile-response]");
  post("/homes/api/returning",{phone:rf.elements.phone.value,firstName:rf.elements.firstName.value,termsAccepted:rt.checked,turnstileToken:t?t.value:"",page:location.pathname})
  .then(function(j){if(j.ok){location.reload();return}
   // A Turnstile token works once, and the CRM may have spent it: a fresh one before the prefilled sign-up posts (§7g).
   if(window.turnstile)try{turnstile.reset()}catch(x){}
   rb.disabled=!rt.checked;
   if(j.notFound&&sf){sf.elements.phone.value=rf.elements.phone.value;sf.elements.name.value=rf.elements.firstName.value+" ";swap(false);var se=sf.querySelector(".hx-error");se.textContent="We could not find you. Finish this short sign-up and you are in.";se.hidden=false;return}
   err.textContent=j.message||"Please check the form and try again.";err.hidden=false;rb.disabled=!rt.checked})
  .catch(function(){err.textContent="Sign-in is unavailable right now. Please call (854) 333-2135.";err.hidden=false;rb.disabled=!rt.checked})})}
/* Welcome back: a link from our emails, the terms first */
var wd=$("#hx-welcome"),wf=$("#hx-welcome-form");
if(wd&&wf){var wt=wf.elements.termsAccepted,wb=wf.querySelector("button[type=submit]");wt.addEventListener("change",function(){wb.disabled=!wt.checked});openD(wd);
 wf.addEventListener("submit",function(e){e.preventDefault();var err=wf.querySelector(".hx-error");err.hidden=true;wb.disabled=true;
  post("/homes/api/claim",{k:wd.getAttribute("data-k"),termsAccepted:true,page:location.pathname}).then(function(j){if(j.ok){location.reload();return}
   if(j.error==="link_expired"){wd.close();return}err.textContent=j.message||"Please try again.";err.hidden=false;wb.disabled=false}).catch(function(){wd.close()})})}
/* Hearts */
/* One listener for every heart, also those drawn later (the map page's list). Saved hearts need the free sign-up. */
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".hx-heart");if(!b||!b.getAttribute("data-mls"))return;e.preventDefault();e.stopPropagation();var m=b.getAttribute("data-mls");
 if(!signed){askSignup(m);return}var on=b.getAttribute("aria-pressed")!=="true";b.setAttribute("aria-pressed",on?"true":"false");
 post("/homes/api/hearts",{mlsNumber:m,loved:on}).then(function(j){if(j._status===401){location.reload()}})});
/* Tour this home: the site's ordinary lead form, with the home's MLS number. */
var td=$("#hx-tourd"),tf=$("#hx-tour-form"),tm=null,ta="",ti="tour";
$$(".hx-tour[data-mls]").forEach(function(b){b.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();tm=b.getAttribute("data-mls");ta=b.getAttribute("data-addr")||"";ti=b.getAttribute("data-interest")==="question"?"question":"tour";
 var a=$("#hx-tour-addr");if(a)a.textContent=ta;var h=$("#hx-tour-title");if(h)h.textContent=ti==="question"?"Ask about this home":"Tour this home";
 var l=$("#hx-tour-msg-label");if(l)l.textContent=ti==="question"?"Your question":"Anything we should know? (optional)";
 var s=tf&&tf.querySelector("button[type=submit]");if(s)s.textContent=ti==="question"?"Send my question":"Request a tour";
 var dy=$("#hx-tour-days");if(dy)dy.hidden=ti==="question";var th=$("#hx-tour-thumb"),ph=b.getAttribute("data-photo")||"";if(th){if(ph.indexOf("https://")===0){th.src=ph;th.hidden=false}else th.hidden=true}openD(td)})});
if(tf){tf.addEventListener("submit",function(e){e.preventDefault();var err=tf.querySelector(".hx-error");err.hidden=true;
 if(!tf.elements.consent.checked){err.textContent="Please tick the box so an agent can reach you about the tour.";err.hidden=false;return}
 var ct=(tf.querySelector(".form-consent span").textContent||"").replace(/\\s+/g," ").trim();
 fetch("https://app.chapter3realty.com/api/forms/lead",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({formType:"contact",name:tf.elements.name.value,phone:tf.elements.phone.value,email:tf.elements.email.value,
  consent:true,consentText:ct,website:tf.elements.website.value,page:location.pathname,formName:ti==="question"?"Ask about this home":"Tour this home",interest:ti,mls_number:tm,
  message:(ti==="question"?"Question about ":"I'd like to tour ")+ta+(ti!=="question"&&tf.querySelector("[name=day]:checked")?" ("+tf.querySelector("[name=day]:checked").value+")":"")+(tf.elements.message.value.trim()?": "+tf.elements.message.value.trim().slice(0,1000):"")})})
 .then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(r.ok&&j.ok){tf.innerHTML="";var p=document.createElement("p");p.className="hx-ok";p.textContent=ti==="question"?"Thank you. An agent will answer your question soon.":"Thank you. An agent will contact you to set up the tour.";tf.appendChild(p)}
  else{err.textContent="Please check your name, phone and email.";err.hidden=false}})}).catch(function(){err.textContent="Please call (854) 333-2135 and we will set up the tour.";err.hidden=false})})}
/* Seconds on a listing page (contract 7c, 7d). */
var main=$("[data-hx-mls]");if(main){var vid=main.getAttribute("data-view-id"),mls=main.getAttribute("data-hx-mls"),secs=0,since=document.visibilityState==="visible"?Date.now():null;
 function total(){return Math.min(3600,Math.floor(secs+(since?(Date.now()-since)/1000:0)))}
 function send(){if(vid){try{fetch("/homes/api/views",{method:"POST",keepalive:true,credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({viewId:vid,seconds:total()})})}catch(x){}}
  else if(!signed){try{var L=JSON.parse(localStorage.getItem("c3_idx_prior")||"[]").filter(function(x){return x&&x.mlsNumber!==mls&&Date.now()-Date.parse(x.viewedAt)<2592e6});
   L.unshift({mlsNumber:mls,seconds:total(),viewedAt:new Date().toISOString()});localStorage.setItem("c3_idx_prior",JSON.stringify(L.slice(0,20)))}catch(x){}}}
 document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden"){secs=total();since=null;send()}else since=Date.now()});
 addEventListener("pagehide",send);setInterval(function(){if(since)send()},60000)}
})();</script>` + FILTER_SCRIPT;
