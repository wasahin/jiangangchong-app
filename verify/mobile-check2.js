/** 第二輪手機檢查：首屏放大 + 宣傳卡自動輪播 + 價目表唔會擠壓 + 字級正確。 */
const path = require('path');
const fs = require('fs');
const { SHOTS: OUT, launchOptions, requirePuppeteer } = require('./_shared');
const puppeteer = requirePuppeteer();

const BASE = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const check = (label, cond, extra = '') => { cond ? pass++ : fail++; console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? '  -> ' + extra : ''}`); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch(
    launchOptions({ defaultViewport: { width: 390, height: 844, isMobile: true } }),
  );
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(2500);

  console.log(`\n=== ${BASE}（手機 390x844）===\n--- A. 首屏放大 ---`);

  // A1) 門頭：paw mark 高度 + 金刚宠 字號 + 標語
  const head = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img')).filter(i => i.src.includes('logo-jingangchong'));
    const top = imgs.filter(i => i.getBoundingClientRect().top < 600);
    const mark = top.find(i => i.src.includes('-mark'));
    const h1 = document.querySelector('h1');
    const tag = Array.from(document.querySelectorAll('p')).find(p => p.innerText.includes('人和毛孩子'));
    const cs = el => (el ? parseFloat(getComputedStyle(el).fontSize) : 0);
    return {
      topCount: top.length,
      topMark: top.filter(i => i.src.includes('-mark')).length,
      markH: mark ? mark.getBoundingClientRect().height : 0,
      h1Text: h1 ? h1.innerText.trim() : null,
      h1Font: cs(h1),
      tagText: tag ? tag.innerText.trim() : null,
      tagFont: cs(tag),
      h1Top: h1 ? h1.getBoundingClientRect().top : null,
      promoTop: document.querySelector('[aria-label="门店精选，左右滑动"]')?.getBoundingClientRect().top,
    };
  });
  check('頁首只有一個品牌標誌（paw mark）', head.topCount === 1 && head.topMark === 1, JSON.stringify({ c: head.topCount, m: head.topMark }));
  check('爪印放大到 >= 64px', head.markH >= 64, `${Math.round(head.markH)}px`);
  check('標題係 金刚宠', head.h1Text === '金刚宠', head.h1Text);
  check('標題字級 >= 40px', head.h1Font >= 40, `${head.h1Font}px`);
  check('標語存在：人和毛孩子，都在这儿松口气', head.tagText === '人和毛孩子，都在这儿松口气', head.tagText);
  check('標語字級 >= 18px', head.tagFont >= 18, `${head.tagFont}px`);
  check('宣傳卡喺首屏之內（頭 844px 見到）', head.promoTop !== null && head.promoTop < 844, `top=${Math.round(head.promoTop || 0)}`);
  await page.screenshot({ path: path.join(OUT, 'r2-01-masthead.png') });

  console.log('--- B. 宣傳卡 + 自動輪播 ---');
  const strip = await page.evaluate(() => {
    const el = document.querySelector('[aria-label="门店精选，左右滑动"]');
    if (!el) return null;
    const dots = document.querySelectorAll('[aria-label="切换推荐"] button');
    const cards = Array.from(el.children);
    const first = cards[0];
    const img = first?.querySelector('img');
    const titleEl = first?.querySelector('span.font-display-italic');
    const tagEl = first?.querySelector('span.font-mono');
    const hintEl = first?.querySelector('p');
    const capH = first ? first.getBoundingClientRect().height - (img?.getBoundingClientRect().height || 0) : 0;
    const oneLine = el => {
      if (!el) return true;
      const cs = getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      return el.getBoundingClientRect().height <= lh * 1.35;
    };
    return {
      scrollable: el.scrollWidth > el.clientWidth + 20,
      overflowX: getComputedStyle(el).overflowX,
      snap: getComputedStyle(el).scrollSnapType,
      cards: cards.length,
      dots: dots.length,
      cardWidth: first ? first.getBoundingClientRect().width : 0,
      cardHeight: first ? first.getBoundingClientRect().height : 0,
      capH: Math.round(capH),
      viewport: window.innerWidth,
      hasImg: Array.from(el.querySelectorAll('img')).every(i => i.naturalWidth > 0),
      imgRatio: img ? (img.naturalWidth / img.naturalHeight).toFixed(2) : null,
      titleFont: titleEl ? parseFloat(getComputedStyle(titleEl).fontSize) : 0,
      titleText: titleEl ? titleEl.innerText.trim() : '',
      titleOneLine: oneLine(titleEl),
      tagFont: tagEl ? parseFloat(getComputedStyle(tagEl).fontSize) : 0,
      tagText: tagEl ? tagEl.innerText.trim() : '',
      hintFont: hintEl ? parseFloat(getComputedStyle(hintEl).fontSize) : 0,
      hintText: hintEl ? hintEl.innerText.trim() : '',
      hintOneLine: oneLine(hintEl),
      capFits: capH <= 90,
    };
  });
  check('宣傳卡係橫向可掃', strip && strip.scrollable && strip.overflowX === 'auto', strip && JSON.stringify({ sw: strip.scrollable, ox: strip.overflowX }));
  check('有 snap 吸附', strip && strip.snap.includes('x'), strip && strip.snap);
  check('4 張卡', strip && strip.cards === 4, strip && strip.cards);
  check('4 個頁數點', strip && strip.dots === 4, strip && strip.dots);
  check('圖片全部載入成功', strip && strip.hasImg);
  check('卡片闊度接近全屏', strip && strip.cardWidth > strip.viewport * 0.7, strip && `${Math.round(strip.cardWidth)}/${strip.viewport}`);
  check('宣傳圖係 4:3 裁切（海報完整唔會剪走）', strip && strip.imgRatio === '1.33', strip && strip.imgRatio);
  check('卡片標題字級 >= 22px', strip && strip.titleFont >= 22, strip && `${strip.titleFont}px`);
  check('卡片標籤字級 >= 10px', strip && strip.tagFont >= 10, strip && `${strip.tagFont}px`);
  check('藍色文案區 <= 90px（唔再霸佔成張卡）', strip && strip.capFits, strip && `${strip.capH}px / 卡高 ${strip.cardHeight}px`);
  check('標題單行唔會斷', strip && strip.titleOneLine, strip && strip.titleText);
  check('副句單行唔會斷', strip && strip.hintOneLine, strip && strip.hintText);
  check('標題係短標題（<= 6 字）', strip && strip.titleText.length <= 6, strip && strip.titleText);
  check('英文 tag 仍然存在', strip && /MEMBERSHIP|GROOMING|BOARDING/.test(strip.tagText || ''), strip && strip.tagText);

  // B0b) 宣传海报 lightbox（由 Lovable 版移植：点卡面睇完整海报）
  const lightbox = await page.evaluate(() => {
    const strip = document.querySelector('[aria-label="门店精选，左右滑动"]');
    const card = strip?.firstElementChild;
    const imgBtn = card?.querySelector('button[aria-label^="查看大图"]');
    const captionBtn = card?.querySelectorAll('button')[1];
    return {
      hasImageBtn: !!imgBtn,
      hasCaptionBtn: !!captionBtn,
      cardIsButton: card?.tagName === 'BUTTON',
      cardFaceSrc: card?.querySelector('img')?.getAttribute('src') || null,
      magnifier: !!card?.querySelector('span[aria-hidden="true"]'),
    };
  });
  check('卡面係独立按钮（点图放大）', lightbox.hasImageBtn, JSON.stringify(lightbox));
  check('卡面文案仍然係按钮（跳去价目表）', lightbox.hasCaptionBtn, JSON.stringify(lightbox));
  check('卡面唔係整个 <button>（图/文案分区）', lightbox.cardIsButton === false, `card=${lightbox.cardIsButton}`);
  check('卡面仍然用裁切图（4:3 唔系完整海报）', /homepage-promo\/(membership|care|boarding)\.webp$/.test(lightbox.cardFaceSrc || ''), lightbox.cardFaceSrc);
  check('卡面有放大提示图标', lightbox.magnifier);

  // 点卡面 -> 开 lightbox（完整海报）
  await page.evaluate(() => {
    const strip = document.querySelector('[aria-label="门店精选，左右滑动"]');
    const btn = strip?.firstElementChild?.querySelector('button[aria-label^="查看大图"]');
    btn?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  });
  await sleep(900);
  const zoom = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label="宣传图大图"]');
    const img = dlg?.querySelector('img');
    return {
      open: !!dlg,
      src: img?.getAttribute('src') || null,
      loaded: img ? img.naturalWidth > 0 : false,
      natural: img ? `${img.naturalWidth}x${img.naturalHeight}` : null,
      hasClose: !!dlg?.querySelector('button[aria-label="关闭"]'),
      fixed: dlg ? getComputedStyle(dlg).position : null,
    };
  });
  check('点卡面打开完整海报大图', zoom.open, JSON.stringify(zoom));
  check('大图用完整海报（-full.webp）', /-full\.webp$/.test(zoom.src || ''), zoom.src);
  check('完整海报成功载入', zoom.loaded, zoom.natural);
  check('大图有关闭掣', zoom.hasClose);
  check('大图全屏遮罩（fixed）', zoom.fixed === 'fixed', zoom.fixed);
  await page.screenshot({ path: path.join(OUT, 'r2-01b-lightbox.png') });

  // 点背景关闭
  await page.evaluate(() => {
    document.querySelector('[role="dialog"][aria-label="宣传图大图"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  });
  await sleep(600);
  const closed = await page.evaluate(() => !document.querySelector('[role="dialog"][aria-label="宣传图大图"]'));
  check('点背景关闭大图', closed);

  // B0c) 第四张「洗护方案」卡：卡面无品牌栏，全屏显示完整原版海报
  const washPlan = await page.evaluate(() => {
    const strip = document.querySelector('[aria-label="门店精选，左右滑动"]');
    const cards = Array.from(strip?.children || []);
    const wp = cards.find(c => (c.querySelector('img')?.getAttribute('src') || '').includes('wash-plan'));
    const imgBtn = wp?.querySelector('button[aria-label^="查看大图"]');
    return {
      exists: !!wp,
      cardSrc: wp?.querySelector('img')?.getAttribute('src') || null,
      label: imgBtn?.getAttribute('aria-label') || null,
      title: wp?.querySelector('span.font-display-italic')?.innerText.trim() || null,
      tag: wp?.querySelector('span.font-mono')?.innerText.trim() || null,
      ratio: wp?.querySelector('img') ? (wp.querySelector('img').naturalWidth / wp.querySelector('img').naturalHeight).toFixed(2) : null,
    };
  });
  check('第 4 张「洗护方案」卡存在', washPlan.exists, JSON.stringify(washPlan));
  check('洗护方案卡面用无品牌栏版本', /wash-plan\.webp$/.test(washPlan.cardSrc || ''), washPlan.cardSrc);
  check('洗护方案卡面係 4:3', washPlan.ratio === '1.33', washPlan.ratio);
  check('洗护方案标题 = 洗护方案', washPlan.title === '洗护方案', washPlan.title);
  check('洗护方案英文 tag = WASH PLAN', washPlan.tag === 'WASH PLAN', washPlan.tag);

  // 点洗护方案卡面 -> 全屏完整原版海报（含左側品牌欄）
  await page.evaluate(() => {
    const strip = document.querySelector('[aria-label="门店精选，左右滑动"]');
    const wp = Array.from(strip?.children || []).find(c => (c.querySelector('img')?.getAttribute('src') || '').includes('wash-plan'));
    wp?.querySelector('button[aria-label^="查看大图"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  });
  await sleep(900);
  const wpZoom = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"][aria-label="宣传图大图"]');
    const img = dlg?.querySelector('img');
    return { open: !!dlg, src: img?.getAttribute('src') || null, loaded: img ? img.naturalWidth > 0 : false };
  });
  check('点洗护方案卡面打开完整原版海报', wpZoom.open, JSON.stringify(wpZoom));
  check('完整原版海报用 wash-plan-full.webp', /wash-plan-full\.webp$/.test(wpZoom.src || ''), wpZoom.src);
  check('洗护方案完整海报成功载入', wpZoom.loaded);
  await page.screenshot({ path: path.join(OUT, 'r2-01c-washplan-lightbox.png') });
  await page.evaluate(() => {
    document.querySelector('[role="dialog"][aria-label="宣传图大图"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  });
  await sleep(500);

  // B1) 自動輪播：唔掂都應該自己郁
  const autoBefore = await page.evaluate(() => {
    const el = document.querySelector('[aria-label="门店精选，左右滑动"]');
    const dots = Array.from(document.querySelectorAll('[aria-label="切换推荐"] button'));
    return { left: el.scrollLeft, dot: dots.findIndex(d => d.getAttribute('aria-current') === 'true') };
  });
  await sleep(6500);
  const autoAfter = await page.evaluate(() => {
    const el = document.querySelector('[aria-label="门店精选，左右滑动"]');
    const dots = Array.from(document.querySelectorAll('[aria-label="切换推荐"] button'));
    return { left: el.scrollLeft, dot: dots.findIndex(d => d.getAttribute('aria-current') === 'true') };
  });
  const moved = Math.abs(autoAfter.left - autoBefore.left) > 5 || autoAfter.dot !== autoBefore.dot;
  check('自動輪播：6.5 秒內自己換咗卡', moved, `left ${Math.round(autoBefore.left)}->${Math.round(autoAfter.left)}, dot ${autoBefore.dot}->${autoAfter.dot}`);
  await page.screenshot({ path: path.join(OUT, 'r2-02-autoplay.png') });

  // B2) 手動掃動 → 頁數點跟住郁（自動輪播掃完會停 9 秒，所以呢段唔會被自動掃走）
  await page.evaluate(() => {
    const el = document.querySelector('[aria-label="门店精选，左右滑动"]');
    const first = el.firstElementChild;
    el.scrollTo({ left: first.offsetWidth + 12, behavior: 'auto' });
  });
  await sleep(1200);
  const dotAfter = await page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('[aria-label="切换推荐"] button'));
    return dots.findIndex(d => d.getAttribute('aria-current') === 'true');
  });
  check('手掃之後頁數點跟住變', dotAfter === 1, `current=${dotAfter}`);
  await page.screenshot({ path: path.join(OUT, 'r2-03-swiped.png') });

  console.log('--- C. 價目表排版 + 字級 ---');
  const EXPECT = {
    '狗狗洗护': { must: ['¥80', '¥98', '35–40 KG', '¥220', '¥238', '加收¥10/只', '预约此服务 · 标准洗', '预约此服务 · 精致洗'], forbidden: ['¥68', '¥240', '¥80/天', '剪指甲', '药浴', 'SPA淋巴排毒'] },
    '猫咪洗护': { must: ['¥68', '¥88', '¥108', '¥128', '¥148', '¥168', '另行报价', '加收¥10/只', '查看可约档期'], forbidden: ['预约此服务', '¥80/天', '咨询档期', '复制微信'] },
    '美容造型': { must: ['¥120', '¥180', '¥210', '¥270', '10 KG以上', '¥240', '¥300', '特别造型', '另行报价', '预约此服务 · 美容'], forbidden: ['20 KG以上', 'SPA淋巴排毒', '开结'] },
    '寄养住宿': { must: ['小房', '大房', '¥80/天', '¥120/天', '加¥40/只', '查看可约档期', '房态', '空房可订', '寄养中'], forbidden: ['迷你房', '舒适房', '阳光房', '家庭房', '¥100/天', '¥160/天', '预约此服务', '咨询档期', '复制微信', '已占用'] },
    '单选项目': { must: ['剪指甲', '刷牙', '剃脚底毛', '贵宾脚', '药浴', '局部去油', '全身美白（30斤内）', 'SPA淋巴排毒', '开结', '深层去毛', '¥20', '¥50', '¥100/小时', '¥20–100', '去预约洗护 / 造型'], forbidden: ['¥80/天', '¥120/天', '¥98', '房态'] },
  };
  for (const [tab, exp] of Object.entries(EXPECT)) {
    await page.evaluate((t) => {
      const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === t);
      if (b) b.click();
    }, tab);
    await sleep(700);
    // 只睇价目卡嗰个 section：宣傳卡嘅文案（例如「实时房态可查」）唔属于任何分页
    const text = await page.evaluate(() => {
      const s = document.querySelector('section#section-status');
      return s ? s.innerText : document.body.innerText;
    });
    const missing = exp.must.filter(m => !text.includes(m));
    const leaked = exp.forbidden.filter(f => text.includes(f));
    check(`${tab} 價目正確`, missing.length === 0 && leaked.length === 0,
      missing.length ? `缺少 ${missing.join(',')}` : leaked.length ? `出現唔應該有嘅 ${leaked.join(',')}` : '');

    // 幾何：標籤欄唔可以窄到逐隻字斷行；價錢唔可以行入右邊側欄
    const geo = await page.evaluate(() => {
      // 价目表行：inline style 有 minmax(0px, 1fr)，而且系价格表专属嘅 class（pb-2 标题行 / py-2.5 数据行）。
      // 唔可以净係睇 minmax —— 房态板嘅房格 grid 都用 minmax，唔系价格行。
      const headerRow = Array.from(document.querySelectorAll('div')).find(d =>
        (d.getAttribute('style') || '').includes('minmax(') && (d.className || '').includes('pb-2'));
      if (!headerRow) return { error: '搵唔到價目表標題行' };
      const dataRows = Array.from(headerRow.parentElement.children).filter(d =>
        d !== headerRow && (d.getAttribute('style') || '').includes('minmax('));
      const labels = [], prices = [];
      dataRows.forEach(r => {
        const kids = Array.from(r.children);
        const label = kids[0];
        if (!label) return;
        const lh = parseFloat(getComputedStyle(label).lineHeight) || 16;
        labels.push({ w: label.getBoundingClientRect().width, h: label.getBoundingClientRect().height, lh, text: label.innerText.trim().slice(0, 12) });
        kids.slice(1).forEach(k => prices.push(k.getBoundingClientRect().right));
      });
      const scope = headerRow.closest('div.p-5') || headerRow.parentElement.parentElement;
      const rail = document.querySelector('div.fixed.right-2') || document.querySelector('div.fixed');
      const railRect = rail ? rail.getBoundingClientRect() : null;
      const card = scope.querySelector('h3');
      const notes = Array.from(scope.querySelectorAll('ul li'));
      const priceFont = (() => {
        const p = dataRows[0] && dataRows[0].children[1];
        return p ? parseFloat(getComputedStyle(p).fontSize) : 0;
      })();
      const labelFont = (() => {
        const l = dataRows[0] && dataRows[0].children[0];
        return l ? parseFloat(getComputedStyle(l).fontSize) : 0;
      })();
      const headerSpan = headerRow.children[0];
      return {
        rowCount: dataRows.length,
        labels,
        maxPriceRight: prices.length ? Math.max(...prices) : 0,
        railLeft: railRect ? railRect.left : null,
        titleFont: card ? parseFloat(getComputedStyle(card).fontSize) : 0,
        noteFont: notes.length ? parseFloat(getComputedStyle(notes[0]).fontSize) : 0,
        priceFont, labelFont,
        headerFont: headerSpan ? parseFloat(getComputedStyle(headerSpan).fontSize) : 0,
        headerText: headerSpan ? headerSpan.innerText.trim() : '',
        headerH: headerSpan ? headerSpan.getBoundingClientRect().height : 0,
        headerLH: headerSpan ? (parseFloat(getComputedStyle(headerSpan).lineHeight) || 16) : 16,
      };
    });
    if (geo.error) { check(`${tab} 價目表搵到`, false, geo.error); continue; }
    check(`${tab} 價目表有資料行`, geo.rowCount > 0, `rows=${geo.rowCount}`);
    const squeezed = geo.labels.filter(l => l.h > l.lh * 2.2);
    const minLabelW = geo.labels.length ? Math.min(...geo.labels.map(l => l.w)) : 0;
    check(`${tab} 標籤欄唔會逐隻字斷行`, squeezed.length === 0 && geo.labels.length > 0, squeezed.length ? JSON.stringify(squeezed.slice(0, 3)) : `min width=${Math.round(minLabelW)}px`);
    check(`${tab} 標籤欄闊度 >= 90px`, minLabelW >= 90, `${Math.round(minLabelW)}px`);
    check(`${tab} 欄目標題唔會斷行（「${geo.headerText}」）`, geo.headerH <= geo.headerLH * 1.6, `h=${Math.round(geo.headerH)}, lh=${Math.round(geo.headerLH)}`);
    const overlapsRail = geo.railLeft !== null && geo.maxPriceRight > geo.railLeft;
    check(`${tab} 價錢唔會行入右邊側欄`, !overlapsRail, `price right=${Math.round(geo.maxPriceRight)}, rail left=${Math.round(geo.railLeft || 0)}`);
    check(`${tab} 價目字級 >= 16px`, geo.priceFont >= 16, `${geo.priceFont}px`);
    check(`${tab} 標籤字級 >= 16px`, geo.labelFont >= 16, `${geo.labelFont}px`);
    check(`${tab} 備註字級 >= 13px`, geo.noteFont >= 13, `${geo.noteFont}px`);
    check(`${tab} 菜單標題字級 >= 28px`, geo.titleFont >= 28, `${geo.titleFont}px`);
    await page.screenshot({ path: path.join(OUT, `r2-tab-${tab}.png`) });
  }

  console.log('--- D. 預約流程 + 表單合約 ---');
  // 價目表只應該出現一次（之前重複咗舊 <table> 版本）
  const dupSections = await page.evaluate(() => document.querySelectorAll('section#section-status').length);
  check('價目表只有一個（冇重複舊版）', dupSections === 1, `section#section-status = ${dupSections}`);
  const noWechat = await page.evaluate(() => {
    const t = document.body.innerText;
    return { copy: t.includes('已复制微信号') || t.includes('复制微信'), contact: t.includes('联系微信') };
  });
  check('頁面冇複製微信掣', noWechat.copy === false, JSON.stringify(noWechat));

  // 「查看可约档期」→ 跳去日期欄 + 備註預填
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === '寄养住宿');
    if (b) b.click();
  });
  await sleep(600);
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === '查看可约档期');
    if (b) b.click();
  });
  await sleep(1600);
  const slots = await page.evaluate(() => {
    const date = document.querySelector('#booking-form input[type="date"]');
    const notes = document.querySelector('#booking-form textarea');
    const timeSel = Array.from(document.querySelectorAll('#booking-form select')).find(s =>
      Array.from(s.options).some(o => o.text.includes('选择时间')));
    const serviceSel = Array.from(document.querySelectorAll('#booking-form select')).find(s =>
      Array.from(s.options).some(o => o.text === '寄养'));
    return {
      dateVisible: date ? Math.abs(date.getBoundingClientRect().top) < 420 : false,
      dateValue: date ? date.value : null,
      notes: notes ? notes.value : null,
      serviceType: serviceSel ? serviceSel.value : null,
      serviceOptions: serviceSel ? Array.from(serviceSel.options).map(o => o.text) : [],
      timeOptions: timeSel ? timeSel.options.length : 0,
      hasTimeSelect: !!timeSel,
    };
  });
  check('撳「查看可约档期」跳到日期欄', slots.dateVisible, JSON.stringify(slots));
  check('寄养服务类型已自动预选', slots.serviceType === '寄养', `select=${slots.serviceType}`);
  check('服务类型下拉有「寄养」可选', slots.serviceOptions.includes('寄养'), JSON.stringify(slots.serviceOptions));
  check('寄养唔会乱填备注（服务类型已讲明）', slots.notes === '', `notes=${slots.notes}`);
  check('時間欄喺度（客人自己睇时段）', slots.hasTimeSelect, JSON.stringify({ opts: slots.timeOptions }));

  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === '狗狗洗护');
    if (b) b.click();
  });
  await sleep(500);
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('预约此服务 · 精致洗'));
    if (b) b.click();
  });
  await sleep(1400);
  const afterBook = await page.evaluate(() => {
    const sel = document.querySelector('select');
    const form = document.getElementById('booking-form');
    return { service: sel ? sel.value : null, scrolledToForm: form ? Math.abs(form.getBoundingClientRect().top) < 300 : false };
  });
  check('撳「预约此服务」已預選服務類型', afterBook.service === '精致洗', `select=${afterBook.service}`);
  check('已捲去表單', afterBook.scrolledToForm);
  await page.screenshot({ path: path.join(OUT, 'r2-04-book.png') });

  const formState = await page.evaluate(() => {
    const form = document.querySelector('form');
    const placeholders = Array.from(form.querySelectorAll('[placeholder]')).map(i => i.getAttribute('placeholder'));
    const submit = Array.from(form.querySelectorAll('button')).find(b => b.textContent.includes('提交预约'));
    return {
      placeholders,
      hasDate: !!form.querySelector('input[type="date"]'),
      hasTime: Array.from(form.querySelectorAll('select')).some(s => Array.from(s.options).some(o => o.text.includes('选择时间'))),
      submitText: submit ? submit.textContent.trim() : null,
      hasError: !!(submit && submit.textContent.includes('提交预约')),
    };
  });
  check('placeholder 齊全', JSON.stringify(formState.placeholders) === JSON.stringify(['请输入您的姓名', '请输入手机号码', '请输入宠物名字', '如有特殊需求请备注']), JSON.stringify(formState.placeholders));
  check('有日期欄', formState.hasDate);
  check('有時間欄', formState.hasTime);
  check('提交掣叫「提交预约」', formState.submitText === '提交预约', formState.submitText);
  await page.screenshot({ path: path.join(OUT, 'r2-05-form.png') });

  const overlap = await page.evaluate(() => {
    const form = document.querySelector('form');
    const submit = Array.from(form.querySelectorAll('button')).find(b => b.textContent.includes('提交预约'));
    const nav = document.querySelector('nav.sticky');
    const s = submit.getBoundingClientRect();
    const n = nav ? nav.getBoundingClientRect() : null;
    return { overlaps: n ? s.bottom > n.top && s.top < n.bottom : false, navIsSticky: nav ? getComputedStyle(nav).position : null };
  });
  check('表單提交掣冇被底部 Navigation 遮住', overlap.overlaps === false, JSON.stringify(overlap));

  console.log('--- F. 房态板 + 寄养表單欄位（5 间房、绿灯空房红灯占用） ---');
  // 撳寄养住宿分页
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.trim() === '寄养住宿');
    if (b) b.click();
  });
  await sleep(1000);
  const board = await page.evaluate(() => {
    const wrap = document.querySelector('[data-room-board]');
    if (!wrap) return { found: false };
    const tiles = Array.from(wrap.querySelectorAll('[data-room]'));
    const dateInput = wrap.querySelector('input[type="date"]');
    const legend = wrap.innerText;
    const dotColors = Array.from(wrap.querySelectorAll('span.rounded-full')).map(s => getComputedStyle(s).backgroundColor);
    return {
      found: true,
      tiles: tiles.map(t => ({ name: t.dataset.room, state: t.dataset.roomState })),
      hasDate: !!dateInput,
      dateValue: dateInput ? dateInput.value : null,
      legendGreen: dotColors.some(c => c === 'rgb(34, 197, 94)'),
      legendRed: dotColors.some(c => c === 'rgb(239, 68, 68)'),
      legendText: legend.replace(/\s+/g, ' ').slice(0, 120),
      groups: Array.from(wrap.querySelectorAll('p')).map(p => p.innerText.trim()).filter(Boolean),
      overflow: wrap.scrollWidth > wrap.clientWidth + 1,
    };
  });
  check('房态板存在', board.found, JSON.stringify(board).slice(0, 200));
  check('房态板有 5 间房', board.tiles && board.tiles.length === 5, board.tiles && board.tiles.map(t => t.name).join(','));
  check('房名正确（小房1-3、大房1-2）', board.tiles && JSON.stringify(board.tiles.map(t => t.name)) === JSON.stringify(['小房1', '小房2', '小房3', '大房1', '大房2']), board.tiles && board.tiles.map(t => t.name).join(','));
  check('每间房都有状态（free/busy）', board.tiles && board.tiles.every(t => t.state === 'free' || t.state === 'busy'), board.tiles && board.tiles.map(t => `${t.name}:${t.state}`).join(','));
  check('房态板有日期选择', board.hasDate, `date=${board.dateValue}`);
  check('图例有绿灯（空房）', board.legendGreen);
  check('图例有红灯（占用）', board.legendRed);
  check('房态板冇横向溢出', board.overflow === false);
  check('小房/大房分组正确', board.groups && board.groups.some(g => g.includes('小房 · 小型一只')) && board.groups.some(g => g.includes('大房 · 小型三只／大型一只')), board.groups && board.groups.join(' | '));
  await page.screenshot({ path: path.join(OUT, 'r3-01-room-board.png') });

  // 表单：拣寄养 → 应该有「选择房间」同「退房日期」
  await page.evaluate(() => {
    const sel = Array.from(document.querySelectorAll('#booking-form select')).find(s =>
      Array.from(s.options).some(o => o.text === '寄养'));
    if (sel) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
      setter.call(sel, '寄养');
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(900);
  const roomForm = await page.evaluate(() => {
    const form = document.getElementById('booking-form');
    const labels = Array.from(form.querySelectorAll('label')).map(l => l.innerText.trim());
    const roomSel = Array.from(form.querySelectorAll('select')).find(s =>
      Array.from(s.options).some(o => o.text.includes('请选择房间')));
    const dateInputs = Array.from(form.querySelectorAll('input[type="date"]'));
    const checkOut = dateInputs.find(i => {
      const lab = i.closest('div')?.querySelector('label');
      return lab && lab.innerText.includes('退房日期');
    });
    const bookDate = dateInputs.find(i => {
      const lab = i.closest('div')?.querySelector('label');
      return lab && lab.innerText.includes('预约日期');
    });
    return {
      labels,
      hasRoomLabel: labels.some(l => l.includes('选择房间')),
      hasCheckOutLabel: labels.some(l => l.includes('退房日期')),
      roomOptions: roomSel ? Array.from(roomSel.options).map(o => o.text) : null,
      checkOutRequired: checkOut ? checkOut.required : null,
      checkOutMin: checkOut ? checkOut.min : null,
      bookDateValue: bookDate ? bookDate.value : null,
      checkOutValue: checkOut ? checkOut.value : null,
    };
  });
  check('表單有「选择房间」栏', roomForm.hasRoomLabel, JSON.stringify(roomForm.labels));
  check('表單有「退房日期」栏', roomForm.hasCheckOutLabel);
  check('房间下拉有 5 间房 + 一个空提示', roomForm.roomOptions && roomForm.roomOptions.length === 6, roomForm.roomOptions && roomForm.roomOptions.join(' | '));
  check('退房日期係必填', roomForm.checkOutRequired === true, `required=${roomForm.checkOutRequired}`);
  check('退房日期有 min 限制', typeof roomForm.checkOutMin === 'string' && roomForm.checkOutMin.length === 10, `min=${roomForm.checkOutMin}`);
  await page.screenshot({ path: path.join(OUT, 'r3-02-room-form.png') });

  // 填入住日期 → 房态板同步 + 房间下拉出现占用状态
  await page.evaluate(() => {
    const dateInputs = Array.from(document.querySelectorAll('#booking-form input[type="date"]'));
    const bookDate = dateInputs.find(i => {
      const lab = i.closest('div')?.querySelector('label');
      return lab && lab.innerText.includes('预约日期');
    });
    if (!bookDate) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(bookDate, '2026-12-01');
    bookDate.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await sleep(2800);
  const afterDate = await page.evaluate(() => {
    const wrap = document.querySelector('[data-room-board]');
    const boardDate = wrap?.querySelector('input[type="date"]');
    const roomSel = Array.from(document.querySelectorAll('#booking-form select')).find(s =>
      Array.from(s.options).some(o => o.text.includes('请选择房间')));
    const checkOut = Array.from(document.querySelectorAll('#booking-form input[type="date"]')).find(i => {
      const lab = i.closest('div')?.querySelector('label');
      return lab && lab.innerText.includes('退房日期');
    });
    return {
      boardDate: boardDate ? boardDate.value : null,
      selectedRoom: roomSel ? roomSel.value : null,
      roomOptions: roomSel ? Array.from(roomSel.options).map(o => ({ t: o.text, d: o.disabled })) : null,
      checkOutMin: checkOut ? checkOut.min : null,
    };
  });
  check('房态板跟住表单日期走', afterDate.boardDate === '2026-12-01', `board=${afterDate.boardDate}`);
  check('自动揀咗一间空房', !!afterDate.selectedRoom, `room=${afterDate.selectedRoom}`);
  check('退房日期 min = 入住日期 + 1 日', afterDate.checkOutMin === '2026-12-02', `min=${afterDate.checkOutMin}`);
  check('房间下拉每间房都有可用状态', afterDate.roomOptions && afterDate.roomOptions.filter(o => o.t !== '请选择房间').length === 5 && afterDate.roomOptions.some(o => o.t.includes('空房可订')), afterDate.roomOptions && afterDate.roomOptions.map(o => `${o.t}${o.d ? '(x)' : ''}`).join(' | '));
  await page.screenshot({ path: path.join(OUT, 'r3-03-room-picked.png') });

  console.log('--- G. 寄养唔喺 Live 板 + 导览 + 冇横向溢出 ---');
  // 寄养唔应该出现喺「门店实况」Live 板：寄养嘅状态由房态板讲（空房可订 / 寄养中）
  await page.evaluate(() => {
    const seed = [
      {
        id: '__live_boarding__', ownerName: 'tester', phone: '13800138000', petName: '__BOARD_PET__',
        serviceType: '寄养', weightRange: { label: '5kg以下', min: 0, max: 0 },
        bookingDateTime: '2026-12-01 10:00', vaccineDate: '', outsideGroomed: false, emotionStable: true,
        notes: '', status: '服务中', currentPhase: '服务进行中', currentStep: 1, progress: 0,
        wechatNoticeSent: false, displayInServiceList: true, createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), serviceStartedAt: '', isPaused: false,
      },
      {
        id: '__live_wash__', ownerName: 'tester', phone: '13800138000', petName: '__WASH_PET__',
        serviceType: '精致洗', weightRange: { label: '5kg以下', min: 0, max: 0 },
        bookingDateTime: '2026-12-01 10:00', vaccineDate: '', outsideGroomed: false, emotionStable: true,
        notes: '', status: '服务中', currentPhase: '服务进行中', currentStep: 1, progress: 0,
        wechatNoticeSent: false, displayInServiceList: true, createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(), serviceStartedAt: '', isPaused: false,
      },
    ];
    localStorage.setItem('jingangchong_h5_v2', JSON.stringify(seed));
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(2500);
  await page.evaluate(() => {
    const d = document.querySelector('details#section-active');
    if (d) d.open = true;
  });
  await sleep(700);
  const liveBoard = await page.evaluate(() => {
    const d = document.querySelector('details#section-active');
    if (!d) return null;
    const t = d.innerText;
    const statCards = Array.from(d.querySelectorAll('.grid-cols-3 > div')).map(c => c.innerText.replace(/\s+/g, ' ').trim());
    return {
      hasBoarding: t.includes('__BOARD_PET__'),
      hasWash: t.includes('__WASH_PET__'),
      statCards,
    };
  });
  check('寄养唔出现喺门店实况 Live 板', liveBoard && liveBoard.hasBoarding === false, JSON.stringify(liveBoard));
  check('洗护仲係会出现喺 Live 板', liveBoard && liveBoard.hasWash === true, JSON.stringify(liveBoard && liveBoard.hasWash));
  check('Live 板统计卡唔会计埋寄养', liveBoard && liveBoard.statCards.every(c => !c.includes('2')), JSON.stringify(liveBoard && liveBoard.statCards));
  await page.screenshot({ path: path.join(OUT, 'r3-04-live-no-boarding.png') });
  await page.evaluate(() => localStorage.removeItem('jingangchong_h5_v2'));

  const live = await page.evaluate(() => {
    const rail = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('实况'));
    if (rail) rail.click();
    return !!rail;
  });
  await sleep(1200);
  const detailsOpen = await page.evaluate(() => {
    const d = document.querySelector('details#section-active');
    return d ? { open: d.open, hasBoard: !!d.querySelector('.grid-cols-3'), summary: d.querySelector('summary')?.innerText.trim() } : null;
  });
  check('撳「实况」會展開门店实况', detailsOpen && detailsOpen.open === true, JSON.stringify(detailsOpen));
  check('展開後有真實 Live 看板', detailsOpen && detailsOpen.hasBoard);
  check('標題係「门店实况 · 查看详情」', detailsOpen && (detailsOpen.summary || '').includes('门店实况 · 查看详情'), detailsOpen && detailsOpen.summary);

  const railItems = await page.evaluate(() => Array.from(document.querySelectorAll('.fixed button')).map(b => b.innerText.trim().split('\n')[0]));
  check('側邊導覽 = 价目 / 实况 / 预约', JSON.stringify(railItems) === JSON.stringify(['价目', '实况', '预约']), JSON.stringify(railItems));

  const overflow = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    win: window.innerWidth,
    body: document.body.scrollWidth,
  }));
  check('頁面冇橫向溢出（唔會左右搖）', overflow.doc <= overflow.win + 1 && overflow.body <= overflow.win + 1, JSON.stringify(overflow));

  console.log(`\n結果: ${pass} pass / ${fail} fail`);
  await browser.disconnect();
  process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('✘ ' + e.message); process.exit(1); });
