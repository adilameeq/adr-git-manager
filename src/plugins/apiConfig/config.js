import axios from "axios";
const BASE_URL_USER = "https://api.github.com/user";
const BASE_URL_REPO = "https://api.github.com/repos";
const setHeaders = () => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage?.getItem("authId")}`;
};
export { BASE_URL_REPO, BASE_URL_USER, setHeaders };


// var headers = new Headers();
// var bearer = "Bearer " + tokenResponse.accessToken;
// headers.append("Authorization", bearer);
// var options = {
//         method: "GET",
//         headers: headers
// };
// var graphEndpoint = "https://graph.microsoft.com/v1.0/me";

// fetch(graphEndpoint, options)
//     .then(resp => {
//         //do something with response
//     });