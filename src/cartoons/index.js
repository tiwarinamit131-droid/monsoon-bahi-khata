/**
 * Hand-drawn SVG characters, built as strings so they cost zero network requests.
 * Megh (the cloud), Mor (the peacock), Kisan (the farmer), Munim ji (the ledger keeper) and paper boats.
 * Each takes a mood so the cast can react to the numbers.
 */

function drops() {
  const xs = [86, 104, 122, 140, 158];
  let out = '';
  xs.forEach(function (x, i) {
    out +=
      '<g transform="translate(' +
      x +
      ' 138)"><path class="drop" style="animation-delay:' +
      (i * 0.23).toFixed(2) +
      's" d="M0 0 C-5 8 -6 12 0 16 C6 12 5 8 0 0Z" fill="#5fe0e8"/></g>';
  });
  return out;
}

export function megh(mood, prop) {
  mood = mood || 'happy';
  const mouth = {
    happy:
      '<path d="M102 110 Q117 128 132 110 Z" fill="#ff6f7d" stroke="#1b2150" stroke-width="3.5" stroke-linejoin="round"/>',
    ok: '<path d="M104 116 Q117 122 130 116" fill="none" stroke="#1b2150" stroke-width="3.5" stroke-linecap="round"/>',
    sad: '<path d="M102 122 Q117 108 132 122" fill="none" stroke="#1b2150" stroke-width="3.5" stroke-linecap="round"/>',
  }[mood];
  const brows =
    mood === 'sad'
      ? '<path d="M92 82 L108 88 M142 82 L126 88" stroke="#1b2150" stroke-width="3" stroke-linecap="round"/>'
      : '<path d="M94 82 Q102 77 110 82 M124 82 Q132 77 140 82" fill="none" stroke="#1b2150" stroke-width="3" stroke-linecap="round"/>';
  let rays = '';
  for (let i = 0; i < 10; i++) {
    const a = (i * 36 * Math.PI) / 180;
    rays +=
      '<line x1="' +
      (186 + Math.cos(a) * 32).toFixed(1) +
      '" y1="' +
      (40 + Math.sin(a) * 32).toFixed(1) +
      '" x2="' +
      (186 + Math.cos(a) * 44).toFixed(1) +
      '" y2="' +
      (40 + Math.sin(a) * 44).toFixed(1) +
      '" stroke="#ffc53d" stroke-width="5" stroke-linecap="round"/>';
  }
  const sun =
    mood === 'sad' ? '<g class="sun">' + rays + '<circle cx="186" cy="40" r="26" fill="#ffc53d"/></g>' : '';
  const sweat =
    mood === 'sad'
      ? '<path class="sweat" d="M152 78 C148 86 148 90 152 93 C156 90 156 86 152 78Z" fill="#9fe7ff"/>'
      : '';
  const magnifier =
    prop === 'magnifier'
      ? '<g class="prop" transform="translate(186 112) rotate(-24)"><rect x="-4.5" y="18" width="9" height="40" rx="4.5" fill="#7a4d26"/><circle r="20" fill="rgba(170,230,255,.35)" stroke="#7a4d26" stroke-width="6"/><path d="M-9 -8 Q-4 -14 4 -13" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g>'
      : '';
  return (
    '<svg viewBox="0 0 240 190" class="toon megh ' +
    mood +
    '" role="img" aria-label="Megh the cloud looking ' +
    mood +
    '">' +
    sun +
    '<g class="cloudbody">' +
    '<circle cx="74" cy="100" r="40" fill="#c4d4f6"/><circle cx="120" cy="82" r="50" fill="#c4d4f6"/><circle cx="164" cy="102" r="38" fill="#c4d4f6"/>' +
    '<circle cx="72" cy="94" r="40" fill="#f4f8ff"/><circle cx="118" cy="76" r="50" fill="#f4f8ff"/><circle cx="162" cy="96" r="38" fill="#f4f8ff"/>' +
    '<circle cx="98" cy="114" r="36" fill="#f4f8ff"/><circle cx="142" cy="116" r="34" fill="#f4f8ff"/><circle cx="118" cy="106" r="40" fill="#f4f8ff"/>' +
    '<ellipse cx="102" cy="74" rx="22" ry="10" fill="#fff" opacity=".9"/>' +
    brows +
    '<g class="eyes"><ellipse cx="102" cy="98" rx="6.5" ry="8.5" fill="#1b2150"/><ellipse cx="132" cy="98" rx="6.5" ry="8.5" fill="#1b2150"/>' +
    '<circle cx="104.5" cy="95" r="2.4" fill="#fff"/><circle cx="134.5" cy="95" r="2.4" fill="#fff"/></g>' +
    '<ellipse cx="88" cy="112" rx="8" ry="4.5" fill="#ff9db0" opacity=".75"/><ellipse cx="146" cy="112" rx="8" ry="4.5" fill="#ff9db0" opacity=".75"/>' +
    mouth +
    sweat +
    '</g>' +
    (mood !== 'sad' ? drops() : '') +
    magnifier +
    '</svg>'
  );
}

