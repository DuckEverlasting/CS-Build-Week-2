class QueueNode {
    constructor(value, next=null, prev=null) {
        this.value = value;
        this.next = next;
        this.prev = prev;
    }
}

class Queue {
    constructor() {
        this.size = 0;
        this.head = null;
    }

    enqueue(value) {
        let newNode = new QueueNode(value);
        this.size += 1;
        if (this.head === null) {
            this.head = newNode
        } else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
    }

    dequeue() {
        if (this.head === null) {
            return null
        }

        this.size -= 1
        let current_head;

        if (!this.size) {
             current_head = this.head
            this.head = null
            return current_head.value
        }
            
        current_head = this.head
        this.head = this.head.next
        this.head.prev = null
        return current_head.value
    }
}


export default class Graph {
    constructor(data={}) {
        this.graph = data
        this.size = data.length
        this.savedPaths = {}
    }
    
    addData(roomId, data) {
        this.graph[roomId] = data
    }

    getExits(room, exclude=-1) {
        const exits = Object.keys(this.graph[room])
            .map(el => this.graph[room][el])
            .filter(el => el !== exclude)
        return exits
    }
        

    bfs(start, finish) {
        const queue = new Queue()
        queue.enqueue([start])
        const visited = new Set([])
        let bestPath, current, currentRoom, dest;
        let bestLength = 0
        while (queue.size) {
            current = queue.dequeue()
            currentRoom = current[current.length - 1]
            visited.add(currentRoom)
            if (currentRoom === finish) {
                if (!bestLength || current.length < bestLength) {
                    bestPath = current
                    bestLength = bestPath.length
                }
            } else {
                Object.keys(this.graph[currentRoom]).forEach(dir => {
                    dest = this.graph[currentRoom][dir]
                    if (!visited.has(dest)) {
                        queue.enqueue(current + [dest])
                    }
                })
            }
        }
            
        if (bestLength) {
            bestPath.pop(0)
            return bestPath
        }
        return;
    }


    pathfind(graph, start, previous) {
        if (this.savedPaths[start] && this.savedPaths[start][previous])
            return this.savedPaths[start][previous]

        if (graph.length === 1) {
            return [start]
        }
            
        let current = start
        let path = [start]
        let unvisited, pathBack;
        const visited = new Set([start])

        while (visited.size < graph) {
            unvisited = this.getExits(current).filter(el => (el !== previous && !visited.has(el)))
            if (unvisited.length === 0) {
                pathBack = this.bfs(current, start)
                path.extend(pathBack)
                if (!this.savedPaths[start]) {
                    this.savedPaths[start] = {}
                }
                this.savedPaths[start][previous] = path
                return path
            } else if (unvisited.length === 1) {
                previous = current
                current = unvisited[0]
                path.push(current)
            } else {
                let bestLength = this.size
                let bestPath;
                unvisited.forEach(exit => {
                    let subgraph = this.attemptSubGraph(exit, current)
                    if (subgraph && subgraph.length < bestLength) {
                        let subpath = this.pathfind(subgraph, exit, current)
                        if (!subpath) {
                            bestLength = subgraph.length
                            bestPath = subpath
                        }        
                    }
                })
                    
                if (!bestPath)
                    return;
                path = path + (bestPath + [current])
                bestPath.forEach(el => {
                    visited.add(el)
                })
            }
        }
    }
        

    attemptSubGraph(start, previousRoom, maxSize=200) {
        const opposites = {'n': 's', 's': 'n', 'e': 'w', 'w': 'e'}
        const path=[]
        const subgraph = {}
        let exits = Object.keys(this.graph[start]).filter(el => this.graph[start][el] !== previousRoom)
        subgraph[start] = {}
        let current = start

        if (!exits.length) {
            return {start: {}}
        }

        exits.forEach(dir => {
            subgraph[start][dir] = "?"
        })
            
                
        while (true) {
            exits = Object.keys(this.graph[current])

            if (!subgraph[current]) {
                subgraph[current] = {}
                exits.forEach(dir => {
                    subgraph[current][dir] = "?"
                })
            }

            let unexploredExits = []
            exits.forEach(dir => {
                if (this.graph[current][dir] !== previousRoom) {
                    if (subgraph[current][dir] === "?") {
                        unexploredExits.push(dir)
                    }
                } else if (current !== start) {
                    return;
                }
            })

            if (!unexploredExits.length) {
                if (path.length === 1) {
                    return subgraph
                }
                let wayBack = opposites[path.pop()]
                current = subgraph[current][wayBack]
            } else {
                let wayForward = unexploredExits[0]
                subgraph[current][wayForward] = this.graph[current][wayForward]
                current = subgraph[current][wayForward]
                path.push(wayForward)
            }
                
            if (Object.keys(subgraph).length > maxSize) {
                return;
            }
        }
    }
        

    findNearestUnexplored(start, targets) {
        const output = [];
        const queue = Queue();
        const localExplored = new Set([]);
        let current;
        queue.enqueue(start)
        while (queue.size) {
            current = queue.dequeue()
            this.graph[current].forEach(el => {
                let room = this.graph[current][el]
                if (!localExplored[room]) {
                    if (targets[room]) {
                        output.push(room)
                    }
                    queue.enqueue(room)
                }
            })
                
            if (output.length) {
                return [output, current]
            }
            localExplored.add(current)
        }
    }


    smartTraverse(start=0, targetLength=1000) {
        const traversalPath = []
        let current = start
        let next, addition;
        const targets = new Set(...Array(this.size).keys())
        targets.delete(0)

        while (targets.size) {
            let [nearestUnexplored, connecting] = this.findNearestUnexplored(current, targets)
            let bestLength = this.size
            let bestPath;
            nearestUnexplored.forEach(exit => {
                let subgraph = this.attemptSubGraph(exit, connecting)
                if (subgraph && Object.keys(subgraph).length < bestLength) {
                    let subpath = this.pathfind(subgraph, exit, current)
                    if (subpath) {
                        bestLength = Object.keys(subgraph).length
                        bestPath = subpath
                    }
                }
            })
                
            if (!bestPath) {
                next = nearestUnexplored[Math.floor(Math.random() * nearestUnexplored.length)];
                addition = this.bfs(current, next);
                addition.forEach(el => {
                    traversalPath.push(el)
                    if (targets[el]) {
                        targets.delete(el)
                    }
                })                    
                current = next
            } else {
                addition = bestPath + [current]
                addition.forEach(el => {
                    traversalPath.push(el)
                    if (targets[el]) {
                        targets.delete(el)
                    }
                    if (!targets.size) {
                        return traversalPath
                    }
                })
            }
                
            
            if (traversalPath.length > targetLength) {
                return;
            }
        }
        return traversalPath
    }
        
    
    convertPathToDirections(path, start=0) {
        let current = start;
        let next = path[0];
        let index = 0;
        const directions = [];
        while (true) {
            directions.push(this.graph[current].filter(dir => this.graph[current][dir] === next)[0])
            current = next
            index += 1
            try {
                next = path[index]
            } catch {
                break
            }  
        }
        return directions
    }
}