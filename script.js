/* SetWith storefront prototype. Product/room objects can be replaced by API responses later. */
const image = (id, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=82`;

const products = [
  { id:"desk", name:"Oakline 원목 데스크", category:"가구", price:129000, lowest:99000, seller:"오늘의집", rating:4.8, mood:["따뜻한","빈티지"], size:"120 × 60cm", image:image("photo-1497366811353-6870744d04b2"), rooms:["study","work"] },
  { id:"chair", name:"Loom 패브릭 체어", category:"가구", price:89000, lowest:59900, seller:"쿠팡", rating:4.7, mood:["따뜻한","모던"], size:"48 × 52cm", image:image("photo-1586023492125-27b2c045efd7"), rooms:["study","living"] },
  { id:"bed", name:"Cloudy 패브릭 침대", category:"가구", price:399000, lowest:329000, seller:"한샘", rating:4.9, mood:["미니멀","따뜻한"], size:"150 × 210cm", image:image("photo-1505693416388-ac5ce068fe85"), rooms:["bedroom"] },
  { id:"sofa", name:"Mellow 2인 소파", category:"가구", price:449000, lowest:379000, seller:"오늘의집", rating:4.8, mood:["따뜻한","모던"], size:"175 × 82cm", image:image("photo-1555041469-a586c61ea9bc"), rooms:["living","cafe"] },
  { id:"shelf", name:"Line 오픈 책장", category:"가구", price:159000, lowest:119000, seller:"G마켓", rating:4.6, mood:["미니멀","모던"], size:"80 × 30cm", image:image("photo-1594620302200-9a762244a156"), rooms:["study","living","work"] },
  { id:"lamp", name:"Mori 무드 스탠드", category:"조명", price:49000, lowest:32900, seller:"네이버쇼핑", rating:4.8, mood:["따뜻한","빈티지"], size:"높이 38cm", image:image("photo-1507473885765-e6ed057f782c"), rooms:["bedroom","study","living"] },
  { id:"led", name:"Halo 간접 LED 바", category:"조명", price:39000, lowest:24900, seller:"11번가", rating:4.5, mood:["게이밍","모던"], size:"길이 1m", image:image("photo-1513506003901-1e6a229e2d15"), rooms:["game","work"] },
  { id:"rug", name:"Breeze 러그 150", category:"인테리어", price:79000, lowest:54900, seller:"오늘의집", rating:4.7, mood:["따뜻한","빈티지"], size:"150 × 200cm", image:image("photo-1600166898405-da9535204843"), rooms:["bedroom","living","cafe"] },
  { id:"plant", name:"Olive 드라세나 플랜트", category:"인테리어", price:59000, lowest:39000, seller:"플랜트샵", rating:4.6, mood:["따뜻한","미니멀"], size:"높이 95cm", image:image("photo-1616486338812-3dadae4b4ace"), rooms:["living","work","cafe"] },
  { id:"frame", name:"Quiet Line 아트 프레임", category:"인테리어", price:42000, lowest:28900, seller:"29CM", rating:4.5, mood:["미니멀","모던"], size:"40 × 50cm", image:image("photo-1513519245088-0e12902e5a38"), rooms:["bedroom","living"] },
  { id:"mirror", name:"Roundy 라운드 거울", category:"인테리어", price:69000, lowest:49900, seller:"오늘의집", rating:4.7, mood:["미니멀","따뜻한"], size:"지름 60cm", image:image("photo-1618220179428-22790b461013"), rooms:["bedroom","living"] },
  { id:"monitor", name:"View 27인치 모니터", category:"전자기기", price:299000, lowest:249000, seller:"다나와", rating:4.8, mood:["모던","게이밍"], size:"27인치", image:image("photo-1527443224154-c4a3942d3acf"), rooms:["study","game","work"] },
  { id:"keyboard", name:"Type 75 기계식 키보드", category:"전자기기", price:129000, lowest:99000, seller:"쿠팡", rating:4.7, mood:["게이밍","모던"], size:"75키", image:image("photo-1587829741301-dc798b83add3"), rooms:["game","work"] },
  { id:"speaker", name:"Pebble 블루투스 스피커", category:"전자기기", price:89000, lowest:69900, seller:"G마켓", rating:4.6, mood:["빈티지","모던"], size:"15 × 10cm", image:image("photo-1545454675-3531b543be5d"), rooms:["bedroom","living","cafe"] },
  { id:"charger", name:"Dock 멀티 충전 스테이션", category:"전자기기", price:59000, lowest:39900, seller:"11번가", rating:4.5, mood:["미니멀","모던"], size:"18 × 8cm", image:image("photo-1609592424987-3b0f2e9f3e4e"), rooms:["study","work"] },
  { id:"figure", name:"Tiny Objects 피규어 세트", category:"소품", price:35000, lowest:24900, seller:"네이버쇼핑", rating:4.8, mood:["게이밍","빈티지"], size:"5종 세트", image:image("photo-1577083288073-40892c0860a4"), rooms:["game","study"] },
  { id:"vase", name:"Curve 세라믹 화병", category:"소품", price:32000, lowest:19900, seller:"오늘의집", rating:4.7, mood:["미니멀","따뜻한"], size:"높이 24cm", image:image("photo-1612196808214-b8e1d6145a8c"), rooms:["bedroom","living","cafe"] },
  { id:"stationery", name:"Paperwork 문구 박스", category:"소품", price:28000, lowest:17900, seller:"29CM", rating:4.6, mood:["빈티지","따뜻한"], size:"12종 세트", image:image("photo-1456324504439-367cee3b3c32"), rooms:["study","work"] },
  { id:"beanbag", name:"Cloud 빈백 쿠션", category:"소품", price:99000, lowest:79000, seller:"쿠팡", rating:4.5, mood:["따뜻한","게이밍"], size:"90 × 90cm", image:image("photo-1586023492125-27b2c045efd7"), rooms:["game","bedroom"] },
];

const rooms = [
  { id:"bedroom", name:"침실", type:"BEDROOM", size:"12.8㎡", mood:"따뜻한", cost:536800, image:image("photo-1505693416388-ac5ce068fe85", 1000), desc:"하루를 천천히 시작하고 마무리하는 포근한 침실", products:["bed","lamp","rug","mirror","vase"] },
  { id:"living", name:"거실", type:"LIVING ROOM", size:"18.4㎡", mood:"모던", cost:728900, image:image("photo-1616486338812-3dadae4b4ace", 1000), desc:"사람과 이야기가 자연스럽게 모이는 따뜻한 거실", products:["sofa","rug","plant","frame","speaker"] },
  { id:"study", name:"공부방", type:"STUDY ROOM", size:"9.6㎡", mood:"미니멀", cost:558800, image:image("photo-1497366811353-6870744d04b2", 1000), desc:"집중과 휴식의 균형을 찾는 나만의 작업 공간", products:["desk","chair","shelf","lamp","monitor","stationery"] },
  { id:"game", name:"게임방", type:"GAME ROOM", size:"11.2㎡", mood:"게이밍", cost:706800, image:image("photo-1598550476439-6847785fcea6", 1000), desc:"좋아하는 게임과 음악에 깊이 몰입하는 방", products:["desk","chair","monitor","keyboard","led","figure"] },
  { id:"cafe", name:"카페 스타일", type:"CAFE MOOD", size:"15.0㎡", mood:"빈티지", cost:609800, image:image("photo-1495474472287-4d71bcdd2085", 1000), desc:"작은 카페처럼 머물고 싶은 여유로운 공간", products:["sofa","lamp","plant","vase","speaker","rug"] },
  { id:"work", name:"작업실", type:"WORK STUDIO", size:"10.5㎡", mood:"모던", cost:617800, image:image("photo-1497366754035-f200968a6e72", 1000), desc:"생각을 만들고 결과물을 완성하는 집중의 방", products:["desk","chair","monitor","keyboard","shelf","charger"] },
  { id:"one", name:"감성 원룸", type:"ONE ROOM", size:"20.0㎡", mood:"따뜻한", cost:837700, image:image("photo-1522708323590-d24dbb6b0267", 1000), desc:"작지만 취향은 선명한 첫 번째 공간", products:["bed","sofa","lamp","rug","plant","mirror"] },
  { id:"minimal", name:"화이트 미니멀", type:"MINIMAL ROOM", size:"13.2㎡", mood:"미니멀", cost:628800, image:image("photo-1554995207-c18c203602cb", 1000), desc:"비우고, 남긴 것의 아름다움을 보는 공간", products:["bed","shelf","lamp","frame","vase"] },
];

const categories = ["전체","가구","조명","인테리어","전자기기","소품"];
const moods = ["미니멀","모던","따뜻한","빈티지","게이밍"];
const state = {
  category:"전체", mood:"전체", price:"all", sort:"recommended", search:"", wishlist:JSON.parse(localStorage.getItem("setwithWish") || "[]"), cart:JSON.parse(localStorage.getItem("setwithCart") || "[]"), placed:[], selectedRoom:null, lastCompare:null, studioMood:"day"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const won = (n) => `₩${Number(n).toLocaleString("ko-KR")}`;
const getProduct = (id) => products.find((p) => p.id === id);
const getRoom = (id) => rooms.find((r) => r.id === id);
const saveState = () => { localStorage.setItem("setwithWish", JSON.stringify(state.wishlist)); localStorage.setItem("setwithCart", JSON.stringify(state.cart)); };

function renderRooms(){
  $("#room-grid").innerHTML = rooms.map((r) => `<article class="room-card" data-room="${r.id}"><img src="${r.image}" alt="${r.name} 공간 이미지" loading="lazy"/><div class="room-card-content"><span>${r.type} · ${r.size}</span><h3>${r.name}</h3><small>${r.desc}</small></div></article>`).join("");
}

function renderFilters(){
  $("#category-filters").innerHTML = categories.map((c) => `<button class="filter-chip ${state.category === c ? "active" : ""}" data-category="${c}">${c}</button>`).join("");
  $("#mood-filters").innerHTML = ["전체",...moods].map((m) => `<button class="filter-chip ${state.mood === m ? "active" : ""}" data-mood-filter="${m}">${m}</button>`).join("");
}

function filteredProducts(){
  let list = products.filter((p) => {
    const text = `${p.name} ${p.category} ${p.mood.join(" ")}`.toLowerCase();
    const priceOk = state.price === "all" || (state.price === "under50" && p.lowest <= 50000) || (state.price === "50to150" && p.lowest > 50000 && p.lowest < 150000) || (state.price === "over150" && p.lowest >= 150000);
    return (state.category === "전체" || p.category === state.category) && (state.mood === "전체" || p.mood.includes(state.mood)) && (!state.search || text.includes(state.search.toLowerCase())) && priceOk;
  });
  if(state.sort === "low") list.sort((a,b)=>a.lowest-b.lowest); if(state.sort === "high") list.sort((a,b)=>b.lowest-a.lowest); if(state.sort === "rating") list.sort((a,b)=>b.rating-a.rating);
  return list;
}

function renderProducts(){
  const list = filteredProducts(); $("#product-result-count").textContent = `상품 ${list.length}개`;
  $("#product-grid").innerHTML = list.length ? list.map((p) => {
    const wished = state.wishlist.includes(p.id);
    return `<article class="product-card"><div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy"/><button class="wish-button ${wished?"active":""}" data-action="wish" data-id="${p.id}">${wished?"♥":"♡"}</button></div><div class="product-info"><span class="product-category">${p.category}</span><h3>${p.name}</h3><span class="rating">★ ${p.rating}</span><div class="product-price"><strong>${won(p.lowest)}</strong><small>정가 ${won(p.price)}</small></div><div class="product-actions"><button data-action="compare" data-id="${p.id}">가격 비교</button><button class="add" data-action="add-cart" data-id="${p.id}">장바구니</button><button data-action="place" data-id="${p.id}">배치</button></div></div></article>`;
  }).join("") : `<div class="empty-state">검색 조건에 맞는 상품이 없습니다.<br /><button class="text-button" data-action="reset">필터 초기화 →</button></div>`;
}

