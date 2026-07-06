export interface CabinType {
  _id: string;
  name: string;
  typeId: string;
  buildingId: BuildingType['_id'];
  building: any;
  floorId: FloorType['_id'];
  floor: any;
  capacity: number;
  facilities: any[];
  status: any;
  department?: string
  xAxis?: number;
  yAxis?: number;
  width?: number;
  height?: number;
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

export interface ItemType {
  _id: string;
  name: string;
  order: number;
}