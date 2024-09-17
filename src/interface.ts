import { type Options, type PatchesOptions } from 'mutative';

export type MutativeOptions<O extends PatchesOptions, F extends boolean> = Pick<
  Options<O, F>,
  Exclude<keyof Options<O, F>, 'enablePatches'>
>;
