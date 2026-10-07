import React, { useState } from "react";

export type BudgetMood = "ecstatic" | "happy" | "warning" | "sad" | "crying" | "neutral";

interface BudgetMascotProps {
  mood: BudgetMood;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const QUOTES: Record<BudgetMood, string[]> = {
  ecstatic: [
    "Miaww! Saldomu melimpah ruah! Kamu sultan bulan ini! 👑🐱",
    "Purrr... Keuangan sultan! Dompetmu gemuk kayak kucing kenyang! ✨🐾",
    "Ngeongg! Pengeluaran terkendali banget, kamu majikan idaman! 💰🍣",
  ],
  happy: [
    "Miaw~ Keuangan aman sentosa! Nikmati harimu santai sambil purring. 😊🐾",
    "Kondisi sehat walafiat! Belanja harian masih leluasa banget. 🌟🐱",
    "Purrr... Anggaranmu aman terkendali! Good job, meow! 👍✨",
  ],
  warning: [
    "Meong... Telingaku bergerak cemas! Kurangi jajan berlebih ya! 😅🐟",
    "Waspada miaw! Anggaran mulai menipis, tahan dulu godaan checkout! ⚠️🐾",
    "Purr.. rem dulu belanja impulsifnya, yuk lebih hemat miaw! ⏳🐱",
  ],
  sad: [
    "Meoong... (telinga turun sendu). Sisa uang tinggal sedikit, harus super irit! 🥺💧",
    "Dompet sesak nafas meow... Tahan dulu jajan boba & kopi kekinian! 🌧️😿",
    "Sedih banget meow... Prioritaskan makan & kebutuhan pokok dulu ya! 🌧️🐾",
  ],
  crying: [
    "HUWAAA NGEONGGG! Anggaran jebol total! Dompetku nangis kejer! 😭⚡",
    "Darurat meoow! Saldo sekarat, saatnya mode hemat ekstrem bertahan hidup! 🚨😿",
    "STOP BELANJA MEOW! Limit harian sudah terlewati jauh! Darurat majikan! 🚨📦",
  ],
  neutral: [
    "Miaw! Yuk atur anggaran pos belanjamu biar dompet tetap tenang! 📝🐱",
    "Mulai rencanakan pos-pos belanjamu hari ini bareng Si Meong! 💡🐾",
  ],
};

const MOOD_TITLES: Record<BudgetMood, { title: string; badge: string; badgeColor: string }> = {
  ecstatic: {
    title: "Kucing Sultan Makmur",
    badge: "Kondisi Prima 👑",
    badgeColor: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  },
  happy: {
    title: "Meong Aman & Bahagia",
    badge: "Kondisi Sehat ✨",
    badgeColor: "bg-sky-500/20 text-sky-200 border-sky-400/40",
  },
  warning: {
    title: "Meong Mulai Waspada",
    badge: "Kondisi Waspada ⚠️",
    badgeColor: "bg-amber-500/20 text-amber-200 border-amber-400/40",
  },
  sad: {
    title: "Meong Menipis Banget",
    badge: "Kondisi Kritis 💧",
    badgeColor: "bg-rose-500/20 text-rose-200 border-rose-400/40",
  },
  crying: {
    title: "Meong Sekarat!",
    badge: "Overbudget 🚨",
    badgeColor: "bg-red-500/30 text-red-200 border-red-400/50 animate-pulse",
  },
  neutral: {
    title: "Meong Siap Merencanakan",
    badge: "Atur Anggaran 📝",
    badgeColor: "bg-slate-500/20 text-slate-200 border-slate-400/40",
  },
};

export const BudgetMascot: React.FC<BudgetMascotProps> = ({
  mood,
  className = "",
  size = "md",
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);

  const quotes = QUOTES[mood] || QUOTES.neutral;
  const currentQuote = quotes[quoteIndex % quotes.length];
  const moodInfo = MOOD_TITLES[mood] || MOOD_TITLES.neutral;

  const handleMascotClick = () => {
    setIsWiggling(true);
    setQuoteIndex((prev) => prev + 1);
    setTimeout(() => setIsWiggling(false), 600);
  };

  const mascotSizes = {
    sm: "w-28 h-28 sm:w-32 sm:h-32",
    md: "w-36 h-36 sm:w-44 sm:h-44",
    lg: "w-44 h-44 sm:w-52 sm:h-52",
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble */}
      <div
        onClick={handleMascotClick}
        title="Klik Si Meong untuk dengar pesan lain!"
        className="relative mb-3 max-w-[260px] sm:max-w-xs cursor-pointer group transition-transform hover:scale-105 active:scale-95"
      >
        <div className="bg-white/95 backdrop-blur-md text-slate-800 rounded-2xl px-3.5 py-2.5 shadow-xl border border-white/40 text-xs sm:text-sm">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-amber-700 flex items-center gap-1">
              <span>🐱 Si Meong</span>
              <span className="text-[10px] text-slate-400 font-normal">• tap me!</span>
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${moodInfo.badgeColor}`}
            >
              {moodInfo.badge}
            </span>
          </div>
          <p className="text-slate-700 leading-snug font-medium italic">
            "{currentQuote}"
          </p>
        </div>
        {/* Tail */}
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white/95 mx-auto -mt-[1px]"></div>
      </div>

      {/* Mascot Cat Character SVG */}
      <div
        onClick={handleMascotClick}
        className={`relative cursor-pointer transition-transform duration-300 ${
          mascotSizes[size]
        } ${
          isWiggling
            ? "animate-mascot-bounce"
            : mood === "ecstatic"
            ? "animate-mascot-bounce"
            : mood === "crying"
            ? "animate-mascot-sob"
            : "animate-mascot-float"
        }`}
        title="Klik Si Meong!"
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-2xl overflow-visible"
        >
          <defs>
            {/* Fur Gradients per Mood */}
            {/* Sultan / Ecstatic - Golden Champagne Luxury Fur */}
            <radialGradient id="catFurEcstatic" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </radialGradient>

            {/* Happy - Warm Butterscotch Tabby */}
            <radialGradient id="catFurHappy" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="85%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#9a3412" />
            </radialGradient>

            {/* Warning - Distressed Peach-Amber */}
            <radialGradient id="catFurWarning" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="50%" stopColor="#ea580c" />
              <stop offset="85%" stopColor="#c2410c" />
              <stop offset="100%" stopColor="#7c2d12" />
            </radialGradient>

            {/* Sad - Cool Melancholic Grayish Lavender Coat */}
            <radialGradient id="catFurSad" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="85%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#334155" />
            </radialGradient>

            {/* Crying - Flushed Distress Red/Rose Coat */}
            <radialGradient id="catFurCrying" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fecdd3" />
              <stop offset="45%" stopColor="#f43f5e" />
              <stop offset="85%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#881337" />
            </radialGradient>

            {/* Neutral - Cream Golden Tabby */}
            <radialGradient id="catFurNeutral" cx="45%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>

            {/* Inner Ear Pink */}
            <radialGradient id="earInnerPink" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fdf2f8" />
              <stop offset="60%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#db2777" />
            </radialGradient>

            {/* Cheek blush */}
            <radialGradient id="blushGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fb7185" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
            </radialGradient>

            {/* Collar Gradient */}
            <linearGradient id="collarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>

            {/* Bell / Coin Charm Gradient */}
            <radialGradient id="bellGold" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="40%" stopColor="#facc15" />
              <stop offset="85%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </radialGradient>

            {/* Crown Gold */}
            <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>

            {/* Tear Waterfall Gradient */}
            <linearGradient id="tearStreamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.92" />
              <stop offset="85%" stopColor="#0284c7" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* BACK SCENERY / AMBIENT ACCESSORIES */}
          {mood === "ecstatic" && (
            <g className="animate-spin-sunburst origin-center">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <line
                  key={angle}
                  x1="100"
                  y1="100"
                  x2={100 + 96 * Math.cos((angle * Math.PI) / 180)}
                  y2={100 + 96 * Math.sin((angle * Math.PI) / 180)}
                  stroke="#fbbf24"
                  strokeWidth="3"
                  strokeDasharray="4 6"
                  opacity="0.4"
                />
              ))}
            </g>
          )}

          {mood === "crying" && (
            <g className="animate-sparkle-pulse">
              {/* Rain cloud overhead */}
              <path
                d="M 50 30 Q 50 14 68 14 Q 78 4 95 10 Q 108 2 125 12 Q 142 8 148 24 Q 155 32 145 42 L 55 42 Q 45 42 50 30 Z"
                fill="#475569"
                opacity="0.95"
              />
              {/* Lightning */}
              <polygon
                points="100,34 92,48 104,48 96,64 114,42 102,42"
                fill="#facc15"
                className="animate-sparkle-pulse"
              />
              {/* Falling rain drops */}
              <line x1="65" y1="45" x2="60" y2="58" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" className="animate-rain-drop" />
              <line x1="80" y1="45" x2="75" y2="60" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" className="animate-rain-drop" />
              <line x1="125" y1="45" x2="120" y2="60" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" className="animate-rain-drop" />
              <line x1="140" y1="45" x2="135" y2="58" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" className="animate-rain-drop" />
            </g>
          )}

          {/* CAT SHADOW */}
          <ellipse cx="100" cy="184" rx="54" ry="10" fill="#000000" opacity="0.22" />

          {/* CAT FLUFFY TAIL (Behind body) */}
          {mood === "ecstatic" ? (
            <g>
              <path
                d="M 132 150 C 165 142 186 115 178 88 C 174 72 188 68 190 78 C 195 98 178 135 140 162 Z"
                fill="url(#catFurEcstatic)"
                stroke="#d97706"
                strokeWidth="2"
              />
              <polygon points="186,62 188,67 193,69 188,71 186,76 184,71 179,69 184,67" fill="#fef08a" />
            </g>
          ) : mood === "happy" ? (
            <path
              d="M 132 152 C 164 146 182 124 174 98 C 170 86 182 82 185 90 C 190 110 174 142 140 162 Z"
              fill="url(#catFurHappy)"
              stroke="#ea580c"
              strokeWidth="2"
            />
          ) : mood === "warning" ? (
            <path
              d="M 132 156 C 160 162 176 150 184 138 C 187 132 192 136 188 144 C 176 162 158 170 136 164 Z"
              fill="url(#catFurWarning)"
              stroke="#c2410c"
              strokeWidth="2"
            />
          ) : mood === "sad" ? (
            <path
              d="M 132 158 C 155 168 172 176 186 182 C 182 186 168 184 150 178 C 136 172 130 165 132 158 Z"
              fill="url(#catFurSad)"
              stroke="#475569"
              strokeWidth="2"
            />
          ) : mood === "crying" ? (
            <path
              d="M 132 155 L 148 142 L 144 148 L 162 136 L 158 144 L 178 130 L 172 142 L 186 138 C 188 148 170 166 136 164 Z"
              fill="url(#catFurCrying)"
              stroke="#9f1239"
              strokeWidth="2"
            />
          ) : (
            <path
              d="M 132 154 C 162 148 178 128 172 108 C 168 98 178 95 181 101 C 185 116 172 144 138 163 Z"
              fill="url(#catFurNeutral)"
              stroke="#d97706"
              strokeWidth="2"
            />
          )}

          {/* CAT BASE BODY, EARS, HEAD */}
          {(() => {
            const furGrad =
              mood === "ecstatic"
                ? "url(#catFurEcstatic)"
                : mood === "happy"
                ? "url(#catFurHappy)"
                : mood === "warning"
                ? "url(#catFurWarning)"
                : mood === "sad"
                ? "url(#catFurSad)"
                : mood === "crying"
                ? "url(#catFurCrying)"
                : "url(#catFurNeutral)";

            return (
              <g>
                {/* EARS */}
                {mood === "sad" ? (
                  // Droopy Sad Cat Ears
                  <g>
                    <path d="M 60 76 L 26 62 Q 36 48 72 58 Z" fill={furGrad} stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.6" />
                    <path d="M 58 72 L 34 62 Q 42 52 68 60 Z" fill="url(#earInnerPink)" />
                    <path d="M 140 76 L 174 62 Q 164 48 128 58 Z" fill={furGrad} stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.6" />
                    <path d="M 142 72 L 166 62 Q 158 52 132 60 Z" fill="url(#earInnerPink)" />
                  </g>
                ) : mood === "crying" ? (
                  // Flattened Fear/Distress Ears
                  <g>
                    <path d="M 58 80 L 22 72 Q 30 56 68 60 Z" fill={furGrad} stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.6" />
                    <path d="M 56 76 L 28 70 Q 34 60 64 62 Z" fill="url(#earInnerPink)" />
                    <path d="M 142 80 L 178 72 Q 170 56 132 60 Z" fill={furGrad} stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.6" />
                    <path d="M 144 76 L 172 70 Q 166 60 136 62 Z" fill="url(#earInnerPink)" />
                  </g>
                ) : mood === "warning" ? (
                  // Alert / Tilted Suspicious Ears
                  <g>
                    <path d="M 58 72 L 38 32 Q 54 26 80 52 Z" fill={furGrad} stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.6" />
                    <path d="M 58 66 L 46 38 Q 56 34 74 52 Z" fill="url(#earInnerPink)" />
                    <path d="M 140 74 L 168 46 Q 155 38 122 52 Z" fill={furGrad} stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.6" />
                    <path d="M 138 70 L 160 50 Q 152 44 126 54 Z" fill="url(#earInnerPink)" />
                  </g>
                ) : (
                  // Cute Perky Ears (Happy, Ecstatic, Neutral)
                  <g>
                    <path d="M 58 72 L 38 30 Q 54 26 80 52 Z" fill={furGrad} stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.6" />
                    <path d="M 58 66 L 46 38 Q 56 34 74 52 Z" fill="url(#earInnerPink)" />
                    <path d="M 54 56 L 62 50 L 56 46" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

                    <path d="M 142 72 L 162 30 Q 146 26 120 52 Z" fill={furGrad} stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.6" />
                    <path d="M 142 66 L 154 38 Q 144 34 126 52 Z" fill="url(#earInnerPink)" />
                    <path d="M 146 56 L 138 50 L 144 46" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                  </g>
                )}

                {/* CAT ROUND CHUBBY BODY */}
                <ellipse
                  cx="100"
                  cy="142"
                  rx="48"
                  ry="38"
                  fill={furGrad}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeOpacity="0.6"
                />

                {/* Soft Creamy Belly Patch */}
                <ellipse
                  cx="100"
                  cy="146"
                  rx="28"
                  ry="22"
                  fill="#ffffff"
                  opacity="0.9"
                />

                {/* BACK PAWS / FEET WITH PINK TOE BEANS */}
                <ellipse cx="74" cy="176" rx="14" ry="9" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                <ellipse cx="74" cy="177" rx="6" ry="4" fill="#fb7185" opacity="0.85" />
                <circle cx="68" cy="172" r="2.2" fill="#fb7185" opacity="0.85" />
                <circle cx="74" cy="170" r="2.2" fill="#fb7185" opacity="0.85" />
                <circle cx="80" cy="172" r="2.2" fill="#fb7185" opacity="0.85" />

                <ellipse cx="126" cy="176" rx="14" ry="9" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                <ellipse cx="126" cy="177" rx="6" ry="4" fill="#fb7185" opacity="0.85" />
                <circle cx="120" cy="172" r="2.2" fill="#fb7185" opacity="0.85" />
                <circle cx="126" cy="170" r="2.2" fill="#fb7185" opacity="0.85" />
                <circle cx="132" cy="172" r="2.2" fill="#fb7185" opacity="0.85" />

                {/* RED LUCKY COLLAR */}
                <path
                  d="M 66 125 Q 100 137 134 125 Q 132 133 100 143 Q 68 133 66 125 Z"
                  fill="url(#collarGrad)"
                  stroke="#7f1d1d"
                  strokeWidth="1"
                />

                {/* GOLDEN LUCKY BELL / COIN CHARM */}
                <g>
                  <circle cx="100" cy="142" r="9.5" fill="url(#bellGold)" stroke="#b45309" strokeWidth="1.5" />
                  <circle cx="100" cy="142" r="7" fill="none" stroke="#fef08a" strokeWidth="0.8" opacity="0.75" />
                  <text x="100" y="145.5" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#78350f">Rp</text>
                </g>

                {/* CHUBBY KAWAII CAT HEAD */}
                <ellipse
                  cx="100"
                  cy="92"
                  rx="48"
                  ry="42"
                  fill={furGrad}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeOpacity="0.6"
                />

                {/* Glossy Head Highlight */}
                <path
                  d="M 68 70 A 38 38 0 0 1 126 56"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  opacity="0.6"
                />

                {/* Forehead Tabby Stripes */}
                <path d="M 100 58 L 100 68" stroke="#78350f" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
                <path d="M 90 62 L 92 71" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
                <path d="M 110 62 L 108 71" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
              </g>
            );
          })()}

          {/* FRONT PAWS / ARMS */}
          {(() => {
            const furGrad =
              mood === "ecstatic"
                ? "url(#catFurEcstatic)"
                : mood === "happy"
                ? "url(#catFurHappy)"
                : mood === "warning"
                ? "url(#catFurWarning)"
                : mood === "sad"
                ? "url(#catFurSad)"
                : mood === "crying"
                ? "url(#catFurCrying)"
                : "url(#catFurNeutral)";

            if (mood === "ecstatic") {
              return (
                <g>
                  <path d="M 60 115 Q 36 90 42 66" fill="none" stroke={furGrad} strokeWidth="12" strokeLinecap="round" />
                  <circle cx="42" cy="64" r="9" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                  <circle cx="36" cy="52" r="11" fill="url(#bellGold)" stroke="#d97706" strokeWidth="1.5" />
                  <text x="36" y="56" textAnchor="middle" fontSize="9" fontWeight="900" fill="#78350f">Rp</text>

                  <path d="M 140 115 Q 164 90 158 66" fill="none" stroke={furGrad} strokeWidth="12" strokeLinecap="round" />
                  <circle cx="158" cy="64" r="9" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                  <circle cx="164" cy="52" r="11" fill="url(#bellGold)" stroke="#d97706" strokeWidth="1.5" />
                  <text x="164" y="56" textAnchor="middle" fontSize="9" fontWeight="900" fill="#78350f">Rp</text>
                </g>
              );
            }

            if (mood === "happy") {
              return (
                <g>
                  <circle cx="78" cy="132" r="9" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                  <circle cx="78" cy="132" r="4.5" fill="#fb7185" opacity="0.8" />

                  <path d="M 138 120 Q 166 104 168 82" fill="none" stroke={furGrad} strokeWidth="12" strokeLinecap="round" />
                  <circle cx="168" cy="78" r="10" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                  <circle cx="168" cy="79" r="5" fill="#fb7185" opacity="0.85" />
                  <circle cx="163" cy="72" r="2" fill="#fb7185" opacity="0.85" />
                  <circle cx="168" cy="71" r="2" fill="#fb7185" opacity="0.85" />
                  <circle cx="173" cy="72" r="2" fill="#fb7185" opacity="0.85" />
                  <polygon points="180,62 182,67 187,69 182,71 180,76 178,71 173,69 178,67" fill="#fef08a" />
                </g>
              );
            }

            if (mood === "warning") {
              return (
                <g>
                  <circle cx="78" cy="132" r="9" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                  <path d="M 138 120 Q 164 100 150 74" fill="none" stroke={furGrad} strokeWidth="11" strokeLinecap="round" />
                  <circle cx="148" cy="72" r="9" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                </g>
              );
            }

            if (mood === "sad") {
              return (
                <g>
                  <path d="M 64 125 Q 84 135 93 130" fill="none" stroke={furGrad} strokeWidth="10" strokeLinecap="round" />
                  <path d="M 136 125 Q 116 135 107 130" fill="none" stroke={furGrad} strokeWidth="10" strokeLinecap="round" />
                  <circle cx="95" cy="130" r="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                  <circle cx="105" cy="130" r="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                </g>
              );
            }

            if (mood === "crying") {
              // Both paws frame the cheeks just outside the tear streams
              return (
                <g>
                  <path d="M 60 128 Q 50 108 56 100" fill="none" stroke={furGrad} strokeWidth="11" strokeLinecap="round" />
                  <circle cx="56" cy="98" r="9" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                  <path d="M 140 128 Q 150 108 144 100" fill="none" stroke={furGrad} strokeWidth="11" strokeLinecap="round" />
                  <circle cx="144" cy="98" r="9" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                </g>
              );
            }

            return (
              <g>
                <circle cx="82" cy="132" r="8.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
                <circle cx="118" cy="132" r="8.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
              </g>
            );
          })()}

          {/* CAT WHISKERS & NOSE */}
          {mood === "sad" || mood === "crying" ? (
            <g>
              <path d="M 62 104 Q 42 110 24 118" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 60 109 Q 40 118 22 128" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 62 114 Q 44 126 26 136" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 138 104 Q 158 110 176 118" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 140 109 Q 160 118 178 128" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 138 114 Q 156 126 174 136" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <path d="M 64 96 Q 42 90 24 94" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 62 102 Q 40 102 22 106" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 64 108 Q 44 114 26 120" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 136 96 Q 158 90 176 94" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 138 102 Q 160 102 178 106" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 136 108 Q 156 114 174 120" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          )}

          {/* Cute Little Pink Nose */}
          <path
            d="M 96 101 Q 100 99 104 101 Q 103 106 100 108 Q 97 106 96 101 Z"
            fill="#f43f5e"
          />

          {/* EXPRESSIVE CAT FACES */}
          {mood === "ecstatic" ? (
            // SULTAN CAT: Golden Crown + Cool Cat Sunglasses + Big Meowing Grin
            <g>
              <g transform="translate(72, 14)">
                <polygon
                  points="0,22 0,6 14,17 28,0 42,17 56,6 56,22"
                  fill="url(#crownGrad)"
                  stroke="#ca8a04"
                  strokeWidth="2"
                />
                <circle cx="0" cy="6" r="3" fill="#ef4444" />
                <circle cx="28" cy="0" r="3.5" fill="#3b82f6" />
                <circle cx="56" cy="6" r="3" fill="#ef4444" />
                <rect x="0" y="21" width="56" height="5" rx="2" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
              </g>

              <g>
                <path
                  d="M 64 80 Q 78 80 89 84 L 89 95 Q 82 104 68 103 Q 58 101 61 88 Z"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                <path
                  d="M 136 80 Q 122 80 111 84 L 111 95 Q 118 104 132 103 Q 142 101 139 88 Z"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="1.5"
                />
                <rect x="87" y="83" width="26" height="3.5" rx="1.5" fill="#0f172a" />
                <line x1="66" y1="83" x2="76" y2="101" stroke="#ffffff" strokeWidth="2" opacity="0.85" />
                <line x1="116" y1="83" x2="126" y2="101" stroke="#ffffff" strokeWidth="2" opacity="0.85" />
              </g>

              <path
                d="M 82 110 Q 100 134 118 110 Z"
                fill="#881337"
                stroke="#4c0519"
                strokeWidth="1.5"
              />
              <ellipse cx="100" cy="123" rx="8" ry="5" fill="#fb7185" />
              <polygon points="87,110 90,110 88.5,114" fill="#ffffff" />
              <polygon points="110,110 113,110 111.5,114" fill="#ffffff" />

              <circle cx="58" cy="106" r="10" fill="url(#blushGlow)" />
              <circle cx="142" cy="106" r="10" fill="url(#blushGlow)" />
            </g>
          ) : mood === "happy" ? (
            // HAPPY CAT: Curved Eyes (^ ^) + Sweet Muzzle (ω) + Rosy Cheeks
            <g>
              <path
                d="M 72 88 Q 82 74 92 88"
                fill="none"
                stroke="#1e293b"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <path
                d="M 108 88 Q 118 74 128 88"
                fill="none"
                stroke="#1e293b"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <circle cx="60" cy="104" r="12" fill="url(#blushGlow)" />
              <circle cx="140" cy="104" r="12" fill="url(#blushGlow)" />
              <path
                d="M 86 110 Q 93 117 100 110 Q 107 117 114 110"
                fill="none"
                stroke="#1e293b"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          ) : mood === "warning" ? (
            // WARNING CAT: Nervous Eyes + Sweat Drop + Hesitant Wavy Mouth
            <g>
              <path d="M 68 76 Q 78 72 88 78" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 112 78 Q 122 72 132 76" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />

              <ellipse cx="80" cy="88" rx="8" ry="10" fill="#ffffff" stroke="#78350f" strokeWidth="2" />
              <circle cx="83" cy="89" r="4.5" fill="#1e293b" />
              <circle cx="85" cy="87" r="1.8" fill="#ffffff" />

              <ellipse cx="120" cy="88" rx="8" ry="10" fill="#ffffff" stroke="#78350f" strokeWidth="2" />
              <circle cx="123" cy="89" r="4.5" fill="#1e293b" />
              <circle cx="125" cy="87" r="1.8" fill="#ffffff" />

              <g className="animate-sweat-drop" transform="translate(138, 54)">
                <path
                  d="M 0 0 C -4 7 -8 13 -8 18 C -8 24 -2 28 5 28 C 12 28 18 24 18 18 C 18 13 14 7 0 0 Z"
                  fill="#38bdf8"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                />
                <ellipse cx="2" cy="20" rx="3" ry="5" fill="#ffffff" opacity="0.75" />
              </g>

              <path
                d="M 84 112 Q 92 107 100 112 Q 108 117 116 110"
                fill="none"
                stroke="#78350f"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          ) : mood === "sad" ? (
            // SAD CAT: Droopy Glossy Eyes + Downturned Quivering Mouth + Tear perfectly emerging from eye
            <g>
              <path d="M 66 78 Q 76 70 86 74" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 114 74 Q 124 70 134 78" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

              {/* Big glossy sad eyes centered at (78, 90) and (122, 90) */}
              <ellipse cx="78" cy="90" rx="10" ry="12" fill="#0f172a" />
              <circle cx="75" cy="86" r="4.5" fill="#ffffff" />
              <circle cx="80" cy="94" r="2.2" fill="#ffffff" />

              <ellipse cx="122" cy="90" rx="10" ry="12" fill="#0f172a" />
              <circle cx="119" cy="86" r="4.5" fill="#ffffff" />
              <circle cx="124" cy="94" r="2.2" fill="#ffffff" />

              {/* Trickling tear drop: emerging precisely from the bottom rim of the left eye (78, 101) */}
              <g transform="translate(74, 100)" className="animate-tear-drip">
                <path
                  d="M 4 0 C 1.5 4 0 7 0 10 C 0 13 2 15 4.5 15 C 7 15 9 13 9 10 C 9 7 7.5 4 4 0 Z"
                  fill="#60a5fa"
                  stroke="#2563eb"
                  strokeWidth="1"
                />
                <ellipse cx="3" cy="9" rx="1.5" ry="2" fill="#ffffff" opacity="0.85" />
              </g>

              {/* Downturned sad cat mouth */}
              <path
                d="M 88 116 Q 100 106 112 116"
                fill="none"
                stroke="#1e293b"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </g>
          ) : mood === "crying" ? (
            // CRYING CAT: Tears positioned EXACTLY at the eyes (Y=89, X=76 & X=124)
            <g>
              {/* Worried furrowed eyebrows */}
              <path d="M 64 78 L 78 84 L 88 80" fill="none" stroke="#4c0519" strokeWidth="3" strokeLinecap="round" />
              <path d="M 112 80 L 122 84 L 136 78" fill="none" stroke="#4c0519" strokeWidth="3" strokeLinecap="round" />

              {/* 1. Squeezed Crying Eyelid lines (Left eye centered at 76, Right eye centered at 124) */}
              <path d="M 66 89 L 86 89" stroke="#4c0519" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 114 89 L 134 89" stroke="#4c0519" strokeWidth="4.5" strokeLinecap="round" />

              {/* 2. Shiny Tear Pools welled up directly on the eyes */}
              <ellipse cx="76" cy="89" rx="8" ry="3.5" fill="#67e8f9" opacity="0.95" />
              <ellipse cx="76" cy="88" rx="5" ry="1.8" fill="#ffffff" opacity="0.95" />
              <ellipse cx="124" cy="89" rx="8" ry="3.5" fill="#67e8f9" opacity="0.95" />
              <ellipse cx="124" cy="88" rx="5" ry="1.8" fill="#ffffff" opacity="0.95" />

              {/* 3. WATERFALL TEAR STREAMS - Connected seamlessly right to the eyes at Y=89 */}
              {/* Left Waterfall Stream (Emerges from X=70..82 at Y=89, pours down cheek) */}
              <g className="animate-tear-drop origin-top">
                <path
                  d="M 70 89 C 67 104 65 125 68 142 C 71 152 81 152 79 142 C 76 125 79 104 82 89 Z"
                  fill="url(#tearStreamGrad)"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                />
                {/* Shiny highlight stream */}
                <path
                  d="M 73 90 C 70 105 68 122 72 138"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </g>

              {/* Right Waterfall Stream (Emerges from X=118..130 at Y=89, pours down cheek) */}
              <g className="animate-tear-drop origin-top">
                <path
                  d="M 118 89 C 121 104 124 125 121 142 C 119 152 129 152 132 142 C 135 125 133 104 130 89 Z"
                  fill="url(#tearStreamGrad)"
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                />
                {/* Shiny highlight stream */}
                <path
                  d="M 127 90 C 130 105 132 122 128 138"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </g>

              {/* 4. Splashing and Dripping Drops under the waterfall stream */}
              <g className="animate-tear-drip">
                <circle cx="75" cy="148" r="3.5" fill="#38bdf8" />
                <circle cx="125" cy="148" r="3.5" fill="#38bdf8" />
              </g>

              {/* Splash droplets around bottom */}
              <circle cx="68" cy="144" r="2.5" fill="#0284c7" />
              <circle cx="82" cy="145" r="2" fill="#38bdf8" />
              <circle cx="118" cy="145" r="2" fill="#38bdf8" />
              <circle cx="132" cy="144" r="2.5" fill="#0284c7" />

              {/* 5. Wide Open Screaming Cat Mouth with Fangs & Tongue */}
              <path
                d="M 84 110 Q 100 106 116 110 Q 120 130 100 132 Q 80 130 84 110 Z"
                fill="#4c0519"
                stroke="#1e293b"
                strokeWidth="2"
              />
              <ellipse cx="100" cy="126" rx="8" ry="4.5" fill="#f43f5e" />
              {/* Cute cat fangs */}
              <polygon points="88,110 92,110 90,115" fill="#ffffff" />
              <polygon points="108,110 112,110 110,115" fill="#ffffff" />
            </g>
          ) : (
            // NEUTRAL CAT: Big curious eyes + Gentle muzzle smile (ω)
            <g>
              <circle cx="80" cy="88" r="8" fill="#1e293b" />
              <circle cx="82" cy="86" r="3" fill="#ffffff" />
              <circle cx="120" cy="88" r="8" fill="#1e293b" />
              <circle cx="122" cy="86" r="3" fill="#ffffff" />

              <path
                d="M 88 110 Q 94 116 100 110 Q 106 116 112 110"
                fill="none"
                stroke="#1e293b"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              <g transform="translate(136, 38)" className="animate-sparkle-pulse">
                <circle cx="11" cy="11" r="11" fill="#fef08a" stroke="#eab308" strokeWidth="1.8" />
                <text x="11" y="15" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#854d0e">?</text>
              </g>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
