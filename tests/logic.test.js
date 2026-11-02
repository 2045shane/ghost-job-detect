const test = require('node:test');
const assert = require('node:assert/strict');
const {parseRelativeDate:parse,parseApplicants} = require('../src/lib/date-parse');
const {analyzeJob} = require('../src/lib/heuristics');
const {issueLicense,verifyLicense} = require('../src/lib/license');
const {createQuotaStore,localDateKey,isSupportedUrl} = require('../src/lib/quota');
test('relative dates: English, Chinese, reposted and unknown', () => {
  for (const [text,days,reposted] of [['2 weeks ago',14,false],['Reposted 3 days ago',3,true],['3 周前',21,false],['重新发布于 2 天前',2,true],['2 months ago',60,false],['1 年前',365,false],['12 hours ago',0.5,false],['今天',0,false],['yesterday',1,false],['unknown',null,false]]) {
    const actual = parse(text); assert.equal(actual.days,days,text); assert.equal(actual.reposted,reposted,text);
  }
  assert.equal(parseApplicants('Over 100 applicants'),100);
  assert.equal(parseApplicants('100+ applicants'),100);
  assert.equal(parseApplicants('100 多位申请者'),100);
  assert.equal(parseApplicants('1,200 applicants'),1200);
  assert.equal(parseApplicants('unknown'),null);
});
test('heuristics: low/high, boundaries, cap and Chinese reasons', () => {
  const healthy = {company:'Acme',dateText:'3 days ago',salaryText:'$100k',description:'具体工作职责与要求。'.repeat(40)};
  assert.equal(analyzeJob(healthy).score,0);
  assert.equal(analyzeJob({...healthy,dateText:'30 days ago'}).score,0);
  assert.equal(analyzeJob({...healthy,dateText:'31 days ago'}).score,25);
  assert.equal(analyzeJob({...healthy,dateText:'Reposted 31 days ago'}).level,'中');
  const high = analyzeJob({dateText:'Reposted 60 days ago',applicantsText:'Over 100 applicants',description:'talent pool future opportunities 人才储备'});
  assert.equal(high.score,100); assert.equal(high.level,'高'); assert.equal(high.reasons.length,7);
  assert.match(high.reasons.join(''),/重新发布/); assert.match(high.explanation,/不代表职位虚假/);
});
function memory() { const data = {}; return {data,async get(){return {...data};},async set(values){Object.assign(data,values);}}; }
test('quota: fourth rejected, concurrency serialized, local next day reset', async () => {
  const storage = memory(); let now = new Date(2026,10,1,23,59);
  const q = createQuotaStore(storage,() => now);
  assert.equal((await q.status()).remaining,3);
  const results = await Promise.all(Array.from({length:4},() => q.consume()));
  assert.deepEqual(results.map(x => x.recorded),[true,true,true,false]);
  assert.equal((await q.status()).remaining,0);
  now = new Date(2026,10,2,0,1);
  assert.equal(localDateKey(now),'2026-11-02'); assert.equal((await q.status()).remaining,3);
  assert.equal((await q.consume()).count,1);
});
test('license verifies checksum and rejects malformed/tampered tokens', async () => {
  const token = await issueLicense(); assert.equal(await verifyLicense(' '+token+' '),true);
  for (const invalid of ['',null,{},'junk',token+'0',token.slice(0,-1)+(token.endsWith('0')?'1':'0'),token.toUpperCase()]) assert.equal(await verifyLicense(invalid),false);
});
test('unlocked unlimited; invalid license and corrupt count do not bypass limit', async () => {
  const s=memory(); s.data.gjdLicense=await issueLicense(); const q=createQuotaStore(s);
  for(let i=0;i<8;i++) assert.equal((await q.consume()).recorded,true);
  assert.equal((await q.status()).remaining,null);
  s.data.gjdLicense='invalid'; s.data.gjdQuota={date:localDateKey(),count:-1};
  assert.equal((await q.status()).remaining,3);
  for(let i=0;i<3;i++) await q.consume();
  assert.equal((await q.consume()).recorded,false);
});
test('supported URLs are restricted', () => {
  assert.equal(isSupportedUrl('https://www.linkedin.com/jobs/view/1'),true);
  for(const url of ['https://uk.indeed.com/viewjob','https://indeed.com/','http://uk.indeed.com/','https://indeed.com.evil.test/','https://www.linkedin.com/feed/','garbage']) assert.equal(isSupportedUrl(url),false);
});
