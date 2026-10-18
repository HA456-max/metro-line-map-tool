import create from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import LZString from 'lz-string';
import type { Project, Line, Station, ID } from '../types';
import { importProjectFromJSON, exportProjectToJSON } from '../utils/importExport';

interface RootState {
  projects: Record<string, Project>;
  currentProjectId?: string;
  createProject: (name?: string) => string;
  switchProject: (id: string) => void;
  deleteProject: (id: string) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;

  addLine: (line: Partial<Line>) => string;
  removeLine: (lineId: string) => void;
  updateLine: (lineId: string, patch: Partial<Line>) => void;

  addStation: (station: Partial<Station>) => string;
  updateStation: (id: ID, patch: Partial<Station>) => void;
  updateStationPos: (stationId: ID, pos: { x: number; y: number }) => void;
  moveSelectedStations: (delta: { x: number; y: number }) => void;

  selectionIds: ID[];
  select: (ids: ID[], additive?: boolean) => void;
  clearSelection: () => void;
  toggleSelection: (id: ID) => void;

  exportProjectJSON: (id: string) => string;
  importProjectJSON: (jsonStr: string, strategy?: 'merge' | 'overwrite' | 'rename') => { ok: boolean; message: string };

  past: any[];
  future: any[];
  pushHistory: (snapshot: any) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

const DEFAULT_PROJECT = (name = 'New Map'): Project => ({
  id: uuidv4(),
  name,
  createdAt: Date.now(),
  lines: {},
  stations: {},
  view: { x: 0, y: 0, scale: 1 },
  meta: {}
});

export const useStore = create<RootState>()(
  persist(
    (set, get) => ({
      projects: {},
      currentProjectId: undefined,

      createProject: (name) =>
        set((state) => {
          const p = DEFAULT_PROJECT(name);
          const projects = { ...state.projects, [p.id]: p };
          const s = JSON.parse(JSON.stringify(projects));
          return { projects, currentProjectId: p.id, past: [...(state.past || []), s] };
        }),
      switchProject: (id) => set({ currentProjectId: id }),
      deleteProject: (id) =>
        set((state) => {
          const projects = { ...state.projects };
          delete projects[id];
          const currentProjectId = state.currentProjectId === id ? Object.keys(projects)[0] : state.currentProjectId;
          const s = JSON.parse(JSON.stringify(projects));
          return { projects, currentProjectId, past: [...(state.past || []), s] };
        }),
      updateProject: (id, patch) => set((state) => ({ projects: { ...state.projects, [id]: { ...state.projects[id], ...patch } } })),

      addLine: (line) =>
        set((state) => {
          const pid = state.currentProjectId!;
          if (!pid) throw new Error('No current project');
          const project = JSON.parse(JSON.stringify(state.projects[pid])) as Project;
          const id = uuidv4();
          const newLine: Line = {
            id,
            name: line.name || '新线路',
            color: line.color || '#ff0000',
            width: line.width ?? 6,
            style: (line.style as any) || 'solid',
            isLoop: !!line.isLoop,
            stationIds: line.stationIds || [],
            branches: line.branches || [],
            labelOffset: line.labelOffset || { x: 0, y: 0 }
          };
          project.lines[id] = newLine;
          const projects = { ...state.projects, [pid]: project };
          get().pushHistory(JSON.parse(JSON.stringify(projects)));
          return { projects };
        }),

      removeLine: (lineId) =>
        set((state) => {
          const pid = state.currentProjectId!;
          if (!pid) return {} as any;
          const project = JSON.parse(JSON.stringify(state.projects[pid])) as Project;
          delete project.lines[lineId];
          const projects = { ...state.projects, [pid]: project };
          get().pushHistory(JSON.parse(JSON.stringify(projects)));
          return { projects };
        }),

      updateLine: (lineId, patch) =>
        set((state) => {
          const pid = state.currentProjectId!;
          const project = JSON.parse(JSON.stringify(state.projects[pid])) as Project;
          project.lines[lineId] = { ...project.lines[lineId], ...patch };
          const projects = { ...state.projects, [pid]: project };
          return { projects };
        }),

      addStation: (station) =>
        set((state) => {
          const pid = state.currentProjectId!;
          if (!pid) throw new Error('No current project');
          const project = JSON.parse(JSON.stringify(state.projects[pid])) as Project;
          const id = uuidv4();
          const newStation: Station = {
            id,
            name: station.name || '新站',
            code: station.code,
            pos: station.pos || { x: 0, y: 0 },
            type: station.type || 'normal',
            icon: station.icon,
            labelPosition: station.labelPosition || 'bottom'
          };
          project.stations[id] = newStation;
          const projects = { ...state.projects, [pid]: project };
          get().pushHistory(JSON.parse(JSON.stringify(projects)));
          return { projects };
        }),

      updateStation: (id, patch) =>
        set((state) => {
          const pid = state.currentProjectId!;
          const project = JSON.parse(JSON.stringify(state.projects[pid])) as Project;
          project.stations[id] = { ...project.stations[id], ...patch };
          const projects = { ...state.projects, [pid]: project };
          return { projects };
        }),

      updateStationPos: (stationId, pos) =>
        set((state) => {
          const pid = state.currentProjectId!;
          const project = JSON.parse(JSON.stringify(state.projects[pid])) as Project;
          project.stations[stationId] = { ...project.stations[stationId], pos };
          const projects = { ...state.projects, [pid]: project };
          return { projects };
        }),

      moveSelectedStations: (delta) =>
        set((state) => {
          const pid = state.currentProjectId!;
          if (!pid) return {} as any;
          const project = JSON.parse(JSON.stringify(state.projects[pid])) as Project;
          const sel = state.selectionIds || [];
          sel.forEach((id) => {
            const s = project.stations[id];
            if (!s) return;
            s.pos = { x: s.pos.x + delta.x, y: s.pos.y + delta.y };
          });
          const projects = { ...state.projects, [pid]: project };
          return { projects };
        }),

      selectionIds: [],
      select: (ids, additive = false) =>
        set((state) => {
          const next = additive ? Array.from(new Set([...(state.selectionIds || []), ...ids])) : ids;
          return { selectionIds: next };
        }),
      clearSelection: () => set({ selectionIds: [] }),
      toggleSelection: (id) =>
        set((state) => {
          const s = new Set(state.selectionIds || []);
          if (s.has(id)) s.delete(id);
          else s.add(id);
          return { selectionIds: Array.from(s) };
        }),

      exportProjectJSON: (id) => {
        const p = get().projects[id];
        if (!p) throw new Error('project not found');
        return exportProjectToJSON(p);
      },
      importProjectJSON: (jsonStr, strategy = 'rename') => {
        try {
          const parsed = JSON.parse(jsonStr);
          const res = importProjectFromJSON(parsed);
          if (!res.ok) return { ok: false, message: res.message };
          let imported = res.project as Project;
          const projects = { ...get().projects };
          if (projects[imported.id]) {
            if (strategy === 'rename') {
              imported.id = uuidv4();
              imported.name = imported.name + ' (导入)';
            } else if (strategy === 'overwrite') {
            } else if (strategy === 'merge') {
              const mapping: Record<string, string> = {};
              Object.keys(imported.stations).forEach((sid) => { mapping[sid] = uuidv4(); });
              const newStations: Record<string, any> = {};
              Object.entries(imported.stations).forEach(([sid, s]) => { const nid = mapping[sid]; newStations[nid] = { ...s, id: nid }; });
              const newLines: Record<string, any> = {};
              Object.entries(imported.lines).forEach(([lid, l]) => { const nlid = uuidv4(); newLines[nlid] = { ...l, id: nlid, stationIds: l.stationIds.map((sid: string) => mapping[sid] || sid) }; });
              imported.id = uuidv4();
              imported.stations = newStations;
              imported.lines = newLines;
            }
          }
          projects[imported.id] = imported;
          get().pushHistory(JSON.parse(JSON.stringify(projects)));
          set({ projects, currentProjectId: imported.id });
          return { ok: true, message: '导入成功' };
        } catch (err: any) {
          return { ok: false, message: err.message || '解析失败' };
        }
      },

      past: [],
      future: [],
      pushHistory: (snapshot) => set((state) => ({ past: [...(state.past || []), snapshot], future: [] })),
      undo: () =>
        set((state) => {
          const past = [...(state.past || [])];
          if (past.length === 0) return {} as any;
          const last = past.pop();
          const future = [JSON.parse(JSON.stringify(state.projects)), ...(state.future || [])];
          return { projects: last, past, future };
        }),
      redo: () =>
        set((state) => {
          const future = [...(state.future || [])];
          if (future.length === 0) return {} as any;
          const next = future.shift();
          const past = [...(state.past || []), JSON.parse(JSON.stringify(state.projects))];
          return { projects: next, past, future };
        }),
      clearHistory: () => set({ past: [], future: [] })
    }),
    {
      name: 'metro-tool-storage',
      serialize: (state) => LZString.compressToUTF16(JSON.stringify(state)),
      deserialize: (str) => JSON.parse(LZString.decompressFromUTF16(str) || '{}')
    }
  )
);
