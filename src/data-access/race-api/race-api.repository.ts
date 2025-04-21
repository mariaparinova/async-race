import { Car, Engine, Winner } from '../../types/common.types.ts';
import {
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
  SetCarToDriveModeParams,
  UpdateCarRequestDto,
  UpdateWinnerRequestDto,
  WinnerDto,
} from './race-api.types.ts';
import { engine, garage, winners } from '../constansts.ts';
import HttpStatusCode from '../../types/http.types.ts';

class RaceApiRepository {
  private readonly baseUrl: string = import.meta.env.VITE_BASE_RACE_API_URL;

  async getCar({ id }: GetCarParams): Promise<Car> {
    const response = await this.#request({
      method: RequestMethod.Get,
      endpoint: `${garage}/${id}`,
    });

    return response.json();
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

    return response.json();
  }

  async createCar(requestDto: CreateCarRequestDto): Promise<Car> {
    const response = await this.#request({
      method: RequestMethod.Post,
      endpoint: `${garage}`,
      body: requestDto,
    });

    return response.json();
  }

  async deleteCar({ id }: DeleteCarParams): Promise<void> {
    const response = await this.#request({
      method: RequestMethod.Delete,
      endpoint: `${garage}/${id}`,
    });

    if (response.status !== HttpStatusCode.Ok) {
      throw new Error('response code !== 200');
    }
  }

  async updateCar(requestDto: UpdateCarRequestDto): Promise<Car> {
    const response = await this.#request({
      method: RequestMethod.Put,
      endpoint: `${garage}/${requestDto.id}`,
      body: requestDto,
    });

    if (response.status !== HttpStatusCode.Ok) {
      throw new Error('response code !== 200');
    }

    return response.json();
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

  async setCarToDriveMode({ id }: SetCarToDriveModeParams) {
    const searchParams = new URLSearchParams();
    searchParams.set('id', `${id}`);
    searchParams.set('status', 'drive');

    const response = await this.#request({
      method: RequestMethod.Patch,
      endpoint: `${engine}?${searchParams.toString()}`,
    });

    if (response.status === HttpStatusCode.TooManyRequests) {
      throw new Error('Drive already in progress');
    }

    if (response.status === HttpStatusCode.NotFound) {
      throw new Error('Set engine status to "started" before');
    }

    const carEngineStatus: Record<'success', boolean> = await response.json();

    return carEngineStatus;
  }

  async getWinners(params: GetWinnersParams): Promise<{ winners: Winner[]; totalWinners: number }> {
    const { page, limit, sort, order } = params;
    const searchParams = new URLSearchParams({ _page: `${page}`, _limit: `${limit}` });

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

    const winnerItems = await response.json();
    const totalWinnersStr = response.headers.get('X-Total-Count');

    return {
      winners: winnerItems,
      totalWinners: totalWinnersStr ? +totalWinnersStr : winners.length,
    };
  }

  async getWinner({ id }: GetWinnerParams): Promise<Winner> {
    const response = await this.#request({
      method: RequestMethod.Get,
      endpoint: `${winners}/${id}`,
    });

    return response.json();
  }

  async createWinner(requestDto: CreateWinnerRequestDto) {
    const response = await this.#request({
      method: RequestMethod.Post,
      endpoint: winners,
      body: requestDto,
    });

    const winnerDto: WinnerDto = await response.json();
    return winnerDto;
  }

  async deleteWinner({ id }: DeleteWinnerParams) {
    return this.#request({
      method: RequestMethod.Delete,
      endpoint: `${winners}/${id}`,
    });
  }

  async updateWinner(requestDto: UpdateWinnerRequestDto): Promise<Winner> {
    const response = await this.#request({
      method: RequestMethod.Put,
      endpoint: `${winners}/${requestDto.id}`,
      body: requestDto,
    });

    return response.json();
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
}

const raceApiRepository = new RaceApiRepository();
export default raceApiRepository;
