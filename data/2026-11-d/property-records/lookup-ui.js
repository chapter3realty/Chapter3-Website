/* The property lookup on /buyers/property-records/: the box, the suggestions and the card.
 * Runs in the visitor's browser after lookup-core.js. Reads window.PR_CFG from the spec:
 *   { floodGuide: "/buyers/flood-zone-check/" or "", flooded: "/buyers/undisclosed-flooding/", zoningGuide: "...",
 *     lead: "/contact/", deedLayer: true }
 * Each line of the card fills as its source answers. A source that fails never shows an error: its line
 * becomes a link to the public map, or is left out. Nothing is stored and no name is asked for. */
(function () {
  var CFG = window.PR_CFG || {};
  var form = document.getElementById("prForm"), box = document.getElementById("prQ"), list = document.getElementById("prSug");
  var out = document.getElementById("prOut"), tryBtn = document.getElementById("prTry");
  if (!form || !box || !list || !out || typeof fetch !== "function") return;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined && text !== null) e.textContent = text; return e; }
  function link(href, text, cls, outside) {
    var a = el("a", cls || null, text); a.href = href;
    if (outside) { a.target = "_blank"; a.rel = "noopener"; }
    return a;
  }
  function enc(s) { return encodeURIComponent(s); }

  /* One request, with a time limit. Throws on a failed or error answer. */
  function getJSON(url, ms) {
    var ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 8000);
    return fetch(url, { signal: ctl ? ctl.signal : undefined, credentials: "omit" })
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (j) { clearTimeout(t); if (prBad(j)) throw new Error("source error"); return j; },
        function (e) { clearTimeout(t); throw e; });
  }
  function at(src, x, y, meters, ms) { return getJSON(PR_SRC[src] + "?" + prPointQuery(x, y, PR_FIELDS[src], meters), ms); }
  function where(src, w) { return getJSON(PR_SRC[src] + "?where=" + enc(w) + "&outFields=" + enc(PR_FIELDS[src]) + "&returnGeometry=false&f=json", 8000); }

  /* FEMA first, tried twice (it drops connections); then the county's copy (R7, R8). */
  function flood(x, y) {
    var tries = 0;
    function fromCounty(e) { return at("countyFlood", x, y, 0, 6000).then(function (j) { var f = prFlood(j); if (!f) throw e; return f; }); }
    function go() {
      tries++;
      return at("fema", x, y, 0, 5000).then(function (j) { var f = prFlood(j); if (!f) throw new Error("no zone"); return f; })
        .catch(function (e) { return tries < 2 ? go() : fromCounty(e); });
    }
    return go();
  }

  /* ---------- The card ---------- */
  var seq = 0;
  var ORDER = ["addr", "parcel", "land", "town", "zoning", "flood", "evac", "records", "homes"];
  var LABEL = { addr: "Address", parcel: "Parcel", land: "Land", town: "Town", flood: "Flood", evac: "Hurricane", zoning: "Zoning", records: "Records", homes: "Homes", county: "County" };
  var rows = {};

  function start(keys) {
    out.textContent = ""; rows = {};
    var dl = el("dl", "pr-dl");
    keys.forEach(function (k) {
      var r = el("div", "pr-r"), dt = el("dt", null, LABEL[k]), dd = el("dd");
      dd.appendChild(el("span", "pr-load"));
      r.appendChild(dt); r.appendChild(dd); dl.appendChild(r); rows[k] = r;
    });
    out.appendChild(dl);
    out.hidden = false;
  }
  function set(k) {
    var r = rows[k]; if (!r) return;
    var dd = r.querySelector("dd"); dd.textContent = "";
    for (var i = 1; i < arguments.length; i++) { var v = arguments[i]; if (v === null || v === undefined) continue; dd.appendChild(typeof v === "string" ? el("span", "pr-v", v) : v); }
  }
  function drop(k) { var r = rows[k]; if (r && r.parentNode) r.parentNode.removeChild(r); delete rows[k]; }
  function line(text) { return el("span", "pr-v", text); }
  function small(node) { var p = el("span", "pr-more"); p.appendChild(node); return p; }
  function buttons(items) {
    var w = el("span", "pr-btns");
    items.forEach(function (b) { w.appendChild(link(b.href, b.label, "pr-b", /^https:/.test(b.href))); });
    return w;
  }
  function offer(text, label) {
    var f = el("div", "pr-offer");
    f.appendChild(el("p", null, text));
    f.appendChild(link(CFG.lead || "/contact/", label, "btn btn-brass"));
    out.appendChild(f);
  }
  /* A live strip of homes for sale within a mile of the address (owner, 2026-11-14). The link under it
     is the fallback when the strip is empty or fails. */
  function homesStrip(x, y) {
    var w = el("div", "hx-strip hx-qs pr-strip");
    var q = prHomesStripQ(x, y);
    var fb = link(prHomesHref(x, y), "See homes for sale near this address", "pr-b");
    var fbw = el("span", "pr-btns"); fbw.appendChild(fb);
    var box = el("div"); box.appendChild(w); box.appendChild(fbw);
    try {
      fetch("/homes/api/strip?" + q, { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
        if (!j || !j.ok || !j.html || j.html.indexOf("hx-s-empty") > -1) return;
        var hd = el("p", "hx-s-head"), b = el("b", null, "Homes for sale within a mile of this address");
        hd.appendChild(b);
        if (j.link && j.link.charAt(0) === "/") { var a = el("a", null, "See all"); a.href = j.link; hd.appendChild(a); }
        var row = el("div", "hx-s-row"); row.innerHTML = j.html;
        w.appendChild(hd); w.appendChild(row);
        if (fbw.parentNode) fbw.parentNode.removeChild(fbw);
      }).catch(function () {});
    } catch (e) {}
    return box;
  }
  function copyBtn(pin) {
    var b = el("button", "pr-copy", "Copy"); b.type = "button"; b.setAttribute("aria-label", "Copy the parcel number " + pin);
    b.addEventListener("click", function () {
      var done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(pin).then(done, function () {});
    });
    return b;
  }

  function georgetown() {
    start(["county", "records", "homes"]);
    set("county", "Georgetown County. Pawleys Island and Litchfield records are Georgetown's, and this lookup reads Horry County's maps.");
    set("records", buttons([{ label: "Georgetown map", href: PR_LINKS.gtMap }, { label: "Georgetown deeds", href: PR_LINKS.gtDeeds }, { label: "Georgetown tax bills", href: PR_LINKS.gtTax }]));
    set("homes", buttons([{ label: "Pawleys Island guide and homes for sale", href: "/submarkets/pawleys-island/" }]));
  }

  function miss(why) {
    start(["addr"]);
    var msg = why === "street" ? "Add the house number, then look it up again."
      : why === "service" ? "The county's address finder did not answer. Try again in a minute, or find the lot on the county's map."
        : "We could not find that address in Horry County. Try the house number and street name, or find the lot on the county's map.";
    set("addr", line(msg), why === "street" ? null : small(link(PR_LINKS.parcelMap, "Open the county's map (county sign-in)", null, true)));
  }

  function found(m, my) {
    start(ORDER);
    set("addr", prNice(m.address));
    var x = m.x, y = m.y, live = function () { return my === seq; };

    var pParcels = at("parcels", x, y).then(prParcels, function () { return null; });
    var pPoint = at("points", x, y, 5).then(prPointPin, function () { return ""; });
    var pTown = at("towns", x, y).then(prTown, function () { return null; });
    var pEvac = at("evac", x, y).then(prEvac, function () { return null; });
    var pFlood = flood(x, y).catch(function () { return null; });
    var pSup = at("supFlood", x, y).then(prSupFlood, function () { return null; });

    set("homes", homesStrip(x, y));

    /* Parcel, land and records (R3 to R6, R13 to R16). */
    Promise.all([pParcels, pPoint]).then(function (r) {
      if (!live()) return;
      var p = r[0], apin = r[1];
      if (p && p.n > 1) {
        set("parcel", line(p.n.toLocaleString("en-US") + " parcel numbers at this address: each unit in the building has its own."));
        drop("land");
        set("records", buttons(prRecordLinks("", null)));
        return;
      }
      var got = p && p.n === 1 ? Promise.resolve(p)
        : p && p.n === 0 && apin ? where("parcels", "PIN=" + apin).then(prParcels).then(function (q) { return q && q.n === 1 ? q : { n: 1, pin: apin, tms: "", lot: "", sqft: 0 }; }, function () { return { n: 1, pin: apin, tms: "", lot: "", sqft: 0 }; })
          : Promise.resolve(null);
      got.then(function (q) {
        if (!live()) return;
        if (!q || !q.pin) {
          set("parcel", link(PR_LINKS.parcelMap, "Find the lot on the county's map (county sign-in)", null, true));
          drop("land");
          set("records", buttons(prRecordLinks("", null)));
          return;
        }
        var pinLine = el("span", "pr-v"); pinLine.appendChild(document.createTextNode("PIN " + q.pin + " ")); pinLine.appendChild(copyBtn(q.pin));
        var extra = [q.tms ? "TMS " + q.tms : "", q.lot && !/^C\/A/i.test(q.lot) ? "Lot " + q.lot : ""].filter(Boolean).join(" · ");
        set("parcel", pinLine, extra ? el("span", "pr-more", extra) : null);
        var pDeed = CFG.deedLayer ? where("deeds", "PIN=" + q.pin).then(prDeed, function () { return null; }) : Promise.resolve(null);
        pDeed.then(function (d) {
          if (!live()) return;
          var acres = prAcres(d, q.sqft);
          if (acres) set("land", acres); else drop("land");
          var noBill = CFG.noBill && CFG.noBill[q.pin];
          set("records", buttons(prRecordLinks(q.pin, d)), noBill ? el("span", "pr-more", noBill) : null);
        });
      });
    });

    /* Town and zoning (R10, R12, R17 to R20). */
    pTown.then(function (town) {
      if (!live()) return;
      if (town === null) { drop("town"); drop("zoning"); return; }
      set("town", prTownText(town, m.city));
      if (town) { drop("zoning"); return; }
      at("zoning", x, y).then(prZoning, function () { return null; }).then(function (z) {
        if (!live()) return;
        if (!z) { drop("zoning"); return; }
        set("zoning", line("County zoning code " + z + "."), CFG.zoningGuide ? small(link(CFG.zoningGuide, "What the zoning codes mean")) : null);
      });
    });

    /* Flood (R7 to R9, R23 to R26). */
    Promise.all([pFlood, pSup]).then(function (r) {
      if (!live()) return;
      var f = r[0], sup = r[1];
      var parts = [];
      if (f) {
        parts.push(line(f.text));
        if (CFG.floodGuide) parts.push(small(link(CFG.floodGuide, "What your zone means when you buy")));
      } else parts.push(small(link(PR_LINKS.fema, "FEMA's flood map did not answer. Open FEMA's flood map", null, true)));
      if (sup) {
        parts.push(el("span", "pr-more", "Also inside the county's Supplemental Flood Zone, which approximates how far Hurricane Florence's water reached."));
        if (CFG.flooded) parts.push(small(link(CFG.flooded, "How to find out if a house flooded")));
      }
      set.apply(null, ["flood"].concat(parts));
    });

    /* Hurricane evacuation zone (R11). */
    pEvac.then(function (z) {
      if (!live()) return;
      if (z === null) drop("evac"); else set("evac", prEvacText(z));
    });

    pParcels.then(function (p) {
      if (!live()) return;
      if (p && p.n > 1) offer("Tell us the unit number. We send that unit's deed, tax bill and HOA papers, free.", "Send us the unit number");
    });
  }

  function lookup(text, magicKey) {
    var q = String(text || "").trim();
    if (!q) { box.focus(); return; }
    hideList();
    var my = ++seq;
    if (prIsGeorgetown(q)) { georgetown(); return; }
    start(["addr"]);
    var url = PR_SRC.locator + "/findAddressCandidates?SingleLine=" + enc(q) + (magicKey ? "&magicKey=" + enc(magicKey) : "")
      + "&outFields=Addr_type,Match_addr,City&maxLocations=5&outSR=4326&f=json";
    getJSON(url, 8000).then(prPickMatch, function () { return { ok: false, why: "service" }; }).then(function (m) {
      if (my !== seq) return;
      if (!m.ok) miss(m.why); else found(m, my);
    });
  }

  /* ---------- Suggestions as you type (R2): at most five, tap to pick ---------- */
  var timer = null, sugSeq = 0, active = -1, items = [];
  function hideList() { clearTimeout(timer); sugSeq++; list.hidden = true; list.textContent = ""; items = []; active = -1; box.setAttribute("aria-expanded", "false"); box.removeAttribute("aria-activedescendant"); }
  function mark(i) {
    active = i;
    items.forEach(function (li, j) { li.setAttribute("aria-selected", j === i ? "true" : "false"); });
    if (i >= 0) box.setAttribute("aria-activedescendant", items[i].id); else box.removeAttribute("aria-activedescendant");
  }
  function pick(s) { box.value = s.text; lookup(s.text, s.magicKey); }
  box.addEventListener("input", function () {
    clearTimeout(timer);
    var t = box.value.trim();
    if (t.length < 4 || prIsGeorgetown(t)) { hideList(); return; }
    timer = setTimeout(function () {
      var my = ++sugSeq;
      getJSON(PR_SRC.locator + "/suggest?text=" + enc(t) + "&maxSuggestions=5&f=json", 4000).then(function (j) {
        if (my !== sugSeq || box.value.trim() !== t) return;
        var s = (j.suggestions || []).filter(function (x) { return x && x.text && !x.isCollection; }).slice(0, 5);
        list.textContent = ""; items = []; active = -1;
        if (!s.length) { hideList(); return; }
        s.forEach(function (x, i) {
          var li = el("li", "pr-opt", x.text); li.id = "prOpt" + i; li.setAttribute("role", "option"); li.setAttribute("aria-selected", "false");
          li.addEventListener("mousedown", function (e) { e.preventDefault(); pick(x); });
          li._s = x; list.appendChild(li); items.push(li);
        });
        list.hidden = false; box.setAttribute("aria-expanded", "true");
      }, function () { hideList(); });
    }, 220);
  });
  box.addEventListener("keydown", function (e) {
    if (list.hidden || !items.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); mark((active + 1) % items.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); mark(active <= 0 ? items.length - 1 : active - 1); }
    else if (e.key === "Escape") hideList();
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(items[active]._s); }
  });
  box.addEventListener("blur", function () { setTimeout(hideList, 150); });
  form.addEventListener("submit", function (e) { e.preventDefault(); lookup(box.value); });
  if (tryBtn) tryBtn.addEventListener("click", function () { box.value = tryBtn.getAttribute("data-q"); lookup(box.value); });
})();
