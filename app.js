(() => {
const $ = id => document.getElementById(id);
const KEYS={users:"dura_users_v1",games:"dura_games_v1",clicks:"dura_clicks_v1",session:"dura_session_v1",admin:"dura_admin_v1",pix:"dura_pix_v1"};
const read=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k))??fallback}catch{return fallback}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
let authMode="login", editing=null;
const defaultGames=[
 {id:crypto.randomUUID(),name:"DURA Runner",link:"https://example.com",description:"Um espaço reservado para seu próximo jogo.",status:"Desenvolvendo"},
 {id:crypto.randomUUID(),name:"Pixel Quest",link:"https://example.com",description:"Aventura em estilo pixel art.",status:"Manutenção"},
 {id:crypto.randomUUID(),name:"Neon Arena",link:"https://example.com",description:"Prepare-se para uma experiência futurista.",status:"Disponível"}
];
if(!localStorage.getItem(KEYS.games))write(KEYS.games,defaultGames);
const games=()=>read(KEYS.games,[]);
const current=()=>read(KEYS.session,null);
const safe=(s)=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(msg){$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2300)}
function statusClass(s){return s==="Disponível"?"available":s==="Desenvolvendo"?"dev":"maintenance"}
function render(){
 const list=games(),q=$("searchGames").value.toLowerCase();
 const filtered=list.filter(g=>(g.name+" "+(g.description||"")).toLowerCase().includes(q));
 $("gameGrid").innerHTML=filtered.map(g=>`<article class="game-card"><div class="game-icon">🎮</div><h3>${safe(g.name)}</h3><p>${safe(g.description||"Sem descrição.")}</p><div class="game-bottom"><span class="status ${statusClass(g.status)}">${safe(g.status)}</span>${g.status==="Disponível"?`<a href="${safe(g.link)}" target="_blank" rel="noopener noreferrer" data-game="${g.id}">Jogar ↗</a>`:"<span>Em breve</span>"}</div></article>`).join("");
 $("emptyState").classList.toggle("hidden",filtered.length!==0);
 $("gameTotal").textContent=list.length;$("availableTotal").textContent=list.filter(g=>g.status==="Disponível").length;
 // Sem backend não existe contagem global confiável de pessoas online.
 $("visitorTotal").textContent="—";
 const user=current();$("authActions").classList.toggle("hidden",!!user);$("userActions").classList.toggle("hidden",!user);
 if(user){$("helloUser").textContent="Olá, "+user.name;$("adminButton").classList.toggle("hidden",!user.isAdmin)}
 $("year").textContent=new Date().getFullYear();
 const pix=read(KEYS.pix,window.DURA_CONFIG?.pixKey||"");$("pixKeyLabel").textContent=pix||"Chave PIX ainda não configurada";$("copyPix").disabled=!pix;
}
function openAuth(mode){authMode=mode;$("authTitle").textContent=mode==="login"?"Entrar":"Criar conta";$("authSubmit").textContent=mode==="login"?"Entrar":"Cadastrar";$("repeatWrap").classList.toggle("hidden",mode==="login");$("repeatPassword").required=mode==="register";$("authError").textContent="";$("authForm").reset();$("switchAuth").innerHTML=mode==="login"?'Não tem conta? <button type="button" id="switchMode">Criar conta</button>':'Já tem conta? <button type="button" id="switchMode">Entrar</button>';$("authModal").classList.remove("hidden");$("switchMode").onclick=()=>openAuth(mode==="login"?"register":"login")}
async function hash(password,salt){const enc=new TextEncoder();const key=await crypto.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveBits"]);const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:enc.encode(salt),iterations:120000,hash:"SHA-256"},key,256);return [...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,"0")).join("")}
$("authForm").addEventListener("submit",async e=>{e.preventDefault();const name=$("authName").value.trim(),pass=$("authPassword").value;let users=read(KEYS.users,[]);if(authMode==="register"){if(pass!==$("repeatPassword").value){$("authError").textContent="As senhas não coincidem.";return}if(users.some(u=>u.name.toLowerCase()===name.toLowerCase())){$("authError").textContent="Este nome já está cadastrado.";return}const salt=crypto.randomUUID();users.push({name,salt,hash:await hash(pass,salt),isAdmin:users.length===0});write(KEYS.users,users);toast("Conta criada! Faça login.");openAuth("login");$("authName").value=name;return}
const user=users.find(u=>u.name.toLowerCase()===name.toLowerCase());if(!user||user.hash!==await hash(pass,user.salt)){$("authError").textContent="Nome ou senha incorretos.";return}write(KEYS.session,{name:user.name,isAdmin:!!user.isAdmin});$("authModal").classList.add("hidden");render();toast("Login realizado!")});
$("openLogin").onclick=()=>openAuth("login");$("openRegister").onclick=()=>openAuth("register");$("logout").onclick=()=>{localStorage.removeItem(KEYS.session);render();toast("Você saiu da conta.")};
$("searchGames").oninput=render;
$("gameGrid").addEventListener("click",e=>{const a=e.target.closest("[data-game]");if(!a)return;const id=a.dataset.game;let clicks=read(KEYS.clicks,{});clicks[id]=(clicks[id]||0)+1;write(KEYS.clicks,clicks)});
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>$(b.dataset.close).classList.add("hidden"));
document.querySelectorAll(".toggle-pass").forEach(b=>b.onclick=()=>{const input=$(b.dataset.target),show=input.type==="password";input.type=show?"text":"password";b.textContent=show?"Ocultar":"Mostrar"});
function renderAdmin(){const list=games(),clicks=read(KEYS.clicks,{});$("adminGames").textContent=list.length;$("adminClicks").textContent=Object.values(clicks).reduce((a,b)=>a+b,0);$("adminGameList").innerHTML=list.map(g=>`<div class="admin-row"><div><b>${safe(g.name)}</b><br><span>${safe(g.status)} · ${clicks[g.id]||0} acesso(s) neste navegador</span></div><div><button class="btn ghost" data-edit="${g.id}">Editar</button> <button class="btn ghost" data-delete="${g.id}">Excluir</button></div></div>`).join("")||"<p class='notice'>Nenhum jogo cadastrado.</p>";$("pixInput").value=read(KEYS.pix,window.DURA_CONFIG?.pixKey||"")}
$("adminButton").onclick=()=>{if(!current()?.isAdmin){toast("Acesso administrativo não autorizado.");return}renderAdmin();$("adminModal").classList.remove("hidden")};
$("gameForm").onsubmit=e=>{e.preventDefault();if(!current()?.isAdmin)return;let list=games();const obj={id:editing||crypto.randomUUID(),name:$("gameName").value.trim(),link:$("gameLink").value.trim(),description:$("gameDescription").value.trim(),status:$("gameStatus").value};if(editing)list=list.map(g=>g.id===editing?obj:g);else list.push(obj);write(KEYS.games,list);resetGameForm();render();renderAdmin();toast("Jogo salvo!")};
function resetGameForm(){editing=null;$("gameForm").reset();$("editId").value="";$("gameFormTitle").textContent="Adicionar jogo";$("cancelEdit").classList.add("hidden")}
$("cancelEdit").onclick=resetGameForm;
$("adminGameList").onclick=e=>{const edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");if(edit){const g=games().find(x=>x.id===edit.dataset.edit);if(!g)return;editing=g.id;$("gameName").value=g.name;$("gameLink").value=g.link;$("gameDescription").value=g.description||"";$("gameStatus").value=g.status;$("gameFormTitle").textContent="Editar jogo";$("cancelEdit").classList.remove("hidden");$("gameForm").scrollIntoView({behavior:"smooth"})}if(del){if(!confirm("Excluir este jogo?"))return;write(KEYS.games,games().filter(g=>g.id!==del.dataset.delete));render();renderAdmin();toast("Jogo excluído.")}};
$("savePix").onclick=()=>{write(KEYS.pix,$("pixInput").value.trim());render();toast("Chave PIX salva neste navegador.")};
$("copyPix").onclick=async()=>{const pix=read(KEYS.pix,window.DURA_CONFIG?.pixKey||"");if(!pix)return;try{await navigator.clipboard.writeText(pix);toast("Chave PIX copiada!")}catch{toast("Não foi possível copiar automaticamente.")}};
render();
})();