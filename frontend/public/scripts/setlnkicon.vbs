Dim Arg, shortcutPath, shortcutName, iconPath, iconIndex
Set Arg = WScript.Arguments

shortcutPath = Arg(0)
shortcutName = Arg(1)
iconPath = Arg(2)
iconIndex = Arg(3)

Set objShell = CreateObject("Shell.Application")
Set objFolder = objShell.NameSpace(shortcutPath)

Set objFolderItem = objFolder.ParseName(shortcutName)
Set objShortcut = objFolderItem.GetLink

objShortcut.SetIconLocation iconPath, iconIndex
objShortcut.Save

set Arg = Nothing