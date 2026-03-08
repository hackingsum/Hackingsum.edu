// ================================================================
//  HACKINGSUM.EDU — COMPLETE PLATFORM WITH FIREBASE
//  File: src/App.jsx
//
//  FIREBASE SETUP STEPS:
//  1. npm install firebase
//  2. src/firebase.js mein apna config daalo
//  3. npm run dev → test karo
// ================================================================

import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import {
  getFirestore,
  doc, setDoc, getDoc, getDocs,
  collection, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, onSnapshot
} from "firebase/firestore";

// ================================================================
//  🔴 APNA FIREBASE CONFIG YAHAN DAALO
// ================================================================
const firebaseConfig = {
apiKey: "AIzaSyCpa1KFbnlNG6-ArSC9VKyflXSVLUrFgBo",

  authDomain: "hackingsum-edu.firebaseapp.com",

  projectId: "hackingsum-edu",

  storageBucket: "hackingsum-edu.firebasestorage.app",

  messagingSenderId: "125564185388",

  appId: "1:125564185388:web:136ac153537c820aff5a89"

};

const firebaseApp = initializeApp(firebaseConfig);
const auth        = getAuth(firebaseApp);
const db          = getFirestore(firebaseApp);

// ================================================================
//  ADMIN EMAIL (Firebase Auth se bhi login hoga)
// ================================================================
const ADMIN_EMAIL    = "admin@hackingsum.edu";
const ADMIN_PASSWORD = "Admin@123";

// ================================================================
//  SEED COURSES (pehli baar Firestore mein save honge)
// ================================================================
const SEED_COURSES = [
  {
    id:"c1", title:"Python Zero to Hero", category:"Programming",
    level:"Beginner", color:"#00f5c4", icon:"🐍", instructor:"HackingSum Team",
    description:"Master Python from scratch — variables, data structures, OOP, file I/O and real projects.",
    videos:[
      { id:"v101", title:"Why Python? Setup & First Program", ytId:"kqtD5dpn9C8", duration:"12:34" },
      { id:"v102", title:"Variables, Data Types & Operators",  ytId:"_uQrJ0TkZlc", duration:"28:14" },
      { id:"v103", title:"Conditionals & Loops",               ytId:"HQqqNBZosn8", duration:"22:10" },
      { id:"v104", title:"Functions & Modules",                ytId:"9Os0o3wzS_I", duration:"31:05" },
      { id:"v105", title:"Lists, Tuples & Dictionaries",       ytId:"W8KRzm-HUcc", duration:"26:40" },
    ]
  },
  {
    id:"c2", title:"C++ Complete Masterclass", category:"Programming",
    level:"Intermediate", color:"#0088ff", icon:"⚙️", instructor:"HackingSum Team",
    description:"Deep dive into C++ — pointers, OOP, STL, templates and competitive programming tricks.",
    videos:[
      { id:"v201", title:"C++ Intro & Environment Setup",  ytId:"vLnPwxZdW4Y", duration:"14:05" },
      { id:"v202", title:"Variables, I/O & Data Types",    ytId:"Rub-JsjMhWY", duration:"20:30" },
      { id:"v203", title:"Arrays, Strings & Pointers",     ytId:"zuegQmMdy8M", duration:"35:18" },
      { id:"v204", title:"OOP — Classes & Objects",        ytId:"wN0x9eZLix4", duration:"28:44" },
    ]
  },
  {
    id:"c3", title:"Web Dev: HTML + CSS + JS", category:"Web Dev",
    level:"Beginner", color:"#ff4d8d", icon:"🌐", instructor:"HackingSum Team",
    description:"Build stunning websites from scratch — HTML5 structure, CSS3 animations, JavaScript interactivity.",
    videos:[
      { id:"v301", title:"HTML5 — Complete Crash Course",      ytId:"kUMe1FH4CHE", duration:"11:20" },
      { id:"v302", title:"CSS3 — Layouts, Flexbox & Grid",     ytId:"OXGznpKZ_sA", duration:"16:45" },
      { id:"v303", title:"JavaScript — The Complete Intro",    ytId:"W6NZfCO5SIk", duration:"19:55" },
      { id:"v304", title:"DOM Manipulation & Events",          ytId:"y17RuWkWdn8", duration:"24:30" },
    ]
  },
  {
    id:"c4", title:"DSA Masterclass", category:"DSA",
    level:"Intermediate", color:"#ffbe00", icon:"🧠", instructor:"HackingSum Team",
    description:"Arrays, Linked Lists, Stacks, Trees, Graphs, Sorting & Dynamic Programming for interviews.",
    videos:[
      { id:"v401", title:"Big O Notation & Complexity",     ytId:"BgLTDT03QtU", duration:"20:12" },
      { id:"v402", title:"Arrays & Strings — Deep Dive",    ytId:"CBYHwZcbD-s", duration:"28:12" },
      { id:"v403", title:"Linked Lists — All Variants",     ytId:"Hj_rA0dhr2I", duration:"24:44" },
      { id:"v404", title:"Binary Trees & BST",              ytId:"fAAZixBzIAI", duration:"31:05" },
      { id:"v405", title:"Dynamic Programming Intro",       ytId:"oBt53YbR9Kk", duration:"35:40" },
    ]
  },
  {
    id:"c5", title:"Cybersecurity Fundamentals", category:"Cybersecurity",
    level:"Beginner", color:"#a855f7", icon:"🔐", instructor:"HackingSum Team",
    description:"Ethical hacking, networking, Linux CLI, OWASP Top 10, CTF basics and penetration testing.",
    videos:[
      { id:"v501", title:"What is Cybersecurity? Career Paths", ytId:"U_P23SqJaDc", duration:"15:30" },
      { id:"v502", title:"Linux for Hackers — CLI Basics",      ytId:"ZtqBQ68cfJc", duration:"22:00" },
      { id:"v503", title:"Networking Essentials — TCP/IP",      ytId:"qiQR5rTSshw", duration:"18:45" },
      { id:"v504", title:"Intro to Ethical Hacking",            ytId:"3Kq1MIfTWCE", duration:"26:20" },
    ]
  },
  {
    id:"c6", title:"Competitive Programming", category:"CP",
    level:"Advanced", color:"#22d3ee", icon:"🏆", instructor:"HackingSum Team",
    description:"Train like a champion. Greedy, Divide & Conquer, DP, Graph algorithms. Crack Codeforces & ICPC.",
    videos:[
      { id:"v601", title:"CP Setup — Tools & Strategy",         ytId:"GjpS7lRUBFg", duration:"10:20" },
      { id:"v602", title:"Greedy Algorithms Deep Dive",         ytId:"HzeK7g8cD0Y", duration:"26:15" },
      { id:"v603", title:"Binary Search — All Patterns",        ytId:"GU7DpgHINWQ", duration:"22:40" },
      { id:"v604", title:"Graph Algorithms — BFS & DFS",        ytId:"pcKY4hjDrxk", duration:"38:05" },
    ]
  },
];

// ================================================================
//  DESIGN TOKENS
// ================================================================
const T = {
  bg:"#060d18", bg2:"#0a1628", bg3:"#0e1f38", card:"#0c1830",
  border:"#162847", border2:"#1e3660",
  accent:"#00f5c4", blue:"#2196f3", pink:"#f0437a",
  amber:"#f59e0b", purple:"#a855f7", cyan:"#22d3ee",
  text:"#dde8f8", muted:"#4d6f99", muted2:"#7a9cc4",
  danger:"#f44336", success:"#22c55e",
};

