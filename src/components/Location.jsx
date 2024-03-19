import React from "react";
import { Autocomplete } from "@mui/material";
import { counties } from "data/counties.js";

const Location = () => {

	
	const handleCountyChange = (event, newValue) => {
    if (newValue != null) {
      console.log("countychange newValue", newValue);
      let code = newValue.properties.GEOID;
      let geometry = newValue.geometry.type;
      let coor_num = 0;
      let center = [];
      let coordinates = [];
      if (geometry === "MultiPolygon") {
        coor_num = newValue.geometry.coordinates[0][0].length;
        center = newValue.geometry.coordinates[0][0][coor_num % 2];
      } else {
        coor_num = newValue.geometry.coordinates[0].length;
        center = newValue.geometry.coordinates[0][coor_num % 2];
      }
      console.log(newValue.geometry.coordinates[0][0].length);
      
      const map = mapRef.current ? mapRef.current.getMap() : null;
      console.log("mapRef",mapRef.current);

      if (map) {
        map.on('load', () => {

        const bounds = bbox(newValue);
        const [minLng, minLat, maxLng, maxLat] = bounds;
        console.log("bbox",minLng, minLat, maxLng, maxLat);
        // map.fitBounds(
        //   [
        //     [minLng, minLat],
        //     [maxLng, maxLat]
        //   ],
        //   {zoom:10, duration: 1000}
        // );
        setViewState({
          latitude: (minLat+maxLat)/2,
          longitude: (minLng+maxLng)/2,
          zoom: 10,
          transitionDuration: 1000,
        });
      })};
      // mapRef.current.fitBounds(
      //   [
      //     [minLng, minLat],
      //     [maxLng, maxLat]
      //   ],
      //   {zoom:10, duration: 1000}
      // );
      // if (mapRef.current) {
      //   const map = mapRef.current.getMap();
  
      //   map.on('load', () => {
      //     map.fitBounds(
      //       [
      //         [minLng, minLat], // Southwest coordinates
      //         [maxLng, maxLat]  // Northeast coordinates
      //       ],
      //       {
      //         zoom:10,
      //         padding: 20, // Adjust padding as needed
      //         duration: 1000 // Adjust duration of the animation
      //       }
      //     );
      //   });
      // }

      setGeoID(code);
      setLocation(county_index[code]);
      console.log("geoID",code);
      console.log("location", county_index[code]);
    }
    setActiveStep(1);
  };

	const selectedCounty = counties.features.find(feature => feature.properties.GEOID === geoID) || null;

	return(
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
	)
}

export default Location;