// frontend/src/admin/components/AdminTable.jsx
export default function AdminTable({ columns, data }) {
    return (
        <div className="relative overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/60 backdrop-blur shadow-xl">
            <table className="min-w-full text-sm text-gray-200">
                <thead className="bg-gray-950/60 border-b border-gray-800">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.accessor || col.header}
                                className="px-5 py-3 text-left font-semibold tracking-wide text-gray-300 uppercase text-xs"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr
                            key={row.id ?? index}
                            className="border-t border-gray-800 hover:bg-gray-800/40 transition-colors"
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.accessor || col.header}
                                    className="px-5 py-4 text-gray-100 whitespace-nowrap"
                                >
                                    {col.cell
                                        ? col.cell(row[col.accessor], row)
                                        : row[col.accessor] ?? '—'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
        </div>
    );
}