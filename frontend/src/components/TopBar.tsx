import { useEffect, useState } from "react";
import { useProfile } from "@/contexts/profile-provider";
import { GetProfiles, GetProfile, SyncDesktop, RemoveProfile, SetIcon, RunProfile } from "wailsjs/go/main/App";
import { Button } from "./ui/button";
import { Combobox } from "./ui/combobox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RefreshCw, Play, Plus } from 'lucide-react';
import { ModeToggle } from "./mode-toggle"
import { CreateProfileForm } from "./CreateProfileForm"

import { /* profile as profStruct, */ profileInfo, fileInfo } from "@/structs";

const TopBar = () => {
    const { profile, setProfile } = useProfile();

    const [profiles, setProfiles] = useState<profileInfo[]>([]);

    useEffect(() => {
        GetProfilesF();
    }, [])

    const GetProfilesF = () => {
        GetProfiles().then((res) => setProfiles(res));
    }

    const onProfileChange = (profileName: string) => {
        GetProfile(profileName).then((res) => {
            setProfile(res);
        });
    }

    return (
        <div className="top-0 z-50 sticky flex justify-between bg-muted shadow-sm p-2 border-b w-full">
            <div className="flex items-center space-x-2">
                <Combobox placeholder="Select a profile" noElementsText="No profile found" searchBar={false}
                    elements={profiles}
                    onChange={(value) => onProfileChange(value)}
                    onExpand={() => GetProfilesF()}
                    onElementContextMenu={(value) => console.log("Context: " + value)}
                />
                <Popover>
                    <PopoverTrigger>
                        <Button variant="outline" size={"icon"}>
                            <Plus />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <CreateProfileForm />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="flex items-center space-x-2">
                {profile.name && (
                    <Button variant="destructive" size={"lg"} className="space-x-2" onClick={() => {
                        RemoveProfile(profile.name);
                        setProfile({ name: "", id: "", value: [] })
                    }}>
                        Remove Profile
                    </Button>
                )}
                <Button variant="outline" size={"lg"} className="space-x-2" onClick={() => {
                    SyncDesktop(profile.name, true).then((profile) => setProfile(profile));
                }}>
                    <RefreshCw />
                    <div>
                        Get Desktop
                    </div>
                </Button>
                <Button variant="outline" size={"icon"} onClick={() => {
                    const fileInfos : fileInfo[] = profile.value;

                    RunProfile(profile.name, fileInfos);
                }}>
                    <Play />
                </Button>
                <ModeToggle />
                <Button variant={"secondary" } onClick={() => {
                    const fileInfo : fileInfo[] = profile.value;

                    SetIcon(profile.name, fileInfo[2]);
                }}>
                    Test
                </Button>
            </div>
        </div>
    )
}

export default TopBar;