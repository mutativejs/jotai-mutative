import { create, type Draft } from 'mutative';
import { atom } from 'jotai/vanilla';
import type { PrimitiveAtom, WritableAtom } from 'jotai/vanilla';
import type { MutativeOptions } from './interface';

const cache1 = new WeakMap();
const memo1 = <T>(create1: () => T, dep1: object): T =>
  (cache1.has(dep1) ? cache1 : cache1.set(dep1, create1())).get(dep1);

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
            options
          ) as Value
        )
    );
    return derivedAtom;
  }, anAtom);
}
