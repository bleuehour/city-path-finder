import L from "leaflet";

export const blueIcon = new L.Icon({
  iconUrl: require("leaflet/dist/images/marker-icon-2x.png"), // Make sure you have a blue marker icon
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});