function roomProducts(room){ return room.products.map(getProduct).filter(Boolean); }

function openRoom(roomId){
  const room = getRoom(roomId); if(!room) return; state.selectedRoom=roomId;
  const list = roomProducts(room);
  $("#room-detail-content").innerHTML = `<div class="room-detail-grid"><img class="room-detail-image" src="${room.image}" alt="${room.name}"/><div class="room-detail-copy"><p class="eyebrow">${room.type}</p><h2>${room.name}</h2><p>${room.desc}</p><div class="room-stat-row"><div><b>${room.size}</b><span>공간 크기</span></div><div><b>${won(room.cost)}</b><span>예상 비용</span></div><div><b>${list.length}개</b><span>사용 소품</span></div></div><h3>이 공간에 사용된 소품</h3><div class="room-product-list">${list.map((p)=>`<div class="room-product-row"><img src="${p.image}" alt=""/><div><b>${p.name}</b><small>최저가 ${won(p.lowest)} · ${p.seller}</small></div><button class="icon-button" data-action="wish" data-id="${p.id}">${state.wishlist.includes(p.id)?"♥":"♡"}</button><button class="button button-dark" data-action="add-cart" data-id="${p.id}">담기</button><button class="button button-light" data-action="compare" data-id="${p.id}">비교</button></div>`).join("")}</div><button class="button button-dark full" data-action="use-room" data-id="${room.id}">이 공간으로 꾸미기</button></div></div>`;
  $("#room-modal").hidden=false;
}

