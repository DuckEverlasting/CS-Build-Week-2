import sha256 from 'js-sha256';
import utf8 from 'utf8';

import axios from 'axios';

import { wait } from "./helpers.js";

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
    

export default async function mine() {
    const proofUrl = "https://lambda-treasure-hunt.herokuapp.com/api/bc/last_proof/"
    const mineUrl = "https://lambda-treasure-hunt.herokuapp.com/api/bc/mine/"

    // let attempts = 1
    // let coinsMined = 0

    // Run till you get a coin
    while (true) {
        // Get the last proof from the server
        let { proof: oldProof, difficulty } = await axios
            .get(proofUrl)
            .then(res => {
                console.log(res);
                return res.data
            })
            .catch(err => {
                console.error(err);
            });
        await wait(1000)
        
        let newProof = proofOfWork(oldProof, difficulty)

        let { proof: proofCheck } = await axios
            .get(proofUrl)
            .then(res => {
                console.log(res);
                return res.data
            })
            .catch(err => {
                console.error(err);
            });

        await wait(1000)
        
        if (proofCheck === oldProof) {
            let postData = {"proof": newProof}

            let result = await axios
                .post(mineUrl, postData)
                .then(res => {
                    console.log(res);
                    return res;
                })
                .catch(err => {
                    console.log(err)
                    console.error(err);
                });
            await wait(result.data.cooldown * 1000)
            if (result.data.messages[0] === "New Block Forged") {
                console.log("SUCCESS!!!!!!")
            }
            return result
        } else {
            console.log("PROOF NO LONGER VALID. TRYING AGAIN.")
        }


        // attempts += 1
        // if data.get('message') == 'New Block Forged':
        //     coinsMined += 1
        //     console.log("Total coins mined: " + str(coinsMined))
        // else:
        //     console.log(data.get('message'))
    }
        

}
    