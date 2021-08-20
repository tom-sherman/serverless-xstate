import {
  State,
  DefaultContext,
  StateSchema,
  EventObject,
  Typestate,
  StateMachine,
  Event,
  interpret as xstateInterpret,
} from 'xstate';
import type { Storage } from './storage';

export function createInterpreter<
  TContext = DefaultContext,
  TStateSchema extends StateSchema = any,
  TEvent extends EventObject = EventObject,
  TTypestate extends Typestate<TContext> = {
    value: any;
    context: TContext;
  }
>(
  key: string,
  machine: StateMachine<TContext, TStateSchema, TEvent, TTypestate>,
  storage: Storage
) {
  const settleMachine = async (event: Event<TEvent>) => {
    const service = xstateInterpret(machine);
    const stateDefinition = (await storage.get(key)) ?? machine.initialState;
    const previousState = machine.resolveState(State.create(stateDefinition));
    console.log(previousState.value);

    const nextState = await new Promise<
      State<TContext, TEvent, TStateSchema, TTypestate>
    >((resolve, reject) => {
      service
        .onTransition((state) => {
          // TODO: Not sure about stopping then resolving/rejecting, maybe we should set some mutbale state just stop?
          if (state.hasTag('resolve')) {
            service.stop();
            return resolve(state);
          } else if (state.hasTag('reject')) {
            service.stop();
            return reject(state);
          }
        })
        .start(previousState)
        .send(event);
    });

    await storage.set(key, nextState);

    return nextState;
  };

  return { settleMachine };
}
