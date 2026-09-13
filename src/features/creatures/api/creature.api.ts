import { creatureNamesSchema, creatureSchema } from "./creature.schemas";
import tibiaWikiApi from "@/services/tibiaWikiApi";

const creaturesPath = "/api/creatures";

export async function getCreatureNames(signal?: AbortSignal) {
  const response = await tibiaWikiApi.get(creaturesPath, { signal });
  return creatureNamesSchema.parse(response.data);
}

export async function getCreature(name: string, signal?: AbortSignal) {
  const response = await tibiaWikiApi.get(
    `${creaturesPath}/${encodeURIComponent(name)}`,
    { signal },
  );

  return creatureSchema.parse(response.data);
}
