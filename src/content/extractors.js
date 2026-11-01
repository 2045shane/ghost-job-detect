(function(root) {
  const visible = el => el && !el.closest('[data-ghost-job-panel]') && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
  function first(scope, selectors) {
    for (const selector of selectors) {
      for (const el of scope.querySelectorAll(selector)) if (visible(el) && el.innerText.trim()) return el;
    }
    return null;
  }
  function extractJob() {
    const indeed = location.hostname.endsWith('indeed.com');
    // TODO Indeed: add country/layout-specific metadata and description selectors.
    const scope = first(document, indeed ? ['#jobsearch-ViewjobPaneWrapper', '.jobsearch-ViewJobLayout', 'main'] :
      ['.jobs-search__job-details--container', '.jobs-search__job-details', '.job-view-layout', 'main']) || document.body;
    const text = scope.innerText || '';
    const get = selectors => first(scope, selectors)?.innerText.trim() || '';
    const dateText = text.match(/(?:Reposted\s+)?\d+\s+(?:minutes?|hours?|days?|weeks?|months?|years?)\s+ago|(?:重新发布于?\s*)?\d+\s*(?:分钟|小时|天|周|个月|月|年)前|just now|today|yesterday|今天|昨天|刚刚/i)?.[0] || '';
    const applicantsText = text.match(/(?:over\s+)?[\d,]+\+?\s+applicants?|[\d,]+\s*多?[位名]?申请[者人]/i)?.[0] || '';
    return {
      title:get(['.job-details-jobs-unified-top-card__job-title','h1','.jobsearch-JobInfoHeader-title']),
      company:get(['.job-details-jobs-unified-top-card__company-name','.jobs-unified-top-card__company-name','[data-testid="inlineHeader-companyName"]','[data-company-name="true"]']),
      description:get(['#job-details','.jobs-description__content','#jobDescriptionText']),
      salaryText:get(['.job-details-jobs-unified-top-card__job-insight--highlight','#salaryInfoAndJobType']) .match(/[$€£¥￥]|薪|salary|\d+[kK]\b/i) ? get(['.job-details-jobs-unified-top-card__job-insight--highlight','#salaryInfoAndJobType']) : '',
      dateText, applicantsText, indeed
    };
  }
  Object.assign(root.GhostJob, {extractJob});
})(globalThis);