export function peacock() {
  const N = 15;
  let f = '',
    i,
    a;
  for (i = 0; i < N; i++) {
    a = -84 + i * (168 / (N - 1));
    f +=
      '<g transform="rotate(' +
      a.toFixed(1) +
      ' 130 196)"><path d="M130 196 L130 64" stroke="#2f8a3a" stroke-width="2.2"/>' +
      '<ellipse cx="130" cy="78" rx="11" ry="26" fill="#27a85e" opacity=".85"/>' +
      '<ellipse cx="130" cy="58" rx="16" ry="24" fill="#1f9e5a"/><ellipse cx="130" cy="55" rx="11" ry="16" fill="#e2b93b"/>' +
      '<ellipse cx="130" cy="53" rx="7.5" ry="11" fill="#1a6fd6"/><ellipse cx="130" cy="52" rx="3.6" ry="5.5" fill="#0b1640"/></g>';
  }
  for (i = 0; i < N - 1; i++) {
    a = -78 + i * (156 / (N - 2));
    f +=
      '<g transform="rotate(' +
      a.toFixed(1) +
      ' 130 196)"><ellipse cx="130" cy="110" rx="10" ry="30" fill="#1c8f4e" opacity=".9"/>' +
      '<ellipse cx="130" cy="98" rx="6" ry="9" fill="#e2b93b"/><ellipse cx="130" cy="97" rx="3.5" ry="5" fill="#1a6fd6"/></g>';
  }
  return (
    '<svg viewBox="0 0 260 240" class="toon peacock" role="img" aria-label="Mor the peacock">' +
    '<defs><linearGradient id="pkb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1fb6e0"/><stop offset="1" stop-color="#1640c0"/></linearGradient></defs>' +
    '<g class="tail">' +
    f +
    '</g>' +
    '<path d="M124 206 L118 230 M136 206 L142 230 M112 230 L124 230 M136 230 L148 230" stroke="#d08c3c" stroke-width="3.5" stroke-linecap="round"/>' +
    '<path d="M130 124 C108 142 108 192 130 210 C152 192 152 142 130 124Z" fill="url(#pkb)"/>' +
    '<path d="M138 152 C156 162 156 188 140 200 C146 184 144 168 138 152Z" fill="#a8693a"/>' +
    '<path d="M124 132 C122 118 124 108 128 100 L136 100 C138 110 138 122 136 134Z" fill="#1a5fe0"/>' +
    '<g class="head"><circle cx="132" cy="96" r="13" fill="#1a5fe0"/><path d="M133 92 Q140 90 145 94" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<circle cx="137" cy="94" r="3.4" fill="#fff"/><circle cx="138" cy="94" r="1.8" fill="#0b1640"/>' +
    '<path d="M144 96 L156 99 L144 102Z" fill="#f0a63a"/>' +
    '<path d="M130 84 L122 68 M132 83 L132 66 M134 84 L142 68" stroke="#1a5fe0" stroke-width="2"/>' +
    '<circle cx="122" cy="66" r="3.5" fill="#1aa0d8"/><circle cx="132" cy="64" r="3.5" fill="#1aa0d8"/><circle cx="142" cy="66" r="3.5" fill="#1aa0d8"/></g>' +
    '</svg>'
  );
}

