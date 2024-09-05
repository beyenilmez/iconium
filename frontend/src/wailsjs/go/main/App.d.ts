// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {main} from '../models';

export function ActionSelectImage(arg1:string):Promise<main.SelectImage>;

export function AddDeletePngRelativePath(arg1:string):Promise<void>;

export function AddFileToIconPackFromPath(arg1:string,arg2:string,arg3:boolean):Promise<void>;

export function AddFilesToIconPackFromDesktop(arg1:string):Promise<void>;

export function AddFilesToIconPackFromFolder(arg1:string,arg2:string,arg3:boolean):Promise<void>;

export function AddFilesToIconPackFromPath(arg1:string,arg2:Array<string>,arg3:boolean):Promise<void>;

export function AddIconPack(arg1:string,arg2:string,arg3:string,arg4:string,arg5:string):Promise<void>;

export function AddTempPngPath(arg1:string,arg2:string):Promise<void>;

export function ApplyIconPack(arg1:string):Promise<void>;

export function CheckForUpdate():Promise<main.UpdateInfo>;

export function ClearDeletePngPaths():Promise<void>;

export function ClearIconPackCache():Promise<void>;

export function ClearSelectImages():Promise<void>;

export function ClearTempPngPaths():Promise<void>;

export function CreateLastTab(arg1:string):Promise<void>;

export function DeleteDeletePngPaths():Promise<void>;

export function DeleteIconPack(arg1:string,arg2:boolean):Promise<void>;

export function Description(arg1:string):Promise<string>;

export function Destination(arg1:string):Promise<string>;

export function ExportIconPack(arg1:string):Promise<string>;

export function Ext(arg1:string):Promise<string>;

export function GeneralPathExits(arg1:string):Promise<boolean>;

export function GetBase64Png():Promise<string>;

export function GetConfig():Promise<main.Config>;

export function GetConfigField(arg1:string):Promise<any>;

export function GetFileInfoFromDesktop(arg1:string):Promise<Array<main.FileInfo>>;

export function GetFileInfoFromPaths(arg1:string,arg2:Array<string>):Promise<Array<main.FileInfo>>;

export function GetFilePath(arg1:string):Promise<string>;

export function GetIcnmMetadata(arg1:string):Promise<main.Metadata>;

export function GetIconFile():Promise<string>;

export function GetIconFiles():Promise<Array<string>>;

export function GetIconFolder():Promise<string>;

export function GetIconPack(arg1:string):Promise<main.IconPack>;

export function GetIconPackList():Promise<Array<main.IconPack>>;

export function GetIconPackPath():Promise<string>;

export function GetLoadConfigPath():Promise<string>;

export function GetSelectImage(arg1:string,arg2:string):Promise<main.SelectImage>;

export function GetTempPng(arg1:string):Promise<string>;

export function GetTempPngPath(arg1:string):Promise<string>;

export function GetVersion():Promise<string>;

export function IconLocation(arg1:string):Promise<string>;

export function ImportIconPack(arg1:string):Promise<string>;

export function Name(arg1:string):Promise<string>;

export function NeedsAdminPrivileges():Promise<boolean>;

export function OpenFileInExplorer(arg1:string):Promise<void>;

export function ReadConfig(arg1:string):Promise<void>;

export function ReadLastTab():Promise<string>;

export function RemoveDeletePng(arg1:string):Promise<void>;

export function RemoveTempPng(arg1:string):Promise<void>;

export function RestartApplication(arg1:boolean,arg2:Array<string>):Promise<void>;

export function SaveConfigDialog():Promise<void>;

export function SendNotification(arg1:string,arg2:string,arg3:string,arg4:string):Promise<void>;

export function SendWindowsNotification(arg1:string,arg2:string,arg3:string,arg4:string):Promise<void>;

export function SetConfigField(arg1:string,arg2:any):Promise<void>;

export function SetIconPack(arg1:main.IconPack):Promise<void>;

export function SetIconPackField(arg1:string,arg2:string,arg3:string,arg4:any):Promise<void>;

export function SetIconPackFiles(arg1:string,arg2:Array<main.FileInfo>):Promise<void>;

export function SetIconPackMetadata(arg1:string,arg2:main.Metadata):Promise<void>;

export function SetImageIfAbsent(arg1:string,arg2:string):Promise<void>;

export function SetSelectImage(arg1:string,arg2:string):Promise<void>;

export function SetTempImage(arg1:string,arg2:string):Promise<void>;

export function UUID():Promise<string>;

export function Update(arg1:string):Promise<void>;

export function UpdateAsAdmin(arg1:string):Promise<void>;

export function UploadSelectImage(arg1:string):Promise<main.SelectImage>;
