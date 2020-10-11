
const fs = require("fs");
const crypto = require("crypto");

const getHash = (buffer)=>{ // can add path or buffer
    try{
        
        const hash = crypto.createHash("sha384")
                     .update(buffer)
                     .digest("hex");
                
        return hash;

    }catch(e){
        console.log(e); //handel error
    }
};

module.exports = getHash;