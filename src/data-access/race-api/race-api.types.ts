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
