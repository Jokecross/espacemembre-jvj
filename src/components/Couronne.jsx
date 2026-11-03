/** La couronne de JVJ : même dessin que sur la page de vente, jamais l'emoji. */
export default function Couronne({ className = 'h-[13px] w-[18px]' }) {
  return (
    <svg viewBox="0 0 24 17" className={className} aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M2.6 13.2 1.2 3.6l5.6 4.6L12 .9l5.2 7.3 5.6-4.6-1.4 9.6z" />
      <rect fill="currentColor" x="2.6" y="14.6" width="18.8" height="1.6" rx=".8" />
    </svg>
  )
}
