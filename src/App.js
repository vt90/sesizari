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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import {createTheme, ThemeProvider, styled, responsiveFontSizes} from '@mui/material/styles';
import AddAPhoto from '@mui/icons-material/AddAPhoto';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import Autocomplete, {createFilterOptions} from '@mui/material/Autocomplete';
import Modal from '@mui/material/Modal';
// import {GoogleMap, Marker, withGoogleMap, withScriptjs} from "react-google-maps";
import { defaultLogin, loadAsset, loadLocatie , createTicket, uploadTicketImg, searchTicketByCode, loadSpecializari, loadAllAssets} from './api/backend';
import TermsModal from './TermsModal';
import './styles.css';
import queryString from 'query-string';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const CustomGrid = styled(Grid)(({theme}) => ({
  alignItems: 'center',
  '& img': {
    width: '100%',
    height: 'auto',
    borderRadius: 3,
  },
}));

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  maxHeight: 400,
  overflow: 'auto',
  p: 4,
};

const LocationNamesList = [
  'București', 'Buftea', 'Bragadiru', 'Chitila', 'Magurele', 'Otopeni', 'Pantelimon', 'Popesti - Leordeni', 'Voluntari', '1 Decembrie', 'Afumati', 
  'Balotesti', 'Berceni', 'Branesti', 'Cernica', 'Chiajna', 'Ciolpani', 'Ciorogarla', 'Clinceni', 'Corbeanca', 'Copaceni', 'Dobroesti', 'Dragomiresti',
  'Găneasa', 'Glina', 'Grădiștea', 'Gruiu', 'Jilava', 'Moara Vlasiei', 'Mogosoaia', 'Nuci', 'Peris', 'Petrachioaia', 'Snagov', 'Stefanestii de Jos', 'Tunari', 'Vidra'
];


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
      main: '#ff0000',
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

let filesToUpload = [];

