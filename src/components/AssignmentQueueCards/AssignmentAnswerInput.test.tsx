import { fireEvent, render, screen } from "../../testing/test-utils";
import { generateRandomQueueItems } from "../../testing/mocks/data-generators/assignmentQueueGenerator";
import { useQueueStore } from "../../stores/useQueueStore/useQueueStore";
import AssignmentAnswerInput from "./AssignmentAnswerInput";

let blurSpy: ReturnType<typeof vi.spyOn> | null = null;

afterEach(() => {
  useQueueStore.getState().resetAll();
  blurSpy?.mockRestore();
  blurSpy = null;
});

const renderAssignmentAnswerInput = (
  srsStage: number,
  options?: {
    isCorrectAnswer?: boolean | null;
    isSubmittingAnswer?: boolean;
    nextBtnClicked?: () => void;
    setUserAnswer?: (value: string) => void;
  }
) => {
  const [currentReviewItem] = generateRandomQueueItems({
    numItems: 1,
    queueProgressState: "not_started",
  });
  currentReviewItem.srs_stage = srsStage;
  currentReviewItem.is_correct_answer = options?.isCorrectAnswer ?? null;
  useQueueStore
    .getState()
    .setIsSubmittingAnswer(options?.isSubmittingAnswer ?? false);

  return render(
    <AssignmentAnswerInput
      currentReviewItem={currentReviewItem}
      userAnswer=""
      setUserAnswer={options?.setUserAnswer ?? vi.fn()}
      nextBtnClicked={options?.nextBtnClicked ?? vi.fn()}
      shakeInputTrigger={0}
    />
  );
};

test.each([8, 9])(
  "does not show the hint button for SRS stage %i",
  (srsStage) => {
    renderAssignmentAnswerInput(srsStage);

    expect(
      screen.queryByRole("button", { name: /show hint/i })
    ).not.toBeInTheDocument();
  }
);

test("shows the hint button below enlightened", () => {
  renderAssignmentAnswerInput(7);

  expect(
    screen.getByRole("button", { name: /show hint/i })
  ).toBeInTheDocument();
});

test("keeps the answer input active while showing a correct submitted result", () => {
  blurSpy = vi.spyOn(HTMLTextAreaElement.prototype, "blur");
  const setUserAnswer = vi.fn();
  renderAssignmentAnswerInput(7, {
    isCorrectAnswer: true,
    isSubmittingAnswer: true,
    setUserAnswer,
  });
  const answerInput = screen.getByTestId("wanakana-input");

  expect(answerInput).not.toBeDisabled();
  expect(blurSpy).not.toHaveBeenCalled();

  fireEvent.change(answerInput, { target: { value: "changed" } });

  expect(setUserAnswer).not.toHaveBeenCalled();
});

test("submits from the next control without moving focus away from the input", () => {
  const nextBtnClicked = vi.fn();
  renderAssignmentAnswerInput(7, { nextBtnClicked });
  const answerInput = screen.getByTestId("wanakana-input");
  const submitButton = screen.getByRole("button", { name: /submit answer/i });

  answerInput.focus();
  fireEvent.pointerDown(submitButton);

  expect(nextBtnClicked).toHaveBeenCalledTimes(1);
  expect(document.activeElement).toBe(answerInput);
});
