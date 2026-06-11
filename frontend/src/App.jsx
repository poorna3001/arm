import React, { useState, useEffect, useRef } from 'react';
import './index.css';

const API = 'http://127.0.0.1:5001/arm';

const sc = s => ['Green', 'High'].includes(s) ? 'g' : ['Amber', 'Medium'].includes(s) ? 'a' : s === 'Pending' ? 'p' : 'r';
const clr = s => ['Green', 'High'].includes(s) ? 'var(--grn)' : ['Amber', 'Medium'].includes(s) ? 'var(--amb)' : s === 'Pending' ? 'var(--dim)' : 'var(--red)';
const labelMapping = s => ['Green', 'High'].includes(s) ? 'High' : ['Amber', 'Medium'].includes(s) ? 'Medium' : s === 'Pending' ? 'Pending' : 'Low';

const formatMonthYear = (ymStr) => {
  if (!ymStr) return '';
  const [year, month] = ymStr.split('-');
  const date = new Date(year, parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const formatTinyMonthYear = (ymStr) => {
  if (!ymStr) return '';
  const [year, month] = ymStr.split('-');
  const date = new Date(year, parseInt(month) - 1);
  return `${date.toLocaleDateString('en-US', { month: 'short' })} '${year.substring(2)}`;
};

function Counter({ to, dur = 900, dec = 1 }) {
  const [v, sv] = useState(0);
  const r = useRef();
  useEffect(() => {
    if (to == null) return;
    const s = performance.now();
    const fn = t => {
      const p = Math.min((t - s) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      sv(+(to * e).toFixed(dec));
      if (p < 1) r.current = requestAnimationFrame(fn);
    };
    r.current = requestAnimationFrame(fn);
    return () => cancelAnimationFrame(r.current);
  }, [to]);
  return <>{to == null ? '—' : v.toFixed(dec)}</>;
}

function Donut({ score, status, size = 108 }) {
  const R = 42, C = 2 * Math.PI * R;
  const [a, sa] = useState(0);
  useEffect(() => {
    if (score != null) {
      const t = setTimeout(() => sa(Math.min(score / 100, 1)), 100);
      return () => clearTimeout(t);
    }
  }, [score]);
  const col = clr(status);
  
  if (status === 'Pending' || score == null) {
    return (
      <div className="dw" style={{ opacity: 0.5 }}>
        <svg width={size} height={size} viewBox="0 0 110 110" className="dsv" style={{ color: col }}>
          <circle cx="55" cy="55" r={R} fill="none" stroke="rgba(255,255,255,.045)" strokeWidth="11" />
          <circle cx="55" cy="55" r={R - 15} fill="rgba(0,0,0,.35)" />
        </svg>
        <div className="dt"><div className="dn" style={{ color: col }}>—</div><div className="dl">Score</div></div>
      </div>
    );
  }

  return (
    <div className="dw">
      <svg width={size} height={size} viewBox="0 0 110 110" className="dsv" style={{ color: col, filter: `drop-shadow(0 0 10px ${col}55)` }}>
        <circle cx="55" cy="55" r={R} fill="none" stroke="rgba(255,255,255,.045)" strokeWidth="11" />
        <circle cx="55" cy="55" r={R} fill="none" stroke={col} strokeWidth="11"
          strokeDasharray={C} strokeDashoffset={C * (1 - a)} strokeLinecap="round"
          transform="rotate(-90 55 55)" style={{ transition: 'stroke-dashoffset .95s cubic-bezier(.34,1.56,.64,1)' }} />
        <circle cx="55" cy="55" r={R - 15} fill="rgba(0,0,0,.35)" />
      </svg>
      <div className="dt">
        <div className="dn" style={{ color: col }}>{score.toFixed(1)}</div>
        <div className="dl">Score</div>
      </div>
    </div>
  );
}

function Gauge({ score, status }) {
  const [a, sa] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => sa(true), 80);
    return () => clearTimeout(t);
  }, [score]);
  const R = 78, cx = 110, cy = 108;
  const toR = d => d * Math.PI / 180;
  const arc = (r, a1, a2) => {
    const x1 = cx + r * Math.cos(toR(a1)), y1 = cy + r * Math.sin(toR(a1));
    const x2 = cx + r * Math.cos(toR(a2)), y2 = cy + r * Math.sin(toR(a2));
    const lg = Math.abs(a2 - a1) > 180 ? 1 : 0;
    return `M${x1},${y1} A${r},${r},0,${lg},1,${x2},${y2}`;
  };
  
  if (status === 'Pending' || score == null) {
    return (
       <div className="gw" style={{ opacity: 0.5 }}>
         <svg width="220" height="150" viewBox="0 0 220 150" className="gsv">
           <path d={arc(R, -210, 30)} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="14" strokeLinecap="round" />
         </svg>
         <div className="gc"><div className="gscore" style={{ color: clr(status) }}>—</div><div className="gword" style={{ color: clr(status) }}>Pending</div></div>
       </div>
    );
  }

  const pct = Math.min(score / 89.9, 1);
  const ea = -210 + (a ? 240 * pct : 0);
  const col = clr(status);
  const ex = cx + R * Math.cos(toR(ea)), ey = cy + R * Math.sin(toR(ea));
  
  return (
    <div className="gw">
      <svg width="220" height="150" viewBox="0 0 220 150" className="gsv">
        <path d={arc(R, -210, 30)} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="14" strokeLinecap="round" />
        {[{ v: 70, c: 'var(--red)' }, { v: 80, c: 'var(--amb)' }].map(({ v, c }) => {
          const aa = -210 + 240 * (v / 89.9);
          return <circle key={v} cx={cx + R * Math.cos(toR(aa))} cy={cy + R * Math.sin(toR(aa))} r="4" fill={c} opacity=".55" />;
        })}
        <path d={arc(R, -210, ea)} fill="none" stroke={col} strokeWidth="14" strokeLinecap="round"
          style={{ transition: 'all 1.1s cubic-bezier(.34,1.56,.64,1)', filter: `drop-shadow(0 0 10px ${col}88)` }} />
        <circle cx={ex} cy={ey} r="7" fill={col} stroke="var(--bg)" strokeWidth="2.5"
          style={{ transition: 'cx 1.1s cubic-bezier(.34,1.56,.64,1),cy 1.1s cubic-bezier(.34,1.56,.64,1)' }} />
      </svg>
      <div className="gc">
        <div className="gscore" style={{ color: col }}>{a ? <Counter to={score} dur={1100} /> : 0}</div>
        <div className="gword" style={{ color: col }}>{labelMapping(status)}</div>
        <div className="gsub">ARM Score · {score >= 80 ? 'Compliant' : 'Needs Attention'}</div>
      </div>
    </div>
  );
}

