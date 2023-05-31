//Generate a grammar for parsing into commands
//Takes in a command list that has all the commands we want to parse for
//Also takes in a list of all the functions we want to be able to parse for
export function generateGrammar(commandList, functionList) {

  //The first large chunk of grammar is unchanged when we change the functions and commands
  //basically holds the larger structures, like sequentialCommandGroup etc., methods, and the file as a whole
    let grammarStaticFirstHalf = `file = first:(function/javafunction)+
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
command = first:(`


//end of grammar also doesn't change when we change commands and methods
//this section parses for the small items common to all commands and methods
//like timeouts, parameters, indents, spaces, text and newlines
    let grammarStaticSecondHalf = `timeout = space "with timeout" space p:text
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

    //start off our generated grammar with the unchanged first section of the grammar
    let grammarGenerated = grammarStaticFirstHalf

    //this is to hold a list of the names of each command token
    let l = ``
    
    //this holds all of the actual tokens for commands
    let commandTokens = ``
  
    let hasStarted = false

    //for each command of the list
    for (let i in commandList) {

        //if we already have 1 command in the list, add a delimeter btw them
        //this delimiter indicates that any of these tokens are interchangeable
        //in the parsing of a wrapper token
        if (hasStarted) {
            l += "/"
        }
        //add the token name to the list
        l += `${i}`

        //indicate that at least one token has been added to the list
        hasStarted = true

        //add the intial part of the command token
        commandTokens += `${i} = newline "${commandList[i].name}"`

        //add each parameter to the command token
        for (let j in commandList[i].parameters) {
            commandTokens += ` ${j}:p`
        }

      //add each parameter to the return function,
      //so that when it parses, the parameter ends up in the right place in the right format
        commandTokens += `
{
	return "new ${i}("`
        let currParamNum = 1
        for (let j in commandList[i].parameters) {
            if (currParamNum != 1) {
                commandTokens += `","`
            }
            commandTokens += `+${j}+`
            currParamNum++
        }
        if (currParamNum == 1) {
            commandTokens += "+"
        }
        commandTokens += `")"
}`
        commandTokens += "\n"
    }
    grammarGenerated += l
    grammarGenerated += `) t:timeout?
{
	return first + (t != null ? t : "")
}
`
    grammarGenerated += commandTokens
    grammarGenerated += `f'function' = first:(`
    l = ``
    let functionTokens = ``
    let hasRun = false
    for (let i in functionList) {
        if (hasRun) {
            l += "/"
        }
        hasRun = true
        l += `${functionList[i]}`
        functionTokens += `${functionList[i]} = newline "${functionList[i]}"
{
	return "${i}()"
}`
        functionTokens += "\n"
    }
    grammarGenerated += l
    grammarGenerated += `) t:timeout?
{
	return first + (t != null ? t : "")
}
`
    grammarGenerated += functionTokens
    grammarGenerated += grammarStaticSecondHalf
    return grammarGenerated
}


export default {
	generateGrammar: generateGrammar
}