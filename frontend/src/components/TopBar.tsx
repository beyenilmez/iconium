import { useEffect, useState } from "react";
import { useProfile } from "@/contexts/profile-provider";
import { GetProfiles, GetProfile } from "wailsjs/go/main/App";
import { Button } from "./ui/button";
import { Combobox } from "./ui/combobox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RefreshCw, Play, Plus } from 'lucide-react';
import { ModeToggle } from "./mode-toggle"
import { CreateProfileForm } from "./CreateProfileForm"

import { /* profile as profStruct, */ profileInfo } from "@/structs";

const TopBar = () => {
    const { setProfile } = useProfile();

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
                <Button variant="outline" size={"icon"}>
                    <RefreshCw />
                </Button>
                <Button variant="outline" size={"icon"}>
                    <Play />
                </Button>
                <ModeToggle />
            </div>
        </div>
    )
}

export default TopBar;