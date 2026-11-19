// Hand-drawn SVG artwork: family illustrations and custom food / playground icons.
// All original vector art (no third-party characters).

const SKIN1 = '#E9B48A', SKIN2 = '#EDBF98', SKIN3 = '#E2A979';
const INK = '#2A1A14';

function face(cx, cy, s = 1, blush = true) {
  return `
    <circle cx="${cx - 13 * s}" cy="${cy}" r="${4.8 * s}" fill="${INK}"/>
    <circle cx="${cx + 13 * s}" cy="${cy}" r="${4.8 * s}" fill="${INK}"/>
    <circle cx="${cx - 11.5 * s}" cy="${cy - 1.6 * s}" r="${1.5 * s}" fill="#fff"/>
    <circle cx="${cx + 14.5 * s}" cy="${cy - 1.6 * s}" r="${1.5 * s}" fill="#fff"/>
    <path d="M${cx - 10 * s},${cy + 13 * s} Q${cx},${cy + 23 * s} ${cx + 10 * s},${cy + 13 * s}" stroke="#7A3B2E" stroke-width="${4 * s}" fill="none" stroke-linecap="round"/>
    ${blush ? `<circle cx="${cx - 22 * s}" cy="${cy + 11 * s}" r="${7 * s}" fill="#F28B82" opacity=".45"/>
    <circle cx="${cx + 22 * s}" cy="${cy + 11 * s}" r="${7 * s}" fill="#F28B82" opacity=".45"/>` : ''}`;
}

// Standing family of four holding hands. viewBox 0 0 600 420
function familySVG(id, opts = {}) {
  const table = opts.table;
  return `
<svg id="${id}" class="family" viewBox="0 0 600 420" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <ellipse cx="300" cy="400" rx="280" ry="16" fill="#000" opacity=".08"/>
  <!-- father -->
  <g class="p p-dad">
    <rect x="113" y="285" width="25" height="104" rx="12" fill="#2F3B55"/>
    <rect x="146" y="285" width="25" height="104" rx="12" fill="#2F3B55"/>
    <ellipse cx="124" cy="392" rx="21" ry="9" fill="#1E1E28"/>
    <ellipse cx="160" cy="392" rx="21" ry="9" fill="#1E1E28"/>
    <path d="M102,186 L78,262" stroke="#8E2E3A" stroke-width="26" stroke-linecap="round"/>
    <circle cx="77" cy="268" r="13" fill="${SKIN1}"/>
    <path d="M182,186 L214,252" stroke="#8E2E3A" stroke-width="26" stroke-linecap="round"/>
    <circle cx="217" cy="259" r="13" fill="${SKIN1}"/>
    <rect x="94" y="160" width="96" height="142" rx="36" fill="#8E2E3A"/>
    <path d="M124,162 L142,190 L160,162 Z" fill="#fff" opacity=".9"/>
    <rect x="130" y="140" width="24" height="28" rx="8" fill="${SKIN1}"/>
    <g class="head">
      <circle cx="96" cy="112" r="10" fill="${SKIN1}"/><circle cx="186" cy="112" r="10" fill="${SKIN1}"/>
      <circle cx="141" cy="108" r="45" fill="${SKIN1}"/>
      <path d="M96,104 C92,58 188,52 186,102 C178,84 156,76 140,84 C124,76 104,84 96,104Z" fill="${INK}"/>
      ${face(141, 112)}
    </g>
  </g>
  <!-- mother (hijab) -->
  <g class="p p-mum">
    <ellipse cx="272" cy="392" rx="19" ry="8" fill="#1E1E28"/>
    <ellipse cx="310" cy="392" rx="19" ry="8" fill="#1E1E28"/>
    <path d="M254,192 L224,256" stroke="#2BA88F" stroke-width="24" stroke-linecap="round"/>
    <circle cx="222" cy="262" r="12" fill="${SKIN2}"/>
    <path d="M326,192 L358,258" stroke="#2BA88F" stroke-width="24" stroke-linecap="round"/>
    <circle cx="361" cy="264" r="12" fill="${SKIN2}"/>
    <path d="M250,172 Q291,152 332,172 L354,386 Q291,398 228,386 Z" fill="#2BA88F"/>
    <path d="M262,300 Q291,308 320,300" stroke="#fff" stroke-width="5" fill="none" opacity=".35"/>
    <g class="head">
      <path d="M236,118 Q232,198 291,206 Q350,198 346,118 Z" fill="#F2A03D"/>
      <circle cx="291" cy="110" r="55" fill="#F2A03D"/>
      <ellipse cx="291" cy="118" rx="35" ry="40" fill="${SKIN2}"/>
      <path d="M252,96 Q291,58 330,96" stroke="#E08A28" stroke-width="7" fill="none" stroke-linecap="round"/>
      ${face(291, 118, 0.92)}
    </g>
  </g>
  <!-- boy -->
  <g class="p p-boy">
    <rect x="395" y="320" width="18" height="66" rx="9" fill="${SKIN3}"/>
    <rect x="417" y="320" width="18" height="66" rx="9" fill="${SKIN3}"/>
    <ellipse cx="402" cy="390" rx="16" ry="8" fill="#E8553E"/>
    <ellipse cx="430" cy="390" rx="16" ry="8" fill="#E8553E"/>
    <rect x="388" y="296" width="54" height="40" rx="12" fill="#2F3B55"/>
    <path d="M388,258 L364,268" stroke="#FFC845" stroke-width="20" stroke-linecap="round"/>
    <path d="M440,258 L460,294" stroke="#FFC845" stroke-width="20" stroke-linecap="round"/>
    <circle cx="462" cy="300" r="10" fill="${SKIN3}"/>
    <rect x="382" y="240" width="66" height="72" rx="24" fill="#FFC845"/>
    <g class="head">
      <circle cx="415" cy="200" r="35" fill="${SKIN3}"/>
      <path d="M380,196 C376,160 414,150 432,162 C442,154 456,170 450,192 C440,178 420,176 406,180 C396,176 386,184 380,196Z" fill="${INK}"/>
      ${face(415, 204, 0.75)}
    </g>
  </g>
  <!-- girl -->
  <g class="p p-girl">
    <rect x="487" y="340" width="16" height="48" rx="8" fill="${SKIN2}"/>
    <rect x="507" y="340" width="16" height="48" rx="8" fill="${SKIN2}"/>
    <ellipse cx="494" cy="390" rx="14" ry="7" fill="#8E2E3A"/>
    <ellipse cx="518" cy="390" rx="14" ry="7" fill="#8E2E3A"/>
    <path d="M482,276 L466,296" stroke="#FF7E8F" stroke-width="18" stroke-linecap="round"/>
    <g class="wave"><path d="M528,276 L552,240" stroke="#FF7E8F" stroke-width="18" stroke-linecap="round"/>
    <circle cx="555" cy="234" r="10" fill="${SKIN2}"/></g>
    <path d="M478,262 Q505,250 532,262 L548,350 Q505,360 462,350 Z" fill="#FF7E8F"/>
    <g class="head">
      <circle cx="469" cy="214" r="15" fill="#3A2418"/><circle cx="541" cy="214" r="15" fill="#3A2418"/>
      <circle cx="505" cy="214" r="32" fill="${SKIN2}"/>
      <path d="M473,210 C470,176 540,172 537,210 C526,192 506,188 496,196 C488,192 478,198 473,210Z" fill="#3A2418"/>
      <path d="M520,184 l14,-10 l2,16 z M520,184 l-4,-16 l16,6 z" fill="#FFC845"/>
      ${face(505, 218, 0.72)}
    </g>
  </g>
  ${table ? `
  <g class="table">
    <rect x="40" y="292" width="520" height="30" rx="14" fill="#E7C49A"/>
    <rect x="62" y="318" width="476" height="84" rx="10" fill="#D4A877"/>
    <rect x="62" y="318" width="476" height="10" fill="#000" opacity=".08"/>
    <ellipse cx="160" cy="292" rx="48" ry="12" fill="#fff"/>
    <ellipse cx="300" cy="292" rx="56" ry="13" fill="#fff"/>
    <ellipse cx="440" cy="292" rx="48" ry="12" fill="#fff"/>
    <g transform="translate(286,252) rotate(-20)"><ellipse cx="18" cy="16" rx="24" ry="18" fill="#D9822B"/><path d="M0,30 L-16,46" stroke="#FFF4E0" stroke-width="9" stroke-linecap="round"/><circle cx="-19" cy="47" r="6" fill="#FFF4E0"/><circle cx="-13" cy="52" r="6" fill="#FFF4E0"/></g>
    <g transform="translate(140,266)"><path d="M0,26 L6,0 L34,0 L40,26 Z" fill="#E8553E"/><rect x="8" y="-14" width="6" height="18" rx="2" fill="#FFD25C"/><rect x="17" y="-18" width="6" height="22" rx="2" fill="#FFD25C"/><rect x="26" y="-12" width="6" height="16" rx="2" fill="#FFD25C"/></g>
    <g transform="translate(424,250)"><path d="M2,6 L30,6 L26,42 L6,42 Z" fill="#2BA88F"/><rect x="0" y="0" width="32" height="8" rx="4" fill="#1F7F6C"/><path d="M20,0 L26,-16" stroke="#FF7E8F" stroke-width="4" stroke-linecap="round"/></g>
  </g>` : ''}
</svg>`;
}

