/**
 * Dibujo de la flota para el panel izquierdo del inicio de sesión: un bus y una van en la
 * carretera, con la ciudad atrás. Es solo decorativo (aria-hidden) y está hecho con SVG, sin
 * imágenes externas.
 */
export function IlustracionFlota({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 210" fill="none" aria-hidden="true" focusable="false" className={className}>
      {/* Sol y ciudad */}
      <circle cx="330" cy="58" r="34" fill="#ea580c" opacity="0.18" />
      <circle cx="330" cy="58" r="20" fill="#f97316" opacity="0.35" />
      <g fill="#292524">
        <rect x="18" y="62" width="34" height="88" rx="3" />
        <rect x="58" y="40" width="44" height="110" rx="3" />
        <rect x="108" y="78" width="30" height="72" rx="3" />
        <rect x="236" y="70" width="38" height="80" rx="3" />
        <rect x="280" y="96" width="52" height="54" rx="3" />
        <rect x="338" y="80" width="40" height="70" rx="3" />
      </g>
      <g fill="#fdba74" opacity="0.55">
        <rect x="66" y="52" width="7" height="7" rx="1" />
        <rect x="84" y="52" width="7" height="7" rx="1" />
        <rect x="66" y="70" width="7" height="7" rx="1" />
        <rect x="84" y="88" width="7" height="7" rx="1" />
        <rect x="26" y="76" width="7" height="7" rx="1" />
        <rect x="244" y="84" width="7" height="7" rx="1" />
        <rect x="258" y="102" width="7" height="7" rx="1" />
        <rect x="346" y="94" width="7" height="7" rx="1" />
        <rect x="362" y="112" width="7" height="7" rx="1" />
      </g>

      {/* Carretera */}
      <rect x="0" y="150" width="400" height="60" fill="#0c0a09" />
      <path d="M0 182h400" stroke="#f97316" strokeWidth="3" strokeDasharray="22 16" />

      {/* Líneas de movimiento */}
      <path d="M14 122h26M6 134h30M18 146h20" stroke="#fdba74" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

      {/* Bus */}
      <rect x="48" y="96" width="176" height="64" rx="12" fill="#ea580c" />
      <rect x="48" y="138" width="176" height="8" fill="#c2410c" />
      <g fill="#fff7ed" opacity="0.92">
        <rect x="60" y="106" width="28" height="22" rx="4" />
        <rect x="94" y="106" width="28" height="22" rx="4" />
        <rect x="128" y="106" width="28" height="22" rx="4" />
        <rect x="162" y="106" width="22" height="22" rx="4" />
      </g>
      <rect x="192" y="106" width="22" height="40" rx="4" fill="#fed7aa" />
      <rect x="216" y="142" width="8" height="6" rx="2" fill="#fef3c7" />
      <circle cx="84" cy="162" r="13" fill="#1c1917" />
      <circle cx="84" cy="162" r="5" fill="#a8a29e" />
      <circle cx="184" cy="162" r="13" fill="#1c1917" />
      <circle cx="184" cy="162" r="5" fill="#a8a29e" />

      {/* Van */}
      <path d="M246 124c0-6 5-11 11-11h52l22 22v25h-85z" fill="#e7e5e4" />
      <rect x="246" y="146" width="85" height="6" fill="#ea580c" />
      <g fill="#78716c" opacity="0.85">
        <rect x="256" y="121" width="22" height="16" rx="3" />
        <rect x="284" y="121" width="22" height="16" rx="3" />
      </g>
      <path d="M312 121h4l13 14h-17z" fill="#78716c" opacity="0.85" />
      <circle cx="268" cy="162" r="11" fill="#1c1917" />
      <circle cx="268" cy="162" r="4" fill="#a8a29e" />
      <circle cx="312" cy="162" r="11" fill="#1c1917" />
      <circle cx="312" cy="162" r="4" fill="#a8a29e" />
    </svg>
  );
}