function openCompare(id){
  const p=getProduct(id); if(!p)return; state.lastCompare=id;
  const offers=[{seller:p.seller,price:p.lowest,shipping:0},{seller:"쿠팡",price:Math.round(p.lowest*1.05),shipping:3000},{seller:"G마켓",price:Math.round(p.lowest*1.1),shipping:0}].map((o)=>({...o,total:o.price+o.shipping})).sort((a,b)=>a.total-b.total);
  $("#compare-content").innerHTML=`<p class="eyebrow">PRICE CHECK</p><h2>플랫폼별 가격 비교</h2><div class="compare-product"><img src="${p.image}" alt="${p.name}"/><div><b>${p.name}</b><small>프로토타입 비교 데이터 · 실제 구매 전 판매처 확인</small></div></div><table class="compare-table"><thead><tr><th>판매처</th><th>상품가</th><th>배송비</th><th>총 가격</th><th></th></tr></thead><tbody>${offers.map((o,i)=>`<tr class="${i===0?"best":""}"><td>${o.seller}${i===0?" · 최저":""}</td><td>${won(o.price)}</td><td>${o.shipping?won(o.shipping):"무료"}</td><td>${won(o.total)}</td><td><a href="#" data-action="add-cart" data-id="${p.id}">담기</a></td></tr>`).join("")}</tbody></table>`;
  $("#compare-modal").hidden=false;
}

