import * as React from "react";
import {
  Box,
  Typography,
  Theme,
  Button,
  Step,
  Icon
} from "@mui/material";
import { styled } from "@mui/system"
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import CircleIcon from '@mui/icons-material/Circle';
// import clsx from "clsx";

const barHeight = 300;

const stepList = [
	{ label: "Your Location" },
	{ label: "Define Emission Amount" },
	{ label: "" },
	{ label: "Interpret Data" }
	];

export const MyBox = styled(Box)({
  display: "flex",
//   height: `${barHeight}px`,
  justifyContent: "center",
  position: "relative",
  width: "20px"
});

export const ProgressContainer = styled(Box)({
  backgroundColor: "#7F99AE",
  height: "100%",
  position: "relative",
  width: "0.2rem"
});

export const ProgressBar = styled(Box)({
  backgroundColor: "##B79F8C",
  position: "absolute",
  top: 0,
  transition: "height 150ms",
  width: "0.2rem",
  zIndex: 1
});

export const StepsContainer = styled(Box)({
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

// export const StepCircle = styled(Box)({
//   height: "1rem",
//   width: "1rem"
// });

export const CustomIcon = ({ active, completed, icon, }) => {
  const completeIcon = (
    <CircleOutlinedIcon 
      sx={{ 
        // bgcolor:"#b23c17", 
        bgcolor:"#B34B3E",
        borderRadius: "50%",
        color: "#A68972",
        fontSize:"large"
      }}
    />
  );
  const incompleteIcon = (
    // <CircleOutlinedIcon sx={{ color: "grey", fontSize:"large"}}/>
    <CircleOutlinedIcon 
      sx={{ 
        bgcolor:"#e8eaf6", 
        borderRadius: "50%",
        color: "grey",
        fontSize:"large"
      }}
    />
  );
  
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      {completed ? completeIcon : incompleteIcon}
    </div>
  );
};

export const MyStep = ({ complete, label }) => {
  const completeIcon = (
    <CircleOutlinedIcon 
      sx={{ 
        // bgcolor:"#b23c17", 
        bgcolor:"#B34B3E",
        borderRadius: "50%",
        color: "#A68972",
        fontSize:"large"
      }}
    />
  );
  const incompleteIcon = (
    // <CircleOutlinedIcon sx={{ color: "grey", fontSize:"large"}}/>
    <CircleOutlinedIcon 
      sx={{ 
        bgcolor:"#e8eaf6", 
        borderRadius: "50%",
        color: "grey",
        fontSize:"large"
      }}
    />
    // <CircleIcon sx={{ bgcolor:"grey", border: 1, color: "#b23c17", fontSize:"large", borderRadius: "50%",}}/>
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