import { rawReturn, type Draft } from 'mutative';

/**
 * The recipe that a mutative atom passes to create() for an update: the
 * update itself, or a recipe that returns the value to set.
 */
export function toRecipe<Value>(
  fn: Value | ((draft: Draft<Value>) => void)
): (draft: Draft<Value>) => Value | void {
  if (typeof fn === 'function') {
    return fn as (draft: Draft<Value>) => void;
  }
  // The value exists before create() drafts the state, so it holds none of
  // its drafts, and rawReturn() spares searching it for them. Other values
  // are returned as they are, as create() never searches them.
  return () => (typeof fn === 'object' && fn !== null ? rawReturn(fn) : fn);
}
