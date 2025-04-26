import State from './state.class.ts';
import App from '../main.ts';

export enum AppPage {
  Garage = 'garage',
  Winners = 'winners',
}

export const appState = new State({ page: AppPage.Garage });

appState.subscribe({
  key: 'page',
  callback: () => App.render(),
});

export default appState;
