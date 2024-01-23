import 'App.css';
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
  Grid,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import "mapbox-gl/dist/mapbox-gl.css";
import simulations from "data/simulations.js";
import { counties } from "data/counties.js";
import { state_mapping } from "data/fips_state";
import { sectors } from "data/sectors";
import { county_index } from "data/county_indexn.js";
import { getPolZarr, getSourceZarr } from "utils/getZarr.js";
import { slice } from "zarr";
import { hexToRgba } from "utils/legend.js";
import { colors } from "utils/colors.js";
import { ReactNotifications, Store } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import { DeckRenderer } from "deck.gl";
import {FlexBetween, ResultBtn, Label} from "components/CompOvrd";
import {CustomIcon} from "components/ProgressBar";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1Ijoic2hhd25yYW4xODIiLCJhIjoiY2w5NXRvMDRjMmhhYzN3dDUyOGo0ZmdpeCJ9.RuSR6FInH2tUyctzdnilrw";

const INITIAL_VIEW_STATE = {
  latitude: 40.0,
  longitude: -110.0,
  zoom: 3.5,
  bearing: 0,
	// pitch: 0,
};

const MOBILE_INITIAL_VIEW_STATE = {
  latitude: 40.0,
  longitude: -110.0,
  zoom: 2.6,
  bearing: 0,
};

const MAP_STYLE = "mapbox://styles/mapbox/streets-v10";

let id = "id";
let data = simulations;
// console.log("data", data);

const Basemap = () => {
  // const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const isMinimumScreens = useMediaQuery('(max-width:550px) or (max-height:550px)');
  const [isPortrait, setIsPortrait] = React.useState(window.innerHeight > window.innerWidth);
  const [initialViewState, setViewState] = React.useState(INITIAL_VIEW_STATE);
  const [question1, setQuestion1] = React.useState(false);
  const [emission, setEmission] = React.useState(50);
  const [activeStep, setActiveStep] = React.useState(0);     //mui step test
  const [geoID, setGeoID] = React.useState(0);
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
  console.log("isPortrati",isPortrait);
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

  const handleClose = () => {
    setIsPortrait(false);
  };

  const handleQ1Close = () => {
    setQuestion1(false);
  }
  

  const handleCountyChange = (event, newValue) => {
    if (newValue != null) {
      let code = newValue.properties.GEOID;
      let geometry = newValue.geometry.type;
      let coor_num = 0;
      let center = [];
      if (geometry === "MultiPolygon") {
        coor_num = newValue.geometry.coordinates[0][0].length;
        center = newValue.geometry.coordinates[0][0][coor_num % 2];
      } else {
        coor_num = newValue.geometry.coordinates[0].length;
        center = newValue.geometry.coordinates[0][coor_num % 2];
      }
      // console.log(newValue.geometry.coordinates[0][0].length);
      setViewState({
        latitude: center[1],
        longitude: center[0]+0.01,
        zoom: 10,
        transitionDuration: 1000,
      });
      setGeoID(code);
      setLocation(county_index[code]);
      console.log("geoID",code);
      console.log("location", county_index[code]);
    }
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
    const PM25_cloud = await getPolZarr("PrimaryPM25");
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
    console.log("geoID", geoID);
    console.log("county_ind", location);
    console.log("sector", sector);
    let src_curr = await src_could
      .get([0, location, slice(null, 52411)])
      .then(async (data) => await data.data);
    let PM25_curr = await PM25_cloud
      .get([0, location, slice(null, 52411),])
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
    setActiveStep(0);
    setEmission(50);
    setGeoID(0);
    setLocation(0);
    setSector("");
    setTotal(0.0);
    setPWAvg(0.0);
    setDeathsK(0.0);
    setDeathsL(0.0);
    setViewState(INITIAL_VIEW_STATE);
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


  const selectedCounty = counties.features.find(feature => feature.properties.GEOID === geoID) || null;

  const stepList = [
    { label: 
        <Label>
          Your Location
        </Label>,
      content:
        <Autocomplete
          id="counties-search-bar"
          value={selectedCounty}
          options={counties.features.sort((a,b) => 
            a.properties.STATEFP.localeCompare(b.properties.STATEFP) ||
            a.properties.NAME[0].localeCompare(b.properties.NAME[0])
            )
          }
          groupBy={(option) => option.properties.STATEFP}
          sx={{ width: "210px" , ml: "3px", mt: "6px"}}
          onChange={handleCountyChange}
          getOptionLabel={(option) => option.properties.NAME}
          renderInput={(params) => 
            <TextField 
              {...params}
              label="Enter County..."
              variant="filled"
            />
          }
          renderOption={(props, option) => {
            return (
              <li {...props} key={option.properties.GEOID}>
                {option.properties.NAME}
              </li>
            );
          }}
          renderGroup={(param) => (
            <li key={param.key}>
              <Typography 
                color="textSecondary" 
                fontWeight="bold"
                sx={{ top: -8,
                padding: '4px 10px',
                backgroundColor: "#D1F0E9", 
                position: "sticky", 
                zIndex: 2}}
              >
                {state_mapping[param.group]}
              </Typography>
              <Typography sx={{padding : 0}}>{param.children}</Typography>
            </li>
          )}
        />
    },
    { label: 
        <Label>
          Pollutant Sourse
        </Label>,
      content:
        <Autocomplete
          id="choose-sectors"
          value={sector}
          options={sectors}
          sx={{ width: "300px" , ml: "3px", mt: "6px"}}
          onChange={handleSectorChange}
          renderInput={(params) => 
            <TextField 
              {...params}
              label="Choose a source..."
              variant="filled"
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
      disabled={geoID===0 || sector===""}
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
          <ResultBtn onClick={() => setQuestion1(true)}>Where is the pollution coming from?</ResultBtn>
          <ResultBtn>Who is most affected?</ResultBtn>
        </Box>
    }
  ];
  
  return(
    <Box>
      {/* <ReactNotifications /> */}

      {/* Rotate to landscape view */}
      <Dialog
        open={isPortrait}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Screen Orientation Alert"}
        </DialogTitle>
        <DialogContent>
          <div className="phone-animation">
            {/* <div className="arrow"/> */}
          </div>
          <p>For a better experience, please rotate your device to landscape mode.</p>        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>OK</Button>
        </DialogActions>
      </Dialog>

      {/* Interpret data */}
      <Dialog
        open={question1}
        onClose={handleQ1Close}
        sx={{ 
          '& .MuiDialog-paper': { // Apply custom styles
            minWidth: '1200px', // Minimum width of the dialog
            minHeight: '700px', // Maximum height of the dialog
          }
        }}
      >
        <DialogTitle id="alert-dialog-title">
          {"How does this impact public health?"}
        </DialogTitle>
        <DialogContent>
          show the result here.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQ1Close}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Map and everything */}
        <Box>
          <DeckGL
            initialViewState = {isMinimumScreens ? MOBILE_INITIAL_VIEW_STATE : initialViewState}
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
                defaultValue={37.5}
                disabled
                marks={[{value: 37.5, label: "AQS Standard"}]}
                sx={{
                  width: 450,
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
                    width: 0,
                    height: "3.5vh",
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderLeft: "10px solid transparent",
                    borderRight: "10px solid transparent",
                    borderRadius: "0px",
                    borderBottom: "15px solid #00FF00",
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