import { Link } from "react-router-dom";
import { Crown, LogIn, UserRound } from "lucide-react";
import { cloudAvailable, getAdminName, getAdminSession, useAccount } from "../lib/cloud";
import { HUB_URL } from "../lib/cloudConfig";

const PILL =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-3 py-1.5 text-sm font-bold sm:px-4";
const CHIP = `${PILL} border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 dark:border-indigo-400/40 dark:bg-indigo-500/15 dark:text-indigo-200`;

/** Header entry: the teacher with a crown, the signed-in student's name, or "Войти" for guests. */
export function AccountButton() {
  const account = useAccount();
  if (!cloudAvailable) return null;

  if (getAdminSession()) {
    return (
      <Link to="/admin" aria-label="Кабинет педагога" className={CHIP}>
        <Crown className="h-4 w-4 text-amber-500 dark:text-amber-400" strokeWidth={2} aria-label="Админ" />
        <span className="hidden max-w-[10rem] truncate sm:inline">{getAdminName() ?? "Педагог"}</span>
      </Link>
    );
  }

  if (account) {
    return (
      <Link to="/profile" aria-label="Мой прогресс" className={CHIP}>
        <UserRound className="h-4 w-4" strokeWidth={2} />
        <span className="hidden max-w-[8rem] truncate sm:inline">{account.owner?.name ?? "Мой прогресс"}</span>
      </Link>
    );
  }

  return (
    <a
      href={`${HUB_URL}#login`}
      className={`${PILL} border-transparent bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow hover:opacity-90`}
    >
      <LogIn className="h-4 w-4" strokeWidth={2} />
      <span className="hidden sm:inline">Войти</span>
    </a>
  );
}
