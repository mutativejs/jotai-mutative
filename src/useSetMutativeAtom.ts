import { useCallback } from 'react';
import { create, isDraft, type Draft } from 'mutative';
import { useSetAtom } from 'jotai/react';
import type { WritableAtom } from 'jotai/vanilla';
import type { MutativeOptions } from './interface';

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
  return useCallback(
    (fn: (draft: Draft<Value>) => void) =>
      setState(
        // The write function of an atom from atomWithMutative() or
        // withMutative() passes a draft, which the recipe changes in place:
        // create() would draft a copy of it, current(draft), and warn.
        ((value: Value) =>
          isDraft(value)
            ? fn(value as Draft<Value>)
            : create(value, fn, mutativeOptions)) as (value: Value) => Value
      ),
    [setState]
  );
}
