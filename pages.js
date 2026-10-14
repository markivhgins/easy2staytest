// Server-rendered pages matching the sitemap in the architecture doc.
module.exports = (app, { search, publishedFor, shape, all, need, als }) => {
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const inr = p => '₹' + (p / 100).toLocaleString('en-IN');
const ago = d => d ? d + 'd ago' : 'today';
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const when = d => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
// Stock photos (Unsplash CDN). Each <img> removes itself if it fails to load, revealing the drawn plan underneath.
const U = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=70&w=`;
const PH = {
  pg: ['1555854877-bab0e564b8d5', '1522771739844-6a9f6d5f14af', '1505691938895-1758d7feb511'],
  flat: ['1522708323590-d24dbb6b0267', '1502672260266-1c1ef2d93688', '1493809842364-78817add7ffb', '1554995207-c18c203602cb'],
  house: ['1560448204-e02f11c3d0e2', '1512917774080-9991f1c4c750', '1600585154340-be6161a56a0c'],
  hero: '1560518883-ce09059eeffa', students: '1523240795612-9a054b0db644', owner: '1560448204-e02f11c3d0e2', team: '1556761175-5973dc0f32e7',
  food: '1546069901-ba9599a7e63c', water: '1548839140-29a749e1cf4d', movers: '1600518464441-9154a4dea21b', pgT: '1555854877-bab0e564b8d5', flatT: '1522708323590-d24dbb6b0267', socT: '1512917774080-9991f1c4c750',
  contact: '1423666639041-f56000c27a9a', city: '1477959858617-67f85cf4f1df'
};
const photo = (id, w = 800, alt = '') => `<img class="ph" src="${U(id)}${w}" alt="${esc(alt)}" loading="lazy" onerror="var p=this.parentNode;this.remove();if(!p.querySelector('svg'))p.remove()">`;
const HERO = [[PH.hero, 'Verified homes in Prayagraj', '/society'], [PH.pg[0], 'PG for students', '/pg'], [PH.flat[0], 'Flats for professionals', '/flats'], [PH.house[1], 'Society & residential', '/society'], [PH.students, 'Settle in with local services', '/services']];
const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const listPhoto = (x, w) => { const k = x.accommodationType === 'PG' ? 'pg' : x.accommodationType === 'house' ? 'house' : 'flat'; const a = PH[k]; return photo(a[hash(x.slug) % a.length], w, x.title); };
const ELEC = { metered: 'Metered', included: 'Included in rent', actuals: 'Billed on actuals', fixed: 'Fixed' };

// Floor plan drawn from the listing's own data: one room per bed-share or bedroom.
const plan = x => {
  const n = Math.min(4, parseInt(x.bhk || x.occupancy) || 1), w = 180 / n, t = (X, Y, s) => `<text x="${X}" y="${Y}" font-size="7" fill="currentColor" stroke="none" font-weight="700">${s}</text>`;
  let s = `<svg viewBox="0 0 200 146" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="10" y="10" width="180" height="120"/><line x1="10" y1="80" x2="190" y2="80"/>`;
  for (let i = 0; i < n; i++) {
    const X = 10 + i * w; if (i) s += `<line x1="${X}" y1="10" x2="${X}" y2="80"/>`;
    s += `<rect x="${X + 8}" y="24" width="${w - 16}" height="26" stroke-width="1.4"/><path d="M${X + w - 14} 80 a12 12 0 0 1 -12 -12" stroke-width="1.2"/>` + t(X + 8, 19, (x.bhk ? 'Bed ' : 'Room ') + (i + 1));
  }
  return s + `<rect x="148" y="92" width="32" height="28" stroke-width="1.4"/><circle cx="52" cy="106" r="12" stroke-width="1.4"/>${t(14, 92, 'Hall')}${t(150, 89, 'Kitchen')}<path d="M10 138h180M10 135v6M190 135v6" stroke-width="1"/>${t(86, 146, '9.0 m')}</svg>`;
};
const card = x => `<a class="card" href="/listing/${x.slug}"><div class="art">${plan(x)}${listPhoto(x, 700)}<span class="seal">Checked ${ago(x.verifiedAgeDays)}</span></div>
<div class="cb"><h3>${esc(x.title)}</h3><p>${x.locality}${x.society ? ' · ' + esc(x.society) : ''}</p>
<p class="tags"><i>${x.occupancy || x.bhk}</i><i>${x.gender === 'any' ? x.furnishing : x.gender}</i>${x.meals ? `<i>${x.meals}</i>` : ''}</p>
<div class="pr"><b>${inr(x.price.rent)}</b><span>/month · ${inr(x.moveInTotal)} to move in</span></div>
<small class="${x.stale ? 'warn' : ''}">${x.stale ? 'Availability last confirmed ' + ago(x.availAgeDays) : 'Availability confirmed ' + ago(x.availAgeDays)}</small></div></a>`;

const NAV = [['/', 'Home'], ['/pg', 'Find Room'], ['/services/movers', 'Shifting'], ['/services/food', 'Tiffin'], ['/services/water', 'RO Water'], ['/list-your-property', 'For Owners'], ['/about', 'About Us'], ['/help', 'Help']];
const layout = (title, body, path = '') => { const m = als.getStore(); return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | Easy2Stay Prayagraj</title><link rel="icon" type="image/png" href="/static/img/favicon.png"><link rel="apple-touch-icon" href="/static/img/apple-touch-icon.png"><meta name="theme-color" content="#1557D6"><link rel="stylesheet" href="/static/style.css"><link rel="stylesheet" href="/static/theme.css"><link rel="stylesheet" href="/static/home.css"></head><body>
<header><a class="logo" href="/" aria-label="Easy2Stay home"><img src="/static/img/logo-icon.png" alt="" width="44" height="44"><span>Easy<b>2</b>Stay</span></a><nav id="mainnav" aria-label="Main">${NAV.map(([h, t]) => `<a href="${h}"${(h === '/' ? path === '/' || path === '' : path.startsWith(h)) ? ' class="on"' : ''}>${t}</a>`).join('')}${m ? '<a class="navso" href="/logout">Sign out</a>' : ''}</nav>
<span class="cityp">${S(HI.pin)}${CITY}</span><a class="me" href="${m ? '/portal' : '/login'}">${m ? esc(m.name) + ' · My desk' : 'Login'}</a>${m ? '<a class="so" href="/logout">Sign out</a>' : ''}<button type="button" class="nt" aria-label="Open menu" aria-expanded="false" aria-controls="mainnav"><span></span><span></span><span></span></button></header>${body}
<footer><div><a class="flogo" href="/" aria-label="Easy2Stay home"><img src="/static/img/logo-wide.webp" alt="Easy2Stay: Your Journey Begins with the Right Stay" width="300" height="98"></a><p>Verified stays and everyday services in Prayagraj.</p></div>
<div><h4>Stays</h4><a href="/pg">PG for students</a><a href="/flats">Flats for professionals</a><a href="/society">Society homes</a></div>
<div><h4>Services</h4><a href="/services/food">Tiffin</a><a href="/services/water">Water jars</a><a href="/services/movers">Packers & movers</a></div>
<div><h4>Company</h4><a href="/how-verification-works">How we verify</a><a href="/list-your-property">List your property</a><a href="/about">About us</a><a href="/contact">Contact us</a><a href="/help">Help & FAQs</a><a href="/login">Owner, partner & staff sign-in</a></div><div class="fbar"><span>© ${new Date().getFullYear()} Easy2Stay. Verified stays and services in Prayagraj.</span><span>Your Journey Begins with the Right Stay</span></div></footer>
<nav class="bnav" aria-label="Quick">${[['/', 'Home', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>'], ['/pg', 'PG', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18v-7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v7M3 15h18M6 8V5h12v3"/></svg>'], ['/flats', 'Flats', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V4h10v17M14 9h6v12M8 8h2M8 12h2M8 16h2M17 13h0M17 17h0"/></svg>'], ['/services', 'Services', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.4 2.4-2.6-.6-.6-2.6z"/></svg>'], [m ? '/portal' : '/login', m ? 'My desk' : 'Sign in', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>']].map(([h, t, i]) => `<a href="${h}"${(h === '/' ? path === '' || path === '/' : path.startsWith(h)) ? ' class="on"' : ''}>${i}${t}</a>`).join('')}</nav>
<script src="/static/app.js"></script></body></html>`; };

