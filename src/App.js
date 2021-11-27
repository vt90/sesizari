import React, {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Container from '@mui/material/Container';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {createTheme, ThemeProvider, styled, responsiveFontSizes} from '@mui/material/styles';
import AddAPhoto from '@mui/icons-material/AddAPhoto';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import RoomIcon from '@mui/icons-material/Room';
import {GoogleMap, Marker, withGoogleMap, withScriptjs} from "react-google-maps";
import { defaultLogin, loadAsset, loadLocatie , createTicket, uploadTicketImg} from './api/backend';
import './styles.css';
import queryString from 'query-string';

const CustomGrid = styled(Grid)(({theme}) => ({
  alignItems: 'center',
  '& img': {
    width: '100%',
    height: 'auto',
    borderRadius: 3,
  },
}));



function createShadow(px) {
  return `0 0 ${px}px 0 rgba(43,54,72,.15)`;
}

const shadows = [
  "none",
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14),
  createShadow(14)
];


let theme = createTheme({
  palette: {
    primary: {
      main: '#39b349',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#383434',
      secondary: '#9298A8',
    },
    background: "#F8F8FA"
  },
  typography: {
    fontFamily: [
      "Museo",
      "serif"
    ].join(","),
  },
  shadows,
});

theme = responsiveFontSizes(theme)

const [lat, lng] = [46.770302, 23.578357];

let fileToUpload = null;

