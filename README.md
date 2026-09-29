# Pozo Rondón · Graduado social en Badajoz

Web de una página para **José Ángel Pozo Rondón**, graduado social colegiado n.º 493 en Badajoz. Negocio real.

> **Estado: maqueta de presentación.** Todas las páginas llevan `noindex, nofollow`. Lleva un mando de revisión interno que se borra antes de entregar y un dato marcado como `[PENDIENTE]`.

## Origen: sale de la web de Botejara

Está hecha a partir de `enrique-botejara-asesor-badajoz-web`, otro asesor de Badajoz, porque **el logo de Pozo Rondón es una balanza**. De Botejara se conserva la mecánica: el hero anclado que se nivela con el scroll, la pila de tarjetas que dejan caer pesas en una balanza pequeña, el cursor, Lenis y las dos densidades. Se ha rehecho todo lo demás: paleta, tipografías, el dibujo de la balanza, la cortina, las secciones y el copy.

**Decisión del usuario (29-09-2026):** si se vende una de las dos, la otra no se usa. Las dos no pueden estar a la vez delante de clientes de Badajoz.

## Concepto: «Dos platillos»

- **La balanza es su logo.** Está redibujada a gran tamaño y maciza, como la suya: remate con bola, índice triangular, brazo con rombos, bulbo, columna y peana. No es la balanza grabada de latón de Botejara. El platillo izquierdo lleva **«Empresa»**, con contratos, y el derecho **«Trabajador»**, con la nómina. Así se cuenta su lema, «para empresas y trabajadores».
- **Cortina:** el logo se traza pieza a pieza y se rellena, los platillos caen con rebote, y después salen el nombre y el filete verde. La página se abre con un **círculo que se cierra sobre el eje de la balanza**, medido en pantalla. Botejara se abría por una costura horizontal.
- **Hero anclado:** la balanza entra inclinada 13° y se nivela al bajar. El titular es «Prevenir pesa menos que pleitear.».
- **Seis áreas, seis pesas:** laboral, Seguridad Social, extranjería, Juzgados de lo Social, auditoría preventiva y departamento laboral para despachos. Van alternando platillo, con masas 3, 5, 4, 1, 1 y 2. Suman 8 contra 8, pero **solo la sexta nivela**; antes la balanza cabecea de un lado a otro.
- **Quién soy:** su retrato, el colegiado n.º 493 y una frase suya de @mentelaboralista.
- **Opiniones:** las tres reseñas reales de Google, con nombre e inicial (nunca el nombre completo), y el 5,0 ★ **sin recuento de reseñas**. Una de ellas va en inglés, con su traducción debajo.
- **Contacto:** teléfono y WhatsApp, correo, horario, dirección y mapa bajo clic.
- **Regla de precisión** en el borde derecho: una escala graduada con el triángulo de su logo como índice y el nombre de la sección entrando letra a letra. Cada una de las 10 secciones tiene una raya; las seis áreas caen donde su tarjeta se posa, a la vez que su pesa. Con el ratón se despliega y lleva a cualquier sección. En móvil es más estrecha, no tiene panel y el rótulo asoma un momento al cambiar de sección.
- **El logo de la cabecera se nivela:** está inclinado 13° arriba del todo, como la balanza del hero, y llega a 0° al final de la página, con un muelle amortiguado.
- **WhatsApp con el mensaje escrito:** cada área abre WhatsApp con su propio texto («Hola, José Ángel. Te escribo desde tu web por extranjería…»). Los demás enlaces llevan un saludo general.
- **Abierto / cerrado:** se calcula con la hora de Madrid (L–V 8:30–14:30), aunque quien mire esté en otro huso. Sale como punto en el botón de la cabecera, como línea en el horario de contacto y en la barra de móvil. **No tiene en cuenta festivos ni las vacaciones de agosto**; si le importa, se añade una lista de cierres.
- **Barra fija en móvil** con «Llamar» (dice si está abierto) y «WhatsApp». Aparece fuera del hero y se esconde sobre el contacto, el pie, el menú y el aviso de cookies.

**Paleta:** papel `#F7F6F1` y el verde de su logo, `#1E5C3F`, muestreado de su cabecera de Facebook. Para las secciones oscuras, verde hondo `#133D2A`; para el acento sobre oscuro, `#9BD3B4`. Hay una barra verde vertical en el borde del hero y de las tarjetas, igual que en su portada de Facebook. Los contrastes están calculados en `scripts/contraste.mjs` y todos pasan.

**Tipografías:** **Gelasio** 700, una serif tipo Times como su wordmark, y **Albert Sans**, porque su lema va en sans cursiva. Ninguna otra web de la carpeta usa ninguna de las dos.

**Trato:** tú y primera persona («Soy José Ángel…», «te represento»), como escribe él en sus redes.

## Fuentes (consultado el 29-09-2026)

Los datos completos, con su fuente, están en `../pozo-rondon-graduado-social-badajoz-bocetos/DATOS-POZO-RONDON.md`.

