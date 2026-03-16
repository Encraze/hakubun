import { create } from "zustand";

export interface ForeCastTotalsState {
  runningTotalAvailableReviews: number[];
}

export interface ForeCastTotalsActions {
  seedRunningTotalAvailableReviews: (reviewsAvailableNow: number) => void;
  updateRunningTotalAvailableReviews: (
    totalAvailableForDay: number,
    indexToUpdate: number
  ) => void;
  resetAll: () => void;
}

export const initialState: ForeCastTotalsState = {
  runningTotalAvailableReviews: [],
};

export const useForecastTotalsStore = create<
  ForeCastTotalsState & ForeCastTotalsActions
>((set, get) => ({
  ...initialState,
  updateRunningTotalAvailableReviews: (totalAvailableForDay, indexToUpdate) => {
    const currentTotals = get().runningTotalAvailableReviews;
    const updatedRunningTotal = [...currentTotals];
    updatedRunningTotal[indexToUpdate + 1] =
      (updatedRunningTotal[indexToUpdate] ?? 0) + totalAvailableForDay;

    set(() => ({
      runningTotalAvailableReviews: updatedRunningTotal,
    }));
  },
  seedRunningTotalAvailableReviews: (reviewsAvailableNow) => {
    set(() => ({
      runningTotalAvailableReviews: [reviewsAvailableNow],
    }));
  },
  resetAll: () => {
    set(initialState);
  },
}));
