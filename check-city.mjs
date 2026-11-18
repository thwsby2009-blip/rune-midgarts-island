import assert from 'node:assert/strict';
import {createNavigation} from './dist/navigation.js';
const nav=createNavigation({minX:-20,maxX:20,minZ:-20,maxZ:20,obstacles:[{minX:-4,maxX:4,minZ:-5,maxZ:5}]});
assert.equal(nav.canWalk(0,0),false,'Buildings must block walking');
assert.equal(nav.canWalk(-21,0),false,'City boundary must block walking');
const start={x:-12,z:0},end={x:12,z:0},route=nav.findPath(start,end);
assert.ok(route?.length>1,'A building between endpoints requires a detour');
let previous=start;for(const waypoint of route){assert.ok(nav.lineClear(previous,waypoint),'Every route segment must avoid the building');previous=waypoint;}
assert.deepEqual(previous,end,'A reachable destination must be reached');
const beside=nav.findPath(start,{x:0,z:0});assert.ok(beside?.length);assert.ok(nav.canWalk(beside.at(-1).x,beside.at(-1).z),'A building click must resolve to walkable ground');
const sealed=createNavigation({minX:-10,maxX:10,minZ:-10,maxZ:10,obstacles:[{minX:-1,maxX:1,minZ:-11,maxZ:11}]});
assert.equal(sealed.findPath({x:-6,z:0},{x:6,z:0}),null,'An impassable wall must not be crossed');
console.log('City navigation: building collision, bounds, detours, building clicks and unreachable destinations passed.');
