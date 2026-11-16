import { getAdminSession } from "./cloud";

/**
 * The teacher sees everything as already passed: theory without timers, every mission and every quest level open.
 * This is only a view — nothing of it is saved and no points are given.
 */
export const isTeacher = () => !!getAdminSession();
