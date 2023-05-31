

import fs from 'fs'
import pegjs from 'pegjs'
import indentParser from './parseIndentation.js'
import grammarGenerator from './grammarGenerator.js'

var parserCommand

export function setGrammar(commandGrammar) {
    try {
        //store text of grammars in local scope
        //generate parsers from grammars and store in global scope
        parserCommand = pegjs.generate(commandGrammar)
    } catch (e) {
		console.error("FAILED TO SET GRAMMAR")
		console.error(e)
        //error handling
        e.location !== undefined ? "Line " + e.location.start.line + ", column " + e.location.start.column + ": " + e.message : e.message;
    }
}


export function generateGrammar(commandList, functionList) {
	commandList = JSON.parse(commandList)
	functionList = JSON.parse(functionList)
	return grammarGenerator.generateGrammar(commandList, functionList)
}

export function parse(name, ...scripts) {
    //first parse for indentation, then parse into commands
    //return results
    //FORMAT: array of the static methods described in the script
    let parsedMethods = []
	for(let script of scripts){
		let indentParsedScript = parseIndent(script)
		parsedMethods = parsedMethods.concat(parseToCommands(indentParsedScript))
	}
	let res = `public class ${name}{`
	for(let content of parsedMethods){
		res+=content
	}
	res+="}"
	return res
}

export function parseIndent(script) {
    //try {
        //parse the script and convert changes in indentation to text tokens for next round of parsing
        //It's very difficult to parse both indentation and everything else at the same time
        var parsedScript = indentParser.parse(script)
    //} catch (e) {
        //Error handling: beware of line numbers - I'm not sure they're accurate
    //    console.error("INDENTATION ERROR")
	//	console.error(e)
    //    return
    //}
    return parsedScript
}

export function parseToCommands(indentParsedScript) {
    try {
        //parse script into java commands
        //NOTE: must be pre-parsed for indentation
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
    parseIndent: parseIndent,
    parseToCommands: parseToCommands,
    generateGrammar: generateGrammar,
    setGrammar: setGrammar
}