import React from 'react';
import { StrictMode } from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { useAtomValue } from 'jotai/react';
import { atom } from 'jotai/vanilla';
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
