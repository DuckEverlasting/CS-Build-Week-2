import React, { useState, useRef, useEffect } from 'react';
import { Graph } from "react-d3-graph";

import { SC } from "./styles.js";


const myConfig = {
    automaticRearrangeAfterDropNode: true,
    collapsible: false,
    directed: false,
    focusAnimationDuration: 0.75,
    focusZoom: 1,
    highlightDegree: 1,
    highlightOpacity: 1,
    linkHighlightBehavior: true,
    maxZoom: 5,
    minZoom: 0.1,
    nodeHighlightBehavior: true,
    panAndZoom: false,
    staticGraph: true,
    staticGraphWithDragAndDrop: true,
    d3: {
      alphaTarget: 0,
      gravity: -400,
      linkLength: 180,
      linkStrength: 1
    },
    node: {
      color: "#d3d3d3",
      fontColor: "black",
      fontSize: 12,
      fontWeight: "normal",
      highlightColor: "SAME",
      highlightFontSize: 12,
      highlightFontWeight: "bold",
      highlightStrokeColor: "blue",
      highlightStrokeWidth: "SAME",
      mouseCursor: "pointer",
      opacity: 1,
      renderLabel: true,
      size: 50,
      strokeColor: "none",
      strokeWidth: 2,
      svg: "",
      symbolType: "circle"
    },
    link: {
      fontColor: "black",
      fontSize: 12,
      fontWeight: "normal",
      highlightColor: "blue",
      highlightFontSize: 8,
      highlightFontWeight: "bold",
      labelProperty: "label",
      mouseCursor: "pointer",
      opacity: 1,
      renderLabel: true,
      semanticStrokeWidth: true,
      strokeWidth: 1.5
    }
  };

  

export default function Map({graph}) {
    const [currentRoom, setCurrentRoom] = useState({id: null})
    const [dispGraph, setDispGraph] = useState("")
    const [rectCoord, setRectCoord] = useState({
        height: 0,
        width: 0
    });

    const mapRef = useRef(null);

    const onClickNode = function(nodeId) {
        setCurrentRoom(graph[nodeId])
    };
    
    useEffect(() => {
        makeGraph()
    }, []);

    const makeGraph = () => {
        const coord = mapRef.current.getBoundingClientRect();
        console.log(coord)

        setRectCoord({
        height: coord.height,
        width: coord.width
        });

        const south_links = Object.keys(graph).filter(room => graph[room].s_to && graph[room].s_to !== "?").map(
            link => ({ source: parseInt(graph[link].id), target: parseInt(graph[link].s_to) })
        );

        const east_links = Object.keys(graph).filter(room => graph[room].e_to && graph[room].e_to !== "?").map(
            link => ({ source: parseInt(graph[link].id), target: parseInt(graph[link].e_to) })
        );

        const colors = {
            "NORMAL": "#777777",
            "TRAP": "ff0000"
        }

        const newGraph = {
        nodes: [
            ...Object.keys(graph).map(room => {
                room = graph[room]
                let roomCoord = room.coord.substring(1, room.coord.length - 1).split(",")
                return {
                    id: room.id,
                    x: roomCoord[0] * (coord.width / 10) - 6 * coord.width,
                    y: roomCoord[1] * -(coord.width / 10) + 8 * coord.height,
                    size: coord.width / 3,
                    color: "#777777",
                    symbolType: "square"
                }
            }),
        ],
        links: [...south_links, ...east_links]
        };

        setDispGraph(newGraph)
    }

    return (
        <SC.MapWindow>
            <SC.MapBox ref={mapRef}>
                {
                    dispGraph &&
                    <Graph
                        id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
                        data={dispGraph}
                        config={{
                            ...myConfig,
                            height: rectCoord.height,
                            width: rectCoord.width - 10
                        }}
                        onClickNode={onClickNode}
                    />
                }
            </SC.MapBox>
            <SC.RoomBox>
                {
                    currentRoom.id !== null &&
                    <div>
                        <p>ID: {currentRoom.id}</p>
                        <p>COORDINATES: {currentRoom.coord}</p>
                        <p>TITLE: {currentRoom.title}</p>
                        <p>DESC: {currentRoom.desc}</p>
                        <p>PLAYERS: {currentRoom.players.slice(0, 5).map((player, i) => <span key={i}>{player}, </span>)}</p>
                        <p>ITEMS: {currentRoom.items}</p>
                        <p>EXITS: {currentRoom.exits}</p>
                    </div>
                }
            </SC.RoomBox>
        </SC.MapWindow>
    )
}