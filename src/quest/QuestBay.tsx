import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { BAYS, DIARY } from "./data";
import { Dialogue } from "./Dialogue";
import { Diploma } from "./Diploma";
import { bayDone, bayOpen, levelOpen, markIntro, markOutro, useQuest } from "./progress";

// One bay of the station: its story scene, then the path of levels.

export function QuestBay() {
  const { bay: bayParam } = useParams();
  const save = useQuest();
  const bay = BAYS.find((b) => String(b.id) === bayParam);
  const [replay, setReplay] = useState(false);
  // the finale: the Creator's secret and the diploma can be opened again
  const [screen, setScreen] = useState<"secret" | "diploma" | null>(null);
  const navigate = useNavigate();

  if (!bay) return <p className="text-center text-slate-500">Такого отсека нет. <Link to="/quest" className="font-bold text-violet-600">На карту станции</Link></p>;
  if (!bayOpen(save, bay.id))
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white/90 p-8 text-center">
        <p className="mb-4 text-5xl">🔒</p>
        <p className="mb-4 font-bold text-slate-600">
          {bay.finale ? "Сердце станции откроется, когда ты соберёшь все шесть ключей!" : `Отсек ещё заперт. Сначала почини отсек ${bay.id - 1}!`}
        </p>
        <Link to="/quest" className="font-bold text-violet-600">
          На карту станции →
        </Link>
      </div>
    );

  const done = bayDone(save, bay.id);
  const heading = (
    <div className="mb-8 text-center">
      <p className="text-5xl">{bay.emoji}</p>
      <p className="mt-2 text-sm font-extrabold uppercase tracking-wide text-violet-500">{bay.finale ? "Финал" : `Отсек ${bay.id}`}</p>
      <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{bay.name}</h1>
    </div>
  );

  if (screen === "diploma")
    return (
      <div>
        {heading}
        <Diploma />
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => setScreen("secret")} className="rounded-full border-2 border-slate-200 px-5 py-2.5 font-bold text-slate-600">
            Послушать секрет ещё раз
          </button>
          <Link to="/quest" className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-2.5 font-extrabold text-white shadow">
            На карту станции
          </Link>
        </div>
      </div>
    );

  // the closing scene: the key is handed over when the last level is passed (in the finale — the secret)
  if ((done && !save.outro.includes(bay.id)) || screen === "secret")
    return (
      <div>
        {heading}
        <div className="mb-8 flex justify-center">
          <span
            className="flex h-24 w-24 items-center justify-center rounded-full text-5xl shadow-[0_0_40px_currentColor]"
            style={{ background: bay.key.color, color: bay.key.color, animation: "quest-pop 0.8s both" }}
          >
            <span className="text-white">{bay.finale ? "💜" : "🔑"}</span>
          </span>
        </div>
        <Dialogue
          key={screen ?? "outro"}
          lines={bay.outro}
          doneLabel={bay.finale ? "Получить диплом" : "На карту станции"}
          onDone={() => {
            markOutro(bay.id);
            if (bay.finale) setScreen("diploma");
            else navigate("/quest");
          }}
        />
      </div>
    );

  if (replay || !save.intro.includes(bay.id))
    return (
      <div>
        {heading}
        <Dialogue
          lines={bay.intro}
          onDone={() => {
            markIntro(bay.id);
            setReplay(false);
          }}
        />
      </div>
    );

  return (
    <div>
      {heading}
      {done && !bay.finale && (
        <p className="mx-auto mb-6 max-w-md rounded-2xl bg-emerald-50 p-3 text-center font-bold text-emerald-700">
          Отсек починен — {bay.key.name} у тебя! Можно перепройти уровни и собрать все звёзды.
        </p>
      )}
      {done && bay.finale && (
        <div className="mx-auto mb-6 flex max-w-md flex-wrap justify-center gap-2">
          <button type="button" onClick={() => setScreen("secret")} className="rounded-full border-2 border-violet-200 px-5 py-2.5 font-bold text-violet-700">
            💜 Секрет Создательницы
          </button>
          <button type="button" onClick={() => setScreen("diploma")} className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 font-extrabold text-white shadow">
            🏆 Мой диплом
          </button>
        </div>
      )}

      {/* the path of levels: a zigzag of round stops */}
      <ol className="mx-auto flex max-w-md flex-col gap-3">
        {bay.levels.map((l, i) => {
          const open = levelOpen(save, bay.id, i);
          const stars = save.stars[l.id] ?? 0;
          const current = open && stars === 0;
          const node = (
            <>
              <span
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-b-4 text-2xl font-black ${
                  !open
                    ? "border-slate-300 bg-slate-200 text-slate-400"
                    : l.boss
                      ? "border-amber-600 bg-gradient-to-br from-amber-300 to-orange-500 text-white"
                      : "border-violet-700 bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white"
                } ${current ? "ring-4 ring-amber-300 ring-offset-2 animate-pulse" : ""}`}
              >
                {!open ? "🔒" : l.boss ? "👑" : i + 1}
              </span>
              <span className="min-w-0">
                <span className={`block font-extrabold ${open ? "text-slate-800" : "text-slate-400"}`}>{l.title}</span>
                <span className="mt-0.5 flex gap-0.5">
                  {[1, 2, 3].map((n) => (
                    <Star key={n} className={`h-4 w-4 ${n <= stars ? "text-amber-400" : "text-slate-300"}`} fill="currentColor" strokeWidth={1.5} />
                  ))}
                  {l.id in DIARY && !save.diary.includes(l.id) && open && <span className="ml-1 text-sm">📜?</span>}
                </span>
              </span>
            </>
          );
          const cls = `flex items-center gap-4 rounded-3xl border-2 p-3 ${i % 2 ? "ml-10 sm:ml-20" : "mr-10 sm:mr-20"}`;
          return (
            <li key={l.id}>
              {open ? (
                <Link to={`/quest/${bay.id}/${i + 1}`} className={`${cls} border-violet-200 bg-white/95 transition hover:-translate-y-0.5 hover:border-violet-400`}>
                  {node}
                </Link>
              ) : (
                <div className={`${cls} border-slate-200 bg-white/50`} aria-disabled="true">
                  {node}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex justify-center">
        <button type="button" onClick={() => setReplay(true)} className="rounded-full px-4 py-2 text-sm font-bold text-slate-400 hover:text-violet-600">
          Послушать историю отсека ещё раз
        </button>
      </div>
    </div>
  );
}
