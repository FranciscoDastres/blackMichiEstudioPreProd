export default function Profile() {
    // datos mock temporales
    const user = {
        name: "Usuario demo",
        email: "usuario@correo.cl",
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Perfil</h2>

            <div className="border rounded p-4 bg-white space-y-2">
                <p>
                    <strong>Nombre:</strong> {user.name}
                </p>
                <p>
                    <strong>Email:</strong> {user.email}
                </p>
            </div>
        </div>
    );
}
