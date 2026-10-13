import React from 'react';
import { StrictMode } from 'react';
import type { ReactNode } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
} from '@testing-library/react';
import { Provider, useAtomValue } from 'jotai/react';
import { atom, createStore } from 'jotai/vanilla';
import { create } from 'mutative';
import { atomWithMutative, useSetMutativeAtom, withMutative } from '../src';

afterEach(cleanup);

test('useSetMutativeAtom with regular atom', async () => {
  const countAtom = atom(0);

  const Parent = () => {
    const count = useAtomValue(countAtom);
    const setCount = useSetMutativeAtom(countAtom);
    return (
      <>
        <div>count: {count}</div>
        <button onClick={() => setCount((draft) => (draft = draft + 1))}>
          Increase
        </button>
        <button onClick={() => setCount((draft) => (draft = draft - 1))}>
          Decrease
        </button>
      </>
    );
  };

  const { findByText, getByText } = render(
    <StrictMode>
      <Parent />
    </StrictMode>
  );

  await findByText('count: 0');

  fireEvent.click(getByText('Increase'));
  await findByText('count: 1');

  fireEvent.click(getByText('Decrease'));
  await findByText('count: 0');
});

test('useSetMutativeAtom with mutative atom', async () => {
  const countAtom = atomWithMutative(0);

  const Parent = () => {
    const count = useAtomValue(countAtom);
    const setCount = useSetMutativeAtom(countAtom);
    return (
      <>
        <div>count: {count}</div>
        <button onClick={() => setCount((draft) => (draft = draft + 1))}>
          Increase
        </button>
        <button onClick={() => setCount((draft) => (draft = draft - 1))}>
          Decrease
        </button>
      </>
    );
  };

  const { findByText, getByText } = render(
    <StrictMode>
      <Parent />
    </StrictMode>
  );

  await findByText('count: 0');

  fireEvent.click(getByText('Increase'));
  await findByText('count: 1');

  fireEvent.click(getByText('Decrease'));
  await findByText('count: 0');
});

test('useSetMutativeAtom with derived mutative atom', async () => {
  const regularCountAtom = atom(0);
  const countAtom = withMutative(regularCountAtom);

  const Parent = () => {
    const count = useAtomValue(countAtom);
    const setCount = useSetMutativeAtom(countAtom);
    return (
      <>
        <div>count: {count}</div>
        <button onClick={() => setCount((draft) => (draft = draft + 1))}>
          Increase
        </button>
        <button onClick={() => setCount((draft) => (draft = draft - 1))}>
          Decrease
        </button>
      </>
    );
  };

  const { findByText, getByText } = render(
    <StrictMode>
      <Parent />
    </StrictMode>
  );

  await findByText('count: 0');

  fireEvent.click(getByText('Increase'));
  await findByText('count: 1');

  fireEvent.click(getByText('Decrease'));
  await findByText('count: 0');
});

