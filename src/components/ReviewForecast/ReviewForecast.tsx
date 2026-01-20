import { useEffect, useState } from "react";
import useForecastTotalsStoreFacade from "../../stores/useForecastTotalsStore/useForecastTotalsStore.facade";
import useUserInfoStoreFacade from "../../stores/useUserInfoStore/useUserInfoStore.facade";
import { useReviews } from "../../hooks/assignments/useReviews";
import DailyReviewForecast from "./DailyReviewForecast";
import LoadingDots from "../LoadingDots";
import Card from "../Card";
import { LoadingContainer } from "../../styles/BaseStyledComponents";
import styled from "styled-components";

const ForecastCard = styled(Card)`
  cursor: pointer;
  user-select: none;
`;

const ToggleIcon = styled.span<{ isExpanded: boolean }>`
  font-size: 1.1rem;
  line-height: 1;
  transform: ${({ isExpanded }) =>
    isExpanded ? "rotate(180deg)" : "rotate(0deg)"};
  transition: transform 150ms ease;
`;

const ForecastList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DaySeparator = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
`;

const SeparatorLine = styled.div`
  flex: 1;
  height: 2px;
  background: rgba(0, 0, 0, 0.15);
`;

const dayOfWeekNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

type StartAndEndTimeInfo = {
  dayOfWeek: string;
  startTimeIsoString: string;
  endTimeIsoString: string;
};

const createStartAndEndDatesForWeek = (date: Date): StartAndEndTimeInfo[] => {
  return Array(7)
    .fill(new Date(date))
    .map((el, index) => {
      const currDay = new Date();
      currDay.setDate(el.getDate() + index);

      const startTime = new Date(currDay);
      if (index !== 0) {
        startTime.setHours(0, 0, 0, 0);
      }

      const endTime = new Date(currDay);
      endTime.setHours(23, 59, 59, 999);

      const dayOfWeek = dayOfWeekNames[startTime.getDay()];

      return {
        dayOfWeek,
        startTimeIsoString: startTime.toISOString(),
        endTimeIsoString: endTime.toISOString(),
      };
    });
};

// TODO: fix issue where not reloading all data once coming back to page
function ReviewForecast() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [startAndEndTimes, setStartAndEndTimes] = useState<
    StartAndEndTimeInfo[]
  >([]);

  const { userInfo } = useUserInfoStoreFacade();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (userInfo && userInfo.level) {
      setIsEnabled(true);
    } else {
      setIsEnabled(false);
    }
  }, [userInfo]);

  const {
    seedRunningTotalAvailableReviews,
    runningTotalAvailableReviews: runningTotals,
  } = useForecastTotalsStoreFacade();

  const { isLoading: availForReviewLoading, data: availForReviewData } =
    useReviews(isEnabled);

  // TODO: this might have issues not conforming to invalidation times of availForReviewData, hmm
  useEffect(() => {
    if (!availForReviewLoading && availForReviewData) {
      // using previously fetched data if already loaded
      if (runningTotals.length === 0) {
        seedRunningTotalAvailableReviews(availForReviewData.length);
      }

      const forecastTimes = createStartAndEndDatesForWeek(new Date());
      setStartAndEndTimes(forecastTimes);

      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [availForReviewLoading]);

  return (
    <>
      {isLoading ? (
        <LoadingContainer>
          <LoadingDots size="md" />
        </LoadingContainer>
      ) : (
        <ForecastCard
          margin="12px 0"
          headerBgColor="var(--ion-color-primary)"
          title="Review Forecast"
          headerTextColor="black"
          headerRight={<ToggleIcon isExpanded={isExpanded}>▾</ToggleIcon>}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((prev) => !prev)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsExpanded((prev) => !prev);
            }
          }}
        >
          {isExpanded && (
            <ForecastList>
              {startAndEndTimes.map((forecastForDayTimes, index) => (
                <div key={index}>
                  <DaySeparator>
                    <span>{forecastForDayTimes.dayOfWeek}</span>
                    <SeparatorLine />
                  </DaySeparator>
                  <DailyReviewForecast
                    index={index}
                    startDateIsoString={forecastForDayTimes.startTimeIsoString}
                    endDateIsoString={forecastForDayTimes.endTimeIsoString}
                  />
                </div>
              ))}
            </ForecastList>
          )}
        </ForecastCard>
      )}
    </>
  );
}

export default ReviewForecast;
