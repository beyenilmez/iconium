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
  Download,
  Edit,
  FolderOpen,
  Loader2,
  LucideTrash,
  Monitor,
  Pencil,
  Plus,
  RefreshCw,
  SquarePlus,
  Trash,
  Upload,
  UploadIcon,
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
  AddDeletePngPath,
  AddFilesToIconPackFromDesktop,
  AddFilesToIconPackFromPath,
  AddIconPack,
  AddTempPngPath,
  ApplyIconPack,
  ClearDeletePngPaths,
  ClearIconPackCache,
  ClearTempPngPaths,
  CreateLastTab,
  DeleteIconPack,
  Description,
  Destination,
  Ext,
  GetFileInfoFromDesktop,
  GetFileInfoFromPaths,
  GetFilePath,
  GetIconFiles,
  GetIconPack,
  GetIconPackList,
  GetTempPngPath,
  IconLocation,
  Name,
  ReadLastTab,
  SetIconPackField,
  SetIconPackFiles,
  SetIconPackMetadata,
  UUID,
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
  SettingDescription,
  SettingLabel,
  SettingsItem,
} from "./ui/settings-group";
import Image from "./Image";
import { Slider } from "./ui/my-slider";
import { Skeleton } from "./ui/skeleton";
import { Checkbox } from "./ui/checkbox";
import { useTranslation } from "react-i18next";
import { useStorage } from "@/contexts/storage-provider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LogDebug } from "@/wailsjs/runtime/runtime";
import { Label } from "./ui/label";

