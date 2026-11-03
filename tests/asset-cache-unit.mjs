import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const scope='https://example.test/portfolio-final/';
const content='font bytes';
const revision=createHash('sha256').update(content).digest('hex');
const handlers={};
const store=new Map();
const deleted=[];
let networkContent=content, networkCalls=0;
const runtime=readFileSync(new URL('../public/js/asset-cache-worker.js',import.meta.url),'utf8');
const prefix='portfolio-assets:/portfolio-final/:';
const sandbox={
  ASSET_REVISIONS:{'assets/font/test.woff2':revision},BUILD_REVISION:'new',
  URL,Uint8Array,crypto:webcrypto,
  self:{registration:{scope},location:{origin:'https://example.test'},
    clients:{claim:async()=>{}},addEventListener:(type,handler)=>handlers[type]=handler},
  caches:{
    keys:async()=>[prefix+'old',prefix+'new','unrelated-cache'],
    delete:async key=>deleted.push(key),
    open:async()=>({
      match:async key=>store.get(key)?.clone(),
      put:async(key,response)=>store.set(key,response)
    })
  },
  fetch:async()=>{networkCalls++;return new Response(networkContent)}
};
vm.runInNewContext(runtime,sandbox);
async function request(path, options={}) {
  const waits=[];let response;
  handlers.fetch({request:new Request(new URL(path,scope),options),
    respondWith:promise=>response=promise,waitUntil:promise=>waits.push(promise)});
  if(!response)return null;
  const result=await response;await Promise.all(waits);return result;
}
let waits=[];handlers.activate({waitUntil:p=>waits.push(p)});await Promise.all(waits);
assert.deepEqual(deleted,[prefix+'old'],'Only obsolete caches from this scope may be deleted');
assert.equal(await (await request('assets/font/test.woff2?v=1')).text(),content);
assert.equal(store.size,1,'Matching asset bytes must be cached');
networkContent='changed deployment';
assert.equal(await (await request('assets/font/test.woff2?v=2')).text(),content);
assert.equal(networkCalls,1,'A content revision must reuse its cached bytes across version queries');
store.clear();
assert.equal(await (await request('assets/font/test.woff2')).text(),'changed deployment');
assert.equal(store.size,0,'Changed bytes must never be cached under the previous content revision');
assert.equal(await request('assets/font/test.woff2',{headers:{range:'bytes=0-5'}}),null);
assert.equal(await request('videos/test.mp4'),null);
assert.equal(await request('about/'),null);
assert.equal(await request('https://other.test/assets/font/test.woff2'),null);
sandbox.caches.open=async()=>{throw new Error('storage disabled')};
assert.equal(await (await request('assets/font/test.woff2')).text(),'changed deployment');
console.log('ASSET CACHE UNIT PASS revision validation, scope cleanup, range/video/HTML bypass, storage fallback');