// ================================================================
//  GLOBAL CSS
// ================================================================
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{background:${T.bg};color:${T.text};font-family:'Plus Jakarta Sans',sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
  ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:${T.bg};}::-webkit-scrollbar-thumb{background:${T.accent}55;border-radius:4px;}
  input,select,textarea,button{font-family:inherit;}
  button{cursor:pointer;}

  .grid-bg{background-image:linear-gradient(rgba(0,245,196,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,196,.02) 1px,transparent 1px);background-size:48px 48px;}

  @keyframes fadeUp  {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
  @keyframes spin    {to{transform:rotate(360deg)}}
  @keyframes shimmer {0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes pulse   {0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes float   {0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes glow    {0%,100%{box-shadow:0 0 8px ${T.accent}44}50%{box-shadow:0 0 28px ${T.accent}88}}

  .fade-up{animation:fadeUp .45s ease both;}
  .fade-in{animation:fadeIn .3s ease both;}
  .float{animation:float 4s ease-in-out infinite;}

  .grad-text{background:linear-gradient(110deg,#fff 0%,${T.accent} 50%,${T.blue} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
  .grad-text2{background:linear-gradient(110deg,${T.accent},${T.blue});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
  .shimmer-text{background:linear-gradient(90deg,${T.accent},${T.blue},${T.accent});background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite;}

  .btn-pri{background:linear-gradient(135deg,${T.accent},${T.blue});color:${T.bg};border:none;font-weight:700;padding:12px 28px;border-radius:8px;font-size:14px;cursor:pointer;transition:transform .2s,box-shadow .2s;white-space:nowrap;}
  .btn-pri:hover{transform:translateY(-2px);box-shadow:0 10px 30px ${T.accent}44;}
  .btn-pri:disabled{opacity:.6;cursor:not-allowed;transform:none;}
  .btn-sec{background:transparent;color:${T.text};border:1px solid ${T.border2};font-weight:600;padding:12px 28px;border-radius:8px;font-size:14px;cursor:pointer;transition:all .2s;}
  .btn-sec:hover{border-color:${T.accent};color:${T.accent};}
  .btn-sec:disabled{opacity:.5;cursor:not-allowed;}
  .btn-ghost{background:transparent;color:${T.muted2};border:none;padding:8px 14px;border-radius:6px;font-size:13px;cursor:pointer;transition:all .2s;}
  .btn-ghost:hover{background:${T.bg3};color:${T.text};}
  .btn-red{background:${T.danger}1a;color:${T.danger};border:1px solid ${T.danger}33;padding:7px 14px;border-radius:6px;font-size:12px;cursor:pointer;transition:all .2s;}
  .btn-red:hover{background:${T.danger}33;}

  .inp{width:100%;background:${T.bg3};border:1px solid ${T.border};border-radius:8px;padding:12px 16px;color:${T.text};font-size:14px;transition:border-color .2s,box-shadow .2s;outline:none;}
  .inp:focus{border-color:${T.accent}77;box-shadow:0 0 0 3px ${T.accent}15;}
  .inp::placeholder{color:${T.muted};}
  .lbl{display:block;font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:500;color:${T.muted2};letter-spacing:1.5px;text-transform:uppercase;margin-bottom:7px;}

  .card{background:${T.card};border:1px solid ${T.border};border-radius:12px;}
  .card-hover{transition:transform .25s,box-shadow .25s,border-color .25s;}
  .card-hover:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,.4);border-color:${T.accent}55!important;}

  .badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-family:'JetBrains Mono',monospace;}
  .badge-a{background:${T.accent}18;color:${T.accent};border:1px solid ${T.accent}33;}
  .badge-b{background:${T.blue}18;color:${T.blue};border:1px solid ${T.blue}33;}
  .badge-y{background:${T.amber}18;color:${T.amber};border:1px solid ${T.amber}33;}
  .badge-p{background:${T.purple}18;color:${T.purple};border:1px solid ${T.purple}33;}
  .badge-r{background:${T.pink}18;color:${T.pink};border:1px solid ${T.pink}33;}
  .badge-g{background:${T.success}18;color:${T.success};border:1px solid ${T.success}33;}

  .section-tag{display:inline-flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${T.accent};margin-bottom:12px;}
  .section-tag::before{content:'';width:20px;height:1px;background:${T.accent};}
  .divider{height:1px;background:linear-gradient(90deg,transparent,${T.border2},transparent);}

  .glass{background:rgba(12,24,48,.88);backdrop-filter:blur(20px);border:1px solid ${T.border};border-radius:16px;}

  .scrollable{overflow-y:auto;}
  .scrollable::-webkit-scrollbar{width:3px;}
  .scrollable::-webkit-scrollbar-thumb{background:${T.border2};border-radius:3px;}

  /* RESPONSIVE */
  @media(max-width:768px){
    .hide-mob{display:none!important;}
    .nav-pad{padding:0 16px!important;}
    .page-pad{padding:80px 16px 40px!important;}
    .hero-row{flex-direction:column!important;}
    .hero-card{display:none!important;}
    .watch-row{grid-template-columns:1fr!important;}
    .admin-grid{grid-template-columns:1fr!important;}
    .dash-grid{grid-template-columns:1fr!important;}
    .footer-grid{grid-template-columns:1fr 1fr!important;}
    .hero-btns{flex-direction:column!important;}
    .hero-btns button,.hero-btns a{width:100%!important;}
  }
  @media(max-width:480px){
    .stats-grid{grid-template-columns:1fr 1fr!important;}
    .courses-grid{grid-template-columns:1fr!important;}
    .footer-grid{grid-template-columns:1fr!important;}
  }
`;

// ================================================================
//  LOGO
// ================================================================
function Logo({ size=1, onClick }) {
  return (
    <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:10*size,cursor:onClick?"pointer":"default"}}>
      <svg width={40*size} height={40*size} viewBox="0 0 44 44" fill="none"
        style={{filter:`drop-shadow(0 0 ${9*size}px ${T.accent}66) drop-shadow(0 0 ${20*size}px ${T.blue}33)`}}>
        <defs>
          <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={T.accent}/><stop offset="100%" stopColor={T.blue}/></linearGradient>
          <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={T.accent} stopOpacity=".13"/><stop offset="100%" stopColor={T.blue} stopOpacity=".04"/></linearGradient>
        </defs>
        <path d="M22 2L40 9L40 22C40 33 22 42 22 42C22 42 4 33 4 22L4 9Z" fill="url(#lg2)" stroke="url(#lg1)" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M24.5 11L17 24L22 24L19.5 33L27 20L22 20Z" fill="url(#lg1)"/>
      </svg>
      <div style={{lineHeight:1}}>
        <div style={{display:"flex",alignItems:"baseline"}}>
          <span style={{fontWeight:800,fontSize:19*size,background:`linear-gradient(110deg,#fff,${T.accent} 55%,${T.blue})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-.5}}>Hacking</span>
          <span style={{fontWeight:300,fontSize:19*size,color:"rgba(255,255,255,.4)",WebkitTextFillColor:"rgba(255,255,255,.4)",letterSpacing:-.5}}>Sum</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:11*size,background:`linear-gradient(90deg,${T.accent},${T.blue})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",alignSelf:"flex-end",marginBottom:2*size,marginLeft:1}}>.edu</span>
        </div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7.5*size,letterSpacing:2.5,textTransform:"uppercase",background:`linear-gradient(90deg,${T.accent}77,${T.blue}55)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginTop:2}}>Where Hackers Are Born</div>
      </div>
    </div>
  );
}

// ================================================================
//  SPINNER
// ================================================================
function Spin({ size=18 }) {
  return <span style={{display:"inline-block",width:size,height:size,border:`2px solid ${T.border2}`,borderTop:`2px solid ${T.accent}`,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>;
}

// ================================================================
//  PROGRESS RING
// ================================================================
function Ring({ pct, size=80, stroke=6, color=T.accent, label="" }) {
  const r=(size-stroke)/2, circ=2*Math.PI*r, off=circ-(pct/100)*circ;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border2} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
          style={{transition:"stroke-dashoffset .8s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontWeight:800,fontSize:size*.22,color,lineHeight:1}}>{pct}%</span>
        {label && <span style={{fontSize:size*.1,color:T.muted,letterSpacing:.5,marginTop:2}}>{label}</span>}
      </div>
    </div>
  );
}

// ================================================================
//  TOAST
// ================================================================
function Toast({ msg, type="success" }) {
  if (!msg) return null;
  const color = type==="error" ? T.danger : T.accent;
  return (
    <div style={{position:"fixed",top:80,right:20,zIndex:9999,
      background:T.card,border:`1px solid ${color}44`,borderRadius:10,
      padding:"12px 18px",fontSize:13,color,
      boxShadow:`0 8px 30px rgba(0,0,0,.5)`,
      animation:"fadeUp .3s ease both",maxWidth:320}}>
      {type==="error" ? "⚠ " : "✅ "}{msg}
    </div>
  );
}

// ================================================================
//  FIREBASE HELPERS
// ================================================================
// Save course progress for a user
async function saveProgress(userId, courseId, videoId) {
  const ref = doc(db, "progress", userId);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data() : {};
  const courseWatched = existing[courseId] || [];
  if (!courseWatched.includes(videoId)) {
    await setDoc(ref, { ...existing, [courseId]: [...courseWatched, videoId] }, { merge: true });
  }
}

// Get all progress for a user
async function getProgress(userId) {
  const snap = await getDoc(doc(db, "progress", userId));
  return snap.exists() ? snap.data() : {};
}

// Seed courses to Firestore (only if empty)
async function seedCoursesIfNeeded() {
  const snap = await getDocs(collection(db, "courses"));
  if (snap.empty) {
    for (const c of SEED_COURSES) {
      await setDoc(doc(db, "courses", c.id), { ...c, createdAt: serverTimestamp() });
    }
  }
}

// Save student profile to Firestore
async function saveStudentProfile(uid, data) {
  await setDoc(doc(db, "users", uid), {
    ...data, createdAt: serverTimestamp(), role: "student"
  });
}

// ================================================================
//  NAVBAR
// ================================================================
function Navbar({ page, setPage, user, onLogout }) {
  const [mob, setMob] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => { document.body.style.overflow = mob ? "hidden" : ""; }, [mob]);

  const links = user
    ? user.role === "admin"
      ? [{l:"Overview",p:"admin"},{l:"Courses",p:"admin-courses"},{l:"Students",p:"admin-students"}]
      : [{l:"Home",p:"home"},{l:"Dashboard",p:"dashboard"},{l:"Courses",p:"courses"},{l:"My Learning",p:"my-learning"}]
    : [{l:"Home",p:"home"},{l:"Courses",p:"courses"},{l:"About",p:"about"}];

  const go = p => { setPage(p); setMob(false); };

  return (
    <>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:500,height:66,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"0 32px",transition:"background .3s,border-color .3s",
        background:scrolled?"rgba(6,13,24,.95)":"transparent",
        backdropFilter:scrolled?"blur(24px)":"none",
        borderBottom:`1px solid ${scrolled?T.border:"transparent"}`}}
        className="nav-pad">
        <Logo size={.88} onClick={() => go("home")} />

        {/* Desktop */}
        <div className="hide-mob" style={{display:"flex",alignItems:"center",gap:4}}>
          {links.map(({l,p}) => (
            <button key={p} className="btn-ghost" onClick={() => go(p)}
              style={{color:page===p?T.accent:T.muted2,fontWeight:page===p?600:400}}>{l}</button>
          ))}
        </div>
        <div className="hide-mob" style={{display:"flex",alignItems:"center",gap:12}}>
          {user ? (
            <>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${T.accent},${T.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:T.bg}}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span style={{fontSize:13,fontWeight:600,color:T.muted2}}>{user.name?.split(" ")[0]}</span>
              </div>
              <button className="btn-red" onClick={onLogout} style={{padding:"7px 16px",fontSize:13}}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => go("login")}>Login</button>
              <button className="btn-pri" onClick={() => go("register")} style={{padding:"9px 22px"}}>Get Started Free</button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button onClick={() => setMob(!mob)} style={{display:"none",background:"none",border:"none",padding:6,flexDirection:"column",gap:5}}
          className="mob-ham" id="hambtn">
          {mob
            ? <span style={{color:T.text,fontSize:22,lineHeight:1}}>✕</span>
            : [0,1,2].map(i => <span key={i} style={{display:"block",width:24,height:2,background:T.text,borderRadius:2}}/>)
          }
        </button>
      </nav>

      {/* Mobile overlay */}
      {mob && (
        <div style={{position:"fixed",inset:0,zIndex:490,background:"rgba(6,13,24,.97)",backdropFilter:"blur(24px)",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"fadeIn .2s ease",paddingTop:66}}>
          <button onClick={() => setMob(false)} style={{position:"absolute",top:18,right:20,background:"none",border:"none",color:T.muted2,fontSize:26,cursor:"pointer"}}>✕</button>
          <div style={{width:"100%",borderTop:`1px solid ${T.border}`}}>
            {links.map(({l,p}) => (
              <button key={p} onClick={() => go(p)} style={{display:"block",width:"100%",padding:"18px 32px",background:page===p?`${T.accent}08`:"none",border:"none",borderBottom:`1px solid ${T.border}`,color:page===p?T.accent:T.text,fontWeight:700,fontSize:22,textAlign:"left",cursor:"pointer"}}>
                {l}
              </button>
            ))}
          </div>
          <div style={{padding:"24px 32px",width:"100%"}}>
            {user
              ? <button className="btn-red" onClick={() => {onLogout();setMob(false);}} style={{width:"100%",padding:14,fontSize:15}}>Logout</button>
              : <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <button className="btn-sec" onClick={() => go("login")} style={{width:"100%",padding:14}}>Login</button>
                  <button className="btn-pri" onClick={() => go("register")} style={{width:"100%",padding:14}}>Get Started Free</button>
                </div>
            }
          </div>
        </div>
      )}
    </>
  );
}

