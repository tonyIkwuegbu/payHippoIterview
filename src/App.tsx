import { SearchableList } from "./components/SearchableList";

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-y-6 bg-white font-normal text-slate-800">
      <header className="w-full border border-b-slate-200 px-4 py-2">
        <h1>Searchable List</h1>
      </header>
      <main className="w-full max-w-screen-xl p-4">
        <SearchableList />
      </main>
    </div>
  );
}

export default App;
