import type { Draft } from 'mutative';
import { atom } from 'jotai/vanilla';
import type { PrimitiveAtom, WritableAtom } from 'jotai/vanilla';
import type { MutativeOptions } from './interface';
import { mutativeAtoms } from './mutativeAtoms';
import { nextValue } from './nextValue';

// The derived atoms of each atom, by the defined entries of their options,
// so that equal options, such as an inline object in a render, give the same
// derived atom.
const cache = new WeakMap<object, Map<unknown, any>>();
const derived = Symbol();
const memo = <T>(create: () => T, anAtom: object, options: object = {}): T => {
  if (!cache.has(anAtom)) cache.set(anAtom, new Map());
  let deps = cache.get(anAtom)!;
  const entries = Object.entries(options)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : 1));
  for (const entry of entries) {
    for (const dep of entry) {
      if (!deps.has(dep)) deps.set(dep, new Map());
      deps = deps.get(dep);
    }
  }
  if (!deps.has(derived)) deps.set(derived, create());
  return deps.get(derived);
};

export function withMutative<
  Value,
  Args extends unknown[],
  Result,
  F extends boolean = false
>(
  anAtom: WritableAtom<Value, Args, Result>,
  options?: MutativeOptions<false, F>
): WritableAtom<
  Value,
  Args extends [Value | infer OtherValue]
    ? [
        | Value
        | ((draft: Draft<Value>) => void)
        | Exclude<OtherValue, (...args: never[]) => unknown>
      ]
    : unknown[],
  Result
>;

export function withMutative<Value, F extends boolean = false>(
  anAtom: PrimitiveAtom<Value>,
  options?: MutativeOptions<false, F>
): WritableAtom<Value, [Value | ((draft: Draft<Value>) => void)], void>;

export function withMutative<Value, Result, F extends boolean = false>(
  anAtom: WritableAtom<Value, [Value], Result>,
  options?: MutativeOptions<false, F>
) {
  return memo(
    () => {
      const derivedAtom = atom(
        (get) => get(anAtom),
        (get, set, fn: Value | ((draft: Draft<Value>) => void)) =>
          set(anAtom, nextValue(get(anAtom), fn, options))
      );
      mutativeAtoms.add(derivedAtom);
      return derivedAtom;
    },
    anAtom,
    options
  );
}
