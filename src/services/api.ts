import { API_URL } from "@/settings";
import axios from "axios";
import { useNavigate } from "react-router";

// Essa implementação não foi totalmente testada, apenas simulada.

let isRefreshing = false; // Variável para controlar se o token está sendo renovado
let refreshSubscribers: any = []; // Fila para armazenar as requisições enquanto o token é renovado

// Função para notificar todas as requisições pendentes que o token foi renovado
const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((callback: Function) => callback(newToken));
  refreshSubscribers = []; // Limpa a fila
};

// Função para adicionar uma requisição pendente à fila
const addSubscriber = (callback: Function) => {
  refreshSubscribers.push(callback);
};

// Função para verificar se o JWT está expirado
const isTokenExpired = (token: string) => {
  if (!token) return true;

  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) return true;

  const payload = atob(tokenParts[1]);
  const parsedPayload = JSON.parse(payload);
  const currentTime = Date.now() / 1000;
  return parsedPayload.exp < currentTime;
};

// Função para tentar fazer o refresh do token
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token available.");

    const response = await axios.post("https://api.example.com/auth/refresh", {
      refresh_token: refreshToken,
    });

    const { access_token } = response.data;
    localStorage.setItem("access_token", access_token);
    return access_token;
  } catch (error) {
    throw new Error("Failed to refresh token.");
  }
};

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor de requisição
api.interceptors.request.use(
  async (config) => {
    let accessToken = localStorage.getItem("access_token");

    if (accessToken && isTokenExpired(accessToken)) {
      if (!isRefreshing) {
        // Se o token não está sendo renovado, inicia a renovação
        isRefreshing = true;
        try {
          const newToken = await refreshAccessToken();
          isRefreshing = false;
          onRefreshed(newToken); // Notifica todas as requisições pendentes
          config.headers["Authorization"] = `Bearer ${newToken}`;
        } catch (error) {
          isRefreshing = false;
          refreshSubscribers = []; // Limpa a fila no caso de erro
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

          window.location.href = "/login";
          return Promise.reject("Token refresh failed, user logged out.");
        }
      } else {
        // Se o token já está sendo renovado, adiciona a requisição à fila
        return new Promise((resolve) => {
          addSubscriber((newToken: string) => {
            config.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(config);
          });
        });
      }
    } else if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    } else {
      window.location.href = "/login";

      return Promise.reject("No token found, user needs to log in.");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
