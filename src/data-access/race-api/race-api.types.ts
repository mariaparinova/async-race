export enum RequestMethod {
  Get = 'GET',
  Put = 'PUT',
  Post = 'POST',
  Patch = 'PATCH',
  Delete = 'DELETE',
}

export interface CarDto {
  id: number;
  name: string;
  color: string;
}

export interface UpdateCarRequestDto {
  id: number;
  name: string;
  color: string;
}

export interface CreateCarRequestDto {
  name: string;
  color: string;
}

export interface GetCarParams {
  id: number;
}

export interface GetCarsParams {
  page?: number;
  limit?: number;
}

export interface DeleteCarParams {
  id: number;
}

export interface StartStopCarParams {
  id: number;
  status: 'started' | 'drive' | 'stopped';
}

export interface SetCarToDriveModeParams {
  id: number;
  status: 'started' | 'drive' | 'stopped';
}

export interface EngineDto {
  velocity: number;
  distance: number;
}

export interface WinnerDto {
  id: number;
  wins: number;
  time: number;
}

export interface CreateWinnerRequestDto {
  id: number;
  wins: number;
  time: number;
}

export interface UpdateWinnerRequestDto {
  id: number;
  wins: number;
  time: number;
}

export interface GetWinnersParams {
  page: number;
  limit: number;
  sort?: 'id' | 'wins' | 'time';
  order?: 'ASC' | 'DESC';
}

export interface GetWinnerParams {
  id: number;
}

export interface DeleteWinnerParams {
  id: number;
}
