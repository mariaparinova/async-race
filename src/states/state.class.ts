export default class State<T extends Record<string, unknown>> {
  values: T;

  private subscribers: { key: keyof T; callback: () => void }[] = [];

  constructor(params: T) {
    this.values = params;
  }

  subscribe(subscriber: { key: keyof T; callback: () => void }) {
    this.subscribers.push(subscriber);
  }

  updateState(valuesForUpdating: Partial<T>) {
    const newStateValues = { ...this.values, ...valuesForUpdating };
    const handlers: (() => void)[] = [];

    this.subscribers.forEach((subscriber) => {
      const keyOfState = subscriber.key;
      const oldVal = this.values[keyOfState];
      const newVal = newStateValues[keyOfState];

      if (!Object.is(oldVal, newVal)) {
        handlers.push(subscriber.callback);
      }
    });

    this.values = { ...newStateValues };

    handlers.forEach((handler) => handler());
  }
}