const sel = (n, label, opts, cur) => `<label>${label}<select name="${n}"><option value="">Any</option>${opts.map(o => `<option${o === cur ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
const form = (api, fields, btn, extra = '') => `<form data-post="${api}">${extra}${fields}
<label class="chk"><input type="checkbox" name="consent"> I agree to share my contact details with Easy2Stay and the people handling this request.</label><button class="go">${btn}</button><p class="msg" role="status"></p></form>`;
const who = `<input name="name" placeholder="Your name" autocomplete="name"><input name="phone" placeholder="10-digit phone" inputmode="numeric" autocomplete="tel">`;

// ---------- Home ----------
const IC = {
  shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 5-5"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  cal: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4M9 15l2 2 4-4"/>',
  badge: '<path d="M12 2.5l2.4 2 3.1-.3 1 3 2.6 1.8-1 3 1 3-2.6 1.8-1 3-3.1-.3-2.4 2-2.4-2-3.1.3-1-3L3 15.8l1-3-1-3 2.6-1.8 1-3 3.1.3z"/><path d="M9 12l2 2 4-4"/>'
};
const ico = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;
const CITY = 'Prayagraj', BRAND = 'Easy2Stay';
const S = (p, w = 2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const HI = { home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>', truck: '<path d="M2 6h11v10H2zM13 9h4l3 3v4h-7M6 19a2 2 0 1 0 0-.01M17 19a2 2 0 1 0 0-.01"/>', food: '<path d="M4 11h16a8 8 0 0 1-16 0zM8 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4"/>', drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', pin: '<path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>', cmp: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 12l2 2 4-4"/>', cal: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>', smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14c1 2 7 2 8 0M9 9.5h.01M15 9.5h.01"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 5-5"/>', tag: '<path d="M4 4h8l8 8-8 8-8-8z"/><path d="M8 8h.01"/>', users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.5 3-5.5 6.5-5.5s5.9 2 6.5 5.5M16 5a3.5 3.5 0 0 1 0 7M18 14.8c2 .6 3.2 2.4 3.5 5.2"/>', heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>' };
const hi = (k, w) => S(HI[k], w);
const fcard = x => `<a class="fc" href="/listing/${x.slug}"><div class="fi">${plan(x)}${listPhoto(x, 600)}<span class="vb">${hi('shield', 2.6)}Verified</span></div><div class="fb"><h3>${esc(x.title)}</h3><p class="fp"><b>${inr(x.price.rent)}</b> <span>/ month</span></p>
<p class="fl">${hi('pin')}${esc(x.locality)}</p><p class="ft">${[x.occupancy || x.bhk, x.gender === 'any' ? x.furnishing : x.gender, ...(x.amenities || []).slice(0, 1)].filter(Boolean).map(t => `<i>${esc(t)}</i>`).join('')}</p></div></a>`;
app.get('/', async (_, res) => {
  const allL = await search(), top = [...allL].sort((a, b) => a.verifiedAgeDays - b.verifiedAgeDays).slice(0, 8);
  const tabs = [['pg', 'Rooms', 'home'], ['movers', 'Shifting', 'truck'], ['food', 'Tiffin', 'food'], ['water', 'RO Water', 'drop']];
  const chips = [['PG for Boys', '/pg?gender=boys'], ['PG for Girls', '/pg?gender=girls'], ['1 BHK', '/flats?bhk=1 BHK'], ['2 BHK', '/flats?bhk=2 BHK'], ['Shared Room', '/pg?occupancy=2-share'], ['Society Homes', '/society']];
  const svc = [['movers', 'Shifting', 'Safe & hassle-free', 'Book Shifting', 'truck'], ['food', 'Tiffin', 'Healthy | Home style', 'Explore Tiffin', 'food'], ['water', 'RO Water', 'Clean | Safe | Regular supply', 'Order Water', 'drop']];
  res.send(layout('Verified rooms, shifting, tiffin and RO water', `
<section class="h2hero"><div class="wrap h2g"><div class="h2txt"><p class="h2eye">Study | Work | Live | Grow</p><h1>Your Journey Begins with <em>The Right Stay</em></h1>
<p class="h2lead">Verified rooms, hassle-free shifting, healthy food and clean water. All in one platform.</p>
<ul class="h2trust">${[['shield', 'Verified properties'], ['tag', 'Transparent pricing'], ['users', 'Trusted community']].map(([i, t]) => `<li>${hi(i)}${t}</li>`).join('')}</ul></div>
<div class="h2pic"><span class="h2note">New City<br>New Friends<br>Right Stay</span><img class="ph" src="${U(PH.students)}900" alt="Students and young professionals" onerror="this.remove()"></div>
<aside class="h2more"><b>More than just a room</b>${tabs.map(([k, t, i]) => `<a href="${k === 'pg' ? '/pg' : '/services/' + k}">${hi(i)}${t}${hi('arrow')}</a>`).join('')}</aside></div>
<div class="wrap"><form id="hs" class="h2s"><div class="h2tabs" role="radiogroup" aria-label="What are you looking for">${tabs.map(([k, t, i], n) => `<label><input type="radio" name="cat" value="${k}"${n ? '' : ' checked'}><span>${hi(i)}${t}</span></label>`).join('')}</div>
<div class="h2bar"><label class="h2f">${hi('search')}<input name="q" placeholder="Search PG, flat, room near you..." autocomplete="off" aria-label="Search"></label><label class="h2f h2b">${hi('pin')}<select name="max" aria-label="Budget"><option value="">Any budget</option><option value="6000">Up to ₹6,000</option><option value="10000">Up to ₹10,000</option><option value="20000">Up to ₹20,000</option></select></label><button class="h2go">${hi('search', 2.6)}Search</button></div></form>
<div class="h2chips">${chips.map(([t, h]) => `<a href="${h}">${t}</a>`).join('')}</div></div></section>

<section class="h2feat"><div class="wrap">${[['home', 'Verified Rooms', 'PG | Flat | Shared Room', 'b'], ['truck', 'Easy Shifting', 'Safe & affordable', 'o'], ['food', 'Home Style Tiffin', 'Healthy, tasty, affordable', 'g'], ['drop', 'RO Water Supply', 'Clean | Safe | At your doorstep', 'c']].map(([i, t, d, c]) => `<div><span class="ib ${c}">${hi(i)}</span><p><b>${t}</b>${d}</p></div>`).join('')}</div></section>

<section class="h2sec"><div class="wrap"><div class="h2h"><h2>Featured Rooms in <em>${CITY}</em></h2><a href="/pg">View All ${hi('arrow')}</a></div><div class="h2row">${top.map(fcard).join('')}</div></div></section>

<section class="h2sec"><div class="wrap h2how"><h2>How <em>${BRAND}</em> Works?</h2><ol>${[['search', 'Search', 'Find verified rooms and services near you'], ['cmp', 'Compare', 'View photos, price, amenities and location'], ['cal', 'Book / Visit', 'Connect with verified owner or partner'], ['smile', 'Move In & Settle', 'Get shifting, tiffin and RO water easily']].map(([i, t, d], n) => `<li><span class="hn">${n + 1}</span><span class="hi">${hi(i)}</span><b>${t}</b><small>${d}</small></li>`).join('')}</ol></div></section>

<section class="h2sec"><div class="wrap h2svc">${svc.map(([k, t, d, b, i]) => `<div class="sv ${k}"><div class="svp">${photo(PH[k], 700, t)}</div><div class="svt"><span class="ib">${hi(i)}</span><h3>${t}</h3><p>${d}</p><a class="svb" href="/services/${k}">${b} ${hi('arrow')}</a></div></div>`).join('')}</div></section>

<section class="h2sec"><div class="wrap"><div class="h2app"><div><h2>Download ${BRAND} App</h2><p>Find rooms, book services and manage everything on the go!</p><div class="stores"><a href="#" aria-label="Get it on Google Play"><small>GET IT ON</small>Google Play</a><a href="#" aria-label="Download on the App Store"><small>Download on the</small>App Store</a></div></div><div class="phone" aria-hidden="true"><img src="/static/img/logo-icon.png" alt="" width="72" height="72"><b>${BRAND}</b></div></div></div></section>

<section class="h2stats"><div class="wrap">${[['users', allL.length + '+', 'Verified stays live'], ['home', new Set(allL.map(x => x.locality)).size + '+', 'Localities covered'], ['pin', CITY, 'Launch city'], ['heart', 'All-in-One', 'Stay | Shifting | Tiffin | RO Water']].map(([i, n, t]) => `<div><span class="ib">${hi(i)}</span><p><b>${n}</b>${t}</p></div>`).join('')}</div></section>

<section class="owner"><div class="wrap two"><div><h2>Own a PG, flat or house in ${CITY}?</h2><p class="lead">List it free. We verify it, you control availability, and tenants arrive having seen the full price.</p></div><div class="ocol"><a class="go light" href="/list-your-property">List your property</a><a href="/login">Owner sign-in</a></div></div></section>`, '/'));
});

// ---------- Search results ----------
const CFG = { pg: ['PG for students', 'Boys, girls and co-ed stays, priced per bed.'], flats: ['Flats for professionals', 'Rooms, 1RK and BHK with itemised costs.'], society: ['Society and residential', 'Homes grouped by community.'] };
app.get('/:entry(pg|flats|society)', async (req, res) => {
  const e = req.params.entry, q = req.query, rows = await search(e, q);
  const socs = [...new Set((await publishedFor('society')).map(x => x.society).filter(Boolean))];
  const spec = e === 'pg' ? sel('gender', 'Who it is for', ['boys', 'girls', 'co-ed'], q.gender) + sel('occupancy', 'Sharing', ['single', '2-share', '3-share'], q.occupancy) + `<label class="chk"><input type="checkbox" name="meals" value="1"${q.meals ? ' checked' : ''}> Meals included</label>`
    : sel('bhk', 'Size', ['1 RK', '1 BHK', '2 BHK', '3 BHK'], q.bhk) + sel('furnishing', 'Furnishing', ['Unfurnished', 'Semi-furnished', 'Fully furnished'], q.furnishing) + (e === 'society' ? sel('society', 'Society', socs, q.society) : '');
  res.send(layout(CFG[e][0], `<section class="head"><div class="wrap"><h1>${CFG[e][0]}</h1><p>${CFG[e][1]}</p></div></section>
<div class="wrap split"><form class="filters" action="/${e}"><h3>Filters</h3><label>Locality or landmark<input name="q" value="${esc(q.q)}" placeholder="Katra, Civil Lines"></label>
<label>Max rent: <span id="mv">${q.max ? '₹' + (+q.max).toLocaleString('en-IN') : 'Any'}</span><input type="range" name="max" min="3000" max="30000" step="500" value="${q.max || 30000}" oninput="mv.textContent='₹'+(+this.value).toLocaleString('en-IN')"></label>
${spec}<label>Sort by<select name="sort"><option value="">Recently confirmed</option><option value="low"${q.sort === 'low' ? ' selected' : ''}>Rent, low to high</option><option value="high"${q.sort === 'high' ? ' selected' : ''}>Rent, high to low</option></select></label>
<button class="go">Apply</button><a href="/${e}">Clear all</a></form>
<div><p class="count"><b>${rows.length}</b> verified ${rows.length === 1 ? 'stay' : 'stays'}</p>${rows.length ? `<div class="grid two">${rows.map(card).join('')}</div>` : '<div class="empty"><h3>Nothing matches yet</h3><p>Raise the max rent or clear a filter.</p></div>'}</div></div>`, '/' + e));
});

// ---------- Listing detail ----------
app.get('/listing/:slug', async (req, res) => {
  const l = (await publishedFor()).find(x => x.slug === req.params.slug);
  if (!l) return res.status(404).send(layout('Not found', '<div class="wrap empty"><h1>This stay is no longer listed</h1><p>It may have been paused or its verification has lapsed. <a href="/pg">Browse current stays</a></p></div>'));
  const x = shape(l), p = x.price, back = x.entryPoints[0];
  res.send(layout(x.title, `<div class="wrap crumbs"><a href="/">Home</a> / <a href="/${back}">${CFG[back][0]}</a> / ${esc(x.title)}</div>
<div class="wrap detail"><div><div class="bigart">${plan(x)}${listPhoto(x, 1200)}<span class="seal">Checked ${ago(x.verifiedAgeDays)}</span></div>
<h1>${esc(x.title)}</h1><p class="sub">${x.locality}, Prayagraj${x.society ? ` · <a href="/society/${slug(x.society)}">${esc(x.society)}</a>` : ''}</p>
<nav class="jump"><a href="#unit">Unit</a><a href="#price">Pricing</a><a href="#amen">Amenities</a><a href="#rules">Rules</a><a href="#loc">Location</a><a href="#ver">Verification</a></nav>
<h2 id="unit">Unit options</h2><div class="kv"><div><span>Type</span>${x.accommodationType}</div><div><span>${x.bhk ? 'Size' : 'Sharing'}</span>${x.bhk || x.occupancy}</div><div><span>For</span>${x.gender === 'any' ? 'Anyone' : x.gender}</div><div><span>Furnishing</span>${x.furnishing || 'Furnished bed + cupboard'}</div></div>
<h2 id="price">Pricing</h2><table><tr><td>Rent</td><td>${inr(p.rent)} / month</td></tr><tr><td>Deposit, refundable</td><td>${inr(p.deposit)}</td></tr><tr><td>Maintenance</td><td>${p.maintenance ? inr(p.maintenance) + ' / month' : 'Included'}</td></tr><tr><td>Electricity</td><td>${ELEC[p.electricity]}</td></tr><tr class="tot"><td>Estimated move-in total</td><td>${inr(x.moveInTotal)}</td></tr></table>
<h2 id="amen">Amenities</h2><p class="tags big">${x.amenities.map(a => `<i>${a}</i>`).join('')}${x.meals ? `<i>${x.meals}</i>` : ''}</p>
<h2 id="rules">Rules</h2><p>${x.gate ? `Gate closes at ${x.gate}. ` : ''}${x.accommodationType === 'PG' ? 'Visitors only in the common area.' : 'Lease and notice terms are confirmed when your visit is scheduled.'}</p>
<h2 id="loc">Location</h2><p>${x.locality}, Prayagraj. Exact address is shared after your visit is confirmed.</p>
<h2 id="ver">Verification</h2><div class="ver"><p><b>Checked ${ago(x.verifiedAgeDays)}:</b> authentic location and real photos.</p><p>Availability confirmed ${ago(x.availAgeDays)}. Valid until ${new Date(x.verifiedUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.</p><a href="/help">Report a mismatch</a></div></div>
<aside class="book"><b class="big">${inr(p.rent)}</b><span>/month</span><p>${inr(x.moveInTotal)} to move in</p>
${form('/api/enquiries', `<select name="kind"><option>Request a visit</option><option>Request a callback</option></select><input name="slot" type="datetime-local" aria-label="Preferred time">${who}`, 'Send request', `<input type="hidden" name="slug" value="${x.slug}">`)}</aside></div>`, '/' + back));
});

// ---------- Society ----------
app.get('/society/:s', async (req, res) => {
  const rows = (await search()).filter(x => x.society && slug(x.society) === req.params.s);
  if (!rows.length) return res.redirect('/society');
  res.send(layout(rows[0].society, `<section class="head"><div class="wrap"><h1>${esc(rows[0].society)}</h1><p>${rows[0].locality}, Prayagraj · ${[...new Set(rows.flatMap(r => r.amenities))].join(' · ')}</p></div></section><div class="wrap"><div class="grid">${rows.map(card).join('')}</div></div>`, '/society'));
});

// ---------- Services ----------
const SVC = {
  food: ['Tiffin & meals', 'Daily meals from approved kitchens. Provider sets the price: confirm with provider.', `<input name="locality" placeholder="Your locality"><select name="meals"><option>1 meal a day</option><option>2 meals a day</option><option>3 meals a day</option></select><select name="diet"><option>Vegetarian</option><option>Non-vegetarian</option></select><input name="start" type="date" aria-label="Start date">`],
  water: ['Water jars', 'Regular jar delivery. Pricing, billing and jar returns are handled by the supplier.', `<input name="locality" placeholder="Delivery address or locality"><select name="size"><option>20L jar</option><option>10L jar</option></select><select name="freq"><option>Daily</option><option>Alternate days</option><option>Weekly</option></select><input name="qty" type="number" min="1" value="1" aria-label="Quantity">`],
  movers: ['Packers & movers', 'Tell us about your move. Approved movers send you quotes; you choose.', `<input name="from" placeholder="Moving from"><input name="to" placeholder="Moving to"><input name="date" type="date" aria-label="Move date"><select name="size"><option>1 RK / room</option><option>1 BHK</option><option>2 BHK</option><option>3 BHK</option></select><select name="pack"><option>Packing needed</option><option>Moving only</option></select>`]
};
app.get('/services', (_, res) => res.send(layout('Services', `<section class="head"><div class="wrap"><h1>Services after the move</h1><p>Local providers do the work and set the price. We connect you and keep the request on record.</p></div></section><div class="wrap"><div class="trio big">${Object.entries(SVC).map(([k, v]) => `<a class="tile ${k === 'food' ? 'y' : k === 'water' ? 'm' : 'w'}" href="/services/${k}"><div class="tphoto">${photo(PH[k], 700, v[0])}</div><h3>${v[0]}</h3><p>${v[1]}</p></a>`).join('')}</div></div>`, '/services')));
app.get('/services/:k(food|water|movers)', (req, res) => { const [t, d, f] = SVC[req.params.k]; res.send(layout(t, `<section class="head"><div class="wrap hd"><div><h1>${t}</h1><p>${d}</p></div><div class="hphoto">${photo(PH[req.params.k], 900, t)}</div></div></section>
<div class="wrap split2"><div><h2>How it works</h2><ol class="steps"><li><b>Tell us what you need.</b></li><li><b>We route it</b> to an approved provider in your area.</li><li><b>The provider contacts you.</b> If nobody responds, we try another or add you to a waitlist.</li><li><b>Tell us how it went</b> so we can follow up on problems.</li></ol></div>
<div class="panel"><h2>Request a connection</h2>${form('/api/connections', who + f, 'Connect me', `<input type="hidden" name="service" value="${req.params.k}">`)}</div></div>`, '/services')); });

// ---------- About + Contact (content from the Easy2Stay About Us and Founder Story slides) ----------
const PILLARS = [['01', 'Stay', 'Verified PGs, hostels, rooms, flats & co-living'], ['02', 'Settle', 'Food, laundry, housekeeping, internet & local services'], ['03', 'Trust', 'Verified partners, transparent information & reliable support'], ['04', 'Scale', 'A city-by-city platform built for India\'s relocation market']];
const BEEN = [['Spent weeks finding safe & decent stays', '01'], ['Dealt with fake listings and frauds', '02'], ['No transparency in pricing & hidden costs', '03'], ['Struggled with unreliable landlords', '04'], ['Hard to find verified & trusted options', '05'], ['Lost valuable time and peace of mind', '06']];
const VALUES = [['Trust', 'We verify, and we say what we verified.'], ['Care', 'Every move is someone\'s big step.'], ['Inclusion', 'Students, professionals, families, migrants.'], ['Commitment', 'We stay with you after the keys.']];
app.get('/about', (_, res) => res.send(layout('About us', `
<section class="head ab"><div class="wrap hd"><div><p class="eyebrow dk">About us</p><h1>Building a trusted relocation experience for a moving India.</h1><p>Every move begins with a search. Every journey begins with the right stay. Easy2Stay makes that first step simple, safe, and trusted.</p></div><div class="hphoto">${photo(PH.students, 1000, 'Students and young professionals')}</div></div></section>

<section class="pad"><div class="wrap two"><div><h2>What is Easy2Stay?</h2><p class="lead dk">A relocation platform connecting people with verified accommodation, trusted service partners and future relocation-focused financial solutions, all through one seamless experience.</p>
<p>Easy2Stay is creating a single, trusted platform that helps people find accommodation, access essential local services, and settle confidently in a new city.</p></div>
<div class="pill">${PILLARS.map(([n, t, d]) => `<div><i>${n}</i><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div></section>
<section class="belief"><div class="wrap"><b>Our belief</b> From finding a place to live to feeling at home in a new city.</div></section>

<section class="pad tint" id="founder"><div class="wrap"><div class="sech"><h2>Founder story: from a struggle, to a mission</h2></div>
<div class="fgrid"><figure class="fcard"><img src="/static/img/founder.jpg" alt="Vipin Singh, Founder and CEO of Easy2Stay"><figcaption><b>Vipin Singh</b><span>Founder &amp; CEO, Easy2Stay</span><span>IITian (Graduate)</span><span>Civil Services Aspirant</span></figcaption></figure>
<div><p class="lead dk">My own journeys as a student in different cities showed me gaps in the daily struggles faced by lakhs of students and working professionals while relocating.</p>
<h3 class="been">I have been there…</h3><ul class="been">${BEEN.map(([t, i]) => `<li><span aria-hidden="true">${i}</span>${t}</li>`).join('')}</ul>
<blockquote>These challenges aren't just mine, they are faced by millions of students and professionals every day.<br><br>That's why I envisioned Easy2Stay, a complete relocation ecosystem that makes finding, booking and living a hassle-free and reliable for everyone.<cite>One Platform. Everything You Need. A Better Way to Stay.</cite></blockquote></div></div></div></section>

<section class="mvv"><div class="wrap trio"><div><small>Our mission</small><p>To make every student and professional's relocation journey easy, safe and hassle-free with transparency and trust.</p></div><div><small>Our vision</small><p>To become India's most trusted relocation ecosystem and impact millions of lives, globally.</p></div><div><small>Our values</small><ul>${VALUES.map(([t, d]) => `<li><b>${t}</b> ${d}</li>`).join('')}</ul></div></div></section>

<section class="pad"><div class="wrap"><div class="facts"><div><span>Focus areas</span><b>Tier 1, Tier 2 &amp; Tier 3</b><small>Metro and non-metro cities</small></div><div><span>Who we serve</span><b>Students · Working professionals</b><small>Employees · Migrants</small></div><div><span>Our goal</span><b>1 Lakh Migrants</b><small>in 5 years</small></div><div><span>Starting point</span><b>Prayagraj</b><small>where this demo is live</small></div></div>
<div class="btns" style="margin-top:34px"><a class="go" href="/pg">Find a stay</a><a class="go light bd" href="/contact">Contact us</a></div></div></section>`, '/about')));

const TOPICS = ['Finding a stay', 'Listing my property', 'Becoming a service partner', 'Report a wrong listing', 'Partnerships & press', 'Something else'];
app.get('/contact', (_, res) => res.send(layout('Contact us', `
<section class="head"><div class="wrap hd"><div><p class="eyebrow dk">Contact us</p><h1>Talk to a real person.</h1><p>Questions about a stay, a listing or a partnership? Send us a note and we'll get back to you, usually within one working day.</p></div><div class="hphoto">${photo(PH.contact, 1000, 'Our team at work')}</div></div></section>
<div class="wrap split2"><div><h2>Ways to reach us</h2>
<div class="cinfo"><div><span>General &amp; support</span><a href="mailto:support@easy2stay.example">support@easy2stay.example</a></div><div><span>Complaints</span><a href="mailto:complaints@easy2stay.example">complaints@easy2stay.example</a></div><div><span>Partnerships</span><a href="mailto:partners@easy2stay.example">partners@easy2stay.example</a></div><div><span>Where we are</span>Prayagraj, Uttar Pradesh<small>Starting here, expanding city by city.</small></div><div><span>Hours</span>Mon to Sat, 9 am to 7 pm IST</div></div>
<p class="sm">Looking for quick answers? Read the <a href="/help">help &amp; FAQs</a>.</p></div>
<div class="panel"><h2>Send us a message</h2><form data-post="/api/contact" data-ok="Thanks, your message is with our team. We'll reply soon.">${who}<input name="email" type="email" placeholder="Email (optional)" autocomplete="email"><label>Topic<select name="topic">${TOPICS.map(t => `<option>${t}</option>`).join('')}</select></label><textarea name="message" rows="5" placeholder="How can we help?"></textarea>
<label class="chk"><input type="checkbox" name="consent"> I agree to share my contact details with Easy2Stay so it can reply to this message.</label><button class="go">Send message</button><p class="msg" role="status"></p></form></div></div>`, '/contact')));

// ---------- Owner, trust, help ----------
app.get('/list-your-property', (_, res) => res.send(layout('List your property', `<section class="head"><div class="wrap"><div class="hd"><div><h1>List your property</h1><p>Free to list. We verify before anything goes live.</p></div><div class="hphoto">${photo(PH.owner, 900, 'A well-kept home')}</div></div></div></section>
<div class="wrap split2"><div><h2>What happens next</h2><ol class="steps"><li><b>Submit the basics</b> using this form.</li><li><b>We confirm you manage the property.</b></li><li><b>Our team visits and checks</b> location and photos.</li><li><b>Your listing goes live</b> and you can pause it anytime.</li></ol></div>
<div class="panel">${form('/api/drafts', `<input name="title" placeholder="Property name"><input name="locality" placeholder="Locality"><select name="type"><option>PG</option><option>Flat</option></select><select name="gender"><option value="any">Anyone</option><option value="boys">Boys</option><option value="girls">Girls</option><option value="co-ed">Co-ed</option></select><select name="occupancy"><option>single</option><option>2-share</option><option>3-share</option></select><select name="bhk"><option>1 BHK</option><option>2 BHK</option><option>3 BHK</option></select><input name="rent" type="number" placeholder="Monthly rent (₹)"><input name="deposit" type="number" placeholder="Deposit (₹)">${who}`, 'Submit for review')}</div></div>`, '/list')));
app.get('/how-verification-works', (_, res) => res.send(layout('How verification works', `<section class="head"><div class="wrap"><h1>What "verified" means here</h1><p>Specific checks, a date, and a limit. Never a paid badge.</p></div></section><div class="wrap narrow"><h2>We check</h2><p>That the property is where the listing says, and that the photos are real.</p><h2>We do not promise</h2><p>Quality of the owner, neighbours or the landlord's future behaviour. Always read the rules before you move in.</p><h2>It expires</h2><p>Verification is valid for a fixed period. Lapsed listings disappear from search. Availability is confirmed separately, flagged when old, and hidden after 14 days.</p><h2>Spot a mismatch?</h2><p>Use the report link on any listing or <a href="/help">contact us</a>.</p></div>`, '/how')));
app.get('/help', (_, res) => res.send(layout('Help', `<section class="head"><div class="wrap"><h1>Help and contact</h1></div></section><div class="wrap narrow">${[
  ['Do I pay to enquire?', 'No. Browsing, callbacks and visit requests are free.'], ['Who sees my phone number?', 'Only Easy2Stay and the owner or provider handling your request, and only after you consent.'],
  ['Do you collect payment for services?', 'No. Providers set prices and fulfil the service. Confirm price with the provider.'], ['A listing is wrong. What now?', 'Report it from the listing page or email support@easy2stay.example. We review it and pause it if needed.']
].map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}<p>Complaints: complaints@easy2stay.example · <a href="/contact">Contact us</a></p></div>`, '/help')));

// ---------- Sign-in, role desks ----------
const me = () => als.getStore();
const ROLE = { user: ['Visitor', 'y'], owner: ['Owner', 'y'], verifier: ['Verifier', 'm'], ops: ['Operations', 'b'], provider: ['Partner', 'r'] };
const FL = ['Requested', 'Confirming', 'Scheduled', 'Completed'], FC = ['Routing', 'Accepted', 'Done'];
const stat = s => `<em class="${/Cancel|Declin|Reject|paused/.test(s) ? 'bad' : ''}">${esc(s)}</em>`;
const track = (f, s) => `<span class="trk" title="${s}">${f.map((_, k) => `<i class="${f.indexOf(s) >= k ? 'on' : ''}"></i>`).join('')}</span>`;
const act = (api, body, label, cls = '') => `<button class="act ${cls}" data-api="${api}" data-body="${esc(JSON.stringify(body))}">${label}</button>`;
const stats = a => `<div class="stats">${a.map(([n, l]) => `<div><b>${n}</b>${l}</div>`).join('')}</div>`;
const desk = (title, links, body) => { const m = me(); return layout(title, `<div class="desk ${ROLE[m.role][1]}"><aside><small>${ROLE[m.role][0]} desk</small><b>${esc(m.name)}</b><nav>${links.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</nav><a class="out" href="/logout">Sign out</a></aside><div>${body}</div></div>`, '/portal'); };
const KEYS = [['user', 'Visitor', 'Aarav', 'Track your visits, callbacks and service requests.'], ['owner', 'Owner', 'Mrs. Srivastava', 'Manage listings, availability and leads.'], ['verifier', 'Verifier', 'Neha', 'Check new listings, then publish or reject.'],
  ['ops', 'Operations', 'Rohit', 'Confirm visits, follow up services, pause listings.'], ['food', 'Partner · Tiffin', 'Annapurna Tiffins', 'Accept or decline meal requests.'], ['water', 'Partner · Water', 'Sangam Aqua', 'Respond to jar delivery requests.'], ['movers', 'Partner · Movers', 'Quick Shift Movers', 'Respond to move requests.']];
app.get('/login', (req, res) => res.send(layout('Sign in', `<section class="head"><div class="wrap"><h1>Pick your key</h1><p>Demo sign-in. Each key opens a different desk, and the server checks your role on every action.</p></div></section>
<div class="wrap"><form method="post" action="/login" class="keys"><input type="hidden" name="next" value="${esc(req.query.next || '')}">${KEYS.map(([k, r, n, d], i) => `<button name="who" value="${k}" class="key k${i % 4}"><span class="hole"></span><small>${r}</small><b>${n}</b><p>${d}</p></button>`).join('')}</form></div>`, '/login')));

app.get('/activity', async (req, res) => {
  const m = req.me; if (!m) return res.redirect('/login?next=/activity');
  const mine = x => x.userId === m.id || (m.role === 'user' && x.userId === 'guest');
  const e = (await all('enquiries')).filter(mine), c = (await all('serviceConnections')).filter(mine);
  const r = [...e.map(x => [x.kind + ': ' + x.title, x.status, x.createdAt, FL]), ...c.map(x => [SVC[x.service][0] + ' connection', x.status, x.createdAt, FC])].sort((a, b) => new Date(b[2]) - new Date(a[2]));
  res.send(desk('My activity', [['/activity', 'Visits & requests'], ['/pg', 'Find a PG'], ['/services', 'Services']], `<h1>My activity</h1>${stats([[e.length, 'visits and callbacks'], [c.length, 'service requests']])}
${r.length ? r.map(x => `<div class="logrow"><span>${esc(x[0])}<small>${when(x[2])}</small></span>${track(x[3], x[1])}${stat(x[1])}</div>`).join('') : '<div class="empty"><h3>Nothing yet</h3><p>Request a visit on any <a href="/pg">stay</a> or a <a href="/services">service</a>.</p></div>'}`));
});

const listForm = () => form('/api/drafts', `<input name="title" placeholder="Property name"><input name="locality" placeholder="Locality"><select name="type"><option>PG</option><option>Flat</option></select><select name="gender"><option value="any">Anyone</option><option value="boys">Boys</option><option value="girls">Girls</option><option value="co-ed">Co-ed</option></select><select name="occupancy"><option>single</option><option>2-share</option><option>3-share</option></select><select name="bhk"><option>1 BHK</option><option>2 BHK</option><option>3 BHK</option></select><input name="rent" type="number" placeholder="Monthly rent (₹)"><input name="deposit" type="number" placeholder="Deposit (₹)">${who}`, 'Submit for review');

app.get('/owner', need('owner'), async (req, res) => {
  const m = req.me, ls = (await all('listings')).filter(l => l.ownerId === m.id).map(shape), slugs = new Set(ls.map(l => l.slug));
  const enq = (await all('enquiries')).filter(e => slugs.has(e.slug)), dr = (await all('drafts')).filter(d => d.ownerId === m.id);
  res.send(desk('Owner desk', [['#listings', 'My listings'], ['#leads', 'Leads'], ['#subs', 'Submissions'], ['#new', 'New listing']], `<h1>Welcome, ${esc(m.name)}</h1>
${stats([[ls.filter(l => l.status === 'published').length, 'live listings'], [enq.length, 'leads'], [dr.filter(d => d.status === 'In review').length, 'in review']])}
<h2 id="listings">My listings</h2>${ls.map(l => `<div class="logrow"><span>${esc(l.title)}<small>${l.locality} · ${inr(l.price.rent)} · availability confirmed ${ago(l.availAgeDays)}${l.availAgeDays > 7 ? ' (stale, will be hidden after 14 days)' : ''}</small></span>${stat(l.status)}${act('/api/owner/listing', { slug: l.slug, action: 'confirm' }, 'Confirm availability')}${act('/api/owner/listing', { slug: l.slug, action: l.status === 'paused' ? 'resume' : 'pause' }, l.status === 'paused' ? 'Resume' : 'Pause')}</div>`).join('') || '<p>No listings yet.</p>'}
<h2 id="leads">Leads</h2>${enq.map(e => `<div class="logrow"><span>${esc(e.kind)}: ${esc(e.title)}<small>${e.slot ? 'Preferred ' + esc(e.slot.replace('T', ' ')) : 'No slot given'} · contact released by operations once the visit is confirmed</small></span>${track(FL, e.status)}${stat(e.status)}</div>`).join('') || '<p>No leads yet.</p>'}
<h2 id="subs">Submissions</h2>${dr.map(d => `<div class="logrow"><span>${esc(d.title)}<small>${d.reason ? 'Reason: ' + esc(d.reason) : when(d.createdAt)}</small></span>${stat(d.status)}</div>`).join('') || '<p>Nothing submitted.</p>'}
<h2 id="new">New listing</h2><div class="panel">${listForm()}</div>`));
});

app.get('/verifier', need('verifier', 'ops'), async (req, res) => {
  const q = (await all('drafts')).filter(d => d.status === 'In review'), cs = (await all('cases')).slice(0, 6);
  res.send(desk('Verifier desk', [['#queue', 'Queue'], ['#done', 'Decisions']], `<h1>Verification queue</h1>${stats([[q.length, 'waiting'], [cs.length, 'recent decisions']])}<h2 id="queue">Waiting for a check</h2>
${q.map(d => `<div class="case" data-id="${d.id}"><h3>${esc(d.title)}</h3><p>${esc(d.locality || 'Locality missing')} · ${esc(d.type)} · ${inr(d.rent * 100)} a month · submitted ${when(d.createdAt)}</p>
<label class="chk"><input type="checkbox" value="location"> Location matches the listing</label><label class="chk"><input type="checkbox" value="photos"> Photos are real</label><label class="chk"><input type="checkbox" value="authority"> Owner has authority to list</label>
<input class="reason" placeholder="Reason (required to reject)"><div class="btns"><button class="decide go" data-d="approve">Approve and publish</button><button class="decide no" data-d="reject">Reject</button></div><p class="msg"></p></div>`).join('') || '<p>The queue is clear.</p>'}
<h2 id="done">Recent decisions</h2>${cs.map(c => `<div class="logrow"><span>${esc(c.title)}<small>${esc(c.verifier)} · ${when(c.createdAt)}${c.reason ? ' · ' + esc(c.reason) : ''}</small></span>${stat(c.decision)}</div>`).join('') || '<p>None yet.</p>'}`));
});

app.get('/admin', need('ops'), async (req, res) => {
  const [e, c, l, d, mg] = await Promise.all(['enquiries', 'serviceConnections', 'listings', 'drafts', 'messages'].map(all));
  const row = (col, x, lab, f) => `<div class="logrow"><span>${esc(lab)}<small>${esc(x.name || '')} · ${when(x.createdAt)}</small></span>${track(f, x.status)}${stat(x.status)}${f.includes(x.status) && x.status !== f[f.length - 1] ? act('/api/admin/advance', { col, id: x.id }, 'Advance') + act('/api/admin/advance', { col, id: x.id, to: 'Cancelled' }, 'Cancel', 'no') : ''}</div>`;
  res.send(desk('Operations desk', [['#visits', 'Visits & callbacks'], ['#services', 'Service connections'], ['#listings', 'Listings'], ['#messages', 'Messages'], ['/verifier', 'Verifier queue']], `<h1>Operations</h1>
${stats([[e.filter(x => x.status === 'Requested').length, 'new visit requests'], [c.filter(x => x.status === 'Routing').length, 'services awaiting provider'], [l.filter(x => x.status === 'published').length, 'live listings'], [d.filter(x => x.status === 'In review').length, 'awaiting verification']])}
<h2 id="visits">Visits and callbacks</h2>${e.map(x => row('enquiries', x, x.kind + ': ' + x.title, FL)).join('') || '<p>No requests.</p>'}
<h2 id="services">Service connections</h2>${c.map(x => row('serviceConnections', x, SVC[x.service][0], FC)).join('') || '<p>No requests.</p>'}
<h2 id="messages">Contact messages</h2>${mg.map(x => `<div class="logrow"><span>${esc(x.topic)}: ${esc(x.message)}<small>${esc(x.name)} · ${esc(x.phone)}${x.email ? ' · ' + esc(x.email) : ''} · ${when(x.createdAt)}</small></span></div>`).join('') || '<p>No messages.</p>'}
<h2 id="listings">Listings</h2>${l.map(shape).map(x => `<div class="logrow"><span>${esc(x.title)}<small>${x.locality} · availability ${ago(x.availAgeDays)}</small></span>${stat(x.status)}${act('/api/owner/listing', { slug: x.slug, action: x.status === 'paused' ? 'resume' : 'pause' }, x.status === 'paused' ? 'Resume' : 'Pause')}</div>`).join('')}`));
});

app.get('/provider', need('provider'), async (req, res) => {
  const m = req.me, r = (await all('serviceConnections')).filter(x => x.service === m.service);
  const info = x => Object.entries(x.details || {}).filter(([k, v]) => v && !['name', 'phone', 'consent', 'service', 'details'].includes(k)).map(([k, v]) => `${k}: ${esc(v)}`).join(' · ');
  res.send(desk('Partner desk', [['#new', 'New requests'], ['#all', 'All requests']], `<h1>${esc(m.name)}</h1>${stats([[r.filter(x => x.status === 'Routing').length, 'waiting for you'], [r.filter(x => x.status === 'Accepted').length, 'active'], [r.filter(x => x.status === 'Done').length, 'done']])}
<h2 id="all">Requests routed to you</h2>${r.map(x => `<div class="logrow"><span>${esc(x.name)}<small>${info(x)}${x.status === 'Accepted' || x.status === 'Done' ? ' · call ' + esc(x.phone) : ' · contact shown after you accept'}</small></span>${stat(x.status)}${x.status === 'Routing' ? act('/api/provider/respond', { id: x.id, to: 'Accepted' }, 'Accept') + act('/api/provider/respond', { id: x.id, to: 'Declined' }, 'Decline', 'no') : x.status === 'Accepted' ? act('/api/provider/respond', { id: x.id, to: 'Done' }, 'Mark done') : ''}</div>`).join('') || '<div class="empty"><h3>No requests yet</h3><p>Requests from users appear here.</p></div>'}`));
});
};
