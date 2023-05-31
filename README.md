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
Note: you must also provide the  
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
  - parameters
    : An object with each entry relating to a parameter for the command, each is labeled as 'p{which parameter number it is}', starting at 1
    - entries in each parameter object - while this is not strictly required to be populated, I strongly recommend that you do
		- name
          : name of the parameter
		- description
		   : longer description of what it is
		- type
		   : the type of parameter it is eg:number/javaObject/*select*