// ================================================================
//  HOME PAGE
// ================================================================
function HomePage({ setPage, courses, user }) {
  const cats = [
    {name:"Programming",icon:"⌨️",color:T.accent},{name:"Web Dev",icon:"🌐",color:T.blue},
    {name:"DSA",icon:"🧠",color:T.pink},{name:"Cybersecurity",icon:"🔐",color:T.purple},{name:"CP",icon:"🏆",color:T.amber},
  ];
  return (
    <div>
      {/* HERO */}
      <section className="grid-bg" style={{minHeight:"100vh",display:"flex",alignItems:"center",
        padding:"88px 32px 80px",position:"relative",overflow:"hidden",
        background:`radial-gradient(ellipse 90% 60% at 50% -5%,${T.accent}0a 0%,transparent 65%),${T.bg}`}}>
        <div style={{position:"absolute",top:"15%",right:"5%",width:400,height:400,background:`radial-gradient(${T.accent}08,transparent 70%)`,pointerEvents:"none"}}/>
        <div style={{maxWidth:1200,margin:"0 auto",width:"100%"}}>
          <div className="hero-row" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:48}}>
            {/* Left */}
            <div style={{flex:"1 1 520px",maxWidth:620}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:24,
                background:`${T.accent}0d`,border:`1px solid ${T.accent}33`,
                padding:"6px 14px",borderRadius:6}} className="fade-up">
                <span style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:"pulse 2s infinite"}}/>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.accent,letterSpacing:1.5}}>FREE CODING UNIVERSITY</span>
              </div>
              <h1 className="fade-up" style={{fontWeight:800,fontSize:"clamp(40px,6.5vw,82px)",lineHeight:1.02,letterSpacing:"-2.5px",marginBottom:20,animationDelay:".08s"}}>
                <span className="grad-text">Master Code.</span><br/>
                <span style={{color:T.text}}>Build Anything.</span>
              </h1>
              <p className="fade-up" style={{fontSize:16,color:T.muted2,lineHeight:1.8,maxWidth:520,marginBottom:36,animationDelay:".15s"}}>
                From your first "Hello World" to landing a top tech job — HackingSum.edu covers <strong style={{color:T.text}}>Python, C++, Web Dev, DSA, CP &amp; Cybersecurity</strong>, completely free.
              </p>
              <div className="fade-up hero-btns" style={{display:"flex",gap:14,flexWrap:"wrap",animationDelay:".22s"}}>
                <button className="btn-pri" onClick={() => setPage(user?"courses":"register")} style={{fontSize:15,padding:"14px 32px",borderRadius:10}}>
                  {user?"Browse Courses →":"Start Learning Free →"}
                </button>
                <button className="btn-sec" onClick={() => setPage("courses")} style={{fontSize:15,padding:"14px 28px",borderRadius:10}}>View All Courses</button>
              </div>
              {/* Stats */}
              <div className="fade-up" style={{display:"grid",gridTemplateColumns:"repeat(4,auto)",gap:"28px 0",marginTop:44,paddingTop:36,borderTop:`1px solid ${T.border}`,animationDelay:".3s"}}>
                {[["6+","Courses"],["22+","Videos"],["5","Tracks"],["100%","Free"]].map(([n,l]) => (
                  <div key={l} style={{paddingRight:28,borderRight:`1px solid ${T.border}`}}>
                    <div style={{fontWeight:800,fontSize:30,color:T.accent,lineHeight:1}}>{n}</div>
                    <div style={{fontSize:11,color:T.muted,letterSpacing:1,textTransform:"uppercase",marginTop:4}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right card */}
            <div className="hero-card float" style={{flex:"1 1 360px",maxWidth:420}}>
              <div className="glass card-hover" style={{overflow:"hidden",boxShadow:`0 30px 90px rgba(0,0,0,.5)`}}>
                <div style={{padding:"22px 24px 18px",background:`linear-gradient(135deg,${T.accent}12,${T.blue}06)`,borderBottom:`1px solid ${T.border}`}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.accent,letterSpacing:2,marginBottom:8}}>🔥 FEATURED COURSE</div>
                  <div style={{fontWeight:800,fontSize:20,marginBottom:4}}>Python Zero to Hero</div>
                  <div style={{fontSize:13,color:T.muted2}}>Start your coding journey today</div>
                </div>
                {SEED_COURSES[0].videos.slice(0,4).map((v,i) => (
                  <div key={v.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 24px",
                    borderBottom:`1px solid ${T.border}88`,background:i===0?`${T.accent}06`:"transparent"}}>
                    <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,
                      background:i===0?T.accent:`${T.accent}15`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:10,color:i===0?T.bg:T.accent}}>{i===0?"▶":i+1}</div>
                    <span style={{fontSize:13,color:i===0?T.text:T.muted2,flex:1}}>{v.title}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.muted}}>{v.duration}</span>
                  </div>
                ))}
                <div style={{padding:"16px 24px"}}>
                  <button className="btn-pri" onClick={() => setPage(user?"courses":"register")} style={{width:"100%",borderRadius:8,padding:12}}>
                    {user?"Watch Now →":"Enroll Free →"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* CATEGORIES */}
      <section style={{padding:"70px 32px",background:T.bg2}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div className="section-tag">Learning Tracks</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(26px,4vw,42px)",letterSpacing:"-1.5px",marginBottom:36}}>
            Choose Your <span className="grad-text2">Path</span>
          </h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14}}>
            {cats.map((c,i) => (
              <button key={c.name} onClick={() => setPage("courses")}
                className="card card-hover"
                style={{padding:"26px 18px",textAlign:"center",color:T.text,border:`1px solid ${T.border}`,
                  animation:`fadeUp .5s ease ${i*.07}s both`,cursor:"pointer"}}>
                <div style={{fontSize:30,marginBottom:12}}>{c.icon}</div>
                <div style={{fontWeight:700,fontSize:14,color:c.color,marginBottom:5}}>{c.name}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.muted}}>
                  {courses.filter(x=>x.category===c.name).length} courses
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* COURSES PREVIEW */}
      <section style={{padding:"70px 32px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:36,flexWrap:"wrap",gap:16}}>
            <div>
              <div className="section-tag">Courses</div>
              <h2 style={{fontWeight:800,fontSize:"clamp(24px,3.5vw,38px)",letterSpacing:"-1.5px"}}>Start Learning <span className="grad-text2">Today</span></h2>
            </div>
            <button className="btn-sec" onClick={() => setPage("courses")}>View All →</button>
          </div>
          <div className="courses-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:18}}>
            {courses.slice(0,3).map((c,i) => <CourseCard key={c.id} course={c} i={i} onClick={() => setPage("courses")}/>)}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && <>
        <div className="divider"/>
        <section style={{padding:"72px 32px",background:`linear-gradient(135deg,${T.accent}06,${T.blue}04)`}}>
          <div style={{maxWidth:660,margin:"0 auto",textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:18}}>🚀</div>
            <h2 style={{fontWeight:800,fontSize:"clamp(26px,4vw,40px)",letterSpacing:"-1.5px",marginBottom:14}}>
              Ready to Become a <span className="shimmer-text">Hacker</span>?
            </h2>
            <p style={{color:T.muted2,fontSize:15,lineHeight:1.8,marginBottom:32}}>Join thousands of students. Free forever. No credit card required.</p>
            <button className="btn-pri" onClick={() => setPage("register")} style={{fontSize:15,padding:"15px 44px",borderRadius:10}}>Create Free Account →</button>
          </div>
        </section>
      </>}

      <Footer setPage={setPage}/>
    </div>
  );
}

