export default function Security() {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Seguridad</h2>

            <div className="border rounded p-4 bg-white space-y-2">
                <p className="text-sm text-gray-600">
                    Aquí podrás cambiar tu contraseña y gestionar la seguridad
                    de tu cuenta.
                </p>

                <button
                    disabled
                    className="px-4 py-2 text-sm rounded bg-gray-300 text-gray-600 cursor-not-allowed"
                >
                    Cambiar contraseña (próximamente)
                </button>
            </div>
        </div>
    );
}
