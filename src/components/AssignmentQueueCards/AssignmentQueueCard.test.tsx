import { render, screen } from "../../testing/test-utils";
import { generateRandomQueueItems } from "../../testing/mocks/data-generators/assignmentQueueGenerator";
import { useQueueStore } from "../../stores/useQueueStore/useQueueStore";
import { AssignmentQueueCard } from "./AssignmentQueueCard";

afterEach(() => {
  useQueueStore.getState().resetAll();
});

const renderAssignmentQueueCard = (options?: {
  isCorrectAnswer?: boolean | null;
  isSubmittingAnswer?: boolean;
}) => {
  const [currentReviewItem] = generateRandomQueueItems({
    numItems: 1,
    queueProgressState: "not_started",
  });
  currentReviewItem.is_correct_answer = options?.isCorrectAnswer ?? null;
  useQueueStore
    .getState()
    .setIsSubmittingAnswer(options?.isSubmittingAnswer ?? false);

  return render(
    <AssignmentQueueCard
      currentReviewItem={currentReviewItem}
      handleNextCard={vi.fn()}
      handleRetryCard={vi.fn()}
    />
  );
};

test("does not show subject info button while inputting an answer", () => {
  renderAssignmentQueueCard();

  expect(
    screen.queryByRole("button", { name: /show subject info/i })
  ).not.toBeInTheDocument();
});

test("shows subject info button for a wrong answer result", () => {
  renderAssignmentQueueCard({
    isCorrectAnswer: false,
    isSubmittingAnswer: true,
  });

  expect(
    screen.getByRole("button", { name: /show subject info/i })
  ).toBeInTheDocument();
});