// ================================================================
//  COURSE CARD
// ================================================================
function CourseCard({ course:c, i=0, onClick }) {
  const lvlC = c.level==="Beginner"?T.accent:c.level==="Intermediate"?T.amber:T.pink;
  return (
    <div className="card card-hover" onClick={onClick}
      style={{overflow:"hidden",cursor:"pointer",position:"relative",animation:`fadeUp .5s ease ${i*.06}s both`}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:c.color,opacity:.8}}/>
      <div style={{padding:"20px 18px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:12}}>
          <span style={{fontSize:26}}>{c.icon}</span>
          <span className="badge" style={{background:`${lvlC}15`,color:lvlC,border:`1px solid ${lvlC}33`}}>{c.level}</span>
        </div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:c.color,letterSpacing:2,marginBottom:8,textTransform:"uppercase"}}>{c.category}</div>
        <div style={{fontWeight:800,fontSize:16,lineHeight:1.3,marginBottom:8}}>{c.title}</div>
        <div style={{fontSize:12.5,color:T.muted2,lineHeight:1.6,marginBottom:14}}>{c.description}</div>
        <div style={{display:"flex",gap:16}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.muted}}>📹 {c.videos.length} videos</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.muted}}>👤 {c.instructor}</span>
        </div>
      </div>
    </div>
  );
}

