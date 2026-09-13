import axios from "axios";
import { settings } from "@/settings";

const exampleApi = axios.create({
  baseURL: settings.exampleApiUrl,
  timeout: 10_000,
  allowAbsoluteUrls: false,
});

export default exampleApi;
