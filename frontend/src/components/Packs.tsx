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
  Check,
  CircleAlert,
  Download,
  Edit,
  Folder,
  FolderOpen,
  Images,
  Loader2,
  LucideTrash,
  Monitor,
  Pencil,
  Plus,
  RefreshCw,
  SquarePlus,
  Trash,
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
  AddDeletePngRelativePath,
  AddFilesToIconPackFromDesktop,
  AddFilesToIconPackFromPath,
  AddFileToIconPackFromPath,
  AddIconPack,
  ApplyIconPack,
  ClearDeletePngPaths,
  ClearIconPackCache,
  ClearSelectImages,
  ClearTempPngPaths,
  CreateLastTab,
  DeleteDeletePngPaths,
  DeleteIconPack,
  Description,
  Destination,
  ExportIconPack,
  Ext,
  GeneralPathExits,
  GetFileInfoFromDesktop,
  GetFileInfoFromPaths,
  GetFilePath,
  GetIcnmMetadata,
  GetIconFiles,
  GetIconFolder,
  GetIconPack,
  GetIconPackList,
  GetIconPackPath,
  ImportIconPack,
  Name,
  NeedsAdminPrivileges,
  ReadLastTab,
  RestartApplication,
  SetIconPackField,
  SetIconPackFiles,
  SetIconPackMetadata,
  SetImageIfAbsent,
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
import { Textarea } from "./ui/textarea";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { HelpCard } from "./ui/help-card";
import parse from "html-react-parser";
import { useProgress } from "@/contexts/progress-provider";

