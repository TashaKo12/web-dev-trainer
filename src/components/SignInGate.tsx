import { GraduationCap, LockKeyhole, LogIn } from "lucide-react";
import { HUB_URL } from "../lib/cloudConfig";

/** Shown instead of a trainer until the visitor signs in on the course page. */
export function SignInGate() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-white/70 bg-white/90 p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg">
        <LockKeyhole className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <h1 className="mb-3 text-2xl font-extrabold text-slate-800 sm:text-3xl">Сначала войди в аккаунт</h1>
      <p className="mb-6 text-slate-600">
        Тренажёры открываются после входа: так твои уровни, очки и время занятий сохранятся, а прогресс можно будет открыть
        на любом компьютере. Войди по коду участника или создай аккаунт — это займёт минуту.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <a
          href={`${HUB_URL}#login`}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:opacity-90"
        >
          <LogIn className="h-4 w-4" strokeWidth={2} />
          Войти или создать аккаунт
        </a>
        <a
          href={`${HUB_URL}#teacher`}
          className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 px-5 py-2 text-sm font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
        >
          <GraduationCap className="h-4 w-4" strokeWidth={2} />
          Вход педагога
        </a>
      </div>
    </div>
  );
}
