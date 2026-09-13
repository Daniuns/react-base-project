import { z } from "zod";

export const creatureNamesSchema = z.array(z.string().min(1));

const stringOrNumberSchema = z.union([z.string(), z.number()]);

const rawCreatureSchema = z.looseObject({
  name: z.string().min(1),
  hp: stringOrNumberSchema.optional(),
  exp: stringOrNumberSchema.optional(),
  speed: stringOrNumberSchema.optional(),
  attacktype: z.string().optional(),
  occurrence: z.string().optional(),
  bestiaryclass: z.string().optional(),
  bestiarylevel: z.string().optional(),
  creatureclass: z.string().optional(),
  bestiarytext: z.string().optional(),
});

function parseOptionalNumber(value: string | number | undefined) {
  if (value === undefined || value === "") {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export const creatureSchema = rawCreatureSchema.transform((creature) => ({
  name: creature.name,
  hitPoints: parseOptionalNumber(creature.hp),
  experience: parseOptionalNumber(creature.exp),
  speed: parseOptionalNumber(creature.speed),
  attackType: creature.attacktype ?? null,
  occurrence: creature.occurrence ?? null,
  bestiaryClass: creature.bestiaryclass ?? null,
  bestiaryLevel: creature.bestiarylevel ?? null,
  creatureClass: creature.creatureclass ?? null,
  description: creature.bestiarytext ?? null,
}));

export type Creature = z.infer<typeof creatureSchema>;
