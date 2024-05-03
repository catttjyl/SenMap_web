import * as React from "react";
import { styled } from '@mui/material/styles';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import { Stepper } from "@mui/material";

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

export const CustomStepper = styled(Stepper)({
  "& .MuiStep-root": {
    "& .MuiStepLabel-root": {
      padding: 0,
      height: 15,
    },
  },
  "& .MuiStepContent-root": {
    marginLeft: "7px",
    borderLeft: "3px solid #7F99AE",
  },
  "& .MuiStepConnector-line": {
    borderLeft: "3px solid #7F99AE",
  },
  "& .MuiStepConnector-root": {
    marginLeft: "7px",
    height: 20,
  },
  "& .MuiStep-root:last-child .MuiStepContent-root": {
    borderLeft: "none",
  },
});