export function farmer(mood) {
  mood = mood || 'happy';
  const mouth =
    mood === 'happy'
      ? '<path d="M90 141 Q100 152 110 141" fill="#7a2b26" stroke="#3a1a12" stroke-width="2.5"/>'
      : mood === 'sad'
        ? '<path d="M90 148 Q100 139 110 148" fill="none" stroke="#3a1a12" stroke-width="3" stroke-linecap="round"/>'
        : '<path d="M91 144 L109 144" stroke="#3a1a12" stroke-width="3" stroke-linecap="round"/>';
  const brows =
    mood === 'sad'
      ? '<path d="M78 96 L92 101 M122 96 L108 101" stroke="#2a1a12" stroke-width="3.5" stroke-linecap="round"/>'
      : '<path d="M78 99 Q85 94 92 99 M108 99 Q115 94 122 99" fill="none" stroke="#2a1a12" stroke-width="3.5" stroke-linecap="round"/>';
  let grains = '';
  for (let i = 0; i < 6; i++) {
    grains +=
      '<path d="M' +
      (30 + i * 4) +
      ' 236 Q' +
      (26 + i * 5) +
      ' 190 ' +
      (18 + i * 7) +
      ' ' +
      (150 + (i % 3) * 8) +
      '" stroke="#c9a227" stroke-width="2.4" fill="none"/>' +
      '<ellipse cx="' +
      (18 + i * 7) +
      '" cy="' +
      (150 + (i % 3) * 8) +
      '" rx="3.2" ry="7" fill="#e8c34a" transform="rotate(-20 ' +
      (18 + i * 7) +
      ' ' +
      (150 + (i % 3) * 8) +
      ')"/>';
  }
  return (
    '<svg viewBox="0 0 200 240" class="toon farmer ' +
    mood +
    '" role="img" aria-label="Kisan the farmer looking ' +
    mood +
    '">' +
    '<path d="M44 240 L56 176 Q100 158 144 176 L156 240Z" fill="#f6f1e4"/>' +
    '<path d="M88 176 L100 206 L112 176" fill="none" stroke="#d8cfb6" stroke-width="2"/>' +
    '<path d="M58 176 Q100 198 142 176 L138 192 Q100 214 62 192Z" fill="#d6453d"/>' +
    '<path d="M70 184 L72 196 M86 190 L86 202 M100 192 L100 204 M114 190 L114 202 M128 184 L126 196" stroke="#fff" stroke-width="2" opacity=".7"/>' +
    '<rect x="90" y="146" width="20" height="22" fill="#b97845"/>' +
    '<circle cx="60" cy="116" r="9" fill="#b97845"/><circle cx="140" cy="116" r="9" fill="#b97845"/>' +
    '<circle cx="100" cy="114" r="42" fill="#c58553"/>' +
    '<path d="M56 104 Q56 54 100 50 Q144 54 144 104 Q100 86 56 104Z" fill="#ff8a1f"/>' +
    '<path d="M62 92 Q100 74 138 92 M66 78 Q100 62 134 78" stroke="#e66a00" stroke-width="4" fill="none"/>' +
    '<path d="M140 92 Q156 104 150 136 Q146 120 136 104Z" fill="#ff8a1f"/>' +
    '<rect x="97.5" y="86" width="5" height="12" rx="2.5" fill="#d6283a"/>' +
    brows +
    '<ellipse cx="85" cy="112" rx="5" ry="6.5" fill="#2a1a12"/><ellipse cx="115" cy="112" rx="5" ry="6.5" fill="#2a1a12"/>' +
    '<circle cx="87" cy="110" r="1.8" fill="#fff"/><circle cx="117" cy="110" r="1.8" fill="#fff"/>' +
    '<path d="M100 114 Q96 126 100 128" stroke="#9a5f36" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
    '<path d="M74 136 Q86 124 100 132 Q114 124 126 136 Q130 128 132 132 Q122 142 100 136 Q78 142 68 132 Q70 128 74 136Z" fill="#2a1a12"/>' +
    mouth +
    grains +
    '</svg>'
  );
}

