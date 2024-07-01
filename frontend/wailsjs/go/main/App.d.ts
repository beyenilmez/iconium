// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {main} from '../models';

export function CheckForUpdate():Promise<main.UpdateInfo>;

export function GetConfigField(arg1:string):Promise<string>;

export function GetLoadConfigPath():Promise<string>;

export function GetVersion():Promise<string>;

export function NeedsAdminPrivileges():Promise<boolean>;

export function OpenFileInExplorer(arg1:string):Promise<void>;

export function ReadConfig(arg1:string):Promise<void>;

export function RestartApplication(arg1:boolean,arg2:Array<string>):Promise<void>;

export function SaveConfigDialog():Promise<void>;

export function SendNotification(arg1:string,arg2:string,arg3:string,arg4:string):Promise<void>;

export function SetConfigField(arg1:string,arg2:string):Promise<void>;

export function SetTheme(arg1:string):Promise<void>;

export function Update(arg1:string):Promise<void>;
