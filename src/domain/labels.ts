import type { Day } from "./day";
import type { Freshness } from "./fridge";
import type { Kind } from "./kinds";
import { about, asA } from "./korean";

export const APP_NAME = "열어봐요";

export const KIND_LABELS: Record<Kind, string> = {
  vegetable: "채소",
  fruit: "과일",
  meat: "고기",
  fish: "생선",
  dairy: "유제품",
  egg: "달걀",
  side: "반찬",
  sauce: "소스",
  drink: "음료",
  frozen: "냉동",
  other: "기타",
};

export const TAB_LABELS = {
  pick: "보기",
  fridge: "냉장고",
  recipes: "레시피",
};

export const UNPACK_LABELS = {
  heading: "꺼내서 담기",
  name: "이름",
  namePlaceholder: "우유, 삼겹살, 애호박…",
  kind: "종류",
  count: "개수",
  more: "하나 더",
  fewer: "하나 덜",
  expiry: "언제까지",
  sooner: "하루 당기기",
  later: "하루 미루기",
  inDays: (days: number) => {
    if (days === 0) return "오늘";
    if (days === 30) return "한 달";
    return days % 7 === 0 ? `${days / 7}주` : `${days}일`;
  },
  photo: "사진",
  retake: "다시",
  put: "넣기",
  putAnother: "가방에서 하나 꺼내 주세요",
  remembered: (kind: string) => `지난번엔 ${asA(kind)} 담았어요`,
  guessed: (kind: string, days: number) => `${about(kind)} 보통 ${days}일쯤이에요`,
  done: (name: string) => `${name} 넣었어요. 다음 것도 꺼내 주세요`,
  close: "다 넣었어요",
};

export const FRIDGE_LABELS = {
  heading: "냉장고 안",
  empty: "아직 비어 있어요",
  emptyDetail: "장 보고 온 김에 하나씩 꺼내서 담아 볼까요.",
  open: "장 본 것 담기",
  count: (count: number) => `${count}개`,
  ate: "먹음",
  threw: "버림",
  ateOne: (name: string) => `${name} 하나 먹었어요`,
  threwOut: (name: string) => `${name} 버렸어요`,
  undo: "되돌리기",
  month: (eaten: number, thrown: number) =>
    thrown === 0
      ? `이번 달에 ${eaten}개 먹었어요`
      : `이번 달에 ${eaten}개 먹고 ${thrown}개 버렸어요`,
};

export const FRESHNESS_LABELS: Record<Freshness, string> = {
  past: "지났어요",
  today: "오늘까지",
  soon: "곧이에요",
  fine: "여유 있어요",
};

/** How long a thing has, said the way it would be said in the kitchen. */
export function describeLeft(days: number): string {
  if (days < -1) return `${-days}일 지났어요`;
  if (days === -1) return "어제까지였어요";
  if (days === 0) return "오늘까지예요";
  if (days === 1) return "내일까지예요";
  return `${days}일 남았어요`;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** A date the way it is said out loud, with the year only when it is not this one. */
export function describeDay(day: Day, from: Day): string {
  const date = new Date(`${day}T00:00:00`);
  const year = day.slice(0, 4) === from.slice(0, 4) ? "" : `${date.getFullYear()}년 `;
  return `${year}${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
}

export const RECIPE_LABELS = {
  heading: "이걸로 만들 수 있어요",
  ready: "지금 바로",
  short: (count: number) => `${count}개만 더`,
  missing: (names: readonly string[]) => `${names.join(", ")} 사면 돼요`,
  urgent: (names: readonly string[]) => `${names.join(", ")} 쓰기 좋아요`,
  minutes: (minutes: number) => `${minutes}분`,
  seasoning: (names: readonly string[]) => `양념은 ${names.join(", ")}`,
  empty: "냉장고가 비어서 아직 고를 게 없어요",
  emptyDetail: "하나라도 담으면 만들 수 있는 것부터 보여드려요.",
};
