(function(root) {
"use strict";

function analyzeJob(job = {}) {
  const { days, reposted } = root.GhostJob.parseRelativeDate(job.dateText);
  const applicants = root.GhostJob.parseApplicants(job.applicantsText);
  const reasons = []; let score = 0;
  function add(points, reason) { score += points; reasons.push(reason); }
  if (days !== null && days > 30) add(25, '发布或更新已超过 30 天，可能长期挂岗');
  if (reposted) add(20, '职位被重新发布，建议核实招聘进度');
  if (applicants !== null && applicants >= 100) add(15, '已有至少 100 位申请者仍在展示招聘');
  if (!job.salaryText || !job.salaryText.trim()) add(10, '可见内容未提供薪资信息');
  const description = String(job.description || '').trim();
  if (description.length < 200) add(10, '可见职位描述较短，信息不足');
  if (/talent pool|future opportunities|人才储备|人才库|未来机会/i.test(description)) add(20, '描述含人才储备或未来机会等泛化措辞');
  if (!String(job.company || '').trim()) add(10, '未读取到公司名称');
  score = Math.min(100, Math.max(0, score));
  return {score, level: score >= 60 ? '高' : score >= 30 ? '中' : '低', reasons, days, reposted, applicants,
    explanation: '仅基于当前可见内容的启发式提示，不代表职位虚假；信息缺失也可能来自页面尚未加载。请向招聘方核实。'};
}

const api = {analyzeJob};
Object.assign(root.GhostJob ||= {}, api);
if (typeof module !== "undefined" && module.exports) module.exports = api;
})(globalThis);
