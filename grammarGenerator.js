//Generate a grammar for parsing into commands
//Takes in a command list that has all the commands we want to parse for
//Also takes in a list of all the functions we want to be able to parse for
export function generateGrammar(commandList, functionList) {

	let commandSection = ''
	for (let i in commandList) {
		commandSection += createCommandToken(i, commandList[i])
    }
	
	let functionSection = ``
    for (let i in functionList) {
        functionSection += createFunctionToken(i, functionList[i])
    }

  //The first large chunk of grammar is unchanged when we change the functions and commands
  //basically holds the larger structures, like sequentialCommandGroup etc., methods, and the file as a whole
    let generatedGrammar = `file = first:(function/javafunction)+
{
	return first
}
javafunction = newline? first:text indent second:javaBlock dedent
{
	return "public static Command " + first + second
}
function = newline? first:text indent second:(structure/command) dedent
{
	return "public static Command " + first + "(){return " + second+";}"
}
structure = first:(sequential/parallelRace/parallelDeadline/parallel) t:timeout? indent second:(structure/command/f)+ dedent
{
	return first + "(" + second.join(",") + ")" + (t != null ? t : "")
}
sequential = newline s:"sequential"
{
	return "new SequentialCommandGroup"
}
parallel = newline s:"parallel"
{
	return "new ParallelCommandGroup"
}
parallelRace = newline s:"parallelRace"
{
	return "new ParallelRaceGroup"
}
parallelDeadline = newline s:"parallelDeadline"
{
	return "new ParallelDeadlineGroup"
}
command = first:(${Object.keys(commandList).toString().replaceAll(",","/")}) t:timeout?
{
	return first + (t != null ? t : "")
}
${commandSection}f'function' = first:(${Object.keys(functionList).toString().replaceAll(",","/")}) t:timeout?
{
	return first + (t != null ? t : "")
}
${functionSection}timeout = space "with timeout" space p:text
{
	return ".withTimeout(" + p + ")"
}
p'parameter' = space d:(bracketed/textnospace)
{
	return d.replaceAll("{","").replaceAll("}","")
}
javaBlock = newline "java*{" content:text
{
	return "{" + content + "}"
}
indent = newline "INDENT"
dedent = newline "DEDENT"
space = " "
textnospace = s:[a-zA-Z0-9._-]* {return s.join("")}
bracketed = "{" s:[^}]* "}" {return s.join("")}
text = s:[^\\n]+ {return s.join("")}
newline'new line' = "\\n" { return ""}`
    
    return generatedGrammar
}

function createCommandToken(commandFullName, commandObject){
	let scriptingName = commandObject.name
	let parameters = Object.keys(commandObject.parameters)
	
	let firstLineParameters = parameters.map((x)=>{
		return x + ":p"
	})
	
	let returnParameters = parameters.map((x)=>{
		return "+" + x + "+"
	})
	
	let firstLineParametersFormatted = firstLineParameters.toString().replaceAll(","," ")
	let returnParametersFormatted = returnParameters.toString().replaceAll(",",'","')
	
	let commandToken = `${commandFullName} = newline "${scriptingName}" ${firstLineParametersFormatted}
{
	return "new ${commandFullName}("${returnParametersFormatted}")"
}
`
	commandToken = commandToken.replaceAll('""', '"+"')
	//console.log(commandToken)
	return commandToken
}

function createFunctionToken(functionFullName, functionScriptingName){
	return `${functionFullName} = newline "${functionScriptingName}"
{
	return "${functionFullName}()"
}
`
}

export default {
	generateGrammar: generateGrammar
}