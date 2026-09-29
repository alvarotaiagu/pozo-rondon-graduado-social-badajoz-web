/* Contraste de cada pareja texto/fondo del sitio, calculado (no a ojo).
   node scripts/contraste.mjs */
const hex = h => h.replace('#', '').match(/../g).map(x => parseInt(x, 16) / 255);
const lin = c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const L = h => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const papel = '#F7F6F1', blanco = '#FFFFFF', verde = '#1E5C3F', hondo = '#133D2A', noche = '#0D2A1D';
const parejas = [
  ['tinta sobre papel', '#121613', papel, 4.5],
  ['tinta suave sobre papel', '#4B544F', papel, 4.5],
  ['gris (antetítulos, rótulos) sobre papel', '#5F6367', papel, 4.5],
  ['gris sobre la tarjeta 6', '#5F6367', '#E1EAE3', 4.5],
  ['tinta suave sobre la tarjeta 6', '#4B544F', '#E1EAE3', 4.5],
  ['verde sobre papel (enlaces, lema)', verde, papel, 4.5],
  ['verde sobre la tarjeta 6', verde, '#E1EAE3', 4.5],
  ['blanco sobre verde (botón)', blanco, verde, 4.5],
  ['blanco sobre verde hondo (botón :hover)', blanco, hondo, 4.5],
  ['hueso sobre verde (cinta)', '#EEF3EE', verde, 4.5],
  ['hueso sobre verde hondo', '#EEF3EE', hondo, 4.5],
  ['hueso apagado sobre verde hondo', '#B9CBC0', hondo, 4.5],
  ['verde luz (texto) sobre verde hondo', '#9BD3B4', hondo, 4.5],
  ['verde luz sobre verde noche (pie)', '#9BD3B4', noche, 4.5],
  ['hueso apagado sobre verde noche (pie)', '#B9CBC0', noche, 4.5],
  ['verde hondo sobre hueso (botón en contacto)', hondo, '#EEF3EE', 4.5],
  ['pendiente sobre papel', '#7A3F12', '#F2EBD2', 4.5],
  ['pendiente sobre verde hondo', '#F2D79F', hondo, 4.5],
  ['blanco sobre verde (numeral de la pesa, grande)', blanco, verde, 3]
];
let malas = 0;
for (const [n, t, f, min] of parejas) {
  const r = ratio(t, f);
  const ok = r >= min;
  if (!ok) malas++;
  console.log((ok ? 'OK   ' : 'FALLA') + '  ' + r.toFixed(2).padStart(5) + ' ≥ ' + min + '  ' + n);
}
if (malas) process.exitCode = 1;
