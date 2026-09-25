import { useState } from "react";
import "./design/base.css";
import "./App.css";
import { FridgeMark } from "./components/FridgeMark";
import { ItemCard } from "./components/ItemCard";
import { RecipeCard } from "./components/RecipeCard";
import { Undo } from "./components/Undo";
import { Unpack } from "./components/Unpack";
import { APP_NAME, FRIDGE_LABELS, RECIPE_LABELS, TAB_LABELS } from "./domain/labels";
import { useNow } from "./shell/clock";
import { useFridge } from "./state/useFridge";
import type { Photos } from "./storage/photos";
import type { Store } from "./storage/store";

export interface AppProps {
  store: Store;
  photos: Photos;
  /** Fixed by tests; the app reads a clock that rolls the day over on its own. */
  now?: Date;
}

type Tab = "fridge" | "recipes";

/** The whole app: what is in the fridge, what it can cook, and the way in. */
export default function App({ store, photos, now }: AppProps) {
  const ticking = useNow();
  const fridge = useFridge(store, photos, now ?? ticking);
  const [tab, setTab] = useState<Tab>("fridge");
  const [unpacking, setUnpacking] = useState(false);

  const { eaten, thrown } = fridge.month;
  const empty = fridge.items.length === 0;

  return (
    <div className="app">
      <header className="app__bar">
        <FridgeMark filled={!empty} />
        <h1 className="app__name">{APP_NAME}</h1>
        <span className="app__version">v{__APP_VERSION__}</span>
      </header>

      <nav className="app__tabs" aria-label={TAB_LABELS.pick}>
        {(["fridge", "recipes"] as const).map((each) => (
          <button
            key={each}
            type="button"
            className="app__tab"
            aria-pressed={tab === each}
            onClick={() => setTab(each)}
          >
            {TAB_LABELS[each]}
          </button>
        ))}
      </nav>

      <main className="app__main">
        {tab === "fridge" && eaten + thrown > 0 && (
          <p className="app__month">{FRIDGE_LABELS.month(eaten, thrown)}</p>
        )}

        {empty && (
          <div className="app__empty">
            <FridgeMark />
            <p className="app__empty-title">
              {tab === "fridge" ? FRIDGE_LABELS.empty : RECIPE_LABELS.empty}
            </p>
            <p className="app__empty-detail">
              {tab === "fridge" ? FRIDGE_LABELS.emptyDetail : RECIPE_LABELS.emptyDetail}
            </p>
          </div>
        )}

        {!empty && tab === "fridge" && (
          <ul className="app__list">
            {fridge.items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                today={fridge.today}
                photos={photos}
                onEat={() => fridge.eat(item.id)}
                onThrowOut={() => fridge.throwOut(item.id)}
              />
            ))}
          </ul>
        )}

        {!empty && tab === "recipes" && (
          <ul className="app__list" aria-label={RECIPE_LABELS.heading}>
            {fridge.cookable.map((match) => (
              <RecipeCard key={match.recipe.id} match={match} />
            ))}
          </ul>
        )}
      </main>

      <div className="app__foot">
        <button type="button" className="app__open" onClick={() => setUnpacking(true)}>
          {FRIDGE_LABELS.open}
        </button>
      </div>

      {fridge.undoing && (
        <Undo message={fridge.undoing} onUndo={fridge.undo} onDismiss={fridge.forgetUndo} />
      )}

      {unpacking && (
        <Unpack
          today={fridge.today}
          recall={fridge.recall}
          suggest={fridge.suggest}
          onPut={fridge.put}
          onClose={() => setUnpacking(false)}
        />
      )}
    </div>
  );
}
