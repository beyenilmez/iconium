import { ThemeProvider } from "./contexts/theme-provider";
import ModeToggle from "@/components/ModeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TitleBar from "./components/TitleBar";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="flex flex-col h-dvh">
        <TitleBar />
        <Tabs defaultValue="packs" className="w-full h-full">
          <TabsList className="justify-between px-3 py-7 rounded-none w-full">
            <div>
              <TabsTrigger value="packs">My Packs</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </div>
            <ModeToggle />
          </TabsList>
          <TabsContent value="packs">See your packs here.</TabsContent>
          <TabsContent value="edit">Edit your packs here.</TabsContent>
          <TabsContent value="settings">Settings</TabsContent>
        </Tabs>
      </div>
    </ThemeProvider>
  );
}

export default App;
