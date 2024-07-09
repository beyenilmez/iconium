// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {main} from '../models';

export function AddFileToIconPackFromPath(arg1:string,arg2:string,arg3:boolean):Promise<void>;

export function AddFilesToIconPackFromDesktop(arg1:string):Promise<void>;

export function AddFilesToIconPackFromFolder(arg1:string,arg2:string,arg3:boolean):Promise<void>;

export function AddIconPack(arg1:string,arg2:string,arg3:string,arg4:string):Promise<void>;

export function CheckForUpdate():Promise<main.UpdateInfo>;

export function DeleteIconPack(arg1:string):Promise<void>;

export function GetBase64Image(arg1:string,arg2:string):Promise<string>;

export function GetBase64Png():Promise<string>;

export function GetConfig():Promise<main.Config>;

export function GetConfigField(arg1:string):Promise<any>;

export function GetIconFile():Promise<string>;

export function GetIconFolder():Promise<string>;

export function GetIconPack(arg1:string):Promise<main.IconPack>;

export function GetIconPackInfo():Promise<Array<main.IconPack>>;

export function GetLoadConfigPath():Promise<string>;

export function GetVersion():Promise<string>;

export function NeedsAdminPrivileges():Promise<boolean>;

export function OpenFileInExplorer(arg1:string):Promise<void>;

export function ReadConfig(arg1:string):Promise<void>;

export function RestartApplication(arg1:boolean,arg2:Array<string>):Promise<void>;

export function SaveConfigDialog():Promise<void>;

export function SendNotification(arg1:string,arg2:string,arg3:string,arg4:string):Promise<void>;

export function SetConfigField(arg1:string,arg2:any):Promise<void>;

export function SetIconPackInfo(arg1:main.IconPack):Promise<void>;

export function Test():Promise<void>;

export function Test2():Promise<void>;

export function Update(arg1:string):Promise<void>;

export function UpdateAsAdmin(arg1:string):Promise<void>;
