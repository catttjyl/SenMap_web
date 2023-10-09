import * as React from "react";
import {
  Box,
  Typography,
  Theme,
  Button
} from "@mui/material";
import { styled, createStyled } from "@mui/system"
// import clsx from "clsx";

const barHeight = 250;

// const useStyles = styled((theme) =>
//   createStyled({
//     root: {
//       display: "flex",
//       height: `${barHeight}px`,
//       justifyContent: "center",
//       position: "relative",
//       width: "20px"
//     },
//     progressContainer: {
//       backgroundColor: theme.palette.grey[200],
//       height: "100%",
//       position: "relative",
//       width: "0.1rem"
//     },
//     progressBar: {
//       backgroundColor: theme.palette.common.black,
//       position: "absolute",
//       top: 0,
//       transition: "height 150ms",
//       width: "0.1rem",
//       zIndex: 1
//     },
//     stepsContainer: {
//       display: "flex",
//       flexDirection: "column",
//       height: "100%",
//       justifyContent: "space-between",
//       position: "absolute"
//     },
//     step: {
//       alignItems: "flex-end",
//       display: "flex",
//       position: "relative",
//       zIndex: 2
//     },
//     stepCircle: {
//       height: "1rem",
//       width: "1rem"
//     },
//     animateComplete: {
//       animation: "$growShrink .3s ease"
//     },
//     "@keyframes growShrink": {
//       "0%": {
//         transform: "scale(1)"
//       },
//       "50%": {
//         transform: "scale(1.2)"
//       },
//       "100%": {
//         transform: "scale(1)"
//       }
//     }
//   })
// );

// const StepLabel = styled((theme) =>
//   createStyled({
//     root: {
//       fontWeight: theme.typography.fontWeightBold
//     }
//   })
// );

// export const Step = ({ complete, label }) => {
//   const classes = useStyles();
//   const completeIcon = (
//       <img
//       className={clsx(classes.stepCircle, {
//           [classes.animateComplete]: complete
//       })}
//       src={"black-circle.png"}
//       alt="completed step"
//       />
//   );
//   const incompleteIcon = (
//       <img
//       className={clsx(classes.stepCircle, {
//           [classes.animateComplete]: complete
//       })}
//       src={"white-circle.png"}
//       alt="incomplete step"
//       />
//   );
//   return (
//       <Box className={classes.step}>
//       {complete ? completeIcon : incompleteIcon}
//       <span
//           style={{
//           left: 32,
//           minWidth: "10rem",
//           position: "absolute",
//           top: -2
//           }}
//       >
//           <StepLabel variant="body2">{label}</StepLabel>
//       </span>
//       </Box>
//   );
// };

// // interface Props {
// // percent?: number;
// // steps?: {
// //     label: string;
// // }[];
// // }

// const stepList = [
// { label: "Your Location" },
// { label: "Define Emission Amount" },
// { label: "" },
// { label: "Interpret Data" }
// ];

// const percent = 0;
// const steps = stepList;

// const ProgressStepper = () => {
//   const [percentage, setPercentage] = React.useState(percent);
//   const progressBarHeight = Math.floor(barHeight * (percentage / 100));

//   function getSafePercent(percent) {
//       return Math.min(100, Math.max(percent, 0));
//   }
//   function getStepPosition(steps, stepIndex) {
//       return (100 / (steps - 1)) * stepIndex;
//   }

//   function getStepComplete(currPercent, currStepIdx, totalSteps) {
//       const position = getStepPosition(totalSteps, currStepIdx);
//       const safePercent = getSafePercent(currPercent);
//       return position <= safePercent;
//   }

//   console.log("hello");

// 	const classes = useStyles();

// 	return (
// 		<Box flexDirection="column">
// 			<Box mb={2}>
// 					<Button
// 					onClick={() => setPercentage(16.7 * 3)}
// 					variant="contained"
// 					color="primary"
// 					>
// 					Move <span role="img"> ⬇️</span>
// 					</Button>
// 					<Box component="span" ml={3}>
// 					{percentage}% complete
// 					</Box>
// 			</Box>
// 			<Box className={classes.root} role="progressbar">
// 					<Box className={classes.progressContainer}>
// 					<Box
// 							className={classes.progressBar}
// 							style={{
// 							height: Math.min(barHeight, progressBarHeight)
// 							}}
// 					/>
// 					</Box>
// 					<Box className={classes.stepsContainer}>
// 					{steps.map((step, i, allSteps) => (
// 							<Step
// 							key={step.label}
// 							complete={getStepComplete(percentage, i, allSteps.length)}
// 							label={step.label}
// 							/>
// 					))}
// 					</Box>
// 			</Box>
// 		</Box>
// 	);
// };

const stepList = [
	{ label: "Your Location" },
	{ label: "Define Emission Amount" },
	{ label: "" },
	{ label: "Interpret Data" }
	];

const MyBox = styled(Box)({
  display: "flex",
  height: `${barHeight}px`,
  justifyContent: "center",
  position: "relative",
  width: "20px"
});

const ProgressContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "grey",
  height: "100%",
  position: "relative",
  width: "0.1rem"
}));

const ProgressBar = styled(Box)({
  backgroundColor: "black",
  position: "absolute",
  top: 0,
  transition: "height 150ms",
  width: "0.1rem",
  zIndex: 1
});

const StepsContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  justifyContent: "space-between",
  position: "absolute"
});

const Steps = styled(Box)({
  alignItems: "flex-end",
  display: "flex",
  position: "relative",
  zIndex: 2
});

const StepCircle = styled(Box)({
  height: "1rem",
  width: "1rem"
});


export const Step = ({ complete, label }) => {
  const completeIcon = (
    <span role="img">🥰</span>
  );
  const incompleteIcon = (
    <span role="img">🤬</span>
  );
  return (
      <Steps>
      {complete ? completeIcon : incompleteIcon}
      <span
          style={{
          left: 32,
          minWidth: "10rem",
          position: "absolute",
          top: -2
          }}
      >
          <Typography variant="body2">{label}</Typography>
      </span>
      </Steps>
  );
};

const percent = 0;
const steps = stepList;

const ProgressStepper = () => {
  const [percentage, setPercentage] = React.useState(percent);
  const progressBarHeight = Math.floor(barHeight * (percentage / 100));

  function getSafePercent(percent) {
      return Math.min(100, Math.max(percent, 0));
  }
  function getStepPosition(steps, stepIndex) {
      return (100 / (steps - 1)) * stepIndex;
  }

  function getStepComplete(currPercent, currStepIdx, totalSteps) {
    const position = getStepPosition(totalSteps, currStepIdx);
    const safePercent = getSafePercent(currPercent);
    return position <= safePercent;
  }

  return (
    <Box flexDirection="column">
      {/* <MyBox>Styled div</MyBox> */}
			<Box mb={2}>
					<Button
					onClick={() => setPercentage(16.7 * 3)}
					variant="contained"
					color="primary"
					>
					Move <span role="img"> ⬇️</span>
					</Button>
					<Box component="span" ml={3}>
					{percentage}% complete
					</Box>
			</Box>
			<MyBox role="progressbar">
					<ProgressContainer>
					<ProgressBar
							style={{
							height: Math.min(barHeight, progressBarHeight)
							}}
					/>
					</ProgressContainer>
					<StepsContainer>
					{steps.map((step, i, allSteps) => (
							<Step
							key={step.label}
							complete={getStepComplete(percentage, i, allSteps.length)}
							label={step.label}
							/>
					))}
					</StepsContainer>
			</MyBox>
		</Box>
  );
};

export default ProgressStepper;