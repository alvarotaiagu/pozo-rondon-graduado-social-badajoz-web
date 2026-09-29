/* Verificación de la maqueta Pozo Rondón (graduado social).
   Levanta un servidor estático, abre el sitio con Playwright y comprueba las
   trampas conocidas: cortina que no se retira, balanza que no se nivela, pila
   que se deshace por la última tarjeta, pesas que no caen, consola sucia, 404,
   cookies, menú móvil, mapa bajo clic, cursor, las dos densidades y los modos
   sin GSAP y con movimiento reducido.

   node scripts/verificar.mjs            (todo)
   node scripts/verificar.mjs --capturas (además guarda screenshots/)
*/
import { chromium } from 'file:///C:/Users/alvar/Desktop/WEBS%20NEGOCIOS/alvarotaiagu.github.io/node_modules/playwright/index.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const conCapturas = process.argv.includes('--capturas');
if (conCapturas) fs.mkdirSync(path.join(raiz, 'screenshots'), { recursive: true });
const foto = n => path.join(raiz, 'screenshots', n);
const tipos = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json'
};
const PREFIJO = '/pozo-rondon-graduado-social-badajoz-web';

/* se sirve bajo el prefijo del repo, como en GitHub Pages: así el 404 con
   rutas absolutas se prueba de verdad */
const servidor = http.createServer((req, res) => {
  let limpia = decodeURIComponent(req.url.split('?')[0]);
  if (limpia.startsWith(PREFIJO)) limpia = limpia.slice(PREFIJO.length) || '/';
  const destino = path.join(raiz, limpia === '/' ? 'index.html' : limpia);
  if (!destino.startsWith(raiz)) { res.writeHead(403).end(); return; }
  if (!fs.existsSync(destino) || fs.statSync(destino).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(raiz, '404.html')));
    return;
  }
  res.writeHead(200, { 'content-type': tipos[path.extname(destino)] || 'application/octet-stream' });
  res.end(fs.readFileSync(destino));
});

const fallos = [];
const notas = [];
function comprobar(ok, mensaje) { (ok ? notas : fallos).push((ok ? 'OK   ' : 'FALLA') + ' · ' + mensaje); }

async function rueda(page, vueltas, paso = 700, espera = 240) {
  for (let i = 0; i < vueltas; i++) {             // window.scrollTo no dispara ScrollTrigger con Lenis
    await page.mouse.wheel(0, paso);
    await page.waitForTimeout(espera);
  }
  await page.waitForTimeout(1800);
}

async function hasta(page, selector, margen = 0) {
  for (let i = 0; i < 80; i++) {
    const top = await page.evaluate(s => document.querySelector(s).getBoundingClientRect().top, selector);
    if (top <= 90 + margen && top > -40) break;
    const paso = top > 0 ? Math.min(700, Math.max(120, top - 60)) : Math.max(-700, top - 80);
    await page.mouse.wheel(0, paso);
    await page.waitForTimeout(160);
  }
  await page.waitForTimeout(1800);
}

async function nuevaPagina(navegador, opciones = {}) {
  const contexto = await navegador.newContext({
    viewport: opciones.viewport || { width: 1440, height: 900 },
    reducedMotion: opciones.reducedMotion || 'no-preference',
    deviceScaleFactor: 1
  });
  const page = await contexto.newPage();
  const errores = [];
  const caidas = [];
  page.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('pageerror', e => errores.push('pageerror: ' + e.message));
  page.on('requestfailed', r => caidas.push(r.url() + ' → ' + (r.failure()?.errorText || '')));
  page.on('response', r => { if (r.status() >= 400) caidas.push(r.status() + ' ' + r.url()); });
  return { contexto, page, errores, caidas };
}

