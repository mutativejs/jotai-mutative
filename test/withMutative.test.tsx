import { StrictMode } from 'react';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { useAtom } from 'jotai/react';
import { atomWithDefault, useResetAtom } from 'jotai/utils';
import { atom, createStore } from 'jotai/vanilla';
import { withMutative } from '../src';

afterEach(cleanup);

test('withMutative derived atom with useAtom', async () => {
  const regularCountAtom = atom(0);

  const Parent = () => {
    const [count, setCount] = useAtom(withMutative(regularCountAtom));
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

test('withMutative derived atom with WritableAtom<Value, [Value]> signature', async () => {
  const regularCountAtom = atom(0);

  const Parent = () => {
    const [count, setCount] = useAtom(withMutative(regularCountAtom));
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

test('withMutative derived atom with WritableAtom<Value, [Value | OtherValue]> signature', async () => {
  const regularCountAtom = atomWithDefault(() => 0);
  const mutativeCountAtom = withMutative(regularCountAtom);

  const Parent = () => {
    const [count, setCount] = useAtom(mutativeCountAtom);
    const resetCount = useResetAtom(mutativeCountAtom);
    return (
      <>
        <div>count: {count}</div>
        <button onClick={() => setCount(count + 1)}>Increase</button>
        <button onClick={() => setCount(count - 1)}>Decrease</button>
        <button onClick={() => resetCount()}>Reset</button>
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

  fireEvent.click(getByText('Increase'));
  fireEvent.click(getByText('Increase'));
  await findByText('count: 2');

  fireEvent.click(getByText('Reset'));
  await findByText('count: 0');
});

test.each([
  ['no options', undefined, false],
  ['strict mode', { strict: true }, false],
  ['auto-freeze', { enableAutoFreeze: true }, true],
] as const)(
  'withMutative sets an object value as it is with %s',
  (_, options, frozen) => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const store = createStore();
    const stateAtom = withMutative(
      atom({ count: 0, list: [{ id: 1 }] }),
      options
    );
    const value = { count: 1, list: store.get(stateAtom).list };

    store.set(stateAtom, value);

    expect(store.get(stateAtom)).toBe(value);
    expect(Object.isFrozen(value)).toBe(frozen);
    expect(warn).not.toHaveBeenCalled();
  }
);

test.each([
  ['no options', undefined],
  ['auto-freeze', { enableAutoFreeze: true }],
] as const)('withMutative sets undefined with %s', (_, options) => {
  const store = createStore();
  const stateAtom = withMutative(
    atom<{ count: number } | undefined>({ count: 0 }),
    options
  );

  store.set(stateAtom, undefined);

  expect(store.get(stateAtom)).toBe(undefined);
});

test('withMutative sets a value on a state that Mutative cannot draft', () => {
  const store = createStore();
  const dateAtom = withMutative(atom(new Date(0)));
  const date = new Date(1);

  store.set(dateAtom, date);

  expect(store.get(dateAtom)).toBe(date);
});

test('withMutative derives an atom for each value of its options', () => {
  const store = createStore();
  const baseAtom = atom({ count: 0 });
  const plainAtom = withMutative(baseAtom);
  const frozenAtom = withMutative(baseAtom, { enableAutoFreeze: true });

  // Equal options, such as inline objects in a render, give the same atom.
  expect(withMutative(baseAtom)).toBe(plainAtom);
  expect(withMutative(baseAtom, { strict: undefined })).toBe(plainAtom);
  expect(withMutative(baseAtom, { enableAutoFreeze: true })).toBe(frozenAtom);
  expect(frozenAtom).not.toBe(plainAtom);

  store.set(plainAtom, (draft) => {
    draft.count += 1;
  });
  expect(Object.isFrozen(store.get(baseAtom))).toBe(false);
  store.set(frozenAtom, (draft) => {
    draft.count += 1;
  });
  expect(store.get(baseAtom)).toEqual({ count: 2 });
  expect(Object.isFrozen(store.get(baseAtom))).toBe(true);
});

test('withMutative derived atom with inline options in a render', async () => {
  const regularCountAtom = atom({ value: 0 });

  const Parent = () => {
    const [count, setCount] = useAtom(
      withMutative(regularCountAtom, { enableAutoFreeze: true })
    );
    return (
      <>
        <div>count: {count.value}</div>
        <button
          onClick={() =>
            setCount((draft) => {
              draft.value += 1;
            })
          }
        >
          Increase
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
});
