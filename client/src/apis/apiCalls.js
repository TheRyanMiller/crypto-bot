import axios from 'axios';

const api = () => {

    //Setup axios instance
    let baseUrl = window.location.href.substr(0,window.location.href.lastIndexOf("/"));
    let port = window.location.port;
    if(port != ""){
        baseUrl = baseUrl.substr(0,baseUrl.indexOf(":"+port));
    }
    baseUrl = baseUrl + ":" + process.env.REACT_APP_API_PORT + "/api";
    
    let restApi = axios.create({
        baseURL: baseUrl,
        timeout: 10000
    });

    //If access-token is available in storage, setup request interceptor on our instance
    if(localStorage.getItem("jwt-access-token")){
        restApi.interceptors.request.use(config => {
            config.headers.Authorization = "Bearer "+localStorage.getItem("jwt-access-token");
            config.headers['Content-Type'] = 'application/json';
            return config
        })
    }

    restApi.interceptors.response.use((response) => {
        return response //Let normal responses pass through
    }, (error) => {
        if (error.response.status === 401 || error.response.status === 403) {
            localStorage.removeItem("jwt-refresh-token");
            localStorage.removeItem("jwt-access-token");
            window.location.href="/login";
    }});

    return restApi;
}

export { api };