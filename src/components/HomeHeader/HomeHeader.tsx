import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserInfoStoreFacade from "../../stores/useUserInfoStore/useUserInfoStore.facade";
import Button from "../Button";
import SvgIcon from "../SvgIcon";
import SettingsIcon from "../../images/settings.svg?react";
import { Header } from "../../styles/BaseStyledComponents";
import styled from "styled-components";

const SettingsButton = styled(Button)`
  border-radius: 12px;
  padding: 5px;
`;

const HeaderWrapper = styled(Header)`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const UserInfoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  p {
    font-size: 1.25rem;
    margin: 0;
  }
`;

const AppLogo = styled.img`
  width: 2em;
  height: 2em;
  object-fit: contain;
`;

const RefreshAndSettingsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  p {
    font-size: 1.25rem;
    margin: 0;
  }
`;

const AppName = styled.h1`
  margin: 0;
  font-size: 2rem;
  min-height: 1em;
`;

const FirstRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FadeLabel = styled.span<{ $visible: boolean }>`
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 300ms ease;
  white-space: nowrap;
`;

// TODO: sometimes settings button somehow redirects to /reviews/settings and not settings? fix
function HomeHeader() {
  const navigate = useNavigate();
  const { userInfo } = useUserInfoStoreFacade();
  const [level, setLevel] = useState<number | undefined>();
  const [displayStage, setDisplayStage] = useState<
    "app" | "user" | "level"
  >("app");
  const [isLabelVisible, setIsLabelVisible] = useState(true);
  const hasStartedCycleRef = useRef(false);
  const hasCompletedCycleRef = useRef(false);
  const cycleCompleteTimerRef = useRef<number | null>(null);
  const toUserFadeOutRef = useRef<number | null>(null);
  const toUserSwapRef = useRef<number | null>(null);
  const toLevelFadeOutRef = useRef<number | null>(null);
  const toLevelSwapRef = useRef<number | null>(null);

  useEffect(() => {
    setUserDetails();
  }, [userInfo]);

  useEffect(() => {
    const hasCompletedCycle =
      window.sessionStorage.getItem("home-header-cycle-complete") === "true";
    if (hasCompletedCycle) {
      hasCompletedCycleRef.current = true;
      setDisplayStage("level");
      setIsLabelVisible(true);
      return;
    }

    if (!userInfo || hasStartedCycleRef.current) {
      return;
    }

    hasStartedCycleRef.current = true;
    setDisplayStage("app");
    setIsLabelVisible(true);

    toUserFadeOutRef.current = window.setTimeout(() => {
      setIsLabelVisible(false);
    }, 1500);
    toUserSwapRef.current = window.setTimeout(() => {
      setDisplayStage("user");
      setIsLabelVisible(true);
    }, 1800);
    toLevelFadeOutRef.current = window.setTimeout(() => {
      setIsLabelVisible(false);
    }, 3300);
    toLevelSwapRef.current = window.setTimeout(() => {
      setDisplayStage("level");
      setIsLabelVisible(true);
    }, 3600);

    cycleCompleteTimerRef.current = window.setTimeout(() => {
      window.sessionStorage.setItem("home-header-cycle-complete", "true");
      hasCompletedCycleRef.current = true;
    }, 3600);
  }, [userInfo]);

  useEffect(() => {
    return () => {
      if (toUserFadeOutRef.current) {
        clearTimeout(toUserFadeOutRef.current);
      }
      if (toUserSwapRef.current) {
        clearTimeout(toUserSwapRef.current);
      }
      if (toLevelFadeOutRef.current) {
        clearTimeout(toLevelFadeOutRef.current);
      }
      if (toLevelSwapRef.current) {
        clearTimeout(toLevelSwapRef.current);
      }
      if (cycleCompleteTimerRef.current) {
        clearTimeout(cycleCompleteTimerRef.current);
      }
    };
  }, []);
  const setUserDetails = () => {
    if (userInfo) {
      setLevel(userInfo.level);
    }
  };

  // TODO: show loading skeleton
  return (
    <HeaderWrapper bgcolor="var(--foreground-color)">
      <FirstRow>
        <UserInfoContainer>
          <AppLogo src="/sakura_icon.png" alt="SakuraQult logo" />
          <AppName data-testid="home-heading">
            <FadeLabel $visible={isLabelVisible}>
              {displayStage === "app" && "桜カルト"}
              {displayStage === "user" && (userInfo?.username ?? "")}
              {displayStage === "level" &&
                (level !== undefined ? `Level ${level}` : "")}
            </FadeLabel>
          </AppName>
        </UserInfoContainer>
        <RefreshAndSettingsContainer>

          <SettingsButton
            aria-label="User settings page"
            backgroundColor="transparent"
            onPress={() => navigate("/settings")}
          >
            <SvgIcon icon={<SettingsIcon />} width="2.75em" height="2.75em" />
          </SettingsButton>
        </RefreshAndSettingsContainer>
      </FirstRow>
    </HeaderWrapper>
  );
}

export default HomeHeader;
