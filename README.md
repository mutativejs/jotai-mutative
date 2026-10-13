# jotai-mutative

![Node CI](https://github.com/mutativejs/jotai-mutative/workflows/Node%20CI/badge.svg)
[![npm](https://img.shields.io/npm/v/jotai-mutative.svg)](https://www.npmjs.com/package/jotai-mutative)
![license](https://img.shields.io/npm/l/jotai-mutative)

A [Mutative](https://github.com/unadlib/mutative) extension for Jotai

With the Mutative extension, you can simplify the handling of immutable data in Jotai in a mutable way, allowing you to use immutable state more conveniently.

`jotai-mutative` is more than 10x faster than `jotai-immer`. [Read more about the performance comparison in Mutative](https://mutative.js.org/docs/getting-started/performance).

## Installation

In order to use the Mutative extension in Jotai, you will need to install Mutative and Jotai as a direct dependency.

```bash
npm install jotai mutative jotai-mutative
# Or use any package manager of your choice.
```

| jotai-mutative | mutative |
| -------------- | -------- |
| 2.x            | 2.x      |
| 1.x            | 1.x      |

### Upgrading to Mutative v2

`jotai-mutative` 2.x declares `mutative` ^2.0.0 as its peer dependency, so upgrade both together:

```bash
npm install jotai-mutative@2 mutative@2
```

The API is unchanged: the atoms and hooks take the same recipes and the same Mutative options. The changes that can affect an atom are:

- With `enableAutoFreeze: true`, Map and Set instances in the atom value are frozen too, so adding a property to them or replacing one of their methods fails.
- `useMutativeAtom()` and `useSetMutativeAtom()` without Mutative options pass the recipe to an atom from `atomWithMutative()` or `withMutative()`, so the Mutative options of the atom apply to it.
- Mutative selects its development or production build from `process.env.NODE_ENV`. Define it in every bundle, including bundles for Node.js, and in production, match errors by their `Minified Mutative error #<code>` codes instead of their messages.
- Mutative targets ES2018; transpile it for older engines. Without a bundler, map `mutative` to its production ESM build, `mutative/dist/mutative.esm.production.min.mjs`, as its default ESM build reads `process`, or load its UMD build, which defines the `Mutative` global that the UMD build of `jotai-mutative` reads.
- The type declarations of Mutative support TypeScript 5.0 and later.

See the [migration guide](https://mutative.js.org/docs/advanced-guides/migration-v2/) for every change in Mutative v2.

## Usage

### atomWithMutative

`atomWithMutative` creates a new atom similar to the regular atom with a different `writeFunction`. In this bundle, we don't have read-only atoms, because the point of these functions is the mutative create(mutability) function. The signature of writeFunction is `(get, set, update: (draft: Draft<Value>) => void) => void`.

```tsx
import { useAtom } from 'jotai';
import { atomWithMutative } from 'jotai-mutative';

const countAtom = atomWithMutative({ value: 0 });

const Counter = () => {
  const [count] = useAtom(countAtom);
  return <div>count: {count.value}</div>;
};

const Controls = () => {
  const [, setCount] = useAtom(countAtom);
  // setCount === update : (draft: Draft<Value>) => void
  const inc = () =>
    setCount((draft) => {
      ++draft.value;
    });
  return <button onClick={inc}>+1</button>;
};
```

### withMutative

`withMutative` takes an atom and returns a derived atom, same as `atomWithMutative` it has a different `writeFunction`.

```tsx
import { useAtom, atom } from 'jotai';
import { withMutative } from 'jotai-mutative';

const primitiveAtom = atom({ value: 0 });
const countAtom = withMutative(primitiveAtom);

const Counter = () => {
  const [count] = useAtom(countAtom);
  return <div>count: {count.value}</div>;
};

const Controls = () => {
  const [, setCount] = useAtom(countAtom);
  // setCount === update : (draft: Draft<Value>) => void
  const inc = () =>
    setCount((draft) => {
      ++draft.value;
    });
  return <button onClick={inc}>+1</button>;
};
```

### useMutativeAtom

This hook takes an atom and replaces the atom's `writeFunction` with the new mutative-like `writeFunction` like the previous helpers.

```tsx
import { useAtom } from 'jotai';
import { useMutativeAtom } from 'jotai-mutative';

const primitiveAtom = atom({ value: 0 });

const Counter = () => {
  const [count] = useMutativeAtom(primitiveAtom);
  return <div>count: {count.value}</div>;
};

const Controls = () => {
  const [, setCount] = useMutativeAtom(primitiveAtom);
  // setCount === update : (draft: Draft<Value>) => void
  const inc = () =>
    setCount((draft) => {
      ++draft.value;
    });
  return <button onClick={inc}>+1</button>;
};
```

> It would be better if you don't use `withMutative` and `atomWithMutative` with `useMutativeAtom` because they provide the mutative-like `writeFunction` and we don't need to create a new one.
> If you do, the hook passes the recipe to the atom's `writeFunction`, so the Mutative options of the atom apply. With Mutative options of its own, the hook creates the next value from the draft that the atom passes, which Mutative 2 reports once in development; set the options on the atom instead.
> You can use `useSetMutativeAtom` if you need only the setter part of `useMutativeAtom`.

### Mutative Options

- [Strict mode](https://mutative.js.org/docs/advanced-guides/strict-mode)
- [Auto Freeze](https://mutative.js.org/docs/advanced-guides/auto-freeze)
- [Marking data structure](https://mutative.js.org/docs/advanced-guides/mark)

## Credits

`jotai-mutative` is inspired by `jotai-immer`.

It uses the same API as `jotai-immer` but uses Mutative under the hood. The repository is based on the `jotai-immer` repository.

## License

`jotai-mutative` is [MIT licensed](https://github.com/mutativejs/jotai-mutative/blob/main/LICENSE).
