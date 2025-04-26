import raceApiRepository from '../data-access/race-api/race-api.repository.ts';
import State from './state.class.ts';
import winnersPage from '../pages/winners.page/winners.page.ts';
import { GetWinnersParams } from '../data-access/race-api/race-api.types.ts';

export enum SortBy {
  Wins = 'wins',
  Time = 'time',
}

export enum SortOrder {
  Asc = 'ASC',
  Desc = 'DESC',
}

export const winnersSelector = (params: GetWinnersParams) => raceApiRepository.getWinners(params);

type WinnersStateValues = {
  currentPage: number;
  sortBy: undefined | SortBy;
  sortOrder: undefined | SortOrder;
};

const initialParams: WinnersStateValues = {
  currentPage: 1,
  sortBy: undefined,
  sortOrder: undefined,
};

const winnersState = new State(initialParams);

winnersState.subscribe({
  key: 'currentPage',
  callback: () => winnersPage.renderWinners(),
});

winnersState.subscribe({
  key: 'sortBy',
  callback: () => winnersPage.renderWinners(),
});

winnersState.subscribe({
  key: 'sortOrder',
  callback: () => winnersPage.renderWinners(),
});

export default winnersState;
