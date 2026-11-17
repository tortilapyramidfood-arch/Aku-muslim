import React from 'react';
import { MakhrajRegion } from '../../data/tajwidComprehensiveData';

interface MakhrajAnatomyDiagramProps {
  regions: MakhrajRegion[];
  selectedRegionId: string;
  onSelectRegion: (region: MakhrajRegion) => void;
}

export const MakhrajAnatomyDiagram: React.FC<MakhrajAnatomyDiagramProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
}) => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[4/3] bg-gradient-to-b from-stone-900 to-stone-950 rounded-2xl p-3 border border-stone-800 shadow-inner flex items-center justify-center overflow-hidden">
      {/* Background Anatomical Silhouette */}
      <svg
        viewBox="0 0 320 300"
        className="w-full h-full select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle gradient for head silhouette */}
          <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
          </linearGradient>

          {/* Glow filter for active hotspot */}
          <filter id="emeraldGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Head & Neck Outline Profile (Facing Right) */}
        <path
          d="M 120,30 C 180,25 240,40 260,85 C 270,105 285,120 280,140 C 275,148 265,152 260,154 C 275,160 270,175 255,178 C 248,188 235,195 230,205 C 220,230 215,270 210,290 L 110,290 C 110,250 115,220 115,190 C 110,130 90,80 120,30 Z"
          fill="url(#headGrad)"
          stroke="#334155"
          strokeWidth="2"
        />

        {/* Nasal Cavity (Al-Khaisyum) Contour */}
        <path
          d="M 230,105 C 215,95 190,100 185,115 C 180,125 195,130 220,125 Z"
          fill="#3b82f6"
          fillOpacity="0.15"
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <text x="215" y="100" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle">
          Rongga Hidung
        </text>

        {/* Mouth Cavity & Palate (Langit-langit) */}
        <path
          d="M 170,140 C 190,135 230,135 255,152"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <text x="210" y="132" fill="#94a3b8" fontSize="8" textAnchor="middle">
          Langit-langit Keras & Lunak
        </text>

        {/* Tongue (Lidah) Silhouette */}
        <path
          d="M 175,170 C 185,155 210,150 238,162 C 242,168 235,178 215,178 C 195,178 180,180 175,170 Z"
          fill="#059669"
          fillOpacity="0.25"
          stroke="#10b981"
          strokeWidth="2"
        />
        <text x="210" y="172" fill="#6ee7b7" fontSize="9" fontWeight="bold" textAnchor="middle">
          Lidah (Al-Lisan)
        </text>

        {/* Upper & Lower Lips (Asy-Syafatain) */}
        <ellipse cx="265" cy="155" rx="7" ry="5" fill="#f43f5e" fillOpacity="0.4" stroke="#f43f5e" strokeWidth="1.5" />
        <ellipse cx="262" cy="172" rx="7" ry="5" fill="#f43f5e" fillOpacity="0.4" stroke="#f43f5e" strokeWidth="1.5" />

        {/* Throat Channel (Al-Halq) */}
        <path
          d="M 155,170 L 155,275 M 175,185 L 175,275"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        <text x="140" y="230" fill="#fcd34d" fontSize="9" fontWeight="bold" textAnchor="middle" transform="rotate(-90 140 230)">
          Tenggorokan (Al-Halq)
        </text>

        {/* Interactive Hotspot Nodes */}
        {regions.map((region) => {
          const isSelected = selectedRegionId === region.id;
          const { cx, cy, r } = region.svgCoordinates;

          return (
            <g
              key={region.id}
              onClick={() => onSelectRegion(region)}
              className="cursor-pointer group"
            >
              {/* Pulsing ring when selected */}
              {isSelected && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r + 8}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                  opacity="0.8"
                  className="animate-ping"
                />
              )}

              {/* Main Hotspot Circle */}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? r + 3 : r}
                fill={isSelected ? '#10b981' : '#1e293b'}
                stroke={isSelected ? '#34d399' : '#64748b'}
                strokeWidth={isSelected ? 3 : 1.5}
                filter={isSelected ? 'url(#emeraldGlow)' : undefined}
                className="transition-all duration-300 group-hover:stroke-amber-400 group-hover:scale-105 origin-center"
              />

              {/* Center Dot or Arabic Letter Sample */}
              <text
                cx={cx}
                cy={cy}
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fontSize={isSelected ? '11' : '10'}
                fontWeight="bold"
                fill={isSelected ? '#ffffff' : '#cbd5e1'}
                className="font-arabic pointer-events-none"
              >
                {region.letters[0]?.charAt(0) || '•'}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Overlay Helper Badge */}
      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-stone-400 pointer-events-none">
        <span>Sentuh titik organ untuk melihat makhraj & huruf</span>
        <span className="text-amber-400 font-bold">Model Anatomi Interaktif</span>
      </div>
    </div>
  );
};
