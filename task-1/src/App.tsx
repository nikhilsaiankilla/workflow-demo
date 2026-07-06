import { useEffect, useMemo, useState } from "react";
import { useStore } from "./store/useStore"
import { debounce } from "./hooks/debouce";
import ItemsContainer from "./itemscontainer";

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ['Shift', 'Click'], description: 'Select a range of items, anchored to the last clicked row' },
  { keys: ['/',], description: 'Focus the search box' },
  { keys: ['?'], description: 'Open this shortcuts panel' },
  { keys: ['Esc'], description: 'Close this panel / clear search focus' },
  { keys: ['C'], description: 'Toggle the checkbox column' },
]

function App() {
  const { toggleCheckedFunc, seedItems, toggleChecked, items, toggleItem, removeItem, addItem } = useStore();

  const [query, setQuery] = useState("");
  const [name, setName] = useState("")
  const [checked, setChecked] = useState(false)
  const [open, setOpen] = useState(false)
  const [showSortKeys, setShowSortKeys] = useState(false)
  const [lastCheckedId, setLastCheckedId] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);

  // add seed items on load no dependencies because only add on first load!
  useEffect(() => {
    seedItems();
  }, [])

  const debouceSearch = debounce((q: string) => {
    setQuery(q)
  }, 300)

  const handleAddItem = () => {
    if (!name) {
      return
    }
    addItem(name, checked)
    setOpen(false)
  }

  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      const isTyping =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;

      if (e.key === "?" && !isTyping) {
        e.preventDefault();
        setShowSortKeys(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSortKeys(false);
        setOpen(false)
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleToggleRange = (lastCheckedId: string, currentId: string) => {
    const lastCheckedIndex = items.findIndex((item) => item.id === lastCheckedId);
    const currentIndex = items.findIndex((item) => item.id === currentId);

    if (lastCheckedIndex !== -1 && currentIndex !== -1) {
      const start = Math.min(lastCheckedIndex, currentIndex);
      const end = Math.max(lastCheckedIndex, currentIndex);

      for (let i = start; i <= end; i++) {
        items[i].checked = true;
      }
    }
  }
  return (
    <div className="bg-orange-200 min-h-screen px-5 md:px-10 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="w-full flex items-center justify-between">
          <h1 className="text-lg font-bold font-mono">Dashboard</h1>
          <div className="flex items-center gap-3">
            <input
              type="text"
              className="px-4 py-2 rounded-lg ring-red-500 focus:border-red-500 text-black bg-white"
              onChange={(e) => debouceSearch(e.target.value)}
            />
            <button
              onClick={toggleCheckedFunc}
              className="px-4 py-2 rounded-xl bg-black text-white text-xs cursor-pointer"
            >
              Show Checked
            </button>
            <button
              onClick={() => setOpen(true)}
              className="px-4 py-2 rounded-xl bg-black text-white text-xs cursor-pointer"
            >
              Add Item
            </button>
            <kbd>
              ? open shortkeys
            </kbd>
          </div>
        </div>

        <div className="w-full py-5">
          <table className="w-full bg-white">
            <thead className="w-full">
              <tr className={`w-full grid ${toggleChecked ? 'grid-cols-4' : 'grid-cols-3'} border-2 border-black`}>
                <th className={`py-4 border-r-2 ${toggleChecked ? 'block' : 'hidden'}`}>
                  Checked
                </th>
                <th className={`w-full border-r-2 py-4`}>
                  Id
                </th>
                <th className={`border-r-2 py-4`}>
                  Name
                </th>
                <th className={`py-4`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {
                filteredItems && filteredItems.map((item, idx) =>
                  <tr className={`w-full grid ${toggleChecked ? 'grid-cols-4' : 'grid-cols-3'} border-x-2 border-b-2 border-black`} key={idx}>
                    <th className={`w-full py-2 border-r-2 ${toggleChecked ? 'block' : 'hidden'}`}>
                      <input type="checkbox" checked={item.checked} className="cursor-pointer w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
                        onClick={(e) => {
                          if (e.shiftKey) {
                            // Range selection
                            console.log('Shift key pressed. Selecting range...');
                            if (lastCheckedId) {
                              console.log('Last checked ID:', lastCheckedId, 'Current ID:', item.id);
                              handleToggleRange(lastCheckedId, item.id);
                            }
                            setLastCheckedId(item.id);
                          } else {
                            // Normal selection
                            setLastCheckedId(item.id);
                          }
                          toggleItem(item.id);
                        }}
                      />
                    </th>
                    <th className={`border-r-2`}>
                      {
                        item.id.slice(0, 8)
                      }
                    </th>
                    <th className={`border-r-2`}>
                      {
                        item.name
                      }
                    </th>
                    <th className="py-1">
                      <button onClick={() => removeItem(item.id)} className="text-sm px-4 py-1 text-red-500 cursor-pointer border border-red-500 bg-red-500/10 rounded-lg">
                        Delete
                      </button>
                    </th>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>

        <div className={`w-screen h-screen backdrop:backdrop-blur-md fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 ${open ? 'block' : 'hidden'}`} />

        <dialog className="w-full max-w-sm bg-white shadow-sm rounded-lg p-5 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20" open={open}>
          <div className="w-full">
            <h1>Add Item into the list</h1>
            <div className="w-full py-5 space-y-5">
              <div className="flex flex-col gap-2">
                <label>
                  Name
                </label>
                <input type="text" placeholder="Enter Name of the item" className="px-2 py-1.5 border-black outline-black" onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <label>
                  Checked
                </label>
                <input type="checkbox" placeholder="Enter Name of the item" className="cursor-pointer w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft" checked={checked} onClick={(e) => setChecked(!checked)} />
              </div>
              <button className="w-full px-4 py-2 h-10 bg-green-500" onClick={handleAddItem}>
                Submit
              </button>
            </div>
          </div>
          <button className="w-full px-4 py-2 h-10 bg-translate text-black border border-black rounded-lg" onClick={() => setOpen(false)}>
            Close
          </button>
        </dialog>

        <dialog
          className="w-full max-w-sm bg-white shadow-sm rounded-lg p-5 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          open={showSortKeys}
        >
          <button className="w-full px-4 py-2 h-10 bg-translate text-black border border-black rounded-lg" onClick={() => setShowSortKeys(false)}>
            Close
          </button>
        </dialog>
      </div>
    </div>
  )
}

export default App