// Custom white glyph icons, viewBox 0 0 100 100
const ICONS = {
  drumstick: `<svg viewBox="0 0 100 100"><g fill="#fff"><ellipse cx="60" cy="38" rx="28" ry="23" transform="rotate(-38 60 38)"/><path d="M42,56 L22,76" stroke="#fff" stroke-width="12" stroke-linecap="round"/><circle cx="17" cy="74" r="8"/><circle cx="25" cy="83" r="8"/></g></svg>`,
  fries: `<svg viewBox="0 0 100 100"><g fill="#fff"><rect x="30" y="14" width="9" height="40" rx="3"/><rect x="43" y="8" width="9" height="46" rx="3"/><rect x="56" y="12" width="9" height="42" rx="3"/><rect x="66" y="20" width="8" height="34" rx="3" opacity=".85"/><path d="M22,40 L78,40 L70,90 L30,90 Z"/></g></svg>`,
  drink: `<svg viewBox="0 0 100 100"><g fill="#fff"><path d="M28,32 L72,32 L66,90 L34,90 Z"/><rect x="24" y="24" width="52" height="10" rx="5"/><path d="M54,24 L62,6" stroke="#fff" stroke-width="6" stroke-linecap="round"/></g></svg>`,
  slide: `<svg viewBox="0 0 100 100"><g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"><path d="M22,90 L22,22 M42,90 L42,22" stroke-width="7"/><path d="M22,42 L42,42 M22,60 L42,60 M22,76 L42,76" stroke-width="6"/><path d="M42,24 C62,26 66,46 76,66 C82,78 86,84 94,86" stroke-width="10"/><path d="M16,22 L48,22" stroke-width="7"/></g><path d="M22,6 L32,0 L42,6 L42,16 L22,16 Z" fill="#fff"/></svg>`,
  check: `<svg viewBox="0 0 100 100"><path class="ckpath" d="M20,54 L42,74 L82,28" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg>`,
};

if (typeof module !== 'undefined') module.exports = { familySVG, ICONS };