| Dato | Fuente |
|---|---|
| Colegiado n.º 493, Colegio Oficial de Graduados Sociales de Badajoz, en activo | Censo nacional (api.graduadosocial.org) |
| 661 01 05 60 (también WhatsApp), despacho@pozorondon.es | Google, Instagram, Facebook y su aviso legal |
| Lunes a viernes, 8:30–14:30 | Su post de Facebook de septiembre de 2026 y Google («cierra 14:30») |
| Servicios y descripción («despacho jurídico-laboral… con cita previa en toda España») | Su descripción en la ficha de Google, su post de Facebook de la marca nueva y su web anterior |
| Reseñas de Sunil S., Ruth R. y Raju P. | Capturas de su ficha de Google, pasadas por el usuario |
| Extranjería «100 % online, toda España» | Su Facebook y su web anterior |
| «No vendo milagros. Vendo certezas…» | Bio de su Instagram personal @mentelaboralista |
| NIF 53736335D (solo en el aviso legal) | El aviso legal de su web actual |
| Logo y retrato | Su cabecera de Facebook y su foto de perfil |

## Pendiente de confirmar con él

- [ ] **Dirección.** Google da Av. Sinforiano Madroñero, 10, 06011. Su aviso legal añade «4 D», y su oficina anterior era el Edificio Eurodom (Luis Álvarez Lencero 3, planta 6, oficina 2). Hay que saber dónde atiende en persona. En la web está marcado `[PENDIENTE]`.
- [ ] **Retrato:** si se puede usar ese (fondo de oficina tipo banco de imágenes) o si tiene otro.
- [ ] **Logo en vector:** aquí está redibujado a mano desde un PNG de 1419 px. Pedirle el original.
- [ ] **Precios:** su web anterior publicaba tarifas (desde 45 €/mes y 18,50 € por nómina), pero incluían fiscal y contable. **No se publican** hasta que diga si siguen vigentes.
- [ ] **Años de experiencia:** su web anterior dice «más de 5 años», pero LinkedIn da una etapa universitaria de 2021 a 2025. **No se afirma nada.**
- [ ] **Cita de @mentelaboralista:** si le parece bien que esté en la web.
- [ ] **Reseña de «Ruth R.»:** su apellido completo es Rondón Salazar. Si es familiar suyo, es mejor quitarla.

## Revisar en local

```
node scripts/servir.mjs              # http://127.0.0.1:4192
node scripts/verificar.mjs           # 99 comprobaciones con Playwright
node scripts/verificar.mjs --capturas
node scripts/contraste.mjs
```

Además de las comprobaciones que ya traía Botejara (cortina, hero, pila, cursor, cookies, mapa, mando, densidades, menú móvil, sin GSAP, movimiento reducido, 404 y páginas legales), `verificar.mjs` comprueba:

- que la cortina **traza** el logo, que queda macizo y que el círculo se cierra;
- que las seis pesas caen en orden, que la balanza cabecea y que solo con la sexta se nivela;
- que **no queda ni rastro de Botejara** en el texto;
- que **no aparece ningún recuento de reseñas**;
- que en móvil el texto del hero no tapa la lectura al bajar.

**Trampa encontrada:** GSAP redondea a píxeles enteros los valores en px. Con `pathLength="1"` el trazo saltaba de 1 a 0 de golpe. Se arregla con `autoRound: false` en esos tweens. La cortina de Botejara usa el mismo patrón sin esa opción, así que su trazo probablemente también salta.

## Quitar el mando de maqueta antes de entregar

El mando **solo aparece con `?revision`**. Tiene dos densidades:

- **Platillos:** la balanza en todas partes.
- **Sobria:** la balanza solo en la cortina y el hero. Las pesas se cambian por numerales, las seis áreas se ven a la vez en rejilla y entra la ficha del despacho.

Para borrarlo:

1. En `index.html`:
   - En el `<script>` del `<head>`, borrar desde `/* la densidad guardada solo cuenta…` hasta el `} catch (e) {}` final. **El `setTimeout` de 8 s se queda.**
   - Borrar el `<div class="mando">` con su comentario.
   - Borrar la `<section class="ficha">`.
   - Quitar `densidad-platillos` de la clase del `<html>`.
   - Si el cliente elige la sobria, antes de borrar hay que pasar sus reglas a CSS normal.
2. En `css/estilos.css`, borrar lo que hay entre `[MANDO DE MAQUETA]` y `fin del bloque [MANDO DE MAQUETA]`, y también las líneas `.densidad-sobria` sueltas de los `@media` de 1100, 900 y 560 px.
3. En `js/main.js`, borrar `mandoMaqueta()` y la escucha de `densidad-cambiada` dentro de `areas()`.
4. En `privacidad.html`, borrar la fila `pozorondon-densidad`.
5. Pasar `node scripts/comprobar-borrado.mjs`.

## Estructura

```
index.html          cortina, hero, cinta, [ficha: solo sobria], áreas, quién soy, contacto
404.html            «Esta página no pesa nada.» Rutas absolutas bajo /pozo-rondon-graduado-social-badajoz-web/
aviso-legal.html    borrador con su NIF y colegiación; falta la planta
privacidad.html     borrador; lista lo que se guarda en localStorage
css/estilos.css
js/main.js          GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.13, desde jsDelivr
assets/             favicon (su balanza), retrato, og-pozo-rondon.jpg (1200×630)
scripts/            servir.mjs, verificar.mjs, contraste.mjs, comprobar-borrado.mjs
```

## Antes de publicar como web del cliente

- [ ] Resolver los pendientes de arriba, empezando por la dirección.
- [ ] Borrar el mando y pasar `comprobar-borrado.mjs`.
- [ ] Quitar el `noindex` de las cuatro páginas.
- [ ] Su dominio **pozorondon.es** ya existe (DonDominio, con correo) y no tiene web: es donde iría esta.
