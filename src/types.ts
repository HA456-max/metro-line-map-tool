export type ID = string;

export type LineStyle = 'solid' | 'dashed';

export interface Station {
  id: ID;
  name: string;
  code?: string;
  pos: { x: number; y: number };
  type: 'normal' | 'transfer' | 'terminal';
  icon?: string;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export interface Line {
  id: ID;
  name: string;
  color: string;
  width: number;
  style: LineStyle;
  isLoop: boolean;
  stationIds: ID[];
  branches?: { id: ID; stationIds: ID[] }[];
  labelOffset?: { x: number; y: number };
}

export interface Project {
  id: ID;
  name: string;
  createdAt: number;
  lines: Record<ID, Line>;
  stations: Record<ID, Station>;
  view: { x: number; y: number; scale: number };
  meta?: { title?: string; author?: string };
}
