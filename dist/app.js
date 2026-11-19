import {cities,regions,regionNames} from './cities.js';

const $=s=>document.querySelector(s);
const stage=$('#stage'), markerLayer=$('#markers'), list=$('#city-list');
let region='all',query='',selected=null,flat=false,showLabels=true,renderer,camera,scene,controls,THREE,tween=null,ready=false,adventure=null;
let mode='world',worldRoot,worldGround,cityWorld=null,returnPosition=null,enteringCity=false;
const markers=new Map(),beacons=new Map();
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const visibleCities=()=>cities.filter(c=>(region==='all'||region===c.region)&&`${c.name} ${c.en} ${c.alias||''}`.toLowerCase().includes(query));
const point=c=>({x:(c.pos[0]-.5)*138,z:(c.pos[1]-.5)*113.27});

function renderList(){
  const visible=visibleCities();
  $('#count').textContent=String(visible.length).padStart(2,'0')+' CITIES';
  list.replaceChildren();
  for(const c of visible){
    const b=document.createElement('button');b.className='city-row'+(selected?.id===c.id?' active':'');
    b.setAttribute('aria-pressed',String(selected?.id===c.id));
    b.innerHTML=`<span class="city-icon"><span>${c.icon}</span></span><span><strong>${c.name}</strong><small>${c.en}</small></span>${c.pos?'<span class="row-arrow">↗</span>':'<span class="pending">待定位</span>'}`;
    b.onclick=()=>selectCity(c);list.append(b);
  }
  if(!visible.length){const p=document.createElement('p');p.className='empty';p.textContent='找不到城市，試試其他名稱。';list.append(p);}
  const ids=new Set(visible.map(c=>c.id));
  for(const [id,marker] of markers)marker.style.display=ids.has(id)?'':'none';
  for(const [id,beacon] of beacons)beacon.visible=ids.has(id);
}
function chooseRegion(id){region=id;for(const b of $('#filters').children)b.classList.toggle('active',b.dataset.id===id);$('#region-title').textContent=id==='all'?'全境探索':regionNames[id];renderList();}
for(const r of regions){const b=document.createElement('button');b.textContent=r.name;b.dataset.id=r.id;b.className=r.id==='all'?'active':'';b.onclick=()=>{chooseRegion(r.id);if(selected&&r.id!=='all'&&selected.region!==r.id)closeCard();resetView();};$('#filters').append(b);}
for(const c of cities.filter(c=>c.pos)){
  const b=document.createElement('button');b.className='marker';b.setAttribute('aria-label',`探索${c.name}`);b.innerHTML=`<span class="tag">${c.name}</span><span class="stem"></span><span class="dot"></span>`;b.onclick=()=>selectCity(c);markerLayer.append(b);markers.set(c.id,b);
}
function selectCity(c){
  selected=c;document.body.classList.remove('menu-open');$('#menu').setAttribute('aria-expanded','false');
  const card=$('#city-card');card.hidden=false;
  card.innerHTML=`<button class="card-close" aria-label="關閉城市介紹">×</button><div class="card-overline">${regionNames[c.region]}</div><h2>${c.name}</h2><div class="english">${c.en}</div><p>${c.desc}</p><div class="card-meta"><span>地圖位置</span><b>${c.pos?'概念底圖・初步配置':'尚待定位'}</b></div>${c.pos?'<button class="focus-button">前往城市 ↗</button>':'<p class="card-note">此區域尚未放上地圖，確認位置後補上。</p>'}${c.note?`<p class="card-note">${c.note}</p>`:''}`;
  card.querySelector('.card-close').onclick=closeCard;
  card.querySelector('.focus-button')?.addEventListener('click',()=>{focus(c);if(adventure?.player)adventure.goTo(point(c));});
  if(c.id==='prontera'){
    const enter=document.createElement('button');enter.className='focus-button enter-city-button';enter.textContent='進入城內 3D →';enter.onclick=enterProntera;card.append(enter);
    const button=document.createElement('button');button.className='focus-button';button.textContent='城內地圖 ⤢';button.style.marginLeft='8px';button.onclick=()=>{if(adventure){adventure.target=null;adventure.keys.clear();}$('#interior-dialog').showModal();};card.append(button);
  }
  for(const [id,m] of markers){m.classList.toggle('active',id===c.id);m.setAttribute('aria-pressed',String(id===c.id));}
  const params=new URLSearchParams(location.hash.slice(1));params.set('city',c.id);if(mode==='world')params.delete('view');history.replaceState(null,'','#'+params);
  renderList();if(c.pos)focus(c);
}
function closeCard(){selected=null;$('#city-card').hidden=true;for(const m of markers.values()){m.classList.remove('active');m.setAttribute('aria-pressed','false');}history.replaceState(null,'',location.pathname+location.search);renderList();}
function moveTo(target,position){
  if(!camera)return;
  tween={start:performance.now(),from:camera.position.clone(),to:position.clone(),targetFrom:controls.target.clone(),targetTo:target.clone(),duration:reduced?0:850};
}
function resetView(){
  if(!camera){updateMarkers();return;}
  const aspect=stage.clientWidth/stage.clientHeight;
  if(mode==='city'){const d=Math.max(410,350/Math.max(.4,aspect)+60);moveTo(new THREE.Vector3(0,0,-3),new THREE.Vector3(flat?0:d*.34,flat?d:d*.78,flat?.01:d*.66));return;}
  const distance=Math.max(178,192/Math.max(.4,aspect)+30);
  moveTo(new THREE.Vector3(0,0,0),new THREE.Vector3(0,flat?distance:distance*.87,flat?.01:distance*.53));
}
function focus(c){if(!camera||!c.pos)return;const p=point(c);const d=stage.clientWidth<700?100:90;moveTo(new THREE.Vector3(p.x,0,p.z),new THREE.Vector3(p.x,flat?d:d*.9,p.z+(flat?.01:d*.5)));}
function zoom(factor){if(!camera)return;const delta=camera.position.clone().sub(controls.target);const length=delta.length();delta.multiplyScalar(Math.min(controls.maxDistance,Math.max(controls.minDistance,length*factor))/length);moveTo(controls.target,controls.target.clone().add(delta));}
function updateMarkers(){
  if(mode==='city')return;
  if(camera){const projected=new THREE.Vector3();for(const c of cities.filter(c=>c.pos)){const p=point(c);projected.set(p.x,.6,p.z).project(camera);const el=markers.get(c.id);el.style.left=(projected.x*.5+.5)*stage.clientWidth+'px';el.style.top=(-projected.y*.5+.5)*stage.clientHeight+'px';const closeToPlayer=adventure?.player&&Math.hypot(adventure.player.position.x-p.x,adventure.player.position.z-p.z)<4;el.style.visibility=projected.z>1||projected.z< -1||closeToPlayer?'hidden':'visible';}}
  else{const w=stage.clientWidth*.9,h=stage.clientHeight*.8,s=Math.min(w/1384,h/1136),iw=1384*s,ih=1136*s;for(const c of cities.filter(c=>c.pos)){const el=markers.get(c.id);el.style.left=((stage.clientWidth-iw)/2+c.pos[0]*iw)+'px';el.style.top=((stage.clientHeight-ih)/2+c.pos[1]*ih)+'px';}}
}
async function initWorld(){
  try{
    THREE=await import('three');const {OrbitControls}=await import('./vendor/OrbitControls.js');
    renderer=new THREE.WebGLRenderer({canvas:$('#world'),antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(stage.clientWidth,stage.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;
    scene=new THREE.Scene();worldRoot=new THREE.Group();scene.add(worldRoot);camera=new THREE.PerspectiveCamera(44,stage.clientWidth/stage.clientHeight,1,1500);
    controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=!reduced;controls.dampingFactor=.09;controls.minDistance=35;controls.maxDistance=600;controls.maxPolarAngle=Math.PI*.45;controls.minPolarAngle=.001;controls.screenSpacePanning=false;
    controls.addEventListener('start',()=>{tween=null;});
    const texture=await new THREE.TextureLoader().loadAsync('assets/world-map.png');texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
    const map=new THREE.Mesh(new THREE.PlaneGeometry(138,113.27),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));map.rotation.x=-Math.PI/2;worldRoot.add(map);worldGround=map;
    const base=new THREE.Mesh(new THREE.BoxGeometry(138.5,1.5,113.77),new THREE.MeshStandardMaterial({color:0x766343,roughness:.8}));base.position.y=-1.5;worldRoot.add(base);
    scene.add(new THREE.HemisphereLight(0xdff4ff,0x667052,2));const light=new THREE.DirectionalLight(0xffe5af,2.6);light.position.set(-45,85,35);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-170,right:170,top:170,bottom:-170,near:1,far:440});light.shadow.bias=-.0004;light.shadow.normalBias=.04;scene.add(light);renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    for(const c of cities.filter(c=>c.pos)){
      const p=point(c),group=new THREE.Group();group.position.set(p.x,.1,p.z);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.95,.09,6,32),new THREE.MeshBasicMaterial({color:0xf1d294}));ring.rotation.x=Math.PI/2;ring.position.y=.1;group.add(ring);
      const tower=new THREE.Mesh(new THREE.OctahedronGeometry(.55),new THREE.MeshStandardMaterial({color:0xffe7ae,metalness:.6,roughness:.2,emissive:0xb08b37,emissiveIntensity:.5}));tower.position.y=1.35;group.add(tower);
      const stem=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,1.4,6),new THREE.MeshBasicMaterial({color:0xd6b779}));stem.position.y=.7;group.add(stem);worldRoot.add(group);beacons.set(c.id,group);
    }
    ready=true;resetView();renderList();
    try{
      const {Adventure}=await import('./adventure.js');
      adventure=new Adventure({scene,camera,renderer,controls,map,cancelTween:()=>tween=null,focus:p=>{tween=null;const target=new THREE.Vector3(p.x,0,p.z),distance=mode==='city'?(stage.clientWidth<700?32:28):(stage.clientWidth<700?42:36);moveTo(target,new THREE.Vector3(p.x,flat?distance:distance*(mode==='city'?.90:.72),p.z+(flat?.01:distance*(mode==='city'?.47:.8))));}});
      $('#enter-adventure').disabled=false;$('#enter-adventure').onclick=()=>adventure.openChooser();
      $('#city-entry').disabled=false;
    }catch(error){console.warn('Character setup unavailable.',error);$('#adventure-status').textContent='人物暫時無法載入，仍可瀏覽城市地圖';}
    function frame(time){
      requestAnimationFrame(frame);if(document.hidden)return;
      if(tween){const t=tween.duration===0?1:Math.min(1,(time-tween.start)/tween.duration),e=1-Math.pow(1-t,3);camera.position.lerpVectors(tween.from,tween.to,e);controls.target.lerpVectors(tween.targetFrom,tween.targetTo,e);if(t===1)tween=null;}
      if(mode==='city')cityWorld?.update(time,camera);adventure?.update(time);controls.update();renderer.render(scene,camera);updateMarkers();
    }requestAnimationFrame(frame);
  }catch(error){
    console.warn('3D view unavailable; using the accessible flat map.',error);renderer?.dispose();camera=null;stage.classList.add('fallback');flat=true;$('#view').textContent='2D';$('#view').setAttribute('aria-pressed','false');$('#gesture').textContent='點選城市標記或城市索引';for(const id of ['zoom-in','zoom-out','view']){$('#'+id).disabled=true;$('#'+id).title='目前以平面地圖顯示';}updateMarkers();
  }finally{$('#loading').hidden=true;const params=new URLSearchParams(location.hash.slice(1)),city=cities.find(c=>c.id===params.get('city'));if(city)selectCity(city);if(params.get('view')==='interior')enterProntera();}
}
async function enterProntera(){
  if(mode==='city'||enteringCity||!ready||!adventure)return;enteringCity=true;
  const entry=$('#city-entry');entry.disabled=true;entry.textContent='正在開啟城門…';
  try{
    if(!cityWorld){const {createProntera}=await import('./prontera.js');cityWorld=createProntera();scene.add(cityWorld.group);buildCityGuide();}
    returnPosition=adventure.player?.position.clone()||new THREE.Vector3(18.492,.15,9.741);closeCard();mode='city';flat=false;$('#view').textContent='3D';$('#view').setAttribute('aria-pressed','true');controls.enableRotate=true;controls.minDistance=15;controls.maxDistance=720;
    worldRoot.visible=false;cityWorld.group.visible=true;cityWorld.labels.visible=showLabels;renderer.shadowMap.enabled=true;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;scene.background=new THREE.Color(0xc9dcda);scene.fog=new THREE.Fog(0xc9dcda,660,1400);
    document.body.classList.add('city-mode');$('#menu').textContent='☰ 城內導覽';$('#menu').setAttribute('aria-label','展開城內導覽');$('#world').setAttribute('aria-label','普隆德拉立體城內場景');$('#region-title').textContent='普隆德拉・城內';$('#map-caption').textContent='依配置圖重建・風格化普隆德拉';$('#gesture').textContent='點選街道行走 · WASD / 方向鍵';$('#city-guide').hidden=false;
    adventure.setEnvironment({map:cityWorld.ground,navigation:cityWorld.navigation,spawn:cityWorld.spawn,speed:12});adventure.setFollow(false);resetView();
    $('#adventure-status').textContent='點選街道行走 · 建築會自動繞行';entry.textContent='← 返回世界地圖';entry.disabled=false;
    history.replaceState(null,'','#city=prontera&view=interior');if(!adventure.player)adventure.openChooser();
  }catch(error){console.error('Could not open Prontera.',error);entry.textContent='重新進入普隆德拉';entry.disabled=false;$('#adventure-status').textContent='城內暫時無法開啟，請再試一次';}finally{enteringCity=false;}
}
function leaveProntera(){
  if(mode!=='city')return;mode='world';worldRoot.visible=true;cityWorld.group.visible=false;renderer.shadowMap.enabled=false;scene.background=null;scene.fog=null;controls.minDistance=35;controls.maxDistance=600;
  document.body.classList.remove('city-mode');$('#city-guide').hidden=true;$('#landmark-walk-mobile').hidden=true;$('#menu').textContent='☰ 城市索引';$('#menu').setAttribute('aria-label','展開城市索引');$('#world').setAttribute('aria-label','可旋轉與縮放的城市世界地圖');$('#map-caption').textContent='城市位置為設計草案，待逐一確認';$('#gesture').textContent='拖曳旋轉 · 滾輪縮放 · 右鍵平移';$('#city-entry').textContent='進入普隆德拉 3D →';
  adventure.setEnvironment({map:worldGround,spawn:returnPosition});adventure.setFollow(true);$('#adventure-status').textContent='點選地圖移動 · WASD / 方向鍵';chooseRegion(region);selectCity(cities.find(c=>c.id==='prontera'));
}
function buildCityGuide(){
  const nav=$('#city-landmarks');for(const landmark of cityWorld.landmarks){const button=document.createElement('button');button.className='landmark-button';button.innerHTML=`<span>${landmark.name}<small>${landmark.desc}</small></span><b>↗</b>`;button.onclick=()=>{document.body.classList.remove('menu-open');$('#menu').setAttribute('aria-expanded','false');for(const b of nav.children)b.classList.toggle('active',b===button);adventure.keys.clear();adventure.target=null;adventure.waypoints=[];adventure.setFollow(false);const p=landmark.look;moveTo(new THREE.Vector3(p.x,0,p.z),new THREE.Vector3(p.x+40,66,p.z+70));for(const selector of ['#landmark-walk','#landmark-walk-mobile']){const walk=$(selector);walk.hidden=!adventure.player;walk.textContent=`步行前往${landmark.name} →`;walk.onclick=()=>{adventure.goTo(landmark.walk);adventure.focusPlayer();};}};nav.append(button);}
}
$('#search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderList();});
$('#home').onclick=()=>{if(mode==='city'){adventure.setFollow(false);resetView();return;}closeCard();chooseRegion('all');query='';$('#search').value='';renderList();resetView();};
$('#zoom-in').onclick=()=>zoom(.8);$('#zoom-out').onclick=()=>zoom(1.25);
$('#view').onclick=()=>{flat=!flat;$('#view').textContent=flat?'2D':'3D';$('#view').setAttribute('aria-pressed',String(!flat));if(controls)controls.enableRotate=!flat;resetView();};
$('#labels').onclick=()=>{showLabels=!showLabels;markerLayer.classList.toggle('no-labels',!showLabels);if(cityWorld)cityWorld.labels.visible=showLabels;$('#labels').setAttribute('aria-pressed',String(showLabels));};
$('#menu').onclick=()=>{const open=document.body.classList.toggle('menu-open');$('#menu').setAttribute('aria-expanded',String(open));};
$('#notes-open').onclick=()=>$('#notes').showModal();$('#notes-close').onclick=()=>$('#notes').close();
$('#interior-close').onclick=()=>$('#interior-dialog').close();
$('#city-entry').onclick=()=>mode==='city'?leaveProntera():enterProntera();$('#city-reference').onclick=()=>$('#interior-dialog').showModal();$('#reference-enter').onclick=()=>{$('#interior-dialog').close();enterProntera();};
document.addEventListener('keydown',e=>{if(e.key==='/'&&mode==='world'&&document.activeElement!==$('#search')&&!document.querySelector('dialog[open]')){e.preventDefault();document.body.classList.add('menu-open');$('#menu').setAttribute('aria-expanded','true');$('#search').focus();}if(e.key==='Escape'){document.body.classList.remove('menu-open');$('#menu').setAttribute('aria-expanded','false');if(mode==='world')closeCard();}});
new ResizeObserver(()=>{if(renderer&&camera){camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();renderer.setSize(stage.clientWidth,stage.clientHeight);if(ready){if(mode==='city'&&!adventure?.following)resetView();else if(adventure?.player)adventure.focusPlayer();else if(selected?.pos)focus(selected);else resetView();}}updateMarkers();}).observe(stage);
stage.addEventListener('pointerdown',e=>{if(e.target.closest('#menu'))return;document.body.classList.remove('menu-open');$('#menu').setAttribute('aria-expanded','false');});
renderList();initWorld();
