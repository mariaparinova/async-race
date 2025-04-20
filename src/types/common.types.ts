export interface Car {
  id: number;
  name: string;
  color: string;
}

export interface Engine {
  velocity: number;
  distance: number;
}

export enum EngineStatus {
  Started = 'started',
  Drive = 'drive',
  Stopped = 'stopped',
}

export interface Winner {
  id: number;
  wins: number;
  time: number;
}
