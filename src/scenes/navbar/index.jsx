import { Box, Button, Typography } from "@mui/material";
import { Web } from "@mui/icons-material";
import { FlexBetween } from "components/CompOvrd";
import Tutorial from "components/Tutorial";
import { useNavigate } from "react-router-dom";
import icon from "nasa-logo-web-rgb.png";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{position: "relative"}}>
      <FlexBetween padding="1rem 3%">
        <FlexBetween>
          <Typography
            fontSize="clamp(1rem, 3rem, 4.25rem)"
            // color="#d32f2f"
            // sx={{border:4}}
            // onClick={() => navigate("/")}
          >
            Sen
          </Typography>
          <Typography
            fontWeight="bold"
            fontSize="clamp(1rem, 3rem, 4.25rem)"
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
