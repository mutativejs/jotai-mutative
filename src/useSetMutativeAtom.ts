import { useCallback, useRef } from 'react';
import { create, type Draft } from 'mutative';
import { useSetAtom } from 'jotai/react';
import type { WritableAtom } from 'jotai/vanilla';
import type { MutativeOptions } from './interface';
import { mutativeAtoms } from './mutativeAtoms';

type Options = Parameters<typeof useSetAtom>[1];

export function useSetMutativeAtom<Value, Result, F extends boolean = false>(
  anAtom: WritableAtom<Value, [(draft: Draft<Value>) => void], Result>,
  options?: Options,
  mutativeOptions?: MutativeOptions<false, F>
): (fn: (draft: Draft<Value>) => void) => Result;

export function useSetMutativeAtom<Value, Result, F extends boolean = false>(
  anAtom: WritableAtom<Value, [(value: Value) => Value], Result>,
  options?: Options,
  mutativeOptions?: MutativeOptions<false, F>
): (fn: (draft: Draft<Value>) => void) => Result;

export function useSetMutativeAtom<Value, Result, F extends boolean = false>(
  anAtom: WritableAtom<Value, [(value: Value) => Value], Result>,
  options?: Options,
  mutativeOptions?: MutativeOptions<false, F>
) {
  const setState = useSetAtom(anAtom, options);
  // The setter reads the options of the latest render, so that it stays the
  // same while they change, as inline options do on every render.
  const mutativeOptionsRef = useRef(mutativeOptions);
  mutativeOptionsRef.current = mutativeOptions;
  return useCallback(
    (fn: (draft: Draft<Value>) => void) => {
      const mutativeOptions = mutativeOptionsRef.current;
      // The atoms of atomWithMutative() and withMutative() apply the recipe
      // themselves. Other atoms, or options of the hook, need its create(),
      // which then gives the next value to the write function of the atom.
      return mutativeOptions === undefined && mutativeAtoms.has(anAtom)
        ? setState(fn as unknown as (value: Value) => Value)
        : setState(create(fn, mutativeOptions) as (value: Value) => Value);
    },
    [setState, anAtom]
  );
}
