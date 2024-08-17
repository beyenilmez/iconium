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
  Loader2,
  Monitor,
  Pencil,
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
  AddFilesToIconPackFromPath,
  AddIconPack,
  ApplyIconPack,
  DeleteIconPack,
  GetIconFiles,
  GetIconPack,
  GetIconPackInfo,
  SetIconPackInfo,
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
export default function Packs() {
  const { t } = useTranslation();
  const { setValue } = useStorage();

  const [editingIconPack, setEditingIconPack] = useState(false);
  useEffect(() => {
    setValue("editingIconPack", editingIconPack);
  });

  const [pack, setPack] = useState("");
  const [packInfos, setPackInfos] = useState<main.IconPack[]>();
  const [selectedPackKeyCount, setSelectedPackKeyCount] = useState(0);

  const dialogCloseRef = useRef(null);

  const loadPackInfo = async () => {
    const packInfos = await GetIconPackInfo();
    setPackInfos(packInfos);
  };

  const reloadSelectedPack = () => {
    setSelectedPackKeyCount(selectedPackKeyCount + 1);
  };

  useEffect(() => {
    loadPackInfo();
  }, []);

  useEffect(() => {
    reloadSelectedPack();
  }, [pack]);

  return (
    <Tabs value={pack} className="flex flex-row w-full h-full">
      <TabsList
        className={`flex-col justify-start px-2 rounded-none h-[calc(100vh-5.5rem)] overflow-y-auto shrink-0 transition-all duration-300`}
        style={{ width: editingIconPack ? "6rem" : "24rem" }}
      >
        {packInfos?.map((pack) => (
          <PackTrigger
            key={pack.metadata.id}
            iconPack={pack}
            setPack={setPack}
            reloadSelectedPack={reloadSelectedPack}
            editingIconPack={editingIconPack}
            disabled={editingIconPack}
          />
        ))}

        {!editingIconPack && (
          <Dialog>
            <DialogTrigger className="w-full">
              <Button variant={"outline"} className="my-2 py-6 w-full">
                {t("my_packs.create_new_pack.label")}
              </Button>
            </DialogTrigger>
            <DialogClose ref={dialogCloseRef} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {" "}
                  {t("my_packs.create_new_pack.title")}
                </DialogTitle>
              </DialogHeader>
              <CreatePackForm
                loadPackInfo={loadPackInfo}
                dialogCloseRef={dialogCloseRef}
              />
            </DialogContent>
          </Dialog>
        )}
      </TabsList>

      {pack && !editingIconPack && (
        <PackContent
          key={selectedPackKeyCount}
          iconPackId={pack}
          setPack={setPack}
          loadPackInfo={loadPackInfo}
          setEditingIconPack={setEditingIconPack}
        />
      )}

      {pack && editingIconPack && (
        <PackEdit
          iconPackId={pack}
          setPack={setPack}
          loadPackInfo={loadPackInfo}
          setEditingIconPack={setEditingIconPack}
        />
      )}
    </Tabs>
  );
}

interface PackTriggerProps {
  iconPack: main.IconPack;
  setPack: (pack: string) => void;
  reloadSelectedPack: () => void;
  editingIconPack: boolean;
  disabled?: boolean;
}

