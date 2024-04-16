import 'App.css';
import React from "react";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { Map } from "react-map-gl";
import Navbar from "../navbar";
import {
  Box,
  TextField,
  Input,
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
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  CircularProgress
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import WebMercatorViewport from '@math.gl/web-mercator';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import "mapbox-gl/dist/mapbox-gl.css";
import simulations from "data/simulations.js";
// import { counties } from "data/counties.js";
import { counties } from "data/test_classify.js";
import { state_mapping } from "data/fips_state";
import { sectors } from "data/sectors";
import { county_index } from "data/county_index.js";
import { getPolZarr, getSourceZarr } from "utils/getZarr.js";
import { slice } from "zarr";
import { hexToRgba } from "utils/legend.js";
import { colors } from "utils/colors.js";
import { ReactNotifications, Store } from 'react-notifications-component'
import 'react-notifications-component/dist/theme.css'
import { DeckRenderer } from "deck.gl";
import {FlexBetween, ResultBtn, Label} from "components/CompOvrd";
import {CustomIcon} from "components/ProgressBar";
import bbox from '@turf/bbox';

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
  const isMobileScreens = useMediaQuery('(max-width:550px) or (max-height:550px)');
  const [isPortrait, setIsPortrait] = React.useState(window.innerHeight > window.innerWidth);
  const [initialViewState, setViewState] = React.useState(INITIAL_VIEW_STATE);
  const [question1, setQuestion1] = React.useState(false);
  const [question2, setQuestion2] = React.useState(false);
  const [emission, setEmission] = React.useState(50);
  const [activeStep, setActiveStep] = React.useState(0);     //mui step test
  const [geoID, setGeoID] = React.useState(0);
  const [sector, setSector] = React.useState("");
  const [location, setLocation] = React.useState(0);
  const [selectedCounty, setSelectedCounty] = React.useState(null);
  const [disable, setDisable] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [total, setTotal] = React.useState(0.0);    // Total concentration of PM2.5
  const [PWAvg, setPWAvg] = React.useState([0, null]);    // Population-weighted Average concentration of PM2.5
  const [deathsK, setDeathsK] = React.useState(0.0);    // Total number of deaths
  const [deathsL, setDeathsL] = React.useState(0.0);    // Assume a 14% increase in morality rate for every 10 μg/m³ increase in PM2.5 concentration (instead of 6%)
  const [Asian, setAsian] = React.useState([0, null]);
  const [Black, setBlack] = React.useState([0, null]);
  const [Latino, setLatino] = React.useState([0, null]);
  const [Native, setNative] = React.useState([0, null]);
  const mapRef = React.useRef(null);

  const [countyTotal, setCountyTotal] = React.useState(0.0);
  const [countyPWAvg, setCountyPWAvg] = React.useState([0, null]);
  const [countyDeathsK, setCountyDeathsK] = React.useState(0.0);
  const [countyAsian, setCountyAsian] = React.useState([0, null]);
  const [countyBlack, setCountyBlack] = React.useState([0, null]);
  const [countyLatino, setCountyLatino] = React.useState([0, null]);
  const [countyNative, setCountyNative] = React.useState([0, null]);

  const [intakeFrac, setIntakeFrac] = React.useState([0, null]);

  let max = 20;
  let epa_standard = 9/max;
  let breath_rate = 15.4 * 0.5; //breath/ppl/min X liter/breath
  // const findMax = (data, max) => {
  //   return data.properties.TotalPM25 > max ? data.properties.TotalPM25 : max;
  // };
  // let ini_max = data.features.reduce((max, item) => findMax(item, max), 0);
  var colorString = colors.join(', ');
  console.log("isPortrati",isPortrait);

  const options1 = {
    pickable: true,
    filled: true,
    getFillColor: (data) => {
      // let opacity = data.properties.TotalPM25 === 0 ? 0 : 150;
      let pm25 = data.properties.TotalPM25;
      let index = pm25 >= max ? 255 : Math.round(pm25/max * 255);
      let color = hexToRgba(colors[index], 150);
    
      return color;
    }
  };

  const [layerOpacity, setLayerOpacity] = React.useState(200);
  const options2 = {
    pickable: false,
    filled: true,
    getFillColor: [255, 255, 255, layerOpacity],
  };

  const [layer, setLayer] = React.useState(
    new GeoJsonLayer({
      id,
      data,
      ...options1,
    })
  );

  const [zoomInLayer, setZoomInLayer] = React.useState(
    new GeoJsonLayer({
      id,
      ...options2,
    })
  );

  React.useEffect(() => {
    const intervalTime = 50;
    const duration = 2500;
    const steps = duration / intervalTime;
    const opacityDecrease = 200 / steps;

    const interval = setInterval(() => {
      console.log("layer opacity",layerOpacity);
      setLayerOpacity(prevOpacity => {
        const newOpacity = prevOpacity - opacityDecrease;
        if (newOpacity <= 0) {
          clearInterval(interval);
          return 0;
        }
        return newOpacity;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [selectedCounty]);

  React.useEffect(() => {
    setZoomInLayer(new GeoJsonLayer({
      id: 'zoomInLayer',
      data: selectedCounty ? {
        "type": "FeatureCollection",
        "features": [selectedCounty]
      } : null,
      ...options2,
    }));
  }, [selectedCounty, layerOpacity]); 

  const handleClose = () => {
    setIsPortrait(false);
  };

  const handleQ1Close = () => {
    setQuestion1(false);
  }

  const handleQ2Close = () => {
    setQuestion2(false);
  }
  
  const handleCountyChange = (event, newValue) => {
    if (newValue != null) {
      console.log("countychange newValue", newValue);
      let code = newValue.properties.GEOID;
      let countyinfo = counties.features.find(feature => feature.properties.GEOID === code);
      const bounds = bbox(newValue);
      let [minLng, minLat, maxLng, maxLat] = bounds;
      console.log("bbox",minLng, minLat, maxLng, maxLat);
      const { offsetHeight: mapHeight, offsetWidth: mapWidth } = mapRef.current.getMap().getContainer()
      minLng = minLng - 0.05;
      maxLng = maxLng - 0.05;
      console.log("map wh",mapRef.current);
      console.log("wh",mapWidth,mapHeight);
      let padding = 20;
      if (padding * 2 > mapWidth || padding * 2 > mapHeight) padding = 0
      const {longitude, latitude, zoom} = new WebMercatorViewport({width: mapWidth, height: mapHeight}).fitBounds([[minLng, minLat], [maxLng, maxLat]], {padding});
      console.log(padding);
      setViewState({
        latitude: latitude,
        longitude: longitude,
        zoom: zoom,
        transitionDuration: 1000,
      });
      setLayerOpacity(255);
      // setZoomInLayer(
      //   new GeoJsonLayer({
      //     id,
      //     data: {
      //       "type":"FeatureCollection",
      //       "features":[countyinfo]
      //     },
      //     opacity: layerOpacity,
      //     ...options2
      //   })
      // );
      setGeoID(code);
      setSelectedCounty(countyinfo);
      setLocation(county_index[code]);
      console.log("geoID",code);
      console.log("location", county_index[code]);
      console.log("SelectedCounty",countyinfo.properties.area_frac)
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
    setLoading(true);
    setActiveStep(4);
    setDisable(true);
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
    const Asian_cloud = await getPolZarr("Asian");
    const Black_cloud = await getPolZarr("Black");
    const Latino_cloud = await getPolZarr("Latino");
    const Native_cloud = await getPolZarr("Native");

    console.log("geoID", geoID);
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
    let Asian_curr = await Asian_cloud
      .get([slice(null, 52411),])
      .then(async (data) => await data.data);
    let Black_curr = await Black_cloud
      .get([slice(null, 52411),])
      .then(async (data) => await data.data);
    let Latino_curr = await Latino_cloud
      .get([slice(null, 52411),])
      .then(async (data) => await data.data);
    let Native_curr = await Native_cloud
      .get([slice(null, 52411),])
      .then(async (data) => await data.data);

    let tmpTotal = 0;
    let weightedSum = 0;
    let totalPop = 0;
    let tmpDsk = 0;
    let tmpDsL = 0;
    let weightedSumA = 0;
    let totalAsian = 0;
    let weightedSumB = 0;
    let totalBlack = 0;
    let weightedSumL = 0;
    let totalLati = 0;
    let weightedSumN = 0;
    let totalNative = 0;
    console.log("emission", emission);
    for (let i = 0; i < 52411; i++) {
      let src_emis = (emission * 2 / 100 - 1) * src_curr[i];
      data.features[i].properties.TotalPM25 += src_emis;
      let curr = data.features[i].properties.TotalPM25
      tmpTotal += data.features[i].properties.TotalPM25;
      // console.log("population/grid: " + Pop_curr[i]);
      weightedSum += curr * Pop_curr[i];
      totalPop += Pop_curr[i];
      weightedSumA += curr * Asian_curr[i];
      totalAsian += Asian_curr[i];
      weightedSumB += curr * Black_curr[i];
      totalBlack += Black_curr[i];
      weightedSumL += curr * Latino_curr[i];
      totalLati += Latino_curr[i];
      weightedSumN += curr * Native_curr[i];
      totalNative += Native_curr[i];
      tmpDsk += (Math.exp(Math.log(1.06)/10 * curr) - 1) * Pop_curr[i] * 1.0465819687408728 * MR_curr[i] / 100000 * 1.025229357798165;
      // tmpDsL += (Math.exp(Math.log(1.14)/10 * curr) - 1) * Pop_curr[i] * 1.0465819687408728 * MR_curr[i] / 100000 * 1.025229357798165;
    }

    let countyTmpTotal = 0;
    let countyPol = 0;
    let countyWeightedSum = 0;
    let countyWeightedSumA = 0;
    let countyTotalAsian = 0;
    let countyWeightedSumB = 0;
    let countyTotalBlack = 0;
    let countyWeightedSumL = 0;
    let countyTotalLati = 0;
    let countyWeightedSumN = 0;
    let countyTotalNative = 0;
    let countyDsk = 0;
    let dict = selectedCounty.properties.area_frac;
    for (var key in dict) {
      let curr = data.features[key].properties.TotalPM25 * dict[key];
      let pop = Pop_curr[key] * dict[key];
      countyTmpTotal += curr;
      countyWeightedSum += curr * pop;
      countyPol += pop;
      countyWeightedSumA += curr * Asian_curr[key] * dict[key];
      countyTotalAsian += Asian_curr[key];
      countyWeightedSumB += curr * Black_curr[key] * dict[key];
      countyTotalBlack += Black_curr[key];
      countyWeightedSumL += curr * Latino_curr[key] * dict[key];
      countyTotalLati += Latino_curr[key];
      countyWeightedSumN += curr * Native_curr[key] * dict[key];
      countyTotalNative += Native_curr[key];
      countyDsk += (Math.exp(Math.log(1.06)/10 * curr) - 1) * pop * 1.0465819687408728 * MR_curr[key] * dict[key] / 100000 * 1.025229357798165;
    }
    let intakeMass = breath_rate * countyPol * 365 * 24 * 60
    setCountyTotal(countyPol);
    setCountyPWAvg([countyWeightedSum/countyPol, countyPWAvg[0]]);
    setCountyDeathsK(countyDsk);
    setCountyAsian([countyWeightedSumA/countyTotalAsian, countyAsian[0]]);
    setCountyBlack([countyWeightedSumB/countyTotalBlack, countyBlack[0]]);
    setCountyLatino([countyWeightedSumL/countyTotalLati, countyLatino[0]]);
    setCountyNative([countyWeightedSumN/countyTotalNative, countyNative[0]]);
    
    setTotal(tmpTotal);
    setPWAvg([weightedSum/totalPop, PWAvg[0]]);
    setDeathsK(tmpDsk);
    // setDeathsL(tmpDsL);
    setAsian([weightedSumA/totalAsian, Asian[0]]);
    setBlack([weightedSumB/totalBlack, Black[0]]);
    setLatino([weightedSumL/totalLati, Latino[0]]);
    setNative([weightedSumN/totalNative, Native[0]]);
    console.log("population sum",totalPop)
    id = id + 1;
    console.log(id);
    setLayer(
      new GeoJsonLayer({
        id,
        data,
        ...options1,
      })
    );
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setLoading(false);
    console.log("whether button disabled", disable);
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
    setSelectedCounty(null);
    setTotal(0.0);
    setPWAvg([0,null]);
    setAsian([0,null]);
    setBlack([0,null]);
    setLatino([0,null]);
    setNative([0,null]);
    setDeathsK(0.0);
    setDeathsL(0.0);
    setViewState(INITIAL_VIEW_STATE);
    id = id + "1";
    data = simulations;
    console.log("new data", data);
    setLayer(
      new GeoJsonLayer({
        id,
        data,
        ...options1,
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
      <Box>
        <Button
        variant="contained"
        sx={{bgcolor: "#F44336", mt: -5}}
        onClick={handleSubmit}
        disabled={disable || geoID===0 || sector===""}
        >
          Start
        </Button>
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              color: "green",
              position: 'absolute',
              mt: "-5%",
              ml: "-15%"
            }}
          />
        )}
      </Box>
    },
    { label: 
        <Label>
          Interpret Data
        </Label>,
      content:
        <Box>
          <Typography variant="caption">Click on the question you are interested in.</Typography>
          <ResultBtn onClick={() => setQuestion1(true)}>How does this impact public health?</ResultBtn>
          <ResultBtn onClick={() => setQuestion2(true)}>Who is most affected?</ResultBtn>
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

      <Dialog
        open={question2}
        onClose={handleQ2Close}
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
        <DialogContent dividers>
          <h4 style={{lineHeight:"0"}}>Population-Weighted average PM2.5 by racial group </h4>
          ▪ All population: {PWAvg[0].toPrecision(4)} {PWAvg[1] !== null && ` --> ${PWAvg[1].toPrecision(4)}`} μg/m³<br/>
          ▪ Asian: {Asian[0].toPrecision(4)} {Asian[1] !== null && ` --> ${Asian[1].toPrecision(4)}`} μg/m³<br/>
          ▪ Black: {Black[0].toPrecision(4)} {Black[1] !== null && ` --> ${Black[1].toPrecision(4)}`} μg/m³<br/>
          ▪ Latino: {Latino[0].toPrecision(4)} {Latino[1] !== null && ` --> ${Latino[1].toPrecision(4)}`} μg/m³<br/>
          ▪ Native: {Native[0].toPrecision(4)} {Native[1] !== null && ` --> ${Native[1].toPrecision(4)}`} μg/m³<br/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQ2Close}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Map and everything */}
        <Box>
          <DeckGL
            initialViewState = {isMobileScreens ? MOBILE_INITIAL_VIEW_STATE : initialViewState}
            getTooltip={({ object }) =>
              object && 
                  (object.properties.TotalPM25).toPrecision(3)
            }
            controller = {true}
            layers = {[layer, zoomInLayer]}
            // MapProvider
          >
            <Map
              ref={mapRef}
              mapStyle={MAP_STYLE}
              mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
            />
          </DeckGL>
          <Navbar/>
          <Box
            flexDirection="column"
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
                <Step key={step.label} active={isMobileScreens ? undefined : true}>
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
                defaultValue={45}
                disabled
                marks={[{value: 45, label: "AQS Standard"}]}
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
          {selectedCounty && <Box
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
            }}
          >
            <h4 style={{lineHeight:"0"}}>Info for {selectedCounty.properties.NAME}</h4>
            ▪ Total population: {countyTotal.toPrecision(4)} ppl<br/>
            ▪ Number of Death: {countyDeathsK} ppl<br/>
            {/* ▪ Asian:<br/>
            ▪ Black:<br/>
            ▪ Latino:<br/>
            ▪ Native:<br/> */}
            ▪ Population-weighted: {countyPWAvg[1] !== null && `${countyPWAvg[1].toPrecision(4)}  --> `} {countyPWAvg[0].toPrecision(4)} μg/m³<br/>
            ▪ Asian-weighted: {countyAsian[1] !== null && `${countyAsian[1].toPrecision(4)} --> `} {countyAsian[0].toPrecision(4)} μg/m³<br/>
            ▪ Black-weighted: {countyBlack[1] !== null && `${countyBlack[1].toPrecision(4)} --> `} {countyBlack[0].toPrecision(4)} μg/m³<br/>
            ▪ Latino-weighted: {countyLatino[1] !== null && `${countyLatino[1].toPrecision(4)} --> `} {countyLatino[0].toPrecision(4)} μg/m³<br/>
            ▪ Native-weighted: {countyNative[1] !== null && `${countyNative[1].toPrecision(4)} --> `} {countyNative[0].toPrecision(4)} μg/m³<br/>
          </Box>}
        </Box>
    </Box>
  );
};

export default Basemap;