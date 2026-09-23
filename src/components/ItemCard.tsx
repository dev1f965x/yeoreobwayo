import { useEffect, useState } from "react";
import type { Day } from "../domain/day";
import { daysLeft, freshness, type Item } from "../domain/fridge";
import { describeDay, describeLeft, FRIDGE_LABELS, KIND_LABELS } from "../domain/labels";
import type { Photos } from "../storage/photos";
import "./ItemCard.css";

interface Props {
  item: Item;
  today: Day;
  photos: Photos;
  onEat: () => void;
  onThrowOut: () => void;
}

/** One thing in the fridge: what it is, how much is left of it, and how long it has. */
export function ItemCard({ item, today, photos, onEat, onThrowOut }: Props) {
  const left = daysLeft(item, today);
  const shot = usePhoto(photos, item.photo);

  return (
    <li className="item" data-freshness={freshness(item, today)}>
      <div className="item__face">
        {shot ? (
          <img className="item__shot" src={shot} alt="" />
        ) : (
          <span className="item__kind">{KIND_LABELS[item.kind]}</span>
        )}
      </div>

      <div className="item__what">
        <p className="item__name">
          {item.name}
          {item.count > 1 && <span className="item__count">{FRIDGE_LABELS.count(item.count)}</span>}
        </p>
        <p className="item__when">
          <span className="item__left">{describeLeft(left)}</span>
          <span className="item__date">{describeDay(item.expiresOn, today)}</span>
        </p>
      </div>

      <div className="item__acts">
        <button
          type="button"
          className="item__act item__act--ate"
          aria-label={`${item.name} ${FRIDGE_LABELS.ate}`}
          onClick={onEat}
        >
          {FRIDGE_LABELS.ate}
        </button>
        <button
          type="button"
          className="item__act"
          aria-label={`${item.name} ${FRIDGE_LABELS.threw}`}
          onClick={onThrowOut}
        >
          {FRIDGE_LABELS.threw}
        </button>
      </div>
    </li>
  );
}

/** The photo, fetched from the picture store the first time the row is on screen. */
function usePhoto(photos: Photos, id: string | undefined): string | undefined {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!id) {
      setUrl(undefined);
      return;
    }

    let made: string | undefined;
    photos.get(id).then((photo) => {
      if (!photo) return;
      made = URL.createObjectURL(photo);
      setUrl(made);
    });

    return () => {
      if (made) URL.revokeObjectURL(made);
    };
  }, [photos, id]);

  return url;
}
