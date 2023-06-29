//Generate a grammar for parsing into commands
//Takes in a command list that has all the commands we want to parse for
//Also takes in a list of all the functions we want to be able to parse for
export function generateGrammar(commandList, functionList) {
	//generate the grammar from the template
    let generatedGrammar = 
`file = first:(function/javafunction)+
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
command = first:(${Object.keys(commandList).join("/")}) t:timeout?
{
	return first + (t != null ? t : "")
}
${(()=>{
	let res = ""
	for (let i in commandList) {
		res += createCommandToken(i, commandList[i])
	}
	return res
})()
}f'function' = first:(${Object.keys(functionList).join("/")}) t:timeout?
{
	return first + (t != null ? t : "")
}
${(()=>{
	let res =""
	for (let i in functionList) {
		res += createFunctionToken(i, functionList[i])
	}
	return res
})()}timeout = space "with timeout" space p:text
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
	
	//generate a command token based on the template
	let scriptingName = commandObject.name
	let parameters = commandObject.parameters

	let parameterLabels = []
	// For each parameter, create a label that's indexed, starting at one
	for (let index = 1; index < parameters.length + 1; index++) {
		parameterLabels.push(`p${index}`)
	}
	
	//format = p1:p etc
	let firstLineParameters = parameterLabels.map((x)=>{
		return x + ":p"
	})
	
	//format ends up as +p... for each
	let returnParameters = parameterLabels.map((x)=>{
		return "+" + x 
	})
	
	//convert to text and change the delimiters between each of these items from commas to spaces
	let firstLineParametersFormatted = firstLineParameters.join(" ")
	
	//convert to text and change the delimiters from , to +","
	let returnParametersFormatted = returnParameters.join('+","')
	
	let commandToken = `${commandFullName} = newline "${scriptingName}" ${firstLineParametersFormatted}
{
	return "new ${commandFullName}("${returnParametersFormatted}+")"
}
`
	return commandToken
}

function createFunctionToken(functionFullName, functionScriptingName){
		//generate a function token based on the template
	return `${functionFullName} = newline "${functionScriptingName}"
{
	return "${functionFullName}()"
}
`
}

export default {
	generateGrammar: generateGrammar
}