import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

import { SC } from './styles.js';
import { wait } from './helpers.js';
import Map from './Map.js';
import Player from './player.js';
import mine from './miner.js';

import { graphJSON } from './graphJSON.js';

let player;

const url = 'https://lambda-treasure-hunt.herokuapp.com/api/adv/';
// const url = 'http://127.0.0.1:8000/api/adv/';

const token = 'adbb3be65a8b4e64504bd62d6df3f0d7328de7b1';
// const token = '31bf8b29565fdf5493777ccfd2ae4e222e97a40b';

axios.interceptors.request.use(
    options => {
        options.headers.authorization = `Token ${token}`;
        return options;
    },
    err => {
        // do something with the error
        return Promise.reject(err);
    }
);

function App() {
    const [cd, setCd] = useState([]);
    const [stats, setStats] = useState({
        name: '',
        inv: [],
        cd: 0,
        enc: 0,
        str: 0,
        spd: 0,
        gold: 0
    });
    const [loc, setLoc] = useState({
        id: 0,
        coord: '',
        title: '',
        desc: '',
        players: [],
        items: [],
        exits: []
    });
    const [item, setItem] = useState({
        name: "",
        description: "",
        weight: "",
        itemtype: "",
        level: "",
        attributes: "",
    });
    const [messages, setMessages] = useState([]);
    const [errors, setErrors] = useState([]);
    const [graph, setGraph] = useState(graphJSON ? graphJSON : {});
    const [activeWindow, setActiveWindow] = useState('main');
    const [goToInput, setGoToInput] = useState(0);
    const [genInput1, setGenInput1] = useState("");
    const [genInput2, setGenInput2] = useState("");
    const [genInput3, setGenInput3] = useState("");


    useEffect(() => {
        init();
    }, []);

    useEffect(() => {

    }, [cd]);

    const init = async () => {
        let initLoc, initStats;
        await axios
            .get(url + 'init/')
            .then(res => {
                console.log(res);
                setCd(res.data.cooldown);
                initLoc = {
                    id: res.data.room_id,
                    coord: res.data.coordinates,
                    title: res.data.title,
                    desc: res.data.description,
                    players: res.data.players ? res.data.players : [],
                    items: res.data.items ? res.data.items : [],
                    exits: res.data.exits
                };
                setLoc(initLoc);
                setMessages([messages].concat(res.data.messages));
                setErrors([errors].concat(res.data.errors));
            })
            .catch(err => {
                console.error(err);
            });
        await wait(1001);
        await axios
            .post(url + 'status/')
            .then(res => {
                console.log(res);
                setCd(res.data.cooldown);
                initStats = {
                    name: res.data.name,
                    inv: res.data.inventory,
                    enc: res.data.encumbrance,
                    str: res.data.strength,
                    spd: res.data.speed,
                    status: res.data.status,
                    gold: res.data.gold
                };
                setStats(initStats);
            })
            .catch(err => {
                console.error(err);
            });
        console.log(loc);
        player = new Player(url, cd, initStats, initLoc, graph);
    };

    const storeLocData = res => {
        setCd(res.data.cooldown);
        setLoc({
            id: res.data.room_id,
            coord: res.data.coordinates,
            title: res.data.title,
            desc: res.data.description,
            players: res.data.players ? res.data.players : [],
            items: res.data.items ? res.data.items : [],
            exits: res.data.exits,
            elevation: res.data.elevation,
            terrain: res.data.terrain
        });
        setMessages([messages].concat(res.data.messages));
        setErrors([errors].concat(res.data.errors));
    };

    const storeItemData = res => {
        setCd(res.data.cooldown);
        setItem({
            name: res.data.name,
            description: res.data.description,
            weight: res.data.weight,
            itemtype: res.data.itemtype,
            level: res.data.level,
            attributes: res.data.attributes,
        });
        setMessages([messages].concat(res.data.messages));
        setErrors([errors].concat(res.data.errors));
    };

    const handleButtonInit = async ev => {
        if (ev) ev.preventDefault();
        player.init().then(res => {
            setCd(res.data.cooldown);
            storeLocData(res);
            setMessages([messages].concat(res.data.messages));
            setErrors([errors].concat(res.data.errors));
        });
    };

    const handleButtonStatus = async ev => {
        if (ev) ev.preventDefault();
        player.status().then(res => {
            setCd(res.data.cooldown);
            setStats({
                name: res.data.name,
                inv: res.data.inventory,
                enc: res.data.encumbrance,
                str: res.data.strength,
                spd: res.data.speed,
                status: res.data.status,
                gold: res.data.gold
            });
            setMessages([messages].concat(res.data.messages));
            setErrors([errors].concat(res.data.errors));
        });
    };

    const handleButtonMine = ev => {
        ev.preventDefault();
        mine();
    }

    const handleButtonGetBalance = ev => {
        ev.preventDefault();
        player.balance();
    };

    const handleButtonN = ev => {
        ev.preventDefault();
        player.move('n').then(res => {
            if (res) storeLocData(res);
        });
    };

    const handleButtonS = ev => {
        ev.preventDefault();
        player.move('s').then(res => {
            if (res) storeLocData(res);
        });
    };

    const handleButtonE = ev => {
        ev.preventDefault();
        player.move('e').then(res => {
            console.log(res);
            storeLocData(res);
        });
    };

    const handleButtonW = ev => {
        ev.preventDefault();
        player.move('w').then(res => {
            console.log(res);
            storeLocData(res);
        });
    };

    const handleButtonGet = ev => {
        ev.preventDefault();
        player.getAll();
    };

    const handleButtonSell = ev => {
        ev.preventDefault();
        player.sellAll();
    };

    const handleButtonTraverse = async ev => {
        ev.preventDefault();
        let theGraph = await player.traverse();
        console.log(theGraph);
        setGraph(theGraph);
    };

    const handleButtonLogGraph = ev => {
        ev.preventDefault();
        console.log("ROOMS:", Object.keys(graph).length)
        console.log("NOT MISTY ROOMS", Object.keys(graph)
        .filter(el => graph[el].title !== 'A misty room')
        .map(el => graph[el])
        )
    };

    
    const handleButtonTest = async ev => {
        ev.preventDefault();
        player.goMining();
    };

    const handleGoToChange = ev => setGoToInput(parseInt(ev.target.value))

    const handleGoToSubmit = async ev => {
        ev.preventDefault()
        const dest = goToInput;
        const pathEnd = await player.pathfind(dest)
        setLoc(pathEnd.loc)
    }

    const handleGenInput1Change = ev => setGenInput1(ev.target.value)
    const handleGenInput2Change = ev => setGenInput2(ev.target.value)
    const handleGenInput3Change = ev => setGenInput3(ev.target.value)

    const handleGenericSubmit = async ev => {
        ev.preventDefault()
        let res;

        if (genInput3) {
            res = await player.generic(genInput1, genInput2, genInput3)
        } else {
            res = await player.generic(genInput1, genInput2)
        }

        if (res.data.itemtype) {
            storeItemData(res)
        }
    }

    return (
        <SC.App>
            <SC.Title>GET DEM COINS</SC.Title>
            <SC.Select
                value={activeWindow}
                onChange={ev => setActiveWindow(ev.target.value)}
            >
                <option value='main'>Main</option>
                <option value='map'>Map</option>
            </SC.Select>
            {activeWindow === 'main' && (
                <>
                    <div>
                        <button onClick={handleButtonInit}>INIT</button>
                        <button onClick={handleButtonStatus}>STATUS</button>
                        <button onClick={handleButtonMine}>MINE</button>
                        <button onClick={handleButtonGetBalance}>COIN BALANCE</button>
                        <button onClick={handleButtonN}>N</button>
                        <button onClick={handleButtonS}>S</button>
                        <button onClick={handleButtonE}>E</button>
                        <button onClick={handleButtonW}>W</button>
                        <button onClick={handleButtonTraverse}>TRAVERSE</button>
                        <button onClick={handleButtonLogGraph}>LOG GRAPH</button>
                        <button onClick={handleButtonGet}>GET ALL</button>
                        <button onClick={handleButtonSell}>SELL ALL</button>
                        <button onClick={handleButtonTest}>TEST</button>
                        <form onSubmit={handleGoToSubmit}>
                            <label>
                                Go To:
                                <input type="number" value={goToInput} onChange={handleGoToChange}/>
                            </label>
                            <button type="submit">START</button>
                        </form>
                        <form onSubmit={handleGenericSubmit}>
                            <label>
                                Input Target:
                                <input type="text" value={genInput1} onChange={handleGenInput1Change}/>
                                Input Action:
                                <input type="text" value={genInput2} onChange={handleGenInput2Change}/>
                                Input Confirm:
                                <input type="text" value={genInput3} onChange={handleGenInput3Change}/>
                                
                            </label>
                            <button type="submit">SUBMIT</button>
                        </form>
                    </div>
                    <SC.SplitBox>
                        <SC.PlayerBox>
                            <p>NAME: {stats.name}</p>
                            <p>COOLDOWN: {cd}</p>
                            <p>ENCUMBERANCE: {stats.enc}</p>
                            <p>STRENGTH: {stats.str}</p>
                            <p>SPEED: {stats.spd}</p>
                            <div>
                                <p>INVENTORY:</p>
                                {stats.inv.map((item, i) => (
                                    <p onClick={() => setGenInput1(item)} key={i}>{item}</p>
                                ))}
                            </div>
                            <p>GOLD: {stats.gold}</p>
                        </SC.PlayerBox>
                        <SC.RoomBox>
                            <p>ID: {loc.id}</p>
                            <p>COORDINATES: {loc.coord}</p>
                            <p>TITLE: {loc.title}</p>
                            <p>DESCRIPTION: {loc.desc}</p>
                            <p>
                                PLAYERS:{' '}
                                {loc.players.slice(0, 5).map((player, i) => (
                                    <span key={i}>{player}, </span>
                                ))}
                            </p>
                            <p>ITEMS: {loc.items}</p>
                            <p>EXITS: {loc.exits}</p>
                        </SC.RoomBox>
                        <SC.ItemBox>
                            <p>NAME: {item.name}</p>
                            <p>ATTRIBUTES: {item.attributes}</p>
                            <p>WEIGHT: {item.weight}</p>
                            <p>DESCRIPTION: {item.description}</p>
                            <p>TYPE: {item.itemtype}</p>
                            <p>LEVEL: {item.level}</p>
                        </SC.ItemBox>
                    </SC.SplitBox>
                    <SC.MessageBox>
                        <p>MESSAGES:</p>
                        {messages.map((msg, i) => (
                            <p key={i}>{msg}</p>
                        ))}
                    </SC.MessageBox>
                    <SC.ErrorBox>
                        <p>ERRORS:</p>
                        {errors.map((err, i) => (
                            <p key={i}>{err}</p>
                        ))}
                    </SC.ErrorBox>
                </>
            )}
            {activeWindow === 'map' && <Map graph={graph} />}
        </SC.App>
    );
}

export default App;
