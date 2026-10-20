/**
 * HTML for the listing pages (CRM Ticket 404). Pure functions: data in,
 * escaped HTML out. The CRM decides WHAT may be shown (it never sends a field
 * a visitor may not see); this file only decides how it looks.
 *
 * Rules every listing display follows (CCMLS rulebook section 16):
 *   16.14  the listing firm on every listing, no smaller than the listing data
 *   16.16  the MLS named as the source
 *   16.17  the disclaimer on every page
 *   16.11  a way to report a data error (the contact line in the footer block)
 * Fair Housing: places and homes are described, never people.
 */

export function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const money = (n) => (typeof n === "number" ? usd.format(n) : "");
const int = (n) => (typeof n === "number" ? n.toLocaleString("en-US") : "");

/** Only https links leave this file as an href or src. */
export function safeUrl(u) {
  return typeof u === "string" && /^https:\/\/[^\s"'<>]+$/i.test(u) ? u : null;
}

export function dateLong(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function dayLong(ymd) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}/.test(ymd)) return "";
  const [y, m, d] = ymd.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" });
}

/** "3 bd · 2 ba · 1,450 sq ft": only the facts the listing gave (missing is left out, never 0). */
export function factsLine(l) {
  const parts = [];
  if (typeof l.beds === "number") parts.push(`${l.beds} bd`);
  if (typeof l.baths === "number") parts.push(`${l.baths} ba`);
  if (typeof l.sqft === "number") parts.push(`${int(l.sqft)} sq ft`);
  if (typeof l.lotAcres === "number" && (l.propertyType || "").toLowerCase().includes("land")) parts.push(`${l.lotAcres} acres`);
  return parts.join(" · ");
}

export function addressLine(l) {
  const town = [l.city, l.state].filter(Boolean).join(", ");
  return l.address ? `${l.address}, ${town}` : `${town} (address not shown at the seller's request)`;
}

export function listingHref(l) {
  return `/homes/${encodeURIComponent(l.slug)}/`;
}

/** One card. Firm and source on the card itself (16.14, 16.16). */
export function card(l, opts = {}) {
  const photo = safeUrl(l.photo);
  const price = l.status === "Sold" ? (typeof l.soldPrice === "number" ? `Sold ${money(l.soldPrice)}` : "Sold") : money(l.price);
  const miles = typeof opts.miles === "number" ? `<span class="hx-miles">${esc(opts.miles)} mi</span>` : "";
  return `<article class="hx-card">
<a class="hx-card-link" href="${listingHref(l)}">
<div class="hx-photo">${photo ? `<img src="${esc(photo)}" alt="${esc(addressLine(l))}" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : `<div class="hx-nophoto">No photo</div>`}<span class="hx-status">${esc(l.status)}</span>${miles}</div>
<div class="hx-card-body">
<p class="hx-price">${esc(price)}</p>
<p class="hx-facts">${esc(factsLine(l))}</p>
<p class="hx-addr">${esc(addressLine(l))}</p>
<p class="hx-firm">Listed by ${esc(l.listingFirm || "the listing brokerage")} · Source: CCMLS</p>
</div></a></article>`;
}

export function grid(listings, milesOf) {
  if (!listings.length) return `<p class="hx-empty">No homes match right now. New listings arrive every few minutes.</p>`;
  return `<div class="hx-grid">${listings.map((l) => card(l, { miles: milesOf ? milesOf(l) : undefined })).join("")}</div>`;
}

/** The block at the bottom of every listing page (16.16, 16.17, 16.11). */
export function disclaimer(meta) {
  const when = meta && meta.refreshedAt ? `Listing information last updated ${esc(dateLong(meta.refreshedAt))} ET. ` : "";
  return `<aside class="hx-disclaimer" aria-label="Listing data disclaimer">
