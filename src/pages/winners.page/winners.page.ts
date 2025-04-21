import './winners.styles.css';
import winnersState, { SortBy, SortOrder, winnersSelector } from '../../states/winners.state.ts';
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
      totalItems: 1,
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
      { kindOfCell: 'th', cellContent: 'wins', classes: 'wins', onclickHandler: () => this.onHeaderClick('wins') },
      {
        kindOfCell: 'th',
        cellContent: 'best time, sec',
        classes: 'time',
        onclickHandler: () => this.onHeaderClick('time'),
      },
    ]);

    this.contentEl = this.table.tableEl;

    const winnersPageEl = document.createElement('div');
    winnersPageEl.classList.add('winners');
    this.winnersPageEl = winnersPageEl;
    this.winnersPageEl.append(this.pagination.detailsEl, this.contentEl, this.pagination.buttonsContainerEl);
  }

  async renderWinners() {
    const { winners, totalWinners } = await winnersSelector({
      page: this.pagination.currentPage,
      limit: this.pagination.itemsOnPage,
      sort: winnersState.values.sortBy,
      order: winnersState.values.sortOrder,
    });
    this.pagination.updateTotalItemsAmount(totalWinners);

    const carRequests = winners.map((winner) => raceApiRepository.getCar({ id: winner.id }));
    const cars = await Promise.all(carRequests);

    const dataForTableCells = winners.map((winner, index) => {
      const car = cars[index];

      const carElem = document.createElement('div');
      carElem.style.color = car.color;
      carElem.innerHTML = IconCar();

      return [
        { cellContent: `${index + 1}` },
        { cellContent: carElem },
        { cellContent: car.name },
        { cellContent: `${winner.wins}` },
        { cellContent: `${winner.time.toFixed(2)}` },
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

  private onHeaderClick(headerName: string) {
    let sortOrder: SortOrder = SortOrder.Asc;
    let sortBy;

    switch (headerName) {
      case 'wins':
        sortBy = SortBy.Wins;
        break;
      case 'time':
        sortBy = SortBy.Time;
        break;
      default:
        return;
    }

    if (winnersState.values.sortBy === sortBy) {
      sortOrder = winnersState.values.sortOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc;
    }

    winnersState.updateState({ sortBy, sortOrder });
  }
}

const winnersPage = new WinnersPage();

export default winnersPage;
