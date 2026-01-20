// Reemplaza el hook useAuth interno por este:
function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token"); // ← ¡Aquí va "token", no "authToken"!
        if (token) {
            // Opcional: si guardas el objeto user en localStorage, puedes cargarlo así:
            const userData = localStorage.getItem("user");
            setUser(userData ? JSON.parse(userData) : { id: "unknown" });
        }
        setLoading(false);
    }, []);

    return { user, loading, isLoggedIn: !!localStorage.getItem("token") };
}