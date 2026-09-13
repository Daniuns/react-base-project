import axios from "axios";
import { settings } from "@/settings";

const tibiaWikiApi = axios.create({
  baseURL: settings.tibiaWikiApiUrl,
  timeout: 15_000,
  allowAbsoluteUrls: false,
});

export default tibiaWikiApi;