const App = () => {

  const [activeStep, setActiveStep] = useState(0);
  const [showPerson, setShowPerson] = useState("da");
  const [location, setLocation] = useState('');
  const [latLong, setLatLong] = useState([46.770302, 23.578357]);
  const [files, setFiles] = useState([]);
  const [setupOk, setSetupOk] = useState(true);
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [assetId, setAssetId] = useState(null);
  const [locationId, setLocationId] = useState(null);
  const [ticketInfo, setTicketInfo] = useState(null);

  const onUpload = (ev) => {
    const files = [];

    for (let file of ev.target.files) {
      files.push(URL.createObjectURL(file));
      fileToUpload = file;
    }

    setFiles(files);
  }

  const onMapLoad = () => {
    navigator?.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setLatLong([lat, lng]);
      }
    );
  };

  useEffect(() => {
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ location: {
        lat: parseFloat(latLong[0]),
        lng: parseFloat(latLong[1]),
      }}).then(response => {
        if (response.results.length && response.results[0].formatted_address) {
          setLocation(response.results[0].formatted_address);
        }
      });  
    }
  }, [latLong]);

  useEffect(() => {
    const submit = async () => {
      const res = await createTicket(description, assetId, locationId, latLong[0], latLong[1], email, userName);

      if (res && res.ticket_id) {
        setTicketInfo(res);
        if (fileToUpload) {
          await uploadTicketImg(res.ticket_id, fileToUpload);
        }
      }
    }
    if (activeStep === 2 && !ticketInfo) {
      submit();
    }

    // eslint-disable-next-line
  }, [activeStep]);

  const MapComponent = withScriptjs(withGoogleMap((props) => (
      <GoogleMap
          defaultZoom={18}
          onClick={ev => {
            setLatLong([ev.latLng.lat(), ev.latLng.lng()]);
          }}    
          defaultCenter={{lat: latLong[0], lng: latLong[1]}}
      >
        <Marker position={{lat: latLong[0], lng: latLong[1]}}/>
      </GoogleMap>
  )));


  useEffect(() => {
    const parsed = queryString.parse(window.location.search);
    const setup = async () => {
      const loginStatus = await defaultLogin();
      if (!loginStatus) {
        setSetupOk(false);

        return ;
      }

      onMapLoad();
      if (parsed && parsed.asset_id) {
        const assetAndLocation = await loadAsset(parsed.asset_id);
        if (assetAndLocation.asset && assetAndLocation.asset.asset_id) {
          setAssetId(assetAndLocation.asset.asset_id);
        }

        if (assetAndLocation.location && assetAndLocation.location.nume) {
          setLocation(assetAndLocation.location.nume);
          setLocationId(assetAndLocation.location.locatie_id);
          
          if (assetAndLocation.location.lat && assetAndLocation.location.lon) {
            setLatLong([parseFloat(assetAndLocation.location.lat), parseFloat(assetAndLocation.location.lon)]);
          }
        }
      } else if (loginStatus && loginStatus.locatie_id) {
        const location = await loadLocatie(loginStatus.locatie_id);
        if (location && location.nume) {
          setLocation(location.nume);
          setLocationId(location.locatie_id);
          
          if (location.lat && location.lon) {
            setLatLong([parseFloat(location.lat), parseFloat(location.lon)]);
          }
        }
      }
    }
    
    setup();
  }, []);

  const steps = [
    {
      title: 'Locatie',
      content: (
          <>
            <Box mb={2}>
              <MapComponent
                  googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyDTr0t1pqHwjXrF1s-Mn4zeyznMwdKDwQg&v"
                  loadingElement={<div style={{height: `100%`}}/>}
                  containerElement={<div style={{height: `400px`}}/>}
                  mapElement={<div style={{height: `100%`}}/>}
              />
            </Box>

            <Typography variant="body1" color="textSecondary">
              {latLong[0]}, {latLong[1]}
            </Typography>

            <Typography variant="h5" style={{display: 'flex', alignItems: 'center'}}>
              <RoomOutlinedIcon/>
              {location}
            </Typography>
          </>
      ),
      canGoForward: () => !!location,
    }, {
      content: (
          <>
            <Box mb={2} display="flex" alignItems="center">
              <Box mb={4}>
                <Typography color="textSecondary"><RoomIcon fontSize="large"/></Typography>
              </Box>
              &nbsp;
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom={true}>
                  <strong>
                    {location} <br/>
                    {lat}, {lng}
                  </strong>
                </Typography>

                <Button size="small" onClick={() => setActiveStep(0)}>Modifica Locatia</Button>
              </Box>
            </Box>

            <Divider/>

            <Box mt={2} mb={1}>
              <Typography variant="h5" paragraph={true}>
                Ce doriti sa raportati?
              </Typography>
              <TextField
                  id="description"
                  multiline
                  fullWidth
                  variant="outlined"
                  value={description}
                  onChange={ev => setDescription(ev.target.value)}
                  placeholder="Furnizati o descriere cat mai detaliata*"
                  minRows={5}
              />
            </Box>

            <Box mt={2}>
              {
                !!files?.length
                && (
                    <Box mb={2}>
                      <Grid container spacing={1}>
                        {files.map((file) => (
                            <CustomGrid item xs={4} sm={3} key={file}>
                              <img alt="uploaded file" src={file} />
                            </CustomGrid>
                        ))}
                      </Grid>
                    </Box>
                )
              }
              <input
                  accept="image/*"
                  style={{display: 'none'}}
                  id="raised-button-file"
                  type="file"
                  onChange={onUpload}
              />
              <label htmlFor="raised-button-file">
                <Button startIcon={<AddAPhoto/>} variant="outlined" size="large" component="span">
                  Adaugati fotografii
                </Button>
              </label>
            </Box>

            <Box mt={2}>
              <Typography variant="h5" paragraph={true}>
                Doriti sa va trimitem informatii despre raport?
              </Typography>
              <ToggleButtonGroup color="primary" value={showPerson}
                                 onChange={(_, newValue) => setShowPerson(newValue)} exclusive={true}>
                <ToggleButton value={"da"}>
                  Da
                </ToggleButton>
                <ToggleButton value={"nu"}>
                  Nu
                </ToggleButton>
              </ToggleButtonGroup>

              <Collapse in={showPerson === 'da'}>
                <>
                  <Box mb={1} mt={2}>
                    <TextField
                        id="name"
                        fullWidth
                        value={userName}
                        onChange={ev => setUserName(ev.target.value)}
                        variant="outlined"
                        placeholder="Numele dumneavoastra*"
                    />
                  </Box>

                  <Box mb={1}>
                    <TextField
                        id="email"
                        fullWidth
                        error={emailError}
                        value={email}
                        onChange={ev => setEmail(ev.target.value)}
                        onBlur={() => setEmailError(!/(.+)@(.+){2,}\.(.+){2,}/.test(email))}
                        variant="outlined"
                        placeholder="Adresa de email*"
                    />
                  </Box>
                </>
              </Collapse>
            </Box>
          </>
      ),
      title: 'Raport',
      canGoForward: () => description.length > 10 && !emailError && ((showPerson === 'da' && email.length > 5 && userName.length > 3) || showPerson === 'nu'),
      canGoBack: () => true,
    }, {
      title: 'Status',
      content: <>
        <Box display="flex" alignItems="center" justifyContent="center" mt={6} mb={2}>
          <CheckCircleOutlinedIcon fontSize="large" color="primary" />

          <Typography align="center" variant="h5" color="primary">
            Va multumim
          </Typography>
        </Box>
        <Box  mb={6}>

          <Typography color="textSecondary" align="center">
            Sesizare #{ticketInfo?.code} a fost creata cu success
          </Typography>
        </Box>
      </>,
      canGoBack: () => true,
    },
  ];


  const stepInfo = steps[activeStep];

  return (
      <ThemeProvider theme={theme}>
        <Container maxWidth="md">
          <Box my={3} style={{ minHeight: 'calc(100vh - 188px)' }}>
            <Card elevation={12}>
              <Box display="flex" justifyContent="center" pt={2} pb={1} style={{
                // backgroundColor: '#0093E9',
                // backgroundImage: 'linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)',
              }}>
                <Box>
                  <img alt="Eco Garden" src="eco-garden-logo.png" style={ { width: 126, height: 'auto' } } />
                </Box>
              </Box>
              {setupOk ? (<CardContent>
                <Box mx={-1}>
                  <Stepper nonLinear activeStep={activeStep}>
                    {steps.map(({title}, index) => (
                        <Step key={title} completed={activeStep > index}>
                          <StepButton color="inherit">
                            {title}
                          </StepButton>
                        </Step>
                    ))}
                  </Stepper>
                </Box>

                <Box my={4}>
                  {stepInfo.content}
                </Box>

                <Box display="flex" justifyContent="center">
                  {stepInfo.canGoBack &&
                  <Button variant="outlined" color="primary" disabled={!stepInfo.canGoBack()}
                          onClick={() => setActiveStep(activeStep - 1)}>Inapoi</Button>}
                  &nbsp;
                  {stepInfo.canGoForward &&
                  <Button variant="contained" color="primary" disabled={!stepInfo.canGoForward()}
                          onClick={() => setActiveStep(activeStep + 1)}>Inainte</Button>}
                </Box>
              </CardContent>) : (
                <Typography color="textSecondary" align="center">
                  Avem probleme in comunicarea cu serverul. Va rugam incercati mai tarziu.
                </Typography>
              )}
            </Card>
          </Box>

          <Box mt={6}>
            <Divider />

            <Box mt={2}>
              <Typography color="textSecondary" align="center">
                Proiect realizat in parteneriat cu
              </Typography>

              <Box display="flex" justifyContent="center">
                <Box>
                  <img alt="Primaria Cluj Napoca" src="primaria-cluj.jpeg" style={{ width: 'auto', height: 106 }} />
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <img alt="Mentdrive" src="logo-mentdrive.jpeg" style={{ width: 'auto', height: 106 }} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
  );
}

export default App;
