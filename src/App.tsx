/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FRUITS, 
  type Cell, 
  type Fruit, 
  type FruitType, 
  type Upgrade,
  getFruitEmoji,
  getFruitName,
  getFruitColor,
  getFruitBaseValue,
  createMergedFruit,
  RANKS,
  getPlayerRank,
  PASS_TIERS,
  FRUIT_CATEGORIES,
  type Achievement,
  ACHIEVEMENTS
} from './types';
import { FruitComponentIcon } from './components/FruitComponentIcon';
import { 
  Coins, 
  Sparkles, 
  ShoppingBag, 
  TrendingUp, 
  ClipboardList, 
  Trash2, 
  Check, 
  X, 
  HelpCircle,
  Truck,
  Gavel,
  Zap,
  Info,
  Clock,
  Award,
  Flame,
  Ticket,
  Gift,
  Lock,
  RefreshCw,
  Settings,
  Trophy
} from 'lucide-react';

const GRID_SIZE = 25;

interface Particle {
  id: string;
  startX: number;
  startY: number;
  vx: number;
  vy: number;
  content: string; // Emoji, coin or plus value
  rotation: number;
  color?: string;
  scale?: number;
}

interface AuctionBid {
  bidder: string;
  avatar: string;
  bidAmount: number;
  phrase: string;
}

interface Order {
  id: string;
  client: string;
  avatar: string;
  phrase: string;
  requiredFruits: { level: number; qty: number }[];
  reward: number;
}

const SHIBA_CLIENTS = [
  { name: "Енот Борис 🦝", avatar: "🦝", phrases: ["Для секретного варенья!", "Обожаю сладкое перед сном", "Мои друзья оценят этот заказ"] },
  { name: "Лисичка Алиса 🦊", avatar: "🦊", phrases: ["Свежие ингредиенты - залог красоты!", "Этот салат сведет всех с ума", "Быстрее, гости уже на пороге!"] },
  { name: "Панда По 🐼", avatar: "🐼", phrases: ["Мне нужно больше сочных плодов!", "Замена бамбуковой диете", "Для праздничного лимонада"] },
  { name: "Белочка Крис 🐿️", avatar: "🐿️", phrases: ["Запасаю витамины на зиму!", "Это выглядит потрясающе сочно", "Хрустящий выбор!"] },
  { name: "Коала Коко 🐨", avatar: "🐨", phrases: ["Медленно, но верно ем фрукты", "Хороший десерт после сна", "Очень аппетитно"] }
];

const BIDDERS = [
  { name: "Шеф-Повар 👨‍🍳", avatar: "👨‍🍳", phrases: ["Идеально для моего пирога!", "Мои гости заплатят вдвое больше за это!", "Превосходная консистенция!"] },
  { name: "Енот Гурман 🦝", avatar: "🦝", phrases: ["Ммм, пахнет спелостью...", "Я обязан забрать этот деликатес!", "Это просто шедевр селекции."] },
  { name: "Олигарх Лев 🦁", avatar: "🦁", phrases: ["Деньги не проблема, упакуйте!", "Мой личный зоопарк заслуживает лучшего", "Хм, выглядит дорого."] },
  { name: "Обезьянка Тони 🐒", avatar: "🐒", phrases: ["Дай-дай-дай! Скрещу прямо сейчас!", "У меня слюнки текут!", "Бросаю все монеты на стол!"] },
  { name: "Хипстер Заяц 🐰", avatar: "🐰", phrases: ["Это абсолютно органично!", "Идеально впишется в мой блог", "Стильный фрукт для смузи."] }
];

const ORDER_PHRASES = [
  "срочно требуются свежие ингредиенты!",
  "для особого фруктового смузи.",
  "для украшения праздничного торта.",
  "на зимнюю заготовку соков.",
  "для секретного кулинарного опыта."
];

