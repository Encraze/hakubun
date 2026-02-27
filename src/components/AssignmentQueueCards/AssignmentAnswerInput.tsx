import {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useAnimate } from "framer-motion";
import WanakanaInput from "./WanakanaInput";
import { AssignmentQueueItem } from "../../types/AssignmentQueueTypes";
import useQueueStoreFacade from "../../stores/useQueueStore/useQueueStore.facade";
import {
  getAnswersForMeaningReviews,
  getAnswersForReadingReviews,
} from "../../services/AssignmentQueueService/AssignmentQueueService";
import Button from "../Button";
import SvgIcon from "../SvgIcon";
import NextArrowIcon from "../../images/next-arrow-color.svg?react";
import HintQuestionMarkIcon from "../../images/hint-question-mark.svg?react";
import styled from "styled-components";

const InputRow = styled(motion.div)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 12px;
  margin-top: 6px;
`;

const AnswerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

type AnswerInputProps = {
  inputcolor: string;
  translateToHiragana: boolean;
};

// uses japanese font if translateToHiragana is true, with English fallback since can be mixed
const AnswerInput = styled(WanakanaInput)<AnswerInputProps>`
  width: 100%;
  padding: 12px;
  text-align: center;
  font-size: 1.25rem;
  color: var(--button-text-color);
  background-color: ${({ inputcolor }) => inputcolor};
  font-family: ${({ translateToHiragana }) =>
    translateToHiragana && "var(--japanese-with-english-fallback-font-family)"};
  resize: none;
  overflow: hidden;
  min-height: 44px;
`;

const SubmitBtn = styled(Button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;

const HintBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  position: absolute;
  left: 12px;
  bottom: 16px;
  z-index: 2;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

const HintPopup = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  background: var(--darkest-color, #1a1a2e);
  color: var(--text-color, #fff);
  border-radius: 10px;
  padding: 12px 16px;
  min-width: 180px;
  max-width: 280px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  z-index: 10;
  pointer-events: none;
`;

const HintList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HintItem = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  font-size: 1.1rem;
`;

const HintMeta = styled.span`
  font-size: 0.85rem;
  opacity: 0.8;
`;

const HintEmpty = styled.p`
  margin: 0;
  opacity: 0.8;
`;

type Props = {
  currentReviewItem: AssignmentQueueItem;
  userAnswer: string;
  setUserAnswer: (value: SetStateAction<string>) => void;
  nextBtnClicked: () => void;
  shakeInputTrigger: number;
};

function AssignmentAnswerInput({
  currentReviewItem,
  userAnswer,
  setUserAnswer,
  nextBtnClicked,
  shakeInputTrigger,
}: Props) {
  const { isSubmittingAnswer } = useQueueStoreFacade();
  const reviewType = currentReviewItem.review_type;
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [inputContainerRef, animate] = useAnimate();
  const isReadingType = reviewType === "reading";
  const [isHintShowing, setIsHintShowing] = useState(false);
  const inputColor = isSubmittingAnswer
    ? currentReviewItem.is_correct_answer
      ? "var(--ion-color-tertiary)"
      : "var(--ion-color-danger)"
    : "var(--offwhite-color)";
  const hintAnswers = useMemo(() => {
    if (reviewType === "reading") {
      const acceptedReadings = getAnswersForReadingReviews({
        reviewItem: currentReviewItem,
        acceptedAnswersOnly: true,
      });
      const uniqueReadings = new Map<string, { text: string; meta?: string }>();
      acceptedReadings.forEach((reading) => {
        const text = reading.reading;
        const meta = reading.type ? `${reading.type}` : undefined;
        const key = `${text}-${meta ?? ""}`;
        if (!uniqueReadings.has(key)) {
          uniqueReadings.set(key, { text, meta });
        }
      });
      return Array.from(uniqueReadings.values());
    }

    const acceptedMeanings = getAnswersForMeaningReviews({
      reviewItem: currentReviewItem,
      acceptedAnswersOnly: true,
    });
    const uniqueMeanings = new Map<string, { text: string; meta?: string }>();
    acceptedMeanings.forEach((meaning) => {
      const text = meaning.meaning;
      const meta = meaning.primary ? "primary" : undefined;
      const key = text.toLowerCase();
      if (!uniqueMeanings.has(key)) {
        uniqueMeanings.set(key, { text, meta });
      }
    });
    return Array.from(uniqueMeanings.values());
  }, [currentReviewItem, reviewType]);

  const timerId = useRef<number | null>(null);

  const removeTimeout = () => {
    if (timerId.current) {
      clearTimeout(timerId.current);
      timerId.current = null;
    }
  };

  useEffect(() => {
    return () => {
      removeTimeout();
    };
  }, []);

  useEffect(() => {
    setIsHintShowing(false);
  }, [currentReviewItem.itemID]);

  const showHint = useCallback(() => setIsHintShowing(true), []);
  const hideHint = useCallback(() => setIsHintShowing(false), []);

  useEffect(() => {
    removeTimeout();
    // applying slight delay because this input is self-conscious and really doesn't like being focused on lol
    timerId.current = window.setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  });

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
  }, [userAnswer]);

  useEffect(() => {
    if (shakeInputTrigger) {
      animate(inputContainerRef.current, {
        x: [-5, 5, -5, 5, -5, 5, -5, 5, -5, 5, -5, 5, 0],
        transition: {
          duration: 0.5,
        },
      });
    }
  }, [shakeInputTrigger]);

  return (
    <>
      <InputRow ref={inputContainerRef}>
        <AnswerRow>
          <AnswerInput
            inputcolor={inputColor}
            inputRef={inputRef}
            elementType="textarea"
            rows={1}
            value={userAnswer}
            onKeyDown={(e: any) => {
              if (e.key === "Enter") {
                e.preventDefault();
                nextBtnClicked();
              }
            }}
            translateToHiragana={isReadingType}
            onChange={(e: any) => setUserAnswer(e.target.value)}
            disabled={isSubmittingAnswer}
            placeholder={isReadingType ? "答え" : ""}
          />
          <SubmitBtn
            backgroundColor="transparent"
            onPressStart={nextBtnClicked}
            aria-label="Submit answer"
            disabled={isSubmittingAnswer}
          >
            <SvgIcon icon={<NextArrowIcon />} width="3.5em" height="3.5em" />
          </SubmitBtn>
        </AnswerRow>
      </InputRow>
      <HintBtn
        onPointerDown={showHint}
        onPointerUp={hideHint}
        onPointerLeave={hideHint}
        onPointerCancel={hideHint}
        disabled={isSubmittingAnswer}
        aria-label="Show hint"
      >
        {isHintShowing && (
          <HintPopup>
            {hintAnswers.length === 0 ? (
              <HintEmpty>No accepted answers found for this item.</HintEmpty>
            ) : (
              <HintList>
                {hintAnswers.map((answer) => (
                  <HintItem key={`${answer.text}-${answer.meta ?? "answer"}`}>
                    <span>{answer.text}</span>
                    {answer.meta && <HintMeta>({answer.meta})</HintMeta>}
                  </HintItem>
                ))}
              </HintList>
            )}
          </HintPopup>
        )}
        <SvgIcon
          icon={<HintQuestionMarkIcon />}
          width="3.5em"
          height="3.5em"
        />
      </HintBtn>
    </>
  );
}

export default AssignmentAnswerInput;
