import type { Atom } from 'jotai/vanilla';

/**
 * The atoms of atomWithMutative() and withMutative(), whose write functions
 * apply a recipe to a draft of their value with their Mutative options.
 */
export const mutativeAtoms = new WeakSet<Atom<unknown>>();
