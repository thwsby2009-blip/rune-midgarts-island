// Small city navigation grid. Blocked cells include the character's body radius.
export function createNavigation({minX=-47,maxX=47,minZ=-57,maxZ=57,step=1.4,obstacles=[],radius=.75}={}){
  const cols=Math.floor((maxX-minX)/step)+1,rows=Math.floor((maxZ-minZ)/step)+1;
  const blocked=new Uint8Array(cols*rows);
  const inside=(x,z)=>x>=minX&&x<=maxX&&z>=minZ&&z<=maxZ;
  const canWalk=(x,z)=>inside(x,z)&&!obstacles.some(o=>x>o.minX-radius&&x<o.maxX+radius&&z>o.minZ-radius&&z<o.maxZ+radius);
  const position=id=>({x:minX+(id%cols)*step,z:minZ+Math.floor(id/cols)*step});
  for(let id=0;id<blocked.length;id++){const p=position(id);blocked[id]=!canWalk(p.x,p.z);}
  const gridId=(x,z)=>Math.max(0,Math.min(rows-1,Math.round((z-minZ)/step)))*cols+Math.max(0,Math.min(cols-1,Math.round((x-minX)/step)));
  function nearest(x,z){const center=gridId(x,z);if(!blocked[center])return center;let result=-1,best=Infinity;for(let id=0;id<blocked.length;id++){if(blocked[id])continue;const p=position(id),d=(p.x-x)**2+(p.z-z)**2;if(d<best){best=d;result=id;}}return result;}
  function lineClear(a,b){const length=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(length/(step*.25)));for(let i=0;i<=n;i++){const t=i/n;if(!canWalk(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t))return false;}return true;}
  function findPath(from,to){
    const start=nearest(from.x,from.z),end=nearest(to.x,to.z);if(start<0||end<0)return null;
    const goal=position(end);const desired={x:to.x,z:to.z};const target=canWalk(to.x,to.z)&&lineClear(goal,desired)?desired:goal;
    if(lineClear(from,target))return [target];
    const g=new Float64Array(blocked.length).fill(Infinity),came=new Int32Array(blocked.length).fill(-1),closed=new Uint8Array(blocked.length),open=[start];g[start]=0;
    const heuristic=id=>{const p=position(id);return Math.hypot(p.x-goal.x,p.z-goal.z)/step;};
    while(open.length){
      let best=0;for(let i=1;i<open.length;i++)if(g[open[i]]+heuristic(open[i])<g[open[best]]+heuristic(open[best]))best=i;
      const current=open.splice(best,1)[0];if(closed[current])continue;
      if(current===end){
        const route=[];for(let id=end;id!==start;id=came[id]){if(id<0)return null;route.push(position(id));}route.reverse();route.push(target);
        const smooth=[];let anchor={x:from.x,z:from.z},index=0;
        while(index<route.length){let furthest=index;while(furthest+1<route.length&&lineClear(anchor,route[furthest+1]))furthest++;smooth.push(route[furthest]);anchor=route[furthest];index=furthest+1;}
        return smooth;
      }
      closed[current]=1;const x=current%cols,z=Math.floor(current/cols);
      for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
        if(!dx&&!dz)continue;const nx=x+dx,nz=z+dz;if(nx<0||nz<0||nx>=cols||nz>=rows)continue;const next=nz*cols+nx;if(blocked[next]||closed[next])continue;
        if(dx&&dz&&(blocked[z*cols+nx]||blocked[nz*cols+x]))continue;
        if(!lineClear(position(current),position(next)))continue;
        const cost=g[current]+Math.hypot(dx,dz);if(cost<g[next]){g[next]=cost;came[next]=current;open.push(next);}
      }
    }return null;
  }
  return {canWalk,findPath,lineClear,bounds:{minX,maxX,minZ,maxZ}};
}
