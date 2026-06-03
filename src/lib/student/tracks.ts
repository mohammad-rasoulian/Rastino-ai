export const studentTracks = [
  { id: "general", label: "عمومی", minGrade: 1, maxGrade: 9 },
  { id: "math", label: "ریاضی فیزیک", minGrade: 10, maxGrade: 12 },
  { id: "experimental", label: "علوم تجربی", minGrade: 10, maxGrade: 12 },
  { id: "humanities", label: "ادبیات و علوم انسانی", minGrade: 10, maxGrade: 12 },
  { id: "islamic", label: "علوم و معارف اسلامی", minGrade: 10, maxGrade: 12 },
  { id: "technical", label: "فنی‌وحرفه‌ای", minGrade: 10, maxGrade: 12 },
  { id: "vocational", label: "کاردانش", minGrade: 10, maxGrade: 12 },
] as const;

export function getTracksForGrade(grade: number) {
  return studentTracks.filter(
    (track) => grade >= track.minGrade && grade <= track.maxGrade
  );
}

export function getTrackLabel(trackId: string) {
  return studentTracks.find((track) => track.id === trackId)?.label || "عمومی";
}
