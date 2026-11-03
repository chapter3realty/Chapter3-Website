/*
 * ai.js - one look for every AI feature on the site (owner, 2026-11-03: "make each ai chat the same
 * color and logo so people know"). The mark is two brass sparkles in a brass disc on a navy chip,
 * with the words "Chapter3 AI". It heads:
 *   - the AI search box on /homes/map/ and every homes strip (filters.js),
 *   - the AI picks above the map list (map.js),
 *   - "Ask Chapter3 AI about this home" on each listing page (ASK_SCRIPT below),
 *   - the rental analyzer's AI overview (/invest/long-term-rental/, a hand-made page: it carries a copy
 *     of AI_CSS and AI_MARK inline; change both places together).
 * Every AI answer goes through the site's AI proxy (api-proxy-worker.js), locked to our own domain.
 */

/** The mark: two four-point sparkles. 24 x 24, filled by CSS. */
export const AI_MARK = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>`;

/** The chip that names an AI feature. Its words are always "Chapter3 AI". */
export const aiChip = (cls = "") => `<span class="c3ai${cls ? " " + cls : ""}"><i>${AI_MARK}</i>Chapter3 AI</span>`;

export const AI_CSS = `.c3ai{display:inline-flex;align-items:center;gap:.4rem;margin:0;padding:.24rem .7rem .24rem .26rem;border-radius:999px;background:#1c2028;color:#f4efe8;font-family:var(--sans,"DM Sans",system-ui,sans-serif);font-size:.74rem;font-weight:700;line-height:1;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;vertical-align:middle}
.c3ai i{display:grid;place-items:center;flex:none;width:1.4rem;height:1.4rem;border-radius:50%;background:linear-gradient(160deg,#e6a46c,#c4783a)}
.c3ai svg{width:.9rem;height:.9rem;fill:#1c2028}
.c3ai-panel{background:rgba(196,120,58,.07);border:1px solid rgba(196,120,58,.32);border-radius:18px}`;

/*
 * Ask about this home (listing pages). The page carries the listing's facts as JSON in
 * #hx-ask-data, only for a signed-up visitor (the description and details are for signed-up
 * visitors only, contract: remarks on the registered tier). The AI answers from those facts
 * and nothing else.
 */
export const ASK_RULES = [
  "You are Chapter3 AI, the assistant on Chapter3 Realty's website (chapter3realty.com), a real estate brokerage on the Grand Strand, South Carolina.",
  "A buyer is looking at one home for sale. Answer their question about it using only the listing facts below. Chapter3 Realty is not the listing brokerage unless the facts say so.",
  "If the facts do not answer the question, say plainly that the listing does not say, and that a Chapter3 agent can find out (they can press Ask an agent). Never guess or fill a gap from general knowledge about the home.",
  "Never state or estimate: an interest rate, a monthly payment, a loan amount or a down payment; what the home is worth or whether the price is fair; a rent or a return. For value, say a Chapter3 agent can pull the recent sales nearby. For rental numbers, point them to the rental analyzer on this page.",
  "Never say anything about schools beyond the school names the listing gives (and that being near a school does not mean the home is zoned for it), crime or safety, or who lives in the area (age, family, race, religion, origin, disability, sex). Say a Chapter3 agent can point them to the official sources.",
  "Flood zone, taxes and HOA fees: say what the listing says and that it can change; insurance comes from their own agent.",
  "No legal or tax advice. Plain short sentences, under 90 words, no lists unless they ask, no em dashes, no exclamation marks.",
].join(" ");

/** The browser half. Reads #hx-ask-data, keeps up to 6 turns, and calls the AI proxy. */
export const ASK_SCRIPT = `<script>(function(){var box=document.getElementById("hx-ask");if(!box)return;var data=document.getElementById("hx-ask-data");
var form=box.querySelector("form"),q=box.querySelector("textarea"),log=box.querySelector(".hx-ask-log"),go=box.querySelector(".hx-ask-go"),hist=[];
if(!data||!form){return}var facts=data.textContent;var RULES=${JSON.stringify(ASK_RULES)};
function add(cls,t){var p=document.createElement("p");p.className="hx-ask-m "+cls;p.textContent=t;log.appendChild(p);log.hidden=false;p.scrollIntoView({block:"nearest"});return p}
function ask(t){t=String(t||"").trim().slice(0,400);if(!t)return;add("hx-ask-you",t);var wait=add("hx-ask-ai hx-ask-wait","Reading the listing...");go.disabled=true;
 hist.push({role:"user",content:t});var msgs=hist.slice(-12);
 fetch("https://api-proxy.chapter3realty.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-5-5",max_tokens:500,system:RULES+" Listing facts (JSON): "+facts,messages:msgs})})
 .then(function(r){return r.json()}).then(function(d){var b=d&&d.content&&d.content.filter(function(x){return x.type==="text"}).pop();if(!b)throw 0;
  var a=b.text.split(String.fromCharCode(8212)).join(", ").trim();wait.textContent=a;wait.classList.remove("hx-ask-wait");hist.push({role:"assistant",content:a})})
 .catch(function(){wait.textContent="Chapter3 AI could not answer just now. Press Ask an agent and one of us will.";wait.classList.remove("hx-ask-wait");hist.pop()})
 .then(function(){go.disabled=false})}
form.addEventListener("submit",function(e){e.preventDefault();var t=q.value;q.value="";ask(t)});
q.addEventListener("keydown",function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit?form.requestSubmit():form.dispatchEvent(new Event("submit"))}});
Array.prototype.forEach.call(box.querySelectorAll("[data-ask]"),function(b){b.addEventListener("click",function(){ask(b.getAttribute("data-ask"))})});
})();</script>`;

export const ASK_CSS = `.hx-ask{padding:1rem 1.05rem 1.1rem;margin:1.4rem 0}
.hx-ask h2{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;margin:.1rem 0 .35rem;font-size:1.25rem}
.hx-ask>p{margin:0 0 .7rem;color:var(--slate,#5c6b78);font-size:.95rem}
.hx-ask-chips{display:flex;flex-wrap:wrap;gap:.4rem;margin:0 0 .7rem}
.hx-ask-chips button{font:inherit;font-size:.9rem;padding:.42rem .8rem;border-radius:999px;border:1px solid rgba(28,32,40,.18);background:#fff;color:#1c2028;cursor:pointer}
.hx-ask-chips button:hover{border-color:#c4783a}
.hx-ask-log{display:flex;flex-direction:column;gap:.5rem;margin:0 0 .7rem;max-height:26rem;overflow-y:auto}
.hx-ask-m{margin:0;padding:.6rem .8rem;border-radius:14px;font-size:.98rem;line-height:1.5;max-width:92%;white-space:pre-wrap}
.hx-ask-you{align-self:flex-end;background:#1c2028;color:#f4efe8}
.hx-ask-ai{align-self:flex-start;background:#fff;border:1px solid rgba(28,32,40,.12);color:#1c2028}
.hx-ask-wait{color:var(--slate,#5c6b78);font-style:italic}
.hx-ask form{display:flex;gap:.5rem;align-items:flex-end}
.hx-ask textarea{flex:1 1 auto;min-width:0;min-height:3rem;line-height:1.4;max-height:8rem;resize:vertical;font:inherit;font-size:1rem;padding:.65rem .8rem;border-radius:12px;border:1px solid rgba(28,32,40,.22);background:#fff;color:#1c2028}
.hx-ask textarea:focus{outline:2px solid #c4783a;outline-offset:1px}
.hx-ask-go{flex:none;min-height:2.9rem;border:0;border-radius:999px;padding:0 1.1rem;background:linear-gradient(180deg,#d4894a,#c4783a);color:#151a22;font:inherit;font-weight:700;cursor:pointer}
.hx-ask-go[disabled]{opacity:.6;cursor:default}
.hx-ask small{display:block;margin-top:.55rem;color:var(--slate,#5c6b78);font-size:.82rem;line-height:1.4}`;
