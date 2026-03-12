
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
  // 1. 💡 Foundations
  { id:"c7", title:"Computer Fundamentals", category:"Fundamentals", level:"Beginner", color:"#34d399", icon:"💻", instructor:"HackingSum Team", order:0,
    description:"OS, hardware, memory, storage, binary, file systems — the foundation every programmer must know.",
    videos:[
      {id:"v701",title:"How Computers Work — CPU, RAM, Storage",ytId:"AkFi90lZmXA",duration:"14:22"},
      {id:"v702",title:"Operating Systems — What & Why",ytId:"26QPDBe-NB8",duration:"18:30"},
      {id:"v703",title:"Binary, Hex & Number Systems",ytId:"1GSjbWt0c9M",duration:"16:15"},
      {id:"v704",title:"File Systems & Memory Management",ytId:"_h30HieV3tA",duration:"20:10"},
      {id:"v705",title:"Processes, Threads & Multitasking",ytId:"exbKr6fnoUw",duration:"22:45"},
    ]},
  // 2. 🌍 Networking
  { id:"c8", title:"Networking Fundamentals", category:"Networking", level:"Beginner", color:"#60a5fa", icon:"🌍", instructor:"HackingSum Team", order:1,
    description:"TCP/IP, DNS, HTTP, subnetting, OSI model — master networking from ground up.",
    videos:[
      {id:"v801",title:"OSI Model — 7 Layers Explained",ytId:"vv4y_uOneC0",duration:"17:40"},
      {id:"v802",title:"IP Addressing & Subnetting",ytId:"s_gy5TM6HWY",duration:"24:15"},
      {id:"v803",title:"TCP vs UDP — How Data Travels",ytId:"uwoD5YsGACg",duration:"15:30"},
      {id:"v804",title:"DNS, DHCP & HTTP Explained",ytId:"27r4Bzuj5NQ",duration:"19:55"},
      {id:"v805",title:"Firewalls, NAT & VPN Basics",ytId:"WjDrMKZWCt0",duration:"21:20"},
    ]},
  // 3. 🐧 Linux
  { id:"c9", title:"Linux & Command Line", category:"Linux", level:"Beginner", color:"#fb923c", icon:"🐧", instructor:"HackingSum Team", order:2,
    description:"Master the Linux terminal — file system, permissions, shell scripting, processes and more.",
    videos:[
      {id:"v901",title:"Linux Intro — Why & How to Install",ytId:"wBp0Rb-ZJak",duration:"13:10"},
      {id:"v902",title:"File System & Navigation Commands",ytId:"IVquJh3DXUA",duration:"20:30"},
      {id:"v903",title:"File Permissions & User Management",ytId:"19SG9x4isher",duration:"18:44"},
      {id:"v904",title:"Processes, Services & Package Managers",ytId:"TJzlywMhe48",duration:"22:15"},
      {id:"v905",title:"Shell Scripting Crash Course",ytId:"e7BufAVwDiM",duration:"28:40"},
    ]},
  // 4. ⌨️ Programming — Python
  { id:"c1", title:"Python Zero to Hero", category:"Programming", level:"Beginner", color:"#00f5c4", icon:"🐍", instructor:"HackingSum Team", order:3,
    description:"Master Python from scratch — variables, data structures, OOP, file I/O and real projects.",
    videos:[
      {id:"v101",title:"Why Python? Setup & First Program",ytId:"kqtD5dpn9C8",duration:"12:34"},
      {id:"v102",title:"Variables, Data Types & Operators",ytId:"_uQrJ0TkZlc",duration:"28:14"},
      {id:"v103",title:"Conditionals & Loops",ytId:"HQqqNBZosn8",duration:"22:10"},
      {id:"v104",title:"Functions & Modules",ytId:"9Os0o3wzS_I",duration:"31:05"},
      {id:"v105",title:"Lists, Tuples & Dictionaries",ytId:"W8KRzm-HUcc",duration:"26:40"},
    ]},
  // 5. ⌨️ Programming — C++
  { id:"c2", title:"C++ Complete Masterclass", category:"Programming", level:"Intermediate", color:"#2196f3", icon:"⚙️", instructor:"HackingSum Team", order:4,
    description:"Deep dive into C++ — pointers, OOP, STL, templates and competitive programming tricks.",
    videos:[
      {id:"v201",title:"C++ Intro & Environment Setup",ytId:"vLnPwxZdW4Y",duration:"14:05"},
      {id:"v202",title:"Variables, I/O & Data Types",ytId:"Rub-JsjMhWY",duration:"20:30"},
      {id:"v203",title:"Arrays, Strings & Pointers",ytId:"zuegQmMdy8M",duration:"35:18"},
      {id:"v204",title:"OOP — Classes & Objects",ytId:"wN0x9eZLix4",duration:"28:44"},
    ]},
  // 6. 🌐 Web Dev
  { id:"c3", title:"Web Dev: HTML + CSS + JS", category:"Web Dev", level:"Beginner", color:"#f0437a", icon:"🌐", instructor:"HackingSum Team", order:5,
    description:"Build stunning websites from scratch — HTML5 structure, CSS3 animations, JavaScript interactivity.",
    videos:[
      {id:"v301",title:"HTML5 — Complete Crash Course",ytId:"kUMe1FH4CHE",duration:"11:20"},
      {id:"v302",title:"CSS3 — Layouts, Flexbox & Grid",ytId:"OXGznpKZ_sA",duration:"16:45"},
      {id:"v303",title:"JavaScript — The Complete Intro",ytId:"W6NZfCO5SIk",duration:"19:55"},
      {id:"v304",title:"DOM Manipulation & Events",ytId:"y17RuWkWdn8",duration:"24:30"},
    ]},
  // 7. 🗄️ Database
  { id:"c10", title:"Database & SQL", category:"Database", level:"Beginner", color:"#f472b6", icon:"🗄️", instructor:"HackingSum Team", order:6,
    description:"Design databases, write SQL queries, understand joins, indexes and transactions in MySQL.",
    videos:[
      {id:"v1001",title:"Database Concepts & Relational Model",ytId:"HXV3zeQKqGY",duration:"21:05"},
      {id:"v1002",title:"SQL Basics — CREATE, INSERT, SELECT",ytId:"zbMHLJ0dY4w",duration:"18:30"},
      {id:"v1003",title:"Joins, Subqueries & Aggregation",ytId:"9URM1_2S0ho",duration:"26:20"},
      {id:"v1004",title:"Indexes, Transactions & ACID",ytId:"zt0INs0cBe8",duration:"19:45"},
      {id:"v1005",title:"Database Design & Normalization",ytId:"GFQaEYEc8_0",duration:"23:10"},
    ]},
  // 8. 🔧 DevTools — Git
  { id:"c11", title:"Git & GitHub", category:"DevTools", level:"Beginner", color:"#f97316", icon:"🔧", instructor:"HackingSum Team", order:7,
    description:"Version control from basics to advanced — branching, merging, pull requests and CI/CD basics.",
    videos:[
      {id:"v1101",title:"What is Git? Install & First Commit",ytId:"8JJ101D3knE",duration:"15:20"},
      {id:"v1102",title:"Branching, Merging & Conflicts",ytId:"Q1kHG842HoI",duration:"22:10"},
      {id:"v1103",title:"GitHub — Remote Repos & Collaboration",ytId:"nhNq2kIvi9s",duration:"19:30"},
      {id:"v1104",title:"Pull Requests, Forks & Open Source",ytId:"rgbCcBNZcdQ",duration:"17:45"},
      {id:"v1105",title:"Git Advanced — Rebase, Stash & Tags",ytId:"0chZFIZLR_0",duration:"24:55"},
    ]},
  // 9. 🧠 DSA
  { id:"c4", title:"DSA Masterclass", category:"DSA", level:"Intermediate", color:"#f59e0b", icon:"🧠", instructor:"HackingSum Team", order:8,
    description:"Arrays, Linked Lists, Stacks, Trees, Graphs, Sorting & Dynamic Programming for interviews.",
    videos:[
      {id:"v401",title:"Big O Notation & Complexity",ytId:"BgLTDT03QtU",duration:"20:12"},
      {id:"v402",title:"Arrays & Strings Deep Dive",ytId:"CBYHwZcbD-s",duration:"28:12"},
      {id:"v403",title:"Linked Lists — All Variants",ytId:"Hj_rA0dhr2I",duration:"24:44"},
      {id:"v404",title:"Binary Trees & BST",ytId:"fAAZixBzIAI",duration:"31:05"},
      {id:"v405",title:"Dynamic Programming Intro",ytId:"oBt53YbR9Kk",duration:"35:40"},
    ]},
  // 10. ☁️ Cloud
  { id:"c12", title:"Cloud Computing Basics", category:"Cloud", level:"Intermediate", color:"#818cf8", icon:"☁️", instructor:"HackingSum Team", order:9,
    description:"AWS & GCP fundamentals — EC2, S3, Lambda, Cloud storage, IAM and serverless concepts.",
    videos:[
      {id:"v1201",title:"What is Cloud Computing? AWS vs GCP vs Azure",ytId:"M988_fsOSWo",duration:"16:40"},
      {id:"v1202",title:"AWS Core — EC2, S3 & IAM",ytId:"a9__D53WsUs",duration:"24:15"},
      {id:"v1203",title:"Serverless & Lambda Functions",ytId:"97q30JjEq9Y",duration:"20:30"},
      {id:"v1204",title:"Databases in Cloud — RDS & DynamoDB",ytId:"eMzCI7S1P9M",duration:"22:45"},
      {id:"v1205",title:"Deployment, CI/CD & Cloud Best Practices",ytId:"tPWBF13JIVk",duration:"26:20"},
    ]},
  // 11. 🔐 Cybersecurity
  { id:"c5", title:"Cybersecurity Fundamentals", category:"Cybersecurity", level:"Beginner", color:"#a855f7", icon:"🔐", instructor:"HackingSum Team", order:10,
    description:"Ethical hacking, networking, Linux CLI, OWASP Top 10, CTF basics and penetration testing.",
    videos:[
      {id:"v501",title:"What is Cybersecurity? Career Paths",ytId:"U_P23SqJaDc",duration:"15:30"},
      {id:"v502",title:"Linux for Hackers — CLI Basics",ytId:"ZtqBQ68cfJc",duration:"22:00"},
      {id:"v503",title:"Networking Essentials — TCP/IP",ytId:"qiQR5rTSshw",duration:"18:45"},
      {id:"v504",title:"Intro to Ethical Hacking",ytId:"3Kq1MIfTWCE",duration:"26:20"},
    ]},
  // 12. 🏆 Competitive Programming
  { id:"c6", title:"Competitive Programming", category:"CP", level:"Advanced", color:"#22d3ee", icon:"🏆", instructor:"HackingSum Team", order:11,
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
  if(sessionStorage.getItem("hs_seeded_v5"))return;
  sessionStorage.setItem("hs_seeded_v5","1");
  // Har course individually check karo — missing ones add karo, order field update karo
  for(const c of SEED_COURSES){
    const ref=doc(db,"courses",c.id);
    const existing=await getDoc(ref);
    if(!existing.exists()){
      await setDoc(ref,{...c,createdAt:serverTimestamp()});
    } else {
      // order field update karo agar nahi hai
      if(existing.data().order===undefined){
        await setDoc(ref,{order:c.order},{merge:true});
      }
    }
  }
  // Learning paths — fixed IDs taaki updateDoc kaam kare
  const SEED_PATHS=[
    {id:"fp1",name:"Foundations",icon:"💡",color:"#34d399",desc:"Computer basics, OS, hardware",courseIds:["c7"],order:0},
    {id:"fp2",name:"Networking",icon:"🌍",color:"#60a5fa",desc:"TCP/IP, protocols, subnetting",courseIds:["c8"],order:1},
    {id:"fp3",name:"Linux",icon:"🐧",color:"#fb923c",desc:"Terminal, shell, scripting",courseIds:["c9"],order:2},
    {id:"fp4",name:"Programming",icon:"⌨️",color:"#00f5c4",desc:"Python, C++",courseIds:["c1","c2"],order:3},
    {id:"fp5",name:"Web Dev",icon:"🌐",color:"#f0437a",desc:"HTML, CSS, JavaScript",courseIds:["c3"],order:4},
    {id:"fp6",name:"Database",icon:"🗄️",color:"#f472b6",desc:"SQL, MySQL, DB design",courseIds:["c10"],order:5},
    {id:"fp7",name:"DevTools",icon:"🔧",color:"#f97316",desc:"Git, GitHub, version control",courseIds:["c11"],order:6},
    {id:"fp8",name:"DSA",icon:"🧠",color:"#f59e0b",desc:"Data structures & algorithms",courseIds:["c4"],order:7},
    {id:"fp9",name:"Cloud",icon:"☁️",color:"#818cf8",desc:"AWS, GCP, serverless",courseIds:["c12"],order:8},
    {id:"fp10",name:"Cybersecurity",icon:"🔐",color:"#a855f7",desc:"Hacking, CTF, pentesting",courseIds:["c5"],order:9},
    {id:"fp11",name:"Competitive",icon:"🏆",color:"#22d3ee",desc:"CP, Codeforces, ICPC",courseIds:["c6"],order:10},
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
    {id:"fp1",name:"Foundations",icon:"💡",color:"#34d399",desc:"Computer basics, OS",courseIds:[]},
    {id:"fp2",name:"Networking",icon:"🌍",color:"#60a5fa",desc:"TCP/IP, protocols",courseIds:[]},
    {id:"fp3",name:"Linux",icon:"🐧",color:"#fb923c",desc:"Terminal, shell, scripting",courseIds:[]},
    {id:"fp4",name:"Programming",icon:"⌨️",color:"#00f5c4",desc:"Python, C++",courseIds:[]},
    {id:"fp5",name:"Web Dev",icon:"🌐",color:"#f0437a",desc:"HTML, CSS, JS",courseIds:[]},
    {id:"fp6",name:"Database",icon:"🗄️",color:"#f472b6",desc:"SQL, MySQL",courseIds:[]},
    {id:"fp7",name:"DevTools",icon:"🔧",color:"#f97316",desc:"Git & GitHub",courseIds:[]},
    {id:"fp8",name:"DSA",icon:"🧠",color:"#f59e0b",desc:"Data Structures",courseIds:[]},
    {id:"fp9",name:"Cloud",icon:"☁️",color:"#818cf8",desc:"AWS, GCP, serverless",courseIds:[]},
    {id:"fp10",name:"Cybersecurity",icon:"🔐",color:"#a855f7",desc:"Hacking fundamentals",courseIds:[]},
    {id:"fp11",name:"Competitive",icon:"🏆",color:"#22d3ee",desc:"CP & contests",courseIds:[]},
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
  const cats=["All","Fundamentals","Networking","Linux","Programming","Web Dev","Database","DevTools","DSA","Cloud","Cybersecurity","CP"];
  const filtered=courses.filter(c=>
    (filter==="All"||c.category===filter)&&
    (search===""||c.title.toLowerCase().includes(search.toLowerCase())||c.description?.toLowerCase().includes(search.toLowerCase()))
  ).sort((a,b)=>(a.order??99)-(b.order??99));
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
            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:T.accent,letterSpacing:2}}>FREE CODING UNIVERSITY · EST. 2026</span>
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
  const cats=["All","Python","C++","Web Dev","DSA","Cybersecurity","CP","Computer Fundamentals","Networking","Linux","Database","Git","Cloud","General"];

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
  const cats=["Python","C++","Web Dev","DSA","Cybersecurity","CP","Computer Fundamentals","Networking","Linux","Database","Git","Cloud","General"];
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


