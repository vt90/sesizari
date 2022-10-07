import axios from 'axios';
import FormData from 'form-data';

export const apiCall = async (url, data) => {
    var finalUrl = url.indexOf('://')>=0 ? url : process.env.REACT_APP_CONFIG_URL + url;

    try {
        const response = await axios.post(finalUrl, JSON.stringify(data), {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    
        if (response.statusText === 'OK') {
            return response.data;
        }
        return null;
    } catch (err) {
        return null;
    }
}

export const loadTickets = async () => {
    return await apiCall('/loadTickets.do');
}

export const loadSpecializari = async () => {
    return await apiCall('/loadSpecializari.do');
}

export const searchTicketByCode = async (code) => {
    return await apiCall('/loadTickets.do', {
        code,
        page_number: 0,
        page_size: 1,
    });
}

export const loadAsset = async (assetId) => {
    const asset = await apiCall('/loadAsset.do', {asset_id: assetId});
    const location = await apiCall('/loadLocatie.do', {locatie_id: asset.locatie_id});
    
    return {asset, location};
}

export const loadAllAssets = async (assetId) => {
    const result =  await apiCall('/loadAssets.do', {asset_id: assetId});
    if (result && result.total && result.list) {
        return result.list;
    }
    return [];
}

export const loadLocatie = async (locationId) => {
    return await apiCall('/loadLocatie.do', {locatie_id: locationId});
}

export const createTicket = async (description, assetId, locationId, lat, long, email, userName, specializare, token = "") => {
    if (description.length && (assetId || locationId) && lat && long) {
        const data = {
            token: token,
            status: 1,
            text: description,
            latitude: lat,
            longitude: long,
            ...(specializare ? {specializare_id: specializare} : {}),
            ...(assetId ? {asset_id: assetId} : {}),
            ...(locationId ? {locatie_id: locationId} : {}),
            ...(email ? {email_guest: email} : {}),
            ...(userName ? {name_guest: userName} : {}),
        }

        return await apiCall('/saveTicket.do', data); 
    }
}

export const uploadTicketImg = async (ticket, file, index = 0) => {
    let data = new FormData();
    data.append('ticket_id', `${ticket}${parseInt(index, 10) !== 0 ? `_i_${index}` : ''}`);
    data.append('file', file);

    const url = '/uploadTicketImage.do';
    const finalUrl = url.indexOf('://')>=0 ? url : process.env.REACT_APP_CONFIG_URL + url;

    try {
        const resp = await axios.post(finalUrl, data, {
            headers: {
              'accept': 'application/json',
              'Accept-Language': 'en-US,en;q=0.8',
              'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            }
        });
        return resp;
    } finally {
        return null;
    }
}

export const defaultLogin = async () => {
    return await login(process.env.REACT_APP_DEFAULT_USERNAME, process.env.REACT_APP_DEFAULT_PASS);
}

export const login  = async (username, password) => {
    var authdata = Buffer.from(password).toString('base64');
    const response = await apiCall('/userLogin.do', {
        'username': username,
        'password': authdata
    });

    return response;
}