function TrendLine({ trend, status, activeMonth, onMonthClick }) {
  const [dr, sd] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => sd(true), 120);
    return () => clearTimeout(t);
  }, []);
  
  if (!trend || trend.length < 2) return null;
  
  const W = 500, H = 190, p = { t: 20, r: 40, b: 60, l: 40 };
  const iW = W - p.l - p.r, iH = H - p.t - p.b;
  
  const validScores = trend.filter(t => t.score !== null).map(t => t.score);
  const mn = validScores.length ? Math.min(...validScores) - 6 : 0;
  const mx = validScores.length ? Math.max(...validScores) + 6 : 100;
  
  const pts = trend.map((t, i) => {
    const x = trend.length > 1 ? p.l + (i / (trend.length - 1)) * iW : p.l + iW / 2;
    return {
      x,
      y: t.score !== null ? p.t + iH - (t.score - mn) / (mx - mn) * iH : null,
      score: t.score, 
      rawMonth: t.month,
      monthLabel: formatTinyMonthYear(t.month)
    };
  });
  
  const validPts = pts.filter(pt => pt.y !== null);
  const pd = validPts.length ? 'M' + validPts.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' L ') : '';
  const ad = validPts.length ? pd + ` L${validPts[validPts.length - 1].x},${H - p.b} L${validPts[0].x},${H - p.b} Z` : '';
  const col = clr(status);
  const plen = validPts.reduce((acc, pt, i) => i === 0 ? 0 : acc + Math.hypot(pt.x - validPts[i - 1].x, pt.y - validPts[i - 1].y), 0);
  
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity=".22" />
          <stop offset="100%" stopColor={col} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, .33, .66, 1].map((f, i) => {
        const y = p.t + iH * (1 - f);
        const val = Math.round(mn + (mx - mn) * f);
        return (
          <g key={i}>
            <line x1={p.l} y1={y} x2={W - p.r} y2={y} stroke="rgba(255,255,255,.035)" strokeWidth="1" />
            <text x={p.l - 5} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(90,116,153,.65)" className="num">{val}</text>
          </g>
        );
      })}
      {dr && ad && <path d={ad} fill="url(#lg1)" />}
      {pd && <path d={pd} fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={dr ? 'none' : plen} strokeDashoffset={dr ? 0 : plen}
        style={{ transition: 'stroke-dashoffset 1.3s ease' }} />}
        
      {pts.map((pt, i) => {
        const isActive = pt.rawMonth === activeMonth;
        const nodeColor = isActive ? 'var(--blue)' : col;
        
        return (
          <g key={i}>
            <text x={pt.x} y={H - p.b + 16} textAnchor="middle" fontSize="8.5" fill={pt.y ? "rgba(90,116,153,.75)" : "rgba(90,116,153,.25)"} fontWeight={isActive ? '700' : '500'}>{pt.monthLabel}</text>
            {pt.y !== null && (
              <g onClick={() => onMonthClick(pt.rawMonth)} style={{ cursor: 'pointer' }} className="trend-node">
                <circle cx={pt.x} cy={pt.y} r={isActive ? "7" : "5"} fill={nodeColor} stroke="var(--bg)" strokeWidth={isActive ? "4" : "2"} style={{ transition: 'all 0.2s' }} />
                <text x={pt.x} y={pt.y - (isActive ? 14 : 10)} textAnchor="middle" fontSize="10" fill={nodeColor} fontWeight="600" className="num">{pt.score}</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function PlantCard({ plant, idx, onSelect }) {
  const c = sc(plant.status);
  const col = clr(plant.status);
  const isPending = plant.status === 'Pending';
  
  return (
    <div className={`pcard ${c} ca`} style={{ animationDelay: `${idx * 65}ms` }} onClick={() => !isPending && onSelect(plant)}>
      <div className="ch">
        <div>
          <div className="cid">PLANT <span className="num">{plant.plant}</span></div>
          <div className="cname2">{plant.description}</div>
        </div>
        <span className={`badge ${c}`}>{labelMapping(plant.status)}</span>
      </div>
      <Donut score={plant.score} status={plant.status} />
      <div className="mm">
        {[['Control Test', 'control_test'], ['RCM Complete', 'rcm_completeness'],
        ['SLA Adherence', 'sla_adherence'], ['Responsiveness', 'user_responsiveness']].map(([l, k]) => (
          <div key={k} className="mmi">
            <div className="mmil">{l}</div>
            <div className="mmiv" style={{ color: col }}><span className="num">{plant[k] ?? '—'}</span>{plant[k] != null && '%'}</div>
          </div>
        ))}
      </div>
      {plant.trend?.length > 0 && !isPending && (
        <>
          <div className="tlbl">3-Month Trend</div>
          <div className="tbars">
            {plant.trend.map((t, i) => {
              const s2 = t.score >= 80 ? 'g' : t.score >= 70 ? 'a' : 'r';
              return (
                <div key={i} className="trow">
                  <span className="tmo">{formatTinyMonthYear(t.month)}</span>
                  <div className="ttr"><div className={`tfill ${s2}`} style={{ width: `${t.score}%`, transitionDelay: `${i * 80}ms` }} /></div>
                  <span className="tv num">{t.score}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div className="cfb">{isPending ? 'No Data Available' : 'View Full Analysis →'}</div>
    </div>
  );
}

function DetailPage({ plant, month, onBack }) {
  const [localMonth, setLocalMonth] = useState(month);
  const [det, sdet] = useState(null);
  const [activeDetail, setActiveDetail] = useState(null); 

  useEffect(() => { setLocalMonth(month) }, [month]);

  useEffect(() => {
    fetch(`${API}/plant/${plant.plant}?month=${localMonth}`).then(r => r.json()).then(sdet);
    setActiveDetail(null); 
  }, [plant.plant, localMonth]);

  const m = det?.metrics || {}; 
  const status = m.status || plant.status; 
  const score = m.score || plant.score;
  const col = clr(status);

  const toggleRow = (k) => {
    if (k === 'control_test' || k === 'rcm_completeness') {
      setActiveDetail(prev => prev === k ? null : k);
    }
  };

  const rows = [
    { l: 'Control Test Pass %', k: 'control_test', w: '40%', wt: .40, expandable: true },
    { l: 'RCM Completeness %', k: 'rcm_completeness', w: '20%', wt: .20, expandable: true },
    { l: 'SLA Adherence %', k: 'sla_adherence', w: '15%', wt: .15, expandable: false },
    { l: 'Past Observation Severity', k: 'obs_severity', w: '15%', wt: .15, expandable: false },
    { l: 'User Responsiveness %', k: 'user_responsiveness', w: '10%', wt: .10, expandable: false },
  ];

  return (
    <div className="dpage">
      <button className="bbtn" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15,18 9,12 15,6" /></svg>
        Back to Readiness Meter
      </button>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'var(--fd)', fontSize: 26, fontWeight: 800, letterSpacing: '-.5px' }}>{plant.description}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <span className={`badge ${sc(status)}`}>{labelMapping(status)}</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Plant <span className="num">{plant.plant}</span></span>
        </div>
      </div>

      <div className="dhero">
        <div className="dc"><h3>Current Readiness Score</h3><Gauge score={score} status={status} /></div>
        <div className="dc">
          <div className="phd" style={{ marginBottom: '18px', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Trend History</h3>
            <select className="fsel" value={localMonth} onChange={e => setLocalMonth(e.target.value)} style={{ padding: '6px 30px 6px 12px', fontSize: '11px', height: 'auto', minWidth: '130px' }}>
              {det?.trend?.map(t => <option key={t.month} value={t.month}>{formatMonthYear(t.month)}</option>)}
            </select>
          </div>
          <div className="tcw">
            {det?.trend ? <TrendLine trend={det.trend} status={status} activeMonth={localMonth} onMonthClick={setLocalMonth} />
              : <div style={{ color: 'var(--muted)', fontSize: 13, padding: '50px 0', textAlign: 'center' }}>Loading…</div>}
          </div>
        </div>
      </div>
      
      <div className="dc" style={{ marginBottom: 16 }}>
        <h3>Metrics Breakdown</h3>
        <table className="mtbl">
          <thead><tr><th>Metric</th><th>Value</th><th>Weight</th><th>Contribution</th></tr></thead>
          <tbody>
            {rows.map(({ l, k, w, wt, expandable }) => {
              const val = m[k] ?? '—'; 
              const contrib = m[k] != null ? +(m[k] * wt).toFixed(1) : '—';
              const isExp = activeDetail === k;
              const dynamicColor = val !== '—' ? 'var(--blue)' : 'var(--muted)';

              return (
                <tr key={k} onClick={() => toggleRow(k)} style={{ cursor: expandable ? 'pointer' : 'default', background: isExp ? 'rgba(255,255,255,0.02)' : 'transparent' }} className={expandable ? 'hover-row' : ''}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {l} 
                      {expandable && <span style={{ fontSize: 9, opacity: 0.5, color: isExp ? 'var(--teal)' : 'var(--muted)' }}>{isExp ? '▼' : '▶'}</span>}
                    </div>
                  </td>
                  <td><div className="barcell"><div className="mbar"><div className="mbarf" style={{ width: `${val}%` }} /></div><span className="num">{val}</span></div></td>
                  <td><span className="wpill num">{w}</span></td>
                  <td style={{ color: dynamicColor, fontWeight: 600 }} className="num">{contrib}</td>
                </tr>
              );
            })}
            <tr>
              <td style={{ fontSize: '15px', color: 'var(--txt)' }}>Total Readiness Score</td><td></td><td></td>
              <td style={{ color: col, fontSize: '18px', fontWeight: 700 }} className="num">{score != null ? score.toFixed(1) : '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {activeDetail === 'control_test' && m.ct_details && (
        <div className="dc" style={{ animation: 'fu .4s ease both', border: '1px solid var(--red-bd)', background: 'var(--red-b)' }}>
           {/* Exact number of records dynamically shown here */}
           <h3 style={{ color: 'var(--txt)' }}>Control Test Failures ({m.ct_details.length} Records Failed)</h3>
           <table className="dtbl">
             <thead><tr><th>PO Number</th><th>Failed Test Case</th><th>Status</th><th>Failure Reason</th></tr></thead>
             <tbody>
               {m.ct_details.map((item, idx) => (
                 <tr key={idx}>
                   <td className="num">{item.record_id}</td>
                   <td style={{ whiteSpace: 'normal', color: 'var(--txt)' }}>{item.name}</td>
                   <td><span className="tag re">Failed ❌</span></td>
                   <td style={{ whiteSpace: 'normal', opacity: 0.8 }}>{item.reason}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}

      {activeDetail === 'rcm_completeness' && m.rcm_details && (
        <div className="dc" style={{ animation: 'fu .4s ease both', border: '1px solid var(--red-bd)', background: 'var(--red-b)' }}>
           {/* Exact number of records dynamically shown here */}
           <h3 style={{ color: 'var(--txt)' }}>RCM Missing Controls ({m.rcm_details.length} Records Failed)</h3>
           <table className="dtbl">
             <thead><tr><th>PO Number</th><th>Risk Control Action</th><th>Status</th><th>Failure Reason</th></tr></thead>
             <tbody>
               {m.rcm_details.map((item, idx) => (
                 <tr key={idx}>
                   <td className="num">{item.record_id}</td>
                   <td style={{ whiteSpace: 'normal', color: 'var(--txt)' }}>{item.name}</td>
                   <td><span className="tag re">Failed ❌</span></td>
                   <td style={{ whiteSpace: 'normal', opacity: 0.8 }}>{item.reason}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      )}

    </div>
  );
}

function Dashboard({ months, allPlants, onCard }) {
  const [month, sm] = useState(''); const [sel, ss] = useState([]);
  const [data, sd] = useState(null); const [loading, sl] = useState(false); const [err, se] = useState(null);

  useEffect(() => { if (months.length) sm(months[months.length - 1]) }, [months]);
  
  useEffect(() => {
    if (!month) return; sl(true); se(null);
    const p = new URLSearchParams({ month }); sel.forEach(pl => p.append('plants', pl));
    fetch(`${API}/readiness?${p}`).then(r => r.json()).then(d => { sd(d); sl(false) })
      .catch(() => { se('Cannot connect to backend. Start Python server: cd backend && python app.py'); sl(false) });
  }, [month, sel]);

  const plants = data?.plants || []; 
  const sum = data?.summary || { High: 0, Medium: 0, Low: 0, Pending: 0 };

  return (
    <>
      <div className="ph" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img src="/logo3.png" alt="AjaLabs AI" style={{ height: '45px', objectFit: 'contain' }} />
        <div>
          <h1>Audit Readiness Meter</h1>
          <p>Monitor business unit audit readiness scores and trends</p>
        </div>
      </div>
      {err && <div className="err">⚠️ {err}</div>}
      <div className="fp">
        <div className="ftop">
          <div className="fsec">
            <div className="phd"><div className="flbl">Month</div></div>
            <select className="fsel" value={month} onChange={e => sm(e.target.value)}>
              {months.map(m => <option key={m} value={m}>{formatMonthYear(m)}</option>)}
            </select>
          </div>
          <div className="fsec pa">
            <div className="phd">
              <div className="flbl">Business Units</div>
              <div className="slinks">
                <span className="slink" onClick={() => ss(allPlants.map(p => p.plant))}>Select All</span>
                <span className="slink" onClick={() => ss([])}>Clear All</span>
              </div>
            </div>
            <div className="cg">
              {allPlants.map(p => (
                <label key={p.plant} className="ci">
                  <input type="checkbox" checked={sel.includes(p.plant)}
                    onChange={() => ss(prev => prev.includes(p.plant) ? prev.filter(x => x !== p.plant) : [...prev, p.plant])} />
                  <div className="cc"><div className="ccode">Plant <span className="num">{p.plant}</span></div><div className="cname">{p.description}</div></div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {data && (
        <div className="sumrow">
          {[['High', 'High', 'g', '🟢'], ['Medium', 'Medium', 'a', '🟡'], ['Low', 'Low', 'r', '🔴'], ['Pending', 'Pending', 'p', '⚪']].map(([lbl, backendKey, c, ico]) => (
            <div key={backendKey} className={`scard ${c}`}>
              <div className="sico">{ico}</div>
              <div><div className={`scnt num ${c}`}>{sum[backendKey]}</div><div className="slbl">{lbl} Status</div></div>
            </div>
          ))}
        </div>
      )}

      {loading ? <div className="loading"><div className="spin" /><span className="ltxt">Loading…</span></div>
        : plants.length === 0 ? <div className="loading"><span className="ltxt">No data for selected filters</span></div>
          : <div className="cgrid">{plants.map((p, i) => <PlantCard key={p.plant} plant={p} idx={i} onSelect={pl => onCard(pl, month)} />)}</div>
      }
    </>
  );
}

export default function App() {
  const [months, sm] = useState([]); const [plants, sp] = useState([]);
  const [page, spg] = useState('dash'); const [selP, ssp] = useState(null); const [selM, ssm] = useState('');
  const [err, se] = useState(null);

  useEffect(() => {
    Promise.all([fetch(`${API}/months`).then(r => r.json()), fetch(`${API}/plants`).then(r => r.json())])
      .then(([m, p]) => { sm(m.months); sp(p.plants) })
      .catch(() => se('Backend not reachable. Ensure app.py is running.'));
  }, []);

  const goDetail = (plant, month) => { ssp(plant); ssm(month); spg('detail'); window.scrollTo({ top: 0, behavior: 'smooth' }) };
  const goBack = () => spg('dash');

  return (
    <>
      <div className="bg-c" /><div className="bg-g" />
      <div className="orb o1" /><div className="orb o2" /><div className="orb o3" />
      
      <nav className="nav">
        <a className="nav-logo" href="#" onClick={e => { e.preventDefault(); goBack() }}></a>
        <img src="/logo.png" alt="Partner Logo" style={{ height: '32px', objectFit: 'contain' }} />
        <div className="nav-chip" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="live-dot" /> LIVE
        </div>
        
        <div className="nav-sp" /> 
        <img src="/logo2.png" alt="Partner Logo" style={{ height: '32px', objectFit: 'contain' }} />
      </nav>

      <div className="wrap">
        {err && <div className="err">⚠️ {err}</div>}
        {page === 'dash'
          ? <Dashboard months={months} allPlants={plants} onCard={goDetail} />
          : <DetailPage plant={selP} month={selM} onBack={goBack} />
        }
      </div>

      <footer className="foot">
        © 2026 <span style={{ margin: '0 5px' }}>@ajalabs.ai</span> · All rights reserved
      </footer>
    </>
  );
}