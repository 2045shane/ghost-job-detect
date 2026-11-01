(function(root) {
"use strict";

function parseRelativeDate(text = '') {
  text = String(text);
  const reposted = /reposted|重新发布|重新刊登/i.test(text);
  let days = null;
  const en = text.match(/(\d+(?:\.\d+)?)\s*(minute|hour|day|week|month|year)s?\s+ago/i);
  const zh = text.match(/(\d+(?:\.\d+)?)\s*(分钟|小時|小时|天|日|周|週|个月|個月|月|年)\s*前/);
  if (en) days = Number(en[1]) * ({minute:1/1440,hour:1/24,day:1,week:7,month:30,year:365}[en[2].toLowerCase()]);
  else if (zh) days = Number(zh[1]) * ({'分钟':1/1440,'小時':1/24,'小时':1/24,'天':1,'日':1,'周':7,'週':7,'个月':30,'個月':30,'月':30,'年':365}[zh[2]]);
  else if (/today|just now|今天|刚刚/i.test(text)) days = 0;
  else if (/yesterday|昨天/i.test(text)) days = 1;
  return { days, reposted, text };
}
function parseApplicants(text = '') {
  const match = String(text).match(/([\d,]+)\+?\s*(?:多位|位|多名|名)?\s*(?:applicants?|申请者|申请人)/i);
  return match ? Number(match[1].replace(/,/g, '')) : null;
}

const api = {parseRelativeDate, parseApplicants};
Object.assign(root.GhostJob ||= {}, api);
if (typeof module !== "undefined" && module.exports) module.exports = api;
})(globalThis);
