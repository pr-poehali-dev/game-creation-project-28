import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const MAP_IMAGE = "https://cdn.poehali.dev/projects/1539c1d4-6e84-461e-9378-b569ba8a0983/files/327830ca-d9f6-40bd-8a6d-85055010e137.jpg";

// Типы шахт
type MineResource = "gold" | "food" | "wood" | "iron";
type MineOwner = "neutral" | "player" | "enemy";

interface Mine {
  id: string;
  label: string;
  x: number;
  y: number;
  resource: MineResource;
  emoji: string;
  ratePerSec: number; // ресурсов в секунду
  owner: MineOwner;
  garrison: number; // войска-защитники
  level: number;
}

const MINE_CONFIG: Record<MineResource, { color: string; bgColor: string; label: string }> = {
  gold: { color: "#c9a227", bgColor: "rgba(201,162,39,0.25)", label: "Золото" },
  food: { color: "#7eb87e", bgColor: "rgba(126,184,126,0.25)", label: "Пища" },
  wood: { color: "#a07840", bgColor: "rgba(160,120,64,0.25)", label: "Дерево" },
  iron: { color: "#8090b0", bgColor: "rgba(128,144,176,0.25)", label: "Железо" },
};

const INITIAL_MINES: Mine[] = [
  { id: "m1", label: "Золотые копи", x: 80, y: 55, resource: "gold", emoji: "🪙", ratePerSec: 8, owner: "neutral", garrison: 120, level: 3 },
  { id: "m2", label: "Лесопилка", x: 15, y: 38, resource: "wood", emoji: "🪵", ratePerSec: 5, owner: "enemy", garrison: 80, level: 2 },
  { id: "m3", label: "Фермерские угодья", x: 55, y: 22, resource: "food", emoji: "🌾", ratePerSec: 10, owner: "neutral", garrison: 60, level: 2 },
  { id: "m4", label: "Железные рудники", x: 28, y: 80, resource: "iron", emoji: "⚙️", ratePerSec: 4, owner: "enemy", garrison: 150, level: 4 },
  { id: "m5", label: "Серебряный прииск", x: 68, y: 14, resource: "gold", emoji: "🪙", ratePerSec: 6, owner: "neutral", garrison: 90, level: 2 },
  { id: "m6", label: "Каменоломня", x: 88, y: 78, resource: "iron", emoji: "⚙️", ratePerSec: 3, owner: "neutral", garrison: 50, level: 1 },
  { id: "m7", label: "Зерновые поля", x: 10, y: 60, resource: "food", emoji: "🌾", ratePerSec: 7, owner: "player", garrison: 40, level: 2 },
  { id: "m8", label: "Дубовый бор", x: 42, y: 72, resource: "wood", emoji: "🪵", ratePerSec: 4, owner: "neutral", garrison: 70, level: 2 },
];

const STATIC_MARKERS = [
  { id: "player", type: "castle", label: "Ваша крепость", x: 48, y: 52, emoji: "🏰" },
  { id: "enemy1", type: "enemy", label: "Орда Карра", x: 72, y: 30, emoji: "⚔️" },
  { id: "enemy2", type: "enemy", label: "Клан Волка", x: 22, y: 68, emoji: "⚔️" },
  { id: "ally1", type: "ally", label: "Альянс Рассвета", x: 35, y: 25, emoji: "🛡️" },
];

const TROOPS = [
  { name: "Мечники", count: 1240, icon: "⚔️", color: "#c9a227", trained: 85 },
  { name: "Лучники", count: 780, icon: "🏹", color: "#7eb87e", trained: 60 },
  { name: "Всадники", count: 320, icon: "🐴", color: "#7090c0", trained: 45 },
  { name: "Осадные орудия", count: 12, icon: "🏹", color: "#c06040", trained: 20 },
];

const BUILDINGS = [
  { name: "Тронный зал", level: 7, emoji: "🏛️", upgrade: 80 },
  { name: "Казармы", level: 5, emoji: "⚔️", upgrade: 55 },
  { name: "Зернохранилище", level: 6, emoji: "🌾", upgrade: 90 },
  { name: "Кузница", level: 4, emoji: "🔨", upgrade: 30 },
  { name: "Стены", level: 8, emoji: "🏰", upgrade: 70 },
  { name: "Рынок", level: 3, emoji: "🛒", upgrade: 15 },
];

