import * as T from 'three';
import {createNavigation} from './navigation.js';

// A stylized reconstruction of the supplied annotated layout, not a game asset extraction.
// 普隆德拉地基放大倍率（第 0 步：整城等比例放大約 2 倍）。
// 縮放套在 group 上；合併幾何用 1× 世界矩陣烘焙，group.scale 必須放在合併之後，否則合併網格會被放大兩次。
const S=2;
export function createProntera(){
  const group=new T.Group(),labels=new T.Group(),obstacles=[],animated=[];group.add(labels);
  const labelWorld=new T.Vector3();
  const materials=new Map();
  const material=(color)=>{if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.88}));return materials.get(color);};
  function mesh(geometry,color,x,y,z,parent=group){const m=new T.Mesh(geometry,typeof color==='number'?material(color):color);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  const box=(x,y,z,w,h,d,c,p)=>mesh(new T.BoxGeometry(w,h,d),c,x,y,z,p);
  const cylinder=(x,y,z,rt,rb,h,c,n=16,p)=>mesh(new T.CylinderGeometry(rt,rb,h,n),c,x,y,z,p);
  function block(x,z,w,d){obstacles.push({minX:(x-w/2)*S,maxX:(x+w/2)*S,minZ:(z-d/2)*S,maxZ:(z+d/2)*S});}
  function tileTexture(){const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#a39d8a';c.fillRect(0,0,256,256);for(let row=0;row<8;row++)for(let col=-1;col<6;col++){const v=178+((row*17+col*11+90)%31),x=col*51+(row%2)*25;c.fillStyle=`rgb(${v+9},${v+4},${v-9})`;c.fillRect(x+1,row*32+1,49,30);c.fillStyle='#ffffff16';c.fillRect(x+2,row*32+2,46,1);}const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;return texture;}
  const paving=tileTexture();
  function road(x,z,w,d){const tex=paving.clone();tex.needsUpdate=true;tex.repeat.set(w/5,d/5);const m=box(x,.035,z,w,.07,d,new T.MeshStandardMaterial({map:tex,color:0xf2eadb,roughness:1}));m.castShadow=false;return m;}
  box(0,-1.4,0,105,2.4,132,0x8d9c6e);box(0,-2.9,0,109,1.0,136,0x647c6c);
  const ground=mesh(new T.PlaneGeometry(100,126),0xa7b87e,0,0,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
  // 舊占位道路已拆除，道路改由下方「② 道路網」段落自廣場放射統一鋪設。
  // ① 中央噴水池廣場（第 0 步重建第一件）：城市中心點——石板圓廣場＋同心圓環＋放射石帶。
  const plaza=mesh(new T.CylinderGeometry(16,16,.10,64),0xd8d1b8,0,.10,0);plaza.castShadow=false;
  const plazaRim=mesh(new T.TorusGeometry(15.4,.22,6,80),0xa8654f,0,.18,0);plazaRim.rotation.x=Math.PI/2;
  const plazaRing=mesh(new T.TorusGeometry(11,.16,5,72),0xcfc7ae,0,.18,0);plazaRing.rotation.x=Math.PI/2;
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const strip=box(Math.cos(a)*10.8,.18,Math.sin(a)*10.8,.20,.035,9.4,0xb3aa91);strip.rotation.y=Math.PI/2-a;strip.castShadow=false;}

  function roof(x,y,z,w,d,h,color,parent=group){const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,h);shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,curveSegments:1});return mesh(g,color,x,y,z-d/2,parent);}
  function window(x,y,z,w=1,h=1.5,parent=group){box(x,y,z,w+.25,h+.22,.15,0xf2dfb3,parent);box(x,y,z+.09,w,h,.08,0x779a9a,parent);box(x,y,z+.15,.09,h,.03,0x665346,parent);box(x,y,z+.15,w,.09,.03,0x665346,parent);box(x,y-h/2-.12,z+.13,w+.42,.16,.33,0x8a7358,parent);}
  function sign(text,x,y,z,width=7){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#213a3be8';c.fillRect(4,4,504,120);c.strokeStyle='#dbbd7b';c.lineWidth=5;c.strokeRect(7,7,498,114);c.fillStyle='#f9ebca';c.font='500 43px "Microsoft JhengHei",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,65);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false,transparent:true}));s.position.set(x,y,z);s.scale.set(width,width/4,1);labels.add(s);return s;}
  function house(x,z,w=9,d=8,h=6,color=0xd4bd90,roofColor=0x9d5145){
    block(x,z,w+.5,d+.5);const g=new T.Group();g.position.set(x,0,z);group.add(g);
    box(0,.35,0,w+.5,.7,d+.5,0x9e9c8b,g);box(0,h/2+.45,0,w,h,d,color,g);roof(0,h+.45,0,w+1.0,d+1.0,2.8,roofColor,g);
    for(const bx of [-w/2+.12,0,w/2-.12])box(bx,h/2+.45,d/2+.06,.19,h,.15,0x65533d,g);
    for(const y of [.75,h*.53,h+.3]){box(0,y,d/2+.08,w,.18,.16,0x6e5840,g);box(w/2+.06,y,0,.15,.18,d,0x6e5840,g);}
    box(0,1.6,d/2+.15,1.5,2.5,.18,0x685344,g);box(.4,1.6,d/2+.28,.1,.1,.08,0xdbb05e,g);
    for(const bx of [-w*.27,w*.27])window(bx,h*.77,d/2+.13,1.2,1.55,g);
    window(w*.28,1.9,d/2+.13,1.1,1.3,g);
    const chimney=box(w*.29,h+2,-d*.22,1.0,2.4,1.1,0xb6aa92,g);chimney.castShadow=true;
    box(0,h+.35,d/2+.55,w+1.2,.18,.25,0x6e5840,g);
    return g;
  }
  // Buildings flank the axial streets; alleys remain open between the blocks.
  // 廣場內圈四棟舊民房（±13,±17）已配合 ② 道路網的斜向大道拆除（做到哪拆哪）；原址機能建築待第 0 步④重建。
  const houses=[[-37,17,10,9],[37,17,10,9],[-37,-17,10,9],[37,-17,10,9],[-13,43,9,10],[-37,43,10,10],[13,43,9,10],[37,43,10,10],[-37,-43,10,11],[-13,-42,8,9]];
  houses.forEach(([x,z,w,d],i)=>house(x,z,w,d,5.7+(i%3)*.65,[0xe0d2b2,0xdbc399,0xe6dcc3,0xcfc9ae][i%4],[0xa35649,0xa8654f,0x735c64][i%3]));
  // 重建噴水池：加寬石砌水池、陶土色池緣、雙層水盤＋金色頂飾（舊噴水池已拆除）。
  block(0,0,11.6,11.6);
  cylinder(0,.35,0,5.6,5.8,.7,0xb2b3a3,48);cylinder(0,.72,0,5.0,5.0,.28,0x6f9b9e,48);
  const rim=mesh(new T.TorusGeometry(5.35,.32,8,56),0xa8654f,0,.88,0);rim.rotation.x=Math.PI/2;
  cylinder(0,1.5,0,.75,1.0,1.6,0xcdcdb6);cylinder(0,2.55,0,2.5,.9,.75,0xc5c6b2,32);cylinder(0,2.95,0,2.25,2.25,.08,0x5eabb8,32);
  cylinder(0,3.6,0,.4,.45,1.2,0xd5d4bb);const finial=mesh(new T.OctahedronGeometry(.55),0xdac487,0,4.45,0);animated.push({type:'finial',mesh:finial});
  const waterMaterial=new T.MeshStandardMaterial({color:0x92d8e4,transparent:true,opacity:.7,roughness:.2});
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const curve=new T.QuadraticBezierCurve3(new T.Vector3(Math.cos(a)*.8,3.0,Math.sin(a)*.8),new T.Vector3(Math.cos(a)*2.9,4.7,Math.sin(a)*2.9),new T.Vector3(Math.cos(a)*4.1,.95,Math.sin(a)*4.1));mesh(new T.TubeGeometry(curve,18,.055,5,false),waterMaterial,0,0,0);}
  sign('中央噴水池',0,7.0,0,9);
  // 廣場四角石砌花壇（多層次綠意點綴）。
  for(const [px,pz] of [[-11,-11],[11,-11],[-11,11],[11,11]]){box(px,.35,pz,2.2,.7,2.2,0xbaa37c);const shrub=mesh(new T.IcosahedronGeometry(.95,1),0x688b55,px,1.35,pz);shrub.scale.y=1.2;for(let i=0;i<3;i++){const f=mesh(new T.IcosahedronGeometry(.28,0),i%2?0xe8bd66:0xc48a9b,px-.6+i*.6,2.1,pz);f.castShadow=false;}}

  // ② 道路網（第 0 步重建第二件）：自廣場向外放射的主幹道＋街廓，石板鋪面；陶土色路緣與廣場外環呼應。
  function avenue(cx,cz,len,wid,dx,dz){
    const rot=Math.PI/2-Math.atan2(dz,dx),m=road(cx,cz,wid,len);m.rotation.y=rot;
    const px=-dz,pz=dx,off=wid/2-.18;
    for(const s of [-1,1]){const curb=box(cx+px*off*s,.06,cz+pz*off*s,.36,.12,len,0xa8654f);curb.rotation.y=rot;curb.castShadow=false;}
    return m;
  }
  // 東西南北主幹道：自廣場邊緣（r≈15）分別通往王宮階梯、南門、東門、西門。
  avenue(0,-27,24,9,0,-1);
  avenue(0,38.5,47,9,0,1);
  avenue(31.5,0,33,8,1,0);
  avenue(-31.5,0,33,8,-1,0);
  // 四條斜向大道：對齊廣場 8 條放射石帶的斜向方向（東北往大教堂前）。
  avenue(20.2,-20.2,26,6,.7071,-.7071);
  avenue(-20.2,-20.2,26,6,-.7071,-.7071);
  avenue(20.2,20.2,26,6,.7071,.7071);
  avenue(-20.2,20.2,26,6,-.7071,.7071);
  // 街廓次幹道：南北向 x=±25、東西向 z=±30；東北段避開大教堂塔樓，改由斜向大道服務。
  road(-25,0,5,113);road(25,14.4,5,84.3);road(0,30,94,4.5);road(-12.5,-30,69,4.5);

  function tower(x,z,r=2.2,h=12,roofColor=0x596e80){
    cylinder(x,h/2,z,r,r+.2,h,0xd2cfb6,16);cylinder(x,h-.4,z,r+.3,r+.3,.7,0xbbbba6,16);
    mesh(new T.ConeGeometry(r+1,4.2,12),roofColor,x,h+1.8,z);
    for(const dx of [-.55,.55])window(x+dx,h*.64,z+r+.01,.42,1.8);
    return {x,z};
  }
  function banner(x,y,z){const pole=cylinder(x,y,z,.06,.06,4,0xb9a671,6);pole.castShadow=false;box(x+.55,y+.4,z,1.0,1.8,.06,0x375b85);box(x+.55,y+.5,z+.04,.12,1.3,.02,0xdabe71);box(x+.55,y+.72,z+.04,.6,.12,.02,0xdabe71);}
  // Royal palace on the north axis.
  block(0,-51,32,18);box(0,5,-51,29,10,16,0xd4d1b8);roof(0,10,-51,30,17,5.4,0x536d85);
  tower(-16,-45,2.7,15);tower(16,-45,2.7,15);tower(-12,-57,2.3,17);tower(12,-57,2.3,17);
  box(0,4.4,-42.8,4.6,8.4,.3,0x6d624f);roof(0,8.5,-42,6,3,2.5,0x536d85);
  for(const x of [-10,-6,6,10])window(x,6,-42.7,1.3,3.4);
  for(let i=0;i<5;i++)box(0,.14+i*.15,-39.1-i*.45,7,.28,1.1,0xc3c2ae);
  banner(-5,8,-42.4);banner(5,8,-42.4);sign('普隆德拉王宮',0,22,-50,13);
  // Cathedral in the north-east quarter: nave, pointed roof, twin bell towers.
  block(33,-43,20,23);box(33,5.3,-43,15.5,10.6,22,0xe2dbc3);roof(33,10.6,-43,16.8,23.2,7,0x687d89);
  tower(25,-32.5,2.25,19,0x667c8a);tower(41,-32.5,2.25,19,0x667c8a);
  box(33,3,-31.85,3.6,5.8,.25,0x81705a);const arch=mesh(new T.TorusGeometry(1.85,.25,6,24,Math.PI),0xc6bda5,33,5.2,-31.6);arch.rotation.z=0;
  const rose=mesh(new T.CircleGeometry(2.2,32),0x6597b3,33,8.7,-31.8);const roseRim=mesh(new T.TorusGeometry(2.25,.17,6,32),0xe5d3a0,33,8.7,-31.6);
  for(let i=0;i<8;i++){const spoke=box(33,8.7,-31.5,.10,4.1,.06,0xe3ca85);spoke.rotation.z=i*Math.PI/4;}
  for(const x of [24.8,41.2]){box(x,24.1,-32.5,.18,2.4,.18,0xd5b769);box(x,24.65,-32.5,1.2,.18,.18,0xd5b769);}
  sign('大教堂',33,27,-41,10);

  // Defensive wall and wide, passable east/west/south gateways.
  const wall=0xbbbca5;
  for(const x of [-49,49])for(const z of [-33,33]){box(x,2.2,z,1.7,4.4,54,wall);block(x,z,1.7,54);for(let q=-25;q<26;q+=3.5)box(x,4.6,z+q,2.0,.9,1.2,wall);}
  for(const x of [-28,28]){box(x,2.2,60,42,4.4,1.7,wall);block(x,60,42,1.7);for(let q=-19;q<=19;q+=3.5)box(x+q,4.6,60,1.3,.9,2.0,wall);}
  box(0,2.1,-62,100,4.2,1.6,wall);
  for(const x of [-49,49])for(const z of [-60,60])tower(x,z,2.7,8.8,0x586f76);
  for(const x of [-7,7]){tower(x,59,2.3,10.8);block(x,59,4.6,4.6);}
  box(0,9,59,12,1.9,2.6,0xc8c7ad);roof(0,10,59,12.5,3.5,2,0x536d85);sign('南門',0,15,59,7);banner(-10,6.3,57);banner(10,6.3,57);
  for(const x of [-49,49])for(const z of [-6,6]){cylinder(x,3,z,1.4,1.6,6,wall,10);block(x,z,2.8,2.8);}

  function tree(x,z,scale=1){
    cylinder(x,1.5*scale,z,.32*scale,.42*scale,3*scale,0x756147,7);
    const canopy=mesh(new T.IcosahedronGeometry(2.1*scale,1),[0x688b55,0x5a8554,0x83a45f][Math.abs(Math.round(x+z))%3],x,3.7*scale,z);canopy.scale.y=1.25;
    block(x,z,.8*scale,.8*scale);
  }
  for(const x of [-43,-31,-19,-7,7,19,31,43])for(const z of [-55,54])if(!(z<0&&Math.abs(x)<20)&&!(z<0&&x>20))tree(x,z,.65+(Math.abs(x)%3)*.08);
  for(const z of [-24,-8,8,24,36,49])for(const x of [-6.2,6.2])if(Math.abs(z)>12)tree(x,z,.58);
  for(const x of [-43,-31])for(const z of [7,-7])tree(x,z,.72);
  function lamp(x,z){cylinder(x,1.55,z,.06,.09,3.1,0x52584d,6);box(x,3.3,z,.5,.7,.5,0xf3d79b);mesh(new T.ConeGeometry(.43,.45,4),0x626958,x,3.84,z);}
  for(const z of [-33,-20,20,33,48])for(const x of [-5.7,5.7])lamp(x,z);
  for(const x of [-33,-19,19,33])for(const z of [-5.2,5.2])lamp(x,z);
  function bench(x,z,angle=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=angle;group.add(g);for(const dz of [-.3,0,.3])box(0,.78,dz,2.7,.12,.22,0x8d7151,g);box(0,1.35,-.42,2.7,.65,.12,0x9c7c56,g);for(const dx of [-1,1])box(dx,.4,0,.16,.8,.75,0x5d6659,g);}
  bench(-9,-8,Math.PI/4);bench(9,-8,-Math.PI/4);bench(-9,8,3*Math.PI/4);bench(9,8,-3*Math.PI/4);
  // Street stalls, barrels, flower planters and the merchant district.
  function stall(x,z,color){block(x,z,4.0,3);box(x,1,z,3.7,2,2.4,0xb39162);for(const dx of [-1.8,1.8])for(const dz of [-1.2,1.2])cylinder(x+dx,1.9,z+dz,.06,.06,3.8,0x806243,6);for(let i=0;i<7;i++){const awning=box(x-1.8+i*.6,3.7,z,.61,.12,3.2,i%2?0xf0e4c8:color);awning.rotation.x=.12;}for(let i=0;i<6;i++)mesh(new T.SphereGeometry(.22,8,6),[0xc38249,0x9fac59,0x9a5a4b][i%3],x-1.35+i*.53,2.22,z+.4);}
  stall(-16,5.8,0xb65d55);stall(16,5.8,0x608a8c);
  for(const x of [-20,20])for(const z of [11,37]){cylinder(x,.7,z,.65,.65,1.4,0x9d7950,10);for(const y of [.3,1.1]){const hoop=mesh(new T.TorusGeometry(.66,.04,4,12),0x555a4d,x,y,z);hoop.rotation.x=Math.PI/2;}}
  for(const x of [-10,10])for(const z of [-11,11]){box(x,.35,z,1.6,.65,1.1,0xbaa37c);for(let i=0;i<5;i++){const f=mesh(new T.IcosahedronGeometry(.32,0),i%2?0xe8bd66:0xc48a9b,x-.55+i*.28,.93,z);f.castShadow=false;}}
  sign('商店街',0,5.5,24,8);sign('旅館',-37,10,17,7);sign('城西花園',-37,6,0,8);
  // Batch static geometry by material so the city stays responsive on small devices.
  group.updateMatrixWorld(true);const batches=new Map(),dynamic=new Set(animated.map(a=>a.mesh));
  group.traverse(o=>{if(!o.isMesh||o===ground||dynamic.has(o)||o.material.transparent)return;const key=o.material.uuid+':'+o.castShadow+':'+o.receiveShadow;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);});
  for(const objects of batches.values()){
    if(objects.length<2)continue;const parts=objects.map(o=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);return g;});
    const geometry=new T.BufferGeometry();for(const attribute of ['position','normal','uv']){if(!parts.every(g=>g.attributes[attribute]))continue;const size=parts.reduce((n,g)=>n+g.attributes[attribute].array.length,0),array=new Float32Array(size);let offset=0;for(const g of parts){array.set(g.attributes[attribute].array,offset);offset+=g.attributes[attribute].array.length;}geometry.setAttribute(attribute,new T.BufferAttribute(array,parts[0].attributes[attribute].itemSize));}
    geometry.computeBoundingSphere();const merged=new T.Mesh(geometry,objects[0].material);merged.castShadow=objects[0].castShadow;merged.receiveShadow=objects[0].receiveShadow;group.add(merged);
    for(const o of objects){o.removeFromParent();o.geometry.dispose();}for(const p of parts)p.dispose();
  }
  group.scale.setScalar(S);
  const navigation=createNavigation({minX:-94,maxX:94,minZ:-114,maxZ:114,step:2.8,obstacles});
  const landmarks=[
    {id:'fountain',name:'中央噴水池',desc:'中央廣場與城市交會點',look:{x:0,z:0},walk:{x:0,z:9}},
    {id:'palace',name:'王宮大道',desc:'沿主幹道向北，前往王宮',look:{x:0,z:-45},walk:{x:0,z:-35}},
    {id:'cathedral',name:'大教堂',desc:'雙鐘塔與彩色玫瑰窗',look:{x:33,z:-40},walk:{x:33,z:-28}},
    {id:'market',name:'商店街',desc:'道具店、武器店與市集攤位',look:{x:0,z:18},walk:{x:0,z:25}},
    {id:'garden',name:'城西花園',desc:'樹蔭、長椅與西側街區',look:{x:-36,z:0},walk:{x:-35,z:0}},
    {id:'south-gate',name:'南門',desc:'從城門出發，探索普隆德拉',look:{x:0,z:55},walk:{x:0,z:51}}
  ];
  return {group,ground,labels,navigation,landmarks:landmarks.map(l=>({...l,look:{x:l.look.x*S,z:l.look.z*S},walk:{x:l.walk.x*S,z:l.walk.z*S}})),spawn:{x:0,y:.15,z:47*S},update(time,camera){finial.rotation.y=time*.00025;if(camera)for(const label of labels.children){label.getWorldPosition(labelWorld);label.visible=camera.position.distanceTo(labelWorld)>23*S;}}};
}
