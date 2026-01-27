import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserInfoStoreFacade from "../stores/useUserInfoStore/useUserInfoStore.facade";
import { useUserLogin } from "../hooks/user/useUserLogin";
import GeneralUserSettings from "../components/GeneralUserSettings";
import LessonUserSettings from "../components/LessonUserSettings";
import ReviewUserSettings from "../components/ReviewUserSettings/ReviewUserSettings";
import Button from "../components/Button";
import PageHeader from "../components/PageHeader";
import AlertModal from "../components/AlertModal";
import { MainContent } from "../styles/BaseStyledComponents";
import styled from "styled-components";

const Content = styled(MainContent)`
  padding-bottom: 20px;
`;

const SettingBtnsContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
`;

const SettingsBtn = styled(Button)`
  padding: 10px;
  font-size: 1.25rem;
  border-radius: 12px;
`;

const Username = styled.h2`
  text-align: center;
`;

// TODO: change to get defaults from API
function Settings() {
  const [isLogoutConfirmationShown, setIsLogoutConfirmationShown] =
    useState(false);
  const { logout } = useUserLogin();
  const { userInfo } = useUserInfoStoreFacade();
  const navigate = useNavigate();
  const username = userInfo?.username;

  const removeAuth = () => {
    logout();
    navigate("/authenticate");
  };

  return (
    <>
      <PageHeader title="User Settings" bgColor="var(--foreground-color)" />
      <Content>
        {username && <Username>{username}</Username>}
        <GeneralUserSettings />
        <LessonUserSettings />
        <ReviewUserSettings />
        <SettingBtnsContainer>
          <ButtonRow>
            <SettingsBtn
              backgroundColor="var(--ion-color-danger)"
              color="white"
              onPress={() => setIsLogoutConfirmationShown(true)}
            >
              Log Out
            </SettingsBtn>
          </ButtonRow>
        </SettingBtnsContainer>
      </Content>

      <AlertModal
        open={isLogoutConfirmationShown}
        onOpenChange={setIsLogoutConfirmationShown}
      >
        <AlertModal.Content
          modalID="confirm-log-out-alert-modal"
          isOpen={isLogoutConfirmationShown}
          title="Log Out"
          confirmText="Yes"
          description="Are you sure you want to log out?"
          cancelText="No"
          onConfirmClick={() => removeAuth()}
          onCancelClick={() => setIsLogoutConfirmationShown(false)}
        />
      </AlertModal>
    </>
  );
}

export default Settings;
