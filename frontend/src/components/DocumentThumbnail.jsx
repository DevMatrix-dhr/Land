// Generates a stylized "scanned register page" placeholder — stands in
// for the real processed_path image the backend would serve at
// /documents/{id}/processed. Seed varies the mock handwriting lines so
// each queue item looks distinct.
export default function DocumentThumbnail({ seed = 1 }) {
  const lines = Array.from({ length: 12 }, (_, i) => i);
  const highlightY = 60 + (seed % 4) * 30;

  return (
    <div className="bg-white border border-parchment-200 rounded-lg p-4">
      <svg viewBox="0 0 340 420" className="w-full h-auto">
        <rect x="0" y="0" width="340" height="420" fill="#FBF8F1" stroke="#E9DFC6" />
        <text x="170" y="28" textAnchor="middle" fontSize="13" fill="#2B4270" fontFamily="serif">
          भूमि अभिलेख रजिस्टर
        </text>
        <line x1="20" y1="40" x2="320" y2="40" stroke="#E9DFC6" />
        {lines.map((i) => (
          <line
            key={i}
            x1="24"
            y1={60 + i * 28}
            x2={280 - ((i * seed) % 5) * 12}
            y2={60 + i * 28}
            stroke="#C9C0A8"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
        <rect x="18" y={highlightY - 10} width="220" height="20" fill="none" stroke="#B5482E" strokeWidth="2" rx="2" />
      </svg>
    </div>
  );
}
