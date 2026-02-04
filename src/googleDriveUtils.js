/**
 * Utility for Google Drive interactions
 */

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file';

let tokenClient;
let gapiInited = false;
let gisInited = false;

export const initGoogleDrive = (clientId, callback) => {
    const checkGapi = () => {
        if (window.gapi) {
            window.gapi.load('client', async () => {
                await window.gapi.client.init({
                    discoveryDocs: [DISCOVERY_DOC],
                });
                gapiInited = true;
                checkInited(callback);
            });
        } else {
            setTimeout(checkGapi, 100);
        }
    };

    const checkGis = () => {
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: SCOPES,
                callback: '', // defined later in requestAccessToken
            });
            gisInited = true;
            checkInited(callback);
        } else {
            setTimeout(checkGis, 100);
        }
    };

    const checkInited = (cb) => {
        if (gapiInited && gisInited && typeof cb === 'function') cb();
    };

    checkGapi();
    checkGis();
};

export const requestAccessToken = (callback) => {
    if (!tokenClient) {
        throw new Error('Google Drive SDK no ha inicializado correctamente. Por favor, recarga la página.');
    }

    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        callback(resp);
    };

    if (window.gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
};

export const findDbFile = async (filename = 'yaifinanzas_db.json') => {
    const response = await window.gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        q: `name = '${filename}'`,
        fields: 'files(id, name)',
    });
    const files = response.result.files;
    return files && files.length > 0 ? files[0] : null;
};

export const saveDbFile = async (data, existingFileId = null, filename = 'yaifinanzas_db.json') => {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = 'application/json';
    const metadata = {
        'name': filename,
        'mimeType': contentType,
        ...(existingFileId ? {} : { 'parents': ['appDataFolder'] })
    };

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n\r\n' +
        JSON.stringify(data) +
        close_delim;

    const request = window.gapi.client.request({
        'path': existingFileId ? `/upload/drive/v3/files/${existingFileId}` : '/upload/drive/v3/files',
        'method': existingFileId ? 'PATCH' : 'POST',
        'params': { 'uploadType': 'multipart' },
        'headers': {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody
    });

    return await request.execute();
};

export const readDbFile = async (fileId) => {
    const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
    });
    return response.result;
};
