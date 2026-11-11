import { ShieldCheck } from "lucide-react";
import { setConsent } from "../lib/storage";

export function ConsentBanner({ onClose }: { onClose: () => void }) {
  function choose(value: "granted" | "denied") {
    setConsent(value);
    onClose();
  }

  return (
    <div role="dialog" aria-labelledby="consent-title" className="fixed inset-x-0 bottom-0 z-40 p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_16px_50px_rgb(0,0,0,0.25)] sm:flex-row sm:items-center dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-1 gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <p id="consent-title" className="font-extrabold text-slate-800 dark:text-slate-100">
              Сохранять твой прогресс в этом браузере?
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Запомним пройденные уровни, очки и выбранную тему. В браузере данные хранятся только на этом устройстве.
              Когда ты войдёшь в аккаунт, прогресс будет сохраняться и на сервере — по твоему коду его можно открыть на
              любом компьютере.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Нет
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-bold text-white shadow"
          >
            Да, сохранять
          </button>
        </div>
      </div>
    </div>
  );
}
