import { useEffect, useRef, useState } from "react";
import {
  animate,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import { toHiragana } from "wanakana";
import useQueueStoreFacade from "../../stores/useQueueStore/useQueueStore.facade";
import { isUserAnswerValid } from "../../services/AssignmentQueueService/AssignmentQueueService";
import { closeAllToasts, displayToast } from "../Toast/Toast.service";
import { SubjectType } from "../../types/Subject";
import { AssignmentQueueItem } from "../../types/AssignmentQueueTypes";
import AssignmentCharAndType from "./AssignmentCharAndType";
import AssignmentAnswerInput from "./AssignmentAnswerInput";
import {
  AssignmentCardStyled,
  SkillLevelDot,
} from "./AssignmentQueueCardsStyled";
import {
  getSrsLevelColor,
  getSrsStageNameByNum,
} from "../../services/SubjectAndAssignmentService/SubjectAndAssignmentService";
import { SrsLevelName } from "../../types/MiscTypes";

type CardProps = {
  currentReviewItem: AssignmentQueueItem;
  handleNextCard: (
    currentReviewItem: AssignmentQueueItem,
    userAnswer: string,
    setUserAnswer: (userAnswer: string) => void
  ) => void;
  handleRetryCard: (
    currentReviewItem: AssignmentQueueItem,
    userAnswer: string,
    setUserAnswer: (userAnswer: string) => void
  ) => void;
};

export const AssignmentQueueCard = ({
  currentReviewItem,
  handleNextCard,
  handleRetryCard,
}: CardProps) => {
  const { savedUserAnswer, setSavedUserAnswer, isSubmittingAnswer } =
    useQueueStoreFacade();
  const initialUserAnswer =
    !isSubmittingAnswer || savedUserAnswer === null ? "" : savedUserAnswer;
  const [userAnswer, setUserAnswer] = useState(initialUserAnswer);
  const cardFlipY = useMotionValue(0);
  const [shakeInputTrigger, setShakeInputTrigger] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isTransitioningRef = useRef(false);
  const flipHalfDurationSec = 0.3;
  const srsStageName = getSrsStageNameByNum(currentReviewItem.srs_stage);
  const srsColor = srsStageName
    ? getSrsLevelColor(srsStageName as SrsLevelName)
    : null;

  const unloadAudioTimerId = useRef<number | null>(null);

  useEffect(() => {
    if (!isTransitioningRef.current) {
      cardFlipY.set(0);
      setIsTransitioning(false);
    }

    currentReviewItem.readingAudios?.forEach((readingAudio) => {
      readingAudio.audioFile.load();
    });
    return () => {
      unloadAudioTimerId.current = window.setTimeout(() => {
        currentReviewItem.readingAudios?.forEach((readingAudio) => {
          readingAudio.audioFile.unload();
        });

        if (unloadAudioTimerId.current) {
          clearTimeout(unloadAudioTimerId.current);
          unloadAudioTimerId.current = null;
        }
      }, 5000);
    };
  }, [currentReviewItem]);

  const runFlipTransition = (onHalfFlip: () => void) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    animate(cardFlipY, 90, {
      duration: flipHalfDurationSec,
      ease: "easeIn",
    })
      .then(() => {
        onHalfFlip();
        cardFlipY.set(-90);
        return animate(cardFlipY, 0, {
          duration: flipHalfDurationSec,
          ease: "easeOut",
        });
      })
      .catch(() => {
        // no-op; unlock is handled in finally-style continuation below
      })
      .finally(() => {
        isTransitioningRef.current = false;
        setIsTransitioning(false);
      });
  };

  const retryTriggered = () => {
    const strippedUserAnswer = userAnswer.trim();

    if (isSubmittingAnswer) {
      runFlipTransition(() => {
        handleRetryCard(currentReviewItem, strippedUserAnswer, setUserAnswer);
      });
    } else {
      const cantRetryMsg =
        strippedUserAnswer === ""
          ? "Input is empty, you can't retry this item!"
          : "You haven't submitted your answer, you can't retry this item!";

      displayToast({
        toastType: "warning",
        title: "Can't Retry!",
        content: cantRetryMsg,
        timeout: 10000,
      });
    }
  };

  const tapToRetryTriggered = () => {
    const canTapToRetry =
      isSubmittingAnswer &&
      currentReviewItem.is_correct_answer === false &&
      !isTransitioning;

    if (canTapToRetry) {
      retryTriggered();
    }
  };

  const attemptToAdvance = () => {
    closeAllToasts();
    const strippedUserAnswer = userAnswer.trim();
    currentReviewItem.review_type === "reading" &&
      setUserAnswer(toHiragana(strippedUserAnswer));

    const isValidInfo = isUserAnswerValid(
      currentReviewItem,
      strippedUserAnswer
    );
    if (isValidInfo.isValid === false) {
      displayToast({
        toastType: "warning",
        title: "Invalid Answer",
        content: isValidInfo.message,
        timeout: 10000,
      });
      setShakeInputTrigger((shakeInputTrigger) => shakeInputTrigger + 1);
    } else {
      setSavedUserAnswer(strippedUserAnswer);
      runFlipTransition(() => {
        handleNextCard(currentReviewItem, strippedUserAnswer, setUserAnswer);
      });
    }
  };

  return (
    <AnimatePresence>
      {currentReviewItem && (
        <>
          <AssignmentCardStyled
            subjtype={currentReviewItem.object as SubjectType}
            style={{
              rotateY: cardFlipY,
            }}
            onClick={tapToRetryTriggered}
          >
            {srsColor && <SkillLevelDot srsColor={srsColor} />}
            <AssignmentCharAndType
              currentReviewItem={currentReviewItem}
              disableTextSelection={true}
            />
            <AssignmentAnswerInput
              shakeInputTrigger={shakeInputTrigger}
              currentReviewItem={currentReviewItem}
              userAnswer={userAnswer}
              setUserAnswer={setUserAnswer}
              nextBtnClicked={attemptToAdvance}
              isTransitioning={isTransitioning}
            />
          </AssignmentCardStyled>
        </>
      )}
    </AnimatePresence>
  );
};
