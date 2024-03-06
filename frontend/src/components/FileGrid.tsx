import { useEffect, useState } from "react";
import { useProfile } from "@/contexts/profile-provider";
import { SaveProfile, GetFileInfo } from "wailsjs/go/main/App";
import { FileContainer } from "./FileContainer"

import { fileInfo } from "@/structs"
import { Button } from "./ui/button";
import { PlusSquare } from "lucide-react";

export const FileGrid = () => {
    const { profile, setProfile } = useProfile();
    const [fileInfos, setFileInfos] = useState<fileInfo[]>();

    /* const GetDesktopIconsF = () => {
        GetDesktopIcons().then((res) => {
            console.log(res);
            setFileInfos(res);
        })
    }

    useEffect(() => {
        GetDesktopIconsF();
    }, []) */

    useEffect(() => {
        setFileInfos(profile?.value);
    }, [profile])

    const AddRow = () => {
        GetFileInfo(profile.name).then((fileInfo) => {
            setProfile({ ...profile, value: [...profile.value, fileInfo] })
            SaveProfile(profile.name, JSON.stringify({ ...profile, value: [...profile.value, fileInfo] }))
        })
    }


    return (
        <div className="grid grid-cols-1">
            {fileInfos?.map((fileInfo, i) => (
                <FileContainer key={i} index={i} fileInfo={fileInfo} />
            ))}
            <div className="flex justify-center items-center p-8">
                {profile.name && (
                    <Button variant="outline" size={"lg"} className="space-x-2" onClick={AddRow}>
                        <PlusSquare />
                        <div>
                            Add new file
                        </div>
                    </Button>
                )}
            </div>

        </div>
    )
}