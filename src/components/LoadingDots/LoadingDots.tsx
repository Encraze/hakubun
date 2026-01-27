import { motion } from "framer-motion";
import CircleIcon from "../../images/circle.svg";
import styled from "styled-components";
import { LoadingDotSize } from "../../types/MiscTypes";

type DotContainerProps = {
  containerwidth: string;
};

const DotContainer = styled(motion.div) <DotContainerProps>`
  width: ${({ containerwidth }) => containerwidth};
  display: flex;
  align-items: center;
  justify-content: space-evenly;
`;

type DotProps = {
  dotsize: string;
};

const Dot = styled(motion.img) <DotProps>`
  width: ${({ dotsize }) => dotsize};
  height: ${({ dotsize }) => dotsize};
`;

const DotVariants = {
  animate: (index: number) => ({
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      times: [0, 0.33, 0.66, 1],
      delay: index * 0.3,
      ease: "easeInOut",
    },
  }),
};

type DotSizeStyles = {
  containerSize: string;
  dotSize: string;
};

const btnSizeInfo: { [index: string]: DotSizeStyles } = {
  sm: {
    containerSize: "66px",
    dotSize: "16px",
  },
  md: {
    containerSize: "133px",
    dotSize: "32px",
  },
  lg: {
    containerSize: "200px",
    dotSize: "48px",
  },
};

const getLoadingDotSize = (size: LoadingDotSize) => {
  return btnSizeInfo[size as keyof object];
};

type Props = {
  size?: LoadingDotSize;
};

function LoadingDots({ size = "lg" }: Props) {
  let { containerSize, dotSize } = getLoadingDotSize(size);

  return (
    <DotContainer containerwidth={containerSize}>
      {[0, 1, 2].map((index) => (
        <Dot
          key={index}
          src={CircleIcon}
          custom={index}
          variants={DotVariants}
          animate="animate"
          dotsize={dotSize}
          initial={{ opacity: 0 }}
        />
      ))}
    </DotContainer>
  );
}

export default LoadingDots;