const App = () => {

  const [activeStep, setActiveStep] = useState(1);
  const [onBackRemoveAssetFromUrl, setOnBackRemoveAssetFromUrl] = useState(false);
  const [showPerson, setShowPerson] = useState("da");
  const [location, setLocation] = useState('');
  const [latLong, setLatLong] = useState([46.770302, 23.578357]);
  const [files, setFiles] = useState([]);
  const [assetList, setAssetList] = useState([]);
  const [specializari, setSpecializari] = useState([]);
  const [setupOk, setSetupOk] = useState(true);
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [personAddress, setPersonAddress] = useState('');
  const [specializare, setSpecializare] = useState(0);
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [searchTicketNumber, setSearchTicketNumber] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [assetId, setAssetId] = useState(null);
  const [locationId, setLocationId] = useState(null);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [oldTicket, setOldTicket] = useState(null);
  const [termsChecked, setTermsChecked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [locationName, setLocationName] = useState('București');
  const [locationLine, setLocationLine] = useState('');
  const [locationStation, setLocationStation] = useState('');
  const { executeRecaptcha } = useGoogleReCaptcha();

  const showLocationDetailsForm = true;

  const filterOptions = createFilterOptions({
    matchFrom: 'start',
    stringify: (option) => option.nume,
  });
  

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  const onUpload = (ev) => {
    const files = [];

    for (let file of ev.target.files) {
      files.push(URL.createObjectURL(file));
      filesToUpload.push(file);
    }

    setFiles(files);
  }

  const onMapLoad = () => {
    navigator?.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setLatLong([lat, lng]);
      }, (error) => {
        setLocationName('București');
      }
    );
  };

  // useEffect(() => {
  //   if (window.google && window.google.maps) {
  //     const geocoder = new window.google.maps.Geocoder();

  //     geocoder.geocode({ location: {
  //       lat: parseFloat(latLong[0]),
  //       lng: parseFloat(latLong[1]),
  //     }}).then(response => {
  //       if (response.results.length && response.results[0].formatted_address) {
  //         setLocation(response.results[0].formatted_address);
  //       }
  //     });  
  //   }
  // }, [latLong]);

  useEffect(() => {
    const submit = async () => {
      let newDescription = `${locationName ? `Localitate: ${locationName}\n` : ''}Linie: ${locationLine}\nStatie: ${locationStation}\n\n${description}\n\nAdresa domiciliu: ${personAddress}`;
      if (personPhone && personPhone.length) {
        newDescription = `${newDescription}\nNumar telefon: ${personPhone}`;
      }
      if (dateTime && dateTime.length) {
        newDescription = `${newDescription}\nData si ora evenimentului: ${dateTime}`;
      }
      const token = await executeRecaptcha('createTicket');
      const res = await createTicket(newDescription, assetId, locationId, latLong[0], latLong[1], email, userName, specializare, token);

      if (res && res.ticket_id) {
        setTicketInfo(res);
        setOldTicket(null);
        setDescription('');
        setUserName('');
        setEmail('');
        setPersonAddress('');
        setPersonPhone('');
        setShowPerson('da');
        setSpecializare(0);
        setLocationLine('');
        setLocationStation('');
        setDateTime('');
        setLocationName('București');
        if (filesToUpload && filesToUpload.length) {
          for (const fileIndex in filesToUpload) {
            if (fileIndex < 3) {
              await uploadTicketImg(res.ticket_id, filesToUpload[fileIndex], fileIndex);
            }
          }
        }

        setFiles([]);
        const parsed = queryString.parse(window.location.search);
        if (parsed && parsed.asset_id) {
          setOnBackRemoveAssetFromUrl(true);
        }
      }
    }
    if (activeStep === 2 && !ticketInfo && !oldTicket) {
      submit();
    }
    if (activeStep !== 2) {
      setOldTicket(null);
      setSearchTicketNumber('');
      if (onBackRemoveAssetFromUrl) {
        window.location.search = "";
      }
    }

    // eslint-disable-next-line
  }, [activeStep]);

  // const MapComponent = withScriptjs(withGoogleMap((props) => (
  //     <GoogleMap
  //         defaultZoom={18}
  //         onClick={ev => {
  //           setLatLong([ev.latLng.lat(), ev.latLng.lng()]);
  //         }}    
  //         defaultCenter={{lat: latLong[0], lng: latLong[1]}}
  //     >
  //       <Marker position={{lat: latLong[0], lng: latLong[1]}}/>
  //     </GoogleMap>
  // )));

  useEffect(() => {
    const parsed = queryString.parse(window.location.search);
    const setup = async () => {
      const loginStatus = await defaultLogin();
      if (!loginStatus) {
        setSetupOk(false);

        return ;
      }

      const data = await loadSpecializari();
      if (data && data.list) {
        setSpecializari(data.list);
      }

      onMapLoad();
      if (parsed && parsed.asset_id) {
        const assetAndLocation = await loadAsset(parsed.asset_id);
        if (assetAndLocation.asset && assetAndLocation.asset.asset_id) {
          setAssetId(assetAndLocation.asset.asset_id);
        }

        setLocation(`${assetAndLocation.asset.clasa_asset_nume} ${assetAndLocation.asset.nume}`);
        if (assetAndLocation.location && assetAndLocation.location.nume) {
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

      if (!parsed || !parsed.asset_id) {
        const assets = await loadAllAssets();
        if (assets && assets.length) {
          setAssetList(assets);
        }
      }
    }
    
    setup();
  }, []);

  useEffect(() => {
    const search = async () => {
      const resp = await searchTicketByCode(searchTicketNumber);
      if (resp && resp.list && resp.list.length) {
        setOldTicket(resp.list[0]);
        setTicketInfo(null);
        setActiveStep(2);
      } else {
        alert("Cod tichet invalid");
      }
    }
    if (searchTicketNumber && searchTicketNumber.length === 6) {
      search();
    }
  }, [searchTicketNumber]);

  const steps = [
    {
      title: 'Locatie',
      content: (
          <>
            <Box mb={2}>
              {/* <MapComponent
                  googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyDTr0t1pqHwjXrF1s-Mn4zeyznMwdKDwQg&v"
                  loadingElement={<div style={{height: `100%`}}/>}
                  containerElement={<div style={{height: `400px`}}/>}
                  mapElement={<div style={{height: `100%`}}/>}
              /> */}
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
      canGoForward: () => false,
    }, {
      content: (
          <>
            <Box mb={1} display="flex" flexDirection="column" alignItems="center">
              {/* <Box mb={4}>
                <Typography color="textSecondary"><RoomIcon fontSize="large"/></Typography>
              </Box>
              &nbsp; */}
              {/* <Box mb={1}> */}
                <Typography variant="body2" color="textSecondary" gutterBottom={true}>
                  <strong>
                    {location}
                  </strong>
                </Typography>

                {/* <Button size="small" onClick={() => setActiveStep(0)}>Modifica Locatia</Button> */}

                {assetList && assetList.length ? (
                  <div className='autoselectWrapper'>
                    <Typography variant="h5" paragraph={true}>
                      Selecteaza autobuz*
                    </Typography>
                    <Autocomplete
                      id="combo-box-demo"
                      options={ assetList }
                      disablePortal
                      sx={{width: '100%'}}
                      filterOptions={filterOptions}
                      onChange={(_event, newValue) => {
                        if (newValue && newValue.asset_id) {
                          setAssetId(newValue.asset_id);
                        }
                      }}
                      getOptionLabel={(option) => option.nume}
                      renderInput={(params) => <TextField {...params} label="Selecteaza autobuz" />}
                    />
                  </div>
                  
                ) : null }

                {showLocationDetailsForm ? (
                  <Box className='autoselectWrapper' sx={{width: '100%'}} mt={2} mb={1}>
                    <Typography variant="h5" paragraph={true}>
                      Localitate*
                    </Typography>
                    <Select
                      id="location-name"
                      value={locationName}
                      label="Localitate"
                      style={{width: '100%'}}
                      onChange={(event) => {
                        setLocationName(event.target.value);
                      }}
                    >
                      {LocationNamesList.map((_location) => 
                        <MenuItem style={{background: 'white'}} key={_location} value={_location}>{_location}</MenuItem>
                      )}
                    </Select>
                  </Box>
                ) : null}
                    <Box sx={{width: '100%'}} mt={2} mb={1}>
                      <Typography variant="h5" paragraph={true}>
                        Linie
                      </Typography>
                      <TextField
                            id="location-line"
                            fullWidth
                            value={locationLine}
                            onChange={ev => setLocationLine(ev.target.value)}
                            variant="outlined"
                            placeholder="Linie"
                        />
                    </Box>
                    <Box sx={{width: '100%'}} mt={2} mb={1}>
                      <Typography variant="h5" paragraph={true}>
                        Statie
                      </Typography>
                      <TextField
                            id="location-station"
                            fullWidth
                            value={locationStation}
                            onChange={ev => setLocationStation(ev.target.value)}
                            variant="outlined"
                            placeholder="Statie"
                        />
                    </Box>
              {/* </Box> */}
            </Box>

            <Divider/>

            <Box mt={2} mb={1}>
              <Typography variant="h5" paragraph={true}>
                Tip problema*
              </Typography>
              <Select
                id="tip-problema"
                value={specializare}
                label="Tip problema*"
                style={{width: '100%'}}
                onChange={(event) => {
                  setSpecializare(event.target.value)
                }}
              >
                {specializari.map((specializare) => 
                  <MenuItem style={{background: 'white'}} key={specializare.specializare_id} value={specializare.specializare_id}>{specializare.nume}</MenuItem>
                )}
              </Select>
            </Box>


            <Box mt={2} mb={1}>
              <Typography variant="h5" paragraph={true}>
                Ce problema doriti sa raportati?
              </Typography>
              <Typography variant="body2" color="black">
                Pentru a fi cat mai eficienti in rezolvarea problemei va rugam sa mentionati cat mai multe detalii despre incident (de exemplu: sensul de mers, numar card in cazul unui incident legat de plată etc.)*
              </Typography>
              <TextField
                  id="description"
                  multiline
                  fullWidth
                  variant="outlined"
                  value={description}
                  onChange={ev => setDescription(ev.target.value.substring(0, 300))}
                  placeholder="Furnizati o descriere cat mai detaliata*"
                  minRows={5}
              />
            </Box>

            <Box mt={2} mb={1}>
              <Typography variant="h5" paragraph={true}>
                Data si ora evenimentului
              </Typography>
              <TextField
                  id="date-time"
                  fullWidth
                  value={dateTime}
                  onChange={ev => setDateTime(ev.target.value)}
                  variant="outlined"
                  placeholder="Data si ora"
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
                  multiple={true}
                  style={{display: 'none'}}
                  id="raised-button-file"
                  type="file"
                  onChange={onUpload}
              />
              <label htmlFor="raised-button-file">
                <Button startIcon={<AddAPhoto/>} variant="outlined" size="large" component="span">
                  Adaugati max 3 fotografii
                </Button>
              </label>
            </Box>

            <Box mt={2}>
              <Collapse in={showPerson === 'da'}>
                <>
                  <Box mb={1} mt={2}>
                  <Typography variant="h5" paragraph={true}>
                    Numele si prenume*
                  </Typography>
                    <TextField
                        id="name"
                        fullWidth
                        value={userName}
                        onChange={ev => setUserName(ev.target.value)}
                        variant="outlined"
                        placeholder="Numele si prenume*"
                    />
                  </Box>

                  <Box mb={1} mt={2}>
                  <Typography variant="h5" paragraph={true}>
                    Adresa domiciliu*
                  </Typography>
                    <TextField
                        id="address"
                        fullWidth
                        value={personAddress}
                        onChange={ev => setPersonAddress(ev.target.value)}
                        variant="outlined"
                        placeholder="Adresa domiciliu*"
                    />
                  </Box>

                  <Box mb={1}>
                    <Typography variant="h5" paragraph={true}>
                      Adresa de email*
                    </Typography>
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

                  <Box mb={1}>
                    <Typography variant="h5" paragraph={true}>
                      Numar de telefon
                    </Typography>
                    <TextField
                        id="phone"
                        fullWidth
                        value={personPhone}
                        onChange={ev => setPersonPhone(ev.target.value)}
                        variant="outlined"
                        placeholder="Numar de telefon"
                    />
                  </Box>

                  <Box mb={1}>
                    <FormControlLabel 
                      control={<Checkbox id="terms" checked={termsChecked} onChange={ev => setTermsChecked(ev.target.checked)} />}
                      label="Sunt de acord cu următorii termeni și condiții:" />
                      <Typography style={{cursor: 'pointer', textDecoration: 'underline', lineHeight: '42px'}} onClick={handleOpen} variant="body1" color="black">
                        deschideți termeni și condiții
                      </Typography>
                      {/* <a style="" onClick={handleOpen} href="javascript: void(0)">deschide termeni și condiții</a> */}
                  </Box>
                </>
              </Collapse>
            </Box>
          </>
      ),
      title: 'Raport',
      canGoForward: () => description.length > 10 && !emailError && ((showPerson === 'da' && email.length > 5 && userName.length > 3 && personAddress.length > 3 && termsChecked) || showPerson === 'nu'),
      canGoBack: null
    }, {
      title: 'Status',
      content: <>
        {ticketInfo && ticketInfo?.code ? (<Box display="flex" alignItems="center" justifyContent="center" mt={6} mb={2}>
          <CheckCircleOutlinedIcon fontSize="large" color="primary" />

          <Typography align="center" variant="h5" color="primary">
            Va multumim
          </Typography>
        </Box>) : null}
        <Box  mb={6}>
          {ticketInfo && ticketInfo?.code ? (<Typography color="textSecondary" align="center">
            Sesizare #{ticketInfo?.code} a fost creata cu success
          </Typography>) : null}

          {oldTicket && oldTicket?.code ? (<Typography color="textSecondary" align="center">
            Sesizare #{oldTicket?.code} este in statusul: {oldTicket?.status === 2 ? 'rezolvata' : 'deschisa'}.<br />
            <br /><strong>Deschisa la data:</strong> {oldTicket?.created_date}
            <br /><br /><strong>Descriere:</strong>
                          {oldTicket?.text?.length ? oldTicket?.text?.split('Adresa domiciliu')[0].split('\n').map((item, key) => {
                                return <span key={key}>{item}<br/></span>
                          }) : null}

          </Typography>) : null}

          {oldTicket && oldTicket?.step > 0 && oldTicket.step_logs && oldTicket.step_logs.length ? (<Typography color="textSecondary" align="center">
            <br /><strong>Rezolutie:</strong> {oldTicket.step_logs[oldTicket.step_logs.length - 1].step_comment}
          </Typography>) : null}
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
              <Box display="flex" justifyContent="center" pt={2} pb={1}  style={{position: 'relative'}}>
                  <input type="text"
                        id="ticket_search"
                        value={searchTicketNumber}
                        onChange={ev => setSearchTicketNumber(ev.target.value)}
                        style={{position: 'absolute', width: '90px', right: 10, top: 30, height: 20, padding: 5, border: '1px solid grey', borderRadius: '4px'}}
                        placeholder="Cautare tichet"
                    />
                <Box display="flex" style={{width: '100%'}} justifyContent="left">
                  <img alt="STB" src="/sesizari/logo-stb.png" style={ { width: 126, height: 'auto', marginLeft: 15 } } />
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
                          onClick={() => setActiveStep(activeStep + 1)}>{activeStep === 1 ? 'Sesizare noua' : 'Inainte'}</Button>}
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
                  <a rel="noreferrer" href="https://www.mentdrive.ro" target="_blank">
                    <img alt="Mentdrive" src="/sesizari/logo-mentdrive.jpeg" style={{ width: 'auto', height: 60 }} />
                  </a>
                </Box>
              </Box>
            </Box>
          </Box>

          <Modal
            open={modalOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={modalStyle}>
              <TermsModal />
            </Box>
          </Modal>
        </Container>
      </ThemeProvider>
  );
}

export default App;
