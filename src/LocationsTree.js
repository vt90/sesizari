import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

const LocationsTree = ({locationList, rootParent = 0, selectedLocationId = null, setLocationField}) => {
    const getLocationByParent = (parentId) => {
        return (locationList || [])
            .filter(location => location.parent_id === parentId)
            .sort((a, b) => a.nume.localeCompare(b.nume))
    }



    return (<div>
        {getLocationByParent(rootParent).map(location => (
            <div key={location.locatie_id} className="location-item">
                <FormControlLabel control={<Checkbox
                    value={location.locatie_id} 
                    checked={location.locatie_id === selectedLocationId}
                    onChange={ev => setLocationField(ev.target.value)}
                />} label={location.nume} />
                {
                    getLocationByParent(location.locatie_id).length > 0 && (
                        <div style={{paddingLeft: '20px'}}>
                            <LocationsTree 
                                locationList={locationList} 
                                rootParent={location.locatie_id} 
                                setLocationField={setLocationField}
                                selectedLocationId={selectedLocationId}
                            />
                        </div>
                    )
                }
            </div>
        ))}
    </div>);
}

export default LocationsTree;