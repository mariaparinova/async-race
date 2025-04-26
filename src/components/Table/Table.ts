import './Table.styles.css';

export interface CellData {
  kindOfCell?: 'td' | 'th';
  cellContent?: string | number | HTMLElement;
  classes?: string;
  onclickHandler?: () => void;
}

export class Table {
  tableEl: HTMLTableElement;

  tbodyEl: HTMLElement;

  theadEl: HTMLElement;

  amountOfCellInRow: number;

  constructor(cellData: CellData[]) {
    this.amountOfCellInRow = cellData.length;
    this.theadEl = document.createElement('thead');
    this.theadEl.append(this.getTableRowEl(cellData.map((data) => this.getTableCellEl(data))));

    this.tbodyEl = document.createElement('tbody');

    this.tableEl = document.createElement('table');
    this.tableEl.className = 'table';
    this.tableEl.append(this.theadEl, this.tbodyEl);
  }

  getTableRowEl(content?: HTMLTableCellElement[]) {
    const tableRow = document.createElement('tr');

    if (content?.length) {
      tableRow.append(...content);
    }

    return tableRow;
  }

  getTableCellEl(cellData: CellData) {
    const kindOfCell = cellData.kindOfCell || 'td';
    const cellEl = document.createElement(kindOfCell);
    cellEl.className = `${kindOfCell} ${cellData.classes || ''}`;

    if (typeof cellData.cellContent === 'string') {
      cellEl.innerText = cellData.cellContent;
    }

    if (cellData.cellContent instanceof HTMLElement) {
      cellEl.append(cellData.cellContent);
    }

    if (cellData.onclickHandler) {
      cellEl.onclick = cellData.onclickHandler;
    }

    return cellEl;
  }
}
