import { motion } from "framer-motion";
import { getSubjectColor } from "../../services/SubjectAndAssignmentService/SubjectAndAssignmentService";
import { SubjectType } from "../../types/Subject";
import styled from "styled-components";

export const AssignmentCardContainer = styled(motion.div)`
  border-radius: 10px;
  margin: 10px;
  display: flex;
  max-width: 1400px;
  will-change: transform;
  perspective: 1200px;
  transform: translateZ(0);
`;

type ReviewItemProps = {
  subjtype: SubjectType;
};

export const AssignmentCardStyled = styled(motion.div)<ReviewItemProps>`
  position: relative;
  padding: 80px 0 125px 0;
  border-radius: 10px;
  width: 100%;
  background-color: ${({ subjtype }) => {
    return getSubjectColor(subjtype);
  }};
  will-change: transform;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
`;

export const SubjectInfoButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  z-index: 2;
  opacity: 0.95;
  transition: transform 120ms ease, opacity 120ms ease;

  &:active {
    transform: scale(0.95);
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid var(--focus-color);
    outline-offset: 2px;
  }
`;

export const SwipeOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  border-radius: 10px;
  pointer-events: none;
  flex-grow: 1;
  touch-action: none;
  opacity: 0;
`;

export const SwipeIconAndText = styled.div`
  position: absolute;
  padding: 20px;
  border-radius: 50%;

  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const SwipeIcon = styled(motion.div)`
  padding: 20px;
  border-radius: 50%;

  display: flex;
  justify-content: center;
  align-items: center;

  ion-icon {
    width: 85px;
    height: 85px;
  }

  color: white;
  border: 2px solid white;
`;

export const SwipeTxt = styled.p`
  color: white;
  font-size: 1.75rem;
  font-weight: 500;
  margin: 16px 0;
  text-transform: uppercase;
`;

type SkillLevelDotProps = {
  srsColor: string;
};

export const SkillLevelBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const SkillLevelDot = styled.div<SkillLevelDotProps>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ srsColor }) => srsColor};
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.7);
`;

export const SkillLevelPopup = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--darkest-color, #1a1a2e);
  color: var(--text-color, #fff);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  pointer-events: none;
  z-index: 10;
  text-transform: capitalize;
`;

export const NextCardOverlay = styled(SwipeOverlay)`
  background-color: #0077b3;
`;

export const RetryCardOverlay = styled(SwipeOverlay)`
  background-color: var(--ion-color-secondary);
`;
