const axios = require('axios');

function createEmbed(file_path_display) {
    const accessToken = 'sl.BlwOiNawd3-n2fP6fGu5ydiyf8ML-UG9DgEnJXNBPM3LcYm3690y4c8KPSBZn-7k6DALXi6IR0hN4lKdosh141p8DlBhJncjoyUMFRWiTvmHFi_OWvK6G-890adqeHMFIRA9F9ybvdftZCvO4FPvGLo';
    const apiEndpoint = 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings';
    const headers = {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
    };
    
    const requestData = {
        path: file_path_display
    };
    
    axios.post(apiEndpoint, requestData, { headers })
    .then(response => {
        const embedLink = response.data.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
        console.log("Tautan Embed: ", embedLink);
    })
    .catch(error => {
        console.error("Terjadi kesalahan:", error);
    });
}