var fs = require('fs');

//readfile Sync

console.log("I'm Sync");

console.log('A');
var result = fs.readFileSync('syntax/sample.txt', 'utf8');
console.log(result);
console.log('C');

//readfile Async

console.log("\nI'm Async");

console.log('A');
fs.readFile('syntax/sample.txt', 'utf8', function(err, result) {
    console.log(result);
});
console.log('C');