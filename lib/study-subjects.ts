/**
 * Maps ingest `studySubjects` strings onto kinds editorial validation
 * compares across English and Japanese copy.
 *
 * This is not a second taxonomy. FieldId and EvidenceLevel stay canonical.
 * These strings are the same labels `automation/rank.ts` already writes.
 */
export const SUBJECT_KINDS = ["human", "animal", "cell", "tissue"] as const;
export type SubjectKind = (typeof SUBJECT_KINDS)[number];

export const STUDY_SUBJECT_LABELS = [
  "living-people",
  "human-tissue",
  "deceased-donor-tissue",
  "cells-tissues-organoids",
  "mice",
  "rats",
  "minipigs",
  "zebrafish",
  "flies",
  "worms",
] as const;
export type StudySubjectLabel = (typeof STUDY_SUBJECT_LABELS)[number];

const ANIMAL_LABELS = new Set([
  "mice",
  "rats",
  "minipigs",
  "zebrafish",
  "flies",
  "worms",
]);

const TISSUE_LABELS = new Set(["human-tissue", "deceased-donor-tissue"]);

export function subjectKinds(studySubjects: readonly string[]): SubjectKind[] {
  const kinds = new Set<SubjectKind>();
  for (const raw of studySubjects) {
    const value = raw.toLowerCase();
    if (value === "living-people") kinds.add("human");
    if (TISSUE_LABELS.has(value)) kinds.add("tissue");
    if (ANIMAL_LABELS.has(value) || value.includes("animal")) kinds.add("animal");
    if (
      value === "cells-tissues-organoids" ||
      value.includes("cell") ||
      value.includes("organoid")
    ) {
      kinds.add("cell");
    }
  }
  return SUBJECT_KINDS.filter((kind) => kinds.has(kind));
}

export function hasLivingPeople(studySubjects: readonly string[]): boolean {
  return studySubjects.some((value) => value.toLowerCase() === "living-people");
}
