import React, { useState } from "react";

export type BudgetMood =
  | "ecstatic"
  | "happy"
  | "warning"
  | "sad"
  | "crying"
  | "neutral"
  | "bangga"
  | "senang"
  | "waspada"
  | "sedih"
  | "murung"
  | "normal"
  | "pingsan";

export type MascotMoodKey = "bangga" | "senang" | "waspada" | "sedih" | "pingsan";

export const NORMALIZE_MOOD: Record<BudgetMood, MascotMoodKey> = {
  ecstatic: "bangga",
  bangga: "bangga",

  happy: "senang",
  senang: "senang",

  warning: "waspada",
  waspada: "waspada",
  normal: "waspada",
  neutral: "waspada",

  sad: "sedih",
  sedih: "sedih",
  murung: "sedih",

  crying: "pingsan",
  pingsan: "pingsan",
};

interface BudgetMascotProps {
  mood: BudgetMood;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const QUOTES: Record<MascotMoodKey, string[]> = {
  bangga: [
    "Miaww! Saldomu melimpah ruah! Kamu sultan paling keren bulan ini! 👑✨",
    "Purrr... Keuangan sultan! Dompet tebal, hati tenang, hidup santai! 🌟🐾",
    "Ngeongg! Pengeluaran super terkendali, majikan sultan panutan! 💰🍣",
    "Sultan mah bebas miaw, tapi tetap sisihkan buat cemilan Si Oyen ya! 👑🐱",
  ],
  senang: [
    "Miaw~ Keuangan aman sentosa! Nikmati harimu santai sambil senyum riang! 😊🐾",
    "Kondisi sehat walafiat! Belanja harian masih leluasa banget miaw! 🌟🐱",
    "Purrr... Anggaranmu aman terkendali! Semangat terus meow! 👍✨",
    "Senang banget lihat dompetmu sehat meong! Pertahankan ya! 🐾😸",
  ],
  waspada: [
    "Meong... Tetap waspada & cermat ya! Jaga ritme belanja harianmu. 🐱🐾",
    "Waspada miaw! Anggaran mulai diperhatikan, tahan dulu checkout impulsif! ⚠️🐱",
    "Purr.. posisi siaga waspada! Pengeluaran masih aman kalau dijaga miaw! ⚖️🐾",
    "Si Oyen memantau waspada dari dekat miaw... Belanja yang perlu-perlu dulu aja ya! 👀🐱",
  ],
  sedih: [
    "Meoong... (sedih sendu). Sisa uang tinggal sedikit, harus super irit! 🥺🌧️",
    "Dompet mendung meow... Tahan dulu jajan boba & nongkrong kekinian! 🌧️😿",
    "Sedih banget meow... Prioritaskan makan & kebutuhan pokok dulu ya! 💧🐾",
    "Si Oyen sedih lihat anggaran menipis... Yuk tahan belanja impulsif! 🥺💧",
  ],
  pingsan: [
    "KO NGEONGGG! Saldo habis total / overbudget! Meong tepar pingsan di lantai! 😵💥",
    "Darurat meoow! Saldo sekarat sampai pingsan, saatnya mode bertahan hidup! 🚨😿",
    "STOP BELANJA MEOW! Sudah terkapar pingsan nih, jangan dipaksa jajan lagi! 😵📦",
    "Pingsan liat mutasi rekening! Segera evaluasi pengeluaran majikan! 🚨🐾",
  ],
};

const MOOD_META: Record<
  MascotMoodKey,
  {
    title: string;
    badge: string;
    badgeColor: string;
    containerAnimation: string;
  }
> = {
  bangga: {
    title: "Si Oyen Sultan",
    badge: "Sultan 👑",
    badgeColor: "bg-amber-400/25 text-amber-200 border-amber-400/40",
    containerAnimation: "animate-mascot-bounce",
  },
  senang: {
    title: "Si Oyen Senang & Bahagia",
    badge: "Senang 😊",
    badgeColor: "bg-emerald-500/25 text-emerald-200 border-emerald-400/40",
    containerAnimation: "animate-mascot-bounce",
  },
  waspada: {
    title: "Si Oyen Waspada",
    badge: "Waspada 🐱",
    badgeColor: "bg-blue-500/25 text-blue-200 border-blue-400/40",
    containerAnimation: "animate-mascot-float",
  },
  sedih: {
    title: "Si Oyen Sedih",
    badge: "Sedih 🥺",
    badgeColor: "bg-rose-500/25 text-rose-200 border-rose-400/40",
    containerAnimation: "animate-mascot-float",
  },
  pingsan: {
    title: "Si Oyen Nangis Pingsan!",
    badge: "Nangis • Pingsan 😵",
    badgeColor: "bg-red-500/35 text-red-200 border-red-400/50 animate-pulse",
    containerAnimation: "animate-mascot-sob",
  },
};

export const BudgetMascot: React.FC<BudgetMascotProps> = ({
  mood,
  className = "",
  size = "md",
}) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isClicked, setIsClicked] = useState(false);

  const moodKey = NORMALIZE_MOOD[mood] || "waspada";
  const quotes = QUOTES[moodKey] || QUOTES.waspada;
  const currentQuote = quotes[quoteIndex % quotes.length];
  const meta = MOOD_META[moodKey] || MOOD_META.waspada;

  const playCuteMeow = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.22);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Audio playback silently ignored if browser denies without gesture
    }
  };

  const playSultanSound = () => {
    try {
      const audio = new Audio("/sounds/anime-wow-sound-effect.mp3");
      audio.volume = 0.9;
      audio.play().catch(() => {
        // Fallback to online CDN audio if local file is unavailable
        const remoteAudio = new Audio("https://www.myinstants.com/media/sounds/anime-wow-sound-effect.mp3");
        remoteAudio.volume = 0.9;
        remoteAudio.play().catch(() => {});
      });
    } catch {
      // Audio playback fallback
    }
  };

  const playPingsanSound = () => {
    try {
      const audio = new Audio("/sounds/faaaa.mp3");
      audio.volume = 0.9;
      audio.play().catch(() => {
        // Fallback to online CDN audio if local file is unavailable
        const remoteAudio = new Audio("https://www.myinstants.com/media/sounds/faaaa.mp3");
        remoteAudio.volume = 0.9;
        remoteAudio.play().catch(() => {});
      });
    } catch {
      // Audio playback fallback
    }
  };

  const handleMascotClick = () => {
    setIsClicked(true);
    if (moodKey === "bangga") {
      playSultanSound();
    } else if (moodKey === "pingsan") {
      playPingsanSound();
    } else {
      playCuteMeow();
    }
    setQuoteIndex((prev) => prev + 1);

    setTimeout(() => setIsClicked(false), 500);
  };

  const mascotSizes = {
    sm: "w-28 h-28 sm:w-32 sm:h-32",
    md: "w-36 h-36 sm:w-44 sm:h-44",
    lg: "w-48 h-48 sm:w-56 sm:h-56",
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble */}
      <div
        onClick={handleMascotClick}
        title="Klik Si Oyen untuk dengar nasehat keuangan lainnya!"
        className="relative mb-3 max-w-[270px] sm:max-w-xs cursor-pointer group transition-transform hover:scale-105 active:scale-95"
      >
        <div className="bg-white/95 backdrop-blur-md text-slate-800 rounded-2xl px-3.5 py-2.5 shadow-xl border border-white/40 text-xs sm:text-sm">
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-amber-700 flex items-center gap-1">
              <span>🐱 Si Oyen</span>
              <span className="text-[10px] text-slate-400 font-normal">• tap me!</span>
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${meta.badgeColor}`}
            >
              {meta.badge}
            </span>
          </div>
          <p className="text-slate-700 leading-snug font-medium italic">
            "{currentQuote}"
          </p>
        </div>
        {/* Speech Bubble Tail */}
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white/95 mx-auto -mt-[1px]"></div>
      </div>

      {/* Mascot Animated Character Illustration Container */}
      <div
        onClick={handleMascotClick}
        className={`relative cursor-pointer transition-transform duration-200 flex items-center justify-center ${
          mascotSizes[size]
        } ${isClicked ? "scale-110 -rotate-2" : meta.containerAnimation}`}
        title="Klik Si Oyen untuk ajak berinteraksi!"
      >
        {/* FULLY ANIMATED & EXPRESSIVE VECTOR SVG MASCOT */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full filter drop-shadow-2xl overflow-visible"
        >
          <defs>
            {/* Fur & Body Gradients */}
            <linearGradient id="catFurGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFA044" />
              <stop offset="60%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            <linearGradient id="catBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FFEDD5" />
            </linearGradient>

            <linearGradient id="catEarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDA4AF" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>

            <linearGradient id="goldCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="45%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>

            <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="40%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id="tearFallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>

          {/* 1. TAIL (Behind the body) */}
          {moodKey === "bangga" && (
            <g className="animate-cat-tail-proud">
              <path
                d="M 132 148 C 160 148 182 126 176 98 C 172 82 154 90 158 104 C 162 116 148 132 130 142 Z"
                fill="url(#catFurGrad)"
                stroke="#C2410C"
                strokeWidth="1.2"
              />
              <path d="M 166 112 C 162 108 158 112 162 118" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {moodKey === "senang" && (
            <g className="animate-cat-tail-happy">
              <path
                d="M 132 148 C 160 148 182 126 176 98 C 172 82 154 90 158 104 C 162 116 148 132 130 142 Z"
                fill="url(#catFurGrad)"
                stroke="#C2410C"
                strokeWidth="1.2"
              />
              <path d="M 166 112 C 162 108 158 112 162 118" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {moodKey === "waspada" && (
            <g className="animate-cat-tail-wag">
              <path
                d="M 132 148 C 160 148 182 126 176 98 C 172 82 154 90 158 104 C 162 116 148 132 130 142 Z"
                fill="url(#catFurGrad)"
                stroke="#C2410C"
                strokeWidth="1.2"
              />
              <path d="M 166 112 C 162 108 158 112 162 118" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {moodKey === "sedih" && (
            <g className="animate-cat-tail-sad">
              <path
                d="M 132 156 C 158 158 178 152 182 144 C 185 138 174 135 168 140 C 158 147 146 150 130 152 Z"
                fill="url(#catFurGrad)"
                stroke="#C2410C"
                strokeWidth="1.2"
              />
            </g>
          )}

          {moodKey === "pingsan" && (
            <g>
              <path
                d="M 132 162 C 160 168 182 165 186 160 C 188 154 178 152 172 156 C 158 160 146 160 130 160 Z"
                fill="url(#catFurGrad)"
                stroke="#C2410C"
                strokeWidth="1.2"
              />
            </g>
          )}

          {/* 2. CHUBBY CAT BODY WITH ORGANIC BREATHING */}
          <g className="animate-cat-breathe">
            {/* Back Sitting Paws */}
            <ellipse cx="64" cy="166" rx="14" ry="9" fill="url(#catFurGrad)" stroke="#C2410C" strokeWidth="1" />
            <ellipse cx="136" cy="166" rx="14" ry="9" fill="url(#catFurGrad)" stroke="#C2410C" strokeWidth="1" />
            <ellipse cx="62" cy="167" rx="10" ry="6" fill="#FFFFFF" opacity="0.9" />
            <ellipse cx="138" cy="167" rx="10" ry="6" fill="#FFFFFF" opacity="0.9" />

            {/* Main Chubby Torso */}
            <path
              d="M 68 112 C 64 92 136 92 132 112 C 136 150 144 168 124 172 C 110 174 90 174 76 172 C 56 168 64 150 68 112 Z"
              fill="url(#catFurGrad)"
              stroke="#C2410C"
              strokeWidth="1.5"
            />

            {/* Creamy Belly Patch */}
            <path
              d="M 78 120 C 76 106 124 106 122 120 C 124 156 76 156 78 120 Z"
              fill="url(#catBellyGrad)"
            />

            {/* Tabby Side Body Stripes */}
            <path d="M 66 130 Q 74 133 80 131" stroke="#9A3412" strokeWidth="3" strokeLinecap="round" />
            <path d="M 67 142 Q 74 145 80 143" stroke="#9A3412" strokeWidth="3" strokeLinecap="round" />
            <path d="M 134 130 Q 126 133 120 131" stroke="#9A3412" strokeWidth="3" strokeLinecap="round" />
            <path d="M 133 142 Q 126 145 120 143" stroke="#9A3412" strokeWidth="3" strokeLinecap="round" />

            {/* Front Paws Depending on Mood */}
            {moodKey === "senang" ? (
              // Excited waving paws up
              <g className="animate-cat-paw-wave">
                <ellipse cx="66" cy="120" rx="9" ry="9" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1.5" />
                <ellipse cx="134" cy="120" rx="9" ry="9" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1.5" />
                {/* Cute paw pads */}
                <circle cx="66" cy="120" r="3.5" fill="#FDA4AF" />
                <circle cx="134" cy="120" r="3.5" fill="#FDA4AF" />
              </g>
            ) : moodKey === "pingsan" ? (
              // Limp flopped paws on ground
              <g>
                <ellipse cx="60" cy="170" rx="10" ry="6" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1" transform="rotate(-15 60 170)" />
                <ellipse cx="140" cy="170" rx="10" ry="6" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1" transform="rotate(15 140 170)" />
              </g>
            ) : (
              // Sultan (Bangga), Waspada & Sedih: Neatly tucked cute stationary paws
              <g>
                {/* For Sultan: A shiny gold coin resting peacefully next to the paws */}
                {moodKey === "bangga" && (
                  <g transform="translate(140, 164)">
                    <circle cx="0" cy="0" r="11" fill="url(#coinGrad)" stroke="#B45309" strokeWidth="1.4" />
                    <circle cx="0" cy="0" r="8.5" fill="none" stroke="#FDE68A" strokeWidth="1" strokeDasharray="2.5,1.5" />
                    <text x="0" y="3.5" textAnchor="middle" fontSize="8" fontWeight="extrabold" fill="#78350F">Rp</text>
                  </g>
                )}
                <ellipse cx="85" cy="166" rx="9" ry="7" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1" />
                <ellipse cx="115" cy="166" rx="9" ry="7" fill="#FFFFFF" stroke="#FED7AA" strokeWidth="1" />
                <path d="M 83 166 L 83 169 M 87 166 L 87 169" stroke="#E2E8F0" strokeWidth="1.2" />
                <path d="M 113 166 L 113 169 M 117 166 L 117 169" stroke="#E2E8F0" strokeWidth="1.2" />
              </g>
            )}
          </g>

          {/* 3. BIG CUTE KAWAII CAT HEAD */}
          <g>
            {/* EARS WITH ANIMATED TWITCH */}
            {moodKey === "sedih" ? (
              // Sad droopy folded ears
              <g>
                {/* Left droopy ear */}
                <path
                  d="M 58 68 C 42 66 36 78 40 88 C 46 92 64 84 66 74 Z"
                  fill="url(#catFurGrad)"
                  stroke="#C2410C"
                  strokeWidth="1.2"
                />
                <path d="M 54 72 C 44 72 42 78 44 84 C 48 86 58 80 58 74 Z" fill="url(#catEarGrad)" />

                {/* Right droopy ear */}
                <path
                  d="M 142 68 C 158 66 164 78 160 88 C 154 92 136 84 134 74 Z"
                  fill="url(#catFurGrad)"
                  stroke="#C2410C"
                  strokeWidth="1.2"
                />
                <path d="M 146 72 C 156 72 158 78 156 84 C 152 86 142 80 142 74 Z" fill="url(#catEarGrad)" />
              </g>
            ) : (
              // Waspada, Senang, Bangga, Pingsan: Upright Cute Ears with Periodic Twitch
              <g>
                {/* Left Ear */}
                <g className="animate-cat-ear-left">
                  <path
                    d="M 56 68 Q 44 26 70 36 Q 80 50 76 66 Z"
                    fill="url(#catFurGrad)"
                    stroke="#C2410C"
                    strokeWidth="1.2"
                  />
                  <path d="M 58 63 Q 50 36 68 42 Q 74 52 72 63 Z" fill="url(#catEarGrad)" />
                </g>

                {/* Right Ear */}
                <g className="animate-cat-ear-right">
                  <path
                    d="M 144 68 Q 156 26 130 36 Q 120 50 124 66 Z"
                    fill="url(#catFurGrad)"
                    stroke="#C2410C"
                    strokeWidth="1.2"
                  />
                  <path d="M 142 63 Q 150 36 132 42 Q 126 52 128 63 Z" fill="url(#catEarGrad)" />
                </g>
              </g>
            )}

            {/* Chubby Round Head Base */}
            <path
              d="M 54 86 C 48 64 62 48 100 48 C 138 48 152 64 146 86 C 154 96 150 114 138 120 C 122 126 78 126 62 120 C 50 114 46 96 54 86 Z"
              fill="url(#catFurGrad)"
              stroke="#C2410C"
              strokeWidth="1.5"
            />

            {/* Forehead Tabby Stripes */}
            <path d="M 100 50 L 100 64" stroke="#9A3412" strokeWidth="3" strokeLinecap="round" />
            <path d="M 90 53 Q 92 61 95 66" stroke="#9A3412" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M 110 53 Q 108 61 105 66" stroke="#9A3412" strokeWidth="2.8" strokeLinecap="round" />

            {/* Creamy White Muzzle Area */}
            <path
              d="M 72 92 C 72 78 128 78 128 92 C 128 114 72 114 72 92 Z"
              fill="url(#catBellyGrad)"
            />

            {/* Cute Whiskers */}
            <g stroke="#7C2D12" strokeWidth="1.8" strokeLinecap="round" opacity="0.85">
              <path d="M 54 94 L 28 90" />
              <path d="M 54 100 L 26 104" />
              <path d="M 146 94 L 172 90" />
              <path d="M 146 100 L 174 104" />
            </g>

            {/* Tiny Soft Pink Nose */}
            <path
              d="M 97 88 Q 100 86 103 88 Q 100 93 97 88 Z"
              fill="#F43F5E"
            />
            <circle cx="98.5" cy="88" r="0.8" fill="#FFFFFF" />

            {/* Rosy Blushing Cheeks */}
            <ellipse
              cx="68"
              cy="98"
              rx="8"
              ry="5"
              fill="#FB7185"
              opacity={moodKey === "senang" ? 0.85 : 0.6}
            />
            <ellipse
              cx="132"
              cy="98"
              rx="8"
              ry="5"
              fill="#FB7185"
              opacity={moodKey === "senang" ? 0.85 : 0.6}
            />

            {/* ========================================================
                4. MOOD SPECIFIC FACIAL EXPRESSIONS & ANIMATED DETAILS
                ======================================================== */}

            {/* MOOD: BANGGA (Sultan 👑) */}
            {moodKey === "bangga" && (
              <g>
                {/* Floating Gold Crown with Jewels & Shimmer */}
                <g className="animate-cat-crown">
                  {/* Floating Golden Halo Sparkle behind crown */}
                  <circle cx="100" cy="30" r="16" fill="#FEF08A" opacity="0.3" filter="blur(4px)" />
                  <path
                    d="M 82 40 L 85 20 L 93 30 L 100 14 L 107 30 L 115 20 L 118 40 Z"
                    fill="url(#goldCrownGrad)"
                    stroke="#B45309"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  {/* Crown Jewels */}
                  <circle cx="100" cy="16" r="3.2" fill="#EF4444" stroke="#7F1D1D" strokeWidth="0.8" />
                  <circle cx="85" cy="22" r="2.5" fill="#10B981" stroke="#064E3B" strokeWidth="0.8" />
                  <circle cx="115" cy="22" r="2.5" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="0.8" />
                  {/* Crown base velvet line */}
                  <rect x="83" y="37" width="34" height="3" rx="1.5" fill="#991B1B" />
                </g>

                {/* Arched Confident Eyebrows */}
                <path d="M 68 72 Q 78 68 86 72" fill="none" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 114 72 Q 122 68 132 72" fill="none" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" />

                {/* Smug anime half-lids */}
                {/* Left Eye */}
                <path d="M 68 83 Q 78 77 88 82" fill="none" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" />
                <ellipse cx="78" cy="87" rx="8" ry="6" fill="#291407" />
                <circle cx="76" cy="85" r="2.5" fill="#FFFFFF" />
                {/* Right Eye (with gleaming Star Sparkle!) */}
                <path d="M 112 82 Q 122 76 132 81" fill="none" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" />
                <ellipse cx="122" cy="86" rx="8" ry="6" fill="#291407" />
                <circle cx="120" cy="84" r="2.5" fill="#FFFFFF" />
                <polygon
                  points="132,77 134,81 138,83 134,85 132,89 130,85 126,83 130,81"
                  fill="#FACC15"
                  className="animate-sparkle-pulse"
                />

                {/* Smug Smirk with cute tiny fang (:3) */}
                <path
                  d="M 92 94 Q 97 97 101 94 Q 107 100 114 92"
                  fill="none"
                  stroke="#5C2607"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
                <polygon points="107,95 111,94 109,99" fill="#FFFFFF" />

                {/* Floating Star Twinkles */}
                <polygon points="45,45 47,49 51,51 47,53 45,57 43,53 39,51 43,49" fill="#FACC15" className="animate-sparkle-pulse" />
                <polygon points="160,50 162,54 166,56 162,58 160,62 158,58 154,56 158,54" fill="#FACC15" className="animate-sparkle-pulse" />
              </g>
            )}

            {/* MOOD: SENANG (Happy 😊) */}
            {moodKey === "senang" && (
              <g>
                {/* Cheerful Bouncing Crescent Eyes (^ ^) */}
                <path
                  d="M 68 86 Q 78 72 88 86"
                  fill="none"
                  stroke="#451A03"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 112 86 Q 122 72 132 86"
                  fill="none"
                  stroke="#451A03"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />

                {/* Eyebrows */}
                <path d="M 68 70 Q 78 65 86 70" fill="none" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 114 70 Q 122 65 132 70" fill="none" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" />

                {/* Big Beaming Smiling Open Mouth with Tongue */}
                <path
                  d="M 88 94 Q 100 116 112 94 Z"
                  fill="#9F1239"
                  stroke="#451A03"
                  strokeWidth="2.2"
                />
                <ellipse cx="100" cy="103" rx="7" ry="5" fill="#FB7185" />

                {/* Cheerful Fluttering Music Notes / Hearts */}
                <g className="animate-cat-float-heart" transform="translate(142, 38)">
                  <path
                    d="M 0 4 C -3 0 -8 0 -8 5 C -8 9 0 14 0 14 C 0 14 8 9 8 5 C 8 0 3 0 0 4 Z"
                    fill="#F43F5E"
                  />
                </g>
                <g className="animate-sparkle-pulse" transform="translate(48, 42)">
                  <text fontSize="14" fill="#F59E0B">✨</text>
                </g>
              </g>
            )}

            {/* MOOD: WASPADA (Siaga • Waspada 🐱) */}
            {moodKey === "waspada" && (
              <g>
                {/* Alert natural arched eyebrows */}
                <path d="M 70 70 Q 78 66 86 70" fill="none" stroke="#7C2D12" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M 114 70 Q 122 66 130 70" fill="none" stroke="#7C2D12" strokeWidth="2.2" strokeLinecap="round" />

                {/* Big chocolate anime eyes with natural 4s blinking */}
                <g className="animate-cat-blink">
                  {/* Left Eye */}
                  <ellipse cx="78" cy="85" rx="10" ry="12" fill="#291407" />
                  <circle cx="75" cy="81" r="4.5" fill="#FFFFFF" />
                  <circle cx="81" cy="88" r="2.2" fill="#FFFFFF" />
                  <circle cx="77" cy="90" r="1.2" fill="#FED7AA" />

                  {/* Right Eye */}
                  <ellipse cx="122" cy="85" rx="10" ry="12" fill="#291407" />
                  <circle cx="119" cy="81" r="4.5" fill="#FFFFFF" />
                  <circle cx="125" cy="88" r="2.2" fill="#FFFFFF" />
                  <circle cx="121" cy="90" r="1.2" fill="#FED7AA" />
                </g>

                {/* Classic Cute Cat Muzzle (ω shape) */}
                <path
                  d="M 91 94 Q 96 98 100 94 Q 104 98 109 94"
                  fill="none"
                  stroke="#451A03"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />

                {/* Gentle float sparkles */}
                <circle cx="46" cy="60" r="2" fill="#60A5FA" className="animate-sparkle-pulse" opacity="0.6" />
                <circle cx="156" cy="62" r="2" fill="#60A5FA" className="animate-sparkle-pulse" opacity="0.6" />
              </g>
            )}

            {/* MOOD: SEDIH (Sedih • Irit 🥺) */}
            {moodKey === "sedih" && (
              <g>
                {/* Sad Worried Furrowed Eyebrows */}
                <path d="M 68 70 Q 76 75 86 72" fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M 114 72 Q 124 75 132 70" fill="none" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />

                {/* Big glossy puppy-eyes brimming with watery reflections */}
                <ellipse cx="78" cy="87" rx="9" ry="11" fill="#0F172A" />
                <circle cx="75" cy="84" r="4.5" fill="#FFFFFF" />
                <circle cx="81" cy="92" r="2.6" fill="#FFFFFF" opacity="0.85" />

                <ellipse cx="122" cy="87" rx="9" ry="11" fill="#0F172A" />
                <circle cx="119" cy="84" r="4.5" fill="#FFFFFF" />
                <circle cx="125" cy="92" r="2.6" fill="#FFFFFF" opacity="0.85" />

                {/* Animated Tear Droplet trickling down from eye */}
                <g className="animate-cat-tear-fall" transform="translate(125, 94)">
                  <path
                    d="M 0 0 C -2 3 -4 6 -4 9 C -4 12 -1 14 2 14 C 5 14 8 12 8 9 C 8 6 6 3 0 0 Z"
                    fill="url(#tearFallGrad)"
                    stroke="#0284C7"
                    strokeWidth="0.8"
                  />
                  <ellipse cx="1" cy="9" rx="1.5" ry="2.5" fill="#FFFFFF" opacity="0.85" />
                </g>

                {/* Trembling downturned sad mouth */}
                <path
                  d="M 90 99 Q 100 93 110 99"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  className="animate-cat-mouth-quiver"
                />

                {/* Cartoon Gloomy Cloud Floating Overhead with Raindrops */}
                <g transform="translate(74, 8)" className="animate-cloud-drift">
                  <path
                    d="M 12 24 C 6 24 2 20 2 14 C 2 9 6 6 11 6 C 13 2 18 0 24 0 C 31 0 37 4 38 10 C 42 10 46 14 46 18 C 46 22 43 24 38 24 Z"
                    fill="#64748B"
                    opacity="0.8"
                  />
                  {/* Dripping raindrops */}
                  <circle cx="14" cy="30" r="1.5" fill="#38BDF8" className="animate-rain-drop" />
                  <circle cx="26" cy="32" r="1.5" fill="#38BDF8" className="animate-rain-drop" />
                  <circle cx="38" cy="29" r="1.5" fill="#38BDF8" className="animate-rain-drop" />
                </g>
              </g>
            )}

            {/* MOOD: PINGSAN (Nangis Pingsan / Tepar / Overbudget 😵) */}
            {moodKey === "pingsan" && (
              <g className="animate-cat-shiver">
                {/* 3 Orbiting Dizzy Cartoon Stars in 3D Ellipse Overhead */}
                <g className="animate-cat-orbit-1">
                  <polygon
                    points="100,32 102,38 108,38 103,42 105,48 100,44 95,48 97,42 92,38 98,38"
                    fill="#FACC15"
                    stroke="#B45309"
                    strokeWidth="0.8"
                  />
                </g>
                <g className="animate-cat-orbit-2">
                  <polygon
                    points="100,32 102,38 108,38 103,42 105,48 100,44 95,48 97,42 92,38 98,38"
                    fill="#FACC15"
                    stroke="#B45309"
                    strokeWidth="0.8"
                  />
                </g>
                <g className="animate-cat-orbit-3">
                  <polygon
                    points="100,32 102,38 108,38 103,42 105,48 100,44 95,48 97,42 92,38 98,38"
                    fill="#FACC15"
                    stroke="#B45309"
                    strokeWidth="0.8"
                  />
                </g>

                {/* Dizzy Hypnotic Spinning Spiral Eyes */}
                {/* Left Spiral Eye */}
                <g className="animate-cat-dizzy-spin" style={{ transformOrigin: "78px 85px" }}>
                  <path
                    d="M 78 85 m -10 0 a 10 10 0 1 0 20 0 a 7 7 0 1 0 -14 0 a 4 4 0 1 0 8 0"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </g>

                {/* Right Spiral Eye */}
                <g className="animate-cat-dizzy-spin" style={{ transformOrigin: "122px 85px" }}>
                  <path
                    d="M 122 85 m -10 0 a 10 10 0 1 0 20 0 a 7 7 0 1 0 -14 0 a 4 4 0 1 0 8 0"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </g>

                {/* Dazed mouth with tongue lolling out */}
                <ellipse cx="100" cy="100" rx="9" ry="7" fill="#4C0519" stroke="#1E293B" strokeWidth="1.5" />
                <path
                  d="M 98 101 Q 106 101 108 109 Q 103 114 96 106 Z"
                  fill="#FB7185"
                />

                {/* Giant comic blue sweat bead */}
                <path
                  d="M 136 74 C 132 78 129 82 129 85 C 129 88 131 90 134 90 C 137 90 139 88 139 85 C 139 82 138 78 136 74 Z"
                  fill="#38BDF8"
                  stroke="#0284C7"
                  strokeWidth="0.8"
                />
              </g>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};
