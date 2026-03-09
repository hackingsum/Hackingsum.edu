

import { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import {
  getFirestore, doc, setDoc, getDoc, getDocs,
  collection, updateDoc, deleteDoc, addDoc,
  query, orderBy, serverTimestamp, onSnapshot,
  where
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
const auth = getAuth(firebaseApp);
const db   = getFirestore(firebaseApp);


const ADMINS = [
  {
    email:    import.meta.env.VITE_ADMIN_EMAIL    || "",
    password: import.meta.env.VITE_ADMIN_PASSWORD || "",
  },
  // Optional second admin
  ...(import.meta.env.VITE_ADMIN2_EMAIL ? [{
    email:    import.meta.env.VITE_ADMIN2_EMAIL    || "",
    password: import.meta.env.VITE_ADMIN2_PASSWORD || "",
  }] : []),
].filter(a => a.email !== "");  // remove empty entries

// Helper — checks if email+password matches any admin
const isAdmin = (email, pass) =>
  ADMINS.some(a => a.email === email && a.password === pass);

const ADMIN_EMAIL    = ADMINS[0]?.email    || "";
const ADMIN_PASSWORD = ADMINS[0]?.password || "";

// ================================================================
//  SEED COURSES
// ================================================================
const SEED_COURSES = [
  { id:"c1", title:"Python Zero to Hero", category:"Programming", level:"Beginner", color:"#00f5c4", icon:"🐍", instructor:"HackingSum Team",
    description:"Master Python from scratch — variables, data structures, OOP, file I/O and real projects.",
    videos:[
      {id:"v101",title:"Why Python? Setup & First Program",ytId:"kqtD5dpn9C8",duration:"12:34"},
      {id:"v102",title:"Variables, Data Types & Operators",ytId:"_uQrJ0TkZlc",duration:"28:14"},
      {id:"v103",title:"Conditionals & Loops",ytId:"HQqqNBZosn8",duration:"22:10"},
      {id:"v104",title:"Functions & Modules",ytId:"9Os0o3wzS_I",duration:"31:05"},
      {id:"v105",title:"Lists, Tuples & Dictionaries",ytId:"W8KRzm-HUcc",duration:"26:40"},
    ]},
  { id:"c2", title:"C++ Complete Masterclass", category:"Programming", level:"Intermediate", color:"#2196f3", icon:"⚙️", instructor:"HackingSum Team",
    description:"Deep dive into C++ — pointers, OOP, STL, templates and competitive programming tricks.",
    videos:[
      {id:"v201",title:"C++ Intro & Environment Setup",ytId:"vLnPwxZdW4Y",duration:"14:05"},
      {id:"v202",title:"Variables, I/O & Data Types",ytId:"Rub-JsjMhWY",duration:"20:30"},
      {id:"v203",title:"Arrays, Strings & Pointers",ytId:"zuegQmMdy8M",duration:"35:18"},
      {id:"v204",title:"OOP — Classes & Objects",ytId:"wN0x9eZLix4",duration:"28:44"},
    ]},
  { id:"c3", title:"Web Dev: HTML + CSS + JS", category:"Web Dev", level:"Beginner", color:"#f0437a", icon:"🌐", instructor:"HackingSum Team",
    description:"Build stunning websites from scratch — HTML5 structure, CSS3 animations, JavaScript interactivity.",
    videos:[
      {id:"v301",title:"HTML5 — Complete Crash Course",ytId:"kUMe1FH4CHE",duration:"11:20"},
      {id:"v302",title:"CSS3 — Layouts, Flexbox & Grid",ytId:"OXGznpKZ_sA",duration:"16:45"},
      {id:"v303",title:"JavaScript — The Complete Intro",ytId:"W6NZfCO5SIk",duration:"19:55"},
      {id:"v304",title:"DOM Manipulation & Events",ytId:"y17RuWkWdn8",duration:"24:30"},
    ]},
  { id:"c4", title:"DSA Masterclass", category:"DSA", level:"Intermediate", color:"#f59e0b", icon:"🧠", instructor:"HackingSum Team",
    description:"Arrays, Linked Lists, Stacks, Trees, Graphs, Sorting & Dynamic Programming for interviews.",
    videos:[
      {id:"v401",title:"Big O Notation & Complexity",ytId:"BgLTDT03QtU",duration:"20:12"},
      {id:"v402",title:"Arrays & Strings Deep Dive",ytId:"CBYHwZcbD-s",duration:"28:12"},
      {id:"v403",title:"Linked Lists — All Variants",ytId:"Hj_rA0dhr2I",duration:"24:44"},
      {id:"v404",title:"Binary Trees & BST",ytId:"fAAZixBzIAI",duration:"31:05"},
      {id:"v405",title:"Dynamic Programming Intro",ytId:"oBt53YbR9Kk",duration:"35:40"},
    ]},
  { id:"c5", title:"Cybersecurity Fundamentals", category:"Cybersecurity", level:"Beginner", color:"#a855f7", icon:"🔐", instructor:"HackingSum Team",
    description:"Ethical hacking, networking, Linux CLI, OWASP Top 10, CTF basics and penetration testing.",
    videos:[
      {id:"v501",title:"What is Cybersecurity? Career Paths",ytId:"U_P23SqJaDc",duration:"15:30"},
      {id:"v502",title:"Linux for Hackers — CLI Basics",ytId:"ZtqBQ68cfJc",duration:"22:00"},
      {id:"v503",title:"Networking Essentials — TCP/IP",ytId:"qiQR5rTSshw",duration:"18:45"},
      {id:"v504",title:"Intro to Ethical Hacking",ytId:"3Kq1MIfTWCE",duration:"26:20"},
    ]},
  { id:"c6", title:"Competitive Programming", category:"CP", level:"Advanced", color:"#22d3ee", icon:"🏆", instructor:"HackingSum Team",
    description:"Train like a champion. Greedy, D&C, DP, Graph algorithms. Crack Codeforces & ICPC.",
    videos:[
      {id:"v601",title:"CP Setup — Tools & Strategy",ytId:"GjpS7lRUBFg",duration:"10:20"},
      {id:"v602",title:"Greedy Algorithms Deep Dive",ytId:"HzeK7g8cD0Y",duration:"26:15"},
      {id:"v603",title:"Binary Search — All Patterns",ytId:"GU7DpgHINWQ",duration:"22:40"},
      {id:"v604",title:"Graph Algorithms — BFS & DFS",ytId:"pcKY4hjDrxk",duration:"38:05"},
    ]},
];

// ================================================================
//  DESIGN TOKENS
// ================================================================
const T = {
  bg:"#060d18",bg2:"#08111f",bg3:"#0e1d30",card:"#0a1628",
  border:"#132036",border2:"#1a2e4a",
  accent:"#00f5c4",blue:"#2196f3",pink:"#f0437a",
  amber:"#f59e0b",purple:"#a855f7",cyan:"#22d3ee",
  text:"#e2eeff",muted:"#3d5a7a",muted2:"#6b8fad",
  danger:"#f44336",success:"#22c55e",
};

// ================================================================
//  GLOBAL CSS — FULLY RESPONSIVE
// ================================================================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap');

*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;font-size:16px;}
body{background:${T.bg};color:${T.text};font-family:'Plus Jakarta Sans',sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
img{max-width:100%;}
button,input,select,textarea{font-family:inherit;}
button{cursor:pointer;}
a{text-decoration:none;color:inherit;}

/* SCROLLBAR */
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:${T.bg};}
::-webkit-scrollbar-thumb{background:${T.accent}44;border-radius:4px;}
::-webkit-scrollbar-thumb:hover{background:${T.accent}88;}

/* GRID BG */
.grid-bg{
  background-image:
    linear-gradient(rgba(0,245,196,.018) 1px,transparent 1px),
    linear-gradient(90deg,rgba(0,245,196,.018) 1px,transparent 1px);
  background-size:52px 52px;
}

/* ANIMATIONS */
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes glow{0%,100%{box-shadow:0 0 8px ${T.accent}44}50%{box-shadow:0 0 32px ${T.accent}88,0 0 60px ${T.accent}22}}
@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes countUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

.afu{animation:fadeUp .5s ease both;}
.afi{animation:fadeIn .3s ease both;}
.afloat{animation:float 4s ease-in-out infinite;}

/* GRADIENT TEXT */
.gt{background:linear-gradient(110deg,#fff 0%,${T.accent} 50%,${T.blue} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.gt2{background:linear-gradient(110deg,${T.accent},${T.blue});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.gt3{background:linear-gradient(90deg,${T.accent},${T.blue},${T.accent});background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite;}

/* BUTTONS */
.btn-p{background:linear-gradient(135deg,${T.accent},${T.blue});color:${T.bg};border:none;font-weight:700;padding:12px 28px;border-radius:10px;font-size:14px;cursor:pointer;transition:transform .2s,box-shadow .2s,opacity .2s;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:8px;}
.btn-p:hover{transform:translateY(-2px);box-shadow:0 12px 35px ${T.accent}44;}
.btn-p:disabled{opacity:.6;cursor:not-allowed;transform:none !important;}
.btn-s{background:transparent;color:${T.text};border:1px solid ${T.border2};font-weight:600;padding:12px 28px;border-radius:10px;font-size:14px;cursor:pointer;transition:all .2s;white-space:nowrap;}
.btn-s:hover{border-color:${T.accent};color:${T.accent};}
.btn-s:disabled{opacity:.5;cursor:not-allowed;}
.btn-g{background:transparent;color:${T.muted2};border:none;padding:8px 14px;border-radius:8px;font-size:13px;cursor:pointer;transition:all .2s;}
.btn-g:hover{background:${T.bg3};color:${T.text};}
.btn-r{background:${T.danger}18;color:${T.danger};border:1px solid ${T.danger}33;padding:7px 14px;border-radius:6px;font-size:12px;cursor:pointer;transition:all .2s;}
.btn-r:hover{background:${T.danger}33;}

/* INPUTS */
.inp{width:100%;background:${T.bg3};border:1.5px solid ${T.border};border-radius:10px;padding:13px 16px;color:${T.text};font-size:14px;transition:border-color .2s,box-shadow .2s;outline:none;}
.inp:focus{border-color:${T.accent}88;box-shadow:0 0 0 3px ${T.accent}12;}
.inp::placeholder{color:${T.muted};}
select.inp option{background:${T.bg3};}
.lbl{display:block;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;color:${T.muted2};letter-spacing:1.8px;text-transform:uppercase;margin-bottom:7px;}

/* CARDS */
.card{background:${T.card};border:1px solid ${T.border};border-radius:14px;}
.card-h{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease;}
.card-h:hover{transform:translateY(-5px);box-shadow:0 24px 64px rgba(0,0,0,.45);border-color:${T.accent}44 !important;}

/* BADGES */
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:11px;font-family:'JetBrains Mono',monospace;font-weight:500;}
.ba{background:${T.accent}18;color:${T.accent};border:1px solid ${T.accent}33;}
.bb{background:${T.blue}18;color:${T.blue};border:1px solid ${T.blue}33;}
.by{background:${T.amber}18;color:${T.amber};border:1px solid ${T.amber}33;}
.bp{background:${T.purple}18;color:${T.purple};border:1px solid ${T.purple}33;}
.br{background:${T.pink}18;color:${T.pink};border:1px solid ${T.pink}33;}
.bg-s{background:${T.success}18;color:${T.success};border:1px solid ${T.success}33;}

/* MISC */
.stag{display:inline-flex;align-items:center;gap:8px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;color:${T.accent};margin-bottom:14px;}
.stag::before{content:'';width:22px;height:1px;background:${T.accent};}
.divider{height:1px;background:linear-gradient(90deg,transparent,${T.border2} 30%,${T.border2} 70%,transparent);}
.glass{background:rgba(10,22,40,.9);backdrop-filter:blur(20px);border:1px solid ${T.border};border-radius:16px;}
.scr{overflow-y:auto;}
.scr::-webkit-scrollbar{width:3px;}
.scr::-webkit-scrollbar-thumb{background:${T.border2};border-radius:3px;}
.spin{display:inline-block;width:18px;height:18px;border:2px solid ${T.border2};border-top:2px solid ${T.accent};border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0;}

/* ==================== RESPONSIVE ==================== */

/* Container */
.wrap{max-width:1200px;margin:0 auto;width:100%;}

/* Padding helpers */
.px{padding-left:clamp(16px,4vw,40px);padding-right:clamp(16px,4vw,40px);}
.page{padding-top:80px;padding-bottom:60px;padding-left:clamp(16px,4vw,40px);padding-right:clamp(16px,4vw,40px);}

/* Nav */
.nav-wrap{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:66px;padding:0 clamp(16px,3vw,40px);}

/* Hero */
.hero-row{display:flex;align-items:center;justify-content:space-between;gap:clamp(24px,5vw,60px);}
.hero-left{flex:1 1 480px;min-width:0;}
.hero-right{flex:0 0 400px;width:400px;}
.hero-h1{font-size:clamp(36px,7vw,82px);font-weight:800;letter-spacing:clamp(-1px,-0.03em,-2.5px);line-height:1.02;}
.hero-sub{font-size:clamp(14px,1.6vw,17px);color:${T.muted2};line-height:1.85;max-width:520px;}
.hero-btns{display:flex;gap:12px;flex-wrap:wrap;}
.hero-btns .btn-p,.hero-btns .btn-s{padding:clamp(11px,1.5vw,15px) clamp(20px,3vw,36px);font-size:clamp(13px,1.4vw,15px);}

/* Stats row */
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:0;}
.stat-item{padding:clamp(16px,2vw,24px) 0;text-align:center;border-right:1px solid ${T.border};}
.stat-item:last-child{border-right:none;}
.stat-num{font-size:clamp(22px,3vw,34px);font-weight:800;color:${T.accent};line-height:1;}
.stat-lbl{font-size:clamp(9px,1vw,11px);color:${T.muted};letter-spacing:1.5px;text-transform:uppercase;margin-top:4px;}

/* Grids */
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:clamp(12px,2vw,20px);}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2vw,22px);}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(12px,2vw,18px);}
.grid-auto{display:grid;grid-template-columns:repeat(auto-fill,minmax(clamp(260px,30vw,340px),1fr));gap:clamp(14px,2vw,22px);}
.grid-cats{display:grid;grid-template-columns:repeat(auto-fill,minmax(clamp(140px,18vw,200px),1fr));gap:clamp(10px,1.5vw,16px);}

/* Watch layout */
.watch-layout{display:grid;grid-template-columns:1fr 340px;gap:clamp(14px,2vw,24px);align-items:start;}

/* Dashboard */
.dash-layout{display:grid;grid-template-columns:1fr 340px;gap:clamp(14px,2vw,22px);}

/* Admin */
.admin-split{display:grid;grid-template-columns:280px 1fr;gap:18px;}

/* Footer */
.footer-grid{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:clamp(24px,4vw,48px);}

/* ---- TABLET 768-1024px ---- */
@media(max-width:1024px){
  .hero-right{flex:0 0 340px;width:340px;}
  .grid-4{grid-template-columns:repeat(2,1fr);}
  .dash-layout{grid-template-columns:1fr;}
  .watch-layout{grid-template-columns:1fr;}
  .admin-split{grid-template-columns:1fr;}
  .footer-grid{grid-template-columns:1fr 1fr;}
  .watch-sidebar{position:static !important;max-height:none !important;}
}

/* ---- MOBILE <768px ---- */
@media(max-width:768px){
  .hero-row{flex-direction:column;gap:28px;}
  .hero-right{display:none !important;}
  .hero-btns{flex-direction:column;}
  .hero-btns .btn-p,.hero-btns .btn-s{width:100%;justify-content:center;text-align:center;}
  .stats-row{grid-template-columns:repeat(2,1fr);}
  .stat-item:nth-child(2){border-right:none;}
  .stat-item:nth-child(3){border-top:1px solid ${T.border};}
  .stat-item:nth-child(4){border-top:1px solid ${T.border};border-right:none;}
  .grid-2{grid-template-columns:1fr;}
  .grid-3{grid-template-columns:1fr;}
  .grid-auto{grid-template-columns:1fr;}
  .grid-cats{grid-template-columns:repeat(2,1fr);}
  .footer-grid{grid-template-columns:1fr 1fr;}
  .hide-mob{display:none !important;}
  .show-mob{display:flex !important;}
  .admin-split{grid-template-columns:1fr;}
  /* Better touch targets */
  .btn-p,.btn-s,.btn-g{min-height:44px;}
  .inp{min-height:44px;font-size:16px !important;} /* prevents iOS zoom */
  /* Cards full width on mobile */
  .card{border-radius:12px;}
  /* Page padding tighter */
  .page{padding-left:14px;padding-right:14px;}
  /* Section padding reduced */
  .sec{padding-top:clamp(40px,8vw,60px);padding-bottom:clamp(40px,8vw,60px);}
}

/* ROADMAP MOBILE */
@media(max-width:768px){
  .roadmap-card{width:100% !important;}
}

/* ---- SMALL MOBILE <480px ---- */
@media(max-width:480px){
  .grid-2{grid-template-columns:1fr;}
  .grid-4{grid-template-columns:1fr 1fr;}
  .footer-grid{grid-template-columns:1fr;}
  .auth-card{padding:24px 18px !important;}
}

/* ---- NAV MOBILE ---- */
@media(max-width:768px){
  .nav-desk{display:none !important;}
  .nav-mob-btn{display:flex !important;}
}
@media(min-width:769px){
  .nav-mob-btn{display:none !important;}
  .mob-menu{display:none !important;}
}

/* TOAST */
.toast{position:fixed;top:76px;right:clamp(12px,3vw,24px);z-index:9999;background:${T.card};border-radius:10px;padding:13px 18px;font-size:13px;box-shadow:0 8px 32px rgba(0,0,0,.5);animation:slideIn .3s ease both;max-width:min(320px,90vw);}

/* SECTION PADDING */
.sec{padding:clamp(52px,8vw,90px) clamp(16px,4vw,40px);}

