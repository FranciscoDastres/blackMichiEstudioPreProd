interface Column {
    header: string;
    accessor?: string;
    cell?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface AdminTableProps {
    columns: Column[];
    data: Record<string, unknown>[];
}

export default function AdminTable({ columns, data }: AdminTableProps) {
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
                            key={(row.id as number | string) ?? index}
                            className="border-t border-gray-700 hover:bg-gray-700"
                        >
                            {columns.map((col) => {
                                const value = col.accessor ? row[col.accessor] : undefined;

                                return (
                                    <td
                                        key={col.accessor || col.header}
                                        className="px-4 py-2"
                                    >
                                        {col.cell
                                            ? col.cell(value, row)
                                            : (value as React.ReactNode) ?? "—"}
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
