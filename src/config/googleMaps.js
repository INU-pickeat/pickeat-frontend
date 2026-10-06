export const googleMapsLoaderOptions = {
  id: "google-map-script",
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
  language: "ko",
  region: "KR",
  libraries: ["places"],
};