export default function Packs() {
  const { t } = useTranslation();
  const { getValue, setValue } = useStorage();

  const [editingIconPack, setEditingIconPack] = useState(false);
  useEffect(() => {
    setValue("editingIconPack", editingIconPack);
  }, [editingIconPack]);

  const [selectedPackId, setSelectedPackId] = useState("");
  const [iconPacks, setIconPacks] = useState<main.IconPack[]>();
  const [selectedPackKeyCount, setSelectedPackKeyCount] = useState(0);

  const [reloadingIconPacks, setReloadingIconPacks] = useState(false);

  const dialogCloseRef = useRef(null);
  const dialogImportRef = useRef<AreYouSureDialogRef>(null);
  const [importPackPath, setImportPackPath] = useState("");

  const [tempMetadata, setTempMetadata] = useState<main.Metadata>(
    main.Metadata.createFrom({})
  );

  const tabsListRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  useEffect(() => {
    const element = tabsListRef.current as HTMLElement | null;
    if (!element) {
      return;
    }

    const overflow = element.scrollHeight > element.clientHeight;
    LogDebug(
      element.scrollHeight + " > " + element.clientHeight + " = " + overflow
    );
    setHasOverflow(overflow);
  }, [editingIconPack]);

  useEffect(() => {
    setSelectedPackId(getValue("packs") || "");
  }, [getValue("packs")]);

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

  const handleImportIconPack = () => {
    GetIconPackPath().then((path) => {
      if (path) {
        setImportPackPath(path);
        GetIcnmMetadata(path).then((metadata) => {
          setTempMetadata(metadata);
          dialogImportRef.current?.openDialog();
        });
      } else {
        setImportPackPath("");
      }
    });
  };

  window.importIconPack = (path: string) => {
    setImportPackPath(path);
    GetIcnmMetadata(path).then((metadata) => {
      if (metadata.id === "") {
        setImportPackPath("");
      } else {
        setTempMetadata(metadata);
        dialogImportRef.current?.openDialog();
      }
    });
  };

  const handleAcceptImportIconPack = () => {
    ImportIconPack(importPackPath).then((id) => {
      handleReloadIconPacks().then(() => {
        ClearTempPngPaths();
        setSelectedPackId(id);
      });
    });
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
      if (packId) {
        setSelectedPackId(packId);
      }
    });
  }, []);

  return (
    <Tabs value={selectedPackId} className="flex flex-row w-full h-full">
      <div>
        <div className="flex justify-between items-center gap-0.5 bg-muted backdrop-contrast-50 dark:backdrop-contrast-200 px-2 py-1 h-8 transition-all duration-[5000] overflow-hidden">
          <div className="flex gap-0.5">
            <Dialog>
              <DialogTrigger
                className="flex items-center"
                disabled={editingIconPack}
              >
                <Button
                  disabled={editingIconPack}
                  className="backdrop-brightness-150 p-1 border w-6 h-6"
                  variant={"ghost"}
                  size={"icon"}
                  tooltip={t("my_packs.buttons.add_pack.tooltip")}
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
                  reloadIconPacks={handleReloadIconPacks}
                  dialogCloseRef={dialogCloseRef}
                />
              </DialogContent>
            </Dialog>
            <Button
              disabled={editingIconPack}
              className="backdrop-brightness-150 p-1 border w-6 h-6"
              variant={"ghost"}
              size={"icon"}
              onClick={handleReloadIconPacks}
              tooltip={t("my_packs.buttons.reload_packs.tooltip")}
            >
              <RefreshCw
                className={
                  reloadingIconPacks ? "animate-spin duration-500" : ""
                }
              />
            </Button>
          </div>
          <div className="flex gap-0.5">
            <AreYouSureDialog
              ref={dialogImportRef}
              title={t("my_packs.import_pack.confirmation_title")}
              cancelText={t("cancel")}
              acceptText={t("import")}
              onAccept={handleAcceptImportIconPack}
              onCancel={() => {
                setImportPackPath("");
                ClearTempPngPaths();
              }}
            >
              <div className="flex gap-3 bg-muted p-3 rounded-md w-full">
                <Image
                  src={tempMetadata.iconName}
                  className="w-12 h-12"
                  unkown
                />
                <div className="flex flex-col text-muted-foreground">
                  <div className="w-80 font-semibold text-ellipsis text-left overflow-hidden">
                    {tempMetadata.name}
                  </div>
                  <div className="opacity-50 font-semibold text-sm">
                    {tempMetadata.version}
                  </div>
                </div>
              </div>
            </AreYouSureDialog>
            <Button
              disabled={editingIconPack}
              onClick={handleImportIconPack}
              className="backdrop-brightness-150 p-1 border w-6 h-6"
              variant={"ghost"}
              size={"icon"}
              tooltip={t("my_packs.buttons.import_pack.tooltip")}
            >
              <Download />
            </Button>
          </div>
        </div>

        <TabsList
          ref={tabsListRef}
          className={`${
            editingIconPack
              ? hasOverflow
                ? "w-[6.6rem]"
                : "w-[6rem]"
              : "w-[24rem]"
          }
          flex-col justify-start px-2 rounded-none h-[calc(100vh-5.5rem-2rem)] overflow-y-auto shrink-0 transition-all duration-300 z-20`}
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
            reloadIconPacks={handleReloadIconPacks}
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
      {false && !editingIconPack && (
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
  reloadIconPacks: () => void;
}

function PackContent({
  iconPackId,
  setSelectedPackId,
  loadIconPacks,
  setEditingIconPack,
  reloadIconPacks,
}: PackContentProps) {
  const { t } = useTranslation();
  const { progress } = useProgress();

  const [needsAdmin, setNeedsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [editingMetadata, setEditingMetadata] = useState(false);
  const [iconPack, setIconPack] = useState<main.IconPack>();
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
  const [addFolderRunning, setAddFolderRunning] = useState(false);
  const running =
    applyRunning ||
    addIconsFromDesktopRunning ||
    addIconsRunning ||
    addFolderRunning ||
    editingMetadata ||
    progress != 0;

  useEffect(() => {
    GetIconPack(iconPackId).then((pack) => {
      setIconPack(pack);
      setEnabled(pack.settings.enabled);
      setOpacity(pack.settings.opacity);
      setCornerRadius(pack.settings.cornerRadius);
      setLoading(false);
    });

    NeedsAdminPrivileges().then((result) => {
      setNeedsAdmin(result);
    });
  }, []);

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
    setEditingMetadata(true);
  };

  const handleEditSave = (metadata: main.Metadata) => {
    const updateMetadataJob = async () => {
      if (iconPack === undefined) {
        return;
      }

      const oldMetadata = iconPack.metadata;

      oldMetadata.name = metadata.name;
      oldMetadata.version = metadata.version;
      oldMetadata.author = metadata.author;
      oldMetadata.license = metadata.license;
      oldMetadata.description = metadata.description;

      SetIconPackMetadata(iconPackId, oldMetadata);
    };

    Promise.all([
      ClearSelectImages(),
      DeleteDeletePngPaths(),
      updateMetadataJob(),
    ]).then(() => {
      reloadIconPacks();
    });
  };

  const handleEditCancel = () => {
    setEditingMetadata(false);
    ClearTempPngPaths();
    ClearDeletePngPaths();
    ClearSelectImages();
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
    "license",
  ];

  const handleEditIconPack = () => {
    setEditingIconPack(true);
  };

  const handleExportIconPack = () => {
    ExportIconPack(iconPackId);
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

  const handleAddFolder = () => {
    GetIconFolder().then((folder) => {
      if (folder) {
        setAddFolderRunning(true);

        AddFileToIconPackFromPath(iconPackId, folder, true).then(() => {
          GetIconPack(iconPackId)
            .then((pack) => {
              setIconPack(pack);
            })
            .finally(() => {
              setAddFolderRunning(false);
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
        <div
          className={`flex flex-row justify-between items-start ${
            editingMetadata ? "" : "gap-6"
          }`}
        >
          <div className="w-full">
            <div className={`flex gap-6 w-full`}>
              <div className="flex flex-col gap-3">
                {editingMetadata && (
                  <Label>
                    {t("my_packs.card.pack_information.information.icon.label")}
                  </Label>
                )}
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
                />
              </div>

              {!editingMetadata && (
                <div className="flex flex-col gap-2">
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
                        <div className="opacity-60">
                          {iconPack.metadata[field]}
                        </div>
                      </div>
                    ))}
                  </div>
                  {iconPack.metadata.description && (
                    <div className="flex flex-col gap-1">
                      <div className="font-medium text-xs">
                        {t(
                          "my_packs.card.pack_information.information.description.label"
                        )}
                      </div>
                      <div className="opacity-60 whitespace-pre-line">
                        {iconPack.metadata.description}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {editingMetadata && (
                <CreatePackForm
                  handleSave={handleEditSave}
                  handleCancel={handleEditCancel}
                  defaultValues={iconPack.metadata}
                />
              )}
            </div>
          </div>
          {!editingMetadata && (
            <div className="flex h-full">
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
                description={t("my_packs.delete_pack.confirmation_description")}
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
            </div>
          )}
        </div>
      </div>

      <div className="bg-card p-4 rounded-md w-full">
        <div className="flex gap-4 mb-3 pb-1 border-b font-medium text-xl">
          {t("my_packs.card.pack_actions.label")}

          {needsAdmin && (
            <div className="flex flex-row items-center gap-1">
              <Button
                className="text-xs"
                variant={"secondary"}
                onClick={() => {
                  RestartApplication(true, ["--goto", "packs__" + iconPackId]);
                }}
              >
                {t("my_packs.card.pack_actions.restart_as_admin")}
              </Button>
              <div className="flex flex-row items-center gap-1.5 rounded-md text-warning text-xs">
                <CircleAlert className="w-6 h-6" />
                {t("my_packs.card.pack_actions.admin_warning")}
              </div>
            </div>
          )}
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

          <Button
            variant={"default"}
            className="flex gap-2.5"
            onClick={handleExportIconPack}
            disabled={running}
          >
            <UploadIcon className="w-6 h-6" />
            {t("my_packs.card.pack_actions.export_icon_pack")}
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
              <Images className="w-6 h-6" />
            )}
            {t("my_packs.card.pack_actions.add_icons")}
          </Button>

          <Button
            variant={"secondary"}
            className="flex gap-2.5"
            onClick={handleAddFolder}
            disabled={running}
          >
            {addFolderRunning ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Folder className="w-6 h-6" />
            )}
            {t("my_packs.card.pack_actions.add_folder")}
          </Button>
        </div>
      </div>

      <div className="bg-card p-4 rounded-md w-full">
        <div className="mb-3 pb-1 border-b font-medium text-xl">
          {t("my_packs.card.pack_settings.label")}
        </div>
        {false && (
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
        )}

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

      {iconPack.files?.filter((file) => file.hasIcon).length > 0 && (
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
      )}
    </TabsContent>
  );
}

interface PackEditProps {
  iconPackId: string;
  setEditingIconPack: (editingIconPack: boolean) => void;
}

function PackEdit({ iconPackId, setEditingIconPack }: PackEditProps) {
  const { t } = useTranslation();
  const { progress } = useProgress();

  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<main.FileInfo[]>();
  const [updateArray, setUpdateArray] = useState<number[]>(
    Array.from({ length: 4096 }, (_, i) => i)
  );
  const [updateArray2, setUpdateArray2] = useState<number[]>(
    Array.from({ length: 4096 }, (_, i) => i)
  );

  const [addIconsFromDesktopRunning, setAddIconsFromDesktopRunning] =
    useState(false);
  const [addIconsRunning, setAddIconsRunning] = useState(false);
  const [addFolderRunning, setAddFolderRunning] = useState(false);
  const running =
    addIconsFromDesktopRunning ||
    addIconsRunning ||
    addFolderRunning ||
    progress != 0;

  useEffect(() => {
    GetIconPack(iconPackId).then((pack) => {
      setFiles(pack.files);
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

  const handleAddFolder = () => {
    GetIconFolder().then((folder) => {
      if (folder) {
        setAddFolderRunning(true);

        GetFileInfoFromPaths("temp", [folder])
          .then((fileInfos) => {
            const oldFiles = files || [];
            oldFiles.push(...fileInfos);
            setFiles(oldFiles);
          })
          .finally(() => {
            setAddFolderRunning(false);
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
    AddDeletePngRelativePath(
      `packs\\${iconPackId}\\icons\\${files[index].id}.png`
    );
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    setFiles((prevFiles) =>
      prevFiles?.map((file, i) =>
        i === index ? { ...file, [field]: value } : file
      )
    );
  };

  const handleCancelEdit = () => {
    ClearTempPngPaths();
    ClearSelectImages().then(() => setEditingIconPack(false));
  };

  const handleSaveEdit = () => {
    if (!files) return;
    DeleteDeletePngPaths().then(() => {
      SetIconPackFiles(iconPackId, files).then(() => {
        ClearTempPngPaths();
        ClearSelectImages().then(() => setEditingIconPack(false));
      });
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
              <Images className="w-6 h-6" />
            )}
            {t("my_packs.card.pack_actions.add_icons")}
          </Button>
          <Button
            variant={"secondary"}
            className="flex gap-2.5"
            onClick={handleAddFolder}
            disabled={running}
          >
            {addFolderRunning ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Folder className="w-6 h-6" />
            )}
            {t("my_packs.card.pack_actions.add_folder")}
          </Button>
          <Button
            variant={"secondary"}
            className="flex gap-2.5"
            onClick={handleAddEmptyIcon}
            disabled={running}
          >
            <SquarePlus className="w-6 h-6" />
            {t("my_packs.card.pack_actions.add_empty_icon")}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSaveEdit}>{t("save")}</Button>
          <Button variant="destructive" onClick={handleCancelEdit}>
            {t("cancel")}
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
                  />
                  {file.name}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3 px-4 py-2 w-full h-full">
                  <div className="flex gap-4 w-full">
                    <div className="flex flex-col gap-1.5">
                      <Label>
                        {t(
                          "my_packs.card.pack_information.information.icon.label"
                        )}
                      </Label>
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
                        key={updateArray2[index]}
                        editable
                      />
                    </div>
                    <TextInput
                      key={file.id}
                      value={file.name}
                      placeholder={t("file_info.name.placeholder")}
                      helpText={t("file_info.name.help")}
                      onChange={(value) => {
                        handleInputChange(index, "name", value);
                      }}
                      label={t("file_info.name.label")}
                      className="justify-between w-full"
                    />
                  </div>
                  {file.extension === ".lnk" && (
                    <TextInput
                      value={file.description}
                      placeholder={t("file_info.description.placeholder")}
                      helpText={t("file_info.description.help")}
                      onChange={(value) => {
                        handleInputChange(index, "description", value);
                      }}
                      label={t("file_info.description.label")}
                    />
                  )}
                  <PathInput
                    value={file.path}
                    placeholder={t("file_info.path.placeholder")}
                    helpText={
                      t("file_info.path.help") + t("file_info.path.rules")
                    }
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
                          console.log("d: " + destinationPath);
                          handleInputChange(
                            index,
                            "destinationPath",
                            destinationPath
                          );
                        });
                      }

                      SetImageIfAbsent(file.id, value).then(() => {
                        setUpdateArray((prevUpdateArray) => {
                          const newArray = [...prevUpdateArray];
                          newArray[index] = prevUpdateArray[index] + 1;
                          return newArray;
                        });
                        setUpdateArray2((prevUpdateArray) => {
                          const newArray = [...prevUpdateArray];
                          newArray[index] = prevUpdateArray[index] + 1;
                          return newArray;
                        });
                      });
                    }}
                    label={t("file_info.path.label")}
                  />

                  {(file.extension === ".lnk" || file.extension === ".url") && (
                    <PathInput
                      value={file.destinationPath}
                      placeholder={t(
                        `file_info.${
                          file.extension === ".url" ? "url" : "destination"
                        }.placeholder`
                      )}
                      helpText={
                        file.extension === ".lnk"
                          ? t("file_info.destination.help") +
                            t("file_info.path.rules")
                          : t("file_info.url.help")
                      }
                      onChange={(value) => {
                        handleInputChange(index, "destinationPath", value);
                      }}
                      label={t(
                        `file_info.${
                          file.extension === ".url" ? "url" : "destination"
                        }.label`
                      )}
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
  helpText,
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
  helpText?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-1.5">
        <Label className="ml-1">{label}</Label>
        {helpText && <HelpCard content={parse(helpText)} className="w-3 h-3" />}
      </div>
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
  helpText,
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  label: string;
  helpText?: string;
}) {
  const { t } = useTranslation();
  const [exists, setExists] = useState(false);

  const handleChoosePath = () => {
    GetFilePath(value).then((path) => {
      if (path) {
        LogDebug("Path selected: " + path);
        onChange(path);
      }
    });
  };

  const updateExistence = () => {
    GeneralPathExits(value).then((exists) => {
      setExists(exists);
    });
  };

  useEffect(() => {
    updateExistence();
  }, [value]);

  return (
    <div className="flex items-center gap-1.5 w-full">
      <div className="relative w-full">
        <TextInput
          value={value}
          placeholder={placeholder}
          onChange={(value) => {
            onChange(value);
            updateExistence();
          }}
          label={label}
          className="w-full"
          helpText={helpText!}
        />
        {exists && (
          <HoverCard>
            <HoverCardTrigger className="top-1/2 right-2 absolute" asChild>
              <Check className={`w-5 h-5 ${"text-success"}`} />
            </HoverCardTrigger>
            <HoverCardContent>
              {t("my_packs.edit_pack.path_found")}
            </HoverCardContent>
          </HoverCard>
        )}
      </div>
      <Button
        variant={"secondary"}
        size={"icon"}
        className="mt-5 w-10 h-10"
        onClick={handleChoosePath}
      >
        <FolderOpen className="w-5 h-5" />
      </Button>
    </div>
  );
}

interface CreatePackFormProps {
  reloadIconPacks?: () => void;
  dialogCloseRef?: React.RefObject<HTMLButtonElement>;
  handleSave?: (metadata: main.Metadata) => void;
  handleCancel?: () => void;
  defaultValues?: main.Metadata;
}

function CreatePackForm({
  reloadIconPacks,
  dialogCloseRef,
  handleSave,
  handleCancel,
  defaultValues,
}: CreatePackFormProps) {
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
    license: z.string().max(64, {
      message: t(
        "my_packs.card.pack_information.information.license.message.license_max"
      ),
    }),
    description: z.string().max(1024, {
      message: t(
        "my_packs.card.pack_information.information.description.message.description_max"
      ),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      icon: "",
      name: defaultValues?.name || "",
      version: defaultValues?.version || "v1.0.0",
      author: defaultValues?.author || "",
      license: defaultValues?.license || "",
      description: defaultValues?.description || "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (reloadIconPacks) {
      AddIconPack(
        data.name,
        data.version,
        data.author,
        data.license,
        data.description
      ).then(() => {
        reloadIconPacks();
        dialogCloseRef?.current?.click();
      });
    } else {
      handleSave?.(main.Metadata.createFrom(data));
    }
  }

  useEffect(() => {
    return () => {
      // This function runs before the component unmounts
      ClearTempPngPaths();
      ClearSelectImages();
    };
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`
          ${
            defaultValues
              ? "flex flex-row gap-2.5 w-full"
              : "flex flex-col gap-2.5"
          }`}
        autoComplete="off"
      >
        {!defaultValues && (
          <FormField
            control={form.control}
            name="icon"
            render={() => (
              <FormItem className="flex flex-col items-start gap-1">
                <FormLabel>
                  {t("my_packs.card.pack_information.information.icon.label")}
                </FormLabel>
                <SelectImage editable />
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="w-full">
          <div
            className={
              defaultValues
                ? "grid grid-cols-2 gap-2.5 w-full"
                : "flex flex-col gap-2.5"
            }
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className={defaultValues && "mb-3"}>
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
                <FormItem className="flex flex-col w-full">
                  <FormLabel className={defaultValues && "mb-3"}>
                    {t(
                      "my_packs.card.pack_information.information.version.label"
                    )}
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
                <FormItem className="flex flex-col w-full">
                  <FormLabel className={defaultValues && "mb-1"}>
                    {t(
                      "my_packs.card.pack_information.information.author.label"
                    )}
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
            <FormField
              control={form.control}
              name="license"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel className={defaultValues && "mb-1"}>
                    {t(
                      "my_packs.card.pack_information.information.license.label"
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="new-password"
                      placeholder={t(
                        "my_packs.card.pack_information.information.license.placeholder"
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col items-end gap-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex flex-col mt-2.5 w-full">
                  <FormLabel>
                    {t(
                      "my_packs.card.pack_information.information.description.label"
                    )}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      autoComplete="new-password"
                      placeholder={t(
                        "my_packs.card.pack_information.information.description.placeholder"
                      )}
                      className="max-h-64"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {defaultValues && (
              <div className="flex gap-2">
                <Button type="submit">{t("save")}</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleCancel?.();
                  }}
                >
                  {t("cancel")}
                </Button>
              </div>
            )}
          </div>
        </div>
        {!defaultValues && (
          <Button type="submit" className="mt-3">
            {t("create")}
          </Button>
        )}
      </form>
    </Form>
  );
}
