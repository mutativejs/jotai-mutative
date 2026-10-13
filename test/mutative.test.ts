import { createStore } from 'jotai/vanilla';
import { atomWithMutative } from '../src';

test('atomWithMutative freezes the next state with enableAutoFreeze', () => {
  const store = createStore();
  const todosAtom = atomWithMutative(
    {
      todos: [] as { text: string; done: boolean }[],
      tags: new Set<string>(),
      owners: new Map([['a', { name: 'Alice' }]]),
    },
    { enableAutoFreeze: true }
  );
  const addTodo = (text: string) =>
    store.set(todosAtom, (draft) => {
      draft.todos.push({ text, done: false });
      draft.tags.add(text);
      draft.owners.get('a')!.name = text;
    });

  addTodo('a');
  let state = store.get(todosAtom);
  expect(Object.isFrozen(state.todos)).toBe(true);
  expect(Object.isFrozen(state.todos[0])).toBe(true);
  // Mutative 2 freezes Map and Set instances themselves.
  expect(Object.isFrozen(state.tags)).toBe(true);
  expect(Object.isFrozen(state.owners)).toBe(true);
  expect(Object.isFrozen(state.owners.get('a'))).toBe(true);

  // A frozen state is drafted again by the next update.
  addTodo('b');
  state = store.get(todosAtom);
  expect(state.todos).toEqual([
    { text: 'a', done: false },
    { text: 'b', done: false },
  ]);
  expect([...state.tags]).toEqual(['a', 'b']);
  expect(state.owners.get('a')).toEqual({ name: 'b' });
  expect(Object.isFrozen(state.tags)).toBe(true);
});

test('atomWithMutative updates arrays, Maps and Sets', () => {
  const store = createStore();
  const stateAtom = atomWithMutative({
    queue: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
    users: new Map([
      [1, { name: 'a' }],
      [2, { name: 'b' }],
    ]),
    selected: new Set([1]),
    other: { value: 0 },
  });

  const prev = store.get(stateAtom);
  store.set(stateAtom, (draft) => {
    // Mutative 2 runs these array methods natively on the draft's copy.
    const first = draft.queue.shift()!;
    draft.queue.push(first);
    draft.queue.unshift({ id: 0 });
    draft.queue.splice(2, 1);
    draft.queue.reverse();
    draft.users.get(1)!.name = 'A';
    draft.users.delete(2);
    draft.selected.add(2);
  });

  const next = store.get(stateAtom);
  expect(next.queue).toEqual([{ id: 1 }, { id: 4 }, { id: 2 }, { id: 0 }]);
  expect(next.queue[0]).toBe(prev.queue[0]);
  expect(next.queue[1]).toBe(prev.queue[3]);
  expect([...next.users]).toEqual([[1, { name: 'A' }]]);
  expect([...next.selected]).toEqual([1, 2]);
  expect(next.other).toBe(prev.other);
  expect(prev.queue).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
  expect(prev.users.get(1)).toEqual({ name: 'a' });
  expect([...prev.selected]).toEqual([1]);
});

test('atomWithMutative keeps its value when a recipe fails', () => {
  const store = createStore();
  const stateAtom = atomWithMutative({ count: 0, list: [1] });
  const state = store.get(stateAtom);

  expect(() =>
    store.set(stateAtom, (draft) => {
      draft.list.push(2);
      throw new Error('failed');
    })
  ).toThrow('failed');
  expect(store.get(stateAtom)).toBe(state);

  // Mutative throws for a recipe that changes the draft and returns another
  // value, with a minified error code in production builds.
  expect(() =>
    store.set(stateAtom, (draft) => {
      draft.count += 1;
      return { count: 1, list: [1] };
    })
  ).toThrow();
  expect(store.get(stateAtom)).toBe(state);
  expect(state).toEqual({ count: 0, list: [1] });
});
