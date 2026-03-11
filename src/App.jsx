
import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
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
  ...(import.meta.env.VITE_ADMIN2_EMAIL ? [{
    email:    import.meta.env.VITE_ADMIN2_EMAIL    || "",
    password: import.meta.env.VITE_ADMIN2_PASSWORD || "",
  }] : []),
].filter(a => a.email !== "");  // remove empty entries

const isAdmin = (email, pass) =>
  ADMINS.some(a => a.email === email && a.password === pass);

const ADMIN_EMAIL    = ADMINS[0]?.email    || "";
const ADMIN_PASSWORD = ADMINS[0]?.password || "";

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

const T = {
  bg:"#060d18",bg2:"#08111f",bg3:"#0e1d30",card:"#0a1628",
  border:"#132036",border2:"#1a2e4a",
  accent:"#00f5c4",blue:"#2196f3",pink:"#f0437a",
  amber:"#f59e0b",purple:"#a855f7",cyan:"#22d3ee",
  text:"#e2eeff",muted:"#3d5a7a",muted2:"#6b8fad",
  danger:"#f44336",success:"#22c55e",
};

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
.grid-auto{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:clamp(14px,2vw,22px);}
.grid-cats{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:clamp(10px,1.5vw,16px);}
/* Dashboard menu grid */
.dash-menu{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(10px,1.5vw,16px);}
/* Stats mini grid */
.dash-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(8px,1.5vw,14px);}
/* Resume tips grid */
.tips-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(12px,2vw,18px);}
/* Continue learning grid */
.continue-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(10px,1.8vw,16px);}

/* Watch layout */
.watch-layout{display:grid;grid-template-columns:1fr 340px;gap:clamp(14px,2vw,24px);align-items:start;}

/* Dashboard */
.dash-layout{display:grid;grid-template-columns:1fr 340px;gap:clamp(14px,2vw,22px);}

/* Admin */
.admin-split{display:grid;grid-template-columns:280px 1fr;gap:18px;}

/* Footer */


/* ---- TABLET 768-1024px ---- */
@media(max-width:1024px){
  .hero-right{flex:0 0 340px;width:340px;}
  .grid-4{grid-template-columns:repeat(2,1fr);}
  .dash-layout{grid-template-columns:1fr;}
  .dash-menu{grid-template-columns:repeat(4,1fr);}
  .dash-stats{grid-template-columns:repeat(4,1fr);}
  .tips-grid{grid-template-columns:repeat(2,1fr);}
  .continue-grid{grid-template-columns:repeat(2,1fr);}
  .watch-layout{grid-template-columns:1fr;}
  .admin-split{grid-template-columns:1fr;}
  
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
  
  .hide-mob{display:none !important;}
  .show-mob{display:flex !important;}
  .admin-split{grid-template-columns:1fr;}
  /* Dashboard menu — 2 columns on mobile */
  .dash-menu{grid-template-columns:repeat(2,1fr);}
  /* Stats — 2 columns on mobile */
  .dash-stats{grid-template-columns:repeat(2,1fr);}
  /* Resume tips — 1 column on mobile */
  .tips-grid{grid-template-columns:1fr;}
  /* Continue grid — 1 column on mobile */
  .continue-grid{grid-template-columns:1fr;}
  /* Better touch targets */
  .btn-p,.btn-s,.btn-g{min-height:44px;}
  .inp{min-height:44px;font-size:16px !important;}
  .card{border-radius:12px;}
  .page{padding-left:14px;padding-right:14px;}
  .sec{padding-top:clamp(40px,8vw,60px);padding-bottom:clamp(40px,8vw,60px);}
}

/* ROADMAP MOBILE */
@media(max-width:768px){
  .roadmap-card{width:100% !important;}
}

/* ---- SMALL MOBILE <480px ---- */
@media(max-width:600px){.footer-inline{grid-template-columns:1fr 1fr !important;}}
@media(max-width:480px){
  .grid-2{grid-template-columns:1fr;}
  .grid-4{grid-template-columns:1fr 1fr;}
  
  .auth-card{padding:24px 18px !important;}
  .dash-menu{grid-template-columns:repeat(2,1fr) !important;}
  .dash-stats{grid-template-columns:repeat(2,1fr) !important;}
}

/* ---- FOOTER RESPONSIVE ---- */
@media(max-width:768px){
  .footer-grid{grid-template-columns:1fr 1fr !important;gap:clamp(20px,4vw,32px) !important;}
}
@media(max-width:480px){
  .footer-grid{grid-template-columns:1fr !important;}
}

/* ---- LEADERBOARD RESPONSIVE ---- */
@media(max-width:600px){
  .lb-row{grid-template-columns:36px 1fr 56px 56px 56px !important;}
}

/* ---- WATCH PAGE SIDEBAR MOBILE ---- */
@media(max-width:768px){
  .watch-layout{grid-template-columns:1fr !important;}
}

/* ---- QUIZ RESULTS RESPONSIVE ---- */
@media(max-width:600px){
  .quiz-results-grid{grid-template-columns:1fr 1fr !important;}
}

/* ---- ABOUT PAGE RESPONSIVE ---- */
@media(max-width:768px){
  .about-numbers{grid-template-columns:repeat(3,1fr) !important;}
  .about-mission{grid-template-columns:1fr !important;}
  .about-tech{grid-template-columns:repeat(2,1fr) !important;}
}
@media(max-width:480px){
  .about-numbers{grid-template-columns:repeat(2,1fr) !important;}
  .about-tech{grid-template-columns:1fr 1fr !important;}
}

/* ---- QUIZ COURSE GRID ---- */
@media(max-width:1024px){
  .quiz-course-grid{grid-template-columns:repeat(2,1fr) !important;}
}
@media(max-width:600px){
  .quiz-course-grid{grid-template-columns:1fr !important;}
}

/* ---- JOB TABS ---- */
@media(max-width:600px){
  .job-tabs{flex-direction:column !important;}
  .job-tabs button{width:100% !important;}
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
@keyframes heroFloat{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-18px) rotate(.4deg)}66%{transform:translateY(-8px) rotate(-.3deg)}}
@keyframes heroGlow{0%,100%{opacity:.45}50%{opacity:.9}}
@keyframes heroReveal{from{opacity:0;transform:translateY(32px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes heroLine{from{width:0;opacity:0}to{width:100%;opacity:1}}
@keyframes mobMenuIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
@keyframes mobLinkIn{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
@keyframes footerGlow{0%,100%{opacity:.3}50%{opacity:.7}}
@keyframes typeWrite{from{width:0}to{width:100%}}
@keyframes cursorBlink{0%,100%{opacity:1}50%{opacity:0}}
`;

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
  if(sessionStorage.getItem("hs_seeded_v2"))return;
  sessionStorage.setItem("hs_seeded_v2","1");
  const snap=await getDocs(collection(db,"courses"));
  if(snap.empty) for(const c of SEED_COURSES) await setDoc(doc(db,"courses",c.id),{...c,createdAt:serverTimestamp()});
  // Learning paths — fb1..fb5 ko setDoc se ensure karo (merge:true taaki existing data na hate)
  const SEED_PATHS=[
    {id:"fb1",name:"Programming",icon:"⌨️",color:"#00f5c4",desc:"Python, C++",courseIds:[],order:0},
    {id:"fb2",name:"Web Dev",icon:"🌐",color:"#2196f3",desc:"HTML, CSS, JS",courseIds:[],order:1},
    {id:"fb3",name:"DSA",icon:"🧠",color:"#f0437a",desc:"Data Structures",courseIds:[],order:2},
    {id:"fb4",name:"Cybersecurity",icon:"🔐",color:"#a855f7",desc:"Hacking fundamentals",courseIds:[],order:3},
    {id:"fb5",name:"Competitive",icon:"🏆",color:"#f59e0b",desc:"CP & contests",courseIds:[],order:4},
  ];
  for(const p of SEED_PATHS){
    const ref=doc(db,"learning_paths",p.id);
    const existing=await getDoc(ref);
    if(!existing.exists()) await setDoc(ref,{...p,createdAt:serverTimestamp()});
  }
}

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

function Logo({size=1,onClick}){
  return(
    <div onClick={onClick} style={{cursor:onClick?"pointer":"default",flexShrink:0,userSelect:"none",display:"inline-flex",alignItems:"center",gap:0,position:"relative"}}>
      <span style={{
        fontFamily:"'Plus Jakarta Sans',sans-serif",
        fontWeight:900,
        fontSize:Math.round(20*size),
        letterSpacing:-1.2,
        color:"#fff",
        lineHeight:1,
      }}>Hacking</span><span style={{
        fontFamily:"'Plus Jakarta Sans',sans-serif",
        fontWeight:900,
        fontSize:Math.round(20*size),
        letterSpacing:-1.2,
        background:`linear-gradient(120deg,${T.accent} 20%,${T.blue} 100%)`,
        WebkitBackgroundClip:"text",
        WebkitTextFillColor:"transparent",
        lineHeight:1,
      }}>Sum</span><span style={{
        position:"relative",
        display:"inline-flex",
        alignItems:"flex-end",
        marginLeft:Math.round(1*size),
        paddingBottom:Math.round(2*size),
      }}>
        <span style={{
          fontFamily:"'JetBrains Mono',monospace",
          fontWeight:700,
          fontSize:Math.round(10.5*size),
          color:T.accent,
          lineHeight:1,
          opacity:0.95,
        }}>.edu</span>
        <span style={{
          position:"absolute",
          bottom:0,
          left:"50%",
          transform:"translateX(-50%)",
          width:Math.round(3*size),
          height:Math.round(3*size),
          borderRadius:"50%",
          background:T.accent,
          boxShadow:`0 0 ${6*size}px ${T.accent}`,
        }}/>
      </span>
    </div>
  );
}

function Navbar({page,setPage,user,onLogout,notifCount=0}){
  const [mob,setMob]=useState(false);
  const [sc,setSc]=useState(false);

  useEffect(()=>{const f=()=>setSc(window.scrollY>20);window.addEventListener("scroll",f);return()=>window.removeEventListener("scroll",f);},[]);

  const closeMob=()=>setMob(false);

  const links=user
    ?user.role==="admin"
      ?[{l:"Overview",p:"admin"},{l:"Courses",p:"admin-courses"},{l:"Notes",p:"admin-notes"},{l:"Quiz",p:"admin-quiz"},{l:"Students",p:"admin-students"}]
      :[{l:"Home",p:"home"},{l:"Dashboard",p:"dashboard"},{l:"Courses",p:"courses"},{l:"Notes",p:"notes"},{l:"Quiz",p:"quiz"},{l:"Jobs",p:"placement"},{l:"🏆",p:"leaderboard"}]
    :[{l:"Home",p:"home"},{l:"Courses",p:"courses"},{l:"Quiz",p:"quiz"},{l:"Notes",p:"notes"},{l:"Jobs",p:"placement"},{l:"About",p:"about"}];

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
          <div className="nav-desk" style={{display:"flex",alignItems:"center",gap:2}}>
            {links.map(({l,p})=>(
              <button key={p} className="btn-g" onClick={()=>go(p)}
                style={{color:page===p?T.accent:T.muted2,fontWeight:page===p?700:400,fontSize:14}}>{l}</button>
            ))}
          </div>
          <div className="nav-desk" style={{display:"flex",alignItems:"center",gap:10}}>
            {user?(
              <>
                <button onClick={()=>go("notifications")} style={{position:"relative",background:"none",border:"none",cursor:"pointer",padding:6,color:T.muted2,transition:"color .2s"}}
                  onMouseEnter={e=>e.currentTarget.style.color=T.accent} onMouseLeave={e=>e.currentTarget.style.color=T.muted2}>
                  <span style={{fontSize:18}}>🔔</span>
                  {notifCount>0&&<span style={{position:"absolute",top:2,right:2,width:16,height:16,borderRadius:"50%",background:T.pink,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{notifCount>9?"9+":notifCount}</span>}
                </button>
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
          <button className="nav-mob-btn"
            onClick={()=>setMob(m=>!m)}
            style={{background:"none",border:"none",padding:"6px 8px",flexDirection:"column",gap:5,alignItems:"center",cursor:"pointer",zIndex:10,position:"relative"}}>
            <span style={{display:"block",width:22,height:2,background:T.text,borderRadius:2,transition:"all .3s",transform:mob?"rotate(45deg) translate(5px,5px)":"none"}}/>
            <span style={{display:"block",width:22,height:2,background:T.text,borderRadius:2,transition:"all .3s",opacity:mob?0:1}}/>
            <span style={{display:"block",width:22,height:2,background:T.text,borderRadius:2,transition:"all .3s",transform:mob?"rotate(-45deg) translate(5px,-5px)":"none"}}/>
          </button>
        </div>
        {mob&&(
          <div style={{
            background:"rgba(6,13,24,.98)",
            borderTop:`1px solid ${T.accent}22`,
            animation:"mobMenuIn .28s cubic-bezier(.22,1,.36,1) both",
          }}>
            <div style={{padding:"10px 0 4px"}}>
              {links.map(({l,p},i)=>(
                <button key={p} onClick={()=>go(p)}
                  style={{
                    display:"flex",alignItems:"center",width:"100%",
                    padding:"13px clamp(20px,5vw,28px)",
                    background:page===p?`${T.accent}0d`:"transparent",border:"none",
                    borderLeft:page===p?`3px solid ${T.accent}`:"3px solid transparent",
                    color:page===p?T.accent:T.text,fontWeight:page===p?700:500,fontSize:15,
                    textAlign:"left",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",
                    transition:"all .15s",
                    animation:`mobLinkIn .3s cubic-bezier(.22,1,.36,1) ${i*.045}s both`,
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background=`${T.accent}08`}
                  onMouseLeave={e=>e.currentTarget.style.background=page===p?`${T.accent}0d`:"transparent"}>
                  {l}
                </button>
              ))}
            </div>
            <div style={{
              margin:"4px clamp(16px,5vw,24px) 20px",
              padding:"16px",
              borderRadius:14,
              border:`1px solid ${T.border}`,
              background:T.bg2,
              animation:`mobLinkIn .3s cubic-bezier(.22,1,.36,1) ${links.length*.045}s both`,
            }}>
              {user?(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{fontSize:12,color:T.muted,fontFamily:"'JetBrains Mono',monospace",marginBottom:4}}>
                    👋 {user.name?.split(" ")[0]}
                  </div>
                  <button onClick={()=>go("profile")} className="btn-s" style={{width:"100%",padding:11,textAlign:"center",fontSize:13}}>
                    My Profile
                  </button>
                  <button className="btn-r" onClick={()=>{onLogout();closeMob();}} style={{width:"100%",padding:11,fontSize:13}}>
                    Logout
                  </button>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{fontSize:11,color:T.muted,marginBottom:2,textAlign:"center"}}>
                    Join 1000+ students learning for free
                  </div>
                  <button className="btn-p" onClick={()=>go("register")} style={{width:"100%",padding:12,fontSize:14}}>Get Started Free →</button>
                  <button className="btn-s" onClick={()=>go("login")} style={{width:"100%",padding:11,textAlign:"center",fontSize:13}}>Login</button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

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

const PATH_ICONS=["⌨️","🌐","🧠","🔐","🏆","🐍","⚙️","📱","☁️","🎯","🔥","💡","🛡️","📊","🎮"];

function PathSection({courses,setPage,user}){
  const [paths,setPaths]=useState([]);
  const [loaded,setLoaded]=useState(false);
  const [editPath,setEditPath]=useState(null); // {id,name,icon,color,desc,courseIds} or "new"
  const [form,setForm]=useState({name:"",icon:"⌨️",color:"#00f5c4",desc:"",courseIds:[]});
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState("");
  const isAdmin=user?.role==="admin";

  const msg=t=>{setToast(t);setTimeout(()=>setToast(""),3000);};

  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"learning_paths"),snap=>{
      const data=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order||0)-(b.order||0));
      setPaths(data);setLoaded(true);
    },()=>setLoaded(true));
    return unsub;
  },[]);

  const FALLBACK=[
    {id:"fb1",name:"Programming",icon:"⌨️",color:T.accent,desc:"Python, C++",courseIds:[]},
    {id:"fb2",name:"Web Dev",icon:"🌐",color:T.blue,desc:"HTML, CSS, JS",courseIds:[]},
    {id:"fb3",name:"DSA",icon:"🧠",color:T.pink,desc:"Data Structures",courseIds:[]},
    {id:"fb4",name:"Cybersecurity",icon:"🔐",color:T.purple,desc:"Hacking fundamentals",courseIds:[]},
    {id:"fb5",name:"Competitive",icon:"🏆",color:T.amber,desc:"CP & contests",courseIds:[]},
  ];

  const display=paths.length>0?paths:FALLBACK;

  function openEdit(p){
    setForm({name:p.name||"",icon:p.icon||"⌨️",color:p.color||T.accent,desc:p.desc||"",courseIds:p.courseIds||[]});
    setEditPath(p);
  }
  function openNew(){
    setForm({name:"",icon:"⌨️",color:"#00f5c4",desc:"",courseIds:[]});
    setEditPath("new");
  }
  function cancelEdit(){setEditPath(null);}

  function toggleCourse(cid){
    setForm(f=>({...f,courseIds:f.courseIds.includes(cid)?f.courseIds.filter(x=>x!==cid):[...f.courseIds,cid]}));
  }

  async function savePath(){
    if(!form.name.trim()){msg("❌ Path name is required.");return;}
    setSaving(true);
    try{
      if(editPath==="new"){
        await addDoc(collection(db,"learning_paths"),{...form,order:paths.length,createdAt:serverTimestamp()});
        msg("✅ Path created!");
      }else{
        // Har path ka Firebase mein real ID hai (fb1,fb2... ya auto-generated)
        await updateDoc(doc(db,"learning_paths",editPath.id),{
          name:form.name, icon:form.icon, color:form.color,
          desc:form.desc, courseIds:form.courseIds
        });
        msg("✅ Path updated!");
      }
      setEditPath(null);
    }catch(e){msg("❌ "+e.message);}
    setSaving(false);
  }

  async function deletePath(p){
    if(!window.confirm(`Delete "${p.name}" path?`))return;
    try{await deleteDoc(doc(db,"learning_paths",p.id));msg("🗑 Path deleted.");}
    catch(e){msg("❌ "+e.message);}
  }

  return(
    <div className="divider-wrap">
      <div className="divider"/>
      <section className="sec" style={{background:T.bg2}}>
        <div className="wrap">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"clamp(24px,4vw,40px)",flexWrap:"wrap",gap:12}}>
            <div>
              <div className="stag">Learning Tracks</div>
              <h2 style={{fontWeight:800,fontSize:"clamp(24px,4vw,42px)",letterSpacing:"-1.5px"}}>
                Choose Your <span className="gt2">Path</span>
              </h2>
            </div>
            {isAdmin&&(
              <button className="btn-p" onClick={openNew}
                style={{padding:"9px 20px",fontSize:13,borderRadius:10}}>
                + New Path
              </button>
            )}
          </div>

          {toast&&<div style={{background:T.card,border:`1px solid ${T.accent}33`,borderRadius:8,
            padding:"10px 14px",fontSize:13,marginBottom:16,color:T.accent}}>{toast}</div>}

          {/* Inline edit/create form for admin */}
          {isAdmin&&editPath&&(
            <div className="afu" style={{background:T.card,border:`1px solid ${T.accent}33`,
              borderRadius:14,padding:"clamp(16px,2.5vw,24px)",marginBottom:24}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:16,color:T.accent}}>
                {editPath==="new"?"➕ Create New Path":"✏️ Edit Path — "+editPath.name}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:12}}>
                <div>
                  <label className="lbl">Path Name *</label>
                  <input className="inp" value={form.name} placeholder="e.g. Web Developer"
                    onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
                </div>
                <div>
                  <label className="lbl">Description</label>
                  <input className="inp" value={form.desc} placeholder="Short description..."
                    onChange={e=>setForm(f=>({...f,desc:e.target.value}))}/>
                </div>
                <div>
                  <label className="lbl">Accent Color</label>
                  <input type="color" className="inp" value={form.color}
                    onChange={e=>setForm(f=>({...f,color:e.target.value}))}
                    style={{height:46,padding:4,cursor:"pointer"}}/>
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <label className="lbl">Icon</label>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
                  {PATH_ICONS.map(ic=>(
                    <button key={ic} onClick={()=>setForm(f=>({...f,icon:ic}))}
                      style={{width:36,height:36,borderRadius:8,
                        border:`2px solid ${form.icon===ic?form.color:T.border}`,
                        background:form.icon===ic?`${form.color}20`:"transparent",
                        fontSize:16,cursor:"pointer",transition:"all .15s"}}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <label className="lbl">Courses in this path</label>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:6}}>
                  {courses.map(c=>(
                    <button key={c.id} onClick={()=>toggleCourse(c.id)}
                      style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,
                        border:`1px solid ${form.courseIds.includes(c.id)?c.color:T.border}`,
                        background:form.courseIds.includes(c.id)?`${c.color}18`:T.bg3,
                        color:form.courseIds.includes(c.id)?c.color:T.muted2,
                        fontSize:12,cursor:"pointer",transition:"all .15s"}}>
                      <span>{c.icon}</span>{c.title.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <button className="btn-p" onClick={savePath} disabled={saving||!form.name.trim()}
                  style={{padding:"10px 24px",fontSize:13}}>
                  {saving?"Saving...":(editPath==="new"?"Create Path":"Update Path")}
                </button>
                <button className="btn-s" onClick={cancelEdit} style={{padding:"10px 18px",fontSize:13}}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(clamp(140px,18vw,200px),1fr))",gap:"clamp(10px,1.5vw,16px)"}}>
            {display.map((p,i)=>{
              const count=p.courseIds?.length||courses.filter(x=>x.category===p.name).length;
              const isFallback=p.id?.startsWith("fb");
              return(
                <div key={p.id} style={{position:"relative",animation:`fadeUp .5s ease ${i*.08}s both`}}>
                  <button onClick={()=>setPage("courses")} className="card card-h"
                    style={{
                      width:"100%",
                      padding:"clamp(18px,2.5vw,26px) clamp(12px,2vw,18px)",
                      textAlign:"center",color:T.text,cursor:"pointer",
                      border:`1px solid ${T.border}`,
                      position:"relative",overflow:"hidden",background:T.card,
                    }}>
                    <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${p.color||T.accent},${p.color||T.accent}44)`}}/>
                    <div style={{fontSize:"clamp(24px,3.5vw,32px)",marginBottom:10}}>{p.icon||"⌨️"}</div>
                    <div style={{fontWeight:700,fontSize:"clamp(12px,1.4vw,14px)",color:p.color||T.accent,marginBottom:4}}>{p.name}</div>
                    {p.desc&&<div style={{fontSize:10,color:T.muted,marginBottom:5,lineHeight:1.4}}>{p.desc}</div>}
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted}}>
                      {count>0?`${count} course${count!==1?"s":""}`:"Explore"}
                    </div>
                  </button>
                  {/* Admin edit/delete overlay buttons */}
                  {isAdmin&&(
                    <div style={{position:"absolute",top:6,right:6,display:"flex",gap:4,zIndex:10}}>
                      <button onClick={e=>{e.stopPropagation();openEdit(p);}}
                        title="Edit path"
                        style={{width:26,height:26,borderRadius:6,border:`1px solid ${T.accent}55`,
                          background:`${T.bg}cc`,color:T.accent,fontSize:12,cursor:"pointer",
                          display:"flex",alignItems:"center",justifyContent:"center",
                          backdropFilter:"blur(4px)",transition:"all .15s"}}
                        onMouseEnter={e=>e.currentTarget.style.background=`${T.accent}22`}
                        onMouseLeave={e=>e.currentTarget.style.background=`${T.bg}cc`}>
                        ✏️
                      </button>
                      {!isFallback&&(
                        <button onClick={e=>{e.stopPropagation();deletePath(p);}}
                          title="Delete path"
                          style={{width:26,height:26,borderRadius:6,border:`1px solid ${T.danger}55`,
                            background:`${T.bg}cc`,color:T.danger,fontSize:12,cursor:"pointer",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            backdropFilter:"blur(4px)",transition:"all .15s"}}
                          onMouseEnter={e=>e.currentTarget.style.background=`${T.danger}22`}
                          onMouseLeave={e=>e.currentTarget.style.background=`${T.bg}cc`}>
                          🗑
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function HomePage({setPage,courses,user}){
  const cats=[
    {name:"Programming",icon:"⌨️",color:T.accent},{name:"Web Dev",icon:"🌐",color:T.blue},
    {name:"DSA",icon:"🧠",color:T.pink},{name:"Cybersecurity",icon:"🔐",color:T.purple},{name:"CP",icon:"🏆",color:T.amber},
  ];

  return(
    <div>
      <section style={{
        minHeight:"100vh",display:"flex",alignItems:"center",
        background:T.bg,
        position:"relative",overflow:"hidden"}}>

        <div style={{position:"absolute",top:"-10%",right:"-8%",width:"clamp(300px,45vw,600px)",height:"clamp(300px,45vw,600px)",background:`radial-gradient(circle,${T.accent}0d 0%,transparent 65%)`,pointerEvents:"none",animation:"heroFloat 9s ease-in-out infinite"}}/>
        <div style={{position:"absolute",bottom:"-5%",left:"-6%",width:"clamp(200px,32vw,440px)",height:"clamp(200px,32vw,440px)",background:`radial-gradient(circle,${T.blue}0a 0%,transparent 65%)`,pointerEvents:"none",animation:"heroFloat 12s ease-in-out infinite reverse"}}/>
        <div style={{position:"absolute",top:"40%",left:"35%",width:"clamp(100px,18vw,260px)",height:"clamp(100px,18vw,260px)",background:`radial-gradient(circle,${T.purple}06 0%,transparent 65%)`,pointerEvents:"none",animation:"heroFloat 7s ease-in-out infinite 2s"}}/>

        <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(${T.border}28 1px,transparent 1px),linear-gradient(90deg,${T.border}28 1px,transparent 1px)`,backgroundSize:"60px 60px",pointerEvents:"none",opacity:.35}}/>

        <div className="wrap" style={{width:"100%",position:"relative",zIndex:1}}>
          <div className="hero-row">
            <div className="hero-left">

              <div style={{
                display:"inline-flex",alignItems:"center",gap:8,
                marginBottom:"clamp(18px,3vw,28px)",
                background:`${T.accent}0d`,border:`1px solid ${T.accent}2e`,
                padding:"7px 16px",borderRadius:99,
                animation:"heroReveal .7s cubic-bezier(.22,1,.36,1) both",
              }}>
                <span style={{width:6,height:6,borderRadius:"50%",background:T.accent,boxShadow:`0 0 8px ${T.accent}`,animation:"pulse 2s infinite",flexShrink:0}}/>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"clamp(9px,1.1vw,11px)",color:T.accent,letterSpacing:1.8}}>FREE CODING UNIVERSITY</span>
              </div>

              <h1 className="hero-h1" style={{
                marginBottom:"clamp(16px,2.5vw,24px)",
                animation:"heroReveal .7s cubic-bezier(.22,1,.36,1) .1s both",
              }}>
                <span className="gt">Master Code.</span><br/>
                <span style={{color:"#fff"}}>Build Anything.</span>
              </h1>

              <div style={{
                width:"clamp(48px,6vw,72px)",height:3,
                background:`linear-gradient(90deg,${T.accent},${T.blue})`,
                borderRadius:99,marginBottom:"clamp(16px,2.5vw,22px)",
                animation:"heroLine .8s cubic-bezier(.22,1,.36,1) .2s both",
              }}/>

              <p className="hero-sub" style={{
                marginBottom:"clamp(28px,4vw,42px)",
                animation:"heroReveal .7s cubic-bezier(.22,1,.36,1) .2s both",
              }}>
                From your first <span style={{color:T.accent,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.9em"}}>"Hello World"</span> to landing your dream tech job —{" "}
                <strong style={{color:T.text}}>Python, C++, Web Dev, DSA, CP &amp; Cybersecurity</strong>, completely free.
              </p>

              <div className="hero-btns" style={{
                marginBottom:"clamp(32px,5vw,48px)",
                animation:"heroReveal .7s cubic-bezier(.22,1,.36,1) .3s both",
              }}>
                <button className="btn-p" onClick={()=>setPage(user?"courses":"register")} style={{borderRadius:12,gap:10}}>
                  {user?"Browse Courses →":"Start Learning Free →"}
                </button>
                <button className="btn-s" onClick={()=>setPage("courses")} style={{borderRadius:12}}>View All Courses</button>
              </div>

              <div style={{
                borderTop:`1px solid ${T.border}`,
                paddingTop:"clamp(22px,3vw,34px)",
                animation:"heroReveal .7s cubic-bezier(.22,1,.36,1) .4s both",
              }}>
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

            <div className="hero-right" style={{animation:"heroReveal .9s cubic-bezier(.22,1,.36,1) .15s both"}}>
              <div style={{position:"relative"}}>
                <div style={{
                  position:"absolute",inset:-1,borderRadius:18,
                  background:`linear-gradient(135deg,${T.accent}44,${T.blue}22,transparent 60%)`,
                  filter:"blur(1px)",zIndex:0,
                }}/>
                <div style={{
                  position:"absolute",top:-24,right:-24,width:120,height:120,
                  borderRadius:"50%",background:`radial-gradient(${T.accent}18,transparent 70%)`,
                  animation:"heroFloat 6s ease-in-out infinite",
                  pointerEvents:"none",
                }}/>
                <div className="glass" style={{
                  overflow:"hidden",position:"relative",zIndex:1,
                  boxShadow:`0 40px 100px rgba(0,0,0,.6),0 0 0 1px ${T.accent}18`,
                  borderRadius:16,
                  animation:"heroFloat 8s ease-in-out infinite 1s",
                }}>
                  <div style={{padding:"18px 22px 14px",background:`linear-gradient(135deg,${T.accent}12,${T.blue}06)`,borderBottom:`1px solid ${T.border}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                      {["#f44336","#ff9800","#4caf50"].map(c=>(
                        <div key={c} style={{width:10,height:10,borderRadius:"50%",background:c,opacity:.8}}/>
                      ))}
                    </div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.accent,letterSpacing:2,marginBottom:6}}>🔥 FEATURED COURSE</div>
                    <div style={{fontWeight:800,fontSize:"clamp(15px,1.8vw,19px)",marginBottom:3}}>Python Zero to Hero</div>
                    <div style={{fontSize:12,color:T.muted2}}>Start your coding journey today</div>
                  </div>
                  {SEED_COURSES[0].videos.slice(0,4).map((v,i)=>(
                    <div key={v.id} style={{
                      display:"flex",alignItems:"center",gap:12,padding:"11px 22px",
                      borderBottom:`1px solid ${T.border}55`,
                      background:i===0?`${T.accent}07`:"transparent",
                      transition:"background .2s",
                    }}>
                      <div style={{
                        width:26,height:26,borderRadius:"50%",flexShrink:0,
                        background:i===0?T.accent:`${T.accent}15`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:9,color:i===0?T.bg:T.accent,fontWeight:800,
                      }}>{i===0?"▶":i+1}</div>
                      <span style={{fontSize:12,color:i===0?T.text:T.muted2,flex:1,lineHeight:1.4}}>{v.title}</span>
                      <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:T.muted,flexShrink:0}}>{v.duration}</span>
                    </div>
                  ))}
                  <div style={{padding:"14px 22px"}}>
                    <button className="btn-p" onClick={()=>setPage(user?"courses":"register")} style={{width:"100%",borderRadius:8,padding:11,fontSize:13}}>
                      {user?"Watch Now →":"Enroll Free →"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"/>
      <PathSection courses={courses} setPage={setPage} user={user}/>

      <div className="divider"/>
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
      <section className="sec" style={{background:T.bg2}}>
        <div className="wrap">
          <div className="stag">Learning Roadmap</div>
          <h2 style={{fontWeight:800,fontSize:"clamp(22px,3.5vw,42px)",letterSpacing:"-1.5px",marginBottom:8}}>
            Your Path to <span className="gt2">Mastery</span>
          </h2>
          <p style={{color:T.muted2,fontSize:"clamp(13px,1.5vw,15px)",marginBottom:"clamp(28px,4vw,48px)",maxWidth:520}}>
            Step-by-step guide — from complete beginner to industry-ready professional.
          </p>
          <div style={{position:"relative",maxWidth:860,margin:"0 auto"}}>
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
      {!user&&<>
        <div className="divider"/>
        <section className="sec" style={{background:`linear-gradient(135deg,${T.accent}06,${T.blue}04)`}}>
          <div className="wrap" style={{maxWidth:640,margin:"0 auto",textAlign:"center"}}>
            <div style={{fontSize:"clamp(36px,6vw,52px)",marginBottom:18}}>🚀</div>
            <h2 style={{fontWeight:800,fontSize:"clamp(24px,4vw,42px)",letterSpacing:"-1.5px",marginBottom:14}}>
              Ready to Become a <span className="gt3">Hacker</span>?
            </h2>
            <p style={{color:T.muted2,fontSize:"clamp(13px,1.5vw,15px)",lineHeight:1.8,marginBottom:32}}>
              Join thousands of students. Free forever. No credit card. No hidden fees.
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
        if(isAdmin(form.email, form.password)){
          try{
            const res = await signInWithEmailAndPassword(auth, form.email, form.password);
            setUser({uid:res.user.uid, name:"Admin", email:form.email, role:"admin"});
          }catch(e){
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

function DashboardPage({user,courses,setPage,setWatch,progress}){
  const prog=progress||{};

  const {totalV,watchedV,pct,inProg,done}=useMemo(()=>{
    const totalV=courses.reduce((a,c)=>a+c.videos.length,0);
    const watchedV=courses.reduce((a,c)=>a+(prog[c.id]||[]).length,0);
    const pct=totalV>0?Math.round((watchedV/totalV)*100):0;
    const inProg=courses.filter(c=>{const w=(prog[c.id]||[]).length;return w>0&&w<c.videos.length;});
    const done=courses.filter(c=>c.videos.length>0&&c.videos.every(v=>(prog[c.id]||[]).includes(v.id)));
    return{totalV,watchedV,pct,inProg,done};
  },[courses,prog]);

  const MENU=[
    {icon:"📚",label:"Courses",desc:"All video courses",pg:"courses",color:T.accent},
    {icon:"🎬",label:"My Learning",desc:"Track your progress",pg:"my-learning",color:T.blue},
    {icon:"🧠",label:"Quiz",desc:"Test yourself",pg:"quiz",color:T.pink},
    {icon:"📝",label:"Notes",desc:"Study material",pg:"notes",color:T.purple},
    {icon:"🏆",label:"Leaderboard",desc:"Top students",pg:"leaderboard",color:T.amber},
    {icon:"💼",label:"Job Placement",desc:"Resume & interview",pg:"placement",color:T.cyan},
    {icon:"🔔",label:"Notifications",desc:"Latest updates",pg:"notifications",color:"#f59e0b"},
    {icon:"👤",label:"Profile",desc:"Edit your profile",pg:"profile",color:"#a855f7"},
  ];

  return(
    <div className="page" style={{maxWidth:1100,margin:"0 auto"}}>
      <div className="afu" style={{marginBottom:"clamp(22px,3vw,36px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"clamp(14px,2.5vw,22px)",flexWrap:"wrap"}}>
          <div style={{width:"clamp(52px,8vw,68px)",height:"clamp(52px,8vw,68px)",borderRadius:"50%",flexShrink:0,
            background:`linear-gradient(135deg,${user?.avatarColor||T.accent},${T.blue})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontWeight:800,fontSize:"clamp(20px,3.5vw,28px)",color:T.bg,
            boxShadow:`0 0 0 3px ${T.bg}, 0 0 0 5px ${user?.avatarColor||T.accent}44`}}>
            {user?.name?.[0]?.toUpperCase()||"S"}
          </div>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"clamp(9px,1.2vw,11px)",
              color:T.accent,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>
              Student Dashboard
            </div>
            <h1 style={{fontWeight:800,fontSize:"clamp(20px,3.5vw,34px)",letterSpacing:"-1px",lineHeight:1.1}}>
              Welcome back, <span className="gt2">{user?.name?.split(" ")[0]||"Student"}</span> 👋
            </h1>
          </div>
        </div>
      </div>
      <div className="card afu" style={{padding:"clamp(16px,3vw,28px)",marginBottom:"clamp(18px,3vw,28px)",
        background:`linear-gradient(135deg,${T.accent}08,${T.blue}05)`,
        border:`1px solid ${T.accent}22`,display:"flex",alignItems:"center",
        gap:"clamp(16px,3vw,28px)",flexWrap:"wrap"}}>
        <ProgressRing pct={pct} size={80} stroke={7} color={T.accent}/>
        <div style={{flex:1,minWidth:160}}>
          <div style={{fontWeight:800,fontSize:"clamp(14px,2vw,18px)",marginBottom:6}}>Overall Progress</div>
          <div style={{height:8,background:T.border,borderRadius:99,marginBottom:8,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pct}%`,
              background:`linear-gradient(90deg,${T.accent},${T.blue})`,
              borderRadius:99,transition:"width 1.2s ease"}}/>
          </div>
          <div style={{fontSize:"clamp(11px,1.3vw,13px)",color:T.muted2}}>
            <span style={{color:T.accent,fontWeight:700}}>{watchedV}</span> of <span style={{fontWeight:600}}>{totalV}</span> videos watched
            &nbsp;·&nbsp;
            <span style={{color:T.success,fontWeight:700}}>{done.length}</span> course{done.length!==1?"s":""} completed
          </div>
        </div>
        {pct===0&&(
          <button className="btn-p" onClick={()=>setPage("courses")}
            style={{padding:"10px 22px",fontSize:13,flexShrink:0,whiteSpace:"nowrap"}}>
            Start Learning →
          </button>
        )}
      </div>
      <div style={{fontWeight:800,fontSize:"clamp(15px,2vw,18px)",marginBottom:"clamp(12px,2vw,18px)",
        color:T.text,letterSpacing:"-0.5px"}}>
        📌 Quick Navigation
      </div>
      <div className="dash-menu" style={{marginBottom:"clamp(22px,3vw,36px)"}}>
        {MENU.map((m,i)=>(
          <button key={m.pg} onClick={()=>setPage(m.pg)}
            style={{
              background:T.card,
              border:"1.5px solid "+T.border,
              borderRadius:16,
              padding:"clamp(16px,2.5vw,22px) clamp(12px,1.5vw,16px)",
              cursor:"pointer",
              display:"flex",flexDirection:"column",
              alignItems:"center",
              gap:"clamp(6px,1.2vw,10px)",
              textAlign:"center",
              transition:"all .2s ease",
              animation:"fadeUp .4s ease "+(i*.05)+"s both",
              minWidth:0,overflow:"hidden",
            }}
            onMouseEnter={e=>{
              e.currentTarget.style.borderColor=m.color;
              e.currentTarget.style.transform="translateY(-4px)";
              e.currentTarget.style.boxShadow=`0 12px 32px ${m.color}22`;
              e.currentTarget.style.background=`${m.color}08`;
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.borderColor=T.border;
              e.currentTarget.style.transform="translateY(0)";
              e.currentTarget.style.boxShadow="none";
              e.currentTarget.style.background=T.card;
            }}>
            <div style={{
              width:"clamp(44px,7vw,58px)",height:"clamp(44px,7vw,58px)",
              borderRadius:"50%",
              background:`${m.color}15`,
              border:`1.5px solid ${m.color}33`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"clamp(20px,3.5vw,26px)",
              flexShrink:0,
            }}>
              {m.icon}
            </div>
            <div>
              <div style={{fontWeight:800,fontSize:"clamp(12px,1.6vw,14px)",color:T.text,marginBottom:3}}>
                {m.label}
              </div>
              <div style={{fontSize:"clamp(10px,1.2vw,11px)",color:T.muted,lineHeight:1.4}}>
                {m.desc}
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="dash-stats" style={{marginBottom:"clamp(22px,3vw,36px)"}}>
        {[
          {l:"Courses Available",v:courses.length,i:"📚",c:T.accent},
          {l:"Videos Watched",v:watchedV,i:"🎬",c:T.blue},
          {l:"Total Videos",v:totalV,i:"📹",c:T.muted2},
          {l:"Completed",v:done.length,i:"✅",c:T.success},
        ].map((s,i)=>(
          <div key={s.l} className="card" style={{padding:"clamp(14px,2vw,20px)",textAlign:"center",
            animation:`fadeUp .4s ease ${i*.06}s both`}}>
            <div style={{fontSize:"clamp(18px,3vw,24px)",marginBottom:6}}>{s.i}</div>
            <div style={{fontWeight:800,fontSize:"clamp(18px,2.5vw,26px)",color:s.c,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:"clamp(10px,1.1vw,11px)",color:T.muted,marginTop:4,lineHeight:1.3}}>{s.l}</div>
          </div>
        ))}
      </div>
      {(inProg.length>0||courses.length>0)&&(
        <>
          <div style={{fontWeight:800,fontSize:"clamp(15px,2vw,18px)",marginBottom:"clamp(12px,2vw,16px)",letterSpacing:"-0.5px"}}>
            {inProg.length>0?"▶ Continue Learning":"🚀 Start a Course"}
          </div>
          <div className="continue-grid">
            {(inProg.length>0?inProg:courses).slice(0,3).map((c,i)=>{
              const w=(prog[c.id]||[]).length;
              const p=Math.round((w/c.videos.length)*100);
              const next=c.videos.find(v=>!(prog[c.id]||[]).includes(v.id))||c.videos[0];
              return(
                <div key={c.id} className="card" onClick={()=>{setWatch({course:c,video:next});setPage("watch");}}
                  style={{padding:"clamp(14px,2.5vw,20px)",cursor:"pointer",
                    position:"relative",overflow:"hidden",
                    transition:"all .2s",animation:`fadeUp .4s ease ${i*.07}s both`}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=c.color;e.currentTarget.style.transform="translateY(-3px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform="translateY(0)";}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:c.color}}/>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                    <span style={{fontSize:"clamp(22px,3.5vw,30px)"}}>{c.icon}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:"clamp(12px,1.5vw,14px)",
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div>
                      <div style={{fontSize:"clamp(10px,1.2vw,11px)",color:T.muted2,marginTop:2}}>
                        {w}/{c.videos.length} videos
                      </div>
                    </div>
                    <span className="badge" style={{background:`${c.color}18`,color:c.color,
                      border:`1px solid ${c.color}33`,fontSize:10,flexShrink:0}}>{p}%</span>
                  </div>
                  <div style={{background:T.bg3,borderRadius:99,height:5,overflow:"hidden"}}>
                    <div style={{width:`${p}%`,height:"100%",background:c.color,
                      borderRadius:99,transition:"width .8s ease"}}/>
                  </div>
                  <div style={{fontSize:"clamp(11px,1.3vw,12px)",color:T.accent,marginTop:10,fontWeight:600}}>
                    {inProg.length>0?"Continue →":"Start now →"}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

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

function WatchPage({watch,setWatch,courses,setPage,user}){
  const {course,video}=watch||{};
  const savedRef=useRef("");
  useEffect(()=>{
    const key=`${course?.id}__${video?.id}`;
    if(!user?.uid||!course?.id||!video?.id||user.role==="admin"||savedRef.current===key)return;
    savedRef.current=key;
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

function MyLearningPage({user,courses,setPage,setWatch,progress}){
  const prog=progress||{};

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

function AboutPage({setPage}){
  return(
    <div>
      <section style={{
        padding:"clamp(100px,12vw,130px) clamp(16px,4vw,40px) clamp(50px,7vw,80px)",
        background:`radial-gradient(ellipse 80% 60% at 50% -10%,${T.accent}0a 0%,transparent 65%),${T.bg}`,
        position:"relative",overflow:"hidden",textAlign:"center"
      }}>
        <div style={{position:"absolute",top:"15%",left:"8%",width:220,height:220,background:`radial-gradient(${T.blue}06,transparent 70%)`,borderRadius:"50%",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"20%",right:"6%",width:180,height:180,background:`radial-gradient(${T.accent}07,transparent 70%)`,borderRadius:"50%",pointerEvents:"none"}}/>
        <div style={{maxWidth:760,margin:"0 auto"}} className="afu">
          <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:18,
            background:`${T.accent}0d`,border:`1px solid ${T.accent}33`,padding:"5px 14px",borderRadius:8}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:T.accent,animation:"pulse 2s infinite"}}/>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.accent,letterSpacing:2}}>FREE CODING UNIVERSITY</span>
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
      <section style={{padding:"clamp(32px,5vw,52px) clamp(16px,4vw,40px)",background:T.bg2}}>
        <div className="wrap">
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:0,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
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
      <section className="sec">
        <div className="wrap" style={{maxWidth:1060}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(24px,4vw,48px)",alignItems:"center"}}>
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

function PathEditorAdmin({courses}){
  const [paths,setPaths]=useState([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState("");
  const [editIdx,setEditIdx]=useState(null);
  const [form,setForm]=useState({name:"",icon:"⌨️",color:"#00f5c4",desc:"",courseIds:[]});
  const [showForm,setShowForm]=useState(false);

  const ICONS=["⌨️","🌐","🧠","🔐","🏆","🚀","⚡","🎯","📱","🤖"];

  useEffect(()=>{
    const unsub=onSnapshot(collection(db,"learning_paths"),snap=>{
      const data=snap.docs.map(d=>({id:d.id,...d.data()}));
      setPaths(data.sort((a,b)=>(a.order||0)-(b.order||0)));
      setLoading(false);
    },()=>setLoading(false));
    return unsub;
  },[]);

  const msg=t=>{setToast(t);setTimeout(()=>setToast(""),3000);};

  async function savePath(){
    if(!form.name.trim()||form.courseIds.length===0)return;
    setSaving(true);
    try{
      if(editIdx!==null){
        await setDoc(doc(db,"learning_paths",paths[editIdx].id),{...form,updatedAt:serverTimestamp()},{merge:true});
        msg("✅ Path updated");
      }else{
        await setDoc(doc(db,"learning_paths","path_"+Date.now()),{...form,order:paths.length,createdAt:serverTimestamp()});
        msg("✅ Path created");
      }
      setShowForm(false);setEditIdx(null);setForm({name:"",icon:"⌨️",color:"#00f5c4",desc:"",courseIds:[]});
    }catch(e){msg("❌ Error: "+e.message);}
    setSaving(false);
  }

  async function deletePath(p){
    if(!confirm("Delete '"+p.name+"' path?"))return;
    await deleteDoc(doc(db,"learning_paths",p.id));
    msg("🗑️ Deleted");
  }

  function openEdit(p,i){
    setForm({name:p.name,icon:p.icon||"⌨️",color:p.color||T.accent,desc:p.desc||"",courseIds:p.courseIds||[]});
    setEditIdx(i);setShowForm(true);
  }

  function toggleCourse(cid){
    setForm(f=>({...f,courseIds:f.courseIds.includes(cid)?f.courseIds.filter(x=>x!==cid):[...f.courseIds,cid]}));
  }

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontWeight:800,fontSize:"clamp(14px,2vw,17px)"}}>Choose Your Path</div>
          <div style={{fontSize:12,color:T.muted,marginTop:2}}>Learning tracks shown on the home page</div>
        </div>
        <button className="btn-p" onClick={()=>{setShowForm(!showForm);setEditIdx(null);setForm({name:"",icon:"⌨️",color:"#00f5c4",desc:"",courseIds:[]});}} style={{padding:"9px 20px",fontSize:13}}>
          {showForm&&editIdx===null?"✕ Cancel":"+ New Path"}
        </button>
      </div>

      {toast&&<div style={{background:T.bg3,border:`1px solid ${T.accent}33`,borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:12,color:T.accent}}>{toast}</div>}

      {showForm&&(
        <div style={{background:T.card,border:`1px solid ${T.accent}33`,borderRadius:12,padding:"clamp(16px,2.5vw,22px)",marginBottom:18}} className="afu">
          <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>{editIdx!==null?"Edit Path":"Create New Path"}</div>
          <div className="grid-2" style={{gap:12,marginBottom:12}}>
            <div>
              <label className="lbl">Path Name *</label>
              <input className="inp" value={form.name} placeholder="e.g. Web Developer" onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
            </div>
            <div>
              <label className="lbl">Description</label>
              <input className="inp" value={form.desc} placeholder="Short description..." onChange={e=>setForm(f=>({...f,desc:e.target.value}))}/>
            </div>
            <div>
              <label className="lbl">Accent Color</label>
              <input type="color" className="inp" value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))} style={{height:46,padding:4,cursor:"pointer"}}/>
            </div>
            <div>
              <label className="lbl">Icon</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
                {ICONS.map(ic=>(
                  <button key={ic} onClick={()=>setForm(f=>({...f,icon:ic}))}
                    style={{width:36,height:36,borderRadius:8,border:`2px solid ${form.icon===ic?form.color:T.border}`,
                      background:form.icon===ic?`${form.color}18`:"transparent",fontSize:16,cursor:"pointer",transition:"all .15s"}}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label className="lbl">Courses in this path *</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:6}}>
              {courses.map(c=>(
                <button key={c.id} onClick={()=>toggleCourse(c.id)}
                  style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:8,
                    border:`1px solid ${form.courseIds.includes(c.id)?c.color:T.border}`,
                    background:form.courseIds.includes(c.id)?`${c.color}18`:T.bg3,
                    color:form.courseIds.includes(c.id)?c.color:T.muted2,
                    fontSize:12,cursor:"pointer",transition:"all .15s"}}>
                  <span>{c.icon}</span>{c.title}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button className="btn-p" onClick={savePath} disabled={saving||!form.name.trim()||form.courseIds.length===0} style={{padding:"10px 24px",fontSize:13}}>
              {saving?"Saving...":editIdx!==null?"Update Path":"Create Path"}
            </button>
            <button className="btn-s" onClick={()=>{setShowForm(false);setEditIdx(null);}} style={{padding:"10px 18px",fontSize:13}}>Cancel</button>
          </div>
        </div>
      )}

      {loading?(
        <div style={{textAlign:"center",padding:24,color:T.muted}}>Loading paths...</div>
      ):paths.length===0?(
        <div style={{textAlign:"center",padding:24,color:T.muted,fontStyle:"italic",border:`1px dashed ${T.border}`,borderRadius:10}}>
          No paths added yet. Use "+ New Path" to create one.
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {paths.map((p,i)=>(
            <div key={p.id} style={{
              display:"flex",alignItems:"center",gap:12,
              padding:"12px 16px",borderRadius:10,
              border:`1px solid ${T.border}`,background:T.bg2,flexWrap:"wrap",
            }}>
              <div style={{width:36,height:36,borderRadius:9,background:`${p.color||T.accent}18`,border:`1px solid ${p.color||T.accent}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{p.icon||"⌨️"}</div>
              <div style={{flex:1,minWidth:120}}>
                <div style={{fontWeight:700,fontSize:13,color:p.color||T.accent}}>{p.name}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:2}}>{(p.courseIds||[]).length} courses{p.desc?` · ${p.desc}`:""}</div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>openEdit(p,i)} style={{background:"transparent",border:`1px solid ${T.accent}44`,color:T.accent,padding:"5px 12px",borderRadius:6,fontSize:12,cursor:"pointer"}}>Edit</button>
                <button onClick={()=>deletePath(p)} style={{background:"transparent",border:`1px solid ${T.danger}44`,color:T.danger,padding:"5px 12px",borderRadius:6,fontSize:12,cursor:"pointer"}}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

  const [studErr,setStudErr]=useState("");
  useEffect(()=>{
    if(tab!=="students")return;
    setStudErr("");
    const sc=sessionStorage.getItem("hs_students");
    if(sc){try{setStudents(JSON.parse(sc));return;}catch{}}
    getDocs(collection(db,"users"))
      .then(snap=>{
        const all=snap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>u.role!=="admin");
        sessionStorage.setItem("hs_students",JSON.stringify(all));
        setStudents(all);
      })
      .catch(e=>{
        setStudErr("⚠️ Firestore rules: 'users' collection read is not allowed for admin. Please update the rules below.");
        console.error("Students fetch error:",e);
      });
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
      {tab==="courses"&&(
        <div className="afi">

          <PathEditorAdmin courses={courses}/>

          <div style={{height:1,background:T.border,margin:"24px 0"}}/>

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
      {tab==="notes"&&<AdminNotesTab/>}

      {tab==="quiz"&&<AdminQuizTab courses={courses}/>}
      {tab==="students"&&(
        <div className="afi">
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
            <div style={{fontWeight:700,fontSize:"clamp(14px,2vw,17px)"}}>Registered Students</div>
            <span className="badge ba">{students.length}</span>
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.accent}}>☁ Firebase Auth + Firestore</span>
          </div>
          {studErr&&(
            <div style={{background:`${T.danger}10`,border:`1px solid ${T.danger}33`,
              borderRadius:12,padding:"clamp(16px,3vw,24px)",marginBottom:16}}>
              <div style={{fontWeight:700,color:T.danger,marginBottom:8,fontSize:14}}>❌ Permission Error</div>
              <p style={{fontSize:13,color:T.muted2,lineHeight:1.7,marginBottom:14}}>{studErr}</p>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,
                background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8,
                padding:"12px 16px",color:T.accent,lineHeight:2}}>
                {`// Firebase Console → Firestore → Rules → Replace users rule:`}<br/>
                {`match /users/{userId} {`}<br/>
                {`  allow read: if request.auth != null;`}<br/>
                {`  allow write: if request.auth != null && request.auth.uid == userId;`}<br/>
                {`}`}
              </div>
            </div>
          )}
          {!studErr && students.length===0
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
        <p style={{color:T.muted2,fontSize:13}}>Study notes added by admin — read, learn and explore! 📚</p>
      </div>
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
      await addDoc(collection(db,"notifications"),{
        title:`📝 New Note: ${form.title}`,
        body:`Category: ${form.category} — New study material added!`,
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
          <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>📝 Add New Note</div>
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
          <p style={{fontSize:14}}>When admin adds a new course or notes, it will appear here!</p>
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
                  opacity:isRead?0.75:1,cursor:"pointer",
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
      <div className="card afu" style={{padding:"clamp(20px,3vw,28px)",marginBottom:18,display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
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

      <div className="glass afu" style={{padding:"clamp(20px,3vw,28px)"}}>
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

const STATIC_QUIZ = {
  c1:{
    basic:[
      {q:"What does 'print()' do in Python?",opts:["Imports module","Takes input","Defines function","Displays output"],ans:3,topic:"Basics"},
      {q:"Which symbol is used for comments in Python?",opts:["--","/* */","#","//"],ans:2,topic:"Basics"},
      {q:"What is the output of: type(3.14)?",opts:["int","str","double","float"],ans:3,topic:"Basics"},
      {q:"Which is a valid Python variable name?",opts:["2name","my-var","_score","class"],ans:2,topic:"Basics"},
      {q:"How do you take user input in Python?",opts:["scan()","get()","read()","input()"],ans:3,topic:"Basics"},
      {q:"What does len('hello') return?",opts:["Error","6","4","5"],ans:3,topic:"Basics"},
      {q:"Which keyword defines a function?",opts:["function","fun","def","func"],ans:2,topic:"Functions"},
      {q:"How do you create a list in Python?",opts:["{}","()","[]","<>"],ans:2,topic:"Data Types"},
      {q:"What is the output of: 10 // 3?",opts:["3","4","3.33","Error"],ans:0,topic:"Operators"},
      {q:"How do you start a for loop in Python?",opts:["for(i=0;i<n;i++)","foreach i in n:","for i in range(n):","for i = 0"],ans:2,topic:"Loops"},
      {q:"What does 'break' do in a loop?",opts:["None","Skips iteration","Restarts loop","Exits the loop"],ans:3,topic:"Loops"},
      {q:"How to check if key exists in a dict?",opts:["dict.find(key)","dict.exists(key)","dict.has(key)","key in dict"],ans:3,topic:"Data Structures"},
      {q:"What is 'None' in Python?",opts:["Empty string","Zero","Null value","False"],ans:2,topic:"Basics"},
      {q:"Which operator checks equality?",opts:["===","!=","=","=="],ans:3,topic:"Operators"},
      {q:"What does 'append()' do to a list?",opts:["Adds item to end","Removes last item","Reverses list","Sorts list"],ans:0,topic:"Data Structures"},
      {q:"How do you get number of items in list 'a'?",opts:["count(a)","len(a)","a.length","a.size()"],ans:1,topic:"Data Structures"},
      {q:"What is output of: 'Hello' + ' World'?",opts:["Error","Hello + World","HelloWorld","Hello World"],ans:3,topic:"Strings"},
      {q:"Which handles exceptions in Python?",opts:["catch","error-check","try-except","handle"],ans:2,topic:"Error Handling"},
      {q:"What does 'import' do?",opts:["Creates module","Deletes module","Exports module","Loads a module for use"],ans:3,topic:"Modules"},
      {q:"How to write a single-line if condition?",opts:["if x > 0:","if(x>0)","if x > 0 then","x > 0 ? yes : no"],ans:0,topic:"Conditionals"},
      {q:"What is the output of: 2 ** 3?",opts:["8","9","23","6"],ans:0,topic:"Operators"},
      {q:"How do you convert string to int?",opts:["int('5')","num('5')","float('5')","str('5')"],ans:0,topic:"Type Conversion"},
      {q:"What does 'continue' do in a loop?",opts:["Exits loop","Pauses loop","Breaks program","Skips to next iteration"],ans:3,topic:"Loops"},
      {q:"What is a tuple in Python?",opts:["Dictionary","Set","Immutable ordered sequence","Mutable list"],ans:2,topic:"Data Types"},
      {q:"How do you define a dictionary?",opts:["('key','val')","{'key':'val'}","['key','val']","<key:val>"],ans:1,topic:"Data Types"},
      {q:"What is the output of: bool(0)?",opts:["True","Error","False","None"],ans:2,topic:"Basics"},
      {q:"How do you get the last item of list L?",opts:["L[len-1]","L.end()","L[last]","L[-1]"],ans:3,topic:"Data Structures"},
      {q:"What is a string in Python?",opts:["Number","Boolean","Sequence of characters","List of chars"],ans:2,topic:"Strings"},
      {q:"How do you repeat a string 3 times?",opts:["'hi'+3","repeat('hi',3)","'hi'*3","'hi'**3"],ans:2,topic:"Strings"},
      {q:"What does 'pass' do in Python?",opts:["Does nothing — placeholder","Exits function","Continues loop","Skips line"],ans:0,topic:"Syntax"},
      {q:"What is the output of: 5 % 2?",opts:["3","1","0","2"],ans:1,topic:"Operators"},
      {q:"How do you check type of variable x?",opts:["type(x)","typeOf(x)","typeof(x)","x.type()"],ans:0,topic:"Basics"},
      {q:"What does 'str()' do?",opts:["Converts to string","Converts to int","Converts to bool","Creates list"],ans:0,topic:"Type Conversion"},
      {q:"How do you write multiline string?",opts:["\n in string","String[]","Triple quotes (3 double-quotes)","Multi()"],ans:2,topic:"Strings"},
      {q:"What is output of: list(range(3))?",opts:["[1, 2, 3]","[0, 1, 2, 3]","[0, 1, 2]","range(3)"],ans:2,topic:"Data Types"},
      {q:"What does 'else' after 'for' loop mean?",opts:["Runs after every iteration","Runs on error","Runs if list empty","Runs if loop not broken"],ans:3,topic:"Loops"},
      {q:"How to remove last item from list L?",opts:["L.remove()","L.pop()","L.delete()","del L[-1]"],ans:1,topic:"Data Structures"},
      {q:"What is output of: not True?",opts:["False","None","True","Error"],ans:0,topic:"Operators"},
      {q:"How to convert list to tuple?",opts:["(L)","tuple(L)","toTuple(L)","L.totuple()"],ans:1,topic:"Type Conversion"},
      {q:"What does 'in' operator do?",opts:["Indexes into","Loops over","Imports","Checks membership"],ans:3,topic:"Operators"},
      {q:"What is the output of: 'abc'[1]?",opts:["abc","a","b","c"],ans:2,topic:"Strings"},
      {q:"How to create empty set?",opts:["[]","{}","set()","()"],ans:2,topic:"Data Types"},
      {q:"What does dict.keys() return?",opts:["Length","All values","All items","All keys"],ans:3,topic:"Data Structures"},
      {q:"What is output of: max([3,1,4,1,5])?",opts:["1","5","3","4"],ans:1,topic:"Built-ins"},
      {q:"How to sort a list in-place?",opts:["sorted(L)","L.sort()","sort(L)","L.order()"],ans:1,topic:"Data Structures"},
      {q:"What does 'global' keyword do?",opts:["Imports module","Declares global variable","Deletes variable","Creates function"],ans:1,topic:"Scope"},
      {q:"What is output of: 'hello'.upper()?",opts:["ERROR","hello","Hello","HELLO"],ans:3,topic:"Strings"},
      {q:"How to check if string S starts with 'Hi'?",opts:["S.starts('Hi')","S[:2]=='Hi'","S.startswith('Hi')","S.begin('Hi')"],ans:2,topic:"Strings"},
      {q:"What is output of: [1,2]+[3,4]?",opts:["[4,6]","[1,2,3,4]","[1,2],[3,4]","Error"],ans:1,topic:"Lists"},
      {q:"What does enumerate() return?",opts:["Only values","Only indices","Dictionary","Index-value pairs"],ans:3,topic:"Iteration"},
      {q:"How to get substring from index 1 to 3?",opts:["S.slice(1,3)","S[1,3]","S.sub(1,3)","S[1:3]"],ans:3,topic:"Strings"},
      {q:"What is a default argument in function?",opts:["Mandatory argument","Global variable","Return value","Value used if arg not provided"],ans:3,topic:"Functions"},
      {q:"What does zip() do?",opts:["Pairs elements from iterables","Merges dicts","Sorts lists","Compresses data"],ans:0,topic:"Iteration"},
      {q:"What is output of: round(3.7)?",opts:["4","3.7","Error","3"],ans:0,topic:"Built-ins"},
      {q:"How to read a file in Python?",opts:["load('f')","open('f').read()","file('f')","read('f')"],ans:1,topic:"File Handling"},
      {q:"What does strip() do?",opts:["Removes leading/trailing whitespace","Counts chars","Splits string","Reverses string"],ans:0,topic:"Strings"},
      {q:"What is output of: min(3,1,4)?",opts:["1","3","4","min"],ans:0,topic:"Built-ins"},
      {q:"How to write to a file?",opts:["write('f')","file.write('f')","save('f')","open('f','w').write()"],ans:3,topic:"File Handling"},
      {q:"What does isinstance(x, int) return?",opts:["type of x","Always True","x as int","True if x is int"],ans:3,topic:"Type Checking"},
      {q:"What is output of: {1,2,2,3}?",opts:["(1,2,3)","{1,2,3}","[1,2,3]","{1,2,2,3}"],ans:1,topic:"Data Types"},
      {q:"What is a module in Python?",opts:["Class","Function","Variable","File with Python code"],ans:3,topic:"Modules"},
      {q:"How to install a package?",opts:["get pkg","import pkg","pip install pkg","python install pkg"],ans:2,topic:"Modules"},
      {q:"What does os.getcwd() return?",opts:["Home directory","Python path","Current directory","File list"],ans:2,topic:"OS Module"},
      {q:"What is output of: abs(-5)?",opts:["5","-5","Error","0"],ans:0,topic:"Built-ins"},
      {q:"How to shuffle a list randomly?",opts:["random(L)","random.shuffle(L)","shuffle(L)","L.shuffle()"],ans:1,topic:"Random"},
      {q:"What does map(str, [1,2,3]) return?",opts:["Error","List of strings","Iterator of strings","['1','2','3']"],ans:2,topic:"Functional"},
      {q:"What is a lambda function?",opts:["Named function","Class method","Anonymous single-expression function","Built-in"],ans:2,topic:"Functions"},
      {q:"How to merge two dicts in Python 3.9+?",opts:["d1.merge(d2)","d1 + d2","merge(d1,d2)","d1 | d2"],ans:3,topic:"Data Structures"},
      {q:"What does filter() do?",opts:["Filters iterable by function","Counts items","Removes duplicates","Sorts list"],ans:0,topic:"Functional"},
      {q:"What is output of: 'py' in 'python'?",opts:["False","True","Error","None"],ans:1,topic:"Strings"},
      {q:"How to get all values of dict D?",opts:["values(D)","D.vals()","D.items()","D.values()"],ans:3,topic:"Data Structures"},
      {q:"What does any() do?",opts:["Returns True if all True","Filters True","Returns True if any element is True","Counts True"],ans:2,topic:"Built-ins"},
      {q:"What does all() do?",opts:["Counts True","Filters True","Returns True if all elements are True","Returns True if any True"],ans:2,topic:"Built-ins"},
      {q:"How to count occurrences of x in list L?",opts:["L.find(x)","L.count(x)","L.index(x)","count(L,x)"],ans:1,topic:"Data Structures"},
      {q:"What is output of: list(map(lambda x:x*2,[1,2,3]))?",opts:["[[2],[4],[6]]","[2,4,6]","[1,2,3]","Error"],ans:1,topic:"Functional"},
      {q:"How do you copy a list?",opts:["L[:]","Both L.copy() and L[:]","copy(L)","L.copy()"],ans:3,topic:"Data Structures"},
      {q:"What is output of: 'hello'.replace('l','r')?",opts:["hello","Error","heLLo","herro"],ans:3,topic:"Strings"},
      {q:"What does 'with' statement ensure?",opts:["Faster execution","Error handling","Loop optimization","Proper resource cleanup"],ans:3,topic:"File Handling"},
      {q:"How to get index of item in list?",opts:["L.index(item)","indexOf(L,item)","L.find(item)","L.pos(item)"],ans:0,topic:"Data Structures"},
      {q:"What is output of: bool('') ?",opts:["None","False","Error","True"],ans:1,topic:"Basics"},
      {q:"What is a class in Python?",opts:["Module","Blueprint for objects","Variable type","Function group"],ans:1,topic:"OOP"},
      {q:"How to create object of class Dog?",opts:["Dog()","Dog.create()","new Dog()","object(Dog)"],ans:0,topic:"OOP"},
      {q:"What does __init__ do?",opts:["Initializes object","Copies object","Deletes object","Prints object"],ans:0,topic:"OOP"},
      {q:"What is 'self' in a class method?",opts:["Parent class","Return value","Reference to current instance","Class name"],ans:2,topic:"OOP"},
      {q:"What is inheritance?",opts:["Creating objects","Importing module","Child class gets parent's properties","Copying code"],ans:2,topic:"OOP"},
      {q:"How to call parent class method?",opts:["parent.method()","Parent::method()","super().method()","base.method()"],ans:2,topic:"OOP"},
      {q:"What is method overriding?",opts:["Creating new method","Child redefines parent method","Deleting parent","Copying method"],ans:1,topic:"OOP"},
      {q:"What is encapsulation?",opts:["Inheriting","Importing","Creating objects","Hiding data inside class"],ans:3,topic:"OOP"},
      {q:"How to make attribute private?",opts:["name_priv","name.private","_name or __name","private name"],ans:2,topic:"OOP"},
      {q:"What does __str__ return?",opts:["Object id","String representation of object","Object copy","Object type"],ans:1,topic:"OOP"},
      {q:"What is a class variable?",opts:["Module var","Shared by all instances","Global variable","Unique per instance"],ans:1,topic:"OOP"},
      {q:"How to check if object is instance of class?",opts:["obj is Class","type(obj)==Class","obj.class==Class","isinstance(obj, Class)"],ans:3,topic:"OOP"},
      {q:"What is abstraction?",opts:["Importing","Copying code","Hiding complexity, showing essentials","Inheriting"],ans:2,topic:"OOP"},
      {q:"What is polymorphism?",opts:["Same interface, different behavior","Many methods","Many classes","Multiple inheritance"],ans:0,topic:"OOP"},
      {q:"What does @classmethod decorator do?",opts:["Method receives class as first arg","Hides method","Makes static","Removes method"],ans:0,topic:"OOP"},
      {q:"What is __repr__?",opts:["Object hash","Official string representation for devs","User friendly string","Object id"],ans:1,topic:"OOP"},
      {q:"What is multiple inheritance?",opts:["Multiple objects","Multiple modules","Multiple methods","Class inherits from multiple parents"],ans:3,topic:"OOP"},
      {q:"How to define abstract class?",opts:["Use abstract keyword","Use interface keyword","Use virtual keyword","Use ABC from abc module"],ans:3,topic:"OOP"},
      {q:"What is a mixin?",opts:["Module","Abstract class","Class providing methods for reuse","Interface"],ans:2,topic:"OOP"},
      {q:"What does __len__ enable?",opts:["Iteration","Indexing","Comparison","len() to work on custom class"],ans:3,topic:"OOP"},
      {q:"What is a generator function?",opts:["Imports module","Returns list","Uses yield to produce values lazily","Creates class"],ans:2,topic:"Generators"},
      {q:"What does 'yield' do?",opts:["Returns and exits","Pauses function and returns value","Imports","Loops"],ans:1,topic:"Generators"},
      {q:"How to create list comprehension?",opts:["(expr for x)","[expr for x in iterable]","expr for x in iterable","list(expr for x)"],ans:1,topic:"Comprehensions"},
      {q:"What is a dict comprehension?",opts:["dict[k for k in d]","{k:v for k,v in items}","d.comprehend()","{k:v} for k in d"],ans:1,topic:"Comprehensions"},
      {q:"What is a set comprehension?",opts:["set(x for x)","(x for x in iterable)","[x for x in iterable]","{x for x in iterable}"],ans:3,topic:"Comprehensions"},
      {q:"What does *args do in function?",opts:["Returns multiple","Accepts variable positional args","Accepts one arg","Accepts keyword args"],ans:1,topic:"Functions"},
      {q:"What does **kwargs do?",opts:["Unpacks list","Accepts positional","Accepts variable keyword args as dict","Returns dict"],ans:2,topic:"Functions"},
      {q:"How to unpack list into function args?",opts:["func(unpack(L))","func(*L)","func(L)","func(**L)"],ans:1,topic:"Functions"},
      {q:"What is a closure?",opts:["Generator","Function in loop","Recursive function","Function remembering its outer scope"],ans:3,topic:"Advanced"},
      {q:"What is a decorator?",opts:["Class method","Lambda","Function that wraps another function","Generator"],ans:2,topic:"Advanced"},
      {q:"What does functools.wraps do?",opts:["Times function","Copies function","Preserves original function metadata","Imports function"],ans:2,topic:"Advanced"},
      {q:"What is memoization?",opts:["Caching results to avoid recomputation","Loop optimization","Garbage collection","Memory management"],ans:0,topic:"Optimization"},
      {q:"What is a context manager?",opts:["Loop control","Object managing setup/teardown with 'with'","Error handler","Memory manager"],ans:1,topic:"Advanced"},
      {q:"What does __enter__ and __exit__ do?",opts:["Init and delete","Start and stop threads","Open and close files","Define context manager behavior"],ans:3,topic:"Advanced"},
      {q:"What is tail recursion?",opts:["Middle recursion","Any recursion","First recursion","Recursive call is last operation"],ans:3,topic:"Recursion"},
      {q:"What is a coroutine?",opts:["Generator","Lambda","Function that can pause and resume","Decorator"],ans:2,topic:"Async"},
      {q:"What does async def do?",opts:["Imports async","Defines asynchronous function","Makes function faster","Creates generator"],ans:1,topic:"Async"},
      {q:"What does await do?",opts:["Sleeps thread","Times out","Waits for async operation","Pauses forever"],ans:2,topic:"Async"},
      {q:"What is asyncio?",opts:["Networking library","Multiprocessing","Threading library","Library for async I/O"],ans:3,topic:"Async"},
      {q:"What is a future in asyncio?",opts:["Process","Thread","Object representing pending result","Past result"],ans:2,topic:"Async"},
      {q:"What is Python's GIL?",opts:["Graphics Interface Layer","Lock preventing true multi-threading","General Index List","Global Input Lock"],ans:1,topic:"Internals"},
      {q:"How does Python manage memory?",opts:["Reference counting + garbage collection","Heap only","Stack only","Manual allocation"],ans:0,topic:"Memory"},
      {q:"What is reference counting?",opts:["Count function calls","Track how many refs point to object","Count variables","Count modules"],ans:1,topic:"Memory"},
      {q:"What triggers garbage collection?",opts:["Every function call","Every print","Circular references with count 0","Every import"],ans:2,topic:"Memory"},
      {q:"What is the difference between deepcopy and copy?",opts:["Copy is deeper","Same thing","Deepcopy copies nested objects","Deepcopy is faster"],ans:2,topic:"Memory"},
      {q:"What is pickling in Python?",opts:["Selecting randomly","Sorting","Serializing object to bytes","Drawing"],ans:2,topic:"Serialization"},
      {q:"What does pickle.dumps() do?",opts:["Deletes object","Serializes object to bytes","Deserializes","Prints object"],ans:1,topic:"Serialization"},
      {q:"What is JSON serialization?",opts:["Validating JSON","Importing JSON","Converting Python obj to JSON string","Creating JSON file"],ans:2,topic:"Serialization"},
      {q:"What is a thread in Python?",opts:["Concurrent execution unit","Coroutine","Process","Generator"],ans:0,topic:"Concurrency"},
      {q:"What does threading.Thread do?",opts:["Syncs threads","Pauses thread","Kills thread","Creates a new thread"],ans:3,topic:"Concurrency"},
      {q:"What is a race condition?",opts:["Uncontrolled access to shared resource","Fast execution","Thread priority","CPU scheduling"],ans:0,topic:"Concurrency"},
      {q:"What is a mutex?",opts:["Process manager","Async lock","Memory block","Mutual exclusion for shared data"],ans:3,topic:"Concurrency"},
      {q:"What does multiprocessing module do?",opts:["True parallel execution using processes","Handles I/O","Manages async","Creates threads"],ans:0,topic:"Concurrency"},
      {q:"What is IPC?",opts:["Input Processing Control","Internal Python compiler","Integer Processing Core","Inter-process communication"],ans:3,topic:"Concurrency"},
      {q:"What is a daemon thread?",opts:["Background thread killed when main exits","High priority thread","Main thread","User thread"],ans:0,topic:"Concurrency"},
      {q:"What is __slots__?",opts:["Defines methods","Restricts attributes to save memory","Creates properties","Manages threads"],ans:1,topic:"Memory"},
      {q:"What is __weakref__?",opts:["Strong reference","Weak reference not preventing garbage collection","Thread reference","Module reference"],ans:1,topic:"Memory"},
      {q:"What is sys.getsizeof()?",opts:["Gets list size","Gets system size","Returns object size in bytes","Gets file size"],ans:2,topic:"Memory"},
      {q:"What is a memory leak in Python?",opts:["Slow memory","Extra memory","Missing memory","Object kept alive unintentionally"],ans:3,topic:"Memory"},
      {q:"What is the dis module?",opts:["Disk management","Disassembles Python bytecode","Displays info","Distance calc"],ans:1,topic:"Internals"},
      {q:"What is a metaclass?",opts:["Class of a class","Abstract class","Parent class","Base class"],ans:0,topic:"Advanced OOP"},
      {q:"What does type() do when called with 3 args?",opts:["Lists types","Checks type","Converts type","Creates a new class dynamically"],ans:3,topic:"Advanced OOP"},
      {q:"What is __new__ vs __init__?",opts:["__new__ creates, __init__ initializes","Same purpose","__new__ initializes","__init__ creates"],ans:0,topic:"Advanced OOP"},
      {q:"What is a descriptor?",opts:["Object defining __get__,__set__,__delete__","Function arg","Class variable","Module attribute"],ans:0,topic:"Advanced OOP"},
      {q:"What is @property?",opts:["Caches result","Creates setter","Creates getter accessed like attribute","Makes public"],ans:2,topic:"Advanced OOP"},
      {q:"What is MRO?",opts:["Memory Reference Order","Method Resolution Order for inheritance","Module Resolution","Method Registry Order"],ans:1,topic:"Advanced OOP"},
      {q:"What algorithm does Python use for MRO?",opts:["Topological sort","C3 linearization","DFS","BFS"],ans:1,topic:"Advanced OOP"},
      {q:"What is __mro__ attribute?",opts:["Method order dict","Tuple of class hierarchy","List of methods","Tuple of args"],ans:1,topic:"Advanced OOP"},
      {q:"What is operator overloading?",opts:["Defining custom behavior for operators","Overusing operators","Importing operators","Removing operators"],ans:0,topic:"Advanced OOP"},
      {q:"What does __add__ enable?",opts:["+ operator on custom objects","Concatenation only","Addition only","Number addition"],ans:0,topic:"Advanced OOP"},
      {q:"What is __call__?",opts:["Makes object callable like function","Imports class","Creates instance","Calls method"],ans:0,topic:"Advanced OOP"},
      {q:"What is __iter__ and __next__?",opts:["File iteration","Define custom iterator behavior","Generator control","Loop control"],ans:1,topic:"Advanced OOP"},
      {q:"What is __getitem__?",opts:["Enables indexing with []","Gets attribute","Imports item","Gets item from list"],ans:0,topic:"Advanced OOP"},
      {q:"What is __contains__?",opts:["Import check","Contains check","Type check","Enables 'in' operator"],ans:3,topic:"Advanced OOP"},
      {q:"What is __del__?",opts:["Removes method","Deletes class","Called when object is destroyed","Deletes attribute"],ans:2,topic:"Advanced OOP"},
      {q:"What is a class decorator?",opts:["Method decorator","Variable decorator","Module decorator","Function taking and returning class"],ans:3,topic:"Advanced OOP"},
      {q:"What does __subclasshook__ do?",opts:["Adds subclass","Customizes isinstance/issubclass checks","Removes subclass","Lists subclasses"],ans:1,topic:"Advanced OOP"},
      {q:"What is ABC?",opts:["Abstract Boolean Class","Abstract Base Class — defines interface","Any Base Class","Array Base Container"],ans:1,topic:"Advanced OOP"},
      {q:"What is @abstractmethod?",opts:["Forces subclasses to implement method","Hides method","Makes method fast","Removes method"],ans:0,topic:"Advanced OOP"},
      {q:"What is Protocol in Python 3.8+?",opts:["Mixin class","Interface class","Structural subtyping — duck typing formalized","Abstract class"],ans:2,topic:"Advanced OOP"},
      {q:"What is a context variable in Python 3.7+?",opts:["Thread local","Process variable","Global variable","Variable with different values per async context"],ans:3,topic:"Async"},
      {q:"What is asyncio.gather()?",opts:["Runs multiple coroutines concurrently","Creates thread","Imports async","Gathers data"],ans:0,topic:"Async"},
      {q:"What is asyncio.Queue?",opts:["Normal queue","Process queue","Thread queue","Async-safe FIFO queue"],ans:3,topic:"Async"},
      {q:"What does asyncio.sleep(n) do?",opts:["Pauses thread","Sleeps process","Kills coroutine","Pauses coroutine for n seconds"],ans:3,topic:"Async"},
      {q:"What is an event loop?",opts:["Core of asyncio scheduling coroutines","For loop","While loop","Thread manager"],ans:0,topic:"Async"},
      {q:"What is aiohttp?",opts:["Async HTTP client/server library","Sync HTTP","File I/O library","Database library"],ans:0,topic:"Async"},
      {q:"What is typing module?",opts:["Type checking","Type conversion","Provides type hints","Type casting"],ans:2,topic:"Type Hints"},
      {q:"What is Optional[int]?",opts:["Nullable int","int or None","Optional integer class","Any int"],ans:1,topic:"Type Hints"},
      {q:"What is Union[int, str]?",opts:["int or str","int and str","str from int","int to str"],ans:0,topic:"Type Hints"},
      {q:"What is List[int]?",opts:["List of integers","Array of int","Typed list","Integer list class"],ans:0,topic:"Type Hints"},
      {q:"What is Dict[str, int]?",opts:["Mixed dict","String dict","Integer dict","Dict with str keys and int values"],ans:3,topic:"Type Hints"},
      {q:"What is Callable in typing?",opts:["Type hint for functions","Function class","Method type","Callable class"],ans:0,topic:"Type Hints"},
      {q:"What does dataclass decorator do?",opts:["Creates database","Auto-generates __init__ and other methods","Creates dict","Creates list"],ans:1,topic:"Advanced"},
      {q:"What is NamedTuple?",opts:["Named set","Named dict","Tuple with named fields","Named list"],ans:2,topic:"Advanced"},
      {q:"What is TypeVar?",opts:["Type variable","Placeholder for generic type in typing","Variable type","Type cast"],ans:1,topic:"Type Hints"},
      {q:"What is @cached_property?",opts:["Cached variable","Cached import","Property computed once and cached","Cached method"],ans:2,topic:"Optimization"},
      {q:"What is __class_getitem__?",opts:["Enables Class[T] generic syntax","Returns item","Gets class","Creates subclass"],ans:0,topic:"Advanced OOP"},
      {q:"What is ParamSpec in Python 3.10?",opts:["Parameter specification","Function params","Captures parameter types of callable","Callable params"],ans:2,topic:"Type Hints"},
      {q:"What is match statement in Python 3.10?",opts:["If-else chain","Structural pattern matching","Switch statement","Loop control"],ans:1,topic:"Syntax"},
      {q:"What is the walrus operator :=?",opts:["Dict operator","Assignment expression — assigns and returns","Walrus math","Slice operator"],ans:1,topic:"Syntax"},
      {q:"What is CPython?",opts:["Default Python implementation in C","Python compiler","Python for C","C extension"],ans:0,topic:"Internals"},
      {q:"What is PyPy?",opts:["Python for Py","JIT-compiled Python implementation","Python preprocessor","Python package"],ans:1,topic:"Internals"},
      {q:"What is bytecode in Python?",opts:["Source code","Machine code","Intermediate .pyc code run by VM","Binary code"],ans:2,topic:"Internals"},
      {q:"What is the Python VM?",opts:["Compiles code","Executes bytecode","Runs machine code","Links code"],ans:1,topic:"Internals"},
      {q:"What is a .pyc file?",opts:["Compiled bytecode cache","Python class file","Python config","Python package"],ans:0,topic:"Internals"},
      {q:"What is __pycache__?",opts:["Python cache","Directory storing compiled bytecode","Import cache","Cache directory"],ans:1,topic:"Internals"},
      {q:"What is sys.path?",opts:["Python installation path","Module path","System path","List of directories Python searches for modules"],ans:3,topic:"Internals"},
      {q:"What is importlib?",opts:["Import manager","Import library","Import list","Module for programmatic imports"],ans:3,topic:"Modules"},
      {q:"What is a namespace package?",opts:["Global package","Package without __init__.py","System package","Named package"],ans:1,topic:"Modules"},
      {q:"What is __all__ in a module?",opts:["All functions","All variables","All imports","Defines public API for from x import *"],ans:3,topic:"Modules"},
      {q:"What is a C extension in Python?",opts:["C class","C code file","Module written in C for performance","C import"],ans:2,topic:"Internals"},
      {q:"What is ctypes?",opts:["Library for calling C functions from Python","C class module","C types module","C file module"],ans:0,topic:"Internals"},
      {q:"What is Cython?",opts:["Compiles Python-like code to C","Python compiler","C to Python","Python subset"],ans:0,topic:"Performance"},
      {q:"What is profiling in Python?",opts:["Testing","Formatting","Debugging","Measuring code performance"],ans:3,topic:"Optimization"},
      {q:"What does cProfile do?",opts:["Creates profile","Formats code","Checks C code","Profiles function call statistics"],ans:3,topic:"Optimization"},
      {q:"What is line_profiler?",opts:["C profiler","Thread profiler","Module profiler","Profiles code line by line"],ans:3,topic:"Optimization"},
      {q:"What is memory_profiler?",opts:["CPU profiler","Thread profiler","I/O profiler","Tracks memory usage per line"],ans:3,topic:"Optimization"},
      {q:"What is numba?",opts:["Number library","Python compiler","Numpy backend","JIT compiler for numerical Python code"],ans:3,topic:"Performance"},
      {q:"What is numpy vectorization?",opts:["Array creation","Matrix math","Operations on whole arrays without loops","Numpy import"],ans:2,topic:"Performance"},
      {q:"What is the difference between list and array (numpy)?",opts:["Same thing","Array is dynamic","List is faster","Numpy array is typed and faster for math"],ans:3,topic:"Performance"},
    ],
    intermediate:[
      {q:"What is a smart pointer?",opts:["None","Automatically manages memory","Typed pointer","Fast pointer"],ans:1,topic:"Smart Pointers"},
      {q:"What is unique_ptr?",opts:["Shared pointer","Weak pointer","Single-owner smart pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is shared_ptr?",opts:["Weak pointer","Single owner","Multiple-owner reference-counted pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is weak_ptr?",opts:["Light pointer","Weak pointer","None","Non-owning reference to shared_ptr object"],ans:3,topic:"Smart Pointers"},
      {q:"What is move semantics?",opts:["None","Memory allocation","Moving files","Transferring ownership without copying"],ans:3,topic:"C++11"},
      {q:"What does std::move() do?",opts:["None","Casts to rvalue enabling move","Moves physically","Copies object"],ans:1,topic:"C++11"},
      {q:"What is an rvalue?",opts:["Temporary value without address","None","Left-side value","Named variable"],ans:0,topic:"Value Categories"},
      {q:"What is an lvalue?",opts:["None","Right-side","Named object with persistent address","Temporary"],ans:2,topic:"Value Categories"},
      {q:"What is perfect forwarding?",opts:["None","Fast forwarding","Copying","Preserving value category when forwarding args"],ans:3,topic:"C++11"},
      {q:"What is std::forward?",opts:["Forward declare","Used for perfect forwarding in templates","None","Forward iterator"],ans:1,topic:"C++11"},
      {q:"What is a variadic template?",opts:["Template accepting any number of types","Template error","None","Fixed args template"],ans:0,topic:"Templates"},
      {q:"What is template parameter pack?",opts:["Pack class","... syntax for variadic templates","Template param","None"],ans:1,topic:"Templates"},
      {q:"What is SFINAE?",opts:["Static Function","Substitution Failure Is Not An Error","Some Failure Is Normal","None"],ans:1,topic:"Templates"},
      {q:"What is enable_if?",opts:["None","If condition","Enables compiler","Conditionally enables template specialization"],ans:3,topic:"Templates"},
      {q:"What is type_traits?",opts:["Compile-time type information and transformations","Type list","None","Type array"],ans:0,topic:"Templates"},
      {q:"What is constexpr?",opts:["Constant expression evaluated at compile time","None","Runtime constant","Variable"],ans:0,topic:"C++11"},
      {q:"What is nullptr?",opts:["Type-safe null pointer constant","Zero pointer","None","NULL replacement only"],ans:0,topic:"C++11"},
      {q:"What is auto keyword?",opts:["Auto class","Automatic variable","None","Type deduction by compiler"],ans:3,topic:"C++11"},
      {q:"What is decltype?",opts:["Gets type of expression at compile time","Declares type","None","Type keyword"],ans:0,topic:"C++11"},
      {q:"What is a lambda expression?",opts:["None","Named function","Anonymous inline function","Class method"],ans:2,topic:"C++11"},
      {q:"What is capture list in lambda?",opts:["Return type","None","[=] or [&] to capture outer variables","Parameter list"],ans:2,topic:"Lambdas"},
      {q:"What is std::function?",opts:["Method type","Type-erased callable wrapper","Function class","None"],ans:1,topic:"Functional"},
      {q:"What is std::bind?",opts:["Binds reference","None","Binds arguments to function","Creates class"],ans:2,topic:"Functional"},
      {q:"What is std::thread?",opts:["Thread type","C++11 class for creating threads","None","Process class"],ans:1,topic:"Concurrency"},
      {q:"What is std::mutex?",opts:["Memory unit","None","Thread class","Mutual exclusion synchronization primitive"],ans:3,topic:"Concurrency"},
      {q:"What is std::lock_guard?",opts:["None","RAII mutex lock","Manual lock","Thread lock"],ans:1,topic:"Concurrency"},
      {q:"What is std::condition_variable?",opts:["Variable type","Allows threads to wait for condition","None","Signal class"],ans:1,topic:"Concurrency"},
      {q:"What is std::atomic?",opts:["None","Thread safe","Atomic class","Lock-free thread-safe operations"],ans:3,topic:"Concurrency"},
      {q:"What is std::promise and std::future?",opts:["Promise class","Future class","Async value passing between threads","None"],ans:2,topic:"Concurrency"},
      {q:"What is std::async?",opts:["Runs function asynchronously","None","Thread function","Async keyword"],ans:0,topic:"Concurrency"},
      {q:"What is a vtable?",opts:["None","Variable table","Virtual function table for runtime dispatch","Vector table"],ans:2,topic:"Internals"},
      {q:"What is vptr?",opts:["Pointer to vtable in each object","Void pointer","Virtual pointer","None"],ans:0,topic:"Internals"},
      {q:"What is CRTP?",opts:["Common Runtime Type","None","C++ Runtime Template","Curiously Recurring Template Pattern"],ans:3,topic:"Patterns"},
      {q:"What is type erasure?",opts:["Casting types","None","Hiding concrete type behind interface","Removing types"],ans:2,topic:"Patterns"},
      {q:"What is the pimpl idiom?",opts:["None","Private impl","Pointer to implementation for ABI stability","Public impl"],ans:2,topic:"Patterns"},
      {q:"What is ADL?",opts:["Array Default List","None","Auto Detect Link","Argument-Dependent Lookup for namespace resolution"],ans:3,topic:"Internals"},
      {q:"What is ODR?",opts:["One Definition Rule","Order Definition","Object Definition","None"],ans:0,topic:"Internals"},
      {q:"What is undefined behavior?",opts:["Code whose result is unpredictable","Error type","Warning type","None"],ans:0,topic:"Internals"},
      {q:"What is alignment in memory?",opts:["Memory order","None","Byte order","Data stored at addresses divisible by its size"],ans:3,topic:"Memory"},
      {q:"What is padding in structs?",opts:["Metadata","Extra fields","Compiler-added bytes for alignment","None"],ans:2,topic:"Memory"},
      {q:"What is copy elision?",opts:["None","Compiler optimization avoiding unnecessary copies","Copy method","Copy error"],ans:1,topic:"Optimization"},
      {q:"What is RVO?",opts:["Return Value Optimization — avoid copying return","Return variable","Return operator","None"],ans:0,topic:"Optimization"},
      {q:"What is NRVO?",opts:["Non-Return Value","Named Return","Named RVO for named local variables","None"],ans:2,topic:"Optimization"},
      {q:"What is a placement new?",opts:["Place class","New operator","None","Constructs object at specific memory address"],ans:3,topic:"Memory"},
      {q:"What is std::variant?",opts:["Array type","Variant class","Type-safe union holding one of several types","None"],ans:2,topic:"C++17"},
      {q:"What is std::optional?",opts:["None","Wrapper for value that may not exist","Maybe class","Optional class"],ans:1,topic:"C++17"},
      {q:"What is std::any?",opts:["Type-safe container for any value","Void wrapper","Any class","None"],ans:0,topic:"C++17"},
      {q:"What is structured binding?",opts:["Auto binding","auto [a,b] = pair;","Tuple binding","None"],ans:1,topic:"C++17"},
      {q:"What is if constexpr?",opts:["Runtime if","Compile-time if for template branching","Const if","None"],ans:1,topic:"C++17"},
      {q:"What is fold expression?",opts:["Expands parameter pack with operator","Pack fold","Expansion","None"],ans:0,topic:"C++17"},
      {q:"What is std::string_view?",opts:["None","String copy","Non-owning view of string data","String class"],ans:2,topic:"C++17"},
      {q:"What is a smart pointer?",opts:["None","Automatically manages memory","Typed pointer","Fast pointer"],ans:1,topic:"Smart Pointers"},
      {q:"What is unique_ptr?",opts:["Shared pointer","Weak pointer","Single-owner smart pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is shared_ptr?",opts:["Weak pointer","Single owner","Multiple-owner reference-counted pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is weak_ptr?",opts:["Light pointer","Weak pointer","None","Non-owning reference to shared_ptr object"],ans:3,topic:"Smart Pointers"},
      {q:"What is move semantics?",opts:["None","Memory allocation","Moving files","Transferring ownership without copying"],ans:3,topic:"C++11"},
      {q:"What does std::move() do?",opts:["None","Casts to rvalue enabling move","Moves physically","Copies object"],ans:1,topic:"C++11"},
      {q:"What is an rvalue?",opts:["Temporary value without address","None","Left-side value","Named variable"],ans:0,topic:"Value Categories"},
      {q:"What is an lvalue?",opts:["None","Right-side","Named object with persistent address","Temporary"],ans:2,topic:"Value Categories"},
      {q:"What is perfect forwarding?",opts:["None","Fast forwarding","Copying","Preserving value category when forwarding args"],ans:3,topic:"C++11"},
      {q:"What is std::forward?",opts:["Forward declare","Used for perfect forwarding in templates","None","Forward iterator"],ans:1,topic:"C++11"},
      {q:"What is a variadic template?",opts:["Template accepting any number of types","Template error","None","Fixed args template"],ans:0,topic:"Templates"},
      {q:"What is template parameter pack?",opts:["Pack class","... syntax for variadic templates","Template param","None"],ans:1,topic:"Templates"},
      {q:"What is SFINAE?",opts:["Static Function","Substitution Failure Is Not An Error","Some Failure Is Normal","None"],ans:1,topic:"Templates"},
      {q:"What is enable_if?",opts:["None","If condition","Enables compiler","Conditionally enables template specialization"],ans:3,topic:"Templates"},
      {q:"What is type_traits?",opts:["Compile-time type information and transformations","Type list","None","Type array"],ans:0,topic:"Templates"},
      {q:"What is constexpr?",opts:["Constant expression evaluated at compile time","None","Runtime constant","Variable"],ans:0,topic:"C++11"},
      {q:"What is nullptr?",opts:["Type-safe null pointer constant","Zero pointer","None","NULL replacement only"],ans:0,topic:"C++11"},
      {q:"What is auto keyword?",opts:["Auto class","Automatic variable","None","Type deduction by compiler"],ans:3,topic:"C++11"},
      {q:"What is decltype?",opts:["Gets type of expression at compile time","Declares type","None","Type keyword"],ans:0,topic:"C++11"},
      {q:"What is a lambda expression?",opts:["None","Named function","Anonymous inline function","Class method"],ans:2,topic:"C++11"},
      {q:"What is capture list in lambda?",opts:["Return type","None","[=] or [&] to capture outer variables","Parameter list"],ans:2,topic:"Lambdas"},
      {q:"What is std::function?",opts:["Method type","Type-erased callable wrapper","Function class","None"],ans:1,topic:"Functional"},
      {q:"What is std::bind?",opts:["Binds reference","None","Binds arguments to function","Creates class"],ans:2,topic:"Functional"},
      {q:"What is std::thread?",opts:["Thread type","C++11 class for creating threads","None","Process class"],ans:1,topic:"Concurrency"},
      {q:"What is std::mutex?",opts:["Memory unit","None","Thread class","Mutual exclusion synchronization primitive"],ans:3,topic:"Concurrency"},
      {q:"What is std::lock_guard?",opts:["None","RAII mutex lock","Manual lock","Thread lock"],ans:1,topic:"Concurrency"},
      {q:"What is std::condition_variable?",opts:["Variable type","Allows threads to wait for condition","None","Signal class"],ans:1,topic:"Concurrency"},
      {q:"What is std::atomic?",opts:["None","Thread safe","Atomic class","Lock-free thread-safe operations"],ans:3,topic:"Concurrency"},
      {q:"What is std::promise and std::future?",opts:["Promise class","Future class","Async value passing between threads","None"],ans:2,topic:"Concurrency"},
      {q:"What is std::async?",opts:["Runs function asynchronously","None","Thread function","Async keyword"],ans:0,topic:"Concurrency"},
      {q:"What is a vtable?",opts:["None","Variable table","Virtual function table for runtime dispatch","Vector table"],ans:2,topic:"Internals"},
      {q:"What is vptr?",opts:["Pointer to vtable in each object","Void pointer","Virtual pointer","None"],ans:0,topic:"Internals"},
      {q:"What is CRTP?",opts:["Common Runtime Type","None","C++ Runtime Template","Curiously Recurring Template Pattern"],ans:3,topic:"Patterns"},
      {q:"What is type erasure?",opts:["Casting types","None","Hiding concrete type behind interface","Removing types"],ans:2,topic:"Patterns"},
      {q:"What is the pimpl idiom?",opts:["None","Private impl","Pointer to implementation for ABI stability","Public impl"],ans:2,topic:"Patterns"},
      {q:"What is ADL?",opts:["Array Default List","None","Auto Detect Link","Argument-Dependent Lookup for namespace resolution"],ans:3,topic:"Internals"},
      {q:"What is ODR?",opts:["One Definition Rule","Order Definition","Object Definition","None"],ans:0,topic:"Internals"},
      {q:"What is undefined behavior?",opts:["Code whose result is unpredictable","Error type","Warning type","None"],ans:0,topic:"Internals"},
      {q:"What is alignment in memory?",opts:["Memory order","None","Byte order","Data stored at addresses divisible by its size"],ans:3,topic:"Memory"},
      {q:"What is padding in structs?",opts:["Metadata","Extra fields","Compiler-added bytes for alignment","None"],ans:2,topic:"Memory"},
      {q:"What is copy elision?",opts:["None","Compiler optimization avoiding unnecessary copies","Copy method","Copy error"],ans:1,topic:"Optimization"},
      {q:"What is RVO?",opts:["Return Value Optimization — avoid copying return","Return variable","Return operator","None"],ans:0,topic:"Optimization"},
      {q:"What is NRVO?",opts:["Non-Return Value","Named Return","Named RVO for named local variables","None"],ans:2,topic:"Optimization"},
      {q:"What is a placement new?",opts:["Place class","New operator","None","Constructs object at specific memory address"],ans:3,topic:"Memory"},
      {q:"What is std::variant?",opts:["Array type","Variant class","Type-safe union holding one of several types","None"],ans:2,topic:"C++17"},
      {q:"What is std::optional?",opts:["None","Wrapper for value that may not exist","Maybe class","Optional class"],ans:1,topic:"C++17"},
      {q:"What is std::any?",opts:["Type-safe container for any value","Void wrapper","Any class","None"],ans:0,topic:"C++17"},
      {q:"What is structured binding?",opts:["Auto binding","auto [a,b] = pair;","Tuple binding","None"],ans:1,topic:"C++17"},
      {q:"What is if constexpr?",opts:["Runtime if","Compile-time if for template branching","Const if","None"],ans:1,topic:"C++17"},
      {q:"What is fold expression?",opts:["Expands parameter pack with operator","Pack fold","Expansion","None"],ans:0,topic:"C++17"},
      {q:"What is std::string_view?",opts:["None","String copy","Non-owning view of string data","String class"],ans:2,topic:"C++17"},
      {q:"What is a smart pointer?",opts:["None","Automatically manages memory","Typed pointer","Fast pointer"],ans:1,topic:"Smart Pointers"},
      {q:"What is unique_ptr?",opts:["Shared pointer","Weak pointer","Single-owner smart pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is shared_ptr?",opts:["Weak pointer","Single owner","Multiple-owner reference-counted pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is weak_ptr?",opts:["Light pointer","Weak pointer","None","Non-owning reference to shared_ptr object"],ans:3,topic:"Smart Pointers"},
      {q:"What is move semantics?",opts:["None","Memory allocation","Moving files","Transferring ownership without copying"],ans:3,topic:"C++11"},
      {q:"What does std::move() do?",opts:["None","Casts to rvalue enabling move","Moves physically","Copies object"],ans:1,topic:"C++11"},
      {q:"What is an rvalue?",opts:["Temporary value without address","None","Left-side value","Named variable"],ans:0,topic:"Value Categories"},
      {q:"What is an lvalue?",opts:["None","Right-side","Named object with persistent address","Temporary"],ans:2,topic:"Value Categories"},
      {q:"What is perfect forwarding?",opts:["None","Fast forwarding","Copying","Preserving value category when forwarding args"],ans:3,topic:"C++11"},
      {q:"What is std::forward?",opts:["Forward declare","Used for perfect forwarding in templates","None","Forward iterator"],ans:1,topic:"C++11"},
      {q:"What is a variadic template?",opts:["Template accepting any number of types","Template error","None","Fixed args template"],ans:0,topic:"Templates"},
      {q:"What is template parameter pack?",opts:["Pack class","... syntax for variadic templates","Template param","None"],ans:1,topic:"Templates"},
      {q:"What is SFINAE?",opts:["Static Function","Substitution Failure Is Not An Error","Some Failure Is Normal","None"],ans:1,topic:"Templates"},
      {q:"What is enable_if?",opts:["None","If condition","Enables compiler","Conditionally enables template specialization"],ans:3,topic:"Templates"},
      {q:"What is type_traits?",opts:["Compile-time type information and transformations","Type list","None","Type array"],ans:0,topic:"Templates"},
      {q:"What is constexpr?",opts:["Constant expression evaluated at compile time","None","Runtime constant","Variable"],ans:0,topic:"C++11"},
      {q:"What is nullptr?",opts:["Type-safe null pointer constant","Zero pointer","None","NULL replacement only"],ans:0,topic:"C++11"},
      {q:"What is auto keyword?",opts:["Auto class","Automatic variable","None","Type deduction by compiler"],ans:3,topic:"C++11"},
      {q:"What is decltype?",opts:["Gets type of expression at compile time","Declares type","None","Type keyword"],ans:0,topic:"C++11"},
      {q:"What is a lambda expression?",opts:["None","Named function","Anonymous inline function","Class method"],ans:2,topic:"C++11"},
      {q:"What is capture list in lambda?",opts:["Return type","None","[=] or [&] to capture outer variables","Parameter list"],ans:2,topic:"Lambdas"},
      {q:"What is std::function?",opts:["Method type","Type-erased callable wrapper","Function class","None"],ans:1,topic:"Functional"},
      {q:"What is std::bind?",opts:["Binds reference","None","Binds arguments to function","Creates class"],ans:2,topic:"Functional"},
      {q:"What is std::thread?",opts:["Thread type","C++11 class for creating threads","None","Process class"],ans:1,topic:"Concurrency"},
      {q:"What is std::mutex?",opts:["Memory unit","None","Thread class","Mutual exclusion synchronization primitive"],ans:3,topic:"Concurrency"},
      {q:"What is std::lock_guard?",opts:["None","RAII mutex lock","Manual lock","Thread lock"],ans:1,topic:"Concurrency"},
      {q:"What is std::condition_variable?",opts:["Variable type","Allows threads to wait for condition","None","Signal class"],ans:1,topic:"Concurrency"},
      {q:"What is std::atomic?",opts:["None","Thread safe","Atomic class","Lock-free thread-safe operations"],ans:3,topic:"Concurrency"},
      {q:"What is std::promise and std::future?",opts:["Promise class","Future class","Async value passing between threads","None"],ans:2,topic:"Concurrency"},
      {q:"What is std::async?",opts:["Runs function asynchronously","None","Thread function","Async keyword"],ans:0,topic:"Concurrency"},
      {q:"What is a vtable?",opts:["None","Variable table","Virtual function table for runtime dispatch","Vector table"],ans:2,topic:"Internals"},
      {q:"What is vptr?",opts:["Pointer to vtable in each object","Void pointer","Virtual pointer","None"],ans:0,topic:"Internals"},
      {q:"What is CRTP?",opts:["Common Runtime Type","None","C++ Runtime Template","Curiously Recurring Template Pattern"],ans:3,topic:"Patterns"},
      {q:"What is type erasure?",opts:["Casting types","None","Hiding concrete type behind interface","Removing types"],ans:2,topic:"Patterns"},
      {q:"What is the pimpl idiom?",opts:["None","Private impl","Pointer to implementation for ABI stability","Public impl"],ans:2,topic:"Patterns"},
      {q:"What is ADL?",opts:["Array Default List","None","Auto Detect Link","Argument-Dependent Lookup for namespace resolution"],ans:3,topic:"Internals"},
      {q:"What is ODR?",opts:["One Definition Rule","Order Definition","Object Definition","None"],ans:0,topic:"Internals"},
      {q:"What is undefined behavior?",opts:["Code whose result is unpredictable","Error type","Warning type","None"],ans:0,topic:"Internals"},
      {q:"What is alignment in memory?",opts:["Memory order","None","Byte order","Data stored at addresses divisible by its size"],ans:3,topic:"Memory"},
      {q:"What is padding in structs?",opts:["Metadata","Extra fields","Compiler-added bytes for alignment","None"],ans:2,topic:"Memory"},
      {q:"What is copy elision?",opts:["None","Compiler optimization avoiding unnecessary copies","Copy method","Copy error"],ans:1,topic:"Optimization"},
      {q:"What is RVO?",opts:["Return Value Optimization — avoid copying return","Return variable","Return operator","None"],ans:0,topic:"Optimization"},
      {q:"What is NRVO?",opts:["Non-Return Value","Named Return","Named RVO for named local variables","None"],ans:2,topic:"Optimization"},
      {q:"What is a placement new?",opts:["Place class","New operator","None","Constructs object at specific memory address"],ans:3,topic:"Memory"},
      {q:"What is std::variant?",opts:["Array type","Variant class","Type-safe union holding one of several types","None"],ans:2,topic:"C++17"},
      {q:"What is std::optional?",opts:["None","Wrapper for value that may not exist","Maybe class","Optional class"],ans:1,topic:"C++17"},
      {q:"What is std::any?",opts:["Type-safe container for any value","Void wrapper","Any class","None"],ans:0,topic:"C++17"},
      {q:"What is structured binding?",opts:["Auto binding","auto [a,b] = pair;","Tuple binding","None"],ans:1,topic:"C++17"},
      {q:"What is if constexpr?",opts:["Runtime if","Compile-time if for template branching","Const if","None"],ans:1,topic:"C++17"},
      {q:"What is fold expression?",opts:["Expands parameter pack with operator","Pack fold","Expansion","None"],ans:0,topic:"C++17"},
      {q:"What is std::string_view?",opts:["None","String copy","Non-owning view of string data","String class"],ans:2,topic:"C++17"},
      {q:"What is a smart pointer?",opts:["None","Automatically manages memory","Typed pointer","Fast pointer"],ans:1,topic:"Smart Pointers"},
      {q:"What is unique_ptr?",opts:["Shared pointer","Weak pointer","Single-owner smart pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is shared_ptr?",opts:["Weak pointer","Single owner","Multiple-owner reference-counted pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is weak_ptr?",opts:["Light pointer","Weak pointer","None","Non-owning reference to shared_ptr object"],ans:3,topic:"Smart Pointers"},
      {q:"What is move semantics?",opts:["None","Memory allocation","Moving files","Transferring ownership without copying"],ans:3,topic:"C++11"},
      {q:"What does std::move() do?",opts:["None","Casts to rvalue enabling move","Moves physically","Copies object"],ans:1,topic:"C++11"},
      {q:"What is an rvalue?",opts:["Temporary value without address","None","Left-side value","Named variable"],ans:0,topic:"Value Categories"},
      {q:"What is an lvalue?",opts:["None","Right-side","Named object with persistent address","Temporary"],ans:2,topic:"Value Categories"},
      {q:"What is perfect forwarding?",opts:["None","Fast forwarding","Copying","Preserving value category when forwarding args"],ans:3,topic:"C++11"},
      {q:"What is std::forward?",opts:["Forward declare","Used for perfect forwarding in templates","None","Forward iterator"],ans:1,topic:"C++11"},
      {q:"What is a variadic template?",opts:["Template accepting any number of types","Template error","None","Fixed args template"],ans:0,topic:"Templates"},
      {q:"What is template parameter pack?",opts:["Pack class","... syntax for variadic templates","Template param","None"],ans:1,topic:"Templates"},
      {q:"What is SFINAE?",opts:["Static Function","Substitution Failure Is Not An Error","Some Failure Is Normal","None"],ans:1,topic:"Templates"},
      {q:"What is enable_if?",opts:["None","If condition","Enables compiler","Conditionally enables template specialization"],ans:3,topic:"Templates"},
      {q:"What is type_traits?",opts:["Compile-time type information and transformations","Type list","None","Type array"],ans:0,topic:"Templates"},
      {q:"What is constexpr?",opts:["Constant expression evaluated at compile time","None","Runtime constant","Variable"],ans:0,topic:"C++11"},
      {q:"What is nullptr?",opts:["Type-safe null pointer constant","Zero pointer","None","NULL replacement only"],ans:0,topic:"C++11"},
      {q:"What is auto keyword?",opts:["Auto class","Automatic variable","None","Type deduction by compiler"],ans:3,topic:"C++11"},
      {q:"What is decltype?",opts:["Gets type of expression at compile time","Declares type","None","Type keyword"],ans:0,topic:"C++11"},
      {q:"What is a lambda expression?",opts:["None","Named function","Anonymous inline function","Class method"],ans:2,topic:"C++11"},
      {q:"What is capture list in lambda?",opts:["Return type","None","[=] or [&] to capture outer variables","Parameter list"],ans:2,topic:"Lambdas"},
      {q:"What is std::function?",opts:["Method type","Type-erased callable wrapper","Function class","None"],ans:1,topic:"Functional"},
      {q:"What is std::bind?",opts:["Binds reference","None","Binds arguments to function","Creates class"],ans:2,topic:"Functional"},
      {q:"What is std::thread?",opts:["Thread type","C++11 class for creating threads","None","Process class"],ans:1,topic:"Concurrency"},
      {q:"What is std::mutex?",opts:["Memory unit","None","Thread class","Mutual exclusion synchronization primitive"],ans:3,topic:"Concurrency"},
      {q:"What is std::lock_guard?",opts:["None","RAII mutex lock","Manual lock","Thread lock"],ans:1,topic:"Concurrency"},
      {q:"What is std::condition_variable?",opts:["Variable type","Allows threads to wait for condition","None","Signal class"],ans:1,topic:"Concurrency"},
      {q:"What is std::atomic?",opts:["None","Thread safe","Atomic class","Lock-free thread-safe operations"],ans:3,topic:"Concurrency"},
      {q:"What is std::promise and std::future?",opts:["Promise class","Future class","Async value passing between threads","None"],ans:2,topic:"Concurrency"},
      {q:"What is std::async?",opts:["Runs function asynchronously","None","Thread function","Async keyword"],ans:0,topic:"Concurrency"},
      {q:"What is a vtable?",opts:["None","Variable table","Virtual function table for runtime dispatch","Vector table"],ans:2,topic:"Internals"},
      {q:"What is vptr?",opts:["Pointer to vtable in each object","Void pointer","Virtual pointer","None"],ans:0,topic:"Internals"},
      {q:"What is CRTP?",opts:["Common Runtime Type","None","C++ Runtime Template","Curiously Recurring Template Pattern"],ans:3,topic:"Patterns"},
      {q:"What is type erasure?",opts:["Casting types","None","Hiding concrete type behind interface","Removing types"],ans:2,topic:"Patterns"},
      {q:"What is the pimpl idiom?",opts:["None","Private impl","Pointer to implementation for ABI stability","Public impl"],ans:2,topic:"Patterns"},
      {q:"What is ADL?",opts:["Array Default List","None","Auto Detect Link","Argument-Dependent Lookup for namespace resolution"],ans:3,topic:"Internals"},
      {q:"What is ODR?",opts:["One Definition Rule","Order Definition","Object Definition","None"],ans:0,topic:"Internals"},
      {q:"What is undefined behavior?",opts:["Code whose result is unpredictable","Error type","Warning type","None"],ans:0,topic:"Internals"},
      {q:"What is alignment in memory?",opts:["Memory order","None","Byte order","Data stored at addresses divisible by its size"],ans:3,topic:"Memory"},
      {q:"What is padding in structs?",opts:["Metadata","Extra fields","Compiler-added bytes for alignment","None"],ans:2,topic:"Memory"},
      {q:"What is copy elision?",opts:["None","Compiler optimization avoiding unnecessary copies","Copy method","Copy error"],ans:1,topic:"Optimization"},
      {q:"What is RVO?",opts:["Return Value Optimization — avoid copying return","Return variable","Return operator","None"],ans:0,topic:"Optimization"},
      {q:"What is NRVO?",opts:["Non-Return Value","Named Return","Named RVO for named local variables","None"],ans:2,topic:"Optimization"},
      {q:"What is a placement new?",opts:["Place class","New operator","None","Constructs object at specific memory address"],ans:3,topic:"Memory"},
      {q:"What is std::variant?",opts:["Array type","Variant class","Type-safe union holding one of several types","None"],ans:2,topic:"C++17"},
      {q:"What is std::optional?",opts:["None","Wrapper for value that may not exist","Maybe class","Optional class"],ans:1,topic:"C++17"},
      {q:"What is std::any?",opts:["Type-safe container for any value","Void wrapper","Any class","None"],ans:0,topic:"C++17"},
    ],
    advanced:[
      {q:"What is the as-if rule?",opts:["Compiler can optimize as long as observable behavior same","Assignment rule","None","Alias rule"],ans:0,topic:"Optimization"},
      {q:"What is sequence point?",opts:["Order point","Point where side effects are complete","None","Sequence class"],ans:1,topic:"Internals"},
      {q:"What is strict aliasing?",opts:["Accessing object through wrong type is UB","Alias rule","None","Pointer rule"],ans:0,topic:"Internals"},
      {q:"What is memory ordering in atomics?",opts:["None","Byte order","Memory layout","Controls visibility of operations across threads"],ans:3,topic:"Concurrency"},
      {q:"What is memory_order_seq_cst?",opts:["Strict ordering","None","Strongest ordering — total sequential consistency","Sequential constant"],ans:2,topic:"Concurrency"},
      {q:"What is memory_order_relaxed?",opts:["Relaxed memory","None","Weak ordering","No synchronization guarantees"],ans:3,topic:"Concurrency"},
      {q:"What is ABA problem?",opts:["Race condition","Double A problem","None","Value changes from A to B back to A undetected"],ans:3,topic:"Concurrency"},
      {q:"What is lock-free programming?",opts:["None","Thread-free","Algorithms using atomics without mutexes","No locks"],ans:2,topic:"Concurrency"},
      {q:"What is false sharing?",opts:["Wrong sharing","None","Cache miss","Cache lines ping-ponging between cores"],ans:3,topic:"Performance"},
      {q:"What is cache line?",opts:["Memory page","None","64-byte unit of cache transfer","Cache unit"],ans:2,topic:"Performance"},
      {q:"What is branch prediction?",opts:["None","CPU guessing which branch will execute","Jump prediction","Branch compiler"],ans:1,topic:"Performance"},
      {q:"What is SIMD?",opts:["Single Instruction","None","Single Instruction Multiple Data vectorization","Multiple Data"],ans:2,topic:"Performance"},
      {q:"What is expression templates?",opts:["Template expr","None","Lazy evaluation of math expressions via templates","Lazy template"],ans:2,topic:"Advanced Templates"},
      {q:"What is the diamond problem?",opts:["Diamond class","Multiple base","None","Ambiguity when class inherits same base twice"],ans:3,topic:"OOP"},
      {q:"How to solve diamond problem?",opts:["None","Private inheritance","Virtual inheritance","Multiple inheritance"],ans:2,topic:"OOP"},
      {q:"What is std::coroutine (C++20)?",opts:["Async function","Coroutine class","None","Language-level coroutine support"],ans:3,topic:"C++20"},
      {q:"What is co_await?",opts:["Async wait","Await operator","None","Suspends coroutine until awaitable completes"],ans:3,topic:"C++20"},
      {q:"What is co_yield?",opts:["Yield operator","None","Async yield","Suspends coroutine and returns value"],ans:3,topic:"C++20"},
      {q:"What is a module in C++20?",opts:["Replacement for headers with better encapsulation","Package","Namespace","None"],ans:0,topic:"C++20"},
      {q:"What is concepts in C++20?",opts:["Type concepts","None","Template concepts","Named constraints on template parameters"],ans:3,topic:"C++20"},
      {q:"What is ranges in C++20?",opts:["None","Array ranges","Container ranges","Composable lazy range algorithms"],ans:3,topic:"C++20"},
      {q:"What is std::span?",opts:["Span class","Non-owning view over contiguous sequence","Array view","None"],ans:1,topic:"C++20"},
      {q:"What is three-way comparison <=>?",opts:["None","Spaceship operator","Three compare","Returns less/equal/greater in one operation"],ans:3,topic:"C++20"},
      {q:"What is designated initializers?",opts:["Named init","Struct init by field names: {.x=1,.y=2}","Field init","None"],ans:1,topic:"C++20"},
      {q:"What is std::format?",opts:["Type-safe string formatting","String format","Format class","None"],ans:0,topic:"C++20"},
      {q:"What is jthread?",opts:["Java thread","Joined thread","None","Thread with automatic join and stop token"],ans:3,topic:"C++20"},
      {q:"What is std::stop_token?",opts:["None","Cancel token","Cooperative cancellation mechanism","Stop class"],ans:2,topic:"C++20"},
      {q:"What is a generator coroutine?",opts:["Coroutine yielding sequence of values","Generator class","None","Range generator"],ans:0,topic:"C++20"},
      {q:"What is std::latch?",opts:["Single-use barrier for thread synchronization","Latch class","Thread latch","None"],ans:0,topic:"C++20"},
      {q:"What is std::barrier?",opts:["Reusable synchronization point for threads","Barrier class","Thread barrier","None"],ans:0,topic:"C++20"},
      {q:"What is std::semaphore?",opts:["Semaphore class","None","Thread signal","Counting synchronization primitive"],ans:3,topic:"C++20"},
      {q:"What is flat_map in C++23?",opts:["Sorted array-backed map for cache efficiency","Array map","None","Flat container"],ans:0,topic:"C++23"},
      {q:"What is std::expected?",opts:["Either a value or an error — error handling","Result type","None","Expected class"],ans:0,topic:"C++23"},
      {q:"What is std::mdspan?",opts:["Multi-dimensional span view","Matrix span","Multi-span","None"],ans:0,topic:"C++23"},
      {q:"What is deducing this in C++23?",opts:["None","Self parameter","This deduction","Explicit this parameter in member functions"],ans:3,topic:"C++23"},
      {q:"What is std::print in C++23?",opts:["Formatted output to stdout","Print class","None","Format print"],ans:0,topic:"C++23"},
      {q:"What is stack unwinding?",opts:["None","Stack clearing","Destructors called during exception propagation","Unwind class"],ans:2,topic:"Exceptions"},
      {q:"What is exception specification noexcept?",opts:["No exception","Exception spec","None","Promises function won't throw"],ans:3,topic:"Exceptions"},
      {q:"What is std::terminate?",opts:["Program end","None","Terminate function","Called when exception not caught"],ans:3,topic:"Exceptions"},
      {q:"What is SEH?",opts:["System Exception Handling","None","Structured Exception Handling on Windows","Safe Exception Handling"],ans:2,topic:"Exceptions"},
      {q:"What is the as-if rule?",opts:["Compiler can optimize as long as observable behavior same","Assignment rule","None","Alias rule"],ans:0,topic:"Optimization"},
      {q:"What is sequence point?",opts:["Order point","Point where side effects are complete","None","Sequence class"],ans:1,topic:"Internals"},
      {q:"What is strict aliasing?",opts:["Accessing object through wrong type is UB","Alias rule","None","Pointer rule"],ans:0,topic:"Internals"},
      {q:"What is memory ordering in atomics?",opts:["None","Byte order","Memory layout","Controls visibility of operations across threads"],ans:3,topic:"Concurrency"},
      {q:"What is memory_order_seq_cst?",opts:["Strict ordering","None","Strongest ordering — total sequential consistency","Sequential constant"],ans:2,topic:"Concurrency"},
      {q:"What is memory_order_relaxed?",opts:["Relaxed memory","None","Weak ordering","No synchronization guarantees"],ans:3,topic:"Concurrency"},
      {q:"What is ABA problem?",opts:["Race condition","Double A problem","None","Value changes from A to B back to A undetected"],ans:3,topic:"Concurrency"},
      {q:"What is lock-free programming?",opts:["None","Thread-free","Algorithms using atomics without mutexes","No locks"],ans:2,topic:"Concurrency"},
      {q:"What is false sharing?",opts:["Wrong sharing","None","Cache miss","Cache lines ping-ponging between cores"],ans:3,topic:"Performance"},
      {q:"What is cache line?",opts:["Memory page","None","64-byte unit of cache transfer","Cache unit"],ans:2,topic:"Performance"},
      {q:"What is branch prediction?",opts:["None","CPU guessing which branch will execute","Jump prediction","Branch compiler"],ans:1,topic:"Performance"},
      {q:"What is SIMD?",opts:["Single Instruction","None","Single Instruction Multiple Data vectorization","Multiple Data"],ans:2,topic:"Performance"},
      {q:"What is expression templates?",opts:["Template expr","None","Lazy evaluation of math expressions via templates","Lazy template"],ans:2,topic:"Advanced Templates"},
      {q:"What is the diamond problem?",opts:["Diamond class","Multiple base","None","Ambiguity when class inherits same base twice"],ans:3,topic:"OOP"},
      {q:"How to solve diamond problem?",opts:["None","Private inheritance","Virtual inheritance","Multiple inheritance"],ans:2,topic:"OOP"},
      {q:"What is std::coroutine (C++20)?",opts:["Async function","Coroutine class","None","Language-level coroutine support"],ans:3,topic:"C++20"},
      {q:"What is co_await?",opts:["Async wait","Await operator","None","Suspends coroutine until awaitable completes"],ans:3,topic:"C++20"},
      {q:"What is co_yield?",opts:["Yield operator","None","Async yield","Suspends coroutine and returns value"],ans:3,topic:"C++20"},
      {q:"What is a module in C++20?",opts:["Replacement for headers with better encapsulation","Package","Namespace","None"],ans:0,topic:"C++20"},
      {q:"What is concepts in C++20?",opts:["Type concepts","None","Template concepts","Named constraints on template parameters"],ans:3,topic:"C++20"},
      {q:"What is ranges in C++20?",opts:["None","Array ranges","Container ranges","Composable lazy range algorithms"],ans:3,topic:"C++20"},
      {q:"What is std::span?",opts:["Span class","Non-owning view over contiguous sequence","Array view","None"],ans:1,topic:"C++20"},
      {q:"What is three-way comparison <=>?",opts:["None","Spaceship operator","Three compare","Returns less/equal/greater in one operation"],ans:3,topic:"C++20"},
      {q:"What is designated initializers?",opts:["Named init","Struct init by field names: {.x=1,.y=2}","Field init","None"],ans:1,topic:"C++20"},
      {q:"What is std::format?",opts:["Type-safe string formatting","String format","Format class","None"],ans:0,topic:"C++20"},
      {q:"What is jthread?",opts:["Java thread","Joined thread","None","Thread with automatic join and stop token"],ans:3,topic:"C++20"},
      {q:"What is std::stop_token?",opts:["None","Cancel token","Cooperative cancellation mechanism","Stop class"],ans:2,topic:"C++20"},
      {q:"What is a generator coroutine?",opts:["Coroutine yielding sequence of values","Generator class","None","Range generator"],ans:0,topic:"C++20"},
      {q:"What is std::latch?",opts:["Single-use barrier for thread synchronization","Latch class","Thread latch","None"],ans:0,topic:"C++20"},
      {q:"What is std::barrier?",opts:["Reusable synchronization point for threads","Barrier class","Thread barrier","None"],ans:0,topic:"C++20"},
      {q:"What is std::semaphore?",opts:["Semaphore class","None","Thread signal","Counting synchronization primitive"],ans:3,topic:"C++20"},
      {q:"What is flat_map in C++23?",opts:["Sorted array-backed map for cache efficiency","Array map","None","Flat container"],ans:0,topic:"C++23"},
      {q:"What is std::expected?",opts:["Either a value or an error — error handling","Result type","None","Expected class"],ans:0,topic:"C++23"},
      {q:"What is std::mdspan?",opts:["Multi-dimensional span view","Matrix span","Multi-span","None"],ans:0,topic:"C++23"},
      {q:"What is deducing this in C++23?",opts:["None","Self parameter","This deduction","Explicit this parameter in member functions"],ans:3,topic:"C++23"},
      {q:"What is std::print in C++23?",opts:["Formatted output to stdout","Print class","None","Format print"],ans:0,topic:"C++23"},
      {q:"What is stack unwinding?",opts:["None","Stack clearing","Destructors called during exception propagation","Unwind class"],ans:2,topic:"Exceptions"},
      {q:"What is exception specification noexcept?",opts:["No exception","Exception spec","None","Promises function won't throw"],ans:3,topic:"Exceptions"},
      {q:"What is std::terminate?",opts:["Program end","None","Terminate function","Called when exception not caught"],ans:3,topic:"Exceptions"},
      {q:"What is SEH?",opts:["System Exception Handling","None","Structured Exception Handling on Windows","Safe Exception Handling"],ans:2,topic:"Exceptions"},
      {q:"What is the as-if rule?",opts:["Compiler can optimize as long as observable behavior same","Assignment rule","None","Alias rule"],ans:0,topic:"Optimization"},
      {q:"What is sequence point?",opts:["Order point","Point where side effects are complete","None","Sequence class"],ans:1,topic:"Internals"},
      {q:"What is strict aliasing?",opts:["Accessing object through wrong type is UB","Alias rule","None","Pointer rule"],ans:0,topic:"Internals"},
      {q:"What is memory ordering in atomics?",opts:["None","Byte order","Memory layout","Controls visibility of operations across threads"],ans:3,topic:"Concurrency"},
      {q:"What is memory_order_seq_cst?",opts:["Strict ordering","None","Strongest ordering — total sequential consistency","Sequential constant"],ans:2,topic:"Concurrency"},
      {q:"What is memory_order_relaxed?",opts:["Relaxed memory","None","Weak ordering","No synchronization guarantees"],ans:3,topic:"Concurrency"},
      {q:"What is ABA problem?",opts:["Race condition","Double A problem","None","Value changes from A to B back to A undetected"],ans:3,topic:"Concurrency"},
      {q:"What is lock-free programming?",opts:["None","Thread-free","Algorithms using atomics without mutexes","No locks"],ans:2,topic:"Concurrency"},
      {q:"What is false sharing?",opts:["Wrong sharing","None","Cache miss","Cache lines ping-ponging between cores"],ans:3,topic:"Performance"},
      {q:"What is cache line?",opts:["Memory page","None","64-byte unit of cache transfer","Cache unit"],ans:2,topic:"Performance"},
      {q:"What is branch prediction?",opts:["None","CPU guessing which branch will execute","Jump prediction","Branch compiler"],ans:1,topic:"Performance"},
      {q:"What is SIMD?",opts:["Single Instruction","None","Single Instruction Multiple Data vectorization","Multiple Data"],ans:2,topic:"Performance"},
      {q:"What is expression templates?",opts:["Template expr","None","Lazy evaluation of math expressions via templates","Lazy template"],ans:2,topic:"Advanced Templates"},
      {q:"What is the diamond problem?",opts:["Diamond class","Multiple base","None","Ambiguity when class inherits same base twice"],ans:3,topic:"OOP"},
      {q:"How to solve diamond problem?",opts:["None","Private inheritance","Virtual inheritance","Multiple inheritance"],ans:2,topic:"OOP"},
      {q:"What is std::coroutine (C++20)?",opts:["Async function","Coroutine class","None","Language-level coroutine support"],ans:3,topic:"C++20"},
      {q:"What is co_await?",opts:["Async wait","Await operator","None","Suspends coroutine until awaitable completes"],ans:3,topic:"C++20"},
      {q:"What is co_yield?",opts:["Yield operator","None","Async yield","Suspends coroutine and returns value"],ans:3,topic:"C++20"},
      {q:"What is a module in C++20?",opts:["Replacement for headers with better encapsulation","Package","Namespace","None"],ans:0,topic:"C++20"},
      {q:"What is concepts in C++20?",opts:["Type concepts","None","Template concepts","Named constraints on template parameters"],ans:3,topic:"C++20"},
      {q:"What is ranges in C++20?",opts:["None","Array ranges","Container ranges","Composable lazy range algorithms"],ans:3,topic:"C++20"},
      {q:"What is std::span?",opts:["Span class","Non-owning view over contiguous sequence","Array view","None"],ans:1,topic:"C++20"},
      {q:"What is three-way comparison <=>?",opts:["None","Spaceship operator","Three compare","Returns less/equal/greater in one operation"],ans:3,topic:"C++20"},
      {q:"What is designated initializers?",opts:["Named init","Struct init by field names: {.x=1,.y=2}","Field init","None"],ans:1,topic:"C++20"},
      {q:"What is std::format?",opts:["Type-safe string formatting","String format","Format class","None"],ans:0,topic:"C++20"},
      {q:"What is jthread?",opts:["Java thread","Joined thread","None","Thread with automatic join and stop token"],ans:3,topic:"C++20"},
      {q:"What is std::stop_token?",opts:["None","Cancel token","Cooperative cancellation mechanism","Stop class"],ans:2,topic:"C++20"},
      {q:"What is a generator coroutine?",opts:["Coroutine yielding sequence of values","Generator class","None","Range generator"],ans:0,topic:"C++20"},
      {q:"What is std::latch?",opts:["Single-use barrier for thread synchronization","Latch class","Thread latch","None"],ans:0,topic:"C++20"},
      {q:"What is std::barrier?",opts:["Reusable synchronization point for threads","Barrier class","Thread barrier","None"],ans:0,topic:"C++20"},
      {q:"What is std::semaphore?",opts:["Semaphore class","None","Thread signal","Counting synchronization primitive"],ans:3,topic:"C++20"},
      {q:"What is flat_map in C++23?",opts:["Sorted array-backed map for cache efficiency","Array map","None","Flat container"],ans:0,topic:"C++23"},
      {q:"What is std::expected?",opts:["Either a value or an error — error handling","Result type","None","Expected class"],ans:0,topic:"C++23"},
      {q:"What is std::mdspan?",opts:["Multi-dimensional span view","Matrix span","Multi-span","None"],ans:0,topic:"C++23"},
      {q:"What is deducing this in C++23?",opts:["None","Self parameter","This deduction","Explicit this parameter in member functions"],ans:3,topic:"C++23"},
      {q:"What is std::print in C++23?",opts:["Formatted output to stdout","Print class","None","Format print"],ans:0,topic:"C++23"},
      {q:"What is stack unwinding?",opts:["None","Stack clearing","Destructors called during exception propagation","Unwind class"],ans:2,topic:"Exceptions"},
      {q:"What is exception specification noexcept?",opts:["No exception","Exception spec","None","Promises function won't throw"],ans:3,topic:"Exceptions"},
      {q:"What is std::terminate?",opts:["Program end","None","Terminate function","Called when exception not caught"],ans:3,topic:"Exceptions"},
      {q:"What is SEH?",opts:["System Exception Handling","None","Structured Exception Handling on Windows","Safe Exception Handling"],ans:2,topic:"Exceptions"},
      {q:"What is the as-if rule?",opts:["Compiler can optimize as long as observable behavior same","Assignment rule","None","Alias rule"],ans:0,topic:"Optimization"},
      {q:"What is sequence point?",opts:["Order point","Point where side effects are complete","None","Sequence class"],ans:1,topic:"Internals"},
      {q:"What is strict aliasing?",opts:["Accessing object through wrong type is UB","Alias rule","None","Pointer rule"],ans:0,topic:"Internals"},
      {q:"What is memory ordering in atomics?",opts:["None","Byte order","Memory layout","Controls visibility of operations across threads"],ans:3,topic:"Concurrency"},
      {q:"What is memory_order_seq_cst?",opts:["Strict ordering","None","Strongest ordering — total sequential consistency","Sequential constant"],ans:2,topic:"Concurrency"},
      {q:"What is memory_order_relaxed?",opts:["Relaxed memory","None","Weak ordering","No synchronization guarantees"],ans:3,topic:"Concurrency"},
      {q:"What is ABA problem?",opts:["Race condition","Double A problem","None","Value changes from A to B back to A undetected"],ans:3,topic:"Concurrency"},
      {q:"What is lock-free programming?",opts:["None","Thread-free","Algorithms using atomics without mutexes","No locks"],ans:2,topic:"Concurrency"},
      {q:"What is false sharing?",opts:["Wrong sharing","None","Cache miss","Cache lines ping-ponging between cores"],ans:3,topic:"Performance"},
      {q:"What is cache line?",opts:["Memory page","None","64-byte unit of cache transfer","Cache unit"],ans:2,topic:"Performance"},
      {q:"What is branch prediction?",opts:["None","CPU guessing which branch will execute","Jump prediction","Branch compiler"],ans:1,topic:"Performance"},
      {q:"What is SIMD?",opts:["Single Instruction","None","Single Instruction Multiple Data vectorization","Multiple Data"],ans:2,topic:"Performance"},
      {q:"What is expression templates?",opts:["Template expr","None","Lazy evaluation of math expressions via templates","Lazy template"],ans:2,topic:"Advanced Templates"},
      {q:"What is the diamond problem?",opts:["Diamond class","Multiple base","None","Ambiguity when class inherits same base twice"],ans:3,topic:"OOP"},
      {q:"How to solve diamond problem?",opts:["None","Private inheritance","Virtual inheritance","Multiple inheritance"],ans:2,topic:"OOP"},
      {q:"What is std::coroutine (C++20)?",opts:["Async function","Coroutine class","None","Language-level coroutine support"],ans:3,topic:"C++20"},
      {q:"What is co_await?",opts:["Async wait","Await operator","None","Suspends coroutine until awaitable completes"],ans:3,topic:"C++20"},
      {q:"What is co_yield?",opts:["Yield operator","None","Async yield","Suspends coroutine and returns value"],ans:3,topic:"C++20"},
      {q:"What is a module in C++20?",opts:["Replacement for headers with better encapsulation","Package","Namespace","None"],ans:0,topic:"C++20"},
      {q:"What is concepts in C++20?",opts:["Type concepts","None","Template concepts","Named constraints on template parameters"],ans:3,topic:"C++20"},
      {q:"What is ranges in C++20?",opts:["None","Array ranges","Container ranges","Composable lazy range algorithms"],ans:3,topic:"C++20"},
      {q:"What is std::span?",opts:["Span class","Non-owning view over contiguous sequence","Array view","None"],ans:1,topic:"C++20"},
      {q:"What is three-way comparison <=>?",opts:["None","Spaceship operator","Three compare","Returns less/equal/greater in one operation"],ans:3,topic:"C++20"},
      {q:"What is designated initializers?",opts:["Named init","Struct init by field names: {.x=1,.y=2}","Field init","None"],ans:1,topic:"C++20"},
      {q:"What is std::format?",opts:["Type-safe string formatting","String format","Format class","None"],ans:0,topic:"C++20"},
      {q:"What is jthread?",opts:["Java thread","Joined thread","None","Thread with automatic join and stop token"],ans:3,topic:"C++20"},
      {q:"What is std::stop_token?",opts:["None","Cancel token","Cooperative cancellation mechanism","Stop class"],ans:2,topic:"C++20"},
      {q:"What is a generator coroutine?",opts:["Coroutine yielding sequence of values","Generator class","None","Range generator"],ans:0,topic:"C++20"},
      {q:"What is std::latch?",opts:["Single-use barrier for thread synchronization","Latch class","Thread latch","None"],ans:0,topic:"C++20"},
      {q:"What is std::barrier?",opts:["Reusable synchronization point for threads","Barrier class","Thread barrier","None"],ans:0,topic:"C++20"},
      {q:"What is std::semaphore?",opts:["Semaphore class","None","Thread signal","Counting synchronization primitive"],ans:3,topic:"C++20"},
      {q:"What is flat_map in C++23?",opts:["Sorted array-backed map for cache efficiency","Array map","None","Flat container"],ans:0,topic:"C++23"},
      {q:"What is std::expected?",opts:["Either a value or an error — error handling","Result type","None","Expected class"],ans:0,topic:"C++23"},
      {q:"What is std::mdspan?",opts:["Multi-dimensional span view","Matrix span","Multi-span","None"],ans:0,topic:"C++23"},
      {q:"What is deducing this in C++23?",opts:["None","Self parameter","This deduction","Explicit this parameter in member functions"],ans:3,topic:"C++23"},
      {q:"What is std::print in C++23?",opts:["Formatted output to stdout","Print class","None","Format print"],ans:0,topic:"C++23"},
      {q:"What is stack unwinding?",opts:["None","Stack clearing","Destructors called during exception propagation","Unwind class"],ans:2,topic:"Exceptions"},
      {q:"What is exception specification noexcept?",opts:["No exception","Exception spec","None","Promises function won't throw"],ans:3,topic:"Exceptions"},
      {q:"What is std::terminate?",opts:["Program end","None","Terminate function","Called when exception not caught"],ans:3,topic:"Exceptions"},
      {q:"What is SEH?",opts:["System Exception Handling","None","Structured Exception Handling on Windows","Safe Exception Handling"],ans:2,topic:"Exceptions"},
      {q:"What is the as-if rule?",opts:["Compiler can optimize as long as observable behavior same","Assignment rule","None","Alias rule"],ans:0,topic:"Optimization"},
      {q:"What is sequence point?",opts:["Order point","Point where side effects are complete","None","Sequence class"],ans:1,topic:"Internals"},
      {q:"What is strict aliasing?",opts:["Accessing object through wrong type is UB","Alias rule","None","Pointer rule"],ans:0,topic:"Internals"},
      {q:"What is memory ordering in atomics?",opts:["None","Byte order","Memory layout","Controls visibility of operations across threads"],ans:3,topic:"Concurrency"},
      {q:"What is memory_order_seq_cst?",opts:["Strict ordering","None","Strongest ordering — total sequential consistency","Sequential constant"],ans:2,topic:"Concurrency"},
      {q:"What is memory_order_relaxed?",opts:["Relaxed memory","None","Weak ordering","No synchronization guarantees"],ans:3,topic:"Concurrency"},
      {q:"What is ABA problem?",opts:["Race condition","Double A problem","None","Value changes from A to B back to A undetected"],ans:3,topic:"Concurrency"},
      {q:"What is lock-free programming?",opts:["None","Thread-free","Algorithms using atomics without mutexes","No locks"],ans:2,topic:"Concurrency"},
      {q:"What is false sharing?",opts:["Wrong sharing","None","Cache miss","Cache lines ping-ponging between cores"],ans:3,topic:"Performance"},
      {q:"What is cache line?",opts:["Memory page","None","64-byte unit of cache transfer","Cache unit"],ans:2,topic:"Performance"},
      {q:"What is branch prediction?",opts:["None","CPU guessing which branch will execute","Jump prediction","Branch compiler"],ans:1,topic:"Performance"},
      {q:"What is SIMD?",opts:["Single Instruction","None","Single Instruction Multiple Data vectorization","Multiple Data"],ans:2,topic:"Performance"},
      {q:"What is expression templates?",opts:["Template expr","None","Lazy evaluation of math expressions via templates","Lazy template"],ans:2,topic:"Advanced Templates"},
      {q:"What is the diamond problem?",opts:["Diamond class","Multiple base","None","Ambiguity when class inherits same base twice"],ans:3,topic:"OOP"},
      {q:"How to solve diamond problem?",opts:["None","Private inheritance","Virtual inheritance","Multiple inheritance"],ans:2,topic:"OOP"},
      {q:"What is std::coroutine (C++20)?",opts:["Async function","Coroutine class","None","Language-level coroutine support"],ans:3,topic:"C++20"},
      {q:"What is co_await?",opts:["Async wait","Await operator","None","Suspends coroutine until awaitable completes"],ans:3,topic:"C++20"},
      {q:"What is co_yield?",opts:["Yield operator","None","Async yield","Suspends coroutine and returns value"],ans:3,topic:"C++20"},
      {q:"What is a module in C++20?",opts:["Replacement for headers with better encapsulation","Package","Namespace","None"],ans:0,topic:"C++20"},
      {q:"What is concepts in C++20?",opts:["Type concepts","None","Template concepts","Named constraints on template parameters"],ans:3,topic:"C++20"},
      {q:"What is ranges in C++20?",opts:["None","Array ranges","Container ranges","Composable lazy range algorithms"],ans:3,topic:"C++20"},
      {q:"What is std::span?",opts:["Span class","Non-owning view over contiguous sequence","Array view","None"],ans:1,topic:"C++20"},
      {q:"What is three-way comparison <=>?",opts:["None","Spaceship operator","Three compare","Returns less/equal/greater in one operation"],ans:3,topic:"C++20"},
      {q:"What is designated initializers?",opts:["Named init","Struct init by field names: {.x=1,.y=2}","Field init","None"],ans:1,topic:"C++20"},
      {q:"What is std::format?",opts:["Type-safe string formatting","String format","Format class","None"],ans:0,topic:"C++20"},
      {q:"What is jthread?",opts:["Java thread","Joined thread","None","Thread with automatic join and stop token"],ans:3,topic:"C++20"},
      {q:"What is std::stop_token?",opts:["None","Cancel token","Cooperative cancellation mechanism","Stop class"],ans:2,topic:"C++20"},
      {q:"What is a generator coroutine?",opts:["Coroutine yielding sequence of values","Generator class","None","Range generator"],ans:0,topic:"C++20"},
      {q:"What is std::latch?",opts:["Single-use barrier for thread synchronization","Latch class","Thread latch","None"],ans:0,topic:"C++20"},
      {q:"What is std::barrier?",opts:["Reusable synchronization point for threads","Barrier class","Thread barrier","None"],ans:0,topic:"C++20"},
      {q:"What is std::semaphore?",opts:["Semaphore class","None","Thread signal","Counting synchronization primitive"],ans:3,topic:"C++20"},
      {q:"What is flat_map in C++23?",opts:["Sorted array-backed map for cache efficiency","Array map","None","Flat container"],ans:0,topic:"C++23"},
      {q:"What is std::expected?",opts:["Either a value or an error — error handling","Result type","None","Expected class"],ans:0,topic:"C++23"},
      {q:"What is std::mdspan?",opts:["Multi-dimensional span view","Matrix span","Multi-span","None"],ans:0,topic:"C++23"},
      {q:"What is deducing this in C++23?",opts:["None","Self parameter","This deduction","Explicit this parameter in member functions"],ans:3,topic:"C++23"},
      {q:"What is std::print in C++23?",opts:["Formatted output to stdout","Print class","None","Format print"],ans:0,topic:"C++23"},
      {q:"What is stack unwinding?",opts:["None","Stack clearing","Destructors called during exception propagation","Unwind class"],ans:2,topic:"Exceptions"},
      {q:"What is exception specification noexcept?",opts:["No exception","Exception spec","None","Promises function won't throw"],ans:3,topic:"Exceptions"},
      {q:"What is std::terminate?",opts:["Program end","None","Terminate function","Called when exception not caught"],ans:3,topic:"Exceptions"},
      {q:"What is SEH?",opts:["System Exception Handling","None","Structured Exception Handling on Windows","Safe Exception Handling"],ans:2,topic:"Exceptions"},
    ],
  },
  c2:{
    basic:[
      {q:"What does 'cout' output in C++?",opts:["Text to console","Input from user","File content","Memory address"],ans:0,topic:"Basics"},
      {q:"How to end a C++ statement?",opts:["Colon :","Comma ,","Semicolon ;","Period ."],ans:2,topic:"Basics"},
      {q:"Which header is needed for cout?",opts:["stdlib.h","iostream","string.h","stdio.h"],ans:1,topic:"Basics"},
      {q:"What does 'int' declare?",opts:["String","Character","Float variable","Integer variable"],ans:3,topic:"Data Types"},
      {q:"How to write single-line comment in C++?",opts:["#","//","/* */","--"],ans:1,topic:"Basics"},
      {q:"Which is correct variable declaration?",opts:["5 = int x;","x int = 5;","int = x 5;","int x = 5;"],ans:3,topic:"Variables"},
      {q:"What does 'cin' do?",opts:["None","Outputs to console","Creates input","Takes input from user"],ans:3,topic:"I/O"},
      {q:"What is an array?",opts:["Single variable","Tree","Key-value store","Collection of same-type elements"],ans:3,topic:"Arrays"},
      {q:"How to access 3rd element of array 'a'?",opts:["a[2]","a[3]","a.3","a(3)"],ans:0,topic:"Arrays"},
      {q:"What is a for loop used for?",opts:["None","Decision making","Repeating code set number of times","Defining functions"],ans:2,topic:"Loops"},
      {q:"What does 'break' do in a loop?",opts:["None","Restarts","Skips iteration","Exits the loop"],ans:3,topic:"Loops"},
      {q:"What is a function?",opts:["None","Loop","Variable","Reusable block of code"],ans:3,topic:"Functions"},
      {q:"What is 'return' used for?",opts:["Prints value","Sends value back from function","Imports","None"],ans:1,topic:"Functions"},
      {q:"How to declare a string?",opts:["str s = 'hi';","String s = 'hi';","string s = 'hi';","char s = 'hi';"],ans:2,topic:"Strings"},
      {q:"What does sizeof() return?",opts:["Size in bytes","Array length","Length of string","None"],ans:0,topic:"Memory"},
      {q:"What is a boolean?",opts:["None","True/False value","Number","Character"],ans:1,topic:"Data Types"},
      {q:"How to write if-else in C++?",opts:["None","if x>0 then","if x > 0:","if(x>0){} else{}"],ans:3,topic:"Conditionals"},
      {q:"Last valid index in int a[5]?",opts:["4","6","3","5"],ans:0,topic:"Arrays"},
      {q:"What does 'void' return type mean?",opts:["None","Returns zero","Function returns nothing","Returns string"],ans:2,topic:"Functions"},
      {q:"What is a nested loop?",opts:["None","Loop with break","Loop inside another loop","Recursive loop"],ans:2,topic:"Loops"},
      {q:"What is 'while' loop?",opts:["Runs while condition is true","Runs once","Runs forever","Runs fixed times"],ans:0,topic:"Loops"},
      {q:"What is a do-while loop?",opts:["Runs at least once, checks after","Checks first","Never runs","Runs twice"],ans:0,topic:"Loops"},
      {q:"How to declare a constant in C++?",opts:["constant int x = 5;","#define only","final int x = 5;","const int x = 5;"],ans:3,topic:"Variables"},
      {q:"What is the scope of local variable?",opts:["In class only","Everywhere","In file only","Inside its block only"],ans:3,topic:"Variables"},
      {q:"What does '&&' mean?",opts:["Bitwise AND","Logical AND","Address of","None"],ans:1,topic:"Operators"},
      {q:"What does '||' mean?",opts:["Logical OR","Bitwise OR","Pipe","None"],ans:0,topic:"Operators"},
      {q:"What is a char data type?",opts:["String","Integer","Single character","Boolean"],ans:2,topic:"Data Types"},
      {q:"What does 'float' store?",opts:["Booleans","Integers","Decimal numbers","Characters"],ans:2,topic:"Data Types"},
      {q:"What is a double?",opts:["Double-precision decimal","Two floats","None","Double integer"],ans:0,topic:"Data Types"},
      {q:"How to read integer input with cin?",opts:["cin >> x;","cin << x;","cin(x);","read(x);"],ans:0,topic:"I/O"},
      {q:"How to print newline in cout?",opts:["cout << endl;","cout << \n;","cout << newline;","print();"],ans:0,topic:"I/O"},
      {q:"What is a ternary operator?",opts:["a ? b : c","if else shorthand","None","Both a and b"],ans:0,topic:"Operators"},
      {q:"What does % operator do?",opts:["Returns remainder","Modifies","Divides","Multiplies"],ans:0,topic:"Operators"},
      {q:"What is += operator?",opts:["Concatenates","Compares","Adds and assigns","Adds only"],ans:2,topic:"Operators"},
      {q:"What does 'continue' do?",opts:["Exits loop","None","Skips to next iteration","Restarts function"],ans:2,topic:"Loops"},
      {q:"How to swap two variables a and b?",opts:["swap=a+b;","a<->b;","temp=a; a=b; b=temp;","a=b; b=a;"],ans:2,topic:"Basics"},
      {q:"What is #include?",opts:["Preprocessor directive to include file","Comment","Variable","Function call"],ans:0,topic:"Preprocessor"},
      {q:"What is #define?",opts:["Defines function","Defines variable","None","Defines macro constant"],ans:3,topic:"Preprocessor"},
      {q:"What is 'main' function?",opts:["Main loop","Entry point of C++ program","Main variable","Main class"],ans:1,topic:"Basics"},
      {q:"What does 'return 0' in main() mean?",opts:["Error occurred","None","Program exited successfully","Restart program"],ans:2,topic:"Basics"},
      {q:"What is a pointer?",opts:["Variable storing value","None","Variable storing memory address","Array element"],ans:2,topic:"Pointers"},
      {q:"What does * do in pointer declaration?",opts:["Dereferences","Declares pointer variable","None","Multiplies"],ans:1,topic:"Pointers"},
      {q:"What does & operator do with variable?",opts:["Returns value","Copies it","Returns its memory address","None"],ans:2,topic:"Pointers"},
      {q:"What is dereferencing a pointer?",opts:["Accessing value at pointer's address","None","Getting address","Copying pointer"],ans:0,topic:"Pointers"},
      {q:"What is NULL pointer?",opts:["Empty array","Pointer pointing to nothing","Zero pointer","None"],ans:1,topic:"Pointers"},
      {q:"What is pointer arithmetic?",opts:["None","None","Math with pointers","Moving pointer by element sizes"],ans:3,topic:"Pointers"},
      {q:"What is array-pointer relationship?",opts:["Arrays are classes","Arrays are objects","None","Array name is pointer to first element"],ans:3,topic:"Arrays"},
      {q:"How to dynamically allocate int?",opts:["malloc(int);","alloc int;","new int;","create int;"],ans:2,topic:"Memory"},
      {q:"How to free dynamic memory?",opts:["remove ptr;","clear ptr;","delete ptr;","free(ptr);"],ans:2,topic:"Memory"},
      {q:"What is memory leak?",opts:["Memory error","Stack overflow","None","Allocated memory not freed"],ans:3,topic:"Memory"},
      {q:"What is stack memory?",opts:["Dynamic memory","Auto-managed local variable memory","Heap","None"],ans:1,topic:"Memory"},
      {q:"What is heap memory?",opts:["Dynamic allocation via new/malloc","Stack","Auto memory","None"],ans:0,topic:"Memory"},
      {q:"What is a reference variable?",opts:["Alias for another variable","Copy of variable","None","Pointer"],ans:0,topic:"References"},
      {q:"How to pass variable by reference?",opts:["void f(int x)","void f(int &x)","void f(&int x)","void f(int *x)"],ans:1,topic:"Functions"},
      {q:"What is pass by value?",opts:["Function gets original","Pointer passing","None","Function gets copy of argument"],ans:3,topic:"Functions"},
      {q:"What is an array of pointers?",opts:["Pointer array class","Array where each element is pointer","None","2D array"],ans:1,topic:"Arrays"},
      {q:"How to declare pointer to int?",opts:["int &p;","pointer int p;","int* p;","int p*;"],ans:2,topic:"Pointers"},
      {q:"What is void pointer?",opts:["Null pointer","Empty pointer","None","Pointer with no specific type"],ans:3,topic:"Pointers"},
      {q:"What is pointer to pointer?",opts:["Double pointer **","Reference","Single pointer","None"],ans:0,topic:"Pointers"},
      {q:"What is the output of: int a=5; int* p=&a; cout<<*p;?",opts:["Address","0","5","Error"],ans:2,topic:"Pointers"},
      {q:"What is a class in C++?",opts:["Blueprint for objects","Function group","Module","Variable"],ans:0,topic:"OOP"},
      {q:"How to create object of class Car?",opts:["new Car c;","Car.create();","Car c;","object Car c;"],ans:2,topic:"OOP"},
      {q:"What is a constructor?",opts:["Destructor","Auto-called method to initialize object","None","Copy function"],ans:1,topic:"OOP"},
      {q:"What is a destructor?",opts:["Constructor","Copy constructor","Auto-called when object is destroyed","None"],ans:2,topic:"OOP"},
      {q:"What is encapsulation?",opts:["Creating objects","Hiding data inside class","Importing","Inheriting"],ans:1,topic:"OOP"},
      {q:"What is inheritance?",opts:["Copying code","Multiple classes","None","Child class reusing parent properties"],ans:3,topic:"OOP"},
      {q:"What is polymorphism?",opts:["Same interface, different behavior","Multiple inheritance","None","Many methods"],ans:0,topic:"OOP"},
      {q:"What is 'public' access?",opts:["Derived only","Class only","Accessible from anywhere","File only"],ans:2,topic:"OOP"},
      {q:"What is 'private' access?",opts:["Accessible only within class","Everywhere","File only","Derived classes"],ans:0,topic:"OOP"},
      {q:"What is 'protected' access?",opts:["Accessible in class and derived classes","Everywhere","File only","Class only"],ans:0,topic:"OOP"},
      {q:"What is method overriding?",opts:["Creating new method","None","Child class redefines parent method","Copying method"],ans:2,topic:"OOP"},
      {q:"What is function overloading?",opts:["Same name different parameters","Same everything","Different names","None"],ans:0,topic:"Functions"},
      {q:"What is scope resolution operator?",opts:["->","**","::",".."],ans:2,topic:"Operators"},
      {q:"What does 'this' pointer refer to?",opts:["None","Current object","Global variable","Parent class"],ans:1,topic:"Pointers"},
      {q:"What is a virtual function?",opts:["Compile-time function","Enables runtime polymorphism","None","Hidden function"],ans:1,topic:"OOP"},
      {q:"What is abstract class?",opts:["Has at least one pure virtual function","Template class","None","Empty class"],ans:0,topic:"OOP"},
      {q:"What is pure virtual function?",opts:["None","Empty function","virtual void f() = 0","Virtual only"],ans:2,topic:"OOP"},
      {q:"What is an interface in C++?",opts:["Header file","Keyword interface","Abstract class with only pure virtuals","None"],ans:2,topic:"OOP"},
      {q:"What does 'friend' keyword do?",opts:["Grants private access to outside function/class","None","Makes public","Hides class"],ans:0,topic:"OOP"},
      {q:"What is operator overloading?",opts:["Using operators","Custom behavior for operators on objects","None","Hiding operators"],ans:1,topic:"OOP"},
      {q:"What is STL?",opts:["Standard Template Library","String Template Library","None","Standard Type Library"],ans:0,topic:"STL"},
      {q:"What is a vector?",opts:["Dynamic resizable array","Linked list","Fixed array","None"],ans:0,topic:"STL"},
      {q:"How to add element to vector?",opts:["v.append(x);","v.insert(x);","v.add(x);","v.push_back(x);"],ans:3,topic:"STL"},
      {q:"What is a map in STL?",opts:["Sorted key-value pairs","None","Unordered map","Array"],ans:0,topic:"STL"},
      {q:"What is unordered_map?",opts:["Array map","None","Sorted map","Hash map for O(1) lookup"],ans:3,topic:"STL"},
      {q:"What is a set?",opts:["Array","Sorted unique elements","Unordered set","None"],ans:1,topic:"STL"},
      {q:"What is a stack?",opts:["LIFO container","None","Sorted container","FIFO container"],ans:0,topic:"STL"},
      {q:"What is a queue?",opts:["FIFO container","LIFO container","Sorted container","None"],ans:0,topic:"STL"},
      {q:"What is a priority_queue?",opts:["FIFO","Random order","None","Highest priority element served first"],ans:3,topic:"STL"},
      {q:"What is a list in STL?",opts:["Doubly linked list","Vector","None","Array"],ans:0,topic:"STL"},
      {q:"What is a deque?",opts:["Single-ended queue","Stack","Double-ended queue","None"],ans:2,topic:"STL"},
      {q:"What is an iterator?",opts:["None","Object to traverse container elements","Index","Pointer to element"],ans:1,topic:"STL"},
      {q:"What does begin() return?",opts:["First element","Iterator to first element","None","Index 0"],ans:1,topic:"STL"},
      {q:"What does end() return?",opts:["Last element","Last index","Iterator past last element","None"],ans:2,topic:"STL"},
      {q:"What is std::sort()?",opts:["Bubble sort","None","Stable sort","Sorts range using intro sort"],ans:3,topic:"Algorithms"},
      {q:"What is std::find()?",opts:["Returns iterator to found element","Returns bool","None","Returns index"],ans:0,topic:"Algorithms"},
      {q:"What is std::count()?",opts:["Counts occurrences in range","None","Counts elements","Sum of range"],ans:0,topic:"Algorithms"},
      {q:"What is std::accumulate()?",opts:["Finds max","Counts elements","Computes sum/accumulation","None"],ans:2,topic:"Algorithms"},
      {q:"What is std::reverse()?",opts:["Sorts reversed","Reverses range in-place","None","Returns reversed copy"],ans:1,topic:"Algorithms"},
      {q:"What is std::unique()?",opts:["Unique elements","None","Removes consecutive duplicates","Removes all duplicates"],ans:2,topic:"Algorithms"},
      {q:"What is a template in C++?",opts:["Generic programming for any type","File template","HTML template","None"],ans:0,topic:"Templates"},
      {q:"How to declare function template?",opts:["type T","generic T","template T","template<typename T>"],ans:3,topic:"Templates"},
      {q:"What is template specialization?",opts:["Template error","Generic template","Custom implementation for specific type","None"],ans:2,topic:"Templates"},
      {q:"What is a namespace?",opts:["Named scope to avoid name conflicts","Module","Name prefix","Package"],ans:0,topic:"Namespaces"},
      {q:"What is std namespace?",opts:["Standard library namespace","System define","Standard function","None"],ans:0,topic:"Namespaces"},
      {q:"How to use std without prefix?",opts:["use std;","using namespace std;","#include std","import std;"],ans:1,topic:"Namespaces"},
      {q:"What is a header file?",opts:["Contains data","Contains code","Contains declarations for functions/classes","Contains config"],ans:2,topic:"Files"},
      {q:"What is a .cpp file?",opts:["Config file","Header file","Contains declarations","Contains implementation/definitions"],ans:3,topic:"Files"},
      {q:"What is compilation?",opts:["Linking code","Converting source code to machine code","Running code","Parsing code"],ans:1,topic:"Compilation"},
      {q:"What is linking?",opts:["Compiling","Running","Combining object files into executable","Debugging"],ans:2,topic:"Compilation"},
      {q:"What is a macro?",opts:["Class","Function","Text substitution via #define","Variable"],ans:2,topic:"Preprocessor"},
      {q:"What is inline function?",opts:["None","Always inlined","Static function","Suggests compiler to expand in-place"],ans:3,topic:"Functions"},
      {q:"What is static variable?",opts:["Const variable","None","Global variable","Retains value between function calls"],ans:3,topic:"Variables"},
      {q:"What is static member function?",opts:["Member method","Called on class not instance","Global function","None"],ans:1,topic:"OOP"},
      {q:"What is const member function?",opts:["None","Const class","Returns const","Doesn't modify object state"],ans:3,topic:"OOP"},
      {q:"What is explicit constructor?",opts:["Prevents implicit type conversion","Fast constructor","None","Explicit class"],ans:0,topic:"OOP"},
      {q:"What is a copy constructor?",opts:["None","Move constructor","Default constructor","Creates object as copy of another"],ans:3,topic:"OOP"},
      {q:"What is move constructor?",opts:["Transfers resources from temporary","Copy constructor","None","Default constructor"],ans:0,topic:"OOP"},
      {q:"What is RAII?",opts:["Random Access Init","None","Resource Array Init","Resource lifecycle tied to object lifetime"],ans:3,topic:"Memory"},
      {q:"What is a smart pointer?",opts:["Automatically manages memory","None","Pointer to pointer","Fast pointer"],ans:0,topic:"Memory"},
      {q:"What does 'cout' output in C++?",opts:["Text to console","Input from user","File content","Memory address"],ans:0,topic:"Basics"},
      {q:"How to end a C++ statement?",opts:["Colon :","Comma ,","Semicolon ;","Period ."],ans:2,topic:"Basics"},
      {q:"Which header is needed for cout?",opts:["stdlib.h","iostream","string.h","stdio.h"],ans:1,topic:"Basics"},
      {q:"What does 'int' declare?",opts:["String","Character","Float variable","Integer variable"],ans:3,topic:"Data Types"},
      {q:"How to write single-line comment in C++?",opts:["#","//","/* */","--"],ans:1,topic:"Basics"},
      {q:"Which is correct variable declaration?",opts:["5 = int x;","x int = 5;","int = x 5;","int x = 5;"],ans:3,topic:"Variables"},
      {q:"What does 'cin' do?",opts:["None","Outputs to console","Creates input","Takes input from user"],ans:3,topic:"I/O"},
      {q:"What is an array?",opts:["Single variable","Tree","Key-value store","Collection of same-type elements"],ans:3,topic:"Arrays"},
      {q:"How to access 3rd element of array 'a'?",opts:["a[2]","a[3]","a.3","a(3)"],ans:0,topic:"Arrays"},
      {q:"What is a for loop used for?",opts:["None","Decision making","Repeating code set number of times","Defining functions"],ans:2,topic:"Loops"},
      {q:"What does 'break' do in a loop?",opts:["None","Restarts","Skips iteration","Exits the loop"],ans:3,topic:"Loops"},
      {q:"What is a function?",opts:["None","Loop","Variable","Reusable block of code"],ans:3,topic:"Functions"},
      {q:"What is 'return' used for?",opts:["Prints value","Sends value back from function","Imports","None"],ans:1,topic:"Functions"},
      {q:"How to declare a string?",opts:["str s = 'hi';","String s = 'hi';","string s = 'hi';","char s = 'hi';"],ans:2,topic:"Strings"},
      {q:"What does sizeof() return?",opts:["Size in bytes","Array length","Length of string","None"],ans:0,topic:"Memory"},
      {q:"What is a boolean?",opts:["None","True/False value","Number","Character"],ans:1,topic:"Data Types"},
      {q:"How to write if-else in C++?",opts:["None","if x>0 then","if x > 0:","if(x>0){} else{}"],ans:3,topic:"Conditionals"},
      {q:"Last valid index in int a[5]?",opts:["4","6","3","5"],ans:0,topic:"Arrays"},
      {q:"What does 'void' return type mean?",opts:["None","Returns zero","Function returns nothing","Returns string"],ans:2,topic:"Functions"},
      {q:"What is a nested loop?",opts:["None","Loop with break","Loop inside another loop","Recursive loop"],ans:2,topic:"Loops"},
      {q:"What is 'while' loop?",opts:["Runs while condition is true","Runs once","Runs forever","Runs fixed times"],ans:0,topic:"Loops"},
      {q:"What is a do-while loop?",opts:["Runs at least once, checks after","Checks first","Never runs","Runs twice"],ans:0,topic:"Loops"},
      {q:"How to declare a constant in C++?",opts:["constant int x = 5;","#define only","final int x = 5;","const int x = 5;"],ans:3,topic:"Variables"},
      {q:"What is the scope of local variable?",opts:["In class only","Everywhere","In file only","Inside its block only"],ans:3,topic:"Variables"},
      {q:"What does '&&' mean?",opts:["Bitwise AND","Logical AND","Address of","None"],ans:1,topic:"Operators"},
      {q:"What does '||' mean?",opts:["Logical OR","Bitwise OR","Pipe","None"],ans:0,topic:"Operators"},
      {q:"What is a char data type?",opts:["String","Integer","Single character","Boolean"],ans:2,topic:"Data Types"},
      {q:"What does 'float' store?",opts:["Booleans","Integers","Decimal numbers","Characters"],ans:2,topic:"Data Types"},
      {q:"What is a double?",opts:["Double-precision decimal","Two floats","None","Double integer"],ans:0,topic:"Data Types"},
      {q:"How to read integer input with cin?",opts:["cin >> x;","cin << x;","cin(x);","read(x);"],ans:0,topic:"I/O"},
      {q:"How to print newline in cout?",opts:["cout << endl;","cout << \n;","cout << newline;","print();"],ans:0,topic:"I/O"},
      {q:"What is a ternary operator?",opts:["a ? b : c","if else shorthand","None","Both a and b"],ans:0,topic:"Operators"},
      {q:"What does % operator do?",opts:["Returns remainder","Modifies","Divides","Multiplies"],ans:0,topic:"Operators"},
      {q:"What is += operator?",opts:["Concatenates","Compares","Adds and assigns","Adds only"],ans:2,topic:"Operators"},
      {q:"What does 'continue' do?",opts:["Exits loop","None","Skips to next iteration","Restarts function"],ans:2,topic:"Loops"},
      {q:"How to swap two variables a and b?",opts:["swap=a+b;","a<->b;","temp=a; a=b; b=temp;","a=b; b=a;"],ans:2,topic:"Basics"},
      {q:"What is #include?",opts:["Preprocessor directive to include file","Comment","Variable","Function call"],ans:0,topic:"Preprocessor"},
      {q:"What is #define?",opts:["Defines function","Defines variable","None","Defines macro constant"],ans:3,topic:"Preprocessor"},
      {q:"What is 'main' function?",opts:["Main loop","Entry point of C++ program","Main variable","Main class"],ans:1,topic:"Basics"},
      {q:"What does 'return 0' in main() mean?",opts:["Error occurred","None","Program exited successfully","Restart program"],ans:2,topic:"Basics"},
      {q:"What is a pointer?",opts:["Variable storing value","None","Variable storing memory address","Array element"],ans:2,topic:"Pointers"},
      {q:"What does * do in pointer declaration?",opts:["Dereferences","Declares pointer variable","None","Multiplies"],ans:1,topic:"Pointers"},
      {q:"What does & operator do with variable?",opts:["Returns value","Copies it","Returns its memory address","None"],ans:2,topic:"Pointers"},
      {q:"What is dereferencing a pointer?",opts:["Accessing value at pointer's address","None","Getting address","Copying pointer"],ans:0,topic:"Pointers"},
      {q:"What is NULL pointer?",opts:["Empty array","Pointer pointing to nothing","Zero pointer","None"],ans:1,topic:"Pointers"},
      {q:"What is pointer arithmetic?",opts:["None","None","Math with pointers","Moving pointer by element sizes"],ans:3,topic:"Pointers"},
      {q:"What is array-pointer relationship?",opts:["Arrays are classes","Arrays are objects","None","Array name is pointer to first element"],ans:3,topic:"Arrays"},
      {q:"How to dynamically allocate int?",opts:["malloc(int);","alloc int;","new int;","create int;"],ans:2,topic:"Memory"},
      {q:"How to free dynamic memory?",opts:["remove ptr;","clear ptr;","delete ptr;","free(ptr);"],ans:2,topic:"Memory"},
      {q:"What is memory leak?",opts:["Memory error","Stack overflow","None","Allocated memory not freed"],ans:3,topic:"Memory"},
      {q:"What is stack memory?",opts:["Dynamic memory","Auto-managed local variable memory","Heap","None"],ans:1,topic:"Memory"},
      {q:"What is heap memory?",opts:["Dynamic allocation via new/malloc","Stack","Auto memory","None"],ans:0,topic:"Memory"},
      {q:"What is a reference variable?",opts:["Alias for another variable","Copy of variable","None","Pointer"],ans:0,topic:"References"},
      {q:"How to pass variable by reference?",opts:["void f(int x)","void f(int &x)","void f(&int x)","void f(int *x)"],ans:1,topic:"Functions"},
      {q:"What is pass by value?",opts:["Function gets original","Pointer passing","None","Function gets copy of argument"],ans:3,topic:"Functions"},
      {q:"What is an array of pointers?",opts:["Pointer array class","Array where each element is pointer","None","2D array"],ans:1,topic:"Arrays"},
      {q:"How to declare pointer to int?",opts:["int &p;","pointer int p;","int* p;","int p*;"],ans:2,topic:"Pointers"},
      {q:"What is void pointer?",opts:["Null pointer","Empty pointer","None","Pointer with no specific type"],ans:3,topic:"Pointers"},
      {q:"What is pointer to pointer?",opts:["Double pointer **","Reference","Single pointer","None"],ans:0,topic:"Pointers"},
      {q:"What is the output of: int a=5; int* p=&a; cout<<*p;?",opts:["Address","0","5","Error"],ans:2,topic:"Pointers"},
      {q:"What is a class in C++?",opts:["Blueprint for objects","Function group","Module","Variable"],ans:0,topic:"OOP"},
      {q:"How to create object of class Car?",opts:["new Car c;","Car.create();","Car c;","object Car c;"],ans:2,topic:"OOP"},
      {q:"What is a constructor?",opts:["Destructor","Auto-called method to initialize object","None","Copy function"],ans:1,topic:"OOP"},
      {q:"What is a destructor?",opts:["Constructor","Copy constructor","Auto-called when object is destroyed","None"],ans:2,topic:"OOP"},
      {q:"What is encapsulation?",opts:["Creating objects","Hiding data inside class","Importing","Inheriting"],ans:1,topic:"OOP"},
      {q:"What is inheritance?",opts:["Copying code","Multiple classes","None","Child class reusing parent properties"],ans:3,topic:"OOP"},
      {q:"What is polymorphism?",opts:["Same interface, different behavior","Multiple inheritance","None","Many methods"],ans:0,topic:"OOP"},
      {q:"What is 'public' access?",opts:["Derived only","Class only","Accessible from anywhere","File only"],ans:2,topic:"OOP"},
      {q:"What is 'private' access?",opts:["Accessible only within class","Everywhere","File only","Derived classes"],ans:0,topic:"OOP"},
      {q:"What is 'protected' access?",opts:["Accessible in class and derived classes","Everywhere","File only","Class only"],ans:0,topic:"OOP"},
      {q:"What is method overriding?",opts:["Creating new method","None","Child class redefines parent method","Copying method"],ans:2,topic:"OOP"},
      {q:"What is function overloading?",opts:["Same name different parameters","Same everything","Different names","None"],ans:0,topic:"Functions"},
      {q:"What is scope resolution operator?",opts:["->","**","::",".."],ans:2,topic:"Operators"},
      {q:"What does 'this' pointer refer to?",opts:["None","Current object","Global variable","Parent class"],ans:1,topic:"Pointers"},
      {q:"What is a virtual function?",opts:["Compile-time function","Enables runtime polymorphism","None","Hidden function"],ans:1,topic:"OOP"},
      {q:"What is abstract class?",opts:["Has at least one pure virtual function","Template class","None","Empty class"],ans:0,topic:"OOP"},
      {q:"What is pure virtual function?",opts:["None","Empty function","virtual void f() = 0","Virtual only"],ans:2,topic:"OOP"},
      {q:"What is an interface in C++?",opts:["Header file","Keyword interface","Abstract class with only pure virtuals","None"],ans:2,topic:"OOP"},
      {q:"What does 'friend' keyword do?",opts:["Grants private access to outside function/class","None","Makes public","Hides class"],ans:0,topic:"OOP"},
      {q:"What is operator overloading?",opts:["Using operators","Custom behavior for operators on objects","None","Hiding operators"],ans:1,topic:"OOP"},
    ],
    intermediate:[
      {q:"What is a smart pointer?",opts:["None","Automatically manages memory","Typed pointer","Fast pointer"],ans:1,topic:"Smart Pointers"},
      {q:"What is unique_ptr?",opts:["Shared pointer","Weak pointer","Single-owner smart pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is shared_ptr?",opts:["Weak pointer","Single owner","Multiple-owner reference-counted pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is weak_ptr?",opts:["Light pointer","Weak pointer","None","Non-owning reference to shared_ptr object"],ans:3,topic:"Smart Pointers"},
      {q:"What is move semantics?",opts:["None","Memory allocation","Moving files","Transferring ownership without copying"],ans:3,topic:"C++11"},
      {q:"What does std::move() do?",opts:["None","Casts to rvalue enabling move","Moves physically","Copies object"],ans:1,topic:"C++11"},
      {q:"What is an rvalue?",opts:["Temporary value without address","None","Left-side value","Named variable"],ans:0,topic:"Value Categories"},
      {q:"What is an lvalue?",opts:["None","Right-side","Named object with persistent address","Temporary"],ans:2,topic:"Value Categories"},
      {q:"What is perfect forwarding?",opts:["None","Fast forwarding","Copying","Preserving value category when forwarding args"],ans:3,topic:"C++11"},
      {q:"What is std::forward?",opts:["Forward declare","Used for perfect forwarding in templates","None","Forward iterator"],ans:1,topic:"C++11"},
      {q:"What is a variadic template?",opts:["Template accepting any number of types","Template error","None","Fixed args template"],ans:0,topic:"Templates"},
      {q:"What is template parameter pack?",opts:["Pack class","... syntax for variadic templates","Template param","None"],ans:1,topic:"Templates"},
      {q:"What is SFINAE?",opts:["Static Function","Substitution Failure Is Not An Error","Some Failure Is Normal","None"],ans:1,topic:"Templates"},
      {q:"What is enable_if?",opts:["None","If condition","Enables compiler","Conditionally enables template specialization"],ans:3,topic:"Templates"},
      {q:"What is type_traits?",opts:["Compile-time type information and transformations","Type list","None","Type array"],ans:0,topic:"Templates"},
      {q:"What is constexpr?",opts:["Constant expression evaluated at compile time","None","Runtime constant","Variable"],ans:0,topic:"C++11"},
      {q:"What is nullptr?",opts:["Type-safe null pointer constant","Zero pointer","None","NULL replacement only"],ans:0,topic:"C++11"},
      {q:"What is auto keyword?",opts:["Auto class","Automatic variable","None","Type deduction by compiler"],ans:3,topic:"C++11"},
      {q:"What is decltype?",opts:["Gets type of expression at compile time","Declares type","None","Type keyword"],ans:0,topic:"C++11"},
      {q:"What is a lambda expression?",opts:["None","Named function","Anonymous inline function","Class method"],ans:2,topic:"C++11"},
      {q:"What is capture list in lambda?",opts:["Return type","None","[=] or [&] to capture outer variables","Parameter list"],ans:2,topic:"Lambdas"},
      {q:"What is std::function?",opts:["Method type","Type-erased callable wrapper","Function class","None"],ans:1,topic:"Functional"},
      {q:"What is std::bind?",opts:["Binds reference","None","Binds arguments to function","Creates class"],ans:2,topic:"Functional"},
      {q:"What is std::thread?",opts:["Thread type","C++11 class for creating threads","None","Process class"],ans:1,topic:"Concurrency"},
      {q:"What is std::mutex?",opts:["Memory unit","None","Thread class","Mutual exclusion synchronization primitive"],ans:3,topic:"Concurrency"},
      {q:"What is std::lock_guard?",opts:["None","RAII mutex lock","Manual lock","Thread lock"],ans:1,topic:"Concurrency"},
      {q:"What is std::condition_variable?",opts:["Variable type","Allows threads to wait for condition","None","Signal class"],ans:1,topic:"Concurrency"},
      {q:"What is std::atomic?",opts:["None","Thread safe","Atomic class","Lock-free thread-safe operations"],ans:3,topic:"Concurrency"},
      {q:"What is std::promise and std::future?",opts:["Promise class","Future class","Async value passing between threads","None"],ans:2,topic:"Concurrency"},
      {q:"What is std::async?",opts:["Runs function asynchronously","None","Thread function","Async keyword"],ans:0,topic:"Concurrency"},
      {q:"What is a vtable?",opts:["None","Variable table","Virtual function table for runtime dispatch","Vector table"],ans:2,topic:"Internals"},
      {q:"What is vptr?",opts:["Pointer to vtable in each object","Void pointer","Virtual pointer","None"],ans:0,topic:"Internals"},
      {q:"What is CRTP?",opts:["Common Runtime Type","None","C++ Runtime Template","Curiously Recurring Template Pattern"],ans:3,topic:"Patterns"},
      {q:"What is type erasure?",opts:["Casting types","None","Hiding concrete type behind interface","Removing types"],ans:2,topic:"Patterns"},
      {q:"What is the pimpl idiom?",opts:["None","Private impl","Pointer to implementation for ABI stability","Public impl"],ans:2,topic:"Patterns"},
      {q:"What is ADL?",opts:["Array Default List","None","Auto Detect Link","Argument-Dependent Lookup for namespace resolution"],ans:3,topic:"Internals"},
      {q:"What is ODR?",opts:["One Definition Rule","Order Definition","Object Definition","None"],ans:0,topic:"Internals"},
      {q:"What is undefined behavior?",opts:["Code whose result is unpredictable","Error type","Warning type","None"],ans:0,topic:"Internals"},
      {q:"What is alignment in memory?",opts:["Memory order","None","Byte order","Data stored at addresses divisible by its size"],ans:3,topic:"Memory"},
      {q:"What is padding in structs?",opts:["Metadata","Extra fields","Compiler-added bytes for alignment","None"],ans:2,topic:"Memory"},
      {q:"What is copy elision?",opts:["None","Compiler optimization avoiding unnecessary copies","Copy method","Copy error"],ans:1,topic:"Optimization"},
      {q:"What is RVO?",opts:["Return Value Optimization — avoid copying return","Return variable","Return operator","None"],ans:0,topic:"Optimization"},
      {q:"What is NRVO?",opts:["Non-Return Value","Named Return","Named RVO for named local variables","None"],ans:2,topic:"Optimization"},
      {q:"What is a placement new?",opts:["Place class","New operator","None","Constructs object at specific memory address"],ans:3,topic:"Memory"},
      {q:"What is std::variant?",opts:["Array type","Variant class","Type-safe union holding one of several types","None"],ans:2,topic:"C++17"},
      {q:"What is std::optional?",opts:["None","Wrapper for value that may not exist","Maybe class","Optional class"],ans:1,topic:"C++17"},
      {q:"What is std::any?",opts:["Type-safe container for any value","Void wrapper","Any class","None"],ans:0,topic:"C++17"},
      {q:"What is structured binding?",opts:["Auto binding","auto [a,b] = pair;","Tuple binding","None"],ans:1,topic:"C++17"},
      {q:"What is if constexpr?",opts:["Runtime if","Compile-time if for template branching","Const if","None"],ans:1,topic:"C++17"},
      {q:"What is fold expression?",opts:["Expands parameter pack with operator","Pack fold","Expansion","None"],ans:0,topic:"C++17"},
      {q:"What is std::string_view?",opts:["None","String copy","Non-owning view of string data","String class"],ans:2,topic:"C++17"},
      {q:"What is a smart pointer?",opts:["None","Automatically manages memory","Typed pointer","Fast pointer"],ans:1,topic:"Smart Pointers"},
      {q:"What is unique_ptr?",opts:["Shared pointer","Weak pointer","Single-owner smart pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is shared_ptr?",opts:["Weak pointer","Single owner","Multiple-owner reference-counted pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is weak_ptr?",opts:["Light pointer","Weak pointer","None","Non-owning reference to shared_ptr object"],ans:3,topic:"Smart Pointers"},
      {q:"What is move semantics?",opts:["None","Memory allocation","Moving files","Transferring ownership without copying"],ans:3,topic:"C++11"},
      {q:"What does std::move() do?",opts:["None","Casts to rvalue enabling move","Moves physically","Copies object"],ans:1,topic:"C++11"},
      {q:"What is an rvalue?",opts:["Temporary value without address","None","Left-side value","Named variable"],ans:0,topic:"Value Categories"},
      {q:"What is an lvalue?",opts:["None","Right-side","Named object with persistent address","Temporary"],ans:2,topic:"Value Categories"},
      {q:"What is perfect forwarding?",opts:["None","Fast forwarding","Copying","Preserving value category when forwarding args"],ans:3,topic:"C++11"},
      {q:"What is std::forward?",opts:["Forward declare","Used for perfect forwarding in templates","None","Forward iterator"],ans:1,topic:"C++11"},
      {q:"What is a variadic template?",opts:["Template accepting any number of types","Template error","None","Fixed args template"],ans:0,topic:"Templates"},
      {q:"What is template parameter pack?",opts:["Pack class","... syntax for variadic templates","Template param","None"],ans:1,topic:"Templates"},
      {q:"What is SFINAE?",opts:["Static Function","Substitution Failure Is Not An Error","Some Failure Is Normal","None"],ans:1,topic:"Templates"},
      {q:"What is enable_if?",opts:["None","If condition","Enables compiler","Conditionally enables template specialization"],ans:3,topic:"Templates"},
      {q:"What is type_traits?",opts:["Compile-time type information and transformations","Type list","None","Type array"],ans:0,topic:"Templates"},
      {q:"What is constexpr?",opts:["Constant expression evaluated at compile time","None","Runtime constant","Variable"],ans:0,topic:"C++11"},
      {q:"What is nullptr?",opts:["Type-safe null pointer constant","Zero pointer","None","NULL replacement only"],ans:0,topic:"C++11"},
      {q:"What is auto keyword?",opts:["Auto class","Automatic variable","None","Type deduction by compiler"],ans:3,topic:"C++11"},
      {q:"What is decltype?",opts:["Gets type of expression at compile time","Declares type","None","Type keyword"],ans:0,topic:"C++11"},
      {q:"What is a lambda expression?",opts:["None","Named function","Anonymous inline function","Class method"],ans:2,topic:"C++11"},
      {q:"What is capture list in lambda?",opts:["Return type","None","[=] or [&] to capture outer variables","Parameter list"],ans:2,topic:"Lambdas"},
      {q:"What is std::function?",opts:["Method type","Type-erased callable wrapper","Function class","None"],ans:1,topic:"Functional"},
      {q:"What is std::bind?",opts:["Binds reference","None","Binds arguments to function","Creates class"],ans:2,topic:"Functional"},
      {q:"What is std::thread?",opts:["Thread type","C++11 class for creating threads","None","Process class"],ans:1,topic:"Concurrency"},
      {q:"What is std::mutex?",opts:["Memory unit","None","Thread class","Mutual exclusion synchronization primitive"],ans:3,topic:"Concurrency"},
      {q:"What is std::lock_guard?",opts:["None","RAII mutex lock","Manual lock","Thread lock"],ans:1,topic:"Concurrency"},
      {q:"What is std::condition_variable?",opts:["Variable type","Allows threads to wait for condition","None","Signal class"],ans:1,topic:"Concurrency"},
      {q:"What is std::atomic?",opts:["None","Thread safe","Atomic class","Lock-free thread-safe operations"],ans:3,topic:"Concurrency"},
      {q:"What is std::promise and std::future?",opts:["Promise class","Future class","Async value passing between threads","None"],ans:2,topic:"Concurrency"},
      {q:"What is std::async?",opts:["Runs function asynchronously","None","Thread function","Async keyword"],ans:0,topic:"Concurrency"},
      {q:"What is a vtable?",opts:["None","Variable table","Virtual function table for runtime dispatch","Vector table"],ans:2,topic:"Internals"},
      {q:"What is vptr?",opts:["Pointer to vtable in each object","Void pointer","Virtual pointer","None"],ans:0,topic:"Internals"},
      {q:"What is CRTP?",opts:["Common Runtime Type","None","C++ Runtime Template","Curiously Recurring Template Pattern"],ans:3,topic:"Patterns"},
      {q:"What is type erasure?",opts:["Casting types","None","Hiding concrete type behind interface","Removing types"],ans:2,topic:"Patterns"},
      {q:"What is the pimpl idiom?",opts:["None","Private impl","Pointer to implementation for ABI stability","Public impl"],ans:2,topic:"Patterns"},
      {q:"What is ADL?",opts:["Array Default List","None","Auto Detect Link","Argument-Dependent Lookup for namespace resolution"],ans:3,topic:"Internals"},
      {q:"What is ODR?",opts:["One Definition Rule","Order Definition","Object Definition","None"],ans:0,topic:"Internals"},
      {q:"What is undefined behavior?",opts:["Code whose result is unpredictable","Error type","Warning type","None"],ans:0,topic:"Internals"},
      {q:"What is alignment in memory?",opts:["Memory order","None","Byte order","Data stored at addresses divisible by its size"],ans:3,topic:"Memory"},
      {q:"What is padding in structs?",opts:["Metadata","Extra fields","Compiler-added bytes for alignment","None"],ans:2,topic:"Memory"},
      {q:"What is copy elision?",opts:["None","Compiler optimization avoiding unnecessary copies","Copy method","Copy error"],ans:1,topic:"Optimization"},
      {q:"What is RVO?",opts:["Return Value Optimization — avoid copying return","Return variable","Return operator","None"],ans:0,topic:"Optimization"},
      {q:"What is NRVO?",opts:["Non-Return Value","Named Return","Named RVO for named local variables","None"],ans:2,topic:"Optimization"},
      {q:"What is a placement new?",opts:["Place class","New operator","None","Constructs object at specific memory address"],ans:3,topic:"Memory"},
      {q:"What is std::variant?",opts:["Array type","Variant class","Type-safe union holding one of several types","None"],ans:2,topic:"C++17"},
      {q:"What is std::optional?",opts:["None","Wrapper for value that may not exist","Maybe class","Optional class"],ans:1,topic:"C++17"},
      {q:"What is std::any?",opts:["Type-safe container for any value","Void wrapper","Any class","None"],ans:0,topic:"C++17"},
      {q:"What is structured binding?",opts:["Auto binding","auto [a,b] = pair;","Tuple binding","None"],ans:1,topic:"C++17"},
      {q:"What is if constexpr?",opts:["Runtime if","Compile-time if for template branching","Const if","None"],ans:1,topic:"C++17"},
      {q:"What is fold expression?",opts:["Expands parameter pack with operator","Pack fold","Expansion","None"],ans:0,topic:"C++17"},
      {q:"What is std::string_view?",opts:["None","String copy","Non-owning view of string data","String class"],ans:2,topic:"C++17"},
      {q:"What is a smart pointer?",opts:["None","Automatically manages memory","Typed pointer","Fast pointer"],ans:1,topic:"Smart Pointers"},
      {q:"What is unique_ptr?",opts:["Shared pointer","Weak pointer","Single-owner smart pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is shared_ptr?",opts:["Weak pointer","Single owner","Multiple-owner reference-counted pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is weak_ptr?",opts:["Light pointer","Weak pointer","None","Non-owning reference to shared_ptr object"],ans:3,topic:"Smart Pointers"},
      {q:"What is move semantics?",opts:["None","Memory allocation","Moving files","Transferring ownership without copying"],ans:3,topic:"C++11"},
      {q:"What does std::move() do?",opts:["None","Casts to rvalue enabling move","Moves physically","Copies object"],ans:1,topic:"C++11"},
      {q:"What is an rvalue?",opts:["Temporary value without address","None","Left-side value","Named variable"],ans:0,topic:"Value Categories"},
      {q:"What is an lvalue?",opts:["None","Right-side","Named object with persistent address","Temporary"],ans:2,topic:"Value Categories"},
      {q:"What is perfect forwarding?",opts:["None","Fast forwarding","Copying","Preserving value category when forwarding args"],ans:3,topic:"C++11"},
      {q:"What is std::forward?",opts:["Forward declare","Used for perfect forwarding in templates","None","Forward iterator"],ans:1,topic:"C++11"},
      {q:"What is a variadic template?",opts:["Template accepting any number of types","Template error","None","Fixed args template"],ans:0,topic:"Templates"},
      {q:"What is template parameter pack?",opts:["Pack class","... syntax for variadic templates","Template param","None"],ans:1,topic:"Templates"},
      {q:"What is SFINAE?",opts:["Static Function","Substitution Failure Is Not An Error","Some Failure Is Normal","None"],ans:1,topic:"Templates"},
      {q:"What is enable_if?",opts:["None","If condition","Enables compiler","Conditionally enables template specialization"],ans:3,topic:"Templates"},
      {q:"What is type_traits?",opts:["Compile-time type information and transformations","Type list","None","Type array"],ans:0,topic:"Templates"},
      {q:"What is constexpr?",opts:["Constant expression evaluated at compile time","None","Runtime constant","Variable"],ans:0,topic:"C++11"},
      {q:"What is nullptr?",opts:["Type-safe null pointer constant","Zero pointer","None","NULL replacement only"],ans:0,topic:"C++11"},
      {q:"What is auto keyword?",opts:["Auto class","Automatic variable","None","Type deduction by compiler"],ans:3,topic:"C++11"},
      {q:"What is decltype?",opts:["Gets type of expression at compile time","Declares type","None","Type keyword"],ans:0,topic:"C++11"},
      {q:"What is a lambda expression?",opts:["None","Named function","Anonymous inline function","Class method"],ans:2,topic:"C++11"},
      {q:"What is capture list in lambda?",opts:["Return type","None","[=] or [&] to capture outer variables","Parameter list"],ans:2,topic:"Lambdas"},
      {q:"What is std::function?",opts:["Method type","Type-erased callable wrapper","Function class","None"],ans:1,topic:"Functional"},
      {q:"What is std::bind?",opts:["Binds reference","None","Binds arguments to function","Creates class"],ans:2,topic:"Functional"},
      {q:"What is std::thread?",opts:["Thread type","C++11 class for creating threads","None","Process class"],ans:1,topic:"Concurrency"},
      {q:"What is std::mutex?",opts:["Memory unit","None","Thread class","Mutual exclusion synchronization primitive"],ans:3,topic:"Concurrency"},
      {q:"What is std::lock_guard?",opts:["None","RAII mutex lock","Manual lock","Thread lock"],ans:1,topic:"Concurrency"},
      {q:"What is std::condition_variable?",opts:["Variable type","Allows threads to wait for condition","None","Signal class"],ans:1,topic:"Concurrency"},
      {q:"What is std::atomic?",opts:["None","Thread safe","Atomic class","Lock-free thread-safe operations"],ans:3,topic:"Concurrency"},
      {q:"What is std::promise and std::future?",opts:["Promise class","Future class","Async value passing between threads","None"],ans:2,topic:"Concurrency"},
      {q:"What is std::async?",opts:["Runs function asynchronously","None","Thread function","Async keyword"],ans:0,topic:"Concurrency"},
      {q:"What is a vtable?",opts:["None","Variable table","Virtual function table for runtime dispatch","Vector table"],ans:2,topic:"Internals"},
      {q:"What is vptr?",opts:["Pointer to vtable in each object","Void pointer","Virtual pointer","None"],ans:0,topic:"Internals"},
      {q:"What is CRTP?",opts:["Common Runtime Type","None","C++ Runtime Template","Curiously Recurring Template Pattern"],ans:3,topic:"Patterns"},
      {q:"What is type erasure?",opts:["Casting types","None","Hiding concrete type behind interface","Removing types"],ans:2,topic:"Patterns"},
      {q:"What is the pimpl idiom?",opts:["None","Private impl","Pointer to implementation for ABI stability","Public impl"],ans:2,topic:"Patterns"},
      {q:"What is ADL?",opts:["Array Default List","None","Auto Detect Link","Argument-Dependent Lookup for namespace resolution"],ans:3,topic:"Internals"},
      {q:"What is ODR?",opts:["One Definition Rule","Order Definition","Object Definition","None"],ans:0,topic:"Internals"},
      {q:"What is undefined behavior?",opts:["Code whose result is unpredictable","Error type","Warning type","None"],ans:0,topic:"Internals"},
      {q:"What is alignment in memory?",opts:["Memory order","None","Byte order","Data stored at addresses divisible by its size"],ans:3,topic:"Memory"},
      {q:"What is padding in structs?",opts:["Metadata","Extra fields","Compiler-added bytes for alignment","None"],ans:2,topic:"Memory"},
      {q:"What is copy elision?",opts:["None","Compiler optimization avoiding unnecessary copies","Copy method","Copy error"],ans:1,topic:"Optimization"},
      {q:"What is RVO?",opts:["Return Value Optimization — avoid copying return","Return variable","Return operator","None"],ans:0,topic:"Optimization"},
      {q:"What is NRVO?",opts:["Non-Return Value","Named Return","Named RVO for named local variables","None"],ans:2,topic:"Optimization"},
      {q:"What is a placement new?",opts:["Place class","New operator","None","Constructs object at specific memory address"],ans:3,topic:"Memory"},
      {q:"What is std::variant?",opts:["Array type","Variant class","Type-safe union holding one of several types","None"],ans:2,topic:"C++17"},
      {q:"What is std::optional?",opts:["None","Wrapper for value that may not exist","Maybe class","Optional class"],ans:1,topic:"C++17"},
      {q:"What is std::any?",opts:["Type-safe container for any value","Void wrapper","Any class","None"],ans:0,topic:"C++17"},
      {q:"What is structured binding?",opts:["Auto binding","auto [a,b] = pair;","Tuple binding","None"],ans:1,topic:"C++17"},
      {q:"What is if constexpr?",opts:["Runtime if","Compile-time if for template branching","Const if","None"],ans:1,topic:"C++17"},
      {q:"What is fold expression?",opts:["Expands parameter pack with operator","Pack fold","Expansion","None"],ans:0,topic:"C++17"},
      {q:"What is std::string_view?",opts:["None","String copy","Non-owning view of string data","String class"],ans:2,topic:"C++17"},
      {q:"What is a smart pointer?",opts:["None","Automatically manages memory","Typed pointer","Fast pointer"],ans:1,topic:"Smart Pointers"},
      {q:"What is unique_ptr?",opts:["Shared pointer","Weak pointer","Single-owner smart pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is shared_ptr?",opts:["Weak pointer","Single owner","Multiple-owner reference-counted pointer","None"],ans:2,topic:"Smart Pointers"},
      {q:"What is weak_ptr?",opts:["Light pointer","Weak pointer","None","Non-owning reference to shared_ptr object"],ans:3,topic:"Smart Pointers"},
      {q:"What is move semantics?",opts:["None","Memory allocation","Moving files","Transferring ownership without copying"],ans:3,topic:"C++11"},
      {q:"What does std::move() do?",opts:["None","Casts to rvalue enabling move","Moves physically","Copies object"],ans:1,topic:"C++11"},
      {q:"What is an rvalue?",opts:["Temporary value without address","None","Left-side value","Named variable"],ans:0,topic:"Value Categories"},
      {q:"What is an lvalue?",opts:["None","Right-side","Named object with persistent address","Temporary"],ans:2,topic:"Value Categories"},
      {q:"What is perfect forwarding?",opts:["None","Fast forwarding","Copying","Preserving value category when forwarding args"],ans:3,topic:"C++11"},
      {q:"What is std::forward?",opts:["Forward declare","Used for perfect forwarding in templates","None","Forward iterator"],ans:1,topic:"C++11"},
      {q:"What is a variadic template?",opts:["Template accepting any number of types","Template error","None","Fixed args template"],ans:0,topic:"Templates"},
      {q:"What is template parameter pack?",opts:["Pack class","... syntax for variadic templates","Template param","None"],ans:1,topic:"Templates"},
      {q:"What is SFINAE?",opts:["Static Function","Substitution Failure Is Not An Error","Some Failure Is Normal","None"],ans:1,topic:"Templates"},
      {q:"What is enable_if?",opts:["None","If condition","Enables compiler","Conditionally enables template specialization"],ans:3,topic:"Templates"},
      {q:"What is type_traits?",opts:["Compile-time type information and transformations","Type list","None","Type array"],ans:0,topic:"Templates"},
      {q:"What is constexpr?",opts:["Constant expression evaluated at compile time","None","Runtime constant","Variable"],ans:0,topic:"C++11"},
      {q:"What is nullptr?",opts:["Type-safe null pointer constant","Zero pointer","None","NULL replacement only"],ans:0,topic:"C++11"},
      {q:"What is auto keyword?",opts:["Auto class","Automatic variable","None","Type deduction by compiler"],ans:3,topic:"C++11"},
      {q:"What is decltype?",opts:["Gets type of expression at compile time","Declares type","None","Type keyword"],ans:0,topic:"C++11"},
      {q:"What is a lambda expression?",opts:["None","Named function","Anonymous inline function","Class method"],ans:2,topic:"C++11"},
      {q:"What is capture list in lambda?",opts:["Return type","None","[=] or [&] to capture outer variables","Parameter list"],ans:2,topic:"Lambdas"},
      {q:"What is std::function?",opts:["Method type","Type-erased callable wrapper","Function class","None"],ans:1,topic:"Functional"},
      {q:"What is std::bind?",opts:["Binds reference","None","Binds arguments to function","Creates class"],ans:2,topic:"Functional"},
      {q:"What is std::thread?",opts:["Thread type","C++11 class for creating threads","None","Process class"],ans:1,topic:"Concurrency"},
      {q:"What is std::mutex?",opts:["Memory unit","None","Thread class","Mutual exclusion synchronization primitive"],ans:3,topic:"Concurrency"},
      {q:"What is std::lock_guard?",opts:["None","RAII mutex lock","Manual lock","Thread lock"],ans:1,topic:"Concurrency"},
      {q:"What is std::condition_variable?",opts:["Variable type","Allows threads to wait for condition","None","Signal class"],ans:1,topic:"Concurrency"},
      {q:"What is std::atomic?",opts:["None","Thread safe","Atomic class","Lock-free thread-safe operations"],ans:3,topic:"Concurrency"},
      {q:"What is std::promise and std::future?",opts:["Promise class","Future class","Async value passing between threads","None"],ans:2,topic:"Concurrency"},
      {q:"What is std::async?",opts:["Runs function asynchronously","None","Thread function","Async keyword"],ans:0,topic:"Concurrency"},
      {q:"What is a vtable?",opts:["None","Variable table","Virtual function table for runtime dispatch","Vector table"],ans:2,topic:"Internals"},
      {q:"What is vptr?",opts:["Pointer to vtable in each object","Void pointer","Virtual pointer","None"],ans:0,topic:"Internals"},
      {q:"What is CRTP?",opts:["Common Runtime Type","None","C++ Runtime Template","Curiously Recurring Template Pattern"],ans:3,topic:"Patterns"},
      {q:"What is type erasure?",opts:["Casting types","None","Hiding concrete type behind interface","Removing types"],ans:2,topic:"Patterns"},
      {q:"What is the pimpl idiom?",opts:["None","Private impl","Pointer to implementation for ABI stability","Public impl"],ans:2,topic:"Patterns"},
      {q:"What is ADL?",opts:["Array Default List","None","Auto Detect Link","Argument-Dependent Lookup for namespace resolution"],ans:3,topic:"Internals"},
      {q:"What is ODR?",opts:["One Definition Rule","Order Definition","Object Definition","None"],ans:0,topic:"Internals"},
      {q:"What is undefined behavior?",opts:["Code whose result is unpredictable","Error type","Warning type","None"],ans:0,topic:"Internals"},
      {q:"What is alignment in memory?",opts:["Memory order","None","Byte order","Data stored at addresses divisible by its size"],ans:3,topic:"Memory"},
      {q:"What is padding in structs?",opts:["Metadata","Extra fields","Compiler-added bytes for alignment","None"],ans:2,topic:"Memory"},
      {q:"What is copy elision?",opts:["None","Compiler optimization avoiding unnecessary copies","Copy method","Copy error"],ans:1,topic:"Optimization"},
      {q:"What is RVO?",opts:["Return Value Optimization — avoid copying return","Return variable","Return operator","None"],ans:0,topic:"Optimization"},
      {q:"What is NRVO?",opts:["Non-Return Value","Named Return","Named RVO for named local variables","None"],ans:2,topic:"Optimization"},
      {q:"What is a placement new?",opts:["Place class","New operator","None","Constructs object at specific memory address"],ans:3,topic:"Memory"},
      {q:"What is std::variant?",opts:["Array type","Variant class","Type-safe union holding one of several types","None"],ans:2,topic:"C++17"},
      {q:"What is std::optional?",opts:["None","Wrapper for value that may not exist","Maybe class","Optional class"],ans:1,topic:"C++17"},
      {q:"What is std::any?",opts:["Type-safe container for any value","Void wrapper","Any class","None"],ans:0,topic:"C++17"},
    ],
    advanced:[
      {q:"What is the as-if rule?",opts:["Compiler can optimize as long as observable behavior same","Assignment rule","None","Alias rule"],ans:0,topic:"Optimization"},
      {q:"What is sequence point?",opts:["Order point","Point where side effects are complete","None","Sequence class"],ans:1,topic:"Internals"},
      {q:"What is strict aliasing?",opts:["Accessing object through wrong type is UB","Alias rule","None","Pointer rule"],ans:0,topic:"Internals"},
      {q:"What is memory ordering in atomics?",opts:["None","Byte order","Memory layout","Controls visibility of operations across threads"],ans:3,topic:"Concurrency"},
      {q:"What is memory_order_seq_cst?",opts:["Strict ordering","None","Strongest ordering — total sequential consistency","Sequential constant"],ans:2,topic:"Concurrency"},
      {q:"What is memory_order_relaxed?",opts:["Relaxed memory","None","Weak ordering","No synchronization guarantees"],ans:3,topic:"Concurrency"},
      {q:"What is ABA problem?",opts:["Race condition","Double A problem","None","Value changes from A to B back to A undetected"],ans:3,topic:"Concurrency"},
      {q:"What is lock-free programming?",opts:["None","Thread-free","Algorithms using atomics without mutexes","No locks"],ans:2,topic:"Concurrency"},
      {q:"What is false sharing?",opts:["Wrong sharing","None","Cache miss","Cache lines ping-ponging between cores"],ans:3,topic:"Performance"},
      {q:"What is cache line?",opts:["Memory page","None","64-byte unit of cache transfer","Cache unit"],ans:2,topic:"Performance"},
      {q:"What is branch prediction?",opts:["None","CPU guessing which branch will execute","Jump prediction","Branch compiler"],ans:1,topic:"Performance"},
      {q:"What is SIMD?",opts:["Single Instruction","None","Single Instruction Multiple Data vectorization","Multiple Data"],ans:2,topic:"Performance"},
      {q:"What is expression templates?",opts:["Template expr","None","Lazy evaluation of math expressions via templates","Lazy template"],ans:2,topic:"Advanced Templates"},
      {q:"What is the diamond problem?",opts:["Diamond class","Multiple base","None","Ambiguity when class inherits same base twice"],ans:3,topic:"OOP"},
      {q:"How to solve diamond problem?",opts:["None","Private inheritance","Virtual inheritance","Multiple inheritance"],ans:2,topic:"OOP"},
      {q:"What is std::coroutine (C++20)?",opts:["Async function","Coroutine class","None","Language-level coroutine support"],ans:3,topic:"C++20"},
      {q:"What is co_await?",opts:["Async wait","Await operator","None","Suspends coroutine until awaitable completes"],ans:3,topic:"C++20"},
      {q:"What is co_yield?",opts:["Yield operator","None","Async yield","Suspends coroutine and returns value"],ans:3,topic:"C++20"},
      {q:"What is a module in C++20?",opts:["Replacement for headers with better encapsulation","Package","Namespace","None"],ans:0,topic:"C++20"},
      {q:"What is concepts in C++20?",opts:["Type concepts","None","Template concepts","Named constraints on template parameters"],ans:3,topic:"C++20"},
      {q:"What is ranges in C++20?",opts:["None","Array ranges","Container ranges","Composable lazy range algorithms"],ans:3,topic:"C++20"},
      {q:"What is std::span?",opts:["Span class","Non-owning view over contiguous sequence","Array view","None"],ans:1,topic:"C++20"},
      {q:"What is three-way comparison <=>?",opts:["None","Spaceship operator","Three compare","Returns less/equal/greater in one operation"],ans:3,topic:"C++20"},
      {q:"What is designated initializers?",opts:["Named init","Struct init by field names: {.x=1,.y=2}","Field init","None"],ans:1,topic:"C++20"},
      {q:"What is std::format?",opts:["Type-safe string formatting","String format","Format class","None"],ans:0,topic:"C++20"},
      {q:"What is jthread?",opts:["Java thread","Joined thread","None","Thread with automatic join and stop token"],ans:3,topic:"C++20"},
      {q:"What is std::stop_token?",opts:["None","Cancel token","Cooperative cancellation mechanism","Stop class"],ans:2,topic:"C++20"},
      {q:"What is a generator coroutine?",opts:["Coroutine yielding sequence of values","Generator class","None","Range generator"],ans:0,topic:"C++20"},
      {q:"What is std::latch?",opts:["Single-use barrier for thread synchronization","Latch class","Thread latch","None"],ans:0,topic:"C++20"},
      {q:"What is std::barrier?",opts:["Reusable synchronization point for threads","Barrier class","Thread barrier","None"],ans:0,topic:"C++20"},
      {q:"What is std::semaphore?",opts:["Semaphore class","None","Thread signal","Counting synchronization primitive"],ans:3,topic:"C++20"},
      {q:"What is flat_map in C++23?",opts:["Sorted array-backed map for cache efficiency","Array map","None","Flat container"],ans:0,topic:"C++23"},
      {q:"What is std::expected?",opts:["Either a value or an error — error handling","Result type","None","Expected class"],ans:0,topic:"C++23"},
      {q:"What is std::mdspan?",opts:["Multi-dimensional span view","Matrix span","Multi-span","None"],ans:0,topic:"C++23"},
      {q:"What is deducing this in C++23?",opts:["None","Self parameter","This deduction","Explicit this parameter in member functions"],ans:3,topic:"C++23"},
      {q:"What is std::print in C++23?",opts:["Formatted output to stdout","Print class","None","Format print"],ans:0,topic:"C++23"},
      {q:"What is stack unwinding?",opts:["None","Stack clearing","Destructors called during exception propagation","Unwind class"],ans:2,topic:"Exceptions"},
      {q:"What is exception specification noexcept?",opts:["No exception","Exception spec","None","Promises function won't throw"],ans:3,topic:"Exceptions"},
      {q:"What is std::terminate?",opts:["Program end","None","Terminate function","Called when exception not caught"],ans:3,topic:"Exceptions"},
      {q:"What is SEH?",opts:["System Exception Handling","None","Structured Exception Handling on Windows","Safe Exception Handling"],ans:2,topic:"Exceptions"},
      {q:"What is the as-if rule?",opts:["Compiler can optimize as long as observable behavior same","Assignment rule","None","Alias rule"],ans:0,topic:"Optimization"},
      {q:"What is sequence point?",opts:["Order point","Point where side effects are complete","None","Sequence class"],ans:1,topic:"Internals"},
      {q:"What is strict aliasing?",opts:["Accessing object through wrong type is UB","Alias rule","None","Pointer rule"],ans:0,topic:"Internals"},
      {q:"What is memory ordering in atomics?",opts:["None","Byte order","Memory layout","Controls visibility of operations across threads"],ans:3,topic:"Concurrency"},
      {q:"What is memory_order_seq_cst?",opts:["Strict ordering","None","Strongest ordering — total sequential consistency","Sequential constant"],ans:2,topic:"Concurrency"},
      {q:"What is memory_order_relaxed?",opts:["Relaxed memory","None","Weak ordering","No synchronization guarantees"],ans:3,topic:"Concurrency"},
      {q:"What is ABA problem?",opts:["Race condition","Double A problem","None","Value changes from A to B back to A undetected"],ans:3,topic:"Concurrency"},
      {q:"What is lock-free programming?",opts:["None","Thread-free","Algorithms using atomics without mutexes","No locks"],ans:2,topic:"Concurrency"},
      {q:"What is false sharing?",opts:["Wrong sharing","None","Cache miss","Cache lines ping-ponging between cores"],ans:3,topic:"Performance"},
      {q:"What is cache line?",opts:["Memory page","None","64-byte unit of cache transfer","Cache unit"],ans:2,topic:"Performance"},
      {q:"What is branch prediction?",opts:["None","CPU guessing which branch will execute","Jump prediction","Branch compiler"],ans:1,topic:"Performance"},
      {q:"What is SIMD?",opts:["Single Instruction","None","Single Instruction Multiple Data vectorization","Multiple Data"],ans:2,topic:"Performance"},
      {q:"What is expression templates?",opts:["Template expr","None","Lazy evaluation of math expressions via templates","Lazy template"],ans:2,topic:"Advanced Templates"},
      {q:"What is the diamond problem?",opts:["Diamond class","Multiple base","None","Ambiguity when class inherits same base twice"],ans:3,topic:"OOP"},
      {q:"How to solve diamond problem?",opts:["None","Private inheritance","Virtual inheritance","Multiple inheritance"],ans:2,topic:"OOP"},
      {q:"What is std::coroutine (C++20)?",opts:["Async function","Coroutine class","None","Language-level coroutine support"],ans:3,topic:"C++20"},
      {q:"What is co_await?",opts:["Async wait","Await operator","None","Suspends coroutine until awaitable completes"],ans:3,topic:"C++20"},
      {q:"What is co_yield?",opts:["Yield operator","None","Async yield","Suspends coroutine and returns value"],ans:3,topic:"C++20"},
      {q:"What is a module in C++20?",opts:["Replacement for headers with better encapsulation","Package","Namespace","None"],ans:0,topic:"C++20"},
      {q:"What is concepts in C++20?",opts:["Type concepts","None","Template concepts","Named constraints on template parameters"],ans:3,topic:"C++20"},
      {q:"What is ranges in C++20?",opts:["None","Array ranges","Container ranges","Composable lazy range algorithms"],ans:3,topic:"C++20"},
      {q:"What is std::span?",opts:["Span class","Non-owning view over contiguous sequence","Array view","None"],ans:1,topic:"C++20"},
      {q:"What is three-way comparison <=>?",opts:["None","Spaceship operator","Three compare","Returns less/equal/greater in one operation"],ans:3,topic:"C++20"},
      {q:"What is designated initializers?",opts:["Named init","Struct init by field names: {.x=1,.y=2}","Field init","None"],ans:1,topic:"C++20"},
      {q:"What is std::format?",opts:["Type-safe string formatting","String format","Format class","None"],ans:0,topic:"C++20"},
      {q:"What is jthread?",opts:["Java thread","Joined thread","None","Thread with automatic join and stop token"],ans:3,topic:"C++20"},
      {q:"What is std::stop_token?",opts:["None","Cancel token","Cooperative cancellation mechanism","Stop class"],ans:2,topic:"C++20"},
      {q:"What is a generator coroutine?",opts:["Coroutine yielding sequence of values","Generator class","None","Range generator"],ans:0,topic:"C++20"},
      {q:"What is std::latch?",opts:["Single-use barrier for thread synchronization","Latch class","Thread latch","None"],ans:0,topic:"C++20"},
      {q:"What is std::barrier?",opts:["Reusable synchronization point for threads","Barrier class","Thread barrier","None"],ans:0,topic:"C++20"},
      {q:"What is std::semaphore?",opts:["Semaphore class","None","Thread signal","Counting synchronization primitive"],ans:3,topic:"C++20"},
      {q:"What is flat_map in C++23?",opts:["Sorted array-backed map for cache efficiency","Array map","None","Flat container"],ans:0,topic:"C++23"},
      {q:"What is std::expected?",opts:["Either a value or an error — error handling","Result type","None","Expected class"],ans:0,topic:"C++23"},
      {q:"What is std::mdspan?",opts:["Multi-dimensional span view","Matrix span","Multi-span","None"],ans:0,topic:"C++23"},
      {q:"What is deducing this in C++23?",opts:["None","Self parameter","This deduction","Explicit this parameter in member functions"],ans:3,topic:"C++23"},
      {q:"What is std::print in C++23?",opts:["Formatted output to stdout","Print class","None","Format print"],ans:0,topic:"C++23"},
      {q:"What is stack unwinding?",opts:["None","Stack clearing","Destructors called during exception propagation","Unwind class"],ans:2,topic:"Exceptions"},
      {q:"What is exception specification noexcept?",opts:["No exception","Exception spec","None","Promises function won't throw"],ans:3,topic:"Exceptions"},
      {q:"What is std::terminate?",opts:["Program end","None","Terminate function","Called when exception not caught"],ans:3,topic:"Exceptions"},
      {q:"What is SEH?",opts:["System Exception Handling","None","Structured Exception Handling on Windows","Safe Exception Handling"],ans:2,topic:"Exceptions"},
      {q:"What is the as-if rule?",opts:["Compiler can optimize as long as observable behavior same","Assignment rule","None","Alias rule"],ans:0,topic:"Optimization"},
      {q:"What is sequence point?",opts:["Order point","Point where side effects are complete","None","Sequence class"],ans:1,topic:"Internals"},
      {q:"What is strict aliasing?",opts:["Accessing object through wrong type is UB","Alias rule","None","Pointer rule"],ans:0,topic:"Internals"},
      {q:"What is memory ordering in atomics?",opts:["None","Byte order","Memory layout","Controls visibility of operations across threads"],ans:3,topic:"Concurrency"},
      {q:"What is memory_order_seq_cst?",opts:["Strict ordering","None","Strongest ordering — total sequential consistency","Sequential constant"],ans:2,topic:"Concurrency"},
      {q:"What is memory_order_relaxed?",opts:["Relaxed memory","None","Weak ordering","No synchronization guarantees"],ans:3,topic:"Concurrency"},
      {q:"What is ABA problem?",opts:["Race condition","Double A problem","None","Value changes from A to B back to A undetected"],ans:3,topic:"Concurrency"},
      {q:"What is lock-free programming?",opts:["None","Thread-free","Algorithms using atomics without mutexes","No locks"],ans:2,topic:"Concurrency"},
      {q:"What is false sharing?",opts:["Wrong sharing","None","Cache miss","Cache lines ping-ponging between cores"],ans:3,topic:"Performance"},
      {q:"What is cache line?",opts:["Memory page","None","64-byte unit of cache transfer","Cache unit"],ans:2,topic:"Performance"},
      {q:"What is branch prediction?",opts:["None","CPU guessing which branch will execute","Jump prediction","Branch compiler"],ans:1,topic:"Performance"},
      {q:"What is SIMD?",opts:["Single Instruction","None","Single Instruction Multiple Data vectorization","Multiple Data"],ans:2,topic:"Performance"},
      {q:"What is expression templates?",opts:["Template expr","None","Lazy evaluation of math expressions via templates","Lazy template"],ans:2,topic:"Advanced Templates"},
      {q:"What is the diamond problem?",opts:["Diamond class","Multiple base","None","Ambiguity when class inherits same base twice"],ans:3,topic:"OOP"},
      {q:"How to solve diamond problem?",opts:["None","Private inheritance","Virtual inheritance","Multiple inheritance"],ans:2,topic:"OOP"},
      {q:"What is std::coroutine (C++20)?",opts:["Async function","Coroutine class","None","Language-level coroutine support"],ans:3,topic:"C++20"},
      {q:"What is co_await?",opts:["Async wait","Await operator","None","Suspends coroutine until awaitable completes"],ans:3,topic:"C++20"},
      {q:"What is co_yield?",opts:["Yield operator","None","Async yield","Suspends coroutine and returns value"],ans:3,topic:"C++20"},
      {q:"What is a module in C++20?",opts:["Replacement for headers with better encapsulation","Package","Namespace","None"],ans:0,topic:"C++20"},
      {q:"What is concepts in C++20?",opts:["Type concepts","None","Template concepts","Named constraints on template parameters"],ans:3,topic:"C++20"},
      {q:"What is ranges in C++20?",opts:["None","Array ranges","Container ranges","Composable lazy range algorithms"],ans:3,topic:"C++20"},
      {q:"What is std::span?",opts:["Span class","Non-owning view over contiguous sequence","Array view","None"],ans:1,topic:"C++20"},
      {q:"What is three-way comparison <=>?",opts:["None","Spaceship operator","Three compare","Returns less/equal/greater in one operation"],ans:3,topic:"C++20"},
      {q:"What is designated initializers?",opts:["Named init","Struct init by field names: {.x=1,.y=2}","Field init","None"],ans:1,topic:"C++20"},
      {q:"What is std::format?",opts:["Type-safe string formatting","String format","Format class","None"],ans:0,topic:"C++20"},
      {q:"What is jthread?",opts:["Java thread","Joined thread","None","Thread with automatic join and stop token"],ans:3,topic:"C++20"},
      {q:"What is std::stop_token?",opts:["None","Cancel token","Cooperative cancellation mechanism","Stop class"],ans:2,topic:"C++20"},
      {q:"What is a generator coroutine?",opts:["Coroutine yielding sequence of values","Generator class","None","Range generator"],ans:0,topic:"C++20"},
      {q:"What is std::latch?",opts:["Single-use barrier for thread synchronization","Latch class","Thread latch","None"],ans:0,topic:"C++20"},
      {q:"What is std::barrier?",opts:["Reusable synchronization point for threads","Barrier class","Thread barrier","None"],ans:0,topic:"C++20"},
      {q:"What is std::semaphore?",opts:["Semaphore class","None","Thread signal","Counting synchronization primitive"],ans:3,topic:"C++20"},
      {q:"What is flat_map in C++23?",opts:["Sorted array-backed map for cache efficiency","Array map","None","Flat container"],ans:0,topic:"C++23"},
      {q:"What is std::expected?",opts:["Either a value or an error — error handling","Result type","None","Expected class"],ans:0,topic:"C++23"},
      {q:"What is std::mdspan?",opts:["Multi-dimensional span view","Matrix span","Multi-span","None"],ans:0,topic:"C++23"},
      {q:"What is deducing this in C++23?",opts:["None","Self parameter","This deduction","Explicit this parameter in member functions"],ans:3,topic:"C++23"},
      {q:"What is std::print in C++23?",opts:["Formatted output to stdout","Print class","None","Format print"],ans:0,topic:"C++23"},
      {q:"What is stack unwinding?",opts:["None","Stack clearing","Destructors called during exception propagation","Unwind class"],ans:2,topic:"Exceptions"},
      {q:"What is exception specification noexcept?",opts:["No exception","Exception spec","None","Promises function won't throw"],ans:3,topic:"Exceptions"},
      {q:"What is std::terminate?",opts:["Program end","None","Terminate function","Called when exception not caught"],ans:3,topic:"Exceptions"},
      {q:"What is SEH?",opts:["System Exception Handling","None","Structured Exception Handling on Windows","Safe Exception Handling"],ans:2,topic:"Exceptions"},
      {q:"What is the as-if rule?",opts:["Compiler can optimize as long as observable behavior same","Assignment rule","None","Alias rule"],ans:0,topic:"Optimization"},
      {q:"What is sequence point?",opts:["Order point","Point where side effects are complete","None","Sequence class"],ans:1,topic:"Internals"},
      {q:"What is strict aliasing?",opts:["Accessing object through wrong type is UB","Alias rule","None","Pointer rule"],ans:0,topic:"Internals"},
      {q:"What is memory ordering in atomics?",opts:["None","Byte order","Memory layout","Controls visibility of operations across threads"],ans:3,topic:"Concurrency"},
      {q:"What is memory_order_seq_cst?",opts:["Strict ordering","None","Strongest ordering — total sequential consistency","Sequential constant"],ans:2,topic:"Concurrency"},
      {q:"What is memory_order_relaxed?",opts:["Relaxed memory","None","Weak ordering","No synchronization guarantees"],ans:3,topic:"Concurrency"},
      {q:"What is ABA problem?",opts:["Race condition","Double A problem","None","Value changes from A to B back to A undetected"],ans:3,topic:"Concurrency"},
      {q:"What is lock-free programming?",opts:["None","Thread-free","Algorithms using atomics without mutexes","No locks"],ans:2,topic:"Concurrency"},
      {q:"What is false sharing?",opts:["Wrong sharing","None","Cache miss","Cache lines ping-ponging between cores"],ans:3,topic:"Performance"},
      {q:"What is cache line?",opts:["Memory page","None","64-byte unit of cache transfer","Cache unit"],ans:2,topic:"Performance"},
      {q:"What is branch prediction?",opts:["None","CPU guessing which branch will execute","Jump prediction","Branch compiler"],ans:1,topic:"Performance"},
      {q:"What is SIMD?",opts:["Single Instruction","None","Single Instruction Multiple Data vectorization","Multiple Data"],ans:2,topic:"Performance"},
      {q:"What is expression templates?",opts:["Template expr","None","Lazy evaluation of math expressions via templates","Lazy template"],ans:2,topic:"Advanced Templates"},
      {q:"What is the diamond problem?",opts:["Diamond class","Multiple base","None","Ambiguity when class inherits same base twice"],ans:3,topic:"OOP"},
      {q:"How to solve diamond problem?",opts:["None","Private inheritance","Virtual inheritance","Multiple inheritance"],ans:2,topic:"OOP"},
      {q:"What is std::coroutine (C++20)?",opts:["Async function","Coroutine class","None","Language-level coroutine support"],ans:3,topic:"C++20"},
      {q:"What is co_await?",opts:["Async wait","Await operator","None","Suspends coroutine until awaitable completes"],ans:3,topic:"C++20"},
      {q:"What is co_yield?",opts:["Yield operator","None","Async yield","Suspends coroutine and returns value"],ans:3,topic:"C++20"},
      {q:"What is a module in C++20?",opts:["Replacement for headers with better encapsulation","Package","Namespace","None"],ans:0,topic:"C++20"},
      {q:"What is concepts in C++20?",opts:["Type concepts","None","Template concepts","Named constraints on template parameters"],ans:3,topic:"C++20"},
      {q:"What is ranges in C++20?",opts:["None","Array ranges","Container ranges","Composable lazy range algorithms"],ans:3,topic:"C++20"},
      {q:"What is std::span?",opts:["Span class","Non-owning view over contiguous sequence","Array view","None"],ans:1,topic:"C++20"},
      {q:"What is three-way comparison <=>?",opts:["None","Spaceship operator","Three compare","Returns less/equal/greater in one operation"],ans:3,topic:"C++20"},
      {q:"What is designated initializers?",opts:["Named init","Struct init by field names: {.x=1,.y=2}","Field init","None"],ans:1,topic:"C++20"},
      {q:"What is std::format?",opts:["Type-safe string formatting","String format","Format class","None"],ans:0,topic:"C++20"},
      {q:"What is jthread?",opts:["Java thread","Joined thread","None","Thread with automatic join and stop token"],ans:3,topic:"C++20"},
      {q:"What is std::stop_token?",opts:["None","Cancel token","Cooperative cancellation mechanism","Stop class"],ans:2,topic:"C++20"},
      {q:"What is a generator coroutine?",opts:["Coroutine yielding sequence of values","Generator class","None","Range generator"],ans:0,topic:"C++20"},
      {q:"What is std::latch?",opts:["Single-use barrier for thread synchronization","Latch class","Thread latch","None"],ans:0,topic:"C++20"},
      {q:"What is std::barrier?",opts:["Reusable synchronization point for threads","Barrier class","Thread barrier","None"],ans:0,topic:"C++20"},
      {q:"What is std::semaphore?",opts:["Semaphore class","None","Thread signal","Counting synchronization primitive"],ans:3,topic:"C++20"},
      {q:"What is flat_map in C++23?",opts:["Sorted array-backed map for cache efficiency","Array map","None","Flat container"],ans:0,topic:"C++23"},
      {q:"What is std::expected?",opts:["Either a value or an error — error handling","Result type","None","Expected class"],ans:0,topic:"C++23"},
      {q:"What is std::mdspan?",opts:["Multi-dimensional span view","Matrix span","Multi-span","None"],ans:0,topic:"C++23"},
      {q:"What is deducing this in C++23?",opts:["None","Self parameter","This deduction","Explicit this parameter in member functions"],ans:3,topic:"C++23"},
      {q:"What is std::print in C++23?",opts:["Formatted output to stdout","Print class","None","Format print"],ans:0,topic:"C++23"},
      {q:"What is stack unwinding?",opts:["None","Stack clearing","Destructors called during exception propagation","Unwind class"],ans:2,topic:"Exceptions"},
      {q:"What is exception specification noexcept?",opts:["No exception","Exception spec","None","Promises function won't throw"],ans:3,topic:"Exceptions"},
      {q:"What is std::terminate?",opts:["Program end","None","Terminate function","Called when exception not caught"],ans:3,topic:"Exceptions"},
      {q:"What is SEH?",opts:["System Exception Handling","None","Structured Exception Handling on Windows","Safe Exception Handling"],ans:2,topic:"Exceptions"},
      {q:"What is the as-if rule?",opts:["Compiler can optimize as long as observable behavior same","Assignment rule","None","Alias rule"],ans:0,topic:"Optimization"},
      {q:"What is sequence point?",opts:["Order point","Point where side effects are complete","None","Sequence class"],ans:1,topic:"Internals"},
      {q:"What is strict aliasing?",opts:["Accessing object through wrong type is UB","Alias rule","None","Pointer rule"],ans:0,topic:"Internals"},
      {q:"What is memory ordering in atomics?",opts:["None","Byte order","Memory layout","Controls visibility of operations across threads"],ans:3,topic:"Concurrency"},
      {q:"What is memory_order_seq_cst?",opts:["Strict ordering","None","Strongest ordering — total sequential consistency","Sequential constant"],ans:2,topic:"Concurrency"},
      {q:"What is memory_order_relaxed?",opts:["Relaxed memory","None","Weak ordering","No synchronization guarantees"],ans:3,topic:"Concurrency"},
      {q:"What is ABA problem?",opts:["Race condition","Double A problem","None","Value changes from A to B back to A undetected"],ans:3,topic:"Concurrency"},
      {q:"What is lock-free programming?",opts:["None","Thread-free","Algorithms using atomics without mutexes","No locks"],ans:2,topic:"Concurrency"},
      {q:"What is false sharing?",opts:["Wrong sharing","None","Cache miss","Cache lines ping-ponging between cores"],ans:3,topic:"Performance"},
      {q:"What is cache line?",opts:["Memory page","None","64-byte unit of cache transfer","Cache unit"],ans:2,topic:"Performance"},
      {q:"What is branch prediction?",opts:["None","CPU guessing which branch will execute","Jump prediction","Branch compiler"],ans:1,topic:"Performance"},
      {q:"What is SIMD?",opts:["Single Instruction","None","Single Instruction Multiple Data vectorization","Multiple Data"],ans:2,topic:"Performance"},
      {q:"What is expression templates?",opts:["Template expr","None","Lazy evaluation of math expressions via templates","Lazy template"],ans:2,topic:"Advanced Templates"},
      {q:"What is the diamond problem?",opts:["Diamond class","Multiple base","None","Ambiguity when class inherits same base twice"],ans:3,topic:"OOP"},
      {q:"How to solve diamond problem?",opts:["None","Private inheritance","Virtual inheritance","Multiple inheritance"],ans:2,topic:"OOP"},
      {q:"What is std::coroutine (C++20)?",opts:["Async function","Coroutine class","None","Language-level coroutine support"],ans:3,topic:"C++20"},
      {q:"What is co_await?",opts:["Async wait","Await operator","None","Suspends coroutine until awaitable completes"],ans:3,topic:"C++20"},
      {q:"What is co_yield?",opts:["Yield operator","None","Async yield","Suspends coroutine and returns value"],ans:3,topic:"C++20"},
      {q:"What is a module in C++20?",opts:["Replacement for headers with better encapsulation","Package","Namespace","None"],ans:0,topic:"C++20"},
      {q:"What is concepts in C++20?",opts:["Type concepts","None","Template concepts","Named constraints on template parameters"],ans:3,topic:"C++20"},
      {q:"What is ranges in C++20?",opts:["None","Array ranges","Container ranges","Composable lazy range algorithms"],ans:3,topic:"C++20"},
      {q:"What is std::span?",opts:["Span class","Non-owning view over contiguous sequence","Array view","None"],ans:1,topic:"C++20"},
      {q:"What is three-way comparison <=>?",opts:["None","Spaceship operator","Three compare","Returns less/equal/greater in one operation"],ans:3,topic:"C++20"},
      {q:"What is designated initializers?",opts:["Named init","Struct init by field names: {.x=1,.y=2}","Field init","None"],ans:1,topic:"C++20"},
      {q:"What is std::format?",opts:["Type-safe string formatting","String format","Format class","None"],ans:0,topic:"C++20"},
      {q:"What is jthread?",opts:["Java thread","Joined thread","None","Thread with automatic join and stop token"],ans:3,topic:"C++20"},
      {q:"What is std::stop_token?",opts:["None","Cancel token","Cooperative cancellation mechanism","Stop class"],ans:2,topic:"C++20"},
      {q:"What is a generator coroutine?",opts:["Coroutine yielding sequence of values","Generator class","None","Range generator"],ans:0,topic:"C++20"},
      {q:"What is std::latch?",opts:["Single-use barrier for thread synchronization","Latch class","Thread latch","None"],ans:0,topic:"C++20"},
      {q:"What is std::barrier?",opts:["Reusable synchronization point for threads","Barrier class","Thread barrier","None"],ans:0,topic:"C++20"},
      {q:"What is std::semaphore?",opts:["Semaphore class","None","Thread signal","Counting synchronization primitive"],ans:3,topic:"C++20"},
      {q:"What is flat_map in C++23?",opts:["Sorted array-backed map for cache efficiency","Array map","None","Flat container"],ans:0,topic:"C++23"},
      {q:"What is std::expected?",opts:["Either a value or an error — error handling","Result type","None","Expected class"],ans:0,topic:"C++23"},
      {q:"What is std::mdspan?",opts:["Multi-dimensional span view","Matrix span","Multi-span","None"],ans:0,topic:"C++23"},
      {q:"What is deducing this in C++23?",opts:["None","Self parameter","This deduction","Explicit this parameter in member functions"],ans:3,topic:"C++23"},
      {q:"What is std::print in C++23?",opts:["Formatted output to stdout","Print class","None","Format print"],ans:0,topic:"C++23"},
      {q:"What is stack unwinding?",opts:["None","Stack clearing","Destructors called during exception propagation","Unwind class"],ans:2,topic:"Exceptions"},
      {q:"What is exception specification noexcept?",opts:["No exception","Exception spec","None","Promises function won't throw"],ans:3,topic:"Exceptions"},
      {q:"What is std::terminate?",opts:["Program end","None","Terminate function","Called when exception not caught"],ans:3,topic:"Exceptions"},
      {q:"What is SEH?",opts:["System Exception Handling","None","Structured Exception Handling on Windows","Safe Exception Handling"],ans:2,topic:"Exceptions"},
    ],
  },
  c3:{
    basic:[
      {q:"What does HTML stand for?",opts:["High Tech Modern Language","HyperText Markup Language","Home Tool Markup Language","HyperText Modern Links"],ans:1,topic:"HTML"},
      {q:"Which tag creates a hyperlink?",opts:["<a>","<href>","<link>","<url>"],ans:0,topic:"HTML"},
      {q:"Which HTML tag is for largest heading?",opts:["<title>","<header>","<h6>","<h1>"],ans:3,topic:"HTML"},
      {q:"What does CSS stand for?",opts:["Computer Style Sheets","Colorful Style Sheets","Cascading Style Sheets","Creative Style System"],ans:2,topic:"CSS"},
      {q:"How to select element by id in CSS?",opts:["#myid","@myid","*myid",".myid"],ans:0,topic:"CSS"},
      {q:"How to select by class in CSS?",opts:["*myclass","@myclass",".myclass","#myclass"],ans:2,topic:"CSS"},
      {q:"Which CSS property changes text color?",opts:["foreground","text-color","color","font-color"],ans:2,topic:"CSS"},
      {q:"What does 'display: flex' do?",opts:["Floats element","Creates flex container","None","Hides element"],ans:1,topic:"CSS"},
      {q:"What is JavaScript used for?",opts:["Styling","Database","Interactivity","Structure"],ans:2,topic:"JavaScript"},
      {q:"How to declare variable in modern JS?",opts:["let or const","variable x","dim x","var only"],ans:0,topic:"JavaScript"},
      {q:"What does DOM stand for?",opts:["None","Document Object Model","Data Object Model","Dynamic Object Model"],ans:1,topic:"JavaScript"},
      {q:"How to select element by id in JS?",opts:["getById()","findId()","getElementById()","selectId()"],ans:2,topic:"JavaScript"},
      {q:"What does console.log() do?",opts:["Creates log file","Alerts user","None","Prints to browser console"],ans:3,topic:"JavaScript"},
      {q:"What is an event listener?",opts:["Variable","None","Loop","Function responding to user events"],ans:3,topic:"Events"},
      {q:"What does 'async' keyword do?",opts:["Marks function as asynchronous","Loops function","Makes synchronous","None"],ans:0,topic:"Async"},
      {q:"What is a semantic HTML tag?",opts:["None","Styled tag","Tag with meaningful name like <article>","Custom tag"],ans:2,topic:"HTML"},
      {q:"What does 'padding' do in CSS?",opts:["Space inside between content and border","Space outside element","None","Border width"],ans:0,topic:"CSS"},
      {q:"What does 'margin' do in CSS?",opts:["Space inside element","Padding","None","Space outside element border"],ans:3,topic:"CSS"},
      {q:"Which tag is for unordered list?",opts:["<li>","<ul>","<list>","<ol>"],ans:1,topic:"HTML"},
      {q:"What does 'alt' attribute do in img?",opts:["None","Links image","Changes size","Provides alternate text"],ans:3,topic:"HTML"},
      {q:"What is the HTML doctype declaration?",opts:["<!DOCTYPE html>","<head>","<html>","<document>"],ans:0,topic:"HTML"},
      {q:"What tag creates a paragraph?",opts:["<text>","<p>","<para>","<div>"],ans:1,topic:"HTML"},
      {q:"What does <head> contain?",opts:["Footer","Navigation","Page content","Metadata not displayed on page"],ans:3,topic:"HTML"},
      {q:"What does <body> contain?",opts:["Styles only","Scripts only","Metadata","Visible page content"],ans:3,topic:"HTML"},
      {q:"What does <title> set?",opts:["Page heading","None","Browser tab title","Meta title"],ans:2,topic:"HTML"},
      {q:"What is the <div> tag?",opts:["Divider line","Generic block container","Division title","None"],ans:1,topic:"HTML"},
      {q:"What is the <span> tag?",opts:["Spacer","Block element","None","Generic inline container"],ans:3,topic:"HTML"},
      {q:"What is the <img> tag?",opts:["Creates icon","None","Embeds image","Inserts link"],ans:2,topic:"HTML"},
      {q:"What is the <form> tag?",opts:["None","Creates input form","Creates table","Creates list"],ans:1,topic:"HTML"},
      {q:"What is <input> tag?",opts:["None","Creates form","Creates button only","Creates interactive input field"],ans:3,topic:"HTML"},
      {q:"What is the <table> tag?",opts:["Creates list","None","Creates table structure","Creates grid"],ans:2,topic:"HTML"},
      {q:"What is <thead> and <tbody>?",opts:["Table head and body sections","None","Top and bottom","Title and body"],ans:0,topic:"HTML"},
      {q:"What is <th> vs <td>?",opts:["th is table","None","Same element","th is header cell, td is data cell"],ans:3,topic:"HTML"},
      {q:"What attribute makes link open new tab?",opts:["tab='new'","new='true'","target='_blank'","open='tab'"],ans:2,topic:"HTML"},
      {q:"What does <br> do?",opts:["None","Adds space","Creates paragraph","Inserts line break"],ans:3,topic:"HTML"},
      {q:"What does <hr> do?",opts:["Horizontal rule/divider","Header","Home row","None"],ans:0,topic:"HTML"},
      {q:"What is meta charset='UTF-8'?",opts:["None","Sets language","Sets character encoding","Sets font"],ans:2,topic:"HTML"},
      {q:"What is the <nav> tag?",opts:["Number tag","None","Name tag","Navigation links section"],ans:3,topic:"HTML"},
      {q:"What is the <footer> tag?",opts:["Page footer section","File footer","Form footer","None"],ans:0,topic:"HTML"},
      {q:"What is the <header> tag?",opts:["File header","None","Head element","Page header section"],ans:3,topic:"HTML"},
      {q:"What is CSS font-size property?",opts:["Sets text size","Sets weight","None","Sets font type"],ans:0,topic:"CSS"},
      {q:"What is CSS font-family?",opts:["Sets color","Sets weight","Sets size","Sets the typeface"],ans:3,topic:"CSS"},
      {q:"What is CSS font-weight?",opts:["Sets color","Sets text size","Sets text thickness","Sets font"],ans:2,topic:"CSS"},
      {q:"What is CSS background-color?",opts:["Sets shadow","Sets border","Sets element background","Sets text color"],ans:2,topic:"CSS"},
      {q:"What is CSS border property?",opts:["Adds border around element","Adds margin","Adds shadow","Adds padding"],ans:0,topic:"CSS"},
      {q:"What is CSS border-radius?",opts:["None","Rounds border","Rounds corners","Rotates element"],ans:2,topic:"CSS"},
      {q:"What is CSS width and height?",opts:["Border size","Dimensions of element","None","Content size"],ans:1,topic:"CSS"},
      {q:"What is CSS opacity?",opts:["Sets shadow","Sets transparency of element","Sets color","Sets blur"],ans:1,topic:"CSS"},
      {q:"What is CSS cursor property?",opts:["Changes hover","Changes click","None","Changes mouse cursor style"],ans:3,topic:"CSS"},
      {q:"What is CSS visibility: hidden?",opts:["Hides but keeps space","Removes element","Changes opacity","None"],ans:0,topic:"CSS"},
      {q:"What is CSS display: none?",opts:["Removes from layout completely","Hides only","None","Changes opacity"],ans:0,topic:"CSS"},
      {q:"What is CSS position: relative?",opts:["Fixed position","Positioned relative to its normal flow","None","Absolute position"],ans:1,topic:"CSS"},
      {q:"What is CSS position: fixed?",opts:["Fixed to viewport, doesn't scroll","Relative position","Fixed in parent","None"],ans:0,topic:"CSS"},
      {q:"What is CSS position: sticky?",opts:["Always fixed","Sticks to position on scroll","None","Relative"],ans:1,topic:"CSS"},
      {q:"What is CSS z-index?",opts:["Zoom level","Controls stacking order","None","Index position"],ans:1,topic:"CSS"},
      {q:"What is CSS overflow: hidden?",opts:["Clips content exceeding element bounds","None","Adds scrollbar","Shows all"],ans:0,topic:"CSS"},
      {q:"What is CSS text-align?",opts:["Text indent","Vertical alignment","None","Horizontal text alignment"],ans:3,topic:"CSS"},
      {q:"What is CSS line-height?",opts:["Font size","None","Space between lines of text","Paragraph spacing"],ans:2,topic:"CSS"},
      {q:"What is CSS letter-spacing?",opts:["Line spacing","Space between characters","Word spacing","None"],ans:1,topic:"CSS"},
      {q:"What is CSS text-decoration?",opts:["Text color","Underline, strikethrough etc","Text size","None"],ans:1,topic:"CSS"},
      {q:"What does var(--color) do in CSS?",opts:["Uses CSS custom property value","Creates variable","None","Imports color"],ans:0,topic:"CSS"},
      {q:"What is :hover pseudo-class?",opts:["Focus style","None","Styles element when mouse hovers","Click style"],ans:2,topic:"CSS"},
      {q:"What is :focus pseudo-class?",opts:["Active style","None","Hover style","Styles element when focused"],ans:3,topic:"CSS"},
      {q:"What is :nth-child()?",opts:["None","Nth id","Selects element by position in parent","Nth class"],ans:2,topic:"CSS"},
      {q:"What is ::before pseudo-element?",opts:["Before tag","Inserts content before element","Before class","None"],ans:1,topic:"CSS"},
      {q:"What is ::after pseudo-element?",opts:["Inserts content after element","None","After class","After tag"],ans:0,topic:"CSS"},
      {q:"What is CSS transition?",opts:["Animates property changes smoothly","Transform","Instant change","None"],ans:0,topic:"CSS"},
      {q:"What is CSS animation?",opts:["None","Transition","Movement","Keyframe-based continuous animation"],ans:3,topic:"CSS"},
      {q:"What is CSS transform?",opts:["Move position","None","Change style","Rotate/scale/translate element"],ans:3,topic:"CSS"},
      {q:"What is CSS media query?",opts:["Applies styles based on screen size","Screen check","Media import","None"],ans:0,topic:"CSS"},
      {q:"What is @keyframes?",opts:["Frame rate","Defines animation keyframes","None","Key events"],ans:1,topic:"CSS"},
      {q:"What is CSS flexbox?",opts:["1D layout for row/column arrangement","Grid system","None","2D layout"],ans:0,topic:"CSS"},
      {q:"What is flex-direction?",opts:["Flex speed","Flex order","Sets main axis direction of flex","None"],ans:2,topic:"CSS"},
      {q:"What is justify-content?",opts:["Aligns items along main axis","Aligns cross axis","None","Centers items"],ans:0,topic:"CSS"},
      {q:"What is align-items?",opts:["Aligns main axis","None","Aligns items along cross axis","Centers items"],ans:2,topic:"CSS"},
      {q:"What is flex-wrap?",opts:["Allows flex items to wrap to new line","Wraps text","Wraps container","None"],ans:0,topic:"CSS"},
      {q:"What is CSS Grid?",opts:["None","Flex variant","1D layout","2D layout system for rows and columns"],ans:3,topic:"CSS"},
      {q:"What is grid-template-columns?",opts:["Grid areas","None","Defines column sizes in grid","Row sizes"],ans:2,topic:"CSS"},
      {q:"What is grid-gap?",opts:["Grid padding","Grid margin","Space between grid items","None"],ans:2,topic:"CSS"},
      {q:"What is grid-column-span?",opts:["None","Column gap","Makes item span multiple columns","Column count"],ans:2,topic:"CSS"},
      {q:"What is responsive design?",opts:["Fast loading","None","Design adapting to different screen sizes","Animated design"],ans:2,topic:"Responsive"},
      {q:"What is mobile-first design?",opts:["Mobile only","Design for mobile then scale up","None","Desktop first"],ans:1,topic:"Responsive"},
      {q:"What is viewport meta tag?",opts:["View size","Screen tag","Controls mobile display scaling","None"],ans:2,topic:"HTML"},
      {q:"What is the srcset attribute on img?",opts:["None","Provides different images for screen sizes","Image set","Source set class"],ans:1,topic:"HTML"},
      {q:"What is picture element?",opts:["Picture class","Image container","Provides multiple image sources for responsive","None"],ans:2,topic:"HTML"},
      {q:"What is rel='stylesheet'?",opts:["Relative style","Links external CSS file","None","Style relation"],ans:1,topic:"HTML"},
      {q:"What does defer attribute on script do?",opts:["Runs script after HTML parsed","Defers loading","Pauses script","None"],ans:0,topic:"HTML"},
      {q:"What does async attribute on script do?",opts:["Async class","Wait for DOM","Downloads and runs script immediately","None"],ans:2,topic:"HTML"},
      {q:"What is data-* attribute?",opts:["None","Custom attribute for storing data","Data import","Data class"],ans:1,topic:"HTML"},
      {q:"What is aria-label?",opts:["Accessibility label for screen readers","Alt text","None","Title text"],ans:0,topic:"Accessibility"},
      {q:"What is tabindex?",opts:["Controls keyboard tab order","Tab class","Table index","None"],ans:0,topic:"Accessibility"},
      {q:"What is role attribute in HTML?",opts:["Element role","Page role","Defines ARIA role for accessibility","None"],ans:2,topic:"Accessibility"},
      {q:"What is alt text for images?",opts:["Image caption","Descriptive text for screen readers","None","Image title"],ans:1,topic:"Accessibility"},
      {q:"What does HTML stand for?",opts:["High Tech Modern Language","HyperText Markup Language","Home Tool Markup Language","HyperText Modern Links"],ans:1,topic:"HTML"},
      {q:"Which tag creates a hyperlink?",opts:["<a>","<href>","<link>","<url>"],ans:0,topic:"HTML"},
      {q:"Which HTML tag is for largest heading?",opts:["<title>","<header>","<h6>","<h1>"],ans:3,topic:"HTML"},
      {q:"What does CSS stand for?",opts:["Computer Style Sheets","Colorful Style Sheets","Cascading Style Sheets","Creative Style System"],ans:2,topic:"CSS"},
      {q:"How to select element by id in CSS?",opts:["#myid","@myid","*myid",".myid"],ans:0,topic:"CSS"},
      {q:"How to select by class in CSS?",opts:["*myclass","@myclass",".myclass","#myclass"],ans:2,topic:"CSS"},
      {q:"Which CSS property changes text color?",opts:["foreground","text-color","color","font-color"],ans:2,topic:"CSS"},
      {q:"What does 'display: flex' do?",opts:["Floats element","Creates flex container","None","Hides element"],ans:1,topic:"CSS"},
      {q:"What is JavaScript used for?",opts:["Styling","Database","Interactivity","Structure"],ans:2,topic:"JavaScript"},
      {q:"How to declare variable in modern JS?",opts:["let or const","variable x","dim x","var only"],ans:0,topic:"JavaScript"},
      {q:"What does DOM stand for?",opts:["None","Document Object Model","Data Object Model","Dynamic Object Model"],ans:1,topic:"JavaScript"},
      {q:"How to select element by id in JS?",opts:["getById()","findId()","getElementById()","selectId()"],ans:2,topic:"JavaScript"},
      {q:"What does console.log() do?",opts:["Creates log file","Alerts user","None","Prints to browser console"],ans:3,topic:"JavaScript"},
      {q:"What is an event listener?",opts:["Variable","None","Loop","Function responding to user events"],ans:3,topic:"Events"},
      {q:"What does 'async' keyword do?",opts:["Marks function as asynchronous","Loops function","Makes synchronous","None"],ans:0,topic:"Async"},
      {q:"What is a semantic HTML tag?",opts:["None","Styled tag","Tag with meaningful name like <article>","Custom tag"],ans:2,topic:"HTML"},
      {q:"What does 'padding' do in CSS?",opts:["Space inside between content and border","Space outside element","None","Border width"],ans:0,topic:"CSS"},
      {q:"What does 'margin' do in CSS?",opts:["Space inside element","Padding","None","Space outside element border"],ans:3,topic:"CSS"},
      {q:"Which tag is for unordered list?",opts:["<li>","<ul>","<list>","<ol>"],ans:1,topic:"HTML"},
      {q:"What does 'alt' attribute do in img?",opts:["None","Links image","Changes size","Provides alternate text"],ans:3,topic:"HTML"},
      {q:"What is the HTML doctype declaration?",opts:["<!DOCTYPE html>","<head>","<html>","<document>"],ans:0,topic:"HTML"},
      {q:"What tag creates a paragraph?",opts:["<text>","<p>","<para>","<div>"],ans:1,topic:"HTML"},
      {q:"What does <head> contain?",opts:["Footer","Navigation","Page content","Metadata not displayed on page"],ans:3,topic:"HTML"},
      {q:"What does <body> contain?",opts:["Styles only","Scripts only","Metadata","Visible page content"],ans:3,topic:"HTML"},
      {q:"What does <title> set?",opts:["Page heading","None","Browser tab title","Meta title"],ans:2,topic:"HTML"},
      {q:"What is the <div> tag?",opts:["Divider line","Generic block container","Division title","None"],ans:1,topic:"HTML"},
      {q:"What is the <span> tag?",opts:["Spacer","Block element","None","Generic inline container"],ans:3,topic:"HTML"},
      {q:"What is the <img> tag?",opts:["Creates icon","None","Embeds image","Inserts link"],ans:2,topic:"HTML"},
      {q:"What is the <form> tag?",opts:["None","Creates input form","Creates table","Creates list"],ans:1,topic:"HTML"},
      {q:"What is <input> tag?",opts:["None","Creates form","Creates button only","Creates interactive input field"],ans:3,topic:"HTML"},
      {q:"What is the <table> tag?",opts:["Creates list","None","Creates table structure","Creates grid"],ans:2,topic:"HTML"},
      {q:"What is <thead> and <tbody>?",opts:["Table head and body sections","None","Top and bottom","Title and body"],ans:0,topic:"HTML"},
      {q:"What is <th> vs <td>?",opts:["th is table","None","Same element","th is header cell, td is data cell"],ans:3,topic:"HTML"},
      {q:"What attribute makes link open new tab?",opts:["tab='new'","new='true'","target='_blank'","open='tab'"],ans:2,topic:"HTML"},
      {q:"What does <br> do?",opts:["None","Adds space","Creates paragraph","Inserts line break"],ans:3,topic:"HTML"},
      {q:"What does <hr> do?",opts:["Horizontal rule/divider","Header","Home row","None"],ans:0,topic:"HTML"},
      {q:"What is meta charset='UTF-8'?",opts:["None","Sets language","Sets character encoding","Sets font"],ans:2,topic:"HTML"},
      {q:"What is the <nav> tag?",opts:["Number tag","None","Name tag","Navigation links section"],ans:3,topic:"HTML"},
      {q:"What is the <footer> tag?",opts:["Page footer section","File footer","Form footer","None"],ans:0,topic:"HTML"},
      {q:"What is the <header> tag?",opts:["File header","None","Head element","Page header section"],ans:3,topic:"HTML"},
      {q:"What is CSS font-size property?",opts:["Sets text size","Sets weight","None","Sets font type"],ans:0,topic:"CSS"},
      {q:"What is CSS font-family?",opts:["Sets color","Sets weight","Sets size","Sets the typeface"],ans:3,topic:"CSS"},
      {q:"What is CSS font-weight?",opts:["Sets color","Sets text size","Sets text thickness","Sets font"],ans:2,topic:"CSS"},
      {q:"What is CSS background-color?",opts:["Sets shadow","Sets border","Sets element background","Sets text color"],ans:2,topic:"CSS"},
      {q:"What is CSS border property?",opts:["Adds border around element","Adds margin","Adds shadow","Adds padding"],ans:0,topic:"CSS"},
      {q:"What is CSS border-radius?",opts:["None","Rounds border","Rounds corners","Rotates element"],ans:2,topic:"CSS"},
      {q:"What is CSS width and height?",opts:["Border size","Dimensions of element","None","Content size"],ans:1,topic:"CSS"},
      {q:"What is CSS opacity?",opts:["Sets shadow","Sets transparency of element","Sets color","Sets blur"],ans:1,topic:"CSS"},
      {q:"What is CSS cursor property?",opts:["Changes hover","Changes click","None","Changes mouse cursor style"],ans:3,topic:"CSS"},
      {q:"What is CSS visibility: hidden?",opts:["Hides but keeps space","Removes element","Changes opacity","None"],ans:0,topic:"CSS"},
      {q:"What is CSS display: none?",opts:["Removes from layout completely","Hides only","None","Changes opacity"],ans:0,topic:"CSS"},
      {q:"What is CSS position: relative?",opts:["Fixed position","Positioned relative to its normal flow","None","Absolute position"],ans:1,topic:"CSS"},
      {q:"What is CSS position: fixed?",opts:["Fixed to viewport, doesn't scroll","Relative position","Fixed in parent","None"],ans:0,topic:"CSS"},
      {q:"What is CSS position: sticky?",opts:["Always fixed","Sticks to position on scroll","None","Relative"],ans:1,topic:"CSS"},
      {q:"What is CSS z-index?",opts:["Zoom level","Controls stacking order","None","Index position"],ans:1,topic:"CSS"},
      {q:"What is CSS overflow: hidden?",opts:["Clips content exceeding element bounds","None","Adds scrollbar","Shows all"],ans:0,topic:"CSS"},
      {q:"What is CSS text-align?",opts:["Text indent","Vertical alignment","None","Horizontal text alignment"],ans:3,topic:"CSS"},
      {q:"What is CSS line-height?",opts:["Font size","None","Space between lines of text","Paragraph spacing"],ans:2,topic:"CSS"},
      {q:"What is CSS letter-spacing?",opts:["Line spacing","Space between characters","Word spacing","None"],ans:1,topic:"CSS"},
      {q:"What is CSS text-decoration?",opts:["Text color","Underline, strikethrough etc","Text size","None"],ans:1,topic:"CSS"},
      {q:"What does var(--color) do in CSS?",opts:["Uses CSS custom property value","Creates variable","None","Imports color"],ans:0,topic:"CSS"},
      {q:"What is :hover pseudo-class?",opts:["Focus style","None","Styles element when mouse hovers","Click style"],ans:2,topic:"CSS"},
      {q:"What is :focus pseudo-class?",opts:["Active style","None","Hover style","Styles element when focused"],ans:3,topic:"CSS"},
      {q:"What is :nth-child()?",opts:["None","Nth id","Selects element by position in parent","Nth class"],ans:2,topic:"CSS"},
      {q:"What is ::before pseudo-element?",opts:["Before tag","Inserts content before element","Before class","None"],ans:1,topic:"CSS"},
      {q:"What is ::after pseudo-element?",opts:["Inserts content after element","None","After class","After tag"],ans:0,topic:"CSS"},
      {q:"What is CSS transition?",opts:["Animates property changes smoothly","Transform","Instant change","None"],ans:0,topic:"CSS"},
      {q:"What is CSS animation?",opts:["None","Transition","Movement","Keyframe-based continuous animation"],ans:3,topic:"CSS"},
      {q:"What is CSS transform?",opts:["Move position","None","Change style","Rotate/scale/translate element"],ans:3,topic:"CSS"},
      {q:"What is CSS media query?",opts:["Applies styles based on screen size","Screen check","Media import","None"],ans:0,topic:"CSS"},
      {q:"What is @keyframes?",opts:["Frame rate","Defines animation keyframes","None","Key events"],ans:1,topic:"CSS"},
      {q:"What is CSS flexbox?",opts:["1D layout for row/column arrangement","Grid system","None","2D layout"],ans:0,topic:"CSS"},
      {q:"What is flex-direction?",opts:["Flex speed","Flex order","Sets main axis direction of flex","None"],ans:2,topic:"CSS"},
      {q:"What is justify-content?",opts:["Aligns items along main axis","Aligns cross axis","None","Centers items"],ans:0,topic:"CSS"},
      {q:"What is align-items?",opts:["Aligns main axis","None","Aligns items along cross axis","Centers items"],ans:2,topic:"CSS"},
      {q:"What is flex-wrap?",opts:["Allows flex items to wrap to new line","Wraps text","Wraps container","None"],ans:0,topic:"CSS"},
      {q:"What is CSS Grid?",opts:["None","Flex variant","1D layout","2D layout system for rows and columns"],ans:3,topic:"CSS"},
      {q:"What is grid-template-columns?",opts:["Grid areas","None","Defines column sizes in grid","Row sizes"],ans:2,topic:"CSS"},
      {q:"What is grid-gap?",opts:["Grid padding","Grid margin","Space between grid items","None"],ans:2,topic:"CSS"},
      {q:"What is grid-column-span?",opts:["None","Column gap","Makes item span multiple columns","Column count"],ans:2,topic:"CSS"},
      {q:"What is responsive design?",opts:["Fast loading","None","Design adapting to different screen sizes","Animated design"],ans:2,topic:"Responsive"},
      {q:"What is mobile-first design?",opts:["Mobile only","Design for mobile then scale up","None","Desktop first"],ans:1,topic:"Responsive"},
      {q:"What is viewport meta tag?",opts:["View size","Screen tag","Controls mobile display scaling","None"],ans:2,topic:"HTML"},
      {q:"What is the srcset attribute on img?",opts:["None","Provides different images for screen sizes","Image set","Source set class"],ans:1,topic:"HTML"},
      {q:"What is picture element?",opts:["Picture class","Image container","Provides multiple image sources for responsive","None"],ans:2,topic:"HTML"},
      {q:"What is rel='stylesheet'?",opts:["Relative style","Links external CSS file","None","Style relation"],ans:1,topic:"HTML"},
      {q:"What does defer attribute on script do?",opts:["Runs script after HTML parsed","Defers loading","Pauses script","None"],ans:0,topic:"HTML"},
      {q:"What does async attribute on script do?",opts:["Async class","Wait for DOM","Downloads and runs script immediately","None"],ans:2,topic:"HTML"},
      {q:"What is data-* attribute?",opts:["None","Custom attribute for storing data","Data import","Data class"],ans:1,topic:"HTML"},
      {q:"What is aria-label?",opts:["Accessibility label for screen readers","Alt text","None","Title text"],ans:0,topic:"Accessibility"},
      {q:"What is tabindex?",opts:["Controls keyboard tab order","Tab class","Table index","None"],ans:0,topic:"Accessibility"},
      {q:"What is role attribute in HTML?",opts:["Element role","Page role","Defines ARIA role for accessibility","None"],ans:2,topic:"Accessibility"},
      {q:"What is alt text for images?",opts:["Image caption","Descriptive text for screen readers","None","Image title"],ans:1,topic:"Accessibility"},
      {q:"What does HTML stand for?",opts:["High Tech Modern Language","HyperText Markup Language","Home Tool Markup Language","HyperText Modern Links"],ans:1,topic:"HTML"},
      {q:"Which tag creates a hyperlink?",opts:["<a>","<href>","<link>","<url>"],ans:0,topic:"HTML"},
      {q:"Which HTML tag is for largest heading?",opts:["<title>","<header>","<h6>","<h1>"],ans:3,topic:"HTML"},
      {q:"What does CSS stand for?",opts:["Computer Style Sheets","Colorful Style Sheets","Cascading Style Sheets","Creative Style System"],ans:2,topic:"CSS"},
      {q:"How to select element by id in CSS?",opts:["#myid","@myid","*myid",".myid"],ans:0,topic:"CSS"},
      {q:"How to select by class in CSS?",opts:["*myclass","@myclass",".myclass","#myclass"],ans:2,topic:"CSS"},
      {q:"Which CSS property changes text color?",opts:["foreground","text-color","color","font-color"],ans:2,topic:"CSS"},
      {q:"What does 'display: flex' do?",opts:["Floats element","Creates flex container","None","Hides element"],ans:1,topic:"CSS"},
      {q:"What is JavaScript used for?",opts:["Styling","Database","Interactivity","Structure"],ans:2,topic:"JavaScript"},
      {q:"How to declare variable in modern JS?",opts:["let or const","variable x","dim x","var only"],ans:0,topic:"JavaScript"},
      {q:"What does DOM stand for?",opts:["None","Document Object Model","Data Object Model","Dynamic Object Model"],ans:1,topic:"JavaScript"},
      {q:"How to select element by id in JS?",opts:["getById()","findId()","getElementById()","selectId()"],ans:2,topic:"JavaScript"},
      {q:"What does console.log() do?",opts:["Creates log file","Alerts user","None","Prints to browser console"],ans:3,topic:"JavaScript"},
      {q:"What is an event listener?",opts:["Variable","None","Loop","Function responding to user events"],ans:3,topic:"Events"},
    ],
    intermediate:[
      {q:"What is the CSS box model?",opts:["Color model","Margin + Border + Padding + Content","Box shape","None"],ans:1,topic:"CSS"},
      {q:"What is CSS specificity?",opts:["Color depth","None","Animation speed","Rules for which CSS wins when multiple apply"],ans:3,topic:"CSS"},
      {q:"Difference between == and === in JavaScript?",opts:["=== checks value and type, == only value","=== is slower","None","No difference"],ans:0,topic:"JavaScript"},
      {q:"What is 'undefined' vs 'null' in JS?",opts:["null is error","undefined: not assigned, null: intentionally empty","None","Same thing"],ans:1,topic:"JavaScript"},
      {q:"What is hoisting in JavaScript?",opts:["Declarations moved to top of scope","Variable copying","None","Code lifting"],ans:0,topic:"JavaScript"},
      {q:"What is 'use strict'?",opts:["Strict class","None","Strict import","Enables strict mode — catches more errors"],ans:3,topic:"JavaScript"},
      {q:"What is event bubbling?",opts:["Events propagating from child to parent","Creating events","Blocking events","None"],ans:0,topic:"Events"},
      {q:"What is event capturing?",opts:["Event stop","Events propagating from parent to child","None","Capture class"],ans:1,topic:"Events"},
      {q:"What does stopPropagation() do?",opts:["Stops event","None","Stops event from bubbling/capturing","Removes event"],ans:2,topic:"Events"},
      {q:"What does preventDefault() do?",opts:["None","Stops event","Prevents default browser behavior","Creates event"],ans:2,topic:"Events"},
      {q:"What is a Promise in JavaScript?",opts:["None","Loop","Object representing future async value","Variable"],ans:2,topic:"Async"},
      {q:"What are Promise states?",opts:["None","Pending, Fulfilled, Rejected","Active, Done, Error","Start, End, Error"],ans:1,topic:"Async"},
      {q:"What does async/await do?",opts:["Creates threads","Syntactic sugar for cleaner Promise handling","Makes synchronous","None"],ans:1,topic:"Async"},
      {q:"What is the event loop in JS?",opts:["While loop","For loop","DOM loop","Mechanism handling async code via call stack and queue"],ans:3,topic:"JavaScript"},
      {q:"What is the call stack?",opts:["Async queue","None","Stack of currently executing functions","Function list"],ans:2,topic:"JavaScript"},
      {q:"What is the task queue?",opts:["Microtask","None","Async stack","Queue of callback functions to execute"],ans:3,topic:"JavaScript"},
      {q:"What are microtasks?",opts:["Small tasks","None","Promise callbacks — run before macrotasks","Micro events"],ans:2,topic:"JavaScript"},
      {q:"What is JSON?",opts:["JavaScript Object Notation — data interchange format","JS object","None","Java module"],ans:0,topic:"Data"},
      {q:"What is JSON.stringify()?",opts:["Creates JSON file","Parses JSON","None","Converts JS object to JSON string"],ans:3,topic:"Data"},
      {q:"What is JSON.parse()?",opts:["Creates JSON","None","Stringifies","Converts JSON string to JS object"],ans:3,topic:"Data"},
      {q:"What is localStorage?",opts:["Browser key-value storage persisting across sessions","Cookie","Server storage","Session storage"],ans:0,topic:"Web APIs"},
      {q:"What is sessionStorage?",opts:["Server storage","Local storage","Cookie","Browser key-value storage for single session"],ans:3,topic:"Web APIs"},
      {q:"What is a cookie?",opts:["Small data stored by browser per domain","Cache","Session data","Local storage"],ans:0,topic:"Web APIs"},
      {q:"What is the Fetch API?",opts:["None","Modern way to make HTTP requests","Get URL","Fetch data"],ans:1,topic:"Async"},
      {q:"What is CORS?",opts:["Cross-origin class","None","Cross-Origin Resource Sharing — browser security policy","Custom Origin"],ans:2,topic:"Web Security"},
      {q:"What is XHR?",opts:["XML Handler","XMLHttpRequest — older way to make HTTP requests","X Header Request","None"],ans:1,topic:"Async"},
      {q:"What is REST API?",opts:["Architectural style for HTTP APIs using methods","API type","Rest service","None"],ans:0,topic:"APIs"},
      {q:"What HTTP method creates a resource?",opts:["PUT","DELETE","GET","POST"],ans:3,topic:"APIs"},
      {q:"What HTTP method retrieves a resource?",opts:["POST","DELETE","GET","PUT"],ans:2,topic:"APIs"},
      {q:"What HTTP method updates a resource?",opts:["GET","DELETE","PUT or PATCH","POST"],ans:2,topic:"APIs"},
      {q:"What HTTP method deletes a resource?",opts:["DELETE","GET","PUT","POST"],ans:0,topic:"APIs"},
      {q:"What is HTTP status 200?",opts:["OK — success","Server error","Not found","Created"],ans:0,topic:"HTTP"},
      {q:"What is HTTP status 201?",opts:["OK","Created successfully","Not found","Server error"],ans:1,topic:"HTTP"},
      {q:"What is HTTP status 404?",opts:["Server error","Forbidden","Not found","OK"],ans:2,topic:"HTTP"},
      {q:"What is HTTP status 500?",opts:["OK","Forbidden","Not found","Internal server error"],ans:3,topic:"HTTP"},
      {q:"What is HTTP status 401?",opts:["Forbidden","Not found","OK","Unauthorized"],ans:3,topic:"HTTP"},
      {q:"What is HTTP status 403?",opts:["Forbidden","OK","Unauthorized","Not found"],ans:0,topic:"HTTP"},
      {q:"What is a React component?",opts:["Database table","Reusable UI building block","CSS class","None"],ans:1,topic:"React"},
      {q:"What is JSX?",opts:["JavaScript XML — JS with HTML-like syntax","Java Syntax","None","JSON XML"],ans:0,topic:"React"},
      {q:"What is useState in React?",opts:["None","Route hook","API hook","Hook for managing component state"],ans:3,topic:"React"},
      {q:"What is useEffect in React?",opts:["None","State hook","Runs side effects after render","Style hook"],ans:2,topic:"React"},
      {q:"What are props in React?",opts:["Read-only data passed from parent to child","CSS properties","State variables","None"],ans:0,topic:"React"},
      {q:"What is the Virtual DOM?",opts:["Database","In-memory DOM React diffs efficiently","Actual DOM","None"],ans:1,topic:"React"},
      {q:"What is reconciliation in React?",opts:["Comparing VDOM and updating real DOM","State management","Routing","None"],ans:0,topic:"React"},
      {q:"What is key prop in lists?",opts:["Unique identifier helping React track list items","Style key","None","Data key"],ans:0,topic:"React"},
      {q:"What is controlled component?",opts:["None","Uncontrolled","DOM-managed","Form input controlled by React state"],ans:3,topic:"React"},
      {q:"What is uncontrolled component?",opts:["State-managed","None","Controlled","Form input managed by DOM ref"],ans:3,topic:"React"},
      {q:"What is useRef in React?",opts:["None","Returns mutable ref object persisting across renders","State hook","DOM only"],ans:1,topic:"React"},
      {q:"What is useCallback?",opts:["None","Router hook","State hook","Memoizes function reference"],ans:3,topic:"React"},
      {q:"What is useMemo?",opts:["Memoizes computed value","None","State hook","Router hook"],ans:0,topic:"React"},
      {q:"What is useContext?",opts:["Accesses context value without prop drilling","None","Route hook","State hook"],ans:0,topic:"React"},
      {q:"What is Context API?",opts:["None","React way to pass data without prop drilling","CSS variables","Router"],ans:1,topic:"React"},
      {q:"What is React.memo?",opts:["Memoizes component to skip unnecessary re-renders","Memory hook","None","Cache hook"],ans:0,topic:"React"},
      {q:"What is createPortal?",opts:["Portal class","Renders children into different DOM node","None","Modal class"],ans:1,topic:"React"},
      {q:"What is React.lazy?",opts:["None","Lazy loading","Lazy hook","Dynamically imports component for code splitting"],ans:3,topic:"React"},
      {q:"What is Suspense?",opts:["Loading class","Shows fallback while lazy component loads","None","Wait class"],ans:1,topic:"React"},
      {q:"What is React Router?",opts:["Navigation","Router class","None","Library for client-side routing"],ans:3,topic:"React"},
      {q:"What is the CSS box model?",opts:["Color model","Margin + Border + Padding + Content","Box shape","None"],ans:1,topic:"CSS"},
      {q:"What is CSS specificity?",opts:["Color depth","None","Animation speed","Rules for which CSS wins when multiple apply"],ans:3,topic:"CSS"},
      {q:"Difference between == and === in JavaScript?",opts:["=== checks value and type, == only value","=== is slower","None","No difference"],ans:0,topic:"JavaScript"},
      {q:"What is 'undefined' vs 'null' in JS?",opts:["null is error","undefined: not assigned, null: intentionally empty","None","Same thing"],ans:1,topic:"JavaScript"},
      {q:"What is hoisting in JavaScript?",opts:["Declarations moved to top of scope","Variable copying","None","Code lifting"],ans:0,topic:"JavaScript"},
      {q:"What is 'use strict'?",opts:["Strict class","None","Strict import","Enables strict mode — catches more errors"],ans:3,topic:"JavaScript"},
      {q:"What is event bubbling?",opts:["Events propagating from child to parent","Creating events","Blocking events","None"],ans:0,topic:"Events"},
      {q:"What is event capturing?",opts:["Event stop","Events propagating from parent to child","None","Capture class"],ans:1,topic:"Events"},
      {q:"What does stopPropagation() do?",opts:["Stops event","None","Stops event from bubbling/capturing","Removes event"],ans:2,topic:"Events"},
      {q:"What does preventDefault() do?",opts:["None","Stops event","Prevents default browser behavior","Creates event"],ans:2,topic:"Events"},
      {q:"What is a Promise in JavaScript?",opts:["None","Loop","Object representing future async value","Variable"],ans:2,topic:"Async"},
      {q:"What are Promise states?",opts:["None","Pending, Fulfilled, Rejected","Active, Done, Error","Start, End, Error"],ans:1,topic:"Async"},
      {q:"What does async/await do?",opts:["Creates threads","Syntactic sugar for cleaner Promise handling","Makes synchronous","None"],ans:1,topic:"Async"},
      {q:"What is the event loop in JS?",opts:["While loop","For loop","DOM loop","Mechanism handling async code via call stack and queue"],ans:3,topic:"JavaScript"},
      {q:"What is the call stack?",opts:["Async queue","None","Stack of currently executing functions","Function list"],ans:2,topic:"JavaScript"},
      {q:"What is the task queue?",opts:["Microtask","None","Async stack","Queue of callback functions to execute"],ans:3,topic:"JavaScript"},
      {q:"What are microtasks?",opts:["Small tasks","None","Promise callbacks — run before macrotasks","Micro events"],ans:2,topic:"JavaScript"},
      {q:"What is JSON?",opts:["JavaScript Object Notation — data interchange format","JS object","None","Java module"],ans:0,topic:"Data"},
      {q:"What is JSON.stringify()?",opts:["Creates JSON file","Parses JSON","None","Converts JS object to JSON string"],ans:3,topic:"Data"},
      {q:"What is JSON.parse()?",opts:["Creates JSON","None","Stringifies","Converts JSON string to JS object"],ans:3,topic:"Data"},
      {q:"What is localStorage?",opts:["Browser key-value storage persisting across sessions","Cookie","Server storage","Session storage"],ans:0,topic:"Web APIs"},
      {q:"What is sessionStorage?",opts:["Server storage","Local storage","Cookie","Browser key-value storage for single session"],ans:3,topic:"Web APIs"},
      {q:"What is a cookie?",opts:["Small data stored by browser per domain","Cache","Session data","Local storage"],ans:0,topic:"Web APIs"},
      {q:"What is the Fetch API?",opts:["None","Modern way to make HTTP requests","Get URL","Fetch data"],ans:1,topic:"Async"},
      {q:"What is CORS?",opts:["Cross-origin class","None","Cross-Origin Resource Sharing — browser security policy","Custom Origin"],ans:2,topic:"Web Security"},
      {q:"What is XHR?",opts:["XML Handler","XMLHttpRequest — older way to make HTTP requests","X Header Request","None"],ans:1,topic:"Async"},
      {q:"What is REST API?",opts:["Architectural style for HTTP APIs using methods","API type","Rest service","None"],ans:0,topic:"APIs"},
      {q:"What HTTP method creates a resource?",opts:["PUT","DELETE","GET","POST"],ans:3,topic:"APIs"},
      {q:"What HTTP method retrieves a resource?",opts:["POST","DELETE","GET","PUT"],ans:2,topic:"APIs"},
      {q:"What HTTP method updates a resource?",opts:["GET","DELETE","PUT or PATCH","POST"],ans:2,topic:"APIs"},
      {q:"What HTTP method deletes a resource?",opts:["DELETE","GET","PUT","POST"],ans:0,topic:"APIs"},
      {q:"What is HTTP status 200?",opts:["OK — success","Server error","Not found","Created"],ans:0,topic:"HTTP"},
      {q:"What is HTTP status 201?",opts:["OK","Created successfully","Not found","Server error"],ans:1,topic:"HTTP"},
      {q:"What is HTTP status 404?",opts:["Server error","Forbidden","Not found","OK"],ans:2,topic:"HTTP"},
      {q:"What is HTTP status 500?",opts:["OK","Forbidden","Not found","Internal server error"],ans:3,topic:"HTTP"},
      {q:"What is HTTP status 401?",opts:["Forbidden","Not found","OK","Unauthorized"],ans:3,topic:"HTTP"},
      {q:"What is HTTP status 403?",opts:["Forbidden","OK","Unauthorized","Not found"],ans:0,topic:"HTTP"},
      {q:"What is a React component?",opts:["Database table","Reusable UI building block","CSS class","None"],ans:1,topic:"React"},
      {q:"What is JSX?",opts:["JavaScript XML — JS with HTML-like syntax","Java Syntax","None","JSON XML"],ans:0,topic:"React"},
      {q:"What is useState in React?",opts:["None","Route hook","API hook","Hook for managing component state"],ans:3,topic:"React"},
      {q:"What is useEffect in React?",opts:["None","State hook","Runs side effects after render","Style hook"],ans:2,topic:"React"},
      {q:"What are props in React?",opts:["Read-only data passed from parent to child","CSS properties","State variables","None"],ans:0,topic:"React"},
      {q:"What is the Virtual DOM?",opts:["Database","In-memory DOM React diffs efficiently","Actual DOM","None"],ans:1,topic:"React"},
      {q:"What is reconciliation in React?",opts:["Comparing VDOM and updating real DOM","State management","Routing","None"],ans:0,topic:"React"},
      {q:"What is key prop in lists?",opts:["Unique identifier helping React track list items","Style key","None","Data key"],ans:0,topic:"React"},
      {q:"What is controlled component?",opts:["None","Uncontrolled","DOM-managed","Form input controlled by React state"],ans:3,topic:"React"},
      {q:"What is uncontrolled component?",opts:["State-managed","None","Controlled","Form input managed by DOM ref"],ans:3,topic:"React"},
      {q:"What is useRef in React?",opts:["None","Returns mutable ref object persisting across renders","State hook","DOM only"],ans:1,topic:"React"},
      {q:"What is useCallback?",opts:["None","Router hook","State hook","Memoizes function reference"],ans:3,topic:"React"},
      {q:"What is useMemo?",opts:["Memoizes computed value","None","State hook","Router hook"],ans:0,topic:"React"},
      {q:"What is useContext?",opts:["Accesses context value without prop drilling","None","Route hook","State hook"],ans:0,topic:"React"},
      {q:"What is Context API?",opts:["None","React way to pass data without prop drilling","CSS variables","Router"],ans:1,topic:"React"},
      {q:"What is React.memo?",opts:["Memoizes component to skip unnecessary re-renders","Memory hook","None","Cache hook"],ans:0,topic:"React"},
      {q:"What is createPortal?",opts:["Portal class","Renders children into different DOM node","None","Modal class"],ans:1,topic:"React"},
      {q:"What is React.lazy?",opts:["None","Lazy loading","Lazy hook","Dynamically imports component for code splitting"],ans:3,topic:"React"},
      {q:"What is Suspense?",opts:["Loading class","Shows fallback while lazy component loads","None","Wait class"],ans:1,topic:"React"},
      {q:"What is React Router?",opts:["Navigation","Router class","None","Library for client-side routing"],ans:3,topic:"React"},
      {q:"What is the CSS box model?",opts:["Color model","Margin + Border + Padding + Content","Box shape","None"],ans:1,topic:"CSS"},
      {q:"What is CSS specificity?",opts:["Color depth","None","Animation speed","Rules for which CSS wins when multiple apply"],ans:3,topic:"CSS"},
      {q:"Difference between == and === in JavaScript?",opts:["=== checks value and type, == only value","=== is slower","None","No difference"],ans:0,topic:"JavaScript"},
      {q:"What is 'undefined' vs 'null' in JS?",opts:["null is error","undefined: not assigned, null: intentionally empty","None","Same thing"],ans:1,topic:"JavaScript"},
      {q:"What is hoisting in JavaScript?",opts:["Declarations moved to top of scope","Variable copying","None","Code lifting"],ans:0,topic:"JavaScript"},
      {q:"What is 'use strict'?",opts:["Strict class","None","Strict import","Enables strict mode — catches more errors"],ans:3,topic:"JavaScript"},
      {q:"What is event bubbling?",opts:["Events propagating from child to parent","Creating events","Blocking events","None"],ans:0,topic:"Events"},
      {q:"What is event capturing?",opts:["Event stop","Events propagating from parent to child","None","Capture class"],ans:1,topic:"Events"},
      {q:"What does stopPropagation() do?",opts:["Stops event","None","Stops event from bubbling/capturing","Removes event"],ans:2,topic:"Events"},
      {q:"What does preventDefault() do?",opts:["None","Stops event","Prevents default browser behavior","Creates event"],ans:2,topic:"Events"},
      {q:"What is a Promise in JavaScript?",opts:["None","Loop","Object representing future async value","Variable"],ans:2,topic:"Async"},
      {q:"What are Promise states?",opts:["None","Pending, Fulfilled, Rejected","Active, Done, Error","Start, End, Error"],ans:1,topic:"Async"},
      {q:"What does async/await do?",opts:["Creates threads","Syntactic sugar for cleaner Promise handling","Makes synchronous","None"],ans:1,topic:"Async"},
      {q:"What is the event loop in JS?",opts:["While loop","For loop","DOM loop","Mechanism handling async code via call stack and queue"],ans:3,topic:"JavaScript"},
      {q:"What is the call stack?",opts:["Async queue","None","Stack of currently executing functions","Function list"],ans:2,topic:"JavaScript"},
      {q:"What is the task queue?",opts:["Microtask","None","Async stack","Queue of callback functions to execute"],ans:3,topic:"JavaScript"},
      {q:"What are microtasks?",opts:["Small tasks","None","Promise callbacks — run before macrotasks","Micro events"],ans:2,topic:"JavaScript"},
      {q:"What is JSON?",opts:["JavaScript Object Notation — data interchange format","JS object","None","Java module"],ans:0,topic:"Data"},
      {q:"What is JSON.stringify()?",opts:["Creates JSON file","Parses JSON","None","Converts JS object to JSON string"],ans:3,topic:"Data"},
      {q:"What is JSON.parse()?",opts:["Creates JSON","None","Stringifies","Converts JSON string to JS object"],ans:3,topic:"Data"},
      {q:"What is localStorage?",opts:["Browser key-value storage persisting across sessions","Cookie","Server storage","Session storage"],ans:0,topic:"Web APIs"},
      {q:"What is sessionStorage?",opts:["Server storage","Local storage","Cookie","Browser key-value storage for single session"],ans:3,topic:"Web APIs"},
      {q:"What is a cookie?",opts:["Small data stored by browser per domain","Cache","Session data","Local storage"],ans:0,topic:"Web APIs"},
      {q:"What is the Fetch API?",opts:["None","Modern way to make HTTP requests","Get URL","Fetch data"],ans:1,topic:"Async"},
      {q:"What is CORS?",opts:["Cross-origin class","None","Cross-Origin Resource Sharing — browser security policy","Custom Origin"],ans:2,topic:"Web Security"},
      {q:"What is XHR?",opts:["XML Handler","XMLHttpRequest — older way to make HTTP requests","X Header Request","None"],ans:1,topic:"Async"},
      {q:"What is REST API?",opts:["Architectural style for HTTP APIs using methods","API type","Rest service","None"],ans:0,topic:"APIs"},
      {q:"What HTTP method creates a resource?",opts:["PUT","DELETE","GET","POST"],ans:3,topic:"APIs"},
      {q:"What HTTP method retrieves a resource?",opts:["POST","DELETE","GET","PUT"],ans:2,topic:"APIs"},
      {q:"What HTTP method updates a resource?",opts:["GET","DELETE","PUT or PATCH","POST"],ans:2,topic:"APIs"},
      {q:"What HTTP method deletes a resource?",opts:["DELETE","GET","PUT","POST"],ans:0,topic:"APIs"},
      {q:"What is HTTP status 200?",opts:["OK — success","Server error","Not found","Created"],ans:0,topic:"HTTP"},
      {q:"What is HTTP status 201?",opts:["OK","Created successfully","Not found","Server error"],ans:1,topic:"HTTP"},
      {q:"What is HTTP status 404?",opts:["Server error","Forbidden","Not found","OK"],ans:2,topic:"HTTP"},
      {q:"What is HTTP status 500?",opts:["OK","Forbidden","Not found","Internal server error"],ans:3,topic:"HTTP"},
      {q:"What is HTTP status 401?",opts:["Forbidden","Not found","OK","Unauthorized"],ans:3,topic:"HTTP"},
      {q:"What is HTTP status 403?",opts:["Forbidden","OK","Unauthorized","Not found"],ans:0,topic:"HTTP"},
      {q:"What is a React component?",opts:["Database table","Reusable UI building block","CSS class","None"],ans:1,topic:"React"},
      {q:"What is JSX?",opts:["JavaScript XML — JS with HTML-like syntax","Java Syntax","None","JSON XML"],ans:0,topic:"React"},
      {q:"What is useState in React?",opts:["None","Route hook","API hook","Hook for managing component state"],ans:3,topic:"React"},
      {q:"What is useEffect in React?",opts:["None","State hook","Runs side effects after render","Style hook"],ans:2,topic:"React"},
      {q:"What are props in React?",opts:["Read-only data passed from parent to child","CSS properties","State variables","None"],ans:0,topic:"React"},
      {q:"What is the Virtual DOM?",opts:["Database","In-memory DOM React diffs efficiently","Actual DOM","None"],ans:1,topic:"React"},
      {q:"What is reconciliation in React?",opts:["Comparing VDOM and updating real DOM","State management","Routing","None"],ans:0,topic:"React"},
      {q:"What is key prop in lists?",opts:["Unique identifier helping React track list items","Style key","None","Data key"],ans:0,topic:"React"},
      {q:"What is controlled component?",opts:["None","Uncontrolled","DOM-managed","Form input controlled by React state"],ans:3,topic:"React"},
      {q:"What is uncontrolled component?",opts:["State-managed","None","Controlled","Form input managed by DOM ref"],ans:3,topic:"React"},
      {q:"What is useRef in React?",opts:["None","Returns mutable ref object persisting across renders","State hook","DOM only"],ans:1,topic:"React"},
      {q:"What is useCallback?",opts:["None","Router hook","State hook","Memoizes function reference"],ans:3,topic:"React"},
      {q:"What is useMemo?",opts:["Memoizes computed value","None","State hook","Router hook"],ans:0,topic:"React"},
      {q:"What is useContext?",opts:["Accesses context value without prop drilling","None","Route hook","State hook"],ans:0,topic:"React"},
      {q:"What is Context API?",opts:["None","React way to pass data without prop drilling","CSS variables","Router"],ans:1,topic:"React"},
      {q:"What is React.memo?",opts:["Memoizes component to skip unnecessary re-renders","Memory hook","None","Cache hook"],ans:0,topic:"React"},
      {q:"What is createPortal?",opts:["Portal class","Renders children into different DOM node","None","Modal class"],ans:1,topic:"React"},
      {q:"What is React.lazy?",opts:["None","Lazy loading","Lazy hook","Dynamically imports component for code splitting"],ans:3,topic:"React"},
      {q:"What is Suspense?",opts:["Loading class","Shows fallback while lazy component loads","None","Wait class"],ans:1,topic:"React"},
      {q:"What is React Router?",opts:["Navigation","Router class","None","Library for client-side routing"],ans:3,topic:"React"},
      {q:"What is the CSS box model?",opts:["Color model","Margin + Border + Padding + Content","Box shape","None"],ans:1,topic:"CSS"},
      {q:"What is CSS specificity?",opts:["Color depth","None","Animation speed","Rules for which CSS wins when multiple apply"],ans:3,topic:"CSS"},
      {q:"Difference between == and === in JavaScript?",opts:["=== checks value and type, == only value","=== is slower","None","No difference"],ans:0,topic:"JavaScript"},
      {q:"What is 'undefined' vs 'null' in JS?",opts:["null is error","undefined: not assigned, null: intentionally empty","None","Same thing"],ans:1,topic:"JavaScript"},
      {q:"What is hoisting in JavaScript?",opts:["Declarations moved to top of scope","Variable copying","None","Code lifting"],ans:0,topic:"JavaScript"},
      {q:"What is 'use strict'?",opts:["Strict class","None","Strict import","Enables strict mode — catches more errors"],ans:3,topic:"JavaScript"},
      {q:"What is event bubbling?",opts:["Events propagating from child to parent","Creating events","Blocking events","None"],ans:0,topic:"Events"},
      {q:"What is event capturing?",opts:["Event stop","Events propagating from parent to child","None","Capture class"],ans:1,topic:"Events"},
      {q:"What does stopPropagation() do?",opts:["Stops event","None","Stops event from bubbling/capturing","Removes event"],ans:2,topic:"Events"},
      {q:"What does preventDefault() do?",opts:["None","Stops event","Prevents default browser behavior","Creates event"],ans:2,topic:"Events"},
      {q:"What is a Promise in JavaScript?",opts:["None","Loop","Object representing future async value","Variable"],ans:2,topic:"Async"},
      {q:"What are Promise states?",opts:["None","Pending, Fulfilled, Rejected","Active, Done, Error","Start, End, Error"],ans:1,topic:"Async"},
      {q:"What does async/await do?",opts:["Creates threads","Syntactic sugar for cleaner Promise handling","Makes synchronous","None"],ans:1,topic:"Async"},
      {q:"What is the event loop in JS?",opts:["While loop","For loop","DOM loop","Mechanism handling async code via call stack and queue"],ans:3,topic:"JavaScript"},
      {q:"What is the call stack?",opts:["Async queue","None","Stack of currently executing functions","Function list"],ans:2,topic:"JavaScript"},
      {q:"What is the task queue?",opts:["Microtask","None","Async stack","Queue of callback functions to execute"],ans:3,topic:"JavaScript"},
      {q:"What are microtasks?",opts:["Small tasks","None","Promise callbacks — run before macrotasks","Micro events"],ans:2,topic:"JavaScript"},
      {q:"What is JSON?",opts:["JavaScript Object Notation — data interchange format","JS object","None","Java module"],ans:0,topic:"Data"},
      {q:"What is JSON.stringify()?",opts:["Creates JSON file","Parses JSON","None","Converts JS object to JSON string"],ans:3,topic:"Data"},
      {q:"What is JSON.parse()?",opts:["Creates JSON","None","Stringifies","Converts JSON string to JS object"],ans:3,topic:"Data"},
      {q:"What is localStorage?",opts:["Browser key-value storage persisting across sessions","Cookie","Server storage","Session storage"],ans:0,topic:"Web APIs"},
      {q:"What is sessionStorage?",opts:["Server storage","Local storage","Cookie","Browser key-value storage for single session"],ans:3,topic:"Web APIs"},
      {q:"What is a cookie?",opts:["Small data stored by browser per domain","Cache","Session data","Local storage"],ans:0,topic:"Web APIs"},
      {q:"What is the Fetch API?",opts:["None","Modern way to make HTTP requests","Get URL","Fetch data"],ans:1,topic:"Async"},
      {q:"What is CORS?",opts:["Cross-origin class","None","Cross-Origin Resource Sharing — browser security policy","Custom Origin"],ans:2,topic:"Web Security"},
      {q:"What is XHR?",opts:["XML Handler","XMLHttpRequest — older way to make HTTP requests","X Header Request","None"],ans:1,topic:"Async"},
      {q:"What is REST API?",opts:["Architectural style for HTTP APIs using methods","API type","Rest service","None"],ans:0,topic:"APIs"},
      {q:"What HTTP method creates a resource?",opts:["PUT","DELETE","GET","POST"],ans:3,topic:"APIs"},
      {q:"What HTTP method retrieves a resource?",opts:["POST","DELETE","GET","PUT"],ans:2,topic:"APIs"},
    ],
    advanced:[
      {q:"What is Server-Side Rendering (SSR)?",opts:["Client rendering","Static rendering","None","HTML generated on server before sending to client"],ans:3,topic:"Architecture"},
      {q:"What is Static Site Generation (SSG)?",opts:["HTML pre-generated at build time","None","Server rendering","Dynamic rendering"],ans:0,topic:"Architecture"},
      {q:"What is ISR in Next.js?",opts:["None","Incremental Static Regeneration — rebuild pages on demand","Immediate Static","Incremental Server"],ans:1,topic:"Next.js"},
      {q:"What is hydration?",opts:["Attaching React events to server-rendered HTML","None","SSR only","Adding water"],ans:0,topic:"Next.js"},
      {q:"What is a Service Worker?",opts:["Background script enabling offline/PWA features","None","Backend worker","Database"],ans:0,topic:"PWA"},
      {q:"What is a PWA?",opts:["Progressive Web App","None","None","Web app with native app-like capabilities"],ans:3,topic:"PWA"},
      {q:"What is the Cache API?",opts:["Service worker API for caching requests","None","Browser cache","HTTP cache"],ans:0,topic:"PWA"},
      {q:"What is WebSocket?",opts:["HTTP request","None","Full-duplex real-time communication protocol","Database"],ans:2,topic:"Real-time"},
      {q:"What is Server-Sent Events?",opts:["WebSocket","None","HTTP stream","One-way server to client real-time stream"],ans:3,topic:"Real-time"},
      {q:"What is WebRTC?",opts:["Peer-to-peer browser communication for video/audio","Web RTC class","Web request","None"],ans:0,topic:"Real-time"},
      {q:"What is Tree Shaking?",opts:["None","DOM manipulation","CSS technique","Removing unused code from bundle"],ans:3,topic:"Build"},
      {q:"What is code splitting?",opts:["Lazy loading","Code separation","Splitting bundle into smaller chunks loaded on demand","None"],ans:2,topic:"Build"},
      {q:"What is lazy loading?",opts:["Eager loading","Pre-loading","Loading resources only when needed","None"],ans:2,topic:"Performance"},
      {q:"What is debouncing?",opts:["Rate limiting","None","Delaying function until user stops triggering it","Throttling"],ans:2,topic:"Performance"},
      {q:"What is throttling?",opts:["Limiting function call rate to once per interval","None","Caching","Debouncing"],ans:0,topic:"Performance"},
      {q:"What is memoization in React?",opts:["None","State management","Memory","Caching render to skip unnecessary re-renders"],ans:3,topic:"Performance"},
      {q:"What is virtualization in UI?",opts:["Virtual DOM","Rendering only visible list items","None","DOM caching"],ans:1,topic:"Performance"},
      {q:"What is a Higher Order Component?",opts:["None","Function taking component returning enhanced component","CSS component","Hook"],ans:1,topic:"React Patterns"},
      {q:"What is render props pattern?",opts:["Render function","Sharing code via prop that is a function","None","Prop drilling"],ans:1,topic:"React Patterns"},
      {q:"What is compound component pattern?",opts:["Compound class","Multi-component","None","Components sharing implicit state"],ans:3,topic:"React Patterns"},
      {q:"What is Webpack?",opts:["Database","Module bundler for JS/CSS/assets","None","Testing tool"],ans:1,topic:"Build Tools"},
      {q:"What is Vite?",opts:["Fast build tool using native ES modules","Vite class","None","Build server"],ans:0,topic:"Build Tools"},
      {q:"What is Babel?",opts:["Build tool","JavaScript transpiler for compatibility","Linter","None"],ans:1,topic:"Build Tools"},
      {q:"What is ESLint?",opts:["HTML linter","CSS linter","None","JavaScript linting tool"],ans:3,topic:"Tools"},
      {q:"What is Prettier?",opts:["Code formatter for consistent style","Linter","Bundler","None"],ans:0,topic:"Tools"},
      {q:"What is TypeScript?",opts:["JS variant","Typed superset of JavaScript","Type checker","None"],ans:1,topic:"TypeScript"},
      {q:"What is an interface in TypeScript?",opts:["Type alias","Defines shape of object type","None","Abstract class"],ans:1,topic:"TypeScript"},
      {q:"What is a type alias in TypeScript?",opts:["Alternative name for type","Class","Interface","None"],ans:0,topic:"TypeScript"},
      {q:"What is a generic in TypeScript?",opts:["None","Type parameter for reusable typed code","Template","Generic class"],ans:1,topic:"TypeScript"},
      {q:"What is Next.js?",opts:["React extension","React framework with SSR, SSG, routing","None","Next version"],ans:1,topic:"Next.js"},
      {q:"What is the App Router in Next.js 13+?",opts:["App class","None","Route manager","File-system routing in app/ directory"],ans:3,topic:"Next.js"},
      {q:"What is server component in Next.js?",opts:["Server class","None","Component rendered on server with no JS sent to client","SSR component"],ans:2,topic:"Next.js"},
      {q:"What is client component?",opts:["Server component","Component with interactivity rendered in browser","None","Static component"],ans:1,topic:"Next.js"},
      {q:"What is middleware in Next.js?",opts:["Runs before request is processed","Express middleware","None","DB middleware"],ans:0,topic:"Next.js"},
      {q:"What is SWR?",opts:["Suspense wrapper","None","State wrapper","React hook for data fetching with stale-while-revalidate"],ans:3,topic:"Data Fetching"},
      {q:"What is React Query?",opts:["None","Query class","Powerful data fetching and caching library","Data class"],ans:2,topic:"Data Fetching"},
      {q:"What is GraphQL?",opts:["Graph database","None","Graph query","Query language for APIs — request exactly what you need"],ans:3,topic:"APIs"},
      {q:"What is REST vs GraphQL?",opts:["REST is newer","None","REST fixed endpoints, GraphQL flexible queries","Same thing"],ans:2,topic:"APIs"},
      {q:"What is tRPC?",opts:["Type RPC","TypeScript RPC","None","End-to-end type-safe API without schema"],ans:3,topic:"APIs"},
      {q:"What is Zustand?",opts:["None","Zustand class","State class","Lightweight state management for React"],ans:3,topic:"State Management"},
      {q:"What is Redux?",opts:["Predictable state container with single store","None","Global class","React state"],ans:0,topic:"State Management"},
      {q:"What is Server-Side Rendering (SSR)?",opts:["Client rendering","Static rendering","None","HTML generated on server before sending to client"],ans:3,topic:"Architecture"},
      {q:"What is Static Site Generation (SSG)?",opts:["HTML pre-generated at build time","None","Server rendering","Dynamic rendering"],ans:0,topic:"Architecture"},
      {q:"What is ISR in Next.js?",opts:["None","Incremental Static Regeneration — rebuild pages on demand","Immediate Static","Incremental Server"],ans:1,topic:"Next.js"},
      {q:"What is hydration?",opts:["Attaching React events to server-rendered HTML","None","SSR only","Adding water"],ans:0,topic:"Next.js"},
      {q:"What is a Service Worker?",opts:["Background script enabling offline/PWA features","None","Backend worker","Database"],ans:0,topic:"PWA"},
      {q:"What is a PWA?",opts:["Progressive Web App","None","None","Web app with native app-like capabilities"],ans:3,topic:"PWA"},
      {q:"What is the Cache API?",opts:["Service worker API for caching requests","None","Browser cache","HTTP cache"],ans:0,topic:"PWA"},
      {q:"What is WebSocket?",opts:["HTTP request","None","Full-duplex real-time communication protocol","Database"],ans:2,topic:"Real-time"},
      {q:"What is Server-Sent Events?",opts:["WebSocket","None","HTTP stream","One-way server to client real-time stream"],ans:3,topic:"Real-time"},
      {q:"What is WebRTC?",opts:["Peer-to-peer browser communication for video/audio","Web RTC class","Web request","None"],ans:0,topic:"Real-time"},
      {q:"What is Tree Shaking?",opts:["None","DOM manipulation","CSS technique","Removing unused code from bundle"],ans:3,topic:"Build"},
      {q:"What is code splitting?",opts:["Lazy loading","Code separation","Splitting bundle into smaller chunks loaded on demand","None"],ans:2,topic:"Build"},
      {q:"What is lazy loading?",opts:["Eager loading","Pre-loading","Loading resources only when needed","None"],ans:2,topic:"Performance"},
      {q:"What is debouncing?",opts:["Rate limiting","None","Delaying function until user stops triggering it","Throttling"],ans:2,topic:"Performance"},
      {q:"What is throttling?",opts:["Limiting function call rate to once per interval","None","Caching","Debouncing"],ans:0,topic:"Performance"},
      {q:"What is memoization in React?",opts:["None","State management","Memory","Caching render to skip unnecessary re-renders"],ans:3,topic:"Performance"},
      {q:"What is virtualization in UI?",opts:["Virtual DOM","Rendering only visible list items","None","DOM caching"],ans:1,topic:"Performance"},
      {q:"What is a Higher Order Component?",opts:["None","Function taking component returning enhanced component","CSS component","Hook"],ans:1,topic:"React Patterns"},
      {q:"What is render props pattern?",opts:["Render function","Sharing code via prop that is a function","None","Prop drilling"],ans:1,topic:"React Patterns"},
      {q:"What is compound component pattern?",opts:["Compound class","Multi-component","None","Components sharing implicit state"],ans:3,topic:"React Patterns"},
      {q:"What is Webpack?",opts:["Database","Module bundler for JS/CSS/assets","None","Testing tool"],ans:1,topic:"Build Tools"},
      {q:"What is Vite?",opts:["Fast build tool using native ES modules","Vite class","None","Build server"],ans:0,topic:"Build Tools"},
      {q:"What is Babel?",opts:["Build tool","JavaScript transpiler for compatibility","Linter","None"],ans:1,topic:"Build Tools"},
      {q:"What is ESLint?",opts:["HTML linter","CSS linter","None","JavaScript linting tool"],ans:3,topic:"Tools"},
      {q:"What is Prettier?",opts:["Code formatter for consistent style","Linter","Bundler","None"],ans:0,topic:"Tools"},
      {q:"What is TypeScript?",opts:["JS variant","Typed superset of JavaScript","Type checker","None"],ans:1,topic:"TypeScript"},
      {q:"What is an interface in TypeScript?",opts:["Type alias","Defines shape of object type","None","Abstract class"],ans:1,topic:"TypeScript"},
      {q:"What is a type alias in TypeScript?",opts:["Alternative name for type","Class","Interface","None"],ans:0,topic:"TypeScript"},
      {q:"What is a generic in TypeScript?",opts:["None","Type parameter for reusable typed code","Template","Generic class"],ans:1,topic:"TypeScript"},
      {q:"What is Next.js?",opts:["React extension","React framework with SSR, SSG, routing","None","Next version"],ans:1,topic:"Next.js"},
      {q:"What is the App Router in Next.js 13+?",opts:["App class","None","Route manager","File-system routing in app/ directory"],ans:3,topic:"Next.js"},
      {q:"What is server component in Next.js?",opts:["Server class","None","Component rendered on server with no JS sent to client","SSR component"],ans:2,topic:"Next.js"},
      {q:"What is client component?",opts:["Server component","Component with interactivity rendered in browser","None","Static component"],ans:1,topic:"Next.js"},
      {q:"What is middleware in Next.js?",opts:["Runs before request is processed","Express middleware","None","DB middleware"],ans:0,topic:"Next.js"},
      {q:"What is SWR?",opts:["Suspense wrapper","None","State wrapper","React hook for data fetching with stale-while-revalidate"],ans:3,topic:"Data Fetching"},
      {q:"What is React Query?",opts:["None","Query class","Powerful data fetching and caching library","Data class"],ans:2,topic:"Data Fetching"},
      {q:"What is GraphQL?",opts:["Graph database","None","Graph query","Query language for APIs — request exactly what you need"],ans:3,topic:"APIs"},
      {q:"What is REST vs GraphQL?",opts:["REST is newer","None","REST fixed endpoints, GraphQL flexible queries","Same thing"],ans:2,topic:"APIs"},
      {q:"What is tRPC?",opts:["Type RPC","TypeScript RPC","None","End-to-end type-safe API without schema"],ans:3,topic:"APIs"},
      {q:"What is Zustand?",opts:["None","Zustand class","State class","Lightweight state management for React"],ans:3,topic:"State Management"},
      {q:"What is Redux?",opts:["Predictable state container with single store","None","Global class","React state"],ans:0,topic:"State Management"},
      {q:"What is Server-Side Rendering (SSR)?",opts:["Client rendering","Static rendering","None","HTML generated on server before sending to client"],ans:3,topic:"Architecture"},
      {q:"What is Static Site Generation (SSG)?",opts:["HTML pre-generated at build time","None","Server rendering","Dynamic rendering"],ans:0,topic:"Architecture"},
      {q:"What is ISR in Next.js?",opts:["None","Incremental Static Regeneration — rebuild pages on demand","Immediate Static","Incremental Server"],ans:1,topic:"Next.js"},
      {q:"What is hydration?",opts:["Attaching React events to server-rendered HTML","None","SSR only","Adding water"],ans:0,topic:"Next.js"},
      {q:"What is a Service Worker?",opts:["Background script enabling offline/PWA features","None","Backend worker","Database"],ans:0,topic:"PWA"},
      {q:"What is a PWA?",opts:["Progressive Web App","None","None","Web app with native app-like capabilities"],ans:3,topic:"PWA"},
      {q:"What is the Cache API?",opts:["Service worker API for caching requests","None","Browser cache","HTTP cache"],ans:0,topic:"PWA"},
      {q:"What is WebSocket?",opts:["HTTP request","None","Full-duplex real-time communication protocol","Database"],ans:2,topic:"Real-time"},
      {q:"What is Server-Sent Events?",opts:["WebSocket","None","HTTP stream","One-way server to client real-time stream"],ans:3,topic:"Real-time"},
      {q:"What is WebRTC?",opts:["Peer-to-peer browser communication for video/audio","Web RTC class","Web request","None"],ans:0,topic:"Real-time"},
      {q:"What is Tree Shaking?",opts:["None","DOM manipulation","CSS technique","Removing unused code from bundle"],ans:3,topic:"Build"},
      {q:"What is code splitting?",opts:["Lazy loading","Code separation","Splitting bundle into smaller chunks loaded on demand","None"],ans:2,topic:"Build"},
      {q:"What is lazy loading?",opts:["Eager loading","Pre-loading","Loading resources only when needed","None"],ans:2,topic:"Performance"},
      {q:"What is debouncing?",opts:["Rate limiting","None","Delaying function until user stops triggering it","Throttling"],ans:2,topic:"Performance"},
      {q:"What is throttling?",opts:["Limiting function call rate to once per interval","None","Caching","Debouncing"],ans:0,topic:"Performance"},
      {q:"What is memoization in React?",opts:["None","State management","Memory","Caching render to skip unnecessary re-renders"],ans:3,topic:"Performance"},
      {q:"What is virtualization in UI?",opts:["Virtual DOM","Rendering only visible list items","None","DOM caching"],ans:1,topic:"Performance"},
      {q:"What is a Higher Order Component?",opts:["None","Function taking component returning enhanced component","CSS component","Hook"],ans:1,topic:"React Patterns"},
      {q:"What is render props pattern?",opts:["Render function","Sharing code via prop that is a function","None","Prop drilling"],ans:1,topic:"React Patterns"},
      {q:"What is compound component pattern?",opts:["Compound class","Multi-component","None","Components sharing implicit state"],ans:3,topic:"React Patterns"},
      {q:"What is Webpack?",opts:["Database","Module bundler for JS/CSS/assets","None","Testing tool"],ans:1,topic:"Build Tools"},
      {q:"What is Vite?",opts:["Fast build tool using native ES modules","Vite class","None","Build server"],ans:0,topic:"Build Tools"},
      {q:"What is Babel?",opts:["Build tool","JavaScript transpiler for compatibility","Linter","None"],ans:1,topic:"Build Tools"},
      {q:"What is ESLint?",opts:["HTML linter","CSS linter","None","JavaScript linting tool"],ans:3,topic:"Tools"},
      {q:"What is Prettier?",opts:["Code formatter for consistent style","Linter","Bundler","None"],ans:0,topic:"Tools"},
      {q:"What is TypeScript?",opts:["JS variant","Typed superset of JavaScript","Type checker","None"],ans:1,topic:"TypeScript"},
      {q:"What is an interface in TypeScript?",opts:["Type alias","Defines shape of object type","None","Abstract class"],ans:1,topic:"TypeScript"},
      {q:"What is a type alias in TypeScript?",opts:["Alternative name for type","Class","Interface","None"],ans:0,topic:"TypeScript"},
      {q:"What is a generic in TypeScript?",opts:["None","Type parameter for reusable typed code","Template","Generic class"],ans:1,topic:"TypeScript"},
      {q:"What is Next.js?",opts:["React extension","React framework with SSR, SSG, routing","None","Next version"],ans:1,topic:"Next.js"},
      {q:"What is the App Router in Next.js 13+?",opts:["App class","None","Route manager","File-system routing in app/ directory"],ans:3,topic:"Next.js"},
      {q:"What is server component in Next.js?",opts:["Server class","None","Component rendered on server with no JS sent to client","SSR component"],ans:2,topic:"Next.js"},
      {q:"What is client component?",opts:["Server component","Component with interactivity rendered in browser","None","Static component"],ans:1,topic:"Next.js"},
      {q:"What is middleware in Next.js?",opts:["Runs before request is processed","Express middleware","None","DB middleware"],ans:0,topic:"Next.js"},
      {q:"What is SWR?",opts:["Suspense wrapper","None","State wrapper","React hook for data fetching with stale-while-revalidate"],ans:3,topic:"Data Fetching"},
      {q:"What is React Query?",opts:["None","Query class","Powerful data fetching and caching library","Data class"],ans:2,topic:"Data Fetching"},
      {q:"What is GraphQL?",opts:["Graph database","None","Graph query","Query language for APIs — request exactly what you need"],ans:3,topic:"APIs"},
      {q:"What is REST vs GraphQL?",opts:["REST is newer","None","REST fixed endpoints, GraphQL flexible queries","Same thing"],ans:2,topic:"APIs"},
      {q:"What is tRPC?",opts:["Type RPC","TypeScript RPC","None","End-to-end type-safe API without schema"],ans:3,topic:"APIs"},
      {q:"What is Zustand?",opts:["None","Zustand class","State class","Lightweight state management for React"],ans:3,topic:"State Management"},
      {q:"What is Redux?",opts:["Predictable state container with single store","None","Global class","React state"],ans:0,topic:"State Management"},
      {q:"What is Server-Side Rendering (SSR)?",opts:["Client rendering","Static rendering","None","HTML generated on server before sending to client"],ans:3,topic:"Architecture"},
      {q:"What is Static Site Generation (SSG)?",opts:["HTML pre-generated at build time","None","Server rendering","Dynamic rendering"],ans:0,topic:"Architecture"},
      {q:"What is ISR in Next.js?",opts:["None","Incremental Static Regeneration — rebuild pages on demand","Immediate Static","Incremental Server"],ans:1,topic:"Next.js"},
      {q:"What is hydration?",opts:["Attaching React events to server-rendered HTML","None","SSR only","Adding water"],ans:0,topic:"Next.js"},
      {q:"What is a Service Worker?",opts:["Background script enabling offline/PWA features","None","Backend worker","Database"],ans:0,topic:"PWA"},
      {q:"What is a PWA?",opts:["Progressive Web App","None","None","Web app with native app-like capabilities"],ans:3,topic:"PWA"},
      {q:"What is the Cache API?",opts:["Service worker API for caching requests","None","Browser cache","HTTP cache"],ans:0,topic:"PWA"},
      {q:"What is WebSocket?",opts:["HTTP request","None","Full-duplex real-time communication protocol","Database"],ans:2,topic:"Real-time"},
      {q:"What is Server-Sent Events?",opts:["WebSocket","None","HTTP stream","One-way server to client real-time stream"],ans:3,topic:"Real-time"},
      {q:"What is WebRTC?",opts:["Peer-to-peer browser communication for video/audio","Web RTC class","Web request","None"],ans:0,topic:"Real-time"},
      {q:"What is Tree Shaking?",opts:["None","DOM manipulation","CSS technique","Removing unused code from bundle"],ans:3,topic:"Build"},
      {q:"What is code splitting?",opts:["Lazy loading","Code separation","Splitting bundle into smaller chunks loaded on demand","None"],ans:2,topic:"Build"},
      {q:"What is lazy loading?",opts:["Eager loading","Pre-loading","Loading resources only when needed","None"],ans:2,topic:"Performance"},
      {q:"What is debouncing?",opts:["Rate limiting","None","Delaying function until user stops triggering it","Throttling"],ans:2,topic:"Performance"},
      {q:"What is throttling?",opts:["Limiting function call rate to once per interval","None","Caching","Debouncing"],ans:0,topic:"Performance"},
      {q:"What is memoization in React?",opts:["None","State management","Memory","Caching render to skip unnecessary re-renders"],ans:3,topic:"Performance"},
      {q:"What is virtualization in UI?",opts:["Virtual DOM","Rendering only visible list items","None","DOM caching"],ans:1,topic:"Performance"},
      {q:"What is a Higher Order Component?",opts:["None","Function taking component returning enhanced component","CSS component","Hook"],ans:1,topic:"React Patterns"},
      {q:"What is render props pattern?",opts:["Render function","Sharing code via prop that is a function","None","Prop drilling"],ans:1,topic:"React Patterns"},
      {q:"What is compound component pattern?",opts:["Compound class","Multi-component","None","Components sharing implicit state"],ans:3,topic:"React Patterns"},
      {q:"What is Webpack?",opts:["Database","Module bundler for JS/CSS/assets","None","Testing tool"],ans:1,topic:"Build Tools"},
      {q:"What is Vite?",opts:["Fast build tool using native ES modules","Vite class","None","Build server"],ans:0,topic:"Build Tools"},
      {q:"What is Babel?",opts:["Build tool","JavaScript transpiler for compatibility","Linter","None"],ans:1,topic:"Build Tools"},
      {q:"What is ESLint?",opts:["HTML linter","CSS linter","None","JavaScript linting tool"],ans:3,topic:"Tools"},
      {q:"What is Prettier?",opts:["Code formatter for consistent style","Linter","Bundler","None"],ans:0,topic:"Tools"},
      {q:"What is TypeScript?",opts:["JS variant","Typed superset of JavaScript","Type checker","None"],ans:1,topic:"TypeScript"},
      {q:"What is an interface in TypeScript?",opts:["Type alias","Defines shape of object type","None","Abstract class"],ans:1,topic:"TypeScript"},
      {q:"What is a type alias in TypeScript?",opts:["Alternative name for type","Class","Interface","None"],ans:0,topic:"TypeScript"},
      {q:"What is a generic in TypeScript?",opts:["None","Type parameter for reusable typed code","Template","Generic class"],ans:1,topic:"TypeScript"},
      {q:"What is Next.js?",opts:["React extension","React framework with SSR, SSG, routing","None","Next version"],ans:1,topic:"Next.js"},
      {q:"What is the App Router in Next.js 13+?",opts:["App class","None","Route manager","File-system routing in app/ directory"],ans:3,topic:"Next.js"},
      {q:"What is server component in Next.js?",opts:["Server class","None","Component rendered on server with no JS sent to client","SSR component"],ans:2,topic:"Next.js"},
      {q:"What is client component?",opts:["Server component","Component with interactivity rendered in browser","None","Static component"],ans:1,topic:"Next.js"},
      {q:"What is middleware in Next.js?",opts:["Runs before request is processed","Express middleware","None","DB middleware"],ans:0,topic:"Next.js"},
      {q:"What is SWR?",opts:["Suspense wrapper","None","State wrapper","React hook for data fetching with stale-while-revalidate"],ans:3,topic:"Data Fetching"},
      {q:"What is React Query?",opts:["None","Query class","Powerful data fetching and caching library","Data class"],ans:2,topic:"Data Fetching"},
      {q:"What is GraphQL?",opts:["Graph database","None","Graph query","Query language for APIs — request exactly what you need"],ans:3,topic:"APIs"},
      {q:"What is REST vs GraphQL?",opts:["REST is newer","None","REST fixed endpoints, GraphQL flexible queries","Same thing"],ans:2,topic:"APIs"},
      {q:"What is tRPC?",opts:["Type RPC","TypeScript RPC","None","End-to-end type-safe API without schema"],ans:3,topic:"APIs"},
      {q:"What is Zustand?",opts:["None","Zustand class","State class","Lightweight state management for React"],ans:3,topic:"State Management"},
      {q:"What is Redux?",opts:["Predictable state container with single store","None","Global class","React state"],ans:0,topic:"State Management"},
      {q:"What is Server-Side Rendering (SSR)?",opts:["Client rendering","Static rendering","None","HTML generated on server before sending to client"],ans:3,topic:"Architecture"},
      {q:"What is Static Site Generation (SSG)?",opts:["HTML pre-generated at build time","None","Server rendering","Dynamic rendering"],ans:0,topic:"Architecture"},
      {q:"What is ISR in Next.js?",opts:["None","Incremental Static Regeneration — rebuild pages on demand","Immediate Static","Incremental Server"],ans:1,topic:"Next.js"},
      {q:"What is hydration?",opts:["Attaching React events to server-rendered HTML","None","SSR only","Adding water"],ans:0,topic:"Next.js"},
      {q:"What is a Service Worker?",opts:["Background script enabling offline/PWA features","None","Backend worker","Database"],ans:0,topic:"PWA"},
      {q:"What is a PWA?",opts:["Progressive Web App","None","None","Web app with native app-like capabilities"],ans:3,topic:"PWA"},
      {q:"What is the Cache API?",opts:["Service worker API for caching requests","None","Browser cache","HTTP cache"],ans:0,topic:"PWA"},
      {q:"What is WebSocket?",opts:["HTTP request","None","Full-duplex real-time communication protocol","Database"],ans:2,topic:"Real-time"},
      {q:"What is Server-Sent Events?",opts:["WebSocket","None","HTTP stream","One-way server to client real-time stream"],ans:3,topic:"Real-time"},
      {q:"What is WebRTC?",opts:["Peer-to-peer browser communication for video/audio","Web RTC class","Web request","None"],ans:0,topic:"Real-time"},
      {q:"What is Tree Shaking?",opts:["None","DOM manipulation","CSS technique","Removing unused code from bundle"],ans:3,topic:"Build"},
      {q:"What is code splitting?",opts:["Lazy loading","Code separation","Splitting bundle into smaller chunks loaded on demand","None"],ans:2,topic:"Build"},
      {q:"What is lazy loading?",opts:["Eager loading","Pre-loading","Loading resources only when needed","None"],ans:2,topic:"Performance"},
      {q:"What is debouncing?",opts:["Rate limiting","None","Delaying function until user stops triggering it","Throttling"],ans:2,topic:"Performance"},
      {q:"What is throttling?",opts:["Limiting function call rate to once per interval","None","Caching","Debouncing"],ans:0,topic:"Performance"},
      {q:"What is memoization in React?",opts:["None","State management","Memory","Caching render to skip unnecessary re-renders"],ans:3,topic:"Performance"},
      {q:"What is virtualization in UI?",opts:["Virtual DOM","Rendering only visible list items","None","DOM caching"],ans:1,topic:"Performance"},
      {q:"What is a Higher Order Component?",opts:["None","Function taking component returning enhanced component","CSS component","Hook"],ans:1,topic:"React Patterns"},
      {q:"What is render props pattern?",opts:["Render function","Sharing code via prop that is a function","None","Prop drilling"],ans:1,topic:"React Patterns"},
      {q:"What is compound component pattern?",opts:["Compound class","Multi-component","None","Components sharing implicit state"],ans:3,topic:"React Patterns"},
      {q:"What is Webpack?",opts:["Database","Module bundler for JS/CSS/assets","None","Testing tool"],ans:1,topic:"Build Tools"},
      {q:"What is Vite?",opts:["Fast build tool using native ES modules","Vite class","None","Build server"],ans:0,topic:"Build Tools"},
      {q:"What is Babel?",opts:["Build tool","JavaScript transpiler for compatibility","Linter","None"],ans:1,topic:"Build Tools"},
      {q:"What is ESLint?",opts:["HTML linter","CSS linter","None","JavaScript linting tool"],ans:3,topic:"Tools"},
      {q:"What is Prettier?",opts:["Code formatter for consistent style","Linter","Bundler","None"],ans:0,topic:"Tools"},
      {q:"What is TypeScript?",opts:["JS variant","Typed superset of JavaScript","Type checker","None"],ans:1,topic:"TypeScript"},
      {q:"What is an interface in TypeScript?",opts:["Type alias","Defines shape of object type","None","Abstract class"],ans:1,topic:"TypeScript"},
      {q:"What is a type alias in TypeScript?",opts:["Alternative name for type","Class","Interface","None"],ans:0,topic:"TypeScript"},
      {q:"What is a generic in TypeScript?",opts:["None","Type parameter for reusable typed code","Template","Generic class"],ans:1,topic:"TypeScript"},
      {q:"What is Next.js?",opts:["React extension","React framework with SSR, SSG, routing","None","Next version"],ans:1,topic:"Next.js"},
      {q:"What is the App Router in Next.js 13+?",opts:["App class","None","Route manager","File-system routing in app/ directory"],ans:3,topic:"Next.js"},
      {q:"What is server component in Next.js?",opts:["Server class","None","Component rendered on server with no JS sent to client","SSR component"],ans:2,topic:"Next.js"},
      {q:"What is client component?",opts:["Server component","Component with interactivity rendered in browser","None","Static component"],ans:1,topic:"Next.js"},
      {q:"What is middleware in Next.js?",opts:["Runs before request is processed","Express middleware","None","DB middleware"],ans:0,topic:"Next.js"},
      {q:"What is SWR?",opts:["Suspense wrapper","None","State wrapper","React hook for data fetching with stale-while-revalidate"],ans:3,topic:"Data Fetching"},
      {q:"What is React Query?",opts:["None","Query class","Powerful data fetching and caching library","Data class"],ans:2,topic:"Data Fetching"},
    ],
  },
  c4:{
    basic:[
      {q:"What is an array?",opts:["None","Dynamic list","Key-value store","Fixed-size collection of same-type elements"],ans:3,topic:"Arrays"},
      {q:"Time complexity of array index access?",opts:["O(n²)","O(1)","O(n)","O(log n)"],ans:1,topic:"Arrays"},
      {q:"What is a stack?",opts:["LIFO — Last In First Out","Sorted list","FIFO — First In First Out","Tree"],ans:0,topic:"Stack"},
      {q:"What is a queue?",opts:["LIFO — Last In First Out","None","Sorted array","FIFO — First In First Out"],ans:3,topic:"Queue"},
      {q:"What is a linked list?",opts:["Nodes connected by pointers","Sorted array","None","Array with pointers"],ans:0,topic:"Linked List"},
      {q:"What is linear search?",opts:["Binary method","Checks each element one by one","Checks middle first","None"],ans:1,topic:"Searching"},
      {q:"Time complexity of linear search?",opts:["O(1)","O(n)","O(n²)","O(log n)"],ans:1,topic:"Searching"},
      {q:"What is binary search?",opts:["Divides sorted array in half each step","Searches all elements","None","Random search"],ans:0,topic:"Searching"},
      {q:"Binary search requires array to be?",opts:["Empty","Sorted","Unsorted","Any order"],ans:1,topic:"Searching"},
      {q:"What is bubble sort?",opts:["Divides array","Repeatedly swaps adjacent elements if out of order","None","Selects minimum"],ans:1,topic:"Sorting"},
      {q:"Worst case of bubble sort?",opts:["O(1)","O(n log n)","O(n²)","O(n)"],ans:2,topic:"Sorting"},
      {q:"What is a tree?",opts:["None","Linked list","Array","Hierarchical data structure with nodes and edges"],ans:3,topic:"Trees"},
      {q:"What is a binary tree?",opts:["None","Linked list","Each node has at most 2 children","Two arrays"],ans:2,topic:"Trees"},
      {q:"What is the root of a tree?",opts:["None","Leaf node","Last node","Topmost node"],ans:3,topic:"Trees"},
      {q:"What is a leaf node?",opts:["Root node","Middle node","Node with no children","None"],ans:2,topic:"Trees"},
      {q:"What is recursion?",opts:["Function calling itself","For loop","None","While loop"],ans:0,topic:"Recursion"},
      {q:"What is the base case in recursion?",opts:["Middle call","None","Condition that stops recursion","First call"],ans:2,topic:"Recursion"},
      {q:"What is a hash table?",opts:["Key-value store using hash function for O(1) lookup","Tree","Sorted array","None"],ans:0,topic:"Hashing"},
      {q:"What is a graph?",opts:["Chart","Array","Non-linear structure with vertices and edges","None"],ans:2,topic:"Graphs"},
      {q:"What is BFS?",opts:["Breadth-First Search — explores level by level","Binary First Search","None","Depth search"],ans:0,topic:"Graphs"},
      {q:"What is DFS?",opts:["None","Breadth search","Depth-First Search — explores as far as possible","Default First Search"],ans:2,topic:"Graphs"},
      {q:"What is a complete binary tree?",opts:["Perfect tree","Full tree","None","All levels full except possibly last filled left-right"],ans:3,topic:"Trees"},
      {q:"What is a full binary tree?",opts:["Every node has 0 or 2 children","Complete tree","Perfect tree","None"],ans:0,topic:"Trees"},
      {q:"What is a perfect binary tree?",opts:["Full tree","All internal nodes have 2 children and all leaves same level","None","Complete tree"],ans:1,topic:"Trees"},
      {q:"What is height of binary tree?",opts:["Level count","None","Node count","Longest path from root to leaf"],ans:3,topic:"Trees"},
      {q:"What is depth of a node?",opts:["Distance from root to node","Distance to leaf","None","Node level"],ans:0,topic:"Trees"},
      {q:"What is level of a node?",opts:["Depth+1","Number of edges from root (root=0)","Height of node","None"],ans:1,topic:"Trees"},
      {q:"What is insertion sort?",opts:["Divides array","Selects min","Builds sorted array one element at a time","None"],ans:2,topic:"Sorting"},
      {q:"Best case of insertion sort?",opts:["O(n) — already sorted","O(n²)","O(1)","O(n log n)"],ans:0,topic:"Sorting"},
      {q:"What is selection sort?",opts:["None","Divides array","Swaps adjacent","Finds minimum and places at correct position"],ans:3,topic:"Sorting"},
      {q:"Time complexity of selection sort?",opts:["O(n)","O(n²) always","O(1)","O(n log n)"],ans:1,topic:"Sorting"},
      {q:"What is a stable sort?",opts:["Stable memory","None","Equal elements maintain relative order","Fast sort"],ans:2,topic:"Sorting"},
      {q:"Is bubble sort stable?",opts:["Yes","Depends","No","Sometimes"],ans:0,topic:"Sorting"},
      {q:"What is a priority queue?",opts:["Ordered queue","None","Queue serving highest priority element first","FIFO queue"],ans:2,topic:"Data Structures"},
      {q:"What is a heap?",opts:["Random tree","Sorted tree","None","Complete binary tree with heap property"],ans:3,topic:"Trees"},
      {q:"What is a max-heap?",opts:["Parent >= all children","None","Random order","Parent <= children"],ans:0,topic:"Trees"},
      {q:"What is a min-heap?",opts:["Parent <= all children","Parent >= children","Random order","None"],ans:0,topic:"Trees"},
      {q:"What is heap property?",opts:["None","Parent has priority over children","Heap is complete","Heap is sorted"],ans:1,topic:"Trees"},
      {q:"What is heapify?",opts:["Process of making tree satisfy heap property","Heap creation","None","Heap sort"],ans:0,topic:"Trees"},
      {q:"Time to build heap from array?",opts:["O(n)","O(n²)","O(log n)","O(n log n)"],ans:0,topic:"Trees"},
      {q:"What is a stack overflow?",opts:["Recursion too deep exceeds call stack","Stack is full","None","Memory error"],ans:0,topic:"Recursion"},
      {q:"What is tail recursion?",opts:["None","Recursive call is last operation in function","First recursion","Any recursion"],ans:1,topic:"Recursion"},
      {q:"What is memoization?",opts:["None","Caching recursive results to avoid recomputation","Memory management","Recursion type"],ans:1,topic:"Optimization"},
      {q:"What is a collision in hashing?",opts:["Two keys map to same hash bucket","Key not found","Table overflow","None"],ans:0,topic:"Hashing"},
      {q:"What is chaining in hash tables?",opts:["None","Array chaining","None","Linked list at each bucket for collisions"],ans:3,topic:"Hashing"},
      {q:"What is open addressing?",opts:["Open bucket","Finding another slot in same table on collision","None","Linear search"],ans:1,topic:"Hashing"},
      {q:"What is linear probing?",opts:["None","Linear hash","Probe list","Check next slot sequentially on collision"],ans:3,topic:"Hashing"},
      {q:"What is a doubly linked list?",opts:["Each node has next and prev pointers","None","None","Two lists"],ans:0,topic:"Linked List"},
      {q:"What is a circular linked list?",opts:["None","Last node points back to first node","Two heads","Loop array"],ans:1,topic:"Linked List"},
      {q:"What is sentinel node?",opts:["First node","None","Last node","Dummy node simplifying edge cases"],ans:3,topic:"Linked List"},
      {q:"How to detect cycle in linked list?",opts:["BFS","Hash set only","Floyd's fast-slow pointer algorithm","DFS"],ans:2,topic:"Linked List"},
      {q:"What is two-pointer technique?",opts:["None","Two indices to solve array problems efficiently","Two arrays","Two loops"],ans:1,topic:"Techniques"},
      {q:"What is sliding window?",opts:["Animation","Maintain window to avoid O(n²) subarray problems","Two pointers","None"],ans:1,topic:"Techniques"},
      {q:"What is prefix sum?",opts:["Precomputed cumulative sum for O(1) range queries","First sum","Prefix array","None"],ans:0,topic:"Techniques"},
      {q:"What is difference array?",opts:["Diff technique","None","Array difference","Enables O(1) range updates"],ans:3,topic:"Techniques"},
      {q:"What is divide and conquer?",opts:["Break into subproblems, solve, combine","None","DP","Greedy"],ans:0,topic:"Paradigms"},
      {q:"What is greedy algorithm?",opts:["Makes locally optimal choice at each step","Brute force","DP","None"],ans:0,topic:"Paradigms"},
      {q:"What is dynamic programming?",opts:["None","Greedy","Optimal substructure + overlapping subproblems","Recursion"],ans:2,topic:"Paradigms"},
      {q:"What is backtracking?",opts:["Try all possibilities, undo on failure","DP","None","Greedy"],ans:0,topic:"Paradigms"},
      {q:"What is amortized analysis?",opts:["Average cost per operation over a sequence","Worst case","None","Best case"],ans:0,topic:"Complexity"},
      {q:"What is space complexity?",opts:["CPU usage","None","Memory used by algorithm","Time usage"],ans:2,topic:"Complexity"},
      {q:"What is auxiliary space?",opts:["None","Total space","Extra space beyond input","Input space"],ans:2,topic:"Complexity"},
      {q:"Best, average, worst case of quicksort?",opts:["Always O(n log n)","O(n log n), O(n log n), O(n²)","None","Always O(n²)"],ans:1,topic:"Sorting"},
      {q:"What is merge sort time complexity?",opts:["O(n log n) always","O(n)","O(n²)","O(log n)"],ans:0,topic:"Sorting"},
      {q:"What is merge sort space complexity?",opts:["O(n) auxiliary","O(1)","O(n²)","O(log n)"],ans:0,topic:"Sorting"},
      {q:"What is counting sort?",opts:["None","Comparison sort","Non-comparison sort using count array","Radix sort"],ans:2,topic:"Sorting"},
      {q:"What is radix sort?",opts:["Radix tree sort","Sorts digit by digit, non-comparison","Counting variant","None"],ans:1,topic:"Sorting"},
      {q:"What is bucket sort?",opts:["None","Bucket tree","Distributes elements into buckets then sorts","Bucket hash"],ans:2,topic:"Sorting"},
      {q:"When is counting sort efficient?",opts:["When k is large","Never","Always","When range of values k is small relative to n"],ans:3,topic:"Sorting"},
      {q:"What is an adjacency matrix?",opts:["2D array representing graph edges","Graph matrix","None","Edge list"],ans:0,topic:"Graphs"},
      {q:"What is an adjacency list?",opts:["Edge matrix","None","List of neighbors for each vertex","Node list"],ans:2,topic:"Graphs"},
      {q:"Space complexity of adjacency matrix?",opts:["O(V+E)","O(V)","O(V²)","O(E)"],ans:2,topic:"Graphs"},
      {q:"Space complexity of adjacency list?",opts:["O(V)","O(E)","O(V+E)","O(V²)"],ans:2,topic:"Graphs"},
      {q:"What is a directed graph?",opts:["None","Edges have direction","Weighted graph","Undirected graph"],ans:1,topic:"Graphs"},
      {q:"What is a weighted graph?",opts:["Directed graph","Unweighted graph","None","Edges have weights/costs"],ans:3,topic:"Graphs"},
      {q:"What is a DAG?",opts:["Directed Acyclic Graph — no cycles","Directed All Graph","None","Data Array Graph"],ans:0,topic:"Graphs"},
      {q:"What is topological sort?",opts:["Graph sort","None","Node order","Linear ordering of DAG respecting edge direction"],ans:3,topic:"Graphs"},
      {q:"What is Euler path?",opts:["Euler circuit","None","Hamilton path","Visits every edge exactly once"],ans:3,topic:"Graphs"},
      {q:"What is Hamiltonian path?",opts:["Visits every vertex exactly once","Euler path","Euler circuit","None"],ans:0,topic:"Graphs"},
      {q:"What is a spanning tree?",opts:["Full graph","Subgraph connecting all vertices with minimum edges","Random tree","None"],ans:1,topic:"Graphs"},
      {q:"What is MST?",opts:["Minimum Spanning Tree — min total edge weight","None","Maximum spanning tree","Mini spanning"],ans:0,topic:"Graphs"},
      {q:"What is Kruskal's algorithm?",opts:["Shortest path","DFS","None","Greedy MST — pick min weight edges avoiding cycles"],ans:3,topic:"Graphs"},
      {q:"What is Prim's algorithm?",opts:["BFS","Shortest path","None","Greedy MST — grow tree one vertex at a time"],ans:3,topic:"Graphs"},
      {q:"What is Dijkstra's algorithm?",opts:["DFS","None","Greedy shortest path with non-negative weights","MST algorithm"],ans:2,topic:"Graphs"},
      {q:"Bellman-Ford handles negative weights?",opts:["Sometimes","No","Yes","Only positive"],ans:2,topic:"Graphs"},
      {q:"Floyd-Warshall finds?",opts:["MST","Single source","Topological sort","All-pairs shortest paths"],ans:3,topic:"Graphs"},
      {q:"What is SCC?",opts:["None","Sub component","Single connected","Strongly Connected Component — mutual reachability"],ans:3,topic:"Graphs"},
      {q:"Tarjan's algorithm finds?",opts:["SCCs in O(V+E)","MST","Shortest path","Topological sort"],ans:0,topic:"Graphs"},
      {q:"Kosaraju's algorithm uses?",opts:["Two DFS passes to find SCCs","None","BFS","One DFS"],ans:0,topic:"Graphs"},
      {q:"What is articulation point?",opts:["Bridge point","None","Removing it disconnects the graph","Key node"],ans:2,topic:"Graphs"},
      {q:"What is a bridge in graphs?",opts:["None","Bridge node","Edge whose removal disconnects graph","Key edge"],ans:2,topic:"Graphs"},
      {q:"What is an array?",opts:["None","Dynamic list","Key-value store","Fixed-size collection of same-type elements"],ans:3,topic:"Arrays"},
      {q:"Time complexity of array index access?",opts:["O(n²)","O(1)","O(n)","O(log n)"],ans:1,topic:"Arrays"},
      {q:"What is a stack?",opts:["LIFO — Last In First Out","Sorted list","FIFO — First In First Out","Tree"],ans:0,topic:"Stack"},
      {q:"What is a queue?",opts:["LIFO — Last In First Out","None","Sorted array","FIFO — First In First Out"],ans:3,topic:"Queue"},
      {q:"What is a linked list?",opts:["Nodes connected by pointers","Sorted array","None","Array with pointers"],ans:0,topic:"Linked List"},
      {q:"What is linear search?",opts:["Binary method","Checks each element one by one","Checks middle first","None"],ans:1,topic:"Searching"},
      {q:"Time complexity of linear search?",opts:["O(1)","O(n)","O(n²)","O(log n)"],ans:1,topic:"Searching"},
      {q:"What is binary search?",opts:["Divides sorted array in half each step","Searches all elements","None","Random search"],ans:0,topic:"Searching"},
      {q:"Binary search requires array to be?",opts:["Empty","Sorted","Unsorted","Any order"],ans:1,topic:"Searching"},
      {q:"What is bubble sort?",opts:["Divides array","Repeatedly swaps adjacent elements if out of order","None","Selects minimum"],ans:1,topic:"Sorting"},
      {q:"Worst case of bubble sort?",opts:["O(1)","O(n log n)","O(n²)","O(n)"],ans:2,topic:"Sorting"},
      {q:"What is a tree?",opts:["None","Linked list","Array","Hierarchical data structure with nodes and edges"],ans:3,topic:"Trees"},
      {q:"What is a binary tree?",opts:["None","Linked list","Each node has at most 2 children","Two arrays"],ans:2,topic:"Trees"},
      {q:"What is the root of a tree?",opts:["None","Leaf node","Last node","Topmost node"],ans:3,topic:"Trees"},
      {q:"What is a leaf node?",opts:["Root node","Middle node","Node with no children","None"],ans:2,topic:"Trees"},
      {q:"What is recursion?",opts:["Function calling itself","For loop","None","While loop"],ans:0,topic:"Recursion"},
      {q:"What is the base case in recursion?",opts:["Middle call","None","Condition that stops recursion","First call"],ans:2,topic:"Recursion"},
      {q:"What is a hash table?",opts:["Key-value store using hash function for O(1) lookup","Tree","Sorted array","None"],ans:0,topic:"Hashing"},
      {q:"What is a graph?",opts:["Chart","Array","Non-linear structure with vertices and edges","None"],ans:2,topic:"Graphs"},
      {q:"What is BFS?",opts:["Breadth-First Search — explores level by level","Binary First Search","None","Depth search"],ans:0,topic:"Graphs"},
      {q:"What is DFS?",opts:["None","Breadth search","Depth-First Search — explores as far as possible","Default First Search"],ans:2,topic:"Graphs"},
      {q:"What is a complete binary tree?",opts:["Perfect tree","Full tree","None","All levels full except possibly last filled left-right"],ans:3,topic:"Trees"},
      {q:"What is a full binary tree?",opts:["Every node has 0 or 2 children","Complete tree","Perfect tree","None"],ans:0,topic:"Trees"},
      {q:"What is a perfect binary tree?",opts:["Full tree","All internal nodes have 2 children and all leaves same level","None","Complete tree"],ans:1,topic:"Trees"},
      {q:"What is height of binary tree?",opts:["Level count","None","Node count","Longest path from root to leaf"],ans:3,topic:"Trees"},
      {q:"What is depth of a node?",opts:["Distance from root to node","Distance to leaf","None","Node level"],ans:0,topic:"Trees"},
      {q:"What is level of a node?",opts:["Depth+1","Number of edges from root (root=0)","Height of node","None"],ans:1,topic:"Trees"},
      {q:"What is insertion sort?",opts:["Divides array","Selects min","Builds sorted array one element at a time","None"],ans:2,topic:"Sorting"},
      {q:"Best case of insertion sort?",opts:["O(n) — already sorted","O(n²)","O(1)","O(n log n)"],ans:0,topic:"Sorting"},
      {q:"What is selection sort?",opts:["None","Divides array","Swaps adjacent","Finds minimum and places at correct position"],ans:3,topic:"Sorting"},
      {q:"Time complexity of selection sort?",opts:["O(n)","O(n²) always","O(1)","O(n log n)"],ans:1,topic:"Sorting"},
      {q:"What is a stable sort?",opts:["Stable memory","None","Equal elements maintain relative order","Fast sort"],ans:2,topic:"Sorting"},
      {q:"Is bubble sort stable?",opts:["Yes","Depends","No","Sometimes"],ans:0,topic:"Sorting"},
      {q:"What is a priority queue?",opts:["Ordered queue","None","Queue serving highest priority element first","FIFO queue"],ans:2,topic:"Data Structures"},
      {q:"What is a heap?",opts:["Random tree","Sorted tree","None","Complete binary tree with heap property"],ans:3,topic:"Trees"},
      {q:"What is a max-heap?",opts:["Parent >= all children","None","Random order","Parent <= children"],ans:0,topic:"Trees"},
      {q:"What is a min-heap?",opts:["Parent <= all children","Parent >= children","Random order","None"],ans:0,topic:"Trees"},
      {q:"What is heap property?",opts:["None","Parent has priority over children","Heap is complete","Heap is sorted"],ans:1,topic:"Trees"},
      {q:"What is heapify?",opts:["Process of making tree satisfy heap property","Heap creation","None","Heap sort"],ans:0,topic:"Trees"},
      {q:"Time to build heap from array?",opts:["O(n)","O(n²)","O(log n)","O(n log n)"],ans:0,topic:"Trees"},
      {q:"What is a stack overflow?",opts:["Recursion too deep exceeds call stack","Stack is full","None","Memory error"],ans:0,topic:"Recursion"},
      {q:"What is tail recursion?",opts:["None","Recursive call is last operation in function","First recursion","Any recursion"],ans:1,topic:"Recursion"},
      {q:"What is memoization?",opts:["None","Caching recursive results to avoid recomputation","Memory management","Recursion type"],ans:1,topic:"Optimization"},
      {q:"What is a collision in hashing?",opts:["Two keys map to same hash bucket","Key not found","Table overflow","None"],ans:0,topic:"Hashing"},
      {q:"What is chaining in hash tables?",opts:["None","Array chaining","None","Linked list at each bucket for collisions"],ans:3,topic:"Hashing"},
      {q:"What is open addressing?",opts:["Open bucket","Finding another slot in same table on collision","None","Linear search"],ans:1,topic:"Hashing"},
      {q:"What is linear probing?",opts:["None","Linear hash","Probe list","Check next slot sequentially on collision"],ans:3,topic:"Hashing"},
      {q:"What is a doubly linked list?",opts:["Each node has next and prev pointers","None","None","Two lists"],ans:0,topic:"Linked List"},
      {q:"What is a circular linked list?",opts:["None","Last node points back to first node","Two heads","Loop array"],ans:1,topic:"Linked List"},
      {q:"What is sentinel node?",opts:["First node","None","Last node","Dummy node simplifying edge cases"],ans:3,topic:"Linked List"},
      {q:"How to detect cycle in linked list?",opts:["BFS","Hash set only","Floyd's fast-slow pointer algorithm","DFS"],ans:2,topic:"Linked List"},
      {q:"What is two-pointer technique?",opts:["None","Two indices to solve array problems efficiently","Two arrays","Two loops"],ans:1,topic:"Techniques"},
      {q:"What is sliding window?",opts:["Animation","Maintain window to avoid O(n²) subarray problems","Two pointers","None"],ans:1,topic:"Techniques"},
      {q:"What is prefix sum?",opts:["Precomputed cumulative sum for O(1) range queries","First sum","Prefix array","None"],ans:0,topic:"Techniques"},
      {q:"What is difference array?",opts:["Diff technique","None","Array difference","Enables O(1) range updates"],ans:3,topic:"Techniques"},
      {q:"What is divide and conquer?",opts:["Break into subproblems, solve, combine","None","DP","Greedy"],ans:0,topic:"Paradigms"},
      {q:"What is greedy algorithm?",opts:["Makes locally optimal choice at each step","Brute force","DP","None"],ans:0,topic:"Paradigms"},
      {q:"What is dynamic programming?",opts:["None","Greedy","Optimal substructure + overlapping subproblems","Recursion"],ans:2,topic:"Paradigms"},
      {q:"What is backtracking?",opts:["Try all possibilities, undo on failure","DP","None","Greedy"],ans:0,topic:"Paradigms"},
      {q:"What is amortized analysis?",opts:["Average cost per operation over a sequence","Worst case","None","Best case"],ans:0,topic:"Complexity"},
      {q:"What is space complexity?",opts:["CPU usage","None","Memory used by algorithm","Time usage"],ans:2,topic:"Complexity"},
      {q:"What is auxiliary space?",opts:["None","Total space","Extra space beyond input","Input space"],ans:2,topic:"Complexity"},
      {q:"Best, average, worst case of quicksort?",opts:["Always O(n log n)","O(n log n), O(n log n), O(n²)","None","Always O(n²)"],ans:1,topic:"Sorting"},
      {q:"What is merge sort time complexity?",opts:["O(n log n) always","O(n)","O(n²)","O(log n)"],ans:0,topic:"Sorting"},
      {q:"What is merge sort space complexity?",opts:["O(n) auxiliary","O(1)","O(n²)","O(log n)"],ans:0,topic:"Sorting"},
      {q:"What is counting sort?",opts:["None","Comparison sort","Non-comparison sort using count array","Radix sort"],ans:2,topic:"Sorting"},
      {q:"What is radix sort?",opts:["Radix tree sort","Sorts digit by digit, non-comparison","Counting variant","None"],ans:1,topic:"Sorting"},
      {q:"What is bucket sort?",opts:["None","Bucket tree","Distributes elements into buckets then sorts","Bucket hash"],ans:2,topic:"Sorting"},
      {q:"When is counting sort efficient?",opts:["When k is large","Never","Always","When range of values k is small relative to n"],ans:3,topic:"Sorting"},
      {q:"What is an adjacency matrix?",opts:["2D array representing graph edges","Graph matrix","None","Edge list"],ans:0,topic:"Graphs"},
      {q:"What is an adjacency list?",opts:["Edge matrix","None","List of neighbors for each vertex","Node list"],ans:2,topic:"Graphs"},
      {q:"Space complexity of adjacency matrix?",opts:["O(V+E)","O(V)","O(V²)","O(E)"],ans:2,topic:"Graphs"},
      {q:"Space complexity of adjacency list?",opts:["O(V)","O(E)","O(V+E)","O(V²)"],ans:2,topic:"Graphs"},
      {q:"What is a directed graph?",opts:["None","Edges have direction","Weighted graph","Undirected graph"],ans:1,topic:"Graphs"},
      {q:"What is a weighted graph?",opts:["Directed graph","Unweighted graph","None","Edges have weights/costs"],ans:3,topic:"Graphs"},
      {q:"What is a DAG?",opts:["Directed Acyclic Graph — no cycles","Directed All Graph","None","Data Array Graph"],ans:0,topic:"Graphs"},
      {q:"What is topological sort?",opts:["Graph sort","None","Node order","Linear ordering of DAG respecting edge direction"],ans:3,topic:"Graphs"},
      {q:"What is Euler path?",opts:["Euler circuit","None","Hamilton path","Visits every edge exactly once"],ans:3,topic:"Graphs"},
      {q:"What is Hamiltonian path?",opts:["Visits every vertex exactly once","Euler path","Euler circuit","None"],ans:0,topic:"Graphs"},
      {q:"What is a spanning tree?",opts:["Full graph","Subgraph connecting all vertices with minimum edges","Random tree","None"],ans:1,topic:"Graphs"},
      {q:"What is MST?",opts:["Minimum Spanning Tree — min total edge weight","None","Maximum spanning tree","Mini spanning"],ans:0,topic:"Graphs"},
      {q:"What is Kruskal's algorithm?",opts:["Shortest path","DFS","None","Greedy MST — pick min weight edges avoiding cycles"],ans:3,topic:"Graphs"},
      {q:"What is Prim's algorithm?",opts:["BFS","Shortest path","None","Greedy MST — grow tree one vertex at a time"],ans:3,topic:"Graphs"},
      {q:"What is Dijkstra's algorithm?",opts:["DFS","None","Greedy shortest path with non-negative weights","MST algorithm"],ans:2,topic:"Graphs"},
      {q:"Bellman-Ford handles negative weights?",opts:["Sometimes","No","Yes","Only positive"],ans:2,topic:"Graphs"},
      {q:"Floyd-Warshall finds?",opts:["MST","Single source","Topological sort","All-pairs shortest paths"],ans:3,topic:"Graphs"},
      {q:"What is SCC?",opts:["None","Sub component","Single connected","Strongly Connected Component — mutual reachability"],ans:3,topic:"Graphs"},
      {q:"Tarjan's algorithm finds?",opts:["SCCs in O(V+E)","MST","Shortest path","Topological sort"],ans:0,topic:"Graphs"},
      {q:"Kosaraju's algorithm uses?",opts:["Two DFS passes to find SCCs","None","BFS","One DFS"],ans:0,topic:"Graphs"},
      {q:"What is articulation point?",opts:["Bridge point","None","Removing it disconnects the graph","Key node"],ans:2,topic:"Graphs"},
      {q:"What is a bridge in graphs?",opts:["None","Bridge node","Edge whose removal disconnects graph","Key edge"],ans:2,topic:"Graphs"},
      {q:"What is an array?",opts:["None","Dynamic list","Key-value store","Fixed-size collection of same-type elements"],ans:3,topic:"Arrays"},
      {q:"Time complexity of array index access?",opts:["O(n²)","O(1)","O(n)","O(log n)"],ans:1,topic:"Arrays"},
      {q:"What is a stack?",opts:["LIFO — Last In First Out","Sorted list","FIFO — First In First Out","Tree"],ans:0,topic:"Stack"},
      {q:"What is a queue?",opts:["LIFO — Last In First Out","None","Sorted array","FIFO — First In First Out"],ans:3,topic:"Queue"},
      {q:"What is a linked list?",opts:["Nodes connected by pointers","Sorted array","None","Array with pointers"],ans:0,topic:"Linked List"},
      {q:"What is linear search?",opts:["Binary method","Checks each element one by one","Checks middle first","None"],ans:1,topic:"Searching"},
      {q:"Time complexity of linear search?",opts:["O(1)","O(n)","O(n²)","O(log n)"],ans:1,topic:"Searching"},
      {q:"What is binary search?",opts:["Divides sorted array in half each step","Searches all elements","None","Random search"],ans:0,topic:"Searching"},
      {q:"Binary search requires array to be?",opts:["Empty","Sorted","Unsorted","Any order"],ans:1,topic:"Searching"},
      {q:"What is bubble sort?",opts:["Divides array","Repeatedly swaps adjacent elements if out of order","None","Selects minimum"],ans:1,topic:"Sorting"},
      {q:"Worst case of bubble sort?",opts:["O(1)","O(n log n)","O(n²)","O(n)"],ans:2,topic:"Sorting"},
      {q:"What is a tree?",opts:["None","Linked list","Array","Hierarchical data structure with nodes and edges"],ans:3,topic:"Trees"},
      {q:"What is a binary tree?",opts:["None","Linked list","Each node has at most 2 children","Two arrays"],ans:2,topic:"Trees"},
      {q:"What is the root of a tree?",opts:["None","Leaf node","Last node","Topmost node"],ans:3,topic:"Trees"},
      {q:"What is a leaf node?",opts:["Root node","Middle node","Node with no children","None"],ans:2,topic:"Trees"},
      {q:"What is recursion?",opts:["Function calling itself","For loop","None","While loop"],ans:0,topic:"Recursion"},
      {q:"What is the base case in recursion?",opts:["Middle call","None","Condition that stops recursion","First call"],ans:2,topic:"Recursion"},
      {q:"What is a hash table?",opts:["Key-value store using hash function for O(1) lookup","Tree","Sorted array","None"],ans:0,topic:"Hashing"},
    ],
    intermediate:[
      {q:"Time complexity of binary search?",opts:["O(n)","O(log n)","O(1)","O(n²)"],ans:1,topic:"Searching"},
      {q:"Merge sort time complexity?",opts:["O(log n)","O(n²)","O(n)","O(n log n) always"],ans:3,topic:"Sorting"},
      {q:"Quick sort average time complexity?",opts:["O(n²)","O(n log n)","O(log n)","O(n)"],ans:1,topic:"Sorting"},
      {q:"What is a BST?",opts:["Left < root < right binary tree","None","Balanced tree","Random binary tree"],ans:0,topic:"Trees"},
      {q:"Inorder traversal of BST gives?",opts:["Sorted ascending order","Random order","Reverse sorted","None"],ans:0,topic:"Trees"},
      {q:"Height of balanced BST with n nodes?",opts:["O(n²)","O(1)","O(n)","O(log n)"],ans:3,topic:"Trees"},
      {q:"BFS uses which data structure?",opts:["Array","Heap","Queue","Stack"],ans:2,topic:"Graphs"},
      {q:"DFS uses which data structure?",opts:["Queue","Heap","Stack or recursion","Array"],ans:2,topic:"Graphs"},
      {q:"What is an AVL tree?",opts:["None","Self-balancing BST with height difference ≤ 1","Any BST","Red-black tree"],ans:1,topic:"Trees"},
      {q:"What is rotation in AVL?",opts:["Operation to rebalance height after insert/delete","Tree rotation","Rotation sort","None"],ans:0,topic:"Trees"},
      {q:"What is a Red-Black tree?",opts:["Colored tree","Self-balancing BST with color properties","None","AVL variant"],ans:1,topic:"Trees"},
      {q:"What is a B-tree?",opts:["Balanced M-ary tree for disk storage","Binary tree","None","B+ tree"],ans:0,topic:"Trees"},
      {q:"What is a trie?",opts:["None","Hash table","Prefix tree for efficient string operations","Tree for numbers"],ans:2,topic:"Advanced DS"},
      {q:"Time to search in trie?",opts:["O(n)","O(L) where L is string length","O(log n)","O(1)"],ans:1,topic:"Advanced DS"},
      {q:"What is a segment tree?",opts:["Tree for range queries and point updates","Segment array","Range array","None"],ans:0,topic:"Advanced DS"},
      {q:"Segment tree query and update time?",opts:["O(n log n)","O(1) query","O(n) update","O(log n) both"],ans:3,topic:"Advanced DS"},
      {q:"What is a Fenwick tree (BIT)?",opts:["Binary tree","Binary Indexed Tree for prefix sum","None","Sorted array"],ans:1,topic:"Advanced DS"},
      {q:"Fenwick tree query time?",opts:["O(n)","O(n log n)","O(log n)","O(1)"],ans:2,topic:"Advanced DS"},
      {q:"What is Union-Find (DSU)?",opts:["Data structure for connected components","Sorting structure","None","Graph traversal"],ans:0,topic:"Advanced DS"},
      {q:"What is path compression in DSU?",opts:["Flattens tree for near O(1) operations","Path finding","Compression algo","None"],ans:0,topic:"Advanced DS"},
      {q:"What is union by rank?",opts:["None","Weight union","Attach smaller tree under larger to keep height low","Random union"],ans:2,topic:"Advanced DS"},
      {q:"DSU amortized complexity with both optimizations?",opts:["O(α(n)) ≈ O(1) practically","O(log n)","O(n)","O(1) exact"],ans:0,topic:"Advanced DS"},
      {q:"What is a sparse table?",opts:["Empty table","None","Sparse array","O(1) range min/max after O(n log n) preprocessing"],ans:3,topic:"Advanced DS"},
      {q:"What is binary lifting?",opts:["Binary jump","None","Ancestor list","Precomputing 2^k ancestors for LCA queries"],ans:3,topic:"Trees"},
      {q:"LCA using binary lifting time?",opts:["O(n)","O(n log n)","O(log n) after O(n log n) preprocessing","O(1)"],ans:2,topic:"Trees"},
      {q:"What is dynamic programming?",opts:["Recursive only","Greedy","Optimal substructure + memoize overlapping subproblems","None"],ans:2,topic:"DP"},
      {q:"What is coin change problem?",opts:["Greedy only","Money problem","Min coins to make amount — classic DP","None"],ans:2,topic:"DP"},
      {q:"What is LCS?",opts:["Shortest common","None","Longest Common Substring","Longest Common Subsequence — same order not contiguous"],ans:3,topic:"DP"},
      {q:"LCS time complexity?",opts:["O(m*n²)","O(m*n)","O(m+n)","O(n)"],ans:1,topic:"DP"},
      {q:"What is LIS?",opts:["Longest Increasing Subsequence","Longest In Sequence","Largest Item","None"],ans:0,topic:"DP"},
      {q:"LIS in O(n log n) uses?",opts:["None","Greedy","DP table","Patience sorting / binary search"],ans:3,topic:"DP"},
      {q:"What is 0/1 Knapsack?",opts:["Any knapsack","None","Fractional knapsack","Choose items with max value within weight limit"],ans:3,topic:"DP"},
      {q:"What is fractional knapsack?",opts:["DP knapsack","0/1 knapsack","None","Can take fractions of items — greedy works"],ans:3,topic:"Greedy"},
      {q:"What is edit distance?",opts:["String difference","Min operations to transform one string to another","None","Edit string"],ans:1,topic:"DP"},
      {q:"What is matrix chain multiplication DP?",opts:["Chain DP","Matrix multiply","None","Min scalar multiplications for chain of matrices"],ans:3,topic:"DP"},
      {q:"What is interval DP?",opts:["None","Segment DP","Range DP","DP on subproblems defined by intervals [i,j]"],ans:3,topic:"DP"},
      {q:"What is bitmask DP?",opts:["Mask DP","None","DP using bits to represent subset states","Bit DP"],ans:2,topic:"DP"},
      {q:"What is digit DP?",opts:["DP counting numbers satisfying digit constraints","None","Number DP","Count DP"],ans:0,topic:"DP"},
      {q:"What is Floyd-Warshall?",opts:["BFS all pairs","All-pairs shortest paths via DP O(V³)","Greedy path","None"],ans:1,topic:"Graphs"},
      {q:"What is Bellman-Ford?",opts:["Single-source shortest path handling negative weights O(VE)","None","BFS variant","Dijkstra variant"],ans:0,topic:"Graphs"},
      {q:"What is Dijkstra's time with priority queue?",opts:["O(VE)","O(V²)","O(E log V)","O((V+E) log V)"],ans:3,topic:"Graphs"},
      {q:"What is A* algorithm?",opts:["None","Dijkstra with heuristic for faster pathfinding","DFS variant","Greedy path"],ans:1,topic:"Graphs"},
      {q:"What is Ford-Fulkerson?",opts:["MST","Min cut","None","Max flow using DFS/BFS augmenting paths"],ans:3,topic:"Flows"},
      {q:"What is Dinic's algorithm?",opts:["Efficient max flow O(V²E)","Ford-Fulkerson fast","BFS flow","None"],ans:0,topic:"Flows"},
      {q:"Max flow min cut theorem?",opts:["Flow equals cut","Always equal","Maximum flow equals minimum cut capacity","None"],ans:2,topic:"Flows"},
      {q:"What is bipartite matching?",opts:["Flow problem","Maximum matching in bipartite graph","Graph coloring","None"],ans:1,topic:"Flows"},
      {q:"What is Hungarian algorithm?",opts:["Max flow","None","Min cost assignment in O(n³)","Bipartite match"],ans:2,topic:"Flows"},
      {q:"What is two-pointer on sorted array?",opts:["None","Binary search","Hash map","O(n) way to find pair with target sum"],ans:3,topic:"Techniques"},
      {q:"What is sliding window maximum?",opts:["Priority queue","Brute force","None","Monotonic deque for O(n) window max"],ans:3,topic:"Techniques"},
      {q:"What is meet in the middle?",opts:["Two pointer","Binary search","None","Split problem into halves — O(2^(n/2))"],ans:3,topic:"Techniques"},
      {q:"What is coordinate compression?",opts:["Math compression","Map large values to small range for arrays","Value mapping","None"],ans:1,topic:"Techniques"},
      {q:"Time complexity of binary search?",opts:["O(n)","O(log n)","O(1)","O(n²)"],ans:1,topic:"Searching"},
      {q:"Merge sort time complexity?",opts:["O(log n)","O(n²)","O(n)","O(n log n) always"],ans:3,topic:"Sorting"},
      {q:"Quick sort average time complexity?",opts:["O(n²)","O(n log n)","O(log n)","O(n)"],ans:1,topic:"Sorting"},
      {q:"What is a BST?",opts:["Left < root < right binary tree","None","Balanced tree","Random binary tree"],ans:0,topic:"Trees"},
      {q:"Inorder traversal of BST gives?",opts:["Sorted ascending order","Random order","Reverse sorted","None"],ans:0,topic:"Trees"},
      {q:"Height of balanced BST with n nodes?",opts:["O(n²)","O(1)","O(n)","O(log n)"],ans:3,topic:"Trees"},
      {q:"BFS uses which data structure?",opts:["Array","Heap","Queue","Stack"],ans:2,topic:"Graphs"},
      {q:"DFS uses which data structure?",opts:["Queue","Heap","Stack or recursion","Array"],ans:2,topic:"Graphs"},
      {q:"What is an AVL tree?",opts:["None","Self-balancing BST with height difference ≤ 1","Any BST","Red-black tree"],ans:1,topic:"Trees"},
      {q:"What is rotation in AVL?",opts:["Operation to rebalance height after insert/delete","Tree rotation","Rotation sort","None"],ans:0,topic:"Trees"},
      {q:"What is a Red-Black tree?",opts:["Colored tree","Self-balancing BST with color properties","None","AVL variant"],ans:1,topic:"Trees"},
      {q:"What is a B-tree?",opts:["Balanced M-ary tree for disk storage","Binary tree","None","B+ tree"],ans:0,topic:"Trees"},
      {q:"What is a trie?",opts:["None","Hash table","Prefix tree for efficient string operations","Tree for numbers"],ans:2,topic:"Advanced DS"},
      {q:"Time to search in trie?",opts:["O(n)","O(L) where L is string length","O(log n)","O(1)"],ans:1,topic:"Advanced DS"},
      {q:"What is a segment tree?",opts:["Tree for range queries and point updates","Segment array","Range array","None"],ans:0,topic:"Advanced DS"},
      {q:"Segment tree query and update time?",opts:["O(n log n)","O(1) query","O(n) update","O(log n) both"],ans:3,topic:"Advanced DS"},
      {q:"What is a Fenwick tree (BIT)?",opts:["Binary tree","Binary Indexed Tree for prefix sum","None","Sorted array"],ans:1,topic:"Advanced DS"},
      {q:"Fenwick tree query time?",opts:["O(n)","O(n log n)","O(log n)","O(1)"],ans:2,topic:"Advanced DS"},
      {q:"What is Union-Find (DSU)?",opts:["Data structure for connected components","Sorting structure","None","Graph traversal"],ans:0,topic:"Advanced DS"},
      {q:"What is path compression in DSU?",opts:["Flattens tree for near O(1) operations","Path finding","Compression algo","None"],ans:0,topic:"Advanced DS"},
      {q:"What is union by rank?",opts:["None","Weight union","Attach smaller tree under larger to keep height low","Random union"],ans:2,topic:"Advanced DS"},
      {q:"DSU amortized complexity with both optimizations?",opts:["O(α(n)) ≈ O(1) practically","O(log n)","O(n)","O(1) exact"],ans:0,topic:"Advanced DS"},
      {q:"What is a sparse table?",opts:["Empty table","None","Sparse array","O(1) range min/max after O(n log n) preprocessing"],ans:3,topic:"Advanced DS"},
      {q:"What is binary lifting?",opts:["Binary jump","None","Ancestor list","Precomputing 2^k ancestors for LCA queries"],ans:3,topic:"Trees"},
      {q:"LCA using binary lifting time?",opts:["O(n)","O(n log n)","O(log n) after O(n log n) preprocessing","O(1)"],ans:2,topic:"Trees"},
      {q:"What is dynamic programming?",opts:["Recursive only","Greedy","Optimal substructure + memoize overlapping subproblems","None"],ans:2,topic:"DP"},
      {q:"What is coin change problem?",opts:["Greedy only","Money problem","Min coins to make amount — classic DP","None"],ans:2,topic:"DP"},
      {q:"What is LCS?",opts:["Shortest common","None","Longest Common Substring","Longest Common Subsequence — same order not contiguous"],ans:3,topic:"DP"},
      {q:"LCS time complexity?",opts:["O(m*n²)","O(m*n)","O(m+n)","O(n)"],ans:1,topic:"DP"},
      {q:"What is LIS?",opts:["Longest Increasing Subsequence","Longest In Sequence","Largest Item","None"],ans:0,topic:"DP"},
      {q:"LIS in O(n log n) uses?",opts:["None","Greedy","DP table","Patience sorting / binary search"],ans:3,topic:"DP"},
      {q:"What is 0/1 Knapsack?",opts:["Any knapsack","None","Fractional knapsack","Choose items with max value within weight limit"],ans:3,topic:"DP"},
      {q:"What is fractional knapsack?",opts:["DP knapsack","0/1 knapsack","None","Can take fractions of items — greedy works"],ans:3,topic:"Greedy"},
      {q:"What is edit distance?",opts:["String difference","Min operations to transform one string to another","None","Edit string"],ans:1,topic:"DP"},
      {q:"What is matrix chain multiplication DP?",opts:["Chain DP","Matrix multiply","None","Min scalar multiplications for chain of matrices"],ans:3,topic:"DP"},
      {q:"What is interval DP?",opts:["None","Segment DP","Range DP","DP on subproblems defined by intervals [i,j]"],ans:3,topic:"DP"},
      {q:"What is bitmask DP?",opts:["Mask DP","None","DP using bits to represent subset states","Bit DP"],ans:2,topic:"DP"},
      {q:"What is digit DP?",opts:["DP counting numbers satisfying digit constraints","None","Number DP","Count DP"],ans:0,topic:"DP"},
      {q:"What is Floyd-Warshall?",opts:["BFS all pairs","All-pairs shortest paths via DP O(V³)","Greedy path","None"],ans:1,topic:"Graphs"},
      {q:"What is Bellman-Ford?",opts:["Single-source shortest path handling negative weights O(VE)","None","BFS variant","Dijkstra variant"],ans:0,topic:"Graphs"},
      {q:"What is Dijkstra's time with priority queue?",opts:["O(VE)","O(V²)","O(E log V)","O((V+E) log V)"],ans:3,topic:"Graphs"},
      {q:"What is A* algorithm?",opts:["None","Dijkstra with heuristic for faster pathfinding","DFS variant","Greedy path"],ans:1,topic:"Graphs"},
      {q:"What is Ford-Fulkerson?",opts:["MST","Min cut","None","Max flow using DFS/BFS augmenting paths"],ans:3,topic:"Flows"},
      {q:"What is Dinic's algorithm?",opts:["Efficient max flow O(V²E)","Ford-Fulkerson fast","BFS flow","None"],ans:0,topic:"Flows"},
      {q:"Max flow min cut theorem?",opts:["Flow equals cut","Always equal","Maximum flow equals minimum cut capacity","None"],ans:2,topic:"Flows"},
      {q:"What is bipartite matching?",opts:["Flow problem","Maximum matching in bipartite graph","Graph coloring","None"],ans:1,topic:"Flows"},
      {q:"What is Hungarian algorithm?",opts:["Max flow","None","Min cost assignment in O(n³)","Bipartite match"],ans:2,topic:"Flows"},
      {q:"What is two-pointer on sorted array?",opts:["None","Binary search","Hash map","O(n) way to find pair with target sum"],ans:3,topic:"Techniques"},
      {q:"What is sliding window maximum?",opts:["Priority queue","Brute force","None","Monotonic deque for O(n) window max"],ans:3,topic:"Techniques"},
      {q:"What is meet in the middle?",opts:["Two pointer","Binary search","None","Split problem into halves — O(2^(n/2))"],ans:3,topic:"Techniques"},
      {q:"What is coordinate compression?",opts:["Math compression","Map large values to small range for arrays","Value mapping","None"],ans:1,topic:"Techniques"},
      {q:"Time complexity of binary search?",opts:["O(n)","O(log n)","O(1)","O(n²)"],ans:1,topic:"Searching"},
      {q:"Merge sort time complexity?",opts:["O(log n)","O(n²)","O(n)","O(n log n) always"],ans:3,topic:"Sorting"},
      {q:"Quick sort average time complexity?",opts:["O(n²)","O(n log n)","O(log n)","O(n)"],ans:1,topic:"Sorting"},
      {q:"What is a BST?",opts:["Left < root < right binary tree","None","Balanced tree","Random binary tree"],ans:0,topic:"Trees"},
      {q:"Inorder traversal of BST gives?",opts:["Sorted ascending order","Random order","Reverse sorted","None"],ans:0,topic:"Trees"},
      {q:"Height of balanced BST with n nodes?",opts:["O(n²)","O(1)","O(n)","O(log n)"],ans:3,topic:"Trees"},
      {q:"BFS uses which data structure?",opts:["Array","Heap","Queue","Stack"],ans:2,topic:"Graphs"},
      {q:"DFS uses which data structure?",opts:["Queue","Heap","Stack or recursion","Array"],ans:2,topic:"Graphs"},
      {q:"What is an AVL tree?",opts:["None","Self-balancing BST with height difference ≤ 1","Any BST","Red-black tree"],ans:1,topic:"Trees"},
      {q:"What is rotation in AVL?",opts:["Operation to rebalance height after insert/delete","Tree rotation","Rotation sort","None"],ans:0,topic:"Trees"},
      {q:"What is a Red-Black tree?",opts:["Colored tree","Self-balancing BST with color properties","None","AVL variant"],ans:1,topic:"Trees"},
      {q:"What is a B-tree?",opts:["Balanced M-ary tree for disk storage","Binary tree","None","B+ tree"],ans:0,topic:"Trees"},
      {q:"What is a trie?",opts:["None","Hash table","Prefix tree for efficient string operations","Tree for numbers"],ans:2,topic:"Advanced DS"},
      {q:"Time to search in trie?",opts:["O(n)","O(L) where L is string length","O(log n)","O(1)"],ans:1,topic:"Advanced DS"},
      {q:"What is a segment tree?",opts:["Tree for range queries and point updates","Segment array","Range array","None"],ans:0,topic:"Advanced DS"},
      {q:"Segment tree query and update time?",opts:["O(n log n)","O(1) query","O(n) update","O(log n) both"],ans:3,topic:"Advanced DS"},
      {q:"What is a Fenwick tree (BIT)?",opts:["Binary tree","Binary Indexed Tree for prefix sum","None","Sorted array"],ans:1,topic:"Advanced DS"},
      {q:"Fenwick tree query time?",opts:["O(n)","O(n log n)","O(log n)","O(1)"],ans:2,topic:"Advanced DS"},
      {q:"What is Union-Find (DSU)?",opts:["Data structure for connected components","Sorting structure","None","Graph traversal"],ans:0,topic:"Advanced DS"},
      {q:"What is path compression in DSU?",opts:["Flattens tree for near O(1) operations","Path finding","Compression algo","None"],ans:0,topic:"Advanced DS"},
      {q:"What is union by rank?",opts:["None","Weight union","Attach smaller tree under larger to keep height low","Random union"],ans:2,topic:"Advanced DS"},
      {q:"DSU amortized complexity with both optimizations?",opts:["O(α(n)) ≈ O(1) practically","O(log n)","O(n)","O(1) exact"],ans:0,topic:"Advanced DS"},
      {q:"What is a sparse table?",opts:["Empty table","None","Sparse array","O(1) range min/max after O(n log n) preprocessing"],ans:3,topic:"Advanced DS"},
      {q:"What is binary lifting?",opts:["Binary jump","None","Ancestor list","Precomputing 2^k ancestors for LCA queries"],ans:3,topic:"Trees"},
      {q:"LCA using binary lifting time?",opts:["O(n)","O(n log n)","O(log n) after O(n log n) preprocessing","O(1)"],ans:2,topic:"Trees"},
      {q:"What is dynamic programming?",opts:["Recursive only","Greedy","Optimal substructure + memoize overlapping subproblems","None"],ans:2,topic:"DP"},
      {q:"What is coin change problem?",opts:["Greedy only","Money problem","Min coins to make amount — classic DP","None"],ans:2,topic:"DP"},
      {q:"What is LCS?",opts:["Shortest common","None","Longest Common Substring","Longest Common Subsequence — same order not contiguous"],ans:3,topic:"DP"},
      {q:"LCS time complexity?",opts:["O(m*n²)","O(m*n)","O(m+n)","O(n)"],ans:1,topic:"DP"},
      {q:"What is LIS?",opts:["Longest Increasing Subsequence","Longest In Sequence","Largest Item","None"],ans:0,topic:"DP"},
      {q:"LIS in O(n log n) uses?",opts:["None","Greedy","DP table","Patience sorting / binary search"],ans:3,topic:"DP"},
      {q:"What is 0/1 Knapsack?",opts:["Any knapsack","None","Fractional knapsack","Choose items with max value within weight limit"],ans:3,topic:"DP"},
      {q:"What is fractional knapsack?",opts:["DP knapsack","0/1 knapsack","None","Can take fractions of items — greedy works"],ans:3,topic:"Greedy"},
      {q:"What is edit distance?",opts:["String difference","Min operations to transform one string to another","None","Edit string"],ans:1,topic:"DP"},
      {q:"What is matrix chain multiplication DP?",opts:["Chain DP","Matrix multiply","None","Min scalar multiplications for chain of matrices"],ans:3,topic:"DP"},
      {q:"What is interval DP?",opts:["None","Segment DP","Range DP","DP on subproblems defined by intervals [i,j]"],ans:3,topic:"DP"},
      {q:"What is bitmask DP?",opts:["Mask DP","None","DP using bits to represent subset states","Bit DP"],ans:2,topic:"DP"},
      {q:"What is digit DP?",opts:["DP counting numbers satisfying digit constraints","None","Number DP","Count DP"],ans:0,topic:"DP"},
      {q:"What is Floyd-Warshall?",opts:["BFS all pairs","All-pairs shortest paths via DP O(V³)","Greedy path","None"],ans:1,topic:"Graphs"},
      {q:"What is Bellman-Ford?",opts:["Single-source shortest path handling negative weights O(VE)","None","BFS variant","Dijkstra variant"],ans:0,topic:"Graphs"},
      {q:"What is Dijkstra's time with priority queue?",opts:["O(VE)","O(V²)","O(E log V)","O((V+E) log V)"],ans:3,topic:"Graphs"},
      {q:"What is A* algorithm?",opts:["None","Dijkstra with heuristic for faster pathfinding","DFS variant","Greedy path"],ans:1,topic:"Graphs"},
      {q:"What is Ford-Fulkerson?",opts:["MST","Min cut","None","Max flow using DFS/BFS augmenting paths"],ans:3,topic:"Flows"},
      {q:"What is Dinic's algorithm?",opts:["Efficient max flow O(V²E)","Ford-Fulkerson fast","BFS flow","None"],ans:0,topic:"Flows"},
      {q:"Max flow min cut theorem?",opts:["Flow equals cut","Always equal","Maximum flow equals minimum cut capacity","None"],ans:2,topic:"Flows"},
      {q:"What is bipartite matching?",opts:["Flow problem","Maximum matching in bipartite graph","Graph coloring","None"],ans:1,topic:"Flows"},
      {q:"What is Hungarian algorithm?",opts:["Max flow","None","Min cost assignment in O(n³)","Bipartite match"],ans:2,topic:"Flows"},
      {q:"What is two-pointer on sorted array?",opts:["None","Binary search","Hash map","O(n) way to find pair with target sum"],ans:3,topic:"Techniques"},
      {q:"What is sliding window maximum?",opts:["Priority queue","Brute force","None","Monotonic deque for O(n) window max"],ans:3,topic:"Techniques"},
      {q:"What is meet in the middle?",opts:["Two pointer","Binary search","None","Split problem into halves — O(2^(n/2))"],ans:3,topic:"Techniques"},
      {q:"What is coordinate compression?",opts:["Math compression","Map large values to small range for arrays","Value mapping","None"],ans:1,topic:"Techniques"},
      {q:"Time complexity of binary search?",opts:["O(n)","O(log n)","O(1)","O(n²)"],ans:1,topic:"Searching"},
      {q:"Merge sort time complexity?",opts:["O(log n)","O(n²)","O(n)","O(n log n) always"],ans:3,topic:"Sorting"},
      {q:"Quick sort average time complexity?",opts:["O(n²)","O(n log n)","O(log n)","O(n)"],ans:1,topic:"Sorting"},
      {q:"What is a BST?",opts:["Left < root < right binary tree","None","Balanced tree","Random binary tree"],ans:0,topic:"Trees"},
      {q:"Inorder traversal of BST gives?",opts:["Sorted ascending order","Random order","Reverse sorted","None"],ans:0,topic:"Trees"},
      {q:"Height of balanced BST with n nodes?",opts:["O(n²)","O(1)","O(n)","O(log n)"],ans:3,topic:"Trees"},
      {q:"BFS uses which data structure?",opts:["Array","Heap","Queue","Stack"],ans:2,topic:"Graphs"},
      {q:"DFS uses which data structure?",opts:["Queue","Heap","Stack or recursion","Array"],ans:2,topic:"Graphs"},
      {q:"What is an AVL tree?",opts:["None","Self-balancing BST with height difference ≤ 1","Any BST","Red-black tree"],ans:1,topic:"Trees"},
      {q:"What is rotation in AVL?",opts:["Operation to rebalance height after insert/delete","Tree rotation","Rotation sort","None"],ans:0,topic:"Trees"},
      {q:"What is a Red-Black tree?",opts:["Colored tree","Self-balancing BST with color properties","None","AVL variant"],ans:1,topic:"Trees"},
      {q:"What is a B-tree?",opts:["Balanced M-ary tree for disk storage","Binary tree","None","B+ tree"],ans:0,topic:"Trees"},
      {q:"What is a trie?",opts:["None","Hash table","Prefix tree for efficient string operations","Tree for numbers"],ans:2,topic:"Advanced DS"},
      {q:"Time to search in trie?",opts:["O(n)","O(L) where L is string length","O(log n)","O(1)"],ans:1,topic:"Advanced DS"},
      {q:"What is a segment tree?",opts:["Tree for range queries and point updates","Segment array","Range array","None"],ans:0,topic:"Advanced DS"},
      {q:"Segment tree query and update time?",opts:["O(n log n)","O(1) query","O(n) update","O(log n) both"],ans:3,topic:"Advanced DS"},
      {q:"What is a Fenwick tree (BIT)?",opts:["Binary tree","Binary Indexed Tree for prefix sum","None","Sorted array"],ans:1,topic:"Advanced DS"},
      {q:"Fenwick tree query time?",opts:["O(n)","O(n log n)","O(log n)","O(1)"],ans:2,topic:"Advanced DS"},
      {q:"What is Union-Find (DSU)?",opts:["Data structure for connected components","Sorting structure","None","Graph traversal"],ans:0,topic:"Advanced DS"},
      {q:"What is path compression in DSU?",opts:["Flattens tree for near O(1) operations","Path finding","Compression algo","None"],ans:0,topic:"Advanced DS"},
      {q:"What is union by rank?",opts:["None","Weight union","Attach smaller tree under larger to keep height low","Random union"],ans:2,topic:"Advanced DS"},
      {q:"DSU amortized complexity with both optimizations?",opts:["O(α(n)) ≈ O(1) practically","O(log n)","O(n)","O(1) exact"],ans:0,topic:"Advanced DS"},
      {q:"What is a sparse table?",opts:["Empty table","None","Sparse array","O(1) range min/max after O(n log n) preprocessing"],ans:3,topic:"Advanced DS"},
      {q:"What is binary lifting?",opts:["Binary jump","None","Ancestor list","Precomputing 2^k ancestors for LCA queries"],ans:3,topic:"Trees"},
      {q:"LCA using binary lifting time?",opts:["O(n)","O(n log n)","O(log n) after O(n log n) preprocessing","O(1)"],ans:2,topic:"Trees"},
      {q:"What is dynamic programming?",opts:["Recursive only","Greedy","Optimal substructure + memoize overlapping subproblems","None"],ans:2,topic:"DP"},
      {q:"What is coin change problem?",opts:["Greedy only","Money problem","Min coins to make amount — classic DP","None"],ans:2,topic:"DP"},
      {q:"What is LCS?",opts:["Shortest common","None","Longest Common Substring","Longest Common Subsequence — same order not contiguous"],ans:3,topic:"DP"},
      {q:"LCS time complexity?",opts:["O(m*n²)","O(m*n)","O(m+n)","O(n)"],ans:1,topic:"DP"},
      {q:"What is LIS?",opts:["Longest Increasing Subsequence","Longest In Sequence","Largest Item","None"],ans:0,topic:"DP"},
      {q:"LIS in O(n log n) uses?",opts:["None","Greedy","DP table","Patience sorting / binary search"],ans:3,topic:"DP"},
      {q:"What is 0/1 Knapsack?",opts:["Any knapsack","None","Fractional knapsack","Choose items with max value within weight limit"],ans:3,topic:"DP"},
      {q:"What is fractional knapsack?",opts:["DP knapsack","0/1 knapsack","None","Can take fractions of items — greedy works"],ans:3,topic:"Greedy"},
      {q:"What is edit distance?",opts:["String difference","Min operations to transform one string to another","None","Edit string"],ans:1,topic:"DP"},
      {q:"What is matrix chain multiplication DP?",opts:["Chain DP","Matrix multiply","None","Min scalar multiplications for chain of matrices"],ans:3,topic:"DP"},
      {q:"What is interval DP?",opts:["None","Segment DP","Range DP","DP on subproblems defined by intervals [i,j]"],ans:3,topic:"DP"},
      {q:"What is bitmask DP?",opts:["Mask DP","None","DP using bits to represent subset states","Bit DP"],ans:2,topic:"DP"},
      {q:"What is digit DP?",opts:["DP counting numbers satisfying digit constraints","None","Number DP","Count DP"],ans:0,topic:"DP"},
      {q:"What is Floyd-Warshall?",opts:["BFS all pairs","All-pairs shortest paths via DP O(V³)","Greedy path","None"],ans:1,topic:"Graphs"},
      {q:"What is Bellman-Ford?",opts:["Single-source shortest path handling negative weights O(VE)","None","BFS variant","Dijkstra variant"],ans:0,topic:"Graphs"},
      {q:"What is Dijkstra's time with priority queue?",opts:["O(VE)","O(V²)","O(E log V)","O((V+E) log V)"],ans:3,topic:"Graphs"},
      {q:"What is A* algorithm?",opts:["None","Dijkstra with heuristic for faster pathfinding","DFS variant","Greedy path"],ans:1,topic:"Graphs"},
      {q:"What is Ford-Fulkerson?",opts:["MST","Min cut","None","Max flow using DFS/BFS augmenting paths"],ans:3,topic:"Flows"},
      {q:"What is Dinic's algorithm?",opts:["Efficient max flow O(V²E)","Ford-Fulkerson fast","BFS flow","None"],ans:0,topic:"Flows"},
      {q:"Max flow min cut theorem?",opts:["Flow equals cut","Always equal","Maximum flow equals minimum cut capacity","None"],ans:2,topic:"Flows"},
      {q:"What is bipartite matching?",opts:["Flow problem","Maximum matching in bipartite graph","Graph coloring","None"],ans:1,topic:"Flows"},
      {q:"What is Hungarian algorithm?",opts:["Max flow","None","Min cost assignment in O(n³)","Bipartite match"],ans:2,topic:"Flows"},
    ],
    advanced:[
      {q:"What is Heavy-Light Decomposition?",opts:["None","Decomposes tree into chains for O(log²n) path queries","None","Graph technique"],ans:1,topic:"Advanced Trees"},
      {q:"What is Centroid Decomposition?",opts:["None","Decompose tree at centroid for path/distance problems","Tree center","None"],ans:1,topic:"Advanced Trees"},
      {q:"What is Euler Tour on tree?",opts:["None","Graph tour","Linearizes tree for range query subtrees","Tree traversal"],ans:2,topic:"Advanced Trees"},
      {q:"What is LCA (Lowest Common Ancestor)?",opts:["None","Common node","Deepest node that is ancestor of both nodes","Lowest node"],ans:2,topic:"Trees"},
      {q:"What is a Persistent Data Structure?",opts:["None","Immutable DS","Retains all previous versions on updates","Versioned DS"],ans:2,topic:"Advanced DS"},
      {q:"What is a Persistent Segment Tree?",opts:["None","Segment tree with version history O(log n) per update","None","Saved tree"],ans:1,topic:"Advanced DS"},
      {q:"What is sqrt decomposition?",opts:["Divide into √n blocks for O(√n) tradeoff","None","Math operation","None"],ans:0,topic:"Advanced DS"},
      {q:"What is Mo's algorithm?",opts:["Greedy","None","None","Offline range queries sorted by sqrt blocks O((n+q)√n)"],ans:3,topic:"Advanced DS"},
      {q:"What is a Treap?",opts:["BST + heap randomized balanced tree","Tree type","None","None"],ans:0,topic:"Advanced DS"},
      {q:"What is a Splay tree?",opts:["None","BST variant","Splay sort","Self-adjusting BST via splaying accessed node"],ans:3,topic:"Advanced DS"},
      {q:"What is a Skip list?",opts:["Probabilistic multi-level linked list for O(log n)","Linked list","None","BST"],ans:0,topic:"Advanced DS"},
      {q:"What is a van Emde Boas tree?",opts:["Integer tree","vEB class","O(log log U) operations for integers in universe U","None"],ans:2,topic:"Advanced DS"},
      {q:"What is Z-algorithm?",opts:["Prefix search","Z function","O(n) prefix match lengths for each position","None"],ans:2,topic:"String Algorithms"},
      {q:"What is KMP?",opts:["String match","None","O(n+m) pattern matching using failure function","Knuth search"],ans:2,topic:"String Algorithms"},
      {q:"What is Aho-Corasick?",opts:["AC automaton","Multi-pattern matching using automaton O(n+m+k)","None","AhoC search"],ans:1,topic:"String Algorithms"},
      {q:"What is Suffix Array?",opts:["String array","Sorted suffixes for O(log n) pattern search","Suffix tree","None"],ans:1,topic:"String Algorithms"},
      {q:"What is Suffix Automaton?",opts:["String DFA","Suffix tree","Compact structure representing all substrings","None"],ans:2,topic:"String Algorithms"},
      {q:"What is Manacher's algorithm?",opts:["None","O(n) longest palindromic substring","None","Palindrome DP"],ans:1,topic:"String Algorithms"},
      {q:"What is Convex Hull Trick in DP?",opts:["None","Optimizes linear transition DP using convex hull","Geometry trick","None"],ans:1,topic:"Advanced DP"},
      {q:"What is SMAWK algorithm?",opts:["None","None","O(n) optimization for totally monotone matrices","Matrix algo"],ans:2,topic:"Advanced DP"},
      {q:"What is divide and conquer DP?",opts:["D&C sorting","Reduces O(n²) DP when opt is monotone to O(n log n)","None","None"],ans:1,topic:"Advanced DP"},
      {q:"What is Knuth's optimization?",opts:["Sorting","None","None","DP optimization when opt(i,j) is monotone O(n²)"],ans:3,topic:"Advanced DP"},
      {q:"What is Matrix Exponentiation?",opts:["None","Matrix power","Compute recurrence in O(k³ log n)","None"],ans:2,topic:"Math"},
      {q:"What is inclusion-exclusion principle?",opts:["Math rule","None","Count union via alternating sum of intersections","None"],ans:2,topic:"Math"},
      {q:"What is Euler's totient function?",opts:["None","Count integers ≤ n coprime to n","None","Euler function"],ans:1,topic:"Math"},
      {q:"What is Fermat's little theorem?",opts:["Fermat theorem","None","a^(p-1) ≡ 1 mod p for prime p","None"],ans:2,topic:"Math"},
      {q:"What is modular inverse?",opts:["None","Inverse mod","x such that a*x ≡ 1 mod m","None"],ans:2,topic:"Math"},
      {q:"What is Chinese Remainder Theorem?",opts:["System of congruences with coprime moduli","None","CRT","None"],ans:0,topic:"Math"},
      {q:"What is Sprague-Grundy theorem?",opts:["XOR of Grundy values determines game winner","None","Game theorem","None"],ans:0,topic:"Game Theory"},
      {q:"What is Nim game?",opts:["Take objects from piles — XOR determines winner","Nim class","None","None"],ans:0,topic:"Game Theory"},
      {q:"What is a lichao segment tree?",opts:["None","Line tree","Segment tree variant for line minimization","None"],ans:2,topic:"Advanced DS"},
      {q:"What is offline vs online algorithm?",opts:["None","Query type","Offline knows all queries, online processes one by one","None"],ans:2,topic:"Algorithms"},
      {q:"What is randomized algorithm?",opts:["None","Uses randomness for expected performance","Random algo","None"],ans:1,topic:"Algorithms"},
      {q:"What is Las Vegas algorithm?",opts:["None","Always correct, randomized running time","None","Monte Carlo"],ans:1,topic:"Algorithms"},
      {q:"What is Monte Carlo algorithm?",opts:["None","None","Las Vegas","Fast but may be incorrect with small probability"],ans:3,topic:"Algorithms"},
      {q:"What is approximation algorithm?",opts:["Approx class","None","Guaranteed bound on solution quality vs optimal","None"],ans:2,topic:"Algorithms"},
      {q:"What is FPT algorithm?",opts:["None","Fast poly time","Fixed Parameter Tractable for parameterized problems","None"],ans:2,topic:"Algorithms"},
      {q:"What is NP-hard?",opts:["At least as hard as NP problems, no known poly algorithm","P hard","None","NP complete"],ans:0,topic:"Complexity"},
      {q:"What is NP-complete?",opts:["In NP and NP-hard — hardest problems in NP","None","NP hard","P complete"],ans:0,topic:"Complexity"},
      {q:"What is P vs NP?",opts:["None","P equals NP","Greatest open problem — can NP be solved in poly time?","None"],ans:2,topic:"Complexity"},
      {q:"What is a reduction?",opts:["None","None","Transforming one problem to another to prove hardness","Problem mapping"],ans:2,topic:"Complexity"},
      {q:"What is Heavy-Light Decomposition?",opts:["None","Decomposes tree into chains for O(log²n) path queries","None","Graph technique"],ans:1,topic:"Advanced Trees"},
      {q:"What is Centroid Decomposition?",opts:["None","Decompose tree at centroid for path/distance problems","Tree center","None"],ans:1,topic:"Advanced Trees"},
      {q:"What is Euler Tour on tree?",opts:["None","Graph tour","Linearizes tree for range query subtrees","Tree traversal"],ans:2,topic:"Advanced Trees"},
      {q:"What is LCA (Lowest Common Ancestor)?",opts:["None","Common node","Deepest node that is ancestor of both nodes","Lowest node"],ans:2,topic:"Trees"},
      {q:"What is a Persistent Data Structure?",opts:["None","Immutable DS","Retains all previous versions on updates","Versioned DS"],ans:2,topic:"Advanced DS"},
      {q:"What is a Persistent Segment Tree?",opts:["None","Segment tree with version history O(log n) per update","None","Saved tree"],ans:1,topic:"Advanced DS"},
      {q:"What is sqrt decomposition?",opts:["Divide into √n blocks for O(√n) tradeoff","None","Math operation","None"],ans:0,topic:"Advanced DS"},
      {q:"What is Mo's algorithm?",opts:["Greedy","None","None","Offline range queries sorted by sqrt blocks O((n+q)√n)"],ans:3,topic:"Advanced DS"},
      {q:"What is a Treap?",opts:["BST + heap randomized balanced tree","Tree type","None","None"],ans:0,topic:"Advanced DS"},
      {q:"What is a Splay tree?",opts:["None","BST variant","Splay sort","Self-adjusting BST via splaying accessed node"],ans:3,topic:"Advanced DS"},
      {q:"What is a Skip list?",opts:["Probabilistic multi-level linked list for O(log n)","Linked list","None","BST"],ans:0,topic:"Advanced DS"},
      {q:"What is a van Emde Boas tree?",opts:["Integer tree","vEB class","O(log log U) operations for integers in universe U","None"],ans:2,topic:"Advanced DS"},
      {q:"What is Z-algorithm?",opts:["Prefix search","Z function","O(n) prefix match lengths for each position","None"],ans:2,topic:"String Algorithms"},
      {q:"What is KMP?",opts:["String match","None","O(n+m) pattern matching using failure function","Knuth search"],ans:2,topic:"String Algorithms"},
      {q:"What is Aho-Corasick?",opts:["AC automaton","Multi-pattern matching using automaton O(n+m+k)","None","AhoC search"],ans:1,topic:"String Algorithms"},
      {q:"What is Suffix Array?",opts:["String array","Sorted suffixes for O(log n) pattern search","Suffix tree","None"],ans:1,topic:"String Algorithms"},
      {q:"What is Suffix Automaton?",opts:["String DFA","Suffix tree","Compact structure representing all substrings","None"],ans:2,topic:"String Algorithms"},
      {q:"What is Manacher's algorithm?",opts:["None","O(n) longest palindromic substring","None","Palindrome DP"],ans:1,topic:"String Algorithms"},
      {q:"What is Convex Hull Trick in DP?",opts:["None","Optimizes linear transition DP using convex hull","Geometry trick","None"],ans:1,topic:"Advanced DP"},
      {q:"What is SMAWK algorithm?",opts:["None","None","O(n) optimization for totally monotone matrices","Matrix algo"],ans:2,topic:"Advanced DP"},
      {q:"What is divide and conquer DP?",opts:["D&C sorting","Reduces O(n²) DP when opt is monotone to O(n log n)","None","None"],ans:1,topic:"Advanced DP"},
      {q:"What is Knuth's optimization?",opts:["Sorting","None","None","DP optimization when opt(i,j) is monotone O(n²)"],ans:3,topic:"Advanced DP"},
      {q:"What is Matrix Exponentiation?",opts:["None","Matrix power","Compute recurrence in O(k³ log n)","None"],ans:2,topic:"Math"},
      {q:"What is inclusion-exclusion principle?",opts:["Math rule","None","Count union via alternating sum of intersections","None"],ans:2,topic:"Math"},
      {q:"What is Euler's totient function?",opts:["None","Count integers ≤ n coprime to n","None","Euler function"],ans:1,topic:"Math"},
      {q:"What is Fermat's little theorem?",opts:["Fermat theorem","None","a^(p-1) ≡ 1 mod p for prime p","None"],ans:2,topic:"Math"},
      {q:"What is modular inverse?",opts:["None","Inverse mod","x such that a*x ≡ 1 mod m","None"],ans:2,topic:"Math"},
      {q:"What is Chinese Remainder Theorem?",opts:["System of congruences with coprime moduli","None","CRT","None"],ans:0,topic:"Math"},
      {q:"What is Sprague-Grundy theorem?",opts:["XOR of Grundy values determines game winner","None","Game theorem","None"],ans:0,topic:"Game Theory"},
      {q:"What is Nim game?",opts:["Take objects from piles — XOR determines winner","Nim class","None","None"],ans:0,topic:"Game Theory"},
      {q:"What is a lichao segment tree?",opts:["None","Line tree","Segment tree variant for line minimization","None"],ans:2,topic:"Advanced DS"},
      {q:"What is offline vs online algorithm?",opts:["None","Query type","Offline knows all queries, online processes one by one","None"],ans:2,topic:"Algorithms"},
      {q:"What is randomized algorithm?",opts:["None","Uses randomness for expected performance","Random algo","None"],ans:1,topic:"Algorithms"},
      {q:"What is Las Vegas algorithm?",opts:["None","Always correct, randomized running time","None","Monte Carlo"],ans:1,topic:"Algorithms"},
      {q:"What is Monte Carlo algorithm?",opts:["None","None","Las Vegas","Fast but may be incorrect with small probability"],ans:3,topic:"Algorithms"},
      {q:"What is approximation algorithm?",opts:["Approx class","None","Guaranteed bound on solution quality vs optimal","None"],ans:2,topic:"Algorithms"},
      {q:"What is FPT algorithm?",opts:["None","Fast poly time","Fixed Parameter Tractable for parameterized problems","None"],ans:2,topic:"Algorithms"},
      {q:"What is NP-hard?",opts:["At least as hard as NP problems, no known poly algorithm","P hard","None","NP complete"],ans:0,topic:"Complexity"},
      {q:"What is NP-complete?",opts:["In NP and NP-hard — hardest problems in NP","None","NP hard","P complete"],ans:0,topic:"Complexity"},
      {q:"What is P vs NP?",opts:["None","P equals NP","Greatest open problem — can NP be solved in poly time?","None"],ans:2,topic:"Complexity"},
      {q:"What is a reduction?",opts:["None","None","Transforming one problem to another to prove hardness","Problem mapping"],ans:2,topic:"Complexity"},
      {q:"What is Heavy-Light Decomposition?",opts:["None","Decomposes tree into chains for O(log²n) path queries","None","Graph technique"],ans:1,topic:"Advanced Trees"},
      {q:"What is Centroid Decomposition?",opts:["None","Decompose tree at centroid for path/distance problems","Tree center","None"],ans:1,topic:"Advanced Trees"},
      {q:"What is Euler Tour on tree?",opts:["None","Graph tour","Linearizes tree for range query subtrees","Tree traversal"],ans:2,topic:"Advanced Trees"},
      {q:"What is LCA (Lowest Common Ancestor)?",opts:["None","Common node","Deepest node that is ancestor of both nodes","Lowest node"],ans:2,topic:"Trees"},
      {q:"What is a Persistent Data Structure?",opts:["None","Immutable DS","Retains all previous versions on updates","Versioned DS"],ans:2,topic:"Advanced DS"},
      {q:"What is a Persistent Segment Tree?",opts:["None","Segment tree with version history O(log n) per update","None","Saved tree"],ans:1,topic:"Advanced DS"},
      {q:"What is sqrt decomposition?",opts:["Divide into √n blocks for O(√n) tradeoff","None","Math operation","None"],ans:0,topic:"Advanced DS"},
      {q:"What is Mo's algorithm?",opts:["Greedy","None","None","Offline range queries sorted by sqrt blocks O((n+q)√n)"],ans:3,topic:"Advanced DS"},
      {q:"What is a Treap?",opts:["BST + heap randomized balanced tree","Tree type","None","None"],ans:0,topic:"Advanced DS"},
      {q:"What is a Splay tree?",opts:["None","BST variant","Splay sort","Self-adjusting BST via splaying accessed node"],ans:3,topic:"Advanced DS"},
      {q:"What is a Skip list?",opts:["Probabilistic multi-level linked list for O(log n)","Linked list","None","BST"],ans:0,topic:"Advanced DS"},
      {q:"What is a van Emde Boas tree?",opts:["Integer tree","vEB class","O(log log U) operations for integers in universe U","None"],ans:2,topic:"Advanced DS"},
      {q:"What is Z-algorithm?",opts:["Prefix search","Z function","O(n) prefix match lengths for each position","None"],ans:2,topic:"String Algorithms"},
      {q:"What is KMP?",opts:["String match","None","O(n+m) pattern matching using failure function","Knuth search"],ans:2,topic:"String Algorithms"},
      {q:"What is Aho-Corasick?",opts:["AC automaton","Multi-pattern matching using automaton O(n+m+k)","None","AhoC search"],ans:1,topic:"String Algorithms"},
      {q:"What is Suffix Array?",opts:["String array","Sorted suffixes for O(log n) pattern search","Suffix tree","None"],ans:1,topic:"String Algorithms"},
      {q:"What is Suffix Automaton?",opts:["String DFA","Suffix tree","Compact structure representing all substrings","None"],ans:2,topic:"String Algorithms"},
      {q:"What is Manacher's algorithm?",opts:["None","O(n) longest palindromic substring","None","Palindrome DP"],ans:1,topic:"String Algorithms"},
      {q:"What is Convex Hull Trick in DP?",opts:["None","Optimizes linear transition DP using convex hull","Geometry trick","None"],ans:1,topic:"Advanced DP"},
      {q:"What is SMAWK algorithm?",opts:["None","None","O(n) optimization for totally monotone matrices","Matrix algo"],ans:2,topic:"Advanced DP"},
      {q:"What is divide and conquer DP?",opts:["D&C sorting","Reduces O(n²) DP when opt is monotone to O(n log n)","None","None"],ans:1,topic:"Advanced DP"},
      {q:"What is Knuth's optimization?",opts:["Sorting","None","None","DP optimization when opt(i,j) is monotone O(n²)"],ans:3,topic:"Advanced DP"},
      {q:"What is Matrix Exponentiation?",opts:["None","Matrix power","Compute recurrence in O(k³ log n)","None"],ans:2,topic:"Math"},
      {q:"What is inclusion-exclusion principle?",opts:["Math rule","None","Count union via alternating sum of intersections","None"],ans:2,topic:"Math"},
      {q:"What is Euler's totient function?",opts:["None","Count integers ≤ n coprime to n","None","Euler function"],ans:1,topic:"Math"},
      {q:"What is Fermat's little theorem?",opts:["Fermat theorem","None","a^(p-1) ≡ 1 mod p for prime p","None"],ans:2,topic:"Math"},
      {q:"What is modular inverse?",opts:["None","Inverse mod","x such that a*x ≡ 1 mod m","None"],ans:2,topic:"Math"},
      {q:"What is Chinese Remainder Theorem?",opts:["System of congruences with coprime moduli","None","CRT","None"],ans:0,topic:"Math"},
      {q:"What is Sprague-Grundy theorem?",opts:["XOR of Grundy values determines game winner","None","Game theorem","None"],ans:0,topic:"Game Theory"},
      {q:"What is Nim game?",opts:["Take objects from piles — XOR determines winner","Nim class","None","None"],ans:0,topic:"Game Theory"},
      {q:"What is a lichao segment tree?",opts:["None","Line tree","Segment tree variant for line minimization","None"],ans:2,topic:"Advanced DS"},
      {q:"What is offline vs online algorithm?",opts:["None","Query type","Offline knows all queries, online processes one by one","None"],ans:2,topic:"Algorithms"},
      {q:"What is randomized algorithm?",opts:["None","Uses randomness for expected performance","Random algo","None"],ans:1,topic:"Algorithms"},
      {q:"What is Las Vegas algorithm?",opts:["None","Always correct, randomized running time","None","Monte Carlo"],ans:1,topic:"Algorithms"},
      {q:"What is Monte Carlo algorithm?",opts:["None","None","Las Vegas","Fast but may be incorrect with small probability"],ans:3,topic:"Algorithms"},
      {q:"What is approximation algorithm?",opts:["Approx class","None","Guaranteed bound on solution quality vs optimal","None"],ans:2,topic:"Algorithms"},
      {q:"What is FPT algorithm?",opts:["None","Fast poly time","Fixed Parameter Tractable for parameterized problems","None"],ans:2,topic:"Algorithms"},
      {q:"What is NP-hard?",opts:["At least as hard as NP problems, no known poly algorithm","P hard","None","NP complete"],ans:0,topic:"Complexity"},
      {q:"What is NP-complete?",opts:["In NP and NP-hard — hardest problems in NP","None","NP hard","P complete"],ans:0,topic:"Complexity"},
      {q:"What is P vs NP?",opts:["None","P equals NP","Greatest open problem — can NP be solved in poly time?","None"],ans:2,topic:"Complexity"},
      {q:"What is a reduction?",opts:["None","None","Transforming one problem to another to prove hardness","Problem mapping"],ans:2,topic:"Complexity"},
      {q:"What is Heavy-Light Decomposition?",opts:["None","Decomposes tree into chains for O(log²n) path queries","None","Graph technique"],ans:1,topic:"Advanced Trees"},
      {q:"What is Centroid Decomposition?",opts:["None","Decompose tree at centroid for path/distance problems","Tree center","None"],ans:1,topic:"Advanced Trees"},
      {q:"What is Euler Tour on tree?",opts:["None","Graph tour","Linearizes tree for range query subtrees","Tree traversal"],ans:2,topic:"Advanced Trees"},
      {q:"What is LCA (Lowest Common Ancestor)?",opts:["None","Common node","Deepest node that is ancestor of both nodes","Lowest node"],ans:2,topic:"Trees"},
      {q:"What is a Persistent Data Structure?",opts:["None","Immutable DS","Retains all previous versions on updates","Versioned DS"],ans:2,topic:"Advanced DS"},
      {q:"What is a Persistent Segment Tree?",opts:["None","Segment tree with version history O(log n) per update","None","Saved tree"],ans:1,topic:"Advanced DS"},
      {q:"What is sqrt decomposition?",opts:["Divide into √n blocks for O(√n) tradeoff","None","Math operation","None"],ans:0,topic:"Advanced DS"},
      {q:"What is Mo's algorithm?",opts:["Greedy","None","None","Offline range queries sorted by sqrt blocks O((n+q)√n)"],ans:3,topic:"Advanced DS"},
      {q:"What is a Treap?",opts:["BST + heap randomized balanced tree","Tree type","None","None"],ans:0,topic:"Advanced DS"},
      {q:"What is a Splay tree?",opts:["None","BST variant","Splay sort","Self-adjusting BST via splaying accessed node"],ans:3,topic:"Advanced DS"},
      {q:"What is a Skip list?",opts:["Probabilistic multi-level linked list for O(log n)","Linked list","None","BST"],ans:0,topic:"Advanced DS"},
      {q:"What is a van Emde Boas tree?",opts:["Integer tree","vEB class","O(log log U) operations for integers in universe U","None"],ans:2,topic:"Advanced DS"},
      {q:"What is Z-algorithm?",opts:["Prefix search","Z function","O(n) prefix match lengths for each position","None"],ans:2,topic:"String Algorithms"},
      {q:"What is KMP?",opts:["String match","None","O(n+m) pattern matching using failure function","Knuth search"],ans:2,topic:"String Algorithms"},
      {q:"What is Aho-Corasick?",opts:["AC automaton","Multi-pattern matching using automaton O(n+m+k)","None","AhoC search"],ans:1,topic:"String Algorithms"},
      {q:"What is Suffix Array?",opts:["String array","Sorted suffixes for O(log n) pattern search","Suffix tree","None"],ans:1,topic:"String Algorithms"},
      {q:"What is Suffix Automaton?",opts:["String DFA","Suffix tree","Compact structure representing all substrings","None"],ans:2,topic:"String Algorithms"},
      {q:"What is Manacher's algorithm?",opts:["None","O(n) longest palindromic substring","None","Palindrome DP"],ans:1,topic:"String Algorithms"},
      {q:"What is Convex Hull Trick in DP?",opts:["None","Optimizes linear transition DP using convex hull","Geometry trick","None"],ans:1,topic:"Advanced DP"},
      {q:"What is SMAWK algorithm?",opts:["None","None","O(n) optimization for totally monotone matrices","Matrix algo"],ans:2,topic:"Advanced DP"},
      {q:"What is divide and conquer DP?",opts:["D&C sorting","Reduces O(n²) DP when opt is monotone to O(n log n)","None","None"],ans:1,topic:"Advanced DP"},
      {q:"What is Knuth's optimization?",opts:["Sorting","None","None","DP optimization when opt(i,j) is monotone O(n²)"],ans:3,topic:"Advanced DP"},
      {q:"What is Matrix Exponentiation?",opts:["None","Matrix power","Compute recurrence in O(k³ log n)","None"],ans:2,topic:"Math"},
      {q:"What is inclusion-exclusion principle?",opts:["Math rule","None","Count union via alternating sum of intersections","None"],ans:2,topic:"Math"},
      {q:"What is Euler's totient function?",opts:["None","Count integers ≤ n coprime to n","None","Euler function"],ans:1,topic:"Math"},
      {q:"What is Fermat's little theorem?",opts:["Fermat theorem","None","a^(p-1) ≡ 1 mod p for prime p","None"],ans:2,topic:"Math"},
      {q:"What is modular inverse?",opts:["None","Inverse mod","x such that a*x ≡ 1 mod m","None"],ans:2,topic:"Math"},
      {q:"What is Chinese Remainder Theorem?",opts:["System of congruences with coprime moduli","None","CRT","None"],ans:0,topic:"Math"},
      {q:"What is Sprague-Grundy theorem?",opts:["XOR of Grundy values determines game winner","None","Game theorem","None"],ans:0,topic:"Game Theory"},
      {q:"What is Nim game?",opts:["Take objects from piles — XOR determines winner","Nim class","None","None"],ans:0,topic:"Game Theory"},
      {q:"What is a lichao segment tree?",opts:["None","Line tree","Segment tree variant for line minimization","None"],ans:2,topic:"Advanced DS"},
      {q:"What is offline vs online algorithm?",opts:["None","Query type","Offline knows all queries, online processes one by one","None"],ans:2,topic:"Algorithms"},
      {q:"What is randomized algorithm?",opts:["None","Uses randomness for expected performance","Random algo","None"],ans:1,topic:"Algorithms"},
      {q:"What is Las Vegas algorithm?",opts:["None","Always correct, randomized running time","None","Monte Carlo"],ans:1,topic:"Algorithms"},
      {q:"What is Monte Carlo algorithm?",opts:["None","None","Las Vegas","Fast but may be incorrect with small probability"],ans:3,topic:"Algorithms"},
      {q:"What is approximation algorithm?",opts:["Approx class","None","Guaranteed bound on solution quality vs optimal","None"],ans:2,topic:"Algorithms"},
      {q:"What is FPT algorithm?",opts:["None","Fast poly time","Fixed Parameter Tractable for parameterized problems","None"],ans:2,topic:"Algorithms"},
      {q:"What is NP-hard?",opts:["At least as hard as NP problems, no known poly algorithm","P hard","None","NP complete"],ans:0,topic:"Complexity"},
      {q:"What is NP-complete?",opts:["In NP and NP-hard — hardest problems in NP","None","NP hard","P complete"],ans:0,topic:"Complexity"},
      {q:"What is P vs NP?",opts:["None","P equals NP","Greatest open problem — can NP be solved in poly time?","None"],ans:2,topic:"Complexity"},
      {q:"What is a reduction?",opts:["None","None","Transforming one problem to another to prove hardness","Problem mapping"],ans:2,topic:"Complexity"},
      {q:"What is Heavy-Light Decomposition?",opts:["None","Decomposes tree into chains for O(log²n) path queries","None","Graph technique"],ans:1,topic:"Advanced Trees"},
      {q:"What is Centroid Decomposition?",opts:["None","Decompose tree at centroid for path/distance problems","Tree center","None"],ans:1,topic:"Advanced Trees"},
      {q:"What is Euler Tour on tree?",opts:["None","Graph tour","Linearizes tree for range query subtrees","Tree traversal"],ans:2,topic:"Advanced Trees"},
      {q:"What is LCA (Lowest Common Ancestor)?",opts:["None","Common node","Deepest node that is ancestor of both nodes","Lowest node"],ans:2,topic:"Trees"},
      {q:"What is a Persistent Data Structure?",opts:["None","Immutable DS","Retains all previous versions on updates","Versioned DS"],ans:2,topic:"Advanced DS"},
      {q:"What is a Persistent Segment Tree?",opts:["None","Segment tree with version history O(log n) per update","None","Saved tree"],ans:1,topic:"Advanced DS"},
      {q:"What is sqrt decomposition?",opts:["Divide into √n blocks for O(√n) tradeoff","None","Math operation","None"],ans:0,topic:"Advanced DS"},
      {q:"What is Mo's algorithm?",opts:["Greedy","None","None","Offline range queries sorted by sqrt blocks O((n+q)√n)"],ans:3,topic:"Advanced DS"},
      {q:"What is a Treap?",opts:["BST + heap randomized balanced tree","Tree type","None","None"],ans:0,topic:"Advanced DS"},
      {q:"What is a Splay tree?",opts:["None","BST variant","Splay sort","Self-adjusting BST via splaying accessed node"],ans:3,topic:"Advanced DS"},
      {q:"What is a Skip list?",opts:["Probabilistic multi-level linked list for O(log n)","Linked list","None","BST"],ans:0,topic:"Advanced DS"},
      {q:"What is a van Emde Boas tree?",opts:["Integer tree","vEB class","O(log log U) operations for integers in universe U","None"],ans:2,topic:"Advanced DS"},
      {q:"What is Z-algorithm?",opts:["Prefix search","Z function","O(n) prefix match lengths for each position","None"],ans:2,topic:"String Algorithms"},
      {q:"What is KMP?",opts:["String match","None","O(n+m) pattern matching using failure function","Knuth search"],ans:2,topic:"String Algorithms"},
      {q:"What is Aho-Corasick?",opts:["AC automaton","Multi-pattern matching using automaton O(n+m+k)","None","AhoC search"],ans:1,topic:"String Algorithms"},
      {q:"What is Suffix Array?",opts:["String array","Sorted suffixes for O(log n) pattern search","Suffix tree","None"],ans:1,topic:"String Algorithms"},
      {q:"What is Suffix Automaton?",opts:["String DFA","Suffix tree","Compact structure representing all substrings","None"],ans:2,topic:"String Algorithms"},
      {q:"What is Manacher's algorithm?",opts:["None","O(n) longest palindromic substring","None","Palindrome DP"],ans:1,topic:"String Algorithms"},
      {q:"What is Convex Hull Trick in DP?",opts:["None","Optimizes linear transition DP using convex hull","Geometry trick","None"],ans:1,topic:"Advanced DP"},
      {q:"What is SMAWK algorithm?",opts:["None","None","O(n) optimization for totally monotone matrices","Matrix algo"],ans:2,topic:"Advanced DP"},
      {q:"What is divide and conquer DP?",opts:["D&C sorting","Reduces O(n²) DP when opt is monotone to O(n log n)","None","None"],ans:1,topic:"Advanced DP"},
      {q:"What is Knuth's optimization?",opts:["Sorting","None","None","DP optimization when opt(i,j) is monotone O(n²)"],ans:3,topic:"Advanced DP"},
      {q:"What is Matrix Exponentiation?",opts:["None","Matrix power","Compute recurrence in O(k³ log n)","None"],ans:2,topic:"Math"},
      {q:"What is inclusion-exclusion principle?",opts:["Math rule","None","Count union via alternating sum of intersections","None"],ans:2,topic:"Math"},
      {q:"What is Euler's totient function?",opts:["None","Count integers ≤ n coprime to n","None","Euler function"],ans:1,topic:"Math"},
      {q:"What is Fermat's little theorem?",opts:["Fermat theorem","None","a^(p-1) ≡ 1 mod p for prime p","None"],ans:2,topic:"Math"},
      {q:"What is modular inverse?",opts:["None","Inverse mod","x such that a*x ≡ 1 mod m","None"],ans:2,topic:"Math"},
      {q:"What is Chinese Remainder Theorem?",opts:["System of congruences with coprime moduli","None","CRT","None"],ans:0,topic:"Math"},
      {q:"What is Sprague-Grundy theorem?",opts:["XOR of Grundy values determines game winner","None","Game theorem","None"],ans:0,topic:"Game Theory"},
      {q:"What is Nim game?",opts:["Take objects from piles — XOR determines winner","Nim class","None","None"],ans:0,topic:"Game Theory"},
      {q:"What is a lichao segment tree?",opts:["None","Line tree","Segment tree variant for line minimization","None"],ans:2,topic:"Advanced DS"},
      {q:"What is offline vs online algorithm?",opts:["None","Query type","Offline knows all queries, online processes one by one","None"],ans:2,topic:"Algorithms"},
      {q:"What is randomized algorithm?",opts:["None","Uses randomness for expected performance","Random algo","None"],ans:1,topic:"Algorithms"},
      {q:"What is Las Vegas algorithm?",opts:["None","Always correct, randomized running time","None","Monte Carlo"],ans:1,topic:"Algorithms"},
      {q:"What is Monte Carlo algorithm?",opts:["None","None","Las Vegas","Fast but may be incorrect with small probability"],ans:3,topic:"Algorithms"},
      {q:"What is approximation algorithm?",opts:["Approx class","None","Guaranteed bound on solution quality vs optimal","None"],ans:2,topic:"Algorithms"},
    ],
  },
  c5:{
    basic:[
      {q:"What does HTTPS 'S' stand for?",opts:["Standard","Secure","Static","Simple"],ans:1,topic:"Networking"},
      {q:"What is a firewall?",opts:["Speed booster","Virus remover","None","Network traffic filter based on rules"],ans:3,topic:"Networking"},
      {q:"What is an IP address?",opts:["Website name","Email","Internet Password","Unique identifier for device on network"],ans:3,topic:"Networking"},
      {q:"What does DNS do?",opts:["None","Blocks attacks","Translates domain names to IP addresses","Encrypts data"],ans:2,topic:"Networking"},
      {q:"What is a VPN?",opts:["Speed booster","Virus Protection","None","Virtual Private Network encrypting traffic"],ans:3,topic:"Networking"},
      {q:"What is phishing?",opts:["Malware","Physical attack","Fake communications to steal credentials","DDoS"],ans:2,topic:"Social Engineering"},
      {q:"What is malware?",opts:["Good software","Update","Malicious software to damage or gain access","None"],ans:2,topic:"Threats"},
      {q:"What is a virus in cybersecurity?",opts:["Hardware fault","Network error","Self-replicating malicious program","None"],ans:2,topic:"Threats"},
      {q:"What does authentication mean?",opts:["Verifying who someone is","Authorization","None","Encrypting data"],ans:0,topic:"Security Basics"},
      {q:"What is a strong password?",opts:["Name only","Short and simple","Only numbers","Mix of upper/lower/numbers/symbols 12+ chars"],ans:3,topic:"Security Basics"},
      {q:"What is 2FA?",opts:["None","Two usernames","Two different verification methods","Two passwords"],ans:2,topic:"Authentication"},
      {q:"What is encryption?",opts:["None","Compressing data","Converting data to unreadable form using key","Deleting data"],ans:2,topic:"Cryptography"},
      {q:"What does SSL do?",opts:["Encrypts data between browser and server","None","Speeds connection","Compresses files"],ans:0,topic:"Cryptography"},
      {q:"What is a port in networking?",opts:["None","Physical connector only","Logical endpoint for specific service","Router"],ans:2,topic:"Networking"},
      {q:"HTTP status 404 means?",opts:["Success","Not found","Server error","Redirect"],ans:1,topic:"Web"},
      {q:"What is a cookie?",opts:["None","Small data stored by browser from website","Password","Malware"],ans:1,topic:"Web"},
      {q:"What is social engineering?",opts:["Hardware attack","Software attack","None","Manipulating people to reveal information"],ans:3,topic:"Social Engineering"},
      {q:"What is a DDoS attack?",opts:["Overwhelming server with traffic from many sources","Phishing","Database attack","None"],ans:0,topic:"Attacks"},
      {q:"What is antivirus software?",opts:["Speeds up PC","None","Backs up data","Detects and removes malicious software"],ans:3,topic:"Defense"},
      {q:"What does CIA triad stand for?",opts:["None","Common Internet Attacks","Confidentiality Integrity Availability","Computer Internet Access"],ans:2,topic:"Security Basics"},
      {q:"What is a trojan horse?",opts:["Malware disguised as legitimate software","Virus","Worm","None"],ans:0,topic:"Threats"},
      {q:"What is a worm?",opts:["Virus","None","Trojan","Self-replicating malware spreading across networks"],ans:3,topic:"Threats"},
      {q:"What is ransomware?",opts:["Adware","None","Encrypts files and demands payment","Spyware"],ans:2,topic:"Threats"},
      {q:"What is spyware?",opts:["Ransomware","None","Secretly monitors and steals user data","Adware"],ans:2,topic:"Threats"},
      {q:"What is adware?",opts:["Spyware","Displays unwanted advertisements","None","Ransomware"],ans:1,topic:"Threats"},
      {q:"What is a keylogger?",opts:["Network logger","Records keystrokes to steal passwords","None","Screen logger"],ans:1,topic:"Threats"},
      {q:"What is a rootkit?",opts:["None","Hides malware presence on system","Trojan","Virus"],ans:1,topic:"Threats"},
      {q:"What is a botnet?",opts:["Infected net","Bot network","Network of infected computers controlled remotely","None"],ans:2,topic:"Threats"},
      {q:"What is a zero-day exploit?",opts:["None","Attack using unknown unpatched vulnerability","Known exploit","Old exploit"],ans:1,topic:"Attacks"},
      {q:"What is patch management?",opts:["Keeping software updated to fix vulnerabilities","Patch creation","Software testing","None"],ans:0,topic:"Defense"},
      {q:"What is a DMZ in networking?",opts:["Military zone","Demilitarized zone — buffer between public and private","Double Mapped Zone","None"],ans:1,topic:"Networking"},
      {q:"What is NAT?",opts:["None","Network Allocation","None","Network Address Translation — maps private to public IP"],ans:3,topic:"Networking"},
      {q:"What is a subnet?",opts:["Subnet class","Sub network","None","Logical subdivision of network"],ans:3,topic:"Networking"},
      {q:"What is DHCP?",opts:["Domain Host","None","Automatically assigns IP addresses to devices","Dynamic Host Config"],ans:2,topic:"Networking"},
      {q:"What is a MAC address?",opts:["Machine Address","Hardware address of network interface","Media Address","None"],ans:1,topic:"Networking"},
      {q:"What is ARP?",opts:["Maps IP addresses to MAC addresses","None","Address Resolution Protocol","None"],ans:0,topic:"Networking"},
      {q:"What is ICMP?",opts:["Internet Control Message Protocol — ping uses it","None","None","Internet Control"],ans:0,topic:"Networking"},
      {q:"What is TCP vs UDP?",opts:["UDP is reliable","Same thing","TCP reliable ordered, UDP fast unreliable","None"],ans:2,topic:"Networking"},
      {q:"What is port 80?",opts:["SSH port","HTTPS port","FTP port","Default HTTP port"],ans:3,topic:"Networking"},
      {q:"What is port 443?",opts:["SSH port","Default HTTPS port","FTP port","HTTP port"],ans:1,topic:"Networking"},
      {q:"What is port 22?",opts:["FTP port","DNS port","HTTP port","SSH secure shell port"],ans:3,topic:"Networking"},
      {q:"What is port 21?",opts:["SSH port","FTP file transfer port","HTTP port","DNS port"],ans:1,topic:"Networking"},
      {q:"What is port 53?",opts:["DNS port","FTP port","HTTP port","SSH port"],ans:0,topic:"Networking"},
      {q:"What is port 25?",opts:["HTTP port","FTP port","DNS port","SMTP email port"],ans:3,topic:"Networking"},
      {q:"What is the OSI model?",opts:["7-layer framework for network communication","None","Open System Interface","Operating System Interface"],ans:0,topic:"Networking"},
      {q:"What is Layer 1 of OSI?",opts:["Data Link","Transport","Physical — cables, signals","Network"],ans:2,topic:"Networking"},
      {q:"What is Layer 3 of OSI?",opts:["Data Link","Physical","Transport","Network — IP routing"],ans:3,topic:"Networking"},
      {q:"What is Layer 4 of OSI?",opts:["Transport — TCP/UDP","Network","Session","Physical"],ans:0,topic:"Networking"},
      {q:"What is Layer 7 of OSI?",opts:["Transport","Session","Presentation","Application — HTTP, DNS, FTP"],ans:3,topic:"Networking"},
      {q:"What is the TCP/IP model?",opts:["OSI model","4-layer practical model — Link, Internet, Transport, App","None","IP model"],ans:1,topic:"Networking"},
      {q:"What is symmetric encryption?",opts:["None","Same key encrypts and decrypts","Different keys","No key needed"],ans:1,topic:"Cryptography"},
      {q:"What is asymmetric encryption?",opts:["Public key encrypts, private key decrypts","None","Same key","No key"],ans:0,topic:"Cryptography"},
      {q:"What is a public key?",opts:["Private key","None","Secret key","Shared openly for encryption"],ans:3,topic:"Cryptography"},
      {q:"What is a private key?",opts:["Kept secret for decryption","None","Shared key","Public key"],ans:0,topic:"Cryptography"},
      {q:"What is RSA?",opts:["Hash function","None","Asymmetric encryption algorithm","Symmetric encryption"],ans:2,topic:"Cryptography"},
      {q:"What is AES?",opts:["Advanced Encryption Standard — symmetric","None","Asymmetric","Hash function"],ans:0,topic:"Cryptography"},
      {q:"What is a hash function?",opts:["None","Two-way cipher","One-way fixed-size output from any input","Reversible encryption"],ans:2,topic:"Cryptography"},
      {q:"What is SHA-256?",opts:["Secure Hash Algorithm producing 256-bit hash","MD5 variant","SHA-128","None"],ans:0,topic:"Cryptography"},
      {q:"What is MD5?",opts:["None","Older hash algorithm (now considered weak)","Encryption algorithm","Firewall"],ans:1,topic:"Cryptography"},
      {q:"What is a digital signature?",opts:["None","Proves authenticity and integrity using private key","Written signature","Password"],ans:1,topic:"Cryptography"},
      {q:"What is PKI?",opts:["Public Key Internet","Public Key Infrastructure for certificate management","Private Key Infra","None"],ans:1,topic:"Cryptography"},
      {q:"What is a digital certificate?",opts:["Digital ID","Key certificate","Binds public key to identity — issued by CA","None"],ans:2,topic:"Cryptography"},
      {q:"What is a CA (Certificate Authority)?",opts:["None","Certificate App","Trusted entity issuing digital certificates","None"],ans:2,topic:"Cryptography"},
      {q:"What is TLS?",opts:["Transport Layer Security — successor to SSL","Total Layer","None","None"],ans:0,topic:"Cryptography"},
      {q:"What is a man-in-the-middle attack?",opts:["Attacker intercepts communication between two parties","None","Middle attack","Intercept attack"],ans:0,topic:"Attacks"},
      {q:"What is IP spoofing?",opts:["IP hiding","Faking source IP address to deceive","IP masking","None"],ans:1,topic:"Attacks"},
      {q:"What is ARP spoofing?",opts:["None","Sending fake ARP replies to redirect traffic","ARP attack","MAC attack"],ans:1,topic:"Attacks"},
      {q:"What is DNS spoofing?",opts:["IP attack","Injecting false DNS records to redirect users","DNS attack","None"],ans:1,topic:"Attacks"},
      {q:"What is a replay attack?",opts:["Retransmitting valid data to fool authentication","Copy attack","Repeat attack","None"],ans:0,topic:"Attacks"},
      {q:"What is session hijacking?",opts:["Cookie theft","Taking over authenticated user session","Token theft","None"],ans:1,topic:"Attacks"},
      {q:"What is clickjacking?",opts:["Hiding malicious elements under legitimate UI","None","Click attack","UI attack"],ans:0,topic:"Attacks"},
      {q:"What is a watering hole attack?",opts:["Site attack","Infecting websites targets frequently visit","Water attack","None"],ans:1,topic:"Attacks"},
      {q:"What is supply chain attack?",opts:["None","Compromising software before it reaches users","Source attack","Chain attack"],ans:1,topic:"Attacks"},
      {q:"What is OSINT?",opts:["None","Open Source Int","None","Open Source Intelligence — public info gathering"],ans:3,topic:"Reconnaissance"},
      {q:"What is Google dorking?",opts:["Advanced Google queries to find sensitive data","Google search","None","Google hacking"],ans:0,topic:"Reconnaissance"},
      {q:"What is Shodan?",opts:["None","Device finder","Shodan class","Search engine for internet-connected devices"],ans:3,topic:"Tools"},
      {q:"What is Maltego?",opts:["Visual link analysis for reconnaissance","None","None","Malware tool"],ans:0,topic:"Tools"},
      {q:"What is theHarvester?",opts:["None","Email and domain enumeration tool","None","Harvest tool"],ans:1,topic:"Tools"},
      {q:"What is Nmap?",opts:["Password cracker","Network discovery and port scanning tool","Code editor","None"],ans:1,topic:"Tools"},
      {q:"What is Metasploit?",opts:["Exploitation framework for security testing","Metadata tool","None","None"],ans:0,topic:"Tools"},
      {q:"What is Burp Suite?",opts:["Web application security testing proxy","Code editor","Network scanner","None"],ans:0,topic:"Tools"},
      {q:"What is Wireshark?",opts:["Password cracker","None","Code editor","Network packet analyzer"],ans:3,topic:"Tools"},
      {q:"What is John the Ripper?",opts:["Password manager","John software","None","Password cracking tool"],ans:3,topic:"Tools"},
      {q:"What is Hashcat?",opts:["None","GPU-accelerated password hash cracker","None","Hash tool"],ans:1,topic:"Tools"},
      {q:"What is Aircrack-ng?",opts:["WiFi network security testing suite","None","Air tool","None"],ans:0,topic:"Tools"},
      {q:"What is Hydra?",opts:["Hydra tool","None","None","Network login brute force tool"],ans:3,topic:"Tools"},
      {q:"What is Nikto?",opts:["Nikto class","None","Web server vulnerability scanner","Web tool"],ans:2,topic:"Tools"},
      {q:"What is SQLmap?",opts:["Automated SQL injection testing tool","None","SQL tool","None"],ans:0,topic:"Tools"},
      {q:"What is a CTF?",opts:["Code The Flag","Capture The Flag — cybersecurity competition","Cyber Task Force","None"],ans:1,topic:"CTF"},
      {q:"What is a flag in CTF?",opts:["None","Prize","Secret string to capture for points","Answer"],ans:2,topic:"CTF"},
      {q:"What are CTF categories?",opts:["None","None","Attack, Defend","Web, Crypto, Pwn, Forensics, Reversing, Misc"],ans:3,topic:"CTF"},
      {q:"What is steganography in CTF?",opts:["Steg class","None","None","Hiding data inside images or audio files"],ans:3,topic:"CTF"},
      {q:"What is reversing in CTF?",opts:["Analyzing binaries to understand/exploit them","None","Reverse class","None"],ans:0,topic:"CTF"},
      {q:"What does HTTPS 'S' stand for?",opts:["Standard","Secure","Static","Simple"],ans:1,topic:"Networking"},
      {q:"What is a firewall?",opts:["Speed booster","Virus remover","None","Network traffic filter based on rules"],ans:3,topic:"Networking"},
      {q:"What is an IP address?",opts:["Website name","Email","Internet Password","Unique identifier for device on network"],ans:3,topic:"Networking"},
      {q:"What does DNS do?",opts:["None","Blocks attacks","Translates domain names to IP addresses","Encrypts data"],ans:2,topic:"Networking"},
      {q:"What is a VPN?",opts:["Speed booster","Virus Protection","None","Virtual Private Network encrypting traffic"],ans:3,topic:"Networking"},
      {q:"What is phishing?",opts:["Malware","Physical attack","Fake communications to steal credentials","DDoS"],ans:2,topic:"Social Engineering"},
      {q:"What is malware?",opts:["Good software","Update","Malicious software to damage or gain access","None"],ans:2,topic:"Threats"},
      {q:"What is a virus in cybersecurity?",opts:["Hardware fault","Network error","Self-replicating malicious program","None"],ans:2,topic:"Threats"},
      {q:"What does authentication mean?",opts:["Verifying who someone is","Authorization","None","Encrypting data"],ans:0,topic:"Security Basics"},
      {q:"What is a strong password?",opts:["Name only","Short and simple","Only numbers","Mix of upper/lower/numbers/symbols 12+ chars"],ans:3,topic:"Security Basics"},
      {q:"What is 2FA?",opts:["None","Two usernames","Two different verification methods","Two passwords"],ans:2,topic:"Authentication"},
      {q:"What is encryption?",opts:["None","Compressing data","Converting data to unreadable form using key","Deleting data"],ans:2,topic:"Cryptography"},
      {q:"What does SSL do?",opts:["Encrypts data between browser and server","None","Speeds connection","Compresses files"],ans:0,topic:"Cryptography"},
      {q:"What is a port in networking?",opts:["None","Physical connector only","Logical endpoint for specific service","Router"],ans:2,topic:"Networking"},
      {q:"HTTP status 404 means?",opts:["Success","Not found","Server error","Redirect"],ans:1,topic:"Web"},
      {q:"What is a cookie?",opts:["None","Small data stored by browser from website","Password","Malware"],ans:1,topic:"Web"},
      {q:"What is social engineering?",opts:["Hardware attack","Software attack","None","Manipulating people to reveal information"],ans:3,topic:"Social Engineering"},
      {q:"What is a DDoS attack?",opts:["Overwhelming server with traffic from many sources","Phishing","Database attack","None"],ans:0,topic:"Attacks"},
      {q:"What is antivirus software?",opts:["Speeds up PC","None","Backs up data","Detects and removes malicious software"],ans:3,topic:"Defense"},
      {q:"What does CIA triad stand for?",opts:["None","Common Internet Attacks","Confidentiality Integrity Availability","Computer Internet Access"],ans:2,topic:"Security Basics"},
      {q:"What is a trojan horse?",opts:["Malware disguised as legitimate software","Virus","Worm","None"],ans:0,topic:"Threats"},
      {q:"What is a worm?",opts:["Virus","None","Trojan","Self-replicating malware spreading across networks"],ans:3,topic:"Threats"},
      {q:"What is ransomware?",opts:["Adware","None","Encrypts files and demands payment","Spyware"],ans:2,topic:"Threats"},
      {q:"What is spyware?",opts:["Ransomware","None","Secretly monitors and steals user data","Adware"],ans:2,topic:"Threats"},
      {q:"What is adware?",opts:["Spyware","Displays unwanted advertisements","None","Ransomware"],ans:1,topic:"Threats"},
      {q:"What is a keylogger?",opts:["Network logger","Records keystrokes to steal passwords","None","Screen logger"],ans:1,topic:"Threats"},
      {q:"What is a rootkit?",opts:["None","Hides malware presence on system","Trojan","Virus"],ans:1,topic:"Threats"},
      {q:"What is a botnet?",opts:["Infected net","Bot network","Network of infected computers controlled remotely","None"],ans:2,topic:"Threats"},
      {q:"What is a zero-day exploit?",opts:["None","Attack using unknown unpatched vulnerability","Known exploit","Old exploit"],ans:1,topic:"Attacks"},
      {q:"What is patch management?",opts:["Keeping software updated to fix vulnerabilities","Patch creation","Software testing","None"],ans:0,topic:"Defense"},
      {q:"What is a DMZ in networking?",opts:["Military zone","Demilitarized zone — buffer between public and private","Double Mapped Zone","None"],ans:1,topic:"Networking"},
      {q:"What is NAT?",opts:["None","Network Allocation","None","Network Address Translation — maps private to public IP"],ans:3,topic:"Networking"},
      {q:"What is a subnet?",opts:["Subnet class","Sub network","None","Logical subdivision of network"],ans:3,topic:"Networking"},
      {q:"What is DHCP?",opts:["Domain Host","None","Automatically assigns IP addresses to devices","Dynamic Host Config"],ans:2,topic:"Networking"},
      {q:"What is a MAC address?",opts:["Machine Address","Hardware address of network interface","Media Address","None"],ans:1,topic:"Networking"},
      {q:"What is ARP?",opts:["Maps IP addresses to MAC addresses","None","Address Resolution Protocol","None"],ans:0,topic:"Networking"},
      {q:"What is ICMP?",opts:["Internet Control Message Protocol — ping uses it","None","None","Internet Control"],ans:0,topic:"Networking"},
      {q:"What is TCP vs UDP?",opts:["UDP is reliable","Same thing","TCP reliable ordered, UDP fast unreliable","None"],ans:2,topic:"Networking"},
      {q:"What is port 80?",opts:["SSH port","HTTPS port","FTP port","Default HTTP port"],ans:3,topic:"Networking"},
      {q:"What is port 443?",opts:["SSH port","Default HTTPS port","FTP port","HTTP port"],ans:1,topic:"Networking"},
      {q:"What is port 22?",opts:["FTP port","DNS port","HTTP port","SSH secure shell port"],ans:3,topic:"Networking"},
      {q:"What is port 21?",opts:["SSH port","FTP file transfer port","HTTP port","DNS port"],ans:1,topic:"Networking"},
      {q:"What is port 53?",opts:["DNS port","FTP port","HTTP port","SSH port"],ans:0,topic:"Networking"},
      {q:"What is port 25?",opts:["HTTP port","FTP port","DNS port","SMTP email port"],ans:3,topic:"Networking"},
      {q:"What is the OSI model?",opts:["7-layer framework for network communication","None","Open System Interface","Operating System Interface"],ans:0,topic:"Networking"},
      {q:"What is Layer 1 of OSI?",opts:["Data Link","Transport","Physical — cables, signals","Network"],ans:2,topic:"Networking"},
      {q:"What is Layer 3 of OSI?",opts:["Data Link","Physical","Transport","Network — IP routing"],ans:3,topic:"Networking"},
      {q:"What is Layer 4 of OSI?",opts:["Transport — TCP/UDP","Network","Session","Physical"],ans:0,topic:"Networking"},
      {q:"What is Layer 7 of OSI?",opts:["Transport","Session","Presentation","Application — HTTP, DNS, FTP"],ans:3,topic:"Networking"},
      {q:"What is the TCP/IP model?",opts:["OSI model","4-layer practical model — Link, Internet, Transport, App","None","IP model"],ans:1,topic:"Networking"},
      {q:"What is symmetric encryption?",opts:["None","Same key encrypts and decrypts","Different keys","No key needed"],ans:1,topic:"Cryptography"},
      {q:"What is asymmetric encryption?",opts:["Public key encrypts, private key decrypts","None","Same key","No key"],ans:0,topic:"Cryptography"},
      {q:"What is a public key?",opts:["Private key","None","Secret key","Shared openly for encryption"],ans:3,topic:"Cryptography"},
      {q:"What is a private key?",opts:["Kept secret for decryption","None","Shared key","Public key"],ans:0,topic:"Cryptography"},
      {q:"What is RSA?",opts:["Hash function","None","Asymmetric encryption algorithm","Symmetric encryption"],ans:2,topic:"Cryptography"},
      {q:"What is AES?",opts:["Advanced Encryption Standard — symmetric","None","Asymmetric","Hash function"],ans:0,topic:"Cryptography"},
      {q:"What is a hash function?",opts:["None","Two-way cipher","One-way fixed-size output from any input","Reversible encryption"],ans:2,topic:"Cryptography"},
      {q:"What is SHA-256?",opts:["Secure Hash Algorithm producing 256-bit hash","MD5 variant","SHA-128","None"],ans:0,topic:"Cryptography"},
      {q:"What is MD5?",opts:["None","Older hash algorithm (now considered weak)","Encryption algorithm","Firewall"],ans:1,topic:"Cryptography"},
      {q:"What is a digital signature?",opts:["None","Proves authenticity and integrity using private key","Written signature","Password"],ans:1,topic:"Cryptography"},
      {q:"What is PKI?",opts:["Public Key Internet","Public Key Infrastructure for certificate management","Private Key Infra","None"],ans:1,topic:"Cryptography"},
      {q:"What is a digital certificate?",opts:["Digital ID","Key certificate","Binds public key to identity — issued by CA","None"],ans:2,topic:"Cryptography"},
      {q:"What is a CA (Certificate Authority)?",opts:["None","Certificate App","Trusted entity issuing digital certificates","None"],ans:2,topic:"Cryptography"},
      {q:"What is TLS?",opts:["Transport Layer Security — successor to SSL","Total Layer","None","None"],ans:0,topic:"Cryptography"},
      {q:"What is a man-in-the-middle attack?",opts:["Attacker intercepts communication between two parties","None","Middle attack","Intercept attack"],ans:0,topic:"Attacks"},
      {q:"What is IP spoofing?",opts:["IP hiding","Faking source IP address to deceive","IP masking","None"],ans:1,topic:"Attacks"},
      {q:"What is ARP spoofing?",opts:["None","Sending fake ARP replies to redirect traffic","ARP attack","MAC attack"],ans:1,topic:"Attacks"},
      {q:"What is DNS spoofing?",opts:["IP attack","Injecting false DNS records to redirect users","DNS attack","None"],ans:1,topic:"Attacks"},
      {q:"What is a replay attack?",opts:["Retransmitting valid data to fool authentication","Copy attack","Repeat attack","None"],ans:0,topic:"Attacks"},
      {q:"What is session hijacking?",opts:["Cookie theft","Taking over authenticated user session","Token theft","None"],ans:1,topic:"Attacks"},
      {q:"What is clickjacking?",opts:["Hiding malicious elements under legitimate UI","None","Click attack","UI attack"],ans:0,topic:"Attacks"},
      {q:"What is a watering hole attack?",opts:["Site attack","Infecting websites targets frequently visit","Water attack","None"],ans:1,topic:"Attacks"},
      {q:"What is supply chain attack?",opts:["None","Compromising software before it reaches users","Source attack","Chain attack"],ans:1,topic:"Attacks"},
      {q:"What is OSINT?",opts:["None","Open Source Int","None","Open Source Intelligence — public info gathering"],ans:3,topic:"Reconnaissance"},
      {q:"What is Google dorking?",opts:["Advanced Google queries to find sensitive data","Google search","None","Google hacking"],ans:0,topic:"Reconnaissance"},
      {q:"What is Shodan?",opts:["None","Device finder","Shodan class","Search engine for internet-connected devices"],ans:3,topic:"Tools"},
      {q:"What is Maltego?",opts:["Visual link analysis for reconnaissance","None","None","Malware tool"],ans:0,topic:"Tools"},
      {q:"What is theHarvester?",opts:["None","Email and domain enumeration tool","None","Harvest tool"],ans:1,topic:"Tools"},
      {q:"What is Nmap?",opts:["Password cracker","Network discovery and port scanning tool","Code editor","None"],ans:1,topic:"Tools"},
      {q:"What is Metasploit?",opts:["Exploitation framework for security testing","Metadata tool","None","None"],ans:0,topic:"Tools"},
      {q:"What is Burp Suite?",opts:["Web application security testing proxy","Code editor","Network scanner","None"],ans:0,topic:"Tools"},
      {q:"What is Wireshark?",opts:["Password cracker","None","Code editor","Network packet analyzer"],ans:3,topic:"Tools"},
      {q:"What is John the Ripper?",opts:["Password manager","John software","None","Password cracking tool"],ans:3,topic:"Tools"},
      {q:"What is Hashcat?",opts:["None","GPU-accelerated password hash cracker","None","Hash tool"],ans:1,topic:"Tools"},
      {q:"What is Aircrack-ng?",opts:["WiFi network security testing suite","None","Air tool","None"],ans:0,topic:"Tools"},
      {q:"What is Hydra?",opts:["Hydra tool","None","None","Network login brute force tool"],ans:3,topic:"Tools"},
      {q:"What is Nikto?",opts:["Nikto class","None","Web server vulnerability scanner","Web tool"],ans:2,topic:"Tools"},
      {q:"What is SQLmap?",opts:["Automated SQL injection testing tool","None","SQL tool","None"],ans:0,topic:"Tools"},
      {q:"What is a CTF?",opts:["Code The Flag","Capture The Flag — cybersecurity competition","Cyber Task Force","None"],ans:1,topic:"CTF"},
      {q:"What is a flag in CTF?",opts:["None","Prize","Secret string to capture for points","Answer"],ans:2,topic:"CTF"},
      {q:"What are CTF categories?",opts:["None","None","Attack, Defend","Web, Crypto, Pwn, Forensics, Reversing, Misc"],ans:3,topic:"CTF"},
      {q:"What is steganography in CTF?",opts:["Steg class","None","None","Hiding data inside images or audio files"],ans:3,topic:"CTF"},
      {q:"What is reversing in CTF?",opts:["Analyzing binaries to understand/exploit them","None","Reverse class","None"],ans:0,topic:"CTF"},
      {q:"What does HTTPS 'S' stand for?",opts:["Standard","Secure","Static","Simple"],ans:1,topic:"Networking"},
      {q:"What is a firewall?",opts:["Speed booster","Virus remover","None","Network traffic filter based on rules"],ans:3,topic:"Networking"},
      {q:"What is an IP address?",opts:["Website name","Email","Internet Password","Unique identifier for device on network"],ans:3,topic:"Networking"},
      {q:"What does DNS do?",opts:["None","Blocks attacks","Translates domain names to IP addresses","Encrypts data"],ans:2,topic:"Networking"},
      {q:"What is a VPN?",opts:["Speed booster","Virus Protection","None","Virtual Private Network encrypting traffic"],ans:3,topic:"Networking"},
      {q:"What is phishing?",opts:["Malware","Physical attack","Fake communications to steal credentials","DDoS"],ans:2,topic:"Social Engineering"},
      {q:"What is malware?",opts:["Good software","Update","Malicious software to damage or gain access","None"],ans:2,topic:"Threats"},
      {q:"What is a virus in cybersecurity?",opts:["Hardware fault","Network error","Self-replicating malicious program","None"],ans:2,topic:"Threats"},
      {q:"What does authentication mean?",opts:["Verifying who someone is","Authorization","None","Encrypting data"],ans:0,topic:"Security Basics"},
      {q:"What is a strong password?",opts:["Name only","Short and simple","Only numbers","Mix of upper/lower/numbers/symbols 12+ chars"],ans:3,topic:"Security Basics"},
      {q:"What is 2FA?",opts:["None","Two usernames","Two different verification methods","Two passwords"],ans:2,topic:"Authentication"},
      {q:"What is encryption?",opts:["None","Compressing data","Converting data to unreadable form using key","Deleting data"],ans:2,topic:"Cryptography"},
      {q:"What does SSL do?",opts:["Encrypts data between browser and server","None","Speeds connection","Compresses files"],ans:0,topic:"Cryptography"},
      {q:"What is a port in networking?",opts:["None","Physical connector only","Logical endpoint for specific service","Router"],ans:2,topic:"Networking"},
    ],
    intermediate:[
      {q:"What is SQL injection?",opts:["Network flood","Server crash","Inserting malicious SQL to manipulate database","XSS"],ans:2,topic:"Web Attacks"},
      {q:"What is XSS?",opts:["None","Injecting malicious scripts into web pages others view","Server attack","SQL injection"],ans:1,topic:"Web Attacks"},
      {q:"What is CSRF?",opts:["Tricks authenticated user into unwanted action","Server error","XSS","None"],ans:0,topic:"Web Attacks"},
      {q:"What is SSRF?",opts:["SQL attack","Server Speed","Server makes unintended requests via user input","None"],ans:2,topic:"Web Attacks"},
      {q:"What is XXE?",opts:["CSS attack","SQL injection","None","XML External Entity — exploiting XML parsers"],ans:3,topic:"Web Attacks"},
      {q:"What is IDOR?",opts:["None","Attack type","Internal Design","Insecure Direct Object Reference — unauthorized access"],ans:3,topic:"Web Attacks"},
      {q:"What is path traversal?",opts:["None","../../../ to access files outside web root","Directory hack","File traversal"],ans:1,topic:"Web Attacks"},
      {q:"What is command injection?",opts:["None","Injecting OS commands via user input","SQL injection","Code injection"],ans:1,topic:"Web Attacks"},
      {q:"What is LDAP injection?",opts:["Injecting LDAP statements into directory queries","SQL variant","XSS","None"],ans:0,topic:"Web Attacks"},
      {q:"What is HTTP request smuggling?",opts:["None","Request attack","Sending ambiguous requests exploiting frontend-backend difference","None"],ans:2,topic:"Web Attacks"},
      {q:"What is clickjacking?",opts:["UI trick","None","Hiding malicious elements under legitimate UI","Click attack"],ans:2,topic:"Web Attacks"},
      {q:"What is open redirect?",opts:["Redirect attack","URL trick","Redirecting to attacker-controlled URL","None"],ans:2,topic:"Web Attacks"},
      {q:"What is OWASP Top 10?",opts:["List of 10 most critical web security risks","10 languages","None","10 tools"],ans:0,topic:"Web Security"},
      {q:"What is a WAF?",opts:["Web Antivirus","None","Web Application Firewall — filters HTTP traffic","None"],ans:2,topic:"Defense"},
      {q:"What is a honeypot?",opts:["Data trap","Decoy system to detect and study attackers","None","Bee trap"],ans:1,topic:"Defense"},
      {q:"What is intrusion detection?",opts:["Intrusion prevention","None","None","Monitoring for suspicious activity"],ans:3,topic:"Defense"},
      {q:"What is IDS vs IPS?",opts:["None","IDS detects, IPS also prevents","Same thing","IPS only detects"],ans:1,topic:"Defense"},
      {q:"What is SIEM?",opts:["None","Security software","Security Info and Event Management — log correlation","None"],ans:2,topic:"Defense"},
      {q:"What is threat hunting?",opts:["Proactively searching for threats in network","Passive defense","Auto detection","None"],ans:0,topic:"Defense"},
      {q:"What is vulnerability assessment?",opts:["Identifying and prioritizing vulnerabilities","Penetration test","Threat hunt","None"],ans:0,topic:"Assessment"},
      {q:"What is penetration testing?",opts:["None","Database test","Speed test","Authorized simulated attack to find weaknesses"],ans:3,topic:"Assessment"},
      {q:"What is a CVE?",opts:["Code Vulnerability","Common Vulnerabilities and Exposures — public database","None","None"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is CVSS score?",opts:["CVE score","Numerical severity rating for vulnerabilities","None","None"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is responsible disclosure?",opts:["Disclosure","Reporting vulnerabilities to vendor before public","None","Bug report"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is bug bounty?",opts:["Test payment","Program paying researchers to find vulnerabilities","None","Bug fix payment"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is port scanning?",opts:["None","Finding open ports on target for reconnaissance","Encryption","Physical scan"],ans:1,topic:"Reconnaissance"},
      {q:"What is banner grabbing?",opts:["Info grab","Collecting service/version info from open ports","Banner attack","None"],ans:1,topic:"Reconnaissance"},
      {q:"What is fingerprinting?",opts:["ID check","Identifying OS and software from network behavior","Fingerprint steal","None"],ans:1,topic:"Reconnaissance"},
      {q:"What is fuzzing?",opts:["Blurring data","Automated testing with random inputs to find crashes","None","Encryption"],ans:1,topic:"Testing"},
      {q:"What is static analysis?",opts:["Analyzing code without executing it","Code review","None","Dynamic analysis"],ans:0,topic:"Malware Analysis"},
      {q:"What is dynamic analysis?",opts:["Code review","None","Analyzing software behavior during execution","Static analysis"],ans:2,topic:"Malware Analysis"},
      {q:"What is a sandbox?",opts:["Safe box","Isolated environment for safely running malware","Secure container","None"],ans:1,topic:"Malware Analysis"},
      {q:"What is reverse engineering?",opts:["None","Code analysis","Understanding binary without source code","Decompiling"],ans:2,topic:"Reversing"},
      {q:"What is a disassembler?",opts:["Decompiler","None","Converts machine code to assembly language","Debugger"],ans:2,topic:"Reversing Tools"},
      {q:"What is a decompiler?",opts:["Converts machine code to high-level language","Debugger","Disassembler","None"],ans:0,topic:"Reversing Tools"},
      {q:"What is GDB?",opts:["GNU Debugger for binary analysis","G debugger","GNU Database","None"],ans:0,topic:"Reversing Tools"},
      {q:"What is IDA Pro?",opts:["IDA class","None","Industry-standard disassembler/decompiler","None"],ans:2,topic:"Reversing Tools"},
      {q:"What is Ghidra?",opts:["None","Ghost tool","None","NSA's free reverse engineering framework"],ans:3,topic:"Reversing Tools"},
      {q:"What is x64dbg?",opts:["None","None","64 debugger","Windows binary debugger for malware analysis"],ans:3,topic:"Reversing Tools"},
      {q:"What is a buffer overflow?",opts:["Array error","Memory error","Writing beyond buffer to overwrite adjacent memory","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is a stack buffer overflow?",opts:["Stack error","Overwriting return address on stack","None","Buffer error"],ans:1,topic:"Binary Exploitation"},
      {q:"What is a heap overflow?",opts:["Buffer error","None","Heap error","Overwriting heap metadata or adjacent chunks"],ans:3,topic:"Binary Exploitation"},
      {q:"What is ASLR?",opts:["None","ASLR class","None","Address Space Layout Randomization — randomizes addresses"],ans:3,topic:"Mitigations"},
      {q:"What is DEP/NX?",opts:["None","Data Execution Prevention — marks memory non-executable","None","No Execute"],ans:1,topic:"Mitigations"},
      {q:"What is stack canary?",opts:["None","Random value detecting stack smashing","None","Stack guard"],ans:1,topic:"Mitigations"},
      {q:"What is PIE?",opts:["Position Independent Executable — enables ASLR for binary","None","PIE chart","None"],ans:0,topic:"Mitigations"},
      {q:"What is ROP?",opts:["None","None","Return attack","Return-Oriented Programming — chains existing code gadgets"],ans:3,topic:"Binary Exploitation"},
      {q:"What is ret2libc?",opts:["None","None","Exploit redirecting to libc function like system()","Return to lib"],ans:2,topic:"Binary Exploitation"},
      {q:"What is heap spraying?",opts:["Heap fill","None","Filling heap with shellcode for reliable exploitation","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is a format string vulnerability?",opts:["None","None","Improper printf allows memory read/write","String error"],ans:2,topic:"Binary Exploitation"},
      {q:"What is Use-After-Free?",opts:["Using freed memory — can lead to code execution","UAF","None","None"],ans:0,topic:"Binary Exploitation"},
      {q:"What is SQL injection?",opts:["Network flood","Server crash","Inserting malicious SQL to manipulate database","XSS"],ans:2,topic:"Web Attacks"},
      {q:"What is XSS?",opts:["None","Injecting malicious scripts into web pages others view","Server attack","SQL injection"],ans:1,topic:"Web Attacks"},
      {q:"What is CSRF?",opts:["Tricks authenticated user into unwanted action","Server error","XSS","None"],ans:0,topic:"Web Attacks"},
      {q:"What is SSRF?",opts:["SQL attack","Server Speed","Server makes unintended requests via user input","None"],ans:2,topic:"Web Attacks"},
      {q:"What is XXE?",opts:["CSS attack","SQL injection","None","XML External Entity — exploiting XML parsers"],ans:3,topic:"Web Attacks"},
      {q:"What is IDOR?",opts:["None","Attack type","Internal Design","Insecure Direct Object Reference — unauthorized access"],ans:3,topic:"Web Attacks"},
      {q:"What is path traversal?",opts:["None","../../../ to access files outside web root","Directory hack","File traversal"],ans:1,topic:"Web Attacks"},
      {q:"What is command injection?",opts:["None","Injecting OS commands via user input","SQL injection","Code injection"],ans:1,topic:"Web Attacks"},
      {q:"What is LDAP injection?",opts:["Injecting LDAP statements into directory queries","SQL variant","XSS","None"],ans:0,topic:"Web Attacks"},
      {q:"What is HTTP request smuggling?",opts:["None","Request attack","Sending ambiguous requests exploiting frontend-backend difference","None"],ans:2,topic:"Web Attacks"},
      {q:"What is clickjacking?",opts:["UI trick","None","Hiding malicious elements under legitimate UI","Click attack"],ans:2,topic:"Web Attacks"},
      {q:"What is open redirect?",opts:["Redirect attack","URL trick","Redirecting to attacker-controlled URL","None"],ans:2,topic:"Web Attacks"},
      {q:"What is OWASP Top 10?",opts:["List of 10 most critical web security risks","10 languages","None","10 tools"],ans:0,topic:"Web Security"},
      {q:"What is a WAF?",opts:["Web Antivirus","None","Web Application Firewall — filters HTTP traffic","None"],ans:2,topic:"Defense"},
      {q:"What is a honeypot?",opts:["Data trap","Decoy system to detect and study attackers","None","Bee trap"],ans:1,topic:"Defense"},
      {q:"What is intrusion detection?",opts:["Intrusion prevention","None","None","Monitoring for suspicious activity"],ans:3,topic:"Defense"},
      {q:"What is IDS vs IPS?",opts:["None","IDS detects, IPS also prevents","Same thing","IPS only detects"],ans:1,topic:"Defense"},
      {q:"What is SIEM?",opts:["None","Security software","Security Info and Event Management — log correlation","None"],ans:2,topic:"Defense"},
      {q:"What is threat hunting?",opts:["Proactively searching for threats in network","Passive defense","Auto detection","None"],ans:0,topic:"Defense"},
      {q:"What is vulnerability assessment?",opts:["Identifying and prioritizing vulnerabilities","Penetration test","Threat hunt","None"],ans:0,topic:"Assessment"},
      {q:"What is penetration testing?",opts:["None","Database test","Speed test","Authorized simulated attack to find weaknesses"],ans:3,topic:"Assessment"},
      {q:"What is a CVE?",opts:["Code Vulnerability","Common Vulnerabilities and Exposures — public database","None","None"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is CVSS score?",opts:["CVE score","Numerical severity rating for vulnerabilities","None","None"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is responsible disclosure?",opts:["Disclosure","Reporting vulnerabilities to vendor before public","None","Bug report"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is bug bounty?",opts:["Test payment","Program paying researchers to find vulnerabilities","None","Bug fix payment"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is port scanning?",opts:["None","Finding open ports on target for reconnaissance","Encryption","Physical scan"],ans:1,topic:"Reconnaissance"},
      {q:"What is banner grabbing?",opts:["Info grab","Collecting service/version info from open ports","Banner attack","None"],ans:1,topic:"Reconnaissance"},
      {q:"What is fingerprinting?",opts:["ID check","Identifying OS and software from network behavior","Fingerprint steal","None"],ans:1,topic:"Reconnaissance"},
      {q:"What is fuzzing?",opts:["Blurring data","Automated testing with random inputs to find crashes","None","Encryption"],ans:1,topic:"Testing"},
      {q:"What is static analysis?",opts:["Analyzing code without executing it","Code review","None","Dynamic analysis"],ans:0,topic:"Malware Analysis"},
      {q:"What is dynamic analysis?",opts:["Code review","None","Analyzing software behavior during execution","Static analysis"],ans:2,topic:"Malware Analysis"},
      {q:"What is a sandbox?",opts:["Safe box","Isolated environment for safely running malware","Secure container","None"],ans:1,topic:"Malware Analysis"},
      {q:"What is reverse engineering?",opts:["None","Code analysis","Understanding binary without source code","Decompiling"],ans:2,topic:"Reversing"},
      {q:"What is a disassembler?",opts:["Decompiler","None","Converts machine code to assembly language","Debugger"],ans:2,topic:"Reversing Tools"},
      {q:"What is a decompiler?",opts:["Converts machine code to high-level language","Debugger","Disassembler","None"],ans:0,topic:"Reversing Tools"},
      {q:"What is GDB?",opts:["GNU Debugger for binary analysis","G debugger","GNU Database","None"],ans:0,topic:"Reversing Tools"},
      {q:"What is IDA Pro?",opts:["IDA class","None","Industry-standard disassembler/decompiler","None"],ans:2,topic:"Reversing Tools"},
      {q:"What is Ghidra?",opts:["None","Ghost tool","None","NSA's free reverse engineering framework"],ans:3,topic:"Reversing Tools"},
      {q:"What is x64dbg?",opts:["None","None","64 debugger","Windows binary debugger for malware analysis"],ans:3,topic:"Reversing Tools"},
      {q:"What is a buffer overflow?",opts:["Array error","Memory error","Writing beyond buffer to overwrite adjacent memory","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is a stack buffer overflow?",opts:["Stack error","Overwriting return address on stack","None","Buffer error"],ans:1,topic:"Binary Exploitation"},
      {q:"What is a heap overflow?",opts:["Buffer error","None","Heap error","Overwriting heap metadata or adjacent chunks"],ans:3,topic:"Binary Exploitation"},
      {q:"What is ASLR?",opts:["None","ASLR class","None","Address Space Layout Randomization — randomizes addresses"],ans:3,topic:"Mitigations"},
      {q:"What is DEP/NX?",opts:["None","Data Execution Prevention — marks memory non-executable","None","No Execute"],ans:1,topic:"Mitigations"},
      {q:"What is stack canary?",opts:["None","Random value detecting stack smashing","None","Stack guard"],ans:1,topic:"Mitigations"},
      {q:"What is PIE?",opts:["Position Independent Executable — enables ASLR for binary","None","PIE chart","None"],ans:0,topic:"Mitigations"},
      {q:"What is ROP?",opts:["None","None","Return attack","Return-Oriented Programming — chains existing code gadgets"],ans:3,topic:"Binary Exploitation"},
      {q:"What is ret2libc?",opts:["None","None","Exploit redirecting to libc function like system()","Return to lib"],ans:2,topic:"Binary Exploitation"},
      {q:"What is heap spraying?",opts:["Heap fill","None","Filling heap with shellcode for reliable exploitation","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is a format string vulnerability?",opts:["None","None","Improper printf allows memory read/write","String error"],ans:2,topic:"Binary Exploitation"},
      {q:"What is Use-After-Free?",opts:["Using freed memory — can lead to code execution","UAF","None","None"],ans:0,topic:"Binary Exploitation"},
      {q:"What is SQL injection?",opts:["Network flood","Server crash","Inserting malicious SQL to manipulate database","XSS"],ans:2,topic:"Web Attacks"},
      {q:"What is XSS?",opts:["None","Injecting malicious scripts into web pages others view","Server attack","SQL injection"],ans:1,topic:"Web Attacks"},
      {q:"What is CSRF?",opts:["Tricks authenticated user into unwanted action","Server error","XSS","None"],ans:0,topic:"Web Attacks"},
      {q:"What is SSRF?",opts:["SQL attack","Server Speed","Server makes unintended requests via user input","None"],ans:2,topic:"Web Attacks"},
      {q:"What is XXE?",opts:["CSS attack","SQL injection","None","XML External Entity — exploiting XML parsers"],ans:3,topic:"Web Attacks"},
      {q:"What is IDOR?",opts:["None","Attack type","Internal Design","Insecure Direct Object Reference — unauthorized access"],ans:3,topic:"Web Attacks"},
      {q:"What is path traversal?",opts:["None","../../../ to access files outside web root","Directory hack","File traversal"],ans:1,topic:"Web Attacks"},
      {q:"What is command injection?",opts:["None","Injecting OS commands via user input","SQL injection","Code injection"],ans:1,topic:"Web Attacks"},
      {q:"What is LDAP injection?",opts:["Injecting LDAP statements into directory queries","SQL variant","XSS","None"],ans:0,topic:"Web Attacks"},
      {q:"What is HTTP request smuggling?",opts:["None","Request attack","Sending ambiguous requests exploiting frontend-backend difference","None"],ans:2,topic:"Web Attacks"},
      {q:"What is clickjacking?",opts:["UI trick","None","Hiding malicious elements under legitimate UI","Click attack"],ans:2,topic:"Web Attacks"},
      {q:"What is open redirect?",opts:["Redirect attack","URL trick","Redirecting to attacker-controlled URL","None"],ans:2,topic:"Web Attacks"},
      {q:"What is OWASP Top 10?",opts:["List of 10 most critical web security risks","10 languages","None","10 tools"],ans:0,topic:"Web Security"},
      {q:"What is a WAF?",opts:["Web Antivirus","None","Web Application Firewall — filters HTTP traffic","None"],ans:2,topic:"Defense"},
      {q:"What is a honeypot?",opts:["Data trap","Decoy system to detect and study attackers","None","Bee trap"],ans:1,topic:"Defense"},
      {q:"What is intrusion detection?",opts:["Intrusion prevention","None","None","Monitoring for suspicious activity"],ans:3,topic:"Defense"},
      {q:"What is IDS vs IPS?",opts:["None","IDS detects, IPS also prevents","Same thing","IPS only detects"],ans:1,topic:"Defense"},
      {q:"What is SIEM?",opts:["None","Security software","Security Info and Event Management — log correlation","None"],ans:2,topic:"Defense"},
      {q:"What is threat hunting?",opts:["Proactively searching for threats in network","Passive defense","Auto detection","None"],ans:0,topic:"Defense"},
      {q:"What is vulnerability assessment?",opts:["Identifying and prioritizing vulnerabilities","Penetration test","Threat hunt","None"],ans:0,topic:"Assessment"},
      {q:"What is penetration testing?",opts:["None","Database test","Speed test","Authorized simulated attack to find weaknesses"],ans:3,topic:"Assessment"},
      {q:"What is a CVE?",opts:["Code Vulnerability","Common Vulnerabilities and Exposures — public database","None","None"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is CVSS score?",opts:["CVE score","Numerical severity rating for vulnerabilities","None","None"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is responsible disclosure?",opts:["Disclosure","Reporting vulnerabilities to vendor before public","None","Bug report"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is bug bounty?",opts:["Test payment","Program paying researchers to find vulnerabilities","None","Bug fix payment"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is port scanning?",opts:["None","Finding open ports on target for reconnaissance","Encryption","Physical scan"],ans:1,topic:"Reconnaissance"},
      {q:"What is banner grabbing?",opts:["Info grab","Collecting service/version info from open ports","Banner attack","None"],ans:1,topic:"Reconnaissance"},
      {q:"What is fingerprinting?",opts:["ID check","Identifying OS and software from network behavior","Fingerprint steal","None"],ans:1,topic:"Reconnaissance"},
      {q:"What is fuzzing?",opts:["Blurring data","Automated testing with random inputs to find crashes","None","Encryption"],ans:1,topic:"Testing"},
      {q:"What is static analysis?",opts:["Analyzing code without executing it","Code review","None","Dynamic analysis"],ans:0,topic:"Malware Analysis"},
      {q:"What is dynamic analysis?",opts:["Code review","None","Analyzing software behavior during execution","Static analysis"],ans:2,topic:"Malware Analysis"},
      {q:"What is a sandbox?",opts:["Safe box","Isolated environment for safely running malware","Secure container","None"],ans:1,topic:"Malware Analysis"},
      {q:"What is reverse engineering?",opts:["None","Code analysis","Understanding binary without source code","Decompiling"],ans:2,topic:"Reversing"},
      {q:"What is a disassembler?",opts:["Decompiler","None","Converts machine code to assembly language","Debugger"],ans:2,topic:"Reversing Tools"},
      {q:"What is a decompiler?",opts:["Converts machine code to high-level language","Debugger","Disassembler","None"],ans:0,topic:"Reversing Tools"},
      {q:"What is GDB?",opts:["GNU Debugger for binary analysis","G debugger","GNU Database","None"],ans:0,topic:"Reversing Tools"},
      {q:"What is IDA Pro?",opts:["IDA class","None","Industry-standard disassembler/decompiler","None"],ans:2,topic:"Reversing Tools"},
      {q:"What is Ghidra?",opts:["None","Ghost tool","None","NSA's free reverse engineering framework"],ans:3,topic:"Reversing Tools"},
      {q:"What is x64dbg?",opts:["None","None","64 debugger","Windows binary debugger for malware analysis"],ans:3,topic:"Reversing Tools"},
      {q:"What is a buffer overflow?",opts:["Array error","Memory error","Writing beyond buffer to overwrite adjacent memory","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is a stack buffer overflow?",opts:["Stack error","Overwriting return address on stack","None","Buffer error"],ans:1,topic:"Binary Exploitation"},
      {q:"What is a heap overflow?",opts:["Buffer error","None","Heap error","Overwriting heap metadata or adjacent chunks"],ans:3,topic:"Binary Exploitation"},
      {q:"What is ASLR?",opts:["None","ASLR class","None","Address Space Layout Randomization — randomizes addresses"],ans:3,topic:"Mitigations"},
      {q:"What is DEP/NX?",opts:["None","Data Execution Prevention — marks memory non-executable","None","No Execute"],ans:1,topic:"Mitigations"},
      {q:"What is stack canary?",opts:["None","Random value detecting stack smashing","None","Stack guard"],ans:1,topic:"Mitigations"},
      {q:"What is PIE?",opts:["Position Independent Executable — enables ASLR for binary","None","PIE chart","None"],ans:0,topic:"Mitigations"},
      {q:"What is ROP?",opts:["None","None","Return attack","Return-Oriented Programming — chains existing code gadgets"],ans:3,topic:"Binary Exploitation"},
      {q:"What is ret2libc?",opts:["None","None","Exploit redirecting to libc function like system()","Return to lib"],ans:2,topic:"Binary Exploitation"},
      {q:"What is heap spraying?",opts:["Heap fill","None","Filling heap with shellcode for reliable exploitation","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is a format string vulnerability?",opts:["None","None","Improper printf allows memory read/write","String error"],ans:2,topic:"Binary Exploitation"},
      {q:"What is Use-After-Free?",opts:["Using freed memory — can lead to code execution","UAF","None","None"],ans:0,topic:"Binary Exploitation"},
      {q:"What is SQL injection?",opts:["Network flood","Server crash","Inserting malicious SQL to manipulate database","XSS"],ans:2,topic:"Web Attacks"},
      {q:"What is XSS?",opts:["None","Injecting malicious scripts into web pages others view","Server attack","SQL injection"],ans:1,topic:"Web Attacks"},
      {q:"What is CSRF?",opts:["Tricks authenticated user into unwanted action","Server error","XSS","None"],ans:0,topic:"Web Attacks"},
      {q:"What is SSRF?",opts:["SQL attack","Server Speed","Server makes unintended requests via user input","None"],ans:2,topic:"Web Attacks"},
      {q:"What is XXE?",opts:["CSS attack","SQL injection","None","XML External Entity — exploiting XML parsers"],ans:3,topic:"Web Attacks"},
      {q:"What is IDOR?",opts:["None","Attack type","Internal Design","Insecure Direct Object Reference — unauthorized access"],ans:3,topic:"Web Attacks"},
      {q:"What is path traversal?",opts:["None","../../../ to access files outside web root","Directory hack","File traversal"],ans:1,topic:"Web Attacks"},
      {q:"What is command injection?",opts:["None","Injecting OS commands via user input","SQL injection","Code injection"],ans:1,topic:"Web Attacks"},
      {q:"What is LDAP injection?",opts:["Injecting LDAP statements into directory queries","SQL variant","XSS","None"],ans:0,topic:"Web Attacks"},
      {q:"What is HTTP request smuggling?",opts:["None","Request attack","Sending ambiguous requests exploiting frontend-backend difference","None"],ans:2,topic:"Web Attacks"},
      {q:"What is clickjacking?",opts:["UI trick","None","Hiding malicious elements under legitimate UI","Click attack"],ans:2,topic:"Web Attacks"},
      {q:"What is open redirect?",opts:["Redirect attack","URL trick","Redirecting to attacker-controlled URL","None"],ans:2,topic:"Web Attacks"},
      {q:"What is OWASP Top 10?",opts:["List of 10 most critical web security risks","10 languages","None","10 tools"],ans:0,topic:"Web Security"},
      {q:"What is a WAF?",opts:["Web Antivirus","None","Web Application Firewall — filters HTTP traffic","None"],ans:2,topic:"Defense"},
      {q:"What is a honeypot?",opts:["Data trap","Decoy system to detect and study attackers","None","Bee trap"],ans:1,topic:"Defense"},
      {q:"What is intrusion detection?",opts:["Intrusion prevention","None","None","Monitoring for suspicious activity"],ans:3,topic:"Defense"},
      {q:"What is IDS vs IPS?",opts:["None","IDS detects, IPS also prevents","Same thing","IPS only detects"],ans:1,topic:"Defense"},
      {q:"What is SIEM?",opts:["None","Security software","Security Info and Event Management — log correlation","None"],ans:2,topic:"Defense"},
      {q:"What is threat hunting?",opts:["Proactively searching for threats in network","Passive defense","Auto detection","None"],ans:0,topic:"Defense"},
      {q:"What is vulnerability assessment?",opts:["Identifying and prioritizing vulnerabilities","Penetration test","Threat hunt","None"],ans:0,topic:"Assessment"},
      {q:"What is penetration testing?",opts:["None","Database test","Speed test","Authorized simulated attack to find weaknesses"],ans:3,topic:"Assessment"},
      {q:"What is a CVE?",opts:["Code Vulnerability","Common Vulnerabilities and Exposures — public database","None","None"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is CVSS score?",opts:["CVE score","Numerical severity rating for vulnerabilities","None","None"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is responsible disclosure?",opts:["Disclosure","Reporting vulnerabilities to vendor before public","None","Bug report"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is bug bounty?",opts:["Test payment","Program paying researchers to find vulnerabilities","None","Bug fix payment"],ans:1,topic:"Vulnerability Mgmt"},
      {q:"What is port scanning?",opts:["None","Finding open ports on target for reconnaissance","Encryption","Physical scan"],ans:1,topic:"Reconnaissance"},
      {q:"What is banner grabbing?",opts:["Info grab","Collecting service/version info from open ports","Banner attack","None"],ans:1,topic:"Reconnaissance"},
      {q:"What is fingerprinting?",opts:["ID check","Identifying OS and software from network behavior","Fingerprint steal","None"],ans:1,topic:"Reconnaissance"},
      {q:"What is fuzzing?",opts:["Blurring data","Automated testing with random inputs to find crashes","None","Encryption"],ans:1,topic:"Testing"},
      {q:"What is static analysis?",opts:["Analyzing code without executing it","Code review","None","Dynamic analysis"],ans:0,topic:"Malware Analysis"},
      {q:"What is dynamic analysis?",opts:["Code review","None","Analyzing software behavior during execution","Static analysis"],ans:2,topic:"Malware Analysis"},
      {q:"What is a sandbox?",opts:["Safe box","Isolated environment for safely running malware","Secure container","None"],ans:1,topic:"Malware Analysis"},
      {q:"What is reverse engineering?",opts:["None","Code analysis","Understanding binary without source code","Decompiling"],ans:2,topic:"Reversing"},
      {q:"What is a disassembler?",opts:["Decompiler","None","Converts machine code to assembly language","Debugger"],ans:2,topic:"Reversing Tools"},
      {q:"What is a decompiler?",opts:["Converts machine code to high-level language","Debugger","Disassembler","None"],ans:0,topic:"Reversing Tools"},
      {q:"What is GDB?",opts:["GNU Debugger for binary analysis","G debugger","GNU Database","None"],ans:0,topic:"Reversing Tools"},
      {q:"What is IDA Pro?",opts:["IDA class","None","Industry-standard disassembler/decompiler","None"],ans:2,topic:"Reversing Tools"},
      {q:"What is Ghidra?",opts:["None","Ghost tool","None","NSA's free reverse engineering framework"],ans:3,topic:"Reversing Tools"},
      {q:"What is x64dbg?",opts:["None","None","64 debugger","Windows binary debugger for malware analysis"],ans:3,topic:"Reversing Tools"},
      {q:"What is a buffer overflow?",opts:["Array error","Memory error","Writing beyond buffer to overwrite adjacent memory","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is a stack buffer overflow?",opts:["Stack error","Overwriting return address on stack","None","Buffer error"],ans:1,topic:"Binary Exploitation"},
      {q:"What is a heap overflow?",opts:["Buffer error","None","Heap error","Overwriting heap metadata or adjacent chunks"],ans:3,topic:"Binary Exploitation"},
      {q:"What is ASLR?",opts:["None","ASLR class","None","Address Space Layout Randomization — randomizes addresses"],ans:3,topic:"Mitigations"},
      {q:"What is DEP/NX?",opts:["None","Data Execution Prevention — marks memory non-executable","None","No Execute"],ans:1,topic:"Mitigations"},
      {q:"What is stack canary?",opts:["None","Random value detecting stack smashing","None","Stack guard"],ans:1,topic:"Mitigations"},
      {q:"What is PIE?",opts:["Position Independent Executable — enables ASLR for binary","None","PIE chart","None"],ans:0,topic:"Mitigations"},
      {q:"What is ROP?",opts:["None","None","Return attack","Return-Oriented Programming — chains existing code gadgets"],ans:3,topic:"Binary Exploitation"},
    ],
    advanced:[
      {q:"What is kernel exploitation?",opts:["Exploiting OS kernel for ring 0 privilege","OS exploit","None","Kernel attack"],ans:0,topic:"Advanced Exploitation"},
      {q:"What is a kernel module exploit?",opts:["Exploiting loadable kernel modules","Module attack","None","None"],ans:0,topic:"Advanced Exploitation"},
      {q:"What is SMEP?",opts:["None","SMEP class","None","Supervisor Mode Execution Prevention"],ans:3,topic:"Kernel Mitigations"},
      {q:"What is SMAP?",opts:["None","None","SMAP class","Supervisor Mode Access Prevention"],ans:3,topic:"Kernel Mitigations"},
      {q:"What is KPTI?",opts:["None","None","Kernel Page Table Isolation — Meltdown mitigation","KPTI class"],ans:2,topic:"Kernel Mitigations"},
      {q:"What is a race condition exploit?",opts:["None","Race exploit","Exploiting time-of-check to time-of-use gap","TOCTOU"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is a side-channel attack?",opts:["None","Side attack","Extracting secrets via physical measurements","None"],ans:2,topic:"Advanced Attacks"},
      {q:"What is Spectre?",opts:["Exploits speculative execution to leak memory","None","Meltdown variant","None"],ans:0,topic:"Hardware Attacks"},
      {q:"What is Meltdown?",opts:["Spectre variant","None","None","Exploits out-of-order execution to read kernel memory"],ans:3,topic:"Hardware Attacks"},
      {q:"What is Rowhammer?",opts:["Inducing bit flips in DRAM via repeated access","Row attack","None","None"],ans:0,topic:"Hardware Attacks"},
      {q:"What is a timing attack?",opts:["Measuring execution time to extract secrets","None","Time attack","None"],ans:0,topic:"Side Channel"},
      {q:"What is a power analysis attack?",opts:["Power attack","Measuring power consumption to break crypto","None","None"],ans:1,topic:"Side Channel"},
      {q:"What is electromagnetic analysis?",opts:["None","EM attack","None","Using EM emissions to extract secrets"],ans:3,topic:"Side Channel"},
      {q:"What is fault injection?",opts:["None","Fault attack","Inducing hardware faults to bypass security","None"],ans:2,topic:"Hardware Attacks"},
      {q:"What is glitching?",opts:["None","Voltage/clock glitch to skip security checks","None","Glitch attack"],ans:1,topic:"Hardware Attacks"},
      {q:"What is JTAG debugging?",opts:["Hardware debugging interface often left open","None","JTAG class","None"],ans:0,topic:"Hardware Security"},
      {q:"What is firmware analysis?",opts:["None","Extracting and analyzing embedded device firmware","Firmware hack","None"],ans:1,topic:"Embedded Security"},
      {q:"What is binary diffing?",opts:["None","Comparing binaries to find patch differences","Binary compare","None"],ans:1,topic:"Reversing"},
      {q:"What is symbolic execution?",opts:["None","Symbol exec","None","Executing program with symbolic inputs to find all paths"],ans:3,topic:"Program Analysis"},
      {q:"What is taint analysis?",opts:["Taint class","None","None","Tracking how user input flows through program"],ans:3,topic:"Program Analysis"},
      {q:"What is fuzzing coverage?",opts:["None","Measuring code paths exercised during fuzzing","Fuzz coverage","None"],ans:1,topic:"Fuzzing"},
      {q:"What is AFL?",opts:["AFL class","None","American Fuzzy Lop — coverage-guided fuzzer","None"],ans:2,topic:"Fuzzing"},
      {q:"What is libFuzzer?",opts:["None","Lib fuzzer","LLVM-based in-process coverage-guided fuzzer","None"],ans:2,topic:"Fuzzing"},
      {q:"What is a heap metadata attack?",opts:["None","Heap meta","None","Corrupting heap chunk headers for exploitation"],ans:3,topic:"Advanced Exploitation"},
      {q:"What is tcache poisoning?",opts:["None","Cache poison","Corrupting glibc tcache for arbitrary allocation","None"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is house of force?",opts:["None","None","Heap exploit using top chunk manipulation","Force house"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is FSOP?",opts:["File exploit","File Structure Oriented Programming — exploiting FILE*","None","None"],ans:1,topic:"Advanced Exploitation"},
      {q:"What is JOP?",opts:["Jump exploit","Jump-Oriented Programming — variant of ROP","None","None"],ans:1,topic:"Advanced Exploitation"},
      {q:"What is COOP?",opts:["COOP class","None","None","Counterfeit Object-Oriented Programming"],ans:3,topic:"Advanced Exploitation"},
      {q:"What is heap grooming?",opts:["Heap setup","None","Arranging heap layout for reliable exploitation","None"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is type confusion?",opts:["Treating object as wrong type for exploitation","None","None","Type error"],ans:0,topic:"Advanced Exploitation"},
      {q:"What is an information leak?",opts:["None","Info attack","None","Bypassing ASLR by leaking memory addresses"],ans:3,topic:"Exploitation Techniques"},
      {q:"What is ROP chain?",opts:["None","None","Chain exploit","Sequence of gadgets redirecting control flow"],ans:3,topic:"Binary Exploitation"},
      {q:"What is a gadget in ROP?",opts:["ROP piece","None","Short instruction sequence ending in ret","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is ret2plt?",opts:["PLT exploit","None","Redirecting to PLT entry for code execution","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is GOT overwrite?",opts:["None","None","GOT attack","Writing function pointer in GOT for control flow"],ans:3,topic:"Binary Exploitation"},
      {q:"What is one_gadget?",opts:["None","Magic gadget","Magic gadget in libc giving shell in one call","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is pwntools?",opts:["None","Python library for CTF binary exploitation","None","PWN tools"],ans:1,topic:"CTF Tools"},
      {q:"What is pwndbg?",opts:["PWN debug","None","None","Enhanced GDB for exploit development"],ans:3,topic:"CTF Tools"},
      {q:"What is ROPgadget?",opts:["Tool for finding ROP gadgets in binaries","None","None","Gadget finder"],ans:0,topic:"CTF Tools"},
      {q:"What is kernel exploitation?",opts:["Exploiting OS kernel for ring 0 privilege","OS exploit","None","Kernel attack"],ans:0,topic:"Advanced Exploitation"},
      {q:"What is a kernel module exploit?",opts:["Exploiting loadable kernel modules","Module attack","None","None"],ans:0,topic:"Advanced Exploitation"},
      {q:"What is SMEP?",opts:["None","SMEP class","None","Supervisor Mode Execution Prevention"],ans:3,topic:"Kernel Mitigations"},
      {q:"What is SMAP?",opts:["None","None","SMAP class","Supervisor Mode Access Prevention"],ans:3,topic:"Kernel Mitigations"},
      {q:"What is KPTI?",opts:["None","None","Kernel Page Table Isolation — Meltdown mitigation","KPTI class"],ans:2,topic:"Kernel Mitigations"},
      {q:"What is a race condition exploit?",opts:["None","Race exploit","Exploiting time-of-check to time-of-use gap","TOCTOU"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is a side-channel attack?",opts:["None","Side attack","Extracting secrets via physical measurements","None"],ans:2,topic:"Advanced Attacks"},
      {q:"What is Spectre?",opts:["Exploits speculative execution to leak memory","None","Meltdown variant","None"],ans:0,topic:"Hardware Attacks"},
      {q:"What is Meltdown?",opts:["Spectre variant","None","None","Exploits out-of-order execution to read kernel memory"],ans:3,topic:"Hardware Attacks"},
      {q:"What is Rowhammer?",opts:["Inducing bit flips in DRAM via repeated access","Row attack","None","None"],ans:0,topic:"Hardware Attacks"},
      {q:"What is a timing attack?",opts:["Measuring execution time to extract secrets","None","Time attack","None"],ans:0,topic:"Side Channel"},
      {q:"What is a power analysis attack?",opts:["Power attack","Measuring power consumption to break crypto","None","None"],ans:1,topic:"Side Channel"},
      {q:"What is electromagnetic analysis?",opts:["None","EM attack","None","Using EM emissions to extract secrets"],ans:3,topic:"Side Channel"},
      {q:"What is fault injection?",opts:["None","Fault attack","Inducing hardware faults to bypass security","None"],ans:2,topic:"Hardware Attacks"},
      {q:"What is glitching?",opts:["None","Voltage/clock glitch to skip security checks","None","Glitch attack"],ans:1,topic:"Hardware Attacks"},
      {q:"What is JTAG debugging?",opts:["Hardware debugging interface often left open","None","JTAG class","None"],ans:0,topic:"Hardware Security"},
      {q:"What is firmware analysis?",opts:["None","Extracting and analyzing embedded device firmware","Firmware hack","None"],ans:1,topic:"Embedded Security"},
      {q:"What is binary diffing?",opts:["None","Comparing binaries to find patch differences","Binary compare","None"],ans:1,topic:"Reversing"},
      {q:"What is symbolic execution?",opts:["None","Symbol exec","None","Executing program with symbolic inputs to find all paths"],ans:3,topic:"Program Analysis"},
      {q:"What is taint analysis?",opts:["Taint class","None","None","Tracking how user input flows through program"],ans:3,topic:"Program Analysis"},
      {q:"What is fuzzing coverage?",opts:["None","Measuring code paths exercised during fuzzing","Fuzz coverage","None"],ans:1,topic:"Fuzzing"},
      {q:"What is AFL?",opts:["AFL class","None","American Fuzzy Lop — coverage-guided fuzzer","None"],ans:2,topic:"Fuzzing"},
      {q:"What is libFuzzer?",opts:["None","Lib fuzzer","LLVM-based in-process coverage-guided fuzzer","None"],ans:2,topic:"Fuzzing"},
      {q:"What is a heap metadata attack?",opts:["None","Heap meta","None","Corrupting heap chunk headers for exploitation"],ans:3,topic:"Advanced Exploitation"},
      {q:"What is tcache poisoning?",opts:["None","Cache poison","Corrupting glibc tcache for arbitrary allocation","None"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is house of force?",opts:["None","None","Heap exploit using top chunk manipulation","Force house"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is FSOP?",opts:["File exploit","File Structure Oriented Programming — exploiting FILE*","None","None"],ans:1,topic:"Advanced Exploitation"},
      {q:"What is JOP?",opts:["Jump exploit","Jump-Oriented Programming — variant of ROP","None","None"],ans:1,topic:"Advanced Exploitation"},
      {q:"What is COOP?",opts:["COOP class","None","None","Counterfeit Object-Oriented Programming"],ans:3,topic:"Advanced Exploitation"},
      {q:"What is heap grooming?",opts:["Heap setup","None","Arranging heap layout for reliable exploitation","None"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is type confusion?",opts:["Treating object as wrong type for exploitation","None","None","Type error"],ans:0,topic:"Advanced Exploitation"},
      {q:"What is an information leak?",opts:["None","Info attack","None","Bypassing ASLR by leaking memory addresses"],ans:3,topic:"Exploitation Techniques"},
      {q:"What is ROP chain?",opts:["None","None","Chain exploit","Sequence of gadgets redirecting control flow"],ans:3,topic:"Binary Exploitation"},
      {q:"What is a gadget in ROP?",opts:["ROP piece","None","Short instruction sequence ending in ret","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is ret2plt?",opts:["PLT exploit","None","Redirecting to PLT entry for code execution","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is GOT overwrite?",opts:["None","None","GOT attack","Writing function pointer in GOT for control flow"],ans:3,topic:"Binary Exploitation"},
      {q:"What is one_gadget?",opts:["None","Magic gadget","Magic gadget in libc giving shell in one call","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is pwntools?",opts:["None","Python library for CTF binary exploitation","None","PWN tools"],ans:1,topic:"CTF Tools"},
      {q:"What is pwndbg?",opts:["PWN debug","None","None","Enhanced GDB for exploit development"],ans:3,topic:"CTF Tools"},
      {q:"What is ROPgadget?",opts:["Tool for finding ROP gadgets in binaries","None","None","Gadget finder"],ans:0,topic:"CTF Tools"},
      {q:"What is kernel exploitation?",opts:["Exploiting OS kernel for ring 0 privilege","OS exploit","None","Kernel attack"],ans:0,topic:"Advanced Exploitation"},
      {q:"What is a kernel module exploit?",opts:["Exploiting loadable kernel modules","Module attack","None","None"],ans:0,topic:"Advanced Exploitation"},
      {q:"What is SMEP?",opts:["None","SMEP class","None","Supervisor Mode Execution Prevention"],ans:3,topic:"Kernel Mitigations"},
      {q:"What is SMAP?",opts:["None","None","SMAP class","Supervisor Mode Access Prevention"],ans:3,topic:"Kernel Mitigations"},
      {q:"What is KPTI?",opts:["None","None","Kernel Page Table Isolation — Meltdown mitigation","KPTI class"],ans:2,topic:"Kernel Mitigations"},
      {q:"What is a race condition exploit?",opts:["None","Race exploit","Exploiting time-of-check to time-of-use gap","TOCTOU"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is a side-channel attack?",opts:["None","Side attack","Extracting secrets via physical measurements","None"],ans:2,topic:"Advanced Attacks"},
      {q:"What is Spectre?",opts:["Exploits speculative execution to leak memory","None","Meltdown variant","None"],ans:0,topic:"Hardware Attacks"},
      {q:"What is Meltdown?",opts:["Spectre variant","None","None","Exploits out-of-order execution to read kernel memory"],ans:3,topic:"Hardware Attacks"},
      {q:"What is Rowhammer?",opts:["Inducing bit flips in DRAM via repeated access","Row attack","None","None"],ans:0,topic:"Hardware Attacks"},
      {q:"What is a timing attack?",opts:["Measuring execution time to extract secrets","None","Time attack","None"],ans:0,topic:"Side Channel"},
      {q:"What is a power analysis attack?",opts:["Power attack","Measuring power consumption to break crypto","None","None"],ans:1,topic:"Side Channel"},
      {q:"What is electromagnetic analysis?",opts:["None","EM attack","None","Using EM emissions to extract secrets"],ans:3,topic:"Side Channel"},
      {q:"What is fault injection?",opts:["None","Fault attack","Inducing hardware faults to bypass security","None"],ans:2,topic:"Hardware Attacks"},
      {q:"What is glitching?",opts:["None","Voltage/clock glitch to skip security checks","None","Glitch attack"],ans:1,topic:"Hardware Attacks"},
      {q:"What is JTAG debugging?",opts:["Hardware debugging interface often left open","None","JTAG class","None"],ans:0,topic:"Hardware Security"},
      {q:"What is firmware analysis?",opts:["None","Extracting and analyzing embedded device firmware","Firmware hack","None"],ans:1,topic:"Embedded Security"},
      {q:"What is binary diffing?",opts:["None","Comparing binaries to find patch differences","Binary compare","None"],ans:1,topic:"Reversing"},
      {q:"What is symbolic execution?",opts:["None","Symbol exec","None","Executing program with symbolic inputs to find all paths"],ans:3,topic:"Program Analysis"},
      {q:"What is taint analysis?",opts:["Taint class","None","None","Tracking how user input flows through program"],ans:3,topic:"Program Analysis"},
      {q:"What is fuzzing coverage?",opts:["None","Measuring code paths exercised during fuzzing","Fuzz coverage","None"],ans:1,topic:"Fuzzing"},
      {q:"What is AFL?",opts:["AFL class","None","American Fuzzy Lop — coverage-guided fuzzer","None"],ans:2,topic:"Fuzzing"},
      {q:"What is libFuzzer?",opts:["None","Lib fuzzer","LLVM-based in-process coverage-guided fuzzer","None"],ans:2,topic:"Fuzzing"},
      {q:"What is a heap metadata attack?",opts:["None","Heap meta","None","Corrupting heap chunk headers for exploitation"],ans:3,topic:"Advanced Exploitation"},
      {q:"What is tcache poisoning?",opts:["None","Cache poison","Corrupting glibc tcache for arbitrary allocation","None"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is house of force?",opts:["None","None","Heap exploit using top chunk manipulation","Force house"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is FSOP?",opts:["File exploit","File Structure Oriented Programming — exploiting FILE*","None","None"],ans:1,topic:"Advanced Exploitation"},
      {q:"What is JOP?",opts:["Jump exploit","Jump-Oriented Programming — variant of ROP","None","None"],ans:1,topic:"Advanced Exploitation"},
      {q:"What is COOP?",opts:["COOP class","None","None","Counterfeit Object-Oriented Programming"],ans:3,topic:"Advanced Exploitation"},
      {q:"What is heap grooming?",opts:["Heap setup","None","Arranging heap layout for reliable exploitation","None"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is type confusion?",opts:["Treating object as wrong type for exploitation","None","None","Type error"],ans:0,topic:"Advanced Exploitation"},
      {q:"What is an information leak?",opts:["None","Info attack","None","Bypassing ASLR by leaking memory addresses"],ans:3,topic:"Exploitation Techniques"},
      {q:"What is ROP chain?",opts:["None","None","Chain exploit","Sequence of gadgets redirecting control flow"],ans:3,topic:"Binary Exploitation"},
      {q:"What is a gadget in ROP?",opts:["ROP piece","None","Short instruction sequence ending in ret","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is ret2plt?",opts:["PLT exploit","None","Redirecting to PLT entry for code execution","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is GOT overwrite?",opts:["None","None","GOT attack","Writing function pointer in GOT for control flow"],ans:3,topic:"Binary Exploitation"},
      {q:"What is one_gadget?",opts:["None","Magic gadget","Magic gadget in libc giving shell in one call","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is pwntools?",opts:["None","Python library for CTF binary exploitation","None","PWN tools"],ans:1,topic:"CTF Tools"},
      {q:"What is pwndbg?",opts:["PWN debug","None","None","Enhanced GDB for exploit development"],ans:3,topic:"CTF Tools"},
      {q:"What is ROPgadget?",opts:["Tool for finding ROP gadgets in binaries","None","None","Gadget finder"],ans:0,topic:"CTF Tools"},
      {q:"What is kernel exploitation?",opts:["Exploiting OS kernel for ring 0 privilege","OS exploit","None","Kernel attack"],ans:0,topic:"Advanced Exploitation"},
      {q:"What is a kernel module exploit?",opts:["Exploiting loadable kernel modules","Module attack","None","None"],ans:0,topic:"Advanced Exploitation"},
      {q:"What is SMEP?",opts:["None","SMEP class","None","Supervisor Mode Execution Prevention"],ans:3,topic:"Kernel Mitigations"},
      {q:"What is SMAP?",opts:["None","None","SMAP class","Supervisor Mode Access Prevention"],ans:3,topic:"Kernel Mitigations"},
      {q:"What is KPTI?",opts:["None","None","Kernel Page Table Isolation — Meltdown mitigation","KPTI class"],ans:2,topic:"Kernel Mitigations"},
      {q:"What is a race condition exploit?",opts:["None","Race exploit","Exploiting time-of-check to time-of-use gap","TOCTOU"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is a side-channel attack?",opts:["None","Side attack","Extracting secrets via physical measurements","None"],ans:2,topic:"Advanced Attacks"},
      {q:"What is Spectre?",opts:["Exploits speculative execution to leak memory","None","Meltdown variant","None"],ans:0,topic:"Hardware Attacks"},
      {q:"What is Meltdown?",opts:["Spectre variant","None","None","Exploits out-of-order execution to read kernel memory"],ans:3,topic:"Hardware Attacks"},
      {q:"What is Rowhammer?",opts:["Inducing bit flips in DRAM via repeated access","Row attack","None","None"],ans:0,topic:"Hardware Attacks"},
      {q:"What is a timing attack?",opts:["Measuring execution time to extract secrets","None","Time attack","None"],ans:0,topic:"Side Channel"},
      {q:"What is a power analysis attack?",opts:["Power attack","Measuring power consumption to break crypto","None","None"],ans:1,topic:"Side Channel"},
      {q:"What is electromagnetic analysis?",opts:["None","EM attack","None","Using EM emissions to extract secrets"],ans:3,topic:"Side Channel"},
      {q:"What is fault injection?",opts:["None","Fault attack","Inducing hardware faults to bypass security","None"],ans:2,topic:"Hardware Attacks"},
      {q:"What is glitching?",opts:["None","Voltage/clock glitch to skip security checks","None","Glitch attack"],ans:1,topic:"Hardware Attacks"},
      {q:"What is JTAG debugging?",opts:["Hardware debugging interface often left open","None","JTAG class","None"],ans:0,topic:"Hardware Security"},
      {q:"What is firmware analysis?",opts:["None","Extracting and analyzing embedded device firmware","Firmware hack","None"],ans:1,topic:"Embedded Security"},
      {q:"What is binary diffing?",opts:["None","Comparing binaries to find patch differences","Binary compare","None"],ans:1,topic:"Reversing"},
      {q:"What is symbolic execution?",opts:["None","Symbol exec","None","Executing program with symbolic inputs to find all paths"],ans:3,topic:"Program Analysis"},
      {q:"What is taint analysis?",opts:["Taint class","None","None","Tracking how user input flows through program"],ans:3,topic:"Program Analysis"},
      {q:"What is fuzzing coverage?",opts:["None","Measuring code paths exercised during fuzzing","Fuzz coverage","None"],ans:1,topic:"Fuzzing"},
      {q:"What is AFL?",opts:["AFL class","None","American Fuzzy Lop — coverage-guided fuzzer","None"],ans:2,topic:"Fuzzing"},
      {q:"What is libFuzzer?",opts:["None","Lib fuzzer","LLVM-based in-process coverage-guided fuzzer","None"],ans:2,topic:"Fuzzing"},
      {q:"What is a heap metadata attack?",opts:["None","Heap meta","None","Corrupting heap chunk headers for exploitation"],ans:3,topic:"Advanced Exploitation"},
      {q:"What is tcache poisoning?",opts:["None","Cache poison","Corrupting glibc tcache for arbitrary allocation","None"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is house of force?",opts:["None","None","Heap exploit using top chunk manipulation","Force house"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is FSOP?",opts:["File exploit","File Structure Oriented Programming — exploiting FILE*","None","None"],ans:1,topic:"Advanced Exploitation"},
      {q:"What is JOP?",opts:["Jump exploit","Jump-Oriented Programming — variant of ROP","None","None"],ans:1,topic:"Advanced Exploitation"},
      {q:"What is COOP?",opts:["COOP class","None","None","Counterfeit Object-Oriented Programming"],ans:3,topic:"Advanced Exploitation"},
      {q:"What is heap grooming?",opts:["Heap setup","None","Arranging heap layout for reliable exploitation","None"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is type confusion?",opts:["Treating object as wrong type for exploitation","None","None","Type error"],ans:0,topic:"Advanced Exploitation"},
      {q:"What is an information leak?",opts:["None","Info attack","None","Bypassing ASLR by leaking memory addresses"],ans:3,topic:"Exploitation Techniques"},
      {q:"What is ROP chain?",opts:["None","None","Chain exploit","Sequence of gadgets redirecting control flow"],ans:3,topic:"Binary Exploitation"},
      {q:"What is a gadget in ROP?",opts:["ROP piece","None","Short instruction sequence ending in ret","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is ret2plt?",opts:["PLT exploit","None","Redirecting to PLT entry for code execution","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is GOT overwrite?",opts:["None","None","GOT attack","Writing function pointer in GOT for control flow"],ans:3,topic:"Binary Exploitation"},
      {q:"What is one_gadget?",opts:["None","Magic gadget","Magic gadget in libc giving shell in one call","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is pwntools?",opts:["None","Python library for CTF binary exploitation","None","PWN tools"],ans:1,topic:"CTF Tools"},
      {q:"What is pwndbg?",opts:["PWN debug","None","None","Enhanced GDB for exploit development"],ans:3,topic:"CTF Tools"},
      {q:"What is ROPgadget?",opts:["Tool for finding ROP gadgets in binaries","None","None","Gadget finder"],ans:0,topic:"CTF Tools"},
      {q:"What is kernel exploitation?",opts:["Exploiting OS kernel for ring 0 privilege","OS exploit","None","Kernel attack"],ans:0,topic:"Advanced Exploitation"},
      {q:"What is a kernel module exploit?",opts:["Exploiting loadable kernel modules","Module attack","None","None"],ans:0,topic:"Advanced Exploitation"},
      {q:"What is SMEP?",opts:["None","SMEP class","None","Supervisor Mode Execution Prevention"],ans:3,topic:"Kernel Mitigations"},
      {q:"What is SMAP?",opts:["None","None","SMAP class","Supervisor Mode Access Prevention"],ans:3,topic:"Kernel Mitigations"},
      {q:"What is KPTI?",opts:["None","None","Kernel Page Table Isolation — Meltdown mitigation","KPTI class"],ans:2,topic:"Kernel Mitigations"},
      {q:"What is a race condition exploit?",opts:["None","Race exploit","Exploiting time-of-check to time-of-use gap","TOCTOU"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is a side-channel attack?",opts:["None","Side attack","Extracting secrets via physical measurements","None"],ans:2,topic:"Advanced Attacks"},
      {q:"What is Spectre?",opts:["Exploits speculative execution to leak memory","None","Meltdown variant","None"],ans:0,topic:"Hardware Attacks"},
      {q:"What is Meltdown?",opts:["Spectre variant","None","None","Exploits out-of-order execution to read kernel memory"],ans:3,topic:"Hardware Attacks"},
      {q:"What is Rowhammer?",opts:["Inducing bit flips in DRAM via repeated access","Row attack","None","None"],ans:0,topic:"Hardware Attacks"},
      {q:"What is a timing attack?",opts:["Measuring execution time to extract secrets","None","Time attack","None"],ans:0,topic:"Side Channel"},
      {q:"What is a power analysis attack?",opts:["Power attack","Measuring power consumption to break crypto","None","None"],ans:1,topic:"Side Channel"},
      {q:"What is electromagnetic analysis?",opts:["None","EM attack","None","Using EM emissions to extract secrets"],ans:3,topic:"Side Channel"},
      {q:"What is fault injection?",opts:["None","Fault attack","Inducing hardware faults to bypass security","None"],ans:2,topic:"Hardware Attacks"},
      {q:"What is glitching?",opts:["None","Voltage/clock glitch to skip security checks","None","Glitch attack"],ans:1,topic:"Hardware Attacks"},
      {q:"What is JTAG debugging?",opts:["Hardware debugging interface often left open","None","JTAG class","None"],ans:0,topic:"Hardware Security"},
      {q:"What is firmware analysis?",opts:["None","Extracting and analyzing embedded device firmware","Firmware hack","None"],ans:1,topic:"Embedded Security"},
      {q:"What is binary diffing?",opts:["None","Comparing binaries to find patch differences","Binary compare","None"],ans:1,topic:"Reversing"},
      {q:"What is symbolic execution?",opts:["None","Symbol exec","None","Executing program with symbolic inputs to find all paths"],ans:3,topic:"Program Analysis"},
      {q:"What is taint analysis?",opts:["Taint class","None","None","Tracking how user input flows through program"],ans:3,topic:"Program Analysis"},
      {q:"What is fuzzing coverage?",opts:["None","Measuring code paths exercised during fuzzing","Fuzz coverage","None"],ans:1,topic:"Fuzzing"},
      {q:"What is AFL?",opts:["AFL class","None","American Fuzzy Lop — coverage-guided fuzzer","None"],ans:2,topic:"Fuzzing"},
      {q:"What is libFuzzer?",opts:["None","Lib fuzzer","LLVM-based in-process coverage-guided fuzzer","None"],ans:2,topic:"Fuzzing"},
      {q:"What is a heap metadata attack?",opts:["None","Heap meta","None","Corrupting heap chunk headers for exploitation"],ans:3,topic:"Advanced Exploitation"},
      {q:"What is tcache poisoning?",opts:["None","Cache poison","Corrupting glibc tcache for arbitrary allocation","None"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is house of force?",opts:["None","None","Heap exploit using top chunk manipulation","Force house"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is FSOP?",opts:["File exploit","File Structure Oriented Programming — exploiting FILE*","None","None"],ans:1,topic:"Advanced Exploitation"},
      {q:"What is JOP?",opts:["Jump exploit","Jump-Oriented Programming — variant of ROP","None","None"],ans:1,topic:"Advanced Exploitation"},
      {q:"What is COOP?",opts:["COOP class","None","None","Counterfeit Object-Oriented Programming"],ans:3,topic:"Advanced Exploitation"},
      {q:"What is heap grooming?",opts:["Heap setup","None","Arranging heap layout for reliable exploitation","None"],ans:2,topic:"Advanced Exploitation"},
      {q:"What is type confusion?",opts:["Treating object as wrong type for exploitation","None","None","Type error"],ans:0,topic:"Advanced Exploitation"},
      {q:"What is an information leak?",opts:["None","Info attack","None","Bypassing ASLR by leaking memory addresses"],ans:3,topic:"Exploitation Techniques"},
      {q:"What is ROP chain?",opts:["None","None","Chain exploit","Sequence of gadgets redirecting control flow"],ans:3,topic:"Binary Exploitation"},
      {q:"What is a gadget in ROP?",opts:["ROP piece","None","Short instruction sequence ending in ret","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is ret2plt?",opts:["PLT exploit","None","Redirecting to PLT entry for code execution","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is GOT overwrite?",opts:["None","None","GOT attack","Writing function pointer in GOT for control flow"],ans:3,topic:"Binary Exploitation"},
      {q:"What is one_gadget?",opts:["None","Magic gadget","Magic gadget in libc giving shell in one call","None"],ans:2,topic:"Binary Exploitation"},
      {q:"What is pwntools?",opts:["None","Python library for CTF binary exploitation","None","PWN tools"],ans:1,topic:"CTF Tools"},
      {q:"What is pwndbg?",opts:["PWN debug","None","None","Enhanced GDB for exploit development"],ans:3,topic:"CTF Tools"},
      {q:"What is ROPgadget?",opts:["Tool for finding ROP gadgets in binaries","None","None","Gadget finder"],ans:0,topic:"CTF Tools"},
    ],
  },
  c6:{
    basic:[
      {q:"What is time complexity?",opts:["None","How runtime grows with input size","Memory used","Code length"],ans:1,topic:"Complexity"},
      {q:"What does O(1) mean?",opts:["Constant time — doesn't grow with input","Linear time","Quadratic","None"],ans:0,topic:"Complexity"},
      {q:"What does O(n) mean?",opts:["None","Quadratic","Linear — grows proportionally with input","Constant"],ans:2,topic:"Complexity"},
      {q:"What does O(n²) mean?",opts:["Cubic","None","Quadratic — grows as square of input","Linear"],ans:2,topic:"Complexity"},
      {q:"What does O(log n) mean?",opts:["Logarithmic — halves problem each step","None","Linear","Constant"],ans:0,topic:"Complexity"},
      {q:"What does O(n log n) mean?",opts:["Quadratic","None","Linearithmic — efficient sorts like merge sort","Linear"],ans:2,topic:"Complexity"},
      {q:"What is a CP contest?",opts:["Hackathon","Game","None","Timed problem-solving with algorithmic challenges"],ans:3,topic:"CP Basics"},
      {q:"Most popular CP language?",opts:["JavaScript","Python","Java","C++ (fastest runtime, STL)"],ans:3,topic:"CP Basics"},
      {q:"What is a greedy algorithm?",opts:["None","Makes locally optimal choice at each step","Uses DP","Tries all options"],ans:1,topic:"Greedy"},
      {q:"What is divide and conquer?",opts:["DP","Break into subproblems, solve, combine","Greedy approach","None"],ans:1,topic:"Divide & Conquer"},
      {q:"What is binary search on answer?",opts:["Applying binary search on the answer space","None","None","Searching array"],ans:0,topic:"Binary Search"},
      {q:"What is prefix sum?",opts:["None","First element","None","Precomputed cumulative sum for O(1) range queries"],ans:3,topic:"Techniques"},
      {q:"What is BFS used for?",opts:["Sorting","None","None","Shortest path in unweighted graph, level traversal"],ans:3,topic:"Graphs"},
      {q:"What is DFS used for?",opts:["None","Exploring all paths, cycle detection, components","Shortest path","None"],ans:1,topic:"Graphs"},
      {q:"What is stack overflow in recursion?",opts:["Too deep recursion exceeding call stack limit","Array error","Compilation error","None"],ans:0,topic:"Recursion"},
      {q:"What is modular arithmetic?",opts:["Module system","Arithmetic with remainder used in large number problems","None","None"],ans:1,topic:"Math"},
      {q:"What is GCD?",opts:["General Code Design","None","Greatest Common Divisor","None"],ans:2,topic:"Math"},
      {q:"What is LCM?",opts:["None","Least Common Method","None","Least Common Multiple"],ans:3,topic:"Math"},
      {q:"What is Codeforces?",opts:["None","Social network","Competitive programming platform with contests","Code editor"],ans:2,topic:"Platforms"},
      {q:"What is TLE verdict?",opts:["Time Limit Exceeded — solution too slow","Wrong answer","Compilation error","None"],ans:0,topic:"CP Basics"},
      {q:"What is MLE verdict?",opts:["Memory Limit Exceeded","Module limit","Memory error","None"],ans:0,topic:"CP Basics"},
      {q:"What is WA verdict?",opts:["Wait Again","None","Wrong Algorithm","Wrong Answer — output doesn't match expected"],ans:3,topic:"CP Basics"},
      {q:"What is RE verdict?",opts:["None","Run Error","Runtime Error — program crashed","Recursion Error"],ans:2,topic:"CP Basics"},
      {q:"What is CE verdict?",opts:["Code Error","None","None","Compilation Error — code doesn't compile"],ans:3,topic:"CP Basics"},
      {q:"What is AC verdict?",opts:["Accepted — correct solution","None","Almost Correct","All Correct"],ans:0,topic:"CP Basics"},
      {q:"What is partial scoring?",opts:["Half score","Getting points for passing some test cases","Partial answer","None"],ans:1,topic:"CP Basics"},
      {q:"What is a brute force solution?",opts:["Try all possibilities — usually O(2^n) or O(n!)","Best solution","None","Greedy"],ans:0,topic:"Problem Solving"},
      {q:"What is a naive solution?",opts:["None","None","Simple but inefficient approach","Perfect solution"],ans:2,topic:"Problem Solving"},
      {q:"What is an edge case?",opts:["None","None","Error case","Boundary condition that may break solution"],ans:3,topic:"Problem Solving"},
      {q:"What is the two-sum problem?",opts:["Adding numbers","Find pair summing to target — O(n) with hashmap","None","None"],ans:1,topic:"Problems"},
      {q:"What is subarray sum?",opts:["Array sum","Sum of contiguous elements in array","None","None"],ans:1,topic:"Problems"},
      {q:"What is prefix sum for range query?",opts:["Range query","None","None","sum[l..r] = pre[r] - pre[l-1] in O(1)"],ans:3,topic:"Techniques"},
      {q:"What is the sliding window maximum problem?",opts:["None","Window max","None","Max in every window of size k"],ans:3,topic:"Problems"},
      {q:"What is the longest common prefix?",opts:["Longest prefix shared by all strings","Common string","None","None"],ans:0,topic:"Strings"},
      {q:"What is Pigeonhole principle?",opts:["None","n+1 items in n bins — at least one bin has 2","None","Pigeonhole class"],ans:1,topic:"Math"},
      {q:"What is modular exponentiation?",opts:["Fast power","a^b mod m in O(log b) using fast power","None","None"],ans:1,topic:"Math"},
      {q:"What is Sieve of Eratosthenes?",opts:["None","None","Prime sieve","Find all primes up to n in O(n log log n)"],ans:3,topic:"Math"},
      {q:"What is prime factorization?",opts:["Factor decomp","Express n as product of prime numbers","None","None"],ans:1,topic:"Math"},
      {q:"What is GCD via Euclidean algorithm?",opts:["Euclidean GCD","gcd(a,b) = gcd(b, a%b) until b=0","None","None"],ans:1,topic:"Math"},
      {q:"What is Fibonacci sequence?",opts:["Each number is sum of two preceding: 0,1,1,2,3,5...","None","Fib class","None"],ans:0,topic:"Math"},
      {q:"What is memoized Fibonacci?",opts:["None","None","Cached Fib","Cache fib(n) results to avoid O(2^n) recursion"],ans:3,topic:"DP"},
      {q:"What is 1-indexed vs 0-indexed array?",opts:["None","Index type","Starting index 1 vs starting index 0","None"],ans:2,topic:"CP Basics"},
      {q:"What is fast I/O in C++?",opts:["Fast input","None","None","ios::sync_with_stdio(false); cin.tie(0);"],ans:3,topic:"CP Basics"},
      {q:"What is a multitest problem?",opts:["None","Multiple test cases per input file","None","Multi test"],ans:1,topic:"CP Basics"},
      {q:"What is binary search for minimum?",opts:["Min search","None","None","Find min x satisfying condition with monotone check"],ans:3,topic:"Binary Search"},
      {q:"What is binary search for maximum?",opts:["None","None","Max search","Find max x satisfying condition with monotone check"],ans:3,topic:"Binary Search"},
      {q:"What is the check function in binary search?",opts:["Check class","None","Returns true/false for mid — must be monotone","None"],ans:2,topic:"Binary Search"},
      {q:"What is integer overflow?",opts:["None","Overflow error","None","Result exceeds int range — use long long"],ans:3,topic:"CP Basics"},
      {q:"What is long long in C++?",opts:["None","64-bit integer for large numbers up to ~9.2*10^18","None","Long integer"],ans:1,topic:"CP Basics"},
      {q:"What is __int128?",opts:["128-bit integer for very large numbers","128 int","None","None"],ans:0,topic:"CP Basics"},
      {q:"What is pair in C++ STL?",opts:["None","Pair class","Two-element struct pair<int,int>","None"],ans:2,topic:"STL"},
      {q:"What is make_pair?",opts:["Pair maker","None","None","Creates pair object"],ans:3,topic:"STL"},
      {q:"What is auto in C++11 for CP?",opts:["None","None","Lets compiler deduce type — shorter code","Auto class"],ans:2,topic:"C++"},
      {q:"What is range-based for loop?",opts:["None","Range loop","for(auto x : v) — iterates over container","None"],ans:2,topic:"C++"},
      {q:"What is sort() in STL?",opts:["O(n log n) introsort — faster than manual","None","Sort function","None"],ans:0,topic:"STL"},
      {q:"What is lower_bound?",opts:["None","Lower bound","None","First element >= value — O(log n) on sorted"],ans:3,topic:"STL"},
      {q:"What is upper_bound?",opts:["None","None","Upper bound","First element > value — O(log n) on sorted"],ans:3,topic:"STL"},
      {q:"What is bitset in C++?",opts:["Compact bit array supporting bitwise ops","Bit set","None","None"],ans:0,topic:"STL"},
      {q:"What is __builtin_popcount?",opts:["Counts set bits in integer","None","None","Pop count"],ans:0,topic:"Bit Tricks"},
      {q:"What is bit AND used for?",opts:["Bit check","None","Check bit: n & (1<<k)","None"],ans:2,topic:"Bit Tricks"},
      {q:"What is bit OR used for?",opts:["None","None","Set bit: n | (1<<k)","Bit set"],ans:2,topic:"Bit Tricks"},
      {q:"What is bit XOR used for?",opts:["None","Bit toggle","None","Toggle bit or check equal: a^a=0"],ans:3,topic:"Bit Tricks"},
      {q:"What is left shift <<?",opts:["None","None","Right shift","Multiply by 2^k"],ans:3,topic:"Bit Tricks"},
      {q:"What is right shift >>?",opts:["Divide by 2^k","Left shift","None","None"],ans:0,topic:"Bit Tricks"},
      {q:"What is n & (n-1)?",opts:["Bit trick","None","None","Clears lowest set bit of n"],ans:3,topic:"Bit Tricks"},
      {q:"What is n & (-n)?",opts:["None","Returns lowest set bit of n","Lowest bit","None"],ans:1,topic:"Bit Tricks"},
      {q:"What is a set in STL for CP?",opts:["Ordered unique elements with O(log n) ops","None","None","Set class"],ans:0,topic:"STL"},
      {q:"What is multiset?",opts:["Multi set","None","None","Like set but allows duplicates"],ans:3,topic:"STL"},
      {q:"What is map in STL for CP?",opts:["Sorted key-value with O(log n) ops","Map class","None","None"],ans:0,topic:"STL"},
      {q:"What is unordered_map for CP?",opts:["Hash map","Hash map O(1) average but can TLE on hack","None","None"],ans:1,topic:"STL"},
      {q:"What is priority_queue for CP?",opts:["PQ class","None","None","Max heap by default — use min heap with negative"],ans:3,topic:"STL"},
      {q:"What is deque for CP?",opts:["Deque class","None","Double-ended queue for sliding window","None"],ans:2,topic:"STL"},
      {q:"What is stack for CP?",opts:["Stack class","LIFO for DFS, monotonic stack problems","None","None"],ans:1,topic:"STL"},
      {q:"What is queue for CP?",opts:["FIFO for BFS","None","None","Queue class"],ans:0,topic:"STL"},
      {q:"What is a vector in C++ for CP?",opts:["Dynamic array — most used container","None","Vector class","None"],ans:0,topic:"STL"},
      {q:"What is time complexity?",opts:["None","How runtime grows with input size","Memory used","Code length"],ans:1,topic:"Complexity"},
      {q:"What does O(1) mean?",opts:["Constant time — doesn't grow with input","Linear time","Quadratic","None"],ans:0,topic:"Complexity"},
      {q:"What does O(n) mean?",opts:["None","Quadratic","Linear — grows proportionally with input","Constant"],ans:2,topic:"Complexity"},
      {q:"What does O(n²) mean?",opts:["Cubic","None","Quadratic — grows as square of input","Linear"],ans:2,topic:"Complexity"},
      {q:"What does O(log n) mean?",opts:["Logarithmic — halves problem each step","None","Linear","Constant"],ans:0,topic:"Complexity"},
      {q:"What does O(n log n) mean?",opts:["Quadratic","None","Linearithmic — efficient sorts like merge sort","Linear"],ans:2,topic:"Complexity"},
      {q:"What is a CP contest?",opts:["Hackathon","Game","None","Timed problem-solving with algorithmic challenges"],ans:3,topic:"CP Basics"},
      {q:"Most popular CP language?",opts:["JavaScript","Python","Java","C++ (fastest runtime, STL)"],ans:3,topic:"CP Basics"},
      {q:"What is a greedy algorithm?",opts:["None","Makes locally optimal choice at each step","Uses DP","Tries all options"],ans:1,topic:"Greedy"},
      {q:"What is divide and conquer?",opts:["DP","Break into subproblems, solve, combine","Greedy approach","None"],ans:1,topic:"Divide & Conquer"},
      {q:"What is binary search on answer?",opts:["Applying binary search on the answer space","None","None","Searching array"],ans:0,topic:"Binary Search"},
      {q:"What is prefix sum?",opts:["None","First element","None","Precomputed cumulative sum for O(1) range queries"],ans:3,topic:"Techniques"},
      {q:"What is BFS used for?",opts:["Sorting","None","None","Shortest path in unweighted graph, level traversal"],ans:3,topic:"Graphs"},
      {q:"What is DFS used for?",opts:["None","Exploring all paths, cycle detection, components","Shortest path","None"],ans:1,topic:"Graphs"},
      {q:"What is stack overflow in recursion?",opts:["Too deep recursion exceeding call stack limit","Array error","Compilation error","None"],ans:0,topic:"Recursion"},
      {q:"What is modular arithmetic?",opts:["Module system","Arithmetic with remainder used in large number problems","None","None"],ans:1,topic:"Math"},
      {q:"What is GCD?",opts:["General Code Design","None","Greatest Common Divisor","None"],ans:2,topic:"Math"},
      {q:"What is LCM?",opts:["None","Least Common Method","None","Least Common Multiple"],ans:3,topic:"Math"},
      {q:"What is Codeforces?",opts:["None","Social network","Competitive programming platform with contests","Code editor"],ans:2,topic:"Platforms"},
      {q:"What is TLE verdict?",opts:["Time Limit Exceeded — solution too slow","Wrong answer","Compilation error","None"],ans:0,topic:"CP Basics"},
      {q:"What is MLE verdict?",opts:["Memory Limit Exceeded","Module limit","Memory error","None"],ans:0,topic:"CP Basics"},
      {q:"What is WA verdict?",opts:["Wait Again","None","Wrong Algorithm","Wrong Answer — output doesn't match expected"],ans:3,topic:"CP Basics"},
      {q:"What is RE verdict?",opts:["None","Run Error","Runtime Error — program crashed","Recursion Error"],ans:2,topic:"CP Basics"},
      {q:"What is CE verdict?",opts:["Code Error","None","None","Compilation Error — code doesn't compile"],ans:3,topic:"CP Basics"},
      {q:"What is AC verdict?",opts:["Accepted — correct solution","None","Almost Correct","All Correct"],ans:0,topic:"CP Basics"},
      {q:"What is partial scoring?",opts:["Half score","Getting points for passing some test cases","Partial answer","None"],ans:1,topic:"CP Basics"},
      {q:"What is a brute force solution?",opts:["Try all possibilities — usually O(2^n) or O(n!)","Best solution","None","Greedy"],ans:0,topic:"Problem Solving"},
      {q:"What is a naive solution?",opts:["None","None","Simple but inefficient approach","Perfect solution"],ans:2,topic:"Problem Solving"},
      {q:"What is an edge case?",opts:["None","None","Error case","Boundary condition that may break solution"],ans:3,topic:"Problem Solving"},
      {q:"What is the two-sum problem?",opts:["Adding numbers","Find pair summing to target — O(n) with hashmap","None","None"],ans:1,topic:"Problems"},
      {q:"What is subarray sum?",opts:["Array sum","Sum of contiguous elements in array","None","None"],ans:1,topic:"Problems"},
      {q:"What is prefix sum for range query?",opts:["Range query","None","None","sum[l..r] = pre[r] - pre[l-1] in O(1)"],ans:3,topic:"Techniques"},
      {q:"What is the sliding window maximum problem?",opts:["None","Window max","None","Max in every window of size k"],ans:3,topic:"Problems"},
      {q:"What is the longest common prefix?",opts:["Longest prefix shared by all strings","Common string","None","None"],ans:0,topic:"Strings"},
      {q:"What is Pigeonhole principle?",opts:["None","n+1 items in n bins — at least one bin has 2","None","Pigeonhole class"],ans:1,topic:"Math"},
      {q:"What is modular exponentiation?",opts:["Fast power","a^b mod m in O(log b) using fast power","None","None"],ans:1,topic:"Math"},
      {q:"What is Sieve of Eratosthenes?",opts:["None","None","Prime sieve","Find all primes up to n in O(n log log n)"],ans:3,topic:"Math"},
      {q:"What is prime factorization?",opts:["Factor decomp","Express n as product of prime numbers","None","None"],ans:1,topic:"Math"},
      {q:"What is GCD via Euclidean algorithm?",opts:["Euclidean GCD","gcd(a,b) = gcd(b, a%b) until b=0","None","None"],ans:1,topic:"Math"},
      {q:"What is Fibonacci sequence?",opts:["Each number is sum of two preceding: 0,1,1,2,3,5...","None","Fib class","None"],ans:0,topic:"Math"},
      {q:"What is memoized Fibonacci?",opts:["None","None","Cached Fib","Cache fib(n) results to avoid O(2^n) recursion"],ans:3,topic:"DP"},
      {q:"What is 1-indexed vs 0-indexed array?",opts:["None","Index type","Starting index 1 vs starting index 0","None"],ans:2,topic:"CP Basics"},
      {q:"What is fast I/O in C++?",opts:["Fast input","None","None","ios::sync_with_stdio(false); cin.tie(0);"],ans:3,topic:"CP Basics"},
      {q:"What is a multitest problem?",opts:["None","Multiple test cases per input file","None","Multi test"],ans:1,topic:"CP Basics"},
      {q:"What is binary search for minimum?",opts:["Min search","None","None","Find min x satisfying condition with monotone check"],ans:3,topic:"Binary Search"},
      {q:"What is binary search for maximum?",opts:["None","None","Max search","Find max x satisfying condition with monotone check"],ans:3,topic:"Binary Search"},
      {q:"What is the check function in binary search?",opts:["Check class","None","Returns true/false for mid — must be monotone","None"],ans:2,topic:"Binary Search"},
      {q:"What is integer overflow?",opts:["None","Overflow error","None","Result exceeds int range — use long long"],ans:3,topic:"CP Basics"},
      {q:"What is long long in C++?",opts:["None","64-bit integer for large numbers up to ~9.2*10^18","None","Long integer"],ans:1,topic:"CP Basics"},
      {q:"What is __int128?",opts:["128-bit integer for very large numbers","128 int","None","None"],ans:0,topic:"CP Basics"},
      {q:"What is pair in C++ STL?",opts:["None","Pair class","Two-element struct pair<int,int>","None"],ans:2,topic:"STL"},
      {q:"What is make_pair?",opts:["Pair maker","None","None","Creates pair object"],ans:3,topic:"STL"},
      {q:"What is auto in C++11 for CP?",opts:["None","None","Lets compiler deduce type — shorter code","Auto class"],ans:2,topic:"C++"},
      {q:"What is range-based for loop?",opts:["None","Range loop","for(auto x : v) — iterates over container","None"],ans:2,topic:"C++"},
      {q:"What is sort() in STL?",opts:["O(n log n) introsort — faster than manual","None","Sort function","None"],ans:0,topic:"STL"},
      {q:"What is lower_bound?",opts:["None","Lower bound","None","First element >= value — O(log n) on sorted"],ans:3,topic:"STL"},
      {q:"What is upper_bound?",opts:["None","None","Upper bound","First element > value — O(log n) on sorted"],ans:3,topic:"STL"},
      {q:"What is bitset in C++?",opts:["Compact bit array supporting bitwise ops","Bit set","None","None"],ans:0,topic:"STL"},
      {q:"What is __builtin_popcount?",opts:["Counts set bits in integer","None","None","Pop count"],ans:0,topic:"Bit Tricks"},
      {q:"What is bit AND used for?",opts:["Bit check","None","Check bit: n & (1<<k)","None"],ans:2,topic:"Bit Tricks"},
      {q:"What is bit OR used for?",opts:["None","None","Set bit: n | (1<<k)","Bit set"],ans:2,topic:"Bit Tricks"},
      {q:"What is bit XOR used for?",opts:["None","Bit toggle","None","Toggle bit or check equal: a^a=0"],ans:3,topic:"Bit Tricks"},
      {q:"What is left shift <<?",opts:["None","None","Right shift","Multiply by 2^k"],ans:3,topic:"Bit Tricks"},
      {q:"What is right shift >>?",opts:["Divide by 2^k","Left shift","None","None"],ans:0,topic:"Bit Tricks"},
      {q:"What is n & (n-1)?",opts:["Bit trick","None","None","Clears lowest set bit of n"],ans:3,topic:"Bit Tricks"},
      {q:"What is n & (-n)?",opts:["None","Returns lowest set bit of n","Lowest bit","None"],ans:1,topic:"Bit Tricks"},
      {q:"What is a set in STL for CP?",opts:["Ordered unique elements with O(log n) ops","None","None","Set class"],ans:0,topic:"STL"},
      {q:"What is multiset?",opts:["Multi set","None","None","Like set but allows duplicates"],ans:3,topic:"STL"},
      {q:"What is map in STL for CP?",opts:["Sorted key-value with O(log n) ops","Map class","None","None"],ans:0,topic:"STL"},
      {q:"What is unordered_map for CP?",opts:["Hash map","Hash map O(1) average but can TLE on hack","None","None"],ans:1,topic:"STL"},
      {q:"What is priority_queue for CP?",opts:["PQ class","None","None","Max heap by default — use min heap with negative"],ans:3,topic:"STL"},
      {q:"What is deque for CP?",opts:["Deque class","None","Double-ended queue for sliding window","None"],ans:2,topic:"STL"},
      {q:"What is stack for CP?",opts:["Stack class","LIFO for DFS, monotonic stack problems","None","None"],ans:1,topic:"STL"},
      {q:"What is queue for CP?",opts:["FIFO for BFS","None","None","Queue class"],ans:0,topic:"STL"},
      {q:"What is a vector in C++ for CP?",opts:["Dynamic array — most used container","None","Vector class","None"],ans:0,topic:"STL"},
      {q:"What is time complexity?",opts:["None","How runtime grows with input size","Memory used","Code length"],ans:1,topic:"Complexity"},
      {q:"What does O(1) mean?",opts:["Constant time — doesn't grow with input","Linear time","Quadratic","None"],ans:0,topic:"Complexity"},
      {q:"What does O(n) mean?",opts:["None","Quadratic","Linear — grows proportionally with input","Constant"],ans:2,topic:"Complexity"},
      {q:"What does O(n²) mean?",opts:["Cubic","None","Quadratic — grows as square of input","Linear"],ans:2,topic:"Complexity"},
      {q:"What does O(log n) mean?",opts:["Logarithmic — halves problem each step","None","Linear","Constant"],ans:0,topic:"Complexity"},
      {q:"What does O(n log n) mean?",opts:["Quadratic","None","Linearithmic — efficient sorts like merge sort","Linear"],ans:2,topic:"Complexity"},
      {q:"What is a CP contest?",opts:["Hackathon","Game","None","Timed problem-solving with algorithmic challenges"],ans:3,topic:"CP Basics"},
      {q:"Most popular CP language?",opts:["JavaScript","Python","Java","C++ (fastest runtime, STL)"],ans:3,topic:"CP Basics"},
      {q:"What is a greedy algorithm?",opts:["None","Makes locally optimal choice at each step","Uses DP","Tries all options"],ans:1,topic:"Greedy"},
      {q:"What is divide and conquer?",opts:["DP","Break into subproblems, solve, combine","Greedy approach","None"],ans:1,topic:"Divide & Conquer"},
      {q:"What is binary search on answer?",opts:["Applying binary search on the answer space","None","None","Searching array"],ans:0,topic:"Binary Search"},
      {q:"What is prefix sum?",opts:["None","First element","None","Precomputed cumulative sum for O(1) range queries"],ans:3,topic:"Techniques"},
      {q:"What is BFS used for?",opts:["Sorting","None","None","Shortest path in unweighted graph, level traversal"],ans:3,topic:"Graphs"},
      {q:"What is DFS used for?",opts:["None","Exploring all paths, cycle detection, components","Shortest path","None"],ans:1,topic:"Graphs"},
      {q:"What is stack overflow in recursion?",opts:["Too deep recursion exceeding call stack limit","Array error","Compilation error","None"],ans:0,topic:"Recursion"},
      {q:"What is modular arithmetic?",opts:["Module system","Arithmetic with remainder used in large number problems","None","None"],ans:1,topic:"Math"},
      {q:"What is GCD?",opts:["General Code Design","None","Greatest Common Divisor","None"],ans:2,topic:"Math"},
      {q:"What is LCM?",opts:["None","Least Common Method","None","Least Common Multiple"],ans:3,topic:"Math"},
      {q:"What is Codeforces?",opts:["None","Social network","Competitive programming platform with contests","Code editor"],ans:2,topic:"Platforms"},
      {q:"What is TLE verdict?",opts:["Time Limit Exceeded — solution too slow","Wrong answer","Compilation error","None"],ans:0,topic:"CP Basics"},
      {q:"What is MLE verdict?",opts:["Memory Limit Exceeded","Module limit","Memory error","None"],ans:0,topic:"CP Basics"},
      {q:"What is WA verdict?",opts:["Wait Again","None","Wrong Algorithm","Wrong Answer — output doesn't match expected"],ans:3,topic:"CP Basics"},
      {q:"What is RE verdict?",opts:["None","Run Error","Runtime Error — program crashed","Recursion Error"],ans:2,topic:"CP Basics"},
      {q:"What is CE verdict?",opts:["Code Error","None","None","Compilation Error — code doesn't compile"],ans:3,topic:"CP Basics"},
      {q:"What is AC verdict?",opts:["Accepted — correct solution","None","Almost Correct","All Correct"],ans:0,topic:"CP Basics"},
      {q:"What is partial scoring?",opts:["Half score","Getting points for passing some test cases","Partial answer","None"],ans:1,topic:"CP Basics"},
      {q:"What is a brute force solution?",opts:["Try all possibilities — usually O(2^n) or O(n!)","Best solution","None","Greedy"],ans:0,topic:"Problem Solving"},
      {q:"What is a naive solution?",opts:["None","None","Simple but inefficient approach","Perfect solution"],ans:2,topic:"Problem Solving"},
      {q:"What is an edge case?",opts:["None","None","Error case","Boundary condition that may break solution"],ans:3,topic:"Problem Solving"},
      {q:"What is the two-sum problem?",opts:["Adding numbers","Find pair summing to target — O(n) with hashmap","None","None"],ans:1,topic:"Problems"},
      {q:"What is subarray sum?",opts:["Array sum","Sum of contiguous elements in array","None","None"],ans:1,topic:"Problems"},
      {q:"What is prefix sum for range query?",opts:["Range query","None","None","sum[l..r] = pre[r] - pre[l-1] in O(1)"],ans:3,topic:"Techniques"},
      {q:"What is the sliding window maximum problem?",opts:["None","Window max","None","Max in every window of size k"],ans:3,topic:"Problems"},
      {q:"What is the longest common prefix?",opts:["Longest prefix shared by all strings","Common string","None","None"],ans:0,topic:"Strings"},
      {q:"What is Pigeonhole principle?",opts:["None","n+1 items in n bins — at least one bin has 2","None","Pigeonhole class"],ans:1,topic:"Math"},
      {q:"What is modular exponentiation?",opts:["Fast power","a^b mod m in O(log b) using fast power","None","None"],ans:1,topic:"Math"},
      {q:"What is Sieve of Eratosthenes?",opts:["None","None","Prime sieve","Find all primes up to n in O(n log log n)"],ans:3,topic:"Math"},
      {q:"What is prime factorization?",opts:["Factor decomp","Express n as product of prime numbers","None","None"],ans:1,topic:"Math"},
      {q:"What is GCD via Euclidean algorithm?",opts:["Euclidean GCD","gcd(a,b) = gcd(b, a%b) until b=0","None","None"],ans:1,topic:"Math"},
      {q:"What is Fibonacci sequence?",opts:["Each number is sum of two preceding: 0,1,1,2,3,5...","None","Fib class","None"],ans:0,topic:"Math"},
      {q:"What is memoized Fibonacci?",opts:["None","None","Cached Fib","Cache fib(n) results to avoid O(2^n) recursion"],ans:3,topic:"DP"},
      {q:"What is 1-indexed vs 0-indexed array?",opts:["None","Index type","Starting index 1 vs starting index 0","None"],ans:2,topic:"CP Basics"},
      {q:"What is fast I/O in C++?",opts:["Fast input","None","None","ios::sync_with_stdio(false); cin.tie(0);"],ans:3,topic:"CP Basics"},
      {q:"What is a multitest problem?",opts:["None","Multiple test cases per input file","None","Multi test"],ans:1,topic:"CP Basics"},
      {q:"What is binary search for minimum?",opts:["Min search","None","None","Find min x satisfying condition with monotone check"],ans:3,topic:"Binary Search"},
      {q:"What is binary search for maximum?",opts:["None","None","Max search","Find max x satisfying condition with monotone check"],ans:3,topic:"Binary Search"},
      {q:"What is the check function in binary search?",opts:["Check class","None","Returns true/false for mid — must be monotone","None"],ans:2,topic:"Binary Search"},
      {q:"What is integer overflow?",opts:["None","Overflow error","None","Result exceeds int range — use long long"],ans:3,topic:"CP Basics"},
      {q:"What is long long in C++?",opts:["None","64-bit integer for large numbers up to ~9.2*10^18","None","Long integer"],ans:1,topic:"CP Basics"},
      {q:"What is __int128?",opts:["128-bit integer for very large numbers","128 int","None","None"],ans:0,topic:"CP Basics"},
    ],
    intermediate:[
      {q:"O(n log n) complexity example?",opts:["Merge sort, Dijkstra with priority queue","Hashing","Bubble sort","Binary search"],ans:0,topic:"Complexity"},
      {q:"What is sliding window?",opts:["None","Two loops","Maintain subarray window avoiding O(n²)","Animation"],ans:2,topic:"Techniques"},
      {q:"What is two pointers?",opts:["None","Two indices moving to solve in O(n)","Two loops","Two arrays"],ans:1,topic:"Techniques"},
      {q:"What is memoization in DP?",opts:["Tabulation","None","Top-down DP — cache subproblem results","Memory error"],ans:2,topic:"DP"},
      {q:"What is tabulation in DP?",opts:["Bottom-up DP — fill table iteratively","None","Table design","Memoization"],ans:0,topic:"DP"},
      {q:"What is Dijkstra for?",opts:["Sorting","MST","Single-source shortest path non-negative weights","None"],ans:2,topic:"Graphs"},
      {q:"What is Bellman-Ford for?",opts:["Shortest path with negative weights O(VE)","Dijkstra","None","MST"],ans:0,topic:"Graphs"},
      {q:"What is Floyd-Warshall for?",opts:["MST","All-pairs shortest paths O(V³)","Single source","None"],ans:1,topic:"Graphs"},
      {q:"What is DSU for in CP?",opts:["BFS","DFS","None","Connected components, cycle detection, Kruskal"],ans:3,topic:"Graphs"},
      {q:"What is binary search on monotone function?",opts:["None","Linear search","None","Find boundary where check flips true/false"],ans:3,topic:"Binary Search"},
      {q:"What is ternary search?",opts:["None","None","Finds maximum of unimodal function in O(log n)","Binary search"],ans:2,topic:"Searching"},
      {q:"What is coin change DP?",opts:["None","Min coins to make amount — O(amount * coins)","Money problem","Greedy only"],ans:1,topic:"DP"},
      {q:"What is LCS DP?",opts:["None","O(m*n) table — dp[i][j] = LCS of first i and j chars","LCS class","None"],ans:1,topic:"DP"},
      {q:"What is 0/1 Knapsack DP?",opts:["None","None","Knapsack class","dp[i][w] = max value with i items and capacity w"],ans:3,topic:"DP"},
      {q:"What is LIS in O(n log n)?",opts:["None","None","Maintain array and binary search for position","LIS DP"],ans:2,topic:"DP"},
      {q:"What is interval DP?",opts:["Range DP","None","None","dp[l][r] covers subproblem on range [l,r]"],ans:3,topic:"DP"},
      {q:"What is bitmask DP?",opts:["Bit DP","None","None","States represent subsets using bits"],ans:3,topic:"DP"},
      {q:"What is digit DP?",opts:["None","None","Counts numbers in range satisfying digit property","Number DP"],ans:2,topic:"DP"},
      {q:"What is tree DP?",opts:["Tree algorithm","DP on tree — usually process subtrees","None","None"],ans:1,topic:"DP"},
      {q:"What is rerooting DP?",opts:["Re-root class","None","DP on tree considering each node as root","None"],ans:2,topic:"DP"},
      {q:"What is SCC in CP?",opts:["None","Strong component","None","Strongly Connected Components via Tarjan/Kosaraju"],ans:3,topic:"Graphs"},
      {q:"What is bipartite check?",opts:["None","None","BFS/DFS 2-coloring — cycle of odd length = not bipartite","Bipartite test"],ans:2,topic:"Graphs"},
      {q:"What is topological sort in CP?",opts:["None","Topo sort","None","BFS variant — Kahn's algorithm using in-degree"],ans:3,topic:"Graphs"},
      {q:"What is cycle detection in directed graph?",opts:["None","Cycle find","None","DFS with visited and recursion stack"],ans:3,topic:"Graphs"},
      {q:"What is Euler path condition?",opts:["None","Exactly 0 or 2 vertices with odd degree","Euler condition","None"],ans:1,topic:"Graphs"},
      {q:"What is Hierholzer's algorithm?",opts:["Finds Euler path/circuit in O(E)","Euler algo","None","None"],ans:0,topic:"Graphs"},
      {q:"What is binary lifting for LCA?",opts:["None","Precompute 2^k ancestors, query in O(log n)","None","LCA class"],ans:1,topic:"Trees"},
      {q:"What is Euler tour for subtree queries?",opts:["DFS timestamps for range queries on subtrees","None","None","Euler subtree"],ans:0,topic:"Trees"},
      {q:"What is a monotonic stack?",opts:["Mono stack","None","Stack maintaining monotonic order — next greater","None"],ans:2,topic:"Techniques"},
      {q:"What is a monotonic deque?",opts:["Deque for sliding window max/min in O(n)","None","None","Mono deque"],ans:0,topic:"Techniques"},
      {q:"What is offline processing?",opts:["Sort queries to answer more efficiently","None","Offline algo","None"],ans:0,topic:"Techniques"},
      {q:"What is offline vs online query?",opts:["None","Query type","None","Offline knows all queries, online processes live"],ans:3,topic:"Techniques"},
      {q:"What is coordinate compression?",opts:["None","Compression","Map large values to small indices","None"],ans:2,topic:"Techniques"},
      {q:"What is sqrt decomposition?",opts:["None","Divide into √n blocks for O(√n) operations","None","Block algo"],ans:1,topic:"Techniques"},
      {q:"What is meet in the middle?",opts:["None","None","MiM class","Split state space in half — O(2^(n/2))"],ans:3,topic:"Techniques"},
      {q:"What is randomization in CP?",opts:["Random shuffle to avoid worst-case hacking","Random algo","None","None"],ans:0,topic:"Techniques"},
      {q:"What is hashing for strings?",opts:["Polynomial rolling hash for O(1) substring compare","String hash","None","None"],ans:0,topic:"Strings"},
      {q:"What is Z-function?",opts:["None","z[i] = length of longest match with prefix","Z class","None"],ans:1,topic:"String Algorithms"},
      {q:"What is KMP failure function?",opts:["None","None","KMP class","Longest proper prefix which is also suffix"],ans:3,topic:"String Algorithms"},
      {q:"What is string hashing collision?",opts:["None","None","Hash collision","Two strings having same hash — use double hash"],ans:3,topic:"Strings"},
      {q:"What is Trie for CP?",opts:["Prefix tree for O(L) insert/search — XOR tricks","Trie class","None","None"],ans:0,topic:"String Algorithms"},
      {q:"What is Aho-Corasick for CP?",opts:["None","None","Multi-pattern matching — O(n+m+k) total","AC class"],ans:2,topic:"String Algorithms"},
      {q:"What is number theory for CP?",opts:["None","Primes, GCD, mod inverse, CRT, Euler totient","None","Math theory"],ans:1,topic:"Math"},
      {q:"What is Fermat's little theorem for modular inverse?",opts:["Fermat inverse","a^(p-1) ≡ 1 mod p, so inverse = a^(p-2) mod p","None","None"],ans:1,topic:"Math"},
      {q:"What is extended Euclidean algorithm?",opts:["Finds x,y such that ax+by=gcd(a,b)","None","None","Extended GCD"],ans:0,topic:"Math"},
      {q:"What is CRT for CP?",opts:["CRT class","None","Combines congruences with coprime moduli","None"],ans:2,topic:"Math"},
      {q:"What is inclusion-exclusion for CP?",opts:["Count union via alternating sums of intersections","None","None","IE class"],ans:0,topic:"Math"},
      {q:"What is combinatorics in CP?",opts:["Combo class","Counting combinations, permutations, arrangements","None","None"],ans:1,topic:"Math"},
      {q:"What is nCr modulo prime?",opts:["nCr mod","Use Pascal's triangle or Fermat + precomputed factorials","None","None"],ans:1,topic:"Math"},
      {q:"What is a segment tree?",opts:["Tree for range queries and point updates in O(log n)","None","None","Seg tree"],ans:0,topic:"Data Structures"},
      {q:"What is a Fenwick tree for CP?",opts:["None","O(log n) prefix sum queries and point updates","None","BIT class"],ans:1,topic:"Data Structures"},
      {q:"O(n log n) complexity example?",opts:["Merge sort, Dijkstra with priority queue","Hashing","Bubble sort","Binary search"],ans:0,topic:"Complexity"},
      {q:"What is sliding window?",opts:["None","Two loops","Maintain subarray window avoiding O(n²)","Animation"],ans:2,topic:"Techniques"},
      {q:"What is two pointers?",opts:["None","Two indices moving to solve in O(n)","Two loops","Two arrays"],ans:1,topic:"Techniques"},
      {q:"What is memoization in DP?",opts:["Tabulation","None","Top-down DP — cache subproblem results","Memory error"],ans:2,topic:"DP"},
      {q:"What is tabulation in DP?",opts:["Bottom-up DP — fill table iteratively","None","Table design","Memoization"],ans:0,topic:"DP"},
      {q:"What is Dijkstra for?",opts:["Sorting","MST","Single-source shortest path non-negative weights","None"],ans:2,topic:"Graphs"},
      {q:"What is Bellman-Ford for?",opts:["Shortest path with negative weights O(VE)","Dijkstra","None","MST"],ans:0,topic:"Graphs"},
      {q:"What is Floyd-Warshall for?",opts:["MST","All-pairs shortest paths O(V³)","Single source","None"],ans:1,topic:"Graphs"},
      {q:"What is DSU for in CP?",opts:["BFS","DFS","None","Connected components, cycle detection, Kruskal"],ans:3,topic:"Graphs"},
      {q:"What is binary search on monotone function?",opts:["None","Linear search","None","Find boundary where check flips true/false"],ans:3,topic:"Binary Search"},
      {q:"What is ternary search?",opts:["None","None","Finds maximum of unimodal function in O(log n)","Binary search"],ans:2,topic:"Searching"},
      {q:"What is coin change DP?",opts:["None","Min coins to make amount — O(amount * coins)","Money problem","Greedy only"],ans:1,topic:"DP"},
      {q:"What is LCS DP?",opts:["None","O(m*n) table — dp[i][j] = LCS of first i and j chars","LCS class","None"],ans:1,topic:"DP"},
      {q:"What is 0/1 Knapsack DP?",opts:["None","None","Knapsack class","dp[i][w] = max value with i items and capacity w"],ans:3,topic:"DP"},
      {q:"What is LIS in O(n log n)?",opts:["None","None","Maintain array and binary search for position","LIS DP"],ans:2,topic:"DP"},
      {q:"What is interval DP?",opts:["Range DP","None","None","dp[l][r] covers subproblem on range [l,r]"],ans:3,topic:"DP"},
      {q:"What is bitmask DP?",opts:["Bit DP","None","None","States represent subsets using bits"],ans:3,topic:"DP"},
      {q:"What is digit DP?",opts:["None","None","Counts numbers in range satisfying digit property","Number DP"],ans:2,topic:"DP"},
      {q:"What is tree DP?",opts:["Tree algorithm","DP on tree — usually process subtrees","None","None"],ans:1,topic:"DP"},
      {q:"What is rerooting DP?",opts:["Re-root class","None","DP on tree considering each node as root","None"],ans:2,topic:"DP"},
      {q:"What is SCC in CP?",opts:["None","Strong component","None","Strongly Connected Components via Tarjan/Kosaraju"],ans:3,topic:"Graphs"},
      {q:"What is bipartite check?",opts:["None","None","BFS/DFS 2-coloring — cycle of odd length = not bipartite","Bipartite test"],ans:2,topic:"Graphs"},
      {q:"What is topological sort in CP?",opts:["None","Topo sort","None","BFS variant — Kahn's algorithm using in-degree"],ans:3,topic:"Graphs"},
      {q:"What is cycle detection in directed graph?",opts:["None","Cycle find","None","DFS with visited and recursion stack"],ans:3,topic:"Graphs"},
      {q:"What is Euler path condition?",opts:["None","Exactly 0 or 2 vertices with odd degree","Euler condition","None"],ans:1,topic:"Graphs"},
      {q:"What is Hierholzer's algorithm?",opts:["Finds Euler path/circuit in O(E)","Euler algo","None","None"],ans:0,topic:"Graphs"},
      {q:"What is binary lifting for LCA?",opts:["None","Precompute 2^k ancestors, query in O(log n)","None","LCA class"],ans:1,topic:"Trees"},
      {q:"What is Euler tour for subtree queries?",opts:["DFS timestamps for range queries on subtrees","None","None","Euler subtree"],ans:0,topic:"Trees"},
      {q:"What is a monotonic stack?",opts:["Mono stack","None","Stack maintaining monotonic order — next greater","None"],ans:2,topic:"Techniques"},
      {q:"What is a monotonic deque?",opts:["Deque for sliding window max/min in O(n)","None","None","Mono deque"],ans:0,topic:"Techniques"},
      {q:"What is offline processing?",opts:["Sort queries to answer more efficiently","None","Offline algo","None"],ans:0,topic:"Techniques"},
      {q:"What is offline vs online query?",opts:["None","Query type","None","Offline knows all queries, online processes live"],ans:3,topic:"Techniques"},
      {q:"What is coordinate compression?",opts:["None","Compression","Map large values to small indices","None"],ans:2,topic:"Techniques"},
      {q:"What is sqrt decomposition?",opts:["None","Divide into √n blocks for O(√n) operations","None","Block algo"],ans:1,topic:"Techniques"},
      {q:"What is meet in the middle?",opts:["None","None","MiM class","Split state space in half — O(2^(n/2))"],ans:3,topic:"Techniques"},
      {q:"What is randomization in CP?",opts:["Random shuffle to avoid worst-case hacking","Random algo","None","None"],ans:0,topic:"Techniques"},
      {q:"What is hashing for strings?",opts:["Polynomial rolling hash for O(1) substring compare","String hash","None","None"],ans:0,topic:"Strings"},
      {q:"What is Z-function?",opts:["None","z[i] = length of longest match with prefix","Z class","None"],ans:1,topic:"String Algorithms"},
      {q:"What is KMP failure function?",opts:["None","None","KMP class","Longest proper prefix which is also suffix"],ans:3,topic:"String Algorithms"},
      {q:"What is string hashing collision?",opts:["None","None","Hash collision","Two strings having same hash — use double hash"],ans:3,topic:"Strings"},
      {q:"What is Trie for CP?",opts:["Prefix tree for O(L) insert/search — XOR tricks","Trie class","None","None"],ans:0,topic:"String Algorithms"},
      {q:"What is Aho-Corasick for CP?",opts:["None","None","Multi-pattern matching — O(n+m+k) total","AC class"],ans:2,topic:"String Algorithms"},
      {q:"What is number theory for CP?",opts:["None","Primes, GCD, mod inverse, CRT, Euler totient","None","Math theory"],ans:1,topic:"Math"},
      {q:"What is Fermat's little theorem for modular inverse?",opts:["Fermat inverse","a^(p-1) ≡ 1 mod p, so inverse = a^(p-2) mod p","None","None"],ans:1,topic:"Math"},
      {q:"What is extended Euclidean algorithm?",opts:["Finds x,y such that ax+by=gcd(a,b)","None","None","Extended GCD"],ans:0,topic:"Math"},
      {q:"What is CRT for CP?",opts:["CRT class","None","Combines congruences with coprime moduli","None"],ans:2,topic:"Math"},
      {q:"What is inclusion-exclusion for CP?",opts:["Count union via alternating sums of intersections","None","None","IE class"],ans:0,topic:"Math"},
      {q:"What is combinatorics in CP?",opts:["Combo class","Counting combinations, permutations, arrangements","None","None"],ans:1,topic:"Math"},
      {q:"What is nCr modulo prime?",opts:["nCr mod","Use Pascal's triangle or Fermat + precomputed factorials","None","None"],ans:1,topic:"Math"},
      {q:"What is a segment tree?",opts:["Tree for range queries and point updates in O(log n)","None","None","Seg tree"],ans:0,topic:"Data Structures"},
      {q:"What is a Fenwick tree for CP?",opts:["None","O(log n) prefix sum queries and point updates","None","BIT class"],ans:1,topic:"Data Structures"},
      {q:"O(n log n) complexity example?",opts:["Merge sort, Dijkstra with priority queue","Hashing","Bubble sort","Binary search"],ans:0,topic:"Complexity"},
      {q:"What is sliding window?",opts:["None","Two loops","Maintain subarray window avoiding O(n²)","Animation"],ans:2,topic:"Techniques"},
      {q:"What is two pointers?",opts:["None","Two indices moving to solve in O(n)","Two loops","Two arrays"],ans:1,topic:"Techniques"},
      {q:"What is memoization in DP?",opts:["Tabulation","None","Top-down DP — cache subproblem results","Memory error"],ans:2,topic:"DP"},
      {q:"What is tabulation in DP?",opts:["Bottom-up DP — fill table iteratively","None","Table design","Memoization"],ans:0,topic:"DP"},
      {q:"What is Dijkstra for?",opts:["Sorting","MST","Single-source shortest path non-negative weights","None"],ans:2,topic:"Graphs"},
      {q:"What is Bellman-Ford for?",opts:["Shortest path with negative weights O(VE)","Dijkstra","None","MST"],ans:0,topic:"Graphs"},
      {q:"What is Floyd-Warshall for?",opts:["MST","All-pairs shortest paths O(V³)","Single source","None"],ans:1,topic:"Graphs"},
      {q:"What is DSU for in CP?",opts:["BFS","DFS","None","Connected components, cycle detection, Kruskal"],ans:3,topic:"Graphs"},
      {q:"What is binary search on monotone function?",opts:["None","Linear search","None","Find boundary where check flips true/false"],ans:3,topic:"Binary Search"},
      {q:"What is ternary search?",opts:["None","None","Finds maximum of unimodal function in O(log n)","Binary search"],ans:2,topic:"Searching"},
      {q:"What is coin change DP?",opts:["None","Min coins to make amount — O(amount * coins)","Money problem","Greedy only"],ans:1,topic:"DP"},
      {q:"What is LCS DP?",opts:["None","O(m*n) table — dp[i][j] = LCS of first i and j chars","LCS class","None"],ans:1,topic:"DP"},
      {q:"What is 0/1 Knapsack DP?",opts:["None","None","Knapsack class","dp[i][w] = max value with i items and capacity w"],ans:3,topic:"DP"},
      {q:"What is LIS in O(n log n)?",opts:["None","None","Maintain array and binary search for position","LIS DP"],ans:2,topic:"DP"},
      {q:"What is interval DP?",opts:["Range DP","None","None","dp[l][r] covers subproblem on range [l,r]"],ans:3,topic:"DP"},
      {q:"What is bitmask DP?",opts:["Bit DP","None","None","States represent subsets using bits"],ans:3,topic:"DP"},
      {q:"What is digit DP?",opts:["None","None","Counts numbers in range satisfying digit property","Number DP"],ans:2,topic:"DP"},
      {q:"What is tree DP?",opts:["Tree algorithm","DP on tree — usually process subtrees","None","None"],ans:1,topic:"DP"},
      {q:"What is rerooting DP?",opts:["Re-root class","None","DP on tree considering each node as root","None"],ans:2,topic:"DP"},
      {q:"What is SCC in CP?",opts:["None","Strong component","None","Strongly Connected Components via Tarjan/Kosaraju"],ans:3,topic:"Graphs"},
      {q:"What is bipartite check?",opts:["None","None","BFS/DFS 2-coloring — cycle of odd length = not bipartite","Bipartite test"],ans:2,topic:"Graphs"},
      {q:"What is topological sort in CP?",opts:["None","Topo sort","None","BFS variant — Kahn's algorithm using in-degree"],ans:3,topic:"Graphs"},
      {q:"What is cycle detection in directed graph?",opts:["None","Cycle find","None","DFS with visited and recursion stack"],ans:3,topic:"Graphs"},
      {q:"What is Euler path condition?",opts:["None","Exactly 0 or 2 vertices with odd degree","Euler condition","None"],ans:1,topic:"Graphs"},
      {q:"What is Hierholzer's algorithm?",opts:["Finds Euler path/circuit in O(E)","Euler algo","None","None"],ans:0,topic:"Graphs"},
      {q:"What is binary lifting for LCA?",opts:["None","Precompute 2^k ancestors, query in O(log n)","None","LCA class"],ans:1,topic:"Trees"},
      {q:"What is Euler tour for subtree queries?",opts:["DFS timestamps for range queries on subtrees","None","None","Euler subtree"],ans:0,topic:"Trees"},
      {q:"What is a monotonic stack?",opts:["Mono stack","None","Stack maintaining monotonic order — next greater","None"],ans:2,topic:"Techniques"},
      {q:"What is a monotonic deque?",opts:["Deque for sliding window max/min in O(n)","None","None","Mono deque"],ans:0,topic:"Techniques"},
      {q:"What is offline processing?",opts:["Sort queries to answer more efficiently","None","Offline algo","None"],ans:0,topic:"Techniques"},
      {q:"What is offline vs online query?",opts:["None","Query type","None","Offline knows all queries, online processes live"],ans:3,topic:"Techniques"},
      {q:"What is coordinate compression?",opts:["None","Compression","Map large values to small indices","None"],ans:2,topic:"Techniques"},
      {q:"What is sqrt decomposition?",opts:["None","Divide into √n blocks for O(√n) operations","None","Block algo"],ans:1,topic:"Techniques"},
      {q:"What is meet in the middle?",opts:["None","None","MiM class","Split state space in half — O(2^(n/2))"],ans:3,topic:"Techniques"},
      {q:"What is randomization in CP?",opts:["Random shuffle to avoid worst-case hacking","Random algo","None","None"],ans:0,topic:"Techniques"},
      {q:"What is hashing for strings?",opts:["Polynomial rolling hash for O(1) substring compare","String hash","None","None"],ans:0,topic:"Strings"},
      {q:"What is Z-function?",opts:["None","z[i] = length of longest match with prefix","Z class","None"],ans:1,topic:"String Algorithms"},
      {q:"What is KMP failure function?",opts:["None","None","KMP class","Longest proper prefix which is also suffix"],ans:3,topic:"String Algorithms"},
      {q:"What is string hashing collision?",opts:["None","None","Hash collision","Two strings having same hash — use double hash"],ans:3,topic:"Strings"},
      {q:"What is Trie for CP?",opts:["Prefix tree for O(L) insert/search — XOR tricks","Trie class","None","None"],ans:0,topic:"String Algorithms"},
      {q:"What is Aho-Corasick for CP?",opts:["None","None","Multi-pattern matching — O(n+m+k) total","AC class"],ans:2,topic:"String Algorithms"},
      {q:"What is number theory for CP?",opts:["None","Primes, GCD, mod inverse, CRT, Euler totient","None","Math theory"],ans:1,topic:"Math"},
      {q:"What is Fermat's little theorem for modular inverse?",opts:["Fermat inverse","a^(p-1) ≡ 1 mod p, so inverse = a^(p-2) mod p","None","None"],ans:1,topic:"Math"},
      {q:"What is extended Euclidean algorithm?",opts:["Finds x,y such that ax+by=gcd(a,b)","None","None","Extended GCD"],ans:0,topic:"Math"},
      {q:"What is CRT for CP?",opts:["CRT class","None","Combines congruences with coprime moduli","None"],ans:2,topic:"Math"},
      {q:"What is inclusion-exclusion for CP?",opts:["Count union via alternating sums of intersections","None","None","IE class"],ans:0,topic:"Math"},
      {q:"What is combinatorics in CP?",opts:["Combo class","Counting combinations, permutations, arrangements","None","None"],ans:1,topic:"Math"},
      {q:"What is nCr modulo prime?",opts:["nCr mod","Use Pascal's triangle or Fermat + precomputed factorials","None","None"],ans:1,topic:"Math"},
      {q:"What is a segment tree?",opts:["Tree for range queries and point updates in O(log n)","None","None","Seg tree"],ans:0,topic:"Data Structures"},
      {q:"What is a Fenwick tree for CP?",opts:["None","O(log n) prefix sum queries and point updates","None","BIT class"],ans:1,topic:"Data Structures"},
      {q:"O(n log n) complexity example?",opts:["Merge sort, Dijkstra with priority queue","Hashing","Bubble sort","Binary search"],ans:0,topic:"Complexity"},
      {q:"What is sliding window?",opts:["None","Two loops","Maintain subarray window avoiding O(n²)","Animation"],ans:2,topic:"Techniques"},
      {q:"What is two pointers?",opts:["None","Two indices moving to solve in O(n)","Two loops","Two arrays"],ans:1,topic:"Techniques"},
      {q:"What is memoization in DP?",opts:["Tabulation","None","Top-down DP — cache subproblem results","Memory error"],ans:2,topic:"DP"},
      {q:"What is tabulation in DP?",opts:["Bottom-up DP — fill table iteratively","None","Table design","Memoization"],ans:0,topic:"DP"},
      {q:"What is Dijkstra for?",opts:["Sorting","MST","Single-source shortest path non-negative weights","None"],ans:2,topic:"Graphs"},
      {q:"What is Bellman-Ford for?",opts:["Shortest path with negative weights O(VE)","Dijkstra","None","MST"],ans:0,topic:"Graphs"},
      {q:"What is Floyd-Warshall for?",opts:["MST","All-pairs shortest paths O(V³)","Single source","None"],ans:1,topic:"Graphs"},
      {q:"What is DSU for in CP?",opts:["BFS","DFS","None","Connected components, cycle detection, Kruskal"],ans:3,topic:"Graphs"},
      {q:"What is binary search on monotone function?",opts:["None","Linear search","None","Find boundary where check flips true/false"],ans:3,topic:"Binary Search"},
      {q:"What is ternary search?",opts:["None","None","Finds maximum of unimodal function in O(log n)","Binary search"],ans:2,topic:"Searching"},
      {q:"What is coin change DP?",opts:["None","Min coins to make amount — O(amount * coins)","Money problem","Greedy only"],ans:1,topic:"DP"},
      {q:"What is LCS DP?",opts:["None","O(m*n) table — dp[i][j] = LCS of first i and j chars","LCS class","None"],ans:1,topic:"DP"},
      {q:"What is 0/1 Knapsack DP?",opts:["None","None","Knapsack class","dp[i][w] = max value with i items and capacity w"],ans:3,topic:"DP"},
      {q:"What is LIS in O(n log n)?",opts:["None","None","Maintain array and binary search for position","LIS DP"],ans:2,topic:"DP"},
      {q:"What is interval DP?",opts:["Range DP","None","None","dp[l][r] covers subproblem on range [l,r]"],ans:3,topic:"DP"},
      {q:"What is bitmask DP?",opts:["Bit DP","None","None","States represent subsets using bits"],ans:3,topic:"DP"},
      {q:"What is digit DP?",opts:["None","None","Counts numbers in range satisfying digit property","Number DP"],ans:2,topic:"DP"},
      {q:"What is tree DP?",opts:["Tree algorithm","DP on tree — usually process subtrees","None","None"],ans:1,topic:"DP"},
      {q:"What is rerooting DP?",opts:["Re-root class","None","DP on tree considering each node as root","None"],ans:2,topic:"DP"},
      {q:"What is SCC in CP?",opts:["None","Strong component","None","Strongly Connected Components via Tarjan/Kosaraju"],ans:3,topic:"Graphs"},
      {q:"What is bipartite check?",opts:["None","None","BFS/DFS 2-coloring — cycle of odd length = not bipartite","Bipartite test"],ans:2,topic:"Graphs"},
      {q:"What is topological sort in CP?",opts:["None","Topo sort","None","BFS variant — Kahn's algorithm using in-degree"],ans:3,topic:"Graphs"},
      {q:"What is cycle detection in directed graph?",opts:["None","Cycle find","None","DFS with visited and recursion stack"],ans:3,topic:"Graphs"},
      {q:"What is Euler path condition?",opts:["None","Exactly 0 or 2 vertices with odd degree","Euler condition","None"],ans:1,topic:"Graphs"},
      {q:"What is Hierholzer's algorithm?",opts:["Finds Euler path/circuit in O(E)","Euler algo","None","None"],ans:0,topic:"Graphs"},
      {q:"What is binary lifting for LCA?",opts:["None","Precompute 2^k ancestors, query in O(log n)","None","LCA class"],ans:1,topic:"Trees"},
      {q:"What is Euler tour for subtree queries?",opts:["DFS timestamps for range queries on subtrees","None","None","Euler subtree"],ans:0,topic:"Trees"},
      {q:"What is a monotonic stack?",opts:["Mono stack","None","Stack maintaining monotonic order — next greater","None"],ans:2,topic:"Techniques"},
      {q:"What is a monotonic deque?",opts:["Deque for sliding window max/min in O(n)","None","None","Mono deque"],ans:0,topic:"Techniques"},
      {q:"What is offline processing?",opts:["Sort queries to answer more efficiently","None","Offline algo","None"],ans:0,topic:"Techniques"},
      {q:"What is offline vs online query?",opts:["None","Query type","None","Offline knows all queries, online processes live"],ans:3,topic:"Techniques"},
      {q:"What is coordinate compression?",opts:["None","Compression","Map large values to small indices","None"],ans:2,topic:"Techniques"},
      {q:"What is sqrt decomposition?",opts:["None","Divide into √n blocks for O(√n) operations","None","Block algo"],ans:1,topic:"Techniques"},
      {q:"What is meet in the middle?",opts:["None","None","MiM class","Split state space in half — O(2^(n/2))"],ans:3,topic:"Techniques"},
      {q:"What is randomization in CP?",opts:["Random shuffle to avoid worst-case hacking","Random algo","None","None"],ans:0,topic:"Techniques"},
      {q:"What is hashing for strings?",opts:["Polynomial rolling hash for O(1) substring compare","String hash","None","None"],ans:0,topic:"Strings"},
      {q:"What is Z-function?",opts:["None","z[i] = length of longest match with prefix","Z class","None"],ans:1,topic:"String Algorithms"},
      {q:"What is KMP failure function?",opts:["None","None","KMP class","Longest proper prefix which is also suffix"],ans:3,topic:"String Algorithms"},
      {q:"What is string hashing collision?",opts:["None","None","Hash collision","Two strings having same hash — use double hash"],ans:3,topic:"Strings"},
      {q:"What is Trie for CP?",opts:["Prefix tree for O(L) insert/search — XOR tricks","Trie class","None","None"],ans:0,topic:"String Algorithms"},
      {q:"What is Aho-Corasick for CP?",opts:["None","None","Multi-pattern matching — O(n+m+k) total","AC class"],ans:2,topic:"String Algorithms"},
      {q:"What is number theory for CP?",opts:["None","Primes, GCD, mod inverse, CRT, Euler totient","None","Math theory"],ans:1,topic:"Math"},
      {q:"What is Fermat's little theorem for modular inverse?",opts:["Fermat inverse","a^(p-1) ≡ 1 mod p, so inverse = a^(p-2) mod p","None","None"],ans:1,topic:"Math"},
      {q:"What is extended Euclidean algorithm?",opts:["Finds x,y such that ax+by=gcd(a,b)","None","None","Extended GCD"],ans:0,topic:"Math"},
      {q:"What is CRT for CP?",opts:["CRT class","None","Combines congruences with coprime moduli","None"],ans:2,topic:"Math"},
      {q:"What is inclusion-exclusion for CP?",opts:["Count union via alternating sums of intersections","None","None","IE class"],ans:0,topic:"Math"},
    ],
    advanced:[
      {q:"What is Heavy-Light Decomposition?",opts:["HLD class","None","None","Tree into chains for O(log²n) path queries"],ans:3,topic:"Advanced Trees"},
      {q:"What is Centroid Decomposition?",opts:["None","None","Decompose at centroid for path problems O(n log n)","CD class"],ans:2,topic:"Advanced Trees"},
      {q:"What is Persistent Segment Tree?",opts:["None","None","PST class","Version history — access any past version O(log n)"],ans:3,topic:"Advanced DS"},
      {q:"What is a Treap for CP?",opts:["None","Randomized BST — split/merge in O(log n) expected","None","Treap class"],ans:1,topic:"Advanced DS"},
      {q:"What is Li Chao tree?",opts:["LC tree","None","Segment tree for line minimization queries","None"],ans:2,topic:"Advanced DS"},
      {q:"What is Convex Hull Trick?",opts:["None","Optimizes linear DP transitions using convex hull","None","CHT class"],ans:1,topic:"Advanced DP"},
      {q:"What is D&C DP optimization?",opts:["None","DnC DP","None","Monotone opt reduces O(n²) DP to O(n log n)"],ans:3,topic:"Advanced DP"},
      {q:"What is Knuth's optimization?",opts:["None","None","Knuth class","When opt(i,j) monotone — O(n²) from O(n³)"],ans:3,topic:"Advanced DP"},
      {q:"What is SMAWK algorithm?",opts:["None","None","SMAWK class","O(n) optimization for totally monotone matrices"],ans:3,topic:"Advanced DP"},
      {q:"What is aliens trick (Lagrangian relaxation)?",opts:["Aliens DP","None","Adds penalty to remove constraint on exactly k items","None"],ans:2,topic:"Advanced DP"},
      {q:"What is online convex hull trick?",opts:["CHT for non-monotone queries using Li Chao tree","Online CHT","None","None"],ans:0,topic:"Advanced DP"},
      {q:"What is matrix exponentiation?",opts:["None","Matrix power","Compute n-th Fibonacci or recurrence in O(k³ log n)","None"],ans:2,topic:"Math"},
      {q:"What is fast Fourier transform (FFT)?",opts:["None","O(n log n) polynomial multiplication","None","FFT class"],ans:1,topic:"Math"},
      {q:"What is NTT?",opts:["Number Theoretic Transform — FFT with modular arithmetic","None","NTT class","None"],ans:0,topic:"Math"},
      {q:"What is XOR convolution?",opts:["None","None","Fast XOR of all subset sums using Walsh-Hadamard","XOR conv"],ans:2,topic:"Math"},
      {q:"What is Sum over Subsets (SOS) DP?",opts:["SOS class","O(n * 2^n) DP for subset sum over all subsets","None","None"],ans:1,topic:"Math"},
      {q:"What is Z algorithm for CP?",opts:["O(n) prefix matching array for pattern search","None","None","Z function"],ans:0,topic:"String Algorithms"},
      {q:"What is suffix array construction?",opts:["None","Sort suffixes in O(n log n) with SA-IS or DC3","None","SA class"],ans:1,topic:"String Algorithms"},
      {q:"What is LCP array?",opts:["None","LCP class","Longest Common Prefix between adjacent suffixes","None"],ans:2,topic:"String Algorithms"},
      {q:"What is suffix automaton?",opts:["None","SAM class","None","Compact DAG representing all substrings in O(n)"],ans:3,topic:"String Algorithms"},
      {q:"What is Palindromic Tree (Eertree)?",opts:["Pal tree","None","Trie of all palindromic substrings","None"],ans:2,topic:"String Algorithms"},
      {q:"What is Manacher's algorithm?",opts:["None","O(n) longest palindromic substring","Manacher class","None"],ans:1,topic:"String Algorithms"},
      {q:"What is max flow in CP?",opts:["Flow class","None","Dinic's algorithm O(V²E) for max flow","None"],ans:2,topic:"Flows"},
      {q:"What is min cost max flow?",opts:["None","None","MCMF class","Flow maximizing total cost — SPFA or SSP"],ans:3,topic:"Flows"},
      {q:"What is bipartite matching in CP?",opts:["BM class","None","None","Hopcroft-Karp O(E√V) — faster than Hungarian"],ans:3,topic:"Flows"},
      {q:"What is Hall's theorem?",opts:["None","None","Hall class","Bipartite perfect matching exists iff Hall condition holds"],ans:3,topic:"Flows"},
      {q:"What is Dilworth's theorem?",opts:["None","Dilworth class","Min chains to cover = max antichain in poset","None"],ans:2,topic:"Flows"},
      {q:"What is Sprague-Grundy for game theory?",opts:["XOR of Grundy values determines winner","None","SG class","None"],ans:0,topic:"Game Theory"},
      {q:"What is Nim and Nim-sum?",opts:["None","Nim class","XOR of pile sizes determines winning position","None"],ans:2,topic:"Game Theory"},
      {q:"What is Green Hackenbush?",opts:["None","None","Graph game with Grundy analysis","GH class"],ans:2,topic:"Game Theory"},
      {q:"What is Codeforces rating system?",opts:["None","CF rating","None","ELO-based with contest performance adjustments"],ans:3,topic:"CP Meta"},
      {q:"What is ICPC?",opts:["None","None","ICPC class","International Collegiate Programming Contest"],ans:3,topic:"CP Meta"},
      {q:"What is IOI?",opts:["None","IOI class","None","International Olympiad in Informatics — high school"],ans:3,topic:"CP Meta"},
      {q:"What is Atcoder?",opts:["None","Japanese CP platform with high quality problems","None","Atcoder class"],ans:1,topic:"Platforms"},
      {q:"What is USACO?",opts:["USACO class","None","None","USA Computing Olympiad — 4 divisions"],ans:3,topic:"Platforms"},
      {q:"What is Hackerrank?",opts:["CP and interview preparation platform","HR class","None","None"],ans:0,topic:"Platforms"},
      {q:"What is a virtual contest?",opts:["None","None","Virtual class","Upsolving past contest as if live"],ans:3,topic:"CP Meta"},
      {q:"What is upsolving?",opts:["Upsol class","None","Solving problems you couldn't during contest","None"],ans:2,topic:"CP Meta"},
      {q:"What is editorial?",opts:["None","None","Editor class","Official solution explanation for contest problems"],ans:3,topic:"CP Meta"},
      {q:"What is a hack in CF?",opts:["Submitting failing test case against opponent's code","None","None","CF hack"],ans:0,topic:"CP Meta"},
      {q:"What is Heavy-Light Decomposition?",opts:["HLD class","None","None","Tree into chains for O(log²n) path queries"],ans:3,topic:"Advanced Trees"},
      {q:"What is Centroid Decomposition?",opts:["None","None","Decompose at centroid for path problems O(n log n)","CD class"],ans:2,topic:"Advanced Trees"},
      {q:"What is Persistent Segment Tree?",opts:["None","None","PST class","Version history — access any past version O(log n)"],ans:3,topic:"Advanced DS"},
      {q:"What is a Treap for CP?",opts:["None","Randomized BST — split/merge in O(log n) expected","None","Treap class"],ans:1,topic:"Advanced DS"},
      {q:"What is Li Chao tree?",opts:["LC tree","None","Segment tree for line minimization queries","None"],ans:2,topic:"Advanced DS"},
      {q:"What is Convex Hull Trick?",opts:["None","Optimizes linear DP transitions using convex hull","None","CHT class"],ans:1,topic:"Advanced DP"},
      {q:"What is D&C DP optimization?",opts:["None","DnC DP","None","Monotone opt reduces O(n²) DP to O(n log n)"],ans:3,topic:"Advanced DP"},
      {q:"What is Knuth's optimization?",opts:["None","None","Knuth class","When opt(i,j) monotone — O(n²) from O(n³)"],ans:3,topic:"Advanced DP"},
      {q:"What is SMAWK algorithm?",opts:["None","None","SMAWK class","O(n) optimization for totally monotone matrices"],ans:3,topic:"Advanced DP"},
      {q:"What is aliens trick (Lagrangian relaxation)?",opts:["Aliens DP","None","Adds penalty to remove constraint on exactly k items","None"],ans:2,topic:"Advanced DP"},
      {q:"What is online convex hull trick?",opts:["CHT for non-monotone queries using Li Chao tree","Online CHT","None","None"],ans:0,topic:"Advanced DP"},
      {q:"What is matrix exponentiation?",opts:["None","Matrix power","Compute n-th Fibonacci or recurrence in O(k³ log n)","None"],ans:2,topic:"Math"},
      {q:"What is fast Fourier transform (FFT)?",opts:["None","O(n log n) polynomial multiplication","None","FFT class"],ans:1,topic:"Math"},
      {q:"What is NTT?",opts:["Number Theoretic Transform — FFT with modular arithmetic","None","NTT class","None"],ans:0,topic:"Math"},
      {q:"What is XOR convolution?",opts:["None","None","Fast XOR of all subset sums using Walsh-Hadamard","XOR conv"],ans:2,topic:"Math"},
      {q:"What is Sum over Subsets (SOS) DP?",opts:["SOS class","O(n * 2^n) DP for subset sum over all subsets","None","None"],ans:1,topic:"Math"},
      {q:"What is Z algorithm for CP?",opts:["O(n) prefix matching array for pattern search","None","None","Z function"],ans:0,topic:"String Algorithms"},
      {q:"What is suffix array construction?",opts:["None","Sort suffixes in O(n log n) with SA-IS or DC3","None","SA class"],ans:1,topic:"String Algorithms"},
      {q:"What is LCP array?",opts:["None","LCP class","Longest Common Prefix between adjacent suffixes","None"],ans:2,topic:"String Algorithms"},
      {q:"What is suffix automaton?",opts:["None","SAM class","None","Compact DAG representing all substrings in O(n)"],ans:3,topic:"String Algorithms"},
      {q:"What is Palindromic Tree (Eertree)?",opts:["Pal tree","None","Trie of all palindromic substrings","None"],ans:2,topic:"String Algorithms"},
      {q:"What is Manacher's algorithm?",opts:["None","O(n) longest palindromic substring","Manacher class","None"],ans:1,topic:"String Algorithms"},
      {q:"What is max flow in CP?",opts:["Flow class","None","Dinic's algorithm O(V²E) for max flow","None"],ans:2,topic:"Flows"},
      {q:"What is min cost max flow?",opts:["None","None","MCMF class","Flow maximizing total cost — SPFA or SSP"],ans:3,topic:"Flows"},
      {q:"What is bipartite matching in CP?",opts:["BM class","None","None","Hopcroft-Karp O(E√V) — faster than Hungarian"],ans:3,topic:"Flows"},
      {q:"What is Hall's theorem?",opts:["None","None","Hall class","Bipartite perfect matching exists iff Hall condition holds"],ans:3,topic:"Flows"},
      {q:"What is Dilworth's theorem?",opts:["None","Dilworth class","Min chains to cover = max antichain in poset","None"],ans:2,topic:"Flows"},
      {q:"What is Sprague-Grundy for game theory?",opts:["XOR of Grundy values determines winner","None","SG class","None"],ans:0,topic:"Game Theory"},
      {q:"What is Nim and Nim-sum?",opts:["None","Nim class","XOR of pile sizes determines winning position","None"],ans:2,topic:"Game Theory"},
      {q:"What is Green Hackenbush?",opts:["None","None","Graph game with Grundy analysis","GH class"],ans:2,topic:"Game Theory"},
      {q:"What is Codeforces rating system?",opts:["None","CF rating","None","ELO-based with contest performance adjustments"],ans:3,topic:"CP Meta"},
      {q:"What is ICPC?",opts:["None","None","ICPC class","International Collegiate Programming Contest"],ans:3,topic:"CP Meta"},
      {q:"What is IOI?",opts:["None","IOI class","None","International Olympiad in Informatics — high school"],ans:3,topic:"CP Meta"},
      {q:"What is Atcoder?",opts:["None","Japanese CP platform with high quality problems","None","Atcoder class"],ans:1,topic:"Platforms"},
      {q:"What is USACO?",opts:["USACO class","None","None","USA Computing Olympiad — 4 divisions"],ans:3,topic:"Platforms"},
      {q:"What is Hackerrank?",opts:["CP and interview preparation platform","HR class","None","None"],ans:0,topic:"Platforms"},
      {q:"What is a virtual contest?",opts:["None","None","Virtual class","Upsolving past contest as if live"],ans:3,topic:"CP Meta"},
      {q:"What is upsolving?",opts:["Upsol class","None","Solving problems you couldn't during contest","None"],ans:2,topic:"CP Meta"},
      {q:"What is editorial?",opts:["None","None","Editor class","Official solution explanation for contest problems"],ans:3,topic:"CP Meta"},
      {q:"What is a hack in CF?",opts:["Submitting failing test case against opponent's code","None","None","CF hack"],ans:0,topic:"CP Meta"},
      {q:"What is Heavy-Light Decomposition?",opts:["HLD class","None","None","Tree into chains for O(log²n) path queries"],ans:3,topic:"Advanced Trees"},
      {q:"What is Centroid Decomposition?",opts:["None","None","Decompose at centroid for path problems O(n log n)","CD class"],ans:2,topic:"Advanced Trees"},
      {q:"What is Persistent Segment Tree?",opts:["None","None","PST class","Version history — access any past version O(log n)"],ans:3,topic:"Advanced DS"},
      {q:"What is a Treap for CP?",opts:["None","Randomized BST — split/merge in O(log n) expected","None","Treap class"],ans:1,topic:"Advanced DS"},
      {q:"What is Li Chao tree?",opts:["LC tree","None","Segment tree for line minimization queries","None"],ans:2,topic:"Advanced DS"},
      {q:"What is Convex Hull Trick?",opts:["None","Optimizes linear DP transitions using convex hull","None","CHT class"],ans:1,topic:"Advanced DP"},
      {q:"What is D&C DP optimization?",opts:["None","DnC DP","None","Monotone opt reduces O(n²) DP to O(n log n)"],ans:3,topic:"Advanced DP"},
      {q:"What is Knuth's optimization?",opts:["None","None","Knuth class","When opt(i,j) monotone — O(n²) from O(n³)"],ans:3,topic:"Advanced DP"},
      {q:"What is SMAWK algorithm?",opts:["None","None","SMAWK class","O(n) optimization for totally monotone matrices"],ans:3,topic:"Advanced DP"},
      {q:"What is aliens trick (Lagrangian relaxation)?",opts:["Aliens DP","None","Adds penalty to remove constraint on exactly k items","None"],ans:2,topic:"Advanced DP"},
      {q:"What is online convex hull trick?",opts:["CHT for non-monotone queries using Li Chao tree","Online CHT","None","None"],ans:0,topic:"Advanced DP"},
      {q:"What is matrix exponentiation?",opts:["None","Matrix power","Compute n-th Fibonacci or recurrence in O(k³ log n)","None"],ans:2,topic:"Math"},
      {q:"What is fast Fourier transform (FFT)?",opts:["None","O(n log n) polynomial multiplication","None","FFT class"],ans:1,topic:"Math"},
      {q:"What is NTT?",opts:["Number Theoretic Transform — FFT with modular arithmetic","None","NTT class","None"],ans:0,topic:"Math"},
      {q:"What is XOR convolution?",opts:["None","None","Fast XOR of all subset sums using Walsh-Hadamard","XOR conv"],ans:2,topic:"Math"},
      {q:"What is Sum over Subsets (SOS) DP?",opts:["SOS class","O(n * 2^n) DP for subset sum over all subsets","None","None"],ans:1,topic:"Math"},
      {q:"What is Z algorithm for CP?",opts:["O(n) prefix matching array for pattern search","None","None","Z function"],ans:0,topic:"String Algorithms"},
      {q:"What is suffix array construction?",opts:["None","Sort suffixes in O(n log n) with SA-IS or DC3","None","SA class"],ans:1,topic:"String Algorithms"},
      {q:"What is LCP array?",opts:["None","LCP class","Longest Common Prefix between adjacent suffixes","None"],ans:2,topic:"String Algorithms"},
      {q:"What is suffix automaton?",opts:["None","SAM class","None","Compact DAG representing all substrings in O(n)"],ans:3,topic:"String Algorithms"},
      {q:"What is Palindromic Tree (Eertree)?",opts:["Pal tree","None","Trie of all palindromic substrings","None"],ans:2,topic:"String Algorithms"},
      {q:"What is Manacher's algorithm?",opts:["None","O(n) longest palindromic substring","Manacher class","None"],ans:1,topic:"String Algorithms"},
      {q:"What is max flow in CP?",opts:["Flow class","None","Dinic's algorithm O(V²E) for max flow","None"],ans:2,topic:"Flows"},
      {q:"What is min cost max flow?",opts:["None","None","MCMF class","Flow maximizing total cost — SPFA or SSP"],ans:3,topic:"Flows"},
      {q:"What is bipartite matching in CP?",opts:["BM class","None","None","Hopcroft-Karp O(E√V) — faster than Hungarian"],ans:3,topic:"Flows"},
      {q:"What is Hall's theorem?",opts:["None","None","Hall class","Bipartite perfect matching exists iff Hall condition holds"],ans:3,topic:"Flows"},
      {q:"What is Dilworth's theorem?",opts:["None","Dilworth class","Min chains to cover = max antichain in poset","None"],ans:2,topic:"Flows"},
      {q:"What is Sprague-Grundy for game theory?",opts:["XOR of Grundy values determines winner","None","SG class","None"],ans:0,topic:"Game Theory"},
      {q:"What is Nim and Nim-sum?",opts:["None","Nim class","XOR of pile sizes determines winning position","None"],ans:2,topic:"Game Theory"},
      {q:"What is Green Hackenbush?",opts:["None","None","Graph game with Grundy analysis","GH class"],ans:2,topic:"Game Theory"},
      {q:"What is Codeforces rating system?",opts:["None","CF rating","None","ELO-based with contest performance adjustments"],ans:3,topic:"CP Meta"},
      {q:"What is ICPC?",opts:["None","None","ICPC class","International Collegiate Programming Contest"],ans:3,topic:"CP Meta"},
      {q:"What is IOI?",opts:["None","IOI class","None","International Olympiad in Informatics — high school"],ans:3,topic:"CP Meta"},
      {q:"What is Atcoder?",opts:["None","Japanese CP platform with high quality problems","None","Atcoder class"],ans:1,topic:"Platforms"},
      {q:"What is USACO?",opts:["USACO class","None","None","USA Computing Olympiad — 4 divisions"],ans:3,topic:"Platforms"},
      {q:"What is Hackerrank?",opts:["CP and interview preparation platform","HR class","None","None"],ans:0,topic:"Platforms"},
      {q:"What is a virtual contest?",opts:["None","None","Virtual class","Upsolving past contest as if live"],ans:3,topic:"CP Meta"},
      {q:"What is upsolving?",opts:["Upsol class","None","Solving problems you couldn't during contest","None"],ans:2,topic:"CP Meta"},
      {q:"What is editorial?",opts:["None","None","Editor class","Official solution explanation for contest problems"],ans:3,topic:"CP Meta"},
      {q:"What is a hack in CF?",opts:["Submitting failing test case against opponent's code","None","None","CF hack"],ans:0,topic:"CP Meta"},
      {q:"What is Heavy-Light Decomposition?",opts:["HLD class","None","None","Tree into chains for O(log²n) path queries"],ans:3,topic:"Advanced Trees"},
      {q:"What is Centroid Decomposition?",opts:["None","None","Decompose at centroid for path problems O(n log n)","CD class"],ans:2,topic:"Advanced Trees"},
      {q:"What is Persistent Segment Tree?",opts:["None","None","PST class","Version history — access any past version O(log n)"],ans:3,topic:"Advanced DS"},
      {q:"What is a Treap for CP?",opts:["None","Randomized BST — split/merge in O(log n) expected","None","Treap class"],ans:1,topic:"Advanced DS"},
      {q:"What is Li Chao tree?",opts:["LC tree","None","Segment tree for line minimization queries","None"],ans:2,topic:"Advanced DS"},
      {q:"What is Convex Hull Trick?",opts:["None","Optimizes linear DP transitions using convex hull","None","CHT class"],ans:1,topic:"Advanced DP"},
      {q:"What is D&C DP optimization?",opts:["None","DnC DP","None","Monotone opt reduces O(n²) DP to O(n log n)"],ans:3,topic:"Advanced DP"},
      {q:"What is Knuth's optimization?",opts:["None","None","Knuth class","When opt(i,j) monotone — O(n²) from O(n³)"],ans:3,topic:"Advanced DP"},
      {q:"What is SMAWK algorithm?",opts:["None","None","SMAWK class","O(n) optimization for totally monotone matrices"],ans:3,topic:"Advanced DP"},
      {q:"What is aliens trick (Lagrangian relaxation)?",opts:["Aliens DP","None","Adds penalty to remove constraint on exactly k items","None"],ans:2,topic:"Advanced DP"},
      {q:"What is online convex hull trick?",opts:["CHT for non-monotone queries using Li Chao tree","Online CHT","None","None"],ans:0,topic:"Advanced DP"},
      {q:"What is matrix exponentiation?",opts:["None","Matrix power","Compute n-th Fibonacci or recurrence in O(k³ log n)","None"],ans:2,topic:"Math"},
      {q:"What is fast Fourier transform (FFT)?",opts:["None","O(n log n) polynomial multiplication","None","FFT class"],ans:1,topic:"Math"},
      {q:"What is NTT?",opts:["Number Theoretic Transform — FFT with modular arithmetic","None","NTT class","None"],ans:0,topic:"Math"},
      {q:"What is XOR convolution?",opts:["None","None","Fast XOR of all subset sums using Walsh-Hadamard","XOR conv"],ans:2,topic:"Math"},
      {q:"What is Sum over Subsets (SOS) DP?",opts:["SOS class","O(n * 2^n) DP for subset sum over all subsets","None","None"],ans:1,topic:"Math"},
      {q:"What is Z algorithm for CP?",opts:["O(n) prefix matching array for pattern search","None","None","Z function"],ans:0,topic:"String Algorithms"},
      {q:"What is suffix array construction?",opts:["None","Sort suffixes in O(n log n) with SA-IS or DC3","None","SA class"],ans:1,topic:"String Algorithms"},
      {q:"What is LCP array?",opts:["None","LCP class","Longest Common Prefix between adjacent suffixes","None"],ans:2,topic:"String Algorithms"},
      {q:"What is suffix automaton?",opts:["None","SAM class","None","Compact DAG representing all substrings in O(n)"],ans:3,topic:"String Algorithms"},
      {q:"What is Palindromic Tree (Eertree)?",opts:["Pal tree","None","Trie of all palindromic substrings","None"],ans:2,topic:"String Algorithms"},
      {q:"What is Manacher's algorithm?",opts:["None","O(n) longest palindromic substring","Manacher class","None"],ans:1,topic:"String Algorithms"},
      {q:"What is max flow in CP?",opts:["Flow class","None","Dinic's algorithm O(V²E) for max flow","None"],ans:2,topic:"Flows"},
      {q:"What is min cost max flow?",opts:["None","None","MCMF class","Flow maximizing total cost — SPFA or SSP"],ans:3,topic:"Flows"},
      {q:"What is bipartite matching in CP?",opts:["BM class","None","None","Hopcroft-Karp O(E√V) — faster than Hungarian"],ans:3,topic:"Flows"},
      {q:"What is Hall's theorem?",opts:["None","None","Hall class","Bipartite perfect matching exists iff Hall condition holds"],ans:3,topic:"Flows"},
      {q:"What is Dilworth's theorem?",opts:["None","Dilworth class","Min chains to cover = max antichain in poset","None"],ans:2,topic:"Flows"},
      {q:"What is Sprague-Grundy for game theory?",opts:["XOR of Grundy values determines winner","None","SG class","None"],ans:0,topic:"Game Theory"},
      {q:"What is Nim and Nim-sum?",opts:["None","Nim class","XOR of pile sizes determines winning position","None"],ans:2,topic:"Game Theory"},
      {q:"What is Green Hackenbush?",opts:["None","None","Graph game with Grundy analysis","GH class"],ans:2,topic:"Game Theory"},
      {q:"What is Codeforces rating system?",opts:["None","CF rating","None","ELO-based with contest performance adjustments"],ans:3,topic:"CP Meta"},
      {q:"What is ICPC?",opts:["None","None","ICPC class","International Collegiate Programming Contest"],ans:3,topic:"CP Meta"},
      {q:"What is IOI?",opts:["None","IOI class","None","International Olympiad in Informatics — high school"],ans:3,topic:"CP Meta"},
      {q:"What is Atcoder?",opts:["None","Japanese CP platform with high quality problems","None","Atcoder class"],ans:1,topic:"Platforms"},
      {q:"What is USACO?",opts:["USACO class","None","None","USA Computing Olympiad — 4 divisions"],ans:3,topic:"Platforms"},
      {q:"What is Hackerrank?",opts:["CP and interview preparation platform","HR class","None","None"],ans:0,topic:"Platforms"},
      {q:"What is a virtual contest?",opts:["None","None","Virtual class","Upsolving past contest as if live"],ans:3,topic:"CP Meta"},
      {q:"What is upsolving?",opts:["Upsol class","None","Solving problems you couldn't during contest","None"],ans:2,topic:"CP Meta"},
      {q:"What is editorial?",opts:["None","None","Editor class","Official solution explanation for contest problems"],ans:3,topic:"CP Meta"},
      {q:"What is a hack in CF?",opts:["Submitting failing test case against opponent's code","None","None","CF hack"],ans:0,topic:"CP Meta"},
      {q:"What is Heavy-Light Decomposition?",opts:["HLD class","None","None","Tree into chains for O(log²n) path queries"],ans:3,topic:"Advanced Trees"},
      {q:"What is Centroid Decomposition?",opts:["None","None","Decompose at centroid for path problems O(n log n)","CD class"],ans:2,topic:"Advanced Trees"},
      {q:"What is Persistent Segment Tree?",opts:["None","None","PST class","Version history — access any past version O(log n)"],ans:3,topic:"Advanced DS"},
      {q:"What is a Treap for CP?",opts:["None","Randomized BST — split/merge in O(log n) expected","None","Treap class"],ans:1,topic:"Advanced DS"},
      {q:"What is Li Chao tree?",opts:["LC tree","None","Segment tree for line minimization queries","None"],ans:2,topic:"Advanced DS"},
      {q:"What is Convex Hull Trick?",opts:["None","Optimizes linear DP transitions using convex hull","None","CHT class"],ans:1,topic:"Advanced DP"},
      {q:"What is D&C DP optimization?",opts:["None","DnC DP","None","Monotone opt reduces O(n²) DP to O(n log n)"],ans:3,topic:"Advanced DP"},
      {q:"What is Knuth's optimization?",opts:["None","None","Knuth class","When opt(i,j) monotone — O(n²) from O(n³)"],ans:3,topic:"Advanced DP"},
      {q:"What is SMAWK algorithm?",opts:["None","None","SMAWK class","O(n) optimization for totally monotone matrices"],ans:3,topic:"Advanced DP"},
      {q:"What is aliens trick (Lagrangian relaxation)?",opts:["Aliens DP","None","Adds penalty to remove constraint on exactly k items","None"],ans:2,topic:"Advanced DP"},
      {q:"What is online convex hull trick?",opts:["CHT for non-monotone queries using Li Chao tree","Online CHT","None","None"],ans:0,topic:"Advanced DP"},
      {q:"What is matrix exponentiation?",opts:["None","Matrix power","Compute n-th Fibonacci or recurrence in O(k³ log n)","None"],ans:2,topic:"Math"},
      {q:"What is fast Fourier transform (FFT)?",opts:["None","O(n log n) polynomial multiplication","None","FFT class"],ans:1,topic:"Math"},
      {q:"What is NTT?",opts:["Number Theoretic Transform — FFT with modular arithmetic","None","NTT class","None"],ans:0,topic:"Math"},
      {q:"What is XOR convolution?",opts:["None","None","Fast XOR of all subset sums using Walsh-Hadamard","XOR conv"],ans:2,topic:"Math"},
      {q:"What is Sum over Subsets (SOS) DP?",opts:["SOS class","O(n * 2^n) DP for subset sum over all subsets","None","None"],ans:1,topic:"Math"},
      {q:"What is Z algorithm for CP?",opts:["O(n) prefix matching array for pattern search","None","None","Z function"],ans:0,topic:"String Algorithms"},
      {q:"What is suffix array construction?",opts:["None","Sort suffixes in O(n log n) with SA-IS or DC3","None","SA class"],ans:1,topic:"String Algorithms"},
      {q:"What is LCP array?",opts:["None","LCP class","Longest Common Prefix between adjacent suffixes","None"],ans:2,topic:"String Algorithms"},
      {q:"What is suffix automaton?",opts:["None","SAM class","None","Compact DAG representing all substrings in O(n)"],ans:3,topic:"String Algorithms"},
      {q:"What is Palindromic Tree (Eertree)?",opts:["Pal tree","None","Trie of all palindromic substrings","None"],ans:2,topic:"String Algorithms"},
      {q:"What is Manacher's algorithm?",opts:["None","O(n) longest palindromic substring","Manacher class","None"],ans:1,topic:"String Algorithms"},
      {q:"What is max flow in CP?",opts:["Flow class","None","Dinic's algorithm O(V²E) for max flow","None"],ans:2,topic:"Flows"},
      {q:"What is min cost max flow?",opts:["None","None","MCMF class","Flow maximizing total cost — SPFA or SSP"],ans:3,topic:"Flows"},
      {q:"What is bipartite matching in CP?",opts:["BM class","None","None","Hopcroft-Karp O(E√V) — faster than Hungarian"],ans:3,topic:"Flows"},
      {q:"What is Hall's theorem?",opts:["None","None","Hall class","Bipartite perfect matching exists iff Hall condition holds"],ans:3,topic:"Flows"},
      {q:"What is Dilworth's theorem?",opts:["None","Dilworth class","Min chains to cover = max antichain in poset","None"],ans:2,topic:"Flows"},
      {q:"What is Sprague-Grundy for game theory?",opts:["XOR of Grundy values determines winner","None","SG class","None"],ans:0,topic:"Game Theory"},
      {q:"What is Nim and Nim-sum?",opts:["None","Nim class","XOR of pile sizes determines winning position","None"],ans:2,topic:"Game Theory"},
      {q:"What is Green Hackenbush?",opts:["None","None","Graph game with Grundy analysis","GH class"],ans:2,topic:"Game Theory"},
      {q:"What is Codeforces rating system?",opts:["None","CF rating","None","ELO-based with contest performance adjustments"],ans:3,topic:"CP Meta"},
      {q:"What is ICPC?",opts:["None","None","ICPC class","International Collegiate Programming Contest"],ans:3,topic:"CP Meta"},
      {q:"What is IOI?",opts:["None","IOI class","None","International Olympiad in Informatics — high school"],ans:3,topic:"CP Meta"},
      {q:"What is Atcoder?",opts:["None","Japanese CP platform with high quality problems","None","Atcoder class"],ans:1,topic:"Platforms"},
      {q:"What is USACO?",opts:["USACO class","None","None","USA Computing Olympiad — 4 divisions"],ans:3,topic:"Platforms"},
      {q:"What is Hackerrank?",opts:["CP and interview preparation platform","HR class","None","None"],ans:0,topic:"Platforms"},
      {q:"What is a virtual contest?",opts:["None","None","Virtual class","Upsolving past contest as if live"],ans:3,topic:"CP Meta"},
      {q:"What is upsolving?",opts:["Upsol class","None","Solving problems you couldn't during contest","None"],ans:2,topic:"CP Meta"},
      {q:"What is editorial?",opts:["None","None","Editor class","Official solution explanation for contest problems"],ans:3,topic:"CP Meta"},
      {q:"What is a hack in CF?",opts:["Submitting failing test case against opponent's code","None","None","CF hack"],ans:0,topic:"CP Meta"},
    ],
  },
};

function shuffleQ(rawQ){
  const tagged = rawQ.opts.map((text,i)=>({text, isCorrect: i===rawQ.ans}));
  for(let i=tagged.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [tagged[i],tagged[j]]=[tagged[j],tagged[i]];
  }
  const newOpts = tagged.map(t=>t.text);
  const newAns  = tagged.findIndex(t=>t.isCorrect);
  return {...rawQ, opts:newOpts, ans:newAns};
}

function chunkArr(arr,n){
  const out=[];
  for(let i=0;i<arr.length;i+=n) out.push(arr.slice(i,i+n));
  return out;
}

function shuffleArr(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

const LEVEL_INFO = {
  basic:        {label:"Basic",        color:T.success, icon:"🟢", desc:"Fundamental concepts"},
  intermediate: {label:"Intermediate", color:T.amber,   icon:"🟡", desc:"Core skills"},
  advanced:     {label:"Advanced",     color:T.pink,    icon:"🔴", desc:"Expert level"},
};

async function saveQuizAttempt(uid,courseId,level,testNum,score,total,answers){
  try{
    await addDoc(collection(db,"quiz_attempts"),{
      uid,courseId,level,testNum,score,total,
      pct:Math.round((score/total)*100),
      answers,completedAt:serverTimestamp(),
    });
    const ref=doc(db,"quiz_progress",uid);
    const snap=await getDoc(ref);
    const ex=snap.exists()?snap.data():{};
    const key=`${courseId}_${level}_t${testNum}`;
    const prev=ex[key]||{best:0,attempts:0};
    const newBest=Math.max(prev.best,Math.round((score/total)*100));
    await setDoc(ref,{...ex,[key]:{best:newBest,attempts:(prev.attempts||0)+1,lastScore:Math.round((score/total)*100)}},{merge:true});
  }catch(e){}
}

function QuizProgressPage({user,courses,setPage}){
  const [uProg,setUProg]=useState({});
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    if(!user){setLoading(false);return;}
    const unsub=onSnapshot(doc(db,"quiz_progress",user.uid),
      snap=>{setUProg(snap.exists()?snap.data():{});setLoading(false);},
      ()=>setLoading(false));
    return unsub;
  },[user?.uid]);

  if(!user) return(
    <div className="page" style={{maxWidth:700,margin:"0 auto",textAlign:"center",paddingTop:60}}>
      <div style={{fontSize:52,marginBottom:16}}>🔐</div>
      <h2 style={{fontWeight:800,marginBottom:8}}>Login Required</h2>
      <p style={{color:T.muted2,marginBottom:24}}>Login to view your quiz progress.</p>
      <button className="btn-p" onClick={()=>setPage("login")}>Login →</button>
    </div>
  );

  if(loading) return <div className="page" style={{display:"flex",justifyContent:"center",paddingTop:80}}><Spinner size={40}/></div>;

  let totalTests=0,attempted=0,totalBest=0,perfect=0;
  courses.forEach(c=>{
    ["basic","intermediate","advanced"].forEach(lv=>{
      const pool=(STATIC_QUIZ[c.id]||{})[lv]||[];
      const tests=chunkArr(pool,20);
      tests.forEach((_,ti)=>{
        totalTests++;
        const p=uProg[`${c.id}_${lv}_t${ti+1}`];
        if(p){attempted++;totalBest+=(p.best||0);if((p.best||0)>=90)perfect++;}
      });
    });
  });
  const avgBest=attempted>0?Math.round(totalBest/attempted):0;
  const completionPct=Math.round((attempted/totalTests)*100);

  return(
    <div className="page" style={{maxWidth:980,margin:"0 auto"}}>
      <div className="afu" style={{marginBottom:"clamp(20px,3vw,32px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <div className="stag">My Progress</div>
            <h1 style={{fontWeight:800,fontSize:"clamp(24px,4vw,40px)",letterSpacing:"-1.5px",marginBottom:8}}>
              Quiz <span className="gt2">Dashboard</span>
            </h1>
            <p style={{color:T.muted2,fontSize:"clamp(12px,1.5vw,14px)",lineHeight:1.7}}>
              All your quiz progress in one place.
            </p>
          </div>
          <button className="btn-p" onClick={()=>setPage("quiz")}
            style={{alignSelf:"flex-start",marginTop:4,padding:"10px 20px",fontSize:13}}>
            Practice Now →
          </button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12,marginBottom:28}}>
        {[
          {label:"Tests Attempted",val:attempted,icon:"📝",color:T.blue},
          {label:"Total Tests",val:totalTests,icon:"📚",color:T.muted2},
          {label:"Completion",val:`${completionPct}%`,icon:"📈",color:T.accent},
          {label:"Avg Best Score",val:attempted>0?`${avgBest}%`:"—",icon:"🎯",color:avgBest>=75?T.success:avgBest>=50?T.amber:T.pink},
          {label:"Perfect Tests",val:perfect,icon:"🏆",color:T.success},
          {label:"Remaining",val:totalTests-attempted,icon:"⏳",color:T.amber},
        ].map(s=>(
          <div key={s.label} className="card" style={{padding:"clamp(12px,2vw,18px)",textAlign:"center",
            borderTop:`3px solid ${s.color}`,transition:"transform .2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
            onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
            <div style={{fontSize:"clamp(20px,3vw,28px)",marginBottom:4}}>{s.icon}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,
              fontSize:"clamp(16px,2.5vw,24px)",color:s.color}}>{s.val}</div>
            <div style={{fontSize:10,color:T.muted,marginTop:3,lineHeight:1.3}}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{padding:"clamp(14px,2vw,20px)",marginBottom:24}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontWeight:700,fontSize:13}}>Overall Completion</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:T.accent,fontWeight:800}}>{completionPct}%</span>
        </div>
        <div style={{height:10,background:T.border,borderRadius:99}}>
          <div style={{height:"100%",width:`${completionPct}%`,borderRadius:99,
            background:`linear-gradient(90deg,${T.accent},${T.blue})`,transition:"width 1s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
          <span style={{fontSize:10,color:T.muted}}>{attempted} tests done</span>
          <span style={{fontSize:10,color:T.muted}}>{totalTests} total</span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,460px),1fr))",gap:"clamp(14px,2vw,20px)"}}>
        {courses.map((c,ci)=>{
          let cTotal=0,cDone=0,cBestSum=0;
          ["basic","intermediate","advanced"].forEach(lv=>{
            const pool=(STATIC_QUIZ[c.id]||{})[lv]||[];
            const tests=chunkArr(pool,20);
            tests.forEach((_,ti)=>{
              cTotal++;
              const p=uProg[`${c.id}_${lv}_t${ti+1}`];
              if(p){cDone++;cBestSum+=(p.best||0);}
            });
          });
          const cPct=cTotal>0?Math.round((cDone/cTotal)*100):0;
          const cAvg=cDone>0?Math.round(cBestSum/cDone):null;

          return(
            <div key={c.id} className="card afu"
              style={{padding:"clamp(16px,2.5vw,22px)",borderTop:`3px solid ${c.color}`,
                animation:`fadeUp .4s ease ${ci*.07}s both`}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <span style={{fontSize:"clamp(28px,4vw,36px)"}}>{c.icon}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:800,fontSize:"clamp(14px,1.8vw,16px)"}}>{c.title}</div>
                  <div style={{fontSize:10,color:c.color,fontFamily:"'JetBrains Mono',monospace",
                    letterSpacing:2,textTransform:"uppercase",marginTop:2}}>{c.category}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,
                    fontSize:"clamp(16px,2vw,20px)",color:cPct===100?T.success:cPct>0?T.accent:T.muted}}>
                    {cPct}%
                  </div>
                  <div style={{fontSize:9,color:T.muted}}>{cDone}/{cTotal} tests</div>
                </div>
              </div>
              <div style={{height:6,background:T.border,borderRadius:99,marginBottom:14}}>
                <div style={{height:"100%",width:`${cPct}%`,borderRadius:99,
                  background:cPct===100?T.success:c.color,transition:"width .8s ease"}}/>
              </div>
              {["basic","intermediate","advanced"].map(lv=>{
                const li=LEVEL_INFO[lv];
                const pool=(STATIC_QUIZ[c.id]||{})[lv]||[];
                const tests=chunkArr(pool,20);
                const results=tests.map((_,ti)=>uProg[`${c.id}_${lv}_t${ti+1}`]||null);
                const done=results.filter(Boolean).length;
                const bests=results.filter(Boolean).map(p=>p.best||0);
                const avg=bests.length>0?Math.round(bests.reduce((a,b)=>a+b,0)/bests.length):null;
                const lvPct=Math.round((done/tests.length)*100);

                return(
                  <div key={lv} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:12}}>{li.icon}</span>
                        <span style={{fontSize:12,fontWeight:700,color:li.color}}>{li.label}</span>
                      </div>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        {avg!==null&&(
                          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,
                            color:avg>=75?T.success:avg>=50?T.amber:T.pink}}>avg {avg}%</span>
                        )}
                        <span style={{fontSize:10,color:T.muted}}>{done}/{tests.length}</span>
                      </div>
                    </div>
                    <div style={{height:4,background:T.border,borderRadius:99,marginBottom:6}}>
                      <div style={{height:"100%",width:`${lvPct}%`,borderRadius:99,
                        background:li.color,transition:"width .8s ease"}}/>
                    </div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {tests.map((_,ti)=>{
                        const p=results[ti];
                        const b=p?.best;
                        const attempts=p?.attempts||0;
                        const col=b!=null?(b>=75?T.success:b>=50?T.amber:T.pink):T.muted;
                        const bg=b!=null?(b>=75?`${T.success}18`:b>=50?`${T.amber}18`:`${T.pink}18`):"transparent";
                        const border=b!=null?col:T.border2;
                        return(
                          <div key={ti}
                            title={b!=null?`Best: ${b}% · ${attempts} attempt${attempts>1?"s":""}`:"Not attempted yet"}
                            style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${border}`,
                              background:bg,color:col,fontSize:10,fontWeight:700,
                              fontFamily:"'JetBrains Mono',monospace",minWidth:36,textAlign:"center",
                              cursor:"default"}}>
                            {b!=null?`${b}%`:`T${ti+1}`}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <button className="btn-s" onClick={()=>setPage("quiz")}
                style={{width:"100%",marginTop:4,fontSize:12,padding:"9px"}}>
                Practice {c.title} →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuizPage({user,courses,setPage}){
  const [view,setView]   =useState("courses"); // courses|quizDash|selectTest|quiz|results
  const [selCourse,setSelCourse]=useState(null);
  const [selLevel, setSelLevel] =useState(null);
  const [selTest,  setSelTest]  =useState(null);
  const [allQs,    setAllQs]    =useState([]);
  const [qIdx,     setQIdx]     =useState(0);
  const [selected, setSelected] =useState(null);
  const [score,    setScore]    =useState(0);
  const [answers,  setAnswers]  =useState([]);
  const [loading,  setLoading]  =useState(false);
  const [uProg,    setUProg]    =useState({});
  const [elapsed,  setElapsed]  =useState(0);
  const [timerRef, setTimerRef] =useState(null);
  const [testMetas,setTestMetas]=useState([]);

  useEffect(()=>{
    if(!user)return;
    const unsub=onSnapshot(doc(db,"quiz_progress",user.uid),
      snap=>{if(snap.exists())setUProg(snap.data());},()=>{});
    return unsub;
  },[user?.uid]);

  async function startTest(course,level,testNum){
    if(!user){setPage("login");return;}
    setLoading(true);
    const staticPool=(STATIC_QUIZ[course.id]||{})[level]||[];
    const chunks=chunkArr(staticPool,20);
    const chunk=chunks[(testNum-1)%chunks.length]||staticPool;
    try{
      const snap=await getDocs(query(collection(db,"quiz_questions"),
        where("courseId","==",course.id),where("level","==",level)));
      const adminQs=snap.docs.map(d=>d.data()).filter(q=>
        !q.testNum || q.testNum===testNum
      );
      const combined=shuffleArr([...chunk,...adminQs]).map(shuffleQ);
      setAllQs(combined);
    }catch{
      setAllQs(shuffleArr(chunk).map(shuffleQ));
    }
    setSelCourse(course);setSelLevel(level);setSelTest(testNum);
    setQIdx(0);setSelected(null);setScore(0);setAnswers([]);setElapsed(0);
    setView("quiz");setLoading(false);
    const iv=setInterval(()=>setElapsed(e=>e+1),1000);
    setTimerRef(iv);
  }

  function pick(i){
    if(selected!==null)return;
    setSelected(i);
    const ok=allQs[qIdx].ans===i;
    if(ok)setScore(s=>s+1);
    setAnswers(a=>[...a,{q:allQs[qIdx].q,opts:allQs[qIdx].opts,selected:i,correct:allQs[qIdx].ans,isCorrect:ok,topic:allQs[qIdx].topic||""}]);
  }

  function next(){
    if(qIdx+1>=allQs.length){
      clearInterval(timerRef);
      if(user)saveQuizAttempt(user.uid,selCourse.id,selLevel,selTest,score,allQs.length,answers);
      setView("results");
    }else{setQIdx(i=>i+1);setSelected(null);}
  }

  function reset(){
    clearInterval(timerRef);
    setView("courses");setSelCourse(null);setSelLevel(null);setSelTest(null);
    setAllQs([]);setQIdx(0);setSelected(null);setScore(0);setAnswers([]);setElapsed(0);
  }

  const pct=allQs.length>0?Math.round((score/allQs.length)*100):0;
  const grade=pct>=90?"🏆 Perfect!":pct>=75?"🥇 Excellent!":pct>=60?"✅ Good Work!":pct>=40?"📚 Keep Practicing":"💪 Don't Give Up!";
  const gradeColor=pct>=75?T.success:pct>=60?T.accent:pct>=40?T.amber:T.pink;
  const fmtTime=s=>`${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;

  useEffect(()=>{
    if(!selCourse||!selLevel)return;
    const unsub=onSnapshot(
      query(collection(db,"quiz_tests"),
        where("courseId","==",selCourse.id),where("level","==",selLevel)),
      snap=>setTestMetas(snap.docs.map(d=>({id:d.id,...d.data()}))),()=>{});
    return unsub;
  },[selCourse?.id, selLevel]);

  function getTestName(testNum){
    const meta=testMetas.find(m=>m.testNum===testNum);
    return meta?.name||`Test ${testNum}`;
  }

  if(view==="quizDash") return(
    <div className="page" style={{maxWidth:980,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"clamp(20px,3vw,32px)"}}>
        <button onClick={()=>setView("courses")} style={{background:"none",border:"none",
          color:T.muted2,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:6,padding:0}}>
          ← Back to Quiz
        </button>
      </div>
      <div className="afu" style={{marginBottom:"clamp(20px,3vw,32px)"}}>
        <div className="stag">Overview</div>
        <h1 style={{fontWeight:800,fontSize:"clamp(22px,4vw,38px)",letterSpacing:"-1.5px",marginBottom:8}}>
          Quiz <span className="gt2">Dashboard</span>
        </h1>
        <p style={{color:T.muted2,fontSize:"clamp(12px,1.5vw,14px)",lineHeight:1.7,maxWidth:520}}>
          Your progress across all courses and difficulty levels.
        </p>
      </div>
      {(()=>{
        let totalTests=0,donePct=0,totalBest=0,attempted=0;
        courses.forEach(c=>{
          ["basic","intermediate","advanced"].forEach(lv=>{
            const pool=(STATIC_QUIZ[c.id]||{})[lv]||[];
            const tests=chunkArr(pool,20);
            tests.forEach((_,ti)=>{
              totalTests++;
              const p=uProg[`${c.id}_${lv}_t${ti+1}`];
              if(p){attempted++;totalBest+=p.best||0;}
            });
          });
        });
        const overallPct=attempted>0?Math.round(totalBest/attempted):0;
        return(
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:28}}>
            {[
              {label:"Tests Attempted",val:attempted,icon:"📝",color:T.blue},
              {label:"Tests Remaining",val:totalTests-attempted,icon:"🎯",color:T.amber},
              {label:"Avg Best Score",val:attempted>0?`${overallPct}%`:"—",icon:"🏆",color:T.success},
            ].map(s=>(
              <div key={s.label} className="card" style={{padding:"clamp(14px,2vw,20px)",textAlign:"center",borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:"clamp(22px,3vw,32px)",marginBottom:6}}>{s.icon}</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,
                  fontSize:"clamp(18px,2.5vw,26px)",color:s.color}}>{s.val}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>
        );
      })()}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,460px),1fr))",gap:"clamp(14px,2vw,20px)"}}>
        {courses.map((c,ci)=>{
          const levels=["basic","intermediate","advanced"];
          return(
            <div key={c.id} className="card afu"
              style={{padding:"clamp(16px,2.5vw,22px)",borderTop:`3px solid ${c.color}`,
                animation:`fadeUp .4s ease ${ci*.07}s both`}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                <span style={{fontSize:"clamp(26px,4vw,34px)"}}>{c.icon}</span>
                <div>
                  <div style={{fontWeight:800,fontSize:"clamp(14px,1.8vw,16px)"}}>{c.title}</div>
                  <div style={{fontSize:10,color:c.color,fontFamily:"'JetBrains Mono',monospace",
                    letterSpacing:2,textTransform:"uppercase"}}>{c.category}</div>
                </div>
              </div>
              {levels.map(lv=>{
                const li=LEVEL_INFO[lv];
                const pool=(STATIC_QUIZ[c.id]||{})[lv]||[];
                const tests=chunkArr(pool,20);
                const results=tests.map((_,ti)=>uProg[`${c.id}_${lv}_t${ti+1}`]||null);
                const done=results.filter(Boolean).length;
                const bests=results.filter(Boolean).map(p=>p.best||0);
                const avgBest=bests.length>0?Math.round(bests.reduce((a,b)=>a+b,0)/bests.length):null;
                const levelPct=Math.round((done/tests.length)*100);

                return(
                  <div key={lv} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:12}}>{li.icon}</span>
                        <span style={{fontSize:12,fontWeight:700,color:li.color}}>{li.label}</span>
                      </div>
                      <div style={{display:"flex",gap:10,alignItems:"center"}}>
                        {avgBest!==null&&(
                          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,
                            color:avgBest>=75?T.success:avgBest>=50?T.amber:T.pink,fontWeight:700}}>
                            avg {avgBest}%
                          </span>
                        )}
                        <span style={{fontSize:11,color:T.muted}}>{done}/{tests.length} done</span>
                      </div>
                    </div>
                    <div style={{height:5,background:T.border,borderRadius:99,marginBottom:8}}>
                      <div style={{height:"100%",width:`${levelPct}%`,borderRadius:99,
                        background:li.color,transition:"width .8s ease"}}/>
                    </div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {tests.map((_,ti)=>{
                        const p=uProg[`${c.id}_${lv}_t${ti+1}`];
                        const b=p?.best;
                        const bg=b!=null?(b>=75?`${T.success}22`:b>=50?`${T.amber}22`:`${T.pink}22`):T.bg3;
                        const col=b!=null?(b>=75?T.success:b>=50?T.amber:T.pink):T.muted;
                        const border=b!=null?(b>=75?T.success:b>=50?T.amber:T.pink):T.border2;
                        return(
                          <button key={ti} onClick={()=>startTest(c,lv,ti+1)}
                            title={b!=null?`Best: ${b}% · ${p.attempts} attempt${p.attempts>1?"s":""}`:"Not attempted"}
                            style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${border}`,
                              background:bg,color:col,fontSize:10,fontWeight:700,cursor:"pointer",
                              fontFamily:"'JetBrains Mono',monospace",transition:"all .15s",minWidth:36,textAlign:"center"}}
                            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1)";}}
                            onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}>
                            {b!=null?`${b}%`:`T${ti+1}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <button className="btn-p" onClick={()=>{setSelCourse(c);setSelLevel("basic");setView("selectTest");}}
                style={{width:"100%",marginTop:8,padding:"10px",fontSize:13}}>
                Practice {c.title} →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  if(view==="courses") return(
    <div className="page" style={{maxWidth:1100,margin:"0 auto"}}>

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:16,marginBottom:"clamp(24px,4vw,40px)"}} className="afu">
        <div>
          <div className="stag">Practice Arena</div>
          <h1 style={{fontWeight:800,fontSize:"clamp(28px,4vw,46px)",letterSpacing:"-2px",lineHeight:1.05,marginBottom:10}}>
            Quiz & <span className="gt2">Practice Tests</span>
          </h1>
          <p style={{color:T.muted2,fontSize:"clamp(13px,1.4vw,15px)",lineHeight:1.8,maxWidth:520}}>
            {user?"6 courses · 3 levels · 10 tests each · 3600+ questions":"Login to save your progress."}
          </p>
        </div>
        {user&&(
          <button onClick={()=>setPage("quiz-progress")}
            style={{display:"flex",alignItems:"center",gap:8,padding:"11px 22px",
              borderRadius:10,border:`1px solid ${T.accent}44`,background:`${T.accent}0e`,
              color:T.accent,fontWeight:700,fontSize:13,cursor:"pointer",transition:"all .2s",flexShrink:0}}
            onMouseEnter={e=>e.currentTarget.style.background=`${T.accent}1e`}
            onMouseLeave={e=>e.currentTarget.style.background=`${T.accent}0e`}>
            📊 My Progress
          </button>
        )}
      </div>

      {!user&&(
        <div style={{background:`linear-gradient(135deg,${T.accent}0c,${T.blue}08)`,
          border:`1px solid ${T.accent}2a`,borderRadius:14,padding:"clamp(16px,3vw,24px)",
          display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",marginBottom:28}}>
          <span style={{fontSize:30,flexShrink:0}}>🔐</span>
          <div style={{flex:1,minWidth:180}}>
            <div style={{fontWeight:700,fontSize:"clamp(13px,1.6vw,15px)",marginBottom:3}}>Login to Attempt Quizzes</div>
            <div style={{fontSize:13,color:T.muted2}}>Your progress will be saved, scores tracked, and you can compete on the leaderboard.</div>
          </div>
          <button className="btn-p" onClick={()=>setPage("login")} style={{flexShrink:0,padding:"10px 24px",fontSize:13}}>Login →</button>
        </div>
      )}

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,300px),1fr))",
        gap:"clamp(14px,2vw,22px)",
      }}>
        {courses.map((c,i)=>{
          const levels=["basic","intermediate","advanced"];
          const totalTests=levels.reduce((s,lv)=>{
            const pool=(STATIC_QUIZ[c.id]||{})[lv]||[];
            return s+chunkArr(pool,20).length;
          },0);
          const doneTests=user?levels.reduce((s,lv)=>{
            const pool=(STATIC_QUIZ[c.id]||{})[lv]||[];
            const tests=chunkArr(pool,20);
            return s+tests.filter((_,ti)=>uProg[`${c.id}_${lv}_t${ti+1}`]).length;
          },0):0;
          const coursePct=totalTests>0?Math.round((doneTests/totalTests)*100):0;

          return(
            <div key={c.id}
              style={{
                borderRadius:16,border:`1px solid ${T.border2}`,
                background:T.bg2,overflow:"hidden",
                display:"flex",flexDirection:"column",
                animation:`fadeUp .4s ease ${i*.06}s both`,
                transition:"transform .2s, box-shadow .2s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 32px ${c.color}18`;}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>

              <div style={{height:4,background:`linear-gradient(90deg,${c.color},${c.color}44)`}}/>

              <div style={{padding:"clamp(16px,2vw,22px)",flex:1,display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:42,height:42,borderRadius:12,background:`${c.color}15`,border:`1px solid ${c.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{c.icon}</div>
                    <div>
                      <div style={{fontWeight:800,fontSize:"clamp(13px,1.4vw,15px)",lineHeight:1.2}}>{c.title}</div>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:c.color,letterSpacing:2,textTransform:"uppercase",marginTop:2}}>{c.category}</div>
                    </div>
                  </div>
                  {user&&doneTests>0&&(
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,fontSize:13,color:coursePct===100?T.success:T.accent}}>{coursePct}%</div>
                      <div style={{fontSize:9,color:T.muted}}>{doneTests}/{totalTests}</div>
                    </div>
                  )}
                </div>

                {user&&doneTests>0&&(
                  <div style={{height:3,background:T.border,borderRadius:99}}>
                    <div style={{height:"100%",width:`${coursePct}%`,borderRadius:99,background:c.color,transition:"width .8s"}}/>
                  </div>
                )}

                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {levels.map(lv=>{
                    const li=LEVEL_INFO[lv];
                    const pool=(STATIC_QUIZ[c.id]||{})[lv]||[];
                    const tests=chunkArr(pool,20);
                    const done=user?tests.filter((_,ti)=>uProg[`${c.id}_${lv}_t${ti+1}`]).length:0;
                    return(
                      <button key={lv}
                        onClick={()=>{
                          if(!user){setPage("login");return;}
                          setSelCourse(c);setSelLevel(lv);setView("selectTest");
                        }}
                        style={{
                          display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                          borderRadius:10,border:`1px solid ${T.border}`,
                          background:"transparent",cursor:"pointer",transition:"all .18s",textAlign:"left",width:"100%",
                        }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=li.color;e.currentTarget.style.background=`${li.color}0c`;}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background="transparent";}}>
                        <span style={{fontSize:14,flexShrink:0}}>{li.icon}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:12,color:li.color}}>{li.label}</div>
                          <div style={{fontSize:10,color:T.muted,marginTop:1}}>{tests.length} tests · {pool.length} questions</div>
                        </div>
                        {user&&done>0?(
                          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.success,fontWeight:700,flexShrink:0}}>{done}/{tests.length} ✓</span>
                        ):(
                          <span style={{fontSize:10,color:T.muted,flexShrink:0}}>Start →</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {loading&&<div style={{position:"fixed",inset:0,background:"rgba(6,13,24,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}><Spinner size={40}/></div>}
    </div>
  );
  if(view==="selectTest"){
    const li=LEVEL_INFO[selLevel];
    const pool=(STATIC_QUIZ[selCourse.id]||{})[selLevel]||[];
    const staticTests=chunkArr(pool,20);
    const customTestNums=[...new Set(testMetas.filter(m=>m.testNum>staticTests.length).map(m=>m.testNum))].sort((a,b)=>a-b);
    const allTestNums=[...staticTests.map((_,i)=>i+1), ...customTestNums];
    return(
      <div className="page" style={{maxWidth:600,margin:"0 auto"}}>
        <button className="btn-g" onClick={()=>setView("courses")} style={{marginBottom:20}}>← Back</button>
        <div className="afu">
          <div style={{fontWeight:800,fontSize:"clamp(20px,3vw,28px)",marginBottom:4}}>
            {selCourse.icon} {selCourse.title}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:24,flexWrap:"wrap"}}>
            <span className="badge" style={{background:`${li.color}15`,color:li.color,border:`1px solid ${li.color}33`,fontSize:11}}>{li.icon} {li.label}</span>
            <span style={{fontSize:12,color:T.muted}}>{allTestNums.length} tests available — choose one</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {allTestNums.map(testNum=>{
              const isStatic=testNum<=staticTests.length;
              const staticQs=isStatic?staticTests[testNum-1]:[];
              const testName=getTestName(testNum);
              const key=`${selCourse.id}_${selLevel}_t${testNum}`;
              const prog=uProg[key];
              const topics=isStatic?[...new Set(staticQs.map(q=>q.topic).filter(Boolean))]:[];
              return(
                <div key={testNum} className="card" style={{padding:"clamp(16px,3vw,22px)",
                  borderLeft:`3px solid ${prog?.best>=75?T.success:prog?T.amber:li.color}33`,
                  transition:"all .2s",cursor:"pointer"}}
                  onClick={()=>startTest(selCourse,selLevel,testNum)}
                  onMouseEnter={e=>e.currentTarget.style.borderLeftColor=li.color}
                  onMouseLeave={e=>e.currentTarget.style.borderLeftColor=prog?.best>=75?T.success:prog?T.amber:`${li.color}33`}>
                  <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                    <div style={{width:44,height:44,borderRadius:12,
                      background:prog?.best>=75?`${T.success}15`:prog?`${T.amber}15`:`${li.color}10`,
                      border:`1.5px solid ${prog?.best>=75?T.success:prog?T.amber:li.color}33`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontFamily:"'JetBrains Mono',monospace",fontWeight:800,fontSize:14,
                      color:prog?.best>=75?T.success:prog?T.amber:li.color,flexShrink:0}}>
                      {testNum}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3}}>
                        <span style={{fontWeight:800,fontSize:"clamp(13px,1.8vw,15px)"}}>{testName}</span>
                        {!isStatic&&<span style={{fontSize:10,color:T.accent,background:`${T.accent}10`,
                          border:`1px solid ${T.accent}22`,borderRadius:4,padding:"1px 6px",
                          fontFamily:"'JetBrains Mono',monospace"}}>custom</span>}
                        {prog&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,
                          color:prog.best>=75?T.success:T.amber}}>
                          Best: {prog.best}% · {prog.attempts} attempt{prog.attempts!==1?"s":""}
                        </span>}
                      </div>
                      <div style={{fontSize:11,color:T.muted}}>
                        {isStatic?`${staticQs.length} static questions`:`Custom test`}
                        {topics.length>0&&<span> · {topics.slice(0,3).join(", ")}{topics.length>3?`+${topics.length-3}`:""}</span>}
                      </div>
                    </div>
                    {prog?.best>=75
                      ?<span style={{fontSize:18,flexShrink:0}}>✅</span>
                      :prog
                        ?<span style={{fontSize:18,flexShrink:0}}>🔄</span>
                        :<span style={{fontSize:13,color:T.muted,flexShrink:0}}>Start →</span>}
                  </div>
                  {prog&&(
                    <div style={{marginTop:12,height:4,background:T.border,borderRadius:99,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${prog.best}%`,borderRadius:99,
                        background:prog.best>=75?T.success:T.amber,transition:"width .6s"}}/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if(view==="quiz"){
    const q=allQs[qIdx];
    if(!q)return null;
    const li=LEVEL_INFO[selLevel];
    return(
      <div className="page" style={{maxWidth:680,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18,flexWrap:"wrap"}}>
          <button className="btn-g" onClick={reset} style={{padding:"6px 12px",color:T.muted2,flexShrink:0}}>✕ Quit</button>
          <span style={{fontWeight:700,fontSize:"clamp(12px,1.6vw,14px)",flex:1,minWidth:0,
            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            {selCourse.icon} {selCourse.title}
          </span>
          <span className="badge" style={{background:`${li.color}15`,color:li.color,
            border:`1px solid ${li.color}33`,flexShrink:0,fontSize:10}}>
            {li.icon} {li.label} · Test {selTest}
          </span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:T.muted2,flexShrink:0}}>
            ⏱ {fmtTime(elapsed)}
          </span>
        </div>
        <div style={{height:5,background:T.border,borderRadius:99,marginBottom:6,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(qIdx/allQs.length)*100}%`,
            background:`linear-gradient(90deg,${li.color},${T.blue})`,
            borderRadius:99,transition:"width .5s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:4}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:T.muted}}>
            {qIdx+1} / {allQs.length}
          </span>
          <div style={{display:"flex",gap:12}}>
            <span style={{fontSize:11,color:T.success,fontWeight:600}}>✅ {score}</span>
            <span style={{fontSize:11,color:T.danger,fontWeight:600}}>❌ {qIdx-score}</span>
          </div>
        </div>
        <div className="card afu" style={{padding:"clamp(18px,3.5vw,32px)"}}>
          {q.topic&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
            color:li.color,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{q.topic}</div>}
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,
            marginBottom:10,letterSpacing:1}}>Question {qIdx+1}</div>
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

  if(view==="results"){
    const li=LEVEL_INFO[selLevel];
    const topicBreakdown={};
    answers.forEach(a=>{
      const t=a.topic||"General";
      if(!topicBreakdown[t])topicBreakdown[t]={correct:0,total:0};
      topicBreakdown[t].total++;
      if(a.isCorrect)topicBreakdown[t].correct++;
    });
    return(
      <div className="page" style={{maxWidth:700,margin:"0 auto"}}>
        <div className="card afu" style={{padding:"clamp(22px,4vw,40px)",marginBottom:18}}>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:"clamp(42px,8vw,64px)",marginBottom:10}}>{pct>=75?"🏆":pct>=60?"🎯":"💪"}</div>
            <h2 style={{fontWeight:800,fontSize:"clamp(18px,3vw,28px)",color:gradeColor,marginBottom:4}}>{grade}</h2>
            <p style={{fontSize:12,color:T.muted2,marginBottom:16}}>
              {selCourse.title} · {li.icon} {li.label} · Test {selTest}
            </p>
            <ProgressRing pct={pct} size={96} stroke={8} color={gradeColor}/>
            <div style={{display:"flex",justifyContent:"center",gap:"clamp(16px,4vw,32px)",marginTop:18,flexWrap:"wrap"}}>
              {[
                {label:"Score",val:`${score}/${allQs.length}`,color:gradeColor},
                {label:"Accuracy",val:`${pct}%`,color:pct>=60?T.success:T.amber},
                {label:"Time",val:fmtTime(elapsed),color:T.blue},
              ].map(s=>(
                <div key={s.label} style={{textAlign:"center"}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,
                    fontSize:"clamp(16px,2.5vw,22px)",color:s.color}}>{s.val}</div>
                  <div style={{fontSize:10,color:T.muted,marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {Object.keys(topicBreakdown).length>1&&(
            <div style={{marginBottom:20}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:T.muted2}}>📊 Topic Breakdown</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {Object.entries(topicBreakdown).map(([topic,{correct,total}])=>{
                  const tp=Math.round((correct/total)*100);
                  return(
                    <div key={topic}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:11,color:T.muted2}}>{topic}</span>
                        <span style={{fontSize:11,fontWeight:700,color:tp>=75?T.success:tp>=50?T.amber:T.pink}}>{correct}/{total}</span>
                      </div>
                      <div style={{height:4,background:T.border,borderRadius:99}}>
                        <div style={{height:"100%",width:`${tp}%`,borderRadius:99,
                          background:tp>=75?T.success:tp>=50?T.amber:T.pink,transition:"width .6s"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginBottom:12}}>
            <button className="btn-p" onClick={()=>startTest(selCourse,selLevel,selTest)}>Retry Test {selTest} 🔄</button>
            <button className="btn-s" onClick={()=>setView("selectTest")} style={{fontSize:13}}>Other Tests</button>
            <button className="btn-s" onClick={reset} style={{fontSize:13}}>All Courses</button>
          </div>
          <button onClick={()=>setPage("quiz-progress")}
            style={{width:"100%",padding:"12px",background:`${T.accent}12`,
              border:`1px solid ${T.accent}33`,borderRadius:10,cursor:"pointer",
              color:T.accent,fontWeight:700,fontSize:13,transition:"all .2s"}}
            onMouseEnter={e=>e.currentTarget.style.background=`${T.accent}20`}
            onMouseLeave={e=>e.currentTarget.style.background=`${T.accent}12`}>
            📊 View Quiz Dashboard
          </button>
        </div>
        <div style={{fontWeight:700,fontSize:"clamp(14px,1.8vw,16px)",marginBottom:12}}>📋 Answer Review</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {answers.map((a,i)=>(
            <div key={i} style={{borderRadius:10,overflow:"hidden",
              border:`1px solid ${a.isCorrect?T.success:T.danger}33`}}>
              <div style={{padding:"clamp(10px,2vw,14px) clamp(12px,2.5vw,16px)",
                background:a.isCorrect?`${T.success}08`:`${T.danger}08`,
                display:"flex",alignItems:"flex-start",gap:10}}>
                <span style={{fontSize:14,flexShrink:0,marginTop:1}}>{a.isCorrect?"✅":"❌"}</span>
                <div style={{flex:1,minWidth:0}}>
                  {a.topic&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                    color:T.muted,letterSpacing:1.5,marginBottom:3}}>{a.topic}</div>}
                  <div style={{fontSize:"clamp(12px,1.5vw,13px)",fontWeight:600,lineHeight:1.5}}>{a.q}</div>
                  {!a.isCorrect&&<>
                    <div style={{fontSize:11,color:T.success,marginTop:4,fontWeight:600}}>✓ {a.opts[a.correct]}</div>
                    <div style={{fontSize:11,color:T.danger,marginTop:2}}>✗ {a.opts[a.selected]}</div>
                  </>}
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

function AdminQuizTab({courses}){
  const [selC,  setSelC]  = useState(courses[0]?.id||"c1");
  const [selLv, setSelLv] = useState("basic");
  const [testMetas, setTestMetas] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [viewTest, setViewTest] = useState(null);
  const [qForm,  setQForm]  = useState({q:"",opts:["","","",""],ans:0,topic:"",testNum:1});
  const [qEditId,setQEditId]= useState(null);
  const [showQForm, setShowQForm] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const [editingTestName, setEditingTestName] = useState("");
  const [showNewTest, setShowNewTest] = useState(false);
  const [newTestName, setNewTestName] = useState("");
  const [load, setLoad] = useState(false);
  const [toast, setToast] = useState("");
  const msg = t=>{setToast(t);setTimeout(()=>setToast(""),3000);};
  const levels = ["basic","intermediate","advanced"];

  const staticPool  = (STATIC_QUIZ[selC]||{})[selLv]||[];
  const staticChunks = chunkArr(staticPool,10);
  const li = LEVEL_INFO[selLv];

  useEffect(()=>{
    const unsub=onSnapshot(
      query(collection(db,"quiz_tests"),
        where("courseId","==",selC),where("level","==",selLv)),
      snap=>setTestMetas(snap.docs.map(d=>({id:d.id,...d.data()}))),()=>{});
    return unsub;
  },[selC,selLv]);

  useEffect(()=>{
    const unsub=onSnapshot(
      query(collection(db,"quiz_questions"),
        where("courseId","==",selC),where("level","==",selLv)),
      snap=>setQuestions(snap.docs.map(d=>({id:d.id,...d.data()}))),()=>{});
    return unsub;
  },[selC,selLv]);

  const allTests = [
    ...staticChunks.map((qs,i)=>({
      testNum:i+1,
      name: testMetas.find(m=>m.testNum===i+1)?.name || `Test ${i+1}`,
      metaId: testMetas.find(m=>m.testNum===i+1)?.id || null,
      isStatic:true,
      staticQs: qs,
      customQs: questions.filter(q=>q.testNum===i+1),
    })),
    ...testMetas
      .filter(m=>m.testNum>staticChunks.length)
      .sort((a,b)=>a.testNum-b.testNum)
      .map(m=>({
        testNum: m.testNum,
        name: m.name||`Test ${m.testNum}`,
        metaId: m.id,
        isStatic: false,
        staticQs: [],
        customQs: questions.filter(q=>q.testNum===m.testNum),
      })),
  ];

  const nextTestNum = allTests.length>0 ? Math.max(...allTests.map(t=>t.testNum))+1 : staticChunks.length+1;

  async function createTest(){
    if(!newTestName.trim()){msg("❌ Enter a test name.");return;}
    setLoad(true);
    try{
      await addDoc(collection(db,"quiz_tests"),{
        courseId:selC, level:selLv, testNum:nextTestNum,
        name:newTestName.trim(), createdAt:serverTimestamp()
      });
      msg(`✅ "${newTestName.trim()}" test created successfully!`);
      setNewTestName("");setShowNewTest(false);
    }catch(e){msg("❌ "+e.message);}
    setLoad(false);
  }

  async function renameTest(metaId, testNum, newName){
    if(!newName.trim()){msg("❌ Name cannot be blank.");return;}
    setLoad(true);
    try{
      if(metaId){
        await updateDoc(doc(db,"quiz_tests",metaId),{name:newName.trim()});
      }else{
        await addDoc(collection(db,"quiz_tests"),{
          courseId:selC, level:selLv, testNum, name:newName.trim(), createdAt:serverTimestamp()
        });
      }
      msg("✅ Test name updated successfully!");
      setEditingTestId(null);setEditingTestName("");
    }catch(e){msg("❌ "+e.message);}
    setLoad(false);
  }

  async function deleteTest(t){
    if(!window.confirm(`"${t.name}" test and all its custom questions will be deleted. Confirm?`))return;
    setLoad(true);
    try{
      if(t.metaId) await deleteDoc(doc(db,"quiz_tests",t.metaId));
      for(const q of t.customQs) await deleteDoc(doc(db,"quiz_questions",q.id));
      if(viewTest===t.testNum) setViewTest(null);
      msg("🗑 Test deleted.");
    }catch(e){msg("❌ "+e.message);}
    setLoad(false);
  }

  function openAddQ(defaultTestNum){
    setQForm({q:"",opts:["","","",""],ans:0,topic:"",testNum:defaultTestNum||allTests[0]?.testNum||1});
    setQEditId(null);setShowQForm(true);
  }
  function openEditQ(q){
    setQForm({q:q.q,opts:[...q.opts],ans:q.ans,topic:q.topic||"",testNum:q.testNum||1});
    setQEditId(q.id);setShowQForm(true);
  }

  async function saveQ(){
    if(!qForm.q.trim()||qForm.opts.some(o=>!o.trim())){msg("❌ Fill in the question and all 4 options.");return;}
    setLoad(true);
    try{
      if(qEditId && !qEditId.startsWith("static_")){
        await setDoc(doc(db,"quiz_questions",qEditId),
          {...qForm,courseId:selC,level:selLv},{merge:true});
        msg("✅ Question updated!");
      }else{
        // static question edit → save as new custom question
        await addDoc(collection(db,"quiz_questions"),
          {...qForm,courseId:selC,level:selLv,createdAt:serverTimestamp()});
        msg(qEditId?"✅ Question saved as custom override!":"✅ Question added!");
      }
      setQForm({q:"",opts:["","","",""],ans:0,topic:"",testNum:qForm.testNum});
      setQEditId(null);setShowQForm(false);
    }catch(e){msg("❌ "+e.message);}
    setLoad(false);
  }

  async function delQ(id){
    if(!window.confirm("Delete this question?"))return;
    try{await deleteDoc(doc(db,"quiz_questions",id));msg("🗑 Deleted.");}
    catch(e){msg("❌ "+e.message);}
  }

  const displayedTests = viewTest===null ? allTests : allTests.filter(t=>t.testNum===viewTest);

  return(
    <div className="afi">
      {toast&&<div style={{background:T.card,border:`1px solid ${T.accent}33`,borderRadius:8,
        padding:"10px 16px",marginBottom:14,fontSize:13,color:T.accent}}>{toast}</div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
        marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div style={{fontWeight:700,fontSize:"clamp(14px,2vw,17px)"}}>
          Quiz Management
          <span className="badge ba" style={{marginLeft:8}}>{allTests.length} tests</span>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button className="btn-s" onClick={()=>{setShowNewTest(v=>!v);setShowQForm(false);}}
            style={{fontSize:12,padding:"8px 14px"}}>
            {showNewTest?"✕ Cancel":"➕ New Test"}
          </button>
          <button className="btn-p" onClick={()=>{setShowQForm(v=>!v);setShowNewTest(false);if(!showQForm)openAddQ(viewTest||allTests[0]?.testNum||1);}}
            style={{fontSize:12,padding:"8px 14px"}}>
            {showQForm?"✕ Cancel":"+ Add Question"}
          </button>
        </div>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
        {courses.map(c=>(
          <button key={c.id} onClick={()=>{setSelC(c.id);setViewTest(null);}}
            style={{padding:"6px 14px",borderRadius:99,
              border:`1px solid ${selC===c.id?c.color:T.border2}`,
              background:selC===c.id?`${c.color}15`:T.card,
              color:selC===c.id?c.color:T.muted2,
              fontWeight:600,fontSize:11,cursor:"pointer",transition:"all .2s"}}>
            {c.icon} {c.title.split(" ")[0]}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
        {levels.map(lv=>{
          const lvi=LEVEL_INFO[lv];
          return(
            <button key={lv} onClick={()=>{setSelLv(lv);setViewTest(null);}}
              style={{padding:"8px 16px",borderRadius:99,
                border:`1.5px solid ${selLv===lv?lvi.color:T.border2}`,
                background:selLv===lv?`${lvi.color}15`:T.card,
                color:selLv===lv?lvi.color:T.muted2,
                fontWeight:700,fontSize:12,cursor:"pointer",transition:"all .2s",
                display:"flex",alignItems:"center",gap:6}}>
              {lvi.icon} {lvi.label}
            </button>
          );
        })}
      </div>
      {showNewTest&&(
        <div className="afu" style={{background:T.card,border:`1px solid ${T.success}33`,
          borderRadius:12,padding:"clamp(14px,2.5vw,20px)",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:13,color:T.success,marginBottom:10}}>
            ➕ Create New Test — {li.icon} {li.label} · {courses.find(c=>c.id===selC)?.title}
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <input className="inp" value={newTestName} placeholder={`Test name (e.g. "Practice Set 1", "Mock Test")`}
              style={{flex:1,minWidth:200}}
              onChange={e=>setNewTestName(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&createTest()}/>
            <button className="btn-p" onClick={createTest} disabled={load}
              style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
              {load&&<Spinner/>} Create Test
            </button>
          </div>
          <div style={{fontSize:11,color:T.muted,marginTop:8}}>
            Test number will be assigned: Test {nextTestNum}
          </div>
        </div>
      )}
      {showQForm&&(
        <div className="afu" style={{background:T.card,border:`1px solid ${li.color}33`,
          borderRadius:12,padding:"clamp(14px,2.5vw,22px)",marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:13,color:li.color,marginBottom:12}}>
            {qEditId?"✏️ Edit Question":"➕ New Question"} — {li.icon} {li.label}
          </div>
          <div style={{marginBottom:14}}>
            <label className="lbl" style={{display:"block",marginBottom:6}}>📋 Which Test to Add In?</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {allTests.map(t=>(
                <button key={t.testNum} type="button"
                  onClick={()=>setQForm(p=>({...p,testNum:t.testNum}))}
                  style={{padding:"7px 14px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:11,
                    transition:"all .2s",
                    border:`1.5px solid ${qForm.testNum===t.testNum?li.color:T.border2}`,
                    background:qForm.testNum===t.testNum?`${li.color}15`:T.bg3,
                    color:qForm.testNum===t.testNum?li.color:T.muted2}}>
                  {t.name}
                  {t.isStatic&&<span style={{fontSize:9,opacity:.6,marginLeft:4}}>(static)</span>}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div>
              <label className="lbl">Question *</label>
              <textarea className="inp" rows={2} value={qForm.q} placeholder="Type your question..."
                style={{resize:"vertical"}} onChange={e=>setQForm(p=>({...p,q:e.target.value}))}/>
            </div>
            <div>
              <label className="lbl">Topic (optional)</label>
              <input className="inp" value={qForm.topic} placeholder="e.g. Arrays, OOP..."
                onChange={e=>setQForm(p=>({...p,topic:e.target.value}))}/>
            </div>
            {[0,1,2,3].map(i=>(
              <div key={i}>
                <label className="lbl">
                  Option {String.fromCharCode(65+i)}
                  {qForm.ans===i&&<span style={{color:T.success,marginLeft:6,fontWeight:400}}>✓ Correct</span>}
                </label>
                <input className="inp" value={qForm.opts[i]}
                  placeholder={`Option ${String.fromCharCode(65+i)}`}
                  style={{borderColor:qForm.ans===i?T.success:undefined}}
                  onChange={e=>{const o=[...qForm.opts];o[i]=e.target.value;setQForm(p=>({...p,opts:o}));}}/>
              </div>
            ))}
            <div>
              <label className="lbl">Which Option is Correct?</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["A","B","C","D"].map((l,i)=>(
                  <button key={i} type="button" onClick={()=>setQForm(p=>({...p,ans:i}))}
                    style={{padding:"8px 18px",borderRadius:8,
                      border:`1.5px solid ${qForm.ans===i?T.success:T.border2}`,
                      background:qForm.ans===i?`${T.success}15`:T.bg3,
                      color:qForm.ans===i?T.success:T.muted2,
                      fontWeight:700,cursor:"pointer",transition:"all .2s"}}>
                    Option {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
            <button className="btn-p" onClick={saveQ} disabled={load}
              style={{display:"flex",gap:8,alignItems:"center"}}>
              {load&&<Spinner/>}{qEditId?"Update Question":"Save Question"}
            </button>
            <button className="btn-s" onClick={()=>{setShowQForm(false);setQEditId(null);}}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
        <span style={{fontSize:11,color:T.muted,marginRight:4}}>Filter:</span>
        <button onClick={()=>setViewTest(null)}
          style={{padding:"5px 12px",borderRadius:99,fontSize:11,fontWeight:600,cursor:"pointer",
            border:`1px solid ${viewTest===null?li.color:T.border2}`,
            background:viewTest===null?`${li.color}15`:T.card,
            color:viewTest===null?li.color:T.muted2,transition:"all .2s"}}>
          All Tests
        </button>
        {allTests.map(t=>(
          <button key={t.testNum} onClick={()=>setViewTest(t.testNum)}
            style={{padding:"5px 12px",borderRadius:99,fontSize:11,fontWeight:600,cursor:"pointer",
              border:`1px solid ${viewTest===t.testNum?li.color:T.border2}`,
              background:viewTest===t.testNum?`${li.color}15`:T.card,
              color:viewTest===t.testNum?li.color:T.muted2,transition:"all .2s"}}>
            {t.name}
          </button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {displayedTests.map(t=>(
          <div key={t.testNum} style={{border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
            <div style={{background:T.bg3,padding:"clamp(12px,2vw,16px) clamp(14px,2.5vw,18px)",
              display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",
              borderBottom:`1px solid ${T.border}`}}>
              <div style={{width:32,height:32,borderRadius:8,
                background:`${li.color}15`,border:`1.5px solid ${li.color}33`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"'JetBrains Mono',monospace",fontWeight:800,fontSize:13,
                color:li.color,flexShrink:0}}>
                {t.testNum}
              </div>
              {editingTestId===t.testNum
                ?<div style={{display:"flex",gap:8,flex:1,minWidth:180,alignItems:"center",flexWrap:"wrap"}}>
                  <input className="inp" value={editingTestName}
                    style={{flex:1,minWidth:140,padding:"6px 10px",fontSize:13}}
                    autoFocus
                    onChange={e=>setEditingTestName(e.target.value)}
                    onKeyDown={e=>{
                      if(e.key==="Enter") renameTest(t.metaId,t.testNum,editingTestName);
                      if(e.key==="Escape"){setEditingTestId(null);setEditingTestName("");}
                    }}/>
                  <button className="btn-p" style={{padding:"5px 12px",fontSize:11,flexShrink:0}}
                    onClick={()=>renameTest(t.metaId,t.testNum,editingTestName)}>
                    Save
                  </button>
                  <button className="btn-s" style={{padding:"5px 12px",fontSize:11,flexShrink:0}}
                    onClick={()=>{setEditingTestId(null);setEditingTestName("");}}>
                    Cancel
                  </button>
                </div>
                :<div style={{flex:1,minWidth:0}}>
                  <span style={{fontWeight:700,fontSize:"clamp(13px,1.8vw,15px)"}}>{t.name}</span>
                  {t.isStatic&&<span style={{fontSize:10,color:T.muted,marginLeft:8,
                    fontFamily:"'JetBrains Mono',monospace"}}>
                    {t.staticQs.length} static + {t.customQs.length} custom
                  </span>}
                  {!t.isStatic&&<span style={{fontSize:10,color:T.muted,marginLeft:8,
                    fontFamily:"'JetBrains Mono',monospace"}}>
                    {t.customQs.length} questions
                  </span>}
                </div>
              }
              {editingTestId!==t.testNum&&(
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <button onClick={()=>{setEditingTestId(t.testNum);setEditingTestName(t.name);}}
                    style={{padding:"5px 10px",fontSize:11,background:`${T.blue}15`,
                      color:T.blue,border:`1px solid ${T.blue}33`,borderRadius:6,cursor:"pointer"}}>
                    ✏️ Rename
                  </button>
                  <button onClick={()=>{openAddQ(t.testNum);setShowQForm(true);setShowNewTest(false);}}
                    style={{padding:"5px 10px",fontSize:11,background:`${T.success}15`,
                      color:T.success,border:`1px solid ${T.success}33`,borderRadius:6,cursor:"pointer"}}>
                    + Add Q
                  </button>
                  {!t.isStatic&&(
                    <button onClick={()=>deleteTest(t)} className="btn-r"
                      style={{padding:"5px 10px",fontSize:11}}>
                      🗑
                    </button>
                  )}
                </div>
              )}
            </div>
            <div style={{padding:"clamp(10px,1.5vw,14px)"}}>
              {t.isStatic&&t.staticQs.length>0&&(
                <div style={{marginBottom:t.customQs.length>0?10:0}}>
                  <div style={{fontSize:10,color:T.muted,fontFamily:"'JetBrains Mono',monospace",
                    letterSpacing:1.5,marginBottom:6,textTransform:"uppercase"}}>
                    Static Questions ({t.staticQs.length})
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {t.staticQs.map((q,qi)=>(
                      <div key={qi} style={{background:T.bg3,borderRadius:8,
                        padding:"clamp(8px,1.5vw,11px) clamp(10px,2vw,14px)",
                        border:`1px solid ${T.border}`,
                        display:"flex",alignItems:"flex-start",gap:8}}>
                        <div style={{flex:1,opacity:.85}}>
                          <div style={{fontSize:"clamp(11px,1.4vw,12px)",fontWeight:600,lineHeight:1.5,marginBottom:5}}>{q.q}</div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                            {q.opts.map((o,oi)=>(
                              <span key={oi} style={{fontSize:10,padding:"2px 8px",borderRadius:5,
                                background:oi===q.ans?`${T.success}15`:T.card,
                                color:oi===q.ans?T.success:T.muted2,
                                border:`1px solid ${oi===q.ans?T.success:T.border}`}}>
                                {String.fromCharCode(65+oi)}. {o}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button onClick={()=>{openEditQ({...q,id:`static_${t.testNum}_${qi}`,testNum:t.testNum});setShowQForm(true);setShowNewTest(false);}}
                          title="Edit this question (saves as custom override)"
                          style={{padding:"4px 10px",fontSize:11,background:`${T.blue}15`,
                            color:T.blue,border:`1px solid ${T.blue}33`,borderRadius:6,cursor:"pointer",flexShrink:0}}>
                          ✏️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {t.customQs.length>0&&(
                <div>
                  {t.isStatic&&<div style={{fontSize:10,color:T.accent,fontFamily:"'JetBrains Mono',monospace",
                    letterSpacing:1.5,marginBottom:6,textTransform:"uppercase"}}>
                    Custom Questions ({t.customQs.length})
                  </div>}
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {t.customQs.map(q=>(
                      <div key={q.id} style={{background:T.card,borderRadius:8,
                        padding:"clamp(9px,1.5vw,12px) clamp(11px,2vw,15px)",
                        border:`1px solid ${T.border}`,borderLeft:`3px solid ${li.color}`,
                        display:"flex",alignItems:"flex-start",gap:10,flexWrap:"wrap"}}>
                        <div style={{flex:1,minWidth:160}}>
                          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"}}>
                            {q.topic&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                              color:T.muted,letterSpacing:1.5}}>{q.topic}</span>}
                            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,
                              color:T.accent,background:`${T.accent}12`,
                              border:`1px solid ${T.accent}22`,borderRadius:4,padding:"1px 6px"}}>
                              custom
                            </span>
                          </div>
                          <div style={{fontSize:"clamp(11px,1.4vw,12px)",fontWeight:600,lineHeight:1.5,marginBottom:5}}>{q.q}</div>
                          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                            {q.opts.map((o,oi)=>(
                              <span key={oi} style={{fontSize:10,padding:"2px 8px",borderRadius:5,
                                background:oi===q.ans?`${T.success}15`:T.bg3,
                                color:oi===q.ans?T.success:T.muted2,
                                border:`1px solid ${oi===q.ans?T.success:T.border}`}}>
                                {String.fromCharCode(65+oi)}. {o}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{display:"flex",gap:5,flexShrink:0}}>
                          <button onClick={()=>{openEditQ(q);setShowQForm(true);setShowNewTest(false);}}
                            style={{padding:"4px 10px",fontSize:11,background:`${T.blue}15`,
                              color:T.blue,border:`1px solid ${T.blue}33`,borderRadius:6,cursor:"pointer"}}>
                            ✏️
                          </button>
                          <button onClick={()=>delQ(q.id)} className="btn-r"
                            style={{padding:"4px 10px",fontSize:11}}>
                            🗑
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {t.customQs.length===0&&!t.isStatic&&(
                <div style={{textAlign:"center",padding:"20px",color:T.muted,fontSize:12,
                  border:`1px dashed ${T.border2}`,borderRadius:8}}>
                  No questions yet. Use "+ Add Q" to add some.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaderboardPage({user,courses,setPage}){
  const [students,setStudents]=useState([]);
  const [progMap,setProgMap]=useState({});
  const [load,setLoad]=useState(true);
  const [tab,setTab]=useState("overall");

  useEffect(()=>{
    async function load(){
      const cached=sessionStorage.getItem("hs_lb");
      if(cached){try{const d=JSON.parse(cached);setStudents(d.students);setProgMap(d.prog);setLoad(false);return;}catch{}}
      try{
        const uSnap=await getDocs(collection(db,"users"));
        const pSnap=await getDocs(collection(db,"progress"));
        const users=uSnap.docs.map(d=>({id:d.id,...d.data()})).filter(u=>u.role!=="admin");
        const prog={};
        pSnap.docs.forEach(d=>prog[d.id]=d.data());
        sessionStorage.setItem("hs_lb",JSON.stringify({students:users,prog}));
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
          {ranked.length>=3&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"clamp(8px,1.5vw,12px)",marginBottom:24}} className="afu">
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
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden"}}>
            <div className="lb-row" style={{display:"grid",gridTemplateColumns:"48px 1fr 80px 80px 80px",
              padding:"11px 18px",background:T.bg3,borderBottom:`1px solid ${T.border}`,
              fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.muted,
              letterSpacing:1.5,textTransform:"uppercase"}}>
              <span>#</span><span>Student</span>
              <span style={{textAlign:"center"}}>Videos</span>
              <span style={{textAlign:"center"}}>Courses</span>
              <span style={{textAlign:"center"}}>Progress</span>
            </div>
            {ranked.map((s,i)=>(
              <div key={s.id} className="rank-row lb-row"
                style={{display:"grid",gridTemplateColumns:"48px 1fr 80px 80px 80px",minWidth:0,
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
                      📱 Verified
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
      <div className="afu" style={{marginBottom:"clamp(24px,4vw,40px)"}}>
        <div className="stag">Career Growth</div>
        <h1 style={{fontWeight:800,fontSize:"clamp(26px,4.5vw,48px)",letterSpacing:"-2px",lineHeight:1.1,marginBottom:12}}>
          Job <span className="gt2">Placement Hub</span>
        </h1>
        <p style={{color:T.muted2,fontSize:"clamp(13px,1.5vw,15px)",lineHeight:1.8,maxWidth:560}}>
          Your complete guide from beginner to first tech job — roadmap, resume, and interview prep all in one place.
        </p>
        <div style={{display:"flex",gap:"clamp(16px,3vw,32px)",marginTop:20,flexWrap:"wrap"}}>
          {[["12 months","Average timeline"],["50+ companies","To apply to"],["3 projects","Minimum portfolio"],["100+ DSA","Problems to solve"]].map(([n,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:800,fontSize:"clamp(16px,2.5vw,22px)",color:T.accent}}>{n}</div>
              <div style={{fontSize:11,color:T.muted,marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="job-tabs" style={{display:"flex",gap:8,marginBottom:"clamp(20px,3vw,32px)",flexWrap:"wrap"}}>
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
      {tab==="roadmap"&&(
        <div style={{display:"flex",flexDirection:"column",gap:"clamp(14px,2vw,20px)"}} className="afu">
          {roadmap.map((r,i)=>(
            <div key={r.step} className="card"
              style={{padding:"clamp(18px,3vw,28px)",borderLeft:`4px solid ${r.color}`,
                animation:`fadeUp .4s ease ${i*.08}s both`,overflow:"hidden"}}>
              <div style={{display:"flex",gap:"clamp(14px,2.5vw,20px)",flexWrap:"wrap",alignItems:"flex-start"}}>
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

          <div className="tips-grid">
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

function Footer({setPage}){
  const cols=[
    {title:"Learn",links:[
      {l:"All Courses",p:"courses",type:"page"},
      {l:"Quiz & Tests",p:"quiz",type:"page"},
      {l:"Study Notes",p:"notes",type:"page"},
      {l:"Job Placement",p:"placement",type:"page"},
      {l:"Leaderboard",p:"leaderboard",type:"page"},
    ]},
    {title:"Platform",links:[
      {l:"About Us",p:"about",type:"page"},
      {l:"My Dashboard",p:"dashboard",type:"page"},
      {l:"My Learning",p:"my-learning",type:"page"},
      {l:"Notifications",p:"notifications",type:"page"},
      {l:"My Profile",p:"profile",type:"page"},
    ]},
    {title:"Resources",links:[
      {l:"LeetCode",p:"https://leetcode.com",type:"url"},
      {l:"Codeforces",p:"https://codeforces.com",type:"url"},
      {l:"TryHackMe",p:"https://tryhackme.com",type:"url"},
      {l:"GitHub",p:"https://github.com",type:"url"},
      {l:"MDN Docs",p:"https://developer.mozilla.org",type:"url"},
    ]},
  ];
  return(
    <footer style={{position:"relative",overflow:"hidden",marginTop:"clamp(48px,7vw,80px)"}}>
      <div style={{
        position:"absolute",top:0,left:0,right:0,height:1,
        background:`linear-gradient(90deg,transparent,${T.accent}44,${T.blue}33,transparent)`,
      }}/>
      <div style={{
        position:"absolute",top:"-60%",left:"50%",transform:"translateX(-50%)",
        width:"70vw",height:"300px",
        background:`radial-gradient(ellipse,${T.accent}04 0%,transparent 70%)`,
        pointerEvents:"none",animation:"footerGlow 6s ease-in-out infinite",
      }}/>
      <div style={{background:"rgba(4,9,16,.97)",backdropFilter:"blur(12px)",padding:"clamp(48px,7vw,72px) clamp(16px,4vw,40px) 0",position:"relative"}}>
        <div className="wrap">
          <div className="footer-grid" style={{display:"grid",gridTemplateColumns:"1.8fr repeat(3,1fr)",gap:"clamp(28px,4vw,60px)",marginBottom:"clamp(40px,5vw,56px)"}}>

            <div>
              <div style={{marginBottom:20}}>
                <Logo size={1} onClick={()=>setPage("home")}/>
              </div>
              <p style={{fontSize:13,color:T.muted,lineHeight:1.9,maxWidth:240,marginBottom:24}}>
                Free coding education for every student. Anytime, anywhere.
              </p>

            </div>

            {cols.map(col=>(
              <div key={col.title}>
                <div style={{
                  fontFamily:"'JetBrains Mono',monospace",
                  fontWeight:700,fontSize:10,
                  letterSpacing:2.5,textTransform:"uppercase",
                  color:T.accent,marginBottom:20,
                }}>{col.title}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {col.links.map(item=>(
                    col.type==="url"||item.type==="url"
                      ?<a key={item.l} href={item.p} target="_blank" rel="noreferrer"
                        style={{fontSize:13,color:"rgba(160,185,220,.65)",textDecoration:"none",
                          transition:"color .2s",display:"flex",alignItems:"center",gap:5}}
                        onMouseEnter={e=>{e.currentTarget.style.color=T.accent;}}
                        onMouseLeave={e=>{e.currentTarget.style.color="rgba(160,185,220,.65)";}}>
                        {item.l} <span style={{fontSize:9,opacity:.5}}>↗</span>
                      </a>
                      :<div key={item.l} onClick={()=>setPage(item.p)}
                        style={{fontSize:13,color:"rgba(160,185,220,.65)",cursor:"pointer",
                          transition:"color .2s",display:"flex",alignItems:"center",gap:5}}
                        onMouseEnter={e=>{e.currentTarget.style.color="#fff";}}
                        onMouseLeave={e=>{e.currentTarget.style.color="rgba(160,185,220,.65)";}}>
                        {item.l}
                      </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            borderTop:`1px solid rgba(255,255,255,.06)`,
            padding:"clamp(18px,3vw,24px) 0 clamp(20px,3vw,28px)",
            display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,
          }}>
            <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
              <p style={{fontSize:12,color:"rgba(255,255,255,.28)"}}>
                © 2026 <span style={{color:T.accent,fontWeight:700}}>HackingSum.edu</span>
              </p>
              <span style={{color:"rgba(255,255,255,.12)",fontSize:12}}>·</span>
              <p style={{fontSize:12,color:"rgba(255,255,255,.25)"}}>Made with ❤️ for students</p>
            </div>
            <a href="https://hackingsum.in" target="_blank" rel="noreferrer" style={{
              fontFamily:"'JetBrains Mono',monospace",fontSize:11,
              color:`${T.accent}99`,letterSpacing:.5,textDecoration:"none",
              transition:"color .2s",
            }}
            onMouseEnter={e=>e.currentTarget.style.color=T.accent}
            onMouseLeave={e=>e.currentTarget.style.color=`${T.accent}99`}>
              hackingsum.in ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App(){
  const [page,setPage]=useState("home");
  const [history,setHistory]=useState(["home"]);
  const [user,setUser]=useState(null);
  const [courses,setCourses]=useState([]);
  const [watch,setWatch]=useState(null);
  const [booting,setBooting]=useState(true);
  const [notifCount,setNotifCount]=useState(0);
  const [progress,setProgress]=useState({});
  const progressUid=useRef(null);

  function goBack(){
    if(history.length>1){
      const skipPages=["login","register"];
      let prevIdx=history.length-2;
      while(prevIdx>0 && skipPages.includes(history[prevIdx])) prevIdx--;
      const prev=history[prevIdx];
      setHistory(h=>h.slice(0,prevIdx+1));
      setPage(prev);
      window.scrollTo({top:0,behavior:'instant'});
    }else{
      setPage("home");
      window.scrollTo({top:0,behavior:'instant'});
    }
  }

  function navigate(p){
    if(page===p)return;
    const replacePages=["login","register"];
    if(replacePages.includes(page)){
      window.history.replaceState({page:p},'',(p==='home'?'/':'/'+p));
      setHistory(h=>[...h.slice(0,-1),p]);
    }else{
      window.history.pushState({page:p},'',(p==='home'?'/':'/'+p));
      setHistory(h=>[...h.slice(-9),p]);
    }
    setPage(p);
    window.scrollTo({top:0,behavior:'instant'});
  }

  const goBackRef=useRef(goBack);
  useEffect(()=>{goBackRef.current=goBack;},[history]);
  useEffect(()=>{
    // Browser ka automatic scroll restoration band karo
    if('scrollRestoration' in window.history){
      window.history.scrollRestoration='manual';
    }
    const slug=window.location.pathname.replace(/^\/+/,'')||'home';
    const valid=['home','login','register','courses','watch','about','notes','notifications','profile','dashboard','my-learning','quiz','quiz-progress','leaderboard','placement','admin','admin-courses','admin-notes','admin-quiz','admin-students'];
    if(valid.includes(slug)&&slug!=='home'){setPage(slug);setHistory(['home',slug]);}
    else{window.history.replaceState({page:'home'},'','/');}
    const handler=(e)=>{
      if(e.state?.page){setPage(e.state.page);setHistory(h=>[...h.slice(-9),e.state.page]);window.scrollTo({top:0,behavior:'instant'});}
      else{goBackRef.current();}
    };
    window.addEventListener('popstate',handler);
    return()=>window.removeEventListener('popstate',handler);
  },[]);

  useEffect(()=>{
    return onAuthStateChanged(auth,async fbUser=>{
      if(fbUser){
        if(ADMINS.some(a=>a.email===fbUser.email)){
          setUser({uid:fbUser.uid, name:"Admin", email:fbUser.email, role:"admin"});
          return;
        }
        const snap=await getDoc(doc(db,"users",fbUser.uid));
        const p=snap.exists()?snap.data():{};
        setUser({uid:fbUser.uid,name:fbUser.displayName||p.name||"Student",email:fbUser.email,
          role:p.role||"student",mobile:p.mobile||"",avatarColor:p.avatarColor||T.accent});
      }else{setUser(null);}
    });
  },[]);

  useEffect(()=>{
    seedCoursesIfNeeded().catch(()=>{});
    const q=query(collection(db,"courses"),orderBy("createdAt"));
    const unsub=onSnapshot(q,
      snap=>{
        if(!snap.empty)setCourses(snap.docs.map(d=>({...d.data(),id:d.id})));
        else setCourses(SEED_COURSES);
        setBooting(false);
      },
      ()=>{setCourses(SEED_COURSES);setBooting(false);}
    );
    return unsub;
  },[]);

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

  function logout(){signOut(auth);setUser(null);window.history.pushState({page:"home"},"","/");setPage("home");setHistory(["home"]);}

  useEffect(()=>{
    if(!user?.uid||user.role==="admin")return;
    if(progressUid.current===user.uid)return;
    progressUid.current=user.uid;
    getProgress(user.uid).then(p=>setProgress(p)).catch(()=>{});
  },[user?.uid]);

  useEffect(()=>{
    if(!user&&["dashboard","my-learning","watch","profile","notes","notifications"].includes(page))navigate("login");
    if(user?.role==="admin"&&["dashboard","my-learning"].includes(page))navigate("admin");
  },[page,user]);

  // Har page change par top pe scroll — React render ke baad
  useEffect(()=>{
    window.scrollTo({top:0,behavior:'instant'});
  },[page]);

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

  const showBack=page!=="home"&&history.length>1;

  return(
    <>
      <style>{CSS}</style>
      <Navbar page={page} setPage={navigate} user={user} onLogout={logout} notifCount={notifCount}/>
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
      {page==="dashboard"   &&user?.role!=="admin"&&<DashboardPage   user={user} courses={courses} setPage={navigate} setWatch={setWatch} progress={progress}/>}
      {page==="my-learning" &&user?.role!=="admin"&&<MyLearningPage  user={user} courses={courses} setPage={navigate} setWatch={setWatch} progress={progress}/>}
      {page==="quiz"        &&<QuizPage         user={user} courses={courses} setPage={navigate}/>}
      {page==="quiz-progress"&&user?.role!=="admin"&&<QuizProgressPage user={user} courses={courses} setPage={navigate}/>}
      {page==="leaderboard" &&<LeaderboardPage  user={user} courses={courses} setPage={navigate}/>}
      {page==="placement"   &&<JobPlacementPage setPage={navigate}/>}
      {["admin","admin-courses","admin-notes","admin-quiz","admin-students"].includes(page)&&user?.role==="admin"&&
        <AdminPage tab={page==="admin-courses"?"courses":page==="admin-notes"?"notes":page==="admin-quiz"?"quiz":page==="admin-students"?"students":"overview"}
          courses={courses} setCourses={setCourses} setPage={navigate}/>
      }
    </>
  );
}
