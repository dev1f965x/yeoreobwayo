import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";
import type { Gone, Item } from "./domain/fridge";
import type { Remembered } from "./domain/names";
import type { Photos } from "./storage/photos";
import type { Store } from "./storage/store";

const NOW = new Date(2026, 8, 23, 19, 0);
const TODAY = "2026-09-23";

function fakeStore(seed: { items?: Item[]; gone?: Gone[]; names?: Remembered[] } = {}): Store {
  let items = seed.items ?? [];
  let gone = seed.gone ?? [];
  let names = seed.names ?? [];

  return {
    readItems: () => items,
    writeItems: (next) => {
      items = [...next];
    },
    readGone: () => gone,
    writeGone: (next) => {
      gone = [...next];
    },
    readNames: () => names,
    writeNames: (next) => {
      names = [...next];
    },
  };
}

function fakePhotos(): Photos {
  const kept = new Map<string, Blob>();

  return {
    put: async (id, photo) => {
      kept.set(id, photo);
    },
    get: async (id) => kept.get(id),
    remove: async (id) => {
      kept.delete(id);
    },
  };
}

function item(name: string, over: Partial<Item> = {}): Item {
  return {
    id: name,
    name,
    kind: "vegetable",
    count: 1,
    expiresOn: "2026-09-30",
    addedOn: TODAY,
    ...over,
  };
}

function show(store: Store) {
  return render(<App store={store} photos={fakePhotos()} now={NOW} />);
}

describe("an empty fridge", () => {
  it("asks for the shopping rather than showing nothing", () => {
    show(fakeStore());

    expect(screen.getByText("아직 비어 있어요")).toBeInTheDocument();
  });
});

describe("unpacking", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it("puts a typed name in and stays open for the next thing", async () => {
    show(fakeStore());

    await user.click(screen.getByRole("button", { name: "장 본 것 담기" }));
    await user.type(screen.getByRole("textbox", { name: "이름" }), "애호박");
    await user.click(screen.getByRole("button", { name: "넣기" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/애호박 넣었어요/)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "이름" })).toHaveValue("");
  });

  it("guesses the expiry from the kind, and says how it guessed", async () => {
    show(fakeStore());

    await user.click(screen.getByRole("button", { name: "장 본 것 담기" }));
    await user.click(screen.getByRole("button", { name: "생선" }));

    expect(screen.getByText("생선은 보통 2일쯤이에요")).toBeInTheDocument();
    expect(screen.getByText("9월 25일 (금)")).toBeInTheDocument();
  });

  it("brings back the kind and the length a name was given last time", async () => {
    show(fakeStore({ names: [{ name: "우유", kind: "dairy", days: 5, usedOn: "2026-09-01" }] }));

    await user.click(screen.getByRole("button", { name: "장 본 것 담기" }));
    await user.type(screen.getByRole("textbox", { name: "이름" }), "우유");

    expect(screen.getByText("지난번엔 유제품으로 담았어요")).toBeInTheDocument();
    expect(screen.getByText("5일 남았어요")).toBeInTheDocument();
  });

  it("shows what went in once the bag is empty", async () => {
    show(fakeStore());

    await user.click(screen.getByRole("button", { name: "장 본 것 담기" }));
    await user.type(screen.getByRole("textbox", { name: "이름" }), "두부");
    await user.click(screen.getByRole("button", { name: "넣기" }));
    await user.click(screen.getByRole("button", { name: "다 넣었어요" }));

    expect(screen.getByText("두부")).toBeInTheDocument();
  });
});

describe("the fridge", () => {
  it("shows what has to go first at the top", () => {
    show(
      fakeStore({
        items: [item("간장", { expiresOn: "2027-01-01" }), item("상추", { expiresOn: TODAY })],
      }),
    );

    const names = screen.getAllByRole("listitem").map((row) => within(row).getByText(/간장|상추/));
    expect(names.map((each) => each.textContent)).toEqual(["상추", "간장"]);
  });

  it("drops the count when one is eaten, and puts it back when that was a mistake", async () => {
    const user = userEvent.setup();
    show(fakeStore({ items: [item("달걀", { count: 6 })] }));

    await user.click(screen.getByRole("button", { name: "달걀 먹음" }));
    expect(screen.getByText("5개")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "되돌리기" }));
    expect(screen.getByText("6개")).toBeInTheDocument();
  });

  it("counts what was thrown out apart from what was eaten", async () => {
    const user = userEvent.setup();
    show(fakeStore({ items: [item("상추"), item("우유")] }));

    await user.click(screen.getByRole("button", { name: "상추 먹음" }));
    await user.click(screen.getByRole("button", { name: "우유 버림" }));

    expect(screen.getByText("이번 달에 1개 먹고 1개 버렸어요")).toBeInTheDocument();
  });
});

describe("the recipes", () => {
  it("puts what the fridge can already make first", async () => {
    const user = userEvent.setup();
    show(fakeStore({ items: [item("달걀", { kind: "egg" }), item("대파")] }));

    await user.click(screen.getByRole("button", { name: "레시피" }));

    const first = screen.getAllByRole("listitem")[0];
    expect(within(first).getByText("지금 바로")).toBeInTheDocument();
  });
});