export default function Packs() {
  const { t } = useTranslation();
  const { setValue } = useStorage();

  const [editingIconPack, setEditingIconPack] = useState(false);
  useEffect(() => {
    setValue("editingIconPack", editingIconPack);
  }, [editingIconPack]);

  const [selectedPackId, setSelectedPackId] = useState("");
  const [iconPacks, setIconPacks] = useState<main.IconPack[]>();
  const [selectedPackKeyCount, setSelectedPackKeyCount] = useState(0);

  const [reloadingIconPacks, setReloadingIconPacks] = useState(false);

  const dialogCloseRef = useRef(null);

  const loadIconPacks = async () => {
    const packs = await GetIconPackList();
    setIconPacks(packs);
  };

  const reloadSelectedPack = () => {
    setSelectedPackKeyCount(selectedPackKeyCount + 1);
  };

  const handleReloadIconPacks = async () => {
    setReloadingIconPacks(true);

    // Start the timer for at least 250ms
    const spinMinDuration = new Promise((resolve) => setTimeout(resolve, 250));

    // Clear icon cache and reload packs
    const reloadJob = ClearIconPackCache().then(() => {
      return loadIconPacks().then(() => {
        reloadSelectedPack();
      });
    });

    // Wait for both the spin duration and the job to complete
    await Promise.all([spinMinDuration, reloadJob]);

    // Stop the spin animation
    setReloadingIconPacks(false);
  };

  useEffect(() => {
    loadIconPacks();
  }, []);

  useEffect(() => {
    reloadSelectedPack();
  }, [selectedPackId]);

  useEffect(() => {
    if (!editingIconPack && selectedPackId !== "") {
      CreateLastTab(selectedPackId).then(() => {
        window.location.reload();
      });
    }
  }, [editingIconPack]);

  useEffect(() => {
    ReadLastTab().then((packId) => {
      setSelectedPackId(packId);
    });
  }, []);

  return (
    <Tabs value={selectedPackId} className="flex flex-row w-full h-full">
      <div>
        {!editingIconPack && (
          <div className="flex justify-between items-center gap-0.5 bg-muted backdrop-contrast-50 dark:backdrop-contrast-200 px-2 py-1 h-8 transition-all duration-[5000] overflow-hidden">
            <div className="flex gap-0.5">
              <Dialog>
                <DialogTrigger className="flex items-center">
                  <Button
                    className="backdrop-brightness-150 p-1 border w-6 h-6"
                    variant={"ghost"}
                    size={"icon"}
                  >
                    <Plus />
                  </Button>
                </DialogTrigger>
                <DialogClose ref={dialogCloseRef} />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {t("my_packs.create_new_pack.title")}
                    </DialogTitle>
                  </DialogHeader>
                  <CreatePackForm
                    loadPackInfo={loadIconPacks}
                    dialogCloseRef={dialogCloseRef}
                  />
                </DialogContent>
              </Dialog>
              <Button
                className="backdrop-brightness-150 p-1 border w-6 h-6"
                variant={"ghost"}
                size={"icon"}
                onClick={handleReloadIconPacks}
              >
                <RefreshCw
                  className={
                    reloadingIconPacks ? "animate-spin duration-500" : ""
                  }
                />
              </Button>
            </div>
            <div className="flex gap-0.5">
              <Button
                className="backdrop-brightness-150 p-1 border w-6 h-6"
                variant={"ghost"}
                size={"icon"}
              >
                <Download />
              </Button>
              <Button
                className="backdrop-brightness-150 p-1 border w-6 h-6"
                variant={"ghost"}
                size={"icon"}
              >
                <UploadIcon />
              </Button>
            </div>
          </div>
        )}
        <TabsList
          className={`flex-col justify-start px-2 rounded-none h-[calc(100vh-5.5rem-2rem)] overflow-y-auto shrink-0 transition-all duration-300 z-20`}
          style={{ width: editingIconPack ? "6rem" : "24rem" }}
        >
          {iconPacks?.map((pack) => (
            <PackTrigger
              key={
                JSON.stringify(pack.metadata) +
                JSON.stringify(pack.settings.enabled)
              }
              packId={pack.metadata.id}
              selectedPackId={selectedPackId}
              setSelectedPackId={setSelectedPackId}
              reloadSelectedPack={reloadSelectedPack}
              editingIconPack={editingIconPack}
              disabled={editingIconPack}
              loadIconPacks={loadIconPacks}
            />
          ))}
        </TabsList>
      </div>

      {selectedPackId &&
        (editingIconPack ? (
          <PackEdit
            iconPackId={selectedPackId}
            setEditingIconPack={setEditingIconPack}
          />
        ) : (
          <PackContent
            key={selectedPackKeyCount}
            iconPackId={selectedPackId}
            setSelectedPackId={setSelectedPackId}
            loadIconPacks={loadIconPacks}
            setEditingIconPack={setEditingIconPack}
            reloadSelectedPack={reloadSelectedPack}
          />
        ))}
    </Tabs>
  );
}

interface PackTriggerProps {
  packId: string;
  selectedPackId: string;
  setSelectedPackId: (packId: string) => void;
  reloadSelectedPack: () => void;
  editingIconPack: boolean;
  disabled?: boolean;
  loadIconPacks: () => void;
}

