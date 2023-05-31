# ROBOTICS COMMAND STRUCTURE GENERATOR
# AUTHOR: Jonathan Waters

The purpose of this package is to allow for easier/more human-readable command structuring for the Command Based Java template of the FRC competition.  
Using Python style indentation, it removes much of the boilerplate Java required to generate command structures.  
The output is legal, unformatted Java, and consists of a Class with a variety of static methods that each return a Command  
My goal here was to make the simple parts of command structuring simple, while also maintaining the ability to do more complex tasks  


## The script
Single and multi-line Java comments are supported throughout the script  
At the top level of indentation, you can define a method using any legal Java method name  
Indenting in from there, we start to define the command structure for that method. This can take 2 forms:  
1. pure-Java Method
2. command structure

You may only use 1 of these per method.

### Java Methods
Java Methods are defined by `java*{ ...Java code }*`  
These do not use the built-in command structuring of the scripting language,  
This just allows for valid Java to be added  
You are responsible for returning a valid command  
Note: single-line comments, all beginning and trailing whitespace, and newlines will be stripped in the output  
Note: you must also provide the parameters to the function

Example:
```
sampleJavaMethod()
	java*{
		if(doThis){
			return new oneJavaCommand();
		}else{
			return new otherJavaCommand();
		}
	}*
```

### Command Structures

Command Structures consist of 3 major parts(options?)
1. structures
2. commands
3. methods(kinda)

#### Structures
Structures are the built-in command-based structures from WPILib: SequentialCommandGroup, ParallelCommandGroup, ParallelRaceGroup, and ParallelDeadlineGroup  
In the scripting language, each of these is broken down to a more readable name, respectively: sequential, parallel, parallelRace, and parallelDeadline  
To place commands, structures, or methods, within a structure, simply place them indented underneath, like in python  

Example:
```
sampleStructureMethod
	sequential
		doOneCommand
		doNextCommand
		parallel
			doThis
			andThis
			atTheSameTime
```

#### Commands
These are the team-specific commands you have written, and will be given a more human-readable name(more on this later)  
They accept parameters in 2 different types of ways  
In both cases, separate parameters are separated by spaces, and are given in the order you expect them to go into the command  
Types:
1. any text that contains no spaces
2. anything, with or without spaces, contained within braces {}

Example:
```
sampleStructureAndCommandMethod
	sequential
		humanReadableCommand 100000 stringParameter {any random text I might need :)}
		otherHumanReadableCommand
```

#### Methods
While self-referencing methods defined in the script is not automatically allowed, you can define scripting names for them
and add the ability to parse them when you generate the grammar  
right now, there is no capability to pass parameters to these methods  
otherwise, you can basically treat them the same as commands  

#### Timeouts
In command-based, an often useful feature is to add a timeout to any command or structure  
In this language, you can do that as well, by adding `with timeout {amt of time}` to the end of the line of the command or structure you want it to be used on  

## Generating a grammar for your team's specific commands
To generate a grammar, the function accepts 2 parameters, both of which are JSON texts:
1. A Command List
2. A Function(Method) List

### The Command List
Each command is defined as an entry in the JSON Command List
The key for the command entry is the full name of the command
The command entry is an object with entries as follows
- Required
  - name
    : The name you would like to use for scripting
  - parameters: An object with each entry relating to a parameter for the command, each is labeled as 'p{which parameter number it is}', starting at 1
    - If you have no parameters to the command, just leave the object empty, but make sure it exists
	- entries in each parameter object - while this is not strictly required to be populated, I strongly recommend that you do
		- name: name of the parameter
		- description: longer description of what it is
		- type: the type of parameter it is eg:number/javaObject/*select*
		- *if type is select* options
		   - labeled by 'opt{option number}' starting at 1
		   - each entry's value is the value of that option
- Optional
  - prefix
	- for select parameters, you are often selecting a value from an enum, 
	such that the value of it ends up being something like 'ArmPosition.kHIGH'
	This allows you to just put the option value as 'kHigh', and put the prefix,
	which is shared between all options, as 'ArmPosition'
Example Command List
```
{
  "WaitCommand": {
	"name": "wait",
	"parameters": {
		"p1":{
			"name":"Time",
			"description": "Wait time in seconds",
			"type":"number"
		}
	}
  },
  "AutoAlignmentCommand":{
	"name":"autoAlign",
	"parameters":{
		"p1":{
			"name":"Target Pose",
			"description":"Target Pose",
			"type":"javaObject"
		},
		"p2":{
			"name":"Distance Threshold",
			"description":"distance threshold in meters",
			"type":"number"
		},
		"p3":{
			"name":"angle threshold",
			"description":"angle threshold in degrees",
			"type":"number"
		}
	}
  },
  "ArmScoreCommand": {
    "name": "armScore",
    "prefix": "ArmPosition",
    "parameters": {
      "p1": {
        "name": "Arm Position",
        "description": "Arm Position",
        "type": "select",
        "options": {
          "opt1": "HIGH",
          "opt2": "HIGH_BACK",
          "opt3": "MEDIUM_FORWARD",
          "opt4": "MEDIUM_BACK",
          "opt5": "LOW",
          "opt6": "POCKET",
          "opt7": "SUBSTATION",
          "opt8": "TO_BACK_INTERMEDIATE",
          "opt9": "TO_FORWARD_INTERMEDIATE",
          "opt10": "HIGH_INTERMEDIATE",
          "opt11": "POCKET_INTERMEDIATE",
          "opt12": "SETTLE_POSITION",
          "opt13": "HOLD"
        }
      }
    }
  },
    "ArmScoreAutoCommand": {
    "name": "armAuto",
    "prefix": "ArmScoreAutoCommand.ArmPosition",
    "parameters": {
      "p1": {
        "name": "Arm Position",
        "description": "Arm Position",
        "type": "select",
        "options": {
          "opt1": "HIGH",
          "opt2": "HIGH_BACK",
          "opt3": "MEDIUM_FORWARD",
          "opt4": "MEDIUM_BACK",
          "opt5": "LOW",
          "opt6": "POCKET",
          "opt7": "SUBSTATION",
          "opt8": "TO_BACK_INTERMEDIATE",
          "opt9": "TO_FORWARD_INTERMEDIATE",
          "opt10": "HIGH_INTERMEDIATE",
          "opt11": "POCKET_INTERMEDIATE",
          "opt12": "SETTLE_POSITION",
          "opt13": "HOLD"
        }
      }
    }
  },
   "BalancePIDCommand": {
    "name": "balance",
    "parameters": {}
  }
}
```

### The function(method) list
It's a JSON object where each entry is '{full method name}: {scripting name}'

Example:
```
{
	"getEnsurePreloadCommand":	"ensurePreload",
	"getOuttakePieceCommand":"outtakePiece",
	"getPickupPieceCommand":"pickupPiece"
}
```

## How to use the package

Now that you know how to set everything up, it's time to start making some java!

1. To start off, import the package into your file. 
   - `const commandParseUtil = require('robotics-command-parser')`
2. Next, generate a grammar based on your command list and function list.
   - Parameters are: commandList, functionList in JSON format
   - `let generatedGrammar = commandParseUtil.generateGrammar(fs.readFileSync("./commandList.json"), fs.readFileSync("./functionList.json"))`
3. Set that as the grammar to use for parsing
   - `commandParseUtil.setGrammar(generatedGrammar)`
4. Parse your script into java!
   - parameters: Final class name, any number of scripts that contain methods you want to end up in this class
   - `let parsed = commandParseUtil.parse("CommandComposer", fs.readFileSync('./script.txt').toString()`)
5. You're done!