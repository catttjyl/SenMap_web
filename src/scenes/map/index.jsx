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
  Input,
  Select,
  Button,
  IconButton,
  Slider,
  Typography,
  Stack,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Autocomplete,
  StepConnector,
  Grid
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import { MapProvider } from 'react-map-gl'
import "mapbox-gl/dist/mapbox-gl.css";
import pollutant from "data/pollutant.js";
import simulations from "data/simulations.js";
import { counties } from "data/counties.js";
import { county_index } from "data/county_indexn.js";
import { getPolZarr, getSourceZarr } from "utils/getZarr.js";
import { slice } from "zarr";
import { hexToRgba } from "utils/legend.js";
import { colors } from "utils/colors.js";
import { ReactNotifications, Store } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import { DeckRenderer } from "deck.gl";
import {FlexBetween, ResultBtn, Label} from "components/CompOvrd";
import {MyBox, ProgressContainer, ProgressBar, StepsContainer, MyStep, ProgressStepper, CustomIcon} from "components/ProgressBar";
import PercentIcon from '@mui/icons-material/Percent';

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
console.log("data", data);

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
  let ini_max = data.features.reduce((max, item) => findMax(item, max), 0);
  let curr_max = ini_max;
  var colorString = colors.join(', ');

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
      let index = Math.round(data.properties.TotalPM25/curr_max * 255);
      let opacity = index === 0 ? 0 : 150;
      let color = hexToRgba(colors[index], 150);
    
      return color;
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

  const handleCountyChange = (event, newValue) => {
    // setCounty(event.target.value);
    console.log("event",event.target);
    console.log("newValue",newValue);
    let code = newValue === null ? 0: newValue.properties.GEOID;
    setCounty(code);
    setLocation(county_index[code]);
    // console.log("location", location);
    setActiveStep(1);
  };

  const handleSectorChange = (event, newValue) => {
    setSector(newValue);
    setActiveStep(2);
  };

  const handleEmissionChange = (event, newValue) => {
    setEmission(newValue);
    setActiveStep(3);
  };

  const handleInputEmissionChange = (event, newValue) => {
    console.log("emission input newval", event.target)
    setEmission(event.target.value === '' ? 0 : Number(event.target.value / 2));
    setActiveStep(3);
  };

  const handleBlur = () => {
    if (emission < 0) {
      setEmission(0);
    } else if (emission > 100) {
      setEmission(100);
    }
  };

  const handleSubmit = async () => {
    setActiveStep(4);
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
      data.features[i].properties.TotalPM25 = curr;

      tmpTotal += data.features[i].properties.TotalPM25;
      totalPop += Pop_curr[i];
      // console.log("population/grid: " + Pop_curr[i]);
      weightedSum += data.features[i].properties.TotalPM25 * Pop_curr[i];
      tmpDsk += (Math.exp(Math.log(1.06)/10 * curr) - 1) * Pop_curr[i] * 1.0465819687408728 * MR_curr[i] / 100000 * 1.025229357798165;
      tmpDsL += (Math.exp(Math.log(1.14)/10 * curr) - 1) * Pop_curr[i] * 1.0465819687408728 * MR_curr[i] / 100000 * 1.025229357798165;

      if (data.features[i].properties.TotalPM25 > curr_max) {
        // console.log(data.features[i].properties.TotalPM25);
        curr_max = data.features[i].properties.TotalPM25;
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
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setDisable(false);
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  


  const handleReset = async () => {
    setDisable(true);
    setEmission(50);
    setCounty(0);
    setActiveStep(0);
    setTotal(0.0);
    setPWAvg(0.0);
    setDeathsK(0.0);
    setDeathsL(0.0);
    id = id + "1";
    data = simulations;
    console.log("new data", data);
    curr_max = ini_max;
    setLayer(
      new GeoJsonLayer({
        id,
        data,
        ...options,
      })
    );
    console.log('done');
    setDisable(false);
  };

  const stepList = [
    { label: 
        <Label>
          Your Location
        </Label>,
      content:
        <Autocomplete
          id="counties-search-bar"
          // options={counties.features}
          options={counties.features.sort((a,b) => a.properties.NAME[0].localeCompare(b.properties.NAME[0]))}
          sx={{ width: "210px" , ml: "3px", mt: "6px"}}
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
    },
    { label: 
        <Label>
          Pollutant Sourse
        </Label>,
      content:
        <Autocomplete
          id="choose-sectors"
          options={sectors}
          sx={{ width: "300px" , ml: "3px", mt: "6px"}}
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
    },
    { label:
        <Label gutterBottom>
          Define Emission Amount
        </Label>,
      content:
        <Stack direction="row" spacing={0} alignItems="center" sx={{ml: "20px", mt: "8px", mb: "35px"}}>
          <Slider
            value={emission}
            onChange={handleEmissionChange}
            valueLabelFormat={2*emission}
            aria-label="Emission"
            sx={{
              width: "240px",
              display: "block",
              mb: -1,
              "& .MuiSlider-markLabel": {
                fontSize: "0.8rem",
              },
            }}
            marks={[
              {value: 0, label: "0%"},
              {value: 50, label: "100%"},
              {value: 100, label: "200%"}
            ]}
          />
          <Input
            value={emission*2}
            onChange={handleInputEmissionChange}
            onBlur={handleBlur}
            inputProps={{
              min: 0,
              max: 200,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
            sx={{width: "45px", ml: 3}}
          />
          <Typography sx={{ml: -2}}>%</Typography>
        </Stack>
    },
    { label: null,
      content:
      <Button
      variant="contained"
      sx={{bgcolor: "#F44336", mt: -5}}
      onClick={handleSubmit}
      disabled={county===0 || sector===""}
      >
        Start
      </Button>
    },
    { label: 
        <Label>
          Interpret Data
        </Label>,
      content:
        <Box>
          <Typography variant="caption">Click on the question you are interested in.</Typography>
          <ResultBtn>How does this impact public health?</ResultBtn>
          {/* <ResultBtn>Where is the pollution coming from?</ResultBtn> */}
          <ResultBtn>Who is most affected?</ResultBtn>
        </Box>
    }
  ];
  
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
              maxWidth: "375px",
              position: "absolute",
              display: "flex",
              justifyContent: "space-between",
              alignItems: 'flex-start',
            }}
          >
            <Stepper
              activeStep={activeStep} 
              orientation="vertical" 
              sx={{
                "& .MuiStep-root": {
                  "& .MuiStepLabel-root": {
                    padding: 0,
                    height: 15,
                  },
                },
                "& .MuiStepContent-root": {
                  ml: "7px",
                  borderLeft: "3px solid #7F99AE",
                },
                "& .MuiStepConnector-line": {
                  borderLeft: "3px solid #7F99AE",
                },
                "& .MuiStepConnector-root": {
                  ml: "7px",
                  height: 20,
                },
                "& .MuiStep-root:last-child .MuiStepContent-root": {
                  borderLeft: "none",
                },
              }}
            >
              {stepList.map((step, index) => (
                <Step key={step.label} active={isMinimumScreens ? undefined : true}>
                  <StepLabel StepIconComponent={CustomIcon}>
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Typography>{step.content}</Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            <Stack spacing={2} direction="row" alignItems="center">
            <SentimentVerySatisfiedIcon/>
              <Slider
                sx={{
                  width: 450,
                  display: "block",
                  "& .MuiSlider-rail": {
                    color: "grey",
                    height: "15px",
                    borderRadius: 5,
                    background: `linear-gradient(90deg, ${colorString})`,
                    opacity: 150/256,
                  },
                  "& .MuiSlider-track": {
                    display: "none"
                  },
                  "& .MuiSlider-thumb": {
                    display: "none"
                  }
                }}
              />
              <WarningAmberIcon/>
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