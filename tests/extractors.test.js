const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {JSDOM}=require('jsdom');
test('LinkedIn 未登录职位页（真站快照）能取到标题/公司/描述/薪资/发布时间/申请人数',()=>{
 const html=fs.readFileSync(path.join(__dirname,'fixtures/linkedin-guest-job.html'),'utf8');
 const dom=new JSDOM(html,{url:'https://www.linkedin.com/jobs/view/4476983365/',runScripts:'outside-only'});const w=dom.window;
 w.Element.prototype.getClientRects=function(){return [1];};
 Object.defineProperty(w.HTMLElement.prototype,'innerText',{get(){return this.textContent.replace(/\s+/g,' ');}});
 w.GhostJob={};w.eval(fs.readFileSync(path.join(__dirname,'../src/content/extractors.js'),'utf8'));
 const job=w.GhostJob.extractJob();
 assert.match(job.title,/Software Engineer II/);assert.equal(job.company,'JPMorganChase');
 assert.ok(job.description.length>200);assert.match(job.salaryText,/\$123,500/);
 assert.match(job.dateText,/3 days ago/);assert.match(job.applicantsText,/200 applicants/i);
});
