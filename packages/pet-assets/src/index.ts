import monaJson from "../mona/pet.json";
import type { PetManifest } from "@ragdoll-desktop/shared";

const monaImageUrl = new URL("../mona/mona-spritesheet.png", import.meta.url).href;

export const defaultRagdollPet: PetManifest = {
  ...(monaJson as PetManifest),
  spritesheets: (monaJson as PetManifest).spritesheets.map((sheet) => ({
    ...sheet,
    image: sheet.id === "main" ? monaImageUrl : sheet.image
  }))
};
