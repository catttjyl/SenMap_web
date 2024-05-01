import * as React from "react";
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';

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