function updateBadges(){ $("#wish-count").textContent=state.wishlist.length; $("#cart-count").textContent=state.cart.reduce((a,c)=>a+c.qty,0); }
function toggleWish(id){ const i=state.wishlist.indexOf(id); if(i<0){state.wishlist.push(id);toast("찜 목록에 담았어요")}else{state.wishlist.splice(i,1);toast("찜 목록에서 뺐어요")};saveState();updateBadges();renderProducts(); }
function addCart(id){ const item=state.cart.find((c)=>c.id===id); if(item)item.qty++; else state.cart.push({id,qty:1}); saveState();updateBadges();renderCart();toast("장바구니에 담았어요"); }
function changeQty(id,delta){const item=state.cart.find((c)=>c.id===id);if(!item)return;item.qty+=delta;if(item.qty<1)state.cart=state.cart.filter((c)=>c.id!==id);saveState();updateBadges();renderCart()}
function cartTotal(){return state.cart.reduce((sum,c)=>{const p=getProduct(c.id);return sum+(p?p.lowest*c.qty:0)},0)}
function renderCart(){
  $("#cart-total").textContent=won(cartTotal());
  $("#cart-items").innerHTML=state.cart.length?state.cart.map((c)=>{const p=getProduct(c.id);return `<div class="cart-row"><img src="${p.image}" alt="${p.name}"/><div><h4>${p.name}</h4><small>${p.seller} · ${won(p.lowest)}</small><div class="quantity"><button data-action="qty" data-id="${p.id}" data-delta="-1">−</button><span>${c.qty}</span><button data-action="qty" data-id="${p.id}" data-delta="1">＋</button></div></div><button class="remove-item" data-action="remove-cart" data-id="${p.id}">×</button></div>`}).join(""):"<div class='empty-state'>아직 담은 소품이 없어요.<br />마음에 드는 상품을 담아보세요.</div>";
}
function openCart(){renderCart();$("#cart-drawer").classList.add("open");$("#cart-drawer").setAttribute("aria-hidden","false");$("#drawer-backdrop").hidden=false}
function closeCart(){$("#cart-drawer").classList.remove("open");$("#cart-drawer").setAttribute("aria-hidden","true");$("#drawer-backdrop").hidden=true}
function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove("show"),1800)}

