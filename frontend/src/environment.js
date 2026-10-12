
let IS_PROD = true;
const server = IS_PROD ?
    // "https://apnacollegebackend.onrender.com" :
    `${process.env.REACT_APP_BACKEND_URL}`: 

    `${process.env.REACT_APP_LOCAL_HOST}`


export default server;