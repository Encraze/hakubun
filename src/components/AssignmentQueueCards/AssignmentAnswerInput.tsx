import { SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimate } from "framer-motion";
import WanakanaInput from "./WanakanaInput";
import { AssignmentQueueItem } from "../../types/AssignmentQueueTypes";
import useQueueStoreFacade from "../../stores/useQueueStore/useQueueStore.facade";
import {
  getAnswersForMeaningReviews,
  getAnswersForReadingReviews,
} from "../../services/AssignmentQueueService/AssignmentQueueService";
import Modal from "../Modal";
import Button from "../Button";
import styled from "styled-components";

const InputRow = styled(motion.div)`
  width: 100%;
  display: flex;
  flex-direction: column;
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
  color: black;
  background-color: ${({ inputcolor }) => inputcolor};
  font-family: ${({ translateToHiragana }) =>
    translateToHiragana && "var(--japanese-with-english-fallback-font-family)"};
`;

const HintButton = styled(Button)`
  align-self: center;
  padding: 8px 14px;
  font-size: 0.9rem;
`;

const HintButtonRow = styled.div`
  display: flex;
  justify-content: center;
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

const HintFooter = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
`;

const OkButton = styled(Button)`
  padding: 8px 18px;
  font-size: 0.95rem;
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
  const inputRef = useRef<HTMLInputElement>();
  const [inputContainerRef, animate] = useAnimate();
  const isReadingType = reviewType === "reading";
  const [isHintOpen, setIsHintOpen] = useState(false);
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
    setIsHintOpen(false);
  }, [currentReviewItem.itemID]);

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
        <AnswerInput
          inputcolor={inputColor}
          inputRef={inputRef}
          type="text"
          value={userAnswer}
          onKeyDown={(e: any) => {
            if (e.key === "Enter") {
              nextBtnClicked();
            }
          }}
          translateToHiragana={isReadingType}
          onChange={(e: any) => setUserAnswer(e.target.value)}
          disabled={isSubmittingAnswer}
          placeholder={isReadingType ? "答え" : ""}
        />
        <HintButtonRow>
          <HintButton
            className="base-button"
            onPress={() => setIsHintOpen(true)}
            disabled={isSubmittingAnswer}
          >
            Hint
          </HintButton>
        </HintButtonRow>
      </InputRow>
      <Modal open={isHintOpen} onOpenChange={setIsHintOpen}>
        <Modal.Content
          modalID="answer-hint-modal"
          isOpen={isHintOpen}
          showCloseIcon={false}
        >
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
          <HintFooter>
            <Modal.Close asChild>
              <OkButton className="base-button">OK</OkButton>
            </Modal.Close>
          </HintFooter>
        </Modal.Content>
      </Modal>
    </>
  );
}

export default AssignmentAnswerInput;
