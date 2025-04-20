import './garage.styles.css';
import garageState, { garageCarsSelector } from '../../states/garage.state.ts';
import Track, { TrackCallbacks } from './Track/Track.component.ts';
import Pagination from '../../components/Pagination/Pagination.ts';
import Input from '../../components/Input/Input.ts';
import Button from '../../components/Button/Button.component.ts';
import raceApiRepository from '../../data-access/race-api/race-api.repository.ts';
import { Car } from '../../types/common.types.ts';
import getRandomHexColor from '../../helpers/getRandomColor.ts';
import carBrands from '../../assets/storage/brands.ts';
import { CreateCarRequestDto, WinnerDto } from '../../data-access/race-api/race-api.types.ts';

export class GaragePage {
  garagePageEl: HTMLElement;

  formEl: HTMLFormElement;

  contentEl: HTMLElement;

  pagination: Pagination;

  btnRaceEl: HTMLButtonElement;

  btnResetEl: HTMLButtonElement;

  tracks: Track[];

  winnerId: undefined | number;

  constructor() {
    this.winnerId = undefined;
    this.tracks = [];

    this.pagination = new Pagination({
      totalItems: garageState.values.updateCars.length,
      infoTitle: 'cars',
      itemsOnPage: garageState.values.amountOfCarsOnPage,
      paginationCallbacks: {
        prevBtnCallback: () => garageState.updateState({ currentPage: this.pagination.currentPage }),
        nextBtnCallback: () => garageState.updateState({ currentPage: this.pagination.currentPage }),
      },
    });

    this.formEl = document.createElement('form');
    this.formEl.className = 'form';
    this.addFormInputNewCar();
    this.updateFormInputUpdateCar();

    this.btnRaceEl = this.createRaceButton();
    this.btnResetEl = this.createResetButton();

    const contentEl = document.createElement('div');
    contentEl.className = 'content';
    this.contentEl = contentEl;

    const garagePageEl = document.createElement('div');
    garagePageEl.className = 'garage';
    this.garagePageEl = garagePageEl;
    this.garagePageEl.ontransitionend = (event) => this.makeRaceCompleted(event);
    this.garagePageEl.append(this.pagination.detailsEl, this.formEl, contentEl, this.pagination.buttonsContainerEl);
    this.addGenerateCarsEl();
  }

  createRaceButton() {
    const onclickHandler = async () => {
      this.btnResetEl.disabled = true;
      this.btnRaceEl.disabled = true;
      this.tracks.forEach((track) => track.setCarToStartMode());
    };

    return Button({
      classes: ['race'],
      isPrimary: true,
      text: 'race',
      onClick: onclickHandler,
    });
  }

  createResetButton() {
    const onclickHandler = async () => {
      this.btnRaceEl.disabled = false;

      this.tracks.forEach((track) => track.setCarToStopMode()); // todo

      const updatedPageCars = await garageCarsSelector({
        page: this.pagination.currentPage,
        limit: this.pagination.itemsOnPage,
      });

      garageState.updateState({ updateCars: updatedPageCars });
    };

    return Button({
      isPrimary: true,
      text: 'reset',
      onClick: onclickHandler,
      isDisabled: true,
    });
  }

  addRaceResetBtnToUi() {
    const parentEl = document.body.querySelector('.header .race-action.btn-container');

    if (!parentEl || parentEl.querySelector('.btn')) {
      console.error('Error during race action buttons');
      return;
    }

    parentEl.append(this.btnRaceEl, this.btnResetEl);
  }

  async renderTracks() {
    const currentPageCars = await garageCarsSelector({
      page: this.pagination.currentPage,
      limit: this.pagination.itemsOnPage,
    });

    const trackCallbacks: TrackCallbacks = {
      onRemoveCar: async () => {
        const updatedCars = await garageCarsSelector();
        garageState.updateState({ updateCars: updatedCars });
      },

      onSelectCar: (car) => {
        garageState.updateState({ carForUpdating: car });
      },
    };
    this.tracks = currentPageCars.map((car) => new Track(car, trackCallbacks));

    const trackElCollection = this.tracks.map((track) => track.createTrackEl());

    this.contentEl.innerHTML = '';
    this.contentEl.append(...trackElCollection);

    this.btnRaceEl.disabled = false;
    garageState.updateState({ 'is-garage-rendered': true });
  }

  addFormInputNewCar() {
    const newBrandSelectEl = document.createElement('select');
    newBrandSelectEl.className = 'select';
    newBrandSelectEl.name = 'car-brands';

    carBrands.forEach((option) => {
      const optionEl = document.createElement('option');
      optionEl.value = option;
      optionEl.innerText = option;

      newBrandSelectEl.append(optionEl);
    });

    const inputNewColorEl = Input({
      type: 'color',
      id: 'color',
      name: 'color',
      inputClassNames: 'color',
      value: '#E479F0',
    });

    const btnAddCarOnclickHandler = async () => {
      const carNameEl = this.formEl.querySelector<HTMLInputElement>('[name="car-brands"]');
      const carColorEl = this.formEl.querySelector<HTMLInputElement>('[name="color"]');

      if (!carNameEl || !carColorEl) {
        throw new Error('Error during creating new car');
      }

      const name = carNameEl.value;
      const color = carColorEl.value;

      await raceApiRepository.createCar({ name, color });
      const updatedCars = await garageCarsSelector();
      garageState.updateState({ updateCars: updatedCars });
    };

    const btnAddCar = Button({ text: 'create', onClick: btnAddCarOnclickHandler });
    const itemFormCreateEl = document.createElement('div');
    itemFormCreateEl.className = 'item-form create';
    itemFormCreateEl.append(newBrandSelectEl, inputNewColorEl, btnAddCar);

    this.formEl.append(itemFormCreateEl);
  }

