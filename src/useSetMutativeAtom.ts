import { useCallback } from 'react';
import { create, type Draft } from 'mutative';
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
      setState(create(fn, mutativeOptions) as () => Value),
    [setState]
  );
}