// ── Quiz Questions Cache (replaces STATIC_QUIZ) ──────────
// Questions fetched from Firestore on demand, cached in memory
// _quizCache: module-level so it persists across renders
const _quizCache = {};   // { "c1_basic": [...200 questions] }

async function fetchQuizQuestions(courseId, level) {
  const key = `${courseId}_${level}`;
  if (_quizCache[key] && _quizCache[key].length > 0) return _quizCache[key];
  try {
    const snap = await getDocs(query(
      collection(db, "quiz_questions"),
      where("courseId", "==", courseId),
      where("level", "==", level)
    ));
    const qs = snap.docs.map(d => ({ ...d.data(), _id: d.id }));
    _quizCache[key] = qs;
    return qs;
  } catch(e) {
    console.error("fetchQuizQuestions error:", e);
    return [];
  }
}

// Fetch counts for all courses — returns count map for React state
async function fetchAllQuizCounts(courses) {
  const levels = ["basic","intermediate","advanced"];
  const counts = {};
  const promises = [];
  for (const c of courses) {
    for (const lv of levels) {
      const key = `${c.id}_${lv}`;
      promises.push(
        fetchQuizQuestions(c.id, lv).then(qs => {
          counts[key] = qs.length;
        }).catch(() => { counts[key] = 0; })
      );
    }
  }
  await Promise.allSettled(promises);
  return counts;
}


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