const GUILD_MEMBERS = [
  { name: "КнязьВладимир", power: 145000, rank: "Воевода", online: true },
  { name: "ЧерноеСолнце", power: 98000, rank: "Витязь", online: true },
  { name: "СталинаяРука", power: 87500, rank: "Витязь", online: false },
  { name: "ЗолотойОрёл", power: 76000, rank: "Дружинник", online: true },
  { name: "БелыйМедведь", power: 64000, rank: "Дружинник", online: false },
];

type Tab = "карта" | "армия" | "постройки" | "гильдия";

interface AttackState {
  mineId: string;
  troops: number;
  progress: number; // 0-100
  active: boolean;
}

interface FloatingNumber {
  id: number;
  emoji: string;
  value: number;
  x: number;
  y: number;
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("карта");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resources, setResources] = useState({ gold: 48320, food: 31500, wood: 22800, iron: 9640 });
  const [mines, setMines] = useState<Mine[]>(INITIAL_MINES);
  const [attack, setAttack] = useState<AttackState | null>(null);
  const [sendTroops, setSendTroops] = useState(200);
  const [events, setEvents] = useState([
    { time: "00:02", text: "Альянс Рассвета атаковал Клан Волка", type: "war" },
    { time: "00:08", text: "Орда Карра захватила золотые копи", type: "alert" },
    { time: "00:15", text: "КнязьВладимир построил Стены ур.8", type: "info" },
  ]);
  const [floatingNums, setFloatingNums] = useState<FloatingNumber[]>([]);
  const [showGuildCreate, setShowGuildCreate] = useState(false);
  const [power] = useState(124500);
  const floatIdRef = useRef(0);

  // Добыча ресурсов от захваченных шахт
  useEffect(() => {
    const interval = setInterval(() => {
      const playerMines = mines.filter(m => m.owner === "player");
      if (playerMines.length === 0) return;

      const gained = { gold: 0, food: 0, wood: 0, iron: 0 };
      playerMines.forEach(m => {
        gained[m.resource] += m.ratePerSec * 2; // тик каждые 2 сек
      });

      setResources(r => ({
        gold: r.gold + gained.gold,
        food: r.food + gained.food,
        wood: r.wood + gained.wood,
        iron: r.iron + gained.iron,
      }));

      // Плавающие числа над шахтами игрока
      playerMines.forEach(m => {
        const cfg = MINE_CONFIG[m.resource];
        const id = ++floatIdRef.current;
        setFloatingNums(prev => [...prev, {
          id,
          emoji: m.emoji,
          value: m.ratePerSec * 2,
          x: m.x,
          y: m.y,
        }]);
        setTimeout(() => {
          setFloatingNums(prev => prev.filter(f => f.id !== id));
        }, 1400);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [mines]);

  // Прогресс атаки
  useEffect(() => {
    if (!attack?.active) return;
    const interval = setInterval(() => {
      setAttack(prev => {
        if (!prev) return null;
        const next = prev.progress + 10;
        if (next >= 100) {
          // Атака завершена
          const mine = mines.find(m => m.id === prev.mineId)!;
          const success = prev.troops > mine.garrison * 0.6;
          if (success) {
            setMines(ms => ms.map(m => m.id === prev.mineId ? { ...m, owner: "player", garrison: Math.floor(prev.troops * 0.7) } : m));
            const cfg = MINE_CONFIG[mine.resource];
            setEvents(ev => [{
              time: "сейчас",
              text: `✅ Вы захватили «${mine.label}»! +${mine.ratePerSec}/сек ${cfg.label.toLowerCase()}`,
              type: "info"
            }, ...ev.slice(0, 9)]);
          } else {
            setEvents(ev => [{
              time: "сейчас",
              text: `❌ Атака на «${mine.label}» отбита — слишком мало войск`,
              type: "war"
            }, ...ev.slice(0, 9)]);
          }
          return null;
        }
        return { ...prev, progress: next };
      });
    }, 300);
    return () => clearInterval(interval);
  }, [attack?.active, mines]);

  const selectedMine = mines.find(m => m.id === selectedId);
  const selectedStatic = STATIC_MARKERS.find(m => m.id === selectedId);

  const startAttack = (mineId: string) => {
    setAttack({ mineId, troops: sendTroops, progress: 0, active: true });
    setSelectedId(null);
  };

  const playerMines = mines.filter(m => m.owner === "player");
  const totalRates = { gold: 0, food: 0, wood: 0, iron: 0 };
  playerMines.forEach(m => { totalRates[m.resource] += m.ratePerSec; });

  return (
    <div className="min-h-screen bg-[#12100e] text-[hsl(42,40%,88%)] flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
      
      {/* Top Bar */}
      <div className="panel-bg border-b border-[rgba(201,162,39,0.2)] px-3 py-2 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[hsl(43,74%,54%)] text-xl">⚜</span>
            <div>
              <div className="font-cinzel text-sm font-bold gold-text tracking-widest">IMPERIUM</div>
              <div className="text-[10px] text-[hsl(42,20%,50%)] tracking-wider uppercase font-cinzel">Великая Держава</div>
            </div>
          </div>
          <div className="w-px h-8 bg-[rgba(201,162,39,0.2)] mx-1" />
          <div className="text-[hsl(43,74%,54%)] text-xs font-cinzel flex items-center gap-1">
            <Icon name="Zap" size={12} />
            <span className="font-bold">{power.toLocaleString()}</span>
            <span className="text-[hsl(42,20%,50%)]">мощь</span>
          </div>
        </div>

        {/* Resources */}
        <div className="hidden md:flex items-center gap-1">
          {([
            { emoji: "🪙", value: resources.gold, rate: totalRates.gold, label: "Золото" },
            { emoji: "🌾", value: resources.food, rate: totalRates.food, label: "Пища" },
            { emoji: "🪵", value: resources.wood, rate: totalRates.wood, label: "Дерево" },
            { emoji: "⚙️", value: resources.iron, rate: totalRates.iron, label: "Железо" },
          ]).map(r => (
            <div key={r.label} className="resource-chip text-xs flex-col !items-start gap-0 py-1">
              <div className="flex items-center gap-1">
                <span>{r.emoji}</span>
                <span className="text-[hsl(43,74%,64%)] font-bold">{r.value.toLocaleString()}</span>
              </div>
              {r.rate > 0 && (
                <div className="text-[9px] text-green-400 font-cinzel">+{r.rate}/сек</div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button className="btn-dark px-3 py-1.5 text-xs rounded flex items-center gap-1.5">
              <Icon name="Bell" size={12} />
              <span className="hidden sm:inline font-cinzel">События</span>
            </button>
            <div className="notification-dot absolute -top-1 -right-1" />
          </div>
          <button className="btn-dark px-3 py-1.5 text-xs rounded flex items-center gap-1.5">
            <span className="text-sm">👤</span>
            <span className="hidden sm:inline font-cinzel">Профиль</span>
          </button>
        </div>
      </div>

      {/* Mobile Resources */}
      <div className="md:hidden panel-bg border-b border-[rgba(201,162,39,0.15)] px-2 py-1.5 flex gap-1 overflow-x-auto z-20 flex-shrink-0">
        {([
          { emoji: "🪙", value: resources.gold, rate: totalRates.gold },
          { emoji: "🌾", value: resources.food, rate: totalRates.food },
          { emoji: "🪵", value: resources.wood, rate: totalRates.wood },
          { emoji: "⚙️", value: resources.iron, rate: totalRates.iron },
        ]).map((r, i) => (
          <div key={i} className="resource-chip text-[11px] flex-shrink-0 flex-col !items-start gap-0 py-1">
            <div className="flex items-center gap-1">
              <span>{r.emoji}</span>
              <span className="text-[hsl(43,74%,64%)] font-bold">{r.value.toLocaleString()}</span>
            </div>
            {r.rate > 0 && <div className="text-[9px] text-green-400">+{r.rate}/с</div>}
          </div>
        ))}
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar — Nav */}
        <div className="hidden lg:flex flex-col w-16 panel-bg border-r border-[rgba(201,162,39,0.15)] items-center py-4 gap-3 flex-shrink-0 z-10">
          {(["карта", "армия", "постройки", "гильдия"] as Tab[]).map((tab) => {
            const emojis: Record<Tab, string> = { карта: "🗺️", армия: "⚔️", постройки: "🏰", гильдия: "🛡️" };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-10 h-10 flex flex-col items-center justify-center gap-0.5 rounded transition-all ${
                  activeTab === tab
                    ? "bg-[rgba(201,162,39,0.15)] border border-[rgba(201,162,39,0.4)]"
                    : "hover:bg-[rgba(201,162,39,0.06)] border border-transparent"
                }`}
                title={tab}
              >
                <span className="text-base">{emojis[tab]}</span>
                <span className={`text-[9px] font-cinzel uppercase tracking-wide ${activeTab === tab ? "text-[hsl(43,74%,64%)]" : "text-[hsl(42,20%,50%)]"}`}>
                  {tab.slice(0, 3)}
                </span>
              </button>
            );
          })}
          <div className="flex-1" />
          <button className="w-10 h-10 flex flex-col items-center justify-center gap-0.5 rounded hover:bg-[rgba(201,162,39,0.06)] border border-transparent transition-all">
            <span className="text-base">⚙️</span>
            <span className="text-[9px] font-cinzel uppercase tracking-wide text-[hsl(42,20%,50%)]">нас</span>
          </button>
        </div>

        {/* Center — Main Content */}
        <div className="flex-1 relative overflow-hidden">

          {/* MAP TAB */}
          {activeTab === "карта" && (
            <div className="h-full flex flex-col">
              <div className="flex-1 relative map-container">
                <img
                  src={MAP_IMAGE}
                  alt="Карта мира"
                  className="w-full h-full object-cover"
                  draggable={false}
                />

                {/* Static markers (castle, enemies, allies) */}
                {STATIC_MARKERS.map(m => (
                  <div
                    key={m.id}
                    className="map-marker"
                    style={{ left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%, -50%)" }}
                    onClick={() => setSelectedId(selectedId === m.id ? null : m.id)}
                  >
                    <div className={
                      m.type === "castle" ? "map-marker-castle pulse-gold" :
                      m.type === "enemy" ? "map-marker-enemy" : "map-marker-ally"
                    }>
                      {m.emoji}
                    </div>
                    {selectedId === m.id && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 panel-bg px-3 py-2 rounded min-w-[130px] text-center z-20 animate-fade-in">
                        <div className="text-[hsl(43,74%,64%)] text-xs font-cinzel font-bold">{m.label}</div>
                        <div className="text-[10px] text-[hsl(42,20%,55%)] mt-0.5">
                          {m.type === "castle" ? "Ваша крепость" : m.type === "enemy" ? "Враг" : "Союзник"}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Mine markers */}
                {mines.map(m => {
                  const cfg = MINE_CONFIG[m.resource];
                  const isSelected = selectedId === m.id;
                  const isAttacking = attack?.mineId === m.id && attack.active;
                  return (
                    <div
                      key={m.id}
                      className="map-marker"
                      style={{ left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%, -50%)" }}
                      onClick={() => !isAttacking && setSelectedId(isSelected ? null : m.id)}
                    >
                      {/* Mine icon */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-base border-2 transition-all"
                        style={{
                          background: m.owner === "player"
                            ? `radial-gradient(circle, ${cfg.bgColor}, rgba(0,0,0,0.5))`
                            : m.owner === "enemy"
                            ? "radial-gradient(circle, rgba(160,30,20,0.5), rgba(0,0,0,0.5))"
                            : "radial-gradient(circle, rgba(80,70,50,0.6), rgba(0,0,0,0.5))",
                          borderColor: m.owner === "player" ? cfg.color : m.owner === "enemy" ? "#b02020" : "#604830",
                          boxShadow: m.owner === "player" ? `0 0 12px ${cfg.color}60` : "none",
                        }}
                      >
                        {m.emoji}
                      </div>

                      {/* Owner indicator dot */}
                      <div
                        className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border border-[#12100e]"
                        style={{
                          background: m.owner === "player" ? "#22c55e" : m.owner === "enemy" ? "#ef4444" : "#888",
                        }}
                      />

                      {/* Attack progress ring */}
                      {isAttacking && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(201,162,39,0.2)" strokeWidth="2" />
                          <circle
                            cx="18" cy="18" r="16" fill="none"
                            stroke="#c9a227" strokeWidth="2"
                            strokeDasharray={`${attack.progress} 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                      )}

                      {/* Popup */}
                      {isSelected && !isAttacking && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 panel-bg px-3 py-2.5 rounded min-w-[170px] z-20 animate-fade-in" onClick={e => e.stopPropagation()}>
                          <div className="font-cinzel text-xs font-bold mb-0.5" style={{ color: cfg.color }}>{m.label}</div>
                          <div className="text-[10px] text-[hsl(42,20%,55%)] mb-1.5">
                            Ур.{m.level} · {cfg.label} · +{m.ratePerSec}/сек
                          </div>

                          <div className="flex items-center justify-between text-[10px] mb-2">
                            <span className="text-[hsl(42,20%,55%)]">Защитников:</span>
                            <span className="font-cinzel font-bold" style={{ color: m.owner === "enemy" ? "#ef4444" : m.owner === "player" ? "#22c55e" : "#aaa" }}>
                              {m.garrison} воинов
                            </span>
                          </div>

                          <div className="text-[10px] font-cinzel text-[hsl(42,20%,50%)] uppercase tracking-wider mb-1">
                            {m.owner === "player" ? "✅ Ваша шахта" : m.owner === "enemy" ? "⚔️ Враг владеет" : "○ Нейтральная"}
                          </div>

                          {m.owner !== "player" && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-[hsl(42,20%,55%)]">Отправить войска:</span>
                                <span className="text-[hsl(43,74%,54%)] text-[11px] font-bold font-cinzel">{sendTroops}</span>
                              </div>
                              <input
                                type="range"
                                min={50} max={500} step={10}
                                value={sendTroops}
                                onChange={e => setSendTroops(Number(e.target.value))}
                                className="w-full mb-2 accent-[#c9a227]"
                                onClick={e => e.stopPropagation()}
                              />
                              {sendTroops < m.garrison * 0.6 && (
                                <div className="text-[9px] text-red-400 mb-1.5 font-cinzel">
                                  ⚠ Мало войск — нужно ≥{Math.ceil(m.garrison * 0.6)}
                                </div>
                              )}
                              <button
                                className="btn-gold w-full py-1.5 text-[11px] rounded font-cinzel"
                                onClick={() => startAttack(m.id)}
                              >
                                ⚔️ Захватить
                              </button>
                            </div>
                          )}
                          {m.owner === "player" && (
                            <div className="mt-1.5 text-center text-[10px] text-green-400">
                              Добыча идёт · +{m.ratePerSec} {m.emoji}/сек
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Floating resource numbers */}
                {floatingNums.map(f => (
                  <div
                    key={f.id}
                    className="pointer-events-none absolute z-30 font-cinzel text-xs font-bold text-green-400"
                    style={{
                      left: `${f.x}%`,
                      top: `${f.y}%`,
                      transform: "translate(-50%, -100%)",
                      animation: "float-up 1.4s ease-out forwards",
                    }}
                  >
                    +{f.value} {f.emoji}
                  </div>
                ))}

                {/* Map controls */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
                  <button className="btn-dark w-8 h-8 rounded flex items-center justify-center text-sm font-bold">+</button>
                  <button className="btn-dark w-8 h-8 rounded flex items-center justify-center text-sm font-bold">−</button>
                  <div className="divider-gold my-0.5" />
                  <button className="btn-dark w-8 h-8 rounded flex items-center justify-center text-sm">🏠</button>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 z-10 panel-bg px-3 py-2 rounded">
                  <div className="text-[9px] font-cinzel text-[hsl(42,20%,50%)] uppercase tracking-wider mb-1.5">Легенда</div>
                  {[
                    { color: "#c9a227", label: "Ваша крепость" },
                    { color: "#22c55e", label: "Ваши шахты" },
                    { color: "#ef4444", label: "Вражеские" },
                    { color: "#888", label: "Нейтральные" },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5 text-[10px] mb-0.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                      <span className="text-[hsl(42,30%,65%)]">{l.label}</span>
                    </div>
                  ))}
                </div>

                {/* Mine count badge */}
                <div className="absolute top-4 left-4 z-10 panel-bg px-3 py-2 rounded">
                  <div className="text-[9px] font-cinzel text-[hsl(42,20%,50%)] uppercase tracking-wider mb-1">Ваши шахты</div>
                  <div className="text-[hsl(43,74%,54%)] font-cinzel font-bold text-sm">{playerMines.length} / {mines.length}</div>
                  {Object.entries(totalRates).filter(([, v]) => v > 0).map(([res, rate]) => {
                    const cfg = MINE_CONFIG[res as MineResource];
                    return (
                      <div key={res} className="text-[10px] text-green-400">
                        +{rate}/сек {cfg.label.toLowerCase()}
                      </div>
                    );
                  })}
                  {playerMines.length === 0 && (
                    <div className="text-[10px] text-[hsl(42,20%,50%)]">Захватите шахты!</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ARMY TAB */}
          {activeTab === "армия" && (
            <div className="h-full overflow-y-auto p-4">
              <div className="max-w-2xl mx-auto">
                <h2 className="font-cinzel text-xl font-bold gold-text mb-1 glow-gold">Армия Державы</h2>
                <div className="divider-gold mb-4" />
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "Общая сила", value: "2 352", emoji: "⚔️" },
                    { label: "На марше", value: "480", emoji: "🚶" },
                    { label: "В обороне", value: "1 872", emoji: "🛡️" },
                  ].map((s, i) => (
                    <div key={s.label} className="panel-bg rounded p-3 text-center animate-fade-in" style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
                      <div className="text-2xl mb-1">{s.emoji}</div>
                      <div className="font-cinzel text-lg font-bold text-[hsl(43,74%,64%)]">{s.value}</div>
                      <div className="text-[10px] text-[hsl(42,20%,55%)] uppercase tracking-wide">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="font-cinzel text-xs text-[hsl(42,20%,50%)] uppercase tracking-widest mb-2">Состав войска</div>
                <div className="flex flex-col gap-2 mb-5">
                  {TROOPS.map((t, i) => (
                    <div key={t.name} className="troop-badge rounded animate-fade-in" style={{ animationDelay: `${i * 0.06}s`, opacity: 0, borderLeftColor: t.color }}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{t.icon}</span>
                        <div>
                          <div className="font-cinzel text-sm font-bold" style={{ color: t.color }}>{t.name}</div>
                          <div className="text-[11px] text-[hsl(42,20%,55%)]">Обучено {t.trained}%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-cinzel font-bold text-[hsl(42,40%,85%)]">{t.count.toLocaleString()}</div>
                        <div className="progress-bar w-20 mt-1">
                          <div className="progress-fill" style={{ width: `${t.trained}%`, background: `linear-gradient(to right, ${t.color}88, ${t.color})` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="btn-gold py-2.5 px-4 rounded text-xs">⚔️ Отправить в поход</button>
                  <button className="btn-dark py-2.5 px-4 rounded text-xs">🛡️ Усилить оборону</button>
                  <button className="btn-dark py-2.5 px-4 rounded text-xs">🔨 Обучить войска</button>
                  <button className="btn-dark py-2.5 px-4 rounded text-xs">📜 История битв</button>
                </div>
              </div>
            </div>
          )}

          {/* BUILDINGS TAB */}
          {activeTab === "постройки" && (
            <div className="h-full overflow-y-auto p-4">
              <div className="max-w-2xl mx-auto">
                <h2 className="font-cinzel text-xl font-bold gold-text mb-1 glow-gold">Укрепления и Постройки</h2>
                <div className="divider-gold mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BUILDINGS.map((b, i) => (
                    <div key={b.name} className="panel-bg rounded p-3 animate-fade-in" style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{b.emoji}</span>
                          <div>
                            <div className="font-cinzel text-sm font-bold text-[hsl(42,40%,85%)]">{b.name}</div>
                            <div className="text-[11px] text-[hsl(42,20%,55%)]">Уровень {b.level}</div>
                          </div>
                        </div>
                        <div className="text-[10px] font-cinzel text-[hsl(43,74%,54%)] border border-[rgba(201,162,39,0.3)] px-1.5 py-0.5 rounded">
                          Ур.{b.level}
                        </div>
                      </div>
                      <div className="mb-1.5">
                        <div className="flex justify-between text-[10px] text-[hsl(42,20%,55%)] mb-1">
                          <span>До улучшения</span>
                          <span className="text-[hsl(43,74%,54%)]">{b.upgrade}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${b.upgrade}%` }} />
                        </div>
                      </div>
                      <button className="btn-dark w-full py-1.5 text-[11px] rounded mt-1 font-cinzel">
                        Улучшить → Ур.{b.level + 1}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GUILD TAB */}
          {activeTab === "гильдия" && (
            <div className="h-full overflow-y-auto p-4">
              <div className="max-w-2xl mx-auto">
                {!showGuildCreate ? (
                  <>
                    <div className="panel-bg rounded p-4 mb-4 flex items-center gap-4 animate-fade-in">
                      <div className="text-4xl">🛡️</div>
                      <div className="flex-1">
                        <div className="font-cinzel text-lg font-bold gold-text">Орден Стальных Стражей</div>
                        <div className="text-xs text-[hsl(42,20%,55%)] mt-0.5">Основан: 840 г. н.э. · 24 воина</div>
                        <div className="flex gap-3 mt-2">
                          <div className="text-[11px]"><span className="text-[hsl(43,74%,54%)]">⚡ 2.1М</span> <span className="text-[hsl(42,20%,50%)]">мощь</span></div>
                          <div className="text-[11px]"><span className="text-[hsl(43,74%,54%)]">🏆 #12</span> <span className="text-[hsl(42,20%,50%)]">рейтинг</span></div>
                          <div className="text-[11px]"><span className="text-[hsl(43,74%,54%)]">⚔️ 47</span> <span className="text-[hsl(42,20%,50%)]">побед</span></div>
                        </div>
                      </div>
                    </div>
                    <div className="divider-gold mb-4" />
                    <div className="font-cinzel text-xs text-[hsl(42,20%,50%)] uppercase tracking-widest mb-2">Состав гильдии</div>
                    <div className="flex flex-col gap-1.5 mb-4">
                      {GUILD_MEMBERS.map((m, i) => (
                        <div key={m.name} className="panel-bg rounded px-3 py-2.5 flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.online ? "bg-green-500" : "bg-[rgba(255,255,255,0.15)]"}`} />
                          <div className="flex-1">
                            <div className="font-cinzel text-sm font-bold text-[hsl(42,40%,85%)]">{m.name}</div>
                            <div className="text-[10px] text-[hsl(42,20%,55%)]">{m.rank}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[hsl(43,74%,54%)] text-xs font-bold">{m.power.toLocaleString()}</div>
                            <div className="text-[10px] text-[hsl(42,20%,50%)]">мощь</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="btn-gold py-2.5 px-4 rounded text-xs">⚔️ Объявить войну</button>
                      <button className="btn-dark py-2.5 px-4 rounded text-xs">🤝 Предложить союз</button>
                      <button className="btn-dark py-2.5 px-4 rounded text-xs">📢 Клич гильдии</button>
                      <button className="btn-dark py-2.5 px-4 rounded text-xs" onClick={() => setShowGuildCreate(true)}>➕ Новая гильдия</button>
                    </div>
                  </>
                ) : (
                  <div className="panel-bg rounded p-6 animate-fade-in">
                    <h3 className="font-cinzel text-lg font-bold gold-text mb-1">Основать Гильдию</h3>
                    <div className="divider-gold mb-4" />
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-xs font-cinzel text-[hsl(42,20%,55%)] uppercase tracking-wider">Название</label>
                        <input className="w-full mt-1 bg-[rgba(30,22,14,0.8)] border border-[rgba(201,162,39,0.25)] rounded px-3 py-2 text-sm text-[hsl(42,40%,88%)] focus:outline-none focus:border-[rgba(201,162,39,0.6)]" placeholder="Введите название..." />
                      </div>
                      <div>
                        <label className="text-xs font-cinzel text-[hsl(42,20%,55%)] uppercase tracking-wider">Девиз</label>
                        <input className="w-full mt-1 bg-[rgba(30,22,14,0.8)] border border-[rgba(201,162,39,0.25)] rounded px-3 py-2 text-sm text-[hsl(42,40%,88%)] focus:outline-none focus:border-[rgba(201,162,39,0.6)]" placeholder="Девиз гильдии..." />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button className="btn-gold py-2.5 rounded text-xs">⚜ Основать</button>
                        <button className="btn-dark py-2.5 rounded text-xs" onClick={() => setShowGuildCreate(false)}>Отмена</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar — Events */}
        <div className="hidden xl:flex flex-col w-64 panel-bg border-l border-[rgba(201,162,39,0.15)] flex-shrink-0 overflow-hidden">
          <div className="p-3 border-b border-[rgba(201,162,39,0.1)]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-cinzel text-[hsl(42,30%,65%)]">Онлайн: <span className="text-green-400 font-bold">1 248</span></span>
            </div>
          </div>

          {/* My mines summary */}
          <div className="p-3 border-b border-[rgba(201,162,39,0.1)]">
            <div className="font-cinzel text-[10px] text-[hsl(42,20%,50%)] uppercase tracking-widest mb-2">Мои шахты ({playerMines.length})</div>
            {playerMines.length === 0 ? (
              <div className="text-[11px] text-[hsl(42,20%,45%)] italic">Нет захваченных шахт. Нажмите на шахту на карте!</div>
            ) : (
              <div className="flex flex-col gap-1">
                {playerMines.map(m => {
                  const cfg = MINE_CONFIG[m.resource];
                  return (
                    <div key={m.id} className="flex items-center justify-between text-[11px] py-1 border-b border-[rgba(201,162,39,0.06)]">
                      <div className="flex items-center gap-1.5">
                        <span>{m.emoji}</span>
                        <span className="text-[hsl(42,30%,65%)]">{m.label}</span>
                      </div>
                      <span className="font-cinzel font-bold text-green-400">+{m.ratePerSec}/с</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 flex-1 overflow-hidden flex flex-col">
            <div className="font-cinzel text-[10px] text-[hsl(42,20%,50%)] uppercase tracking-widest mb-2">Хроника событий</div>
            <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
              {events.map((e, i) => (
                <div key={i} className="panel-bg rounded p-2">
                  <div className="flex items-start gap-1.5">
                    <span className="text-sm flex-shrink-0">
                      {e.type === "war" ? "⚔️" : e.type === "alert" ? "⚠️" : e.type === "peace" ? "🕊️" : "ℹ️"}
                    </span>
                    <div>
                      <div className="text-[11px] text-[hsl(42,30%,70%)] leading-tight">{e.text}</div>
                      <div className="text-[9px] text-[hsl(42,15%,45%)] mt-0.5 font-cinzel">{e.time} назад</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 border-t border-[rgba(201,162,39,0.1)]">
            <div className="font-cinzel text-[10px] text-[hsl(42,20%,50%)] uppercase tracking-widest mb-2">Дневное задание</div>
            <div className="panel-bg rounded p-2.5">
              <div className="text-xs text-[hsl(42,30%,70%)] mb-1.5">⛏️ Захватить 3 шахты</div>
              <div className="progress-bar mb-1">
                <div className="progress-fill" style={{ width: `${(playerMines.length / 3) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[hsl(42,20%,50%)]">{playerMines.length} / 3</span>
                <span className="text-[hsl(43,74%,54%)]">+500 🪙</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav (mobile) */}
      <div className="lg:hidden panel-bg border-t border-[rgba(201,162,39,0.2)] flex z-20 flex-shrink-0">
        {(["карта", "армия", "постройки", "гильдия"] as Tab[]).map((tab) => {
          const emojis: Record<Tab, string> = { карта: "🗺️", армия: "⚔️", постройки: "🏰", гильдия: "🛡️" };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all ${
                activeTab === tab ? "text-[hsl(43,74%,64%)]" : "text-[hsl(42,20%,45%)]"
              }`}
            >
              <span className="text-lg">{emojis[tab]}</span>
              <span className={`text-[9px] font-cinzel uppercase tracking-wide ${activeTab === tab ? "text-[hsl(43,74%,64%)]" : ""}`}>
                {tab}
              </span>
            </button>
          );
        })}
      </div>

      {/* Attack overlay */}
      {attack?.active && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 panel-bg px-5 py-3 rounded-lg border border-[rgba(201,162,39,0.4)] z-50 min-w-[220px] text-center animate-fade-in">
          <div className="font-cinzel text-xs text-[hsl(43,74%,54%)] mb-1">⚔️ Армия в пути...</div>
          <div className="progress-bar mb-1">
            <div className="progress-fill" style={{ width: `${attack.progress}%` }} />
          </div>
          <div className="text-[10px] text-[hsl(42,20%,55%)]">{attack.troops} воинов · {attack.progress}%</div>
        </div>
      )}

      <style>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translate(-50%, -100%); }
          100% { opacity: 0; transform: translate(-50%, -220%); }
        }
      `}</style>
    </div>
  );
}
