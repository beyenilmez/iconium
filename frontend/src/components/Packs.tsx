"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  CircleHelp,
  Edit,
  FolderSearch,
  Monitor,
  Trash,
  Upload,
} from "lucide-react";
import {
  AreYouSureDialog,
  AreYouSureDialogRef,
} from "@/components/ui/are-you-sure";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SelectImage from "./SelectImage";
import {
  AddFilesToIconPackFromDesktop,
  AddFilesToIconPackFromFolder,
  AddFileToIconPackFromPath,
  AddIconPack,
  DeleteIconPack,
  GetIconFile,
  GetIconFolder,
  GetIconPack,
  GetIconPackInfo,
  SetIconPackInfo,
  Test,
} from "@/wailsjs/go/main/App";
import { main } from "@/wailsjs/go/models";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  SettingContent,
  SettingLabel,
  SettingsItem,
} from "./ui/settings-group";
import Image from "./Image";

export default function Packs() {
  const [pack, setPack] = useState("");
  const [selectedPack, setSelectedPack] = useState<main.IconPack>(
    main.IconPack.createFrom({
      metadata: {
        id: "",
        name: "",
        description: "",
        icon: "",
      },
      files: [],
      settings: {
        enabled: false,
      },
    })
  );
  const [packInfos, setPackInfos] = useState<main.IconPack[]>();

  const dialogCloseRef = useRef(null);

  const loadPackInfo = async () => {
    const packInfos = await GetIconPackInfo();
    setPackInfos(packInfos);
  };

  const reloadSelectedPack = () => {
    if (pack) {
      GetIconPack(pack).then(setSelectedPack);
    }
  };

  useEffect(() => {
    loadPackInfo();
  }, []);

  useEffect(() => {
    reloadSelectedPack();
  }, [pack]);

  return (
    <Tabs value={pack} className="flex flex-row w-full h-full">
      <TabsList className="flex-col justify-start px-2 rounded-none w-96 h-[calc(100vh-5.5rem)] overflow-y-auto shrink-0">
        <Button onClick={Test}>Test</Button>
        {packInfos?.map((pack) => (
          <PackTrigger
            key={pack.metadata.id}
            iconPack={pack}
            setPack={setPack}
            reloadSelectedPack={reloadSelectedPack}
          />
        ))}

        <Dialog>
          <DialogTrigger className="w-full">
            <Button variant={"outline"} className="my-2 py-6 w-full">
              Create New Pack
            </Button>
          </DialogTrigger>
          <DialogClose ref={dialogCloseRef} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Icon Pack</DialogTitle>
            </DialogHeader>
            <CreatePackForm
              loadPackInfo={loadPackInfo}
              dialogCloseRef={dialogCloseRef}
            />
          </DialogContent>
        </Dialog>
      </TabsList>

      {pack && (
        <PackContent
          iconPack={selectedPack}
          setPack={setPack}
          loadPackInfo={loadPackInfo}
        />
      )}
    </Tabs>
  );
}

interface PackTriggerProps {
  iconPack: main.IconPack;
  setPack: (pack: string) => void;
  reloadSelectedPack: () => void;
}

function PackTrigger({
  iconPack,
  setPack,
  reloadSelectedPack,
  ...props
}: PackTriggerProps) {
  const [enabledState, setEnabledState] = useState(iconPack.settings.enabled);

  useEffect(() => {
    setEnabledState(iconPack.settings.enabled);
  }, [iconPack]);

  const handleEnable = () => {
    iconPack.settings.enabled = !iconPack.settings.enabled;
    SetIconPackInfo(iconPack).then(() => {
      setEnabledState(!enabledState);
      reloadSelectedPack();
    });
  };

  return (
    <TabsTrigger
      value={iconPack.metadata.id}
      onClick={() => setPack(iconPack.metadata.id)}
      className="flex justify-between p-4 w-full"
      {...props}
    >
      <div className="flex gap-4 w-full">
        {iconPack.metadata.icon ? (
          <img
            src={iconPack.metadata.icon}
            alt="pack-icon"
            className="w-12 h-12"
          />
        ) : (
          <CircleHelp className="w-12 h-12" />
        )}
        <div className="flex flex-col items-start">
          <div className="w-52 text-ellipsis text-left overflow-hidden">
            {iconPack.metadata.name}
          </div>
          <div className="opacity-50 ml-1">{iconPack.metadata.version}</div>
        </div>
      </div>
      <Switch checked={enabledState} onCheckedChange={handleEnable} onClick={(e) => e.stopPropagation()} />
    </TabsTrigger>
  );
}

