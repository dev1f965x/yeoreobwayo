import { useCallback, useMemo, useState } from "react";
import { type Day, dayOf, daysBetween } from "../domain/day";
import { eat, type Gone, type Item, inOrder, tally, throwOut } from "../domain/fridge";
import type { Kind } from "../domain/kinds";
import { FRIDGE_LABELS } from "../domain/labels";
import { type Remembered, recall, remember, suggest } from "../domain/names";
import { inCookingOrder, RECIPES } from "../domain/recipes";
import type { Photos } from "../storage/photos";
import type { Store } from "../storage/store";

/** What the unpacking screen hands over once a thing has been taken out of the bag. */
export interface Unpacked {
  name: string;
  kind: Kind;
  count: number;
  expiresOn: Day;
  photo?: Blob;
}

/** What the fridge looked like a moment ago, kept so that one tap can put it back. */
interface Before {
  items: Item[];
  gone: Gone[];
  message: string;
}

export function useFridge(store: Store, photos: Photos, now: Date) {
  const today = dayOf(now);

  const [items, setItems] = useState<Item[]>(() => store.readItems());
  const [gone, setGone] = useState<Gone[]>(() => store.readGone());
  const [names, setNames] = useState<Remembered[]>(() => store.readNames());
  const [before, setBefore] = useState<Before>();

  const keepItems = useCallback(
    (next: Item[]) => {
      setItems(next);
      store.writeItems(next);
    },
    [store],
  );

  const keepGone = useCallback(
    (next: Gone[]) => {
      setGone(next);
      store.writeGone(next);
    },
    [store],
  );

  const put = useCallback(
    async (unpacked: Unpacked) => {
      const id = crypto.randomUUID();
      let photo: string | undefined;
      if (unpacked.photo) {
        photo = id;
        await photos.put(id, unpacked.photo);
      }

      const item: Item = {
        id,
        name: unpacked.name.trim(),
        kind: unpacked.kind,
        count: unpacked.count,
        expiresOn: unpacked.expiresOn,
        addedOn: today,
        photo,
      };
      keepItems([...items, item]);

      const learnt = remember(names, item, Math.max(0, daysBetween(today, item.expiresOn)));
      setNames(learnt);
      store.writeNames(learnt);
    },
    [items, names, today, keepItems, photos, store],
  );

  /** Takes one away, or throws the rest of it out, and offers to take that back. */
  const take = useCallback(
    (id: string, why: Gone["why"]) => {
      const item = items.find((each) => each.id === id);
      if (!item) return;

      const [left, went] = why === "eaten" ? eat(items, id, today) : throwOut(items, id, today);
      setBefore({
        items,
        gone,
        message:
          why === "eaten" ? FRIDGE_LABELS.ateOne(item.name) : FRIDGE_LABELS.threwOut(item.name),
      });
      keepItems(left);
      if (went) keepGone([went, ...gone]);
      if (!left.some((each) => each.id === id) && item.photo) photos.remove(item.photo);
    },
    [items, gone, today, keepItems, keepGone, photos],
  );

  const undo = useCallback(() => {
    setBefore((last) => {
      if (!last) return undefined;
      keepItems(last.items);
      keepGone(last.gone);
      return undefined;
    });
  }, [keepItems, keepGone]);

  const forgetUndo = useCallback(() => setBefore(undefined), []);

  const held = useMemo(() => inOrder(items, today), [items, today]);
  const cookable = useMemo(() => inCookingOrder(RECIPES, items, today), [items, today]);
  const month = useMemo(() => tally(gone, `${today.slice(0, 7)}-01`), [gone, today]);

  return {
    today,
    items: held,
    cookable,
    month,
    undoing: before?.message,
    put,
    eat: (id: string) => take(id, "eaten"),
    throwOut: (id: string) => take(id, "thrown"),
    undo,
    forgetUndo,
    recall: (name: string) => recall(names, name),
    suggest: (typed: string) => suggest(names, typed),
  };
}
