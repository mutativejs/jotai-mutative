import type { Draft } from 'mutative';
import { atom } from 'jotai/vanilla';
import type { WritableAtom } from 'jotai/vanilla';
import type { MutativeOptions } from './interface';
import { mutativeAtoms } from './mutativeAtoms';
import { nextValue } from './nextValue';

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
      set(anAtom, nextValue(get(anAtom), fn, options))
  );
  mutativeAtoms.add(anAtom);
  return anAtom;
}