function studioProducts(){return products.filter((p)=>p.rooms.includes("study")||["조명","인테리어","소품"].includes(p.category)).slice(0,12)}
function renderStudioLibrary(mode="objects"){
  const lib=mode==="templates"?rooms:studioProducts();
  $("#studio-library").innerHTML=mode==="templates"?lib.map((r)=>`<div class="library-item" data-action="use-room" data-id="${r.id}"><img src="${r.image}" alt=""/><div><b>${r.name}</b><small>${won(r.cost)}</small></div></div>`).join(""):lib.map((p)=>`<div class="library-item" draggable="true" data-action="place" data-id="${p.id}"><img src="${p.image}" alt=""/><div><b>${p.name}</b><small>${won(p.lowest)}</small></div></div>`).join("");
}
function renderPlaced(){
  const box=$("#placed-items");box.querySelectorAll(".placed-object").forEach((e)=>e.remove());$(".canvas-hint").style.display=state.placed.length?"none":"grid";
  state.placed.forEach((item)=>{const p=getProduct(item.id);if(!p)return;const el=document.createElement("div");el.className=`placed-object ${item.selected?"selected":""}`;el.style.left=`${item.x}%`;el.style.top=`${item.y}%`;el.style.transform=`translate(-50%,-50%) rotate(${item.rotation}deg) scale(${item.scale})`;el.innerHTML=`<img src="${p.image}" alt="${p.name}"/><span>${p.name}</span>`;el.dataset.id=item.uid;el.addEventListener("pointerdown",(e)=>selectPlaced(item.uid,e));box.appendChild(el)});updateStudioTotals()}
