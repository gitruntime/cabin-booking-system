export interface CabinType {
  _id: string;
  name: string;
  type: string;
  building: any;
  floor: any;
  capacity: number;
  facilities: any[];
  status: any;
  department?: string
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BuildingType {
  _id: string;
  name: string;
  floors: FloorType[];
}

export interface FloorType {
  _id: string;
  buildingId: string;
  name: string;
  order: number;
}