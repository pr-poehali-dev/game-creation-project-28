import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const MAP_IMAGE = "https://cdn.poehali.dev/projects/1539c1d4-6e84-461e-9378-b569ba8a0983/files/327830ca-d9f6-40bd-8a6d-85055010e137.jpg";

const MARKERS = [
  { id: "player", type: "castle", label: "Ваша крепость", x: 48, y: 52, emoji: "🏰" },
  { id: "enemy1", type: "enemy", label: "Орда Карра", x: 72, y: 30, emoji: "⚔️" },
  { id: "enemy2", type: "enemy", label: "Клан Волка", x: 22, y: 68, emoji: "⚔️" },
  { id: "ally1", type: "ally", label: "Альянс Рассвета", x: 35, y: 25, emoji: "🛡️" },
  { id: "ally2", type: "ally", label: "Дружина Юга", x: 62, y: 72, emoji: "🛡️" },
  { id: "resource1", type: "resource", label: "Золотые копи", x: 80, y: 55, emoji: "⛏️" },
  { id: "resource2", type: "resource", label: "Лесопилка", x: 15, y: 38, emoji: "🪵" },
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

const EVENTS = [
  { time: "00:02", text: "Альянс Рассвета атаковал Клан Волка", type: "war" },
  { time: "00:08", text: "Орда Карра захватила золотые копи", type: "alert" },
  { time: "00:15", text: "КнязьВладимир построил Стены ур.8", type: "info" },
  { time: "00:23", text: "Торговый договор с Дружиной Юга", type: "peace" },
  { time: "00:31", text: "Началась битва за Долину Теней", type: "war" },
];

type Tab = "карта" | "армия" | "постройки" | "гильдия";

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("карта");
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [resources, setResources] = useState({ gold: 48320, food: 31500, wood: 22800, iron: 9640 });
  const [showGuildCreate, setShowGuildCreate] = useState(false);
  const [power] = useState(124500);

  useEffect(() => {
    const interval = setInterval(() => {
      setResources(r => ({
        gold: r.gold + Math.floor(Math.random() * 5) + 2,
        food: r.food + Math.floor(Math.random() * 8) + 3,
        wood: r.wood + Math.floor(Math.random() * 4) + 1,
        iron: r.iron + Math.floor(Math.random() * 2) + 1,
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
          {[
            { emoji: "🪙", value: resources.gold, label: "Золото" },
            { emoji: "🌾", value: resources.food, label: "Пища" },
            { emoji: "🪵", value: resources.wood, label: "Дерево" },
            { emoji: "⚙️", value: resources.iron, label: "Железо" },
          ].map(r => (
            <div key={r.label} className="resource-chip text-xs">
              <span>{r.emoji}</span>
              <span className="text-[hsl(43,74%,64%)] font-bold">{r.value.toLocaleString()}</span>
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
        {[
          { emoji: "🪙", value: resources.gold },
          { emoji: "🌾", value: resources.food },
          { emoji: "🪵", value: resources.wood },
          { emoji: "⚙️", value: resources.iron },
        ].map((r, i) => (
          <div key={i} className="resource-chip text-[11px] flex-shrink-0">
            <span>{r.emoji}</span>
            <span className="text-[hsl(43,74%,64%)] font-bold">{r.value.toLocaleString()}</span>
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
                
                {MARKERS.map(m => (
                  <div
                    key={m.id}
                    className="map-marker"
                    style={{ left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%, -50%)" }}
                    onClick={() => setSelectedMarker(selectedMarker === m.id ? null : m.id)}
                  >
                    <div className={
                      m.type === "castle" ? "map-marker-castle pulse-gold" :
                      m.type === "enemy" ? "map-marker-enemy" :
                      m.type === "ally" ? "map-marker-ally" :
                      "w-8 h-8 bg-[rgba(140,100,30,0.7)] border border-[rgba(201,162,39,0.5)] rounded-full flex items-center justify-center"
                    }>
                      {m.emoji}
                    </div>
                    {selectedMarker === m.id && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 panel-bg px-3 py-2 rounded min-w-[140px] text-center z-10 animate-fade-in">
                        <div className="text-[hsl(43,74%,64%)] text-xs font-cinzel font-bold">{m.label}</div>
                        <div className="text-[10px] text-[hsl(42,20%,55%)] mt-0.5 capitalize">{
                          m.type === "castle" ? "Ваша крепость" :
                          m.type === "enemy" ? "Враг" :
                          m.type === "ally" ? "Союзник" : "Ресурс"
                        }</div>
                        {m.type !== "castle" && m.type !== "resource" && (
                          <button className="mt-2 btn-gold w-full text-[10px] py-1 rounded font-cinzel">
                            {m.type === "enemy" ? "Атаковать" : "Поддержать"}
                          </button>
                        )}
                        {m.type === "resource" && (
                          <button className="mt-2 btn-dark w-full text-[10px] py-1 rounded font-cinzel border-[rgba(201,162,39,0.3)]">
                            Захватить
                          </button>
                        )}
                      </div>
                    )}
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
                    { color: "#b02820", label: "Враги" },
                    { color: "#1a64c0", label: "Союзники" },
                    { color: "#7a6020", label: "Ресурсы" },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5 text-[10px] mb-0.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                      <span className="text-[hsl(42,30%,65%)]">{l.label}</span>
                    </div>
                  ))}
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
                        <div className="text-xs text-[hsl(42,20%,55%)] mt-0.5">Основан: 840 г. н.э. · 24 воина · Союзник Рассвета</div>
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

                    <div className="font-cinzel text-xs text-[hsl(42,20%,50%)] uppercase tracking-widest mb-2">Альянсы и Войны</div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="panel-bg rounded p-3">
                        <div className="text-xs font-cinzel text-green-400 mb-1.5">🤝 Союзники</div>
                        <div className="text-xs text-[hsl(42,30%,65%)]">Альянс Рассвета</div>
                        <div className="text-xs text-[hsl(42,30%,65%)]">Дружина Севера</div>
                      </div>
                      <div className="panel-bg rounded p-3">
                        <div className="text-xs font-cinzel text-red-400 mb-1.5">⚔️ Враги</div>
                        <div className="text-xs text-[hsl(42,30%,65%)]">Орда Карра</div>
                        <div className="text-xs text-[hsl(42,30%,65%)]">Клан Волка</div>
                      </div>
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
                        <label className="text-xs font-cinzel text-[hsl(42,20%,55%)] uppercase tracking-wider">Название гильдии</label>
                        <input className="w-full mt-1 bg-[rgba(30,22,14,0.8)] border border-[rgba(201,162,39,0.25)] rounded px-3 py-2 text-sm text-[hsl(42,40%,88%)] focus:outline-none focus:border-[rgba(201,162,39,0.6)]" placeholder="Введите название..." />
                      </div>
                      <div>
                        <label className="text-xs font-cinzel text-[hsl(42,20%,55%)] uppercase tracking-wider">Девиз</label>
                        <input className="w-full mt-1 bg-[rgba(30,22,14,0.8)] border border-[rgba(201,162,39,0.25)] rounded px-3 py-2 text-sm text-[hsl(42,40%,88%)] focus:outline-none focus:border-[rgba(201,162,39,0.6)]" placeholder="Девиз вашей гильдии..." />
                      </div>
                      <div>
                        <label className="text-xs font-cinzel text-[hsl(42,20%,55%)] uppercase tracking-wider">Тип вступления</label>
                        <select className="w-full mt-1 bg-[rgba(30,22,14,0.8)] border border-[rgba(201,162,39,0.25)] rounded px-3 py-2 text-sm text-[hsl(42,40%,88%)] focus:outline-none">
                          <option>Открытое вступление</option>
                          <option>По заявке</option>
                          <option>Только по приглашению</option>
                        </select>
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
              <span className="text-xs font-cinzel text-[hsl(42,30%,65%)]">Онлайн: <span className="text-green-400 font-bold">1 248</span> игроков</span>
            </div>
          </div>

          <div className="p-3 flex-1 overflow-hidden flex flex-col">
            <div className="font-cinzel text-[10px] text-[hsl(42,20%,50%)] uppercase tracking-widest mb-2">Хроника событий</div>
            <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
              {EVENTS.map((e, i) => (
                <div key={i} className="panel-bg rounded p-2 animate-fade-in" style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
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
              <div className="text-xs text-[hsl(42,30%,70%)] mb-1.5">🎯 Атаковать 3 врага</div>
              <div className="progress-bar mb-1">
                <div className="progress-fill" style={{ width: "33%" }} />
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[hsl(42,20%,50%)]">1 / 3 выполнено</span>
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
    </div>
  );
}
