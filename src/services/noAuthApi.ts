import axios from "axios";
import { settings } from "@/settings";

const noAuthApi = axios.create({
  baseURL: settings.apiUrl,
  timeout: 10_000,
  allowAbsoluteUrls: false,
});

export { noAuthApi };
export default noAuthApi;
