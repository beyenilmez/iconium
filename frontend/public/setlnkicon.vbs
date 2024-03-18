Dim Arg, shortcutPath, shortcutName, iconPath
Set Arg = WScript.Arguments

'Parameter1, begin with index0
shortcutPath = Arg(0)

'Parameter2
shortcutName = Arg(1)

'Parameter3
iconPath = Arg(2)

'Parameter4
iconIndex = Arg(3)

Set objShell = CreateObject("Shell.Application")
Set objFolder = objShell.NameSpace(shortcutPath)

Set objFolderItem = objFolder.ParseName(shortcutName)
Set objShortcut = objFolderItem.GetLink

objShortcut.SetIconLocation iconPath, iconIndex
objShortcut.Save

set Arg = Nothing