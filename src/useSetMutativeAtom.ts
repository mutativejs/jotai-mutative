import { useCallback } from 'react';
import { create } from 'mutative';
import type { Draft } from 'mutative';
import { useSetAtom } from 'jotai/react';
import type { WritableAtom } from 'jotai/vanilla';

type Options = Parameters<typeof useSetAtom>[1];

export function useSetMutativeAtom<Value, Result>(
  anAtom: WritableAtom<Value, [(draft: Draft<Value>) => void], Result>,
  options?: Options,
): (fn: (draft: Draft<Value>) => void) => Result;

export function useSetMutativeAtom<Value, Result>(
  anAtom: WritableAtom<Value, [(value: Value) => Value], Result>,
  options?: Options,
): (fn: (draft: Draft<Value>) => void) => Result;

export function useSetMutativeAtom<Value, Result>(
  anAtom: WritableAtom<Value, [(value: Value) => Value], Result>,
  options?: Options,
) {
  const setState = useSetAtom(anAtom, options);
  return useCallback(
    (fn: (draft: Draft<Value>) => void) => setState(create(fn)),
    [setState],
  );
}
