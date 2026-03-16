import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { AnimatePresence } from "framer-motion";
import useQueueStoreFacade from "../../stores/useQueueStore/useQueueStore.facade";
import { convertQueueItemsToSubjects } from "../../services/SubjectAndAssignmentService/SubjectAndAssignmentService";
import { AssignmentQueueItem } from "../../types/AssignmentQueueTypes";
import BottomSheetHeader from "./BottomSheetHeader";
import RadicalDetailTabs from "../RadicalDetailTabs/RadicalDetailTabs";
import KanjiDetailTabs from "../KanjiDetailTabs/KanjiDetailTabs";
import VocabDetailTabs from "../VocabDetailTabs/VocabDetailTabs";
import BottomSheetRoot, { BottomSheetContent } from "../BottomSheet";
import { Section } from "../../styles/BaseStyledComponents";
import styled from "styled-components";

const SectionWithPadding = styled(Section)`
  padding: 12px;
  height: 100%;
  box-sizing: border-box;
`;

type Props = {
  currentReviewItem: AssignmentQueueItem;
};

function AssignmentQueueItemBottomSheet({ currentReviewItem }: Props) {
  const location = useLocation();
  const { isBottomSheetVisible: showBottomSheet } = useQueueStoreFacade();
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const timerId = useRef<number | null>(null);
  const openRequestId = useRef(0);

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

  const itemAsSubj = convertQueueItemsToSubjects([currentReviewItem])[0];

  // TODO: also reopen to previous breakpoint on return?
  useEffect(() => {
    const requestId = ++openRequestId.current;
    const isSessionPath =
      location.pathname === "/reviews/session" ||
      location.pathname === "/lessons/quiz";

    removeTimeout();
    if (isSessionPath && showBottomSheet) {
      // Keep delayed open but guard against stale timers causing flash/reopen.
      timerId.current = window.setTimeout(() => {
        if (openRequestId.current === requestId) {
          setIsBottomSheetVisible(true);
        }
      }, 500);
      return () => {
        removeTimeout();
      };
    }

    setIsBottomSheetVisible(false);
    return () => {
      removeTimeout();
    };
  }, [location.pathname, showBottomSheet]);

  return (
    <AnimatePresence>
      {isBottomSheetVisible && (
        <>
          <BottomSheetRoot>
            <BottomSheetContent title="Subject Info">
              <BottomSheetHeader subject={itemAsSubj} />
              <SectionWithPadding>
                {currentReviewItem.object == "radical" && (
                  <RadicalDetailTabs radical={itemAsSubj} />
                )}
                {currentReviewItem.object == "kanji" && (
                  <KanjiDetailTabs
                    kanji={itemAsSubj}
                    reviewType={currentReviewItem.review_type}
                    defaultTabKey={currentReviewItem.review_type as string}
                  />
                )}
                {(currentReviewItem.object == "vocabulary" ||
                  currentReviewItem.object == "kana_vocabulary") && (
                  <VocabDetailTabs
                    vocab={itemAsSubj}
                    reviewType={currentReviewItem.review_type}
                  />
                )}
              </SectionWithPadding>
            </BottomSheetContent>
          </BottomSheetRoot>
        </>
      )}
    </AnimatePresence>
  );
}

export default AssignmentQueueItemBottomSheet;
