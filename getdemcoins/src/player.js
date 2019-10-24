import axios from 'axios';
import mine from './miner.js';

import { wait } from './helpers.js';

const emptyPromise = new Promise((res, rej) => res);

export default class Player {
    constructor(url, cd, stats, loc, graph) {
        this.graph = graph;
        this.url = url;
        this.cd = cd;
        this.cdDone = 0;
        this.stats = stats;
        this.loc = loc;
        this.ghostBuddy = "";
        this.mineLocation = null;
    }

    // Setters

    setCd(data) {
        this.cd = data.cooldown;
        this.cdDone = Date.now() + data.cooldown * 1000;
    }

    setStats(data) {
        this.stats = {
            name: data.name,
            inv: data.inventory,
            enc: data.encumbrance,
            str: data.strength,
            spd: data.speed,
            status: data.status,
            gold: data.gold
        };
    }

    setLoc(data) {
        this.loc = {
            id: data.room_id,
            coord: data.coordinates,
            title: data.title,
            desc: data.description,
            players: data.players ? data.players : [],
            items: data.items ? data.items : [],
            exits: data.exits,
            elevation: data.elevation,
            terrain: data.terrain
        };
    }

    // Actions

    generic(target, action, confirm = '') {
        // Handles many api calls. Some have their own specific functions 
        // for ease of use, but this is the main function for:
        // 
        if (Date.now() < this.cdDone) return;
        let data = { name: target };
        if (confirm) {
            data.confirm = confirm;
        }

        if (!target) {
            return axios
                .post(this.url + `${action}/`)
                .then(res => {
                    console.log(res.data);
                    if (res.data.messages.length) {
                        console.log("MESSAGE:", res.data.messages)
                    };
                    if (res.data.errors.length) {
                        console.log("ERROR:", res.data.errors)
                    };
                    this.setCd(res.data);
                    console.log("CD", this.cd)
                    return res;
                })
                .catch(err => {
                    console.error(err);
                });
        } else {
            return axios
                .post(this.url + `${action}/`, data)
                .then(res => {
                    console.log(res.data);
                    if (res.data.messages.length) {
                        console.log("MESSAGE:", res.data.messages)
                    };
                    if (res.data.errors.length) {
                        console.log("ERROR:", res.data.errors)
                    };
                    this.setCd(res.data);
                    console.log("CD", this.cd)
                    return res;
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }

    move(dir) {
        let data;
        if (Date.now() < this.cdDone) {
            console.log('COOLDOWN NOT FINISHED');
            console.log(Date.now());
            console.log(this.cdDone);
            return emptyPromise;
        }
        if (!this.loc.exits.includes(dir)) {
            console.log('NO EXIT');
            console.log(this.loc.exits);
            console.log(dir);
            return emptyPromise;
        }

        if (
            this.graph[this.loc.id][`${dir}_to`] &&
            this.graph[this.loc.id][`${dir}_to`] !== '?'
        ) {
            console.log('SMART EXPLORE!');
            let nextRoom = `${this.graph[this.loc.id][`${dir}_to`]}`;
            data = { direction: dir, next_room_id: nextRoom };
        } else {
            data = { direction: dir };
        }

        return axios.post(this.url + 'move/', data)
            .then(res => {
                console.log(res.data);
                if (res.data.messages.length) {
                    console.log("MESSAGE:", res.data.messages)
                };
                if (res.data.errors.length) {
                    console.log("ERROR:", res.data.errors)
                };
                this.setCd(res.data);
                console.log("CD", this.cd)
                this.setLoc(res.data);
                return res;
        });
    }

    dash(dashArray) {
        if (Date.now() < this.cdDone) {
            console.log('COOLDOWN NOT FINISHED');
            console.log(Date.now());
            console.log(this.cdDone);
            return;
        }
        const direction = dashArray[0].dir;
        const num_rooms = dashArray.length.toString();
        const next_room_ids = dashArray.map(el => el.id).toString();
        const data = { direction, num_rooms, next_room_ids };
        console.log(data)
        return axios.post(this.url + 'dash/', data)
            .then(res => {
                console.log(res.data);
                if (res.data.messages.length) {
                    console.log("MESSAGE:", res.data.messages)
                };
                if (res.data.errors.length) {
                    console.log("ERROR:", res.data.errors)
                };
                this.setCd(res.data);
                this.setLoc(res.data);
                return res;
        });
    }

    fly(dir) {
        let data;
        if (Date.now() < this.cdDone) {
            console.log('COOLDOWN NOT FINISHED');
            console.log(Date.now());
            console.log(this.cdDone);
            return emptyPromise;
        }
        if (!this.loc.exits.includes(dir)) {
            console.log('NO EXIT');
            console.log(this.loc.exits);
            console.log(dir);
            return emptyPromise;
        }

        if (
            this.graph[this.loc.id][`${dir}_to`] &&
            this.graph[this.loc.id][`${dir}_to`] !== '?'
        ) {
            console.log('SMART EXPLORE!');
            let nextRoom = `${this.graph[this.loc.id][`${dir}_to`]}`;
            data = { direction: dir, next_room_id: nextRoom };
        } else {
            data = { direction: dir };
        }

        return axios.post(this.url + 'fly/', data)
            .then(res => {
                console.log(res.data);
                if (res.data.messages.length) {
                    console.log("MESSAGE:", res.data.messages)
                };
                if (res.data.errors.length) {
                    console.log("ERROR:", res.data.errors)
                };
                this.setCd(res.data);
                this.setLoc(res.data);
                return res;
        });
    }

    init() {
        if (Date.now() < this.cdDone)  {
            console.log('COOLDOWN NOT FINISHED');
            console.log(Date.now());
            console.log(this.cdDone);
            return emptyPromise
        };
        return axios
            .get(this.url + 'init/')
            .then(res => {
                console.log(res.data);
                if (res.data.messages.length) {
                    console.log("MESSAGE:", res.data.messages)
                };
                if (res.data.errors.length) {
                    console.log("ERROR:", res.data.errors)
                };
                this.setCd(res.data);
                console.log("CD", this.cd)
                this.setLoc(res.data);
                return res;
            })
            .catch(err => {
                console.error(err);
            });
    }

    status() {
        if (Date.now() < this.cdDone) {
            console.log('COOLDOWN NOT FINISHED');
            console.log(Date.now());
            console.log(this.cdDone);
            return emptyPromise
        };
        return axios
            .post(this.url + 'status/')
            .then(res => {
                console.log(res.data);
                if (res.data.messages.length) {
                    console.log("MESSAGE:", res.data.messages)
                };
                if (res.data.errors.length) {
                    console.log("ERROR:", res.data.errors)
                };
                this.setCd(res.data);
                console.log("CD", this.cd)
                this.setStats(res.data);
                return res;
            })
            .catch(err => {
                console.error(err);
            });
    }

    get(target) {
        if (Date.now() < this.cdDone)  {
            console.log('COOLDOWN NOT FINISHED');
            console.log(Date.now());
            console.log(this.cdDone);
            return emptyPromise
        };
        return axios
            .post(this.url + 'take/', { name: target })
            .then(res => {
                console.log(res.data);
                if (res.data.messages.length) {
                    console.log("MESSAGE:", res.data.messages)
                };
                if (res.data.errors.length) {
                    console.log("ERROR:", res.data.errors)
                };
                this.setCd(res.data);
                console.log("CD", this.cd)
                this.setStats(res.data);
                return res;
            })
            .catch(err => {
                console.error(err);
            });
    }

    async getAll() {
        if (Date.now() < this.cdDone)  {
            console.log('COOLDOWN NOT FINISHED');
            console.log(Date.now());
            console.log(this.cdDone);
            return emptyPromise
        };
        await this.init();
        await wait(this.cd * 1000)
        while (this.loc.items.length) {
            await axios
                .post(this.url + 'take/', { name: this.loc.items[0] })
                .then(res => {
                    console.log(res.data);
                    if (res.data.messages.length) {
                        console.log("MESSAGE:", res.data.messages)
                    };
                    if (res.data.errors.length) {
                        console.log("ERROR:", res.data.errors)
                    };
                    this.setCd(res.data);
                    console.log("CD", this.cd)
                    this.setStats(res.data);
                    return res;
                })
                .catch(err => {
                    console.error(err);
                });
            await wait(this.cd * 1000);
            await this.init();
            await wait(this.cd * 1000)
        }
    }

    async sellAll() {
        if (Date.now() < this.cdDone)  {
            console.log('COOLDOWN NOT FINISHED');
            console.log(Date.now());
            console.log(this.cdDone);
            return emptyPromise
        };
        await this.status();
        await wait(this.cd * 1000);
        if (this.stats.inv.filter(item => !item.includes("treasure")).length) {
            console.log("FOUND SOMETHING INTERESTING")
            return ("stopped")
        } else {
            while (this.stats.inv.length) {
                await this.generic(this.stats.inv[0], "sell", "yes")
                await wait(this.cd * 1000);
                await this.status();
                await wait(this.cd * 1000);
            }
        }
    }

    carry(target) {}

    recieve(target) {}

    async balance() {
        if (Date.now() < this.cdDone)  {
            console.log('COOLDOWN NOT FINISHED');
            console.log(Date.now());
            console.log(this.cdDone);
            return
        };
        let res = await axios
            .get('https://lambda-treasure-hunt.herokuapp.com/api/bc/get_balance')
            .then(res => {
                console.log(res.data);
                if (res.data.messages.length) {
                    console.log("MESSAGE:", res.data.messages)
                };
                if (res.data.errors.length) {
                    console.log("ERROR:", res.data.errors)
                };
                this.setCd(res.data);
                return res;
            })
            .catch(err => {
                console.error(err);
            });
        this.coinBalance = parseInt(res.data.messages[0][res.data.messages[0].indexOf(".") - 1])
        await wait(this.cd * 1000)
    }

    async wish() {
        if (Date.now() < this.cdDone)  {
            console.log('COOLDOWN NOT FINISHED');
            console.log(Date.now());
            console.log(this.cdDone);
            return
        };
        let res = await this.generic("well", "examine")
        let ls8Input = res.data.description.replace(/(\r\n|\n|\r)/gm, "2")

        ls8Input = ls8Input.replace("You see a faint pattern in the water...22", "")
    
        let ls8Output = await axios
            .post("http://localhost:4000/ls8", {"input": ls8Input})
            .then(res => res.data)
            .catch(err => console.log(err))

        ls8Output = ls8Output.slice(ls8Output.lastIndexOf(" ") + 1)
        this.mineLocation = parseInt(ls8Output.join(""))
        console.log("NEW MINE LOCATION:", this.mineLocation)
        await wait(this.cd * 1000);
    }

    // Pathfinding and data analysis
    
    async goMining() {
        if (Date.now() < this.cdDone)  {
            console.log('COOLDOWN NOT FINISHED');
            console.log(Date.now());
            console.log(this.cdDone);
            await wait(this.cd * 1000);
            this.goMining()
        };
        const well = 55
        if (this.mineLocation === null) {
            await this.pathfind(well)
            await this.wish()
        } else {
            await this.pathfind(this.mineLocation)
            await this.balance()
            let coinBal = this.coinBalance;
            let mineRes = await mine()
            if (mineRes.data.cooldown > 50) {
                this.mineLocation = null
            }
            await this.balance()
            if (this.coinBalance > coinBal) {
                this.mineLocation = null
            }
        }
        this.goMining()
    }

    async getAllTheThings() {
        if (Date.now() < this.cdDone)  {
            console.log('COOLDOWN NOT FINISHED');
            console.log(Date.now());
            console.log(this.cdDone);
            return
        };
        
        const waypoints = [455, 489, 467, 493, 441, 494, 472, 416, 476, 22]
        while (true) {
            let dest = waypoints[Math.floor(Math.random() * 10)]
            let result = await this.pathfind(dest, this.loc.id, true)
            if (result.stopped) {
                await this.pathfind(1, this.loc.id)
                await this.status()
                await wait(this.cd * 1000);
                let sellCheck = await this.sellAll();
                if (sellCheck) break;
            }
        }
    }

    async pathfind(dest, start=this.loc.id, get=false) {
        const path = this.bfs(dest, start, get)
        let newLoc = await this.followPath(path, get)
        return newLoc
    }

    bfs(end, start=this.loc.id, noDash=false) {
        const queue = [];
        queue.unshift([start]);
        const visited = new Set([]);
        let current, currentRoom, dest;
        // let bestPath
        // let bestTime = Infinity;
        while (queue.length) {
            current = queue.pop();
            currentRoom = current[current.length - 1];
            visited.add(currentRoom);
            if (currentRoom === end) {
                current.shift();
                return this.optimizePath(current, start, noDash)
                // let pathTime = 0;
                // pathTime += this.graph[el][`${dir}_cost`];
                // console.log(pathTime)
                // console.log(current)
                // if (pathTime < bestTime) {
                //     bestPath = current;
                //     bestTime = pathTime;
                // }
            } else {
                this.graph[currentRoom].exits.forEach(dir => {
                    dest = this.graph[currentRoom][`${dir}_to`];
                    if (!visited.has(dest)) {
                        queue.unshift(current.concat([dest]));
                    }
                });
            }
        }

        // if (bestTime !== Infinity) {
        //     bestPath.shift();
        //     return bestPath;
        // }
        // return 'error';
    }

    async followPath(path, get=false) {
        if (Date.now() < this.cdDone)  {
            console.log('COOLDOWN NOT FINISHED');
            console.log(Date.now());
            console.log(this.cdDone);
            return
        };

        console.log("PATH:", path);
        let stop = false;
        for (let i = 0; i < path.length; i++) {
            if (stop) break;
            console.log(this.loc);
            let next = path[i];
            if (Array.isArray(next)) {
                console.log(`DASHING ${next[0].dir} ${next.length} rooms to ${next[next.length - 1].id}...`);
                await this.dash(next);
                console.log("CD", this.cd)
                await wait(this.cd * 1000);
            } else if (next.terrain === "CAVE" || next.terrain === "TRAP") {
                console.log(`MOVING ${next.dir} to ${next.id}...`);
                await this.move(next.dir);
                console.log("CD", this.cd)
                await wait(this.cd * 1000);
            } else {
                console.log(`FLYING ${next.dir} to ${next.id}...`);
                await this.fly(next.dir);
                console.log("CD", this.cd)
                await wait(this.cd * 1000);
            }
            if (get && this.loc.items.length) {
                await this.getAll();
                await this.status()
                await wait(this.cd * 1000)
                if (this.stats.enc >= this.stats.str) {
                    stop = true; 
                    while (this.stats.enc >= this.stats.str) {
                        await this.generic(this.stats.inv[0], "drop")
                        await wait(this.cd * 1000)
                        await this.status()
                        await wait(this.cd * 1000)
                    }
                }
            }
        }
        if (!stop) console.log("Finished the Path!")
        else console.log("Stopped early!")
        return {loc: this.loc, stopped: stop};
    }

    optimizePath(path, start = this.loc.id, noDash=false) {
        let current = start;
        console.log(path)
        let pathInfo = path.map(nextRoom => {
            let dir = this.graph[current].exits.find(dir => {
                return nextRoom === this.graph[current][`${dir}_to`];
            })[0];
            let elevationChange =
                this.graph[nextRoom].elevation - this.graph[current].elevation;
            current = nextRoom;
            return {
                id: current,
                dir,
                elevationChange,
                terrain: this.graph[current].terrain
            };
        });

        if (noDash) return pathInfo

        const dashGroups = pathInfo.reduce((acc, current) => {
            if (
                acc.length &&
                acc[acc.length - 1][0].dir === current.dir &&
                current.terrain !== 'TRAP' &&
                acc[acc.length - 1][0].terrain !== 'TRAP'
            ) {
                acc[acc.length - 1].push(current);
            } else {
                acc.push([current]);
            }
            return acc;
        }, []);

        let dashPath = []
        
        dashGroups.forEach(group => {
            if (group.length < 3) {
                group.forEach(el => {
                    dashPath = [...dashPath, el]
                })
            } else {
                dashPath = [...dashPath, group]
            }
        });

        return dashPath

    }

    traverse = async (overwrite = false, initGraph = {}, path = [], unexploredPaths = 0) => {
        console.log('THISLOC', this.loc);
        let subgraph;
        if (overwrite) {
            console.log('OVERWRITTEN');
            this.graph = initGraph;
            subgraph = this.graph;
        } else {
            subgraph = initGraph;
        }

        const opposites = { n: 's', s: 'n', e: 'w', w: 'e' };
        let unexploredExits,
            wayBack,
            wayForward,
            lastRoom,
            lastConnection,
            visited;
        if (initGraph !== {}) {
            visited = new Set(Object.keys(initGraph));
        } else {
            visited = new Set([this.loc.id]);
        }

        let steps = 0;

        if (!subgraph[this.loc.id]) {
            subgraph[this.loc.id] = this.loc;
            this.loc.exits.forEach(dir => {
                subgraph[this.loc.id][`${dir}_to`] = '?';
                unexploredPaths += 1;
            });
        }

        while (true) {
            if (lastConnection) {
                subgraph[lastRoom][lastConnection[0]] = lastConnection[1];
            }

            unexploredExits = this.loc.exits.filter(dir => {
                return subgraph[this.loc.id][`${dir}_to`] === '?';
            });

            console.log('UNEXPLORED EXITS:', unexploredExits, 'UNEXPLORED PATHS:', unexploredPaths);

            if (!unexploredExits.length) {
                if (path.length === 0) {
                    console.log('DONE: OUT OF PATH', subgraph);
                    return subgraph;
                }
                wayBack = opposites[path.pop()];
                lastRoom = undefined;
                lastConnection = undefined;
                await this.move(wayBack);
                steps++;
                console.log('STEPS', steps, 'VISITED', visited.size, 'CD', this.cd);
                console.log('PATH', path);
                console.log('GRAPH', subgraph);
                await wait(this.cd * 1000);
            } else {
                wayForward = unexploredExits[0];
                lastRoom = this.loc.id;
                await this.move(wayForward);
                unexploredPaths -= 1;
                path.push(wayForward);
                steps++;
                console.log('STEPS', steps, 'VISITED', visited.size, 'CD', this.cd);
                console.log('PATH', path);
                console.log('GRAPH', subgraph);

                await wait(this.cd * 1000);

                if (!subgraph[this.loc.id]) {
                    subgraph[this.loc.id] = this.loc;
                    this.loc.exits.forEach(dir => {
                        subgraph[this.loc.id][`${dir}_to`] = '?';
                        unexploredPaths += 1;
                    });
                }
                visited.add(this.loc.id);

                lastConnection = [`${wayForward}_to`, this.loc.id];
            }

            if (!unexploredPaths) {
                console.log('DONE: NO UNEXPLORED PATHS', subgraph);
                localStorage.setItem('graph', JSON.stringify(subgraph));
                return subgraph;
            }
        }
    };


    getCosts() {
        for (let id = 0; id < Object.keys(this.graph).length; id++) {
            let room = this.graph[id];
            room.exits.forEach(dir => {
                let cd = 15;
                let dest = this.graph[room[`${dir}_to`]];
                if (dest.elevation > room.elevation) {
                    cd += 5;
                }
                if (dest.terrain === 'TRAP') {
                    cd += 30;
                }
                this.graph[id][`${dir}_cost`] = cd;
            });
        }
    }
}
