import { create, rawReturn, type Draft } from 'mutative';
import type { MutativeOptions } from './interface';

/**
 * The next value of a mutative atom for an update: a recipe, or the value to
 * set.
 */
export function nextValue<Value, F extends boolean>(
  value: Value,
  fn: Value | ((draft: Draft<Value>) => void),
  options?: MutativeOptions<false, F>
): Value {
  if (typeof fn === 'function') {
    return create(value, fn as (draft: Draft<Value>) => void, options) as Value;
  }
  // The value to set exists before create() could draft the state, so it
  // holds none of its drafts, and create() would return it as it is.
  if (!options?.enableAutoFreeze) {
    return fn;
  }
  // With auto-freeze, create() freezes it. rawReturn() spares searching it
  // for drafts, except in strict mode, and sets undefined, which create()
  // would take as a recipe that returns nothing. Other values are returned
  // as they are, as create() never searches them.
  return create(
    value,
    () =>
      fn === undefined || (typeof fn === 'object' && fn !== null)
        ? (rawReturn(fn as object | undefined) as Value)
        : fn,
    options
  ) as Value;
}
