async function renderStatus() {
  const q = await chrome.runtime.sendMessage({type:'quota-status'});
  if (q.error) throw new Error(q.error);
  document.getElementById('quota').textContent = q.unlocked ? '今日剩余：不限次数' : `今日剩余 ${q.remaining} / 3 次免费分析`;
  document.getElementById('unlocked').textContent = q.unlocked ? '解锁状态：已解锁' : '解锁状态：免费版';
  const cta = document.getElementById('cta'); cta.hidden = q.allowed;
  cta.textContent = GhostJob.CTA + '。可在设置页输入 license 解锁。';
}
function showStatusError(error) { document.getElementById('quota').textContent = error.message; }
chrome.storage.onChanged.addListener((changes,area) => {
  if (area === 'local') renderStatus().catch(showStatusError);
});
renderStatus().catch(showStatusError);
