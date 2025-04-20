import raceApiRepository from '../data-access/race-api/race-api.repository.ts';
import State from './state.class.ts';
import garagePage from '../pages/garage.page/garage.page.ts';
import { GetCarsParams } from '../data-access/race-api/race-api.types.ts';
import { Car } from '../types/common.types.ts';

export const garageCarsSelector = (params: GetCarsParams = {}) => raceApiRepository.getCars(params);

const cars = await garageCarsSelector();

type GarageStateValues = {
  updateCars: Car[];
  carForUpdating: undefined | Car;
  currentPage: number;
  amountOfCarsOnPage: number;
  'is-garage-rendered': boolean;
};

const initialParams: GarageStateValues = {
  updateCars: cars,
  carForUpdating: undefined,
  currentPage: 1,
  amountOfCarsOnPage: 7,
  'is-garage-rendered': false,
};

const garageState = new State(initialParams);

garageState.subscribe({
  key: 'updateCars',
  callback: () => garagePage.renderTracks(),
});

garageState.subscribe({
  key: 'updateCars',
  callback: () => garagePage.pagination.updateTotalItemsAmount(garageState.values.updateCars.length),
});

garageState.subscribe({
  key: 'currentPage',
  callback: () => garagePage.renderTracks(),
});

garageState.subscribe({
  key: 'carForUpdating',
  callback: () => garagePage.updateFormInputUpdateCar(),
});

garageState.subscribe({
  key: 'carForUpdating',
  callback: () => garagePage.renderTracks(),
});

garageState.subscribe({
  key: 'is-garage-rendered',
  callback: () => garagePage.addRaceResetBtnToUi(),
});

export default garageState;
