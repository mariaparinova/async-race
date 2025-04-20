import './winners.styles.css';
import winnersState, { winnersSelector } from '../../states/winners.state.ts';
import Pagination from '../../components/Pagination/Pagination.ts';
import { CellData, Table } from '../../components/Table/Table.ts';
import raceApiRepository from '../../data-access/race-api/race-api.repository.ts';
import IconCar from '../../components/Icon-car/Icon-Car.ts';

class WinnersPage {
  winnersPageEl: HTMLElement;

  contentEl: HTMLTableElement;

  table: Table;

  pagination: Pagination;

  constructor() {
    this.pagination = new Pagination({
      totalItems: winnersState.values.winners.length,
      infoTitle: 'winners',
      itemsOnPage: 10,
      paginationCallbacks: {
        prevBtnCallback: () => winnersState.updateState({ currentPage: this.pagination.currentPage }),
        nextBtnCallback: () => winnersState.updateState({ currentPage: this.pagination.currentPage }),
      },
    });

    this.table = new Table([
      { kindOfCell: 'th', cellContent: 'number', classes: '' },
      { kindOfCell: 'th', cellContent: 'car', classes: '' },
      { kindOfCell: 'th', cellContent: 'name', classes: '' },
      { kindOfCell: 'th', cellContent: 'wins', classes: 'wins' },
      { kindOfCell: 'th', cellContent: 'best time, sec', classes: 'time' },
    ]);

    this.contentEl = this.table.tableEl;

    const winnersPageEl = document.createElement('div');
    winnersPageEl.classList.add('winners');
    this.winnersPageEl = winnersPageEl;
    this.winnersPageEl.append(this.pagination.detailsEl, this.contentEl, this.pagination.buttonsContainerEl);
  }

  async renderWinners() {
    const currentPageWinners = await winnersSelector({
      page: this.pagination.currentPage,
      limit: this.pagination.itemsOnPage,
    });

    const carRequests = currentPageWinners.map((winner) => raceApiRepository.getCar({ id: winner.id }));
    const cars = await Promise.all(carRequests);

    const dataForTableCells = currentPageWinners.map((winner, index) => {
      const car = cars[index];

      const carElem = document.createElement('div');
      carElem.style.color = car.color;
      carElem.innerHTML = IconCar();

      return [
        { cellContent: `${index + 1}` },
        { cellContent: carElem },
        { cellContent: car.name },
        { cellContent: winner.wins },
        { cellContent: winner.time },
      ];
    });

    const winnerCellElements = dataForTableCells.map((data) =>
      data.map((item: CellData) => this.table.getTableCellEl(item)),
    );
    const winnerRowsEl = winnerCellElements.map((cellEl) => this.table.getTableRowEl(cellEl));

    const tableBodyEl = this.contentEl.querySelector('tbody');

    if (!(tableBodyEl instanceof HTMLElement)) {
      console.error('Error during render winners');
      return;
    }

    tableBodyEl.innerHTML = '';
    tableBodyEl.append(...winnerRowsEl);
  }
}

const winnersPage = new WinnersPage();

export default winnersPage;
