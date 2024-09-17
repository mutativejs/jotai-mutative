import { StrictMode } from 'react';
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { useAtom } from 'jotai/react';
import { atomWithDefault, useResetAtom } from 'jotai/utils';
import { atom } from 'jotai/vanilla';
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