export function munim() {
  return (
    '<svg viewBox="0 0 220 250" class="toon munim" role="img" aria-label="Munim ji with his red bahi-khata">' +
    '<path d="M46 250 L58 178 Q110 158 162 178 L174 250Z" fill="#c7922b"/>' +
    '<path d="M110 168 L110 250" stroke="#a87418" stroke-width="2"/>' +
    '<circle cx="110" cy="196" r="3" fill="#6b4a12"/><circle cx="110" cy="214" r="3" fill="#6b4a12"/><circle cx="110" cy="232" r="3" fill="#6b4a12"/>' +
    '<rect x="100" y="146" width="20" height="24" fill="#c98a5c"/>' +
    '<circle cx="70" cy="108" r="9" fill="#c98a5c"/><circle cx="150" cy="108" r="9" fill="#c98a5c"/>' +
    '<circle cx="110" cy="106" r="42" fill="#d79b6d"/>' +
    '<path d="M70 82 L150 82 L142 58 Q110 46 78 58Z" fill="#fbfbf3"/><path d="M78 58 Q110 70 142 58" stroke="#d9d6c4" stroke-width="2" fill="none"/>' +
    '<rect x="150" y="70" width="6" height="34" rx="2" transform="rotate(18 153 87)" fill="#2b4fd6"/><rect x="150" y="66" width="6" height="7" rx="1" transform="rotate(18 153 87)" fill="#ffd36b"/>' +
    '<circle cx="95" cy="106" r="12" fill="rgba(200,230,255,.35)" stroke="#2a2a2a" stroke-width="3"/><circle cx="125" cy="106" r="12" fill="rgba(200,230,255,.35)" stroke="#2a2a2a" stroke-width="3"/>' +
    '<path d="M107 106 L113 106 M83 104 L72 100 M137 104 L148 100" stroke="#2a2a2a" stroke-width="3"/>' +
    '<circle cx="95" cy="107" r="3.4" fill="#2a1a12"/><circle cx="125" cy="107" r="3.4" fill="#2a1a12"/>' +
    '<path d="M96 128 Q110 134 124 128" stroke="#8a8a8a" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<path d="M98 136 Q110 144 122 136" stroke="#5a2a1a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<g class="book"><rect x="58" y="180" width="104" height="64" rx="5" fill="#b3202a"/><rect x="58" y="180" width="104" height="64" rx="5" fill="none" stroke="#7d1219" stroke-width="3"/>' +
    '<path d="M58 212 L162 212" stroke="#ffd36b" stroke-width="3"/><circle cx="110" cy="212" r="5" fill="#ffd36b"/>' +
    '<text x="110" y="202" text-anchor="middle" font-size="15" fill="#ffd36b" font-family="Rozha One, serif">शुभ लाभ</text>' +
    '<text x="110" y="234" text-anchor="middle" font-size="11" fill="#ffd36b" font-family="Rozha One, serif">बही-खाता</text></g>' +
    '<ellipse cx="62" cy="214" rx="10" ry="12" fill="#d79b6d"/><ellipse cx="158" cy="214" rx="10" ry="12" fill="#d79b6d"/>' +
    '</svg>'
  );
}

export function boat(color) {
  return (
    '<svg viewBox="0 0 70 40" class="boat-svg" aria-hidden="true"><path d="M2 22 L68 22 L56 36 L14 36Z" fill="' +
    (color || '#f4f8ff') +
    '"/>' +
    '<path d="M16 22 L35 2 L54 22Z" fill="#e4ecff"/><path d="M35 2 L35 22" stroke="#b8c6ea" stroke-width="1.5"/></svg>'
  );
}
