import { z } from 'zod';

const StationSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional(),
  pos: z.object({ x: z.number(), y: z.number() }),
  type: z.enum(['normal', 'transfer', 'terminal']),
  icon: z.string().optional(),
  labelPosition: z.enum(['top', 'bottom', 'left', 'right']).optional()
});

const LineSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  width: z.number(),
  style: z.enum(['solid', 'dashed']),
  isLoop: z.boolean(),
  stationIds: z.array(z.string()),
  branches: z.array(z.any()).optional(),
  labelOffset: z.object({ x: z.number(), y: z.number() }).optional()
});

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
  lines: z.record(LineSchema),
  stations: z.record(StationSchema),
  view: z.object({ x: z.number(), y: z.number(), scale: z.number() }).optional(),
  meta: z.any().optional()
});

export function exportProjectToJSON(project: any) {
  return JSON.stringify(project, null, 2);
}

export function importProjectFromJSON(obj: any): { ok: boolean; message?: string; project?: any } {
  try {
    const parsed = ProjectSchema.parse(obj);
    return { ok: true, project: parsed };
  } catch (err: any) {
    return { ok: false, message: (err?.errors && JSON.stringify(err.errors)) || err.message || '格式校验失败' };
  }
}
