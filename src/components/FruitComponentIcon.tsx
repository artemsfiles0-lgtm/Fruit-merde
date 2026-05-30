import { Fruit, getFruitComponents, FRUITS, getFruitColor } from '../types';

interface FruitComponentIconProps {
  fruit: Fruit;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function FruitComponentIcon({ fruit, size = 'md' }: FruitComponentIconProps) {
  const comps = getFruitComponents(fruit);
  const totalComps = comps.length;
  
  // Resolve unique emojis up to a maximum
  const emojis = comps.map(lvl => FRUITS[lvl - 1]?.emoji || "❓");
  const uniqueEmojis = Array.from(new Set(emojis));

  // Determine sizing details
  const sizeClasses = {
    sm: {
      container: 'w-10 h-10',
      mainEmoji: 'text-2xl',
      subEmoji: 'text-[9px] w-3 h-3',
      orbitRadius: '2',
      borderRing: 'inset-0.5'
    },
    md: {
      container: 'w-16 h-16',
      mainEmoji: 'text-4.5xl sm:text-5xl',
      subEmoji: 'text-[13px] w-5.5 h-5.5',
      orbitRadius: '4',
      borderRing: 'inset-1'
    },
    lg: {
      container: 'w-24 h-24',
      mainEmoji: 'text-6xl',
      subEmoji: 'text-lg w-7 h-7',
      orbitRadius: '6',
      borderRing: 'inset-1.5'
    },
    xl: {
      container: 'w-32 h-32',
      mainEmoji: 'text-7.5xl',
      subEmoji: 'text-2xl w-9 h-9',
      orbitRadius: '8',
      borderRing: 'inset-2'
    }
  }[size];

  // Resolve background and gradient colors based on components
  const baseColorStart = FRUITS[comps[0] - 1]?.color?.split(' ')[0]?.replace('from-', '') || 'neutral-600';
  const baseColorEnd = FRUITS[comps[comps.length - 1] - 1]?.color?.split(' ')[1]?.replace('to-', '') || 'neutral-700';
  
  // Custom multi-stop radial gradient for the cell
  const gradientBg = {
    background: `radial-gradient(circle at center, var(--color-${baseColorStart}) 0%, var(--color-${baseColorEnd}) 100%)`
  };

  // Determine rank styling overlays
  let rankEffects = "";
  let auraColor = "rgba(255, 255, 255, 0.1)";
  
  if (totalComps === 2) {
    // Modified: Subtle sapphire pulse
    rankEffects = "ring-2 ring-blue-500/65 shadow-[0_0_10px_rgba(59,130,246,0.3)]";
    auraColor = "rgba(59, 130, 246, 0.25)";
  } else if (totalComps === 3) {
    // Hybrid: Emerald energy glow
    rankEffects = "ring-2 ring-emerald-500/75 shadow-[0_0_15px_rgba(16,185,129,0.45)]";
    auraColor = "rgba(16, 185, 129, 0.35)";
  } else if (totalComps === 4) {
    // Super: Vibrant Amber aura and active spinning background ring
    rankEffects = "ring-[3px] ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.65)]";
    auraColor = "rgba(245, 158, 11, 0.4)";
  } else if (totalComps === 5) {
    // Superhybrid: Amethyst bright violet flames
    rankEffects = "ring-[3px] ring-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.8)]";
    auraColor = "rgba(168, 85, 247, 0.5)";
  } else if (totalComps >= 6) {
    // High tiers: Shimmering Cosmic Rainbow
    rankEffects = "ring-[3.5px] ring-cyan-400 border border-pink-500/40 animate-pulse shadow-[0_0_35px_rgba(6,182,212,0.95)]";
    auraColor = "rgba(6, 182, 212, 0.6)";
  }

  // --- RENDERING STRATEGIES ---

  // Strategy A: Standard Fruit (None or 1 component)
  if (totalComps <= 1) {
    return (
      <div 
        className={`${sizeClasses.container} relative rounded-full flex items-center justify-center overflow-hidden transition-all duration-300`}
        style={gradientBg}
      >
        {/* Soft background glow */}
        <div className="absolute inset-1 rounded-full bg-white/10 blur-[3px]" />
        
        {/* Central main emoji */}
        <span className={`${sizeClasses.mainEmoji} select-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)] filter transform transition-transform duration-300 hover:scale-110`}>
          {emojis[0] || "❓"}
        </span>
      </div>
    );
  }

  // Strategy B: 2 Components (overlapping split blend)
  if (totalComps === 2) {
    const emojiLeft = emojis[0];
    const emojiRight = emojis[1];

    return (
      <div 
        className={`${sizeClasses.container} relative rounded-full flex items-center justify-center overflow-hidden ${rankEffects} transition-all duration-300`}
        style={gradientBg}
      >
        {/* Rotating ring */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 animate-spin" style={{ animationDuration: '6s' }} />
        
        {/* Left Side Backdrop */}
        <div className="absolute inset-y-0 left-0 w-1/2 bg-white/5 backdrop-blur-[1px] rounded-l-full border-r border-white/5" />

        <div className="relative w-full h-full flex items-center justify-center">
          {/* Overlapping Emojis with depth */}
          <span className="absolute left-[8%] text-3xl sm:text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-10 select-none transform transition-transform active:scale-110">
            {emojiLeft}
          </span>
          <span className="absolute right-[8%] text-3xl sm:text-4xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-0 select-none transform transition-transform active:scale-110">
            {emojiRight}
          </span>
        </div>

        {/* Small center fusion line */}
        <div className="absolute inset-y-0 left-1/2 w-[1.5px] bg-gradient-to-b from-white/0 via-blue-400/50 to-white/0" />
      </div>
    );
  }

  // Strategy C: 3 Components (triangle cluster composition)
  if (totalComps === 3) {
    return (
      <div 
        className={`${sizeClasses.container} relative rounded-full flex items-center justify-center overflow-hidden ${rankEffects} transition-all duration-300`}
        style={gradientBg}
      >
        {/* Inner energy cell nucleus path */}
        <div 
          className="absolute inset-[15%] rounded-full opacity-45 mix-blend-color-dodge filter blur-[2px]"
          style={{ backgroundColor: auraColor }}
        />

        {/* 3 clustered emojis */}
        <div className="relative w-full h-full">
          {/* Top Emoji */}
          <span className="absolute top-[8%] left-1/2 -translate-x-1/2 text-2.5xl sm:text-3.5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] z-20 select-none">
            {emojis[0]}
          </span>
          {/* Bottom Left */}
          <span className="absolute bottom-[10%] left-[10%] text-2.5xl sm:text-3.5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] z-10 select-none">
            {emojis[1]}
          </span>
          {/* Bottom Right */}
          <span className="absolute bottom-[10%] right-[10%] text-2.5xl sm:text-3.5xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] z-10 select-none">
            {emojis[2]}
          </span>
        </div>
      </div>
    );
  }

  // Strategy D: 4+ Components (Primary Center with Orbiting Satellite Emojis)
  // Highly premium visual generated dynamically!
  const centralEmoji = FRUITS[Math.max(...comps) - 1]?.emoji || emojis[0];
  const satellites = uniqueEmojis.filter(e => e !== centralEmoji).slice(0, 3);
  if (satellites.length === 0) {
    // Fallback if all components are the same emoji
    satellites.push(...emojis.slice(1, 4));
  }

  return (
    <div 
      className={`${sizeClasses.container} relative rounded-full flex items-center justify-center overflow-hidden ${rankEffects} transition-all duration-300`}
      style={gradientBg}
    >
      {/* Dynamic stellar halo orbits */}
      <div className="absolute inset-1 rounded-full border border-dashed border-white/20 animate-spin" style={{ animationDuration: '10s' }} />
      <div className="absolute inset-2 ml-0.5 mt-0.5 rounded-full border border-dotted border-white/10 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />

      {/* Radiant inner core background glow */}
      <div 
        className="absolute inset-[10%] rounded-full opacity-55 animate-pulse mix-blend-screen"
        style={{
          background: `radial-gradient(circle, ${auraColor} 0%, rgba(0,0,0,0) 70%)`
        }}
      />

      {/* Large Central Leader Emoji */}
      <span className={`${sizeClasses.mainEmoji} relative z-10 select-none drop-shadow-[0_5px_8px_rgba(0,0,0,0.6)] filter transform transition-transform hover:scale-110 active:scale-120 duration-200`}>
        {centralEmoji}
      </span>

      {/* Orbiting Satellites in corners */}
      {satellites.map((satEmoji, satIdx) => {
        // Placement vectors for corners around the central fruit
        const positions = [
          'top-1 left-1.5',
          'bottom-1 right-1.5',
          'top-1 right-1.5',
          'bottom-1 left-1.5'
        ];
        const posClass = positions[satIdx % positions.length];

        return (
          <div 
            key={satIdx}
            className={`absolute ${posClass} ${sizeClasses.subEmoji} rounded-full bg-neutral-900/90 border border-white/20 flex items-center justify-center select-none shadow-md z-20 animate-bounce`}
            style={{ animationDelay: `${satIdx * 0.45}s`, animationDuration: '3.5s' }}
          >
            <span className="text-[12px] sm:text-[14px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
              {satEmoji}
            </span>
          </div>
        );
      })}

      {/* DNA strands rotating border effect */}
      <div className="absolute inset-0 border border-white/10 pointer-events-none rounded-full" />
    </div>
  );
}
