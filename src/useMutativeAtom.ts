import type { Draft } from 'mutative';
import { useAtomValue } from 'jotai/react';
import type { WritableAtom } from 'jotai/vanilla';

import { useSetMutativeAtom } from './useSetMutativeAtom';

type Options = Parameters<typeof useAtomValue>[1];

export function useMutativeAtom<Value, Result>(
  anAtom: WritableAtom<Value, [(draft: Draft<Value>) => void], Result>,
  options?: Options
): [Value, (fn: (draft: Draft<Value>) => void) => Result];

export function useMutativeAtom<Value, Result>(
  anAtom: WritableAtom<Value, [(value: Value) => Value], Result>,
  options?: Options
): [Value, (fn: (draft: Draft<Value>) => void) => Result];

export function useMutativeAtom<Value, Result>(
  anAtom: WritableAtom<Value, [(value: Value) => Value], Result>,
  options?: Options
) {
  return [useAtomValue(anAtom, options), useSetMutativeAtom(anAtom, options)];
}
