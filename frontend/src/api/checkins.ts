import { apiRequest } from "./client";
import type { CheckInListItem } from "../types/checkins";

export const fetchCheckIns = async (
  signal?: AbortSignal
): Promise<CheckInListItem[]> => {
  return apiRequest<CheckInListItem[]>("/check-ins", { signal });
};
