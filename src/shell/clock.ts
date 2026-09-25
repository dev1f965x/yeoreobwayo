import { useEffect, useState } from "react";

/** A minute: nothing on screen changes faster than the day does. */
const TICK_MS = 60_000;

/**
 * The current time, re-read on a timer.
 *
 * Every date on screen is counted from it, so a window left open overnight rolls over
 * rather than holding the day it was opened on.
 */
export function useNow(interval: number = TICK_MS): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [interval]);

  return now;
}
