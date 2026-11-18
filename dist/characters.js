import * as T from 'three';

export const jobs=[
  {id:'swordsman',name:'劍士',en:'Swordsman',color:'#e3766d',hair:0xd99a50,coat:0xf5f0e3,trim:0xa73b35,detail:'暖金短髮・白色騎士服・長劍與盾牌',motto:'握緊長劍，勇敢踏出第一步。',symbol:'⚔'},
  {id:'mage',name:'魔法師',en:'Mage',color:'#80b3e6',hair:0x24252c,coat:0x963c3d,trim:0xe5cd92,detail:'黑色短髮・高領披肩・水晶法杖',motto:'讓星光照亮未知的旅途。',symbol:'✧'},
  {id:'acolyte',name:'服事',en:'Acolyte',color:'#9ec788',hair:0xd58b70,coat:0xf1e7d1,trim:0x6d493b,detail:'蜜桃短髮・白色領巾・聖典與十字飾',motto:'帶著祝福，陪伴每一段冒險。',symbol:'♡'},
  {id:'thief',name:'盜賊',en:'Thief',color:'#b68bce',hair:0xa3363b,coat:0x9f6450,trim:0x583b43,detail:'酒紅短髮・棕色皮甲・輕巧雙匕首',motto:'輕巧的腳步，藏著大大的好奇心。',symbol:'☾'},
  {id:'archer',name:'弓箭手',en:'Archer',color:'#d5bc66',hair:0xd3ad65,coat:0x735644,trim:0x573943,detail:'亞麻金髮・棗紅圍巾・木弓與箭筒',motto:'迎著風，尋找遠方的風景。',symbol:'⌁'},
  {id:'merchant',name:'商人',en:'Merchant',color:'#d9a169',hair:0x805334,coat:0xf0e7cc,trim:0x71503a,detail:'栗色短髮・毛邊背心・旅行背包',motto:'背起行囊，把故事帶往下一座城。',symbol:'♧'}
];

