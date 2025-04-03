import { Car, Engine, Winner } from '../../types/common.types.ts';
import {
  CarDto,
  CreateCarRequestDto,
  CreateWinnerRequestDto,
  DeleteCarParams,
  DeleteWinnerParams,
  EngineDto,
  GetCarParams,
  GetCarsParams,
  GetWinnerParams,
  GetWinnersParams,
  RequestMethod,
  StartStopCarParams,
  SteCarToDriveModeParams,
  UpdateCarRequestDto,
  UpdateWinnerRequestDto,
  WinnerDto,
} from './race-api.types.ts';
import { engine, garage, winners } from '../constansts.ts';

class RaceApiRepository {
  private readonly baseUrl: string = import.meta.env.VITE_BASE_RACE_API_URL;

  async getCar({ id }: GetCarParams): Promise<Car> {
    const response = await this.#request({
      method: RequestMethod.Get,
      endpoint: `${garage}/${id}`,
    });

    const carDto: CarDto = await response.json();

    return this.convertCarDtoToCar(carDto);
  }

  async getCars({ page, limit }: GetCarsParams): Promise<Car[]> {
    const searchParams = new URLSearchParams();

    if (page) {
      searchParams.set('_page', `${page}`);
    }

    if (limit) {
      searchParams.set('_limit', `${limit}`);
    }

    const response = await this.#request({
      method: RequestMethod.Get,
      endpoint: `${garage}?${searchParams.toString()}`,
    });

    const carsDto: CarDto[] = await response.json();

    return carsDto.map((carDto) => this.convertCarDtoToCar(carDto));
  }

  async createCar(requestDto: CreateCarRequestDto): Promise<Car> {
    const response = await this.#request({
      method: RequestMethod.Post,
      endpoint: `${garage}`,
      body: requestDto,
    });

    const carDto: CarDto = await response.json();

    return this.convertCarDtoToCar(carDto);
  }

  async deleteCar({ id }: DeleteCarParams) {
    await this.#request({
      method: RequestMethod.Delete,
      endpoint: `${garage}/${id}`,
    });
  }

  async updateCar(requestDto: UpdateCarRequestDto) {
    await this.#request({
      method: RequestMethod.Put,
      endpoint: `${garage}/${requestDto.id}`,
      body: requestDto,
    });
  }

  async startStopCar({ id, status }: StartStopCarParams): Promise<Engine> {
    const searchParams = new URLSearchParams();
    searchParams.set('id', `${id}`);
    searchParams.set('status', status);

    const response = await this.#request({
      method: RequestMethod.Patch,
      endpoint: `${engine}?${searchParams.toString()}`,
    });

    const carEngineStatus: EngineDto = await response.json();

    return {
      velocity: carEngineStatus.velocity,
      distance: carEngineStatus.distance,
    };
  }

  async setCarToDriveMode({ id }: SteCarToDriveModeParams) {
    const searchParams = new URLSearchParams();
    searchParams.set('id', `${id}`);
    searchParams.set('status', 'drive');

    await this.#request({
      method: RequestMethod.Patch,
      endpoint: `${engine}?${searchParams.toString()}`,
    });
  }

  async getWinners(params: GetWinnersParams): Promise<Winner[]> {
    const searchParams = new URLSearchParams();
    const { page, limit, sort, order } = params;

    if (page) {
      searchParams.set('_page', `${page}`);
    }

    if (limit) {
      searchParams.set('_limit', `${limit}`);
    }

    if (sort) {
      searchParams.set('_sort', sort);
    }

    if (order) {
      searchParams.set('_order', order);
    }

    const response = await this.#request({
      method: RequestMethod.Get,
      endpoint: `${winners}?${searchParams.toString()}`,
    });

    const winnersDto: WinnerDto[] = await response.json();

    return winnersDto.map((winner) => this.convertWinnerDtoToWinner(winner));
  }

  async getWinner({ id }: GetWinnerParams): Promise<Winner> {
    const response = await this.#request({
      method: RequestMethod.Get,
      endpoint: `${winners}/${id}`,
    });

    const winnerDto: WinnerDto = await response.json();

    return this.convertWinnerDtoToWinner(winnerDto);
  }

  async createWinner(requestDto: CreateWinnerRequestDto) {
    const response = await this.#request({
      method: RequestMethod.Post,
      endpoint: winners,
      body: requestDto,
    });

    const winnerDto: WinnerDto = await response.json();

    return this.convertWinnerDtoToWinner(winnerDto);
  }

  async deleteWinner({ id }: DeleteWinnerParams) {
    await this.#request({
      method: RequestMethod.Delete,
      endpoint: `${winners}/${id}`,
    });
  }

  async updateWinner(requestDto: UpdateWinnerRequestDto) {
    await this.#request({
      method: RequestMethod.Put,
      endpoint: `${winners}/${requestDto.id}`,
      body: requestDto,
    });
  }

  async #request(params: {
    method: RequestMethod;
    endpoint: string;
    headers?: Record<string, string>;
    body?: unknown;
  }): Promise<Response> {
    const { method, endpoint, headers = {}, body } = params;
    const url = `${this.baseUrl}${endpoint}`;
    let bodyStr: string | undefined;

    if (body) {
      bodyStr = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }

    try {
      return await fetch(url, {
        headers,
        method,
        body: bodyStr,
      });
    } catch (err) {
      console.error(`Error during request method ${method}, URL ${url}`);
      throw err;
    }
  }

  private convertCarDtoToCar(carDto: CarDto): Car {
    return {
      id: carDto.id,
      name: carDto.name,
      color: carDto.color,
    };
  }

  private convertWinnerDtoToWinner(winnerDto: WinnerDto): Winner {
    return {
      id: winnerDto.id,
      wins: winnerDto.wins,
      time: winnerDto.time,
    };
  }
}

const raceApiRepository = new RaceApiRepository();
export default raceApiRepository;