function PackTrigger({
  iconPack,
  setPack,
  reloadSelectedPack,
  editingIconPack,
  disabled,
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
      disabled={disabled}
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
        {!editingIconPack && (
          <div className="flex flex-col items-start">
            <div className="w-52 text-ellipsis text-left overflow-hidden">
              {iconPack.metadata.name}
            </div>
            <div className="opacity-50 ml-1">{iconPack.metadata.version}</div>
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
  setPack: (pack: string) => void;
  loadPackInfo: () => void;
  setEditingIconPack: (editingIconPack: boolean) => void;
}

function PackContent({
  iconPackId,
  setPack,
  loadPackInfo,
  setEditingIconPack,
}: PackContentProps) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [iconPackInfo, setIconPackInfo] = useState(
    main.IconPack.createFrom({})
  );
  const [editedIconPackInfo, setEditedIconPackInfo] = useState(
    main.IconPack.createFrom({})
  );
  const dialogRef = useRef<AreYouSureDialogRef>(null);
  const [deleteGeneratedIcons, setDeleteGeneratedIcons] = useState(false);

  const [cornerRadius, setCornerRadius] = useState(-1);
  const [opacity, setOpacity] = useState(-1);

  const [applyRunning, setApplyRunning] = useState(false);
  useState(false);
  const [addIconsFromDesktopRunning, setAddIconsFromDesktopRunning] =
    useState(false);
  const [addIconsRunning, setAddIconsRunning] = useState(false);
  const running = applyRunning || addIconsFromDesktopRunning || addIconsRunning;

  useEffect(() => {
    GetIconPack(iconPackId).then((iconPack) => {
      setIconPackInfo(iconPack);
      setCornerRadius(iconPack.settings.cornerRadius);
      setOpacity(iconPack.settings.opacity);
      setLoading(false);
    });
  }, []);

  const handleChange = (
    field: keyof main.IconPack["metadata"],
    value: string,
    editMode?: boolean
  ) => {
    const newIconPackInfo = {
      ...iconPackInfo,
      metadata: {
        ...iconPackInfo.metadata,
        [field]: value,
      },
    } as main.IconPack;

    if (editMode) {
      setEditedIconPackInfo(newIconPackInfo);
    } else {
      setIconPackInfo(newIconPackInfo);
    }
  };

  const handleEdit = () => {
    setEditedIconPackInfo(iconPackInfo);
    setEditMode(true);
  };

  const handleSave = () => {
    setIconPackInfo(editedIconPackInfo);
    SetIconPackInfo(editedIconPackInfo).then(() => {
      loadPackInfo();
    });
    setEditMode(false);
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  const handleDelete = () => {
    DeleteIconPack(iconPackId, deleteGeneratedIcons).then(() => {
      setPack("");
      loadPackInfo();
    });
  };

  const handleSettingChange = (
    field: keyof main.IconPack["settings"],
    value: boolean | number,
    editMode?: boolean
  ) => {
    const newIconPackInfo = {
      ...iconPackInfo,
      settings: {
        ...iconPackInfo.settings,
        [field]: value,
      },
    } as main.IconPack;

    if (editMode) {
      setEditedIconPackInfo(newIconPackInfo);
    } else {
      setIconPackInfo(newIconPackInfo);
      SetIconPackInfo(newIconPackInfo).then(loadPackInfo);
    }
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
    ApplyIconPack(iconPackInfo.metadata.id).finally(() => {
      setApplyRunning(false);
    });
  };

  const handleAddIconsFromDesktop = () => {
    setAddIconsFromDesktopRunning(true);

    AddFilesToIconPackFromDesktop(iconPackInfo.metadata.id).then(() => {
      GetIconPack(iconPackInfo.metadata.id)
        .then((iconPack) => {
          setIconPackInfo(iconPack);
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

        AddFilesToIconPackFromPath(iconPackInfo.metadata.id, files, true).then(
          () => {
            GetIconPack(iconPackInfo.metadata.id)
              .then((iconPack) => {
                setIconPackInfo(iconPack);
              })
              .finally(() => {
                setAddIconsRunning(false);
              });
          }
        );
      }
    });
  };

  const openDialog = useCallback(() => {
    if (dialogRef.current) {
      setDeleteGeneratedIcons(false);
      dialogRef.current.openDialog();
    }
  }, []);

  if (loading) {
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
              icon={
                editMode
                  ? editedIconPackInfo.metadata.icon
                  : iconPackInfo.metadata.icon
              }
              onIconChange={(icon) => handleChange("icon", icon, true)}
              sizeClass="w-12 h-12"
              editSizeClass="w-7 h-7"
              editable={editMode}
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
                  {editMode ? (
                    <Input
                      value={editedIconPackInfo.metadata[field]}
                      onChange={(e) =>
                        handleChange(field, e.target.value, true)
                      }
                    />
                  ) : (
                    <div className="opacity-60">
                      {iconPackInfo.metadata[field]}
                    </div>
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
                <Button variant="outline" onClick={handleSave}>
                  {t("save")}
                </Button>
                <Button
                  variant="outline"
                  className="ml-2"
                  onClick={handleCancel}
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
              checked={iconPackInfo.settings.enabled}
              onCheckedChange={(enabled) =>
                handleSettingChange("enabled", enabled)
              }
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
                defaultValue={[iconPackInfo.settings.cornerRadius]}
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
                defaultValue={[iconPackInfo.settings.opacity]}
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
          {iconPackInfo.files?.map((file) =>
            file.hasIcon ? (
              <Image
                key={file.id}
                src={
                  "packs\\" +
                  iconPackInfo.metadata.id +
                  "\\icons\\" +
                  file.id +
                  ".png"
                }
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

function PackEdit({
  iconPackId,
  setPack,
  loadPackInfo,
  setEditingIconPack,
}: PackContentProps) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [iconPackInfo, setIconPackInfo] = useState(
    main.IconPack.createFrom({})
  );

  const [addIconsFromDesktopRunning, setAddIconsFromDesktopRunning] =
    useState(false);
  const [addIconsRunning, setAddIconsRunning] = useState(false);
  const running = addIconsFromDesktopRunning || addIconsRunning;

  useEffect(() => {
    GetIconPack(iconPackId).then((iconPack) => {
      setIconPackInfo(iconPack);
      setLoading(false);
    });
  }, []);

  const handleAddIconsFromDesktop = () => {
    setAddIconsFromDesktopRunning(true);

    setTimeout(() => {
      setAddIconsFromDesktopRunning(false);
    }, 2000);
  };

  const handleAddIcon = () => {
    setAddIconsRunning(true);

    setTimeout(() => {
      setAddIconsRunning(false);
    }, 2000);
  };

  if (loading) {
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
    <div className="flex flex-col w-full">
      <div className="shadow-bottom-sm flex justify-between items-center bg-muted px-3 h-16">
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
        <div className="flex gap-2">
          <Button>Save</Button>
          <Button variant="destructive">Cancel</Button>
        </div>
      </div>
      <div className="flex flex-col h-[calc(100vh-5.5rem-4rem)] w-full overflow-x-hidden overflow-y-auto">
        <Accordion type="single" collapsible className="w-full">
          {iconPackInfo.files.map((file) => (
            <AccordionItem value={file.id}>
              <AccordionTrigger className="p-2">
                <div className="flex items-center gap-2">
                  <Image
                    src={
                      "packs\\" +
                      iconPackInfo.metadata.id +
                      "\\icons\\" +
                      file.id +
                      ".png"
                    }
                    className="w-8 h-8"
                    unkown
                  />
                  {file.name}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {String(setPack) +
                  String(loadPackInfo) +
                  String(setEditingIconPack)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
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
              <FormLabel>
                {t("my_packs.card.pack_information.information.icon.label")}
              </FormLabel>
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
              <FormLabel>
                {" "}
                {t("my_packs.card.pack_information.information.name.label")}
              </FormLabel>
              <FormControl>
                <Input
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
