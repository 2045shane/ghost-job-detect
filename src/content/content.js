(() => {
  const G = GhostJob;
  let url = location.href, host, output, button, quotaLine, lastSignature = '', busy = false;
  function line(parent, text, tag = 'p') {
    const el = document.createElement(tag); el.textContent = text; parent.append(el); return el;
  }
  async function refreshQuota() {
    try {
      const q = await chrome.runtime.sendMessage({type:'quota-status'});
      quotaLine.textContent = q.error || (q.unlocked ? '已解锁 · 不限次数' : `今日剩余 ${q.remaining} / 3 次`);
      if (!q.error && !q.allowed) quotaLine.textContent = G.CTA + '。可在设置页输入 license 解锁。';
    } catch { quotaLine.textContent = '扩展连接失效，请刷新页面。'; }
  }
  function mount() {
    if (host?.isConnected) return;
    host = document.createElement('div'); host.dataset.ghostJobPanel = '';
    const shadow = host.attachShadow({mode:'open'});
    const style = document.createElement('style');
    style.textContent = ':host{all:initial;position:fixed;right:18px;bottom:18px;z-index:2147483647}section{font:14px/1.6 system-ui,sans-serif;color:#241c16;background:#fbf6ee;border:1px solid #d9c8b4;border-radius:14px;padding:18px;width:300px;max-width:calc(100vw - 72px);max-height:70vh;overflow:auto;box-shadow:0 8px 30px #0003}h2{font-size:18px;margin:0}p{margin:8px 0}button{font:inherit;cursor:pointer;border:0;border-radius:7px;padding:8px 14px;background:#9e2f2a;color:white;margin:6px 6px 0 0}button:disabled{opacity:.5}ul{padding-left:20px}';
    shadow.append(style);
    const panel = document.createElement('section'); panel.setAttribute('aria-label','假职位检测'); shadow.append(panel);
    line(panel,'假职位 / Ghost job 检测','h2');
    quotaLine = line(panel,'读取次数…');
    output = document.createElement('div'); output.setAttribute('aria-live','polite'); panel.append(output);
    line(output,'点击分析，仅读取当前可见职位内容。启发式评分不代表职位虚假。');
    button = document.createElement('button'); button.textContent = '分析'; panel.append(button);
    const options = document.createElement('button'); options.textContent = '设置 / 解锁'; panel.append(options);
    options.onclick = () => chrome.runtime.sendMessage({type:'open-options'});
    button.onclick = async () => {
      if (busy) return;
      const job = G.extractJob();
      const analyzedUrl = location.href;
      output.replaceChildren();
      if (!job.title) { line(output,'尚未读取到职位标题，请打开职位详情并等待加载后重试。本次不计次。'); return; }
      busy = true; button.disabled = true;
      try {
        const q = await chrome.runtime.sendMessage({type:'quota-consume'});
        if (q.error) throw new Error(q.error);
        if (location.href !== analyzedUrl) { line(output,'页面已切换，请分析当前职位。'); return; }
        if (!q.recorded) { line(output,G.CTA); line(output,'可在设置页输入 license 解锁。'); return; }
        const result = G.analyzeJob(job);
        line(output,job.title,'h3'); line(output,job.company || '公司名称未知');
        line(output,`发布/更新：${job.dateText || '未知'}${result.days === null ? '' : `（约 ${Math.round(result.days * 10)/10} 天）`}`);
        line(output,`重新发布：${result.reposted ? '是（Reposted）' : '未识别到标记'}；申请人数：${job.applicantsText || '未知'}`);
        line(output,`疑似假岗：${result.score} / 100 · ${result.level}风险`,'h3');
        const list = document.createElement('ul'); output.append(list);
        (result.reasons.length ? result.reasons : ['暂未发现明显风险信号']).forEach(reason => line(list,reason,'li'));
        line(output,result.explanation);
      } catch (error) { line(output,error.message || '分析失败，请刷新后重试。'); }
      finally { busy = false; button.disabled = false; refreshQuota(); }
    };
    document.body.append(host); refreshQuota();
  }
  function update() {
    if (!G.isSupportedUrl(location.href)) { host?.remove(); return; }
    mount();
    const job = G.extractJob();
    const signature = `${location.href}|${job.title}|${job.company}`;
    if (url !== location.href || lastSignature !== signature) {
      url = location.href; lastSignature = signature;
      output.replaceChildren(); line(output,'职位已更新，点击分析获取评分。');
    }
  }
  let timer;
  new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(update,250); })
    .observe(document.body,{childList:true,subtree:true,characterData:true});
  setInterval(() => { if (url !== location.href || !host?.isConnected) update(); },1000);
  chrome.storage.onChanged.addListener((changes,area) => { if (area === 'local' && (changes.gjdQuota || changes.gjdLicense)) refreshQuota(); });
  update();
})();
