import axios from "axios";

let isRefreshing = false;
let failedQueue = [];

const api = axios.create({
  baseURL: "http://localhost:4000",
  // withCredentials:true//quitar comentario cuando se implemente el auth
});

export default api;