function QuizProgressPage({user,courses,setPage,quizCounts={}}){
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
      const _cnt=(quizCounts[`${c.id}_${lv}`]||0);
      const tests=Array.from({length:Math.floor(_cnt/20)},(_,i)=>i+1);
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
        {[...courses].sort((a,b)=>(a.order??99)-(b.order??99)).map((c,ci)=>{
          let cTotal=0,cDone=0,cBestSum=0;
          ["basic","intermediate","advanced"].forEach(lv=>{
            const _cnt=(quizCounts[`${c.id}_${lv}`]||0);
            const tests=Array.from({length:Math.floor(_cnt/20)},(_,i)=>i+1);
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
                const _cnt=(quizCounts[`${c.id}_${lv}`]||0);
                const tests=Array.from({length:Math.floor(_cnt/20)},(_,i)=>i+1);
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

function QuizPage({user,courses,setPage,quizCounts={}}){
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
    try{
      const allPool = await fetchQuizQuestions(course.id, level);
      const chunks = chunkArr(allPool, 20);
      const chunk = chunks[(testNum-1) % chunks.length] || allPool.slice(0,20);
      const combined = shuffleArr([...chunk]).map(shuffleQ);
      setAllQs(combined);
    }catch(e){
      console.error("startTest error:", e);
      setAllQs([]);
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
            const _cnt=(quizCounts[`${c.id}_${lv}`]||0);
            const tests=Array.from({length:Math.floor(_cnt/20)},(_,i)=>i+1);
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
        {[...courses].sort((a,b)=>(a.order??99)-(b.order??99)).map((c,ci)=>{
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
                const _cnt=(quizCounts[`${c.id}_${lv}`]||0);
                const tests=Array.from({length:Math.floor(_cnt/20)},(_,i)=>i+1);
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
            {user?"12 courses · 3 levels · 10 tests each · 7200+ questions":"Login to save your progress."}
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
        {[...courses].sort((a,b)=>(a.order??99)-(b.order??99)).map((c,i)=>{
          const levels=["basic","intermediate","advanced"];
          const totalTests=levels.reduce((s,lv)=>{
            return s+Math.floor((quizCounts[`${c.id}_${lv}`]||0)/20);
          },0);
          const doneTests=user?levels.reduce((s,lv)=>{
            const _cnt=(quizCounts[`${c.id}_${lv}`]||0);
            const tests=Array.from({length:Math.floor(_cnt/20)},(_,i)=>i+1);
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
                    const _cnt=(quizCounts[`${c.id}_${lv}`]||0);
                    const tests=Array.from({length:Math.floor(_cnt/20)},(_,i)=>i+1);
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
                          <div style={{fontSize:10,color:T.muted,marginTop:1}}>{tests.length} tests · {_cnt} questions</div>
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
    const _staticCount=Math.floor((quizCounts[`${selCourse.id}_${selLevel}`]||0)/20);
    const staticTests=Array.from({length:_staticCount},(_,i)=>i+1);
    const customTestNums=[...new Set(testMetas.filter(m=>m.testNum>_staticCount).map(m=>m.testNum))].sort((a,b)=>a-b);
    const allTestNums=[...staticTests, ...customTestNums];
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
              const isStatic=testNum<=_staticCount;
              const staticQs=[];
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

  // Admin uses testMetas from Firestore for test list — no need for local cache
  const staticPool  = [];
  const staticChunks = [];
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
  const [quizCounts,setQuizCounts]=useState({});  // {c1_basic: 200, ...}
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
        const list = snap.empty
          ? SEED_COURSES
          : snap.docs.map(d=>({...d.data(),id:d.id}));
        setCourses(list);
        setBooting(false);
        // Fetch quiz counts from Firebase → triggers re-render with real data
        fetchAllQuizCounts(list).then(counts => {
          setQuizCounts(counts);
        }).catch(()=>{});
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
      {page==="quiz"        &&<QuizPage         user={user} courses={courses} setPage={navigate} quizCounts={quizCounts}/>}
      {page==="quiz-progress"&&user?.role!=="admin"&&<QuizProgressPage user={user} courses={courses} setPage={navigate} quizCounts={quizCounts}/>}
      {page==="leaderboard" &&<LeaderboardPage  user={user} courses={courses} setPage={navigate}/>}
      {page==="placement"   &&<JobPlacementPage setPage={navigate}/>}
      {["admin","admin-courses","admin-notes","admin-quiz","admin-students"].includes(page)&&user?.role==="admin"&&
        <AdminPage tab={page==="admin-courses"?"courses":page==="admin-notes"?"notes":page==="admin-quiz"?"quiz":page==="admin-students"?"students":"overview"}
          courses={courses} setCourses={setCourses} setPage={navigate}/>
      }
    </>
  );
}
