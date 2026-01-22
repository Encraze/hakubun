import { useState } from "react";
import { TabData } from "../../types/MiscTypes";
import { ReviewType } from "../../types/AssignmentQueueTypes";
import { KanaVocabulary, Subject, Vocabulary } from "../../types/Subject";
import ContextSentences from "../ContextSentences";
import KanjiUsedInVocab from "../KanjiUsedInVocab";
import PartsOfSpeech from "../PartsOfSpeech";
import SubjectMeanings from "../SubjectMeanings";
import VocabMeaningExplanation from "../VocabMeaningExplanation";
import VocabReadings from "../VocabReadings";
import VocabReadingExplanation from "../VocabReadingExplanation";
import KanaVocabReading from "../KanaVocabReading";
import Tabs from "../Tabs";
import {
  SubjDetailSection,
  SubjDetailSubHeading,
  SubjDetailTabContainer,
} from "../../styles/SubjectDetailsStyled";
import { FullWidthColumn } from "../../styles/BaseStyledComponents";
import styled from "styled-components";

const ReadingHeading = styled(SubjDetailSubHeading)`
  margin-bottom: 0;
`;

const VocabReadingSection = styled(SubjDetailSection)`
  margin-bottom: 0;
`;

const PartsOfSpeechContainer = styled(FullWidthColumn)`
  margin-bottom: 15px;
`;

const getTabsForVocab = (vocab: Subject, isKanaVocab: boolean) => {
  // const isKanaVocab = vocab.object === "kana_vocabulary";
  const hasReadings = vocab.readings && vocab.readings.length !== 0;

  const meaningTab: TabData = {
    id: "meaning",
    label: "Mean",
    tabContents: (
      <SubjDetailTabContainer>
        <SubjectMeanings subject={vocab} showPrimaryMeaning={true} />
        <PartsOfSpeechContainer>
          <PartsOfSpeech vocab={vocab as Vocabulary} />
        </PartsOfSpeechContainer>
        <VocabMeaningExplanation vocab={vocab as Vocabulary} />
      </SubjDetailTabContainer>
    ),
  };

  const readingTab: TabData = {
    id: "reading",
    label: "Read",
    tabContents: (
      <SubjDetailTabContainer>
        <VocabReadingSection>
          <ReadingHeading>Vocab Reading</ReadingHeading>
          {isKanaVocab ? (
            <KanaVocabReading vocab={vocab as KanaVocabulary} />
          ) : (
            hasReadings && (
              <VocabReadings
                vocab={vocab as Vocabulary}
                subjectReadings={vocab.readings!}
                hideReadingTxt={true}
              />
            )
          )}
        </VocabReadingSection>
        <VocabReadingExplanation vocab={vocab as Vocabulary} />
      </SubjDetailTabContainer>
    ),
  };

  const contextTab: TabData = {
    id: "context",
    label: "Context",
    tabContents: (
      <SubjDetailTabContainer>
        <ContextSentences sentences={vocab.context_sentences ?? []} />
      </SubjDetailTabContainer>
    ),
  };

  const kanjiTab: TabData = {
    id: "kanji",
    label: "Kanji",
    tabContents: (
      <SubjDetailTabContainer>
        <KanjiUsedInVocab
          kanjiIDs={vocab.component_subject_ids!}
          displayQuestionTxt={true}
          vocabSlug={vocab.slug}
        />
      </SubjDetailTabContainer>
    ),
  };

  if (isKanaVocab) {
    return [meaningTab, readingTab, contextTab];
  }

  return [meaningTab, readingTab, contextTab, kanjiTab];
};

type Props = {
  vocab: Subject;
  reviewType: ReviewType;
  selectFirstTab?: boolean;
};

function VocabDetailTabs({ vocab, reviewType, selectFirstTab = false }: Props) {
  const isKanaVocab = vocab.object === "kana_vocabulary";
  let defaultTabKey = reviewType as string;
  if (isKanaVocab) {
    defaultTabKey = "meaning";
  } else if (selectFirstTab) {
    defaultTabKey = "meaning";
  }
  const tabData = getTabsForVocab(vocab, isKanaVocab);

  const [selectedTabKey, setSelectedTabKey] = useState<string>(defaultTabKey);

  return (
    <Tabs
      id={`vocabTabs${vocab.id}${reviewType}`}
      selectedTabKey={selectedTabKey}
      setSelectedTabKey={setSelectedTabKey}
      tabBgColor="var(--wanikani-blue)"
      tabSelectionColor="white"
      tabs={tabData}
    />
  );
}

export default VocabDetailTabs;