// Original code-native chibi models inspired by the supplied clothing and hair reference.
// All meshes are shared by preview and the controllable world character.
export function createCharacter(id){
  const job=jobs.find(j=>j.id===id)||jobs[0],root=new T.Group(),rig=new T.Group();root.add(rig);
  const mats={};const mat=(color)=>mats[color]??=new T.MeshStandardMaterial({color,roughness:.78});
  function part(parent,geo,color,x=0,y=0,z=0){const m=new T.Mesh(geo,mat(color));m.position.set(x,y,z);parent.add(m);return m;}
  const ball=(p,c,x,y,z,sx,sy=sx,sz=sx)=>{const m=part(p,new T.SphereGeometry(1,20,14),c,x,y,z);m.scale.set(sx,sy,sz);return m;};
  const box=(p,c,x,y,z,sx,sy,sz)=>part(p,new T.BoxGeometry(sx,sy,sz),c,x,y,z);
  const cylinder=(p,c,x,y,z,rt,rb,h,n=14)=>part(p,new T.CylinderGeometry(rt,rb,h,n),c,x,y,z);
  const limb=(x)=>{const g=new T.Group();g.position.set(x,1.10,0);rig.add(g);return g;};
  const legs=[limb(-.27),limb(.27)];
  for(const g of legs){box(g,job.trim,0,-.43,0,.38,.72,.38);ball(g,0x453b36,0,-.85,.1,.26,.22,.37);}
  cylinder(rig,job.coat,0,1.67,0,.48,.61,1.15);cylinder(rig,job.trim,0,1.34,0,.565,.58,.17);
  box(rig,0xd8b467,0,1.34,.565,.23,.18,.06);
  const arms=[new T.Group(),new T.Group()];arms[0].position.set(-.58,2.05,0);arms[1].position.set(.58,2.05,0);rig.add(...arms);
  for(let i=0;i<2;i++){const g=arms[i];g.rotation.z=i===0?-.2:.2;ball(g,job.coat,0,-.21,0,.24,.4,.25);ball(g,0xf5c9aa,0,-.65,.04,.20,.22,.20);}
  cylinder(rig,0xf5c9aa,0,2.34,0,.2,.2,.3);
  // Three-head proportions, wide face, tiny nose, glossy eyes and rosy cheeks.
  const head=new T.Group();head.position.y=3.18;rig.add(head);
  ball(head,0xf5d1b1,0,0,0,.94,.89,.82);
  for(const x of [-.91,.91])ball(head,0xeebb9e,x,-.02,0,.16,.22,.17);
  for(const x of [-.32,.32]){ball(head,0xfffcf3,x,-.05,.73,.21,.27,.10);ball(head,0x42342c,x,-.045,.815,.135,.205,.055);ball(head,0xffffff,x-.035,.045,.86,.045,.064,.018);ball(head,0xeaa38e,x*1.65,-.31,.69,.16,.075,.035);}
  ball(head,0xe6b391,0,-.27,.81,.075,.065,.055);
  const mouth=new T.Mesh(new T.TorusGeometry(.095,.018,6,18,Math.PI),mat(0xa36358));mouth.rotation.z=Math.PI;mouth.position.set(0,-.39,.76);head.add(mouth);
  ball(head,job.hair,0,.38,-.10,.97,.65,.83);
  // Uneven tapered hair locks retain the silhouette of each reference profession.
  for(let i=0;i<7;i++){const x=(i-3)*.255,y=.44+(i%2)*.13;const lock=part(head,new T.ConeGeometry(.23,.70+(i%3)*.10,5),job.hair,x,y,.58-Math.abs(x)*.1);lock.rotation.z=Math.PI+(i-3)*.15;lock.rotation.x=-.16;}
  for(const x of [-.84,.84]){const lock=ball(head,job.hair,x,.03,.12,.20,.46,.34);lock.rotation.z=x*.15;}
  const top=part(head,new T.ConeGeometry(.20,.55,5),job.hair,.23,1.02,-.08);top.rotation.z=-.65;
  const scarf=cylinder(rig,job.trim,0,2.20,0,.52,.54,.22);scarf.scale.z=.78;
  function sword(parent,x,z,small=false){const g=new T.Group();g.position.set(x,-.65,z);parent.add(g);const s=small?.58:1;box(g,0xe0e7e4,0,.84*s,0,.18*s,1.2*s,.09*s);const tip=part(g,new T.ConeGeometry(.128*s,.3*s,4),0xe0e7e4,0,1.59*s,0);tip.rotation.y=Math.PI/4;box(g,0xd9b666,0,.20*s,0,.57*s,.11*s,.15*s);cylinder(g,0x5b3e35,0,0,0,.07*s,.07*s,.38*s);g.rotation.x=.15;return g;}
  if(id==='swordsman'){
    sword(arms[1],.05,.25);const shield=ball(arms[0],0xb8c7cc,-.02,-.48,.31,.43,.59,.12);box(shield,0xd2b76f,0,0,1,.12,.9,.1);box(rig,0xe0d9c6,0,1.9,.49,.56,.44,.11);
    for(const x of [-.58,.58])ball(rig,0xe2ded3,x,2.03,0,.33,.18,.32);
  }else if(id==='mage'){
    const cape=part(rig,new T.ConeGeometry(.82,1.48,12,1,true),0x4f3844,0,1.52,-.23);cape.scale.z=.65;
    const collar=part(rig,new T.ConeGeometry(.73,.49,5,1,true),0xe3d6b2,0,2.35,-.13);collar.rotation.z=Math.PI;collar.scale.z=.6;
    arms[1].rotation.z=.55;
    cylinder(rig,0x77543e,1.12,1.9,.52,.065,.065,2.7);const jewel=part(rig,new T.OctahedronGeometry(.30),0x88d2ed,1.12,3.4,.52);jewel.material.emissive.set(0x278cb2);jewel.material.emissiveIntensity=.5;jewel.material.roughness=.2;
    ball(rig,0xd5b464,0,2.12,.47,.14,.14,.06);
  }else if(id==='acolyte'){
    box(rig,0xfdf7e5,0,2.08,.44,.72,.46,.12);
    const book=box(arms[0],0x654738,-.02,-.48,.35,.58,.75,.23);book.rotation.z=-.17;box(book,0xe6d7aa,0,0,.13,.46,.63,.02);box(book,0xad8545,0,0,.15,.07,.35,.025);box(book,0xad8545,0,.04,.16,.26,.065,.025);
    box(rig,0xb49b5f,.15,1.87,.52,.06,.23,.04);box(rig,0xb49b5f,.15,1.91,.53,.18,.05,.04);
  }else if(id==='thief'){
    sword(arms[0],-.1,.19,true).rotation.z=-.35;sword(arms[1],.1,.19,true).rotation.z=.35;
    for(const x of [-.22,.22])box(rig,0x624333,x,1.32,.51,.27,.31,.15);
    box(rig,0xdec491,0,1.96,.48,.12,.57,.08);ball(rig,0xd6b987,-.6,2.13,0,.29,.18,.30);
  }else if(id==='archer'){
    box(rig,0x683d44,-.21,1.92,.51,.23,.9,.12).rotation.z=-.22;
    const bow=new T.Group();bow.position.set(-.12,-.24,.36);arms[0].add(bow);
    const curve=new T.EllipseCurve(0,0,.43,.94,-Math.PI/2,Math.PI/2,false,0);const points=curve.getPoints(24).map(p=>new T.Vector3(p.x,p.y,0));bow.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),28,.065,6,false),mat(0xba8f50)));
    const string=new T.BufferGeometry().setFromPoints([new T.Vector3(0,-.94,0),new T.Vector3(0,.94,0)]);bow.add(new T.Line(string,new T.LineBasicMaterial({color:0xe3dcc8})));
    const quiver=cylinder(rig,0x4d3c32,.48,1.9,-.48,.19,.19,.9);quiver.rotation.z=-.25;
    for(let i=0;i<3;i++)cylinder(rig,0xd5bf81,.35+i*.1,2.55,-.48,.025,.025,.70);
  }else if(id==='merchant'){
    for(const x of [-.37,.37])box(rig,job.trim,x,1.85,.36,.21,.8,.28);
    for(const x of [-.61,.61])ball(rig,0xfdf5dc,x,2.02,0,.27,.28,.30);
    // A generous travel backpack, with a flap, pocket, shoulder straps and bedroll.
    const pack=new T.Group();pack.position.set(0,1.75,-.61);rig.add(pack);
    box(pack,0xa7794d,0,0,-.22,1.12,1.12,.66);
    ball(pack,0xb98b58,0,.47,-.24,.58,.22,.36);
    box(pack,0x755038,0,-.20,-.59,.65,.47,.14);
    box(pack,0xd0a16b,0,.32,-.59,1.04,.34,.12);
    for(const x of [-.34,.34]){
      box(pack,0x62422f,x,.03,-.65,.11,.90,.07);
      box(pack,0xe0bb70,x,.04,-.70,.19,.19,.055);
      box(pack,0x62422f,x,.04,-.735,.09,.09,.02);
      box(rig,0x9e7348,x,1.87,.48,.12,.91,.10);
      const shoulder=box(rig,0x9e7348,x,2.23,-.02,.14,.12,1.08);shoulder.rotation.x=.12;
    }
    const bedroll=cylinder(pack,0x8b9b78,0,.73,-.26,.19,.19,1.30);bedroll.rotation.z=Math.PI/2;
    for(const x of [-.38,.38]){const tie=part(pack,new T.TorusGeometry(.195,.035,6,16),0x65503a,x,.73,-.26);tie.rotation.y=Math.PI/2;}
    const bag=ball(arms[1],0x976337,.05,-.7,.30,.34,.43,.28);cylinder(bag,0xe2bc68,0,.42,0,.09,.12,.12);
    for(const x of [-.32,.32])box(rig,0xe7bf69,x,1.79,.54,.065,.07,.04);
  }
  const ring=new T.Mesh(new T.RingGeometry(.75,.89,40),new T.MeshBasicMaterial({color:job.color,transparent:true,opacity:.85,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.025;root.add(ring);
  const shadow=new T.Mesh(new T.CircleGeometry(.82,32),new T.MeshBasicMaterial({color:0x081523,transparent:true,opacity:.23,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.018;root.add(shadow);
  root.userData={rig,legs,arms,head,ring,job};return root;
}

export function disposeCharacter(root){root.traverse(o=>{o.geometry?.dispose();});const materials=new Set();root.traverse(o=>{if(o.material)materials.add(o.material);});for(const m of materials)m.dispose();}
