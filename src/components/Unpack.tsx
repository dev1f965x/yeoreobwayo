import { useEffect, useRef, useState } from "react";
import { addDays, type Day, daysBetween } from "../domain/day";
import { KINDS, type Kind, shelfLife } from "../domain/kinds";
import { describeDay, describeLeft, KIND_LABELS, UNPACK_LABELS } from "../domain/labels";
import type { Remembered } from "../domain/names";
import { shrink } from "../shell/photo";
import type { Unpacked } from "../state/useFridge";
import "./Unpack.css";

interface Props {
  today: Day;
  recall: (name: string) => Remembered | undefined;
  suggest: (typed: string) => Remembered[];
  onPut: (unpacked: Unpacked) => void;
  onClose: () => void;
}

/** The lengths the quick buttons offer, which is how long groceries are usually meant to last. */
const QUICK_DAYS = [0, 3, 7, 14, 30];

/**
 * The screen the app is built around: one thing out of the bag at a time, typed once and
 * in with a tap. It stays open and empties itself after each one, because the bag has
 * fourteen things in it (ADR 5).
 */
export function Unpack({ today, recall, suggest, onPut, onClose }: Props) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<Kind>("vegetable");
  const [count, setCount] = useState(1);
  const [expiresOn, setExpiresOn] = useState<Day>(() => addDays(today, shelfLife("vegetable")));
  const [photo, setPhoto] = useState<Blob>();
  const [knew, setKnew] = useState(false);
  const [last, setLast] = useState<string>();

  const field = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const preview = usePreview(photo);
  const suggestions = suggest(name);
  const left = daysBetween(today, expiresOn);

  // The sheet opens straight onto the keyboard: the name is where every item starts.
  useEffect(() => field.current?.focus(), []);

  /** Takes a name on, with whatever was said about it the last time it was bought. */
  const take = (typed: string) => {
    setName(typed);
    const known = recall(typed);
    setKnew(Boolean(known));
    if (known) {
      setKind(known.kind);
      setExpiresOn(addDays(today, known.days));
    }
  };

  const chooseKind = (chosen: Kind) => {
    setKind(chosen);
    setKnew(false);
    setExpiresOn(addDays(today, shelfLife(chosen)));
  };

  const put = (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim() === "") return;

    onPut({ name, kind, count, expiresOn, photo });
    setLast(name.trim());
    setName("");
    setCount(1);
    setPhoto(undefined);
    setKnew(false);
    setExpiresOn(addDays(today, shelfLife(kind)));
    field.current?.focus();
  };

  return (
    <form
      className="unpack"
      role="dialog"
      aria-modal="true"
      aria-label={UNPACK_LABELS.heading}
      onSubmit={put}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <header className="unpack__bar">
        <h2 className="unpack__heading">{UNPACK_LABELS.heading}</h2>
        <button type="button" className="unpack__close" onClick={onClose}>
          {UNPACK_LABELS.close}
        </button>
      </header>

      <div className="unpack__body">
        <p className="unpack__said" role="status">
          {last ? UNPACK_LABELS.done(last) : UNPACK_LABELS.putAnother}
        </p>

        <div className="unpack__top">
          <button
            type="button"
            className="unpack__photo"
            data-taken={Boolean(preview)}
            onClick={() => camera.current?.click()}
          >
            {preview ? (
              <img className="unpack__shot" src={preview} alt="" />
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3.5 8h3.6l1.3-2h7.2l1.3 2h3.6v11h-17z" />
                <circle cx="12" cy="13" r="3.3" />
              </svg>
            )}
            <span className="unpack__photo-word">
              {preview ? UNPACK_LABELS.retake : UNPACK_LABELS.photo}
            </span>
          </button>
          <input
            ref={camera}
            className="visually-hidden"
            type="file"
            accept="image/*"
            capture="environment"
            aria-label={UNPACK_LABELS.photo}
            onChange={async (event) => setPhoto(await taken(event.target.files?.[0]))}
          />

          <div className="unpack__named">
            <input
              ref={field}
              className="unpack__field"
              value={name}
              placeholder={UNPACK_LABELS.namePlaceholder}
              aria-label={UNPACK_LABELS.name}
              enterKeyHint="done"
              onChange={(event) => take(event.target.value)}
            />
            {suggestions.length > 0 && (
              <div className="unpack__suggestions">
                {suggestions.map((each) => (
                  <button
                    key={each.name}
                    type="button"
                    className="unpack__suggestion"
                    onClick={() => take(each.name)}
                  >
                    {each.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <fieldset className="unpack__kinds">
          <legend className="visually-hidden">{UNPACK_LABELS.kind}</legend>
          {KINDS.map((each) => (
            <button
              key={each}
              type="button"
              className="unpack__kind"
              aria-pressed={kind === each}
              onClick={() => chooseKind(each)}
            >
              {KIND_LABELS[each]}
            </button>
          ))}
        </fieldset>

        <p className="unpack__hint">
          {knew
            ? UNPACK_LABELS.remembered(KIND_LABELS[kind])
            : UNPACK_LABELS.guessed(KIND_LABELS[kind], shelfLife(kind))}
        </p>

        <div className="unpack__row">
          <span className="unpack__what">{UNPACK_LABELS.count}</span>
          <div className="unpack__stepper">
            <button
              type="button"
              className="unpack__step"
              aria-label={UNPACK_LABELS.fewer}
              disabled={count <= 1}
              onClick={() => setCount((each) => Math.max(1, each - 1))}
            >
              −
            </button>
            <span className="unpack__count">{count}</span>
            <button
              type="button"
              className="unpack__step"
              aria-label={UNPACK_LABELS.more}
              onClick={() => setCount((each) => each + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="unpack__row">
          <span className="unpack__what">{UNPACK_LABELS.expiry}</span>
          <div className="unpack__stepper">
            <button
              type="button"
              className="unpack__step"
              aria-label={UNPACK_LABELS.sooner}
              onClick={() => setExpiresOn((each) => addDays(each, -1))}
            >
              −
            </button>
            <span className="unpack__when">
              <strong className="unpack__date">{describeDay(expiresOn, today)}</strong>
              <small className="unpack__left">{describeLeft(left)}</small>
            </span>
            <button
              type="button"
              className="unpack__step"
              aria-label={UNPACK_LABELS.later}
              onClick={() => setExpiresOn((each) => addDays(each, 1))}
            >
              +
            </button>
          </div>
        </div>

        <div className="unpack__quick">
          {QUICK_DAYS.map((days) => (
            <button
              key={days}
              type="button"
              className="unpack__days"
              aria-pressed={left === days}
              onClick={() => setExpiresOn(addDays(today, days))}
            >
              {UNPACK_LABELS.inDays(days)}
            </button>
          ))}
        </div>
      </div>

      <div className="unpack__foot">
        <button type="submit" className="unpack__put" disabled={name.trim() === ""}>
          {UNPACK_LABELS.put}
        </button>
      </div>
    </form>
  );
}

/** What the camera gave back, made small enough to keep — or nothing, if it was not a picture. */
async function taken(file: File | undefined): Promise<Blob | undefined> {
  return file ? await shrink(file) : undefined;
}

/** A blob cannot go in an `img`, and its URL has to be let go of once it is replaced. */
function usePreview(photo: Blob | undefined): string | undefined {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!photo) {
      setUrl(undefined);
      return;
    }
    const made = URL.createObjectURL(photo);
    setUrl(made);
    return () => URL.revokeObjectURL(made);
  }, [photo]);

  return url;
}
