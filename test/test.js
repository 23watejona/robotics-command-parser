import index from '../index.js'
import indentParser from '../parseIndentation.js'
import fs from 'fs'
import assert from 'assert'

let generatedGrammar = index.generateGrammar(fs.readFileSync("./test/testcommandlist.json"), fs.readFileSync("./test/testfunctionlist.json"))
assert(generatedGrammar == fs.readFileSync('./test/commandGrammar.pegjs').toString(), "Generated Command Grammar does not match expected Command Grammar")
index.setGrammar(generatedGrammar)
let indentParsed = indentParser.parse(fs.readFileSync('./test/script.txt').toString())
assert(indentParsed == fs.readFileSync('./test/testindentation.txt'))
let parsed = index.parse("CommandComposer", fs.readFileSync('./test/script.txt').toString(),  fs.readFileSync('./test/script.txt').toString())
assert(parsed == fs.readFileSync("./test/expectedoutput.txt"), "Parsed output does not match expected output")
console.log("Output is correct!")