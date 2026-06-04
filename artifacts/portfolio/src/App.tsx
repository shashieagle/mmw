import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Studio from "@/pages/Films";
import FilmDetail from "@/pages/FilmDetail";
import Upload from "@/pages/Upload";
import Architects from "@/pages/Architects";
import Catalyst from "@/pages/Catalyst";
import { AdminLock } from "@/components/AdminLock";
import { FireOrb } from "@/components/FireOrb";
import { MonkChat } from "@/components/MonkChat";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/studio" component={Studio} />
      <Route path="/films" component={Studio} />
      <Route path="/film/:id" component={FilmDetail} />
      <Route path="/architects" component={Architects} />
      <Route path="/catalyst" component={Catalyst} />
      <Route path="/upload" component={Upload} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        <AdminLock />
        {/* FireOrb disabled — say "bring back FireOrb" to re-enable */}
      {false && <FireOrb />}
        <MonkChat />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
