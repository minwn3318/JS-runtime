const readline = require("readline");


const rl = readline.createInterface({
    input : process.stdin,
    output : process.stdout,
});

rl.on("line", (line) => {
    console.log("test input : "+line);
    rl.close();
});

rl.on("close",(close) => {
    process.exit();
});
