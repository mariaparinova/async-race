import './Track.styles.css';
import { Car, Engine, EngineStatus } from '../../../types/common.types.ts';
import Button from '../../../components/Button/Button.component.ts';
import raceApiRepository from '../../../data-access/race-api/race-api.repository.ts';
import IconCar from '../../../components/Icon-car/Icon-Car.ts';

export interface TrackCallbacks {
  onSelectCar?: (car: Car) => void;
  onRemoveCar?: () => void;
}

export default class Track {
  trackEl: HTMLDivElement;

  car: Car;

  carEl: HTMLDivElement;

  callbacks: TrackCallbacks;

  engine: Engine;

  constructor(car: Car, callbacks: TrackCallbacks = {}) {
    this.car = car;
    this.callbacks = callbacks;
    this.carEl = this.createCarEl();
    this.trackEl = document.createElement('div');
    this.trackEl.className = 'track';
    this.trackEl.setAttribute('data-track-id', `${car.id}`);
    this.engine = {
      velocity: 0,
      distance: 0,
    };
  }

  createStartEl() {
    const carContainerEl = document.createElement('div');
    carContainerEl.className = 'car-container';

    const startPointEl = document.createElement('div');
    startPointEl.className = 'start-point';
    startPointEl.append(this.carEl);

    carContainerEl.append(this.createGoStopBtnEl(), startPointEl);

    const startAreaEl = document.createElement('div');
    startAreaEl.className = 'start-area';
    startAreaEl.append(this.createEditBtnsEl(), carContainerEl);

    return startAreaEl;
  }

  createEditBtnsEl() {
    const btnSelectEl = Button({
      isPrimary: false,
      text: 'select',
      onClick: () => this.selectCar(),
    });

    const btnRemoveEl = Button({
      isPrimary: false,
      text: 'remove',
      onClick: () => this.removeCar(),
    });

    const carBrandEl = document.createElement('span');
    carBrandEl.className = 'car-name';
    carBrandEl.innerText = this.car.name;

    const editBtnContainer = document.createElement('div');
    editBtnContainer.className = 'btn-container edit-btn';
    editBtnContainer.append(btnSelectEl, btnRemoveEl, carBrandEl);

    return editBtnContainer;
  }

  createGoStopBtnEl() {
    const goBtnClickHandler = async () => {
      const goBtnEl = <HTMLButtonElement>this.trackEl.querySelector('.icon-btn.go');
      const stopBtnEl = <HTMLButtonElement>this.trackEl.querySelector('.icon-btn.stop');

      goBtnEl.disabled = true;
      stopBtnEl.disabled = false;

      await this.setCarToStartMode();
    };

    const stopBtnClickHandler = async () => {
      const goBtnEl = <HTMLButtonElement>this.trackEl.querySelector('.icon-btn.go');
      const stopBtnEl = <HTMLButtonElement>this.trackEl.querySelector('.icon-btn.stop');

      goBtnEl.disabled = false;
      stopBtnEl.disabled = true;

      this.returnCarToStart();
      await this.setCarToStopMode();
    };

    const actionContainerEl = document.createElement('div');
    actionContainerEl.className = 'car-action';

    const goBtnEl = Button({
      classes: ['go', 'icon-btn'],
      isPrimary: false,
      text: 'A',
      onClick: goBtnClickHandler,
    });

    const stopBtnEl = Button({
      classes: ['stop', 'icon-btn'],
      isPrimary: false,
      text: 'B',
      onClick: stopBtnClickHandler,
      isDisabled: true,
    });

    actionContainerEl.append(goBtnEl, stopBtnEl);

    return actionContainerEl;
  }

  createCarEl() {
    const svgContainerEl = document.createElement('div');
    svgContainerEl.className = 'car-container-svg';
    svgContainerEl.style.color = this.car.color;
    svgContainerEl.innerHTML = IconCar();

    return svgContainerEl;
  }

  createFinishEl() {
    const flagEl = document.createElement('img');
    flagEl.className = 'img flag';
    flagEl.src = './icons/flag.svg';
    flagEl.alt = 'Finish icon';

    const finishAreaEl = document.createElement('div');
    finishAreaEl.className = 'finish-area';
    finishAreaEl.append(flagEl);

    return finishAreaEl;
  }

  createTrackEl() {
    this.trackEl.append(this.createStartEl());
    this.trackEl.append(this.createFinishEl());

    return this.trackEl;
  }

  async removeCar() {
    const { id } = this.car;

    await raceApiRepository.deleteCar({ id });
    await raceApiRepository.deleteWinner({ id });

    if (this.callbacks.onRemoveCar) {
      this.callbacks.onRemoveCar();
    }
  }

  async selectCar() {
    if (this.callbacks.onSelectCar) {
      this.callbacks.onSelectCar(this.car);
    }
  }

  async setCarToStartMode() {
    const { id } = this.car;
    const engineResponse = await raceApiRepository.startStopCar({ id, status: EngineStatus.Started });

    this.engine.velocity = engineResponse.velocity;
    this.engine.distance = engineResponse.distance;

    this.startCar();
    await this.setCarToDriveMode();
  }

  async setCarToDriveMode() {
    const statusDrive = EngineStatus.Drive;
    const { id } = this.car;
    let engineResponse;

    try {
      engineResponse = await raceApiRepository.setCarToDriveMode({ id, status: statusDrive });
    } catch (err: unknown) {
      if (!(err instanceof Error)) {
        console.error(`Type: "${err}" is not instance of Error`);
        return;
      }

      if (err.message === 'Drive already in progress') {
        return;
      }

      if (err.message === 'Set engine status to "started" before') {
        await raceApiRepository.startStopCar({ id, status: EngineStatus.Started });
        engineResponse = await raceApiRepository.setCarToDriveMode({ id, status: statusDrive });
      }
    }

    if (!engineResponse?.success) {
      this.stopCar();
      await this.setCarToStopMode();
    }
  }

  async setCarToStopMode() {
    await raceApiRepository.startStopCar({ id: this.car.id, status: EngineStatus.Stopped });
  }

  startCar() {
    const duration = this.engine.distance / this.engine.velocity;

    this.carEl.style.transition = `margin-left ${duration}ms linear`;
    this.carEl.style.marginLeft = `${this.getDistance()}px`;
  }

  stopCar() {
    this.carEl.style.marginLeft = getComputedStyle(this.carEl).marginLeft;
    this.carEl.style.transition = 'none';
  }

  getDistance() {
    const startPointEl = <HTMLDivElement>this.trackEl.querySelector('.start-point');
    const finishEl = <HTMLDivElement>this.trackEl.querySelector('.finish-area');

    if (!startPointEl || !finishEl) {
      console.log('error during count distance');
    }

    const trackElWidth = this.trackEl.offsetWidth;
    const startPointWidth = startPointEl.offsetLeft + startPointEl.offsetWidth;
    const carElWidth = this.carEl.offsetWidth;

    return trackElWidth - startPointWidth - carElWidth;
  }

  returnCarToStart() {
    this.carEl.style.transition = 'margin-left 0.2s';
    this.carEl.style.marginLeft = `0`;
  }
}
