import { RECIPE_LABELS } from "../domain/labels";
import type { Match } from "../domain/recipes";
import "./RecipeCard.css";

interface Props {
  match: Match;
}

/**
 * One dish, with every ingredient shown as held, held and about to go, or still to buy —
 * which is the whole answer to "what do I cook tonight" in one glance.
 */
export function RecipeCard({ match }: Props) {
  const { recipe, has, missing, urgent } = match;

  return (
    <li className="recipe" data-ready={missing.length === 0}>
      <div className="recipe__head">
        <h3 className="recipe__name">{recipe.name}</h3>
        <span className="recipe__state">
          {missing.length === 0 ? RECIPE_LABELS.ready : RECIPE_LABELS.short(missing.length)}
        </span>
      </div>

      <ul className="recipe__needs">
        {has.map((need) => (
          <li
            key={need}
            className="recipe__need"
            data-held="true"
            data-urgent={urgent.includes(need)}
          >
            {need}
          </li>
        ))}
        {missing.map((need) => (
          <li key={need} className="recipe__need" data-held="false">
            {need}
          </li>
        ))}
      </ul>

      <p className="recipe__note">
        {urgent.length > 0 && (
          <span className="recipe__urgent">{RECIPE_LABELS.urgent(urgent)}</span>
        )}
        {missing.length > 0 && <span>{RECIPE_LABELS.missing(missing)}</span>}
        <span>{RECIPE_LABELS.minutes(recipe.minutes)}</span>
        <span>{RECIPE_LABELS.seasoning(recipe.seasoning)}</span>
      </p>
    </li>
  );
}
