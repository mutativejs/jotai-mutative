import { create, type Draft } from 'mutative';
import { atom } from 'jotai/vanilla';
import type { PrimitiveAtom, WritableAtom } from 'jotai/vanilla';

const cache1 = new WeakMap();
const memo1 = <T>(create: () => T, dep1: object): T =>
  (cache1.has(dep1) ? cache1 : cache1.set(dep1, create())).get(dep1);

export function withMutative<Value, Args extends unknown[], Result>(
  anAtom: WritableAtom<Value, Args, Result>,
): WritableAtom<
  Value,
  Args extends [Value | infer OtherValue]
    ? [
        | Value
        | ((draft: Draft<Value>) => void)
        | Exclude<OtherValue, (...args: never[]) => unknown>,
      ]
    : unknown[],
  Result
>;

export function withMutative<Value>(
  anAtom: PrimitiveAtom<Value>,
): WritableAtom<Value, [Value | ((draft: Draft<Value>) => void)], void>;

export function withMutative<Value, Result>(
  anAtom: WritableAtom<Value, [Value], Result>,
) {
  return memo1(() => {
    const derivedAtom = atom(
      (get) => get(anAtom),
      (get, set, fn: Value | ((draft: Draft<Value>) => void)) =>
        set(
          anAtom,
          create(
            get(anAtom),
            typeof fn === 'function'
              ? (fn as (draft: Draft<Value>) => void)
              : () => fn,
          ),
        ),
    );
    return derivedAtom;
  }, anAtom);
}
