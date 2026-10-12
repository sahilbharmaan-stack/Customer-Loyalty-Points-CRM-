import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, UsersRound, Gift, ChartNoAxesCombined, Settings, CircleHelp,
  Search, Bell, ChevronDown, ArrowUpRight, ArrowDownRight, Plus, Download,
  MoreHorizontal, Sparkles, ArrowUp, ArrowDown, Zap, Menu, X, RefreshCw,
  WalletCards, Clock3, CheckCircle2, AlertCircle, Filter, Send, Crown, Gem, Moon, Sun
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : '/api');
const demoCustomers = [
  {id:1,name:'Aarav Mehta',email:'aarav.mehta@example.com',phone:'+91 98765 01001',tier:'Platinum',status:'Active',points_balance:12480,lifetime_points:18900},
  {id:2,name:'Priya Sharma',email:'priya.sharma@example.com',phone:'+91 98765 01002',tier:'Gold',status:'Active',points_balance:8250,lifetime_points:12100},
  {id:3,name:'Rohan Patel',email:'rohan.patel@example.com',phone:'+91 98765 01003',tier:'Silver',status:'Active',points_balance:5420,lifetime_points:7800},
  {id:4,name:'Ananya Singh',email:'ananya.singh@example.com',phone:'+91 98765 01004',tier:'Gold',status:'Active',points_balance:3900,lifetime_points:6400},
  {id:5,name:'Vikram Reddy',email:'vikram.reddy@example.com',phone:'+91 98765 01005',tier:'Bronze',status:'Active',points_balance:1280,lifetime_points:2100},
  {id:6,name:'Neha Gupta',email:'neha.gupta@example.com',phone:'+91 98765 01006',tier:'Silver',status:'Active',points_balance:6150,lifetime_points:9200},
];
const trend = [{day:'Mon',earned:3400,redeemed:1800},{day:'Tue',earned:4200,redeemed:2400},{day:'Wed',earned:3100,redeemed:2100},{day:'Thu',earned:5100,redeemed:2900},{day:'Fri',earned:4700,redeemed:2500},{day:'Sat',earned:6200,redeemed:3400},{day:'Sun',earned:5600,redeemed:3100}];
const initialActivity = [
  {id:1,customer:'Aarav Mehta',kind:'earn',points:240,note:'Purchase reward',created_at:new Date().toISOString()},
  {id:2,customer:'Priya Sharma',kind:'redeem',points:500,note:'Signature coffee',created_at:new Date(Date.now()-3600000).toISOString()},
  {id:3,customer:'Rohan Patel',kind:'earn',points:180,note:'Birthday bonus',created_at:new Date(Date.now()-7200000).toISOString()},
  {id:4,customer:'Ananya Singh',kind:'earn',points:320,note:'Purchase reward',created_at:new Date(Date.now()-10800000).toISOString()},
];
const fmt = n => new Intl.NumberFormat('en-US').format(n || 0);
const initials = name => name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
const tierClass = tier => (tier || 'bronze').toLowerCase();
async function api(path, options={}) {
  const response = await fetch(`${API}${path}`, {headers:{'Content-Type':'application/json', ...(options.headers||{})}, ...options});
  if (!response.ok) { let message = `Request failed (${response.status})`; try {const body=await response.json(); message=body.detail || message;} catch {} throw new Error(message); }
  return response.json();
}
function App() {
  const [theme,setTheme] = useState(()=>localStorage.getItem('loyaltyos-theme')==='dark'?'dark':'light');
  const [page,setPage] = useState('Overview');
  const [customers,setCustomers] = useState(demoCustomers);
  const [activity,setActivity] = useState(initialActivity);
  const [rewards,setRewards] = useState([
    {id:1,name:'Signature Coffee',description:'Your daily ritual, on us.',points_cost:500,category:'Food & Drink'},
    {id:2,name:'10% Off Next Order',description:'A little thank-you for your next visit.',points_cost:1000,category:'Discount'},
    {id:3,name:'VIP Experience',description:'Unlock a little extra magic.',points_cost:2500,category:'Experience'},
    {id:4,name:'$25 Gift Card',description:'Make your next moment special.',points_cost:5000,category:'Gift card'}
  ]);
  const [metrics,setMetrics] = useState({total_customers:2486,points_in_circulation:1284500,total_transactions:18340,active_rewards:12});
  const [search,setSearch] = useState('');
  const [tier,setTier] = useState('All tiers');
  const [modal,setModal] = useState('');
  const [toast,setToast] = useState('');
  const [loading,setLoading] = useState(false);
  const [apiOnline,setApiOnline] = useState(false);
  const [mobileNav,setMobileNav] = useState(false);
  const [customerForm,setCustomerForm] = useState({name:'',email:'',phone:'',tier:'Bronze'});
  const [pointsForm,setPointsForm] = useState({customer_id:'1',kind:'earn',points:'100',note:'Loyalty bonus'});
  const [error,setError] = useState('');

  useEffect(()=>{
    document.documentElement.dataset.theme=theme;
    localStorage.setItem('loyaltyos-theme',theme);
  },[theme]);
  async function refresh() {
    setLoading(true);
    try {
      const [m,c,r,t] = await Promise.all([api('/dashboard'),api('/customers?limit=100'),api('/rewards'),api('/loyalty/transactions?limit=8')]);
      setMetrics(m); setCustomers(c); setRewards(r);
      const names = Object.fromEntries(c.map(x=>[x.id,x.name]));
      setActivity(t.map(x=>({...x,customer:names[x.customer_id]||'Customer',created_at:x.created_at})));
      setApiOnline(true); setError('');
    } catch { setApiOnline(false); }
    finally {setLoading(false);}
  }
  useEffect(()=>{refresh();},[]);
  useEffect(()=>{if(!toast)return;const id=setTimeout(()=>setToast(''),3000);return()=>clearTimeout(id);},[toast]);
  const filtered = useMemo(()=>customers.filter(c=>(`${c.name} ${c.email}`.toLowerCase().includes(search.toLowerCase())) && (tier==='All tiers'||c.tier===tier)),[customers,search,tier]);
  const nav = [
    {label:'Overview',icon:LayoutDashboard,group:'WORKSPACE'},
    {label:'Customers',icon:UsersRound,group:'WORKSPACE'},
    {label:'Rewards & perks',icon:Gift,group:'WORKSPACE'},
    {label:'Analytics',icon:ChartNoAxesCombined,group:'INSIGHTS'},
  ];
  async function createCustomer(e) {
    e.preventDefault(); setError('');
    try {
      const c = apiOnline ? await api('/customers',{method:'POST',body:JSON.stringify(customerForm)}) : {...customerForm,id:Date.now(),status:'Active',points_balance:0,lifetime_points:0};
      setCustomers(old=>[c,...old]); setMetrics(m=>({...m,total_customers:m.total_customers+1}));
      setCustomerForm({name:'',email:'',phone:'',tier:'Bronze'});setModal('');setToast('Customer added successfully.');
      if(apiOnline) refresh();
    } catch(err){setError(err.message);}
  }
  async function createPoints(e) {
    e.preventDefault();setError('');
    try {
      if(apiOnline) {
        await api('/loyalty/transactions',{method:'POST',body:JSON.stringify({...pointsForm,customer_id:Number(pointsForm.customer_id),points:Number(pointsForm.points)})});
        await refresh();
      } else {
        const amount=Number(pointsForm.points), id=Number(pointsForm.customer_id);
        setCustomers(old=>old.map(c=>c.id===id?{...c,points_balance:c.points_balance+(pointsForm.kind==='earn'?amount:-amount),lifetime_points:c.lifetime_points+(pointsForm.kind==='earn'?amount:0)}:c));
        setActivity(old=>[{id:Date.now(),customer:customers.find(c=>c.id===id)?.name||'Customer',kind:pointsForm.kind,points:amount,note:pointsForm.note,created_at:new Date().toISOString()},...old]);
      }
      setModal('');setToast(`Points ${pointsForm.kind==='earn'?'added':'redeemed'} successfully.`);
    } catch(err){setError(err.message);}
  }
  const exportCustomers = () => {
    const csv = ['Name,Email,Phone,Tier,Points balance,Status',...filtered.map(c=>[c.name,c.email,c.phone,c.tier,c.points_balance,c.status].map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(','))].join('\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='loyaltyos-customers.csv';a.click();URL.revokeObjectURL(url);
  };
  const openPage = label => {setPage(label);setMobileNav(false);};
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-mark"><Sparkles size={19}/></div><span>Loyalty<span className="brand-light">OS</span></span><button className="mobile-close icon-btn" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-switch"><div className="workspace-logo">S</div><div className="workspace-copy"><strong>Studio North</strong><span>Growth workspace</span></div><ChevronDown size={15}/></div>
      <div className="nav-section">{nav.filter(n=>n.group==='WORKSPACE').map(n=><button key={n.label} onClick={()=>openPage(n.label)} className={`nav-item ${page===n.label?'active':''}`}><n.icon size={18}/><span>{n.label}</span>{n.label==='Customers'&&<span className="nav-count">{fmt(metrics.total_customers)}</span>}</button>)}</div>
      <div className="nav-label">INSIGHTS</div>{nav.filter(n=>n.group==='INSIGHTS').map(n=><button key={n.label} onClick={()=>openPage(n.label)} className={`nav-item ${page===n.label?'active':''}`}><n.icon size={18}/><span>{n.label}</span></button>)}
      <div className="nav-label">PREFERENCES</div><button className="nav-item" onClick={()=>setToast('Settings are coming soon.')}><Settings size={18}/><span>Settings</span></button><button className="nav-item" onClick={()=>setToast('Help center is coming soon.')}><CircleHelp size={18}/><span>Help & support</span></button>
      <div className="sidebar-bottom"><div className="plan-card"><div className="plan-icon"><Zap size={17}/></div><div><strong>Growth plan</strong><span>2,486 of 5,000 members</span></div><div className="plan-progress"><span/></div><button onClick={()=>setToast('Plan management is not connected yet.')}>Explore plans <ArrowUpRight size={14}/></button></div><div className="profile"><div className="avatar avatar-violet">S</div><div className="profile-copy"><strong>Sahil</strong><span>Workspace admin</span></div><MoreHorizontal size={18}/></div></div>
    </aside>
    {mobileNav&&<button className="mobile-scrim" aria-label="Close navigation" onClick={()=>setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><button className="mobile-menu icon-btn" onClick={()=>setMobileNav(true)}><Menu size={20}/></button><span>Workspace</span><span className="crumb-slash">/</span><strong>{page}</strong></div><div className="top-actions"><div className={`api-status ${apiOnline?'online':'offline'}`}><span/>{apiOnline?'API connected':'Demo mode'}</div><button className="icon-btn theme-toggle" onClick={()=>setTheme(current=>current==='dark'?'light':'dark')} aria-label={`Switch to ${theme==='dark'?'light':'dark'} mode`} aria-pressed={theme==='dark'} title={`Switch to ${theme==='dark'?'light':'dark'} mode`}>{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button><button className="icon-btn notification" onClick={()=>setToast('You’re all caught up.')} aria-label="Notifications"><Bell size={18}/><i/></button><div className="top-divider"/><button className="top-profile" onClick={()=>setToast('Signed in as Sahil')}><div className="avatar avatar-violet">S</div><ChevronDown size={15}/></button></div></header>
      <div className="page-content">
        <div className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-dot"/> YOUR LOYALTY, IN FOCUS</div><h1>{page==='Overview'?'Good morning, Sahil':page}</h1><p className="page-subtitle">{page==='Overview'?'Here’s what’s happening with your loyalty program today.':page==='Customers'?'Build stronger relationships with every customer.':page==='Rewards & perks'?'Give your members more reasons to come back.':'Understand the moments that keep customers coming back.'}</p></div><div className="header-buttons"><button className="btn btn-secondary" onClick={exportCustomers}><Download size={16}/> Export</button><button className="btn btn-primary" onClick={()=>{setError('');setModal('customer')}}><Plus size={17}/> Add customer</button></div></div>
        {page==='Overview'&&<>
          <div className="insight-banner"><div className="insight-symbol"><Sparkles size={19}/></div><div className="insight-copy"><strong>Your loyalty flywheel is gaining momentum</strong><span>Members with rewards redeemed are more likely to return within 30 days.</span></div><button onClick={()=>openPage('Analytics')}>Explore insights <ArrowUpRight size={15}/></button><button className="banner-dismiss" aria-label="Dismiss" onClick={e=>e.currentTarget.parentElement.remove()}><X size={16}/></button></div>
          <section className="metric-grid">
            <Metric title="Total members" value={fmt(metrics.total_customers)} change="+12.8%" icon={UsersRound} tone="violet" note="vs. last month"/>
            <Metric title="Points in circulation" value={fmt(metrics.points_in_circulation)} change="+8.2%" icon={Gem} tone="blue" note="vs. last month"/>
            <Metric title="Points redeemed" value="84,290" change="+18.4%" icon={WalletCards} tone="orange" note="vs. last month"/>
            <Metric title="Active rewards" value={fmt(metrics.active_rewards)} change="+2 new" icon={Gift} tone="green" note="this month"/>
          </section>
          <section className="dashboard-grid"><div className="panel chart-panel"><div className="panel-heading"><div><h2>Loyalty activity</h2><p>Points earned and redeemed over time</p></div><select className="select-control" defaultValue="7 days"><option>7 days</option><option>30 days</option><option>90 days</option></select></div><div className="chart-legend"><span><i className="legend-earned"/> Points earned</span><span><i className="legend-redeemed"/> Points redeemed</span><div className="chart-total"><strong>32,300</strong><span>points earned</span></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{top:12,right:8,left:-20,bottom:0}}><defs><linearGradient id="earnedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7865e8" stopOpacity={0.19}/><stop offset="95%" stopColor="#7865e8" stopOpacity={0}/></linearGradient><linearGradient id="redeemedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#40b7a0" stopOpacity={0.13}/><stop offset="95%" stopColor="#40b7a0" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#eff0f6" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:'#9698aa',fontSize:12}} dy={10}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#9698aa',fontSize:11}} tickFormatter={v=>`${v/1000}k`}/><Tooltip contentStyle={{border:'1px solid #eeedf5',borderRadius:12,boxShadow:'0 8px 24px #24204a12'}}/><Area type="monotone" dataKey="earned" name="Earned" stroke="#7865e8" strokeWidth={2.5} fill="url(#earnedFill)"/><Area type="monotone" dataKey="redeemed" name="Redeemed" stroke="#40b7a0" strokeWidth={2.5} fill="url(#redeemedFill)"/></AreaChart></ResponsiveContainer></div><div className="chart-foot"><span><span className="live-dot"/> Data updated just now</span><button onClick={refresh}><RefreshCw size={13}/> Refresh</button></div></div>
          <div className="panel tier-panel"><div className="panel-heading"><div><h2>Member distribution</h2><p>Your community at a glance</p></div><button className="more-btn" onClick={()=>openPage('Customers')}><MoreHorizontal size={19}/></button></div><div className="tier-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{name:'Platinum',value:18,color:'#7966e9'},{name:'Gold',value:32,color:'#e8b85f'},{name:'Silver',value:29,color:'#9da8bb'},{name:'Bronze',value:21,color:'#d99b7c'}]} dataKey="value" nameKey="name" innerRadius={62} outerRadius={83} paddingAngle={4} stroke="none">{['#7966e9','#e8b85f','#9da8bb','#d99b7c'].map((c,i)=><Cell key={i} fill={c}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="donut-center"><strong>100%</strong><span>members</span></div></div><div className="tier-legend">{[['Platinum','18%','#7966e9'],['Gold','32%','#e8b85f'],['Silver','29%','#9da8bb'],['Bronze','21%','#d99b7c']].map(([name,pct,color])=><div key={name}><span className="tier-legend-name"><i style={{background:color}}/>{name}</span><strong>{pct}</strong></div>)}</div></div></section>
          <section className="bottom-grid"><div className="panel customers-panel"><div className="panel-heading"><div><h2>Top members</h2><p>Your most engaged customers</p></div><button className="text-link" onClick={()=>openPage('Customers')}>View all <ArrowUpRight size={14}/></button></div><CustomerTable customers={customers.slice(0,5)} compact onManage={c=>{setPointsForm({...pointsForm,customer_id:String(c.id)});setModal('points')}}/></div><div className="panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>The latest member moments</p></div><button className="more-btn" onClick={()=>setModal('points')}><Plus size={17}/></button></div><ActivityList activity={activity.slice(0,4)}/><button className="activity-footer" onClick={()=>openPage('Analytics')}>View all activity <ArrowUpRight size={14}/></button></div></section>
        </>}
        {page==='Customers'&&<section className="panel directory-panel"><div className="directory-toolbar"><div><h2>All customers <span className="subtle-count">{filtered.length}</span></h2><p>Know your members. Reward their loyalty.</p></div><div className="directory-actions"><div className="search-box"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search members..."/>{search&&<button onClick={()=>setSearch('')}><X size={14}/></button>}</div><select className="select-control" value={tier} onChange={e=>setTier(e.target.value)}><option>All tiers</option><option>Platinum</option><option>Gold</option><option>Silver</option><option>Bronze</option></select><button className="btn btn-primary" onClick={()=>setModal('customer')}><Plus size={16}/> Add member</button></div></div><CustomerTable customers={filtered} onManage={c=>{setPointsForm({...pointsForm,customer_id:String(c.id)});setModal('points')}}/>{filtered.length===0&&<div className="empty-state"><UsersRound size={25}/><strong>No members found</strong><span>Try a different search or tier.</span></div>}<div className="table-footer">Showing <strong>{filtered.length}</strong> of <strong>{customers.length}</strong> members <span>All member data is up to date</span></div></section>}
        {page==='Rewards & perks'&&<section className="rewards-grid">{rewards.map((r,i)=><div className={`reward-card reward-${i%4}`} key={r.id}><div className="reward-top"><div className="reward-icon">{i===0?<Gift/>:i===1?<Sparkles/>:i===2?<Crown/>:<Gem/>}</div><span className="reward-status"><i/> Active</span></div><span className="reward-category">{r.category}</span><h2>{r.name}</h2><p>{r.description}</p><div className="reward-bottom"><div><strong>{fmt(r.points_cost)}</strong><span>points required</span></div><button onClick={()=>setToast(`${r.name} reward selected.`)}>View reward <ArrowUpRight size={14}/></button></div></div>)}<button className="add-reward-card" onClick={()=>setToast('Reward creation is coming soon.')}><span><Plus size={20}/></span><strong>Create a reward</strong><small>Give members something to love</small></button></section>}
        {page==='Analytics'&&<><section className="metric-grid"><Metric title="Total members" value={fmt(metrics.total_customers)} change="+12.8%" icon={UsersRound} tone="violet" note="vs. last month"/><Metric title="Points issued" value="246,810" change="+14.2%" icon={ArrowUp} tone="blue" note="vs. last month"/><Metric title="Redemption rate" value="34.6%" change="+4.1%" icon={ChartNoAxesCombined} tone="green" note="vs. last month"/><Metric title="Repeat visits" value="68.2%" change="+9.7%" icon={RefreshCw} tone="orange" note="vs. last month"/></section><section className="panel chart-panel analytics-chart"><div className="panel-heading"><div><h2>Program performance</h2><p>Weekly loyalty points activity</p></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend}><CartesianGrid stroke="#eff0f6" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip/><Area type="monotone" dataKey="earned" stroke="#7865e8" fill="#7865e820"/><Area type="monotone" dataKey="redeemed" stroke="#40b7a0" fill="#40b7a020"/></AreaChart></ResponsiveContainer></div></section></>}
        <footer className="page-footer"><span>© 2026 LoyaltyOS</span><span>Made for meaningful customer relationships <span className="footer-heart">✦</span></span><span className="footer-status"><i/> All systems operational</span></footer>
      </div>
    </main>
    {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal('')}}><div className="modal-card"><div className="modal-head"><div><span className="modal-kicker">{modal==='customer'?'MEMBER MANAGEMENT':'POINTS & REWARDS'}</span><h2>{modal==='customer'?'Add a new customer':'Manage loyalty points'}</h2><p>{modal==='customer'?'Welcome someone new to your loyalty community.':'Make every interaction count.'}</p></div><button className="icon-btn" onClick={()=>setModal('')}><X size={19}/></button></div><form onSubmit={modal==='customer'?createCustomer:createPoints}>{modal==='customer'?<><label>Full name<input required minLength="2" value={customerForm.name} onChange={e=>setCustomerForm({...customerForm,name:e.target.value})} placeholder="e.g. Alex Morgan"/></label><label>Email address<input required type="email" value={customerForm.email} onChange={e=>setCustomerForm({...customerForm,email:e.target.value})} placeholder="alex@example.com"/></label><label>Phone number <span className="optional-label">Optional</span><input value={customerForm.phone} onChange={e=>setCustomerForm({...customerForm,phone:e.target.value})} placeholder="+1 555 0000"/></label><label>Membership tier<select value={customerForm.tier} onChange={e=>setCustomerForm({...customerForm,tier:e.target.value})}><option>Bronze</option><option>Silver</option><option>Gold</option><option>Platinum</option></select></label></>:<><label>Customer<select value={pointsForm.customer_id} onChange={e=>setPointsForm({...pointsForm,customer_id:e.target.value})}>{customers.map(c=><option key={c.id} value={c.id}>{c.name} · {fmt(c.points_balance)} pts</option>)}</select></label><label>Transaction type<select value={pointsForm.kind} onChange={e=>setPointsForm({...pointsForm,kind:e.target.value})}><option value="earn">Award points</option><option value="redeem">Redeem points</option></select></label><label>Points amount<input required type="number" min="1" max="1000000" value={pointsForm.points} onChange={e=>setPointsForm({...pointsForm,points:e.target.value})}/></label><label>Reason<input value={pointsForm.note} onChange={e=>setPointsForm({...pointsForm,note:e.target.value})} placeholder="Purchase bonus, reward..."/></label></>}{error&&<div className="form-error"><AlertCircle size={15}/>{error}</div>}<div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={()=>setModal('')}>Cancel</button><button type="submit" className="btn btn-primary">{modal==='customer'?<><Plus size={16}/> Add customer</>:<><CheckCircle2 size={16}/> Confirm points</>}</button></div></form></div></div>}
    {toast&&<div className="toast"><CheckCircle2 size={17}/>{toast}<button onClick={()=>setToast('')}><X size={14}/></button></div>}
    {loading&&<div className="sync-pill"><RefreshCw size={13}/> Syncing data</div>}
  </div>;
}
function Metric({title,value,change,icon:Icon,tone,note}) {return <div className="metric-card"><div className="metric-top"><span>{title}</span><div className={`metric-icon ${tone}`}><Icon size={18}/></div></div><div className="metric-value">{value}</div><div className="metric-foot"><span className="metric-change"><ArrowUpRight size={13}/>{change}</span><span>{note}</span></div><div className={`metric-spark spark-${tone}`}><svg viewBox="0 0 100 25" preserveAspectRatio="none"><path d="M0 20 C10 17 15 21 25 13 S40 19 50 10 S65 16 75 7 S90 10 100 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div></div>}
function CustomerTable({customers,compact=false,onManage}) {return <div className="table-scroll"><table className="customer-table"><thead><tr><th><input type="checkbox" aria-label="Select all customers"/></th><th>Customer</th><th>Membership</th><th>Points balance</th><th>Status</th>{!compact&&<th>Lifetime points</th>}<th></th></tr></thead><tbody>{customers.map(c=><tr key={c.id}><td><input type="checkbox" aria-label={`Select ${c.name}`}/></td><td><div className="customer-cell"><div className={`avatar avatar-${['violet','blue','peach','green','rose','gold'][c.id%6]}`}>{initials(c.name)}</div><div><strong>{c.name}</strong><span>{c.email}</span></div></div></td><td><span className={`tier-pill ${tierClass(c.tier)}`}><i/>{c.tier}</span></td><td><strong className="points-number">{fmt(c.points_balance)} <span>pts</span></strong></td><td><span className="status-pill"><i/>{c.status||'Active'}</span></td>{!compact&&<td className="lifetime-points">{fmt(c.lifetime_points)}</td>}<td><button className="row-more" aria-label={`Actions for ${c.name}`} title="Manage points" onClick={()=>onManage?.(c)}><MoreHorizontal size={17}/></button></td></tr>)}</tbody></table></div>}
function ActivityList({activity}) {return <div className="activity-list">{activity.map(a=><div className="activity-item" key={a.id}><div className={`activity-icon ${a.kind==='redeem'?'activity-redeem':'activity-earn'}`}>{a.kind==='redeem'?<Gift size={16}/>:<ArrowDownRight size={16}/>}</div><div className="activity-copy"><strong>{a.customer}</strong><span>{a.note||`${a.kind} points`}</span><small><Clock3 size={11}/>{new Date(a.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></div><div className={`activity-points ${a.kind==='redeem'?'negative':''}`}>{a.kind==='redeem'?'−':'+'}{fmt(a.points)}<span>pts</span></div></div>)}</div>}
export default App;
