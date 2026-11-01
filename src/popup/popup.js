document.getElementById('options').onclick = () => chrome.runtime.openOptionsPage();
chrome.tabs.query({active:true,currentWindow:true}).then(([tab]) => {
  document.getElementById('supported').textContent = GhostJob.isSupportedUrl(tab?.url) ? '当前页支持检测' : '当前页不支持：请打开 LinkedIn 职位详情或 Indeed。';
}).catch(() => { document.getElementById('supported').textContent = '无法识别当前页，请打开职位详情。'; });