<p>${when}Source: ${esc((meta && meta.source) || "Coastal Carolinas Association of REALTORS® Multiple Listing Service (CCMLS)")}.</p>
<p>${esc((meta && meta.disclaimer) || "")}</p>
<p>Chapter3 Realty Corp, Myrtle Beach, SC. See an error in a listing? Tell us on the <a href="/contact/">contact page</a> or call (854) 333-2135. <a href="/fair-housing/">Equal Housing Opportunity</a>. <a href="/homes/terms/">Listing search terms</a>.</p>
</aside>`;
}

/** The sign-up call to action shown to the public tier. */
export function signupPrompt(what) {
  return `<div class="hx-signup-cta"><p><strong>${esc(what)}</strong></p><p>Sign up free with your name, email and phone to see every photo, the full description, HOA fees, taxes, days on market, price history and recent sales.</p><button type="button" class="btn btn-brass" data-hx-signup>See full details</button></div>`;
}

/** The sign-up dialog. Both boxes start unticked; only the terms box is required. */
export function signupDialog(terms) {
  return `<dialog id="hx-signup" class="hx-dialog" aria-labelledby="hx-signup-title">
<form id="hx-signup-form" method="dialog" novalidate>
<h2 id="hx-signup-title">See full listing details</h2>
<p class="hx-small">Free. We ask so a licensed agent can help with homes you look at. We do not sell your information.</p>
<div class="hx-row"><label>First name<input name="firstName" autocomplete="given-name" required maxlength="80"></label><label>Last name<input name="lastName" autocomplete="family-name" required maxlength="80"></label></div>
<label>Email<input name="email" type="email" autocomplete="email" required maxlength="200"></label>
<label>Mobile phone<input name="phone" type="tel" autocomplete="tel" required maxlength="30"></label>
<input name="website" tabindex="-1" autocomplete="off" class="hx-hp" aria-hidden="true">
<details class="hx-terms"><summary>Read the ${esc(terms.title)}</summary>${terms.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}</details>
<label class="hx-check"><input type="checkbox" name="termsAccepted" required> <span>I agree to the <a href="/homes/terms/" target="_blank" rel="noopener">listing search terms of use</a> and have read the <a href="/privacy/" target="_blank" rel="noopener">Privacy Policy</a>.</span></label>
<label class="hx-check"><input type="checkbox" name="smsConsent"> <span>${esc(terms.smsConsentText)}</span></label>
<p class="hx-error" role="alert" hidden></p>
<div class="hx-actions"><button type="submit" class="btn btn-brass">Sign up and see details</button><button type="button" class="hx-cancel" data-hx-close>Not now</button></div>
</form></dialog>`;
}

/** Page styles. Inline on purpose: these pages are rendered at the edge, not by build.js. */
export const STYLE = `<style>
#hx-root{max-width:1180px;margin:0 auto;padding:2.5rem 1.25rem 3rem;color:var(--navy)}
#hx-root h1{font-family:var(--serif);font-size:clamp(1.7rem,3.6vw,2.4rem);line-height:1.1;margin:0 0 .6rem}
#hx-root h2{font-family:var(--serif);font-size:1.35rem;margin:2rem 0 .8rem}
.hx-lead{color:var(--muted);max-width:760px;line-height:1.6;margin:0 0 1.4rem}
.hx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1.1rem}
.hx-card{background:#fff;border:1px solid var(--rule);border-radius:12px;overflow:hidden}
.hx-card-link{color:inherit;text-decoration:none;display:block}
.hx-photo{position:relative;aspect-ratio:4/3;background:var(--ivory-2)}
.hx-photo img{width:100%;height:100%;object-fit:cover;display:block}
.hx-nophoto{display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:.85rem}
.hx-status,.hx-miles{position:absolute;top:.6rem;background:rgba(28,32,40,.82);color:#f4efe8;font-size:.72rem;padding:.2rem .55rem;border-radius:999px}
.hx-status{left:.6rem}.hx-miles{right:.6rem}
.hx-card-body{padding:.8rem .9rem 1rem}
.hx-card-body p{margin:0 0 .3rem;font-size:.85rem;line-height:1.4}
.hx-price{font-size:1.15rem!important;font-weight:600}
.hx-addr{color:var(--muted)}
.hx-firm{color:var(--navy)}
.hx-empty{color:var(--muted)}
.hx-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.7rem;align-items:end;margin:0 0 1.6rem;background:var(--ivory-2);padding:1rem;border-radius:12px}
.hx-form label{display:flex;flex-direction:column;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;gap:.3rem}
.hx-form select,.hx-form input{padding:.6rem;border:1px solid var(--rule);border-radius:8px;font-size:.9rem;background:#fff;color:var(--navy)}
.hx-pager{display:flex;gap:1rem;justify-content:center;margin:1.6rem 0}
.hx-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.5rem;margin:1rem 0}
.hx-gallery img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;display:block}
.hx-hero-photo img{width:100%;max-height:520px;object-fit:cover;border-radius:12px;display:block}
.hx-keyfacts{display:flex;flex-wrap:wrap;gap:.6rem 1.6rem;font-size:1rem;margin:.8rem 0}
.hx-table{width:100%;border-collapse:collapse;font-size:.9rem}
.hx-table th,.hx-table td{text-align:left;padding:.45rem .4rem;border-bottom:1px solid var(--rule);vertical-align:top}
.hx-table th{width:38%;color:var(--muted);font-weight:500}
.hx-signup-cta{background:var(--ivory-2);border:1px solid var(--rule);border-radius:12px;padding:1.2rem;margin:1.4rem 0}
.hx-signup-cta p{margin:0 0 .6rem;line-height:1.5}
.hx-disclaimer{margin-top:2.5rem;border-top:1px solid var(--rule);padding-top:1rem;font-size:.78rem;color:var(--muted);line-height:1.55}
.hx-disclaimer a{color:var(--navy)}
.hx-dialog{margin:auto;max-height:92vh;overflow:auto;max-width:520px;width:94vw;border:none;border-radius:14px;padding:1.4rem;color:var(--navy)}
.hx-dialog::backdrop{background:rgba(28,32,40,.6)}
.hx-dialog form{display:flex;flex-direction:column;gap:.7rem}
.hx-dialog label{display:flex;flex-direction:column;font-size:.8rem;gap:.25rem}
.hx-dialog input:not([type=checkbox]){padding:.6rem;border:1px solid var(--rule);border-radius:8px;font-size:16px}
.hx-row{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
.hx-check{flex-direction:row!important;align-items:flex-start;gap:.5rem!important;font-size:.76rem!important;line-height:1.45;color:var(--muted)}
.hx-check input{margin-top:.15rem;flex-shrink:0;width:16px;height:16px}
.hx-terms{font-size:.78rem;color:var(--muted);max-height:220px;overflow:auto;border:1px solid var(--rule);border-radius:8px;padding:.5rem .7rem}
.hx-terms p{margin:.4rem 0;line-height:1.45}
.hx-small{font-size:.8rem;color:var(--muted);margin:0}
.hx-error{color:#a12a2a;font-size:.85rem;margin:0}
.hx-actions{display:flex;gap:1rem;align-items:center}
.hx-cancel{background:none;border:none;color:var(--muted);text-decoration:underline;cursor:pointer}
.hx-hp{position:absolute;left:-9999px;width:1px;height:1px}
.hx-crumbs{font-size:.8rem;color:var(--muted);margin-bottom:1rem}.hx-crumbs a{color:var(--navy)}
@media(max-width:560px){.hx-row{grid-template-columns:1fr}}
</style>`;

/** The dialog's script: opens on any [data-hx-signup], posts, reloads on success. */
export const SCRIPT = `<script>(function(){var d=document.getElementById("hx-signup");if(!d)return;var f=document.getElementById("hx-signup-form"),e=f.querySelector(".hx-error");
document.addEventListener("click",function(ev){var t=ev.target.closest("[data-hx-signup]");if(t){ev.preventDefault();if(d.showModal)d.showModal();else d.setAttribute("open","");}if(ev.target.closest("[data-hx-close]")){d.close();}});
f.addEventListener("submit",function(ev){ev.preventDefault();e.hidden=true;var v=function(n){return(f.elements[n].value||"").trim()};
if(!f.elements.termsAccepted.checked){e.textContent="Please accept the terms of use.";e.hidden=false;return;}
var b={firstName:v("firstName"),lastName:v("lastName"),email:v("email"),phone:v("phone"),website:v("website"),termsAccepted:true,smsConsent:f.elements.smsConsent.checked===true,page:location.pathname};
fetch("/homes/api/register",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(b),credentials:"same-origin"}).then(function(r){return r.json().then(function(j){return{ok:r.ok&&j.ok,j:j}})}).then(function(x){if(x.ok){location.reload();}else{e.textContent=(x.j&&x.j.error)||"Something went wrong. Please try again.";e.hidden=false;}}).catch(function(){e.textContent="Something went wrong. Please try again.";e.hidden=false;});});})();</script>`;
