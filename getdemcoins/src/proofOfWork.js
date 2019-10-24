import sha256 from 'js-sha256';
import utf8 from 'utf8';

self.addEventListener(
    "message",
    function(e) {
        self.postMessage(e.data);
    },
    false
);

function proofOfWork(lastProof, difficulty) {
    const start = Date.now()

    console.log("Searching for next proof")
    // console.log(`(Attempt: ${attempts}, Successes: ${coinsMined})`)
    
    let proof = 42424242424242
    let counter = 0

    console.log("LASTPROOF:", lastProof)
    console.log("DIFFICULTY:", difficulty)

    while (true) {
        
        let encoded = utf8.encode(`${lastProof}${proof}`)
        let currentHash = sha256.hex(encoded)
        if (currentHash.substring(0, difficulty) === "0".repeat(difficulty)) {
            console.log(`Proof found: ${proof} in ${counter} tries and ${(Date.now() - start) / 1000} seconds.`)
            console.log(currentHash.substring(0, difficulty))
            return proof
        } else {
            counter ++
            proof = proof + Math.floor(Math.random() * 42)
        }
    }
}