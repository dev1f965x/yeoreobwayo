import { APP_NAME } from "../domain/labels";
import "./FridgeMark.css";

interface Props {
  /** Tinted while there is something inside, which is the whole point of opening it. */
  filled?: boolean;
}

/** The app's mark: a fridge, with its inside coloured in once it is holding something. */
export function FridgeMark({ filled = false }: Props) {
  return (
    <svg className="mark" data-filled={filled} viewBox="0 0 40 40" role="img" aria-label={APP_NAME}>
      <rect className="mark__inside" x="9" y="5" width="22" height="30" rx="4.5" />
      <g className="mark__lines">
        <rect x="9" y="5" width="22" height="30" rx="4.5" />
        <path d="M9 15.5h22" />
        <path d="M26.5 10v3" />
        <path d="M26.5 18v4" />
      </g>
    </svg>
  );
}
