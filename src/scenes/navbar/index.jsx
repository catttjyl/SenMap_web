import { Box, Button, Typography, useMediaQuery } from "@mui/material";
import { Web } from "@mui/icons-material";
import { FlexBetween } from "components/CompOvrd";
import Tutorial from "components/Tutorial";
import { useNavigate } from "react-router-dom";
import icon from "nasa-logo-web-rgb.png";

const Navbar = () => {
  const isMobileScreens = useMediaQuery('(max-width:550px)');
  const navigate = useNavigate();
  return (
    isMobileScreens ? 
    <Box sx={{position: "relative"}}>
      <FlexBetween padding="1rem 3%">
        <FlexBetween>
          <Typography
            fontSize="2rem"
            // color="#d32f2f"
            // sx={{border:4}}
            // onClick={() => navigate("/")}
          >
            Sen
          </Typography>
          <Typography
            fontWeight="bold"
            fontSize="2rem"
            // color="#419645"
            // onClick={() => navigate("/")}
          >
            MAP
          </Typography>
        </FlexBetween>
        <FlexBetween gap="2rem">
          <Button onClick={() => navigate("/welcome")}>
            <Typography color="#01579b" fontWeight="bold">
              Welcome
            </Typography>
          </Button>
          <Tutorial />
          <img width="65" height="65" src={icon} alt="NASA-logo"/>
        </FlexBetween>
      </FlexBetween>
    </Box>
    :
    <Box sx={{position: "relative"}}>
      <FlexBetween padding="1rem 3%">
        <FlexBetween>
          <Typography
            fontSize="3rem"
            // color="#d32f2f"
            // sx={{border:4}}
            // onClick={() => navigate("/")}
          >
            Sen
          </Typography>
          <Typography
            fontWeight="bold"
            fontSize="3rem"
            // color="#419645"
            // onClick={() => navigate("/")}
          >
            MAP
          </Typography>
        </FlexBetween>
        <FlexBetween gap="2rem">
          <Button onClick={() => navigate("/welcome")}>
            <Typography color="#01579b" fontWeight="bold">
              Welcome
            </Typography>
          </Button>
          <Tutorial />
          <img width="65" height="65" src={icon} alt="NASA-logo"/>
        </FlexBetween>
      </FlexBetween>
    </Box>
  );
};

export default Navbar;
