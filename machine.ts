import { createMachine, interpret, actions } from 'xstate';

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const countMachine = createMachine({
  id: 'count',
  initial: 'idle',
  context: {
    count: 0,
  },
  states: {
    idle: {
      on: {
        COUNT: 'even',
      },
    },
    even: {
      on: {
        COUNT: 'counting_even',
      },
      tags: ['resolve'],
    },
    counting_even: {
      invoke: {
        src: () => wait(1000),
        onDone: {
          target: 'odd',
          actions: actions.assign({ count: (ctx) => (ctx as any).count + 1 }),
        },
      },
    },
    odd: {
      invoke: {
        src: () => wait(1000),
        onDone: {
          target: 'even',
          actions: actions.assign({ count: (ctx) => (ctx as any).count + 1 }),
        },
      },
    },
  },
});

const service = interpret(countMachine).onTransition((state) => {
  console.log(state.value);
});
