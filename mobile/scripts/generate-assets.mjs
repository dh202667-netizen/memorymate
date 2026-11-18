import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../src/static')
await mkdir(resolve(root, 'icons'), { recursive: true })
await mkdir(resolve(root, 'images'), { recursive: true })
const paths = {
  home: '<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  heart:
    '<path d="M20.5 5.5a5 5 0 0 0-7 0L12 7l-1.5-1.5a5 5 0 0 0-7 7L12 21l8.5-8.5a5 5 0 0 0 0-7Z"/>',
  brain:
    '<path d="M12 4v16m0-14C9 1 4 4 5 8 0 10 2 15 5 15c-1 6 6 7 7 3m0-12c3-5 8-2 7 2 5 2 3 7 0 7 1 6-6 7-7 3M5 8l3 2m-3 5 3-1m11-6-3 2m3 5-3-1"/>',
  chat: '<path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.8L3 21l1.3-5a9 9 0 1 1 16.7-4.5Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  people:
    '<circle cx="9" cy="7" r="3.5"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M16 4a3.5 3.5 0 0 1 0 7m3 3c3 1 3 4 3 7"/>',
  book: '<path d="M12 5v16M12 5C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-3-1-6-2-10 1Z"/>',
  leaf: '<path d="M20 3C8 1 1 7 4 15c3 8 17 5 16-12ZM4 21l11-12M9 16l-1-5m4 2 5 1"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  photo:
    '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2m-8 3h2"/>',
  chart: '<path d="M4 3v17h17M8 16v-4m5 4V8m5 8V5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  arrow: '<path d="M3 12h17m-7-7 7 7-7 7"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 8-3 8-3 10h18c0-2-3-2-3-10ZM9 21h6"/>',
  shield: '<path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z"/><path d="m8 12 3 3 5-6"/>',
  type: '<path d="M2 5h12M8 5v15M4 20h8m3-7h7m-3.5 0v7"/>',
  settings:
    '<path d="m9 3 6 0 1 3 3 1 2 5-2 2v4l-5 3-3-2-3 2-5-3v-4l-2-2 2-5 4-1Z"/><circle cx="12" cy="12" r="3"/>',
  edit: '<path d="m16 3 5 5-12 12-6 1 1-6ZM13 6l5 5"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  mic: '<rect x="8" y="2" width="8" height="13" rx="4"/><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8"/>',
}
for (const [name, body] of Object.entries(paths))
  await writeFile(
    resolve(root, `icons/${name}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#315B48" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`,
  )
await writeFile(
  resolve(root, 'images/logo.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 56"><path d="M24 52V25" stroke="#315B48" stroke-width="3" stroke-linecap="round"/><path d="M24 34C6 34 3 21 5 11c13-1 22 7 19 23Z" fill="#96AA7F"/><path d="M24 25C23 9 34 1 45 3c2 15-9 24-21 22Z" fill="#315B48"/><path d="M24 46C13 46 6 40 8 32c10-1 17 5 16 14Z" fill="#B9C8A7"/></svg>',
)
const avatars = [
  ['grandma', '#e7eadc', '#f1c7a1', '#e9e8df', '#8c9e7b', true],
  ['grandpa', '#e7eced', '#e8bb94', '#b7bab0', '#64857d', true],
  ['son', '#e8e2d6', '#e5b48e', '#414c40', '#6f87a0', false],
  ['girl', '#f3e8dc', '#efc29c', '#493f34', '#c2886e', false],
]
for (const [name, bg, skin, hair, shirt, old] of avatars) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="${bg}"/><path d="M15 105V85c0-28 70-28 70 0v20" fill="${shirt}"/><rect x="42" y="61" width="16" height="19" rx="7" fill="${skin}"/><ellipse cx="50" cy="40" rx="26" ry="29" fill="${hair}"/><ellipse cx="50" cy="47" rx="21" ry="26" fill="${skin}"/><path d="M28 40c7-1 16-7 20-15 6 9 17 11 25 10-1-27-42-30-45 5Z" fill="${hair}"/><path d="M39 47h1m20 0h1" stroke="#494537" stroke-width="3" stroke-linecap="round"/><path d="M44 60q6 5 12 0" fill="none" stroke="#a5725e" stroke-width="2" stroke-linecap="round"/>${old ? '<path d="M31 46h14v10H31Zm24 0h14v10H55Zm-10 3h10" fill="none" stroke="#77786c" stroke-width="1.5"/>' : ''}<path d="m36 77 14 8 14-8" fill="none" stroke="#ffffff70" stroke-width="3"/></svg>`
  await writeFile(resolve(root, `images/${name}.svg`), svg)
}
const familyScene = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 370"><rect width="720" height="370" fill="#E7EBDD"/><circle cx="580" cy="60" r="100" fill="#D6E0C8"/><path d="M0 300Q190 250 365 300t355-20v90H0" fill="#C8D5B7"/><rect x="170" y="44" width="360" height="238" rx="9" fill="#F8F3E6"/><rect x="192" y="65" width="316" height="185" rx="3" fill="#DBE4D4"/><path d="M220 250V120h80v130m15 0V91h70v159m16 0V120h75v130" fill="#EAF0E4"/><path d="M211 183h290M350 66v184" stroke="#F8F3E6" stroke-width="8"/><path d="M106 310V188m0 62c-49-7-53-40-40-59 32 3 46 26 40 59m0-22c44-2 58-27 43-54-34 5-46 24-43 54" fill="#8CA47C" stroke="#6B865E" stroke-width="3"/><path d="M78 290h55l-8 58H88" fill="#BDA887"/><rect x="188" y="230" width="350" height="100" rx="30" fill="#9CAC86"/><path d="M175 267v66m377-66v66" stroke="#799263" stroke-width="19" stroke-linecap="round"/><path d="M210 338h319" stroke="#87966F" stroke-width="10" stroke-linecap="round"/>`
const figure = (x, y, scale, shirt, hair) =>
  `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M-34 100c0-65 68-65 68 0" fill="${shirt}"/><rect x="-8" y="42" width="16" height="20" rx="6" fill="#E5B890"/><ellipse cy="24" rx="25" ry="30" fill="${hair}"/><ellipse cy="30" rx="20" ry="25" fill="#EEC6A0"/><path d="M-21 22C-18-9 19-10 22 18 7 19-3 10-5 5-8 16-16 20-21 22" fill="${hair}"/><path d="M-8 30h1m14 0h1" stroke="#514E3B" stroke-width="2.4" stroke-linecap="round"/><path d="M-5 41q5 4 10 0" stroke="#B07F67" fill="none" stroke-width="1.5"/><path d="M-20 94v32m40-32v32" stroke="#515F4E" stroke-width="14" stroke-linecap="round"/></g>`
await writeFile(
  resolve(root, 'images/family-moment.svg'),
  familyScene +
    figure(262, 160, 1, '#6F8C79', '#D1D0C4') +
    figure(344, 170, 0.94, '#C6A67F', '#DAD6C7') +
    figure(432, 147, 1.1, '#71899A', '#4F5141') +
    figure(487, 218, 0.7, '#BF8D75', '#534C3B') +
    '<path d="M570 300v-80m0 43c-30-3-43-27-25-43 24 4 29 20 25 43m1-20c26-3 35-20 25-36-20 3-29 17-25 36" stroke="#7C9969" fill="#99B084" stroke-width="3"/><rect x="549" y="293" width="45" height="40" rx="5" fill="#C2AC89"/></svg>',
)
console.log('Generated original local SVG assets (no external media or fonts).')