describe('useSetMutativeAtom with an object state', () => {
  const withStore =
    (store: ReturnType<typeof createStore>) =>
    ({ children }: { children: ReactNode }) =>
      <Provider store={store}>{children}</Provider>;

  test('passes the recipe to a mutative atom', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const store = createStore();
    const stateAtom = atomWithMutative({ count: 0, list: [{ id: 1 }] });
    const baseState = store.get(stateAtom);
    const { result } = renderHook(() => useSetMutativeAtom(stateAtom), {
      wrapper: withStore(store),
    });

    act(() =>
      result.current((draft) => {
        draft.count += 1;
      })
    );

    expect(store.get(stateAtom)).toEqual({ count: 1, list: [{ id: 1 }] });
    expect(store.get(stateAtom).list).toBe(baseState.list);
    expect(warn).not.toHaveBeenCalled();
  });

  test('passes the recipe to a derived mutative atom', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const store = createStore();
    const stateAtom = withMutative(atom({ count: 0, list: [{ id: 1 }] }));
    const baseState = store.get(stateAtom);
    const { result } = renderHook(() => useSetMutativeAtom(stateAtom), {
      wrapper: withStore(store),
    });

    act(() =>
      result.current((draft) => {
        draft.count += 1;
      })
    );

    expect(store.get(stateAtom)).toEqual({ count: 1, list: [{ id: 1 }] });
    expect(store.get(stateAtom).list).toBe(baseState.list);
    expect(warn).not.toHaveBeenCalled();
  });

  test('applies its mutative options to a regular atom', () => {
    const store = createStore();
    const stateAtom = atom({ count: 0 });
    const { result } = renderHook(
      () =>
        useSetMutativeAtom(stateAtom, undefined, { enableAutoFreeze: true }),
      { wrapper: withStore(store) }
    );

    act(() =>
      result.current((draft) => {
        draft.count += 1;
      })
    );

    expect(store.get(stateAtom)).toEqual({ count: 1 });
    expect(Object.isFrozen(store.get(stateAtom))).toBe(true);
  });

  test('applies the mutative options of a mutative atom', () => {
    const store = createStore();
    const stateAtom = atomWithMutative(
      { count: 0 },
      { enableAutoFreeze: true }
    );
    const { result } = renderHook(() => useSetMutativeAtom(stateAtom), {
      wrapper: withStore(store),
    });

    act(() =>
      result.current((draft) => {
        draft.count += 1;
      })
    );

    expect(store.get(stateAtom)).toEqual({ count: 1 });
    expect(Object.isFrozen(store.get(stateAtom))).toBe(true);
  });

  test('applies its mutative options to a mutative atom', () => {
    // Mutative warns that create() received a draft of the atom.
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const store = createStore();
    const stateAtom = atomWithMutative({ count: 0 });
    const { result } = renderHook(
      () =>
        useSetMutativeAtom(stateAtom, undefined, { enableAutoFreeze: true }),
      { wrapper: withStore(store) }
    );

    act(() =>
      result.current((draft) => {
        draft.count += 1;
      })
    );

    expect(store.get(stateAtom)).toEqual({ count: 1 });
    expect(Object.isFrozen(store.get(stateAtom))).toBe(true);
  });

  test('gives the next value to atoms that pass it a draft', () => {
    // Mutative warns that create() received a draft of the atom.
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const store = createStore();
    const baseAtom = atomWithMutative({ items: [1], other: 1 });
    const spreadAtom = atom(
      (get) => get(baseAtom).items,
      (_get, set, update: (items: number[]) => number[]) =>
        set(baseAtom, (draft) => ({ ...draft, items: update(draft.items) }))
    );
    const assignAtom = atom(
      (get) => get(baseAtom).items,
      (get, set, update: (items: number[]) => number[]) =>
        set(
          baseAtom,
          create(get(baseAtom), (draft) => {
            draft.items = update(draft.items);
          })
        )
    );

    for (const itemsAtom of [spreadAtom, assignAtom]) {
      store.set(baseAtom, { items: [1], other: 1 });
      const baseState = store.get(baseAtom);
      const { result } = renderHook(() => useSetMutativeAtom(itemsAtom), {
        wrapper: withStore(store),
      });

      act(() =>
        result.current((draft) => {
          draft.push(2);
        })
      );

      expect(store.get(baseAtom)).toEqual({ items: [1, 2], other: 1 });
      expect(baseState).toEqual({ items: [1], other: 1 });
    }
  });

  test('keeps its setter and applies the latest mutative options', () => {
    const store = createStore();
    const stateAtom = atom({ count: 0 });
    const { result, rerender } = renderHook(
      ({ enableAutoFreeze }: { enableAutoFreeze: boolean }) =>
        useSetMutativeAtom(stateAtom, undefined, {
          enableAutoFreeze,
          mark: () => undefined,
        }),
      { initialProps: { enableAutoFreeze: false }, wrapper: withStore(store) }
    );
    const setState = result.current;

    // Inline options, a new mark included, keep the setter.
    rerender({ enableAutoFreeze: false });
    expect(result.current).toBe(setState);

    rerender({ enableAutoFreeze: true });
    expect(result.current).toBe(setState);
    act(() =>
      result.current((draft) => {
        draft.count += 1;
      })
    );

    expect(store.get(stateAtom)).toEqual({ count: 1 });
    expect(Object.isFrozen(store.get(stateAtom))).toBe(true);
  });
});
