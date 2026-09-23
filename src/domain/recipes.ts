import type { Day } from "./day";
import { daysLeft, type Item, SOON_DAYS } from "./fridge";

/**
 * An everyday dish, described by what has to be in the fridge for it. Seasoning is listed
 * apart and never counted as missing: a kitchen has soy sauce, and a recipe list that asks
 * a person to go and buy it is a list nobody reads.
 */
export interface Recipe {
  id: string;
  name: string;
  needs: readonly string[];
  seasoning: readonly string[];
  minutes: number;
}

/** What a recipe looks like against a particular fridge on a particular day. */
export interface Match {
  recipe: Recipe;
  /** What is in the fridge for it. */
  has: string[];
  missing: string[];
  /** What it would use up in time, which is why it is worth cooking today. */
  urgent: string[];
}

/**
 * Other names for the same ingredient, so that a fridge holding 삼겹살 can cook a recipe
 * that asks for 돼지고기. A written-out list beats guessing at the letters: Korean cuts of
 * meat share no syllables with the animal.
 */
const ALSO: Record<string, readonly string[]> = {
  돼지고기: ["삼겹살", "목살", "앞다리살", "뒷다리살", "돼지", "다짐육", "대패삼겹살"],
  소고기: ["등심", "안심", "차돌박이", "불고기감", "국거리", "한우", "채끝"],
  닭고기: ["닭", "닭다리", "닭가슴살", "닭날개", "생닭"],
  달걀: ["계란"],
  대파: ["파", "쪽파"],
  고등어: ["고등어살", "순살고등어"],
  두부: ["부침두부", "찌개두부"],
  김치: ["배추김치", "묵은지", "포기김치"],
  밥: ["즉석밥", "햇반", "쌀밥"],
  소면: ["국수", "잔치국수면"],
  우동면: ["우동사리", "생우동"],
  떡: ["떡볶이떡", "가래떡"],
  어묵: ["오뎅", "사각어묵"],
  양상추: ["상추", "로메인"],
  방울토마토: ["대추방울토마토"],
};

/** Everything that would answer for an ingredient, the ingredient itself included. */
function namesFor(need: string): readonly string[] {
  return [need, ...(ALSO[need] ?? [])];
}

/** Whether the fridge holds something that would pass for this ingredient. */
function held(items: readonly Item[], need: string): Item | undefined {
  const names = namesFor(need);
  return items.find((item) => names.some((name) => item.name.includes(name)));
}

export function match(recipe: Recipe, items: readonly Item[], today: Day): Match {
  const has: string[] = [];
  const missing: string[] = [];
  const urgent: string[] = [];

  for (const need of recipe.needs) {
    const item = held(items, need);
    if (!item) {
      missing.push(need);
      continue;
    }
    has.push(need);
    if (daysLeft(item, today) <= SOON_DAYS) urgent.push(need);
  }

  return { recipe, has, missing, urgent };
}

/**
 * What to cook, in the order a person would ask: what the fridge can already make, then
 * what one more thing would make — and among those, whatever uses up what is about to go.
 */
export function inCookingOrder(
  recipes: readonly Recipe[],
  items: readonly Item[],
  today: Day,
): Match[] {
  return recipes
    .map((recipe) => match(recipe, items, today))
    .sort(
      (one, other) =>
        one.missing.length - other.missing.length ||
        other.urgent.length - one.urgent.length ||
        one.recipe.minutes - other.recipe.minutes ||
        one.recipe.name.localeCompare(other.recipe.name, "ko"),
    );
}

