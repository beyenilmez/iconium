Dim Arg, shortcutPath, shortcutName, iconPath
Set Arg = WScript.Arguments

shortcutPath = Arg(0)
shortcutName = Arg(1)
shortcutDesc = Arg(2)

Set objShell = CreateObject("Shell.Application")
Set objFolder = objShell.NameSpace(shortcutPath)

Set objFolderItem = objFolder.ParseName(shortcutName)
Set objShortcut = objFolderItem.GetLink

objShortcut.Description = shortcutDesc
objShortcut.Save

set Arg = Nothing