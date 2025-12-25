import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FileManager } from "./components/FileManager";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FileManager />
    </QueryClientProvider>
  );
}

export default App;
