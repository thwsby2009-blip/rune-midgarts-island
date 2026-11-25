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
  // 原 (37,-43) 舊民房位於大教堂用地內，已配合第 0 步③拆除。
  const houses=[[-37,17,10,9],[37,17,10,9],[-37,-17,10,9],[37,-17,10,9],[-13,43,9,10],[-37,43,10,10],[13,43,9,10],[37,43,10,10],[-13,-42,8,9]];
  houses.forEach(([x,z,w,d],i)=>house(x,z,w,d,5.7+(i%3)*.65,[0xe0d2b2,0xdbc399,0xe6dcc3,0xcfc9ae][i%4],[0xa35649,0xa8654f,0x735c64][i%3]));
  // 重建噴水池：雙層水盤雕柱噴泉、陶土與米白石材層疊收邊、四角綠意花台與四向湧泉（舊噴水池已拆除）。
  block(0,0,11.6,11.6);
  let fountainFlow=null; // 流動水（粒子＋漣漪）的每幀更新，由下方區塊建立、尾端 update() 呼叫（比照 finial 模式）。
  {
    // 流動水：先收集各組水弧路徑，區塊尾端再據此建立粒子系統。
    const jetPaths = [];
    const fStoneLight = new T.MeshStandardMaterial({ color: 0xe2dcc6, roughness: 0.84 });
    const fStoneMid = new T.MeshStandardMaterial({ color: 0xc9c7b2, roughness: 0.88 });
    const fStoneDark = new T.MeshStandardMaterial({ color: 0xaeaf9e, roughness: 0.92 });
    const fTerracotta = new T.MeshStandardMaterial({ color: 0xa8654f, roughness: 0.82 });
    const fTerracottaDark = new T.MeshStandardMaterial({ color: 0x8e513d, roughness: 0.86 });
    const fPoolFloor = new T.MeshStandardMaterial({ color: 0x4b777b, roughness: 0.78 });
    const fGold = new T.MeshStandardMaterial({ color: 0xdac487, roughness: 0.26, metalness: 0.78 });
    const fLeafDark = new T.MeshStandardMaterial({ color: 0x557b45, roughness: 0.86 });
    const fLeafLight = new T.MeshStandardMaterial({ color: 0x6f9759, roughness: 0.82 });
    const fSoil = new T.MeshStandardMaterial({ color: 0x6b5340, roughness: 0.95 });
    const fWaterPool = new T.MeshStandardMaterial({ color: 0x5ab3c2, roughness: 0.14, metalness: 0.12, transparent: true, opacity: 0.80 });
    const fWaterJet = new T.MeshStandardMaterial({ color: 0x9be2ee, roughness: 0.16, transparent: true, opacity: 0.28 });
    const fFoam = new T.MeshStandardMaterial({ color: 0xd9f7fc, roughness: 0.22, transparent: true, opacity: 0.62 });

    // 底座台階與主水池池壁
    cylinder(0, 0.17, 0, 5.72, 5.80, 0.16, fStoneDark, 48);
    cylinder(0, 0.28, 0, 5.54, 5.64, 0.14, fStoneLight, 48);
    cylinder(0, 0.59, 0, 5.26, 5.44, 0.56, fStoneMid, 48);
    cylinder(0, 0.50, 0, 4.98, 4.98, 0.34, fPoolFloor, 48);

    const poolWater = cylinder(0, 0.78, 0, 4.96, 4.96, 0.14, fWaterPool, 48);
    poolWater.castShadow = false;

    // 陶土色主池緣與米白石材雙層收邊
    const rimOuter = mesh(new T.TorusGeometry(5.26, 0.24, 12, 64), fTerracotta, 0, 0.90, 0);
    rimOuter.rotation.x = Math.PI / 2;
    const rimInner = mesh(new T.TorusGeometry(5.16, 0.10, 10, 64), fStoneLight, 0, 1.07, 0);
    rimInner.rotation.x = Math.PI / 2;

    // 池壁外圈 8 道垂直壁柱裝飾
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) * Math.PI / 4;
      const pilaster = box(Math.cos(a) * 5.36, 0.59, Math.sin(a) * 5.36, 0.26, 0.54, 0.34, fStoneLight);
      pilaster.rotation.y = -a;
      const cap = box(Math.cos(a) * 5.38, 0.88, Math.sin(a) * 5.38, 0.32, 0.10, 0.40, fTerracottaDark);
      cap.rotation.y = -a;
    }

    // 四向正方位湧泉柱台
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2;
      const px = Math.cos(a) * 5.26, pz = Math.sin(a) * 5.26;
      const pier = box(px, 0.62, pz, 0.86, 0.96, 0.86, fStoneLight);
      pier.rotation.y = -a;
      const pierCap = box(px, 1.15, pz, 0.94, 0.14, 0.94, fTerracotta);
      pierCap.rotation.y = -a;
      cylinder(px, 1.36, pz, 0.24, 0.17, 0.28, fStoneLight, 16);
      const urnRing = mesh(new T.TorusGeometry(0.22, 0.045, 8, 20), fGold, px, 1.48, pz);
      urnRing.rotation.x = Math.PI / 2;
      mesh(new T.SphereGeometry(0.16, 12, 10), fGold, px, 1.56, pz);

      const spout = box(Math.cos(a) * 4.84, 1.03, Math.sin(a) * 4.84, 0.26, 0.10, 0.14, fGold);
      spout.rotation.y = -a;
      const pierCurve = new T.QuadraticBezierCurve3(
        new T.Vector3(Math.cos(a) * 4.72, 1.04, Math.sin(a) * 4.72),
        new T.Vector3(Math.cos(a) * 4.22, 1.32, Math.sin(a) * 4.22),
        new T.Vector3(Math.cos(a) * 3.68, 0.85, Math.sin(a) * 3.68)
      );
      const pierJet = mesh(new T.TubeGeometry(pierCurve, 14, 0.036, 6, false), fWaterJet, 0, 0, 0);
      pierJet.castShadow = false;
      jetPaths.push({ curve: pierCurve, n: 46, dur: 0.85 });
    }

    // 四隅斜向綠意花台柱
    const flowerColors = [0xe28d6e, 0xf2e3b6];
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + i * Math.PI / 2;
      const px = Math.cos(a) * 5.24, pz = Math.sin(a) * 5.24;
      const planter = cylinder(px, 0.60, pz, 0.56, 0.64, 0.92, fStoneMid, 8);
      planter.rotation.y = -a + Math.PI / 8;
      const planterRim = cylinder(px, 1.11, pz, 0.62, 0.54, 0.14, fTerracotta, 8);
      planterRim.rotation.y = -a + Math.PI / 8;
      cylinder(px, 1.15, pz, 0.48, 0.48, 0.08, fSoil, 12);
      mesh(new T.SphereGeometry(0.36, 12, 10), fLeafDark, px, 1.34, pz);
      for (let j = 0; j < 3; j++) {
        const ba = a + j * (Math.PI * 2 / 3);
        const bx = px + Math.cos(ba) * 0.22, bz = pz + Math.sin(ba) * 0.22;
        mesh(new T.SphereGeometry(0.22, 10, 8), fLeafLight, bx, 1.28, bz);
        mesh(new T.SphereGeometry(0.065, 8, 6), flowerColors[(i + j) % 2], bx + Math.cos(ba) * 0.12, 1.40, bz + Math.sin(ba) * 0.12);
      }
    }

    // 中央主柱與八角圍柱
    const plinth = cylinder(0, 0.96, 0, 1.48, 1.68, 0.42, fStoneDark, 8);
    plinth.rotation.y = Math.PI / 8;
    const plinthTrim = mesh(new T.TorusGeometry(1.48, 0.09, 8, 32), fTerracotta, 0, 1.15, 0);
    plinthTrim.rotation.x = Math.PI / 2;

    cylinder(0, 1.78, 0, 0.74, 0.96, 1.30, fStoneLight, 24);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const cx = Math.cos(a) * 0.94, cz = Math.sin(a) * 0.94;
      cylinder(cx, 1.76, cz, 0.10, 0.12, 1.14, fStoneMid, 12);
      cylinder(cx, 1.22, cz, 0.15, 0.17, 0.10, fStoneDark, 12);
      cylinder(cx, 2.30, cz, 0.16, 0.13, 0.10, fTerracottaDark, 12);
    }

    // 下層大水盤與放射狀托架
    cylinder(0, 2.48, 0, 1.75, 0.92, 0.36, fStoneMid, 32);
    cylinder(0, 2.78, 0, 2.68, 1.72, 0.34, fStoneLight, 32);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      const br = box(Math.cos(a) * 1.56, 2.58, Math.sin(a) * 1.56, 0.75, 0.16, 0.16, fStoneDark);
      br.rotation.order = 'YXZ';
      br.rotation.y = -a;
      br.rotation.z = -0.42;
    }
    const lowerRim = mesh(new T.TorusGeometry(2.68, 0.14, 10, 48), fTerracotta, 0, 2.95, 0);
    lowerRim.rotation.x = Math.PI / 2;
    const lowerLip = mesh(new T.TorusGeometry(2.54, 0.07, 8, 48), fStoneLight, 0, 3.02, 0);
    lowerLip.rotation.x = Math.PI / 2;
    const lowerWater = cylinder(0, 2.96, 0, 2.50, 2.50, 0.08, fWaterPool, 40);
    lowerWater.castShadow = false;

    // 上層石柱與上水盤
    cylinder(0, 3.12, 0, 0.70, 0.84, 0.28, fStoneDark, 16);
    const midCollar = mesh(new T.TorusGeometry(0.68, 0.06, 8, 32), fGold, 0, 3.24, 0);
    midCollar.rotation.x = Math.PI / 2;
    cylinder(0, 3.60, 0, 0.46, 0.58, 0.72, fStoneLight, 20);
    cylinder(0, 4.08, 0, 1.46, 0.54, 0.38, fStoneLight, 32);
    const upperRim = mesh(new T.TorusGeometry(1.46, 0.10, 10, 40), fTerracotta, 0, 4.27, 0);
    upperRim.rotation.x = Math.PI / 2;
    const upperWater = cylinder(0, 4.26, 0, 1.38, 1.38, 0.07, fWaterPool, 32);
    upperWater.castShadow = false;

    // 頂部塔座與金色飾環
    cylinder(0, 4.52, 0, 0.26, 0.40, 0.52, fStoneMid, 16);
    cylinder(0, 4.84, 0, 0.42, 0.22, 0.16, fGold, 16);
    cylinder(0, 5.02, 0, 0.06, 0.20, 0.24, fStoneLight, 12);
    const haloRing = mesh(new T.TorusGeometry(0.48, 0.045, 8, 36), fGold, 0, 5.14, 0);
    haloRing.rotation.x = Math.PI / 2;

    // 頂部四向小噴泉
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      const topCurve = new T.QuadraticBezierCurve3(
        new T.Vector3(Math.cos(a) * 0.16, 4.90, Math.sin(a) * 0.16),
        new T.Vector3(Math.cos(a) * 0.62, 5.25, Math.sin(a) * 0.62),
        new T.Vector3(Math.cos(a) * 0.98, 4.28, Math.sin(a) * 0.98)
      );
      const topJet = mesh(new T.TubeGeometry(topCurve, 14, 0.032, 5, false), fWaterJet, 0, 0, 0);
      topJet.castShadow = false;
      jetPaths.push({ curve: topCurve, n: 56, dur: 0.7 });
    }

    // 多層次水柱拋物線、溢流與水花
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const aHalf = a + Math.PI / 8;

      const midCurve = new T.QuadraticBezierCurve3(
        new T.Vector3(Math.cos(aHalf) * 1.24, 4.30, Math.sin(aHalf) * 1.24),
        new T.Vector3(Math.cos(aHalf) * 1.72, 4.54, Math.sin(aHalf) * 1.72),
        new T.Vector3(Math.cos(aHalf) * 2.04, 2.98, Math.sin(aHalf) * 2.04)
      );
      const midJet = mesh(new T.TubeGeometry(midCurve, 16, 0.038, 5, false), fWaterJet, 0, 0, 0);
      midJet.castShadow = false;
      jetPaths.push({ curve: midCurve, n: 64, dur: 0.95 });

      const mainCurve = new T.QuadraticBezierCurve3(
        new T.Vector3(Math.cos(a) * 1.05, 3.04, Math.sin(a) * 1.05),
        new T.Vector3(Math.cos(a) * 2.75, 4.72, Math.sin(a) * 2.75),
        new T.Vector3(Math.cos(a) * 3.98, 0.85, Math.sin(a) * 3.98)
      );
      const mainJet = mesh(new T.TubeGeometry(mainCurve, 20, 0.056, 6, false), fWaterJet, 0, 0, 0);
      mainJet.castShadow = false;
      jetPaths.push({ curve: mainCurve, n: 128, dur: 1.15 });

      const spillCurve = new T.QuadraticBezierCurve3(
        new T.Vector3(Math.cos(aHalf) * 2.66, 2.94, Math.sin(aHalf) * 2.66),
        new T.Vector3(Math.cos(aHalf) * 3.00, 2.55, Math.sin(aHalf) * 3.00),
        new T.Vector3(Math.cos(aHalf) * 3.12, 0.85, Math.sin(aHalf) * 3.12)
      );
      const spillJet = mesh(new T.TubeGeometry(spillCurve, 14, 0.030, 5, false), fWaterJet, 0, 0, 0);
      spillJet.castShadow = false;
      jetPaths.push({ curve: spillCurve, n: 36, dur: 1.0 });

      const splashRing = mesh(new T.TorusGeometry(0.24, 0.032, 6, 18), fFoam, Math.cos(a) * 3.98, 0.86, Math.sin(a) * 3.98);
      splashRing.rotation.x = Math.PI / 2;
      splashRing.castShadow = false;
      const drop1 = mesh(new T.SphereGeometry(0.055, 6, 6), fFoam, Math.cos(a + 0.04) * 3.92, 0.96, Math.sin(a + 0.04) * 3.92);
      drop1.castShadow = false;
      const drop2 = mesh(new T.SphereGeometry(0.042, 6, 6), fFoam, Math.cos(a - 0.04) * 4.06, 0.93, Math.sin(a - 0.04) * 4.06);
      drop2.castShadow = false;
    }

    // 主池同心漣漪環（各自 clone 材質，動畫淡出時不影響 splash 的 fFoam）
    const ripple1 = mesh(new T.TorusGeometry(3.12, 0.032, 6, 48), fFoam.clone(), 0, 0.86, 0);
    ripple1.rotation.x = Math.PI / 2;
    ripple1.castShadow = false;
    const ripple2 = mesh(new T.TorusGeometry(4.02, 0.036, 6, 56), fFoam.clone(), 0, 0.86, 0);
    ripple2.rotation.x = Math.PI / 2;
    ripple2.castShadow = false;

    // 流動水粒子：水滴沿各組水弧的貝茲路徑流動（相位錯開、速度微差、終點回起點重生），
    // 落點與既有靜態水弧一致；靜態水管已降為淡芯（fWaterJet opacity 0.28），流動感由粒子負責。
    {
      const dotCanvas = document.createElement('canvas'); dotCanvas.width = dotCanvas.height = 64;
      const dctx = dotCanvas.getContext('2d');
      const grad = dctx.createRadialGradient(32, 32, 2, 32, 32, 30);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.45, 'rgba(230,250,255,0.85)');
      grad.addColorStop(1, 'rgba(200,240,255,0)');
      dctx.fillStyle = grad; dctx.fillRect(0, 0, 64, 64);
      const dotTexture = new T.CanvasTexture(dotCanvas); dotTexture.colorSpace = T.SRGBColorSpace;

      let total = 0; for (const p of jetPaths) total += p.n;
      const positions = new Float32Array(total * 3);
      const seeds = [];
      for (const p of jetPaths) for (let k = 0; k < p.n; k++) {
        const ang = Math.random() * Math.PI * 2, rad = Math.random() * 0.055;
        seeds.push({ curve: p.curve, dur: p.dur, phase: Math.random(), speedMul: 0.85 + Math.random() * 0.3,
          ox: Math.cos(ang) * rad, oy: (Math.random() - 0.5) * 0.04, oz: Math.sin(ang) * rad });
      }
      const pGeo = new T.BufferGeometry();
      pGeo.setAttribute('position', new T.BufferAttribute(positions, 3));
      const pMat = new T.PointsMaterial({ size: 0.30, map: dotTexture, color: 0xcdf2fa, transparent: true, opacity: 0.9, depthWrite: false, sizeAttenuation: true });
      const points = new T.Points(pGeo, pMat);
      points.frustumCulled = false; points.renderOrder = 5;
      group.add(points);
      const tmpV = new T.Vector3();
      fountainFlow = { update(time) {
        const tSec = time * 0.001;
        for (let i = 0; i < seeds.length; i++) {
          const s = seeds[i];
          const t = (s.phase + tSec * s.speedMul / s.dur) % 1;
          s.curve.getPoint(t, tmpV);
          const spread = 0.35 + t * 0.9; // 水流越接近落點越散開
          positions[i * 3] = tmpV.x + s.ox * spread;
          positions[i * 3 + 1] = tmpV.y + s.oy * spread;
          positions[i * 3 + 2] = tmpV.z + s.oz * spread;
        }
        pGeo.attributes.position.needsUpdate = true;
        // 漣漪：兩環錯開半個相位，緩慢放大並淡出，像水波一圈圈散開。
        for (const [ring, ph] of [[ripple1, 0], [ripple2, 0.5]]) {
          const p = (tSec / 3.0 + ph) % 1, sc = 1 + p * 0.28;
          ring.scale.set(sc, sc, 1);
          ring.material.opacity = 0.55 * (1 - p);
        }
      } };
    }
  }
  const finial = mesh(new T.OctahedronGeometry(0.46), new T.MeshStandardMaterial({ color: 0xe3ca84, roughness: 0.22, metalness: 0.82, emissive: 0x3b2c0a, emissiveIntensity: 0.25 }), 0, 5.54, 0);
  animated.push({type:'finial',mesh:finial});
  sign('中央噴水池',0,7.6,0,9);
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
  // 大教堂（第 0 步③重建，東北角）：拆舊占位教堂，新建石造大教堂——高聳中殿＋陡斜陶土屋頂、
  // 雙鐘塔尖頂、中央尖塔（金色十字）、玫瑰窗、圓形後殿；陶土色系與廣場／路網呼應，東側臨水道。
  block(33,-44.6,22.5,29.7);
  // 前庭石板台地：銜接東北斜向大道末端與 x=25 次幹道北端，陶土色邊框呼應廣場外環。
  box(33,.09,-27.5,26,.18,9,0xd8d1b8);
  box(33,.20,-31.8,26,.06,.4,0xa8654f);box(33,.20,-23.7,26,.06,.4,0xa8654f);box(20.2,.20,-27.5,.4,.06,9,0xa8654f);box(45.8,.20,-27.5,.4,.06,9,0xa8654f);
  box(33,.10,-31.9,6,.20,1.6,0xc3c2ae);
  // 中殿：奶油色石牆、陡斜陶土屋頂、兩側扶壁與高窗；北端圓形後殿。
  box(33,6.5,-44,14,13,20,0xe6dfc8);roof(33,13,-44,15.6,21,8,0x8f4f38);
  for(const bz of [-50,-44,-38]){box(25.6,4,bz,.9,8,1.3,0xcfc39f);box(40.4,4,bz,.9,8,1.3,0xcfc39f);}
  for(const bz of [-50,-44,-38]){box(25.94,7.5,bz,.16,5.2,1.35,0xc6bda5);box(25.80,7.5,bz,.10,4.6,.95,0x7d94a8);box(40.06,7.5,bz,.16,5.2,1.35,0xc6bda5);box(40.20,7.5,bz,.10,4.6,.95,0x7d94a8);}
  cylinder(33,4.5,-54.5,4.8,4.8,9,0xe6dfc8,18);mesh(new T.ConeGeometry(5.2,4.5,18),0x8f4f38,33,11.25,-54.5);
  // 中央尖塔：自屋脊升起，全城最高點。
  cylinder(33,20,-44,1.05,1.35,5,0xd2cfb6,10);mesh(new T.ConeGeometry(1.8,5.5,10),0x8f4f38,33,25,-44);
  box(33,28.6,-44,.16,2,.16,0xd5b769);box(33,29,-44,1,.16,.16,0xd5b769);
  // 南立面：山牆＋玫瑰窗＋尖拱大門，雙鐘塔夾峙，塔頂金色十字。
  box(33,7,-33.5,17,14,2.5,0xe6dfc8);roof(33,14,-33.5,17,2.5,4.5,0x8f4f38);
  box(33,19.3,-33.5,.14,1.6,.14,0xd5b769);box(33,19.6,-33.5,.9,.14,.14,0xd5b769);
  tower(25.5,-33,2.6,22,0x8f4f38);tower(40.5,-33,2.6,22,0x8f4f38);
  for(const tx of [25.5,40.5]){box(tx,27,-33,.18,2.4,.18,0xd5b769);box(tx,27.5,-33,1.2,.18,.18,0xd5b769);}
  box(33,2.9,-32.15,3.4,5.8,.25,0x81705a);mesh(new T.TorusGeometry(1.8,.25,6,24,Math.PI),0xc6bda5,33,5.8,-32.0);
  window(29,8.5,-32.2,1.3,3.8);window(37,8.5,-32.2,1.3,3.8);
  const rose=mesh(new T.CircleGeometry(2.3,32),0x6597b3,33,10.5,-32.12);const roseRim=mesh(new T.TorusGeometry(2.35,.17,6,32),0xe5d3a0,33,10.5,-32.02);
  for(let i=0;i<8;i++){const spoke=box(33,10.5,-31.97,.10,4.3,.06,0xe3ca85);spoke.rotation.z=i*Math.PI/4;}
  // 東側水道（官方圖：教堂旁臨水）：石砌邊＋水面，沿教堂東牆北流。
  box(46.3,.05,-44,2.6,.10,23,0x6f9b9e);box(44.9,.07,-44,.35,.14,23,0x9e9c8b);box(47.7,.07,-44,.35,.14,23,0x9e9c8b);
  sign('大教堂',33,27,-37,10);

  // 道具店（第 0 步④：廣場周邊機能建築第一棟）：廣場東南側、面向廣場開店；
  // 奶油石牆＋陶土屋頂＋條紋遮陽篷，門前藥水櫥窗、木箱與木桶。
  block(11.5,24,8.5,7.5);
  box(11.5,.35,24,8.6,.7,6.6,0x9e9c8b);
  box(11.5,3.45,24,8,6,6,0xe6dfc8);
  for(const bx of [8.1,14.9])box(bx,3.45,20.93,.19,6,.15,0x65533d);
  box(11.5,5.9,20.93,8,.2,.16,0x6e5840);box(11.5,.85,20.93,8,.18,.16,0x6e5840);
  roof(11.5,6.45,24,9,7,2.6,0xa8654f);
  box(11.5,6.35,20.4,9.2,.18,.3,0x6e5840);
  box(14.3,8.1,25.5,.9,2.2,1.0,0xb6aa92);box(14.3,9.25,25.5,1.1,.18,1.2,0x9e9c8b);
  // 店面：正門＋兩側藥水櫥窗（朝北面向廣場）。
  box(11.5,1.8,20.94,2.0,2.9,.12,0x8a7358);
  box(11.5,1.75,20.90,1.6,2.6,.14,0x685344);
  mesh(new T.SphereGeometry(.07,8,6),0xdbb05e,11.9,1.7,20.8);
  box(11.5,3.35,20.9,2.2,.22,.18,0x6e5840);
  for(const wx of [9.3,13.7]){
    box(wx,2.6,20.94,1.7,1.9,.12,0xf2dfb3);
    box(wx,2.6,20.88,1.5,1.7,.08,0x779a9a);
    box(wx,2.6,20.82,.09,1.7,.04,0x665346);
    box(wx,2.6,20.82,1.5,.09,.04,0x665346);
    box(wx,1.55,20.85,1.9,.16,.3,0x8a7358);
    const potions=[0xc65a4e,0x5a8ac6,0x6fae5f];
    for(let i=0;i<3;i++)mesh(new T.SphereGeometry(.11,8,6),potions[i],wx-.5+i*.5,1.74,20.78);
  }
  // 條紋遮陽篷＋支柱。
  for(let i=0;i<13;i++){const awn=box(11.5-3.6+i*.6,4.35,20.15,.61,.12,1.9,i%2?0xf0e4c8:0xb65d55);awn.rotation.x=.16;}
  cylinder(8.2,2.15,19.35,.06,.06,4.3,0x806243,6);
  cylinder(14.8,2.15,19.35,.06,.06,4.3,0x806243,6);
  // 側窗。
  box(15.56,3.5,24,.14,1.8,1.5,0xf2dfb3);box(15.62,3.5,24,.08,1.5,1.2,0x779a9a);
  box(7.44,3.5,24,.14,1.8,1.5,0xf2dfb3);box(7.38,3.5,24,.08,1.5,1.2,0x779a9a);
  // 門前木箱與木桶。
  box(15.2,.5,20.4,.9,1.0,.9,0x9d7950);box(15.2,1.35,20.4,.7,.7,.7,0xb39162);
  cylinder(7.6,.7,20.6,.6,.6,1.4,0x9d7950,10);
  for(const y of [.3,1.1]){const hoop=mesh(new T.TorusGeometry(.61,.04,4,12),0x555a4d,7.6,y,20.6);hoop.rotation.x=Math.PI/2;}
  sign('道具店',11.5,9.9,21,7);

  // 武器店（第 0 步④：廣場周邊機能建築第二棟）：廣場西南側、與道具店對稱，面向廣場開店；
  // 深色木構＋陶土屋頂，山牆圓盾徽、櫥窗陳列刀劍，門前鐵砧與武器架。
  block(-11.5,24,8.5,7.5);
  box(-11.5,.35,24,8.6,.7,6.6,0x9e9c8b);
  box(-11.5,3.45,24,8,6,6,0xe0d6b8);
  for(const bx of [-14.9,-8.1])box(bx,3.45,20.93,.19,6,.15,0x65533d);
  box(-11.5,5.9,20.93,8,.2,.16,0x6e5840);box(-11.5,.85,20.93,8,.18,.16,0x6e5840);
  roof(-11.5,6.45,24,9,7,2.6,0xa8654f);
  box(-11.5,6.35,20.4,9.2,.18,.3,0x6e5840);
  box(-14.3,8.1,25.5,.9,2.2,1.0,0xb6aa92);box(-14.3,9.25,25.5,1.1,.18,1.2,0x9e9c8b);
  // 山牆圓盾徽（貼於屋頂三角山牆北面）。
  const wShield=mesh(new T.CylinderGeometry(.8,.8,.12,20),0x7a8894,-11.5,7.6,20.44);wShield.rotation.x=Math.PI/2;
  mesh(new T.SphereGeometry(.16,10,8),0xd5b769,-11.5,7.6,20.36);
  // 店面：正門＋兩側武器櫥窗（朝北面向廣場），櫥窗內交叉刀劍。
  box(-11.5,1.8,20.94,2.0,2.9,.12,0x8a7358);
  box(-11.5,1.75,20.90,1.6,2.6,.14,0x685344);
  mesh(new T.SphereGeometry(.07,8,6),0xdbb05e,-11.9,1.7,20.8);
  box(-11.5,3.35,20.9,2.2,.22,.18,0x6e5840);
  for(const wx of [-13.7,-9.3]){
    box(wx,2.6,20.94,1.7,1.9,.12,0xf2dfb3);
    box(wx,2.6,20.88,1.5,1.7,.08,0x779a9a);
    for(const s of [-1,1]){const sw=box(wx+s*.28,2.6,20.80,.12,1.4,.05,0xb9c4cc);sw.rotation.z=s*.55;}
    box(wx,1.55,20.85,1.9,.16,.3,0x8a7358);
  }
  // 條紋遮陽篷＋支柱（深藍灰條紋，區分道具店的紅白篷）。
  for(let i=0;i<13;i++){const awn=box(-11.5-3.6+i*.6,4.35,20.15,.61,.12,1.9,i%2?0xf0e4c8:0x5a6b7a);awn.rotation.x=.16;}
  cylinder(-14.8,2.15,19.35,.06,.06,4.3,0x806243,6);
  cylinder(-8.2,2.15,19.35,.06,.06,4.3,0x806243,6);
  // 側窗。
  box(-15.56,3.5,24,.14,1.8,1.5,0xf2dfb3);box(-15.62,3.5,24,.08,1.5,1.2,0x779a9a);
  box(-7.44,3.5,24,.14,1.8,1.5,0xf2dfb3);box(-7.38,3.5,24,.08,1.5,1.2,0x779a9a);
  // 門前鐵砧與武器架。
  box(-15.2,.35,20.4,1.0,.7,1.0,0x8a7358);
  box(-15.2,.95,20.4,1.3,.35,.55,0x6b7280);
  box(-15.2,1.25,20.4,.5,.25,.5,0x6b7280);
  for(const px of [-8.6,-7.0])cylinder(px,1.0,20.3,.07,.07,2.0,0x806243,6);
  box(-7.8,1.9,20.3,1.8,.12,.12,0x806243);
  for(let i=0;i<3;i++){const sw=box(-8.5+i*.7,1.15,20.3,.13,1.6,.05,0xb9c4cc);sw.rotation.z=.25;}
  sign('武器店',-11.5,9.9,21,7);

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
    {id:'cathedral',name:'大教堂',desc:'雙鐘塔、玫瑰窗與中央尖塔',look:{x:33,z:-40},walk:{x:33,z:-27}},
    {id:'market',name:'商店街',desc:'道具店、武器店與市集攤位',look:{x:0,z:18},walk:{x:0,z:25}},
    {id:'item-shop',name:'道具店',desc:'藥水、道具與冒險補給',look:{x:11.5,z:24},walk:{x:11.5,z:18.5}},
    {id:'weapon-shop',name:'武器店',desc:'劍、盾與防具',look:{x:-11.5,z:24},walk:{x:-11.5,z:18.5}},
    {id:'garden',name:'城西花園',desc:'樹蔭、長椅與西側街區',look:{x:-36,z:0},walk:{x:-35,z:0}},
    {id:'south-gate',name:'南門',desc:'從城門出發，探索普隆德拉',look:{x:0,z:55},walk:{x:0,z:51}}
  ];
  return {group,ground,labels,navigation,landmarks:landmarks.map(l=>({...l,look:{x:l.look.x*S,z:l.look.z*S},walk:{x:l.walk.x*S,z:l.walk.z*S}})),spawn:{x:0,y:.15,z:47*S},update(time,camera){finial.rotation.y=time*.00025;if(fountainFlow)fountainFlow.update(time);if(camera)for(const label of labels.children){label.getWorldPosition(labelWorld);label.visible=camera.position.distanceTo(labelWorld)>23*S;}}};
}
