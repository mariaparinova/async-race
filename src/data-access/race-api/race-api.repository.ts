import { Car, Engine, Winner } from '../../types/common.types.ts';
import {
  CarDto,
  CreateCarRequestDto,
  CreateWinnerRequestDto,
  EngineDto,
  UpdateCarRequestDto,
  UpdateWinnerRequestDto,
  WinnerDto,
} from './race-api.types.ts';

class RaceApiRepository {
  private readonly baseUrl: string = import.meta.env.VITE_BASE_RACE_API_URL;

  async getCar(params: { id: number }): Promise<Car> {
    const { id } = params;
    const response = await this.#request({
      method: 'GET',
      endpoint: `/garage/${id}`,
    });

    const carDto: CarDto = await response.json();

    return this.convertCarDtoToCar(carDto);
  }

  async getCars(params: { page?: number; limit?: number }): Promise<Car[]> {
    const { page, limit } = params;
    const searchParams = new URLSearchParams();

    if (page) {
      searchParams.set('_page', `${page}`);
    }

    if (limit) {
      searchParams.set('_limit', `${limit}`);
    }

    const response = await this.#request({
      method: 'GET',
      endpoint: `/garage?${searchParams.toString()}`,
    });

    const carsDto: CarDto[] = await response.json();

    return carsDto.map((carDto) => this.convertCarDtoToCar(carDto));
  }

  async createCar(requestDto: CreateCarRequestDto): Promise<Car> {
    const response = await this.#request({
      method: 'POST',
      endpoint: '/garage',
      body: requestDto,
    });

    const carDto: CarDto = await response.json();

    return this.convertCarDtoToCar(carDto);
  }

  async deleteCar(params: { id: number }) {
    const { id } = params;
    await this.#request({
      method: 'DELETE',
      endpoint: `/garage/${id}`,
    });
  }

  async updateCar(requestDto: UpdateCarRequestDto) {
    await this.#request({
      method: 'PUT',
      endpoint: `/garage/${requestDto.id}`,
      body: requestDto,
    });
  }

  async startStopCar(params: { id: number; status: 'started' | 'stopped' }): Promise<Engine> {
    const { id, status } = params;
    const searchParams = new URLSearchParams();
    searchParams.set('id', `${id}`);
    searchParams.set('status', status);

    const response = await this.#request({
      method: 'PATCH',
      endpoint: `/engine?${searchParams.toString()}`,
    });

    const carEngineStatus: EngineDto = await response.json();

    return {
      velocity: carEngineStatus.velocity,
      distance: carEngineStatus.distance,
    };
  }

  async setCarToDriveMode(params: { id: number }) {
    const { id } = params;
    const searchParams = new URLSearchParams();
    searchParams.set('id', `${id}`);
    searchParams.set('status', 'drive');

    await this.#request({
      method: 'PATCH',
      endpoint: `/engine?${searchParams.toString()}`,
    });
  }

  async getWinners(params: {
    page?: number;
    limit?: number;
    sort?: 'id' | 'wins' | 'time';
    order?: 'ASC' | 'DESC';
  }): Promise<Winner[]> {
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
      method: 'GET',
      endpoint: `/winners?${searchParams.toString()}`,
    });

    const winners: WinnerDto[] = await response.json();

    return winners.map((winner) => this.convertWinnerDtoToWinner(winner));
  }

  async getWinner(params: { id: string }): Promise<Winner> {
    const { id } = params;
    const response = await this.#request({
      method: 'GET',
      endpoint: `/winners/${id}`,
    });

    const winnerDto: WinnerDto = await response.json();

    return this.convertWinnerDtoToWinner(winnerDto);
  }

  async createWinner(requestDto: CreateWinnerRequestDto) {
    const response = await this.#request({
      method: 'POST',
      endpoint: `/winners`,
      body: requestDto,
    });

    const winnerDto: WinnerDto = await response.json();

    return this.convertWinnerDtoToWinner(winnerDto);
  }

  async deleteWinner(params: { id: number }) {
    const { id } = params;
    await this.#request({
      method: 'DELETE',
      endpoint: `/winners/${id}`,
    });
  }

  async updateWinner(requestDto: UpdateWinnerRequestDto) {
    await this.#request({
      method: 'PUT',
      endpoint: `/winners/${requestDto.id}`,
      body: requestDto,
    });
  }

  async #request(params: {
    method: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';
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
