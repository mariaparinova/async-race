import './Header.styles.css';
import Button from '../Button/Button.component.ts';
import appState, { AppPage } from '../../states/app.state.ts';

export function Header() {
  const btnElToWinners = Button({
    classes: ['to-winners'],
    isPrimary: true,
    text: 'to winners',
    onClick: () => {
      appState.updateState({ page: AppPage.Winners });
    },
  });

  const btnElToGarage = Button({
    classes: ['to-garage'],
    isPrimary: true,
    text: 'to garage',
    onClick: () => {
      appState.updateState({ page: AppPage.Garage });
    },
  });

  const raceActionBtnContainerEl = document.createElement('div');
  raceActionBtnContainerEl.className = 'race-action btn-container';

  const headerEl = document.createElement('header');
  headerEl.classList.add('header');
  headerEl.append(btnElToWinners, btnElToGarage, raceActionBtnContainerEl);

  return headerEl;
}

export default Header;
