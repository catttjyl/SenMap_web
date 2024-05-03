import React, {useState} from "react";
import { ResultBtn } from "components/CompOvrd";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid } from "@mui/material";
import { PieChart } from '@mui/x-charts/PieChart';
import useMediaQuery from '@mui/material/useMediaQuery';
import { formatNumber } from 'utils/legend.js';
import { HelpCenter } from "@mui/icons-material";

const EEJStats = ({ label, data, unit }) => {
  return (
    <Box sx={{mb: 2}}>
			<Typography fontWeight="bold" lineHeight={1.5}>
				{label}
			</Typography>
      {data[1] && `${formatNumber(data[1])} → `} {formatNumber(data[0])} {unit}
			{data[1] &&
				<Typography 
					component="span" 
					color={data[0] > data[1] ? "red" : "#00B6F0"}
					marginLeft={1}
					fontWeight="bold"
				>
					({((data[0]-data[1])/data[1]*100).toPrecision(3)}%)
				</Typography>
			}
    </Box>
  );
};

const InterpretData = (props) => {
	const { PWAvg, Asian, Black, Latino, Native, White, deathsK,
		countyPWAvg, countyAsian, countyBlack, countyLatino, countyNative, countyWhite, countyDeathsK,
		selectedCounty, sector, emission, 
	} = props;

  const [openQ1, setOpenQ1] = useState(false);
  const [openQ2, setOpenQ2] = useState(false);
	const fullScreen = useMediaQuery('(max-width:800px)');

	const handleQ1Close = () => {
    setOpenQ1(false);
  }

  const handleQ2Close = () => {
    setOpenQ2(false);
  }

	return (
		<Box>
			<ResultBtn onClick={() => setOpenQ1(true)}>How does this impact public health?</ResultBtn>
      <ResultBtn onClick={() => setOpenQ2(true)}>Who is most affected?</ResultBtn>

      {/* Interpret data */}
      <Dialog
        open={openQ1}
        onClose={handleQ1Close}
				fullScreen={fullScreen}
        sx={{ 
          '& .MuiDialog-paper': {
            minWidth: '80%',
            minHeight: '90%',
          }
        }}
      >
        <DialogTitle variant="h5" fontWeight="bold" margin={1}>
          How does this impact public health?
        </DialogTitle>
        <DialogContent sx={{marginLeft: "1%"}}>
					<Typography fontSize="17px" marginBottom={2}>
						{emission != 50 && (
							<span>
								<span style={{fontWeight:"bold"}} gutterBottom>
									{emission > 50 ? "Increase " : "Descrese "}
								</span>
								PM2.5 emission from{' '} 
								<span style={{fontWeight:"bold", color: "#00B6F0",fontSize:"20px"}} gutterBottom>
									{sector}
								</span>
								{' '} by {' '} 
								<span style={{fontWeight:"bold"}}>
									{emission*2-100}%
								</span>
							</span>
						)}
					</Typography>
					<EEJStats label="Number of Deaths Across the US" data={deathsK} unit="ppl"/>
					{ selectedCounty && (
						<EEJStats label={`Number of Death Across ${selectedCounty.properties.NAME}`} data={countyDeathsK} unit="ppl"/>
					)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQ1Close}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openQ2}
        onClose={handleQ2Close}
				fullScreen={fullScreen}
        sx={{ 
          '& .MuiDialog-paper': {
            minWidth: '80%',
            minHeight: '90%',
          }
        }}
      >
        <DialogTitle variant="h5" fontWeight="bold" margin={1}>
          Who Is Most Affected?
        </DialogTitle>
        <DialogContent sx={{marginLeft: "1%"}}>
					<Typography fontSize="17px" gutterBottom>
						{emission != 50 && (
							<span>
								<span style={{fontWeight:"bold"}}>
									{emission > 50 ? "Increase " : "Descrese "}
								</span>
								PM2.5 emission from{' '} 
								<span style={{fontWeight:"bold", color: "#00B6F0",fontSize:"20px"}} gutterBottom>
									{sector}
								</span>
								{' '} by {' '} 
								<span style={{fontWeight:"bold"}}>
									{emission*2-100}%
								</span>
								,  <br/>the {' '}
							</span>
						)}
						<span style={{fontWeight:"bold"}}>
							Population-Weighted average concentration of PM2.5
						</span>
						{emission != 50 &&(" changes as follow")}
					</Typography>
					<Grid container spacing={10}>
						<Grid item>
							<Typography variant="h6" color="#999999">Across the US</Typography>
							<EEJStats label="All Population" data={PWAvg} unit="μg/m³"/>
							<EEJStats label="White" data={White.conc} unit="μg/m³"/>
							<EEJStats label="Asian" data={Asian.conc} unit="μg/m³"/>
							<EEJStats label="Black" data={Black.conc} unit="μg/m³"/>
							<EEJStats label="Latino" data={Latino.conc} unit="μg/m³"/>
							<EEJStats label="Native" data={Native.conc} unit="μg/m³"/>
						</Grid>
						{selectedCounty && (
							<Grid item>
								<Typography variant="h6" color="#999999">Across {selectedCounty.properties.NAME}</Typography>
								<EEJStats label="All Population" data={countyPWAvg} unit="μg/m³"/>
								<EEJStats label="White" data={countyWhite.conc} unit="μg/m³"/>
								<EEJStats label="Asian" data={countyAsian.conc} unit="μg/m³"/>
								<EEJStats label="Black" data={countyBlack.conc} unit="μg/m³"/>
								<EEJStats label="Latino" data={countyLatino.conc} unit="μg/m³"/>
								<EEJStats label="Native" data={countyNative.conc} unit="μg/m³"/>
							</Grid>
						)}
						{selectedCounty && (
							<Grid item align="center" spacing={5}>
								<PieChart
									colors={["#DDDDDD","#FBF038","#6FB2D2","#8CBE4F","#E9B960"]}
									series={[
										{
											data: [
												{ value: White.ppl, label: 'White' },
												{ value: Asian.ppl, label: 'Asian' },
												{ value: Black.ppl, label: 'Black' },
												{ value: Latino.ppl, label: 'Latino' },
												{ value: Native.ppl, label: 'Native' },
											],
											outerRadius: "50%"
										},
										{
											data: [
												{value: countyWhite.ppl},
												{value: countyAsian.ppl},
												{value: countyBlack.ppl},
												{value: countyLatino.ppl},
												{value: countyNative.ppl},
											],
											innerRadius: "50%"
										}
									]}
									width={500}
									height={300}
								/>
								<Typography fontWeight="bold" marginTop={2} align={"center"}>
									Distribution of Population <br/>Across the US (inner) and {selectedCounty.properties.NAME} (outer)
								</Typography>
							</Grid>
						)}
					</Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQ2Close}>Close</Button>
        </DialogActions>
      </Dialog>
		</Box>
	)
}

export default InterpretData;