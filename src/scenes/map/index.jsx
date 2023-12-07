import React from "react";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { Map, Marker, Popup } from "react-map-gl";
import Navbar from "../navbar";
import {
  Box,
  TextField,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  Button,
  IconButton,
  Slider,
  Typography,
  Stack,
  Stepper,
  // Step,
  StepLabel,
  Autocomplete,
  Grid
} from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { MapProvider } from 'react-map-gl'
import "mapbox-gl/dist/mapbox-gl.css";
import pollutant from "data/pollutant.js";
import { counties } from "data/counties.js";
import { county_index } from "data/county_indexn.js";
import simulations from "data/simulations.js";
import { getPolZarr, getSourceZarr } from "utils/getZarr.js";
import { slice } from "zarr";
import useMediaQuery from "@mui/material/useMediaQuery";
import { hexToRgba } from "utils/legend.js";
import { colors } from "utils/colors.js";
import { ReactNotifications, Store } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import { DeckRenderer } from "deck.gl";
import {FlexBetween, ResultBtn, Label} from "components/CompOvrd";
import {MyBox, ProgressContainer, ProgressBar, StepsContainer, MyStep, ProgressStepper} from "components/ProgressBar";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1Ijoic2hhd25yYW4xODIiLCJhIjoiY2w5NXRvMDRjMmhhYzN3dDUyOGo0ZmdpeCJ9.RuSR6FInH2tUyctzdnilrw";

const INITIAL_VIEW_STATE = {
  latitude: 40.0,
  longitude: -110.0,
  zoom: 3.5,
  bearing: 0,
	// pitch: 0,
};

// const MOBILE_INITIAL_VIEW_STATE = {
//   latitude: 40.0,
//   longitude: -98.0,
//   zoom: 1,
//   bearing: 0,
// };

const MAP_STYLE = "mapbox://styles/mapbox/streets-v10";

let id = "id";
let data = simulations;

const barHeight = 380;
const sectors = [
  "Agriculture", 
  "Industrial", 
  "Coal electric generation",
  "Noncoal electric generation",
  "Residential wood combustion",
  "Residential gas combustion",
  "Residential other",
  "Road dust",
  "Commercial cooking",
  "Miscellaneous",
  "Off-highway vehicles & equipments",
  "Construction",
  "Heavy duty diesel vehicles",
  "Light duty gasoline vehicles",
]
// const percent = 0;
// const steps = stepList;