/** The dishes the app knows, chosen for being cooked on a weeknight and not much else. */
export const RECIPES: readonly Recipe[] = [
  {
    id: "gyeran-mari",
    name: "계란말이",
    needs: ["달걀", "대파"],
    seasoning: ["소금"],
    minutes: 10,
  },
  {
    id: "kimchi-bokkeumbap",
    name: "김치볶음밥",
    needs: ["김치", "밥", "달걀"],
    seasoning: ["참기름", "간장"],
    minutes: 15,
  },
  {
    id: "doenjang-jjigae",
    name: "된장찌개",
    needs: ["두부", "애호박", "감자", "양파"],
    seasoning: ["된장", "다진마늘"],
    minutes: 20,
  },
  {
    id: "kimchi-jjigae",
    name: "김치찌개",
    needs: ["김치", "돼지고기", "두부", "양파"],
    seasoning: ["고춧가루", "다진마늘"],
    minutes: 25,
  },
  {
    id: "miyeokguk",
    name: "미역국",
    needs: ["미역", "소고기"],
    seasoning: ["간장", "참기름"],
    minutes: 30,
  },
  {
    id: "kongnamulguk",
    name: "콩나물국",
    needs: ["콩나물", "대파"],
    seasoning: ["소금", "다진마늘"],
    minutes: 15,
  },
  {
    id: "tteokbokki",
    name: "떡볶이",
    needs: ["떡", "어묵", "대파"],
    seasoning: ["고추장", "설탕"],
    minutes: 20,
  },
  {
    id: "jeyuk-bokkeum",
    name: "제육볶음",
    needs: ["돼지고기", "양파", "대파"],
    seasoning: ["고추장", "다진마늘"],
    minutes: 25,
  },
  {
    id: "bulgogi",
    name: "불고기",
    needs: ["소고기", "양파", "당근"],
    seasoning: ["간장", "설탕"],
    minutes: 25,
  },
  {
    id: "dakbokkeumtang",
    name: "닭볶음탕",
    needs: ["닭고기", "감자", "당근", "양파"],
    seasoning: ["고추장", "간장"],
    minutes: 40,
  },
  {
    id: "curry",
    name: "카레라이스",
    needs: ["감자", "당근", "양파", "밥"],
    seasoning: ["카레가루"],
    minutes: 30,
  },
  {
    id: "omurice",
    name: "오므라이스",
    needs: ["달걀", "밥", "양파"],
    seasoning: ["케첩"],
    minutes: 20,
  },
  {
    id: "janchi-guksu",
    name: "잔치국수",
    needs: ["소면", "애호박", "달걀"],
    seasoning: ["간장"],
    minutes: 20,
  },
  {
    id: "bibim-guksu",
    name: "비빔국수",
    needs: ["소면", "오이", "김치"],
    seasoning: ["고추장", "식초"],
    minutes: 15,
  },
  { id: "kimchi-jeon", name: "김치전", needs: ["김치"], seasoning: ["부침가루"], minutes: 15 },
  { id: "gamja-jeon", name: "감자전", needs: ["감자"], seasoning: ["소금"], minutes: 20 },
  {
    id: "hobak-jeon",
    name: "애호박전",
    needs: ["애호박", "달걀"],
    seasoning: ["부침가루", "소금"],
    minutes: 15,
  },
  {
    id: "kongnamul-muchim",
    name: "콩나물무침",
    needs: ["콩나물", "대파"],
    seasoning: ["참기름", "소금"],
    minutes: 10,
  },
  {
    id: "sigeumchi-namul",
    name: "시금치나물",
    needs: ["시금치"],
    seasoning: ["참기름", "다진마늘"],
    minutes: 10,
  },
  {
    id: "eomuk-bokkeum",
    name: "어묵볶음",
    needs: ["어묵", "양파"],
    seasoning: ["간장", "설탕"],
    minutes: 15,
  },
  {
    id: "dubu-jorim",
    name: "두부조림",
    needs: ["두부", "대파"],
    seasoning: ["간장", "고춧가루"],
    minutes: 20,
  },
  {
    id: "godeungeo-jorim",
    name: "고등어조림",
    needs: ["고등어", "무", "대파"],
    seasoning: ["고춧가루", "간장"],
    minutes: 30,
  },
  {
    id: "sundubu-jjigae",
    name: "순두부찌개",
    needs: ["순두부", "달걀", "애호박"],
    seasoning: ["고춧가루", "다진마늘"],
    minutes: 20,
  },
  {
    id: "bokkeum-udon",
    name: "볶음우동",
    needs: ["우동면", "양배추", "당근", "양파"],
    seasoning: ["간장", "굴소스"],
    minutes: 15,
  },
  {
    id: "tomato-gyeran",
    name: "토마토달걀볶음",
    needs: ["토마토", "달걀", "대파"],
    seasoning: ["소금", "설탕"],
    minutes: 10,
  },
  {
    id: "salad",
    name: "샐러드",
    needs: ["양상추", "방울토마토", "오이"],
    seasoning: ["올리브유", "소금"],
    minutes: 10,
  },
  {
    id: "yachae-bokkeumbap",
    name: "야채볶음밥",
    needs: ["밥", "당근", "양파", "달걀"],
    seasoning: ["간장", "참기름"],
    minutes: 15,
  },
  {
    id: "gyeranjjim",
    name: "계란찜",
    needs: ["달걀", "대파"],
    seasoning: ["소금", "새우젓"],
    minutes: 15,
  },
];