/* SKELETON LOADER */
@keyframes skeleton{0%{background-position:-200% 0}100%{background-position:200% 0}}
.skel{background:linear-gradient(90deg,#132036 25%,#1a2e4a 50%,#132036 75%);background-size:200% 100%;animation:skeleton 1.4s ease infinite;border-radius:8px;}

/* QUIZ */
.quiz-opt{width:100%;text-align:left;padding:14px 18px;border-radius:10px;border:1.5px solid #1a2e4a;background:transparent;color:#e2eeff;font-size:14px;cursor:pointer;transition:all .2s;font-family:'Plus Jakarta Sans',sans-serif;}
.quiz-opt:hover{border-color:#00f5c4;background:#00f5c444;}
.quiz-opt.correct{border-color:#22c55e;background:#22c55e18;color:#22c55e;}
.quiz-opt.wrong{border-color:#f44336;background:#f4433618;color:#f44336;}

/* LEADERBOARD */
@keyframes rankIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
.rank-row{animation:rankIn .4s ease both;}

/* MOBILE IMPROVEMENTS */
@media(max-width:768px){
  .page{padding-top:76px;padding-bottom:80px;}
  .quiz-opt{padding:12px 14px;font-size:13px;}
}

/* LOADING PAGE */
@keyframes loadPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:.7}}
@keyframes loadBar{0%{width:0%}100%{width:100%}}
.load-bar{height:3px;background:linear-gradient(90deg,#00f5c4,#2196f3);border-radius:99px;animation:loadBar 1.8s ease forwards;}
`;

// ================================================================
//  FIREBASE HELPERS
// ================================================================
async function saveProgress(uid, cid, vid) {
  const ref = doc(db,"progress",uid);
  const snap = await getDoc(ref);
  const ex = snap.exists()?snap.data():{};
  const arr = ex[cid]||[];
  if(!arr.includes(vid)) await setDoc(ref,{...ex,[cid]:[...arr,vid]},{merge:true});
}
async function getProgress(uid){
  const snap=await getDoc(doc(db,"progress",uid));
  return snap.exists()?snap.data():{};
}
async function seedCoursesIfNeeded(){
  const snap=await getDocs(collection(db,"courses"));
  if(snap.empty) for(const c of SEED_COURSES) await setDoc(doc(db,"courses",c.id),{...c,createdAt:serverTimestamp()});
}

// ================================================================
//  REUSABLE COMPONENTS
// ================================================================
function Spinner({size=18}){return <span className="spin" style={{width:size,height:size}}/>;}

function ProgressRing({pct,size=80,stroke=6,color=T.accent}){
  const r=(size-stroke)/2,circ=2*Math.PI*r,off=circ-(pct/100)*circ;
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border2} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" style={{transition:"stroke-dashoffset .8s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontWeight:800,fontSize:size*.22,color,lineHeight:1}}>{pct}%</span>
        <span style={{fontSize:size*.1,color:T.muted,marginTop:2}}>DONE</span>
      </div>
    </div>
  );
}

function Toast({msg,type="success"}){
  if(!msg)return null;
  const c=type==="error"?T.danger:T.accent;
  return(
    <div className="toast" style={{border:`1px solid ${c}33`,color:c}}>
      {type==="error"?"⚠ ":"✅ "}{msg}
    </div>
  );
}

// ================================================================
//  LOGO
// ================================================================
function Logo({size=1,onClick}){
  return(
    <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:10*size,cursor:onClick?"pointer":"default",flexShrink:0}}>
      <svg width={38*size} height={38*size} viewBox="0 0 44 44" fill="none"
        style={{filter:`drop-shadow(0 0 ${8*size}px ${T.accent}66)`}}>
        <defs>
          <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={T.accent}/><stop offset="100%" stopColor={T.blue}/></linearGradient>
          <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={T.accent} stopOpacity=".12"/><stop offset="100%" stopColor={T.blue} stopOpacity=".04"/></linearGradient>
        </defs>
        <path d="M22 2L40 9L40 22C40 33 22 42 22 42C22 42 4 33 4 22L4 9Z" fill="url(#lg2)" stroke="url(#lg1)" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M24.5 11L17 24L22 24L19.5 33L27 20L22 20Z" fill="url(#lg1)"/>
      </svg>
      <div style={{lineHeight:1}}>
        <div style={{display:"flex",alignItems:"baseline"}}>
          <span style={{fontWeight:800,fontSize:18*size,background:`linear-gradient(110deg,#fff,${T.accent} 55%,${T.blue})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:-.5}}>Hacking</span>
          <span style={{fontWeight:300,fontSize:18*size,color:"rgba(255,255,255,.38)",WebkitTextFillColor:"rgba(255,255,255,.38)",letterSpacing:-.5}}>Sum</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:10*size,background:`linear-gradient(90deg,${T.accent},${T.blue})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",alignSelf:"flex-end",marginBottom:2,marginLeft:1}}>.edu</span>
        </div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:7*size,letterSpacing:2.2,textTransform:"uppercase",background:`linear-gradient(90deg,${T.accent}66,${T.blue}44)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginTop:2}}>Where Hackers Are Born</div>
      </div>
    </div>
  );
}

// ================================================================
//  NAVBAR — FIXED (no white screen, back button, notifications)
// ================================================================
function Navbar({page,setPage,user,onLogout,notifCount=0}){
  const [mob,setMob]=useState(false);
  const [sc,setSc]=useState(false);

  useEffect(()=>{const f=()=>setSc(window.scrollY>20);window.addEventListener("scroll",f);return()=>window.removeEventListener("scroll",f);},[]);

  // FIX: Don't use body overflow hidden — causes white screen on iOS/Android
  // Instead use pointer-events on content below nav
  const closeMob=()=>setMob(false);

  const links=user
    ?user.role==="admin"
      ?[{l:"Overview",p:"admin"},{l:"Courses",p:"admin-courses"},{l:"Notes",p:"admin-notes"},{l:"Quiz",p:"admin-quiz"},{l:"Students",p:"admin-students"}]
      :[{l:"Home",p:"home"},{l:"Dashboard",p:"dashboard"},{l:"Courses",p:"courses"},{l:"Notes",p:"notes"},{l:"Quiz",p:"quiz"},{l:"Jobs",p:"placement"},{l:"🏆",p:"leaderboard"}]
    :[{l:"Home",p:"home"},{l:"Courses",p:"courses"},{l:"Notes",p:"notes"},{l:"Jobs",p:"placement"},{l:"About",p:"about"}];

  const go=p=>{setPage(p);closeMob();};

  return(
    <>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:500,
        background:sc||mob?"rgba(6,13,24,.98)":"transparent",
        backdropFilter:"blur(24px)",
        borderBottom:`1px solid ${sc||mob?T.border:"transparent"}`,
        transition:"background .3s,border-color .3s"}}>
        <div className="nav-wrap">
          <Logo size={.85} onClick={()=>go("home")}/>

          {/* Desktop Links */}
          <div className="nav-desk" style={{display:"flex",alignItems:"center",gap:2}}>
            {links.map(({l,p})=>(
              <button key={p} className="btn-g" onClick={()=>go(p)}
                style={{color:page===p?T.accent:T.muted2,fontWeight:page===p?700:400,fontSize:14}}>{l}</button>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="nav-desk" style={{display:"flex",alignItems:"center",gap:10}}>
            {user?(
              <>
                {/* Notification Bell */}
                <button onClick={()=>go("notifications")} style={{position:"relative",background:"none",border:"none",cursor:"pointer",padding:6,color:T.muted2,transition:"color .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.color=T.accent} onMouseLeave={e=>e.currentTarget.style.color=T.muted2}>
                  <span style={{fontSize:18}}>🔔</span>
                  {notifCount>0&&<span style={{position:"absolute",top:2,right:2,width:16,height:16,borderRadius:"50%",background:T.pink,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{notifCount>9?"9+":notifCount}</span>}
                </button>
                {/* Profile Avatar */}
                <button onClick={()=>go("profile")} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",padding:"4px 8px",borderRadius:8,transition:"background .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.bg3} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${user.avatarColor||T.accent},${T.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:T.bg,flexShrink:0}}>
                    {user.name?.[0]?.toUpperCase()||"U"}
                  </div>
                  <span style={{fontSize:13,fontWeight:600,color:T.muted2,maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name?.split(" ")[0]}</span>
                </button>
                <button className="btn-r" onClick={onLogout} style={{padding:"7px 16px",fontSize:13}}>Logout</button>
              </>
            ):(
              <>
                <button className="btn-g" onClick={()=>go("login")} style={{fontSize:14}}>Login</button>
                <button className="btn-p" onClick={()=>go("register")} style={{padding:"9px 20px",fontSize:13}}>Get Started Free</button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button className="nav-mob-btn"
            onClick={()=>setMob(m=>!m)}
            style={{background:"none",border:"none",padding:"6px 8px",flexDirection:"column",gap:5,alignItems:"center",cursor:"pointer",zIndex:10,position:"relative"}}>
            <span style={{display:"block",width:22,height:2,background:T.text,borderRadius:2,transition:"all .3s",transform:mob?"rotate(45deg) translate(5px,5px)":"none"}}/>
            <span style={{display:"block",width:22,height:2,background:T.text,borderRadius:2,transition:"all .3s",opacity:mob?0:1}}/>
            <span style={{display:"block",width:22,height:2,background:T.text,borderRadius:2,transition:"all .3s",transform:mob?"rotate(-45deg) translate(5px,-5px)":"none"}}/>
          </button>
        </div>

        {/* Mobile Menu — inside nav so background is correct */}
        <div style={{
          maxHeight:mob?"100vh":"0",
          overflow:"hidden",
          transition:"max-height .35s ease",
          borderTop:mob?`1px solid ${T.border}`:"none",
          background:"rgba(6,13,24,.98)",
        }}>
          <div style={{padding:"8px 0"}}>
            {links.map(({l,p})=>(
              <button key={p} onClick={()=>go(p)}
                style={{display:"flex",alignItems:"center",width:"100%",padding:"14px clamp(20px,5vw,28px)",
                  background:page===p?`${T.accent}0c`:"transparent",border:"none",
                  borderLeft:page===p?`3px solid ${T.accent}`:"3px solid transparent",
                  color:page===p?T.accent:T.text,fontWeight:page===p?700:500,fontSize:15,
                  textAlign:"left",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"all .15s"}}>
                {l}
              </button>
            ))}
          </div>
          <div style={{padding:"16px clamp(20px,5vw,28px) 24px",borderTop:`1px solid ${T.border}44`}}>
            {user?(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <button onClick={()=>go("profile")} className="btn-s" style={{width:"100%",padding:13,textAlign:"center",fontSize:14}}>
                  👤 My Profile
                </button>
                <button className="btn-r" onClick={()=>{onLogout();closeMob();}} style={{width:"100%",padding:13,fontSize:14}}>
                  Logout
                </button>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <button className="btn-s" onClick={()=>go("login")} style={{width:"100%",padding:13,textAlign:"center",fontSize:14}}>Login</button>
                <button className="btn-p" onClick={()=>go("register")} style={{width:"100%",padding:13,fontSize:14}}>Get Started Free</button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

// ================================================================
//  COURSE CARD
// ================================================================
function CourseCard({course:c,i=0,onClick}){
  const lc=c.level==="Beginner"?T.accent:c.level==="Intermediate"?T.amber:T.pink;
  return(
    <div className="card card-h" onClick={onClick}
      style={{overflow:"hidden",cursor:"pointer",position:"relative",animation:`fadeUp .5s ease ${i*.07}s both`}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:c.color}}/>
      <div style={{padding:"clamp(16px,2.5vw,22px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:14}}>
          <span style={{fontSize:"clamp(24px,3vw,30px)"}}>{c.icon}</span>
          <span className="badge" style={{background:`${lc}15`,color:lc,border:`1px solid ${lc}33`,fontSize:10}}>{c.level}</span>
        </div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:c.color,letterSpacing:2.5,marginBottom:8,textTransform:"uppercase"}}>{c.category}</div>
        <div style={{fontWeight:800,fontSize:"clamp(14px,1.8vw,17px)",lineHeight:1.3,marginBottom:8}}>{c.title}</div>
        <div style={{fontSize:"clamp(11px,1.3vw,13px)",color:T.muted2,lineHeight:1.65,marginBottom:14}}>{c.description}</div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.muted}}>📹 {c.videos.length} videos</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.muted}}>👤 {c.instructor}</span>
        </div>
      </div>
    </div>
  );
}

// ================================================================
//  HOME PAGE — with Roadmap
// ================================================================
function HomePage({setPage,courses,user}){
  const cats=[
    {name:"Programming",icon:"⌨️",color:T.accent},{name:"Web Dev",icon:"🌐",color:T.blue},
    {name:"DSA",icon:"🧠",color:T.pink},{name:"Cybersecurity",icon:"🔐",color:T.purple},{name:"CP",icon:"🏆",color:T.amber},
  ];

  return(
    <div>
      {/* HERO */}
      <section className="grid-bg sec" style={{
        minHeight:"100vh",display:"flex",alignItems:"center",
        background:`radial-gradient(ellipse 85% 55% at 50% -5%,${T.accent}09 0%,transparent 65%),${T.bg}`,
        position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:"10%",right:"-5%",width:"clamp(200px,35vw,450px)",height:"clamp(200px,35vw,450px)",background:`radial-gradient(${T.accent}07,transparent 70%)`,pointerEvents:"none",borderRadius:"50%"}}/>
        <div style={{position:"absolute",bottom:"5%",left:"-5%",width:"clamp(150px,25vw,350px)",height:"clamp(150px,25vw,350px)",background:`radial-gradient(${T.blue}05,transparent 70%)`,pointerEvents:"none",borderRadius:"50%"}}/>
        <div className="wrap" style={{width:"100%"}}>
          <div className="hero-row">
            {/* Left */}
            <div className="hero-left">
              <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:"clamp(16px,3vw,24px)",
                background:`${T.accent}0d`,border:`1px solid ${T.accent}33`,padding:"6px 14px",borderRadius:8}} className="afu">
                <span style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:"pulse 2s infinite"}}/>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"clamp(9px,1.2vw,11px)",color:T.accent,letterSpacing:1.5}}>FREE CODING UNIVERSITY</span>
              </div>
              <h1 className="hero-h1 afu" style={{marginBottom:"clamp(14px,2.5vw,22px)",animationDelay:".08s"}}>
                <span className="gt">Master Code.</span><br/>
                <span>Build Anything.</span>
              </h1>
              <p className="hero-sub afu" style={{marginBottom:"clamp(24px,4vw,38px)",animationDelay:".15s"}}>
                From your first "Hello World" to landing your dream tech job — HackingSum.edu covers{" "}
                <strong style={{color:T.text}}>Python, C++, Web Dev, DSA, CP &amp; Cybersecurity</strong>, completely free.
              </p>
              <div className="hero-btns afu" style={{marginBottom:"clamp(28px,5vw,44px)",animationDelay:".22s"}}>
                <button className="btn-p" onClick={()=>setPage(user?"courses":"register")} style={{borderRadius:12}}>
                  {user?"Browse Courses →":"Start Learning Free →"}
                </button>
                <button className="btn-s" onClick={()=>setPage("courses")} style={{borderRadius:12}}>View All Courses</button>
              </div>
              {/* Stats */}
              <div className="afu" style={{borderTop:`1px solid ${T.border}`,paddingTop:"clamp(20px,3vw,32px)",animationDelay:".3s"}}>
                <div className="stats-row">
                  {[["6+","Courses"],["22+","Videos"],["5","Tracks"],["100%","Free"]].map(([n,l])=>(
                    <div key={l} className="stat-item">
                      <div className="stat-num">{n}</div>
                      <div className="stat-lbl">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Course Preview Card */}
            <div className="hero-right afloat">
              <div className="glass card-h" style={{overflow:"hidden",boxShadow:`0 32px 96px rgba(0,0,0,.55),0 0 0 1px ${T.accent}11`}}>
                <div style={{padding:"20px 22px 16px",background:`linear-gradient(135deg,${T.accent}10,${T.blue}05)`,borderBottom:`1px solid ${T.border}`}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.accent,letterSpacing:2,marginBottom:8}}>🔥 FEATURED COURSE</div>
                  <div style={{fontWeight:800,fontSize:"clamp(16px,2vw,20px)",marginBottom:4}}>Python Zero to Hero</div>
                  <div style={{fontSize:13,color:T.muted2}}>Start your coding journey today</div>
                </div>
                {SEED_COURSES[0].videos.slice(0,4).map((v,i)=>(
                  <div key={v.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 22px",
                    borderBottom:`1px solid ${T.border}77`,background:i===0?`${T.accent}06`:"transparent"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
                      background:i===0?T.accent:`${T.accent}15`,display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:10,color:i===0?T.bg:T.accent,fontWeight:700}}>{i===0?"▶":i+1}</div>
                    <span style={{fontSize:12.5,color:i===0?T.text:T.muted2,flex:1,lineHeight:1.4}}>{v.title}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,flexShrink:0}}>{v.duration}</span>
                  </div>
                ))}
                <div style={{padding:"14px 22px"}}>
                  <button className="btn-p" onClick={()=>setPage(user?"courses":"register")} style={{width:"100%",borderRadius:8,padding:12,fontSize:13}}>
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
      <section className="sec" style={{background:T.bg2}}>
        <div className="wrap">
          <div className="stag">Learning Tracks</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(24px,4vw,42px)",letterSpacing:"-1.5px",marginBottom:"clamp(24px,4vw,40px)"}}>
            Choose Your <span className="gt2">Path</span>
          </h2>
          <div className="grid-cats">
            {cats.map((c,i)=>(
              <button key={c.name} onClick={()=>setPage("courses")} className="card card-h"
                style={{padding:"clamp(20px,3vw,28px) clamp(14px,2.5vw,20px)",textAlign:"center",color:T.text,cursor:"pointer",animation:`fadeUp .5s ease ${i*.08}s both`,border:`1px solid ${T.border}`}}>
                <div style={{fontSize:"clamp(26px,4vw,34px)",marginBottom:12}}>{c.icon}</div>
                <div style={{fontWeight:700,fontSize:"clamp(13px,1.6vw,15px)",color:c.color,marginBottom:5}}>{c.name}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.muted}}>
                  {courses.filter(x=>x.category===c.name).length} course{courses.filter(x=>x.category===c.name).length!==1?"s":""}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* COURSES PREVIEW */}
      <section className="sec">
        <div className="wrap">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"clamp(20px,3vw,36px)",flexWrap:"wrap",gap:14}}>
            <div>
              <div className="stag">Courses</div>
              <h2 style={{fontWeight:800,fontSize:"clamp(22px,3.5vw,38px)",letterSpacing:"-1.5px"}}>Start Learning <span className="gt2">Today</span></h2>
            </div>
            <button className="btn-s" onClick={()=>setPage("courses")} style={{padding:"10px 22px",fontSize:13}}>View All →</button>
          </div>
          <div className="grid-auto">
            {courses.slice(0,3).map((c,i)=>(
              <div key={c.id} onClick={()=>setPage("courses")}>
                <CourseCard course={c} i={i} onClick={()=>{}}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* WHY US */}
      <section className="sec">
        <div className="wrap">
          <div className="stag">Why HackingSum</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(22px,3.5vw,38px)",letterSpacing:"-1.5px",marginBottom:"clamp(24px,4vw,40px)"}}>
            Built Different <span className="gt2">By Design</span>
          </h2>
          <div className="grid-4">
            {[
              {icon:"🎯",title:"Goal Oriented",desc:"Every course is designed with a clear outcome — job ready skills.",color:T.accent},
              {icon:"☁",title:"Cloud Synced",desc:"Firebase saves your progress — access from any device, anytime.",color:T.blue},
              {icon:"📱",title:"Mobile First",desc:"Watch on phone, tablet or laptop — perfect on every screen.",color:T.pink},
              {icon:"🔐",title:"Cyber Focus",desc:"Security-first mindset built into every course we offer.",color:T.purple},
              {icon:"🏆",title:"CP Ready",desc:"Competitive programming track to crack ICPC and Codeforces.",color:T.amber},
              {icon:"👨‍💻",title:"Real Projects",desc:"Build actual projects — not just theory. Portfolio-ready work.",color:T.cyan},
              {icon:"🆓",title:"Always Free",desc:"No subscriptions, no paywalls, no credit card. Ever.",color:T.success},
              {icon:"⚡",title:"Fast Learning",desc:"Structured paths so you learn faster with less confusion.",color:T.accent},
            ].map((item,i)=>(
              <div key={item.title} className="card card-h"
                style={{padding:"clamp(16px,2.5vw,22px)",animation:`fadeUp .4s ease ${i*.06}s both`,
                  borderTop:`2px solid ${item.color}44`}}>
                <div style={{fontSize:"clamp(22px,3vw,28px)",marginBottom:10}}>{item.icon}</div>
                <div style={{fontWeight:700,fontSize:"clamp(13px,1.5vw,14px)",color:item.color,marginBottom:6}}>{item.title}</div>
                <div style={{fontSize:"clamp(11px,1.2vw,12.5px)",color:T.muted2,lineHeight:1.65}}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* ROADMAP */}
      <section className="sec" style={{background:T.bg2}}>
        <div className="wrap">
          <div className="stag">Learning Roadmap</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(22px,3.5vw,42px)",letterSpacing:"-1.5px",marginBottom:8}}>
            Your Path to <span className="gt2">Mastery</span>
          </h2>
          <p style={{color:T.muted2,fontSize:"clamp(13px,1.5vw,15px)",marginBottom:"clamp(28px,4vw,48px)",maxWidth:520}}>
            Step-by-step guide — from complete beginner to industry-ready professional.
          </p>

          {/* Timeline */}
          <div style={{position:"relative",maxWidth:860,margin:"0 auto"}}>
            {/* Center line - desktop only */}
            <div className="hide-mob" style={{position:"absolute",left:"50%",top:0,bottom:0,width:2,
              background:`linear-gradient(180deg,${T.accent},${T.blue},${T.pink},${T.amber})`,
              transform:"translateX(-50%)",borderRadius:2,opacity:.35}}/>

            {[
              {
                step:"01", phase:"Foundation", time:"0–2 Months",
                title:"Start With the Basics", color:T.accent,
                items:["Python Zero to Hero — variables, loops, functions","Web Dev: HTML + CSS — structure & style","Terminal basics & Git fundamentals"],
                tip:"Dedicate 1–2 hours daily. Consistency beats marathon sessions every time.",
                side:"left"
              },
              {
                step:"02", phase:"Core Skills", time:"2–5 Months",
                title:"Build Real Foundations", color:T.blue,
                items:["JavaScript — DOM, events, fetch API","C++ basics — pointers, OOP, memory","DSA: Arrays, Strings, Linked Lists, Stacks"],
                tip:"Build a small project after every topic — theory only sticks through practice.",
                side:"right"
              },
              {
                step:"03", phase:"Problem Solving", time:"5–8 Months",
                title:"Think Like an Engineer", color:T.pink,
                items:["DSA: Trees, Graphs, Heaps, DP","Binary Search, Two Pointers, Sliding Window","LeetCode Easy → Medium problems daily"],
                tip:"Solve 1–2 problems daily. Pattern recognition is the real skill to build.",
                side:"left"
              },
              {
                step:"04", phase:"Specialization", time:"8–12 Months",
                title:"Choose Your Track", color:T.amber,
                items:["🔐 Cybersecurity: Linux CLI, Networking, OWASP, CTF","🏆 Competitive Programming: Greedy, D&C, Graph algos","🌐 Full Stack: React, Node.js, Databases, APIs"],
                tip:"Choose your track based on your strengths and long-term interests.",
                side:"right"
              },
              {
                step:"05", phase:"Career Ready", time:"12+ Months",
                title:"Land the Dream Job", color:T.purple,
                items:["Resume + GitHub portfolio polish","Mock interviews & system design","Apply to companies — you're ready! 🎉"],
                tip:"Portfolio + DSA + communication — all three together land the job.",
                side:"left"
              },
            ].map((r,i)=>(
              <div key={r.step} style={{
                display:"flex",
                justifyContent:r.side==="left"?"flex-start":"flex-end",
                marginBottom:"clamp(24px,4vw,40px)",
                position:"relative"
              }}>
                {/* Dot on center line */}
                <div className="hide-mob" style={{
                  position:"absolute",left:"50%",top:24,
                  width:14,height:14,borderRadius:"50%",
                  background:r.color,
                  transform:"translateX(-50%)",
                  boxShadow:`0 0 0 4px ${r.color}22, 0 0 16px ${r.color}44`,
                  zIndex:2
                }}/>

                <div className="roadmap-card" style={{
                  width:"calc(50% - 28px)",
                  background:T.card,
                  border:`1px solid ${T.border}`,
                  borderLeft:`3px solid ${r.color}`,
                  borderRadius:14,
                  padding:"clamp(18px,2.5vw,24px)",
                  animation:`fadeUp .5s ease ${i*.1}s both`,
                  position:"relative",
                }}>
                  {/* Step badge */}
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                    <div style={{
                      background:`linear-gradient(135deg,${r.color},${r.color}88)`,
                      color:T.bg,fontWeight:800,
                      fontFamily:"'JetBrains Mono',monospace",
                      fontSize:11,letterSpacing:1,
                      padding:"3px 10px",borderRadius:6
                    }}>STEP {r.step}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,letterSpacing:1}}>{r.time}</div>
                  </div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:r.color,letterSpacing:2,marginBottom:6,textTransform:"uppercase"}}>{r.phase}</div>
                  <div style={{fontWeight:800,fontSize:"clamp(15px,2vw,18px)",marginBottom:12}}>{r.title}</div>
                  <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
                    {r.items.map((item,j)=>(
                      <li key={j} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:"clamp(12px,1.4vw,13px)",color:T.muted2,lineHeight:1.5}}>
                        <span style={{color:r.color,flexShrink:0,marginTop:2}}>▸</span>{item}
                      </li>
                    ))}
                  </ul>
                  <div style={{
                    background:`${r.color}08`,border:`1px solid ${r.color}22`,
                    borderRadius:8,padding:"9px 12px",
                    display:"flex",alignItems:"flex-start",gap:8
                  }}>
                    <span style={{flexShrink:0}}>💡</span>
                    <span style={{fontSize:"clamp(11px,1.3vw,12px)",color:T.muted2,lineHeight:1.6}}>{r.tip}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Final badge */}
            <div style={{textAlign:"center",paddingTop:8}}>
              <div style={{
                display:"inline-flex",alignItems:"center",gap:12,
                background:`linear-gradient(135deg,${T.accent}12,${T.blue}08)`,
                border:`1px solid ${T.accent}33`,
                borderRadius:12,padding:"14px 28px"
              }}>
                <span style={{fontSize:24}}>🏆</span>
                <div style={{textAlign:"left"}}>
                  <div style={{fontWeight:800,fontSize:"clamp(14px,1.8vw,16px)",color:T.accent}}>Full-Stack Developer / Ethical Hacker</div>
                  <div style={{fontSize:"clamp(11px,1.3vw,12px)",color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>You're ready — go build, hack & earn! 🚀</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      {!user&&<>
        <div className="divider"/>
        <section className="sec" style={{background:`linear-gradient(135deg,${T.accent}06,${T.blue}04)`}}>
          <div className="wrap" style={{maxWidth:640,margin:"0 auto",textAlign:"center"}}>
            <div style={{fontSize:"clamp(36px,6vw,52px)",marginBottom:18}}>🚀</div>
            <h2 style={{fontWeight:800,fontSize:"clamp(24px,4vw,42px)",letterSpacing:"-1.5px",marginBottom:14}}>
              Ready to Become a <span className="gt3">Hacker</span>?
            </h2>
            <p style={{color:T.muted2,fontSize:"clamp(13px,1.5vw,15px)",lineHeight:1.8,marginBottom:32}}>
              Join thousands of students. Free forever. No credit card. No hidden fees. Forever free.
            </p>
            <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
              <button className="btn-p" onClick={()=>setPage("register")} style={{fontSize:"clamp(14px,1.5vw,16px)",padding:"clamp(12px,2vw,16px) clamp(28px,4vw,48px)",borderRadius:12}}>
                Create Free Account →
              </button>
              <button className="btn-s" onClick={()=>setPage("about")} style={{fontSize:"clamp(13px,1.4vw,15px)",padding:"clamp(12px,2vw,16px) clamp(20px,3vw,32px)",borderRadius:12}}>
                Learn More
              </button>
            </div>
          </div>
        </section>
      </>}

      <Footer setPage={setPage}/>
    </div>
  );
}