export default function App() {
  // --- Game State with LocalStorage Load ---
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('fm_coins');
    return saved ? parseInt(saved, 10) : 100;
  });

  const [cells, setCells] = useState<Cell[]>(() => {
    const saved = localStorage.getItem('fm_cells');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    const initial = Array(GRID_SIZE).fill(null);
    initial[12] = { id: crypto.randomUUID(), level: 1 };
    initial[13] = { id: crypto.randomUUID(), level: 1 };
    return initial;
  });

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  
  // Upgrades
  const [upgrades, setUpgrades] = useState<{
    autoMerge: number; // scan every (10 - level) seconds
    doubleLuck: number; // probability of getting level+1 / level+2 on spawn/buy
    juicyProfit: number; // extra multiplier on sell / merge (+20% per level)
    discount: number; // cost savings (-10% per level, max 5)
    autoGen: number; // free fruit interval (-1s per level, starts at 10s)
  }>(() => {
    const saved = localStorage.getItem('fm_upgrades');
    return saved ? JSON.parse(saved) : {
      autoMerge: 0,
      doubleLuck: 0,
      juicyProfit: 0,
      discount: 0,
      autoGen: 0
    };
  });

  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(() => {
    const saved = localStorage.getItem('fm_max_level');
    return saved ? parseInt(saved, 10) : 1;
  });

  // Active Menu Tab
  const [activeTab, setActiveTab ] = useState<'shop' | 'upgrades' | 'auction' | 'orders' | 'guide' | 'pass' | 'rebirth'>('shop');
  const [guideSubTab, setGuideSubTab] = useState<'rules' | 'achievements'>('achievements');

  // Rebirth count state
  const [rebirths, setRebirths] = useState<number>(() => {
    const saved = localStorage.getItem('fm_rebirths');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Selected Category inside shop
  const [selectedShopCategoryId, setSelectedShopCategoryId ] = useState<string>("common");

  // Rebirth Security Confirmation Modal State
  const [showRebirthConfirm, setShowRebirthConfirm] = useState<boolean>(false);

  // Settings Modal State
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Ranks & Reward Pass Progression States
  const [playerXp, setPlayerXp] = useState<number>(() => {
    const saved = localStorage.getItem('fm_player_xp');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [passPoints, setPassPoints] = useState<number>(() => {
    const saved = localStorage.getItem('fm_pass_points');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [claimedRewards, setClaimedRewards] = useState<number[]>(() => {
    const saved = localStorage.getItem('fm_claimed_rewards');
    return saved ? JSON.parse(saved) : [];
  });

  // Achievements State and tracking counters
  const [totalMerges, setTotalMerges] = useState<number>(() => {
    const saved = localStorage.getItem('fm_total_merges');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [completedOrdersCount, setCompletedOrdersCount] = useState<number>(() => {
    const saved = localStorage.getItem('fm_completed_orders_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [completedAuctionsCount, setCompletedAuctionsCount] = useState<number>(() => {
    const saved = localStorage.getItem('fm_completed_auctions_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [totalCoinsSpent, setTotalCoinsSpent] = useState<number>(() => {
    const saved = localStorage.getItem('fm_total_coins_spent');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [claimedAchievements, setClaimedAchievements] = useState<string[]>(() => {
    const saved = localStorage.getItem('fm_claimed_achievements');
    return saved ? JSON.parse(saved) : [];
  });

  // Boost Timers (Seconds remaining)
  const [activeBoosts, setActiveBoosts] = useState<{
    doubleLuckTime: number;
    autoMergeFastTime: number;
    auctionValueTime: number;
    deliveryBonusTime: number;
  }>(() => {
    const saved = localStorage.getItem('fm_active_boosts');
    return saved ? JSON.parse(saved) : {
      doubleLuckTime: 0,
      autoMergeFastTime: 0,
      auctionValueTime: 0,
      deliveryBonusTime: 0
    };
  });

  // Helper functions to grant points and XP
  const addXp = useCallback((amount: number) => {
    setPlayerXp(prev => {
      const nextXp = prev + amount;
      const oldRank = getPlayerRank(prev);
      const newRank = getPlayerRank(nextXp);
      if (newRank.level > oldRank.level) {
        // celebratory notification delay
        setTimeout(() => {
          triggerNotification(`🌟 Повышение ранга: ${newRank.title} ${newRank.badge}! 🎓`);
        }, 120);
      }
      return nextXp;
    });
  }, []);

  const addPassPoints = useCallback((amount: number) => {
    setPassPoints(prev => {
      const oldLevel = Math.min(10, Math.floor(prev / 100));
      const nextPoints = prev + amount;
      const newLevel = Math.min(10, Math.floor(nextPoints / 100));
      if (newLevel > oldLevel) {
        setTimeout(() => {
          triggerNotification(`🎟️ Генетик-Пасс: Открыт новый уровень ${newLevel}! Заберите награды 🎁`);
        }, 300);
      }
      return nextPoints;
    });
  }, []);

  const claimAchievement = (ach: Achievement) => {
    if (claimedAchievements.includes(ach.id)) return;
    
    let currentVal = 0;
    if (ach.targetType === 'merges') currentVal = totalMerges;
    else if (ach.targetType === 'orders') currentVal = completedOrdersCount;
    else if (ach.targetType === 'auctions') currentVal = completedAuctionsCount;
    else if (ach.targetType === 'coinsSpent') currentVal = totalCoinsSpent;
    else if (ach.targetType === 'rebirths') currentVal = rebirths;
    else if (ach.targetType === 'level') currentVal = maxUnlockedLevel;

    if (currentVal >= ach.targetValue) {
      setClaimedAchievements(prev => [...prev, ach.id]);
      setCoins(prev => prev + ach.rewardCoins);
      addXp(ach.rewardXp);
      triggerNotification(`🏆 Открыта ачивка: ${ach.title}! +🪙 ${ach.rewardCoins} и +${ach.rewardXp} XP! 🎉`);
    } else {
      triggerNotification("Требование для ачивки еще не выполнено! 🚫");
    }
  };

  const claimPassReward = (tier: any) => {
    const currentPassLvl = Math.min(10, Math.floor(passPoints / 100));
    if (tier.id > currentPassLvl) {
      triggerNotification("Этот уровень еще не разблокирован! Выращивайте фрукты 🧪");
      return;
    }
    if (claimedRewards.includes(tier.id)) {
      triggerNotification("Награда уже получена! 🎉");
      return;
    }

    // Set claimed
    setClaimedRewards(prev => [...prev, tier.id]);

    // Apply reward
    if (tier.rewardType === 'coins') {
      const rewardAmt = tier.id === 1 ? 750 : 3500;
      setCoins(p => p + rewardAmt);
      triggerNotification(`💰 Получено +${rewardAmt} монет!`);
    } else if (tier.rewardType === 'luck_boost') {
      setActiveBoosts(prev => ({ ...prev, doubleLuckTime: prev.doubleLuckTime + 120 }));
      triggerNotification(`🚀 Активировано бустов: +120с к УДАЧЕ!`);
    } else if (tier.rewardType === 'speed_boost') {
      setActiveBoosts(prev => ({ ...prev, autoMergeFastTime: prev.autoMergeFastTime + 180 }));
      triggerNotification(`🚀 Активировано бустов: +180с к СЛИЯНИЯМ!`);
    } else if (tier.rewardType === 'auction_boost') {
      setActiveBoosts(prev => ({ ...prev, auctionValueTime: prev.auctionValueTime + 180 }));
      triggerNotification(`🚀 Активировано бустов: +180с к ТОРГАМ!`);
    } else if (tier.rewardType === 'delivery_boost') {
      setActiveBoosts(prev => ({ ...prev, deliveryBonusTime: prev.deliveryBonusTime + 180 }));
      triggerNotification(`🚀 Активировано бустов: +180с к НАГРАДАМ ЗАКАЗОВ!`);
    } else if (tier.rewardType === 'dna_booster') {
      triggerNotification("🪐 ДНК-Умножитель активирован навсегда! Ваша прибыль увеличена на +25%!");
    } else if (tier.rewardType === 'spawn_hybrid' || tier.rewardType === 'spawn_golden' || tier.rewardType === 'spawn_crystal') {
      // Find empty slot to spawn
      const emptyIdxs = cells.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1);
      if (emptyIdxs.length === 0) {
        // give fallback compensation coins and notify
        setCoins(prev => prev + 2000);
        triggerNotification(`⚠️ Нет места на поле! Награда компенсирована: +2000 монет 🪙`);
        return;
      }
      const targetIdx = emptyIdxs[Math.floor(Math.random() * emptyIdxs.length)];
      
      let spawnLevel = 1;
      if (tier.rewardType === 'spawn_hybrid') {
        spawnLevel = Math.max(1, Math.min(24, maxUnlockedLevel));
      } else if (tier.rewardType === 'spawn_golden') {
        spawnLevel = 10;
      } else if (tier.rewardType === 'spawn_crystal') {
        spawnLevel = 15;
      }

      setCells(prev => {
        const copy = [...prev];
        copy[targetIdx] = { id: crypto.randomUUID(), level: spawnLevel };
        return copy;
      });

      triggerNotification(`✨ Получен элитный плод уровень ${spawnLevel} на поле!`);
      spawnParticles(targetIdx, 'buy', FRUITS[spawnLevel - 1]?.emoji || "🍎");
    }
  };

  // Timer tick for boosters
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBoosts(prev => {
        if (prev.doubleLuckTime <= 0 && prev.autoMergeFastTime <= 0 && prev.auctionValueTime <= 0 && prev.deliveryBonusTime <= 0) {
          return prev;
        }
        return {
          doubleLuckTime: Math.max(0, prev.doubleLuckTime - 1),
          autoMergeFastTime: Math.max(0, prev.autoMergeFastTime - 1),
          auctionValueTime: Math.max(0, prev.auctionValueTime - 1),
          deliveryBonusTime: Math.max(0, prev.deliveryBonusTime - 1)
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Particles
  const [particles, setParticles] = useState<Particle[]>([]);

  // Simulation Bids for Auction
  const [auctionCellIdx, setAuctionCellIdx] = useState<number | null>(null);
  const [auctionFruit, setAuctionFruit] = useState<Fruit | null>(null);
  const [auctionBids, setAuctionBids] = useState<AuctionBid[]>([]);
  const [auctionTimer, setAuctionTimer] = useState<number>(0);
  const [sponsorOffer, setSponsorOffer] = useState<{ amount: number; bidder: string; avatar: string; phrase: string } | null>(null);

  // Client Orders
  const [orders, setOrders] = useState<Order[]>([]);

  // Guide helper
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Interaction feedback states
  const [boardPop, setBoardPop] = useState(false);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const triggerBoardPop = () => {
    setBoardPop(true);
    setTimeout(() => setBoardPop(false), 150);
  };

  // Save changes
  useEffect(() => {
    localStorage.setItem('fm_coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('fm_cells', JSON.stringify(cells));
  }, [cells]);

  useEffect(() => {
    localStorage.setItem('fm_upgrades', JSON.stringify(upgrades));
  }, [upgrades]);

  useEffect(() => {
    localStorage.setItem('fm_max_level', maxUnlockedLevel.toString());
  }, [maxUnlockedLevel]);

  useEffect(() => {
    localStorage.setItem('fm_player_xp', playerXp.toString());
  }, [playerXp]);

  useEffect(() => {
    localStorage.setItem('fm_pass_points', passPoints.toString());
  }, [passPoints]);

  useEffect(() => {
    localStorage.setItem('fm_claimed_rewards', JSON.stringify(claimedRewards));
  }, [claimedRewards]);

  useEffect(() => {
    localStorage.setItem('fm_active_boosts', JSON.stringify(activeBoosts));
  }, [activeBoosts]);

  useEffect(() => {
    localStorage.setItem('fm_rebirths', rebirths.toString());
  }, [rebirths]);

  useEffect(() => {
    localStorage.setItem('fm_total_merges', totalMerges.toString());
  }, [totalMerges]);

  useEffect(() => {
    localStorage.setItem('fm_completed_orders_count', completedOrdersCount.toString());
  }, [completedOrdersCount]);

  useEffect(() => {
    localStorage.setItem('fm_completed_auctions_count', completedAuctionsCount.toString());
  }, [completedAuctionsCount]);

  useEffect(() => {
    localStorage.setItem('fm_total_coins_spent', totalCoinsSpent.toString());
  }, [totalCoinsSpent]);

  useEffect(() => {
    localStorage.setItem('fm_claimed_achievements', JSON.stringify(claimedAchievements));
  }, [claimedAchievements]);

  // Generate initial client orders if empty
  useEffect(() => {
    if (orders.length === 0) {
      generateFreshOrders();
    }
  }, [orders]);

  // Helper trigger notification
  const triggerNotification = (text: string) => {
    setShowNotification(text);
    setTimeout(() => {
      setShowNotification(null);
    }, 3000);
  };

  // --- Particle Spawner ---
  const spawnParticles = useCallback((
    cellIdx: number, 
    type: 'merge' | 'sell' | 'buy' | 'coin' | 'order', 
    emojiOrText?: string
  ) => {
    const row = Math.floor(cellIdx / 5);
    const col = cellIdx % 5;
    
    // Convert matrix position to approximate percentage positions on the grid
    const startX = (col * 20) + 10;
    const startY = (row * 20) + 10;

    const count = type === 'merge' ? 10 : (type === 'sell' ? 8 : 4);
    const newParticles: Particle[] = [];
    const generatedIds: string[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5 - 0.25);
      const speed = 1.2 + Math.random() * 1.5;
      const pid = crypto.randomUUID();
      generatedIds.push(pid);

      let content = "✨";
      if (type === 'merge') content = emojiOrText || "💦";
      else if (type === 'sell') content = "🪙";
      else if (type === 'buy') content = "📦";
      else if (type === 'order') content = emojiOrText || "⭐";

      newParticles.push({
        id: pid,
        startX,
        startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        content,
        rotation: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.6
      });
    }

    // Always append secondary floating coin indicator
    if (type === 'sell' || type === 'merge') {
      const scoreId = crypto.randomUUID();
      generatedIds.push(scoreId);
      newParticles.push({
        id: scoreId,
        startX,
        startY,
        vx: 0,
        vy: -1.2,
        content: `+${emojiOrText} 🪙`,
        rotation: 0,
        scale: 1.4
      });
    }

    setParticles(prev => [...prev, ...newParticles]);

    // Cleanup particles
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !generatedIds.includes(p.id)));
    }, 1000);
  }, []);

  // --- Orders Generation ---
  const generateFreshOrders = () => {
    const newOrders: Order[] = [];
    for (let i = 0; i < 3; i++) {
      const client = SHIBA_CLIENTS[Math.floor(Math.random() * SHIBA_CLIENTS.length)];
      const maxLvl = Math.max(1, maxUnlockedLevel);
      
      // Determine what fruits are requested
      const count = Math.random() > 0.5 ? 2 : 1;
      const requiredFruits: { level: number; qty: number }[] = [];
      let totalValue = 0;

      for (let c = 0; c < count; c++) {
        // Request level near our current progression
        const targetLevel = Math.max(1, Math.min(maxLvl, Math.floor(Math.random() * maxLvl) + 1));
        const qty = Math.random() > 0.7 ? 2 : 1;
        
        // Avoid duplicate levels in same order
        if (!requiredFruits.some(rf => rf.level === targetLevel)) {
          requiredFruits.push({ level: targetLevel, qty });
          const fMeta = FRUITS[targetLevel - 1];
          totalValue += (fMeta?.baseValue || 10) * qty;
        }
      }

      // If list is empty due to duplicates somehow, fallback
      if (requiredFruits.length === 0) {
        requiredFruits.push({ level: 1, qty: 1 });
        totalValue += FRUITS[0].baseValue;
      }

      // Earn multiplier for orders (usually 1.6x - 2.2x base sell values)
      const reward = Math.round(totalValue * (1.6 + Math.random() * 0.6));

      newOrders.push({
        id: crypto.randomUUID(),
        client: client.name,
        avatar: client.avatar,
        phrase: client.phrases[Math.floor(Math.random() * client.phrases.length)],
        requiredFruits,
        reward
      });
    }
    setOrders(newOrders);
  };

  // --- Manual Buy Fruit ---
  const buyFruit = (fruitLevel: number) => {
    const indexMeta = FRUITS[fruitLevel - 1];
    if (!indexMeta) return;

    // Apply wholesale discount upgrade (-10% per level, max 50%)
    const discountFactor = 1 - (Math.min(5, upgrades.discount) * 0.1);
    const finalCost = Math.round(indexMeta.buyCost * discountFactor);

    if (coins < finalCost) {
      triggerNotification("Недостаточно монет! 🪙");
      return;
    }

    // Find empty slot
    const emptyIdxs = cells.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1);
    if (emptyIdxs.length === 0) {
      triggerNotification("Поле полностью заполнено! 🚫");
      return;
    }

    const targetIdx = emptyIdxs[Math.floor(Math.random() * emptyIdxs.length)];
    
    // Genetic Luck Upgrade / Active Boosters: Chance of getting tier +1 or +2
    let spawnedLevel = fruitLevel;
    const luckRoll = Math.random();
    const hasLuckBoost = activeBoosts.doubleLuckTime > 0;
    
    if (upgrades.doubleLuck > 0 || hasLuckBoost) {
      // If boost is active, we have +100% mutation chance (treated as x3 multiplier here)
      const multiplier = hasLuckBoost ? 3 : 1;
      const upgradeChance = (upgrades.doubleLuck > 0 ? upgrades.doubleLuck * 0.05 : 0.05) * multiplier;
      
      if (luckRoll < upgradeChance * 0.35 && spawnedLevel + 2 <= maxUnlockedLevel) {
        spawnedLevel += 2;
        triggerNotification("🧬 Генетический Прорыв: +2 уровня!");
      } else if (luckRoll < upgradeChance && spawnedLevel + 1 <= maxUnlockedLevel) {
        spawnedLevel += 1;
        triggerNotification("🧬 Мутация: Фрукт +1 уровня!");
      }
    }

    setCoins(prev => prev - finalCost);
    setTotalCoinsSpent(prev => prev + finalCost);
    setCells(prev => {
      const copy = [...prev];
      copy[targetIdx] = { id: crypto.randomUUID(), level: spawnedLevel };
      return copy;
    });

    // Award XP and Pass points
    const xpGained = Math.max(2, Math.round(indexMeta.baseValue * 0.1));
    addXp(xpGained);
    addPassPoints(fruitLevel * 3);

    spawnParticles(targetIdx, 'buy', FRUITS[spawnedLevel - 1].emoji);
  };

  // --- Auto Generator Free Spawns ---
  useEffect(() => {
    if (upgrades.autoGen === 0) return;
    
    // Interval defaults 10s, minus 1.2s per level
    const spawnTimer = Math.max(3000, 11000 - (upgrades.autoGen * 1200));

    const timer = setInterval(() => {
      setCells(prev => {
        const emptyIdxs = prev.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1);
        if (emptyIdxs.length === 0) return prev; // full

        const targetIdx = emptyIdxs[Math.floor(Math.random() * emptyIdxs.length)];
        const copy = [...prev];
        
        // Spawn basic fruit
        copy[targetIdx] = { id: crypto.randomUUID(), level: 1 };
        
        setTimeout(() => {
          spawnParticles(targetIdx, 'buy', "🍒");
        }, 50);

        return copy;
      });
    }, spawnTimer);

    return () => clearInterval(timer);
  }, [upgrades.autoGen, spawnParticles]);

  // --- Auto-Merge Bot Scan ---
  useEffect(() => {
    if (upgrades.autoMerge === 0) return;
    
    // Scan every (11 - level) seconds, or 2.5x faster when fast speed boost is running
    const baseTime = Math.max(2000, (11 - upgrades.autoMerge) * 1000);
    const intervalTime = activeBoosts.autoMergeFastTime > 0 ? baseTime / 2.5 : baseTime;

    const timer = setInterval(() => {
      setCells(prev => {
        // Find matching identical level cells
        const mergedCells = [...prev];
        let foundPair = false;

        for (let i = 0; i < mergedCells.length; i++) {
          const a = mergedCells[i];
          if (!a) continue;

          for (let j = i + 1; j < mergedCells.length; j++) {
            const b = mergedCells[j];
            if (b && b.level === a.level) {
              // Found matched pair! Merge b into a
              const merged = createMergedFruit(a, b);
              mergedCells[i] = merged;
              mergedCells[j] = null;
              foundPair = true;

              // Merges payoff (+ DNA permanent booster + juicy profit + rebirth modifier)
              const hasDnaBooster = claimedRewards.includes(10);
              const dnaMulti = hasDnaBooster ? 1.25 : 1.0;
              const bonusProfitMultiplier = (1 + (upgrades.juicyProfit * 0.2)) * dnaMulti * (1 + rebirths * 1.5); 
              const earnedCoins = Math.round(getFruitBaseValue(merged) * 1.5 * bonusProfitMultiplier);

              setCoins(prevCoins => prevCoins + earnedCoins);
              setTotalMerges(prev => prev + 1);
              
              if (merged.level > maxUnlockedLevel && merged.level <= FRUITS.length) {
                setMaxUnlockedLevel(merged.level);
              }

              // Award XP and Pass points
              const xpGained = Math.max(3, Math.round(getFruitBaseValue(merged) * 0.06));
              addXp(xpGained);
              addPassPoints(merged.level * 2);

              // Visual Splash
              setTimeout(() => {
                spawnParticles(i, 'merge', getFruitEmoji(merged));
              }, 50);

              break;
            }
          }
          if (foundPair) break;
        }

        return mergedCells;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [upgrades.autoMerge, upgrades.juicyProfit, maxUnlockedLevel, activeBoosts.autoMergeFastTime, claimedRewards, addXp, addPassPoints, spawnParticles]);

  // --- Passive Earnings of Board Crops ---
  useEffect(() => {
    // Every 5 seconds, all active fruits on board generate secondary coins!
    const timer = setInterval(() => {
      let earned = 0;
      const hasDnaBooster = claimedRewards.includes(10);
      const dnaMulti = hasDnaBooster ? 1.25 : 1.0;

      cells.forEach((cell, idx) => {
        if (cell) {
          // Generates 15% of its base selling value per 5 seconds passively + Rebirth multiplier
          const val = getFruitBaseValue(cell);
          const multi = (1 + (upgrades.juicyProfit * 0.2)) * dnaMulti * (1 + rebirths * 1.5);
          const cropIncome = Math.max(1, Math.round(val * 0.15 * multi));
          earned += cropIncome;
          
          if (Math.random() < 0.25) {
            // Spawn sporadic particles for fun
            spawnParticles(idx, 'buy', "🪙");
          }
        }
      });

      if (earned > 0) {
        setCoins(c => c + earned);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [cells, upgrades.juicyProfit, claimedRewards, spawnParticles]);

  // --- Auction Simulated Bids Loop ---
  useEffect(() => {
    if (!auctionFruit || auctionTimer <= 0) return;

    const interval = setInterval(() => {
      setAuctionTimer(prev => {
        if (prev <= 1) {
          // End of auction! Sell automatically to highest bidder
          handleAcceptAuctionBid();
          return 0;
        }
        return prev - 1;
      });

      // Calculate multipliers (temporary boost + permanent DNA reward)
      const hasDnaBooster = claimedRewards.includes(10);
      const isAuctionBoosted = activeBoosts.auctionValueTime > 0;
      const combinedMulti = (isAuctionBoosted ? 1.5 : 1.0) * (hasDnaBooster ? 1.25 : 1.0);

      // Random Sponsor Offer event (20% chance if bids are rolling and time permits)
      if (Math.random() < 0.20 && !sponsorOffer && auctionBids.length >= 2 && auctionTimer > 2) {
        const currentHighest = auctionBids[0]?.bidAmount || Math.round(getFruitBaseValue(auctionFruit) * 1.2);
        setSponsorOffer({
          amount: Math.round(currentHighest * 1.7),
          bidder: "Золотой Спонсор Тигр 🐯 VIP",
          avatar: "🐯",
          phrase: "Ух ты! Мой личный синдикат ищет такой экземпляр. Выкупаю за сумасшедшие деньги сейчас же!"
        });
        triggerNotification("🌟 Горячее предложение от VIP Спонсора! 🐯");
      }

      // Chance to receive a new higher bid
      if (Math.random() < 0.8) {
        const bidder = BIDDERS[Math.floor(Math.random() * BIDDERS.length)];
        const baseCalculatedValue = getFruitBaseValue(auctionFruit) * combinedMulti * (1 + rebirths * 1.5);
        const lastBid = auctionBids[0]?.bidAmount || Math.round(baseCalculatedValue * 1.2);
        
        // Random bid increase between 15% and 35% of fruit base value
        const increment = Math.max(8, Math.round(baseCalculatedValue * (0.15 + Math.random() * 0.2)));
        const nextBidAmount = lastBid + increment;

        const phrase = bidder.phrases[Math.floor(Math.random() * bidder.phrases.length)];

        setAuctionBids(prev => [
          {
            bidder: bidder.name,
            avatar: bidder.avatar,
            bidAmount: nextBidAmount,
            phrase: `«${phrase}»`
          },
          ...prev
        ]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [auctionFruit, auctionTimer, auctionBids, activeBoosts.auctionValueTime, claimedRewards, sponsorOffer]);

  // --- Merge, Move, Select Handlers ---
  const resolveMergeOrMove = (srcIdx: number, targetIdx: number) => {
    if (auctionCellIdx === srcIdx || auctionCellIdx === targetIdx) {
      triggerNotification("Этот фрукт сейчас заблокирован на аукционе! ⚖️");
      return;
    }

    const srcCell = cells[srcIdx];
    const targetCell = cells[targetIdx];

    if (!srcCell) return;

    if (targetCell) {
      // Merge ANY two fruits together, creating a custom genetic hybrid!
      const merged = createMergedFruit(srcCell, targetCell);
      
      setCells((prev) => {
        const newCells = [...prev];
        newCells[targetIdx] = merged;
        newCells[srcIdx] = null;
        return newCells;
      });

      // Earn core cash from merging based on the premium value of the hybrid + Rebirth boost
      const hasDnaBooster = claimedRewards.includes(10);
      const dnaMulti = hasDnaBooster ? 1.25 : 1.0;
      const profitBoost = (1 + (upgrades.juicyProfit * 0.2)) * dnaMulti * (1 + rebirths * 1.5);
      const mergePayout = Math.round(getFruitBaseValue(merged) * 1.5 * profitBoost);
      
      setCoins(c => c + mergePayout);
      setTotalMerges(prev => prev + 1);
      setSelectedIdx(null);

      // Track Progression record
      if (merged.level > maxUnlockedLevel) {
        setMaxUnlockedLevel(merged.level);
        triggerNotification(`🎉 Открыт новый вид: ${getFruitEmoji(merged)} ${getFruitName(merged)}!`);
      } else {
        triggerNotification(`🧬 Создан гибрид: ${getFruitName(merged)} ${getFruitEmoji(merged)}!`);
      }

      // Award Player XP and Pass points
      const xpGained = Math.max(3, Math.round(getFruitBaseValue(merged) * 0.08));
      addXp(xpGained);
      addPassPoints(merged.level * 2);

      spawnParticles(targetIdx, 'merge', getFruitEmoji(merged));
      triggerBoardPop();
    } else if (targetCell === null) {
      // Move
      setCells((prev) => {
        const newCells = [...prev];
        newCells[targetIdx] = prev[srcIdx];
        newCells[srcIdx] = null;
        return newCells;
      });
      setSelectedIdx(null);
      triggerBoardPop();
    } else {
      // Swap coordinates!
      setCells((prev) => {
        const newCells = [...prev];
        const temp = newCells[targetIdx];
        newCells[targetIdx] = newCells[srcIdx];
        newCells[srcIdx] = temp;
        return newCells;
      });
      setSelectedIdx(null);
      triggerBoardPop();
    }
  };

  const handleCellClick = (idx: number) => {
    // If auction is currently running and this cell is on the stand, refuse
    if (auctionCellIdx === idx) {
      triggerNotification("Этот фрукт сейчас заблокирован на аукционе! ⚖️");
      return;
    }

    if (selectedIdx === null) {
      if (cells[idx]) {
        setSelectedIdx(idx);
      }
    } else {
      if (idx === selectedIdx) {
        setSelectedIdx(null); // Deselect
      } else {
        resolveMergeOrMove(selectedIdx, idx);
      }
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: DragEvent, idx: number) => {
    if (auctionCellIdx === idx) {
      e.preventDefault();
      triggerNotification("Этот фрукт сейчас заблокирован на аукционе! ⚖️");
      return;
    }
    setDraggingIdx(idx);
    e.dataTransfer.setData("text/plain", idx.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleDragOver = (e: DragEvent, idx: number) => {
    e.preventDefault();
    if (dragOverIdx !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDragLeave = () => {
    setDragOverIdx(null);
  };

  const handleDrop = (e: DragEvent, idx: number) => {
    e.preventDefault();
    const srcIdxStr = e.dataTransfer.getData("text/plain");
    if (!srcIdxStr) return;
    const srcIdx = parseInt(srcIdxStr, 10);
    if (isNaN(srcIdx) || srcIdx === idx) return;

    resolveMergeOrMove(srcIdx, idx);
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleSellDirect = () => {
    if (selectedIdx === null || !cells[selectedIdx]) return;
    const targetIdx = selectedIdx;
    const fFruit = cells[targetIdx]!;

    // Compute payoff (+ DNA Booster + Rebirth multiplier)
    const hasDnaBooster = claimedRewards.includes(10);
    const dnaMulti = hasDnaBooster ? 1.25 : 1.0;
    const profitBoost = (1 + (upgrades.juicyProfit * 0.2)) * dnaMulti * (1 + rebirths * 1.5);
    const finalValue = Math.round(getFruitBaseValue(fFruit) * profitBoost);

    setCoins(prev => prev + finalValue);
    
    // Clear slot
    setCells(prev => {
      const copy = [...prev];
      copy[targetIdx] = null;
      return copy;
    });

    // Award XP and Pass points
    addXp(Math.max(2, Math.round(getFruitBaseValue(fFruit) * 0.04)));
    addPassPoints(fFruit.level * 2);

    setSelectedIdx(null);
    spawnParticles(targetIdx, 'sell', finalValue.toString());
  };

  // --- List on Auction ---
  const listOnAuction = () => {
    if (selectedIdx === null || !cells[selectedIdx]) {
      triggerNotification("Сначала выберите фрукт на поле! 👆");
      return;
    }

    const cellData = cells[selectedIdx]!;
    
    setAuctionCellIdx(selectedIdx);
    setAuctionFruit({ ...cellData });
    setAuctionTimer(15); // 15 seconds biddings duration
    setSponsorOffer(null); // Reset golden offer on brand-new stand

    // Initial Bid (Booster support + Rebirth multiplier)
    const hasDnaBooster = claimedRewards.includes(10);
    const isAuctionBoosted = activeBoosts.auctionValueTime > 0;
    const rMulti = 1 + rebirths * 1.5;
    const startValue = Math.round(getFruitBaseValue(cellData) * 1.15 * (isAuctionBoosted ? 1.5 : 1.0) * (hasDnaBooster ? 1.25 : 1.0) * rMulti);
    
    setAuctionBids([
      {
        bidder: "Начальная ставка ⚖️",
        avatar: "🏷️",
        bidAmount: startValue,
        phrase: "Аукцион запущен. Ждем предложений покупателей!"
      }
    ]);

    setSelectedIdx(null);
    setActiveTab('auction');
    triggerNotification("Фрукт выставлен на аукцион! Спешите следить за ставками 👀");
  };

  const handleCancelAuction = () => {
    setAuctionCellIdx(null);
    setAuctionFruit(null);
    setAuctionBids([]);
    setAuctionTimer(0);
    setSponsorOffer(null);
    triggerNotification("Аукцион отменен. Фрукт возвращен.");
  };

  const handleAcceptAuctionBid = () => {
    if (auctionCellIdx === null || !auctionFruit) return;

    // Check sponsor offer vs standard bidder highest bid
    const highestBid = auctionBids[0]?.bidAmount || getFruitBaseValue(auctionFruit);
    
    setCoins(prev => prev + highestBid);
    setCompletedAuctionsCount(prev => prev + 1);
    
    // Clear cell where it was placed
    const originIdx = auctionCellIdx;
    setCells(prev => {
      const copy = [...prev];
      copy[originIdx] = null;
      return copy;
    });

    spawnParticles(originIdx, 'sell', highestBid.toString());

    // Award major XP & Pass Points
    const xpReward = Math.max(8, Math.round(highestBid * 0.06));
    addXp(xpReward);
    addPassPoints(18);

    // Clean auction status
    setAuctionCellIdx(null);
    setAuctionFruit(null);
    setAuctionBids([]);
    setAuctionTimer(0);
    setSponsorOffer(null);

    triggerNotification(`Продано на атракционе за 🪙 ${highestBid}! +${xpReward} XP 🎓`);
  };

  const handleAcceptSponsorOffer = () => {
    if (auctionCellIdx === null || !auctionFruit || !sponsorOffer) return;

    const offerAmount = sponsorOffer.amount;
    setCoins(prev => prev + offerAmount);
    setCompletedAuctionsCount(prev => prev + 1);

    const originIdx = auctionCellIdx;
    setCells(prev => {
      const copy = [...prev];
      copy[originIdx] = null;
      return copy;
    });

    spawnParticles(originIdx, 'sell', offerAmount.toString());

    // Major rewards
    const xpReward = Math.max(12, Math.round(offerAmount * 0.07));
    addXp(xpReward);
    addPassPoints(30);

    // Clean auction status
    setAuctionCellIdx(null);
    setAuctionFruit(null);
    setAuctionBids([]);
    setAuctionTimer(0);
    setSponsorOffer(null);

    triggerNotification(`VIP Сделка закрыта за 🪙 ${offerAmount}! +${xpReward} XP 🎓`);
  };

  // --- Complete Client Delivery Order ---
  const handleDeliverOrder = (order: Order) => {
    // Check if player has all required fruits on board
    const tempCells = [...cells];
    const cellsToClear: number[] = [];
    let isFulfilled = true;

    for (const item of order.requiredFruits) {
      let needed = item.qty;
      for (let i = 0; i < tempCells.length; i++) {
        if (needed === 0) break;
        if (tempCells[i] && tempCells[i]!.level === item.level && !cellsToClear.includes(i)) {
          cellsToClear.push(i);
          needed--;
        }
      }

      if (needed > 0) {
        isFulfilled = false;
        break;
      }
    }

    if (!isFulfilled) {
      triggerNotification("У вас нет необходимых фруктов спелости на поле! 🍓");
      return;
    }

    // Clear matching fruits & trigger particles
    setCells(prev => {
      const copy = [...prev];
      cellsToClear.forEach(idx => {
        copy[idx] = null;
      });
      return copy;
    });

    // Payout and upgrade order list (Booster support & permanent DNA booster + Rebirth multiplier)
    const hasDnaBooster = claimedRewards.includes(10);
    const hasDeliveryBoost = activeBoosts.deliveryBonusTime > 0;
    const multi = (hasDeliveryBoost ? 2.0 : 1.0) * (hasDnaBooster ? 1.25 : 1.0) * (1 + rebirths * 1.5);
    
    const rewardCoins = Math.round(order.reward * multi);
    setCoins(prev => prev + rewardCoins);
    setCompletedOrdersCount(prev => prev + 1);

    // Blast order specific particles from cleared nodes
    cellsToClear.forEach(cellIdx => {
      spawnParticles(cellIdx, 'order', "⭐");
    });

    // Award major XP & Pass Points
    const xpReward = Math.max(15, Math.round(order.reward * 0.10));
    addXp(xpReward);
    addPassPoints(40);

    // Replace completed order with a new one
    setOrders(prev => prev.map(o => o.id === order.id ? createSingleFreshOrder() : o));

    if (hasDeliveryBoost) {
      triggerNotification(`🚀 Королевская Доставка: x2 Награда! +🪙 ${rewardCoins}! +${xpReward} XP 🎉`);
    } else {
      triggerNotification(`Заказ успешно выполнен! +🪙 ${rewardCoins}! +${xpReward} XP 🎉`);
    }
  };

  const createSingleFreshOrder = (): Order => {
    const client = SHIBA_CLIENTS[Math.floor(Math.random() * SHIBA_CLIENTS.length)];
    const maxLvl = Math.max(1, maxUnlockedLevel);
    const count = Math.random() > 0.5 ? 2 : 1;
    const requiredFruits: { level: number; qty: number }[] = [];
    let totalValue = 0;

    for (let c = 0; c < count; c++) {
      const targetLevel = Math.max(1, Math.min(maxLvl, Math.floor(Math.random() * maxLvl) + 1));
      const qty = Math.random() > 0.75 ? 2 : 1;
      
      if (!requiredFruits.some(rf => rf.level === targetLevel)) {
        requiredFruits.push({ level: targetLevel, qty });
        totalValue += (FRUITS[targetLevel - 1]?.baseValue || 10) * qty;
      }
    }

    if (requiredFruits.length === 0) {
      requiredFruits.push({ level: 1, qty: 1 });
      totalValue += FRUITS[0].baseValue;
    }

    const reward = Math.round(totalValue * (1.7 + Math.random() * 0.7));

    return {
      id: crypto.randomUUID(),
      client: client.name,
      avatar: client.avatar,
      phrase: client.phrases[Math.floor(Math.random() * client.phrases.length)],
      requiredFruits,
      reward
    };
  };

  // Check if board contains specified fruits to fulfill delivery
  const checkHasCrops = (requiredList: { level: number; qty: number }[]) => {
    const counts: { [key: number]: number } = {};
    cells.forEach(c => {
      if (c) {
        counts[c.level] = (counts[c.level] || 0) + 1;
      }
    });

    return requiredList.every(req => (counts[req.level] || 0) >= req.qty);
  };

  // --- Buy Upgrade Handler ---
  const buyUpgrade = (key: keyof typeof upgrades, baseCost: number) => {
    const currentLvl = upgrades[key];
    const nextLvl = currentLvl + 1;
    const nextCost = Math.round(baseCost * Math.pow(2.2, currentLvl));

    if (coins < nextCost) {
      triggerNotification("Недостаточно монет для улучшения! 🪙");
      return;
    }

    setCoins(prev => prev - nextCost);
    setTotalCoinsSpent(prev => prev + nextCost);
    setUpgrades(prev => ({
      ...prev,
      [key]: nextLvl
    }));

    triggerNotification("Улучшение успешно приобретено! ⚡📈");
  };

  // --- Perform Rebirth ---
  const performRebirth = () => {
    const halfCoins = Math.floor(coins / 2);
    setCoins(Math.max(100, halfCoins));

    setUpgrades({
      autoMerge: 0,
      doubleLuck: 0,
      juicyProfit: 0,
      discount: 0,
      autoGen: 0
    });

    setMaxUnlockedLevel(1);
    setPlayerXp(0);
    setPassPoints(0);
    setClaimedRewards([]);

    const resetCells = Array(GRID_SIZE).fill(null);
    resetCells[12] = { id: crypto.randomUUID(), level: 1 };
    resetCells[13] = { id: crypto.randomUUID(), level: 1 };
    setCells(resetCells);

    setRebirths(r => r + 1);

    setSelectedIdx(null);
    setAuctionCellIdx(null);
    setAuctionFruit(null);
    setAuctionBids([]);
    setAuctionTimer(0);
    setSponsorOffer(null);

    setSelectedShopCategoryId("common");
    setOrders([]);
    setShowRebirthConfirm(false);

    triggerNotification("🪐 ПЕРЕРОЖДЕНИЕ ВЫПОЛНЕНО! Прибыль навсегда увеличена на +150%! 🌀✨");

    spawnParticles(12, 'buy', "🌀");
    spawnParticles(13, 'buy', "🌀");
  };

  // --- Reset All Progress ---
  const handleResetProgress = () => {
    localStorage.removeItem('fm_coins');
    localStorage.removeItem('fm_cells');
    localStorage.removeItem('fm_upgrades');
    localStorage.removeItem('fm_max_level');
    localStorage.removeItem('fm_rebirths');
    localStorage.removeItem('fm_player_xp');
    localStorage.removeItem('fm_pass_points');
    localStorage.removeItem('fm_claimed_rewards');
    localStorage.removeItem('fm_active_boosts');
    localStorage.removeItem('fm_total_merges');
    localStorage.removeItem('fm_completed_orders_count');
    localStorage.removeItem('fm_completed_auctions_count');
    localStorage.removeItem('fm_total_coins_spent');
    localStorage.removeItem('fm_claimed_achievements');

    setCoins(100);
    
    const initial = Array(GRID_SIZE).fill(null);
    initial[12] = { id: crypto.randomUUID(), level: 1 };
    initial[13] = { id: crypto.randomUUID(), level: 1 };
    setCells(initial);

    setUpgrades({
      autoMerge: 0,
      doubleLuck: 0,
      juicyProfit: 0,
      discount: 0,
      autoGen: 0
    });

    setMaxUnlockedLevel(1);
    setRebirths(0);
    setPlayerXp(0);
    setPassPoints(0);
    setClaimedRewards([]);
    setTotalMerges(0);
    setCompletedOrdersCount(0);
    setCompletedAuctionsCount(0);
    setTotalCoinsSpent(0);
    setClaimedAchievements([]);
    
    setActiveBoosts({
      doubleLuckTime: 0,
      autoMergeFastTime: 0,
      auctionValueTime: 0,
      deliveryBonusTime: 0
    });

    setSelectedIdx(null);
    setAuctionCellIdx(null);
    setAuctionFruit(null);
    setAuctionBids([]);
    setAuctionTimer(0);
    setSponsorOffer(null);
    setOrders([]);

    setSelectedShopCategoryId("common");
    setShowResetConfirm(false);
    setShowSettings(false);

    triggerNotification("🧹 ВЕСЬ ПРОГРЕСС ПОЛНОСТЬЮ СБРОШЕН! Начните заново! 🌱✨");
  };

  // Current upgrades data info
  const listUpgrades: { key: keyof typeof upgrades; name: string; desc: string; baseCost: number; max?: number }[] = [
    { key: "autoMerge", name: "Авто-Слиятель 🔄", desc: "Автоматически объединяет дубликаты фруктов. Каждый уровень сканирует поле быстрее.", baseCost: 150 },
    { key: "doubleLuck", name: "Мутации ДНК 🧬", desc: "Дает шанс вырастить купленный фрукт сразу 2-го или 3-го уровня со старта.", baseCost: 350 },
    { key: "juicyProfit", name: "Сочная Выгода 🍇", desc: "Увеличивает прибыль от слияний, заказов и прямых продаж на +20% за уровень.", baseCost: 100 },
    { key: "discount", name: "Оптовая Скидка 🏷️", desc: "Снижает базовую стоимость покупки семян и плодов в магазине на -10% за уровень.", baseCost: 200, max: 5 },
    { key: "autoGen", name: "Чудо-Теплица 🌱", desc: "Автоматически генерирует бесплатные вишни на доске. Быстрее с каждым уровнем.", baseCost: 250 }
  ];

  const hasClaimableAchievements = ACHIEVEMENTS.some(ach => {
    let currentVal = 0;
    if (ach.targetType === 'merges') currentVal = totalMerges;
    else if (ach.targetType === 'orders') currentVal = completedOrdersCount;
    else if (ach.targetType === 'auctions') currentVal = completedAuctionsCount;
    else if (ach.targetType === 'coinsSpent') currentVal = totalCoinsSpent;
    else if (ach.targetType === 'rebirths') currentVal = rebirths;
    else if (ach.targetType === 'level') currentVal = maxUnlockedLevel;

    return currentVal >= ach.targetValue && !claimedAchievements.includes(ach.id);
  });

  return (
    <div id="root" className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-start p-2 sm:p-4 font-sans select-none overflow-x-hidden">
      {/* Target Selector precise CSS tag */}
      <style>{`
        div#root:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) {
          background-color: #858282 !important;
        }
      `}</style>

      <div className="w-full max-w-lg flex flex-col gap-3">
        
        {/* FIRST CHILD CONTAINER: Stats and Selected Info */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
          {/* Header Row with App Title/Settings icon */}
          <div className="flex items-center justify-between border-b border-neutral-805/60 pb-2.5">
            <span className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-amber-200 to-rose-450 bg-clip-text text-transparent flex items-center gap-1.5">
              🧬 Фруктовая Эволюция
            </span>
            <button
              onClick={() => {
                setShowSettings(true);
                setShowResetConfirm(false);
              }}
              className="p-1.5 rounded-xl bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white transition duration-200 active:scale-90 border border-neutral-800"
              title="Настройки"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-amber-500/20 p-2 rounded-xl border border-amber-500/30 animate-pulse">
                <Coins className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Баланс монет</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 flex items-center gap-1">
                  {coins.toLocaleString()} <span className="text-lg text-amber-500">🪙</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold block text-right">Высшая Селекция</span>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5 bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-900/40 justify-end">
                  <span>{FRUITS[maxUnlockedLevel - 1]?.emoji || "🌱"}</span>
                  <span className="truncate max-w-[80px] sm:max-w-[120px]">{FRUITS[maxUnlockedLevel - 1]?.name_ru || "Вишня"}</span>
                </div>
              </div>
              {rebirths > 0 && (
                <div className="text-[10px] bg-purple-950/50 text-purple-300 border border-purple-800/45 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                  <span className="animate-pulse">🌀</span>
                  <span>Перерождение x{rebirths} (+{rebirths * 150}%)</span>
                </div>
              )}
            </div>
          </div>

          {/* Ranks Progression Banner */}
          {(() => {
            const rank = getPlayerRank(playerXp);
            return (
              <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80 flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/10" />
                      Ранг {rank.level}:
                    </span>
                    <span className="font-bold text-white tracking-wide">{rank.title} {rank.badge}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono font-semibold">{rank.xpInCurrentRank} / {rank.xpNeededForNext} XP</span>
                </div>
                <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden border border-neutral-850">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${rank.progressPercentage}%` }}
                  />
                </div>
              </div>
            );
          })()}

          {/* Active Boosters Row */}
          {(activeBoosts.doubleLuckTime > 0 || activeBoosts.autoMergeFastTime > 0 || activeBoosts.auctionValueTime > 0 || activeBoosts.deliveryBonusTime > 0) && (
            <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-neutral-800/60 items-center">
              <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider select-none pr-1">Активные бусты:</span>
              {activeBoosts.doubleLuckTime > 0 && (
                <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3 text-emerald-400" />
                  <span>Удача: {activeBoosts.doubleLuckTime}с</span>
                </span>
              )}
              {activeBoosts.autoMergeFastTime > 0 && (
                <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 text-[10px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 animate-pulse">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Ускоритель: {activeBoosts.autoMergeFastTime}с</span>
                </span>
              )}
              {activeBoosts.auctionValueTime > 0 && (
                <span className="bg-purple-950/80 text-purple-300 border border-purple-800/60 text-[10px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 animate-pulse">
                  <Gavel className="w-3 h-3 text-purple-400" />
                  <span>Торги X1.5: {activeBoosts.auctionValueTime}с</span>
                </span>
              )}
              {activeBoosts.deliveryBonusTime > 0 && (
                <span className="bg-orange-950/80 text-orange-300 border border-orange-850 text-[10px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 animate-pulse">
                  <Truck className="w-3 h-3 text-orange-400" />
                  <span>Заказы X2: {activeBoosts.deliveryBonusTime}с</span>
                </span>
              )}
            </div>
          )}

          {/* Selection Information Toolbar */}
          <div className="h-12 bg-neutral-950 rounded-xl px-3 flex items-center justify-between border border-neutral-800/60">
            {selectedIdx !== null && cells[selectedIdx] ? (
              <>
                <div className="flex items-center gap-2">
                  <FruitComponentIcon fruit={cells[selectedIdx]!} size="sm" />
                  <div>
                    <h4 className="font-semibold text-sm text-neutral-200">
                      {getFruitName(cells[selectedIdx]!)}
                    </h4>
                    <p className="text-[10px] text-neutral-400">
                      Стоимость: <span className="text-amber-400 font-bold">{Math.round(getFruitBaseValue(cells[selectedIdx]!) * (1 + upgrades.juicyProfit * 0.2))} 🪙</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSellDirect}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Быстрая продажа</span>
                  </button>
                  <button
                    onClick={listOnAuction}
                    className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition active:scale-95"
                  >
                    <Gavel className="w-3.5 h-3.5" />
                    <span>Аукцион</span>
                  </button>
                </div>
              </>
            ) : (
              <span className="text-xs text-neutral-500 flex items-center gap-1.5 mx-auto">
                <Info className="w-4 h-4 text-neutral-600" />
                Выберите фрукт на поле, чтобы продать, запустить аукцион или перетащить!
              </span>
            )}
          </div>
        </div>

        {/* SECOND CHILD CONTAINER: Target Selector Grid Game Board */}
        <motion.div
          animate={{ scale: boardPop ? 1.025 : 1 }}
          transition={{ type: "spring", stiffness: 450, damping: 15 }}
          whileTap={{ scale: 0.985 }}
          className="grid grid-cols-5 gap-2 p-2 rounded-2xl shadow-2xl relative border border-neutral-700/50 aspect-square"
        >
          {/* Loop Board cells of fruit merge */}
          {cells.map((cell, idx) => {
            const isDragging = draggingIdx === idx;
            const isDragOver = dragOverIdx === idx;

            return (
              <motion.div
                key={idx}
                draggable={!!cell && auctionCellIdx !== idx}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
                className={`relative rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-100 ${
                  selectedIdx === idx 
                    ? 'ring-4 ring-amber-400 bg-neutral-700 shadow-lg scale-95' 
                    : isDragOver
                      ? 'ring-4 ring-dashed ring-emerald-400 bg-neutral-750 scale-102 z-20 shadow-md'
                      : cell 
                        ? 'bg-neutral-800 hover:bg-neutral-750/90' 
                        : 'bg-neutral-900 border border-neutral-950/40 hover:bg-neutral-850'
                }`}
                style={{
                  outline: auctionCellIdx === idx ? '3px dashed #eab308' : 'none',
                  opacity: isDragging ? 0.4 : 1,
                }}
                onClick={() => handleCellClick(idx)}
                whileHover={{ scale: cell && !isDragging ? 1.05 : 1 }}
                whileTap={{ scale: 0.94 }}
              >
                {/* If this node is active on Auction */}
                {auctionCellIdx === idx && (
                  <div className="absolute inset-0 bg-yellow-950/70 flex flex-col items-center justify-center z-10 text-center animate-pulse">
                    <Gavel className="w-5 h-5 text-yellow-400 animate-bounce" />
                    <span className="text-[8px] text-yellow-200 uppercase font-bold tracking-tight">АУКЦИОН</span>
                  </div>
                )}

                <AnimatePresence>
                  {cell && (
                    <motion.div
                      initial={{ scale: 0.2, rotate: -20 }}
                      animate={{ 
                        scale: 1, 
                        rotate: [0, -8, 8, -5, 5, 0],
                      }}
                      exit={{ scale: 0, rotate: 45 }}
                      transition={{ 
                        scale: { type: "spring", stiffness: 220, damping: 14 },
                        rotate: { type: "tween", duration: 0.6, ease: "easeInOut" }
                      }}
                      className="w-full h-full flex flex-col items-center justify-center relative p-1"
                    >
                      <FruitComponentIcon fruit={cell} size="md" />

                      {/* Small tag shown on merge info */}
                      <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md px-1 py-[1.5px] rounded border border-white/10">
                        <span className="text-[7px] text-white/90 font-bold">
                          L{cell.level}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Short status panel banner / notifier */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-500 text-neutral-950 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <Sparkles className="w-4 h-4 text-emerald-950 animate-spin" />
              <span>{showNotification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* THIRD CHILD CONTAINER: Bulk Simple Direct Purchase Button */}
        <div className="flex gap-2 items-center bg-neutral-900 border border-neutral-800 p-2 rounded-2xl">
          <div className="text-xs text-neutral-400 pl-2">
            <strong>Быстрая покупка:</strong>
          </div>
          <button
            onClick={() => buyFruit(1)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 rounded-xl font-bold flex items-center justify-between text-xs sm:text-sm shadow-md transition transform active:scale-95 border-b-4 border-emerald-800"
          >
            <div className="flex items-center gap-1">
              <span>Заказать вишню</span>
              <span className="text-base">🍒</span>
            </div>
            <span className="bg-emerald-950 px-2 py-0.5 rounded text-emerald-300 font-mono text-xs">
              {Math.round(FRUITS[0].buyCost * (1 - Math.min(5, upgrades.discount) * 0.1))} 🪙
            </span>
          </button>
        </div>

        {/* NAVIGATION SYSTEM: Minimal, fully responsive Tabs */}
        <div className="flex bg-neutral-900 border border-neutral-800/80 rounded-2xl p-1 shadow-lg overflow-x-auto whitespace-nowrap scrollbar-none gap-0.5">
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'shop' 
                ? 'bg-neutral-800 text-white shadow-inner' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Магазин</span>
          </button>
          
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upgrades' 
                ? 'bg-neutral-800 text-white shadow-inner' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Улучшения</span>
          </button>

          <button
            onClick={() => setActiveTab('pass')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'pass' 
                ? 'bg-neutral-800 text-white shadow-inner' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-indigo-400" />
            <span>Генетик-Пасс</span>
            {(() => {
              const currentPassLvl = Math.min(10, Math.floor(passPoints / 100));
              const unclaimedCount = PASS_TIERS.filter(tier => tier.id <= currentPassLvl && !claimedRewards.includes(tier.id)).length;
              return unclaimedCount > 0 && (
                <span className="absolute -top-1 -right-0.5 bg-indigo-600 text-[8px] font-extrabold text-white h-4 min-w-4 px-1 rounded-full flex items-center justify-center animate-bounce border border-neutral-900">
                  {unclaimedCount}
                </span>
              );
            })()}
          </button>

          <button
            onClick={() => setActiveTab('auction')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'auction' 
                ? 'bg-neutral-800 text-white shadow-inner' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span>Аукцион</span>
            {auctionTimer > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'orders' 
                ? 'bg-neutral-800 text-white shadow-inner' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Заказы</span>
            {orders.some(o => checkHasCrops(o.requiredFruits)) && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'guide' 
                ? 'bg-neutral-800 text-white shadow-inner' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Достижения</span>
            {hasClaimableAchievements && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('rebirth')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'rebirth' 
                ? 'bg-neutral-800 text-white shadow-inner' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${activeTab === 'rebirth' ? 'animate-spin' : ''}`} />
            <span>Перерождение</span>
            {rebirths > 0 && (
              <span className="bg-purple-600/30 text-purple-300 text-[8px] font-mono font-bold px-1 rounded border border-purple-500/20">
                x{rebirths}
              </span>
            )}
          </button>
        </div>

        {/* MAIN PANEL CONTENT VIEWS */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 sm:p-4 min-h-[190px] shadow-lg">
          
          {/* 1. SEED SHOP VIEW */}
          {activeTab === 'shop' && (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-1">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-300">Приобрести семена селекции</h3>
                  <p className="text-[9px] text-neutral-500">Доступно до L{Math.max(1, maxUnlockedLevel)} • {rebirths === 0 ? "Сделайте Перерождение для открытия категорий 3+" : "Категории разблокированы по уровню Перерождений!"}</p>
                </div>
              </div>

              {/* HORIZONTAL CATEGORIES NAVIGATION */}
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                {FRUIT_CATEGORIES.map((cat) => {
                  const isLocked = rebirths < (cat.requiredRebirths || 0);
                  const isSelected = selectedShopCategoryId === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (isLocked) {
                          triggerNotification(`🔒 Требуется перерождение уровня ${cat.requiredRebirths}! Сделайте перерождение во вкладке "Перерождение" 🌀`);
                        } else {
                          setSelectedShopCategoryId(cat.id);
                        }
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                        isLocked
                          ? 'bg-neutral-950/40 text-neutral-600 border border-neutral-900 cursor-not-allowed'
                          : isSelected
                            ? 'bg-amber-600 text-neutral-950 border border-amber-500 shadow-md'
                            : 'bg-neutral-950/90 text-neutral-300 hover:text-white border border-neutral-800'
                      }`}
                    >
                      <span>{cat.badge}</span>
                      <span>{cat.name}</span>
                      {isLocked && <Lock className="w-2.5 h-2.5 ml-1 text-neutral-600" />}
                    </button>
                  );
                })}
              </div>
              
              {/* DISPLAYING FRUITS IN SELECTED CATEGORY */}
              {(() => {
                const currentCat = FRUIT_CATEGORIES.find(c => c.id === selectedShopCategoryId) || FRUIT_CATEGORIES[0];
                const catFruits = FRUITS.filter(f => f.level >= currentCat.minLevel && f.level <= currentCat.maxLevel);

                return (
                  <div className="grid grid-cols-2 gap-2 h-[160px] overflow-y-auto pr-1">
                    {catFruits.map((fruit) => {
                      const isUnlocked = fruit.level <= maxUnlockedLevel;
                      const discountFactor = 1 - (Math.min(5, upgrades.discount) * 0.1);
                      const finalCost = Math.round(fruit.buyCost * discountFactor);

                      return (
                        <div 
                          key={fruit.level}
                          className={`p-2 rounded-xl flex items-center justify-between border transition ${
                            isUnlocked 
                              ? 'bg-neutral-950/80 border-neutral-800 hover:bg-neutral-900 shadow-sm' 
                              : 'bg-neutral-950/30 border-neutral-800/40 opacity-45'
                          }`}
                        >
                          <div className="flex items-center gap-2 max-w-[70%]">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${fruit.color} flex items-center justify-center text-xl shadow shrink-0`}>
                              {isUnlocked ? fruit.emoji : "🔒"}
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-bold truncate">
                                {isUnlocked ? fruit.name_ru : "Заблокировано"}
                              </div>
                              <div className="text-[9px] text-neutral-400">
                                {isUnlocked ? `Чистый доход: ${fruit.baseValue} 🪙` : `Уровень слияния ${fruit.level}`}
                              </div>
                            </div>
                          </div>

                          {isUnlocked ? (
                            <button
                              onClick={() => buyFruit(fruit.level)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg border-b-2 border-emerald-800 transition active:scale-95 shrink-0"
                            >
                              {finalCost} 🪙
                            </button>
                          ) : (
                            <span className="text-[10px] text-neutral-600 pr-1 shrink-0">L{fruit.level}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* 1.5 GENETIC PASS SYSTEM VIEW */}
          {activeTab === 'pass' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-indigo-900/50 pb-2 mb-1.5">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-indigo-300 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-indigo-400 fill-indigo-500/10" />
                    Генетик-Пасс (Сезон 1)
                  </h3>
                  <p className="text-[9px] text-neutral-400">Слияния и покупка фруктов приносят очки пасса</p>
                </div>
                {(() => {
                  const pLevel = Math.min(10, Math.floor(passPoints / 100));
                  return (
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 block font-mono">Уровень: <strong className="text-indigo-400 font-bold">{pLevel}/10</strong></span>
                      <span className="text-[9px] text-indigo-300 font-black font-mono">{passPoints} GP</span>
                    </div>
                  );
                })()}
              </div>

              {/* Progress Bar of Pass */}
              {(() => {
                const pLevel = Math.min(10, Math.floor(passPoints / 100));
                const progressPercent = pLevel === 10 ? 100 : (passPoints % 100);
                return (
                  <div className="bg-neutral-950/40 p-2 rounded-xl border border-neutral-800 flex flex-col gap-1 mb-1">
                    <div className="flex justify-between items-center text-[10px] text-neutral-400">
                      <span>Прогресс текущего уровня:</span>
                      <span className="font-mono text-indigo-350 font-bold">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden border border-neutral-800/60">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Tiers Scroll Area */}
              <div className="flex flex-col gap-1.5 h-[175px] overflow-y-auto pr-1">
                {PASS_TIERS.map(tier => {
                  const pLevel = Math.min(10, Math.floor(passPoints / 100));
                  const isUnlocked = pLevel >= tier.id;
                  const isClaimed = claimedRewards.includes(tier.id);

                  return (
                    <div 
                      key={tier.id}
                      className={`p-2 rounded-xl flex items-center justify-between border transition-all ${
                        isClaimed
                          ? 'bg-neutral-950/30 border-neutral-900/60 opacity-60'
                          : isUnlocked
                            ? 'bg-indigo-950/20 border-indigo-500/40 hover:bg-indigo-950/30 shadow-sm shadow-indigo-500/5'
                            : 'bg-neutral-950/65 border-neutral-850'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-mono ${
                          isClaimed
                            ? 'bg-neutral-900 text-neutral-500'
                            : isUnlocked
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse'
                              : 'bg-neutral-950 text-neutral-600 border border-neutral-850'
                        }`}>
                          {tier.id}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                            <span className="font-bold">{tier.rewardName}</span>
                            <span className="text-sm bg-neutral-950/50 px-1 rounded-sm">{tier.rewardIcon}</span>
                          </div>
                          <div className="text-[9px] text-neutral-400 mt-0.5 leading-tight">
                            {tier.rewardDesc}
                          </div>
                        </div>
                      </div>

                      {/* Claim or Lock Button */}
                      <div>
                        {isClaimed ? (
                          <span className="text-[10px] font-bold text-neutral-500 bg-neutral-950/50 border border-neutral-900/40 px-2.5 py-1.5 rounded-lg border-b border-transparent">
                            Получено ✓
                          </span>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => claimPassReward(tier)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg border-b-2 border-indigo-800 transition active:scale-95 animate-pulse"
                          >
                            Забрать
                          </button>
                        ) : (
                          <span className="text-[9px] font-bold text-neutral-500 bg-neutral-950/50 border border-neutral-850 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            Заблокировано
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {activeTab === 'upgrades' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-2">
                <h3 className="text-xs sm:text-sm font-bold text-neutral-300">Прогрессивные технологии фермерства</h3>
                <span className="text-[10px] text-amber-500">Инвестируйте для автоматизации</span>
              </div>

              <div className="flex flex-col gap-2 h-[200px] overflow-y-auto pr-1">
                {listUpgrades.map(u => {
                  const level = upgrades[u.key];
                  const isMax = u.max !== undefined && level >= u.max;
                  const nextCost = Math.round(u.baseCost * Math.pow(2.2, level));

                  return (
                    <div key={u.key} className="bg-neutral-950 border border-neutral-800/80 p-2.5 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-neutral-200">{u.name}</h4>
                          <span className="bg-amber-500/10 text-amber-400 font-mono text-[10px] px-2 py-0.2 rounded border border-amber-500/20">
                            LVL {level}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-1 leading-normal">{u.desc}</p>
                      </div>

                      <div className="flex flex-col items-center">
                        {isMax ? (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-900/60 px-3 py-1 rounded-lg">
                            MAX
                          </span>
                        ) : (
                          <button
                            onClick={() => buyUpgrade(u.key, u.baseCost)}
                            className="bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-xs px-3 py-2 rounded-lg border-b-2 border-amber-800 transition active:scale-95 whitespace-nowrap min-w-[70px]"
                          >
                            {nextCost} 🪙
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. SIMULATED LIVE AUCTION VIEWER */}
          {activeTab === 'auction' && (
            <div className="flex flex-col gap-2 min-h-[220px] justify-between">
              {auctionFruit ? (
                <>
                  <div className="grid grid-cols-12 gap-2 flex-1 h-full overflow-hidden max-h-[140px]">
                    
                    {/* Standing display */}
                    <div className="col-span-4 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col items-center justify-center p-2 relative">
                      <div className="absolute top-1 left-2 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-yellow-500" />
                        <span className="text-[10px] font-mono font-bold text-yellow-400">
                          {auctionTimer}c
                        </span>
                      </div>

                      <div className="mb-0.5 animate-pulse scale-90">
                        <FruitComponentIcon fruit={auctionFruit} size="md" />
                      </div>
                      <div className="text-[10px] font-bold text-center mt-1 text-neutral-300 truncate max-w-full">
                        {getFruitName(auctionFruit)}
                      </div>
                      <div className="text-[8px] text-neutral-500">База: {getFruitBaseValue(auctionFruit)} 🪙</div>
                    </div>

                    {/* Active bids feed */}
                    <div className="col-span-8 flex flex-col gap-1 overflow-y-auto h-full pr-1 max-h-[140px]">
                      {auctionBids.map((bid, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-1 rounded-lg flex items-start gap-1 border text-[9px] ${
                            index === 0 
                              ? 'bg-amber-950/65 border-amber-700/50 text-amber-100' 
                              : 'bg-neutral-950/40 border-neutral-800 text-neutral-400'
                          }`}
                        >
                          <span className="text-xs">{bid.avatar}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between font-bold">
                              <span className="truncate max-w-[90px]">{bid.bidder}</span>
                              <span className="text-amber-300 font-mono">{bid.bidAmount} 🪙</span>
                            </div>
                            <p className="text-[8px] mt-0.5 italic leading-tight text-neutral-400">{bid.phrase}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                  </div>

                  {/* Active VIP Sponsor Offer alert banner */}
                  {sponsorOffer && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gradient-to-r from-amber-600/20 to-yellow-500/10 border border-amber-500/40 p-2 rounded-xl flex items-start gap-2.5 shadow-md"
                    >
                      <span className="text-2xl animate-bounce mt-1">🐯</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                            🌟 Спонсорское Предложение!
                          </span>
                          <span className="bg-amber-400 text-neutral-950 font-mono px-1.5 py-0.2 rounded font-extrabold text-[10px]">
                            {sponsorOffer.amount} 🪙
                          </span>
                        </div>
                        <p className="text-[9px] mt-1 text-amber-100/80 leading-snug">
                          {sponsorOffer.bidder} шепчет: <span className="italic">«{sponsorOffer.phrase}»</span>
                        </p>
                        <button
                          onClick={handleAcceptSponsorOffer}
                          className="mt-1.5 w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 text-[10px] font-black py-1 px-3 rounded-lg border-b-2 border-amber-700 transition transform active:scale-95"
                        >
                          💸 ПРИНЯТЬ VIP СДЕЛКУ (+{sponsorOffer.amount} 🪙)
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Accept / Decline controls */}
                  <div className="flex gap-2 border-t border-neutral-800/80 pt-2 mt-1">
                    <button
                      onClick={handleCancelAuction}
                      className="flex-1 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 py-1.5 rounded-lg text-[11px] font-bold text-neutral-400 flex items-center justify-center gap-1 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Отклонить</span>
                    </button>
                    <button
                      onClick={handleAcceptAuctionBid}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-neutral-950 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 border-b-2 border-yellow-700 shadow-md transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Обычная продажа: {auctionBids[0]?.bidAmount || 0} 🪙</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 flex-1 bg-neutral-950/40 rounded-xl border border-dashed border-neutral-800">
                  <Gavel className="w-8 h-8 text-neutral-600 mb-2" />
                  <h4 className="text-xs font-bold text-neutral-300">Аукционный стенд пуст</h4>
                  <p className="text-[10px] text-neutral-500 max-w-[240px] mt-1 leading-normal">
                    Выберите фрукт на игровом поле и нажмите кнопку <strong>«Аукцион»</strong> в панели сверху, чтобы привлечь богатых покупателей!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 4. ORDERS VIEW PANEL */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-1 mb-1">
                <h3 className="text-xs sm:text-sm font-bold text-neutral-300">Доска текущих заказов</h3>
                <button 
                  onClick={generateFreshOrders}
                  className="text-[9px] text-neutral-500 hover:text-neutral-300 flex items-center gap-1"
                >
                  Обновить списки 🔄
                </button>
              </div>

              <div className="flex flex-col gap-2 h-[190px] overflow-y-auto pr-1">
                {orders.map(order => {
                  const hasAll = checkHasCrops(order.requiredFruits);

                  return (
                    <div 
                      key={order.id} 
                      className={`p-2 rounded-xl flex items-center justify-between gap-3 border ${
                        hasAll 
                          ? 'bg-emerald-950/20 border-emerald-500/30' 
                          : 'bg-neutral-950 border-neutral-800/80'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <span>{order.avatar}</span>
                          <span>{order.client}</span>
                          <span className="text-[9px] text-neutral-500 font-normal ml-1">просит плоды:</span>
                        </div>

                        {/* List desired fruits indicators */}
                        <div className="flex gap-2.5 mt-1.5">
                          {order.requiredFruits.map((item, index) => {
                            const desc = FRUITS[item.level - 1];
                            return (
                              <div key={index} className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-lg text-[10px]">
                                <span className="text-base">{desc?.emoji}</span>
                                <span className="font-bold text-neutral-200">
                                  {desc?.name_ru} × {item.qty}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        
                        <p className="text-[8px] text-neutral-500 italic mt-1 leading-none">{order.phrase}</p>
                      </div>

                      <div className="flex flex-col items-end justify-center min-w-[80px]">
                        <span className="text-[10px] text-amber-300 font-mono font-bold mb-1">+{order.reward} 🪙</span>
                        <button
                          onClick={() => handleDeliverOrder(order)}
                          className={`w-full py-1.5 px-2.5 rounded-lg text-[10px] sm:text-xs font-extrabold flex items-center justify-center gap-1 transition ${
                            hasAll 
                              ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 border-b-2 border-emerald-700 active:scale-95' 
                              : 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed'
                          }`}
                          disabled={!hasAll}
                        >
                          <Truck className="w-3 h-3" />
                          <span>Сдать</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. MINIMAL GUIDE */}
          {activeTab === 'guide' && (
            <div className="flex flex-col gap-2 min-h-[220px] max-h-[320px] text-neutral-300 text-xs leading-normal">
              
              <div className="flex gap-2 border-b border-neutral-800 pb-2 mb-1">
                <button
                  onClick={() => setGuideSubTab('achievements')}
                  className={`flex-1 py-1 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    guideSubTab === 'achievements'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                      : 'bg-neutral-900 border border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Достижения ({claimedAchievements.length}/{ACHIEVEMENTS.length})</span>
                </button>
                <button
                  onClick={() => setGuideSubTab('rules')}
                  className={`flex-1 py-1 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    guideSubTab === 'rules'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-neutral-900 border border-neutral-800/80 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Инструкции 📖</span>
                </button>
              </div>

              {guideSubTab === 'rules' && (
                <div className="flex flex-col gap-2 h-[180px] overflow-y-auto text-neutral-300 pr-1 text-xs leading-normal">
                  <h3 className="font-bold text-xs sm:text-sm text-neutral-100 flex items-center gap-1 border-b border-neutral-800 pb-1 mb-1">
                    <Info className="w-4 h-4 text-emerald-400" />
                    Правила игры: Как скрещивать фрукты
                  </h3>
                  
                  <ul className="list-disc list-inside flex flex-col gap-1 text-[11px] text-neutral-400 mt-1">
                    <li>
                      <strong className="text-neutral-200">Генетическое скрещивание:</strong> Объединяйте любые фрукты! Слияние двух плодов (даже разного вида!) создаёт восхитительный гибридный плод (например, Банановое Яблоко) с новой внешностью и повышенной стоимостью.
                    </li>
                    <li>
                      <strong className="text-neutral-200">Эволюция и цвета:</strong> Следите за переливом ауры и эмодзи фруктов (🍒 → 🍓 → 🍇 → 🍋 → 🍊 → 🍎 → 🍑...). Чем сложнее генетический профиль плода, тем больше его пассивный и активный доход!
                    </li>
                    <li>
                      <strong className="text-neutral-200">Магазин семян:</strong> Приобретайте семена любых ранее открытых сортов фруктов, чтобы ускорить селекцию плодов.
                    </li>
                    <li>
                      <strong className="text-neutral-200">Аукцион:</strong> Хотите заработать состояние? Выберите фрукт на поле, нажмите кнопку «Аукцион» и продайте его клиенту с максимальной наценкой!
                    </li>
                    <li>
                      <strong className="text-neutral-200">Доставка заказов:</strong> Сдавайте наборы редких фруктов лесным жителям и получайте щедрые бонусы со спеластями.
                    </li>
                    <li>
                      <strong className="text-neutral-200">Улучшения:</strong> Открывайте автоматические боты-слиятели, повышайте прибыль и увеличивайте шанс генетических мутаций плодов.
                    </li>
                  </ul>
                  
                  <div className="bg-neutral-950 border border-neutral-800 text-[10px] rounded-lg p-2 text-neutral-500 mt-2">
                    * Ваша игра автоматически сохраняется на вашем устройстве в фоновом режиме.
                  </div>
                </div>
              )}

              {guideSubTab === 'achievements' && (
                <div className="flex flex-col gap-2 h-[180px] overflow-y-auto pr-1">
                  {ACHIEVEMENTS.map(ach => {
                    let currentVal = 0;
                    if (ach.targetType === 'merges') currentVal = totalMerges;
                    else if (ach.targetType === 'orders') currentVal = completedOrdersCount;
                    else if (ach.targetType === 'auctions') currentVal = completedAuctionsCount;
                    else if (ach.targetType === 'coinsSpent') currentVal = totalCoinsSpent;
                    else if (ach.targetType === 'rebirths') currentVal = rebirths;
                    else if (ach.targetType === 'level') currentVal = maxUnlockedLevel;

                    const pct = Math.min(100, Math.round((currentVal / ach.targetValue) * 100));
                    const isCompleted = currentVal >= ach.targetValue;
                    const isClaimed = claimedAchievements.includes(ach.id);

                    return (
                      <div 
                        key={ach.id}
                        className={`p-2 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 transition ${
                          isClaimed
                            ? 'bg-neutral-950/40 border-neutral-850 opacity-75'
                            : isCompleted
                              ? 'bg-amber-950/20 border-amber-500/30'
                              : 'bg-neutral-950 border-neutral-800/80'
                        }`}
                      >
                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-lg bg-neutral-900 p-1 rounded-lg border border-neutral-800">{ach.badge}</span>
                            <div className="flex flex-col">
                              <span className={`text-[10px] sm:text-[11px] font-bold ${isClaimed ? 'text-neutral-400 font-normal line-through' : 'text-neutral-200'}`}>
                                {ach.title}
                              </span>
                              <span className="text-[9px] text-neutral-500 leading-tight">
                                {ach.description}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-1.5 w-full">
                            <div className="flex-1 bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-800">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  isClaimed 
                                    ? 'bg-neutral-600' 
                                    : isCompleted 
                                      ? 'bg-amber-500' 
                                      : 'bg-emerald-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[8px] font-mono font-bold text-neutral-450 whitespace-nowrap">
                              {currentVal} / {ach.targetValue} ({pct}%)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 border-neutral-900 pt-1 sm:pt-0 sm:pl-2">
                          <div className="flex flex-col items-start sm:items-end text-[9px] font-mono leading-tight">
                            <span className="text-amber-400 font-bold">+{ach.rewardCoins} 🪙</span>
                            <span className="text-emerald-400 font-bold">+{ach.rewardXp} XP</span>
                          </div>

                          <button
                            onClick={() => claimAchievement(ach)}
                            disabled={isClaimed || !isCompleted}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-0.5 shrink-0 ${
                              isClaimed
                                ? 'bg-neutral-900 text-neutral-500 cursor-default'
                                : isCompleted
                                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold cursor-pointer active:scale-95'
                                  : 'bg-neutral-900 text-neutral-400 cursor-default border border-neutral-800'
                            }`}
                          >
                            {isClaimed ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Сдано</span>
                              </>
                            ) : isCompleted ? (
                              <>
                                <Sparkles className="w-3 h-3 text-amber-950 animate-bounce" />
                                <span className="animate-pulse">Забрать</span>
                              </>
                            ) : (
                              <span>В процессе</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 6. REBIRTH SYSTEM VIEW */}
          {activeTab === 'rebirth' && (
            <div className="flex flex-col gap-3 min-h-[220px]">
              <div className="flex items-center justify-between border-b border-purple-900/50 pb-2 mb-1">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-purple-300 flex items-center gap-1.5 animate-pulse">
                    <RefreshCw className="w-4 h-4 text-purple-400" />
                    Космическая Лаборатория: Перерождение
                  </h3>
                  <p className="text-[9px] text-neutral-400">Перестройте генетическую структуру для квантового скачка прибыли</p>
                </div>
              </div>

              <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80 grid grid-cols-2 gap-3 items-center">
                <div className="flex flex-col gap-1 text-center justify-center p-2 rounded-lg bg-neutral-900 border border-neutral-800/60 shadow">
                  <div className="text-[10px] text-neutral-400 uppercase font-black text-neutral-400">Генетический уровень</div>
                  <div className="text-sm font-extrabold text-purple-400">уровень {rebirths}</div>
                  <div className="text-[10px] text-purple-300">+{rebirths * 150}% к доходам 🚀</div>
                </div>

                <div className="text-center flex flex-col items-center justify-center">
                  <div className="flex justify-center mb-1">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg shadow-purple-900/40 animate-spin-slow">
                      🌀
                    </div>
                  </div>
                  <div className="text-[9px] text-neutral-400 leading-tight">Польза перерождения:</div>
                  <div className="text-xs font-black text-emerald-400">+150% к цене на плоды навсегда</div>
                </div>
              </div>

              {/* Reset warning panels */}
              {!showRebirthConfirm ? (
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] bg-red-900/10 text-red-400 p-2.5 rounded-xl border border-red-900/30 leading-relaxed">
                    <strong>⚠️ Внимание:</strong> Перерождение сбросит текущие слияния до 1-го уровня, очистит поле и сбросит авто-слияния. Половина монет (вы сохраните <strong>{Math.floor(coins / 2)} 🪙</strong>) перейдёт для нового старта.
                  </div>

                  <button
                    onClick={() => setShowRebirthConfirm(true)}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs py-2.5 rounded-xl border-b-2 border-purple-800 hover:shadow-lg hover:shadow-purple-500/10 transition transform active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                    Совершить Перерождение 🌀
                  </button>
                </div>
              ) : (
                <div className="bg-red-950/25 rounded-xl p-3 border border-red-900/50 flex flex-col gap-2 animate-fade-in">
                  <div className="text-center text-xs font-bold text-red-300">
                    🌌 Вы уверены на 100%? Это действие необратимо!
                  </div>
                  <p className="text-[10px] text-center text-neutral-400 leading-tight">
                    Ваша прибыль вырастет до <strong>+{ (rebirths + 1) * 150 }%</strong>. Все улучшения сбросятся. Будет сохранено {Math.floor(coins / 2)} 🪙.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      onClick={performRebirth}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-heavy text-xs py-2 px-3 rounded-lg border-b-2 border-emerald-850 active:scale-95 transition"
                    >
                      Да, переродиться! 🛸
                    </button>
                    <button
                      onClick={() => setShowRebirthConfirm(false)}
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-heavy text-xs py-2 px-3 rounded-lg border-b-2 border-neutral-900 active:scale-95 transition"
                    >
                      Отмена ❌
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Global particles render */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="relative w-full h-full max-w-lg mx-auto">
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ 
                x: `${p.startX}%`, 
                y: `${p.startY}%`, 
                scale: 0.2, 
                opacity: 1, 
                rotate: 0 
              }}
              animate={{ 
                x: `${p.startX + p.vx * 15}%`, 
                y: `${p.startY + p.vy * 15}%`, 
                scale: [p.scale || 1, (p.scale || 1) * 1.4, 0.2],
                opacity: [1, 0.9, 0],
                rotate: p.rotation
              }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute pointer-events-none z-50 text-2xl font-bold select-none drop-shadow-lg"
            >
              {p.content}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Settings Modal overlay */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-5 shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setShowSettings(false);
                  setShowResetConfirm(false);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition duration-150"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-amber-400 animate-spin-slow" />
                <h3 className="text-base font-extrabold text-neutral-100">Игровые Настройки</h3>
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-neutral-950/60 rounded-2xl p-3 border border-neutral-800/80 leading-relaxed text-[11px] text-neutral-400">
                  <span className="font-bold text-neutral-300 block mb-1">ℹ️ Описание</span>
                  <span className="text-neutral-300 font-medium">🧬 Фруктовая Эволюция</span> — это увлекательная игра-симулятор слияния плодов, гибридизации генов, выполнения ценных лесных контрактов доставки, спекуляции на птичьих аукционах и квантовых биоэнергетических космических перерождений.
                </div>

                <div className="bg-neutral-950/60 rounded-2xl p-3 border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
                  <div className="font-bold text-neutral-300">📊 Текущая генетика:</div>
                  <div>• Кол-во перерождений: <strong className="text-purple-400">{rebirths}</strong></div>
                  <div>• Рекорд уровня слияния: <strong className="text-emerald-400">L{maxUnlockedLevel}</strong></div>
                  <div>• Баланс: <strong className="text-amber-300">{coins.toLocaleString()} 🪙</strong></div>
                </div>

                <div className="border-t border-neutral-800/90 pt-3">
                  <span className="text-xs font-bold text-red-400 block mb-2">Опасная зона</span>
                  
                  {!showResetConfirm ? (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="w-full bg-red-950/30 hover:bg-red-900/30 text-red-400 font-bold text-xs py-2.5 px-3 rounded-xl border border-red-900/30 hover:border-red-800/60 transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Сбросить текущий прогресс
                    </button>
                  ) : (
                    <div className="bg-red-950/25 rounded-2xl p-3 border border-red-900/40 flex flex-col gap-2">
                      <div className="text-[10px] font-black text-red-300 text-center leading-normal">
                        🚨 ВНИМАНИЕ! Вы полностью сотрете свои монеты, открытые сорта, пассы, улучшения и счётчик ({rebirths}) перерождений навсегда.
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          onClick={handleResetProgress}
                          className="bg-red-650 hover:bg-red-500 text-white font-heavy text-xs py-2 px-3 rounded-xl hover:shadow-lg active:scale-95 transition"
                        >
                          Да, стереть! 🌋
                        </button>
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-heavy text-xs py-2 px-3 rounded-xl active:scale-95 transition"
                        >
                          Отмена ❌
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
