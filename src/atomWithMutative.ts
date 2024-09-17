import { create } from 'mutative';
import type { Draft } from 'mutative';
import { atom } from 'jotai/vanilla';
import type { WritableAtom } from 'jotai/vanilla';

export function atomWithMutative<Value>(
  initialValue: Value
): WritableAtom<Value, [Value | ((draft: Draft<Value>) => void)], void> {
  const anAtom: WritableAtom<
    Value,
    [Value | ((draft: Draft<Value>) => void)],
    void
  > = atom(
    initialValue,
    (get, set, fn: Value | ((draft: Draft<Value>) => void)) =>
      set(
        anAtom,
        create(
          get(anAtom),
          typeof fn === 'function'
            ? (fn as (draft: Draft<Value>) => void)
            : () => fn
        )
      )
  );
  return anAtom;
}
