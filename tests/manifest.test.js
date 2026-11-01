const test=require('node:test'); const assert=require('node:assert/strict');
const fs=require('node:fs'); const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('MV3 entry points, least permissions and referenced files exist',()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
 assert.equal(m.manifest_version,3); assert.ok(m.action.default_popup); assert.ok(m.options_page); assert.ok(m.content_scripts.length);
 assert.deepEqual(m.permissions,['storage','activeTab']);
 assert.deepEqual(m.host_permissions,['https://www.linkedin.com/jobs/*','https://*.indeed.com/*']);
 const files=[m.action.default_popup,m.options_page,m.background.service_worker,...Object.values(m.icons),...Object.values(m.action.default_icon)];
 for(const script of m.content_scripts){assert.deepEqual(script.matches,m.host_permissions); files.push(...script.js);}
 for(const file of files) assert.ok(fs.existsSync(path.join(root,file)),file);
 for(const html of [m.action.default_popup,m.options_page]){
   const text=fs.readFileSync(path.join(root,html),'utf8');
   for(const match of text.matchAll(/(?:src|href)="([^\"]+)"/g)) assert.ok(fs.existsSync(path.resolve(root,path.dirname(html),match[1])),match[1]);
 }
});