function PackTrigger({
  packId,
  selectedPackId,
  setSelectedPackId,
  reloadSelectedPack,
  editingIconPack,
  disabled,
  loadIconPacks,
  ...props
}: PackTriggerProps) {
  const [iconPack, setIconPack] = useState<main.IconPack>();
  const [enabledState, setEnabledState] = useState(false);

  useEffect(() => {
    GetIconPack(packId).then((iconPack) => {
      setIconPack(iconPack);
      setEnabledState(iconPack.settings.enabled);
    });
  }, [packId]);

  const handleEnable = () => {
    SetIconPackField(packId, "settings.json", "enabled", !enabledState).then(
      () => {
        setEnabledState(!enabledState);
        loadIconPacks();
        if (packId === selectedPackId) {
          reloadSelectedPack();
        }
      }
    );
  };

  return (
    <TabsTrigger
      value={packId}
      onClick={() => setSelectedPackId(packId)}
      className="flex justify-between p-4 w-full"
      disabled={disabled}
      {...props}
    >
      <div className="flex gap-4 w-full">
        <Image
          src={
            "packs\\" +
            iconPack?.metadata.id +
            "\\" +
            iconPack?.metadata.iconName +
            ".png"
          }
          className="w-12 h-12"
          unkown
        />
        {!editingIconPack && (
          <div className="flex flex-col items-start">
            <div className="w-52 text-ellipsis text-left overflow-hidden">
              {iconPack?.metadata.name}
            </div>
            <div className="opacity-50 ml-1">{iconPack?.metadata.version}</div>
          </div>
        )}
      </div>
      {!editingIconPack && (
        <Switch
          checked={enabledState}
          onCheckedChange={handleEnable}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </TabsTrigger>
  );
}

interface PackContentProps {
  iconPackId: string;
  setSelectedPackId: (packId: string) => void;
  loadIconPacks: () => void;
  setEditingIconPack: (editingIconPack: boolean) => void;
  reloadSelectedPack: () => void;
}

function PackContent({
  iconPackId,
  setSelectedPackId,
  loadIconPacks,
  setEditingIconPack,
  reloadSelectedPack,
}: PackContentProps) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [editingMetadata, setEditingMetadata] = useState(false);
  const [iconPack, setIconPack] = useState<main.IconPack>();
  const [editedIconPack, setEditedIconPack] = useState<main.IconPack>();
  const dialogRef = useRef<AreYouSureDialogRef>(null);
  const [deleteGeneratedIcons, setDeleteGeneratedIcons] = useState(false);

  const [enabled, setEnabled] = useState(false);
  const [cornerRadius, setCornerRadius] = useState(-1);
  const [opacity, setOpacity] = useState(-1);

  const [applyRunning, setApplyRunning] = useState(false);
  useState(false);
  const [addIconsFromDesktopRunning, setAddIconsFromDesktopRunning] =
    useState(false);
  const [addIconsRunning, setAddIconsRunning] = useState(false);
  const running = applyRunning || addIconsFromDesktopRunning || addIconsRunning;

  useEffect(() => {
    GetIconPack(iconPackId).then((pack) => {
      setIconPack(pack);
      setEnabled(pack.settings.enabled);
      setOpacity(pack.settings.opacity);
      setCornerRadius(pack.settings.cornerRadius);
      setLoading(false);
    });
  }, []);

  const handleMetadataChange = (
    field: keyof main.IconPack["metadata"],
    value: string
  ) => {
    if (editedIconPack === undefined) {
      return;
    }

    const newIconPack = {
      ...editedIconPack,
      metadata: {
        ...editedIconPack.metadata,
        [field]: value,
      },
    } as main.IconPack;

    setEditedIconPack(newIconPack);
  };

  const handleSettingChange = (
    field: keyof main.IconPack["settings"],
    value: boolean | number
  ) => {
    if (iconPack === undefined) {
      return;
    }

    SetIconPackField(iconPackId, "settings.json", field, value).then(() => {
      const newIconPack = {
        ...iconPack,
        settings: {
          ...iconPack.settings,
          [field]: value,
        },
      } as main.IconPack;

      setIconPack(newIconPack);

      if (field === "enabled") {
        console.log("loadIconPacks");
        loadIconPacks();
      }
    });
  };

  const handleEditStart = () => {
    setEditedIconPack(iconPack);
    setEditingMetadata(true);
  };

  const handleEditSave = () => {
    if (editedIconPack === undefined) {
      return;
    }

    SetIconPackMetadata(iconPackId, editedIconPack.metadata).then(() => {
      setIconPack(editedIconPack);
      loadIconPacks();
      reloadSelectedPack();
      setEditingMetadata(false);
    });
  };

  const handleEditCancel = () => {
    setEditingMetadata(false);
    ClearTempPngPaths();
    ClearDeletePngPaths();
  };

  const handleDelete = () => {
    DeleteIconPack(iconPackId, deleteGeneratedIcons).then(() => {
      setSelectedPackId("");
      loadIconPacks();
    });
  };

  const fields: (keyof main.IconPack["metadata"])[] = [
    "name",
    "version",
    "author",
  ];

  const handleEditIconPack = () => {
    setEditingIconPack(true);
  };

  const handleApplyIconPack = () => {
    setApplyRunning(true);
    ApplyIconPack(iconPackId).finally(() => {
      setApplyRunning(false);
    });
  };

  const handleAddIconsFromDesktop = () => {
    setAddIconsFromDesktopRunning(true);

    AddFilesToIconPackFromDesktop(iconPackId).then(() => {
      GetIconPack(iconPackId)
        .then((pack) => {
          setIconPack(pack);
        })
        .finally(() => {
          setAddIconsFromDesktopRunning(false);
        });
    });
  };

  const handleAddIcon = () => {
    GetIconFiles().then((files) => {
      if (files) {
        setAddIconsRunning(true);

        AddFilesToIconPackFromPath(iconPackId, files, true).then(() => {
          GetIconPack(iconPackId)
            .then((pack) => {
              setIconPack(pack);
            })
            .finally(() => {
              setAddIconsRunning(false);
            });
        });
      }
    });
  };

  const openDialog = useCallback(() => {
    if (dialogRef.current) {
      setDeleteGeneratedIcons(false);
      dialogRef.current.openDialog();
    }
  }, []);

  if (loading || iconPack === undefined) {
    return (
      <div className="flex flex-col gap-4 p-4 w-full h-full">
        <Skeleton className="w-full h-1/3" />
        <Skeleton className="w-full h-1/3" />
        <Skeleton className="w-full h-1/2" />
        <Skeleton className="w-full h-1/2" />
      </div>
    );
  }

  return (
    <TabsContent
      value={iconPackId}
      className="flex flex-col gap-4 p-6 w-full h-[calc(100vh-5.5rem)] overflow-y-auto"
    >
      <div className="bg-card p-4 rounded-md w-full">
        <div className="mb-3 pb-1 border-b font-medium text-xl">
          {t("my_packs.card.pack_information.label")}
        </div>
        <div className="flex flex-row justify-between items-end gap-6">
          <div className="flex items-center gap-6">
            <SelectImage
              src={
                "packs\\" +
                iconPackId +
                "\\" +
                iconPack.metadata.iconName +
                ".png"
              }
              packId={iconPackId}
              editable={editingMetadata}
              unkown
            />
            <div className="flex flex-row gap-8">
              {fields.map((field) => (
                <div key={field} className="flex flex-col gap-1">
                  <div className="font-medium text-xs">
                    {t(
                      "my_packs.card.pack_information.information." +
                        field +
                        ".label"
                    )}
                  </div>
                  {editingMetadata ? (
                    <Input
                      value={
                        editedIconPack?.metadata[field]
                          ? editedIconPack.metadata[field]
                          : ""
                      }
                      onChange={(e) =>
                        handleMetadataChange(field, e.target.value)
                      }
                    />
                  ) : (
                    <div className="opacity-60">{iconPack.metadata[field]}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex h-full">
            {!editingMetadata ? (
              <>
                <Button variant="ghost" size="icon" onClick={handleEditStart}>
                  <Edit className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" onClick={openDialog}>
                  <Trash className="w-6 h-6" />
                </Button>
                <AreYouSureDialog
                  ref={dialogRef}
                  cancelText={t("delete")}
                  acceptText={t("cancel")}
                  title={t("my_packs.delete_pack.confirmation_title")}
                  description={t(
                    "my_packs.delete_pack.confirmation_description"
                  )}
                  onCancel={handleDelete}
                >
                  <div className="flex items-center space-x-2 py-3">
                    <Checkbox
                      id="deleteGeneratedIcons"
                      checked={deleteGeneratedIcons}
                      onCheckedChange={() =>
                        setDeleteGeneratedIcons(!deleteGeneratedIcons)
                      }
                    />
                    <label
                      htmlFor="deleteGeneratedIcons"
                      className="font-medium text-sm leading-none select-none"
                    >
                      {t("my_packs.delete_pack.delete_generated_icons")}
                    </label>
                  </div>
                </AreYouSureDialog>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleEditSave}>
                  {t("save")}
                </Button>
                <Button
                  variant="outline"
                  className="ml-2"
                  onClick={handleEditCancel}
                >
                  {t("cancel")}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card p-4 rounded-md w-full">
        <div className="mb-3 pb-1 border-b font-medium text-xl">
          {t("my_packs.card.pack_actions.label")}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          <Button
            variant={"default"}
            className="flex gap-2.5"
            onClick={handleApplyIconPack}
            disabled={running}
          >
            {applyRunning && <Loader2 className="w-6 h-6 animate-spin" />}
            {t("my_packs.card.pack_actions.apply_icon_pack")}
          </Button>

          <Button
            variant={"default"}
            className="flex gap-2.5"
            onClick={handleEditIconPack}
            disabled={running}
          >
            <Pencil className="w-6 h-6" />
            {t("my_packs.card.pack_actions.edit_icon_pack")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={"secondary"}
            className="flex gap-2.5"
            onClick={handleAddIconsFromDesktop}
            disabled={running}
          >
            {addIconsFromDesktopRunning ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Monitor className="w-6 h-6" />
            )}
            {t("my_packs.card.pack_actions.add_icons_from_desktop")}
          </Button>
          <Button
            variant={"secondary"}
            className="flex gap-2.5"
            onClick={handleAddIcon}
            disabled={running}
          >
            {addIconsRunning ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
            {t("my_packs.card.pack_actions.add_icons")}
          </Button>
        </div>
      </div>

      <div className="bg-card p-4 rounded-md w-full">
        <div className="mb-3 pb-1 border-b font-medium text-xl">
          {t("my_packs.card.pack_settings.label")}
        </div>
        <SettingsItem className="border-none" loading={loading}>
          <SettingLabel>
            {t("my_packs.card.pack_settings.setting.enabled.label")}
          </SettingLabel>
          <SettingContent>
            <Switch
              checked={enabled}
              onCheckedChange={(enabled) => {
                setEnabled(enabled as boolean);
                handleSettingChange("enabled", enabled);
              }}
            />
          </SettingContent>
        </SettingsItem>

        <SettingsItem className="border-none" loading={loading}>
          <div>
            <SettingLabel>
              {t("my_packs.card.pack_settings.setting.corner_radius.label")}
            </SettingLabel>
            <SettingDescription>
              {t(
                "my_packs.card.pack_settings.setting.corner_radius.description"
              )}
            </SettingDescription>
          </div>
          <SettingContent>
            <div className="flex gap-2">
              <div className="text-right w-8">0%</div>
              <Slider
                onValueChange={(value) => setCornerRadius(value[0] as number)}
                onPointerUp={() =>
                  handleSettingChange("cornerRadius", cornerRadius)
                }
                defaultValue={[iconPack.settings.cornerRadius]}
                min={0}
                max={50}
                step={1}
                className={"w-56 cursor-pointer"}
              />
              <div className="w-8">50%</div>
              <div className="w-16 font-bold text-center">
                ({cornerRadius}%)
              </div>
            </div>
          </SettingContent>
        </SettingsItem>

        <SettingsItem className="border-none" loading={loading}>
          <div>
            <SettingLabel>
              {t("my_packs.card.pack_settings.setting.opacity.label")}
            </SettingLabel>
            <SettingDescription>
              {t("my_packs.card.pack_settings.setting.opacity.description")}
            </SettingDescription>
          </div>
          <SettingContent>
            <div className="flex gap-2">
              <div className="text-right w-8">10%</div>
              <Slider
                onValueChange={(value) => setOpacity(value[0] as number)}
                onPointerUp={() => handleSettingChange("opacity", opacity)}
                defaultValue={[iconPack.settings.opacity]}
                min={10}
                max={100}
                step={1}
                className={"w-56 cursor-pointer"}
              />
              <div className="w-8">100%</div>
              <div className="w-16 font-bold text-center">({opacity}%)</div>
            </div>
          </SettingContent>
        </SettingsItem>
      </div>

      <div className="bg-card p-4 rounded-md w-full">
        <div className="mb-3 pb-1 border-b font-medium text-xl">
          {t("my_packs.card.icons.label")}
        </div>
        <div className="flex flex-wrap gap-2">
          {iconPack.files?.map((file) =>
            file.hasIcon ? (
              <Image
                key={file.id}
                src={`packs\\${iconPackId}\\icons\\${file.id}.png`}
                className="w-10 h-10"
                cornerRadius={cornerRadius}
                opacity={opacity}
              />
            ) : null
          )}
        </div>
      </div>
    </TabsContent>
  );
}

interface PackEditProps {
  iconPackId: string;
  setEditingIconPack: (editingIconPack: boolean) => void;
}

function PackEdit({ iconPackId, setEditingIconPack }: PackEditProps) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<main.FileInfo[]>();
  const [updateArray, setUpdateArray] = useState<number[]>([]);

  const [addIconsFromDesktopRunning, setAddIconsFromDesktopRunning] =
    useState(false);
  const [addIconsRunning, setAddIconsRunning] = useState(false);
  const running = addIconsFromDesktopRunning || addIconsRunning;

  useEffect(() => {
    GetIconPack(iconPackId).then((pack) => {
      setFiles(pack.files);
      for (let i = 0; i < pack.files.length; i++) {
        setUpdateArray((prev) => [...prev, i]);
      }
      setLoading(false);
    });
  }, []);

  const handleAddIconsFromDesktop = () => {
    setAddIconsFromDesktopRunning(true);

    GetFileInfoFromDesktop("temp")
      .then((fileInfos) => {
        const oldFiles = files || [];
        oldFiles.push(...fileInfos);
        setFiles(oldFiles);
      })
      .finally(() => {
        setAddIconsFromDesktopRunning(false);
      });
  };

  const handleAddIcon = () => {
    GetIconFiles().then((paths) => {
      if (paths) {
        setAddIconsRunning(true);

        GetFileInfoFromPaths("temp", paths)
          .then((fileInfos) => {
            const oldFiles = files || [];
            oldFiles.push(...fileInfos);
            setFiles(oldFiles);
          })
          .finally(() => {
            setAddIconsRunning(false);
          });
      }
    });
  };

  const handleAddEmptyIcon = () => {
    setAddIconsRunning(true);

    UUID()
      .then((uuid) => {
        const oldFiles = files || [];
        oldFiles.push(
          main.FileInfo.createFrom({
            id: uuid,
            name: "New file",
            description: "",
            path: "",
            destinationPath: "",
            extension: "",
            hasIcon: false,
            iconId: "",
          })
        );
        setFiles(oldFiles);
      })
      .finally(() => {
        setAddIconsRunning(false);
      });
  };

  const handleRemoveIcon = (index: number) => {
    if (!files) return;
    setFiles((prevFiles) => prevFiles?.filter((_, i) => i !== index));
    AddDeletePngPath(iconPackId, files[index].id);
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    setFiles((prevFiles) =>
      prevFiles?.map((file, i) =>
        i === index ? { ...file, [field]: value } : file
      )
    );
  };

  const handleCancelEdit = () => {
    setEditingIconPack(false);
    ClearTempPngPaths();
  };

  const handleSaveEdit = () => {
    if (!files) return;
    SetIconPackFiles(iconPackId, files).then(() => {
      setEditingIconPack(false);
      ClearTempPngPaths();
    });
  };

  if (loading || files === undefined) {
    return (
      <div className="flex flex-col gap-3 p-4 w-full h-full">
        <Skeleton className="w-full h-full" />
        <Skeleton className="w-full h-full" />
        <Skeleton className="w-full h-full" />
        <Skeleton className="w-full h-full" />
        <Skeleton className="w-full h-full" />
        <Skeleton className="w-full h-full" />
        <Skeleton className="w-full h-full" />
        <Skeleton className="w-full h-full" />
        <Skeleton className="w-full h-full" />
        <Skeleton className="w-full h-full" />
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="shadow-bottom-sm flex justify-between items-center bg-muted backdrop-contrast-50 dark:backdrop-contrast-200 px-3 h-16">
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={"secondary"}
            className="flex gap-2.5"
            onClick={handleAddIconsFromDesktop}
            disabled={running}
          >
            {addIconsFromDesktopRunning ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Monitor className="w-6 h-6" />
            )}
            {t("my_packs.card.pack_actions.add_icons_from_desktop")}
          </Button>
          <Button
            variant={"secondary"}
            className="flex gap-2.5"
            onClick={handleAddIcon}
            disabled={running}
          >
            {addIconsRunning ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
            {t("my_packs.card.pack_actions.add_icons")}
          </Button>
          <Button
            variant={"secondary"}
            className="flex gap-2.5"
            onClick={handleAddEmptyIcon}
            disabled={running}
          >
            <SquarePlus className="w-6 h-6" />
            {"Add empty icon"}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSaveEdit}>Save</Button>
          <Button variant="destructive" onClick={handleCancelEdit}>
            Cancel
          </Button>
        </div>
      </div>
      <div className="flex flex-col h-[calc(100vh-5.5rem-4rem)] w-full overflow-x-hidden overflow-y-auto">
        <Accordion type="single" collapsible className="px-1 w-ful">
          {files.map((file, index) => (
            <AccordionItem key={file.id} value={file.id}>
              <AccordionTrigger
                className="p-2"
                end={
                  <Button
                    variant="ghost"
                    size={"icon"}
                    className="p-1.5 w-8 h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveIcon(index);
                    }}
                  >
                    <LucideTrash />
                  </Button>
                }
              >
                <div className="flex items-center gap-2">
                  <SelectImage
                    sizeClass="w-8 h-8"
                    src={`packs/${iconPackId}/icons/${file.id}.png`}
                    packId={file.id}
                    key={updateArray[index]}
                    alwaysShowOriginal={false}
                  />
                  {file.name}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3 px-4 py-2 w-full h-full">
                  <div className="flex gap-4 w-full">
                    <div className="flex flex-col gap-1.5">
                      <Label>Icon</Label>
                      <SelectImage
                        src={`packs/${iconPackId}/icons/${file.id}.png`}
                        packId={file.id}
                        onChange={() => {
                          setUpdateArray((prevUpdateArray) => {
                            const newArray = [...prevUpdateArray];
                            newArray[index] = prevUpdateArray[index] + 1;
                            return newArray;
                          });
                        }}
                        key={updateArray[index]}
                        editable
                        alwaysShowOriginal={false}
                      />
                    </div>
                    <TextInput
                      key={file.id}
                      value={file.name}
                      placeholder={"File Name"}
                      onChange={(value) => {
                        handleInputChange(index, "name", value);
                      }}
                      label={"Name"}
                      className="justify-between w-full"
                    />
                  </div>
                  <TextInput
                    value={file.description}
                    placeholder={"Description"}
                    onChange={(value) => {
                      handleInputChange(index, "description", value);
                    }}
                    label={"Description"}
                  />
                  <PathInput
                    value={file.path}
                    placeholder={"Path"}
                    onChange={(value) => {
                      handleInputChange(index, "path", value);
                      Ext(value).then((ext) => {
                        handleInputChange(index, "extension", ext);
                        console.log(ext);
                      });
                      if (file.name === "" || file.name === "New file") {
                        Name(value).then((name) => {
                          handleInputChange(index, "name", name);
                        });
                      }
                      if (file.description === "") {
                        Description(value).then((description) => {
                          console.log(description);
                          handleInputChange(index, "description", description);
                        });
                      }
                      if (file.destinationPath === "") {
                        Destination(value).then((destinationPath) => {
                          handleInputChange(
                            index,
                            "destinationPath",
                            destinationPath
                          );
                        });
                      }
                      GetTempPngPath(file.id).then((tempPngPath) => {
                        if (!tempPngPath && !file.hasIcon) {
                          IconLocation(value).then((iconLocation) => {
                            AddTempPngPath(file.id, iconLocation).then(() => {
                              setUpdateArray((prevUpdateArray) => {
                                const newArray = [...prevUpdateArray];
                                newArray[index] = prevUpdateArray[index] + 1;
                                return newArray;
                              });
                            });
                          });
                        }
                      });
                    }}
                    label={"Path"}
                  />

                  {file.extension === ".lnk" && (
                    <PathInput
                      value={file.destinationPath}
                      placeholder={"Destination Path"}
                      onChange={(value) => {
                        handleInputChange(index, "destinationPath", value);
                      }}
                      label={"Destination Path"}
                    />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

function TextInput({
  value,
  placeholder,
  onChange,
  label,
  className = "",
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label className="ml-1">{label}</Label>
      <Input
        className="w-full h-10 focus-visible:ring-offset-1"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      />
    </div>
  );
}

function PathInput({
  value,
  placeholder,
  onChange,
  label,
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const handleChoosePath = () => {
    GetFilePath(value).then((path) => {
      if (path) {
        LogDebug("Path selected: " + path);
        onChange(path);
      }
    });
  };

  return (
    <div className="flex items-end gap-1.5 w-full">
      <TextInput
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        label={label}
        className="w-full"
      />
      <Button
        variant={"secondary"}
        size={"icon"}
        className="w-10 h-10"
        onClick={handleChoosePath}
      >
        <FolderOpen className="w-5 h-5" />
      </Button>
    </div>
  );
}

interface CreatePackFormProps {
  loadPackInfo: () => void;
  dialogCloseRef: React.RefObject<HTMLButtonElement>;
}

function CreatePackForm({ loadPackInfo, dialogCloseRef }: CreatePackFormProps) {
  const { t } = useTranslation();

  const formSchema = z.object({
    icon: z.string(),
    name: z
      .string()
      .min(1, {
        message: t(
          "my_packs.card.pack_information.information.name.message.name_required"
        ),
      })
      .max(32, {
        message: t(
          "my_packs.card.pack_information.information.name.message.name_max"
        ),
      }),
    version: z
      .string()
      .min(1, {
        message: t(
          "my_packs.card.pack_information.information.version.message.version_required"
        ),
      })
      .regex(/^v[0-9]{1,4}\.[0-9]{1,4}\.[0-9]{1,4}$/, {
        message: t(
          "my_packs.card.pack_information.information.version.message.version_format"
        ),
      }),
    author: z.string().max(32, {
      message: t(
        "my_packs.card.pack_information.information.author.message.author_max"
      ),
    }),
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
    AddIconPack(data.name, data.version, data.author).then(() => {
      loadPackInfo();
      dialogCloseRef.current?.click();
    });
  }

  useEffect(() => {
    return () => {
      // This function runs before the component unmounts
      ClearTempPngPaths();
    };
  }, []);

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
          render={() => (
            <FormItem className="flex flex-col gap-1">
              <FormLabel>
                {t("my_packs.card.pack_information.information.icon.label")}
              </FormLabel>
              <SelectImage editable />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {" "}
                {t("my_packs.card.pack_information.information.name.label")}
              </FormLabel>
              <FormControl>
                <Input
                  autoComplete="new-password"
                  placeholder={t(
                    "my_packs.card.pack_information.information.name.placeholder"
                  )}
                  {...field}
                />
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
              <FormLabel>
                {t("my_packs.card.pack_information.information.version.label")}
              </FormLabel>
              <FormControl>
                <Input
                  autoComplete="new-password"
                  placeholder={t(
                    "my_packs.card.pack_information.information.version.placeholder"
                  )}
                  {...field}
                />
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
              <FormLabel>
                {t("my_packs.card.pack_information.information.author.label")}
              </FormLabel>
              <FormControl>
                <Input
                  autoComplete="new-password"
                  placeholder={t(
                    "my_packs.card.pack_information.information.author.placeholder"
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="mt-3">
          {t("create")}
        </Button>
      </form>
    </Form>
  );
}
