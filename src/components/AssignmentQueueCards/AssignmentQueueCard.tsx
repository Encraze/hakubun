import { useEffect, useRef, useState } from "react";
import {
  animate,
  useMotionValue,
  useTransform,
  AnimatePresence,
  PanInfo,
} from "framer-motion";
import { toHiragana } from "wanakana";
import useQueueStoreFacade from "../../stores/useQueueStore/useQueueStore.facade";
import { isUserAnswerValid } from "../../services/AssignmentQueueService/AssignmentQueueService";
import { closeAllToasts, displayToast } from "../Toast/Toast.service";
import { SubjectType } from "../../types/Subject";
import { AssignmentQueueItem } from "../../types/AssignmentQueueTypes";
import AssignmentCharAndType from "./AssignmentCharAndType";
import AssignmentAnswerInput from "./AssignmentAnswerInput";
import SvgIcon from "../SvgIcon";
import RetryIcon from "../../images/retry.svg?react";
import NextIcon from "../../images/next-item.svg?react";
import {
  NextCardOverlay,
  RetryCardOverlay,
  AssignmentCardStyled,
  SwipeIconAndText,
  SwipeTxt,
  SwipeIcon,
} from "./AssignmentQueueCardsStyled";

const getOffscreenX = (direction: "left" | "right") => {
  const width = window?.innerWidth ?? 1000;
  return direction === "left" ? -width * 1.1 : width * 1.1;
};

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

  const dragX = useMotionValue(0);
  const opacityLeft = useTransform(dragX, [-100, 1], [1, 0]);
  const opacityRight = useTransform(dragX, [0, 100], [0, 1]);
  const rotate = useTransform(dragX, [-250, 0, 250], [-20, 0, 20]);
  const [shakeInputTrigger, setShakeInputTrigger] = useState(0);
  const exitTimeMs = 200;

  const cardEnterTimerId = useRef<number | null>(null);
  const cardExitTimerId = useRef<number | null>(null);
  const unloadAudioTimerId = useRef<number | null>(null);
  const getAnimationDuration = (targetX: number) => {
    const distance = Math.abs(targetX - dragX.get());
    const speed = 2500;
    const duration = distance / speed;
    return Math.min(0.3, Math.max(0.16, duration));
  };
  const animateToX = (targetX: number) => {
    return animate(dragX, targetX, {
      duration: getAnimationDuration(targetX),
      ease: "easeOut",
    });
  };

  const removeTimeouts = () => {
    if (cardEnterTimerId.current) {
      clearTimeout(cardEnterTimerId.current);
      cardEnterTimerId.current = null;
    }
    if (cardExitTimerId.current) {
      clearTimeout(cardExitTimerId.current);
      cardExitTimerId.current = null;
    }
  };

  useEffect(() => {
    removeTimeouts();
    // slightly delaying so user has time to see screen before card appears
    dragX.set(getOffscreenX("left"));
    cardEnterTimerId.current = window.setTimeout(() => {
      animateToX(0);
    }, 50);

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
      removeTimeouts();
    };
  }, [currentReviewItem]);

  const retryTriggered = () => {
    const strippedUserAnswer = userAnswer.trim();

    if (isSubmittingAnswer) {
      animateToX(getOffscreenX("left"));
      removeTimeouts();
      cardExitTimerId.current = window.setTimeout(() => {
        handleRetryCard(currentReviewItem, strippedUserAnswer, setUserAnswer);
        animateToX(0);
      }, exitTimeMs);
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
      animateToX(0);
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
      animateToX(getOffscreenX("right"));

      removeTimeouts();
      cardExitTimerId.current = window.setTimeout(() => {
        handleNextCard(currentReviewItem, strippedUserAnswer, setUserAnswer);
        // TODO: check if answer was correct or not, then show toast
      }, exitTimeMs);
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent, info: PanInfo) => {
    const xOffsetTrigger = 135;
    const xMinOffset = 100;
    const xMinVelocity = 350;
    if (
      info.offset.x > xOffsetTrigger ||
      (info.offset.x > xMinOffset && info.velocity.x > xMinVelocity)
    ) {
      attemptToAdvance();
    } else if (
      info.offset.x < -xOffsetTrigger ||
      (info.offset.x < -xMinOffset && info.velocity.x < -xMinVelocity)
    ) {
      retryTriggered();
    } else {
      animateToX(0);
    }
  };

  return (
    <AnimatePresence>
      {currentReviewItem && (
        <>
          <AssignmentCardStyled
            subjtype={currentReviewItem.object as SubjectType}
            style={{
              x: dragX,
              rotate,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            whileTap={{ cursor: "grabbing" }}
            dragElastic={0.5}
          >
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
            />
            <RetryCardOverlay
              style={{
                opacity: opacityLeft,
              }}
            >
              <SwipeIconAndText>
                <SwipeIcon>
                  <SvgIcon icon={<RetryIcon />} width="85px" height="85px" />
                </SwipeIcon>
                <SwipeTxt>Retry</SwipeTxt>
              </SwipeIconAndText>
            </RetryCardOverlay>
            <NextCardOverlay
              style={{
                opacity: opacityRight,
              }}
            >
              <SwipeIconAndText>
                <SwipeIcon>
                  <SvgIcon icon={<NextIcon />} width="85px" height="85px" />
                </SwipeIcon>
                <SwipeTxt>Next</SwipeTxt>
              </SwipeIconAndText>
            </NextCardOverlay>
          </AssignmentCardStyled>
        </>
      )}
    </AnimatePresence>
  );
};
