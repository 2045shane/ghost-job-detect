const input = document.getElementById('license');
const result = document.getElementById('result');
document.getElementById('license-form').onsubmit = async event => {
  event.preventDefault();
  try {
    const value = input.value.trim();
    if (!await GhostJob.verifyLicense(value)) { result.textContent = 'License 格式或校验和无效，未保存。'; return; }
    await chrome.storage.local.set({[GhostJob.STORAGE_KEYS.license]:value});
    input.value = ''; result.textContent = '已保存，分析次数已解锁。'; await renderStatus();
  } catch { result.textContent = '保存失败，请重试。'; }
};
document.getElementById('clear').onclick = async () => {
  try {
    await chrome.storage.local.remove(GhostJob.STORAGE_KEYS.license);
    input.value = ''; result.textContent = '已清除，恢复每日 3 次免费分析。'; await renderStatus();
  } catch { result.textContent = '清除失败，请重试。'; }
};
