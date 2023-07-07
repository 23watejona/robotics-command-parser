export function parse(str, includeComments = false){
	
	let tokens = {
		javaBlock: "java\\*{([\\s\\S]*?)}\\*",
		multiLineComment: "\\/\\*[\\s\\S]*?\\*\\/",
		singleLineComment: "\\/\\/[^\\n]*",
		newline: "(\n)|(\r\n)",
		whitespace: "[^\\S\\r\\n]+",
	}
	
	let groupArray = []
	for (let [token, expression] of Object.entries(tokens)){
		groupArray.push(`(?<${token}>${expression})`)
	}

	let m = new RegExp(groupArray.join("|"), 'g')

	let lastIndex = 0
	let lastLength = 0
	let res = ""
	let processor = processToken()
	processor.next()

	for(let match of str.matchAll(m)){
		if(match.index - (lastIndex+lastLength) != 0){
			try{
				res = processor.next({type:'text', content:str.substring(lastIndex+lastLength, match.index)})
			}catch(e){
				e.message += " at line " + (str.substring(0, match.index).match(/\n/g).length + 1)
				throw e
			}
		}
		lastIndex = match.index
		lastLength = match[0].length
		for(let [g, s] of Object.entries(match.groups)){
			if(s){
				try{
					res = processor.next({type:g, content:s})
				}catch(e){
					e.message += " at line " + (str.substring(0, match.index+s.length+1).match(/\n/g).length + 1)
					throw e
				}
			}
		}
	}
	return res.value
}


function* processToken(includeComments){
	let output = ""
	let lastType = null
	let stlType = null
	let lastIndent = ""
	let lastWhitespace = ""
	while(true){
		//separate out the type and the content of the token
		let {type, content} = yield output
		//if it's a text token, we want to take the last we saw indentation token
		//and compare it to the last indent token we processed with a text
		//so we know if this is tabbed in, tabbed out, or the same as the last line
		//of the script
		//Once we know this, add an INDENT, DEDENT, or nothing, and then the text we
		if(type == "text"){

			if(stlType != null && lastType != null && lastType == "whitespace" && stlType == "text"){
				output += lastWhitespace
			} 

			if(stlType != null && lastType != null && (stlType == "newline" || lastType == "newline")){
				output += processIndent(lastWhitespace, lastIndent)
				lastIndent = lastWhitespace
			}

			output += content
		}else if(type=="javaBlock"){
			//Surround with indent/dedent, strip single-line comments, and replace all non-required whitespace
			output+="INDENT\n"+content.replaceAll(/\/\/.*/g,"").replaceAll(/(\t|\n|\r)/g,"").replaceAll("}*","")+"\nDEDENT"		
		}else if(type == "whitespace"){
			//add the indent to our buffer
			//it's done like this since not every indent is necessarily used in the final script
			//(comments etc)
			lastWhitespace = content
		}else if(type == "singleLineComment" || type == "multiLineComment"){
			//add comments only if we want them to be included in the output
			if(includeComments){
				output += content + "\n"
			}
			continue;
		}else if(type == "newline"){
			//just add a newline
			lastWhitespace = ""
			if(output.slice(-1) != "\n"){
				output += "\n"
			}
		}
		stlType = lastType
		lastType = type
	}
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
		throw new Error('BAD INDENTATION')
	}

	if(lastTabs < currTabs){
		res += "INDENT\n".repeat(currTabs - lastTabs)
	}else if(lastTabs > currTabs){
		res += "DEDENT\n".repeat(lastTabs - currTabs)
	}
	return res
}

export default {
	parse: parse
}