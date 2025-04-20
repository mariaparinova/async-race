import { Header } from '../Header/Header.component.ts';
import { AppPage, appState } from '../../states/app.state.ts';
import garagePage from '../../pages/garage.page/garage.page.ts';
import winnersPage from '../../pages/winners.page/winners.page.ts';

export default class AppComponent {
  private readonly rootAppEl: HTMLElement;

  private readonly headerEl: HTMLElement;

  outlet: HTMLElement;

  constructor({ rootAppEl }: { rootAppEl: HTMLElement }) {
    const mainEl = document.createElement('main');
    mainEl.classList.add('main');

    this.headerEl = Header();
    this.outlet = mainEl;
    this.rootAppEl = rootAppEl;
    this.rootAppEl.append(this.headerEl, this.outlet);
  }

  async render() {
    if (!(this.outlet instanceof HTMLElement)) {
      return;
    }

    this.outlet.innerHTML = '';

    const isGarageForRendering = appState.values.page === AppPage.Garage;
    const isWinnersForRendering = appState.values.page === AppPage.Winners;

    if (isGarageForRendering) {
      const { garagePageEl } = garagePage;
      await garagePage.renderTracks();
      this.outlet.append(garagePageEl);
    }

    if (isWinnersForRendering) {
      const { winnersPageEl } = winnersPage;
      await winnersPage.renderWinners();
      this.outlet.append(winnersPageEl);
    }

    this.rootAppEl.classList.toggle('garage', isGarageForRendering);
    this.rootAppEl.classList.toggle('winners', isWinnersForRendering);
  }
}
