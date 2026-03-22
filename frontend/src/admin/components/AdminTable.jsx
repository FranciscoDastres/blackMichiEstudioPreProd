export default function AdminTable({ columns, data }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
            <table className="min-w-full text-sm text-white">
                <thead className="bg-gray-700">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.accessor || col.header}
                                className="px-4 py-2 text-left text-xs font-bold uppercase"
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
                            className="border-t border-gray-700 hover:bg-gray-700"
                        >
                            {columns.map((col) => {
                                const value = row[col.accessor];

                                return (
                                    <td
                                        key={col.accessor || col.header}
                                        className="px-4 py-2"
                                    >
                                        {col.cell
                                            ? col.cell(value, row)
                                            : value ?? "—"}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}