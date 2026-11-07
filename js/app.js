const $=s=>document.querySelector(s);
const PRODUCTS=[
{id:1,n:'Playera básica algodón',c:'Playeras',p:199,e:'👕',bg:'#dbeafe'},
{id:2,n:'Playera estampada',c:'Playeras',p:249,e:'👕',bg:'#fde68a'},
{id:3,n:'Playera oversize',c:'Playeras',p:279,e:'👕',bg:'#fecaca'},
{id:4,n:'Suéter de lana',c:'Suéteres',p:549,e:'🧶',bg:'#e9d5ff'},
{id:5,n:'Suéter cuello alto',c:'Suéteres',p:599,e:'🧶',bg:'#bbf7d0'},
{id:6,n:'Sudadera con capucha',c:'Sudaderas',p:649,e:'🧥',bg:'#c7d2fe'},
{id:7,n:'Chamarra de mezclilla',c:'Chamarras',p:899,e:'🧥',bg:'#bae6fd'},
{id:8,n:'Jeans slim',c:'Pantalones',p:699,e:'👖',bg:'#93c5fd'},
{id:9,n:'Pantalón jogger',c:'Pantalones',p:459,e:'👖',bg:'#d1d5db'},
{id:10,n:'Gorra clásica',c:'Accesorios',p:199,e:'🧢',bg:'#fed7aa'},
{id:11,n:'Bufanda tejida',c:'Accesorios',p:229,e:'🧣',bg:'#fbcfe8'},
{id:12,n:'Calcetines (3 pares)',c:'Accesorios',p:149,e:'🧦',bg:'#a7f3d0'}];
const SIZES=['CH','M','G','XG'];
const mxn=n=>n.toLocaleString('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0});
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
let cart=load('cart',{}),cat='Todos',term='';

function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500)}

function renderChips(){
  const cats=['Todos',...new Set(PRODUCTS.map(p=>p.c))];
  $('#chips').replaceChildren(...cats.map(c=>{
    const b=document.createElement('button');b.textContent=c;
    if(c===cat)b.className='on';
    b.onclick=()=>{cat=c;renderChips();renderGrid()};return b}));
}
function renderGrid(){
  const list=PRODUCTS.filter(p=>(cat==='Todos'||p.c===cat)&&p.n.toLowerCase().includes(term));
  $('#empty').hidden=list.length>0;
  $('#grid').replaceChildren(...list.map(p=>{
    const d=document.createElement('article');d.className='card';
    d.innerHTML=`<div class="img" style="background:${p.bg}">${p.e}</div><div class="info"><span class="cat">${p.c}</span><h3>${p.n}</h3><span class="price">${mxn(p.p)}</span><select aria-label="Talla">${SIZES.map(s=>`<option>${s}</option>`).join('')}</select><button class="primary">Agregar</button></div>`;
    d.querySelector('button').onclick=()=>{add(p.id,d.querySelector('select').value);toast(p.n+' agregado')};
    return d}));
}
function add(id,size,n=1){
  const k=id+'|'+size;cart[k]=(cart[k]||0)+n;
  if(cart[k]<=0)delete cart[k];
  save('cart',cart);renderCart();
}
function renderCart(){
  const keys=Object.keys(cart);let total=0,count=0;
  $('#items').replaceChildren(...(keys.length?keys.map(k=>{
    const [id,size]=k.split('|'),p=PRODUCTS.find(x=>x.id==id),q=cart[k];
    total+=p.p*q;count+=q;
    const r=document.createElement('div');r.className='row';
    r.innerHTML=`<span>${p.e}</span><div class="t">${p.n}<br><small>Talla ${size} · ${mxn(p.p)}</small></div><button>−</button><b>${q}</b><button>+</button>`;
    const [m,pl]=r.querySelectorAll('button');
    m.onclick=()=>add(id,size,-1);pl.onclick=()=>add(id,size,1);return r
  }):[Object.assign(document.createElement('p'),{textContent:'El carrito está vacío.'})]));
  $('#total').textContent=mxn(total);$('#count').textContent=count;
}
const cartEl=$('#cart');
const openCart=o=>{cartEl.classList.toggle('open',o);cartEl.setAttribute('aria-hidden',!o)};
$('#cartBtn').onclick=()=>openCart(true);$('#close').onclick=()=>openCart(false);
$('#clear').onclick=()=>{cart={};save('cart',cart);renderCart()};
$('#buy').onclick=()=>{
  if(!Object.keys(cart).length)return toast('Agrega prendas primero');
  const orders=load('orders',[]);
  orders.push({fecha:new Date().toISOString(),items:cart,total:$('#total').textContent});
  save('orders',orders);cart={};save('cart',cart);renderCart();openCart(false);
  toast('¡Pedido #'+orders.length+' registrado! Gracias por tu compra.');
};
$('#q').oninput=e=>{term=e.target.value.trim().toLowerCase();renderGrid()};

const net=()=>{$('#offline').hidden=navigator.onLine};
addEventListener('online',net);addEventListener('offline',net);net();

let deferred;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('#install').hidden=false});
$('#install').onclick=async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;$('#install').hidden=true};
addEventListener('appinstalled',()=>{$('#install').hidden=true;toast('App instalada')});

if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.error));
renderChips();renderGrid();renderCart();
