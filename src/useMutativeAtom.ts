import type { Draft } from 'mutative';
import { useAtomValue } from 'jotai/react';
import type { WritableAtom } from 'jotai/vanilla';

import { useSetMutativeAtom } from './useSetMutativeAtom';
import type { MutativeOptions } from './interface';

type Options = Parameters<typeof useAtomValue>[1];

export function useMutativeAtom<Value, Result, F extends boolean = false>(
  anAtom: WritableAtom<Value, [(draft: Draft<Value>) => void], Result>,
  options?: Options,
  mutativeOptions?: MutativeOptions<false, F>
): [Value, (fn: (draft: Draft<Value>) => void) => Result];

export function useMutativeAtom<Value, Result, F extends boolean = false>(
  anAtom: WritableAtom<Value, [(value: Value) => Value], Result>,
  options?: Options,
  mutativeOptions?: MutativeOptions<false, F>
): [Value, (fn: (draft: Draft<Value>) => void) => Result];

export function useMutativeAtom<Value, Result, F extends boolean = false>(
  anAtom: WritableAtom<Value, [(value: Value) => Value], Result>,
  options?: Options,
  mutativeOptions?: MutativeOptions<false, F>
) {
  return [
    useAtomValue(anAtom, options),
    useSetMutativeAtom(anAtom, options, mutativeOptions),
  ];
}
