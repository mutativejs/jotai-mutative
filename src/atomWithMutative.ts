import { create, type Draft } from 'mutative';
import { atom } from 'jotai/vanilla';
import type { WritableAtom } from 'jotai/vanilla';
import type { MutativeOptions } from './interface';

export function atomWithMutative<Value, F extends boolean = false>(
  initialValue: Value,
  options?: MutativeOptions<false, F>
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
            : () => fn,
          options
        ) as Value
      )
  );
  return anAtom;
}
