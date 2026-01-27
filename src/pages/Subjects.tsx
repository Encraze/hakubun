import { useEffect, useState } from "react";
import { LEVELS } from "../constants";
import useUserInfoStoreFacade from "../stores/useUserInfoStore/useUserInfoStore.facade";
import { useTabBarHeight } from "../contexts/TabBarHeightContext";
import { useStickyState } from "../hooks/useStickyState";
import SubjectsOnLvlTab from "../components/SubjectsOnLvlTab/SubjectsOnLvlTab";
import LoadingDots from "../components/LoadingDots";
import Paginator from "../components/Paginator";
import {
  ContentWithTabBar,
  FixedCenterContainer,
  Header,
} from "../styles/BaseStyledComponents";
import styled from "styled-components";

type SubjectsPageContainerProps = {
  $tabBarHeight: string;
};

const SubjectsPageContainer = styled(
  ContentWithTabBar
) <SubjectsPageContainerProps>`
  overflow-y: auto;
  min-height: 100dvh;
  padding: 0;
  padding-bottom: ${({ $tabBarHeight }) => `calc(${$tabBarHeight} + 30px)`};
`;

const SubjectsHeader = styled(Header)`
  color: black;
  text-align: center;
  padding: 10px 0;
`;

// TODO: add indicator for current level (since not always the one selected)
export const Subjects = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { userInfo } = useUserInfoStoreFacade();
  const [level, setLevel] = useStickyState(0, "subjects-pg-level-selected");

  useEffect(() => {
    if (userInfo && userInfo.level) {
      if (level === 0) {
        setLevel(userInfo.level);
      }
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [userInfo, userInfo?.level]);

  return (
    <>
      {isLoading ? (
        <FixedCenterContainer>
          <LoadingDots />
        </FixedCenterContainer>
      ) : (
        <SubjectsContent level={level} setLevel={setLevel} />
      )}
    </>
  );
};

type SubjectsContentProps = {
  level: number;
  setLevel: (level: number) => void;
};

const SubjectsContent = ({ level, setLevel }: SubjectsContentProps) => {
  const { tabBarHeight } = useTabBarHeight();
  const [[currentPage, direction], setCurrentPage] = useState([level - 1, 0]);
  const levelPages = LEVELS.map((levelPg) => (
    <SubjectsOnLvlTab
      key={levelPg}
      level={levelPg}
      isSelected={currentPage === levelPg}
    />
  ));
  const setPage = (
    newPage: number,
    newDirection: number = newPage - currentPage
  ) => {
    setCurrentPage([newPage, newDirection]);
    setLevel(newPage + 1);
  };

  return (
    <>
      <SubjectsHeader bgcolor="var(--ion-color-primary-tint)">
        <LevelSelectContainer>
          <span>Level</span>
          <SelectWrapper>
            <StyledSelect
              value={level}
              onChange={(e) => {
                const newLevel = parseInt(e.target.value);
                setPage(newLevel - 1);
              }}
            >
              {LEVELS.map((levelOption) => (
                <option key={levelOption} value={levelOption}>
                  {levelOption}
                </option>
              ))}
            </StyledSelect>
            <ChevronIcon>▾</ChevronIcon>
          </SelectWrapper>
        </LevelSelectContainer>
      </SubjectsHeader>
      <SubjectsPageContainer $tabBarHeight={tabBarHeight}>
        <Paginator
          showNavigationButtons={false}
          pageArr={levelPages}
          currentPage={currentPage}
          direction={direction}
          setCurrentPage={setCurrentPage}
        />
      </SubjectsPageContainer>
    </>
  );
};

const LevelSelectContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  font-size: 1.5rem;
`;

const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledSelect = styled.select`
  appearance: none;
  background: var(--ion-color-primary);
  color: white;
  border: 2px solid black;
  border-radius: 8px;
  padding: 4px 28px 4px 12px;
  font-size: 1.25rem;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;

  &:focus {
    outline: 2px solid var(--focus-color);
    outline-offset: 2px;
  }
`;

const ChevronIcon = styled.span`
  position: absolute;
  right: 8px;
  pointer-events: none;
  font-size: 1.2rem;
  color: white;
  display: flex;
  align-items: center;
`;