  updateFormInputUpdateCar() {
    const { formEl } = this;
    const formItem = formEl.querySelector('.update');

    if (!formItem) {
      const inputUpdateBrandEl = Input({
        id: 'update-brand',
        name: 'update-brand',
        inputClassNames: 'update',
        value: '',
        isDisabled: true,
      });
      const inputUpdateColorEl = Input({
        type: 'color',
        id: 'update-color',
        name: 'update-color',
        inputClassNames: 'update-color',
        value: '#ffffff',
        isDisabled: true,
      });

      const OnclickHandler = async () => {
        const { carForUpdating } = garageState.values;
        const inputNameEl = this.formEl.querySelector('.input.update');
        const updatedName =
          inputNameEl instanceof HTMLInputElement && inputNameEl.value ? inputNameEl.value : carForUpdating!.name;
        const inputColorEl = this.formEl.querySelector('.item-form.update .input.update-color');
        const updatedColor = inputColorEl instanceof HTMLInputElement ? inputColorEl.value : carForUpdating!.color;

        const updatedDetails = {
          id: carForUpdating!.id,
          name: updatedName,
          color: updatedColor,
        };

        await raceApiRepository.updateCar(updatedDetails);
        const updatedCar = await raceApiRepository.getCar({ id: updatedDetails.id });
        const indexOfCar = garageState.values.updateCars.findIndex((car) => car.id === updatedCar.id);
        garageState.values.updateCars[indexOfCar] = updatedCar;
        this.updateTrack(updatedCar);
      };
      const btnUpdateCar = Button({ text: 'update', classes: ['update'], onClick: OnclickHandler, isDisabled: true });

      const itemFormUpdateEl = document.createElement('div');
      itemFormUpdateEl.className = 'item-form update';
      itemFormUpdateEl.append(inputUpdateBrandEl, inputUpdateColorEl, btnUpdateCar);

      this.formEl.append(itemFormUpdateEl);
      return;
    }

    const { carForUpdating } = garageState.values;

    const brandInputEl = formEl.querySelector('.input#update-brand');
    const colorInputEl = formEl.querySelector('.input#update-color');

    if (!(brandInputEl instanceof HTMLInputElement) || !(colorInputEl instanceof HTMLInputElement)) {
      console.error('error during updating input "update car"');
      return;
    }

    brandInputEl.value = carForUpdating?.name || '';
    brandInputEl.disabled = !carForUpdating;
    colorInputEl.value = carForUpdating?.color || '#ffffff';
    colorInputEl.disabled = !carForUpdating;

    const btnEl = formEl.querySelector('.btn.update');
    if (btnEl instanceof HTMLButtonElement) {
      btnEl.disabled = !carForUpdating;
    }
  }

  updateTrack(car: Car) {
    const trackElForUpdating = this.contentEl.querySelector(`[data-track-container-id="${car.id}"]`);
    if (trackElForUpdating) {
      trackElForUpdating.replaceWith(new Track(car).createTrackEl());
    }
  }

  addGenerateCarsEl() {
    async function onclickHandler() {
      const cars: CreateCarRequestDto[] = [];

      for (let i = 0; i < 100; i += 1) {
        cars.push({
          name: carBrands[Math.floor(Math.random() * carBrands.length)],
          color: getRandomHexColor(),
        });
      }

      await Promise.all(cars.map((car) => raceApiRepository.createCar(car)));

      const updatedCars = await garageCarsSelector();

      garageState.updateState({ updateCars: updatedCars });
    }

    const btnEl = Button({
      isPrimary: false,
      text: 'generate cars',
      onClick: onclickHandler,
    });

    const parentEl = this.garagePageEl.querySelector('.details');
    if (parentEl instanceof HTMLDivElement) {
      parentEl.append(btnEl);
    }
  }

  async makeRaceCompleted(event: TransitionEvent) {
    if (this.winnerId) {
      return;
    }

    const target = <HTMLDivElement>event.target;

    if (!target || !target.classList.contains('car-container-svg')) {
      return;
    }

    const trackEl = <HTMLDivElement>target.closest('.track');
    const id = trackEl.dataset.trackId;

    if (!id) {
      console.error(`Track element ${trackEl} requires "id"`);
      return;
    }

    this.winnerId = +id;
    this.btnResetEl.disabled = false;
    await this.addUpdateWinner({ id: this.winnerId, time: event.elapsedTime });
  }

  async addUpdateWinner(props: Pick<WinnerDto, 'id' | 'time'>) {
    const { id, time } = props;
    const winnerData = await raceApiRepository.getWinner({ id });

    if (winnerData.id) {
      const lastWonData = await raceApiRepository.getWinner({ id });

      await raceApiRepository.updateWinner({
        id,
        wins: lastWonData.wins + 1,
        time: Math.min(time, lastWonData.time),
      });
    }

    if (!winnerData.id) {
      await raceApiRepository.createWinner({ id, time, wins: 1 });
    }
  }
}

const garagePage = new GaragePage();

export default garagePage;
