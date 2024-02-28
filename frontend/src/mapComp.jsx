import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMapEvents
} from "react-leaflet";
import { blueIcon } from "./utils/icons";
import { minimalStyle } from "./utils/minimalStyle";

delete L.Icon.Default.prototype._getIconUrl;

const MapComponent = () => {
  const position = [51.515, -0.103];

  const [currentPositions, setCurrentPositions] = useState([]);
  const [fullPolylinePositions, setFullPolylinePositions] = useState([]);
  const [start, setStart] = useState();
  const [end, setEnd] = useState();
  const [first, setFirst] = useState(false);
  const [algo, setAlgo] = useState("");
  const [distance, setDistance] = useState(0);
  const [firstCoord, setfirstCoord] = useState("select start location");
  const [secondCoord, setsecondCoord] = useState("select end location");

  const getPath = () => {
    if (start && end && algo) {
      let startX = start.lng;
      let startY = start.lat;
      let endX = end.lng;
      let endY = end.lat;

      const url = `http://127.0.0.1:8000/api/get-location-data/?start_x=${startX}&start_y=${startY}&end_x=${endX}&end_y=${endY}&pathing=${algo}`;

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          setFullPolylinePositions(data.coords);
          setDistance(data.distance);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      return null;
    }
  };

  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        if (!first) {
          setfirstCoord("select start location");
          setsecondCoord("select end location");
          setDistance(0);
          setStart()
          setEnd();
          setCurrentPositions([]);
          setFullPolylinePositions([]);
          setFirst(true);
          setStart(e.latlng);
          setfirstCoord(
            `(${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)})`
          );
        } else {
          setEnd(e.latlng);
          setsecondCoord(
            `(${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)})`
          );
          setFirst(false);
        }
      },
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentPositions.length < fullPolylinePositions.length) {
        setCurrentPositions(
          fullPolylinePositions.slice(0, currentPositions.length + 1)
        );
      } else {
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [currentPositions, fullPolylinePositions]);

  const handleAlgoChange = (event) => {
    setAlgo(event.target.value);
  };

  const clearPath = () => {
    setfirstCoord("select start location");
    setsecondCoord("select end location");
    setFirst(false);
    setDistance(0);
    setCurrentPositions([]);
    setFullPolylinePositions([]);
    setStart()
    setEnd()
  };
  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <div style={minimalStyle.box}>
        <div>
          <div style={minimalStyle.text}>START: {firstCoord}</div>
          <div style={minimalStyle.text}>END: {secondCoord} </div>
          <div style={minimalStyle.text}>Distance: {Math.round(distance)}m</div>
          <select
            onChange={handleAlgoChange}
            style={{ ...minimalStyle.button, ...minimalStyle.select }}
          >
            <option value="">Select Algorithm</option>
            <option value="dijkstra">Dijkstra</option>
            <option value="bfs">BFS</option>
            <option value="dfs">DFS</option>
          </select>
        </div>
        <button
          onClick={clearPath}
          style={{ ...minimalStyle.button, ...minimalStyle.select }}
        >
          Clear
        </button>
        <button onClick={getPath} style={minimalStyle.button}>
          Find route
        </button>
      </div>
      <MapContainer
        center={position}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        {start && (
    <Marker position={[start.lat, start.lng]} icon={blueIcon}>
    </Marker>
  )}
  {end && (
    <Marker position={[end.lat, end.lng]} icon={blueIcon}>
    </Marker>
  )}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker />
        {currentPositions.length > 1 && (
          <Polyline
            pathOptions={{ color: "red" }}
            positions={currentPositions}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
