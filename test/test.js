import index from "../index.js";
import fs from "fs";

//generate a grammar from our command and function lists
let generatedGrammar = index.generateGrammar(
	fs.readFileSync("./test/testCommandList.json"),
	fs.readFileSync("./test/testFunctionList.json")
);

//make sure that our grammar matches what we expect
console.assert(
	generatedGrammar ==
		fs.readFileSync("./test/expectedCommandGrammar.pegjs").toString(),
	"Generated Command Grammar does not match expected Command Grammar"
);

//set the grammar so we can use it to parse
index.setGrammar(generatedGrammar);

//preprocess script
let preprocessed = index.preprocess(
	fs.readFileSync("./test/testScript.txt").toString()
);
fs.writeFileSync("./test/output.txt", preprocessed);

//make sure the output of parsing for indentation is what we expect
console.assert(
	preprocessed == fs.readFileSync("./test/expectedIndentationOutput.txt"),
	"Preprocessed indentation does not match indentation"
);

//parse our final output from our script(x2)
let parsed = index.parse(
	"CommandComposer",
	fs.readFileSync("./test/testScript.txt").toString(),
	fs.readFileSync("./test/testScript.txt").toString()
);

//make sure the final output matches what is expected
console.assert(
	parsed == fs.readFileSync("./test/expectedFinalOutput.txt"),
	"Parsed output does not match expected output"
);