interface PackContentProps {
  iconPack: main.IconPack;
  setPack: (pack: string) => void;
  loadPackInfo: () => void;
}

function PackContent({ iconPack, setPack, loadPackInfo }: PackContentProps) {
  const [editMode, setEditMode] = useState(false);
  const [iconPackInfo, setIconPackInfo] = useState(iconPack);
  const dialogRef = useRef<AreYouSureDialogRef>(null);

  // Reset the icon pack when the pack changes
  useEffect(() => {
    handleCancel();
    setIconPackInfo(iconPack);
  }, [iconPack]);

  const handleChange = (
    field: keyof main.IconPack["metadata"],
    value: string
  ) => {
    setIconPackInfo(
      (prev) =>
        ({
          ...prev,
          metadata: {
            ...prev.metadata,
            [field]: value,
          },
        } as main.IconPack)
    );
  };

  const handleEdit = () => {
    setIconPackInfo(iconPack);
    setEditMode(true);
  };

  const handleSave = () => {
    SetIconPackInfo(iconPackInfo).then(loadPackInfo);
    setEditMode(false);
  };

  const handleCancel = () => {
    setIconPackInfo(iconPack);
    setEditMode(false);
  };

  const handleDelete = () => {
    DeleteIconPack(iconPack.metadata.id).then(() => {
      setPack("");
      loadPackInfo();
    });
  };

  const handleSettingChange = (
    field: keyof main.IconPack["settings"],
    value: boolean
  ) => {
    const newIconPackInfo = {
      ...iconPackInfo,
      settings: {
        ...iconPackInfo.settings,
        [field]: value,
      },
    } as main.IconPack;

    setIconPackInfo(newIconPackInfo);
    SetIconPackInfo(newIconPackInfo).then(loadPackInfo);
  };

  const fields: (keyof main.IconPack["metadata"])[] = [
    "name",
    "version",
    "author",
  ];

  const openDialog = useCallback(() => {
    if (dialogRef.current) {
      dialogRef.current.openDialog();
    }
  }, []);

  return (
    <TabsContent
      value={iconPack.metadata.id}
      className="flex flex-col gap-4 p-6 w-full h-[calc(100vh-5.5rem)] overflow-y-auto"
    >
      <div className="bg-card p-4 rounded-md w-full">
        <div className="mb-3 pb-1 border-b font-medium text-xl">
          Pack Information
        </div>
        <div className="flex flex-row justify-between items-end gap-6">
          <div className="flex items-center gap-6">
            <SelectImage
              icon={iconPackInfo.metadata.icon}
              onIconChange={(icon) => handleChange("icon", icon)}
              sizeClass="w-12 h-12"
              editSizeClass="w-7 h-7"
              editable={editMode}
            />
            <div className="flex flex-row gap-8">
              {fields.map((field) => (
                <div key={field} className="flex flex-col gap-1">
                  <div className="font-medium text-xs">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </div>
                  {editMode ? (
                    <Input
                      value={iconPackInfo.metadata[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                    />
                  ) : (
                    <div className="opacity-60">{iconPack.metadata[field]}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex h-full">
            {!editMode ? (
              <>
                <Button variant="ghost" size="icon" onClick={handleEdit}>
                  <Edit className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" onClick={openDialog}>
                  <Trash className="w-6 h-6" />
                </Button>
                <AreYouSureDialog
                  ref={dialogRef}
                  cancelText="Delete"
                  acceptText="Cancel"
                  title="Are you sure you want to delete this pack?"
                  description="This action can not be undone."
                  onCancel={handleDelete}
                />
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleSave}>
                  Save
                </Button>
                <Button
                  variant="outline"
                  className="ml-2"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card p-4 rounded-md w-full">
        <div className="mb-3 pb-1 border-b font-medium text-xl">
          Pack Actions
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <Button variant={"default"} className="flex gap-2.5">
            Apply Icon Pack
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={"secondary"}
            className="flex gap-2.5"
            onClick={() => {
              GetIconFolder().then((folder) => {
                if (folder) {
                  AddFilesToIconPackFromFolder(
                    iconPack.metadata.id,
                    folder,
                    true
                  ).then(() => {
                    loadPackInfo();
                    GetIconPack(iconPack.metadata.id).then((iconPack) => {
                      setIconPackInfo(iconPack);
                    });
                  });
                }
              });
            }}
          >
            <FolderSearch className="w-6 h-6" /> Add Icons From Folder
          </Button>
          <Button
            variant={"secondary"}
            className="flex gap-2.5"
            onClick={() => {
              AddFilesToIconPackFromDesktop(iconPack.metadata.id).then(() => {
                loadPackInfo();
                GetIconPack(iconPack.metadata.id).then((iconPack) => {
                  setIconPackInfo(iconPack);
                });
              });
            }}
          >
            <Monitor className="w-6 h-6" /> Add Icons From Desktop
          </Button>
          <Button
            variant={"secondary"}
            className="flex gap-2.5"
            onClick={() => {
              GetIconFile().then((file) => {
                if (file) {
                  AddFileToIconPackFromPath(
                    iconPack.metadata.id,
                    file,
                    true
                  ).then(() => {
                    loadPackInfo();
                    GetIconPack(iconPack.metadata.id).then((iconPack) => {
                      setIconPackInfo(iconPack);
                    });
                  });
                }
              });
            }}
          >
            <Upload className="w-6 h-6" /> Add Icon
          </Button>
        </div>
      </div>

      <div className="bg-card p-4 rounded-md w-full">
        <div className="mb-3 pb-1 border-b font-medium text-xl">
          Pack Settings
        </div>
        <SettingsItem className="border-none">
          <SettingLabel>Enabled</SettingLabel>
          <SettingContent>
            <Switch
              checked={iconPackInfo.settings.enabled}
              onCheckedChange={(enabled) =>
                handleSettingChange("enabled", enabled)
              }
            />
          </SettingContent>
        </SettingsItem>
      </div>

      <div className="bg-card p-4 rounded-md w-full">
        <div className="mb-3 pb-1 border-b font-medium text-xl">Icons</div>
        <div className="flex flex-wrap gap-2">
          {iconPackInfo.files?.map((file) =>
            file.hasIcon ? (
              <Image
                key={file.id}
                src={
                  "packs\\" +
                  iconPack.metadata.id +
                  "\\icons\\" +
                  file.id +
                  ".png"
                }
                className="w-10 h-10"
              />
            ) : null
          )}
        </div>
      </div>
    </TabsContent>
  );
}

interface CreatePackFormProps {
  loadPackInfo: () => void;
  dialogCloseRef: React.RefObject<HTMLButtonElement>;
}

function CreatePackForm({ loadPackInfo, dialogCloseRef }: CreatePackFormProps) {
  const formSchema = z.object({
    icon: z.string(),
    name: z
      .string()
      .min(1, { message: "Name is required" })
      .max(32, { message: "Name can not exceed 32 characters" })
      // Check for windows file name compatibility
      .regex(/^(?!\.)/, { message: "Name can not start with a period" })
      .regex(/^(?!.*\.$)/, {
        message: "Name can not end with a period",
      }),
    version: z.string().regex(/^v[0-9]{1,4}\.[0-9]{1,4}\.[0-9]{1,4}$/, {
      message: "Version must be in the format: v1.0.0",
    }),
    author: z
      .string()
      .max(32, { message: "Author can not exceed 32 characters" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      icon: "",
      name: "",
      version: "v1.0.0",
      author: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    AddIconPack(data.name, data.version, data.author, data.icon).then(() => {
      loadPackInfo();
      dialogCloseRef.current?.click();
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2.5"
        autoComplete="off"
      >
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>Icon</FormLabel>
              <SelectImage
                icon={field.value}
                sizeClass="w-12 h-12"
                editSizeClass="w-7 h-7"
                onIconChange={(icon) => form.setValue("icon", icon)}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="My profile" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Version</FormLabel>
              <FormControl>
                <Input placeholder="v1.0.0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="mt-3">
          Create
        </Button>
      </form>
    </Form>
  );
}
