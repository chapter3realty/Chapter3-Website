/* The listings search pop-up (#idxModal, on every page but /map/).
   A dialog has to be usable without a mouse and without sight: while it is open
   it is exposed to screen readers (aria-hidden off), the page behind it is inert,
   focus moves into it, Tab stays inside it, and closing it puts focus back on the
   control that opened it. Nothing here changes how it looks. */
var idxOpener = null, idxInerted = [];
function idxFocusables(m) {
  return [].slice.call(m.querySelectorAll('button, select, input, a[href], [tabindex]:not([tabindex="-1"])')).filter(function (el) {
    return !el.disabled && el.offsetParent !== null;
  });
}
function openIdx(city) {
  var m = document.getElementById("idxModal");
  if (!m) return;
  if (city) {
    var s = document.getElementById("idxCity");
    if (s) { for (var i = 0; i < s.options.length; i++) { if (s.options[i].value === city) { s.selectedIndex = i; break; } } }
  }
  if (!m.classList.contains("open")) {
    idxOpener = document.activeElement;
    idxInerted = [];
    [].slice.call(document.body.children).forEach(function (el) {
      if (el !== m && !el.contains(m) && el.tagName !== "SCRIPT" && !el.hasAttribute("inert")) { el.setAttribute("inert", ""); idxInerted.push(el); }
    });
  }
  m.classList.add("open");
  m.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  var first = document.getElementById("idxCity") || idxFocusables(m)[0];
  if (first) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
}
function closeIdx() {
  var m = document.getElementById("idxModal");
  if (!m || !m.classList.contains("open")) return;
  m.classList.remove("open");
  m.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  idxInerted.forEach(function (el) { el.removeAttribute("inert"); });
  idxInerted = [];
  if (idxOpener && document.contains(idxOpener) && idxOpener.focus) { try { idxOpener.focus({ preventScroll: true }); } catch (e) { idxOpener.focus(); } }
  idxOpener = null;
}
function idxPill(el) {
  el.classList.toggle("on");
  el.setAttribute("aria-pressed", el.classList.contains("on") ? "true" : "false");
}
function idxSearch() {
  var cc = document.getElementById("idxConsent");
  if (cc && !cc.checked) { cc.style.outline = "2px solid #c0392b"; cc.setAttribute("aria-invalid", "true"); cc.focus(); return; }
  if (cc) cc.removeAttribute("aria-invalid");
  var em = document.getElementById("idxEmail");
  var v = em.value.trim();
  if (!v || v.indexOf("@") < 1) { em.style.borderColor = "#c0392b"; em.setAttribute("aria-invalid", "true"); em.focus(); return; }
  em.removeAttribute("aria-invalid");
  var t = [].slice.call(document.querySelectorAll("#idxModal .idx-pill.on")).map(function (p) { return p.textContent; });
  var a = [].slice.call(document.querySelectorAll("#idxModal .idx-amen:checked")).map(function (c) { return c.value; });
  var crit = "City: " + document.getElementById("idxCity").value + " | Type: " + (t.join(", ") || "Any") + " | Price: " + document.getElementById("idxMin").value + " to " + document.getElementById("idxMax").value + " | Beds: " + document.getElementById("idxBeds").value + " | Baths: " + document.getElementById("idxBaths").value + " | Lot: " + document.getElementById("idxLot").value + " | MinSqFt: " + document.getElementById("idxSqft").value + " | Amenities: " + (a.join(", ") || "None");
  /* consent travels with the lead: c3SendForm refuses to send without it, and the
     criteria go in message, the field the CRM keeps */
  if (typeof c3SendForm === "function") {
    c3SendForm({ name: document.getElementById("idxName").value, email: v, phone: document.getElementById("idxPhone").value, listing_criteria: crit, message: "Listing search. " + crit, consent: cc && cc.checked ? "yes" : "no" }, "IDX Listing Search");
  }
  document.getElementById("idxForm").style.display = "none";
  var ok = document.getElementById("idxOk");
  ok.style.display = "block";
  try { ok.focus({ preventScroll: true }); } catch (e) { ok.focus(); }
}
function idxQuick() {
  var sy = function (s, d) {
    var a = document.getElementById(s), b = document.getElementById(d);
    if (a && b) { for (var i = 0; i < b.options.length; i++) { if (b.options[i].value === a.value) { b.selectedIndex = i; break; } } }
  };
  sy("q_city", "idxCity"); sy("q_beds", "idxBeds"); sy("q_baths", "idxBaths"); sy("q_min", "idxMin"); sy("q_max", "idxMax");
  var it = [].slice.call(document.querySelectorAll(".q-type:checked")).map(function (c) { return c.value; })
    .concat([].slice.call(document.querySelectorAll(".qs-chip.on")).map(function (c) { return c.getAttribute("data-v"); }));
  [].slice.call(document.querySelectorAll("#idxModal .idx-pill")).forEach(function (p) {
    if (it.indexOf(p.textContent) >= 0) p.classList.add("on"); else p.classList.remove("on");
    p.setAttribute("aria-pressed", p.classList.contains("on") ? "true" : "false");
  });
  openIdx();
}
document.addEventListener("keydown", function (e) {
  var m = document.getElementById("idxModal");
  if (!m || !m.classList.contains("open")) return;
  if (e.key === "Escape") { closeIdx(); return; }
  if (e.key !== "Tab") return;
  /* Tab and Shift+Tab wrap inside the dialog, for browsers without inert */
  var f = idxFocusables(m);
  if (!f.length) return;
  var i = f.indexOf(document.activeElement);
  if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
  else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
});
