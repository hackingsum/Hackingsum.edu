

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

const ADMIN_EMAIL    = "admin@hackingsum.edu";
const ADMIN_PASSWORD = "Admin@123";

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
  .hero-row{flex-direction:column;}
  .hero-right{display:none !important;}
  .hero-btns{flex-direction:column;}
  .hero-btns .btn-p,.hero-btns .btn-s{width:100%;justify-content:center;}
  .stats-row{grid-template-columns:repeat(2,1fr);}
  .stat-item:nth-child(2){border-right:none;}
  .stat-item:nth-child(3){border-top:1px solid ${T.border};}
  .stat-item:nth-child(4){border-top:1px solid ${T.border};border-right:none;}
  .grid-3{grid-template-columns:1fr;}
  .grid-auto{grid-template-columns:1fr;}
  .grid-cats{grid-template-columns:repeat(2,1fr);}
  .footer-grid{grid-template-columns:1fr 1fr;}
  .hide-mob{display:none !important;}
  .show-mob{display:flex !important;}
  .admin-split{grid-template-columns:1fr;}
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
      ?[{l:"Overview",p:"admin"},{l:"Courses",p:"admin-courses"},{l:"Notes",p:"admin-notes"},{l:"Students",p:"admin-students"}]
      :[{l:"Home",p:"home"},{l:"Dashboard",p:"dashboard"},{l:"Courses",p:"courses"},{l:"Notes",p:"notes"},{l:"My Learning",p:"my-learning"}]
    :[{l:"Home",p:"home"},{l:"Courses",p:"courses"},{l:"Notes",p:"notes"},{l:"About",p:"about"}];

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
        if(form.email===ADMIN_EMAIL&&form.password===ADMIN_PASSWORD){
          setUser({uid:"admin",name:"Admin",email:ADMIN_EMAIL,role:"admin"});
          setPage("admin");setLoading(false);return;
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
              {icon:"🏠",label:"Go to Home",pg:"home",color:T.muted2},
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
  const TABS=[{k:"overview",l:"📊 Overview"},{k:"courses",l:"📚 Courses"},{k:"notes",l:"📝 Notes"},{k:"students",l:"👥 Students"}];

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
      {["admin","admin-courses","admin-notes","admin-students"].includes(page)&&user?.role==="admin"&&
        <AdminPage tab={page==="admin-courses"?"courses":page==="admin-notes"?"notes":page==="admin-students"?"students":"overview"}
          courses={courses} setCourses={setCourses} setPage={navigate}/>
      }
    </>
  );
}
