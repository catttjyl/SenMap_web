import 'App.css';
import React, { useState, useEffect, useRef } from "react";
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
import { counties } from "data/classify.js";
import { state_mapping } from "data/fips_state";
import { sectors } from "data/sectors";
import { county_index } from "data/county_index.js";
import { getPolZarr, getSourceZarr } from "utils/getZarr.js";
import { slice } from "zarr";
import { hexToRgba, formatNumber } from "utils/legend.js";
import { colors } from "utils/colors.js";
import 'react-notifications-component/dist/theme.css';
import InterpreteData from "components/DataInterpret";
import { Label } from "components/CompOvrd";
import { CustomIcon, CustomStepper } from "components/ProgressBar";
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

var id = "id";
var data = simulations;
// console.log("data", data);

const Basemap = () => {
  const mapRef = useRef(null);
  // const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const isMobileScreens = useMediaQuery('(max-width:550px) or (max-height:550px)');
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [initialViewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [emission, setEmission] = useState(50);
  const [activeStep, setActiveStep] = useState(0);     //mui step test
  const [geoID, setGeoID] = useState(0);
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState(0);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [disable, setDisable] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [Pop_curr, setPop_curr] = useState(null);
  const [MR_curr, setMR_curr] = useState(null);
  const [Asian_curr, setAsian_curr] = useState(null);
  const [Black_curr, setBlack_curr] = useState(null);
  const [Latino_curr, setLatino_curr] = useState(null);
  const [Native_curr, setNative_curr] = useState(null);
  const [White_curr, setWhite_curr] = useState(null);

  const [total, setTotal] = useState(0.0);    // Total concentration of PM2.5
  const [PWAvg, setPWAvg] = useState([0.0, null]);    // Population-weighted Average concentration of PM2.5
  const [deathsK, setDeathsK] = useState([0.0, null]);    // Total number of deaths
  // const [deathsL, setDeathsL] = useState(0.0);    // Assume a 14% increase in morality rate for every 10 μg/m³ increase in PM2.5 concentration (instead of 6%)
  const [Asian, setAsian] = useState({
    ppl: 0.0,
    conc: [0.0, null]
  });
  const [Black, setBlack] = useState({
    ppl: 0.0,
    conc: [0.0, null]
  });
  const [Latino, setLatino] = useState({
    ppl: 0.0,
    conc: [0.0, null]
  });
  const [Native, setNative] = useState({
    ppl: 0.0,
    conc: [0.0, null]
  });
  const [White, setWhite] = useState({
    ppl: 0.0,
    conc: [0.0, null]
  });

  const [countyTotal, setCountyTotal] = useState(0.0);
  const [countyPWAvg, setCountyPWAvg] = useState([0.0, null]);
  const [countyDeathsK, setCountyDeathsK] = useState([0.0, null]);
  const [countyAsian, setCountyAsian] = useState({
    ppl: 0.0,
    conc: [0.0, null]
  });
  const [countyBlack, setCountyBlack] = useState({
    ppl: 0.0,
    conc: [0.0, null]
  });
  const [countyLatino, setCountyLatino] = useState({
    ppl: 0.0,
    conc: [0.0, null]
  });
  const [countyNative, setCountyNative] = useState({
    ppl: 0.0,
    conc: [0.0, null]
  });
  const [countyWhite, setCountyWhite] = useState({
    ppl: 0.0,
    conc: [0.0, null]
  });

  let max = 20;
  let epa_standard = 9/max;
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

  const [layerOpacity, setLayerOpacity] = useState(200);
  const options2 = {
    pickable: false,
    filled: true,
    getFillColor: [255, 255, 255, layerOpacity],
  };

  const [layer, setLayer] = useState(
    new GeoJsonLayer({
      id,
      data,
      ...options1,
    })
  );

  const [zoomInLayer, setZoomInLayer] = useState(
    new GeoJsonLayer({
      id,
      ...options2,
    })
  );

 useEffect(() => {
    if (selectedCounty) {
      console.log("opacity update");
      handleCountyMetrics(1);
      const intervalTime = 50;
      const duration = 2500;
      const steps = duration / intervalTime;
      const opacityDecrease = layerOpacity / steps;

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
    }
  }, [selectedCounty]);

 useEffect(() => {
    setZoomInLayer(new GeoJsonLayer({
      id: 'zoomInLayer',
      data: selectedCounty ? {
        "type": "FeatureCollection",
        "features": [selectedCounty]
      } : null,
      ...options2,
    }));
  }, [layerOpacity]); 

  const handleClose = () => {
    setIsPortrait(false);
  };
  
  useEffect(() => {
    const fetchZarrData = async () => {
      const results = await Promise.all([
        getPolZarr("TotalPop"),
        getPolZarr("MortalityRate"),
        getPolZarr("Asian"),
        getPolZarr("Black"),
        getPolZarr("Latino"),
        getPolZarr("Native"),
        getPolZarr("WhiteNoLat")
      ]);

      const zarrData = await Promise.all(results.map((result, index) =>
        result.get([slice(null, 52411),]).then(async (res) => await res.data)
      ));
      console.log("popreach",zarrData);
      await Promise.all([
        setPop_curr(zarrData[0]),
        setMR_curr(zarrData[1]),
        setAsian_curr(zarrData[2]),
        setBlack_curr(zarrData[3]),
        setLatino_curr(zarrData[4]),
        setNative_curr(zarrData[5]),
        setWhite_curr(zarrData[6])
      ]);
    };
    fetchZarrData();
  }, []);

  useEffect(() => {
    if (Pop_curr) {
      handleUSMetrics(1);
    }
  },[Pop_curr]);

  const handleUSMetrics = (index) => {
    console.log("Pop_curr",Pop_curr);
    let tmpTotal = 0;
    let tmpDsk = 0;
    let totalPop = 0, totalAsian = 0, totalBlack = 0, totalLati = 0, totalNative = 0, totalWhite = 0;
    let weightedSum = 0, weightedSumA = 0, weightedSumB = 0, weightedSumL = 0, weightedSumN = 0, weightedSumW = 0;
    console.log("emission", emission);
    for (let i = 0; i < 52411; i++) {
      let curr = data.features[i].properties.TotalPM25
      tmpTotal += curr;
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
      weightedSumW += curr * White_curr[i];
      totalWhite += White_curr[i];
      tmpDsk += (Math.exp(Math.log(1.06)/10 * curr) - 1) * Pop_curr[i] * 1.0465819687408728 * MR_curr[i] / 100000 * 1.025229357798165;
    }

    setTotal(tmpTotal);
    setDeathsK([tmpDsk, deathsK[index]]);
    setPWAvg([weightedSum/totalPop, PWAvg[index]]);
    setAsian(prevState => ({
      ppl: totalAsian,
      conc: [weightedSumA/totalAsian, prevState.conc[index]]
    }));
    setBlack(prevState => ({
      ppl: totalBlack,
      conc: [weightedSumB/totalBlack, prevState.conc[index]]
    }));
    setLatino(prevState => ({
      ppl: totalLati,
      conc: [weightedSumL/totalLati, prevState.conc[index]]
    }));;
    setNative(prevState => ({
      ppl: totalLati,
      conc: [weightedSumN/totalNative, prevState.conc[index]]
    }));
    setWhite(prevState => ({
      ppl: totalWhite,
      conc: [weightedSumW/totalWhite, prevState.conc[index]]
    }));
    console.log("population sum",totalPop)
  }

  const handleCountyMetrics = (index) => {
    let countyPol = 0;
    let countyDsk = 0;
    let countyTmpTotal = 0, countyTotalAsian = 0, countyTotalBlack = 0, countyTotalLati = 0, countyTotalNative = 0, countyTotalWhite = 0;
    let countyWeightedSum = 0, countyWeightedSumA = 0, countyWeightedSumB = 0, countyWeightedSumL = 0, countyWeightedSumN = 0, countyWeightedSumW = 0;
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
      countyWeightedSumW += curr * White_curr[key] * dict[key];
      countyTotalWhite += White_curr[key];
      countyDsk += (Math.exp(Math.log(1.06)/10 * curr) - 1) * pop * 1.0465819687408728 * MR_curr[key] * dict[key] / 100000 * 1.025229357798165;
    }
    setCountyTotal(countyPol);
    setCountyDeathsK([countyDsk, countyDeathsK[index]]);
    setCountyPWAvg([countyWeightedSum/countyPol, countyPWAvg[index]]);
    setCountyAsian(prevState => ({
      ppl: countyTotalAsian,
      conc: [countyWeightedSumA/countyTotalAsian, prevState.conc[index]]
    }));
    setCountyBlack(prevState => ({
      ppl: countyTotalBlack,
      conc: [countyWeightedSumB/countyTotalBlack, prevState.conc[index]]
    }));
    setCountyLatino(prevState => ({
      ppl: countyTotalLati,
      conc: [countyWeightedSumL/countyTotalLati, prevState.conc[index]]
    }));
    setCountyNative(prevState => ({
      ppl: countyTotalNative,
      conc: [countyWeightedSumN/countyTotalNative, prevState.conc[index]]
    }));
    setCountyWhite(prevState => ({
      ppl: countyTotalWhite,
      conc: [countyWeightedSumW/countyTotalWhite, prevState.conc[index]]
    }));
  };

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
    const src_could = await getSourceZarr(sectors[sector]);
    
    console.log("geoID", geoID);
    console.log("county_ind", location);
    console.log("sector", sector);
    let src_curr = await src_could
      .get([0, location, slice(null, 52411)])
      .then(async (data) => await data.data);
    
    for (let i = 0; i < 52411; i++) {
      let src_emis = (emission * 2 / 100 - 1) * src_curr[i];
      data.features[i].properties.TotalPM25 += src_emis;
    }
    handleUSMetrics(0);
    handleCountyMetrics(0);
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

  const handleReset = async () => {
    setViewState(INITIAL_VIEW_STATE);
    setDisable(true);
    setActiveStep(0);
    setEmission(50);
    setGeoID(0);
    setLocation(0);
    setSector("");
    setSelectedCounty(null);
    setTotal(0.0);
    setLoading(false);
    setPWAvg([0.0,null]);
    setDeathsK([0.0,null]);
    setAsian({
      ppl: 0.0,
      conc: [0.0, null]
    });
    setBlack({
      ppl: 0.0,
      conc: [0.0, null]
    });
    setAsian({
      ppl: 0.0,
      conc: [0.0, null]
    });
    setLatino({
      ppl: 0.0,
      conc: [0.0, null]
    });
    setNative({
      ppl: 0.0,
      conc: [0.0, null]
    });
    setWhite({
      ppl: 0.0,
      conc: [0.0, null]
    });
    setCountyTotal(0.0);
    setCountyPWAvg([0.0,null]);
    setCountyDeathsK([0.0,null]);
    setCountyAsian({
      ppl: 0.0,
      conc: [0.0, null]
    });
    setCountyBlack({
      ppl: 0.0,
      conc: [0.0, null]
    });
    setCountyLatino({
      ppl: 0.0,
      conc: [0.0, null]
    });
    setCountyNative({
      ppl: 0.0,
      conc: [0.0, null]
    });
    setCountyWhite({
      ppl: 0.0,
      conc: [0.0, null]
    });
    id = 0;
    data = simulations;
    console.log("new data", data);
    setLayer(
      new GeoJsonLayer({
        id,
        data,
        ...options1,
      })
    );
    setDisable(false);
    console.log('done');
  };

  const stepList = [
    { label: 
        <Label>
          Your Location
        </Label>,
      content:
        <Autocomplete
          id="counties-search-bar"
          // value={selectedCounty}
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
          // value={sector}
          options={Object.keys(sectors)}
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
          <InterpreteData
            PWAvg={PWAvg}
            Asian={Asian}
            Black={Black}
            Latino={Latino}
            Native={Native}
            White={White}
            deathsK={deathsK}
            countyPWAvg={countyPWAvg}
            countyAsian={countyAsian}
            countyBlack={countyBlack}
            countyLatino={countyLatino}
            countyNative={countyNative}
            countyWhite={countyWhite}
            countyDeathsK={countyDeathsK}
            selectedCounty={selectedCounty}
            sector={sector}
            emission={emission}
          />
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
            <CustomStepper
              activeStep={activeStep} 
              orientation="vertical"
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
            </CustomStepper>
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
        </Box>
    </Box>
  );
};

export default Basemap;