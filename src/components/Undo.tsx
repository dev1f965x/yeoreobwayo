import { useEffect } from "react";
import { FRIDGE_LABELS } from "../domain/labels";
import "./Undo.css";

interface Props {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

/** How long something taken out can be put back before the offer goes away. */
const OFFERED_FOR_MS = 6000;

/** A tap in a hurry is how food leaves the fridge, so every tap is takeable back. */
export function Undo({ message, onUndo, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, OFFERED_FOR_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="undo" role="status">
      <p className="undo__message">{message}</p>
      <button type="button" className="undo__action" onClick={onUndo}>
        {FRIDGE_LABELS.undo}
      </button>
    </div>
  );
}
