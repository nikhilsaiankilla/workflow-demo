import React, { useState, useMemo, useRef, useEffect } from 'react'

type Item = {
    id: number
    label: string
    checked: boolean
}

const seedItems: Item[] = Array.from({ length: 14 }).map((_, i) => ({
    id: i + 1,
    label: `Item ${i + 1}`,
    checked: false,
}))

const SHORTCUTS: { keys: string[]; description: string }[] = [
    { keys: ['Shift', 'Click'], description: 'Select a range of items, anchored to the last clicked row' },
    { keys: ['/',], description: 'Focus the search box' },
    { keys: ['?'], description: 'Open this shortcuts panel' },
    { keys: ['Esc'], description: 'Close this panel / clear search focus' },
    { keys: ['C'], description: 'Toggle the checkbox column' },
]

const ItemsContainer = () => {
    const [items, setItems] = useState<Item[]>(seedItems)
    const [showChecks, setShowChecks] = useState<boolean>(false)
    const [query, setQuery] = useState<string>('')
    const [showShortcuts, setShowShortcuts] = useState<boolean>(false)
    const lastClickedIndex = useRef<number | null>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    const filteredItems = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return items
        return items.filter(
            (item) => item.label.toLowerCase().includes(q) || String(item.id).includes(q)
        )
    }, [items, query])

    const visibleCheckedCount = filteredItems.filter((i) => i.checked).length
    const allVisibleChecked = filteredItems.length > 0 && visibleCheckedCount === filteredItems.length
    const someVisibleChecked = visibleCheckedCount > 0 && !allVisibleChecked

    const handleCheckBox = (id: number) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
        )
    }

    // Master toggle: flips all *currently visible* (filtered) items to a single state
    const handleMasterToggle = () => {
        const nextState = !allVisibleChecked
        const visibleIds = new Set(filteredItems.map((i) => i.id))
        setItems((prev) =>
            prev.map((item) => (visibleIds.has(item.id) ? { ...item, checked: nextState } : item))
        )
    }

    // Row click handles range select via shift, regardless of whether checkboxes are shown
    const handleRowClick = (idx: number, id: number, e: React.MouseEvent) => {
        if (e.shiftKey && lastClickedIndex.current !== null) {
            const start = Math.min(lastClickedIndex.current, idx)
            const end = Math.max(lastClickedIndex.current, idx)
            const rangeIds = new Set(filteredItems.slice(start, end + 1).map((i) => i.id))
            setItems((prev) =>
                prev.map((item) => (rangeIds.has(item.id) ? { ...item, checked: true } : item))
            )
        } else {
            handleCheckBox(id)
            lastClickedIndex.current = idx
        }
    }

    const search = (value: string) => setQuery(value)

    // Keyboard shortcuts
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const isTyping =
                document.activeElement instanceof HTMLInputElement ||
                document.activeElement instanceof HTMLTextAreaElement

            if (e.key === '?' && !isTyping) {
                e.preventDefault()
                setShowShortcuts((s) => !s)
            } else if (e.key === '/' && !isTyping) {
                e.preventDefault()
                searchRef.current?.focus()
            } else if (e.key === 'Escape') {
                if (showShortcuts) setShowShortcuts(false)
                else searchRef.current?.blur()
            } else if ((e.key === 'c' || e.key === 'C') && !isTyping) {
                setShowChecks((s) => !s)
            }
        }
        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [showShortcuts])

    const colCount = showChecks ? 3 : 2

    return (
        <div className="min-h-screen w-full bg-stone-50 text-stone-900 px-6 py-10 md:px-12">
            <div className="mx-auto max-w-3xl">
                <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-stone-300">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Interview Task</h1>
                        <p className="text-sm text-stone-500 mt-1">
                            {filteredItems.length} of {items.length} items
                            {visibleCheckedCount > 0 ? ` · ${visibleCheckedCount} checked` : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <input
                                ref={searchRef}
                                type="text"
                                value={query}
                                placeholder="Search items…"
                                onChange={(e) => search(e.target.value)}
                                className="px-3 py-2 pr-12 border border-stone-300 bg-white w-full md:w-64 focus:border-stone-900 focus:outline-none rounded-md text-sm transition-colors"
                            />
                            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 border border-stone-300 rounded px-1.5 py-0.5 pointer-events-none">
                                /
                            </kbd>
                        </div>
                        <button
                            className="px-3 py-2 bg-stone-900 hover:bg-stone-700 transition-colors rounded-md text-xs font-medium text-white cursor-pointer whitespace-nowrap"
                            onClick={() => setShowChecks((s) => !s)}
                        >
                            {showChecks ? 'Hide checks' : 'Show checks'}
                        </button>
                        <button
                            className="px-3 py-2 border border-stone-300 hover:border-stone-900 transition-colors rounded-md text-xs font-medium text-stone-700 cursor-pointer whitespace-nowrap"
                            onClick={() => setShowShortcuts(true)}
                            aria-label="Show keyboard shortcuts"
                        >
                            Shortcuts
                            <kbd className="ml-1.5 text-[10px] text-stone-400 border border-stone-300 rounded px-1 py-0.5">
                                ?
                            </kbd>
                        </button>
                    </div>
                </div>

                <div className="w-full mt-6 rounded-lg border border-stone-300 bg-white overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr
                                className="grid border-b border-stone-300 bg-stone-100 text-xs font-semibold uppercase tracking-wide text-stone-500"
                                style={{ gridTemplateColumns: showChecks ? '56px 1fr 2fr' : '1fr 2fr' }}
                            >
                                {showChecks && (
                                    <th className="px-4 py-3 flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            aria-label="Select all visible items"
                                            checked={allVisibleChecked}
                                            ref={(el) => {
                                                if (el) el.indeterminate = someVisibleChecked
                                            }}
                                            onChange={handleMasterToggle}
                                            className="w-4 h-4 accent-stone-900 cursor-pointer"
                                        />
                                    </th>
                                )}
                                <th className="px-4 py-3 text-left">Id</th>
                                <th className="px-4 py-3 text-left">Label</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={colCount} className="px-4 py-10 text-center text-sm text-stone-400">
                                        No items match "{query}".
                                    </td>
                                </tr>
                            )}
                            {filteredItems.map((item, idx) => (
                                <tr
                                    key={item.id}
                                    onClick={(e) => handleRowClick(idx, item.id, e)}
                                    className={`grid border-b last:border-b-0 border-stone-200 cursor-pointer select-none transition-colors ${item.checked ? 'bg-stone-100' : 'hover:bg-stone-50'
                                        }`}
                                    style={{ gridTemplateColumns: showChecks ? '56px 1fr 2fr' : '1fr 2fr' }}
                                >
                                    {showChecks && (
                                        <td className="px-4 py-3 flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={item.checked}
                                                onChange={() => { }}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-4 h-4 accent-stone-900 cursor-pointer pointer-events-none"
                                                tabIndex={-1}
                                            />
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-sm text-stone-500">{item.id}</td>
                                    <td className="px-4 py-3 text-sm font-medium">{item.label}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className="text-xs text-stone-400 mt-3">
                    Click a row to toggle it. Hold <kbd className="border border-stone-300 rounded px-1">Shift</kbd> and
                    click another row to select everything in between — works even with the checkbox column hidden.
                </p>
            </div>

            {showShortcuts && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
                    onClick={() => setShowShortcuts(false)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-stone-200"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Keyboard shortcuts"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Keyboard shortcuts</h2>
                            <button
                                onClick={() => setShowShortcuts(false)}
                                className="text-stone-400 hover:text-stone-900 transition-colors cursor-pointer text-sm"
                                aria-label="Close"
                            >
                                Esc
                            </button>
                        </div>
                        <ul className="space-y-3">
                            {SHORTCUTS.map((s, i) => (
                                <li key={i} className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-stone-600">{s.description}</span>
                                    <span className="flex items-center gap-1 shrink-0">
                                        {s.keys.map((k, j) => (
                                            <kbd
                                                key={j}
                                                className="text-[11px] font-medium border border-stone-300 bg-stone-50 rounded px-1.5 py-0.5"
                                            >
                                                {k}
                                            </kbd>
                                        ))}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ItemsContainer