const lectura = page => page.evaluate(() => ({
  grados: document.getElementById('lectura-grados').textContent,
  estado: document.getElementById('lectura-estado').textContent,
  giro: document.getElementById('cruz').getAttribute('transform') || ''
}));
const mini = page => page.evaluate(() => ({
  puestas: document.querySelectorAll('#balanza-mini .pesa.puesta').length,
  estado: document.getElementById('mini-estado').textContent,
  grados: document.getElementById('mini-grados').textContent
}));
const giroDe = t => { const m = /rotate\(([-\d.]+)/.exec(t || ''); return m ? parseFloat(m[1]) : 0; };

const base = 'http://127.0.0.1:4193' + PREFIJO;
await new Promise(r => servidor.listen(4193, '127.0.0.1', r));
const navegador = await chromium.launch();

try {
  /* ───── 1. escritorio, pasada normal ───── */
  {
    const { contexto, page, errores, caidas } = await nuevaPagina(navegador);
    /* domcontentloaded: con networkidle el trazo ya va avanzado al empezar a mirar */
    await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });

    /* fotogramas intermedios: la única forma de ver que el logo se dibuja y el círculo se cierra.
       Se mira la ÚLTIMA pieza del logo, la que más tarda en trazarse por el escalonado. */
    const trazos = new Set();
    for (let i = 0; i < 14; i++) {
      trazos.add(await page.evaluate(() => { const t = document.querySelectorAll('.cortina .cl'); return getComputedStyle(t[t.length - 1]).strokeDashoffset; }));
      if (i === 5 && conCapturas) await page.screenshot({ path: foto('00a-cortina-trazo.png') });
      await page.waitForTimeout(80);
    }
    comprobar(trazos.size >= 3, 'la cortina dibuja el logo trazo a trazo (' + trazos.size + ' estados del trazo)');
    await page.waitForTimeout(900);
    const relleno = await page.evaluate(() => [...document.querySelectorAll('.cortina .cl')].every(n => parseFloat(getComputedStyle(n).fillOpacity) > 0.95));
    if (conCapturas) await page.screenshot({ path: foto('00b-cortina-logo.png') });
    comprobar(relleno, 'el logo de la cortina queda macizo, como el suyo, antes de abrir');
    let cerrando = null;
    for (let i = 0; i < 60 && !cerrando; i++) {
      const c = await page.evaluate(() => {
        const n = document.getElementById('cortina');
        if (getComputedStyle(n).display === 'none') return null;
        const m = /circle\(([\d.]+)%/.exec(getComputedStyle(n).clipPath || '');
        return m ? parseFloat(m[1]) : null;
      });
      if (c !== null && c > 5 && c < 90) {
        if (conCapturas) await page.screenshot({ path: foto('00c-cortina-cerrandose.png') });
        cerrando = c;
      } else await page.waitForTimeout(50);
    }
    comprobar(cerrando !== null, 'la página se abre en un círculo que se cierra sobre el eje (' + cerrando + '%)');

    await page.waitForTimeout(2600);
    const cortinaFinal = await page.evaluate(() => getComputedStyle(document.getElementById('cortina')).display);
    comprobar(cortinaFinal === 'none', 'la cortina acaba en display:none (pasada normal) → ' + cortinaFinal);
    comprobar(await page.evaluate(() => !document.documentElement.classList.contains('cortina-activa')), 'se devuelve el scroll al retirar la cortina');
    const desborda = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    comprobar(desborda <= 1, 'sin desbordamiento horizontal en escritorio (' + desborda + 'px)');
    if (conCapturas) await page.screenshot({ path: foto('01-hero.png') });

    const trazado = await page.evaluate(() => {
      const c = document.querySelector('#platillo-izq .cadena');
      return { clase: document.getElementById('balanza').classList.contains('trazado'), offset: parseFloat(getComputedStyle(c).strokeDashoffset) };
    });
    comprobar(trazado.clase && trazado.offset < 0.02, 'los hilos de los platillos se trazan tras la cortina → ' + JSON.stringify(trazado));

    /* cursor propio */
    await page.mouse.move(700, 300);
    await page.mouse.move(720, 320, { steps: 4 });
    await page.waitForTimeout(400);
    const cursorLibre = await page.evaluate(() => ({
      sistema: getComputedStyle(document.body).cursor,
      aro: getComputedStyle(document.querySelector('.cursor')).opacity,
      punto: getComputedStyle(document.querySelector('.cursor-punto')).opacity
    }));
    comprobar(cursorLibre.sistema === 'none' && cursorLibre.aro === '1' && cursorLibre.punto === '1',
      'cursor propio visible (aro + punto) y el del sistema oculto → ' + JSON.stringify(cursorLibre));
    const boton = await page.locator('.hero__acciones .boton').boundingBox();
    await page.mouse.move(boton.x + boton.width / 2, boton.y + boton.height / 2, { steps: 6 });
    await page.waitForTimeout(600);
    const cursorBoton = await page.evaluate(() => {
      const e = getComputedStyle(document.querySelector('.cursor'));
      return { fondo: e.backgroundColor, ancho: e.width, sistema: getComputedStyle(document.querySelector('.hero__acciones .boton')).cursor };
    });
    comprobar(/rgba\(155, 211, 180, 0\.38\)/.test(cursorBoton.fondo) && cursorBoton.ancho === '64px' && cursorBoton.sistema === 'none',
      'sobre un botón el aro crece y se rellena, sin cursor del sistema → ' + JSON.stringify(cursorBoton));
    if (conCapturas) await page.screenshot({ path: foto('01b-cursor-boton.png'), clip: { x: boton.x - 60, y: boton.y - 60, width: boton.width + 120, height: boton.height + 120 } });
    await page.mouse.move(720, 450, { steps: 4 });

    const antes = await lectura(page);
    comprobar(Math.abs(giroDe(antes.giro)) > 10 && antes.estado === 'Inclinada', 'al entrar la balanza está inclinada → ' + JSON.stringify(antes));
    await rueda(page, 2, 500);
    const medio = await lectura(page);
    if (conCapturas) await page.screenshot({ path: foto('02-hero-a-medias.png') });
    await rueda(page, 3, 600);
    const despues = await lectura(page);
    comprobar(medio.estado === 'Oscilando' || Math.abs(giroDe(medio.giro)) > 0.1, 'a media bajada el brazo oscila → ' + JSON.stringify(medio));
    comprobar(Math.abs(giroDe(despues.giro)) < 0.01 && despues.grados === '0,0°' && despues.estado === 'En equilibrio', 'al final del hero la balanza queda nivelada → ' + JSON.stringify(despues));
    const plomo = await page.evaluate(() => [document.getElementById('platillo-izq').getAttribute('transform'), document.getElementById('platillo-der').getAttribute('transform')]);
    comprobar(/translate\(78\.00 178\.00\)/.test(plomo[0]) && /translate\(522\.00 178\.00\)/.test(plomo[1]), 'nivelada, los platillos cuelgan de sus ganchos → ' + plomo.join(' / '));
    if (conCapturas) await page.screenshot({ path: foto('03-hero-nivelada.png') });

    await hasta(page, '#areas');
    if (conCapturas) await page.screenshot({ path: foto('04-areas.png') });
    const m0 = await mini(page);
    const IDS = ['#area-laboral', '#area-seguridad-social', '#area-extranjeria', '#area-juzgados', '#area-auditoria', '#area-despachos'];
    const ESPERADO = ['Cae a la izquierda', 'Cae a la derecha', 'Cae a la izquierda', 'Cae a la izquierda', 'Cae a la izquierda', 'En equilibrio'];
    const pasos = [];
    const muescasEncendidas = [];
    for (let i = 0; i < IDS.length; i++) {
      await hasta(page, IDS[i], 20);
      await page.waitForTimeout(i === IDS.length - 1 ? 2600 : 900);
      pasos.push(await mini(page));
      muescasEncendidas.push(await page.evaluate(() => document.querySelectorAll('.progreso__muesca.puesta').length));
      if (conCapturas) await page.screenshot({ path: foto('05-area-' + (i + 1) + '.png') });
      if (i === 1) {
        const apilada = await page.evaluate(() => getComputedStyle(document.querySelector('#area-laboral .tarjeta')).transform);
        comprobar(apilada !== 'none', 'la tarjeta de debajo se hunde al apilarse → ' + apilada);
      }
    }
    comprobar(m0.puestas === 0 && pasos.slice(0, 5).every((p, i) => p.puestas === i + 1 && p.estado === ESPERADO[i]),
      'cada tarjeta que se posa deja caer su pesa y la balanza cabecea → ' + JSON.stringify([m0].concat(pasos.slice(0, 5)).map(p => p.puestas + ' ' + p.estado)));
    comprobar(muescasEncendidas.every((n, i) => n === pasos[i].puestas), 'progreso: cada muesca del borde se enciende a la vez que cae su pesa → ' + JSON.stringify(muescasEncendidas));
    const m6 = pasos[5];
    comprobar(m6.puestas === 6 && m6.estado === 'En equilibrio' && m6.grados === '0,0°', 'solo con las seis pesas la balanza pequeña se equilibra → ' + JSON.stringify(m6));

    const alturas = await page.evaluate(() => [...document.querySelectorAll('.pila__item .tarjeta')].map(t => ({ alto: t.offsetHeight, cabe: t.scrollHeight <= t.clientHeight + 1 })));
    comprobar(new Set(alturas.map(a => a.alto)).size === 1 && alturas.every(a => a.cabe), 'pila: las seis tarjetas miden lo mismo y su contenido cabe → ' + JSON.stringify(alturas));

    await hasta(page, '#quien');
    await rueda(page, 1, 300);
    if (conCapturas) await page.screenshot({ path: foto('08-quien.png') });
    const ancho_ = await page.evaluate(() => { const i = document.querySelector('.retrato img'); return i.complete ? i.naturalWidth : 0; });
    comprobar(ancho_ >= 600, 'el retrato carga (' + ancho_ + ' px)');
    const texto = await page.evaluate(() => document.body.innerText);
    comprobar(!/Botejara|Regino|924 ?25|fiscal, laboral y contable/i.test(texto), 'ni rastro de Botejara en el texto de la página');
    comprobar(!/\b(\d+|una|dos|tres)( sola| única)? reseñas?\b|la (primera|segunda|tercera) reseña|única reseña/i.test(texto), 'sin recuento de reseñas en ningún sitio (solo la nota)');
    comprobar(/Colegiado n\.º 493/.test(texto) && /8:30/.test(texto) && /despacho@pozorondon\.es/.test(texto), 'colegiado, horario y correo publicados');
    comprobar(/con cita previa/.test(texto) && /jurídico-laboral/.test(texto), 'la descripción de su ficha de Google está en el copy (jurídico-laboral, cita previa)');
    comprobar(/Sunil S\./.test(texto) && /Ruth R\./.test(texto) && /Raju P\./.test(texto), 'las tres reseñas reales, con nombre e inicial');
    comprobar(!/saka|Salazar|Rondón Salazar|Pericharla/i.test(texto), 'ninguna reseña lleva el nombre completo');
    await hasta(page, '#opiniones');
    await rueda(page, 1, 300);
    if (conCapturas) await page.screenshot({ path: foto('08b-opiniones.png') });
    const cifra = await page.textContent('.sello-nota__cifra');
    comprobar(cifra.trim() === '5,0', 'el sello marca 5,0 → ' + cifra);

    await hasta(page, '#contacto');
    if (conCapturas) await page.screenshot({ path: foto('09-contacto.png') });
    await rueda(page, 4, 700);
    if (conCapturas) await page.screenshot({ path: foto('10-pie.png') });

    const cookiesVisible = await page.evaluate(() => {
      const c = document.getElementById('cookies');
      return { oculto: c.hidden, display: getComputedStyle(c).display };
    });
    comprobar(!cookiesVisible.oculto && cookiesVisible.display === 'flex', 'el aviso de cookies se ve al entrar');
    await page.click('#cookies-aceptar');
    await page.waitForTimeout(300);
    const cookiesCerrado = await page.evaluate(() => getComputedStyle(document.getElementById('cookies')).display);
    comprobar(cookiesCerrado === 'none', 'el botón de cookies lo cierra de verdad → ' + cookiesCerrado);

    const iframesAntes = await page.$$eval('iframe', n => n.length);
    await page.click('#mapa-boton');
    await page.waitForTimeout(900);
    const iframesDespues = await page.$$eval('iframe', n => n.length);
    comprobar(iframesAntes === 0 && iframesDespues === 1, 'el iframe del mapa no existe hasta el clic (' + iframesAntes + ' → ' + iframesDespues + ')');
    if (conCapturas) { await hasta(page, '#contacto'); await page.screenshot({ path: foto('09b-contacto-mapa.png') }); }

    const mandoSinRevision = await page.evaluate(() => {
      const m = document.getElementById('mando');
      return { oculto: m.hidden, display: getComputedStyle(m).display };
    });
    comprobar(mandoSinRevision.oculto && mandoSinRevision.display === 'none', 'sin ?revision el mando de maqueta no se ve → ' + JSON.stringify(mandoSinRevision));

    comprobar(errores.length === 0, 'consola sin errores' + (errores.length ? ' → ' + errores.join(' | ') : ''));
    const caidasReales = caidas.filter(c => !/favicon\.ico|google\.com\/maps|gstatic|googleapis\.com\/maps|maps\.google|google\.com\/(gen_204|log)/.test(c));
    comprobar(caidasReales.length === 0, 'sin peticiones caídas' + (caidasReales.length ? ' → ' + caidasReales.join(' | ') : ''));
    await contexto.close();
  }

  /* ───── 1b. la pila, en una página limpia y bajando desde arriba ─────
     El fallo clásico está en la ÚLTIMA tarjeta. */
  {
    const { contexto, page } = await nuevaPagina(navegador);
    await contexto.addInitScript(() => { try { localStorage.setItem('pozorondon-cookies', 'ok'); } catch (e) {} });
    await page.goto(base + '/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4800);
    await page.mouse.move(720, 450);
    await hasta(page, '#area-seguridad-social', 300);
    const tope = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.pila__item')).top));
    let ultimo = null, sueltaAntes = null, asomaDebajo = null, seSeparan = null, ultimaPosada = false;
    for (let i = 0; i < 80; i++) {
      await page.mouse.wheel(0, 90);
      await page.waitForTimeout(170);
      const m = await page.evaluate(() => [...document.querySelectorAll('.pila__item')].map(li => { const r = li.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)]; }));
      ultimo = m;
      const ultima = m[m.length - 1];
      const anteriores = m.slice(0, -1);
      if (!ultimaPosada && ultima[0] > tope + 2 && ultima[0] < 900 && anteriores.some(a => a[0] < tope - 2)) sueltaAntes = sueltaAntes || { paso: i, m };
      if (Math.abs(ultima[0] - tope) <= 2) {
        ultimaPosada = true;
        if (anteriores.some(a => a[1] > ultima[1] + 1)) asomaDebajo = asomaDebajo || { paso: i, m };
      }
      if (ultimaPosada && anteriores.some(a => Math.abs(a[0] - ultima[0]) > 2)) seSeparan = seSeparan || { paso: i, m };
    }
    const sinLlegar = ultimaPosada ? '' : ' (la última no llegó a posarse: ' + JSON.stringify(ultimo) + ')';
    comprobar(ultimaPosada && !sueltaAntes, 'pila: ninguna tarjeta se suelta antes de que se pose la última' + (sueltaAntes ? ' → ' + JSON.stringify(sueltaAntes) : '') + sinLlegar);
    comprobar(ultimaPosada && !asomaDebajo, 'pila: la última tapa entera a la anterior (nada asoma por debajo)' + (asomaDebajo ? ' → ' + JSON.stringify(asomaDebajo) : '') + sinLlegar);
    comprobar(ultimaPosada && !seSeparan, 'pila: al acabarse, las seis salen juntas como un bloque' + (seSeparan ? ' → ' + JSON.stringify(seSeparan) : '') + sinLlegar);
    /* el hueco que deja el margen de la última se lo come la sección siguiente */
    const hueco = await page.evaluate(() => {
      const ultima = document.querySelector('#area-despachos .tarjeta').getBoundingClientRect();
      const op = document.getElementById('quien').getBoundingClientRect();
      return Math.round(op.top - ultima.bottom);
    });
    comprobar(hueco < 160, 'pila: sin un hueco vacío grande entre la última tarjeta y «Quién soy» (' + hueco + 'px)');
    await contexto.close();
  }

  /* ───── 2. las dos densidades ───── */
  {
    const { contexto, page } = await nuevaPagina(navegador);
    await page.goto(base + '/index.html?revision', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4800);
    comprobar(await page.evaluate(() => getComputedStyle(document.getElementById('mando')).visibility === 'hidden'), 'el mando se aparta mientras el aviso de cookies está en pantalla');
    await page.click('#cookies-aceptar');
    await page.waitForTimeout(400);
    comprobar(await page.evaluate(() => !document.getElementById('mando').hidden && getComputedStyle(document.getElementById('mando')).visibility !== 'hidden'), 'el mando de maqueta aparece al cerrar las cookies (lo enseña el JS)');

    await page.click('[data-densidad="sobria"]');
    await page.waitForTimeout(900);
    const sobria = await page.evaluate(() => ({
      clase: document.documentElement.className,
      mini: getComputedStyle(document.querySelector('.areas__balanza')).display,
      pesa: getComputedStyle(document.querySelector('.pesa-grande')).display,
      numeral: getComputedStyle(document.querySelector('.tarjeta__numeral')).display,
      ficha: getComputedStyle(document.querySelector('.ficha')).display,
      filete: getComputedStyle(document.querySelector('.filete')).display,
      pila: getComputedStyle(document.querySelector('.pila__item')).position,
      hero: getComputedStyle(document.getElementById('balanza')).display,
      desborda: document.documentElement.scrollWidth - window.innerWidth,
      pulsado: document.querySelector('[data-densidad="sobria"]').getAttribute('aria-pressed')
    }));
    comprobar(sobria.clase.includes('densidad-sobria'), 'la clase de densidad cambia en <html>');
    comprobar(sobria.mini === 'none' && sobria.pesa === 'none' && sobria.filete === 'none', 'sobria: fuera la balanza pequeña, las pesas dibujadas y los filetes → ' + [sobria.mini, sobria.pesa, sobria.filete].join('/'));
    comprobar(sobria.numeral === 'block' && sobria.ficha === 'block', 'sobria: el dibujo se cambia por dato (numerales y ficha del despacho, que la Platillos no tiene)');
    comprobar(sobria.pila === 'static' && sobria.hero !== 'none', 'sobria: las seis áreas a la vez, y la balanza del hero se queda');
    comprobar(sobria.desborda <= 1, 'sobria: sin desbordamiento nuevo (' + sobria.desborda + 'px)');
    comprobar(sobria.pulsado === 'true', 'aria-pressed correcto tras pulsar');
    if (conCapturas) {
      await page.evaluate(() => { window.scrollTo(0, 0); return 0; });
      await page.evaluate(() => { document.querySelector('.ficha').scrollIntoView({ block: 'center' }); return 0; });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: foto('20-sobria-ficha.png') });
      await hasta(page, '#areas');
      await rueda(page, 1, 500);
      await page.screenshot({ path: foto('21-sobria-areas.png') });
      await hasta(page, '#quien');
      await page.screenshot({ path: foto('22-sobria-quien.png') });
    }

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(200);
    comprobar((await page.evaluate(() => document.documentElement.className)).includes('densidad-sobria'), 'la densidad elegida se aplica sin parpadeo al recargar');
    await page.waitForTimeout(4600);
    await page.click('[data-densidad="platillos"]');
    await page.waitForTimeout(700);
    const vuelta = await page.evaluate(() => ({ clase: document.documentElement.className, mini: getComputedStyle(document.querySelector('.areas__balanza')).display }));
    comprobar(vuelta.clase.includes('densidad-platillos') && vuelta.mini !== 'none', 'se puede volver a la densidad Platillos');
    await contexto.close();
  }

  /* ───── 3. móvil ───── */
  {
    const { contexto, page, errores } = await nuevaPagina(navegador, { viewport: { width: 390, height: 844 } });
    await page.goto(base + '/index.html?revision', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4800);
    const ancho = await page.evaluate(() => ({ innerWidth: window.innerWidth, scroll: document.documentElement.scrollWidth }));
    comprobar(ancho.innerWidth === 390 && ancho.scroll - ancho.innerWidth <= 1, 'móvil: el viewport no se ensancha (' + JSON.stringify(ancho) + ')');
    if (conCapturas) await page.screenshot({ path: foto('30-movil-hero.png') });

    await page.click('#cookies-aceptar');
    await page.waitForTimeout(600);
    /* al bajar, el texto no puede subir encima de la lectura de la balanza */
    await rueda(page, 2, 300);
    const pisa = await page.evaluate(() => {
      const l = document.querySelector('.lectura').getBoundingClientRect();
      const t = document.querySelector('.hero__texto .antetitulo').getBoundingClientRect();
      return { lecturaAbajo: Math.round(l.bottom), textoArriba: Math.round(t.top) };
    });
    comprobar(pisa.textoArriba >= pisa.lecturaAbajo, 'móvil: al bajar, el texto del hero no tapa la lectura → ' + JSON.stringify(pisa));
    await page.evaluate(() => { window.scrollTo(0, 0); return 0; });
    await page.waitForTimeout(800);
    await page.click('#hamburguesa');
    await page.waitForTimeout(800);
    comprobar(await page.evaluate(() => document.getElementById('hamburguesa').getAttribute('aria-expanded')) === 'true', 'móvil: el menú abre');
    if (conCapturas) await page.screenshot({ path: foto('31-movil-menu.png') });
    await page.click('#hamburguesa', { timeout: 4000 });
    await page.waitForTimeout(800);
    comprobar(await page.evaluate(() => document.getElementById('hamburguesa').getAttribute('aria-expanded')) === 'false', 'móvil: el mismo botón cierra el menú');

    /* con la cabecera fija (backdrop-filter) el panel del menú no puede asomar */
    await rueda(page, 8, 700);
    const panel = await page.evaluate(() => {
      const n = document.getElementById('menu').getBoundingClientRect();
      return { fija: document.getElementById('cabecera').classList.contains('cabecera--fija'), bottom: Math.round(n.bottom), alto: Math.round(n.height), visible: getComputedStyle(document.getElementById('menu')).visibility };
    });
    comprobar(panel.fija && (panel.bottom <= 1 || panel.visible === 'hidden') && panel.alto >= 800, 'móvil: con la cabecera fija el menú cerrado no asoma → ' + JSON.stringify(panel));
    await page.click('#hamburguesa');
    await page.waitForTimeout(900);
    const panelAbierto = await page.evaluate(() => {
      const r = document.getElementById('menu').getBoundingClientRect();
      return { alto: Math.round(r.height), top: Math.round(r.top), filtro: getComputedStyle(document.getElementById('menu')).backdropFilter };
    });
    comprobar(panelAbierto.alto >= 800 && panelAbierto.top === 0 && /blur/.test(panelAbierto.filtro), 'móvil: con la cabecera fija el menú abierto ocupa toda la pantalla, con desenfoque → ' + JSON.stringify(panelAbierto));
    if (conCapturas) await page.screenshot({ path: foto('31b-movil-menu-fija.png') });
    await page.click('#hamburguesa');
    await page.waitForTimeout(800);

    if (conCapturas) {
      await page.evaluate(() => { window.scrollTo(0, 0); return 0; });
      await page.waitForTimeout(800);
      await rueda(page, 3, 400);
      await page.screenshot({ path: foto('32-movil-hero-nivelada.png') });
      await hasta(page, '#areas');
      await page.screenshot({ path: foto('33-movil-areas.png') });
      await hasta(page, '#area-seguridad-social');
      await page.screenshot({ path: foto('34-movil-seguridad-social.png') });
      await hasta(page, '#quien');
      await page.screenshot({ path: foto('35-movil-quien.png') });
      await hasta(page, '#opiniones');
      await page.screenshot({ path: foto('35b-movil-opiniones.png') });
      await hasta(page, '#contacto');
      await page.screenshot({ path: foto('36-movil-contacto.png') });
      await rueda(page, 3, 700);
      await page.screenshot({ path: foto('37-movil-pie.png') });
    }
    comprobar(errores.length === 0, 'móvil: consola sin errores' + (errores.length ? ' → ' + errores.join(' | ') : ''));
    await contexto.close();
  }

  /* ───── 3c. mejoras: progreso, WhatsApp con mensaje, estado del despacho, barra móvil ───── */
  {
    const { contexto, page, errores } = await nuevaPagina(navegador);
    await contexto.addInitScript(() => { try { localStorage.setItem('pozorondon-cookies', 'ok'); } catch (e) {} });
    await page.goto(base + '/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4800);
    const arriba = await page.evaluate(() => ({ p: parseFloat(getComputedStyle(document.getElementById('progreso')).getPropertyValue('--p')), muescas: document.querySelectorAll('.progreso__muesca').length, encendidas: document.querySelectorAll('.progreso__muesca.puesta').length, marcas: [...document.querySelectorAll('.progreso__muesca')].map(m => parseFloat(m.style.getPropertyValue('--en'))) }));
    comprobar(arriba.p < 0.02 && arriba.muescas === 6 && arriba.encendidas === 0, 'progreso: arriba del todo, vacío y con seis muescas apagadas → ' + JSON.stringify(arriba));
    comprobar(arriba.marcas.every((m, i) => m > 0.05 && m < 0.95 && (i === 0 || m > arriba.marcas[i - 1])), 'progreso: las muescas van en orden y dentro de la página → ' + JSON.stringify(arriba.marcas));
    await page.keyboard.press('End');
    await page.waitForTimeout(2600);
    const abajo = await page.evaluate(() => ({ p: parseFloat(getComputedStyle(document.getElementById('progreso')).getPropertyValue('--p')), encendidas: document.querySelectorAll('.progreso__muesca.puesta').length }));
    comprobar(abajo.p > 0.98 && abajo.encendidas === 6, 'progreso: al final, lleno y con las seis muescas encendidas → ' + JSON.stringify(abajo));
    if (conCapturas) await page.screenshot({ path: foto('12-progreso-final.png'), clip: { x: 0, y: 0, width: 260, height: 900 } });

    const was = await page.evaluate(() => [...document.querySelectorAll('a[href*="wa.me"]')].map(a => { const u = new URL(a.href); return { tel: u.pathname, texto: u.searchParams.get('text') || '' }; }));
    comprobar(was.length >= 9 && was.every(w => w.tel === '/34661010560' && w.texto.startsWith('Hola, José Ángel. Te escribo desde tu web')), 'WhatsApp: todos los enlaces llevan el número y el saludo ya escrito (' + was.length + ')');
    const porArea = await page.evaluate(() => [...document.querySelectorAll('.tarjeta__acciones a[href*="wa.me"]')].map(a => new URL(a.href).searchParams.get('text')));
    comprobar(porArea.length === 6 && new Set(porArea).size === 6, 'WhatsApp: cada área escribe su propio mensaje → ' + porArea.map(t => t.slice(42, 72)).join(' | '));
    const escritorio = await page.evaluate(() => getComputedStyle(document.getElementById('barra-movil')).display);
    comprobar(escritorio === 'none', 'barra móvil: no existe en escritorio → ' + escritorio);
    comprobar(errores.length === 0, 'mejoras: consola sin errores' + (errores.length ? ' → ' + errores.join(' | ') : ''));
    await contexto.close();
  }
  /* estado del despacho a distintas horas de Madrid (septiembre-octubre de 2026: UTC+2) */
  for (const [iso, esperado] of [
    ['2026-09-30T08:00:00Z', 'Abierto ahora · hasta las 14:30'],       // miércoles 10:00
    ['2026-09-30T12:10:00Z', 'Abierto · cierra pronto, a las 14:30'],   // miércoles 14:10
    ['2026-09-30T14:00:00Z', 'Cerrado ahora · abre mañana a las 8:30'], // miércoles 16:00
    ['2026-10-02T13:00:00Z', 'Cerrado ahora · abre el lunes a las 8:30'], // viernes 15:00
    ['2026-10-03T09:00:00Z', 'Cerrado ahora · abre el lunes a las 8:30'], // sábado 11:00
    ['2026-10-04T09:00:00Z', 'Cerrado ahora · abre mañana a las 8:30'], // domingo 11:00
    ['2026-10-05T05:00:00Z', 'Cerrado ahora · abre hoy a las 8:30']     // lunes 7:00
  ]) {
    const { contexto, page } = await nuevaPagina(navegador, { reducedMotion: 'reduce' });
    await page.clock.setFixedTime(new Date(iso));
    await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const e = await page.evaluate(() => ({ texto: document.querySelector('[data-estado-texto]').textContent, punto: document.querySelector('.cabecera [data-estado-punto]').className, visible: !document.querySelector('[data-estado]').hidden, etiqueta: document.querySelector('.cabecera__llamar').getAttribute('aria-label') }));
    const abierto = esperado.startsWith('Abierto');
    comprobar(e.texto === esperado && e.visible && e.punto.includes(abierto ? 'abierto' : 'cerrado') && e.etiqueta.includes(esperado), 'estado ' + iso + ' → «' + e.texto + '» (' + e.punto + ')');
    await contexto.close();
  }
  /* barra fija en móvil: fuera del hero sí, en el hero y sobre el contacto no */
  {
    const { contexto, page } = await nuevaPagina(navegador, { viewport: { width: 390, height: 844 } });
    await contexto.addInitScript(() => { try { localStorage.setItem('pozorondon-cookies', 'ok'); } catch (e) {} });
    await page.goto(base + '/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4800);
    const barra = () => page.evaluate(() => { const b = document.getElementById('barra-movil'); const r = b.getBoundingClientRect(); return { visible: b.classList.contains('visible') && getComputedStyle(b).visibility === 'visible', dentro: r.bottom <= window.innerHeight + 1 && r.top < window.innerHeight, llamar: b.querySelector('small').textContent }; });
    const enHero = await barra();
    await hasta(page, '#area-seguridad-social');
    const enAreas = await barra();
    if (conCapturas) await page.screenshot({ path: foto('38-movil-barra.png') });
    await hasta(page, '#contacto');
    await page.waitForTimeout(700);
    const enContacto = await barra();
    comprobar(!enHero.visible && enAreas.visible && enAreas.dentro && !enContacto.visible, 'barra móvil: oculta en el hero, fija en las áreas, oculta sobre el contacto → ' + JSON.stringify([enHero, enAreas, enContacto]));
    comprobar(/^(Abierto ahora|Cierra a las 14:30|Abre (hoy|mañana|el lunes) a las 8:30)$/.test(enAreas.llamar), 'barra móvil: el botón de llamar dice si está abierto → ' + enAreas.llamar);
    await contexto.close();
  }

  /* ───── 3b. pantallas bajas: el texto del hero no pisa la balanza ni se sale ───── */
  for (const vp of [{ width: 375, height: 667 }, { width: 360, height: 640 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1280, height: 720 }]) {
    const { contexto, page } = await nuevaPagina(navegador, { viewport: vp });
    await contexto.addInitScript(() => { try { localStorage.setItem('pozorondon-cookies', 'ok'); } catch (e) {} });
    await page.goto(base + '/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5200);
    const r = await page.evaluate(() => {
      const caja = e => e.getBoundingClientRect();
      const b = caja(document.querySelector('.hero__balanza'));
      const t = caja(document.querySelector('.hero__texto'));
      const h = caja(document.getElementById('inicio'));
      return { balanza: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)], texto: [Math.round(t.left), Math.round(t.top), Math.round(t.right), Math.round(t.bottom)], heroAbajo: Math.round(h.bottom), alto: window.innerHeight };
    });
    const solapan = !(r.texto[2] <= r.balanza[0] || r.balanza[2] <= r.texto[0] || r.texto[3] <= r.balanza[1] || r.balanza[3] <= r.texto[1]);
    comprobar(!solapan && r.texto[3] <= r.alto, 'hero ' + vp.width + '×' + vp.height + ': texto y balanza no se pisan y el texto cabe en pantalla → ' + JSON.stringify(r));
    if (conCapturas) await page.screenshot({ path: foto('3b-hero-' + vp.width + 'x' + vp.height + '.png') });
    /* la balanza no puede encoger al cambiar la lectura de estado (fallo visto
       en móvil: «Buscando el equilibrio» partía de línea y robaba alto al dibujo) */
    const estados = await page.evaluate(() => {
      const e = document.getElementById('lectura-estado'), g = document.getElementById('lectura-grados');
      const svg = document.getElementById('balanza'), l = document.querySelector('.lectura');
      const antes = [e.textContent, g.textContent];
      const medidas = [['Inclinada', '13,0°'], ['Oscilando', '10,8°'], ['En equilibrio', '0,0°']].map(([t, n]) => {
        e.textContent = t; g.textContent = n;
        return [Math.round(svg.getBoundingClientRect().height), Math.round(l.getBoundingClientRect().height), Math.round(g.getBoundingClientRect().left)];
      });
      [e.textContent, g.textContent] = antes;
      return medidas;
    });
    comprobar(new Set(estados.map(m => m.join('/'))).size === 1, 'hero ' + vp.width + '×' + vp.height + ': la balanza y la lectura no cambian de tamaño ni se mueven entre estados → ' + JSON.stringify(estados));
    await contexto.close();
  }

  /* ───── 4. sin GSAP (CDN caído) ───── */
  {
    const { contexto, page, errores } = await nuevaPagina(navegador);
    await page.route('**/cdn.jsdelivr.net/**', r => r.abort());
    await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2200);
    const estado = await page.evaluate(() => ({
      cortina: getComputedStyle(document.getElementById('cortina')).display,
      conMovimiento: document.documentElement.classList.contains('con-movimiento'),
      bloqueado: document.documentElement.classList.contains('cortina-activa')
    }));
    comprobar(estado.cortina === 'none' && !estado.bloqueado, 'sin GSAP: la cortina se retira igual y el scroll queda libre → ' + JSON.stringify(estado));
    comprobar(!estado.conMovimiento, 'sin GSAP: no se activa con-movimiento (nada queda a medio revelar)');
    const apagados = await page.evaluate(() => [...document.querySelectorAll('h1, h2, h3, p, li, .cadena')].filter(n => {
      const e = getComputedStyle(n);
      return parseFloat(e.opacity) < 0.15 && n.getBoundingClientRect().height > 0 && !n.closest('.cortina');
    }).map(n => n.className || n.tagName));
    comprobar(apagados.length === 0, 'sin GSAP: ningún texto ni cadena queda apagado' + (apagados.length ? ' → ' + apagados.join(',') : ''));
    if (conCapturas) await page.screenshot({ path: foto('40-sin-gsap.png') });
    await page.evaluate(() => { window.scrollTo(0, window.innerHeight * 0.6); return 0; });
    await page.waitForTimeout(400);
    const l = await lectura(page);
    comprobar(l.estado === 'En equilibrio', 'sin GSAP: la balanza se nivela al bajar (sin viaje) → ' + JSON.stringify(l));
    const propios = errores.filter(e => !/Failed to load resource|ERR_FAILED/.test(e));
    comprobar(propios.length === 0, 'sin GSAP: consola sin errores propios' + (propios.length ? ' → ' + propios.join(' | ') : ''));
    await contexto.close();
  }

  /* ───── 5. movimiento reducido ───── */
  {
    const { contexto, page, errores } = await nuevaPagina(navegador, { reducedMotion: 'reduce' });
    await page.goto(base + '/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    comprobar(await page.evaluate(() => getComputedStyle(document.getElementById('cortina')).display) === 'none', 'movimiento reducido: la cortina no aparece');
    const alEntrar = await lectura(page);
    await page.evaluate(() => { window.scrollTo(0, window.innerHeight * 0.6); return 0; });
    await page.waitForTimeout(400);
    const alBajar = await lectura(page);
    comprobar(alEntrar.estado === 'Inclinada' && alBajar.estado === 'En equilibrio', 'movimiento reducido: la lectura de la balanza sigue cambiando → ' + JSON.stringify([alEntrar, alBajar]));
    await page.evaluate(() => { document.getElementById('opiniones').scrollIntoView({ block: 'center' }); return 0; });
    await page.waitForTimeout(700);
    const m = await mini(page);
    comprobar(m.puestas === 6 && m.estado === 'En equilibrio', 'movimiento reducido: las pesas se posan igual → ' + JSON.stringify(m));
    const cifra = await page.textContent('.sello-nota__cifra');
    comprobar(cifra.trim() === '5,0', 'movimiento reducido: el contador muestra el dato → ' + cifra);
    if (conCapturas) await page.screenshot({ path: foto('41-movimiento-reducido.png') });
    comprobar(errores.length === 0, 'movimiento reducido: consola sin errores' + (errores.length ? ' → ' + errores.join(' | ') : ''));
    await contexto.close();
  }

  /* ───── 6. 404 servido bajo el prefijo del repo ───── */
  {
    const { contexto, page, caidas } = await nuevaPagina(navegador);
    const resp = await page.goto(base + '/no-existe/ni-esto.html', { waitUntil: 'networkidle' });
    const titulo = await page.textContent('h1').catch(() => '');
    comprobar(resp.status() === 404 && /pesa/i.test(titulo || ''), '404 propio con el lenguaje del sitio → "' + titulo + '"');
    const propias = caidas.filter(c => !c.includes('/no-existe/'));
    comprobar(propias.length === 0, '404: sin recursos rotos a otra profundidad' + (propias.length ? ' → ' + propias.join(' | ') : ''));
    if (conCapturas) await page.screenshot({ path: foto('50-404.png') });
    await contexto.close();
  }

  /* ───── 7. páginas legales ───── */
  for (const p of ['aviso-legal.html', 'privacidad.html']) {
    const { contexto, page, errores, caidas } = await nuevaPagina(navegador, { viewport: { width: 390, height: 844 } });
    await page.goto(base + '/' + p, { waitUntil: 'networkidle' });
    comprobar(errores.length === 0 && caidas.length === 0, p + ': sin errores ni recursos rotos' + (caidas.length ? ' → ' + caidas.join(' | ') : ''));
    if (conCapturas) await page.screenshot({ path: foto('60-' + p.replace('.html', '') + '.png') });
    await contexto.close();
  }
} finally {
  await navegador.close();
  servidor.close();
}

console.log('\n' + notas.join('\n'));
if (fallos.length) {
  console.log('\n──────── FALLOS ────────\n' + fallos.join('\n'));
  process.exitCode = 1;
} else {
  console.log('\nTodo en orden: ' + notas.length + ' comprobaciones.');
}
