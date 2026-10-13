import React from 'react';
import { StrictMode } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { useAtom } from 'jotai/react';
import { createStore } from 'jotai/vanilla';
import { atomWithMutative } from '../src';

afterEach(cleanup);

test('atomWithMutative with useAtom', async () => {
  const countAtom = atomWithMutative(0);

  const Parent = () => {
    const [count, setCount] = useAtom(countAtom);
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

test('atomWithMutative with WritableAtom<Value, Value> signature', async () => {
  const countAtom = atomWithMutative(0);

  const Parent = () => {
    const [count, setCount] = useAtom(countAtom);
    return (
      <>
        <div>count: {count}</div>
        <button onClick={() => setCount(count + 1)}>Increase</button>
        <button onClick={() => setCount(count - 1)}>Decrease</button>
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

test.each([
  ['no options', undefined, false],
  ['strict mode', { strict: true }, false],
  ['auto-freeze', { enableAutoFreeze: true }, true],
] as const)(
  'atomWithMutative sets an object value as it is with %s',
  (_, options, frozen) => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const store = createStore();
    const stateAtom = atomWithMutative(
      { count: 0, list: [{ id: 1 }] },
      options
    );
    const value = { count: 1, list: store.get(stateAtom).list };

    store.set(stateAtom, value);

    expect(store.get(stateAtom)).toBe(value);
    expect(Object.isFrozen(value)).toBe(frozen);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  }
);

test.each([
  ['no options', undefined],
  ['auto-freeze', { enableAutoFreeze: true }],
] as const)('atomWithMutative sets undefined with %s', (_, options) => {
  const store = createStore();
  const stateAtom = atomWithMutative(
    { count: 0 } as { count: number } | undefined,
    options
  );

  store.set(stateAtom, undefined);

  expect(store.get(stateAtom)).toBe(undefined);
});
