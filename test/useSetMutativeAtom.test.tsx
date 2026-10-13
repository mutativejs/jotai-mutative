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

  test('changes the draft of a mutative atom in place', () => {
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
    warn.mockRestore();
  });

  test('changes the draft of a derived mutative atom in place', () => {
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
    warn.mockRestore();
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

  test('applies the latest mutative options', () => {
    const store = createStore();
    const stateAtom = atom({ count: 0 });
    const { result, rerender } = renderHook(
      ({ enableAutoFreeze }: { enableAutoFreeze: boolean }) =>
        useSetMutativeAtom(stateAtom, undefined, { enableAutoFreeze }),
      { initialProps: { enableAutoFreeze: false }, wrapper: withStore(store) }
    );
    const setState = result.current;

    // Equal options, such as an inline object, keep the setter.
    rerender({ enableAutoFreeze: false });
    expect(result.current).toBe(setState);

    rerender({ enableAutoFreeze: true });
    act(() =>
      result.current((draft) => {
        draft.count += 1;
      })
    );

    expect(store.get(stateAtom)).toEqual({ count: 1 });
    expect(Object.isFrozen(store.get(stateAtom))).toBe(true);
  });
});