// ================================================================
//  AUTH PAGE (Login + Register) — FIREBASE AUTH
// ================================================================
function AuthPage({ initMode, setPage, setUser }) {
  const [mode, setMode] = useState(initMode||"login");
  const [form, setForm] = useState({name:"",email:"",password:"",confirm:""});
  const [err, setErr]   = useState("");
  const [loading, setLoading] = useState(false);

  const f = e => { setForm(p=>({...p,[e.target.name]:e.target.value})); setErr(""); };

  async function submit() {
    setLoading(true); setErr("");
    try {
      if (mode === "login") {
        // Admin check
        if (form.email === ADMIN_EMAIL && form.password === ADMIN_PASSWORD) {
          setUser({ uid:"admin", name:"Admin", email:ADMIN_EMAIL, role:"admin" });
          setPage("admin"); setLoading(false); return;
        }
        // Firebase login
        const res = await signInWithEmailAndPassword(auth, form.email, form.password);
        const snap = await getDoc(doc(db, "users", res.user.uid));
        const profile = snap.exists() ? snap.data() : {};
        setUser({ uid:res.user.uid, name:res.user.displayName||profile.name||"Student",
          email:res.user.email, role:profile.role||"student" });
        setPage("dashboard");
      } else {
        // Validation
        if (!form.name.trim()||!form.email.trim()||!form.password) { setErr("All fields required."); setLoading(false); return; }
        if (form.password.length < 6) { setErr("Password must be at least 6 characters."); setLoading(false); return; }
        if (form.password !== form.confirm) { setErr("Passwords don't match."); setLoading(false); return; }
        // Firebase register
        const res = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(res.user, { displayName: form.name.trim() });
        // Save to Firestore
        await saveStudentProfile(res.user.uid, { name:form.name.trim(), email:form.email.trim() });
        setUser({ uid:res.user.uid, name:form.name.trim(), email:form.email.trim(), role:"student" });
        setPage("dashboard");
      }
    } catch(e) {
      const msg = e.code === "auth/user-not-found" || e.code === "auth/wrong-password" ? "Wrong email or password."
        : e.code === "auth/email-already-in-use" ? "Email already registered. Please login."
        : e.code === "auth/invalid-email" ? "Invalid email address."
        : e.code === "auth/network-request-failed" ? "Network error. Check your connection."
        : e.message || "Something went wrong.";
      setErr(msg);
    }
    setLoading(false);
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      padding:"88px 20px 40px",
      background:`radial-gradient(ellipse 60% 50% at 50% 0%,${T.accent}07 0%,transparent 70%),${T.bg}`}}>
      <div style={{width:"100%",maxWidth:460,animation:"fadeUp .5s ease both"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"inline-flex",justifyContent:"center"}}><Logo size={1.05}/></div>
        </div>
        <div className="glass" style={{padding:"34px 30px",boxShadow:`0 30px 80px rgba(0,0,0,.4)`}}>
          {/* Tabs */}
          <div style={{display:"flex",background:T.bg3,borderRadius:10,padding:4,marginBottom:26}}>
            {["login","register"].map(m => (
              <button key={m} onClick={() => {setMode(m);setErr("");setForm({name:"",email:"",password:"",confirm:""});}}
                style={{flex:1,padding:"10px",border:"none",
                  background:mode===m?`linear-gradient(135deg,${T.accent},${T.blue})`:"transparent",
                  color:mode===m?T.bg:T.muted2,borderRadius:8,fontWeight:700,fontSize:14,
                  textTransform:"capitalize",transition:"all .2s"}}>
                {m==="login"?"Login":"Register"}
              </button>
            ))}
          </div>

          <h2 style={{fontWeight:800,fontSize:22,letterSpacing:"-.5px",marginBottom:6}}>
            {mode==="login"?"Welcome back 👋":"Join HackingSum.edu 🚀"}
          </h2>
          <p style={{color:T.muted2,fontSize:13,marginBottom:22}}>
            {mode==="login"?"Login with your account":"Create your free student account"}
          </p>

          {/* Admin hint */}
          <div style={{background:`${T.amber}0d`,border:`1px solid ${T.amber}22`,borderRadius:8,
            padding:"10px 14px",marginBottom:20,display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{fontSize:14,flexShrink:0}}>💡</span>
            <div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.amber,marginBottom:2}}>ADMIN CREDENTIALS</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.muted2}}>{ADMIN_EMAIL} / {ADMIN_PASSWORD}</div>
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {mode==="register" && <div><label className="lbl">Full Name</label><input name="name" className="inp" value={form.name} onChange={f} placeholder="Your full name"/></div>}
            <div><label className="lbl">Email Address</label><input name="email" type="email" className="inp" value={form.email} onChange={f} placeholder="you@email.com"/></div>
            <div><label className="lbl">Password</label><input name="password" type="password" className="inp" value={form.password} onChange={f} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
            {mode==="register" && <div><label className="lbl">Confirm Password</label><input name="confirm" type="password" className="inp" value={form.confirm} onChange={f} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/></div>}
          </div>

          {err && <div style={{marginTop:14,padding:"11px 14px",background:`${T.danger}15`,border:`1px solid ${T.danger}33`,borderRadius:8,fontSize:13,color:T.danger,display:"flex",gap:8}}>⚠ {err}</div>}

          <button className="btn-pri" onClick={submit} disabled={loading}
            style={{width:"100%",marginTop:20,padding:14,fontSize:15,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            {loading&&<Spin/>}
            {loading?"Please wait...":mode==="login"?"Login to Dashboard →":"Create Account →"}
          </button>

          <div style={{textAlign:"center",marginTop:16,fontSize:13,color:T.muted}}>
            {mode==="login"
              ? <>Don't have an account? <span style={{color:T.accent,cursor:"pointer",fontWeight:600}} onClick={()=>setMode("register")}>Register free</span></>
              : <>Have an account? <span style={{color:T.accent,cursor:"pointer",fontWeight:600}} onClick={()=>setMode("login")}>Login</span></>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
//  DASHBOARD — loads progress from Firestore
// ================================================================
function DashboardPage({ user, courses, setPage, setWatch }) {
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    getProgress(user.uid).then(p => { setProgress(p); setLoading(false); });
  }, [user?.uid]);

  const totalVids   = courses.reduce((a,c)=>a+c.videos.length, 0);
  const watchedVids = courses.reduce((a,c)=>a+(progress[c.id]||[]).length, 0);
  const pct = totalVids>0 ? Math.round((watchedVids/totalVids)*100) : 0;
  const inProgress = courses.filter(c => { const w=(progress[c.id]||[]).length; return w>0&&w<c.videos.length; });

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"80vh"}}>
      <div style={{textAlign:"center"}}><Spin size={36}/><p style={{color:T.muted,marginTop:16,fontSize:14}}>Loading your dashboard...</p></div>
    </div>
  );

  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"90px 32px 60px"}} className="page-pad">
      <div style={{marginBottom:36}} className="fade-up">
        <div className="section-tag">Dashboard</div>
        <h1 style={{fontWeight:800,fontSize:"clamp(26px,4vw,40px)",letterSpacing:"-1.5px"}}>
          Welcome back, <span className="grad-text2">{user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p style={{color:T.muted2,fontSize:14,marginTop:6}}>Your learning progress is saved to Firebase in real-time.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,marginBottom:36}}>
        {[
          {label:"Total Courses",val:courses.length,icon:"📚",color:T.accent},
          {label:"Videos Watched",val:`${watchedVids}/${totalVids}`,icon:"🎥",color:T.blue},
          {label:"Progress",val:`${pct}%`,icon:"📈",color:T.pink},
          {label:"In Progress",val:inProgress.length,icon:"⚡",color:T.amber},
        ].map((s,i) => (
          <div key={s.label} className="card card-hover" style={{padding:"20px",animation:`fadeUp .5s ease ${i*.07}s both`}}>
            <div style={{fontSize:24,marginBottom:10}}>{s.icon}</div>
            <div style={{fontWeight:800,fontSize:28,color:s.color,lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:12,color:T.muted,marginTop:5}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress card */}
      <div className="dash-grid" style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:20,marginBottom:36}}>
        <div className="card" style={{padding:"26px",display:"flex",alignItems:"center",gap:28,flexWrap:"wrap"}}>
          <Ring pct={pct} size={110} stroke={9} color={T.accent} label="DONE"/>
          <div style={{flex:1}}>
            <div style={{fontWeight:700,fontSize:17,marginBottom:8}}>Overall Learning Progress</div>
            <p style={{color:T.muted2,fontSize:13,lineHeight:1.7,marginBottom:14}}>
              {watchedVids} of {totalVids} videos watched.
              {pct<30?" Keep going!":pct<70?" Great momentum!":"  Amazing work!"}
            </p>
            <div style={{background:T.bg3,borderRadius:99,height:8}}>
              <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${T.accent},${T.blue})`,borderRadius:99,transition:"width 1s ease"}}/>
            </div>
            <div style={{fontSize:11,color:T.muted,marginTop:6,fontFamily:"'JetBrains Mono',monospace"}}>
              ☁ Saved to Firebase — accessible from any device
            </div>
          </div>
        </div>

        {/* Firebase indicator */}
        <div className="card" style={{padding:"22px"}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>☁ Firebase Database</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {label:"Auth Provider",val:"Email/Password",ok:true},
              {label:"User Profile",val:"Firestore",ok:true},
              {label:"Progress Sync",val:"Real-time",ok:true},
              {label:"Courses DB",val:"Firestore",ok:true},
            ].map(item => (
              <div key={item.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"8px 0",borderBottom:`1px solid ${T.border}55`}}>
                <span style={{fontSize:13,color:T.muted2}}>{item.label}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,
                  color:item.ok?T.accent:T.danger}}>
                  {item.ok?"✓ ":""}{item.val}
                </span>
              </div>
            ))}
          </div>
          <div style={{marginTop:14,padding:"10px",background:`${T.accent}08`,borderRadius:8,
            fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.accent,textAlign:"center"}}>
            UID: {user?.uid?.slice(0,16)}...
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div style={{fontWeight:700,fontSize:18,marginBottom:16}}>{inProgress.length>0?"Continue Learning ⚡":"Start a Course 🚀"}</div>
      <div className="courses-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:14}}>
        {(inProgress.length>0?inProgress:courses).slice(0,4).map((c,i) => {
          const w = (progress[c.id]||[]).length;
          const p = Math.round((w/c.videos.length)*100);
          const next = c.videos.find(v=>!(progress[c.id]||[]).includes(v.id)) || c.videos[0];
          return (
            <div key={c.id} className="card card-hover" onClick={() => {setWatch({course:c,video:next});setPage("watch");}}
              style={{padding:"18px",cursor:"pointer",position:"relative",overflow:"hidden",animation:`fadeUp .5s ease ${i*.06}s both`}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:c.color}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:22}}>{c.icon}</span>
                <span className="badge" style={{background:`${c.color}18`,color:c.color,border:`1px solid ${c.color}33`}}>{p}%</span>
              </div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{c.title}</div>
              <div style={{fontSize:12,color:T.muted2,marginBottom:12}}>{w}/{c.videos.length} videos watched</div>
              <div style={{background:T.bg3,borderRadius:99,height:5}}>
                <div style={{width:`${p}%`,height:"100%",background:c.color,borderRadius:99}}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
//  COURSES PAGE
// ================================================================
function CoursesPage({ courses, setPage, setWatch }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const cats = ["All","Programming","Web Dev","DSA","Cybersecurity","CP"];
  const filtered = courses.filter(c =>
    (filter==="All"||c.category===filter) &&
    (search===""||c.title.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"90px 32px 60px"}} className="page-pad">
      <div style={{marginBottom:32}} className="fade-up">
        <div className="section-tag">Library</div>
        <h1 style={{fontWeight:800,fontSize:"clamp(28px,4vw,44px)",letterSpacing:"-1.5px",marginBottom:20}}>
          All <span className="grad-text2">Courses</span>
        </h1>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <input className="inp" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍  Search courses..." style={{maxWidth:300,borderRadius:8}}/>
          {cats.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              style={{padding:"9px 18px",borderRadius:99,border:`1px solid ${filter===c?T.accent:T.border2}`,
                background:filter===c?`${T.accent}15`:T.card,color:filter===c?T.accent:T.muted2,
                fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .2s"}}>
              {c}
            </button>
          ))}
        </div>
      </div>
      {filtered.length===0
        ? <div style={{textAlign:"center",padding:"80px 20px",color:T.muted}}>
            <div style={{fontSize:40,marginBottom:12}}>🔍</div>
            <div style={{fontWeight:700,fontSize:20}}>No courses found</div>
          </div>
        : <div className="courses-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:18}}>
            {filtered.map((c,i) => (
              <div key={c.id} onClick={() => {setWatch({course:c,video:c.videos[0]});setPage("watch");}}>
                <CourseCard course={c} i={i} onClick={()=>{}}/>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

// ================================================================
//  WATCH PAGE — saves progress to Firestore
// ================================================================
function WatchPage({ watch, setWatch, courses, setPage, user }) {
  const {course, video} = watch||{};

  useEffect(() => {
    if (!user?.uid || !course?.id || !video?.id) return;
    if (user.role==="admin") return;
    saveProgress(user.uid, course.id, video.id);
  }, [video?.id, course?.id, user?.uid]);

  if (!course||!video) return (
    <div style={{padding:"120px 32px",textAlign:"center",color:T.muted}}>
      <div style={{fontSize:40,marginBottom:16}}>📭</div>
      <p>No video selected. <span style={{color:T.accent,cursor:"pointer"}} onClick={() => setPage("courses")}>Browse Courses →</span></p>
    </div>
  );

  const liveCourse = courses.find(c=>c.id===course.id)||course;
  const vidIdx = liveCourse.videos.findIndex(v=>v.id===video.id);
  const prev = liveCourse.videos[vidIdx-1];
  const next = liveCourse.videos[vidIdx+1];

  return (
    <div style={{maxWidth:1380,margin:"0 auto",padding:"78px 22px 60px"}} className="page-pad">
      <button className="btn-ghost" onClick={() => setPage("courses")}
        style={{marginBottom:18,display:"flex",alignItems:"center",gap:6,color:T.muted2}}>
        ← Back to Courses
      </button>
      <div className="watch-row" style={{display:"grid",gridTemplateColumns:"1fr 330px",gap:22,alignItems:"start"}}>
        {/* Player */}
        <div className="fade-up">
          <div style={{background:"#000",borderRadius:12,overflow:"hidden",aspectRatio:"16/9",
            boxShadow:`0 24px 80px rgba(0,0,0,.7)`}}>
            <iframe key={video.id}
              src={`https://www.youtube.com/embed/${video.ytId}?autoplay=1&rel=0`}
              style={{width:"100%",height:"100%",border:"none"}}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen title={video.title}/>
          </div>
          <div style={{marginTop:20}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span className="badge badge-a">{liveCourse.category}</span>
              <span className="badge badge-y">{liveCourse.level}</span>
              {user && <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.accent}}>☁ Progress saved to Firebase</span>}
            </div>
            <h1 style={{fontWeight:800,fontSize:"clamp(18px,3vw,26px)",letterSpacing:"-.5px",marginBottom:6}}>{video.title}</h1>
            <p style={{color:T.muted2,fontSize:13}}>{liveCourse.title} · Lesson {vidIdx+1} of {liveCourse.videos.length} · {video.duration}</p>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",gap:12,marginTop:20}}>
            <button className="btn-sec" disabled={!prev} onClick={() => setWatch({course:liveCourse,video:prev})} style={{flex:1,opacity:prev?1:.4}}>← Previous</button>
            <button className="btn-pri" disabled={!next} onClick={() => setWatch({course:liveCourse,video:next})} style={{flex:1,opacity:next?1:.4}}>Next Lesson →</button>
          </div>
        </div>

        {/* Playlist */}
        <div className="card" style={{overflow:"hidden",position:"sticky",top:74,maxHeight:"calc(100vh - 90px)",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"16px 18px",borderBottom:`1px solid ${T.border}`,background:`linear-gradient(135deg,${liveCourse.color}0f,transparent)`,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontSize:18}}>{liveCourse.icon}</span>
              <div style={{fontWeight:700,fontSize:13,lineHeight:1.2}}>{liveCourse.title}</div>
            </div>
            <div style={{background:T.bg3,borderRadius:99,height:4}}>
              <div style={{width:`${Math.round((vidIdx+1)/liveCourse.videos.length*100)}%`,height:"100%",background:liveCourse.color,borderRadius:99}}/>
            </div>
          </div>
          <div className="scrollable" style={{flex:1,overflowY:"auto"}}>
            {liveCourse.videos.map((v,i) => {
              const active = v.id===video.id;
              return (
                <div key={v.id} onClick={() => setWatch({course:liveCourse,video:v})}
                  style={{display:"flex",alignItems:"center",gap:11,padding:"12px 16px",cursor:"pointer",
                    background:active?`${liveCourse.color}10`:"transparent",
                    borderLeft:`3px solid ${active?liveCourse.color:"transparent"}`,
                    borderBottom:`1px solid ${T.border}55`,transition:"background .15s"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
                    background:active?liveCourse.color:`${liveCourse.color}18`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,
                    color:active?T.bg:liveCourse.color,fontWeight:700}}>
                    {i+1}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12.5,color:active?T.text:T.muted2,fontWeight:active?600:400,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.title}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,marginTop:2}}>{v.duration}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
//  MY LEARNING — reads from Firestore
// ================================================================
function MyLearningPage({ user, courses, setPage, setWatch }) {
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    getProgress(user.uid).then(p => { setProgress(p); setLoading(false); });
  }, [user?.uid]);

  const started = courses.filter(c => (progress[c.id]||[]).length > 0);
  const done    = courses.filter(c => c.videos.every(v=>(progress[c.id]||[]).includes(v.id)));
  const inProg  = courses.filter(c => { const w=(progress[c.id]||[]).length; return w>0&&w<c.videos.length; });

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"80vh"}}>
      <div style={{textAlign:"center"}}><Spin size={32}/><p style={{color:T.muted,marginTop:14,fontSize:14}}>Loading from Firebase...</p></div>
    </div>
  );

  function CProg({c}) {
    const w = (progress[c.id]||[]).length;
    const p = Math.round((w/c.videos.length)*100);
    const next = c.videos.find(v=>!(progress[c.id]||[]).includes(v.id))||c.videos[0];
    return (
      <div className="card card-hover" onClick={() => {setWatch({course:c,video:next});setPage("watch");}}
        style={{padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
        <Ring pct={p} size={52} stroke={5} color={c.color}/>
        <div style={{flex:1,minWidth:160}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontSize:18}}>{c.icon}</span>
            <span style={{fontWeight:700,fontSize:14}}>{c.title}</span>
          </div>
          <div style={{fontSize:12,color:T.muted}}>{w}/{c.videos.length} videos · {c.category}</div>
        </div>
        <span style={{color:c.color,fontSize:20}}>→</span>
      </div>
    );
  }

  return (
    <div style={{maxWidth:880,margin:"0 auto",padding:"90px 32px 60px"}} className="page-pad">
      <div style={{marginBottom:32}} className="fade-up">
        <div className="section-tag">My Learning</div>
        <h1 style={{fontWeight:800,fontSize:"clamp(26px,4vw,40px)",letterSpacing:"-1.5px"}}>
          Your Learning <span className="grad-text2">Journey</span>
        </h1>
        <p style={{color:T.muted2,fontSize:13,marginTop:8}}>☁ Progress synced from Firebase — accessible from any device.</p>
      </div>
      {started.length===0
        ? <div style={{textAlign:"center",padding:"80px 20px",color:T.muted}}>
            <div style={{fontSize:48,marginBottom:16}}>📚</div>
            <div style={{fontWeight:700,fontSize:22,marginBottom:10}}>Nothing started yet</div>
            <p style={{fontSize:14,marginBottom:28}}>Start watching a course to track your progress!</p>
            <button className="btn-pri" onClick={() => setPage("courses")} style={{padding:"13px 32px",borderRadius:10}}>Browse Courses →</button>
          </div>
        : <>
            {inProg.length>0 && <div style={{marginBottom:36}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <span style={{fontWeight:800,fontSize:18}}>⚡ In Progress</span>
                <span className="badge badge-a">{inProg.length}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>{inProg.map(c=><CProg key={c.id} c={c}/>)}</div>
            </div>}
            {done.length>0 && <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <span style={{fontWeight:800,fontSize:18}}>✅ Completed</span>
                <span className="badge badge-g">{done.length}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>{done.map(c=><CProg key={c.id} c={c}/>)}</div>
            </div>}
          </>
      }
    </div>
  );
}

// ================================================================
//  ADMIN PANEL — reads/writes Firestore
// ================================================================
function AdminPage({ tab:initTab, courses, setCourses, setPage }) {
  const [tab, setTab]     = useState(initTab||"overview");
  const [students, setStudents] = useState([]);
  const [editId, setEditId]     = useState(null);
  const [msg, setMsg]           = useState({text:"",type:"success"});
  const [showNC, setShowNC]     = useState(false);
  const [showNV, setShowNV]     = useState(false);
  const [newC, setNewC] = useState({title:"",category:"Programming",level:"Beginner",description:"",icon:"📘",color:"#00f5c4"});
  const [newV, setNewV] = useState({title:"",ytId:"",duration:""});
  const [delId, setDelId] = useState(null);
  const [loading, setLoading] = useState(false);

  const toast = (text,type="success") => { setMsg({text,type}); setTimeout(()=>setMsg({text:"",type:"success"}),3000); };
  const editC = courses.find(c=>c.id===editId);

  // Load students from Firestore
  useEffect(() => {
    getDocs(collection(db,"users")).then(snap => {
      setStudents(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
  }, [tab]);

  async function addCourse() {
    if (!newC.title.trim()) return;
    setLoading(true);
    try {
      const id = `c_${Date.now()}`;
      const data = {...newC, id, instructor:"HackingSum Team", videos:[], createdAt:serverTimestamp()};
      await setDoc(doc(db,"courses",id), data);
      setCourses(p => [...p, {...data, createdAt: new Date()}]);
      setNewC({title:"",category:"Programming",level:"Beginner",description:"",icon:"📘",color:"#00f5c4"});
      setShowNC(false); toast("✅ Course created!");
    } catch(e) { toast("❌ Error: "+e.message,"error"); }
    setLoading(false);
  }

  async function deleteCourse(id) {
    setLoading(true);
    try {
      await deleteDoc(doc(db,"courses",id));
      setCourses(p=>p.filter(c=>c.id!==id));
      if(editId===id) setEditId(null);
      setDelId(null); toast("🗑 Course deleted.");
    } catch(e) { toast("❌ Error: "+e.message,"error"); }
    setLoading(false);
  }

  async function addVideo() {
    if (!newV.title.trim()||!newV.ytId.trim()) return;
    const vid = {id:`v_${Date.now()}`, ...newV, watched:false};
    const updated = [...(editC.videos||[]), vid];
    try {
      await updateDoc(doc(db,"courses",editId), {videos:updated});
      setCourses(p=>p.map(c=>c.id!==editId?c:{...c,videos:updated}));
      setNewV({title:"",ytId:"",duration:""}); setShowNV(false); toast("✅ Video added!");
    } catch(e) { toast("❌ "+e.message,"error"); }
  }

  async function deleteVideo(vid) {
    const updated = editC.videos.filter(v=>v.id!==vid);
    try {
      await updateDoc(doc(db,"courses",editId), {videos:updated});
      setCourses(p=>p.map(c=>c.id!==editId?c:{...c,videos:updated}));
      toast("🗑 Video removed.");
    } catch(e) { toast("❌ "+e.message,"error"); }
  }

  const totalVids    = courses.reduce((a,c)=>a+c.videos.length,0);
  const TABS = [{k:"overview",l:"📊 Overview"},{k:"courses",l:"📚 Courses"},{k:"students",l:"👥 Students"}];

  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"78px 24px 60px"}} className="page-pad">
      <Toast msg={msg.text} type={msg.type}/>

      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:14,marginBottom:28}} className="fade-up">
        <div>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:10,
            background:`${T.amber}0d`,border:`1px solid ${T.amber}33`,padding:"5px 12px",borderRadius:6}}>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.amber,letterSpacing:2}}>⚙ ADMIN PANEL</span>
          </div>
          <h1 style={{fontWeight:800,fontSize:"clamp(20px,3vw,32px)",letterSpacing:"-1px"}}>Control Center</h1>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:28,background:T.bg3,padding:4,borderRadius:10,width:"fit-content",overflowX:"auto"}}>
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            style={{padding:"9px 20px",border:"none",
              background:tab===t.k?`linear-gradient(135deg,${T.accent},${T.blue})`:"transparent",
              color:tab===t.k?T.bg:T.muted2,borderRadius:8,fontWeight:700,fontSize:13,
              cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap"}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab==="overview" && (
        <div className="fade-in">
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,marginBottom:32}}>
            {[
              {l:"Total Courses",v:courses.length,i:"📚",c:T.accent},
              {l:"Total Videos",v:totalVids,i:"🎬",c:T.blue},
              {l:"Students",v:students.length,i:"👥",c:T.pink},
            ].map(s => (
              <div key={s.l} className="card card-hover" style={{padding:"20px"}}>
                <div style={{fontSize:24,marginBottom:10}}>{s.i}</div>
                <div style={{fontWeight:800,fontSize:32,color:s.c,lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:5}}>{s.l}</div>
              </div>
            ))}
            <div className="card" style={{padding:"20px",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:6,
              border:`1px solid ${T.accent}33`,background:`${T.accent}06`}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.accent}}>☁ FIREBASE</div>
              <div style={{fontSize:12,color:T.muted2,textAlign:"center"}}>Auth + Firestore<br/>All data synced</div>
            </div>
          </div>
          <div style={{fontWeight:700,fontSize:17,marginBottom:14}}>All Courses</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {courses.map(c => (
              <div key={c.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,
                padding:"13px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:c.color,flexShrink:0}}/>
                <span style={{fontSize:18,flexShrink:0}}>{c.icon}</span>
                <div style={{flex:1,minWidth:120}}>
                  <div style={{fontWeight:700,fontSize:13}}>{c.title}</div>
                  <div style={{fontSize:11,color:T.muted}}>{c.category} · {c.level} · {c.videos.length} videos</div>
                </div>
                <button onClick={() => {setEditId(c.id);setTab("courses");}}
                  style={{background:"transparent",border:`1px solid ${T.accent}44`,color:T.accent,
                    padding:"5px 14px",borderRadius:6,fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>
                  Edit →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COURSES */}
      {tab==="courses" && (
        <div className="fade-in">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
            <div style={{fontWeight:700,fontSize:17}}>Manage Courses (Firestore)</div>
            <button className="btn-pri" onClick={() => setShowNC(!showNC)} style={{padding:"9px 22px"}}>
              {showNC?"✕ Cancel":"+ New Course"}
            </button>
          </div>

          {showNC && (
            <div style={{background:T.card,border:`1px solid ${T.accent}33`,borderRadius:12,padding:"22px",marginBottom:22,animation:"fadeUp .3s ease both"}}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:18}}>Create New Course</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={{gridColumn:"1/-1"}}>
                  <label className="lbl">Course Title *</label>
                  <input className="inp" value={newC.title} placeholder="e.g. React Complete Guide" onChange={e=>setNewC(p=>({...p,title:e.target.value}))}/>
                </div>
                <div><label className="lbl">Category</label>
                  <select className="inp" value={newC.category} onChange={e=>setNewC(p=>({...p,category:e.target.value}))}>
                    {["Programming","Web Dev","DSA","Cybersecurity","CP","Other"].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div><label className="lbl">Level</label>
                  <select className="inp" value={newC.level} onChange={e=>setNewC(p=>({...p,level:e.target.value}))}>
                    {["Beginner","Intermediate","Advanced"].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div><label className="lbl">Icon (emoji)</label>
                  <input className="inp" value={newC.icon} placeholder="📘" onChange={e=>setNewC(p=>({...p,icon:e.target.value}))}/>
                </div>
                <div><label className="lbl">Accent Color</label>
                  <input type="color" className="inp" value={newC.color} onChange={e=>setNewC(p=>({...p,color:e.target.value}))} style={{height:44,padding:4}}/>
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <label className="lbl">Description</label>
                  <input className="inp" value={newC.description} placeholder="Short description..." onChange={e=>setNewC(p=>({...p,description:e.target.value}))}/>
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:16}}>
                <button className="btn-pri" onClick={addCourse} disabled={loading} style={{padding:"10px 28px",display:"flex",gap:8,alignItems:"center"}}>
                  {loading&&<Spin/>} Create in Firestore
                </button>
                <button className="btn-sec" onClick={() => setShowNC(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="admin-grid" style={{display:"grid",gridTemplateColumns:editC?"300px 1fr":"1fr",gap:18}}>
            {/* List */}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {courses.map(c => (
                <div key={c.id} onClick={() => setEditId(editId===c.id?null:c.id)}
                  style={{background:editId===c.id?`${T.accent}08`:T.card,border:`1px solid ${editId===c.id?T.accent+"44":T.border}`,
                    borderRadius:10,padding:"12px 14px",cursor:"pointer",transition:"all .2s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:c.color,flexShrink:0}}/>
                    <span style={{fontSize:15,flexShrink:0}}>{c.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div>
                      <div style={{fontSize:11,color:T.muted}}>{c.videos.length} videos</div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();setDelId(c.id);}} className="btn-red" style={{padding:"3px 9px",fontSize:11,flexShrink:0}}>Del</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit panel */}
            {editC && (
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"20px",animation:"fadeIn .3s ease both"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  <span style={{fontSize:20}}>{editC.icon}</span>
                  <div style={{fontWeight:700,fontSize:16}}>{editC.title}</div>
                </div>
                <div style={{fontSize:11,color:T.muted,marginBottom:18,fontFamily:"'JetBrains Mono',monospace"}}>
                  {editC.videos.length} videos · Firestore: courses/{editId}
                </div>

                <div className="scrollable" style={{maxHeight:280,overflowY:"auto",marginBottom:16}}>
                  {editC.videos.length===0
                    ? <div style={{textAlign:"center",padding:"24px",color:T.muted,fontSize:13}}>No videos yet.</div>
                    : editC.videos.map((v,i) => (
                      <div key={v.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.border}55`}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,minWidth:20}}>{i+1}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12.5,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.title}</div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted}}>ytId: {v.ytId} · {v.duration}</div>
                        </div>
                        <button onClick={()=>deleteVideo(v.id)} className="btn-red" style={{padding:"3px 9px",fontSize:11,flexShrink:0}}>✕</button>
                      </div>
                    ))
                  }
                </div>

                <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{fontWeight:700,fontSize:13}}>+ Add Video</div>
                    <button className="btn-ghost" onClick={() => setShowNV(!showNV)} style={{fontSize:12,padding:"4px 10px"}}>{showNV?"✕":"+"}</button>
                  </div>
                  {showNV && (
                    <div style={{display:"flex",flexDirection:"column",gap:9,animation:"fadeUp .3s ease both"}}>
                      <div><label className="lbl">Video Title *</label><input className="inp" value={newV.title} placeholder="e.g. Intro to Arrays" onChange={e=>setNewV(p=>({...p,title:e.target.value}))}/></div>
                      <div>
                        <label className="lbl">YouTube Video ID *</label>
                        <input className="inp" value={newV.ytId} placeholder="e.g. dQw4w9WgXcQ" onChange={e=>setNewV(p=>({...p,ytId:e.target.value}))}/>
                        <div style={{fontSize:11,color:T.muted,marginTop:4}}>💡 youtube.com/watch?v=<strong>THIS_ID</strong></div>
                      </div>
                      <div><label className="lbl">Duration</label><input className="inp" value={newV.duration} placeholder="e.g. 14:30" onChange={e=>setNewV(p=>({...p,duration:e.target.value}))}/></div>
                      <button className="btn-pri" onClick={addVideo} style={{borderRadius:8,padding:"11px"}}>Save to Firestore</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STUDENTS */}
      {tab==="students" && (
        <div className="fade-in">
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:17}}>Registered Students</div>
            <span className="badge badge-a">{students.length}</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.accent}}>☁ From Firebase Auth + Firestore</span>
          </div>
          {students.length===0
            ? <div style={{textAlign:"center",padding:"80px 20px",color:T.muted}}>
                <div style={{fontSize:44,marginBottom:12}}>👥</div>
                <div style={{fontWeight:700,fontSize:20,marginBottom:8}}>No students yet</div>
                <p style={{fontSize:14}}>Students appear here after registration.</p>
              </div>
            : <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
                <div style={{display:"grid",gridTemplateColumns:"40px 1fr 1fr 100px 80px",
                  padding:"12px 18px",background:T.bg3,borderBottom:`1px solid ${T.border}`,
                  fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,letterSpacing:1.5,textTransform:"uppercase"}}>
                  <span>#</span><span>Name</span><span>Email</span><span>Joined</span><span>Role</span>
                </div>
                {students.map((s,i) => (
                  <div key={s.id} style={{display:"grid",gridTemplateColumns:"40px 1fr 1fr 100px 80px",
                    padding:"13px 18px",alignItems:"center",
                    borderBottom:i<students.length-1?`1px solid ${T.border}55`:"none",
                    background:i%2===0?"transparent":`${T.bg3}44`}}>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.muted}}>{i+1}</span>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${T.accent},${T.blue})`,
                        display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:T.bg,flexShrink:0}}>
                        {s.name?.[0]?.toUpperCase()||"?"}
                      </div>
                      <span style={{fontWeight:600,fontSize:13}}>{s.name||"—"}</span>
                    </div>
                    <span style={{fontSize:13,color:T.muted2}}>{s.email}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.muted}}>
                      {s.createdAt?.seconds ? new Date(s.createdAt.seconds*1000).toLocaleDateString("en-IN") : "—"}
                    </span>
                    <span className="badge badge-a" style={{fontSize:10}}>student</span>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* Delete Confirm */}
      {delId && (
        <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,.7)",
          display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .2s ease"}}
          onClick={() => setDelId(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.bg2,border:`1px solid ${T.border2}`,
            borderRadius:14,padding:"28px 30px",maxWidth:380,width:"90%",textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:12}}>🗑️</div>
            <div style={{fontWeight:700,fontSize:18,marginBottom:10}}>Delete from Firestore?</div>
            <p style={{color:T.muted2,fontSize:13,lineHeight:1.6,marginBottom:24}}>This will permanently delete the course and all its videos from the database.</p>
            <div style={{display:"flex",gap:12,justifyContent:"center"}}>
              <button className="btn-sec" onClick={() => setDelId(null)}>Cancel</button>
              <button className="btn-red" onClick={() => deleteCourse(delId)} style={{padding:"10px 24px",fontSize:14}}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
//  ABOUT PAGE
// ================================================================
function AboutPage({ setPage }) {
  return (
    <div style={{maxWidth:880,margin:"0 auto",padding:"90px 32px 60px"}} className="page-pad">
      <div style={{textAlign:"center",marginBottom:56}} className="fade-up">
        <div style={{display:"inline-flex",justifyContent:"center",marginBottom:28}}><Logo size={1.2}/></div>
        <h1 style={{fontWeight:800,fontSize:"clamp(28px,5vw,48px)",letterSpacing:"-2px",marginBottom:14}}>About <span className="grad-text2">HackingSum.edu</span></h1>
        <p style={{color:T.muted2,fontSize:15,lineHeight:1.9,maxWidth:560,margin:"0 auto"}}>A free, community-driven learning platform for students who want to master coding, crack interviews, and build careers in tech &amp; cybersecurity.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:18,marginBottom:52}}>
        {[
          {icon:"🎯",title:"Our Mission",desc:"Make world-class coding education accessible to every student — everywhere, for free.",color:T.accent},
          {icon:"🔐",title:"Cybersecurity First",desc:"Beyond typical coding — ethical hacking, networking and security from day one.",color:T.purple},
          {icon:"☁",title:"Cloud Powered",desc:"Firebase backend — your progress, account and data are safe and accessible anywhere.",color:T.blue},
          {icon:"🚀",title:"Career Ready",desc:"Every course prepares students for real jobs at top tech companies.",color:T.pink},
        ].map((item,i) => (
          <div key={item.title} className="glass card-hover"
            style={{padding:"26px 22px",borderRadius:14,animation:`fadeUp .5s ease ${i*.08}s both`,
              background:`linear-gradient(135deg,${item.color}08,${T.card})`}}>
            <div style={{fontSize:32,marginBottom:12}}>{item.icon}</div>
            <div style={{fontWeight:800,fontSize:16,marginBottom:8,color:item.color}}>{item.title}</div>
            <p style={{fontSize:13,color:T.muted2,lineHeight:1.7}}>{item.desc}</p>
          </div>
        ))}
      </div>
      <div style={{textAlign:"center"}}>
        <button className="btn-pri" onClick={() => setPage("register")} style={{padding:"15px 44px",fontSize:15,borderRadius:10}}>Join HackingSum.edu Free →</button>
      </div>
      <Footer setPage={setPage}/>
    </div>
  );
}

// ================================================================
//  FOOTER
// ================================================================
function Footer({ setPage }) {
  return (
    <footer style={{background:T.bg2,borderTop:`1px solid ${T.border}`,padding:"52px 32px 28px",marginTop:60}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <div className="footer-grid" style={{display:"grid",gridTemplateColumns:"1.4fr repeat(3,1fr)",gap:"36px 28px",marginBottom:40}}>
          <div>
            <div style={{marginBottom:14}}><Logo size={.85}/></div>
            <p style={{fontSize:13,color:T.muted2,lineHeight:1.8,maxWidth:260}}>Free coding education for students. Powered by Firebase. Always free.</p>
          </div>
          {[
            {title:"Tracks",links:[["Programming","courses"],["Web Dev","courses"],["DSA","courses"],["Cybersecurity","courses"]]},
            {title:"Platform",links:[["Home","home"],["Courses","courses"],["About","about"],["Login","login"]]},
            {title:"Resources",links:[["LeetCode","courses"],["Codeforces","courses"],["TryHackMe","courses"],["GitHub","courses"]]},
          ].map(col => (
            <div key={col.title}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:14}}>{col.title}</div>
              {col.links.map(([l,p]) => (
                <div key={l} onClick={() => setPage(p)} style={{fontSize:13,color:T.muted2,marginBottom:9,cursor:"pointer",transition:"color .2s"}}
                  onMouseEnter={e=>e.target.style.color=T.accent} onMouseLeave={e=>e.target.style.color=T.muted2}>{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="divider"/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,paddingTop:22}}>
          <p style={{fontSize:12,color:T.muted}}>© 2025 <span style={{color:T.accent,fontWeight:600}}>HackingSum.edu</span> · Free forever · Powered by Firebase</p>
          <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.accent}}>while(true)&#123;learn();build();hack();&#125;</p>
        </div>
      </div>
    </footer>
  );
}

// ================================================================
//  ROOT APP
// ================================================================
export default function App() {
  const [page, setPage]   = useState("home");
  const [user, setUser]   = useState(null);
  const [courses, setCourses] = useState([]);
  const [watch, setWatch] = useState(null);
  const [booting, setBooting] = useState(true);

  // Firebase Auth listener + seed courses
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const snap = await getDoc(doc(db,"users",fbUser.uid));
        const profile = snap.exists() ? snap.data() : {};
        setUser({ uid:fbUser.uid, name:fbUser.displayName||profile.name||"Student",
          email:fbUser.email, role:profile.role||"student" });
      } else {
        setUser(null);
      }
    });
    return () => unsub();
  }, []);

  // Load courses from Firestore
  useEffect(() => {
    async function load() {
      await seedCoursesIfNeeded();
      const snap = await getDocs(query(collection(db,"courses"), orderBy("createdAt")));
      if (snap.empty) {
        setCourses(SEED_COURSES);
      } else {
        setCourses(snap.docs.map(d => ({...d.data(), id:d.id})));
      }
      setBooting(false);
    }
    load().catch(() => { setCourses(SEED_COURSES); setBooting(false); });
  }, []);

  function logout() {
    signOut(auth);
    setUser(null);
    setPage("home");
  }

  // Route guards
  useEffect(() => {
    if (!user && ["dashboard","my-learning","watch"].includes(page)) setPage("login");
    if (user?.role==="admin" && ["dashboard","my-learning"].includes(page)) setPage("admin");
  }, [page, user]);

  if (booting) return (
    <>
      <style>{CSS}</style>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",gap:20,background:T.bg}}>
        <Logo size={1.1}/>
        <Spin size={28}/>
        <p style={{color:T.muted,fontSize:14,fontFamily:"'JetBrains Mono',monospace"}}>Connecting to Firebase...</p>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <style>{`
        @media(max-width:768px){
          #hambtn{display:flex!important;}
          .mob-ham{display:flex!important;}
        }
      `}</style>
      <Navbar page={page} setPage={setPage} user={user} onLogout={logout}/>
      {page==="home"         && <HomePage        setPage={setPage} courses={courses} user={user}/>}
      {page==="login"        && <AuthPage         initMode="login"    setPage={setPage} setUser={setUser}/>}
      {page==="register"     && <AuthPage         initMode="register" setPage={setPage} setUser={setUser}/>}
      {page==="courses"      && <CoursesPage      courses={courses} setPage={setPage} setWatch={setWatch}/>}
      {page==="watch"        && <WatchPage        watch={watch} setWatch={setWatch} courses={courses} setPage={setPage} user={user}/>}
      {page==="about"        && <AboutPage        setPage={setPage}/>}
      {page==="dashboard"    && user?.role!=="admin" && <DashboardPage  user={user} courses={courses} setPage={setPage} setWatch={setWatch}/>}
      {page==="my-learning"  && user?.role!=="admin" && <MyLearningPage user={user} courses={courses} setPage={setPage} setWatch={setWatch}/>}
      {["admin","admin-courses","admin-students"].includes(page) && user?.role==="admin" &&
        <AdminPage tab={page==="admin-courses"?"courses":page==="admin-students"?"students":"overview"}
          courses={courses} setCourses={setCourses} setPage={setPage}/>
      }
    </>
  );
}
