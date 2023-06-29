

import fs from 'fs'
import pegjs from 'pegjs'
import indentParser from './parseIndentation.js'
import grammarGenerator from './grammarGenerator.js'

var parserCommand

export function setGrammar(commandGrammar) {
    try {
        //generate parser from grammar and store in module scope
        parserCommand = pegjs.generate(commandGrammar)
    } catch (e) {
		//error handling for grammar generation
		//will come here if there are syntax errors in the grammar
		console.error("FAILED TO SET GRAMMAR")
		console.error(e)
        e.location !== undefined ? "Line " + e.location.start.line + ", column " + e.location.start.column + ": " + e.message : e.message;
    }
}


export function generateGrammar(commandList) {
	//parse the JSONs
	commandList = JSON.parse(commandList)
	
	//Generate the grammar
	return grammarGenerator.generateGrammar(commandList.commands, commandList.functions)
}

export function parse(name, ...scripts) {
    //first parse for indentation, then parse into commands
    //return results
    //FORMAT: array of the static methods described in the script
    let parsedMethods = []
	for(let script of scripts){
		let indentParsedScript = preprocess(script)
		parsedMethods = parsedMethods.concat(parseToCommands(indentParsedScript))
	}
	let res = `public class ${name}{`
	for(let content of parsedMethods){
		res+=content
	}
	res+="}"
	return res
}


//preprocess the script to convert leading whitespace(indentation)
//into text of "INDENT" or "DEDENT"
//Also remove single line comments throughout the script
//Multiline comments everywhere outside of javaBlocks
//And all non-required whitespace within javaBlocks
//This drastically simplifies what is necessary in the pegjs grammar
//To actually generate the Java code later
export function preprocess(script) {
    try {
        var parsedScript = indentParser.parse(script)
    } catch (e) {
        //Error handling
        console.error("INDENTATION ERROR")
		console.error(e)
        return
    }
    return parsedScript
}

export function parseToCommands(indentParsedScript) {
	if(parserCommand == undefined){
		console.error("Command Grammar not set\nYou must run 'setGrammar()' before parsing")
	}
	
	
    try {
        //parse script into java commands
        //NOTE: must be preprocessed for indentation
        var parsedScript = parserCommand.parse(indentParsedScript)
    } catch (e) {

        //error handling
        //line numbers on errors are very likely wrong - I didn't put the time into figuring this out all the way
        if (e.location == undefined) {
			console.error("COMMAND PARSING ERROR")
			console.error(e)
        } else {
            
            console.error(e)
        }
    }

    return parsedScript
}

//export the function we want other people to be able to use
export default {
    parse: parse,
    preprocess: preprocess,
    parseToCommands: parseToCommands,
    generateGrammar: generateGrammar,
    setGrammar: setGrammar
}