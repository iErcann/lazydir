import { FileManagerPane } from "./components/FileManagerPane";

 
function App() {
  return (
    <div className="h-screen w-screen bg-gray-700">
      <FileManagerPane pane={{ 
        id: "Root",
        path: "/",
        name: "Root",
        viewMode: "grid",
        sortBy: "size",

      }} />
    </div>
  );
}

export default App;