const Basemap = () => {
  // const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const isMinimumScreens = useMediaQuery("(max-width:550px)");
  const [emission, setEmission] = React.useState(50);
  const [percentage, setPercentage] = React.useState(0.0);
  const [activeStep, setActiveStep] = React.useState(0);     //mui step test
  const [county, setCounty] = React.useState(0);
  const [sector, setSector] = React.useState("");
  const [location, setLocation] = React.useState(0);
  const [disable, setDisable] = React.useState(false);
  const [total, setTotal] = React.useState(0.0);    // Total concentration of PM2.5
  const [PWAvg, setPWAvg] = React.useState(0.0);    // Population-weighted Average concentration of PM2.5
  const [deathsK, setDeathsK] = React.useState(0.0);    // Total number of deaths
  const [deathsL, setDeathsL] = React.useState(0.0);    // Assume a 14% increase in morality rate for every 10 μg/m³ increase in PM2.5 concentration (instead of 6%)
  let max = 0;
  const findMax = (data, max) => {
    return data.properties.TotalPM25 > max ? data.properties.TotalPM25 : max;
  };
  max = data.features.reduce((max, item) => findMax(item, max), 0);
  // let currMax = initMax;
  // console.log("max", initMax);

  const progressBarHeight = Math.floor(barHeight * (percentage / 100));

  const handleCountyChange = (event, newValue) => {
    // setCounty(event.target.value);
    console.log("event",event.target);
    console.log("newValue",newValue);
    let code = newValue === null ? 0: newValue.properties.GEOID;
    setCounty(code);
    setLocation(county_index[code]);
    // console.log("location", location);
    setPercentage(5);
  };

  const handleSectorChange = (event, newValue) => {
    setSector(newValue);
    setPercentage(35);
  };

  const handleEmissionChange = (event, newValue) => {
    setEmission(newValue);
    setPercentage(50);
  };

  const options = {
    pickable: true,
    stroked: false,
    filled: true,
    extruded: true,
    pointType: "circle",
    lineWidthScale: 20,
    lineWidthMinPixels: 2,
    getFillColor: (data) => {
      // let opacity = data.properties.TotalPM25 === 0 ? 0 : 150;
      let index = Math.round(data.properties.TotalPM25/max * 255);
      let opacity = index === 0 ? 0 : 150;
      let color = hexToRgba(colors[index], 150);
    
      return color;
      // let R = Math.round((data.properties.TotalPM25/max) * 255);
      // let G = Math.round((1 - data.properties.TotalPM25/max) * 255);
      // let B = 0;
      // let opacity = G === 255 ? 0 : 150;
      // return [R,G,B,opacity];
    },
    getLineColor: [0, 0, 255, 200],
    getPointRadius: 100,
    getLineWidth: 5,
    getElevation: 30,
  };

  const [layer, setLayer] = React.useState(
    new GeoJsonLayer({
      id,
      data,
      ...options,
    })
  );

  const handleSubmit = async () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1); //mui step
    setPercentage(100);
    setDisable(true);
    // const pNO3_cloud = await getPolZarr("pNO3");
    // const pSO4_cloud = await getPolZarr("pSO4");
    // console.log("NOx", NOx_cloud);
    const src_could = await getSourceZarr(
      sector === "Agriculture" ? "Ag": 
      sector === "Industrial" ? "Industrial":
      sector === "Coal electric generation" ? "Coal_Elec":
      sector === "Noncoal electric generation" ? "Non-Coal_Elec":
      sector === "Residential wood combustion" ? "Res_Wood":
      sector === "Residential gas combustion" ? "Res_Gas":
      sector === "Residential other" ? "Res_Other":
      sector === "Road dust" ? "Road_Dst":
      sector === "Commercial cooking" ? "Cooking":
      sector === "Miscellaneous" ? "Misc":
      sector === "Off-highway vehicles & equipments" ? "Offroad":
      sector === "Construction" ? "Const":
      sector === "Heavy duty diesel vehicles" ? "Diesel_HD_Veh": "Gas_LD_Veh")
    const Pop_could = await getPolZarr("TotalPop");
    // console.log("population", Pop_could);
    const MR_could = await getPolZarr("MortalityRate");
    // console.log("death", MR_could);

    // let pNO3_curr = await pNO3_cloud
    //   .get([0, location, slice(null, 52411)])
    //   .then(async (data) => await data.data);
    // let pSO4_curr = await pSO4_cloud
    //   .get([0, location, slice(null, 52411)])
    //   .then(async (data) => await data.data);
    console.log("county", county);
    console.log("county_ind", location);
    console.log("sector", sector);
    let src_curr = await src_could
      .get([0, location, slice(null, 52411)])
      .then(async (data) => await data.data);
    let Pop_curr = await Pop_could
      .get([slice(null, 52411),])
      .then(async (data) => await data.data);
    let MR_curr = await MR_could
      .get([slice(null, 52411),])
      .then(async (data) => await data.data);
    // console.log("death", MR_curr);

    let tmpTotal = 0;
    let weightedSum = 0;
    let totalPop = 0;
    let tmpDsk = 0;
    let tmpDsL = 0;
    console.log("emission", emission);
    for (let i = 0; i < 52411; i++) {
      let curr = emission * 2 / 100 * src_curr[i];
      
      data.features[i].properties.TotalPM25 += curr;
      tmpTotal += data.features[i].properties.TotalPM25;
      totalPop += Pop_curr[i];
      // console.log("population/grid: " + Pop_curr[i]);
      weightedSum += data.features[i].properties.TotalPM25 * Pop_curr[i];
      tmpDsk += (Math.exp(Math.log(1.06)/10 * curr) - 1) * Pop_curr[i] * 1.0465819687408728 * MR_curr[i] / 100000 * 1.025229357798165;
      tmpDsL += (Math.exp(Math.log(1.14)/10 * curr) - 1) * Pop_curr[i] * 1.0465819687408728 * MR_curr[i] / 100000 * 1.025229357798165;

      if (data.features[i].properties.TotalPM25 > max) {
        // console.log(data.features[i].properties.TotalPM25);
        max = data.features[i].properties.TotalPM25;
        // console.log("max", max);
      }
    }
    setTotal(total+tmpTotal);
    setPWAvg(weightedSum/totalPop);
    setDeathsK(deathsK+tmpDsk);
    setDeathsL(deathsL+tmpDsL);
    console.log("population sum",totalPop)
    id = id + "1";
    console.log(id);
    setLayer(
      new GeoJsonLayer({
        id,
        data,
        ...options,
      })
    );

    setDisable(false);
  }

  const handleReset = async () => {
    setDisable(true);
    for (let i = 0; i < 52411; i++) {
      data.features[i].properties.TotalPM25 = 0;
    }
    setEmission(50);
    setCounty(0);
    setPercentage(0);
    setTotal(0.0);
    setPWAvg(0.0);
    setDeathsK(0.0);
    setDeathsL(0.0);
    id = id + "1";
    setLayer(
      new GeoJsonLayer({
        id,
        data,
        ...options,
        getFillColor: [0, 0, 0, 0]
      })
    );
    console.log('done');
    setDisable(false);
  };

  const stepList = [
    { label: 
      <Box sx={{mt: -0.5}}>
        <Label>
          Your Location
        </Label>
        <Autocomplete
          id="counties-search-bar"
          // options={counties.features}
          options={counties.features.sort((a,b) => a.properties.NAME[0].localeCompare(b.properties.NAME[0]))}

          sx={{ width: "130%" }}
          onChange={handleCountyChange}
          getOptionLabel={(option) => option.properties.NAME}
          renderOption={(props, option) => {
            return (
              <li {...props} key={option.GEOID}>
                {option.properties.NAME}
              </li>
            );
          }}
          renderInput={(feature) => 
            <TextField 
              {...feature}
              label="Enter County..."
              variant="filled"
            />
          }
        />
      </Box>
    },
    { label: 
      <Box sx={{mt: -0.5}}>
        <Label>
          Pollutant Sourse
        </Label>
        <Autocomplete
          id="choose-sectors"
          options={sectors}
          style={{ width: "185%" }}
          display="inline"
          onChange={handleSectorChange}
          // getOptionLabel={(option) => option.properties.NAME}
          // renderOption={(props, option) => {
          //   return (
          //     <li {...props} key={option.GEOID}>
          //       {option.properties.NAME}
          //     </li>
          //   );
          // }}
          renderInput={(feature) => 
            <TextField 
              {...feature}
              label="Choose a source..."
              variant="filled"
              display="inline"
            />
          }
        />
      </Box>
    },
    { label:
      <Box>
        <Label gutterBottom>
          Define Emission Amount
        </Label>
        <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
          <Typography>0%</Typography>
          <Slider
            // key={`slider-${emission}`}
            onChange={handleEmissionChange}
            value={emission}
            aria-label="Emission"
            sx={{
              width: 220,
              mb: "10px",
              display: "block",
              // "& .MuiSlider-rail": {
              //   color: "grey",
              //   height: "20px",
              //   borderRadius: 0,
              //   clipPath: "polygon(0% 75%,100% 0%,100% 100%,0% 100%)",
              //   // background: `linear-gradient(90deg, #ccc 10%, #F74 10%, #F74 80%, #ccc 80%)`,
              //   opacity: 1
              // },
              // "& .MuiSlider-track": {
              //   height: "20px",
              //   borderRadius: 0,
              //   clipPath: `polygon(0% 75%,100% ${75-emission/100*75}%,100% 100%,0% 100%)`,
              // },
              // "& .MuiSlider-thumb": {
              //   top: "70%",
              //   backgroundColor: "green",
              //   border: "4px solid #fff",
              //   boxShadow:
              //     "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
              //   "&:before": {
              //     boxShadow: "none"
              //   }
              // },
              // "& [data-index='0']:not(.MuiSlider-markLabel)": {
              //   // This `top` math is gross, but I needed to shift the thumbs up based on value -- could be improved
              //   top: `${70 - emission / 5}%`,
              //   width: `calc(20px + ${0.1 * emission}px)`,
              //   height: `calc(20px + ${0.1 * emission}px)`
              // },
            }}
          />
          <Typography>200%</Typography>
        </Stack>
      </Box>
    },
    { label:    //autocomplet, Load on open
      <Button
      variant="contained"
      sx={{bgcolor: "#F44336"}}
      onClick={handleSubmit}
      disabled={disable}
      >
        Start
      </Button>
    },
    { label: 
      <Box sx={{mt: "-5%"}}>
        <Label>
          Interpret Data
        </Label>
        <ResultBtn>How does this impact public health?</ResultBtn>
        {/* <ResultBtn>Where is the pollution coming from?</ResultBtn> */}
        <ResultBtn>Who is most affected?</ResultBtn>
      </Box>
    }
  ];
  
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

  return(
    <Box>
      {/* <ReactNotifications /> */}
        <Box>
          <DeckGL
            initialViewState = {INITIAL_VIEW_STATE}
            getTooltip={({ object }) =>
              object && 
                  (object.properties.TotalPM25).toPrecision(3)
            }
            controller = {true}
            layers = {[layer]}
            MapProvider
          >
            <Map
              mapStyle={MAP_STYLE}
              mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
            >
            </Map>
          </DeckGL>
          <Navbar/>
          <Box
            flexDirection="column"      //not sure if this works
            sx={{
              left: "3%",
              top: "100px",
              height: "650px",
              position: "absolute",
              display: "flex",
              justifyContent: "space-between",
              alignItems: 'flex-start',
            }}
          >
            <MyBox sx={{height: `${barHeight}px`, mb:"20%"}}>
              <ProgressContainer>
                <ProgressBar
                    style={{
                    height: Math.min(barHeight, progressBarHeight)
                    }}
                />
              </ProgressContainer>
              <StepsContainer>
                {stepList.map((step, i, allSteps) => (
                    <MyStep
                    key={i}
                    complete={getStepComplete(percentage, i, allSteps.length)}
                    label={step.label}
                    />
                ))}
              </StepsContainer>
            </MyBox>
            {/* <Box sx={{ maxWidth: 400 }}>
              <Stepper activeStep={activeStep} orientation="vertical">
                {stepList.map((step) => (
                  <Step key={step.label}>
                    <StepLabel>
                      {step.label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box> */}
            <Stack spacing={2} direction="row" alignItems="center">
              <WarningAmberIcon/>
              <Slider
                sx={{
                  width: 450,
                  display: "block",
                  "& .MuiSlider-rail": {
                    color: "grey",
                    height: "15px",
                    borderRadius: 5,
                    background: "linear-gradient(45deg, #f44336, #ffe7a6, #4caf50)",
                    // background: "linear-gradient(45deg, #ffffff, #cc7c86, #15494e, #000000)",
                    opacity: 1
                  },
                  "& .MuiSlider-track": {
                    display: "none"
                  },
                  "& .MuiSlider-thumb": {
                    display: "none"
                  }
                }}
              />
              <SentimentVerySatisfiedIcon/>
            </Stack>
            <Box>
              <IconButton><FileDownloadIcon/></IconButton>
              <Button
                onClick={handleReset}
              >
                reset
              </Button>
            </Box>
          </Box>
        </Box>
    </Box>
  );
};

export default Basemap;