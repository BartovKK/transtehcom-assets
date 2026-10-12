(function () {
  'use strict';

  /* Тексты интерфейса на трёх языках (язык берётся из <html lang>) */
  var I18N = {
    ru: {
      menuOpen: 'Открыть меню', menuClose: 'Закрыть меню', copied: 'Скопировано',
      mb: 'МБ', kb: 'КБ', sending: 'Отправляем…',
      fileMode: 'Сайт открыт как файл с компьютера, поэтому форма не может отправить заявку. Она работает только на сервере с PHP: на хостинге или на локальном PHP-сервере (см. README).',
      failed: 'Не удалось отправить заявку', code: 'код', callUs: 'Позвоните нам: 8 800 444-83-85.',
      offline: 'Нет связи с сервером. Проверьте интернет или позвоните нам: 8 800 444-83-85.'
    },
    en: {
      menuOpen: 'Open menu', menuClose: 'Close menu', copied: 'Copied',
      mb: 'MB', kb: 'KB', sending: 'Sending…',
      fileMode: 'The site is opened as a local file, so the form cannot send a request. It works only on a server with PHP (see README).',
      failed: 'Could not send the request', code: 'code', callUs: 'Please call us: +7 800 444-83-85.',
      offline: 'No connection to the server. Check your internet connection or call us: +7 800 444-83-85.'
    },
    zh: {
      menuOpen: '打开菜单', menuClose: '关闭菜单', copied: '已复制',
      mb: 'MB', kb: 'KB', sending: '正在发送…',
      fileMode: '网站以本地文件方式打开，表单无法发送。表单仅在支持 PHP 的服务器上运行（见 README）。',
      failed: '申请发送失败', code: '代码', callUs: '请致电：+7 800 444-83-85。',
      offline: '无法连接服务器。请检查网络或致电：+7 800 444-83-85。'
    }
  };
  var LANG = ((document.querySelector('.tth[lang]') || document.documentElement).lang || 'ru').slice(0, 2);
  var T = I18N[LANG] || I18N.ru;

  /* Шапка: линия при прокрутке */
  var header = document.getElementById('header');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Мобильное меню */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? T.menuClose : T.menuOpen);
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeDropdowns(); } });

  /* Выпадающие меню в шапке: «Презентации» и язык */
  var dds = Array.prototype.slice.call(document.querySelectorAll('.dd'));
  function closeDropdowns(except) {
    dds.forEach(function (dd) {
      if (dd === except) return;
      dd.querySelector('.tool').setAttribute('aria-expanded', 'false');
      dd.querySelector('.dd-menu').hidden = true;
    });
  }
  dds.forEach(function (dd) {
    var btn = dd.querySelector('.tool');
    var menu = dd.querySelector('.dd-menu');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = menu.hidden;
      closeDropdowns(dd);
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
    });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.dd')) closeDropdowns(); });

  /* Вкладки кейсов */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length], true);
      if (e.key === 'ArrowLeft') selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });

  /* Кнопки «Копировать» на странице реквизитов */
  function copyText(text, btn) {
    function ok() {
      var label = btn.textContent;
      btn.classList.add('done'); btn.textContent = T.copied;
      setTimeout(function () { btn.classList.remove('done'); btn.textContent = label; }, 1600);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(ok, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) {}
      document.body.removeChild(ta);
    }
  }
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () { copyText(b.getAttribute('data-copy'), b); });
  });
  document.querySelectorAll('[data-copy-all]').forEach(function (b) {
    b.addEventListener('click', function () {
      var rows = [];
      document.querySelectorAll('.req-table tr').forEach(function (tr) {
        var th = tr.querySelector('th'), c = tr.querySelector('[data-copy]');
        if (th && c) rows.push(th.textContent.trim() + ': ' + c.getAttribute('data-copy'));
      });
      copyText(rows.join('\n'), b);
    });
  });

  /* Дальше только для страницы с формой */
  if (!document.getElementById('form')) return;

  /* Кнопки, которые сразу выбирают тему заявки */
  var topic = document.getElementById('f-topic');
  document.querySelectorAll('[data-topic]').forEach(function (a) {
    a.addEventListener('click', function () { topic.value = a.getAttribute('data-topic'); });
  });

  /* Файлы */
  var MAX = 20 * 1024 * 1024;
  var input = document.getElementById('f-files');
  var drop = document.getElementById('drop');
  var list = document.getElementById('files');
  var filesErr = document.getElementById('files-err');
  function fmt(b) { return b > 1048576 ? (b / 1048576).toFixed(1).replace('.', LANG === 'ru' ? ',' : '.') + ' ' + T.mb : Math.max(1, Math.round(b / 1024)) + ' ' + T.kb; }
  function renderFiles() {
    list.innerHTML = '';
    var total = 0;
    Array.prototype.forEach.call(input.files, function (f) {
      total += f.size;
      var li = document.createElement('li');
      var n = document.createElement('span'); n.textContent = f.name;
      var s = document.createElement('span'); s.textContent = fmt(f.size);
      li.appendChild(n); li.appendChild(s); list.appendChild(li);
    });
    var tooBig = total > MAX;
    filesErr.parentElement.classList.toggle('invalid', tooBig);
    return !tooBig;
  }
  input.addEventListener('change', renderFiles);
  ['dragenter', 'dragover'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); });
  });
  drop.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files.length) { input.files = e.dataTransfer.files; renderFiles(); }
  });

  /* Проверка и отправка формы */
  var form = document.getElementById('form');
  var done = document.getElementById('done');
  var errBox = document.getElementById('form-error');
  var submitBtn = document.getElementById('submit');
  var isDemo = form.hasAttribute('data-demo');

  // Служебные поля: время начала заполнения (защита от ботов), страница и UTM-метки
  document.getElementById('f-started').value = String(Date.now());
  document.getElementById('f-page').value = location.href.split('#')[0];
  var params = new URLSearchParams(location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
    var v = params.get(k);
    try { if (v) sessionStorage.setItem(k, v); else v = sessionStorage.getItem(k); } catch (e) {}
    if (v) form.elements[k].value = v;
  });

  function check(el, ok) { el.closest('.field').classList.toggle('invalid', !ok); return ok; }
  function showError(msg) { errBox.textContent = msg; errBox.hidden = !msg; }
  function showDone() {
    form.style.display = 'none';
    done.classList.add('show');
    if (isDemo) done.querySelector('.demo-note').hidden = false;
    var h = done.querySelector('h3'); h.setAttribute('tabindex', '-1'); h.focus();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    showError('');
    var name = document.getElementById('f-name');
    var phone = document.getElementById('f-phone');
    var email = document.getElementById('f-email');
    var consent = document.getElementById('f-consent');
    var ok = true;
    ok = check(name, name.value.trim().length > 1) && ok;
    ok = check(phone, phone.value.replace(/\D/g, '').length >= 10) && ok;
    ok = check(email, !email.value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) && ok;
    ok = check(consent, consent.checked) && ok;
    ok = renderFiles() && ok;
    if (!ok) {
      var first = form.querySelector('.invalid input, .invalid select');
      if (first) first.focus();
      return;
    }
    if (isDemo) { showDone(); return; }
    if (location.protocol === 'file:') {
      showError(T.fileMode);
      return;
    }

    var submitLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = T.sending;
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json().catch(function () { return { ok: false, status: r.status }; }); })
      .then(function (res) {
        if (res.ok) { showDone(); return; }
        (res.fields || []).forEach(function (f) {
          var el = form.elements[f === 'files' ? 'files[]' : f];
          if (el) el.closest('.field').classList.add('invalid');
        });
        showError(res.error || (T.failed + (res.status ? ' (' + T.code + ' ' + res.status + ')' : '') + '. ' + T.callUs));
      })
      .catch(function () {
        showError(T.offline);
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
      });
  });
  form.addEventListener('input', function (e) {
    var f = e.target.closest('.field');
    if (f && f.classList.contains('invalid')) f.classList.remove('invalid');
  });
})();

/* ---- Только для Tilda: язык из обёртки .tth, отступ под фиксированную шапку ---- */
(function () {
  var hdr = document.querySelector('.tth .header');
  if (!hdr) return;
  function fit() {
    var h = hdr.offsetHeight;
    document.querySelectorAll('.tth').forEach(function (el) { el.style.setProperty('--tth-hdr', h + 'px'); });
    document.documentElement.style.scrollPaddingTop = (h + 12) + 'px';
  }
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);
})();
