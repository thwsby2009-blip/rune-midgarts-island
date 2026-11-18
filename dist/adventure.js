import * as T from 'three';
import {jobs,createCharacter,disposeCharacter} from './characters.js';

export class Adventure {
  constructor({scene,camera,renderer,controls,map,focus,cancelTween}){
    Object.assign(this,{scene,camera,renderer,controls,map,focus,cancelTween});
    this.keys=new Set();this.target=null;this.waypoints=[];this.navigation=null;this.bounds={minX:-67,maxX:67,minZ:-55,maxZ:55};this.player=null;this.job=null;this.draft=jobs[0];this.following=true;this.time=0;this.last=0;this.position=new T.Vector3(18.492,.15,9.741);this.speed=7;
    this.abort=new AbortController();this.signal=this.abort.signal;
    this.buildChooser();this.bindInput();
    document.querySelector('#choose-job').onclick=()=>this.openChooser();
    document.querySelector('#follow-player').onclick=()=>{this.setFollow(true);this.focusPlayer();};
    document.querySelector('#stop-player').onclick=()=>{this.target=null;this.waypoints=[];this.keys.clear();this.updateStatus('已停下腳步');};
    document.querySelector('#adventure-status').textContent='六種職業已準備就緒';
    let saved;try{saved=localStorage.getItem('wonder-island-job');}catch{}
    const previous=jobs.find(j=>j.id===saved);
    if(previous){this.pick(previous);this.focusPlayer();this.updateStatus('歡迎回到仙境傳說島');}else this.openChooser();
  }
  buildChooser(){
    const grid=document.querySelector('#job-options');
    for(const job of jobs){
      const b=document.createElement('button');b.type='button';b.className='job-option';b.dataset.job=job.id;b.setAttribute('role','radio');b.setAttribute('aria-checked',String(job.id===this.draft.id));b.style.setProperty('--job-color',job.color);b.innerHTML=`<div class="portrait"><img alt="${job.name} Q版人物" width="200" height="230"></div><span class="job-symbol">${job.symbol}</span><strong>${job.name}</strong><small>${job.en}</small><span class="choice-tick" aria-hidden="true">✓</span>`;b.onclick=()=>this.selectDraft(job);grid.append(b);
    }
    this.selectDraft(this.draft);
    grid.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const index=jobs.indexOf(this.draft),delta=['ArrowLeft','ArrowUp'].includes(e.key)?-1:1;this.selectDraft(jobs[(index+delta+jobs.length)%jobs.length]);grid.querySelector('[aria-checked="true"]').focus();});
    document.querySelector('#start-adventure').onclick=()=>{this.pick(this.draft);document.querySelector('#job-dialog').close();this.focusPlayer();};
    document.querySelector('#job-dialog').addEventListener('close',()=>this.keys.clear());
    // Render each thumbnail with the same real model used on the world map.
    const portraitRenderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});portraitRenderer.setSize(200,230);portraitRenderer.setPixelRatio(Math.min(devicePixelRatio,1.5));portraitRenderer.outputColorSpace=T.SRGBColorSpace;
    const portraitScene=new T.Scene();portraitScene.add(new T.HemisphereLight(0xe9f4ff,0x8c786b,2.7));
    const key=new T.DirectionalLight(0xffe6bd,3);key.position.set(-3,6,5);portraitScene.add(key);
    const cam=new T.PerspectiveCamera(34,200/230,.1,30);cam.position.set(3.4,3.4,7.8);cam.lookAt(0,2.12,0);
    for(const job of jobs){const model=createCharacter(job.id);portraitScene.add(model);portraitRenderer.render(portraitScene,cam);const url=portraitRenderer.domElement.toDataURL('image/png');document.querySelector(`[data-job="${job.id}"] img`).src=url;job.portrait=url;portraitScene.remove(model);disposeCharacter(model);}
    portraitRenderer.dispose();
  }
  selectDraft(job){this.draft=job;for(const b of document.querySelectorAll('.job-option')){const active=b.dataset.job===job.id;b.setAttribute('aria-checked',String(active));b.tabIndex=active?0:-1;}document.querySelector('#job-description').textContent=job.detail;document.querySelector('#job-motto').textContent=job.motto;document.querySelector('#start-adventure').textContent=`以${job.name}的身分出發 →`;}
  openChooser(){this.keys.clear();this.target=null;this.waypoints=[];const d=document.querySelector('#job-dialog');if(this.job)this.selectDraft(this.job);if(!d.open)d.showModal();d.querySelector('[aria-checked="true"]').focus();}
  pick(job){
    if(this.player){this.position.copy(this.player.position);this.scene.remove(this.player);disposeCharacter(this.player);}
    this.player=createCharacter(job.id);this.player.position.copy(this.position);this.player.rotation.y=.1;this.scene.add(this.player);this.job=job;
    document.querySelector('#player-hud').hidden=false;document.querySelector('#walk-pad').hidden=false;document.querySelector('#player-label').hidden=false;
    document.querySelector('#player-name').textContent=job.name;document.querySelector('#player-label').textContent=`${job.symbol} ${job.name}冒險者`;document.querySelector('#player-label').style.setProperty('--job-color',job.color);
    document.querySelector('#player-portrait').src=job.portrait;document.querySelector('#player-portrait').alt=`目前角色：${job.name}`;
    document.querySelector('#adventure-status').textContent=this.navigation?'點選街道行走 · 建築會自動繞行':'點選地圖移動 · WASD / 方向鍵';document.body.classList.add('adventuring');
    try{localStorage.setItem('wonder-island-job',job.id);}catch{}
    this.setFollow(true);this.updateStatus('準備出發');
  }
  setFollow(value){this.following=value;document.querySelector('#follow-player').setAttribute('aria-pressed',String(value));}
  focusPlayer(){if(this.player)this.focus(this.player.position);}
  updateStatus(text){const status=document.querySelector('#player-status');if(status.textContent!==text)status.textContent=text;}
  setEnvironment({map,navigation=null,spawn,speed=7}){this.map=map;this.navigation=navigation;this.bounds=navigation?.bounds||{minX:-67,maxX:67,minZ:-55,maxZ:55};this.speed=speed;this.keys.clear();this.target=null;this.waypoints=[];if(this.destination)this.destination.visible=false;if(spawn){this.position.set(spawn.x,.15,spawn.z);if(this.player){this.player.position.copy(this.position);this.player.rotation.y=0;}}this.last=0;this.updateStatus(navigation?'已進入普隆德拉':'已返回世界地圖');}
  goTo(point){
    if(!this.player)return;const b=this.bounds;const destination={x:T.MathUtils.clamp(point.x,b.minX,b.maxX),z:T.MathUtils.clamp(point.z,b.minZ,b.maxZ)};
    const path=this.navigation?this.navigation.findPath(this.player.position,destination):[destination];this.keys.clear();this.waypoints=[];this.target=null;
    if(!path?.length){this.updateStatus('這裡無法到達，請選擇附近街道');if(this.destination)this.destination.visible=false;return;}
    this.waypoints=path.map(p=>new T.Vector3(p.x,.15,p.z));this.target=this.waypoints.shift();this.setFollow(true);this.updateStatus('正在前往目的地');this.showDestination();
  }
  showDestination(){
    if(!this.destination){const material=new T.MeshBasicMaterial({color:0xf7df98,side:T.DoubleSide,transparent:true,opacity:.9,depthWrite:false});this.destination=new T.Mesh(new T.RingGeometry(.42,.58,32),material);this.destination.rotation.x=-Math.PI/2;this.scene.add(this.destination);}
    this.destination.position.copy(this.waypoints.at(-1)||this.target);this.destination.position.y=.22;this.destination.visible=true;
  }
  bindInput(){
    const options={signal:this.signal};
    const keyName=k=>({ArrowUp:'w',ArrowDown:'s',ArrowLeft:'a',ArrowRight:'d'})[k]||k.toLowerCase();
    window.addEventListener('keydown',e=>{if(!this.player||e.ctrlKey||e.altKey||e.metaKey||e.target.closest('input,textarea,select,[contenteditable="true"]')||document.querySelector('dialog[open]'))return;const k=keyName(e.key);if('wasd'.includes(k)&&k.length===1){e.preventDefault();this.cancelTween();this.keys.add(k);this.target=null;}},options);
    window.addEventListener('keyup',e=>this.keys.delete(keyName(e.key)),options);
    const clear=()=>{this.keys.clear();this.last=0;};window.addEventListener('blur',clear,options);document.addEventListener('visibilitychange',clear,options);
    const canvas=this.renderer.domElement;let down=null;
    canvas.addEventListener('pointerdown',e=>{if(e.button===0)down={x:e.clientX,y:e.clientY,id:e.pointerId};},options);
    canvas.addEventListener('pointerup',e=>{if(!down||down.id!==e.pointerId)return;const click=Math.hypot(e.clientX-down.x,e.clientY-down.y)<6;down=null;if(!click||!this.player||document.querySelector('dialog[open]'))return;const rect=canvas.getBoundingClientRect();const mouse=new T.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);const ray=new T.Raycaster();ray.setFromCamera(mouse,this.camera);const hit=ray.intersectObject(this.map)[0];if(hit){this.cancelTween();this.goTo(hit.point);}},options);
    canvas.addEventListener('pointercancel',()=>down=null,options);this.controls.addEventListener('start',()=>this.setFollow(false));
    for(const button of document.querySelectorAll('[data-walk]')){
      button.addEventListener('pointerdown',e=>{if(!this.player)return;e.preventDefault();button.setPointerCapture(e.pointerId);this.cancelTween();this.keys.add(button.dataset.walk);this.target=null;},options);
      const release=()=>this.keys.delete(button.dataset.walk);button.addEventListener('pointerup',release,options);button.addEventListener('pointercancel',release,options);button.addEventListener('lostpointercapture',release,options);
    }
  }
  update(time){
    const dt=this.last?Math.min(.05,(time-this.last)/1000):0;this.last=time;if(!this.player)return;
    if(document.querySelector('dialog[open]')){this.keys.clear();this.projectLabel();return;}
    const previous=this.player.position.clone(),direction=new T.Vector3();let moving=false;
    if(this.keys.size){
      const forward=new T.Vector3();this.camera.getWorldDirection(forward);forward.y=0;if(forward.lengthSq()<.00001)forward.set(0,0,-1);forward.normalize();const right=forward.clone().cross(new T.Vector3(0,1,0));
      if(this.keys.has('w'))direction.add(forward);if(this.keys.has('s'))direction.sub(forward);if(this.keys.has('d'))direction.add(right);if(this.keys.has('a'))direction.sub(right);
    }else if(this.target){direction.subVectors(this.target,this.player.position);direction.y=0;if(direction.length()<this.speed*dt+.08){this.player.position.copy(this.target);this.target=this.waypoints.shift()||null;if(this.target){direction.subVectors(this.target,this.player.position);direction.y=0;}else this.updateStatus('已抵達目的地');} }
    if(direction.lengthSq()>.00001&&(this.target||this.keys.size)){
      direction.normalize();const desired=this.player.position.clone().addScaledVector(direction,this.speed*dt),b=this.bounds;desired.x=T.MathUtils.clamp(desired.x,b.minX,b.maxX);desired.z=T.MathUtils.clamp(desired.z,b.minZ,b.maxZ);
      if(!this.navigation||this.navigation.canWalk(desired.x,desired.z))this.player.position.copy(desired);
      else{if(this.navigation.canWalk(desired.x,this.player.position.z))this.player.position.x=desired.x;if(this.navigation.canWalk(this.player.position.x,desired.z))this.player.position.z=desired.z;}
      moving=this.player.position.distanceToSquared(previous)>.000001;
      if(moving){const targetAngle=Math.atan2(direction.x,direction.z);const diff=Math.atan2(Math.sin(targetAngle-this.player.rotation.y),Math.cos(targetAngle-this.player.rotation.y));this.player.rotation.y+=diff*Math.min(1,dt*12);this.updateStatus('探索中');}
    }
    if(this.destination)this.destination.visible=Boolean(this.target);
    const data=this.player.userData;this.time+=moving?dt*11:0;const swing=moving?Math.sin(this.time)*.55:0;
    data.legs[0].rotation.x=swing;data.legs[1].rotation.x=-swing;data.arms[0].rotation.x=-swing*.6;data.arms[1].rotation.x=swing*.6;data.rig.position.y=moving?Math.abs(Math.sin(this.time))*.09:0;
    if(!moving&&!this.target&&document.querySelector('#player-status').textContent==='探索中')this.updateStatus('暫停腳步');
    if(this.following){const delta=this.player.position.clone().sub(previous);this.camera.position.add(delta);this.controls.target.add(delta);}
    this.projectLabel();
  }
  projectLabel(){const p=this.player.position.clone();p.y+=4.55;p.project(this.camera);const rect=this.renderer.domElement.getBoundingClientRect(),label=document.querySelector('#player-label');label.style.left=(p.x*.5+.5)*rect.width+'px';label.style.top=(-p.y*.5+.5)*rect.height+'px';label.style.visibility=p.z<1&&p.z> -1?'visible':'hidden';}
}
