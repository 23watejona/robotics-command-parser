import index from '../index.js'
import fs from 'fs'
import assert from 'assert'
try{
	//generate a grammar from our command and function lists
	let generatedGrammar = index.generateGrammar(
		fs.readFileSync("./test/testCommandList.json"),
		fs.readFileSync("./test/testFunctionList.json"))

	try{
		//make sure that our grammar matches what we expect
		assert(
			generatedGrammar == fs.readFileSync('./test/expectedCommandGrammar.pegjs').toString(),
			"Generated Command Grammar does not match expected Command Grammar")
	}catch(e){
		throw new Error(e.message)
	}

	//set the grammar so we can use it to parse
	index.setGrammar(generatedGrammar)

	//preprocess script
	let preprocessed = index.preprocess(fs.readFileSync('./test/testScript.txt').toString())

	try{
		//make sure the output of parsing for indentation is what we expect
		assert(
			preprocessed == fs.readFileSync('./test/expectedIndentationOutput.txt'),
			"output of preprocessor does not match expected output")
	}catch(e){
		throw new Error(e.message)
	}
	

	//parse our final output from our script(x2)
	let parsed = index.parse(
		"CommandComposer",
		fs.readFileSync('./test/testScript.txt').toString(),
		fs.readFileSync('./test/testScript.txt').toString())

	try{
		//make sure the final output matches what is expected
		assert(
			parsed == fs.readFileSync("./test/expectedFinalOutput.txt"),
			"Fully parsed output does not match expected output")
	}catch(e){
		throw new Error(e.message)
	}
	
}catch(e){
	console.error(e)
	process.exit(1)
}
