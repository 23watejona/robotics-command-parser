file = first:(function/javafunction)+
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
command = first:(WaitCommand/AutoAlignmentCommand/ArmScoreCommand/ArmScoreAutoCommand/BalancePIDCommand/DriveDistanceCommand/DriveTimeCommand/TurnCommand/TurnRelativeCommand/TurnTimeCommand/WheelGripperCommand) t:timeout?
{
	return first + (t != null ? t : "")
}
WaitCommand = newline "wait" p1:p
{
	return "new WaitCommand("+p1+")"
}
AutoAlignmentCommand = newline "autoAlign" p1:p p2:p p3:p
{
	return "new AutoAlignmentCommand("+p1+","+p2+","+p3+")"
}
ArmScoreCommand = newline "armScore" p1:p
{
	return "new ArmScoreCommand("+p1+")"
}
ArmScoreAutoCommand = newline "armAuto" p1:p
{
	return "new ArmScoreAutoCommand("+p1+")"
}
BalancePIDCommand = newline "balance" 
{
	return "new BalancePIDCommand("+")"
}
DriveDistanceCommand = newline "driveDistance" p1:p
{
	return "new DriveDistanceCommand("+p1+")"
}
DriveTimeCommand = newline "driveTime" p1:p p2:p
{
	return "new DriveTimeCommand("+p1+","+p2+")"
}
TurnCommand = newline "turn" p1:p
{
	return "new TurnCommand("+p1+")"
}
TurnRelativeCommand = newline "turnRelative" p1:p
{
	return "new TurnRelativeCommand("+p1+")"
}
TurnTimeCommand = newline "turnTime" p1:p p2:p
{
	return "new TurnTimeCommand("+p1+","+p2+")"
}
WheelGripperCommand = newline "gripper" p1:p
{
	return "new WheelGripperCommand("+p1+")"
}
f'function' = first:(getEnsurePreloadCommand/getOuttakePieceCommand/getPickupPieceCommand) t:timeout?
{
	return first + (t != null ? t : "")
}
getEnsurePreloadCommand = newline "ensurePreload"
{
	return "getEnsurePreloadCommand()"
}
getOuttakePieceCommand = newline "outtakePiece"
{
	return "getOuttakePieceCommand()"
}
getPickupPieceCommand = newline "pickupPiece"
{
	return "getPickupPieceCommand()"
}
timeout = space "with timeout" space p:text
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
text = s:[^\n]+ {return s.join("")}
newline'new line' = "\n" { return ""}