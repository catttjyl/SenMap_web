import { Box, Button, Typography } from "@mui/material";
import { Web } from "@mui/icons-material";
import FlexBetween from "components/FlexBetween";
import Tutorial from "components/Tutorial";
import { useNavigate } from "react-router-dom";
import icon from "nasa-logo-web-rgb.png";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{position: "relative",}}>
      <FlexBetween padding="1rem 3%">
        <FlexBetween gap="1.75rem">
          <Typography
            fontWeight="bold"
            fontSize="clamp(1rem, 2rem, 2.25rem)"
            color="Black"
            onClick={() => navigate("/")}
            sx={{
              "&:hover": {
                color: "#ECC8AF",
                cursor: "pointer",
              },
            }}
          >
            SenMAP
          </Typography>
        </FlexBetween>
        <FlexBetween gap="1.75rem">
          <Button onClick={() => navigate("/panel")}>
            Welcome
          </Button>
          <Tutorial />
          <img width="60" height="60" src={icon} alt="NASA-logo"/>
        </FlexBetween>
      </FlexBetween>
    </Box>
  );
};

export default Navbar;