function addPlaced(id,x=50,y=50){state.placed.forEach((i)=>i.selected=false);state.placed.push({uid:Date.now()+Math.random(),id,x,y,scale:1,rotation:0,selected:true});renderPlaced();toast("공간에 배치했어요")}
function selectPlaced(uid,e){const item=state.placed.find((i)=>i.uid==uid);if(!item)return;state.placed.forEach((i)=>i.selected=false);item.selected=true;const box=$("#placed-items"), rect=box.getBoundingClientRect();const move=(ev)=>{item.x=Math.max(8,Math.min(92,((ev.clientX-rect.left)/rect.width)*100));item.y=Math.max(12,Math.min(88,((ev.clientY-rect.top)/rect.height)*100));renderPlaced()};const end=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",end)};window.addEventListener("pointermove",move);window.addEventListener("pointerup",end);renderPlaced()}
function updateStudioTotals(){const total=state.placed.reduce((a,i)=>{const p=getProduct(i.id);return a+(p?p.lowest:0)},0);$("#studio-total").textContent=won(total);$("#studio-item-count").textContent=`배치된 소품 ${state.placed.length}개`}
function useRoom(id){const r=getRoom(id);if(!r)return;state.placed=r.products.map((pid,i)=>({uid:Date.now()+i,id:pid,x:22+(i%3)*28,y:30+Math.floor(i/3)*28,scale:1,rotation:0,selected:false}));$("#canvas-room-name").textContent=r.name;renderPlaced();location.hash="studio";toast(`${r.name} 템플릿을 불러왔어요`)}
function applyMood(mood){state.studioMood=mood;const canvas=$("#studio-canvas");canvas.classList.remove("mood-warm","mood-night");if(mood==="warm")canvas.classList.add("mood-warm");if(mood==="night")canvas.classList.add("mood-night")}

function route(routeName){const el=document.getElementById(routeName);if(el)el.scrollIntoView({behavior:"smooth"})}
function closeModals(){$("#room-modal").hidden=true;$("#compare-modal").hidden=true}
function updateSearch(value){state.search=value;renderProducts()}
function resetFilters(){state.category="전체";state.mood="전체";state.price="all";state.sort="recommended";$("#global-search").value="";$$('input[name="price"]').forEach((r)=>r.checked=r.value==="all");renderFilters();renderProducts()}

document.addEventListener("click",(e)=>{
  const routeLink=e.target.closest("[data-route]");if(routeLink){e.preventDefault();route(routeLink.dataset.route);return}
  const room=e.target.closest("[data-room]");if(room){openRoom(room.dataset.room);return}
  const action=e.target.closest("[data-action]");if(!action)return;const type=action.dataset.action,id=action.dataset.id;
  if(type==="wish")toggleWish(id);if(type==="add-cart")addCart(id);if(type==="cart")openCart();if(type==="close-cart")closeCart();if(type==="close-modal")closeModals();if(type==="compare")openCompare(id||state.lastCompare);if(type==="compare-last")state.lastCompare?openCompare(state.lastCompare):toast("먼저 상품의 가격 비교를 선택하세요");if(type==="place")addPlaced(id);if(type==="qty")changeQty(id,Number(action.dataset.delta));if(type==="remove-cart")changeQty(id,-999);if(type==="reset")resetFilters();if(type==="use-room")useRoom(id);if(type==="clear-canvas"){state.placed=[];renderPlaced()}if(type==="mood")applyMood(action.dataset.mood);if(type==="wishlist")toast(`찜 목록 ${state.wishlist.length}개`);if(type==="menu")document.querySelector(".main-nav").classList.toggle("mobile-open");if(type==="add-space-to-cart"){state.placed.forEach((i)=>addCart(i.id));toast("배치한 소품을 장바구니에 담았어요")}if(type==="save-space")toast("내 공간을 브라우저에 저장했어요");
});

$("#global-search").addEventListener("input",(e)=>{route("shop");updateSearch(e.target.value)});
$("#sort-products").addEventListener("change",(e)=>{state.sort=e.target.value;renderProducts()});
$("#reset-filters").addEventListener("click",resetFilters);
$("#category-filters").addEventListener("click",(e)=>{const b=e.target.closest("[data-category]");if(!b)return;state.category=b.dataset.category;renderFilters();renderProducts()});
$("#mood-filters").addEventListener("click",(e)=>{const b=e.target.closest("[data-mood-filter]");if(!b)return;state.mood=b.dataset.moodFilter;renderFilters();renderProducts()});
$$('input[name="price"]').forEach((r)=>r.addEventListener("change",(e)=>{state.price=e.target.value;renderProducts()}));
$("#drawer-backdrop").addEventListener("click",closeCart);
$$('[data-studio-tab]').forEach((b)=>b.addEventListener("click",()=>{$$('[data-studio-tab]').forEach((x)=>x.classList.remove("active"));b.classList.add("active");renderStudioLibrary(b.dataset.studioTab)}));
$("#space-name").addEventListener("input",(e)=>$("#canvas-room-name").textContent=e.target.value||"나의 공간");
$("#studio-canvas").addEventListener("dragover",(e)=>e.preventDefault());$("#studio-canvas").addEventListener("drop",(e)=>{e.preventDefault();const id=e.dataTransfer.getData("product");if(id){const r=$("#placed-items").getBoundingClientRect();addPlaced(id,((e.clientX-r.left)/r.width)*100,((e.clientY-r.top)/r.height)*100)}});$("#studio-library").addEventListener("dragstart",(e)=>{const item=e.target.closest("[data-id]");if(item)e.dataTransfer.setData("product",item.dataset.id)});

renderRooms();renderFilters();renderProducts();renderStudioLibrary();renderPlaced();updateBadges();
