export function parse(str, includeComments = false){
	let tokens = {
		multiLineComment:/\/\*(.|\s)*?\*\//g,
		javaBlock: new RegExp(/java\*{((.|\s)*?)}\*/,'g'),
		newline: new RegExp(/(\n)|(\r\n)/,'g'),
		singleLineComment: new RegExp(/\/\/[^\n]*/,'g'),
		indent: new RegExp(/^\s*/,'g'),
		trailingWhitespace:/\s+$/g,
		text: new RegExp(/.+/,'g')
	}

	let parsed = [str]

	let inProg = []
	for(let [token, expression] of Object.entries(tokens)){
		for(let i = 0; i<parsed.length; ++i){
			if(typeof(parsed[i]) == 'object'){
				inProg.push(parsed[i])
				continue;
			}else{
				let tokensParsed = parsed[i].match(expression);
				let noTokens = parsed[i].replaceAll(expression, "^^^").split("^^^");
				if(tokensParsed == null){
					inProg.push(parsed[i])
					continue
				}
				for(let j=0; j<noTokens.length-1; ++j){
					if(noTokens[j] != ''){
						inProg.push(noTokens[j])
					}
					inProg.push({tokenType:token, content:tokensParsed[j]})
				}
				if(noTokens[noTokens.length-1] != ''){
					inProg.push(noTokens[noTokens.length-1])
				}			}
		}
		parsed = inProg
		inProg = []
	}
//	console.log(parsed)
	let res = ""
	let indentBuff = []
	let lastIndent = ""
	let lineCount = 1
	for(let i of parsed){
		let {tokenType, content} = i
		//console.log(tokenType, content)
		if(tokenType == "text"){
			if(indentBuff.length > 0){
				try{
					res += processIndent(indentBuff[indentBuff.length-1], lastIndent) + "\n"
				}catch(e){
					console.error(e.message + " at line " + lineCount)
					throw("ERROR PROCESSING")
				}
				lastIndent = indentBuff[indentBuff.length-1]
				indentBuff = []
			}
			res += content + "\n" 
		}else if(tokenType=="javaBlock"){
			res+="INDENT\n"+content.replaceAll(/\/\/.*/g,"").replaceAll(/(\t|\n|\r)/g,"").replaceAll("}*","")+"\nDEDENT\n"		
		}else if(tokenType == "indent"){
			indentBuff.push(content)
		}else if(tokenType == "singleLineComment" || tokenType == "multiLineComment"){
			if(includeComments){
				res += content + "\n"
			}
			indentBuff = []
		}else if(tokenType == "newline"){
			lineCount += 1
		}
	}
	res += processIndent("", lastIndent) + "\n"
	return res.replaceAll(/[\n]+/g,"\n").replaceAll(/\n$/g,"").replaceAll(/^\n+/g,"")
}

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

	//console.log(lastTabs, currTabs)

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