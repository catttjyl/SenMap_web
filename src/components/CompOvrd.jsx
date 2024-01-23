import {
    Box,
    Typography,
    Button
} from "@mui/material";
import { styled } from "@mui/system"

export const FlexBetween = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});
  
export const ResultBtn = (props) => (
  <Button
    // style={{justifyContent: "flex-start"}}
    variant= "contained"
    sx={{ 
      background:"linear-gradient(45deg, #ffe7a6 30%, #8fc981 90%)", 
      textTransform: 'capitalize',
      width: "330px",
      borderRadius: 5,
      mt: "0.5rem",
    }}
    onClick={props.onClick}
  >
      <Typography color="black" fontSize={15}>{props.children}</Typography>
  </Button>
  //customized typography
);

export const Label = styled(Typography)({
  fontWeight: "bold",
  fontSize: 18,
  fontFamily: 'BlinkMacSystemFont',
  color: "#212121",
  margin:"7px",
});