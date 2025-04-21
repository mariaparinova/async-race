import './Pagination.css';
import Button from '../Button/Button.component.ts';
import garageState from '../../states/garage.state.ts';

type PaginationCallbacks = {
  prevBtnCallback?: () => void;
  nextBtnCallback?: () => void;
};

export default class Pagination {
  itemsOnPage: number;

  totalItems: number;

  currentPage: number;

  detailsEl: HTMLDivElement;

  buttonsContainerEl: HTMLElement;

  paginationCallbacks: PaginationCallbacks;

  constructor(props: {
    totalItems: number;
    infoTitle?: string;
    itemsOnPage: number;
    paginationCallbacks: PaginationCallbacks;
  }) {
    const { totalItems, infoTitle = '', itemsOnPage = 10, paginationCallbacks = {} } = props;

    this.totalItems = totalItems;
    this.itemsOnPage = itemsOnPage;
    this.currentPage = 1;

    this.detailsEl = document.createElement('div');
    this.detailsEl.className = 'details';
    this.addItemDetailsEl({ title: infoTitle, amount: this.totalItems, classes: infoTitle });
    this.addItemDetailsEl({ title: 'page', amount: garageState.values.currentPage, classes: 'page' });

    this.paginationCallbacks = paginationCallbacks;
    this.buttonsContainerEl = document.createElement('div');
    this.buttonsContainerEl.className = 'pagination btn-container';
    this.addPaginationButtons();
  }

  addItemDetailsEl({ title, amount, classes = '' }: { title: string; amount: number; classes?: string }) {
    const itemEl = document.createElement('div');
    itemEl.className = `${classes} details-item`;

    const itemTitleEl = document.createElement('span');
    itemTitleEl.className = `title`;
    itemTitleEl.innerText = `${title} `;

    const itemAmountEl = document.createElement('span');
    itemAmountEl.className = `amount`;
    itemAmountEl.innerText = `${amount}`;

    itemEl.append(itemTitleEl, itemAmountEl);

    this.detailsEl.append(itemEl);
  }

  updateTotalItemsAmount(amount: number) {
    this.totalItems = amount;

    const totalItemsEl = this.detailsEl.querySelector('.amount');

    if (!(totalItemsEl instanceof HTMLElement)) {
      console.error('Can not find property "totalIitemsEl" during change pagination');
      return;
    }

    totalItemsEl.innerText = `${this.totalItems}`;
    this.disableEnableBtns();
  }

  addPaginationButtons() {
    const btnPreviousEl = Button({
      isPrimary: true,
      text: 'previous',
      classes: ['previous'],
      isDisabled: this.currentPage === 1,
      onClick: (event) => this.btnOnclickHandler(event),
    });

    const btnNextEl = Button({
      isPrimary: true,
      text: 'next',
      classes: ['next'],
      isDisabled: this.currentPage === this.getTotalPageAmount(),
      onClick: (event) => this.btnOnclickHandler(event),
    });

    this.buttonsContainerEl.append(btnPreviousEl, btnNextEl);
  }

  btnOnclickHandler(event: Event) {
    const callbacks = this.paginationCallbacks;
    const currentPageNumber = this.currentPage;

    const btnEl = event.target;

    if (!(btnEl instanceof HTMLButtonElement)) {
      console.error('can not find "buttonElem" during change pagination');
      return;
    }

    if (btnEl.classList.contains('previous')) {
      this.updateCurrentPageNumber(currentPageNumber - 1);

      if (callbacks.prevBtnCallback) {
        callbacks.prevBtnCallback();
      }
    }

    if (btnEl.classList.contains('next')) {
      this.updateCurrentPageNumber(currentPageNumber + 1);

      if (callbacks.nextBtnCallback) {
        callbacks.nextBtnCallback();
      }
    }
  }

  updateCurrentPageNumber(n: number) {
    if (n < 1 || n > this.getTotalPageAmount() || n === this.currentPage) {
      return;
    }

    this.currentPage = n;

    const currentPageEl = this.detailsEl.querySelector('.page .amount');

    if (!(currentPageEl instanceof HTMLElement)) {
      console.error('Can not find "totalItemsEl" during change pagination');
      return;
    }

    currentPageEl.innerText = `${n}`;
    this.disableEnableBtns();
  }

  getTotalPageAmount() {
    return Math.ceil(this.totalItems / this.itemsOnPage);
  }

  disableEnableBtns() {
    const { currentPage, buttonsContainerEl } = this;
    const btnPreviousEl = buttonsContainerEl.querySelector('.btn.previous');
    const btnNextEl = buttonsContainerEl.querySelector('.btn.next');

    if (!(btnPreviousEl instanceof HTMLButtonElement) || !(btnNextEl instanceof HTMLButtonElement)) {
      console.error('can not find "buttonElem" during change pagination');
      return;
    }

    btnPreviousEl.disabled = currentPage === 1;
    btnNextEl.disabled = currentPage === this.getTotalPageAmount();
  }
}
