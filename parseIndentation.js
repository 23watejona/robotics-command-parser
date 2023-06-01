export function parse(str, includeComments = false){
	
	//Things we want to break our input into, in order of processing
	//javaBlocks: java*{CONTENT}*
	// multi line comments
	// new lines
	//single line comments
	//indents(leading whitespace)
	//trailing whitespace
	//everything else is grouped as text
	let tokens = {
		javaBlock: new RegExp(/java\*{((.|\s)*?)}\*/,'g'),
		multiLineComment:/\/\*(.|\s)*?\*\//g,
		newline: new RegExp(/(\n)|(\r\n)/,'g'),
		singleLineComment: new RegExp(/\/\/[^\n]*/,'g'),
		indent: new RegExp(/^\s*/,'g'),
		trailingWhitespace:/\s+$/g,
		text: new RegExp(/.+/,'g')
	}

	//initialize an array to store our full output
	let parsed = [str]

	//initiealize an array to store the output of this step
	let inProg = []
	
	//iterate over each of the tokens above
	//separate it from the rest of the text it is with
	//and store it as an object
	for(let [token, expression] of Object.entries(tokens)){
		for(let i = 0; i<parsed.length; ++i){
			
			//skip over stuff we've already parsed out, add it unchanged to the inProgress array
			if(typeof(parsed[i]) == 'object'){
				inProg.push(parsed[i])
				continue;
				
			}else{ 
				
				//evaluate the current text for strings that match the expression for our tokens
				//add the tokens into our inprogress array in the correct location, and leave everything else as text
				let tokensParsed = parsed[i].match(expression);
				let noTokens = parsed[i].replaceAll(expression, "^^^").split("^^^");
				
				//if no match, just push the string to our inProg array
				if(tokensParsed == null){
					inProg.push(parsed[i])
					continue
				}
				
				//otherwise, alternate between pushing the content and pushing tokens to our inProgress array
				for(let j=0; j<noTokens.length-1; ++j){
					if(noTokens[j] != ''){
						inProg.push(noTokens[j])
					}
					inProg.push({tokenType:token, content:tokensParsed[j]})
				}
				if(noTokens[noTokens.length-1] != ''){
					inProg.push(noTokens[noTokens.length-1])
				}			
			}
		}
		parsed = inProg
		inProg = []
	}
	let res = ""
	let indentBuff = []
	let lastIndent = ""
	let lineCount = 1
	
	//now that we've separated everything, time to start making our output string
	for(let i of parsed){
		
		//separate out the type and the content of the token
		let {tokenType, content} = i
		
		//if it's a text token, we want to take the last we saw indentation token
		//and compare it to the last indent token we processed with a text
		//so we know if this is tabbed in, tabbed out, or the same as the last line
		//of the script
		//Once we know this, add an INDENT, DEDENT, or nothing, and then the text we
		if(tokenType == "text"){
			if(indentBuff.length > 0){
				try{
					res += processIndent(indentBuff[indentBuff.length-1], lastIndent) + "\n"
				}catch(e){
					console.error(e.message + " at line " + lineCount)
					throw("ERROR IN PREPROCESSING")
				}
				lastIndent = indentBuff[indentBuff.length-1]
				indentBuff = []
			}
			res += content + "\n" 
		}else if(tokenType=="javaBlock"){
			//Surround with indent/dedent, strip single-line comments, and replace all non-required whitespace
			res+="INDENT\n"+content.replaceAll(/\/\/.*/g,"").replaceAll(/(\t|\n|\r)/g,"").replaceAll("}*","")+"\nDEDENT\n"		
		}else if(tokenType == "indent"){
			//add the indent to our buffer
			//it's done like this since not every indent is necessarily used in the final script
			//(comments etc)
			indentBuff.push(content)
		}else if(tokenType == "singleLineComment" || tokenType == "multiLineComment"){
			//add comments only if we want them to be included in the output
			if(includeComments){
				res += content + "\n"
			}
			indentBuff = []
		}else if(tokenType == "newline"){
			//just add a newline
			lineCount += 1
		}
	}
	res += processIndent("", lastIndent) + "\n"
	return res.replaceAll(/[\n]+/g,"\n").replaceAll(/\n$/g,"").replaceAll(/^\n+/g,"")
}

//compare current number of tabs to last number of tabs
//note that tabs are defined as either a tab character (\t) or 2 spaces (  )
function processIndent(currIndent, lastIndent){
	let tabRegex = new RegExp(/((\t)|([ ]{2}))/,'g')

	let lastTabs = lastIndent.match(tabRegex)
	let currTabs = currIndent.match(tabRegex)

	lastTabs = lastTabs == null ? 0 : lastTabs.length
	currTabs = currTabs == null ? 0 : currTabs.length

	let res = ""
	currIndent = currIndent.replaceAll(tabRegex, '')
	if(currIndent.replaceAll(tabRegex, '') != ''){
		console.log("BAD INDENT")
		throw('bad indentation')
	}

	if(lastTabs < currTabs){
		res += "INDENT\n".repeat(currTabs - lastTabs)
	}else if(lastTabs > currTabs){
		res += "DEDENT\n".repeat(lastTabs - currTabs)
	}else{
		res += "\n"
	}
	return res
}

export default {
	parse: parse
}