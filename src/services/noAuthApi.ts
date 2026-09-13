import { API_URL } from "@/settings";
import axios from "axios";

const noAuthApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export default noAuthApi;