// ================================================================
//  AUTH PAGE — Forgot Password + Mobile Number
// ================================================================
function AuthPage({initMode,setPage,setUser}){
  const [mode,setMode]=useState(initMode||"login"); // login | register | forgot
  const [form,setForm]=useState({name:"",email:"",password:"",confirm:"",mobile:""});
  const [err,setErr]=useState("");
  const [succ,setSucc]=useState("");
  const [loading,setLoading]=useState(false);
  const f=e=>{setForm(p=>({...p,[e.target.name]:e.target.value}));setErr("");setSucc("");};

  async function submit(){
    setLoading(true);setErr("");setSucc("");
    try{
      if(mode==="forgot"){
        if(!form.email.trim()){setErr("Please enter your email address.");setLoading(false);return;}
        await sendPasswordResetEmail(auth,form.email.trim());
        setSucc("✅ Password reset link sent! Check your inbox (and spam folder).");
        setLoading(false);return;
      }
      if(mode==="login"){
        // Admin login — sign in via Firebase Auth so Firestore rules work
        if(isAdmin(form.email, form.password)){
          try{
            const res = await signInWithEmailAndPassword(auth, form.email, form.password);
            setUser({uid:res.user.uid, name:"Admin", email:form.email, role:"admin"});
          }catch(e){
            // Admin not in Firebase Auth yet — still allow local access (Firestore writes may fail)
            setUser({uid:"admin-local", name:"Admin", email:form.email, role:"admin"});
          }
          setPage("admin"); setLoading(false); return;
        }
        const res=await signInWithEmailAndPassword(auth,form.email,form.password);
        const snap=await getDoc(doc(db,"users",res.user.uid));
        const profile=snap.exists()?snap.data():{};
        setUser({uid:res.user.uid,name:res.user.displayName||profile.name||"Student",email:res.user.email,role:profile.role||"student",mobile:profile.mobile||"",avatarColor:profile.avatarColor||T.accent});
        setPage("dashboard");
      }else{
        if(!form.name.trim()||!form.email.trim()||!form.password){setErr("Name, email and password are required.");setLoading(false);return;}
        if(form.password.length<6){setErr("Password must be at least 6 characters.");setLoading(false);return;}
        if(form.password!==form.confirm){setErr("Passwords do not match.");setLoading(false);return;}
        if(form.mobile&&!/^[6-9]\d{9}$/.test(form.mobile)){setErr("Please enter a valid 10-digit Indian mobile number.");setLoading(false);return;}
        const res=await createUserWithEmailAndPassword(auth,form.email,form.password);
        await updateProfile(res.user,{displayName:form.name.trim()});
        await setDoc(doc(db,"users",res.user.uid),{
          name:form.name.trim(),email:form.email.trim(),
          mobile:form.mobile.trim()||"",
          role:"student",avatarColor:T.accent,
          createdAt:serverTimestamp()
        });
        setUser({uid:res.user.uid,name:form.name.trim(),email:form.email.trim(),mobile:form.mobile.trim()||"",role:"student",avatarColor:T.accent});
        setPage("dashboard");
      }
    }catch(e){
      const m=e.code==="auth/user-not-found"||e.code==="auth/wrong-password"||e.code==="auth/invalid-credential"?"Incorrect email or password."
        :e.code==="auth/email-already-in-use"?"This email is already registered. Please log in."
        :e.code==="auth/invalid-email"?"Please enter a valid email address."
        :e.code==="auth/network-request-failed"?"Network error. Please check your internet connection."
        :e.message||"Something went wrong. Please try again.";
      setErr(m);
    }
    setLoading(false);
  }

  const switchMode=m=>{setMode(m);setErr("");setSucc("");setForm({name:"",email:"",password:"",confirm:"",mobile:""});};

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
      padding:"88px clamp(16px,4vw,40px) 40px",
      background:`radial-gradient(ellipse 60% 50% at 50% 0%,${T.accent}07 0%,transparent 70%),${T.bg}`}}>
      <div style={{width:"100%",maxWidth:460,animation:"fadeUp .5s ease both"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",justifyContent:"center"}}><Logo size={1}/></div>
        </div>

        <div className="glass auth-card" style={{padding:"clamp(22px,5vw,34px) clamp(18px,4vw,30px)",boxShadow:`0 32px 80px rgba(0,0,0,.45)`}}>

          {mode!=="forgot"&&(
            <div style={{display:"flex",background:T.bg3,borderRadius:10,padding:4,marginBottom:24}}>
              {["login","register"].map(m=>(
                <button key={m} onClick={()=>switchMode(m)}
                  style={{flex:1,padding:"10px",border:"none",
                    background:mode===m?`linear-gradient(135deg,${T.accent},${T.blue})`:"transparent",
                    color:mode===m?T.bg:T.muted2,borderRadius:8,fontWeight:700,fontSize:14,
                    textTransform:"capitalize",transition:"all .2s",cursor:"pointer"}}>
                  {m==="login"?"Login":"Register"}
                </button>
              ))}
            </div>
          )}

          {mode==="forgot"?(
            <>
              <button onClick={()=>switchMode("login")} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:T.muted2,fontSize:13,cursor:"pointer",marginBottom:18,padding:0}}>
                ← Back to Login
              </button>
              <h2 style={{fontWeight:800,fontSize:"clamp(17px,2.5vw,21px)",marginBottom:6}}>Password Reset 🔑</h2>
              <p style={{color:T.muted2,fontSize:13,marginBottom:20,lineHeight:1.7}}>Enter your registered email address and we'll send you a reset link.</p>
              <label className="lbl">Email Address</label>
              <input name="email" type="email" className="inp" value={form.email} onChange={f} placeholder="you@email.com" onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </>
          ):(
            <>
              <h2 style={{fontWeight:800,fontSize:"clamp(17px,2.5vw,21px)",letterSpacing:"-.5px",marginBottom:6}}>
                {mode==="login"?"Welcome back 👋":"Join HackingSum.edu 🚀"}
              </h2>
              <p style={{color:T.muted2,fontSize:13,marginBottom:20}}>
                {mode==="login"?"Sign in to your account to continue":"Create your free student account"}
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:13}}>
                {mode==="register"&&<div><label className="lbl">Full Name *</label><input name="name" className="inp" value={form.name} onChange={f} placeholder="Your full name"/></div>}
                <div><label className="lbl">Email Address *</label><input name="email" type="email" className="inp" value={form.email} onChange={f} placeholder="you@email.com"/></div>
                {mode==="register"&&(
                  <div>
                    <label className="lbl">Mobile Number <span style={{color:T.muted,fontFamily:"sans-serif",fontSize:9,letterSpacing:0}}>(optional)</span></label>
                    <div style={{position:"relative"}}>
                      <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:13,color:T.muted2,fontFamily:"'JetBrains Mono',monospace"}}>+91</span>
                      <input name="mobile" type="tel" className="inp" value={form.mobile} onChange={f} placeholder="9876543210" maxLength={10} style={{paddingLeft:46}}/>
                    </div>
                  </div>
                )}
                <div><label className="lbl">Password *</label><input name="password" type="password" className="inp" value={form.password} onChange={f} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&mode==="login"&&submit()}/></div>
                {mode==="register"&&<div><label className="lbl">Confirm Password *</label><input name="confirm" type="password" className="inp" value={form.confirm} onChange={f} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}/></div>}
              </div>
              {mode==="login"&&(
                <div style={{textAlign:"right",marginTop:8}}>
                  <span onClick={()=>switchMode("forgot")} style={{fontSize:12,color:T.accent,cursor:"pointer",fontWeight:600}}>Forgot password?</span>
                </div>
              )}
            </>
          )}

          {err&&<div style={{marginTop:14,padding:"11px 14px",background:`${T.danger}12`,border:`1px solid ${T.danger}33`,borderRadius:8,fontSize:13,color:T.danger,display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{flexShrink:0}}>⚠</span>{err}
          </div>}
          {succ&&<div style={{marginTop:14,padding:"11px 14px",background:`${T.success}12`,border:`1px solid ${T.success}33`,borderRadius:8,fontSize:13,color:T.success,display:"flex",gap:8,alignItems:"flex-start"}}>
            <span style={{flexShrink:0}}>✅</span>{succ}
          </div>}

          <button className="btn-p" onClick={submit} disabled={loading}
            style={{width:"100%",marginTop:18,padding:"clamp(12px,1.8vw,15px)",fontSize:15,borderRadius:10}}>
            {loading&&<Spinner/>}
            {loading?"Please wait...":mode==="forgot"?"Send Reset Link →":mode==="login"?"Login to Dashboard →":"Create Account →"}
          </button>

          {mode!=="forgot"&&(
            <div style={{textAlign:"center",marginTop:14,fontSize:13,color:T.muted}}>
              {mode==="login"
                ?<>Don't have an account? <span style={{color:T.accent,cursor:"pointer",fontWeight:600}} onClick={()=>switchMode("register")}>Sign up for free</span></>
                :<>Already have an account? <span style={{color:T.accent,cursor:"pointer",fontWeight:600}} onClick={()=>switchMode("login")}>Log in</span></>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ================================================================
//  DASHBOARD
// ================================================================
function DashboardPage({user,courses,setPage,setWatch}){
  const [prog,setProg]=useState({});
  const [load,setLoad]=useState(true);

  useEffect(()=>{
    if(!user?.uid)return;
    getProgress(user.uid).then(p=>{setProg(p);setLoad(false);});
  },[user?.uid]);

  const totalV=courses.reduce((a,c)=>a+c.videos.length,0);
  const watchedV=courses.reduce((a,c)=>a+(prog[c.id]||[]).length,0);
  const pct=totalV>0?Math.round((watchedV/totalV)*100):0;
  const inProg=courses.filter(c=>{const w=(prog[c.id]||[]).length;return w>0&&w<c.videos.length;});
  const done=courses.filter(c=>c.videos.length>0&&c.videos.every(v=>(prog[c.id]||[]).includes(v.id)));

  if(load)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"80vh",flexDirection:"column",gap:16}}>
      <Spinner size={32}/><p style={{color:T.muted,fontSize:14}}>Loading dashboard...</p>
    </div>
  );

  return(
    <div className="page" style={{maxWidth:1200,margin:"0 auto"}}>
      <div style={{marginBottom:"clamp(24px,3vw,36px)"}} className="afu">
        <div className="stag">Dashboard</div>
        <h1 style={{fontWeight:800,fontSize:"clamp(24px,4vw,40px)",letterSpacing:"-1.5px"}}>
          Welcome back, <span className="gt2">{user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p style={{color:T.muted2,fontSize:14,marginTop:6}}>Your progress is synced to Firebase in real-time.</p>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{marginBottom:"clamp(18px,3vw,28px)"}}>
        {[
          {l:"Total Courses",v:courses.length,i:"📚",c:T.accent},
          {l:"Videos Watched",v:`${watchedV}/${totalV}`,i:"🎥",c:T.blue},
          {l:"Progress",v:`${pct}%`,i:"📈",c:T.pink},
          {l:"Completed",v:done.length,i:"✅",c:T.success},
        ].map((s,i)=>(
          <div key={s.l} className="card card-h" style={{padding:"clamp(16px,2.5vw,22px)",animation:`fadeUp .5s ease ${i*.07}s both`}}>
            <div style={{fontSize:"clamp(22px,3vw,28px)",marginBottom:10}}>{s.i}</div>
            <div style={{fontWeight:800,fontSize:"clamp(22px,3vw,30px)",color:s.c,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:"clamp(11px,1.2vw,12px)",color:T.muted,marginTop:5}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Progress + Quick Actions */}
      <div className="dash-layout" style={{marginBottom:"clamp(18px,3vw,28px)"}}>
        <div className="card" style={{padding:"clamp(20px,3vw,28px)",display:"flex",alignItems:"center",gap:"clamp(18px,3vw,32px)",flexWrap:"wrap"}}>
          <ProgressRing pct={pct} size={100} stroke={8} color={T.accent}/>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontWeight:700,fontSize:"clamp(15px,2vw,18px)",marginBottom:8}}>Overall Progress</div>
            <p style={{color:T.muted2,fontSize:"clamp(12px,1.4vw,14px)",lineHeight:1.7,marginBottom:14}}>
              {watchedV} of {totalV} videos watched.
              {pct<30?" Keep going — you've got this! 💪":pct<70?" Great momentum, keep it up!":"  Outstanding work! 🎉"}
            </p>
            <div style={{background:T.bg3,borderRadius:99,height:8}}>
              <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${T.accent},${T.blue})`,borderRadius:99,transition:"width 1s ease"}}/>
            </div>
          </div>
        </div>

        <div className="card" style={{padding:"clamp(18px,2.5vw,24px)"}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>Quick Actions</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              {icon:"📚",label:"Browse All Courses",pg:"courses",color:T.accent},
              {icon:"📈",label:"My Learning Progress",pg:"my-learning",color:T.blue},
              {icon:"🧠",label:"Take a Quiz",pg:"quiz",color:T.pink},
              {icon:"🏆",label:"Leaderboard",pg:"leaderboard",color:T.amber},
              {icon:"💼",label:"Job Placement Hub",pg:"placement",color:T.cyan},
              {icon:"📝",label:"Study Notes",pg:"notes",color:T.purple},
            ].map(a=>(
              <button key={a.pg} onClick={()=>setPage(a.pg)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:T.bg3,border:`1px solid ${T.border}`,borderRadius:10,cursor:"pointer",color:T.text,transition:"all .2s",textAlign:"left"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=a.color;e.currentTarget.style.background=`${a.color}08`;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.bg3;}}>
                <span style={{fontSize:18}}>{a.icon}</span>
                <span style={{fontSize:13,fontWeight:600}}>{a.label}</span>
                <span style={{marginLeft:"auto",color:T.muted}}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div style={{fontWeight:700,fontSize:"clamp(16px,2vw,20px)",marginBottom:16}}>
        {inProg.length>0?"Continue Learning ⚡":"Start a Course 🚀"}
      </div>
      <div className="grid-auto">
        {(inProg.length>0?inProg:courses).slice(0,4).map((c,i)=>{
          const w=(prog[c.id]||[]).length;
          const p=Math.round((w/c.videos.length)*100);
          const next=c.videos.find(v=>!(prog[c.id]||[]).includes(v.id))||c.videos[0];
          return(
            <div key={c.id} className="card card-h" onClick={()=>{setWatch({course:c,video:next});setPage("watch");}}
              style={{padding:"clamp(16px,2.5vw,20px)",cursor:"pointer",position:"relative",overflow:"hidden",animation:`fadeUp .5s ease ${i*.06}s both`}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:c.color}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontSize:"clamp(20px,3vw,26px)"}}>{c.icon}</span>
                <span className="badge" style={{background:`${c.color}18`,color:c.color,border:`1px solid ${c.color}33`,fontSize:10}}>{p}%</span>
              </div>
              <div style={{fontWeight:700,fontSize:"clamp(13px,1.6vw,15px)",marginBottom:4}}>{c.title}</div>
              <div style={{fontSize:"clamp(11px,1.3vw,12px)",color:T.muted2,marginBottom:12}}>{w}/{c.videos.length} videos watched</div>
              <div style={{background:T.bg3,borderRadius:99,height:5}}>
                <div style={{width:`${p}%`,height:"100%",background:c.color,borderRadius:99,transition:"width .6s"}}/>
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
function CoursesPage({courses,setPage,setWatch}){
  const [filter,setFilter]=useState("All");
  const [search,setSearch]=useState("");
  const cats=["All","Programming","Web Dev","DSA","Cybersecurity","CP"];
  const filtered=courses.filter(c=>
    (filter==="All"||c.category===filter)&&
    (search===""||c.title.toLowerCase().includes(search.toLowerCase())||c.description?.toLowerCase().includes(search.toLowerCase()))
  );
  return(
    <div className="page" style={{maxWidth:1200,margin:"0 auto"}}>
      <div style={{marginBottom:"clamp(22px,3vw,36px)"}} className="afu">
        <div className="stag">Library</div>
        <h1 style={{fontWeight:800,fontSize:"clamp(26px,4vw,44px)",letterSpacing:"-1.5px",marginBottom:"clamp(16px,2.5vw,24px)"}}>
          All <span className="gt2">Courses</span>
        </h1>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
          <input className="inp" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍  Search courses..." style={{maxWidth:"clamp(200px,35vw,300px)",borderRadius:10}}/>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {cats.map(c=>(
              <button key={c} onClick={()=>setFilter(c)}
                style={{padding:"8px clamp(12px,2vw,18px)",borderRadius:99,border:`1px solid ${filter===c?T.accent:T.border2}`,
                  background:filter===c?`${T.accent}15`:T.card,color:filter===c?T.accent:T.muted2,
                  fontSize:"clamp(11px,1.3vw,13px)",fontWeight:600,cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap"}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
      {filtered.length===0
        ?<div style={{textAlign:"center",padding:"80px 20px",color:T.muted}}>
          <div style={{fontSize:40,marginBottom:12}}>🔍</div>
          <div style={{fontWeight:700,fontSize:20,marginBottom:8}}>No courses found</div>
          <p style={{fontSize:14}}>Try a different search or category.</p>
        </div>
        :<div className="grid-auto">
          {filtered.map((c,i)=>(
            <div key={c.id} onClick={()=>{setWatch({course:c,video:c.videos[0]});setPage("watch");}}>
              <CourseCard course={c} i={i} onClick={()=>{}}/>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

// ================================================================
//  WATCH PAGE
// ================================================================
function WatchPage({watch,setWatch,courses,setPage,user}){
  const {course,video}=watch||{};
  useEffect(()=>{
    if(!user?.uid||!course?.id||!video?.id||user.role==="admin")return;
    saveProgress(user.uid,course.id,video.id);
  },[video?.id,course?.id,user?.uid]);

  if(!course||!video)return(
    <div style={{padding:"120px 32px",textAlign:"center",color:T.muted}}>
      <div style={{fontSize:40,marginBottom:16}}>📭</div>
      <p>No video selected. <span style={{color:T.accent,cursor:"pointer",fontWeight:600}} onClick={()=>setPage("courses")}>Browse Courses →</span></p>
    </div>
  );

  const live=courses.find(c=>c.id===course.id)||course;
  const idx=live.videos.findIndex(v=>v.id===video.id);
  const prev=live.videos[idx-1];
  const next=live.videos[idx+1];

  return(
    <div className="page" style={{maxWidth:1380,margin:"0 auto"}}>
      <button className="btn-g" onClick={()=>setPage("courses")}
        style={{marginBottom:"clamp(12px,2vw,20px)",display:"flex",alignItems:"center",gap:6,color:T.muted2}}>
        ← Back to Courses
      </button>
      <div className="watch-layout">
        {/* Player */}
        <div className="afu">
          <div style={{background:"#000",borderRadius:"clamp(8px,1.5vw,14px)",overflow:"hidden",aspectRatio:"16/9",
            boxShadow:`0 24px 80px rgba(0,0,0,.7)`}}>
            <iframe key={video.id}
              src={`https://www.youtube.com/embed/${video.ytId}?autoplay=1&rel=0&color=white`}
              style={{width:"100%",height:"100%",border:"none"}}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen title={video.title}/>
          </div>
          <div style={{marginTop:"clamp(14px,2.5vw,22px)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
              <span className="badge ba">{live.category}</span>
              <span className="badge by">{live.level}</span>
              {user&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.accent}}>☁ Saved to Firebase</span>}
            </div>
            <h1 style={{fontWeight:800,fontSize:"clamp(16px,3vw,26px)",letterSpacing:"-.5px",marginBottom:6}}>{video.title}</h1>
            <p style={{color:T.muted2,fontSize:"clamp(12px,1.4vw,14px)"}}>{live.title} · Lesson {idx+1} of {live.videos.length} · {video.duration}</p>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",gap:12,marginTop:"clamp(14px,2.5vw,22px)"}}>
            <button className="btn-s" disabled={!prev} onClick={()=>setWatch({course:live,video:prev})} style={{flex:1,opacity:prev?1:.4}}>← Previous</button>
            <button className="btn-p" disabled={!next} onClick={()=>setWatch({course:live,video:next})} style={{flex:1,opacity:next?1:.4}}>Next Lesson →</button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="card watch-sidebar scr" style={{overflow:"hidden",position:"sticky",top:74,maxHeight:"calc(100vh - 90px)",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"clamp(14px,2vw,18px) clamp(14px,2vw,20px)",borderBottom:`1px solid ${T.border}`,background:`linear-gradient(135deg,${live.color}0e,transparent)`,flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <span style={{fontSize:"clamp(16px,2.5vw,20px)"}}>{live.icon}</span>
              <div style={{fontWeight:700,fontSize:"clamp(12px,1.5vw,14px)",lineHeight:1.3,flex:1}}>{live.title}</div>
            </div>
            <div style={{background:T.bg3,borderRadius:99,height:4}}>
              <div style={{width:`${Math.round((idx+1)/live.videos.length*100)}%`,height:"100%",background:live.color,borderRadius:99,transition:"width .6s"}}/>
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,marginTop:5}}>{idx+1}/{live.videos.length} videos</div>
          </div>
          <div className="scr" style={{flex:1,overflowY:"auto"}}>
            {live.videos.map((v,i)=>{
              const active=v.id===video.id;
              return(
                <div key={v.id} onClick={()=>setWatch({course:live,video:v})}
                  style={{display:"flex",alignItems:"center",gap:"clamp(8px,1.5vw,12px)",padding:"clamp(10px,1.8vw,13px) clamp(12px,2vw,17px)",
                    cursor:"pointer",background:active?`${live.color}0e`:"transparent",
                    borderLeft:`3px solid ${active?live.color:"transparent"}`,
                    borderBottom:`1px solid ${T.border}44`,transition:"background .15s"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,
                    background:active?live.color:`${live.color}18`,display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:11,color:active?T.bg:live.color,fontWeight:700}}>{i+1}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:"clamp(11px,1.3vw,13px)",color:active?T.text:T.muted2,fontWeight:active?600:400,
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.title}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,marginTop:1}}>{v.duration}</div>
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
//  MY LEARNING
// ================================================================
function MyLearningPage({user,courses,setPage,setWatch}){
  const [prog,setProg]=useState({});
  const [load,setLoad]=useState(true);
  useEffect(()=>{
    if(!user?.uid)return;
    getProgress(user.uid).then(p=>{setProg(p);setLoad(false);});
  },[user?.uid]);

  if(load)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"80vh",flexDirection:"column",gap:16}}><Spinner size={32}/><p style={{color:T.muted,fontSize:14}}>Loading from Firebase...</p></div>);

  const started=courses.filter(c=>(prog[c.id]||[]).length>0);
  const done=courses.filter(c=>c.videos.length>0&&c.videos.every(v=>(prog[c.id]||[]).includes(v.id)));
  const inProg=courses.filter(c=>{const w=(prog[c.id]||[]).length;return w>0&&w<c.videos.length;});

  function CProg({c}){
    const w=(prog[c.id]||[]).length;
    const p=Math.round((w/c.videos.length)*100);
    const next=c.videos.find(v=>!(prog[c.id]||[]).includes(v.id))||c.videos[0];
    return(
      <div className="card card-h" onClick={()=>{setWatch({course:c,video:next});setPage("watch");}}
        style={{padding:"clamp(14px,2.5vw,18px) clamp(16px,3vw,20px)",cursor:"pointer",display:"flex",alignItems:"center",gap:"clamp(12px,2vw,18px)",flexWrap:"wrap"}}>
        <ProgressRing pct={p} size={52} stroke={5} color={c.color}/>
        <div style={{flex:1,minWidth:160}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontSize:18}}>{c.icon}</span>
            <span style={{fontWeight:700,fontSize:"clamp(13px,1.6vw,15px)"}}>{c.title}</span>
          </div>
          <div style={{fontSize:"clamp(11px,1.2vw,12px)",color:T.muted}}>{w}/{c.videos.length} videos · {c.category}</div>
        </div>
        <span style={{color:c.color,fontSize:20}}>→</span>
      </div>
    );
  }

  return(
    <div className="page" style={{maxWidth:880,margin:"0 auto"}}>
      <div style={{marginBottom:"clamp(22px,3vw,36px)"}} className="afu">
        <div className="stag">My Learning</div>
        <h1 style={{fontWeight:800,fontSize:"clamp(24px,4vw,40px)",letterSpacing:"-1.5px"}}>Your Learning <span className="gt2">Journey</span></h1>
        <p style={{color:T.muted2,fontSize:13,marginTop:6}}>☁ Progress synced — accessible from any device, anytime.</p>
      </div>
      {started.length===0
        ?<div style={{textAlign:"center",padding:"80px 20px",color:T.muted}}>
          <div style={{fontSize:48,marginBottom:16}}>📚</div>
          <div style={{fontWeight:700,fontSize:"clamp(18px,2.5vw,22px)",marginBottom:10}}>Nothing started yet</div>
          <p style={{fontSize:14,marginBottom:28}}>Start watching a course to track your progress!</p>
          <button className="btn-p" onClick={()=>setPage("courses")} style={{padding:"13px 32px",borderRadius:10}}>Browse Courses →</button>
        </div>
        :<>
          {inProg.length>0&&<div style={{marginBottom:"clamp(24px,3vw,36px)"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <span style={{fontWeight:800,fontSize:"clamp(16px,2vw,18px)"}}>⚡ In Progress</span>
              <span className="badge ba">{inProg.length}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>{inProg.map(c=><CProg key={c.id} c={c}/>)}</div>
          </div>}
          {done.length>0&&<div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <span style={{fontWeight:800,fontSize:"clamp(16px,2vw,18px)"}}>✅ Completed</span>
              <span className="badge bg-s">{done.length}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>{done.map(c=><CProg key={c.id} c={c}/>)}</div>
          </div>}
        </>
      }
    </div>
  );
}

// ================================================================
//  ABOUT PAGE — IMPROVED
// ================================================================
function AboutPage({setPage}){
  return(
    <div>
      {/* HERO */}
      <section style={{
        padding:"clamp(100px,12vw,130px) clamp(16px,4vw,40px) clamp(50px,7vw,80px)",
        background:`radial-gradient(ellipse 80% 60% at 50% -10%,${T.accent}0a 0%,transparent 65%),${T.bg}`,
        position:"relative",overflow:"hidden",textAlign:"center"
      }}>
        <div style={{position:"absolute",top:"15%",left:"8%",width:220,height:220,background:`radial-gradient(${T.blue}06,transparent 70%)`,borderRadius:"50%",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"20%",right:"6%",width:180,height:180,background:`radial-gradient(${T.accent}07,transparent 70%)`,borderRadius:"50%",pointerEvents:"none"}}/>
        <div style={{maxWidth:760,margin:"0 auto"}} className="afu">
          <div style={{display:"inline-flex",justifyContent:"center",marginBottom:28}}><Logo size={1.15}/></div>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:18,
            background:`${T.accent}0d`,border:`1px solid ${T.accent}33`,padding:"5px 14px",borderRadius:8}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:"pulse 2s infinite"}}/>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.accent,letterSpacing:2}}>FREE CODING UNIVERSITY · EST. 2024</span>
          </div>
          <h1 style={{fontWeight:800,fontSize:"clamp(30px,6vw,58px)",letterSpacing:"-2px",lineHeight:1.05,marginBottom:18}}>
            We Believe <span className="gt">Every Student</span><br/>Deserves World-Class Education
          </h1>
          <p style={{color:T.muted2,fontSize:"clamp(14px,1.7vw,17px)",lineHeight:1.9,maxWidth:600,margin:"0 auto 32px"}}>
            HackingSum.edu is a free learning platform where any student — regardless of city or background —
            can master coding, cybersecurity and DSA to build a career in tech.
          </p>
          <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
            <button className="btn-p" onClick={()=>setPage("register")} style={{borderRadius:12,padding:"13px 32px",fontSize:15}}>Join for Free →</button>
            <button className="btn-s" onClick={()=>setPage("courses")} style={{borderRadius:12,padding:"13px 28px",fontSize:14}}>Browse Courses</button>
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* NUMBERS */}
      <section style={{padding:"clamp(32px,5vw,52px) clamp(16px,4vw,40px)",background:T.bg2}}>
        <div className="wrap">
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:0,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
            {[
              {n:"6+",l:"Free Courses",c:T.accent},
              {n:"22+",l:"Video Lessons",c:T.blue},
              {n:"5",l:"Learning Tracks",c:T.pink},
              {n:"₹0",l:"Cost Forever",c:T.amber},
              {n:"☁",l:"Firebase Sync",c:T.purple},
            ].map((s,i,arr)=>(
              <div key={s.l} style={{
                padding:"clamp(20px,3vw,32px) 16px",textAlign:"center",
                borderRight:i<arr.length-1?`1px solid ${T.border}`:"none",
                background:`linear-gradient(180deg,${s.c}06 0%,transparent 100%)`,
              }}>
                <div style={{fontWeight:800,fontSize:"clamp(26px,4vw,38px)",color:s.c,lineHeight:1,fontFamily:"'JetBrains Mono',monospace"}}>{s.n}</div>
                <div style={{fontSize:"clamp(10px,1.2vw,12px)",color:T.muted,letterSpacing:1.5,textTransform:"uppercase",marginTop:6}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* MISSION + STORY */}
      <section className="sec">
        <div className="wrap" style={{maxWidth:1060}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"clamp(24px,4vw,48px)",alignItems:"center"}}>
            {/* Story */}
            <div className="afu">
              <div className="stag">Our Story</div>
              <h2 style={{fontWeight:800,fontSize:"clamp(22px,3.5vw,36px)",letterSpacing:"-1px",marginBottom:18,lineHeight:1.2}}>
                A Simple Idea,<br/><span className="gt2">A Big Dream</span>
              </h2>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {[
                  "HackingSum.edu was born from a simple belief — quality coding education should not be reserved for those in big cities or those who can afford expensive courses.",
                  "Our platform is built for students who learn late at night on their phones, who pick up Python from YouTube, who dream of FAANG but lack structured guidance.",
                  "Powered by Firebase, your progress stays synced in the cloud — any device, any time, learning never stops.",
                ].map((p,i)=>(
                  <p key={i} style={{fontSize:"clamp(13px,1.5vw,15px)",color:T.muted2,lineHeight:1.85,
                    paddingLeft:14,borderLeft:`2px solid ${i===0?T.accent:i===1?T.blue:T.pink}44`}}>{p}</p>
                ))}
              </div>
            </div>

            {/* Mission Cards */}
            <div style={{display:"flex",flexDirection:"column",gap:14}} className="afu">
              {[
                {icon:"🎯",title:"Mission",desc:"Deliver world-class coding education to every student — completely free.",color:T.accent},
                {icon:"👁",title:"Vision",desc:"Ek aisa India jahan talent, not money, decides who becomes an engineer.",color:T.blue},
                {icon:"💎",title:"Values",desc:"Honesty · Simplicity · Community · Continuous Learning",color:T.pink},
              ].map((v,i)=>(
                <div key={v.title} className="card card-h"
                  style={{padding:"clamp(16px,2.5vw,20px) clamp(16px,2.5vw,22px)",display:"flex",gap:14,alignItems:"flex-start",
                    borderLeft:`3px solid ${v.color}`,animation:`fadeUp .5s ease ${i*.1}s both`}}>
                  <span style={{fontSize:"clamp(20px,3vw,26px)",flexShrink:0}}>{v.icon}</span>
                  <div>
                    <div style={{fontWeight:800,fontSize:"clamp(14px,1.7vw,16px)",color:v.color,marginBottom:5}}>{v.title}</div>
                    <div style={{fontSize:"clamp(12px,1.4vw,13.5px)",color:T.muted2,lineHeight:1.7}}>{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* WHAT WE OFFER */}
      <section className="sec" style={{background:T.bg2}}>
        <div className="wrap">
          <div className="stag">What We Offer</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(22px,3.5vw,38px)",letterSpacing:"-1.5px",marginBottom:"clamp(24px,4vw,40px)"}}>
            Platform <span className="gt2">Features</span>
          </h2>
          <div className="grid-3">
            {[
              {icon:"🐍",title:"Python Zero to Hero",desc:"From absolute scratch to variables, OOP, and real projects. The best starting point for beginners.",color:T.accent,tag:"Beginner Friendly"},
              {icon:"🌐",title:"Web Development",desc:"HTML, CSS, JavaScript — build real websites from day one. Portfolio-ready projects included.",color:T.blue,tag:"Project Based"},
              {icon:"🧠",title:"DSA + Algorithms",desc:"Interview-focused DSA — Trees, Graphs, DP, sorting. FAANG prep included.",color:T.pink,tag:"Interview Prep"},
              {icon:"🔐",title:"Cybersecurity",desc:"Ethical hacking, Linux CLI, networking, OWASP Top 10, CTF basics.",color:T.purple,tag:"Hands-on Labs"},
              {icon:"⚙️",title:"C++ Masterclass",desc:"Pointers, STL, templates and competitive programming techniques. Reach power-user level.",color:T.cyan,tag:"Advanced"},
              {icon:"🏆",title:"Competitive Programming",desc:"Greedy, D&C, Binary Search, Graphs — targeted prep for Codeforces and ICPC.",color:T.amber,tag:"Contest Ready"},
            ].map((f,i)=>(
              <div key={f.title} className="card card-h"
                style={{padding:"clamp(18px,2.5vw,24px)",animation:`fadeUp .45s ease ${i*.08}s both`,
                  background:`linear-gradient(135deg,${f.color}06,${T.card} 60%)`,
                  borderTop:`2px solid ${f.color}55`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <span style={{fontSize:"clamp(26px,4vw,32px)"}}>{f.icon}</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:f.color,
                    background:`${f.color}15`,border:`1px solid ${f.color}33`,padding:"2px 8px",borderRadius:4,letterSpacing:.5}}>{f.tag}</span>
                </div>
                <div style={{fontWeight:800,fontSize:"clamp(14px,1.7vw,16px)",marginBottom:8,color:f.color}}>{f.title}</div>
                <p style={{fontSize:"clamp(12px,1.4vw,13px)",color:T.muted2,lineHeight:1.75}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* TECH STACK */}
      <section className="sec">
        <div className="wrap" style={{maxWidth:860}}>
          <div className="stag">Built With</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(20px,3vw,34px)",letterSpacing:"-1px",marginBottom:"clamp(22px,3.5vw,36px)"}}>
            Powered by <span className="gt2">Modern Tech</span>
          </h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"clamp(12px,2vw,18px)"}}>
            {[
              {name:"React + Vite",desc:"Blazing fast frontend",icon:"⚛️",color:T.cyan},
              {name:"Firebase Auth",desc:"Secure login system",icon:"🔑",color:T.amber},
              {name:"Cloud Firestore",desc:"Real-time database",icon:"☁",color:T.blue},
              {name:"YouTube API",desc:"Free video hosting",icon:"▶️",color:T.pink},
              {name:"Vercel",desc:"Free global hosting",icon:"🚀",color:T.accent},
              {name:"Google Fonts",desc:"Beautiful typography",icon:"✍️",color:T.purple},
            ].map((t,i)=>(
              <div key={t.name} className="card card-h"
                style={{padding:"clamp(14px,2vw,18px)",display:"flex",gap:12,alignItems:"center",
                  animation:`fadeUp .4s ease ${i*.07}s both`}}>
                <div style={{width:40,height:40,borderRadius:10,background:`${t.color}15`,border:`1px solid ${t.color}33`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{t.icon}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:"clamp(12px,1.4vw,13px)",color:t.color}}>{t.name}</div>
                  <div style={{fontSize:"clamp(10px,1.2vw,11px)",color:T.muted}}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider"/>

      {/* CTA */}
      <section className="sec" style={{background:`linear-gradient(135deg,${T.accent}06,${T.blue}04)`,textAlign:"center"}}>
        <div className="wrap" style={{maxWidth:580}}>
          <div style={{fontSize:"clamp(40px,7vw,56px)",marginBottom:16}}>🚀</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(24px,4vw,42px)",letterSpacing:"-1.5px",marginBottom:14}}>
            Ready to <span className="gt3">Start?</span>
          </h2>
          <p style={{color:T.muted2,fontSize:"clamp(13px,1.5vw,15px)",lineHeight:1.9,marginBottom:32}}>
            Free hai, forever. Sign up today and start your coding journey.
          </p>
          <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
            <button className="btn-p" onClick={()=>setPage("register")}
              style={{fontSize:"clamp(14px,1.5vw,16px)",padding:"clamp(13px,2vw,16px) clamp(30px,5vw,48px)",borderRadius:12}}>
              Create Free Account →
            </button>
            <button className="btn-s" onClick={()=>setPage("courses")}
              style={{fontSize:"clamp(13px,1.4vw,15px)",padding:"clamp(13px,2vw,16px) clamp(22px,3.5vw,32px)",borderRadius:12}}>
              View Courses
            </button>
          </div>
        </div>
      </section>

      <Footer setPage={setPage}/>
    </div>
  );
}

// ================================================================
//  ADMIN PANEL
// ================================================================
function AdminPage({tab:initTab,courses,setCourses,setPage}){
  const [tab,setTab]=useState(initTab||"overview");
  const [students,setStudents]=useState([]);
  const [editId,setEditId]=useState(null);
  const [toast,setToast]=useState({text:"",type:"success"});
  const [showNC,setShowNC]=useState(false);
  const [showNV,setShowNV]=useState(false);
  const [newC,setNewC]=useState({title:"",category:"Programming",level:"Beginner",description:"",icon:"📘",color:"#00f5c4"});
  const [newV,setNewV]=useState({title:"",ytId:"",duration:""});
  const [delId,setDelId]=useState(null);
  const [load,setLoad]=useState(false);

  const msg=(text,type="success")=>{setToast({text,type});setTimeout(()=>setToast({text:"",type:"success"}),3000);};
  const editC=courses.find(c=>c.id===editId);
  const TABS=[{k:"overview",l:"📊 Overview"},{k:"courses",l:"📚 Courses"},{k:"notes",l:"📝 Notes"},{k:"quiz",l:"🧠 Quiz"},{k:"students",l:"👥 Students"}];

  useEffect(()=>{
    if(tab!=="students")return;
    getDocs(collection(db,"users")).then(snap=>setStudents(snap.docs.map(d=>({id:d.id,...d.data()}))));
  },[tab]);

  async function addCourse(){
    if(!newC.title.trim())return;
    setLoad(true);
    try{
      const id=`c_${Date.now()}`;
      const data={...newC,id,instructor:"HackingSum Team",videos:[],createdAt:serverTimestamp()};
      await setDoc(doc(db,"courses",id),data);
      setCourses(p=>[...p,{...data,createdAt:new Date()}]);
      setNewC({title:"",category:"Programming",level:"Beginner",description:"",icon:"📘",color:"#00f5c4"});
      setShowNC(false);msg("✅ Course created!");
    }catch(e){msg("❌ "+e.message,"error");}
    setLoad(false);
  }

  async function deleteCourse(id){
    setLoad(true);
    try{
      await deleteDoc(doc(db,"courses",id));
      setCourses(p=>p.filter(c=>c.id!==id));
      if(editId===id)setEditId(null);
      setDelId(null);msg("🗑 Course deleted.");
    }catch(e){msg("❌ "+e.message,"error");}
    setLoad(false);
  }

  async function addVideo(){
    if(!newV.title.trim()||!newV.ytId.trim())return;
    const vid={id:`v_${Date.now()}`,...newV};
    const updated=[...(editC.videos||[]),vid];
    try{
      await updateDoc(doc(db,"courses",editId),{videos:updated});
      setCourses(p=>p.map(c=>c.id!==editId?c:{...c,videos:updated}));
      setNewV({title:"",ytId:"",duration:""});setShowNV(false);msg("✅ Video added!");
    }catch(e){msg("❌ "+e.message,"error");}
  }

  async function deleteVideo(vid){
    const updated=editC.videos.filter(v=>v.id!==vid);
    try{
      await updateDoc(doc(db,"courses",editId),{videos:updated});
      setCourses(p=>p.map(c=>c.id!==editId?c:{...c,videos:updated}));
      msg("🗑 Video removed.");
    }catch(e){msg("❌ "+e.message,"error");}
  }

  return(
    <div className="page" style={{maxWidth:1200,margin:"0 auto"}}>
      <Toast msg={toast.text} type={toast.type}/>
      <div style={{marginBottom:"clamp(20px,3vw,30px)"}} className="afu">
        <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:10,background:`${T.amber}0d`,border:`1px solid ${T.amber}33`,padding:"5px 14px",borderRadius:6}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.amber,letterSpacing:2}}>⚙ ADMIN PANEL</span>
        </div>
        <h1 style={{fontWeight:800,fontSize:"clamp(20px,3vw,32px)",letterSpacing:"-1px"}}>Control Center</h1>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:"clamp(18px,3vw,28px)",background:T.bg3,padding:4,borderRadius:10,width:"fit-content",maxWidth:"100%",overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)}
            style={{padding:"clamp(8px,1.5vw,10px) clamp(14px,2.5vw,20px)",border:"none",
              background:tab===t.k?`linear-gradient(135deg,${T.accent},${T.blue})`:"transparent",
              color:tab===t.k?T.bg:T.muted2,borderRadius:8,fontWeight:700,fontSize:"clamp(12px,1.4vw,13px)",
              cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap"}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab==="overview"&&(
        <div className="afi">
          <div className="grid-4" style={{marginBottom:"clamp(22px,3vw,32px)"}}>
            {[
              {l:"Total Courses",v:courses.length,i:"📚",c:T.accent},
              {l:"Total Videos",v:courses.reduce((a,c)=>a+c.videos.length,0),i:"🎬",c:T.blue},
              {l:"Students",v:students.length||"—",i:"👥",c:T.pink},
              {l:"Firebase",v:"Live ✓",i:"☁",c:T.success},
            ].map(s=>(
              <div key={s.l} className="card card-h" style={{padding:"clamp(16px,2.5vw,22px)"}}>
                <div style={{fontSize:"clamp(22px,3vw,28px)",marginBottom:10}}>{s.i}</div>
                <div style={{fontWeight:800,fontSize:"clamp(24px,3.5vw,32px)",color:s.c,lineHeight:1}}>{s.v}</div>
                <div style={{fontSize:"clamp(11px,1.2vw,12px)",color:T.muted,marginTop:5}}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{fontWeight:700,fontSize:"clamp(15px,2vw,17px)",marginBottom:14}}>All Courses</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {courses.map(c=>(
              <div key={c.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"clamp(12px,2vw,14px) clamp(14px,2.5vw,18px)",display:"flex",alignItems:"center",gap:"clamp(8px,1.5vw,12px)",flexWrap:"wrap"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:c.color,flexShrink:0}}/>
                <span style={{fontSize:"clamp(16px,2.5vw,20px)",flexShrink:0}}>{c.icon}</span>
                <div style={{flex:1,minWidth:120}}>
                  <div style={{fontWeight:700,fontSize:"clamp(12px,1.5vw,14px)"}}>{c.title}</div>
                  <div style={{fontSize:"clamp(10px,1.2vw,11px)",color:T.muted}}>{c.category} · {c.level} · {c.videos.length} videos</div>
                </div>
                <button onClick={()=>{setEditId(c.id);setTab("courses");}}
                  style={{background:"transparent",border:`1px solid ${T.accent}44`,color:T.accent,padding:"5px 14px",borderRadius:6,fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>
                  Edit →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COURSES */}
      {tab==="courses"&&(
        <div className="afi">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
            <div style={{fontWeight:700,fontSize:"clamp(14px,2vw,17px)"}}>Manage Courses</div>
            <button className="btn-p" onClick={()=>setShowNC(!showNC)} style={{padding:"9px 22px",fontSize:13}}>
              {showNC?"✕ Cancel":"+ New Course"}
            </button>
          </div>

          {showNC&&(
            <div style={{background:T.card,border:`1px solid ${T.accent}33`,borderRadius:12,padding:"clamp(18px,3vw,24px)",marginBottom:22}} className="afu">
              <div style={{fontWeight:700,fontSize:15,marginBottom:18}}>Create New Course</div>
              <div className="grid-2" style={{gap:12}}>
                <div style={{gridColumn:"1/-1"}}><label className="lbl">Course Title *</label><input className="inp" value={newC.title} placeholder="e.g. React Complete Guide" onChange={e=>setNewC(p=>({...p,title:e.target.value}))}/></div>
                <div><label className="lbl">Category</label><select className="inp" value={newC.category} onChange={e=>setNewC(p=>({...p,category:e.target.value}))}>{["Programming","Web Dev","DSA","Cybersecurity","CP","Other"].map(o=><option key={o}>{o}</option>)}</select></div>
                <div><label className="lbl">Level</label><select className="inp" value={newC.level} onChange={e=>setNewC(p=>({...p,level:e.target.value}))}>{["Beginner","Intermediate","Advanced"].map(o=><option key={o}>{o}</option>)}</select></div>
                <div><label className="lbl">Icon (emoji)</label><input className="inp" value={newC.icon} placeholder="📘" onChange={e=>setNewC(p=>({...p,icon:e.target.value}))}/></div>
                <div><label className="lbl">Accent Color</label><input type="color" className="inp" value={newC.color} onChange={e=>setNewC(p=>({...p,color:e.target.value}))} style={{height:46,padding:4}}/></div>
                <div style={{gridColumn:"1/-1"}}><label className="lbl">Description</label><input className="inp" value={newC.description} placeholder="Short course description..." onChange={e=>setNewC(p=>({...p,description:e.target.value}))}/></div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
                <button className="btn-p" onClick={addCourse} disabled={load} style={{padding:"10px 28px",display:"flex",gap:8,alignItems:"center"}}>{load&&<Spinner/>}Create Course</button>
                <button className="btn-s" onClick={()=>setShowNC(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div className="admin-split">
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {courses.map(c=>(
                <div key={c.id} onClick={()=>setEditId(editId===c.id?null:c.id)}
                  style={{background:editId===c.id?`${T.accent}08`:T.card,border:`1px solid ${editId===c.id?T.accent+"44":T.border}`,borderRadius:10,padding:"clamp(10px,1.8vw,13px) clamp(12px,2vw,15px)",cursor:"pointer",transition:"all .2s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:c.color,flexShrink:0}}/>
                    <span style={{fontSize:16,flexShrink:0}}>{c.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:"clamp(11px,1.4vw,13px)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div>
                      <div style={{fontSize:"clamp(10px,1.1vw,11px)",color:T.muted}}>{c.videos.length} videos</div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();setDelId(c.id);}} className="btn-r" style={{padding:"3px 9px",fontSize:11,flexShrink:0}}>Del</button>
                  </div>
                </div>
              ))}
            </div>

            {editC&&(
              <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"clamp(18px,2.5vw,22px)"}} className="afi">
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                  <span style={{fontSize:"clamp(18px,2.5vw,22px)"}}>{editC.icon}</span>
                  <div style={{fontWeight:700,fontSize:"clamp(14px,1.8vw,16px)"}}>{editC.title}</div>
                </div>
                <div style={{fontSize:11,color:T.muted,marginBottom:18,fontFamily:"'JetBrains Mono',monospace"}}>{editC.videos.length} videos · ID: {editId}</div>

                <div className="scr" style={{maxHeight:260,overflowY:"auto",marginBottom:14}}>
                  {editC.videos.length===0
                    ?<div style={{textAlign:"center",padding:"20px",color:T.muted,fontSize:13}}>No videos yet.</div>
                    :editC.videos.map((v,i)=>(
                      <div key={v.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.border}55`}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,minWidth:18,flexShrink:0}}>{i+1}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:"clamp(11px,1.4vw,13px)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.title}</div>
                          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted}}>ytId: {v.ytId} · {v.duration}</div>
                        </div>
                        <button onClick={()=>deleteVideo(v.id)} className="btn-r" style={{padding:"3px 9px",fontSize:11,flexShrink:0}}>✕</button>
                      </div>
                    ))
                  }
                </div>

                <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{fontWeight:700,fontSize:"clamp(12px,1.5vw,14px)"}}>Add New Video</div>
                    <button className="btn-g" onClick={()=>setShowNV(!showNV)} style={{fontSize:12,padding:"4px 10px"}}>{showNV?"✕":"+"}</button>
                  </div>
                  {showNV&&(
                    <div style={{display:"flex",flexDirection:"column",gap:9}} className="afu">
                      <div><label className="lbl">Video Title *</label><input className="inp" value={newV.title} placeholder="e.g. Intro to Arrays" onChange={e=>setNewV(p=>({...p,title:e.target.value}))}/></div>
                      <div>
                        <label className="lbl">YouTube Video ID *</label>
                        <input className="inp" value={newV.ytId} placeholder="e.g. dQw4w9WgXcQ" onChange={e=>setNewV(p=>({...p,ytId:e.target.value}))}/>
                        <div style={{fontSize:11,color:T.muted,marginTop:4}}>💡 youtube.com/watch?v=<strong>THIS_PART</strong></div>
                      </div>
                      <div><label className="lbl">Duration</label><input className="inp" value={newV.duration} placeholder="e.g. 14:30" onChange={e=>setNewV(p=>({...p,duration:e.target.value}))}/></div>
                      <button className="btn-p" onClick={addVideo} style={{borderRadius:8,padding:12,fontSize:13}}>Save to Firestore</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NOTES */}
      {tab==="notes"&&<AdminNotesTab/>}

      {tab==="quiz"&&<AdminQuizTab courses={courses}/>}

      {/* STUDENTS */}
      {tab==="students"&&(
        <div className="afi">
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
            <div style={{fontWeight:700,fontSize:"clamp(14px,2vw,17px)"}}>Registered Students</div>
            <span className="badge ba">{students.length}</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.accent}}>☁ Firebase Auth + Firestore</span>
          </div>
          {students.length===0
            ?<div style={{textAlign:"center",padding:"80px 20px",color:T.muted}}>
              <div style={{fontSize:44,marginBottom:12}}>👥</div>
              <div style={{fontWeight:700,fontSize:20,marginBottom:8}}>No students yet</div>
              <p style={{fontSize:14}}>Students appear here after registration.</p>
            </div>
            :<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"auto"}}>
              <div style={{display:"grid",gridTemplateColumns:"36px 1fr 1fr 90px",minWidth:500,
                padding:"11px 18px",background:T.bg3,borderBottom:`1px solid ${T.border}`,
                fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,letterSpacing:1.5,textTransform:"uppercase"}}>
                <span>#</span><span>Name</span><span>Email</span><span>Joined</span>
              </div>
              {students.map((s,i)=>(
                <div key={s.id} style={{display:"grid",gridTemplateColumns:"36px 1fr 1fr 90px",minWidth:500,
                  padding:"clamp(10px,1.8vw,14px) 18px",alignItems:"center",
                  borderBottom:i<students.length-1?`1px solid ${T.border}55`:"none",
                  background:i%2===0?"transparent":`${T.bg3}44`}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.muted}}>{i+1}</span>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${T.accent},${T.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:T.bg,flexShrink:0}}>
                      {s.name?.[0]?.toUpperCase()||"?"}
                    </div>
                    <span style={{fontWeight:600,fontSize:"clamp(12px,1.4vw,14px)"}}>{s.name||"—"}</span>
                  </div>
                  <span style={{fontSize:"clamp(11px,1.3vw,13px)",color:T.muted2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.email}</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted}}>
                    {s.createdAt?.seconds?new Date(s.createdAt.seconds*1000).toLocaleDateString("en-IN"):"—"}
                  </span>
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* Delete Modal */}
      {delId&&(
        <div style={{position:"fixed",inset:0,zIndex:999,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn .2s ease"}}
          onClick={()=>setDelId(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:T.bg2,border:`1px solid ${T.border2}`,borderRadius:14,padding:"clamp(24px,4vw,32px)",maxWidth:380,width:"100%",textAlign:"center"}}>
            <div style={{fontSize:36,marginBottom:12}}>🗑️</div>
            <div style={{fontWeight:700,fontSize:"clamp(16px,2vw,18px)",marginBottom:10}}>Delete from Firestore?</div>
            <p style={{color:T.muted2,fontSize:13,lineHeight:1.6,marginBottom:24}}>This will permanently delete the course and all its videos. Cannot be undone.</p>
            <div style={{display:"flex",gap:12,justifyContent:"center"}}>
              <button className="btn-s" onClick={()=>setDelId(null)}>Cancel</button>
              <button className="btn-r" onClick={()=>deleteCourse(delId)} style={{padding:"10px 24px",fontSize:14}}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
//  NOTES PAGE — Users read, Admin adds
// ================================================================
function NotesPage({user,setPage}){
  const [notes,setNotes]=useState([]);
  const [load,setLoad]=useState(true);
  const [search,setSearch]=useState("");
  const [catF,setCatF]=useState("All");
  const cats=["All","Python","C++","Web Dev","DSA","Cybersecurity","CP","General"];

  useEffect(()=>{
    const q=query(collection(db,"notes"),orderBy("createdAt","desc"));
    const unsub=onSnapshot(q,snap=>{
      setNotes(snap.docs.map(d=>({id:d.id,...d.data()})));
      setLoad(false);
    },()=>setLoad(false));
    return unsub;
  },[]);

  const filtered=notes.filter(n=>
    (catF==="All"||n.category===catF)&&
    (search===""||n.title?.toLowerCase().includes(search.toLowerCase())||n.content?.toLowerCase().includes(search.toLowerCase()))
  );

  const catColor={Python:T.accent,"C++":T.blue,"Web Dev":T.pink,DSA:T.amber,Cybersecurity:T.purple,CP:T.cyan,General:T.muted2};

  if(load)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"80vh",flexDirection:"column",gap:16}}><Spinner size={32}/><p style={{color:T.muted,fontSize:14}}>Loading notes...</p></div>);

  return(
    <div className="page" style={{maxWidth:1100,margin:"0 auto"}}>
      <div style={{marginBottom:"clamp(20px,3vw,32px)"}} className="afu">
        <div className="stag">Study Material</div>
        <h1 style={{fontWeight:800,fontSize:"clamp(24px,4vw,40px)",letterSpacing:"-1.5px",marginBottom:6}}>
          Course <span className="gt2">Notes</span>
        </h1>
        <p style={{color:T.muted2,fontSize:13}}>Admin dwara add kiye gaye notes — padho, samjho, ace explore! 📚</p>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",marginBottom:"clamp(18px,3vw,28px)"}}>
        <input className="inp" value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="🔍  Search notes..." style={{maxWidth:"clamp(180px,30vw,260px)",borderRadius:10}}/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setCatF(c)}
              style={{padding:"7px clamp(10px,2vw,16px)",borderRadius:99,border:`1px solid ${catF===c?(catColor[c]||T.accent):T.border2}`,
                background:catF===c?`${catColor[c]||T.accent}15`:T.card,
                color:catF===c?(catColor[c]||T.accent):T.muted2,fontSize:"clamp(10px,1.2vw,12px)",
                fontWeight:600,cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap"}}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length===0
        ?<div style={{textAlign:"center",padding:"80px 20px",color:T.muted}}>
          <div style={{fontSize:48,marginBottom:14}}>📝</div>
          <div style={{fontWeight:700,fontSize:20,marginBottom:8}}>{notes.length===0?"No notes available yet":"No results found"}</div>
          <p style={{fontSize:14,color:T.muted2}}>{notes.length===0?"The admin will add study notes soon. Check back later!":"Try a different category or search term."}</p>
        </div>
        :<div className="grid-auto">
          {filtered.map((n,i)=>{
            const cc=catColor[n.category]||T.accent;
            return(
              <div key={n.id} className="card card-h"
                style={{padding:"clamp(16px,2.5vw,22px)",animation:`fadeUp .4s ease ${i*.06}s both`,
                  borderTop:`3px solid ${cc}`,cursor:"default",display:"flex",flexDirection:"column",gap:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                  <span className="badge" style={{background:`${cc}15`,color:cc,border:`1px solid ${cc}33`,fontSize:10}}>{n.category||"General"}</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,flexShrink:0}}>
                    {n.createdAt?.seconds?new Date(n.createdAt.seconds*1000).toLocaleDateString("en-IN"):""}
                  </span>
                </div>
                <div style={{fontWeight:800,fontSize:"clamp(14px,1.8vw,16px)",lineHeight:1.3}}>{n.title}</div>
                {n.content&&(
                  <div style={{fontSize:"clamp(12px,1.4vw,13px)",color:T.muted2,lineHeight:1.75,
                    whiteSpace:"pre-wrap",background:T.bg3,borderRadius:8,padding:"12px 14px",
                    fontFamily:"'JetBrains Mono',monospace",fontSize:12,
                    maxHeight:200,overflowY:"auto",border:`1px solid ${T.border}`}}>
                    {n.content}
                  </div>
                )}
                {n.link&&(
                  <a href={n.link} target="_blank" rel="noreferrer"
                    style={{display:"inline-flex",alignItems:"center",gap:6,color:cc,fontSize:12,fontWeight:600,textDecoration:"none",
                      background:`${cc}10`,border:`1px solid ${cc}33`,borderRadius:6,padding:"5px 12px",width:"fit-content",transition:"opacity .2s"}}
                    onMouseEnter={e=>e.currentTarget.style.opacity=".7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                    🔗 Reference Link →
                  </a>
                )}
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}

// ================================================================
//  ADMIN NOTES TAB — Component used inside AdminPage
// ================================================================
function AdminNotesTab(){
  const [notes,setNotes]=useState([]);
  const [form,setForm]=useState({title:"",category:"Python",content:"",link:""});
  const [show,setShow]=useState(false);
  const [load,setLoad]=useState(false);
  const [toast,setToast]=useState("");
  const cats=["Python","C++","Web Dev","DSA","Cybersecurity","CP","General"];
  const msg=t=>{setToast(t);setTimeout(()=>setToast(""),3000);};
  const catColor={Python:T.accent,"C++":T.blue,"Web Dev":T.pink,DSA:T.amber,Cybersecurity:T.purple,CP:T.cyan,General:T.muted2};

  useEffect(()=>{
    const q=query(collection(db,"notes"),orderBy("createdAt","desc"));
    const unsub=onSnapshot(q,snap=>setNotes(snap.docs.map(d=>({id:d.id,...d.data()}))));
    return unsub;
  },[]);

  async function addNote(){
    if(!form.title.trim()||!form.content.trim()){msg("❌ Title and content are required.");return;}
    setLoad(true);
    try{
      const data={...form,createdAt:serverTimestamp(),notif:true};
      await addDoc(collection(db,"notes"),data);
      // Also add notification for all users
      await addDoc(collection(db,"notifications"),{
        title:`📝 New Note: ${form.title}`,
        body:`Category: ${form.category} — Naya study material add hua!`,
        createdAt:serverTimestamp(),type:"note"
      });
      setForm({title:"",category:"Python",content:"",link:""});
      setShow(false);msg("✅ Note published! Notification sent to all users.");
    }catch(e){msg("❌ "+e.message);}
    setLoad(false);
  }

  async function delNote(id){
    try{await deleteDoc(doc(db,"notes",id));msg("🗑 Note deleted successfully.");}
    catch(e){msg("❌ "+e.message);}
  }

  return(
    <div className="afi">
      {toast&&<div style={{background:T.card,border:`1px solid ${T.accent}33`,borderRadius:8,padding:"10px 16px",marginBottom:16,fontSize:13,color:T.accent}}>{toast}</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <div style={{fontWeight:700,fontSize:"clamp(14px,2vw,17px)"}}>Manage Notes <span className="badge ba" style={{marginLeft:8}}>{notes.length}</span></div>
        <button className="btn-p" onClick={()=>setShow(!show)} style={{padding:"9px 22px",fontSize:13}}>{show?"✕ Cancel":"+ New Note"}</button>
      </div>

      {show&&(
        <div style={{background:T.card,border:`1px solid ${T.accent}33`,borderRadius:12,padding:"clamp(18px,3vw,24px)",marginBottom:22}} className="afu">
          <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>📝 Naya Note Add Karo</div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div><label className="lbl">Title *</label><input className="inp" value={form.title} placeholder="e.g. Python Lists — Complete Guide" onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
            <div><label className="lbl">Category</label>
              <select className="inp" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                {cats.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="lbl">Content / Notes *</label>
              <textarea className="inp" value={form.content} rows={6}
                placeholder="Write your notes here — code snippets, explanations, examples..."
                style={{resize:"vertical",fontFamily:"'JetBrains Mono',monospace",fontSize:12,lineHeight:1.7}}
                onChange={e=>setForm(p=>({...p,content:e.target.value}))}/>
            </div>
            <div><label className="lbl">Reference Link (optional)</label><input className="inp" value={form.link} placeholder="https://..." onChange={e=>setForm(p=>({...p,link:e.target.value}))}/></div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
            <button className="btn-p" onClick={addNote} disabled={load} style={{display:"flex",gap:8,alignItems:"center"}}>{load&&<Spinner/>}Publish Note & Notify All Users</button>
            <button className="btn-s" onClick={()=>setShow(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {notes.length===0&&<div style={{textAlign:"center",padding:"60px 20px",color:T.muted,fontSize:14}}>No notes yet. Use the button above to add one!</div>}
        {notes.map((n,i)=>{
          const cc=catColor[n.category]||T.accent;
          return(
            <div key={n.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,
              padding:"clamp(12px,2vw,16px) clamp(14px,2.5vw,18px)",
              borderLeft:`3px solid ${cc}`,display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:200}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                  <span className="badge" style={{background:`${cc}15`,color:cc,border:`1px solid ${cc}33`,fontSize:10}}>{n.category}</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted}}>
                    {n.createdAt?.seconds?new Date(n.createdAt.seconds*1000).toLocaleDateString("en-IN"):""}
                  </span>
                </div>
                <div style={{fontWeight:700,fontSize:"clamp(13px,1.6vw,14px)",marginBottom:4}}>{n.title}</div>
                <div style={{fontSize:12,color:T.muted2,fontFamily:"'JetBrains Mono',monospace",
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"min(400px,60vw)"}}>{n.content?.slice(0,80)}...</div>
              </div>
              <button onClick={()=>delNote(n.id)} className="btn-r" style={{padding:"5px 12px",fontSize:12,flexShrink:0}}>🗑 Delete</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================
//  NOTIFICATIONS PAGE
// ================================================================
function NotificationsPage({user,setPage}){
  const [notifs,setNotifs]=useState([]);
  const [load,setLoad]=useState(true);
  const [read,setRead]=useState(()=>{
    try{return JSON.parse(localStorage.getItem("hs_read")||"[]");}catch{return [];}
  });

  useEffect(()=>{
    const q=query(collection(db,"notifications"),orderBy("createdAt","desc"));
    const unsub=onSnapshot(q,snap=>{
      setNotifs(snap.docs.map(d=>({id:d.id,...d.data()})));
      setLoad(false);
    },()=>setLoad(false));
    return unsub;
  },[]);

  const markAllRead=()=>{
    const ids=notifs.map(n=>n.id);
    localStorage.setItem("hs_read",JSON.stringify(ids));
    setRead(ids);
  };

  if(load)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"80vh",flexDirection:"column",gap:16}}><Spinner size={32}/></div>);

  return(
    <div className="page" style={{maxWidth:720,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"clamp(20px,3vw,32px)",flexWrap:"wrap",gap:12}} className="afu">
        <div>
          <div className="stag">Updates</div>
          <h1 style={{fontWeight:800,fontSize:"clamp(22px,3.5vw,36px)",letterSpacing:"-1px"}}>
            Notifications <span style={{fontSize:"clamp(16px,2vw,22px)"}}>🔔</span>
          </h1>
        </div>
        {notifs.some(n=>!read.includes(n.id))&&(
          <button className="btn-s" onClick={markAllRead} style={{padding:"8px 18px",fontSize:13}}>Mark All Read</button>
        )}
      </div>

      {notifs.length===0
        ?<div style={{textAlign:"center",padding:"80px 20px",color:T.muted}}>
          <div style={{fontSize:48,marginBottom:14}}>🔕</div>
          <div style={{fontWeight:700,fontSize:20,marginBottom:8}}>No Notifications Yet</div>
          <p style={{fontSize:14}}>Jab admin naya course ya notes add karega, yahan dikhega!</p>
        </div>
        :<div style={{display:"flex",flexDirection:"column",gap:10}}>
          {notifs.map((n,i)=>{
            const isRead=read.includes(n.id);
            const typeColor=n.type==="course"?T.accent:n.type==="note"?T.blue:T.amber;
            return(
              <div key={n.id} className="card card-h"
                onClick={()=>{const r=[...read,n.id];setRead(r);localStorage.setItem("hs_read",JSON.stringify(r));}}
                style={{padding:"clamp(14px,2.5vw,18px) clamp(16px,3vw,22px)",
                  borderLeft:`3px solid ${isRead?T.border:typeColor}`,
                  opacity:isRead?.75:1,cursor:"pointer",
                  animation:`fadeUp .4s ease ${i*.05}s both`,
                  background:isRead?T.card:`linear-gradient(135deg,${typeColor}06,${T.card})`}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    {!isRead&&<span style={{display:"inline-block",width:7,height:7,borderRadius:"50%",background:typeColor,marginRight:8,marginBottom:1,verticalAlign:"middle"}}/>}
                    <span style={{fontWeight:700,fontSize:"clamp(13px,1.6vw,15px)",color:isRead?T.muted2:T.text}}>{n.title}</span>
                    {n.body&&<p style={{fontSize:"clamp(11px,1.3vw,13px)",color:T.muted2,marginTop:4,lineHeight:1.6}}>{n.body}</p>}
                  </div>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,flexShrink:0}}>
                    {n.createdAt?.seconds?new Date(n.createdAt.seconds*1000).toLocaleDateString("en-IN"):""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}

// ================================================================
//  PROFILE PAGE — Update name, mobile, avatar color
// ================================================================
function ProfilePage({user,setUser,setPage}){
  const COLORS=[T.accent,T.blue,T.pink,T.purple,T.amber,T.cyan,"#ff6b35","#e91e63","#4caf50","#ff5722"];
  const [form,setForm]=useState({name:user?.name||"",mobile:user?.mobile||"",avatarColor:user?.avatarColor||T.accent});
  const [load,setLoad]=useState(false);
  const [succ,setSucc]=useState("");
  const [err,setErr]=useState("");

  async function save(){
    if(!form.name.trim()){setErr("Name is required.");return;}
    if(form.mobile&&!/^[6-9]\d{9}$/.test(form.mobile)){setErr("Please enter a valid 10-digit mobile number.");return;}
    setLoad(true);setErr("");setSucc("");
    try{
      await updateDoc(doc(db,"users",user.uid),{name:form.name.trim(),mobile:form.mobile.trim(),avatarColor:form.avatarColor});
      await updateProfile(auth.currentUser,{displayName:form.name.trim()});
      setUser(p=>({...p,name:form.name.trim(),mobile:form.mobile.trim(),avatarColor:form.avatarColor}));
      setSucc("✅ Profile updated successfully!");
    }catch(e){setErr("Error: "+e.message);}
    setLoad(false);
  }

  if(!user||user.role==="admin")return null;

  return(
    <div className="page" style={{maxWidth:560,margin:"0 auto"}}>
      <button className="btn-g" onClick={()=>setPage("dashboard")} style={{marginBottom:20,display:"flex",alignItems:"center",gap:6,color:T.muted2}}>
        ← Dashboard
      </button>
      <div style={{marginBottom:"clamp(22px,3vw,32px)"}} className="afu">
        <div className="stag">Account</div>
        <h1 style={{fontWeight:800,fontSize:"clamp(24px,4vw,36px)",letterSpacing:"-1.5px"}}>My <span className="gt2">Profile</span></h1>
      </div>

      {/* Avatar Preview */}
      <div className="card" style={{padding:"clamp(20px,3vw,28px)",marginBottom:18,display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}} className="afu">
        <div style={{width:72,height:72,borderRadius:"50%",background:`linear-gradient(135deg,${form.avatarColor},${T.blue})`,
          display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:28,color:T.bg,flexShrink:0,
          boxShadow:`0 0 0 4px ${form.avatarColor}33`}}>
          {form.name?.[0]?.toUpperCase()||user.name?.[0]?.toUpperCase()||"U"}
        </div>
        <div>
          <div style={{fontWeight:700,fontSize:"clamp(16px,2vw,18px)"}}>{form.name||user.name}</div>
          <div style={{fontSize:13,color:T.muted2,marginTop:2}}>{user.email}</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.accent,marginTop:4}}>Student · HackingSum.edu</div>
        </div>
      </div>

      <div className="glass" style={{padding:"clamp(20px,3vw,28px)"}} className="afu">
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <label className="lbl">Full Name *</label>
            <input className="inp" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Your full name"/>
          </div>
          <div>
            <label className="lbl">Email Address</label>
            <input className="inp" value={user.email} disabled style={{opacity:.5,cursor:"not-allowed"}}/>
            <div style={{fontSize:11,color:T.muted,marginTop:4}}>Email address cannot be changed.</div>
          </div>
          <div>
            <label className="lbl">Mobile Number <span style={{fontFamily:"sans-serif",fontSize:9,color:T.muted,letterSpacing:0}}>(optional)</span></label>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:13,color:T.muted2,fontFamily:"'JetBrains Mono',monospace"}}>+91</span>
              <input className="inp" value={form.mobile} onChange={e=>setForm(p=>({...p,mobile:e.target.value}))} placeholder="9876543210" maxLength={10} style={{paddingLeft:46}} type="tel"/>
            </div>
          </div>
          <div>
            <label className="lbl">Avatar Color</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
              {COLORS.map(c=>(
                <button key={c} onClick={()=>setForm(p=>({...p,avatarColor:c}))}
                  style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${c},${T.blue})`,border:`3px solid ${form.avatarColor===c?"#fff":"transparent"}`,cursor:"pointer",transition:"transform .2s",flexShrink:0}}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.15)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
              ))}
            </div>
          </div>
        </div>

        {err&&<div style={{marginTop:14,padding:"11px 14px",background:`${T.danger}12`,border:`1px solid ${T.danger}33`,borderRadius:8,fontSize:13,color:T.danger}}>{err}</div>}
        {succ&&<div style={{marginTop:14,padding:"11px 14px",background:`${T.success}12`,border:`1px solid ${T.success}33`,borderRadius:8,fontSize:13,color:T.success}}>{succ}</div>}

        <button className="btn-p" onClick={save} disabled={load}
          style={{width:"100%",marginTop:20,padding:14,fontSize:15,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {load&&<Spinner/>}{load?"Saving...":"Save Profile Changes ✓"}
        </button>
      </div>
    </div>
  );
}



// ================================================================
//  QUIZ DATA — 3 LEVELS × 6 COURSES × 20 QUESTIONS = 360 total
//  Levels: basic | intermediate | advanced
// ================================================================
const STATIC_QUIZ = {
  c1:{
    basic:[
      {q:"What does 'print()' do in Python?",opts:["Takes input","Displays output","Imports module","Defines function"],ans:1,topic:"Basics"},
      {q:"Which symbol is used for comments in Python?",opts:["//","/* */","#","--"],ans:2,topic:"Basics"},
      {q:"What is the output of: type(3.14)?",opts:["int","str","float","double"],ans:2,topic:"Basics"},
      {q:"Which of these is a valid Python variable name?",opts:["2name","my-var","_score","class"],ans:2,topic:"Basics"},
      {q:"How do you take user input in Python?",opts:["scan()","input()","get()","read()"],ans:1,topic:"Basics"},
      {q:"What does len('hello') return?",opts:["4","5","6","Error"],ans:1,topic:"Basics"},
      {q:"Which keyword is used to define a function?",opts:["fun","func","def","function"],ans:2,topic:"Functions"},
      {q:"How do you create a list in Python?",opts:["{}","()","[]","<>"],ans:2,topic:"Data Types"},
      {q:"What is the output of: 10 // 3?",opts:["3.33","3","4","Error"],ans:1,topic:"Operators"},
      {q:"How do you start a for loop in Python?",opts:["for i = 0","for(i=0;i<n;i++)","for i in range(n):","foreach i in n:"],ans:2,topic:"Loops"},
      {q:"What does 'break' do in a loop?",opts:["Skips current iteration","Exits the loop","Restarts loop","None"],ans:1,topic:"Loops"},
      {q:"How do you check if a key exists in a dictionary?",opts:["dict.has(key)","key in dict","dict.exists(key)","dict.find(key)"],ans:1,topic:"Data Structures"},
      {q:"What is 'None' in Python?",opts:["Zero","Empty string","Null value","False"],ans:2,topic:"Basics"},
      {q:"Which operator checks equality in Python?",opts:["=","==","===","!="],ans:1,topic:"Operators"},
      {q:"What does 'append()' do to a list?",opts:["Removes last item","Adds item to end","Sorts list","Reverses list"],ans:1,topic:"Data Structures"},
      {q:"How do you get the number of items in a list 'a'?",opts:["a.size()","a.length","len(a)","count(a)"],ans:2,topic:"Data Structures"},
      {q:"What is the output of: 'Hello' + ' World'?",opts:["Error","Hello World","HelloWorld","Hello + World"],ans:1,topic:"Strings"},
      {q:"Which statement handles exceptions in Python?",opts:["catch","try-except","handle","error-check"],ans:1,topic:"Error Handling"},
      {q:"What does 'import' do in Python?",opts:["Exports module","Loads a module for use","Deletes module","Creates module"],ans:1,topic:"Modules"},
      {q:"How do you write a single-line if condition?",opts:["if(x>0)","if x > 0:","if x > 0 then","x > 0 ? yes : no"],ans:1,topic:"Conditionals"},
    ],
    intermediate:[
      {q:"What is the difference between '==' and 'is' in Python?",opts:["No difference","== checks value, is checks identity","is checks value, == checks identity","Both check identity"],ans:1,topic:"OOP"},
      {q:"What does *args allow in a function?",opts:["Keyword arguments only","Variable number of positional arguments","Fixed arguments","None"],ans:1,topic:"Functions"},
      {q:"What is list comprehension?",opts:["Copying a list","Compact way to create lists","Sorting lists","None"],ans:1,topic:"Data Structures"},
      {q:"What is a lambda function?",opts:["Named multi-line function","Anonymous single-expression function","Class method","None"],ans:1,topic:"Functions"},
      {q:"What does 'self' represent in a class method?",opts:["Class name","Parent class","Current instance","Module"],ans:2,topic:"OOP"},
      {q:"What is the output of: [x**2 for x in range(4)]?",opts:["[0,1,2,3]","[0,1,4,9]","[1,4,9,16]","Error"],ans:1,topic:"List Comprehension"},
      {q:"What does 'with open()' ensure?",opts:["File is always deleted","File is properly closed","File is read-only","None"],ans:1,topic:"File Handling"},
      {q:"What is the difference between deepcopy and shallow copy?",opts:["Same thing","Deepcopy copies nested objects fully","Shallow copy is slower","None"],ans:1,topic:"Memory"},
      {q:"What does @staticmethod decorator do?",opts:["Binds method to instance","Method doesn't need self or cls","Makes method private","None"],ans:1,topic:"OOP"},
      {q:"What is a generator in Python?",opts:["A list creator","Function that yields values lazily","Random number generator","None"],ans:1,topic:"Advanced"},
      {q:"What does **kwargs allow?",opts:["Positional args","Variable keyword arguments as dict","Fixed keyword args","None"],ans:1,topic:"Functions"},
      {q:"What is the purpose of __str__ method?",opts:["Deletes object","Returns string representation","Imports module","None"],ans:1,topic:"OOP"},
      {q:"What is a tuple unpacking?",opts:["Breaking tuple into individual variables","Sorting tuple","Deleting tuple","None"],ans:0,topic:"Data Structures"},
      {q:"What does set() guarantee about elements?",opts:["Ordered","No duplicates","Sorted","All strings"],ans:1,topic:"Data Structures"},
      {q:"What is recursion?",opts:["Loop using for","Function calling itself","Class calling itself","None"],ans:1,topic:"Functions"},
      {q:"What does map(func, list) return?",opts:["Modified list in-place","Iterator applying func to each element","Sorted list","None"],ans:1,topic:"Functional"},
      {q:"What is difference between append() and extend()?",opts:["Same","append adds one item, extend adds iterable","extend adds one item, append adds iterable","None"],ans:1,topic:"Data Structures"},
      {q:"What does 'pass' do in Python?",opts:["Exits function","Does nothing — placeholder","Continues loop","None"],ans:1,topic:"Syntax"},
      {q:"What is method overriding?",opts:["Creating new method","Child class redefines parent method","Deleting parent method","None"],ans:1,topic:"OOP"},
      {q:"What is the use of enumerate()?",opts:["Count list items","Iterate with index and value","Sort items","None"],ans:1,topic:"Iteration"},
    ],
    advanced:[
      {q:"What is the GIL in Python?",opts:["Global Input Lock","Global Interpreter Lock — prevents true multithreading","Global Index List","None"],ans:1,topic:"Internals"},
      {q:"What is a metaclass in Python?",opts:["Parent class","Class of a class","Abstract class","None"],ans:1,topic:"Advanced OOP"},
      {q:"What does @property decorator do?",opts:["Makes variable public","Creates getter method accessed like attribute","Caches result","None"],ans:1,topic:"Advanced OOP"},
      {q:"What is the difference between __new__ and __init__?",opts:["Same","__new__ creates instance, __init__ initializes it","__init__ creates, __new__ initializes","None"],ans:1,topic:"Advanced OOP"},
      {q:"What is memoization?",opts:["Memory management","Caching function results to avoid recomputation","None","Garbage collection"],ans:1,topic:"Optimization"},
      {q:"What are Python descriptors?",opts:["Variable descriptions","Objects defining __get__,__set__,__delete__ for attribute access","File metadata","None"],ans:1,topic:"Advanced OOP"},
      {q:"What is asyncio used for?",opts:["Multithreading","Asynchronous/concurrent I/O without threading","Database queries","None"],ans:1,topic:"Async"},
      {q:"What is the difference between @classmethod and @staticmethod?",opts:["Same","classmethod gets cls as first arg, staticmethod gets neither","staticmethod gets cls","None"],ans:1,topic:"OOP"},
      {q:"What does yield from do?",opts:["Creates generator","Delegates to a sub-generator","Imports module","None"],ans:1,topic:"Generators"},
      {q:"What is __slots__ used for?",opts:["Defining time slots","Restricts instance attributes to save memory","Defines class methods","None"],ans:1,topic:"Memory"},
      {q:"What is the complexity of Python dict lookup?",opts:["O(n)","O(log n)","O(1) average","O(n²)"],ans:2,topic:"Complexity"},
      {q:"What does functools.lru_cache do?",opts:["Sorts functions","Caches function return values (memoization)","Deletes cache","None"],ans:1,topic:"Optimization"},
      {q:"What is a context manager?",opts:["Memory manager","Object managing setup/teardown with 'with' keyword","Thread manager","None"],ans:1,topic:"Advanced"},
      {q:"What is duck typing?",opts:["Using ducks in code","If it behaves like a type, treat it as that type","Type checking","None"],ans:1,topic:"Python Philosophy"},
      {q:"What is the difference between is and == for strings?",opts:["Always same","== compares value, is compares memory address","is compares value","None"],ans:1,topic:"Memory"},
      {q:"What is __repr__ vs __str__?",opts:["Same","__repr__ for developers (unambiguous), __str__ for end users","__str__ for developers","None"],ans:1,topic:"OOP"},
      {q:"What is Python's MRO (Method Resolution Order)?",opts:["Memory Reference Order","Order Python searches classes for methods (C3 linearization)","None","Module Resolution"],ans:1,topic:"Advanced OOP"},
      {q:"What is a coroutine?",opts:["Error handler","Function that can pause and resume execution","Thread","None"],ans:1,topic:"Async"},
      {q:"What does __call__ allow?",opts:["Calling a variable","Makes an object callable like a function","Imports module","None"],ans:1,topic:"Advanced OOP"},
      {q:"What is the purpose of Abstract Base Classes (ABC)?",opts:["Speed optimization","Define interface that subclasses must implement","Memory management","None"],ans:1,topic:"Advanced OOP"},
    ],
  },
  c2:{
    basic:[
      {q:"What is 'cout' used for in C++?",opts:["Input","Output to console","File operations","Memory"],ans:1,topic:"Basics"},
      {q:"How do you end a C++ statement?",opts:[":",".",";","none"],ans:2,topic:"Basics"},
      {q:"Which header is needed for cout?",opts:["stdio.h","stdlib.h","iostream","string.h"],ans:2,topic:"Basics"},
      {q:"What does 'int' declare?",opts:["Float variable","Integer variable","Character","String"],ans:1,topic:"Data Types"},
      {q:"How do you write a single-line comment in C++?",opts:["#","//","/* */","--"],ans:1,topic:"Basics"},
      {q:"What is the correct way to declare a variable: int x = 5?",opts:["Yes, correct","int = x 5","5 = int x","x int = 5"],ans:0,topic:"Variables"},
      {q:"What does 'cin' do?",opts:["Outputs to console","Takes input from user","Creates input","None"],ans:1,topic:"Input/Output"},
      {q:"What is an array in C++?",opts:["Single variable","Collection of same-type elements","Key-value store","None"],ans:1,topic:"Arrays"},
      {q:"How do you access 3rd element of array 'a'?",opts:["a[3]","a(3)","a[2]","a.3"],ans:2,topic:"Arrays"},
      {q:"What is a for loop used for?",opts:["Decision making","Repeating code a number of times","Defining functions","None"],ans:1,topic:"Loops"},
      {q:"What does 'break' do in a loop?",opts:["Skips iteration","Exits loop","Restarts","None"],ans:1,topic:"Loops"},
      {q:"What is a function in C++?",opts:["A variable","Reusable block of code","Loop","None"],ans:1,topic:"Functions"},
      {q:"What is 'return' used for?",opts:["Prints value","Sends value back from function","Imports","None"],ans:1,topic:"Functions"},
      {q:"Which of these is correct to declare a string?",opts:['char s="hi"','string s="hi"','String s="hi"','str s="hi"'],ans:1,topic:"Strings"},
      {q:"What does sizeof() return?",opts:["Length of string","Size in bytes","Array length","None"],ans:1,topic:"Memory"},
      {q:"What is a boolean in C++?",opts:["Number","True/False value","Character","None"],ans:1,topic:"Data Types"},
      {q:"How do you write if-else in C++?",opts:["if x > 0:","if(x>0){} else{}","if x>0 then","None"],ans:1,topic:"Conditionals"},
      {q:"What is the index of last element in int a[5]?",opts:["5","4","3","6"],ans:1,topic:"Arrays"},
      {q:"What does 'void' mean as return type?",opts:["Returns zero","Function returns nothing","Returns string","None"],ans:1,topic:"Functions"},
      {q:"What is a nested loop?",opts:["Loop with break","Loop inside another loop","Recursive loop","None"],ans:1,topic:"Loops"},
    ],
    intermediate:[
      {q:"What does a pointer store?",opts:["Value directly","Memory address of variable","String","Float"],ans:1,topic:"Pointers"},
      {q:"What does '&' operator return?",opts:["Value","Address of variable","Reference","None"],ans:1,topic:"Pointers"},
      {q:"What is 'new' used for in C++?",opts:["Create variable","Dynamic memory allocation on heap","Static allocation","None"],ans:1,topic:"Memory"},
      {q:"What is 'delete' used for?",opts:["Delete file","Free dynamically allocated memory","Remove variable","None"],ans:1,topic:"Memory"},
      {q:"What is encapsulation?",opts:["Inheriting properties","Hiding data inside a class","Creating objects","None"],ans:1,topic:"OOP"},
      {q:"What keyword enables polymorphism in C++?",opts:["static","virtual","inline","const"],ans:1,topic:"OOP"},
      {q:"What is a constructor?",opts:["Destroys object","Auto-called method to initialize object","Random function","None"],ans:1,topic:"OOP"},
      {q:"What is the difference between struct and class?",opts:["No difference","Struct default public, class default private","Struct has no methods","None"],ans:1,topic:"OOP"},
      {q:"What is function overloading?",opts:["Same function different files","Multiple functions same name different parameters","None","Recursive function"],ans:1,topic:"Functions"},
      {q:"What is the scope resolution operator?",opts:["->","::","**",".."],ans:1,topic:"Scope"},
      {q:"What does 'this' pointer refer to?",opts:["Parent class","Current object","Global variable","None"],ans:1,topic:"Pointers"},
      {q:"What is inheritance in C++?",opts:["Copying code","Child class reusing parent properties/methods","None","Creating objects"],ans:1,topic:"OOP"},
      {q:"What is a reference variable?",opts:["Pointer","Alias for another variable","Copy of variable","None"],ans:1,topic:"References"},
      {q:"What is the difference between pass by value and reference?",opts:["Same","Value copies data, reference passes original","Reference copies data","None"],ans:1,topic:"Functions"},
      {q:"What is a vector in STL?",opts:["Mathematical vector","Dynamic array","Fixed array","None"],ans:1,topic:"STL"},
      {q:"How do you add element to end of vector?",opts:["push()","add()","push_back()","append()"],ans:2,topic:"STL"},
      {q:"What is 'const' keyword?",opts:["Variable value can change","Variable value cannot be changed","Pointer","None"],ans:1,topic:"Keywords"},
      {q:"What is abstract class?",opts:["Empty class","Class with at least one pure virtual function","Template class","None"],ans:1,topic:"OOP"},
      {q:"What is stack in STL?",opts:["FIFO container","LIFO container","Sorted container","None"],ans:1,topic:"STL"},
      {q:"What is queue in STL?",opts:["LIFO container","FIFO container","Random container","None"],ans:1,topic:"STL"},
    ],
    advanced:[
      {q:"What is RAII in C++?",opts:["Resource Acquisition Is Initialization — tie resource lifecycle to object","Random Access","None","Resource Array"],ans:0,topic:"Memory Management"},
      {q:"What is a smart pointer?",opts:["Fast pointer","Automatically manages memory (unique_ptr, shared_ptr)","Pointer to pointer","None"],ans:1,topic:"Memory Management"},
      {q:"Difference between unique_ptr and shared_ptr?",opts:["Same","unique_ptr — single owner, shared_ptr — multiple owners","shared_ptr — single owner","None"],ans:1,topic:"Smart Pointers"},
      {q:"What is move semantics?",opts:["Moving files","Transferring ownership of resources efficiently without copying","Memory allocation","None"],ans:1,topic:"C++11"},
      {q:"What is std::move()?",opts:["Physically moves object","Casts to rvalue reference enabling move semantics","Copies object","None"],ans:1,topic:"C++11"},
      {q:"What is a template in C++?",opts:["HTML template","Generic programming — write code for any type","File template","None"],ans:1,topic:"Templates"},
      {q:"What is template specialization?",opts:["Generic template","Custom implementation for specific type","Template error","None"],ans:1,topic:"Templates"},
      {q:"What is a variadic template?",opts:["Template with fixed args","Template accepting any number of type args","None","Error"],ans:1,topic:"Templates"},
      {q:"What is the vtable?",opts:["Variable table","Virtual function table for runtime polymorphism","Vector table","None"],ans:1,topic:"Internals"},
      {q:"What is copy elision / RVO?",opts:["Copying error","Compiler optimization to avoid unnecessary copies","None","Memory error"],ans:1,topic:"Optimization"},
      {q:"What are lvalue and rvalue?",opts:["Same thing","lvalue has address (persistent), rvalue is temporary","rvalue has address","None"],ans:1,topic:"C++11"},
      {q:"What is std::thread?",opts:["String thread","C++11 class for creating threads","Timer","None"],ans:1,topic:"Concurrency"},
      {q:"What is a mutex?",opts:["Math function","Synchronization primitive to protect shared data","Thread","None"],ans:1,topic:"Concurrency"},
      {q:"What is constexpr?",opts:["Constant expression evaluated at compile time","Runtime constant","None","Variable"],ans:0,topic:"C++11"},
      {q:"What is std::optional?",opts:["Error type","Wrapper for value that may or may not exist","Pointer","None"],ans:1,topic:"C++17"},
      {q:"What is structured binding in C++17?",opts:["Binding threads","Destructuring tuple/struct into named variables","Memory binding","None"],ans:1,topic:"C++17"},
      {q:"What is SFINAE?",opts:["Substitution Failure Is Not An Error — template metaprogramming technique","Error type","None","Function"],ans:0,topic:"Templates"},
      {q:"What does noexcept mean?",opts:["Always throws","Promises function won't throw exceptions","Ignores exceptions","None"],ans:1,topic:"Exceptions"},
      {q:"What is std::variant?",opts:["Array type","Type-safe union — holds one of several types","None","Pointer"],ans:1,topic:"C++17"},
      {q:"What is perfect forwarding?",opts:["Fast forwarding","Preserving value category when forwarding args to another function","None","Copying"],ans:1,topic:"C++11"},
    ],
  },
  c3:{
    basic:[
      {q:"What does HTML stand for?",opts:["HyperText Markup Language","High Tech Modern Language","HyperText Modern Links","None"],ans:0,topic:"HTML"},
      {q:"Which tag creates a hyperlink?",opts:["<link>","<a>","<href>","<url>"],ans:1,topic:"HTML"},
      {q:"Which HTML tag is for the largest heading?",opts:["<h6>","<h1>","<header>","<title>"],ans:1,topic:"HTML"},
      {q:"What does CSS stand for?",opts:["Computer Style Sheets","Cascading Style Sheets","Creative Style System","None"],ans:1,topic:"CSS"},
      {q:"How do you select by id in CSS?",opts:[".myid","#myid","*myid","@myid"],ans:1,topic:"CSS"},
      {q:"How do you select by class in CSS?",opts:["#myclass",".myclass","*myclass","@myclass"],ans:1,topic:"CSS"},
      {q:"Which CSS property changes text color?",opts:["text-color","font-color","color","foreground"],ans:2,topic:"CSS"},
      {q:"What does 'display: flex' do?",opts:["Hides element","Creates flex container","Floats element","None"],ans:1,topic:"CSS"},
      {q:"What is JavaScript used for?",opts:["Styling","Structure","Interactivity","Database"],ans:2,topic:"JavaScript"},
      {q:"How do you declare a variable in modern JS?",opts:["variable x","var only","let or const","dim x"],ans:2,topic:"JavaScript"},
      {q:"What does DOM stand for?",opts:["Data Object Model","Document Object Model","Dynamic Object Model","None"],ans:1,topic:"JavaScript"},
      {q:"How do you select element by id in JS?",opts:["selectId()","getElementById()","getById()","findId()"],ans:1,topic:"JavaScript"},
      {q:"What does 'console.log()' do?",opts:["Creates log file","Prints to browser console","Alerts user","None"],ans:1,topic:"JavaScript"},
      {q:"What is an event listener?",opts:["Variable","Function that responds to user events","Loop","None"],ans:1,topic:"Events"},
      {q:"What does 'async' keyword do?",opts:["Makes function synchronous","Marks function as asynchronous","Loops function","None"],ans:1,topic:"Async"},
      {q:"What is a semantic HTML tag?",opts:["Styled tag","Tag with meaningful name like <article> <nav>","Custom tag","None"],ans:1,topic:"HTML"},
      {q:"What does 'padding' do in CSS?",opts:["Space outside element","Space inside element between content and border","Border width","None"],ans:1,topic:"CSS"},
      {q:"What does 'margin' do in CSS?",opts:["Space inside element","Space outside element border","Padding","None"],ans:1,topic:"CSS"},
      {q:"Which tag is used for unordered list?",opts:["<ol>","<list>","<ul>","<li>"],ans:2,topic:"HTML"},
      {q:"What does 'alt' attribute do in <img>?",opts:["Changes image size","Provides alternate text","Links image","None"],ans:1,topic:"HTML"},
    ],
    intermediate:[
      {q:"What is the CSS box model?",opts:["Box shape","Margin + Border + Padding + Content","Color model","None"],ans:1,topic:"CSS"},
      {q:"What is CSS specificity?",opts:["Animation speed","Rules for which CSS rule wins when multiple apply","Color depth","None"],ans:1,topic:"CSS"},
      {q:"What is CSS position: absolute?",opts:["Relative to normal flow","Positioned relative to nearest positioned ancestor","Fixed to viewport","None"],ans:1,topic:"CSS"},
      {q:"What is 'const' vs 'let' in JavaScript?",opts:["Same","const cannot be reassigned, let can","let cannot be reassigned","None"],ans:1,topic:"JavaScript"},
      {q:"What is a closure in JavaScript?",opts:["Class method","Function that remembers its outer scope even after execution","Loop","None"],ans:1,topic:"JavaScript"},
      {q:"What is event bubbling?",opts:["Creating events","Events propagating from child to parent elements","None","Blocking events"],ans:1,topic:"Events"},
      {q:"What does 'preventDefault()' do?",opts:["Stops event","Prevents default browser behavior (e.g. form submit)","Creates event","None"],ans:1,topic:"Events"},
      {q:"What is a Promise in JavaScript?",opts:["Variable","Object representing future value of async operation","Loop","None"],ans:1,topic:"Async"},
      {q:"What does async/await do?",opts:["Makes code slower","Syntactic sugar for handling Promises cleanly","Creates threads","None"],ans:1,topic:"Async"},
      {q:"What is localStorage?",opts:["Server storage","Browser key-value storage persisting across sessions","Cookie","Session storage"],ans:1,topic:"Web APIs"},
      {q:"What is JSON?",opts:["JavaScript Object Notation — lightweight data format","Java module","None","Network protocol"],ans:0,topic:"Data"},
      {q:"What does fetch() do in JavaScript?",opts:["Fetches DOM","Makes HTTP requests to APIs","Loops over array","None"],ans:1,topic:"Async"},
      {q:"What is a React component?",opts:["CSS class","Reusable UI building block","Database","None"],ans:1,topic:"React"},
      {q:"What is useState in React?",opts:["Route hook","Hook for managing component state","API hook","None"],ans:1,topic:"React"},
      {q:"What is useEffect in React?",opts:["State hook","Runs side effects after render (API calls, subscriptions)","Style hook","None"],ans:1,topic:"React"},
      {q:"What are props in React?",opts:["State variables","Read-only data passed from parent to child","CSS properties","None"],ans:1,topic:"React"},
      {q:"What is Flexbox used for?",opts:["Animations","1D layout (row or column) for arranging items","Database","None"],ans:1,topic:"CSS"},
      {q:"What is CSS Grid?",opts:["Table replacement","2D layout system for rows and columns","Flex alternative only","None"],ans:1,topic:"CSS"},
      {q:"What is responsive design?",opts:["Fast loading","Design that adapts to different screen sizes","Animated design","None"],ans:1,topic:"Responsive"},
      {q:"What is CORS?",opts:["Code Origin Resource System","Cross-Origin Resource Sharing — browser security policy","None","Custom Origin"],ans:1,topic:"Web Security"},
    ],
    advanced:[
      {q:"What is the Virtual DOM in React?",opts:["Actual DOM","In-memory DOM representation React uses to diff and update efficiently","Database","None"],ans:1,topic:"React"},
      {q:"What is React reconciliation?",opts:["State management","Process of comparing Virtual DOM trees and updating real DOM","Routing","None"],ans:1,topic:"React"},
      {q:"What is useCallback hook?",opts:["State hook","Memoizes function reference to prevent unnecessary re-renders","Router hook","None"],ans:1,topic:"React"},
      {q:"What is useMemo hook?",opts:["Stores state","Memoizes computed value to avoid expensive recalculation","Router","None"],ans:1,topic:"React"},
      {q:"What is code splitting in React?",opts:["Splitting CSS files","Lazy loading parts of app to reduce initial bundle size","None","Splitting components"],ans:1,topic:"Performance"},
      {q:"What is a Service Worker?",opts:["Backend worker","Script running in background enabling offline/PWA features","Database","None"],ans:1,topic:"PWA"},
      {q:"What is WebSocket?",opts:["HTTP request","Full-duplex real-time communication protocol","Database","None"],ans:1,topic:"Real-time"},
      {q:"What is Tree Shaking?",opts:["CSS technique","Removing unused code from bundle during build","DOM manipulation","None"],ans:1,topic:"Build"},
      {q:"What is SSR (Server Side Rendering)?",opts:["CSS rendering","HTML generated on server before sending to client","None","Client rendering"],ans:1,topic:"Architecture"},
      {q:"What is CSR vs SSR?",opts:["Same","CSR renders in browser, SSR renders on server — SSR better for SEO","CSR is server","None"],ans:1,topic:"Architecture"},
      {q:"What is hydration in Next.js?",opts:["Adding water","Attaching React event handlers to server-rendered HTML","SSR only","None"],ans:1,topic:"Next.js"},
      {q:"What is a Web Worker?",opts:["Backend API","Runs JavaScript in background thread without blocking UI","Database","None"],ans:1,topic:"Performance"},
      {q:"What is the event loop in JavaScript?",opts:["For loop","Mechanism handling async code — call stack + task queue","None","DOM loop"],ans:1,topic:"JavaScript Engine"},
      {q:"What is debouncing?",opts:["Error handling","Delaying function execution until user stops triggering it","None","Caching"],ans:1,topic:"Performance"},
      {q:"What is throttling?",opts:["Caching","Limiting function call rate to at most once per interval","None","Error handling"],ans:1,topic:"Performance"},
      {q:"What is a Higher Order Component (HOC)?",opts:["CSS component","Function taking component and returning enhanced component","None","Hook"],ans:1,topic:"React Patterns"},
      {q:"What is Context API?",opts:["CSS variables","React way to pass data through component tree without prop drilling","None","Router"],ans:1,topic:"React"},
      {q:"What is Webpack?",opts:["Testing tool","Module bundler that bundles JS/CSS/assets for browser","Database","None"],ans:1,topic:"Build Tools"},
      {q:"What is memoization in React context?",opts:["Memory error","Caching component render to skip re-render if props unchanged","None","State"],ans:1,topic:"Performance"},
      {q:"What is the difference between controlled and uncontrolled components?",opts:["Same","Controlled: React manages state. Uncontrolled: DOM manages state","Uncontrolled: React manages","None"],ans:1,topic:"React"},
    ],
  },
  c4:{
    basic:[
      {q:"What is an array?",opts:["Key-value store","Fixed-size collection of same-type elements","Dynamic list","Tree"],ans:1,topic:"Arrays"},
      {q:"What is the time complexity of accessing array element by index?",opts:["O(n)","O(log n)","O(1)","O(n²)"],ans:2,topic:"Arrays"},
      {q:"What is a stack?",opts:["FIFO structure","LIFO structure","Sorted list","Tree"],ans:1,topic:"Stack"},
      {q:"What is a queue?",opts:["LIFO structure","FIFO structure","Sorted array","None"],ans:1,topic:"Queue"},
      {q:"What is a linked list?",opts:["Array with pointers","Nodes connected by pointers","Sorted array","None"],ans:1,topic:"Linked List"},
      {q:"What is linear search?",opts:["Checks middle first","Checks each element one by one","Binary method","None"],ans:1,topic:"Searching"},
      {q:"What is the time complexity of linear search?",opts:["O(1)","O(log n)","O(n)","O(n²)"],ans:2,topic:"Searching"},
      {q:"What is binary search?",opts:["Searches all elements","Divides sorted array in half each step","Random search","None"],ans:1,topic:"Searching"},
      {q:"Binary search requires array to be?",opts:["Unsorted","Sorted","Any order","Empty"],ans:1,topic:"Searching"},
      {q:"What is bubble sort?",opts:["Divides array","Repeatedly swaps adjacent elements if out of order","Selects minimum","None"],ans:1,topic:"Sorting"},
      {q:"What is the worst case of bubble sort?",opts:["O(n log n)","O(n)","O(n²)","O(1)"],ans:2,topic:"Sorting"},
      {q:"What is a tree?",opts:["Array","Hierarchical data structure with nodes and edges","Linked list","None"],ans:1,topic:"Trees"},
      {q:"What is a binary tree?",opts:["Two arrays","Each node has at most 2 children","Linked list","None"],ans:1,topic:"Trees"},
      {q:"What is the root of a tree?",opts:["Last node","Topmost node","Leaf node","None"],ans:1,topic:"Trees"},
      {q:"What is a leaf node?",opts:["Root node","Node with no children","Middle node","None"],ans:1,topic:"Trees"},
      {q:"What is recursion?",opts:["For loop","Function calling itself","While loop","None"],ans:1,topic:"Recursion"},
      {q:"What is the base case in recursion?",opts:["First call","Condition that stops recursion","Middle call","None"],ans:1,topic:"Recursion"},
      {q:"What is a hash table?",opts:["Sorted array","Key-value store using hash function for O(1) lookup","Tree","None"],ans:1,topic:"Hashing"},
      {q:"What is a graph?",opts:["Chart","Non-linear structure with vertices and edges","Array","None"],ans:1,topic:"Graphs"},
      {q:"What is BFS?",opts:["Binary First Search","Breadth-First Search — explores level by level","None","Depth search"],ans:1,topic:"Graphs"},
    ],
    intermediate:[
      {q:"What is the time complexity of binary search?",opts:["O(n)","O(log n)","O(n²)","O(1)"],ans:1,topic:"Searching"},
      {q:"What is merge sort's time complexity?",opts:["O(n²)","O(n log n) always","O(n)","O(log n)"],ans:1,topic:"Sorting"},
      {q:"What is quick sort's average time complexity?",opts:["O(n²)","O(n log n)","O(n)","O(log n)"],ans:1,topic:"Sorting"},
      {q:"What is a BST (Binary Search Tree)?",opts:["Random binary tree","Left < root < right property","Balanced tree","None"],ans:1,topic:"Trees"},
      {q:"What is inorder traversal of BST?",opts:["Random order","Sorted ascending order","Reverse sorted","None"],ans:1,topic:"Trees"},
      {q:"What is the height of a balanced BST with n nodes?",opts:["O(n)","O(log n)","O(n²)","O(1)"],ans:1,topic:"Trees"},
      {q:"What data structure does BFS use?",opts:["Stack","Queue","Array","Heap"],ans:1,topic:"Graphs"},
      {q:"What data structure does DFS use?",opts:["Queue","Stack","Array","Heap"],ans:1,topic:"Graphs"},
      {q:"What is a heap?",opts:["Random tree","Complete binary tree with heap property","Sorted array","None"],ans:1,topic:"Trees"},
      {q:"What is a min-heap?",opts:["Max at root","Min at root, parent ≤ children","Random","None"],ans:1,topic:"Trees"},
      {q:"What is collision in hashing?",opts:["Key not found","Two keys map to same bucket","Table overflow","None"],ans:1,topic:"Hashing"},
      {q:"What is chaining in hash tables?",opts:["Linked chains","Handling collisions using linked list at each bucket","None","Array"],ans:1,topic:"Hashing"},
      {q:"What is a doubly linked list?",opts:["Two lists","Each node has next and prev pointers","None","Circular list"],ans:1,topic:"Linked List"},
      {q:"What is a circular linked list?",opts:["Loop array","Last node points back to first node","Two heads","None"],ans:1,topic:"Linked List"},
      {q:"What is the two-pointer technique?",opts:["Using two arrays","Using two indices to solve array/string problems efficiently","None","Two loops"],ans:1,topic:"Techniques"},
      {q:"What is the sliding window technique?",opts:["Animation","Maintaining a window that slides to solve subarray problems in O(n)","Two pointers","None"],ans:1,topic:"Techniques"},
      {q:"What is a priority queue?",opts:["Ordered queue","Queue where elements have priority — highest served first","FIFO queue","None"],ans:1,topic:"Data Structures"},
      {q:"What is a trie?",opts:["Tree for numbers","Prefix tree for efficient string searching","Hash table","None"],ans:1,topic:"Advanced DS"},
      {q:"What is topological sort?",opts:["Random sort","Linear ordering of DAG vertices such that edge u→v means u before v","None","BFS variant"],ans:1,topic:"Graphs"},
      {q:"What is cycle detection in a graph?",opts:["Finding shortest path","Finding if graph contains a cycle","Sorting","None"],ans:1,topic:"Graphs"},
    ],
    advanced:[
      {q:"What is dynamic programming?",opts:["Procedural programming","Optimization technique: break into subproblems, cache results","None","Greedy"],ans:1,topic:"DP"},
      {q:"What is memoization vs tabulation?",opts:["Same","Memoization: top-down with cache. Tabulation: bottom-up with table","Tabulation is top-down","None"],ans:1,topic:"DP"},
      {q:"What is the 0/1 Knapsack problem?",opts:["Shortest path","Choose items with max value within weight limit — DP solution","None","Graph problem"],ans:1,topic:"DP"},
      {q:"What is LCS?",opts:["Longest Common Substring","Longest Common Subsequence — characters in same order but not necessarily contiguous","None","Shortest path"],ans:1,topic:"DP"},
      {q:"What is the greedy algorithm approach?",opts:["Always optimal","Make locally optimal choice at each step — works when local=global optimum","None","Always fails"],ans:1,topic:"Greedy"},
      {q:"What is Dijkstra's algorithm?",opts:["MST algorithm","Greedy shortest path from source to all vertices (non-negative weights)","DFS variant","None"],ans:1,topic:"Graphs"},
      {q:"What is Bellman-Ford vs Dijkstra?",opts:["Same","Bellman-Ford handles negative weights, Dijkstra doesn't","Dijkstra handles negative","None"],ans:1,topic:"Graphs"},
      {q:"What is Kruskal's algorithm?",opts:["Shortest path","Greedy MST algorithm — pick edges in order of weight, skip if cycle","None","BFS"],ans:1,topic:"Graphs"},
      {q:"What is Union-Find / Disjoint Set?",opts:["Sorting algorithm","Data structure for tracking connected components — efficient union/find","None","Graph traversal"],ans:1,topic:"Advanced DS"},
      {q:"What is a segment tree?",opts:["Binary tree for sorting","Tree for range queries and point updates in O(log n)","Hash table","None"],ans:1,topic:"Advanced DS"},
      {q:"What is a Fenwick tree (BIT)?",opts:["Balanced BST","Binary Indexed Tree for efficient prefix sum queries/updates","None","Segment tree"],ans:1,topic:"Advanced DS"},
      {q:"What is Floyd-Warshall?",opts:["Single-source shortest path","All-pairs shortest paths using DP — O(V³)","MST","None"],ans:1,topic:"Graphs"},
      {q:"What is backtracking?",opts:["Greedy approach","Try all possibilities, undo (backtrack) on failure — N-Queens, Sudoku","None","DP"],ans:1,topic:"Backtracking"},
      {q:"What is the time complexity of heap sort?",opts:["O(n²)","O(n log n)","O(n)","O(log n)"],ans:1,topic:"Sorting"},
      {q:"What is amortized analysis?",opts:["Worst case only","Average cost per operation over a sequence of operations","Best case only","None"],ans:1,topic:"Complexity"},
      {q:"What is a balanced BST and why important?",opts:["Random BST","Height O(log n) guaranteed — AVL/Red-Black tree — prevents O(n) operations","None","Sorted array"],ans:1,topic:"Trees"},
      {q:"What is the master theorem?",opts:["Algorithm","Formula for solving divide-and-conquer recurrences to find time complexity","Sorting method","None"],ans:1,topic:"Complexity"},
      {q:"What is KMP algorithm?",opts:["Graph algorithm","Knuth-Morris-Pratt: O(n+m) string matching using failure function","Sorting","None"],ans:1,topic:"String Algorithms"},
      {q:"What is a monotonic stack?",opts:["Sorted stack","Stack maintaining monotonic order — used for next greater element","None","Priority queue"],ans:1,topic:"Techniques"},
      {q:"What is bitmasking in DP?",opts:["Bit operations only","Using bits to represent subsets in DP — exponential states to bitmask","None","None"],ans:1,topic:"Advanced DP"},
    ],
  },
  c5:{
    basic:[
      {q:"What does HTTPS 'S' stand for?",opts:["Simple","Secure","Static","Standard"],ans:1,topic:"Networking"},
      {q:"What is a firewall?",opts:["Speed booster","Network traffic filter based on rules","Virus remover","None"],ans:1,topic:"Networking"},
      {q:"What is an IP address?",opts:["Internet Password","Unique identifier for device on network","Website name","Email"],ans:1,topic:"Networking"},
      {q:"What does DNS do?",opts:["Encrypts data","Translates domain names to IP addresses","Blocks attacks","None"],ans:1,topic:"Networking"},
      {q:"What is a VPN?",opts:["Virus Protection Network","Virtual Private Network — encrypts and tunnels traffic","Speed booster","None"],ans:1,topic:"Networking"},
      {q:"What is phishing?",opts:["Physical attack","Fake communications to trick users into revealing credentials","DDoS","Malware"],ans:1,topic:"Social Engineering"},
      {q:"What is malware?",opts:["Good software","Malicious software designed to damage or gain access","Update","None"],ans:1,topic:"Threats"},
      {q:"What is a virus in cybersecurity?",opts:["Hardware fault","Self-replicating malicious program","Network error","None"],ans:1,topic:"Threats"},
      {q:"What does authentication mean?",opts:["Authorization","Verifying who someone is","Encrypting data","None"],ans:1,topic:"Security Basics"},
      {q:"What is a strong password?",opts:["Short and simple","Mix of uppercase, lowercase, numbers, symbols — 12+ chars","Only numbers","Name only"],ans:1,topic:"Security Basics"},
      {q:"What is 2FA (Two-Factor Authentication)?",opts:["Two passwords","Two different verification methods — e.g. password + OTP","Two usernames","None"],ans:1,topic:"Authentication"},
      {q:"What is encryption?",opts:["Deleting data","Converting data to unreadable form using a key","Compressing data","None"],ans:1,topic:"Cryptography"},
      {q:"What does SSL do?",opts:["Speeds connection","Encrypts data between browser and server","Compresses files","None"],ans:1,topic:"Cryptography"},
      {q:"What is a port in networking?",opts:["Physical connector only","Logical endpoint for specific service — e.g. port 80=HTTP","None","Router"],ans:1,topic:"Networking"},
      {q:"What is HTTP status 404?",opts:["Server error","Not found","Success","Redirect"],ans:1,topic:"Web"},
      {q:"What is a cookie?",opts:["Malware","Small data stored by browser from website","None","Password"],ans:1,topic:"Web"},
      {q:"What is social engineering?",opts:["Software attack","Manipulating people psychologically to reveal info","Hardware attack","None"],ans:1,topic:"Social Engineering"},
      {q:"What is a DDoS attack?",opts:["Database attack","Overwhelming server with traffic from many sources","Phishing","None"],ans:1,topic:"Attacks"},
      {q:"What is the purpose of antivirus software?",opts:["Speeds up PC","Detects and removes malicious software","Backs up data","None"],ans:1,topic:"Defense"},
      {q:"What does CIA triad stand for in security?",opts:["Confidentiality Integrity Availability","Computer Internet Access","None","Common Internet Attacks"],ans:0,topic:"Security Basics"},
    ],
    intermediate:[
      {q:"What is SQL injection?",opts:["Server crash","Inserting malicious SQL to manipulate database queries","Network flood","XSS"],ans:1,topic:"Web Attacks"},
      {q:"What is XSS (Cross-Site Scripting)?",opts:["Server attack","Injecting malicious scripts into web pages viewed by others","SQL injection","None"],ans:1,topic:"Web Attacks"},
      {q:"What is CSRF?",opts:["Server error","Cross-Site Request Forgery — tricks authenticated user into unwanted action","XSS","None"],ans:0,topic:"Web Attacks"},
      {q:"What is a Man-in-the-Middle attack?",opts:["Physical attack","Attacker intercepts communication between two parties","DDoS","None"],ans:1,topic:"Network Attacks"},
      {q:"What is port scanning?",opts:["Physical scan","Finding open ports on target system — used in reconnaissance","None","Encryption"],ans:1,topic:"Reconnaissance"},
      {q:"What is Nmap used for?",opts:["Code editing","Network discovery and security scanning","Password cracking","None"],ans:1,topic:"Tools"},
      {q:"What is Burp Suite?",opts:["Code editor","Web application security testing proxy tool","Network scanner","None"],ans:1,topic:"Tools"},
      {q:"What does the OSI model describe?",opts:["Programming languages","7-layer framework for network communication","None","Encryption"],ans:1,topic:"Networking"},
      {q:"What is symmetric encryption?",opts:["Different keys each way","Same key for encryption and decryption","No key needed","None"],ans:1,topic:"Cryptography"},
      {q:"What is asymmetric encryption?",opts:["Same key","Public key encrypts, private key decrypts","No key","None"],ans:1,topic:"Cryptography"},
      {q:"What is a hash function?",opts:["Reversible encryption","One-way function producing fixed-size output","Two-way cipher","None"],ans:1,topic:"Cryptography"},
      {q:"What is MD5?",opts:["Encryption algorithm","Hashing algorithm (now considered weak)","Firewall","None"],ans:1,topic:"Cryptography"},
      {q:"What is a rainbow table attack?",opts:["Color attack","Pre-computed hash lookup table to crack passwords","DDoS","None"],ans:1,topic:"Attacks"},
      {q:"What is privilege escalation?",opts:["Upgrading software","Gaining higher access rights than intended","None","User creation"],ans:1,topic:"Exploitation"},
      {q:"What is a reverse shell?",opts:["Backwards SSH","Target machine connects back to attacker giving shell access","None","Normal shell"],ans:1,topic:"Exploitation"},
      {q:"What is CTF?",opts:["Code The Flag","Capture The Flag — cybersecurity competition solving challenges","Cyber Task Force","None"],ans:1,topic:"CTF"},
      {q:"What is Wireshark?",opts:["Code editor","Network packet analyzer","Password cracker","None"],ans:1,topic:"Tools"},
      {q:"What is a zero-day vulnerability?",opts:["Old bug","Unknown vulnerability with no patch yet available","Fixed bug","None"],ans:1,topic:"Vulnerabilities"},
      {q:"What is penetration testing?",opts:["Speed test","Authorized simulated attack to find security weaknesses","Database test","None"],ans:1,topic:"Pen Testing"},
      {q:"What is an IDS/IPS?",opts:["Internet Download System","Intrusion Detection/Prevention System — monitors for attacks","None","Firewall"],ans:1,topic:"Defense"},
    ],
    advanced:[
      {q:"What is buffer overflow?",opts:["Memory error","Writing beyond allocated buffer to overwrite adjacent memory — can execute code","None","Array error"],ans:1,topic:"Exploitation"},
      {q:"What is ROP (Return Oriented Programming)?",opts:["Remote operations","Exploitation technique chaining existing code gadgets to bypass defenses","None","Router"],ans:1,topic:"Binary Exploitation"},
      {q:"What is ASLR?",opts:["Attack Surface","Address Space Layout Randomization — randomizes memory addresses to prevent exploitation","None","Algorithm"],ans:1,topic:"Defense Mechanisms"},
      {q:"What is DEP/NX?",opts:["Network extension","Data Execution Prevention — marks memory regions non-executable","None","Encryption"],ans:1,topic:"Defense Mechanisms"},
      {q:"What is heap spraying?",opts:["Memory cleaning","Filling heap with shellcode to increase exploitation reliability","None","Optimization"],ans:1,topic:"Binary Exploitation"},
      {q:"What is format string vulnerability?",opts:["String error","Improper use of printf-like functions allowing memory read/write","None","SQL injection"],ans:1,topic:"Exploitation"},
      {q:"What is a Use-After-Free vulnerability?",opts:["Old pointer","Using memory after it's been freed — can lead to code execution","None","Buffer overflow"],ans:1,topic:"Binary Exploitation"},
      {q:"What is fuzzing?",opts:["Blurring data","Automated testing with random inputs to find crashes/vulnerabilities","None","Encryption"],ans:1,topic:"Testing"},
      {q:"What is OWASP Top 10?",opts:["10 programming languages","List of 10 most critical web application security risks","None","10 tools"],ans:1,topic:"Web Security"},
      {q:"What is JWT (JSON Web Token)?",opts:["JavaScript tool","Compact token for securely transmitting claims between parties","None","JSON format"],ans:1,topic:"Authentication"},
      {q:"What is OAuth?",opts:["Password protocol","Authorization framework allowing third-party limited access without sharing credentials","None","Encryption"],ans:1,topic:"Authentication"},
      {q:"What is SSRF?",opts:["Server Speed","Server-Side Request Forgery — server makes requests to unintended locations","None","SQL attack"],ans:1,topic:"Web Attacks"},
      {q:"What is XXE injection?",opts:["CSS attack","XML External Entity — exploiting XML parsers to read files or SSRF","None","SQL injection"],ans:1,topic:"Web Attacks"},
      {q:"What is IDOR?",opts:["Internal Design","Insecure Direct Object Reference — accessing objects without authorization check","None","Attack type"],ans:1,topic:"Web Attacks"},
      {q:"What is subdomain enumeration?",opts:["DNS attack","Finding subdomains of target for expanded attack surface","None","Port scan"],ans:1,topic:"Reconnaissance"},
      {q:"What is a polyglot payload?",opts:["Multi-language code","Payload valid in multiple contexts to bypass filters","None","Hash"],ans:1,topic:"Advanced Web"},
      {q:"What is timing attack?",opts:["DDoS variant","Side-channel attack measuring execution time to extract secrets","None","Brute force"],ans:1,topic:"Side-channel"},
      {q:"What is LDAP injection?",opts:["SQL variant","Injecting LDAP statements to manipulate directory service queries","None","XSS"],ans:1,topic:"Injection"},
      {q:"What is a canary in binary exploitation?",opts:["Bird code","Random value placed before return address to detect stack smashing","None","Pointer"],ans:1,topic:"Defense Mechanisms"},
      {q:"What is CVE?",opts:["Common Vulnerability Entry","Common Vulnerabilities and Exposures — public database of known vulnerabilities","None","Code version"],ans:1,topic:"Vulnerability Management"},
    ],
  },
  c6:{
    basic:[
      {q:"What is time complexity?",opts:["Code length","How runtime grows with input size","Memory used","None"],ans:1,topic:"Complexity"},
      {q:"What does O(1) mean?",opts:["Linear time","Constant time — doesn't grow with input","Quadratic","None"],ans:1,topic:"Complexity"},
      {q:"What does O(n) mean?",opts:["Constant","Linear — grows proportionally with input","Quadratic","None"],ans:1,topic:"Complexity"},
      {q:"What is a competitive programming contest?",opts:["Game","Timed problem-solving with algorithmic challenges","Hackathon","None"],ans:1,topic:"CP Basics"},
      {q:"What is brute force approach?",opts:["Optimal solution","Try all possibilities to find answer","Greedy","None"],ans:1,topic:"Problem Solving"},
      {q:"What language is most popular for CP?",opts:["Python","C++ (fastest runtime, STL)","Java","JavaScript"],ans:1,topic:"CP Basics"},
      {q:"What is a greedy algorithm?",opts:["Always tries all options","Makes locally optimal choice at each step","Uses DP","None"],ans:1,topic:"Greedy"},
      {q:"What is divide and conquer?",opts:["Greedy approach","Break problem into subproblems, solve, combine","DP","None"],ans:1,topic:"Divide & Conquer"},
      {q:"What is binary search on answer?",opts:["Searching array","Applying binary search on the answer space (minimize/maximize)","None","None"],ans:1,topic:"Binary Search"},
      {q:"What is prefix sum?",opts:["First element","Precomputed array where each element is sum of all previous — O(1) range sum","None","None"],ans:1,topic:"Techniques"},
      {q:"What is BFS used for in CP?",opts:["Sorting","Shortest path in unweighted graph, level traversal","None","None"],ans:1,topic:"Graphs"},
      {q:"What is DFS used for?",opts:["Shortest path","Exploring all paths, cycle detection, connected components","None","None"],ans:1,topic:"Graphs"},
      {q:"What is a stack overflow in recursion?",opts:["Array error","Too deep recursion exceeding call stack limit","Compilation error","None"],ans:1,topic:"Recursion"},
      {q:"What is modular arithmetic?",opts:["Module system","Arithmetic with remainder — (a+b)%m used in large number problems","None","None"],ans:1,topic:"Math"},
      {q:"What is GCD?",opts:["Greatest Common Divisor","General Code Design","None","None"],ans:0,topic:"Math"},
      {q:"What is Codeforces?",opts:["Code editor","Competitive programming platform with contests","Social network","None"],ans:1,topic:"Platforms"},
      {q:"What is a time limit in CP?",opts:["Time to read problem","Maximum execution time allowed for solution","None","None"],ans:1,topic:"CP Basics"},
      {q:"What is a TLE verdict?",opts:["Wrong answer","Time Limit Exceeded — solution too slow","Compilation error","None"],ans:1,topic:"CP Basics"},
      {q:"What is a segment in array problems?",opts:["Variable","Contiguous subarray or range","None","None"],ans:1,topic:"Techniques"},
      {q:"What is two sum problem?",opts:["Adding numbers","Find two elements summing to target — O(n) with hashmap","None","None"],ans:1,topic:"Problems"},
    ],
    intermediate:[
      {q:"What is O(n log n) complexity example?",opts:["Bubble sort","Merge sort, quick sort average","Binary search","Hashing"],ans:1,topic:"Complexity"},
      {q:"What is the sliding window technique?",opts:["Animation","Maintain window of elements, slide to avoid O(n²)","Two loops","None"],ans:1,topic:"Techniques"},
      {q:"What is two pointers technique?",opts:["Two arrays","Two indices moving toward each other or same direction to solve in O(n)","None","Two loops"],ans:1,topic:"Techniques"},
      {q:"What is memoization in DP?",opts:["Memory error","Top-down DP — cache results of subproblems to avoid recomputation","None","Tabulation"],ans:1,topic:"DP"},
      {q:"What is tabulation in DP?",opts:["Table design","Bottom-up DP — fill DP table iteratively","None","Memoization"],ans:1,topic:"DP"},
      {q:"What is Dijkstra's algorithm for?",opts:["MST","Single-source shortest path with non-negative weights","Sorting","None"],ans:1,topic:"Graphs"},
      {q:"What is a priority queue used for in Dijkstra?",opts:["Sorting edges","Efficiently get next minimum distance vertex","None","BFS"],ans:1,topic:"Graphs"},
      {q:"What is a spanning tree?",opts:["Random tree","Subgraph connecting all vertices with minimum edges","None","Full graph"],ans:1,topic:"Graphs"},
      {q:"What is Kruskal's vs Prim's?",opts:["Same","Both find MST — Kruskal edge-based, Prim vertex-based","Different problems","None"],ans:1,topic:"Graphs"},
      {q:"What is the coin change problem?",opts:["Money problem","Classic DP: minimum coins to make amount","Greedy only","None"],ans:1,topic:"DP"},
      {q:"What is LIS (Longest Increasing Subsequence)?",opts:["Longest In Sequence","DP problem: find longest strictly increasing subsequence — O(n log n)","None","None"],ans:1,topic:"DP"},
      {q:"What is a sparse table?",opts:["Empty table","Data structure for O(1) range minimum/maximum queries after O(n log n) preprocessing","None","Array"],ans:1,topic:"Advanced DS"},
      {q:"What is binary lifting?",opts:["Array technique","Precomputing ancestors at powers of 2 for LCA and path queries","None","None"],ans:1,topic:"Trees"},
      {q:"What is a bipartite graph?",opts:["Two components","Graph whose vertices can be 2-colored with no same-color edge","None","None"],ans:1,topic:"Graphs"},
      {q:"What is cycle detection with DSU?",opts:["BFS","Union-Find: if two vertices in same component have edge — cycle exists","DFS only","None"],ans:1,topic:"Graphs"},
      {q:"What is Euler's path?",opts:["Shortest path","Path visiting every edge exactly once","None","MST"],ans:1,topic:"Graphs"},
      {q:"What is SCC (Strongly Connected Component)?",opts:["Single node","Maximal set of vertices mutually reachable — Kosaraju's/Tarjan's","None","Bipartite"],ans:1,topic:"Graphs"},
      {q:"What is coordinate compression?",opts:["Math compression","Mapping large values to small range to use as array indices","None","None"],ans:1,topic:"Techniques"},
      {q:"What is the meet-in-the-middle technique?",opts:["Two pointer","Split problem into halves, solve each, combine — reduces O(2^n) to O(2^(n/2))","None","DP"],ans:1,topic:"Techniques"},
      {q:"What is randomized algorithm?",opts:["Random solution","Algorithm using randomness to improve average performance (e.g. quicksort pivot)","None","Brute force"],ans:1,topic:"Algorithms"},
    ],
    advanced:[
      {q:"What is Heavy-Light Decomposition (HLD)?",opts:["Graph technique","Tree decomposition into chains for O(log²n) path queries","None","None"],ans:1,topic:"Advanced Trees"},
      {q:"What is Centroid Decomposition?",opts:["Tree center","Recursively decompose tree at centroid for path/distance problems","None","None"],ans:1,topic:"Advanced Trees"},
      {q:"What is a Persistent Segment Tree?",opts:["Saved tree","Segment tree with version history — O(log n) per update, access any version","None","None"],ans:1,topic:"Advanced DS"},
      {q:"What is sqrt decomposition?",opts:["Math operation","Divide array into √n blocks for O(√n) query/update tradeoff","None","None"],ans:1,topic:"Advanced DS"},
      {q:"What is the Z-algorithm?",opts:["Sorting","For each position, find longest match with string prefix — O(n) string matching","None","None"],ans:1,topic:"String Algorithms"},
      {q:"What is Aho-Corasick algorithm?",opts:["Sorting","Multi-pattern string matching using automaton — O(n+m+k) total","None","None"],ans:1,topic:"String Algorithms"},
      {q:"What is Suffix Array?",opts:["Array suffix","Sorted array of all suffixes — enables O(log n) pattern search","None","None"],ans:1,topic:"String Algorithms"},
      {q:"What is the Convex Hull Trick in DP?",opts:["Geometry trick","Optimization for DP with linear transitions — reduces to O(n) using convex hull","None","None"],ans:1,topic:"Advanced DP"},
      {q:"What is divide and conquer DP optimization?",opts:["D&C sorting","For DP where opt[i][j] ≤ opt[i][j+1] — reduces O(n²) to O(n log n)","None","None"],ans:1,topic:"Advanced DP"},
      {q:"What is Knuth's optimization?",opts:["Sorting","DP optimization when opt[i][j-1] ≤ opt[i][j] ≤ opt[i+1][j] — O(n²) to O(n²) with smaller constant","None","None"],ans:1,topic:"Advanced DP"},
      {q:"What is max flow / min cut?",opts:["Graph weight","Maximum flow through network = minimum cut capacity (Ford-Fulkerson, Dinic's)","None","MST"],ans:1,topic:"Flows"},
      {q:"What is Dinic's algorithm?",opts:["Simple BFS","Efficient max flow — O(V²E), faster on unit capacity graphs","None","None"],ans:1,topic:"Flows"},
      {q:"What is bipartite matching?",opts:["Graph coloring","Maximum matching in bipartite graph — applications in assignment problems","None","None"],ans:1,topic:"Flows"},
      {q:"What is the Hungarian algorithm?",opts:["Origin algorithm","Solves assignment problem (min cost max matching) in O(n³)","None","None"],ans:1,topic:"Flows"},
      {q:"What is a Lichao tree?",opts:["Tree type","Segment tree variant for line minimization queries in CHT","None","None"],ans:1,topic:"Advanced DS"},
      {q:"What is matrix exponentiation?",opts:["Math operation","Compute matrix^n in O(k³ log n) — used for linear recurrences in DP","None","None"],ans:1,topic:"Math"},
      {q:"What is the inclusion-exclusion principle?",opts:["Math rule","Count elements in union using alternating sum of intersections","None","None"],ans:1,topic:"Math"},
      {q:"What is Mo's algorithm?",opts:["Greedy","Offline range query algorithm using sqrt ordering — O((n+q)√n)","None","None"],ans:1,topic:"Advanced Techniques"},
      {q:"What is a treap?",opts:["Tree type","BST + heap combined — randomized balanced BST with O(log n) expected operations","None","None"],ans:1,topic:"Advanced DS"},
      {q:"What is the sprague-grundy theorem?",opts:["Game theory","Any impartial game position has Grundy value; XOR of Grundy values determines winner","None","None"],ans:1,topic:"Game Theory"},
    ],
  },
};

const LEVEL_INFO = {
  basic:   {label:"Basic",     color:T.success, icon:"🟢", desc:"Fundamental concepts — start here"},
  intermediate:{label:"Intermediate",color:T.amber,  icon:"🟡", desc:"Core skills — ready for interviews"},
  advanced:{label:"Advanced",  color:T.pink,   icon:"🔴", desc:"Expert level — for pro competitions"},
};

// ================================================================
//  QUIZ HELPER — Save attempt to Firestore
// ================================================================
async function saveQuizAttempt(uid, courseId, level, score, total, answers){
  try{
    const attemptRef = collection(db, "quiz_attempts");
    await addDoc(attemptRef, {
      uid, courseId, level, score, total,
      pct: Math.round((score/total)*100),
      answers,
      completedAt: serverTimestamp(),
    });
    // Also update best score in user progress
    const progressRef = doc(db, "quiz_progress", uid);
    const snap = await getDoc(progressRef);
    const existing = snap.exists() ? snap.data() : {};
    const key = `${courseId}_${level}`;
    const prev = existing[key] || {best:0, attempts:0};
    const newBest = Math.max(prev.best, Math.round((score/total)*100));
    await setDoc(progressRef, {...existing, [key]:{best:newBest, attempts:(prev.attempts||0)+1, lastScore:Math.round((score/total)*100)}}, {merge:true});
  }catch(e){}
}

// ================================================================
//  QUIZ PAGE — Full pro version
// ================================================================
function QuizPage({user,courses,setPage}){
  const [view,setView]=useState("courses"); // courses | levels | quiz | results | history
  const [selCourse,setSelCourse]=useState(null);
  const [selLevel,setSelLevel]=useState(null);
  const [allQs,setAllQs]=useState([]);
  const [qIdx,setQIdx]=useState(0);
  const [selected,setSelected]=useState(null);
  const [score,setScore]=useState(0);
  const [answers,setAnswers]=useState([]);
  const [loading,setLoading]=useState(false);
  const [userProgress,setUserProgress]=useState({});
  const [history,setHistory]=useState([]);
  const [startTime,setStartTime]=useState(null);
  const [elapsed,setElapsed]=useState(0);
  const [timerRef,setTimerRef]=useState(null);

  // Load user quiz progress
  useEffect(()=>{
    if(!user)return;
    const unsub=onSnapshot(doc(db,"quiz_progress",user.uid),snap=>{
      if(snap.exists())setUserProgress(snap.data());
    },()=>{});
    return unsub;
  },[user?.uid]);

  async function selectLevel(course, level){
    if(!user){setPage("login");return;}
    setLoading(true);
    const staticQs=(STATIC_QUIZ[course.id]||{})[level]||[];
    try{
      const snap=await getDocs(query(collection(db,"quiz_questions"),
        where("courseId","==",course.id),where("level","==",level)));
      const adminQs=snap.docs.map(d=>d.data());
      const combined=[...staticQs,...adminQs];
      // Shuffle questions
      const shuffled=[...combined].sort(()=>Math.random()-0.5);
      setAllQs(shuffled);
    }catch{setAllQs([...staticQs].sort(()=>Math.random()-0.5));}
    setSelCourse(course);setSelLevel(level);
    setQIdx(0);setSelected(null);setScore(0);setAnswers([]);
    setStartTime(Date.now());setElapsed(0);
    setView("quiz");setLoading(false);
    // Start timer
    const interval=setInterval(()=>setElapsed(e=>e+1),1000);
    setTimerRef(interval);
  }

  function pick(i){
    if(selected!==null)return;
    setSelected(i);
    const isCorrect=allQs[qIdx].ans===i;
    if(isCorrect)setScore(s=>s+1);
    setAnswers(a=>[...a,{
      q:allQs[qIdx].q,opts:allQs[qIdx].opts,
      selected:i,correct:allQs[qIdx].ans,
      isCorrect,topic:allQs[qIdx].topic||""
    }]);
  }

  function next(){
    if(qIdx+1>=allQs.length){
      clearInterval(timerRef);
      const finalScore=score+(selected!==null&&allQs[qIdx].ans===selected?0:0);
      if(user)saveQuizAttempt(user.uid,selCourse.id,selLevel,score,allQs.length,answers);
      setView("results");
    }else{setQIdx(i=>i+1);setSelected(null);}
  }

  function reset(){
    clearInterval(timerRef);
    setView("courses");setSelCourse(null);setSelLevel(null);
    setAllQs([]);setQIdx(0);setSelected(null);setScore(0);setAnswers([]);setElapsed(0);
  }

  const pct=allQs.length>0?Math.round((score/allQs.length)*100):0;
  const grade=pct>=90?"🏆 Perfect!":pct>=75?"🥇 Excellent!":pct>=60?"✅ Good Work!":pct>=40?"📚 Keep Practicing!":"💪 Don't Give Up!";
  const gradeColor=pct>=75?T.success:pct>=60?T.accent:pct>=40?T.amber:T.pink;
  const fmtTime=s=>`${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  // ── COURSE SELECTION ──
  if(view==="courses") return(
    <div className="page" style={{maxWidth:980,margin:"0 auto"}}>
      <div className="afu" style={{marginBottom:"clamp(20px,3vw,32px)"}}>
        <div className="stag">Practice</div>
        <h1 style={{fontWeight:800,fontSize:"clamp(26px,4vw,42px)",letterSpacing:"-1.5px",marginBottom:8}}>
          Quiz & <span className="gt2">Practice Tests</span>
        </h1>
        <p style={{color:T.muted2,fontSize:"clamp(13px,1.5vw,15px)",lineHeight:1.7,maxWidth:560}}>
          {user?"Choose a course to test your knowledge — 3 difficulty levels, instant feedback, progress saved! 🎯"
            :"Browse quizzes below. Login to attempt and save your progress."}
        </p>
      </div>
      {!user&&(
        <div style={{background:`linear-gradient(135deg,${T.accent}10,${T.blue}08)`,
          border:`1px solid ${T.accent}33`,borderRadius:14,
          padding:"clamp(14px,3vw,22px)",display:"flex",alignItems:"center",
          gap:16,flexWrap:"wrap",marginBottom:24}}>
          <span style={{fontSize:28,flexShrink:0}}>🔐</span>
          <div style={{flex:1,minWidth:180}}>
            <div style={{fontWeight:700,fontSize:"clamp(13px,1.8vw,15px)",marginBottom:3}}>Login to Attempt Quizzes</div>
            <div style={{fontSize:13,color:T.muted2}}>Progress saved, scores tracked, compete on leaderboard.</div>
          </div>
          <button className="btn-p" onClick={()=>setPage("login")} style={{flexShrink:0,padding:"10px 22px",fontSize:13}}>Login Now →</button>
        </div>
      )}
      <div className="grid-auto">
        {courses.map((c,i)=>{
          const levels=["basic","intermediate","advanced"];
          return(
            <div key={c.id} className="card"
              style={{padding:"clamp(16px,2.5vw,22px)",borderTop:`3px solid ${c.color}`,
                animation:`fadeUp .4s ease ${i*.07}s both`,display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <span style={{fontSize:"clamp(26px,4vw,34px)"}}>{c.icon}</span>
                <span className="badge" style={{background:`${c.color}15`,color:c.color,border:`1px solid ${c.color}33`,fontSize:10}}>
                  {levels.reduce((a,l)=>(STATIC_QUIZ[c.id]?.[l]||[]).length+a,0)}+ Qs
                </span>
              </div>
              <div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:c.color,letterSpacing:2,marginBottom:5,textTransform:"uppercase"}}>{c.category}</div>
                <div style={{fontWeight:800,fontSize:"clamp(13px,1.7vw,15px)",lineHeight:1.3,marginBottom:4}}>{c.title}</div>
              </div>
              {/* Level buttons */}
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {levels.map(lv=>{
                  const li=LEVEL_INFO[lv];
                  const key=`${c.id}_${lv}`;
                  const prog=userProgress[key];
                  return(
                    <button key={lv}
                      onClick={()=>user?setView("levels")||setSelCourse(c)||setSelLevel(lv)||selectLevel(c,lv):setPage("login")}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                        borderRadius:9,border:`1px solid ${T.border2}`,
                        background:T.bg3,cursor:"pointer",transition:"all .2s",textAlign:"left",width:"100%"}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=li.color;e.currentTarget.style.background=`${li.color}08`;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border2;e.currentTarget.style.background=T.bg3;}}>
                      <span style={{fontSize:14,flexShrink:0}}>{li.icon}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:12,color:li.color}}>{li.label}</div>
                        <div style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace"}}>{(STATIC_QUIZ[c.id]?.[lv]||[]).length} questions</div>
                      </div>
                      {prog&&<div style={{textAlign:"right",flexShrink:0}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:prog.best>=75?T.success:prog.best>=50?T.amber:T.pink,fontWeight:700}}>{prog.best}%</div>
                        <div style={{fontSize:9,color:T.muted}}>best</div>
                      </div>}
                      <span style={{color:T.muted,fontSize:12,flexShrink:0}}>→</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {loading&&<div style={{position:"fixed",inset:0,background:"rgba(6,13,24,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}><Spinner size={40}/></div>}
    </div>
  );

  // ── QUIZ IN PROGRESS ──
  if(view==="quiz"){
    const q=allQs[qIdx];
    if(!q)return null;
    const li=LEVEL_INFO[selLevel];
    return(
      <div className="page" style={{maxWidth:700,margin:"0 auto"}}>
        {/* Header row */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,flexWrap:"wrap"}}>
          <button className="btn-g" onClick={reset} style={{padding:"6px 12px",color:T.muted2,flexShrink:0}}>✕ Quit</button>
          <span style={{fontWeight:700,fontSize:"clamp(12px,1.6vw,14px)",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {selCourse.icon} {selCourse.title}
          </span>
          <span className="badge" style={{background:`${li.color}15`,color:li.color,border:`1px solid ${li.color}33`,flexShrink:0}}>{li.icon} {li.label}</span>
          {/* Timer */}
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.muted2,flexShrink:0}}>⏱ {fmtTime(elapsed)}</span>
        </div>

        {/* Progress bar */}
        <div style={{height:5,background:T.border,borderRadius:99,marginBottom:6,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${((qIdx)/allQs.length)*100}%`,
            background:`linear-gradient(90deg,${li.color},${T.blue})`,
            borderRadius:99,transition:"width .5s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:4}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.muted}}>{qIdx+1} / {allQs.length}</span>
          <div style={{display:"flex",gap:12}}>
            <span style={{fontSize:11,color:T.success,fontWeight:600}}>✅ {score}</span>
            <span style={{fontSize:11,color:T.danger,fontWeight:600}}>❌ {qIdx-score}</span>
          </div>
        </div>

        <div className="card afu" style={{padding:"clamp(18px,3.5vw,32px)"}}>
          {q.topic&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:li.color,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>{q.topic}</div>}
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,marginBottom:10,letterSpacing:1}}>Q{qIdx+1}</div>
          <h3 style={{fontWeight:700,fontSize:"clamp(14px,2vw,17px)",lineHeight:1.65,marginBottom:22,color:T.text}}>{q.q}</h3>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {q.opts.map((opt,i)=>{
              let bg=T.bg3,border=`1.5px solid ${T.border2}`,color=T.text,icon=null;
              if(selected!==null){
                if(i===q.ans){bg=`${T.success}15`;border=`1.5px solid ${T.success}`;color=T.success;icon="✅";}
                else if(i===selected){bg=`${T.danger}15`;border=`1.5px solid ${T.danger}`;color=T.danger;icon="❌";}
              }
              return(
                <button key={i} onClick={()=>pick(i)}
                  style={{width:"100%",textAlign:"left",
                    padding:"clamp(11px,2vw,14px) clamp(13px,2.5vw,17px)",
                    borderRadius:10,border,background:bg,color,
                    fontSize:"clamp(12px,1.5vw,14px)",
                    cursor:selected!==null?"default":"pointer",
                    transition:"all .15s",display:"flex",alignItems:"center",gap:12,minHeight:44}}
                  onMouseEnter={e=>{if(selected===null){e.currentTarget.style.borderColor=li.color;e.currentTarget.style.background=`${li.color}08`;}}}
                  onMouseLeave={e=>{if(selected===null){e.currentTarget.style.borderColor=T.border2;e.currentTarget.style.background=T.bg3;}}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,
                    color:selected===null?T.muted:i===q.ans?T.success:i===selected?T.danger:T.muted,
                    flexShrink:0,minWidth:18,fontWeight:700}}>
                    {String.fromCharCode(65+i)}.
                  </span>
                  <span style={{flex:1,lineHeight:1.5}}>{opt}</span>
                  {icon&&<span style={{flexShrink:0,fontSize:16}}>{icon}</span>}
                </button>
              );
            })}
          </div>

          {selected!==null&&(
            <button className="btn-p" onClick={next}
              style={{width:"100%",marginTop:18,padding:"clamp(12px,2vw,15px)",
                fontSize:"clamp(13px,1.6vw,15px)",borderRadius:10}}>
              {qIdx+1>=allQs.length?"See Results 🏆":"Next →"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS / DASHBOARD ──
  if(view==="results"){
    const li=LEVEL_INFO[selLevel];
    const timeTaken=elapsed;
    const topicBreakdown={};
    answers.forEach(a=>{
      const t=a.topic||"General";
      if(!topicBreakdown[t])topicBreakdown[t]={correct:0,total:0};
      topicBreakdown[t].total++;
      if(a.isCorrect)topicBreakdown[t].correct++;
    });
    return(
      <div className="page" style={{maxWidth:700,margin:"0 auto"}}>
        {/* Result Card */}
        <div className="card afu" style={{padding:"clamp(22px,4vw,40px)",marginBottom:18,
          background:`linear-gradient(135deg,${gradeColor}06,${T.card})`}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:"clamp(42px,8vw,64px)",marginBottom:10}}>{pct>=75?"🏆":pct>=60?"🎯":"💪"}</div>
            <h2 style={{fontWeight:800,fontSize:"clamp(18px,3vw,28px)",color:gradeColor,marginBottom:6}}>{grade}</h2>
            <p style={{fontSize:13,color:T.muted2,marginBottom:16}}>{selCourse.title} · {li.icon} {li.label} Level</p>
            <ProgressRing pct={pct} size={100} stroke={8} color={gradeColor}/>
            <div style={{display:"flex",justifyContent:"center",gap:"clamp(16px,4vw,32px)",marginTop:18,flexWrap:"wrap"}}>
              {[
                {label:"Score",val:`${score}/${allQs.length}`,color:gradeColor},
                {label:"Accuracy",val:`${pct}%`,color:pct>=60?T.success:T.amber},
                {label:"Time",val:fmtTime(timeTaken),color:T.blue},
              ].map(s=>(
                <div key={s.label} style={{textAlign:"center"}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,fontSize:"clamp(16px,2.5vw,22px)",color:s.color}}>{s.val}</div>
                  <div style={{fontSize:10,color:T.muted,marginTop:2,letterSpacing:1}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Topic breakdown */}
          {Object.keys(topicBreakdown).length>1&&(
            <div style={{marginBottom:20}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:T.muted2}}>📊 Topic Breakdown</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {Object.entries(topicBreakdown).map(([topic,{correct,total}])=>{
                  const tp=Math.round((correct/total)*100);
                  return(
                    <div key={topic}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:11,color:T.muted2,fontFamily:"'JetBrains Mono',monospace"}}>{topic}</span>
                        <span style={{fontSize:11,fontWeight:700,color:tp>=75?T.success:tp>=50?T.amber:T.pink}}>{correct}/{total}</span>
                      </div>
                      <div style={{height:4,background:T.border,borderRadius:99}}>
                        <div style={{height:"100%",width:`${tp}%`,borderRadius:99,transition:"width .6s",
                          background:tp>=75?T.success:tp>=50?T.amber:T.pink}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",marginBottom:16}}>
            <button className="btn-p" onClick={()=>selectLevel(selCourse,selLevel)}>Retry {li.icon}</button>
            <button className="btn-s" onClick={reset}>All Courses</button>
            <button className="btn-s" onClick={()=>setPage("leaderboard")} style={{fontSize:13}}>🏆 Leaderboard</button>
          </div>

          {/* Go to Dashboard */}
          <button onClick={()=>setPage("dashboard")}
            style={{width:"100%",padding:"12px",background:`${T.accent}12`,
              border:`1px solid ${T.accent}33`,borderRadius:10,cursor:"pointer",
              color:T.accent,fontWeight:700,fontSize:13,transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.background=`${T.accent}20`}
            onMouseLeave={e=>e.currentTarget.style.background=`${T.accent}12`}>
            📊 Go to Dashboard
          </button>
        </div>

        {/* Answer Review */}
        <div style={{fontWeight:700,fontSize:"clamp(14px,1.8vw,16px)",marginBottom:12}}>📋 Full Review</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {answers.map((a,i)=>(
            <div key={i} style={{borderRadius:10,overflow:"hidden",
              border:`1px solid ${a.isCorrect?T.success:T.danger}33`}}>
              <div style={{padding:"clamp(10px,2vw,14px) clamp(12px,2.5vw,16px)",
                background:a.isCorrect?`${T.success}08`:`${T.danger}08`,
                display:"flex",alignItems:"flex-start",gap:10}}>
                <span style={{fontSize:14,flexShrink:0,marginTop:1}}>{a.isCorrect?"✅":"❌"}</span>
                <div style={{flex:1,minWidth:0}}>
                  {a.topic&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.muted,letterSpacing:1.5,marginBottom:3}}>{a.topic}</div>}
                  <div style={{fontSize:"clamp(12px,1.5vw,13px)",fontWeight:600,lineHeight:1.5}}>{a.q}</div>
                  {!a.isCorrect&&<div style={{fontSize:11,color:T.success,marginTop:4,fontWeight:600}}>
                    ✓ Correct: {a.opts[a.correct]}
                  </div>}
                  {!a.isCorrect&&<div style={{fontSize:11,color:T.danger,marginTop:2}}>
                    ✗ You chose: {a.opts[a.selected]}
                  </div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

// ================================================================
//  ADMIN QUIZ TAB — Add questions per course + level
// ================================================================
function AdminQuizTab({courses}){
  const [selC,setSelC]=useState(courses[0]?.id||"c1");
  const [selLv,setSelLv]=useState("basic");
  const [questions,setQuestions]=useState([]);
  const [form,setForm]=useState({q:"",opts:["","","",""],ans:0,topic:"",level:"basic"});
  const [show,setShow]=useState(false);
  const [load,setLoad]=useState(false);
  const [toast,setToast]=useState("");
  const msg=t=>{setToast(t);setTimeout(()=>setToast(""),3000);};
  const levels=["basic","intermediate","advanced"];

  useEffect(()=>{
    const unsub=onSnapshot(
      query(collection(db,"quiz_questions"),where("courseId","==",selC),where("level","==",selLv)),
      snap=>setQuestions(snap.docs.map(d=>({id:d.id,...d.data()}))),
      ()=>{}
    );
    return unsub;
  },[selC,selLv]);

  async function addQ(){
    if(!form.q.trim()||form.opts.some(o=>!o.trim())){msg("❌ Question and all 4 options are required.");return;}
    setLoad(true);
    try{
      await addDoc(collection(db,"quiz_questions"),{...form,courseId:selC,level:selLv,createdAt:serverTimestamp()});
      setForm({q:"",opts:["","","",""],ans:0,topic:"",level:selLv});
      setShow(false);msg("✅ Question added!");
    }catch(e){msg("❌ "+e.message);}
    setLoad(false);
  }

  async function delQ(id){
    try{await deleteDoc(doc(db,"quiz_questions",id));msg("🗑 Deleted.");}
    catch(e){msg("❌ "+e.message);}
  }

  const li=LEVEL_INFO[selLv];

  return(
    <div className="afi">
      {toast&&<div style={{background:T.card,border:`1px solid ${T.accent}33`,borderRadius:8,padding:"10px 16px",marginBottom:14,fontSize:13,color:T.accent}}>{toast}</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{fontWeight:700,fontSize:"clamp(14px,2vw,17px)"}}>
          Quiz Questions <span className="badge ba" style={{marginLeft:8}}>{questions.length} custom</span>
        </div>
        <button className="btn-p" onClick={()=>setShow(!show)} style={{padding:"9px 20px",fontSize:13}}>
          {show?"✕ Cancel":"+ Add Question"}
        </button>
      </div>

      {/* Course selector */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
        {courses.map(c=>(
          <button key={c.id} onClick={()=>setSelC(c.id)}
            style={{padding:"6px 14px",borderRadius:99,border:`1px solid ${selC===c.id?c.color:T.border2}`,
              background:selC===c.id?`${c.color}15`:T.card,color:selC===c.id?c.color:T.muted2,
              fontWeight:600,fontSize:11,cursor:"pointer",transition:"all .2s"}}>
            {c.icon} {c.title.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Level selector */}
      <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
        {levels.map(lv=>{
          const lvi=LEVEL_INFO[lv];
          const count=(STATIC_QUIZ[selC]?.[lv]||[]).length;
          return(
            <button key={lv} onClick={()=>setSelLv(lv)}
              style={{padding:"8px 16px",borderRadius:99,
                border:`1.5px solid ${selLv===lv?lvi.color:T.border2}`,
                background:selLv===lv?`${lvi.color}15`:T.card,
                color:selLv===lv?lvi.color:T.muted2,
                fontWeight:700,fontSize:12,cursor:"pointer",transition:"all .2s",
                display:"flex",alignItems:"center",gap:6}}>
              {lvi.icon} {lvi.label}
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,opacity:.7}}>({count} static)</span>
            </button>
          );
        })}
      </div>

      {show&&(
        <div style={{background:T.card,border:`1px solid ${li.color}33`,borderRadius:12,
          padding:"clamp(16px,3vw,24px)",marginBottom:18}} className="afu">
          <div style={{fontWeight:700,fontSize:14,marginBottom:14,color:li.color}}>
            {li.icon} New {li.label} Question — {courses.find(c=>c.id===selC)?.title}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <label className="lbl">Question *</label>
              <textarea className="inp" rows={2} value={form.q}
                placeholder="Enter question..." style={{resize:"vertical"}}
                onChange={e=>setForm(p=>({...p,q:e.target.value}))}/>
            </div>
            <div>
              <label className="lbl">Topic (optional)</label>
              <input className="inp" value={form.topic} placeholder="e.g. Arrays, OOP, Recursion..."
                onChange={e=>setForm(p=>({...p,topic:e.target.value}))}/>
            </div>
            {[0,1,2,3].map(i=>(
              <div key={i}>
                <label className="lbl">
                  Option {String.fromCharCode(65+i)}
                  {form.ans===i&&<span style={{color:T.success,marginLeft:8}}>← Correct Answer</span>}
                </label>
                <input className="inp" value={form.opts[i]}
                  placeholder={`Option ${String.fromCharCode(65+i)}`}
                  style={{borderColor:form.ans===i?T.success:undefined}}
                  onChange={e=>{const o=[...form.opts];o[i]=e.target.value;setForm(p=>({...p,opts:o}));}}/>
              </div>
            ))}
            <div>
              <label className="lbl">Correct Answer</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["A","B","C","D"].map((l,i)=>(
                  <button key={i} onClick={()=>setForm(p=>({...p,ans:i}))}
                    style={{padding:"8px 18px",borderRadius:8,
                      border:`1.5px solid ${form.ans===i?T.success:T.border2}`,
                      background:form.ans===i?`${T.success}15`:T.bg3,
                      color:form.ans===i?T.success:T.muted2,
                      fontWeight:700,cursor:"pointer",transition:"all .2s"}}>
                    Option {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
            <button className="btn-p" onClick={addQ} disabled={load}
              style={{display:"flex",gap:8,alignItems:"center"}}>
              {load&&<Spinner/>}Save Question
            </button>
            <button className="btn-s" onClick={()=>setShow(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{fontSize:11,color:T.muted,marginBottom:12,fontFamily:"'JetBrains Mono',monospace"}}>
        Static: {(STATIC_QUIZ[selC]?.[selLv]||[]).length} · Custom: {questions.length} · Total shown in quiz: {(STATIC_QUIZ[selC]?.[selLv]||[]).length+questions.length}
      </div>

      {questions.length===0
        ?<div style={{textAlign:"center",padding:"36px 20px",color:T.muted,fontSize:13,
          background:T.card,borderRadius:12,border:`1px dashed ${T.border2}`}}>
          No custom questions yet for {li.label} level. Add using the button above!
        </div>
        :<div style={{display:"flex",flexDirection:"column",gap:8}}>
          {questions.map((q,i)=>(
            <div key={q.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,
              padding:"clamp(11px,2vw,15px) clamp(13px,2.5vw,17px)",
              borderLeft:`3px solid ${li.color}`,display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:180}}>
                {q.topic&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.muted,letterSpacing:1.5,marginBottom:3}}>{q.topic}</div>}
                <div style={{fontWeight:600,fontSize:"clamp(12px,1.5vw,13px)",marginBottom:8,lineHeight:1.5}}>{q.q}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {q.opts.map((o,j)=>(
                    <span key={j} style={{fontSize:11,padding:"3px 9px",borderRadius:6,
                      background:j===q.ans?`${T.success}15`:T.bg3,
                      color:j===q.ans?T.success:T.muted2,
                      border:`1px solid ${j===q.ans?T.success:T.border}`}}>
                      {String.fromCharCode(65+j)}. {o}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={()=>delQ(q.id)} className="btn-r" style={{padding:"5px 11px",fontSize:11,flexShrink:0}}>🗑</button>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

// ================================================================
//  LEADERBOARD PAGE
// ================================================================
function LeaderboardPage({user,courses,setPage}){
  const [students,setStudents]=useState([]);
  const [progMap,setProgMap]=useState({});
  const [load,setLoad]=useState(true);
  const [tab,setTab]=useState("overall");

  useEffect(()=>{
    async function load(){
      try{
        const uSnap=await getDocs(collection(db,"users"));
        const pSnap=await getDocs(collection(db,"progress"));
        const users=uSnap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>u.role!=="admin");
        const prog={};
        pSnap.docs.forEach(d=>prog[d.id]=d.data());
        setStudents(users);
        setProgMap(prog);
      }catch(e){}
      setLoad(false);
    }
    load();
  },[]);

  const totalVideos=courses.reduce((a,c)=>a+c.videos.length,0);

  const ranked=students.map(s=>{
    const p=progMap[s.id]||{};
    const watched=courses.reduce((a,c)=>a+(p[c.id]||[]).length,0);
    const pct=totalVideos>0?Math.round((watched/totalVideos)*100):0;
    const courseDone=courses.filter(c=>c.videos.length>0&&c.videos.every(v=>(p[c.id]||[]).includes(v.id))).length;
    return{...s,watched,pct,courseDone};
  }).sort((a,b)=>b.watched-a.watched);

  const medals=["🥇","🥈","🥉"];
  const rankColor=["#FFD700","#C0C0C0","#CD7F32"];

  if(load)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",flexDirection:"column",gap:16}}><Spinner size={32}/><p style={{color:T.muted,fontSize:14}}>Loading leaderboard...</p></div>);

  return(
    <div className="page" style={{maxWidth:800,margin:"0 auto"}}>
      <div className="afu" style={{marginBottom:"clamp(20px,3vw,32px)"}}>
        <div className="stag">Community</div>
        <h1 style={{fontWeight:800,fontSize:"clamp(24px,4vw,40px)",letterSpacing:"-1.5px",marginBottom:8}}>
          🏆 <span className="gt2">Leaderboard</span>
        </h1>
        <p style={{color:T.muted2,fontSize:14}}>Top students ranked by videos watched. Keep learning to climb!</p>
      </div>

      {ranked.length===0
        ?<div style={{textAlign:"center",padding:"80px 20px",color:T.muted}}>
          <div style={{fontSize:48,marginBottom:14}}>👥</div>
          <div style={{fontWeight:700,fontSize:20,marginBottom:8}}>No students yet</div>
        </div>
        :<div style={{display:"flex",flexDirection:"column",gap:10}}>
          {/* Top 3 podium */}
          {ranked.length>=3&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:24}} className="afu">
              {[ranked[1],ranked[0],ranked[2]].map((s,i)=>{
                const realRank=i===0?2:i===1?1:3;
                const h=realRank===1?120:realRank===2?90:70;
                return s?(
                  <div key={s.id} style={{textAlign:"center"}}>
                    <div style={{background:T.card,border:`1px solid ${rankColor[realRank-1]}44`,borderRadius:14,
                      padding:"16px 8px",height:h,display:"flex",flexDirection:"column",
                      alignItems:"center",justifyContent:"center",gap:6,
                      boxShadow:realRank===1?`0 0 32px ${T.accent}22`:"none"}}>
                      <div style={{fontSize:28}}>{medals[realRank-1]}</div>
                      <div style={{width:36,height:36,borderRadius:"50%",
                        background:`linear-gradient(135deg,${rankColor[realRank-1]},${T.blue})`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontWeight:800,fontSize:14,color:T.bg}}>
                        {s.name?.[0]?.toUpperCase()||"S"}
                      </div>
                      <div style={{fontWeight:700,fontSize:"clamp(10px,1.4vw,12px)",
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:80}}>
                        {s.name?.split(" ")[0]}
                      </div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.accent}}>
                        {s.watched} videos
                      </div>
                    </div>
                  </div>
                ):null;
              })}
            </div>
          )}

          {/* Full list */}
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"48px 1fr 80px 80px 80px",
              padding:"11px 18px",background:T.bg3,borderBottom:`1px solid ${T.border}`,
              fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,
              letterSpacing:1.5,textTransform:"uppercase"}}>
              <span>#</span><span>Student</span>
              <span style={{textAlign:"center"}}>Videos</span>
              <span style={{textAlign:"center"}}>Courses</span>
              <span style={{textAlign:"center"}}>Progress</span>
            </div>
            {ranked.map((s,i)=>(
              <div key={s.id} className="rank-row"
                style={{display:"grid",gridTemplateColumns:"48px 1fr 80px 80px 80px",
                  padding:"clamp(11px,1.5vw,14px) 18px",alignItems:"center",
                  borderBottom:i<ranked.length-1?`1px solid ${T.border}55`:"none",
                  background:s.id===user?.uid?`${T.accent}06`:"transparent",
                  animationDelay:`${i*.04}s`}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,
                  color:i<3?rankColor[i]:T.muted,fontWeight:i<3?800:400}}>
                  {i<3?medals[i]:i+1}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                  <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,
                    background:`linear-gradient(135deg,${s.avatarColor||T.accent},${T.blue})`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontWeight:800,fontSize:12,color:T.bg}}>
                    {s.name?.[0]?.toUpperCase()||"S"}
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:"clamp(12px,1.4vw,14px)",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {s.name}{s.id===user?.uid&&<span style={{color:T.accent,fontSize:10,marginLeft:6}}>(You)</span>}
                    </div>
                    {s.mobile&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted}}>
                      Joined student
                    </div>}
                  </div>
                </div>
                <div style={{textAlign:"center",fontFamily:"'JetBrains Mono',monospace",
                  fontSize:13,fontWeight:700,color:T.accent}}>{s.watched}</div>
                <div style={{textAlign:"center",fontFamily:"'JetBrains Mono',monospace",
                  fontSize:13,color:T.muted2}}>{s.courseDone}</div>
                <div style={{textAlign:"center"}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,
                    color:s.pct>=75?T.success:s.pct>=40?T.amber:T.muted2,fontWeight:700}}>
                    {s.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    </div>
  );
}


// ================================================================
//  JOB PLACEMENT HUB — Improved with full content
// ================================================================
function JobPlacementPage({setPage}){
  const [tab,setTab]=useState("roadmap");
  const [openQ,setOpenQ]=useState(null);

  const roadmap=[
    {step:1,title:"Build Strong Fundamentals",time:"Month 1–3",color:T.accent,icon:"🧱",
      tasks:[
        "Complete Python Zero to Hero or C++ course fully",
        "Learn HTML, CSS, JavaScript basics",
        "Understand Git — commit, push, pull, branches",
        "Practice 30–50 problems on LeetCode (Easy level)",
        "Build 1 small project: calculator, to-do app, portfolio site",
      ],
      tip:"Don't rush. Solid foundations save months later. Understand the 'why', not just the 'how'."},
    {step:2,title:"Data Structures & Algorithms",time:"Month 3–6",color:T.blue,icon:"🧠",
      tasks:[
        "Arrays, Strings, Linked Lists, Stacks, Queues",
        "Trees (BST, Heaps), Graphs (BFS, DFS)",
        "Sorting & Searching algorithms",
        "Hashing, Dynamic Programming basics",
        "Solve 100+ LeetCode Easy-Medium problems",
      ],
      tip:"1 hour of focused DSA daily beats 5 hours on weekends. Track your solved problems."},
    {step:3,title:"Build Real Projects",time:"Month 6–9",color:T.pink,icon:"🔨",
      tasks:[
        "Build 2–3 full-stack projects (not tutorials — original ideas)",
        "Host everything on GitHub with proper README",
        "Deploy on Vercel or Netlify",
        "One project should solve a real problem you face",
        "Write clean, commented code — recruiters read it",
      ],
      tip:"Projects are your resume before your resume. Quality over quantity."},
    {step:4,title:"Resume & Online Presence",time:"Month 9–11",color:T.purple,icon:"📄",
      tasks:[
        "Create ATS-friendly 1-page resume",
        "Optimize LinkedIn with skills, projects, and a good photo",
        "Contribute to 1–2 open source projects on GitHub",
        "Start writing about what you learn (LinkedIn posts, blog)",
        "Get 2–3 recommendations from peers or mentors",
      ],
      tip:"Recruiters spend 7 seconds on a resume. Make your projects section impossible to ignore."},
    {step:5,title:"Interview Preparation",time:"Month 11–12",color:T.amber,icon:"💬",
      tasks:[
        "Revise all DSA patterns (30 days structured revision)",
        "Practice 20+ mock interviews (LeetCode Discuss, friends)",
        "Prepare answers for top 20 HR questions",
        "Research companies before applying",
        "Apply to 15–20 companies per week",
      ],
      tip:"Rejection is data, not failure. Analyze each rejection and improve. Most offers come after 50+ applications."},
  ];

  const resumeTips=[
    {title:"1 Page Rule",desc:"Freshers must keep resume to 1 page. Hiring managers spend under 10 seconds scanning. Every word must earn its place.",icon:"📄",color:T.accent},
    {title:"ATS Optimization",desc:"70% of resumes are filtered by bots. Use exact keywords from the job description — 'Python', 'REST API', 'React', 'DSA'. Don't use images or tables.",icon:"🤖",color:T.blue},
    {title:"Strong Summary Line",desc:"Write 2 powerful lines: who you are + your strongest skill. Avoid: 'Seeking a position to grow'. Write: 'CS fresher with 3 deployed projects in React and Node.js'.",icon:"💬",color:T.pink},
    {title:"Projects Section (Most Important)",desc:"For freshers, projects > experience. List: Project name | Tech stack | What it does | GitHub link. Add metrics if possible — '500+ users', '40% faster load'.",icon:"🔨",color:T.purple},
    {title:"Quantify Everything",desc:"'Built an e-commerce site' vs 'Built full-stack e-commerce site with 200+ products, cart, and Stripe payments'. Numbers make you memorable.",icon:"📊",color:T.amber},
    {title:"Skills Section Format",desc:"Group your skills: Languages (Python, JS, C++) | Frameworks (React, Node) | Tools (Git, VS Code, Docker) | Databases (MySQL, Firebase). Clean grid format.",icon:"⚡",color:T.cyan},
    {title:"No Photo, No DOB",desc:"Modern tech resumes don't need photos or date of birth. Focus on skills and projects. These details can lead to unconscious bias.",icon:"🚫",color:T.pink},
    {title:"Action Verbs",desc:"Start every bullet with a verb: Built, Designed, Optimized, Reduced, Implemented, Led, Integrated, Deployed. Never start with 'Responsible for'.",icon:"✍️",color:T.accent},
    {title:"Education Placement",desc:"Put Education at the bottom (not top) if you have projects. Exception: if CGPA > 8.5, put it near top — it's a differentiator.",icon:"🎓",color:T.blue},
    {title:"Proofread Ruthlessly",desc:"One typo = instant rejection at top companies. Run Grammarly. Read it backwards. Ask 2 friends to review. Print it out and read physically.",icon:"✅",color:T.success},
  ];

  const interviewQs=[
    {cat:"HR / Behavioral",color:T.accent,icon:"🤝",qs:[
      {q:"Tell me about yourself.",
       a:"Structure: Background (30 sec) → Skills/Projects (45 sec) → Why this role (15 sec). Practice until it sounds natural. Don't read a script — sound human. End with: 'That's why I'm excited about this role at [company].'"},
      {q:"Why do you want to work here?",
       a:"Research the company for 20 min before. Mention: 1 specific product/tech they use, 1 thing about their engineering culture, how it aligns with your goals. Generic answers fail — specificity wins."},
      {q:"Where do you see yourself in 5 years?",
       a:"Show ambition without arrogance. Example: 'I want to grow into a strong backend engineer, eventually leading technical decisions on product features. I see this role as the right foundation for that path.'"},
      {q:"What is your greatest weakness?",
       a:"Be honest — interviewers can detect fake answers instantly. Pick a real weakness, then show you're actively improving it. 'I used to underestimate how long tasks take. Now I use time estimates and track them.'"},
      {q:"Describe a challenging project you built.",
       a:"Use STAR method: Situation → Task → Action → Result. Be specific about the problem, your exact role, what you tried, what failed, and what succeeded. Interviewers love when you mention mistakes you learned from."},
      {q:"How do you handle tight deadlines?",
       a:"Give a real example. Describe how you prioritized, what you cut (scope), and how you communicated. Emphasize: you don't disappear under pressure — you communicate and deliver what's possible."},
    ]},
    {cat:"Technical — DSA",color:T.blue,icon:"🧠",qs:[
      {q:"Explain time complexity in simple terms.",
       a:"Time complexity measures how the runtime of an algorithm grows as input size grows. O(1) = constant, O(n) = linear growth, O(n²) = quadratic, O(log n) = halving. Use Big-O for worst-case analysis."},
      {q:"When would you use a HashMap vs an Array?",
       a:"HashMap: when you need O(1) lookup by key, like caching or counting frequencies. Array: when you need ordered data, index-based access, or memory is tight. HashMap uses more memory but is faster for lookups."},
      {q:"Explain recursion and its pitfalls.",
       a:"Recursion = function calling itself with a smaller input until a base case. Pitfalls: no base case → stack overflow, overlapping subproblems without memoization → exponential time. Always identify base case first."},
      {q:"How does merge sort work?",
       a:"Divide array in half repeatedly until single elements, then merge them back in sorted order. Time: O(n log n) always. Space: O(n). Stable sort. Use when stability matters or for linked lists."},
      {q:"What is a sliding window technique?",
       a:"Used for subarray/substring problems. Maintain a window (start, end pointers) and slide it across the array instead of nested loops. Reduces O(n²) to O(n). Common for: max sum subarray, longest unique substring."},
      {q:"Two pointers vs Binary search — when to use which?",
       a:"Two pointers: sorted array, finding pairs with a target sum, or comparing elements from both ends. Binary search: finding a specific element in sorted data, or 'minimizing the maximum' type problems."},
    ]},
    {cat:"System Design (Basic)",color:T.pink,icon:"⚙️",qs:[
      {q:"How would you design a URL shortener?",
       a:"Components: API to generate short code (6 char hash), database to store short↔long mapping, redirect service. Scale: cache popular URLs in Redis, use CDN. Database: NoSQL for scale. Rate limit the API."},
      {q:"What is a REST API?",
       a:"Architectural style using HTTP. Key principles: stateless, client-server, use HTTP methods (GET=read, POST=create, PUT=update, DELETE=remove), resources identified by URLs. Response in JSON. Status codes: 200 OK, 404 Not Found, 500 Server Error."},
      {q:"SQL vs NoSQL — when to use which?",
       a:"SQL: structured data, relationships matter, ACID transactions needed (banking, e-commerce). NoSQL: flexible schema, horizontal scaling, high write throughput (social media, real-time apps). Most apps use both."},
      {q:"What happens when you type a URL in browser?",
       a:"1) DNS lookup (domain → IP), 2) TCP handshake with server, 3) HTTPS/TLS handshake, 4) HTTP request sent, 5) Server processes and responds, 6) Browser renders HTML/CSS/JS. Caching happens at multiple levels."},
    ]},
    {cat:"CS Fundamentals",color:T.purple,icon:"💻",qs:[
      {q:"What is OOP? Explain the 4 pillars.",
       a:"Encapsulation: hide data inside class. Inheritance: child class reuses parent properties. Polymorphism: same interface, different behavior. Abstraction: show what's needed, hide implementation. Real-world example: Car class → ElectricCar extends Car."},
      {q:"Process vs Thread?",
       a:"Process: independent program with own memory space. Thread: lightweight execution unit within a process, shares memory with other threads. Threads are faster to create but need synchronization. Use threads for parallel tasks within one program."},
      {q:"What is deadlock and how to prevent it?",
       a:"Deadlock: two processes each holding a resource and waiting for the other. Prevention: lock ordering (always acquire locks in same order), timeout (give up after waiting too long), use lock-free algorithms."},
      {q:"Explain caching and its types.",
       a:"Cache: fast storage for frequently accessed data. Types: L1/L2/L3 CPU cache (hardware), browser cache (web), Redis/Memcached (application level), CDN (content delivery). Cache hit = fast, cache miss = fetch from source. TTL controls expiry."},
    ]},
  ];

  const tabs=[
    {k:"roadmap",l:"🗺️ Roadmap",desc:"12-month plan"},
    {k:"resume",l:"📄 Resume Tips",desc:"Get interviews"},
    {k:"interview",l:"💬 Interview Q&A",desc:"Crack the interview"},
  ];

  return(
    <div className="page" style={{maxWidth:1000,margin:"0 auto"}}>
      {/* Header */}
      <div className="afu" style={{marginBottom:"clamp(24px,4vw,40px)"}}>
        <div className="stag">Career Growth</div>
        <h1 style={{fontWeight:800,fontSize:"clamp(26px,4.5vw,48px)",letterSpacing:"-2px",lineHeight:1.1,marginBottom:12}}>
          Job <span className="gt2">Placement Hub</span>
        </h1>
        <p style={{color:T.muted2,fontSize:"clamp(13px,1.5vw,15px)",lineHeight:1.8,maxWidth:560}}>
          Your complete guide from beginner to first tech job — roadmap, resume, and interview prep all in one place.
        </p>
        {/* Stats */}
        <div style={{display:"flex",gap:"clamp(16px,3vw,32px)",marginTop:20,flexWrap:"wrap"}}>
          {[["12 months","Average timeline"],["50+ companies","To apply to"],["3 projects","Minimum portfolio"],["100+ DSA","Problems to solve"]].map(([n,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,fontSize:"clamp(16px,2.5vw,22px)",color:T.accent}}>{n}</div>
              <div style={{fontSize:11,color:T.muted,marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:"clamp(20px,3vw,32px)",flexWrap:"wrap"}}>
        {tabs.map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)}
            style={{padding:"clamp(10px,1.5vw,13px) clamp(16px,2.5vw,24px)",
              borderRadius:12,border:`1.5px solid ${tab===t.k?T.accent:T.border2}`,
              background:tab===t.k?`linear-gradient(135deg,${T.accent}18,${T.blue}08)`:T.card,
              color:tab===t.k?T.accent:T.muted2,fontWeight:700,
              fontSize:"clamp(12px,1.4vw,14px)",cursor:"pointer",transition:"all .2s",
              display:"flex",flexDirection:"column",alignItems:"flex-start",gap:2,whiteSpace:"nowrap"}}>
            <span>{t.l}</span>
            <span style={{fontSize:10,color:tab===t.k?T.accent:T.muted,fontWeight:400,fontFamily:"'JetBrains Mono',monospace"}}>{t.desc}</span>
          </button>
        ))}
      </div>

      {/* ROADMAP */}
      {tab==="roadmap"&&(
        <div style={{display:"flex",flexDirection:"column",gap:"clamp(14px,2vw,20px)"}} className="afu">
          {roadmap.map((r,i)=>(
            <div key={r.step} className="card"
              style={{padding:"clamp(18px,3vw,28px)",borderLeft:`4px solid ${r.color}`,
                animation:`fadeUp .4s ease ${i*.08}s both`,overflow:"hidden"}}>
              <div style={{display:"flex",gap:"clamp(14px,2.5vw,20px)",flexWrap:"wrap",alignItems:"flex-start"}}>
                {/* Step indicator */}
                <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <div style={{width:"clamp(44px,6vw,56px)",height:"clamp(44px,6vw,56px)",borderRadius:14,
                    background:`${r.color}18`,border:`1.5px solid ${r.color}44`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:"clamp(20px,3vw,26px)"}}>
                    {r.icon}
                  </div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:r.color,
                    letterSpacing:1.5,textTransform:"uppercase",textAlign:"center",lineHeight:1.3}}>
                    Step<br/>{r.step}
                  </div>
                </div>
                <div style={{flex:1,minWidth:"clamp(200px,40vw,300px)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:8}}>
                    <h3 style={{fontWeight:800,fontSize:"clamp(15px,2vw,19px)",color:T.text}}>{r.title}</h3>
                    <span className="badge" style={{background:`${r.color}12`,color:r.color,border:`1px solid ${r.color}22`,fontSize:10}}>{r.time}</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:"clamp(6px,1vw,9px)",marginBottom:14}}>
                    {r.tasks.map((t,j)=>(
                      <div key={j} style={{display:"flex",alignItems:"flex-start",gap:10,
                        fontSize:"clamp(12px,1.4vw,13px)",color:T.muted2,lineHeight:1.6}}>
                        <span style={{color:r.color,flexShrink:0,marginTop:3,fontSize:8}}>●</span>
                        {t}
                      </div>
                    ))}
                  </div>
                  <div style={{background:`${r.color}08`,border:`1px solid ${r.color}22`,
                    borderRadius:10,padding:"clamp(9px,1.5vw,12px) clamp(12px,2vw,16px)",
                    display:"flex",alignItems:"flex-start",gap:8}}>
                    <span style={{flexShrink:0,fontSize:14}}>💡</span>
                    <span style={{fontSize:"clamp(11px,1.3vw,12px)",color:T.muted2,lineHeight:1.7}}>{r.tip}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* End goal */}
          <div className="card" style={{padding:"clamp(20px,3vw,28px)",
            background:`linear-gradient(135deg,${T.accent}08,${T.blue}05)`,
            border:`1px solid ${T.accent}33`,textAlign:"center"}}>
            <div style={{fontSize:"clamp(32px,5vw,48px)",marginBottom:12}}>🎉</div>
            <h3 style={{fontWeight:800,fontSize:"clamp(16px,2.5vw,22px)",marginBottom:8}}>
              You're <span className="gt2">Interview Ready!</span>
            </h3>
            <p style={{fontSize:"clamp(12px,1.4vw,14px)",color:T.muted2,lineHeight:1.8,maxWidth:480,margin:"0 auto 20px"}}>
              After 12 months of consistent work — you have the projects, skills, and preparation to land your first tech job. Now apply aggressively.
            </p>
            <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
              <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="btn-p" style={{textDecoration:"none",fontSize:13}}>Practice on LeetCode →</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="btn-s" style={{textDecoration:"none",fontSize:13}}>Build LinkedIn Profile</a>
            </div>
          </div>
        </div>
      )}

      {/* RESUME TIPS */}
      {tab==="resume"&&(
        <div className="afu">
          <div style={{background:`linear-gradient(135deg,${T.accent}08,${T.blue}05)`,
            border:`1px solid ${T.accent}33`,borderRadius:14,
            padding:"clamp(18px,3vw,28px)",marginBottom:"clamp(20px,3vw,28px)"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,flexWrap:"wrap"}}>
              <span style={{fontSize:28}}>⚡</span>
              <h2 style={{fontWeight:800,fontSize:"clamp(16px,2.5vw,22px)"}}>Resume = Your First Impression</h2>
            </div>
            <p style={{fontSize:"clamp(12px,1.4vw,14px)",color:T.muted2,lineHeight:1.8,marginBottom:16,maxWidth:640}}>
              Recruiters decide in 7 seconds. Your resume must be clean, keyword-rich, and project-heavy. Follow these 10 rules and you'll get calls.
            </p>
            <a href="https://www.overleaf.com/gallery/tagged/cv" target="_blank" rel="noreferrer"
              className="btn-p" style={{display:"inline-flex",textDecoration:"none",fontSize:13}}>
              Free Resume Templates →
            </a>
          </div>

          <div className="grid-auto">
            {resumeTips.map((tip,i)=>(
              <div key={i} className="card card-h"
                style={{padding:"clamp(16px,2.5vw,22px)",animation:`fadeUp .35s ease ${i*.05}s both`,
                  borderTop:`3px solid ${tip.color}`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <span style={{fontSize:"clamp(20px,3vw,26px)"}}>{tip.icon}</span>
                  <div style={{fontWeight:800,fontSize:"clamp(13px,1.6vw,15px)",color:T.text}}>{tip.title}</div>
                </div>
                <div style={{fontSize:"clamp(12px,1.4vw,13px)",color:T.muted2,lineHeight:1.75}}>{tip.desc}</div>
              </div>
            ))}
          </div>

          {/* Resume format */}
          <div className="card" style={{marginTop:"clamp(20px,3vw,28px)",padding:"clamp(18px,3vw,28px)"}}>
            <h3 style={{fontWeight:800,fontSize:"clamp(15px,2vw,18px)",marginBottom:16}}>📋 Recommended Resume Order</h3>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                ["1","Name + Contact + LinkedIn + GitHub","Always at top — make links clickable"],
                ["2","Summary (2 lines)","Your elevator pitch — what you build and with what tech"],
                ["3","Skills","Languages | Frameworks | Tools | Databases"],
                ["4","Projects (Most Important)","2–3 projects with tech, description, and links"],
                ["5","Experience / Internships","Only if relevant — otherwise skip"],
                ["6","Education","CGPA only if ≥ 8.0"],
                ["7","Certifications","Optional — only from reputed platforms"],
              ].map(([num,title,desc])=>(
                <div key={num} style={{display:"flex",alignItems:"flex-start",gap:"clamp(10px,2vw,16px)",
                  padding:"clamp(10px,1.5vw,13px) clamp(12px,2vw,16px)",background:T.bg3,borderRadius:10,flexWrap:"wrap"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:`${T.accent}15`,
                    border:`1px solid ${T.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",
                    fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:800,color:T.accent,flexShrink:0}}>
                    {num}
                  </div>
                  <div style={{flex:1,minWidth:120}}>
                    <div style={{fontWeight:700,fontSize:"clamp(12px,1.5vw,13px)",marginBottom:2}}>{title}</div>
                    <div style={{fontSize:"clamp(11px,1.3vw,12px)",color:T.muted2}}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INTERVIEW Q&A */}
      {tab==="interview"&&(
        <div className="afu" style={{display:"flex",flexDirection:"column",gap:"clamp(20px,3vw,28px)"}}>
          <div style={{background:`linear-gradient(135deg,${T.blue}08,${T.pink}05)`,
            border:`1px solid ${T.blue}33`,borderRadius:14,padding:"clamp(16px,3vw,24px)"}}>
            <h3 style={{fontWeight:800,fontSize:"clamp(14px,2vw,18px)",marginBottom:8}}>
              💡 How to Use This Section
            </h3>
            <p style={{fontSize:"clamp(12px,1.4vw,13px)",color:T.muted2,lineHeight:1.8}}>
              Don't memorize answers — understand the logic. Practice saying them out loud. The answers here are frameworks to help you build your own answer. Click any question to reveal the answer.
            </p>
          </div>
          {interviewQs.map((cat,ci)=>(
            <div key={ci}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                <span style={{fontSize:20}}>{cat.icon}</span>
                <h3 style={{fontWeight:800,fontSize:"clamp(14px,2vw,17px)"}}>{cat.cat}</h3>
                <span className="badge" style={{background:`${cat.color}15`,color:cat.color,border:`1px solid ${cat.color}33`,fontSize:10}}>{cat.qs.length} questions</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {cat.qs.map((item,qi)=>{
                  const key=`${ci}-${qi}`;
                  const open=openQ===key;
                  return(
                    <div key={qi} className="card"
                      style={{borderLeft:`3px solid ${open?cat.color:T.border2}`,transition:"all .2s",
                        boxShadow:open?`0 4px 24px rgba(0,0,0,.2)`:"none"}}>
                      <button onClick={()=>setOpenQ(open?null:key)}
                        style={{width:"100%",padding:"clamp(13px,2vw,17px) clamp(14px,2.5vw,20px)",
                          background:"none",border:"none",cursor:"pointer",
                          display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,textAlign:"left"}}>
                        <span style={{fontWeight:600,fontSize:"clamp(13px,1.5vw,14px)",color:T.text,lineHeight:1.4}}>{item.q}</span>
                        <span style={{width:24,height:24,borderRadius:"50%",border:`1.5px solid ${open?cat.color:T.border2}`,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          color:open?cat.color:T.muted2,fontSize:14,flexShrink:0,transition:"all .2s",
                          transform:open?"rotate(45deg)":"none"}}>+</span>
                      </button>
                      {open&&(
                        <div style={{padding:"0 clamp(14px,2.5vw,20px) clamp(14px,2vw,18px)",
                          borderTop:`1px solid ${T.border}44`}} className="afu">
                          <div style={{paddingTop:"clamp(12px,2vw,16px)",
                            fontSize:"clamp(12px,1.4vw,13px)",color:T.muted2,lineHeight:1.85}}>
                            {item.a}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ================================================================
//  FOOTER
// ================================================================
function Footer({setPage}){
  return(
    <footer style={{background:T.bg2,borderTop:`1px solid ${T.border}`,padding:"clamp(40px,6vw,60px) clamp(16px,4vw,40px) clamp(24px,3vw,32px)",marginTop:"clamp(40px,6vw,60px)"}}>
      <div className="wrap">
        <div className="footer-grid" style={{marginBottom:"clamp(32px,5vw,48px)"}}>
          <div>
            <div style={{marginBottom:14}}><Logo scale={.85}/></div>
            <p style={{fontSize:13,color:T.muted2,lineHeight:1.8,maxWidth:260}}>Free coding education. Powered by Firebase. Built for students. Always free.</p>
          </div>
          {[
            {title:"Tracks",links:[["Programming","courses"],["Web Dev","courses"],["DSA","courses"],["Cybersecurity","courses"],["CP","courses"]]},
            {title:"Platform",links:[["Home","home"],["Courses","courses"],["About","about"],["Login","login"]]},
            {title:"Resources",links:[["LeetCode","courses"],["Codeforces","courses"],["TryHackMe","courses"],["GitHub","courses"]]},
          ].map(col=>(
            <div key={col.title}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:14}}>{col.title}</div>
              {col.links.map(([l,p])=>(
                <div key={l} onClick={()=>setPage(p)} style={{fontSize:13,color:T.muted2,marginBottom:9,cursor:"pointer",transition:"color .2s"}}
                  onMouseEnter={e=>e.target.style.color=T.accent} onMouseLeave={e=>e.target.style.color=T.muted2}>{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="divider"/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10,paddingTop:"clamp(16px,2.5vw,24px)"}}>
          <p style={{fontSize:12,color:T.muted}}>© 2025 <span style={{color:T.accent,fontWeight:600}}>HackingSum.edu</span> · Free forever · Powered by Firebase</p>
          <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.accent}}>while(true)&#123;learn();build();hack();&#125;</p>
        </div>
      </div>
    </footer>
  );
}

// ================================================================
//  ROOT APP — Back button history + Notifications
// ================================================================
export default function App(){
  const [page,setPage]=useState("home");
  const [history,setHistory]=useState(["home"]);
  const [user,setUser]=useState(null);
  const [courses,setCourses]=useState([]);
  const [watch,setWatch]=useState(null);
  const [booting,setBooting]=useState(true);
  const [notifCount,setNotifCount]=useState(0);


  // Back button — go to previous page in history
  function goBack(){
    if(history.length>1){
      const prev=history[history.length-2];
      setHistory(h=>h.slice(0,-1));
      setPage(prev);
    }else{
      setPage("home");
    }
  }

  // Navigate with history tracking
  function navigate(p){
    setHistory(h=>{
      if(h[h.length-1]===p)return h;
      return [...h.slice(-9),p]; // keep last 10
    });
    setPage(p);
  }

  // Browser back button support
  useEffect(()=>{
    const handler=(e)=>{e.preventDefault();goBack();};
    window.addEventListener("popstate",handler);
    return()=>window.removeEventListener("popstate",handler);
  },[history]);

  // Firebase Auth listener
  useEffect(()=>{
    return onAuthStateChanged(auth,async fbUser=>{
      if(fbUser){
        // Check if this email belongs to an admin
        if(ADMINS.some(a=>a.email===fbUser.email)){
          setUser({uid:fbUser.uid, name:"Admin", email:fbUser.email, role:"admin"});
          return;
        }
        // Normal student
        const snap=await getDoc(doc(db,"users",fbUser.uid));
        const p=snap.exists()?snap.data():{};
        setUser({uid:fbUser.uid,name:fbUser.displayName||p.name||"Student",email:fbUser.email,
          role:p.role||"student",mobile:p.mobile||"",avatarColor:p.avatarColor||T.accent});
      }else{setUser(null);}
    });
  },[]);

  // Load courses
  useEffect(()=>{
    async function load(){
      await seedCoursesIfNeeded();
      try{
        const snap=await getDocs(query(collection(db,"courses"),orderBy("createdAt")));
        setCourses(snap.empty?SEED_COURSES:snap.docs.map(d=>({...d.data(),id:d.id})));
      }catch{setCourses(SEED_COURSES);}
      setBooting(false);
    }
    load().catch(()=>{setCourses(SEED_COURSES);setBooting(false);});
  },[]);

  // Notification count — unread notifications
  useEffect(()=>{
    const q=query(collection(db,"notifications"),orderBy("createdAt","desc"));
    const unsub=onSnapshot(q,snap=>{
      try{
        const readIds=JSON.parse(localStorage.getItem("hs_read")||"[]");
        setNotifCount(snap.docs.filter(d=>!readIds.includes(d.id)).length);
      }catch{setNotifCount(0);}
    },()=>{});
    return unsub;
  },[]);

  function logout(){signOut(auth);setUser(null);navigate("home");setHistory(["home"]);}

  // Auth guard
  useEffect(()=>{
    if(!user&&["dashboard","my-learning","watch","profile","notes","notifications"].includes(page))navigate("login");
    if(user?.role==="admin"&&["dashboard","my-learning"].includes(page))navigate("admin");
  },[page,user]);

  if(booting)return(
    <>
      <style>{CSS}</style>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",gap:20,background:T.bg}}>
        <Logo size={1.1}/>
        <Spinner size={28}/>
        <p style={{color:T.muted,fontSize:14,fontFamily:"'JetBrains Mono',monospace"}}>Connecting to Firebase...</p>
      </div>
    </>
  );

  // Back button - show on non-home pages
  const showBack=page!=="home"&&history.length>1;

  return(
    <>
      <style>{CSS}</style>
      <Navbar page={page} setPage={navigate} user={user} onLogout={logout} notifCount={notifCount}/>

      {/* Floating Back Button */}
      {showBack&&(
        <button onClick={goBack}
          style={{position:"fixed",bottom:"clamp(16px,3vw,28px)",right:"clamp(16px,3vw,28px)",zIndex:400,
            background:T.card,border:`1px solid ${T.border2}`,borderRadius:99,
            padding:"10px 18px",color:T.muted2,fontSize:13,fontWeight:600,cursor:"pointer",
            display:"flex",alignItems:"center",gap:7,boxShadow:"0 8px 32px rgba(0,0,0,.4)",
            transition:"all .2s",backdropFilter:"blur(12px)"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.color=T.accent;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border2;e.currentTarget.style.color=T.muted2;}}>
          ← Back
        </button>
      )}

      {page==="home"        &&<HomePage       setPage={navigate} courses={courses} user={user}/>}
      {page==="login"       &&<AuthPage        initMode="login"    setPage={navigate} setUser={setUser}/>}
      {page==="register"    &&<AuthPage        initMode="register" setPage={navigate} setUser={setUser}/>}
      {page==="courses"     &&<CoursesPage     courses={courses} setPage={navigate} setWatch={setWatch}/>}
      {page==="watch"       &&<WatchPage       watch={watch} setWatch={setWatch} courses={courses} setPage={navigate} user={user}/>}
      {page==="about"       &&<AboutPage       setPage={navigate}/>}
      {page==="notes"       &&<NotesPage       user={user} setPage={navigate}/>}
      {page==="notifications"&&user&&<NotificationsPage user={user} setPage={navigate}/>}
      {page==="profile"     &&user&&user.role!=="admin"&&<ProfilePage user={user} setUser={setUser} setPage={navigate}/>}
      {page==="dashboard"   &&user?.role!=="admin"&&<DashboardPage   user={user} courses={courses} setPage={navigate} setWatch={setWatch}/>}
      {page==="my-learning" &&user?.role!=="admin"&&<MyLearningPage  user={user} courses={courses} setPage={navigate} setWatch={setWatch}/>}
      {page==="quiz"        &&<QuizPage         user={user} courses={courses} setPage={navigate}/>}
      {page==="leaderboard" &&<LeaderboardPage  user={user} courses={courses} setPage={navigate}/>}
      {page==="placement"   &&<JobPlacementPage setPage={navigate}/>}
      {["admin","admin-courses","admin-notes","admin-quiz","admin-students"].includes(page)&&user?.role==="admin"&&
        <AdminPage tab={page==="admin-courses"?"courses":page==="admin-notes"?"notes":page==="admin-quiz"?"quiz":page==="admin-students"?"students":"overview"}
          courses={courses} setCourses={setCourses} setPage={navigate}/>
      }
    </>
  );
}
