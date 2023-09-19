import React, {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
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
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {createTheme, ThemeProvider, styled, responsiveFontSizes} from '@mui/material/styles';
import AddAPhoto from '@mui/icons-material/AddAPhoto';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import RoomIcon from '@mui/icons-material/Room';
import Modal from '@mui/material/Modal';
import { useAuth } from 'oidc-react';
import {GoogleMap, Marker, withGoogleMap, withScriptjs} from "react-google-maps";
import { defaultLogin, login, loginWithOpenId, loadBeneficiar, getUserInfo, loadAsset, loadLocatie, 
    createTicket, uploadTicketImg, searchTicketByCode, loadLocations, 
    loadAssetsByLocation, loadComponentsByAssetId, loadSpecializari} from './api/backend';
import TermsModal from './TermsModal';
import './styles.css';
import queryString from 'query-string';
import LocationsTree from './LocationsTree';

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
      main: '#2d8ab9',
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

  const [activeStep, setActiveStep] = useState(1);
  const [showPerson, setShowPerson] = useState(process.env.REACT_APP_REQUIRE_LOGIN !== 'yes' ? "da" : "nu");
  const [location, setLocation] = useState('');
  const [latLong, setLatLong] = useState([46.770302, 23.578357]);
  const [files, setFiles] = useState([]);
  const [setupOk, setSetupOk] = useState(false);
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [searchTicketNumber, setSearchTicketNumber] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [assetId, setAssetId] = useState(null);
  const [componentId, setComponentId] = useState(null);
  const [specializareId, setSpecializareId] = useState(null);
  const [locationId, setLocationId] = useState(null);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [oldTicket, setOldTicket] = useState(null);
  const [termsChecked, setTermsChecked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [beneficiar, setBeneficiar] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [passwordError, setPasswordError] = useState(false);
  const [password, setPassword] = useState('');
  const [dynamicFieldsData, setDynamicFieldsData] = useState({});
  const [isErrorForDynamicField, setIsErrorForDynamicField] = useState(false);
  const [locationList, setLocationList] = useState([]);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [assetList, setAssetList] = useState([]);
  const [componentList, setComponentList] = useState([]);
  const [specializariList, setSpecializariList] = useState([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [urgentLabel, setUrgentLabel] = useState('');

  const oauth = useAuth();

  const setDataForDynamicField = (fieldName, value) => {
    setDynamicFieldsData({
      ...dynamicFieldsData,
      [fieldName]: value
    });
  }

  const setComplexDataForDynamicField = (fieldName, path, value) => {
    setDynamicFieldsData({
      ...dynamicFieldsData,
      [fieldName]: {
        ...(dynamicFieldsData[fieldName] || {}),
        [path]: value
      }
    });
  }

  const toggleValueFromDynamicField = (fieldName, value) => {
    const values = dynamicFieldsData[fieldName] || [];

    if (values.includes(value)) {
      setDataForDynamicField(fieldName, values.filter(val => val !== value))
    } else {
      setDataForDynamicField(fieldName, [...new Set([ ...values, value])])
    }
  }

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

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

  const updateLocation = (newLocationId) => {
    const locationData = locationList.find(loc => loc.locatie_id === parseInt(newLocationId, 10))
    setLocation(locationData.nume);
    setLocationId(locationData.locatie_id);
    setShowAllLocations(false);
    setAssetId(null);
  }

  useEffect(() => {
    const loadAssets = async () => {
      const data = await loadAssetsByLocation(locationId);

      setAssetList(data);
    }

    if (locationId >= 0) {
      loadAssets();
    }
  }, [locationId]);

  useEffect(() => {
    const loadComponents = async () => {
      setComponentId(null);
      const comp = await loadComponentsByAssetId(assetId);

      setComponentList(comp);
    }

    if (assetId >= 0) {
      loadComponents();
    }
  }, [assetId]);

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
      const res = await createTicket(description, assetId, locationId, latLong[0], latLong[1], email, userName, componentId, specializareId, isUrgent ? 3 : 2, dynamicFieldsData);

      if (res && res.ticket_id) {
        setTicketInfo(res);
        setOldTicket(null);
        setDescription('');
        setUserName('');
        setEmail('');
        setShowPerson('da');
        setDynamicFieldsData({});
        setAssetId(null);
        setComponentId(null);
        setSpecializareId(null);
        setTermsChecked(false);
        setIsUrgent(false);
        if (fileToUpload) {
          await uploadTicketImg(res.ticket_id, fileToUpload);
        }
      }
    }
    if (activeStep === 2 && !ticketInfo) {
      submit();
    }
    if (activeStep !== 2) {
      setOldTicket(null);
      setSearchTicketNumber('');
    }

    // eslint-disable-next-line
  }, [activeStep]);

  useEffect(() => {
    if (beneficiar && beneficiar.screen_config_metadata && beneficiar.screen_config_metadata.length) {
      const fields = beneficiar.screen_config_metadata.filter(field => field.entitate === "ticket");
      if (fields.length) {
        let isError = false;
        fields.forEach(elem => {
          if (elem.required && !dynamicFieldsData[elem.camp]) {
            setIsErrorForDynamicField(true);
            isError = true;
          }

          if (elem.type === 'label' && elem.camp === 'level') {
            setUrgentLabel(elem.label);
          }
        });

        if (!isError) {
          setIsErrorForDynamicField(false);
        }
      }
    }
  }, [beneficiar, dynamicFieldsData]);

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

  const loginUser = async () => {
    if (email && email.length && password && password.length) {
      const loginData = await login(email, password);
      if (loginData && loginData.success) {
        const beneficiarData = await loadBeneficiar();
        setBeneficiar(beneficiarData);
        setCurrentUser(loginData);
        setSetupOk(true);
        setEmail('');
      } else {
        alert("Invalid login");
      }
    }
  }

  useEffect(() => {
    const autoLoginWithOpenId = async (token) => {
      const loginData = await loginWithOpenId(token);
      if (loginData && loginData.success) {
        const beneficiarData = await loadBeneficiar();
        setBeneficiar(beneficiarData);
        setCurrentUser(loginData);
        setSetupOk(true);
        setEmail('');
      } else {
        alert("Invalid login");
      }
    }
    if (oauth.userData && oauth.userData.access_token) {
      autoLoginWithOpenId(oauth.userData.access_token);
    }
  }, [oauth.userData]);

  useEffect(() => {
    const parsed = queryString.parse(window.location.search);
    const setup = async () => {
      
      if (!currentUser) {
        if (process.env.REACT_APP_REQUIRE_LOGIN === 'yes') {
          const beneficiarData = await loadBeneficiar();

          if (beneficiarData && beneficiarData.success === false && beneficiarData.sessionTimeout) {
            setNeedsLogin(true);
            return;
          } else {
            const userInfo = await getUserInfo();
            setBeneficiar(beneficiarData);
            setCurrentUser(userInfo);
            setSetupOk(true);
          }
        } else {
          const loginData = await defaultLogin();
          if (loginData) {
            setCurrentUser(loginData);
            setSetupOk(true);
          }
        }

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
      } else if (currentUser && currentUser.locatie_id) {
        const location = await loadLocatie(currentUser.locatie_id);
        if (location && location.nume) {
          setLocation(location.nume);
          setLocationId(location.locatie_id);
          
          if (location.lat && location.lon) {
            setLatLong([parseFloat(location.lat), parseFloat(location.lon)]);
          }
        }
      }

      setLocationList(await loadLocations());

      setSpecializariList(await loadSpecializari());
    }
    
    setup();
  }, [currentUser]);

  useEffect(() => {
    const search = async () => {
      const resp = await searchTicketByCode(searchTicketNumber);
      if (resp && resp.list && resp.list.length) {
        setOldTicket(resp.list[0]);
        setActiveStep(2);
        setTicketInfo(null);
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

                <Button size="small" onClick={() => setActiveStep(0)}>Modifică Locația</Button>
              </Box>
            </Box>

            <Divider/>

            {
              locationList.length > 0 && (<Box mt={2} mb={1}>
                <Typography variant="h5" paragraph={true} onClick={() => setShowAllLocations(true)}>
                  Selectați locația
                </Typography>
                
                {showAllLocations ? (
                  <Collapse in={showAllLocations}>
                    <FormControlLabel control={<Checkbox
                        value={beneficiar.locatie_id}
                        checked={beneficiar.locatie_id === locationId}
                        onChange={ev => updateLocation(ev.target.value)}
                    />} label={location} />
                    <div style={{paddingLeft: '20px'}}>
                      <LocationsTree locationList={locationList} rootParent={currentUser.locatie_id || 0} selectedLocationId={locationId} setLocationField={updateLocation}  />
                    </div>
                  </Collapse>
                ) : (
                  <>
                      <TextField
                        id="locationfield"
                        fullWidth
                        variant="outlined"
                        value={location}
                        onClick={ev => setShowAllLocations(true)}
                        placeholder={location}
                    />
                  </>
                )}
              </Box>)
            }

            {
              assetList.length > 0 && (
                <Box mt={2} mb={1}>
                  <Typography variant="h5" paragraph={true}>
                    Selectați camera/echipamentul:
                  </Typography>
                  <Select
                    id={'assetId'}
                    fullWidth
                    name={'assetId'}
                    error={!assetId}
                    required={true}
                    value={assetId}
                    placeholder={'Selectați camera/echipamentul:'}
                    onChange={ev => setAssetId(ev.target.value)}
                  >
                    {(assetList || []).map(asset => <MenuItem style={{background: 'white'}} key={asset.asset_id} value={asset.asset_id}>{asset.nume}</MenuItem>)}
                  </Select>
                </Box>
              )
            }

            {
              assetList.length > 0 && componentList.length > 0 && (
                <Box mt={2} mb={1}>
                  <Typography variant="h5" paragraph={true}>
                    Selectați componenta
                  </Typography>
                  <Select
                    id={'componentId'}
                    fullWidth
                    name={'componentId'}
                    required={false}
                    value={componentId}
                    placeholder={'Selectați componenta'}
                    onChange={ev => setComponentId(ev.target.value)}
                  >
                    {(componentList || []).map(component => <MenuItem style={{background: 'white'}} key={component.component_id} value={component.component_id}>{component.component_description}</MenuItem>)}
                  </Select>
                </Box>
              )
            }

            {
              specializariList.length > 0 && (
                <Box mt={2} mb={1}>
                  <Typography variant="h5" paragraph={true}>
                    Selectați specializarea:
                  </Typography>
                  <Select
                    id={'specializareId'}
                    fullWidth
                    name={'specializareId'}
                    required={true}
                    value={specializareId}
                    placeholder={'Selectați specializarea'}
                    onChange={ev => setSpecializareId(ev.target.value)}
                  >
                    {(specializariList || []).map(spec => <MenuItem style={{background: 'white'}} key={spec.specializare_id} value={spec.specializare_id}>{spec.nume}</MenuItem>)}
                  </Select>
                </Box>
              )
            }

            <Box mt={2} mb={1}>
              <FormControl sx={{ m: 3 }} error={isUrgent && urgentLabel.length > 0} variant="standard">
                <Typography variant="h5" paragraph={true}>
                  Urgență?
                  &nbsp;&nbsp;&nbsp;
                  <FormControlLabel control={<Checkbox
                          value={isUrgent}
                          checked={isUrgent}
                          onChange={ev => setIsUrgent(!isUrgent)}
                      />} label={'Da'} />
                </Typography>
                {isUrgent && urgentLabel && urgentLabel.length && (<FormHelperText sx={{ whiteSpace: 'pre-line'}}>{urgentLabel}</FormHelperText>)}
              </FormControl>
            </Box>

            <Box mt={2} mb={1}>
              <Typography variant="h5" paragraph={true}>
                Ce doriți să raportați?
              </Typography>
              <TextField
                  id="description"
                  multiline
                  fullWidth
                  variant="outlined"
                  value={description}
                  onChange={ev => setDescription(ev.target.value)}
                  placeholder="Furnizați o descriere cât mai detaliată*"
                  minRows={5}
              />
            </Box>

            {beneficiar && beneficiar.screen_config_metadata && beneficiar.screen_config_metadata.length && 
              beneficiar.screen_config_metadata.filter(field => field.entitate === "ticket").sort((a, b) => a.order - b.order).map(field => {
                if (field.type === "text") {
                  return (<Box key={`${field.camp}${field.label}`} mt={2} mb={1}><TextField
                      id={field.camp}
                      fullWidth
                      error={dynamicFieldsData && isErrorForDynamicField && field.required && !dynamicFieldsData[field.camp]}
                      name={field.camp}
                      value={dynamicFieldsData && dynamicFieldsData[field.camp]}
                      onChange={ev => setDataForDynamicField(field.camp, ev.target.value)}
                      variant="outlined"
                      placeholder={`${field.label}${field.required ? '*' : ''}`}
                  /></Box>);
                }

                if (field.type === "textarea") {
                  return (<Box key={`${field.camp}${field.label}`} mt={2} mb={1}><TextField
                      id={field.camp}
                      fullWidth
                      multiline
                      error={dynamicFieldsData && isErrorForDynamicField && field.required && !dynamicFieldsData[field.camp]}
                      value={dynamicFieldsData && dynamicFieldsData[field.camp]}
                      onChange={ev => setDataForDynamicField(field.camp, ev.target.value)}
                      variant="outlined"
                      minRows={5}
                      required={field.required}
                      name={field.camp}
                      placeholder={`${field.label}${field.required ? '*' : ''}`}
                  /></Box>);
                }

                if (field.type === "select") {
                  return (<Box key={`${field.camp}${field.label}`} mt={2} mb={1}><Select
                    id={field.camp}
                    fullWidth
                    name={field.camp}
                    error={dynamicFieldsData && isErrorForDynamicField && field.required && !dynamicFieldsData[field.camp]}
                    required={field.required}
                    value={dynamicFieldsData && dynamicFieldsData[field.camp]}
                    placeholder={`${field.label}${field.required ? '*' : ''}`}
                    onChange={ev => setDataForDynamicField(field.camp, ev.target.value)}
                  >
                    {(field.options || []).map(opt => <MenuItem style={{background: 'white'}} key={opt} value={opt}>{opt}</MenuItem>)}
                  </Select></Box>);
                }

                if (field.type === "radio") {
                  return (<Box key={`${field.camp}${field.label}`} mt={2} mb={1}>
                      <FormLabel id={field.camp}>{field.label}{field.required ? '*' : ''}</FormLabel>
                      <RadioGroup
                        aria-labelledby={field.camp}
                        name={field.camp}
                        required={field.required}
                        error={dynamicFieldsData && isErrorForDynamicField && field.required && !dynamicFieldsData[field.camp]}
                        value={dynamicFieldsData && dynamicFieldsData[field.camp]}
                        onChange={ev => setDataForDynamicField(field.camp, ev.target.value)}
                      >
                        {(field.options || []).map(opt => <FormControlLabel key={opt} control={<Radio />} value={opt} label={opt} />)}
                      </RadioGroup>
                  </Box>);
                }

                if (field.type === "checkbox") {
                  return (<Box key={`${field.camp}${field.label}`} mt={2} mb={1}>
                      <FormLabel fullWidth id={field.camp}>{field.label}{field.required ? '*' : ''}</FormLabel>
                      <FormGroup>
                      {(field.options || []).map(opt => <FormControlLabel key={opt} required={field.required} control={<Checkbox 
                          value={opt}  fullWidth
                          checked={dynamicFieldsData && dynamicFieldsData[field.camp] && dynamicFieldsData[field.camp].length && dynamicFieldsData[field.camp].includes(opt)}
                          onChange={ev => toggleValueFromDynamicField(field.camp, ev.target.value)}
                        />} label={opt} />)}
                      </FormGroup>
                  </Box>);
                }

                if (field.type === "start-end-date") {
                  return (<Box key={`${field.camp}${field.label}`} mt={2} mb={1}>
                    <FormLabel id={field.camp}>{field.label}{field.required ? '*' : ''}</FormLabel>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          id={field.camp}
                          fullWidth
                          required={field.required}
                          error={dynamicFieldsData && isErrorForDynamicField && field.required && !dynamicFieldsData[field.camp]}
                          name={field.camp}
                          value={dynamicFieldsData && dynamicFieldsData[field.camp] && dynamicFieldsData[field.camp].start_date}
                          onChange={ev => setComplexDataForDynamicField(field.camp, 'start_date', ev.target.value)}
                          variant="outlined"
                          placeholder={`${field.label}${field.required ? '*' : ''}`}
                          type='date'
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          id={`${field.camp}-end`}
                          fullWidth
                          required={field.required}
                          error={dynamicFieldsData && isErrorForDynamicField && field.required && !dynamicFieldsData[field.camp]}
                          name={`${field.camp}-end`}
                          value={dynamicFieldsData && dynamicFieldsData[field.camp] && dynamicFieldsData[field.camp].end_date}
                          onChange={ev => setComplexDataForDynamicField(field.camp, 'end_date', ev.target.value)}
                          variant="outlined"
                          placeholder={`${field.label}${field.required ? '*' : ''}`}
                          type='date'
                        />
                      </Grid>
                    </Grid>
                  </Box>);
                }

                return null;
              })}

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
                  Adăugați fotografii
                </Button>
              </label>
            </Box>

            {process.env.REACT_APP_REQUIRE_LOGIN !== 'yes' ? (
                <Box mt={2}>
                  <Typography variant="h5" paragraph={true}>
                    Doriți să va trimitem informații despre raport?
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
            ) : null}
                <Box mb={1} mt={3}>
                  <FormControlLabel 
                    control={<Checkbox id="terms" checked={termsChecked} onChange={ev => setTermsChecked(ev.target.checked)} />}
                    label="Sunt de acord cu următorii termeni și condiții:" />
                    <Typography style={{cursor: 'pointer', textDecoration: 'underline', lineHeight: '42px'}} onClick={handleOpen} variant="body1" color="black">
                      deschideți termeni și condiții
                    </Typography>
                    {/* <a style="" onClick={handleOpen} href="javascript: void(0)">deschide termeni și condiții</a> */}
                </Box>
          </>
      ),
      title: 'Raport',
      canGoForward: () => description.length > 10 && !isErrorForDynamicField && !emailError && termsChecked && ((showPerson === 'da' && email.length > 5 && userName.length > 3) || showPerson === 'nu'),
      canGoBack: () => true,
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
            <br /><br /><strong>Descriere:</strong> {oldTicket?.text}
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
                {setupOk ? <input type="text"
                        id="ticket_search"
                        value={searchTicketNumber}
                        onChange={ev => setSearchTicketNumber(ev.target.value)}
                        style={{position: 'absolute', width: '90px', right: 10, top: 30, height: 20, padding: 5, border: '1px solid grey', borderRadius: '4px'}}
                        placeholder="Cautare tichet"
                    /> : null }
                <Box display="flex" style={{width: '100%'}} justifyContent="left">
                  <img alt="Universitatea Tehnica Gheorghe Asachi Iasi" src="/sesizari/universitatea-logo.jpeg" style={ { height: 100, width: 'auto', marginLeft: 15 } } />
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
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  {needsLogin ? (
                    <Box  style={{ maxWidth: '250px', width: '80%' }} display="flex" flexDirection={'column'} justifyContent="center">
                      
                        <Box mb={1}>
                          <TextField
                              id="email"
                              fullWidth
                              error={emailError}
                              value={email}
                              onChange={ev => setEmail(ev.target.value)}
                              onBlur={() => setEmailError(email.length < 3)}
                              variant="outlined"
                              placeholder="Adresa de email*"
                          />
                        </Box>

                        <Box mb={1}>
                          <TextField
                              id="password"
                              fullWidth
                              type='password'
                              error={passwordError}
                              value={password}
                              onChange={ev => setPassword(ev.target.value)}
                              onBlur={() => setPasswordError(password.length < 3)}
                              variant="outlined"
                              placeholder="Parola*"
                          />
                        </Box>

                        <Box mb={1}>
                          <Button variant="contained" color="primary" disabled={emailError || passwordError}
                            onClick={() => loginUser()}>Log in</Button>
                        </Box>
                        <div style={{ height: '100px' }}></div>
                    </Box>
                  ) : (
                    <Typography color="textSecondary" align="center">
                      Avem probleme in comunicarea cu serverul. Va rugam incercati mai tarziu.
                    </Typography>
                  )}
                </div>
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
                  <img alt="Mentdrive" src="/sesizari/logo-mentdrive.jpeg" style={{ width: 'auto', height: 106 }} />
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
