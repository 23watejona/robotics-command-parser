export function parse(str, includeComments = false){
	
	let tokens = {
		javaBlock: "java\\*{([\\s\\S]*?)}\\*",
		multiLineComment: "\\/\\*[\\s\\S]*?\\*\\/",
		singleLineComment: "\\/\\/[^\\n]*",
		newline: "(\n)|(\r\n)",
		indent: "((?<=\\n)\\s+)|(^\\s+)",
		trailingWhitespace:"\\s+(?=[\n])"
	}

	//initialize an array to store our full output

	
	
	
	let groupArray = []

	for (let [token, expression] of Object.entries(tokens)){
		groupArray.push(`(?<${token}>${expression})`)
	}

	let m = new RegExp(groupArray.join("|"), 'g')

	let parsed = []	
	let lastIndex = 0
	let lastLength = 0
	for(let match of str.matchAll(m)){	
		if(match.index - (lastIndex+lastLength) != 0){
			parsed.push({tokenType:'text', content:str.substring(lastIndex+lastLength, match.index)})
		}
		lastIndex = match.index
		lastLength = match[0].length
		for(let [g,s] of Object.entries(match.groups)){
			if(s != undefined){
				parsed.push({tokenType:g, content:s})
			}
		}
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
				//console.log(content)
				try{
					//let a = []
					//a.push(indentBuff[indentBuff.length-1], lastIndent)
					//console.log(a)
					res += processIndent(indentBuff[indentBuff.length-1], lastIndent) + "\n"
				}catch(e){
					console.error(e.message + " at line " + lineCount)
					throw("ERROR IN PREPROCESSING")
				}
				lastIndent = indentBuff[indentBuff.length-1]
				indentBuff = []
			}
			res += content + " " 
		}else if(tokenType=="javaBlock"){
			//Surround with indent/dedent, strip single-line comments, and replace all non-required whitespace
			res+="\nINDENT\n"+content.replaceAll(/\/\/.*/g,"").replaceAll(/(\t|\n|\r)/g,"").replaceAll("}*","")+"\nDEDENT\n"		
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
			indentBuff.push('')
			lineCount += 1
			res += "\n"
		}
	}
	res += processIndent("", lastIndent) + "\n"
	return res.replaceAll(/[\n]+/g,"\n").replaceAll(/\n$/g,"").replaceAll(/^\n+/g,"").replaceAll(/\s*(?=\n)/g, "")
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
	//console.log(res)
	return res
}

export default {
	parse: parse
}