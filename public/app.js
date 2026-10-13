const post = (u, b) => fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
  .then(async r => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Not allowed'); return j; });
const toast = t => { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; document.body.append(d); setTimeout(() => d.remove(), 3200); };
document.addEventListener('submit', async e => {
  const f = e.target, m = f.querySelector('.msg');
  if (f.id === 'hs') { e.preventDefault(); const d = new FormData(f), cat = d.get('cat'), qs = new URLSearchParams();
    if (d.get('q')) qs.set('q', d.get('q')); if (d.get('max')) qs.set('max', d.get('max')); if (d.get('spec')) qs.set(cat === 'pg' ? 'occupancy' : 'bhk', d.get('spec'));
    return location.href = '/' + cat + (qs.toString() ? '?' + qs : ''); }
  if (!f.dataset.post) return; e.preventDefault();
  const d = Object.fromEntries(new FormData(f)); d.consent = !!d.consent; d.details = { ...d };
  try { await post(f.dataset.post, d); m.className = 'msg ok'; m.textContent = f.dataset.ok || 'Request received. Track it on your desk.'; f.reset(); toast('Request received'); }
  catch (er) { m.className = 'msg err'; m.textContent = er.message; }
});
document.addEventListener('click', async e => {
  const a = e.target.closest('.act'), d = e.target.closest('.decide');
  try {
    if (a) { await post(a.dataset.api, JSON.parse(a.dataset.body)); location.reload(); }
    if (d) { const c = d.closest('.case');
      await post('/api/verifier/decide', { id: c.dataset.id, decision: d.dataset.d, checks: [...c.querySelectorAll('input[type=checkbox]:checked')].map(i => i.value), reason: c.querySelector('.reason').value });
      location.reload(); }
  } catch (er) { toast(er.message); const m = e.target.closest('.case')?.querySelector('.msg'); if (m) { m.className = 'msg err'; m.textContent = er.message; } }
});

// Hero slideshow: crossfades the slides that actually loaded; pauses on hover/focus; no autoplay with reduced motion.
(() => {
  const box = document.querySelector('.heroart.slides'); if (!box) return;
  const dots = box.querySelector('.dots'), list = () => [...box.querySelectorAll('.slide')]; let cur = 0, timer;
  const draw = () => { const s = list(); if (s.length < 2) { dots.replaceChildren(); return; }
    if (dots.children.length !== s.length) dots.replaceChildren(...s.map((_, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Show slide ' + (i + 1)); b.onclick = () => { go(i); play(); }; return b; }));
    s.forEach((el, i) => { el.classList.toggle('on', i === cur); el.tabIndex = i === cur ? 0 : -1; el.setAttribute('aria-hidden', i === cur ? 'false' : 'true'); dots.children[i]?.classList.toggle('on', i === cur); }); };
  const go = i => { const n = list().length || 1; cur = (i + n) % n; draw(); };
  const play = () => { clearInterval(timer); if (!matchMedia('(prefers-reduced-motion:reduce)').matches) timer = setInterval(() => go(cur + 1), 4000); };
  box.addEventListener('mouseenter', () => clearInterval(timer)); box.addEventListener('mouseleave', play);
  box.addEventListener('focusin', () => clearInterval(timer)); box.addEventListener('focusout', play);
  draw(); play(); addEventListener('load', draw);
})();

// Hero search: the type dropdown follows the selected tab (PG sharing vs flat size).
document.addEventListener('change', e => { const f = e.target.form; if (e.target.name !== 'cat' || !f || f.id !== 'hs') return;
  const pg = e.target.value === 'pg', s = f.elements.spec, opts = pg ? ['single', '2-share', '3-share'] : ['1 RK', '1 BHK', '2 BHK', '3 BHK'];
  s.setAttribute('aria-label', pg ? 'Occupancy type' : 'Home size'); s.replaceChildren(new Option(pg ? 'Occupancy type' : 'Home size', ''), ...opts.map(o => new Option(o))); });
