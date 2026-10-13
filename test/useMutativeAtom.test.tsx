import { StrictMode } from 'react';
import React from 'react';
import type { ReactNode } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
} from '@testing-library/react';
import { Provider } from 'jotai/react';
import { atom, createStore } from 'jotai/vanilla';
import { atomWithMutative, useMutativeAtom, withMutative } from '../src';

afterEach(cleanup);

test('useMutativeAtom with regular atom', async () => {
  const countAtom = atom(0);

  const Parent = () => {
    const [count, setCount] = useMutativeAtom(countAtom);
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

test('useMutativeAtom with mutative atom', async () => {
  const countAtom = atomWithMutative(0);

  const Parent = () => {
    const [count, setCount] = useMutativeAtom(countAtom);
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

test('useMutativeAtom with derived mutative atom', async () => {
  const regularCountAtom = atom(0);
  const countAtom = withMutative(regularCountAtom);

  const Parent = () => {
    const [count, setCount] = useMutativeAtom(countAtom);
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

test('useMutativeAtom changes the draft of a mutative atom in place', () => {
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const store = createStore();
  const stateAtom = atomWithMutative({ count: 0, list: [{ id: 1 }] });
  const baseState = store.get(stateAtom);
  const { result } = renderHook(() => useMutativeAtom(stateAtom), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  });

  act(() =>
    result.current[1]((draft) => {
      draft.count += 1;
    })
  );

  expect(result.current[0]).toEqual({ count: 1, list: [{ id: 1 }] });
  expect(result.current[0].list).toBe(baseState.list);
  expect(warn).not.toHaveBeenCalled();
  warn.mockRestore();
});
