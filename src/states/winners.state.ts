import raceApiRepository from '../data-access/race-api/race-api.repository.ts';
import State from './state.class.ts';
import winnersPage from '../pages/winners.page/winners.page.ts';
import { GetWinnersParams } from '../data-access/race-api/race-api.types.ts';
import { Winner } from '../types/common.types.ts';

export const winnersSelector = (params: GetWinnersParams = {}) => raceApiRepository.getWinners(params);
const winners = await winnersSelector();

type WinnersStateValues = {
  winners: Winner[];
  currentPage: number;
};

const initialParams: WinnersStateValues = {
  winners,
  currentPage: 1,
};

const winnersState = new State(initialParams);

winnersState.subscribe({
  key: 'winners',
  callback: () => winnersPage.renderWinners(),
});

winnersState.subscribe({
  key: 'winners',
  callback: () => winnersPage.pagination.updateTotalItemsAmount(winnersState.values.winners.length),
});

winnersState.subscribe({
  key: 'currentPage',
  callback: () => winnersPage.renderWinners(),
});

export default winnersState;
