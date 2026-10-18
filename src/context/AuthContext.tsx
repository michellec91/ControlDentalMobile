
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

type User = {
    id_usuario?: number;
    id_user?: number;
    nombre?: string;
    apellido?: string;
    telefono?: string;
    correo?: string;
    name?: string;
    email?: string;
    rol?: string;
    estado?: string;
    imagen_perfil?: string | null;
};

type AuthContextType = {
    usuario: User | null;
    cargandoSesion: boolean;
    login: (userData: User) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(
    {} as AuthContextType
);

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [usuario, setUser] = useState<User | null>(null);
    const [cargandoSesion, setCargandoSesion] = useState(true);

    // Recuperar los datos guardados al abrir la aplicación.
    useEffect(() => {
        const cargarSesion = async () => {
            try {
                const usuarioGuardado =
                    await AsyncStorage.getItem("usuario");

                if (usuarioGuardado) {
                    setUser(JSON.parse(usuarioGuardado));
                }
            } catch (error) {
                console.error(
                    "Error al cargar la sesión:",
                    error
                );
            } finally {
                setCargandoSesion(false);
            }
        };

        cargarSesion();
    }, []);

    // Guardar los datos del usuario al iniciar sesión
    // o cuando se actualicen, incluida la foto de perfil.
    const login = async (userData: User) => {
        try {
            setUser(userData);

            await AsyncStorage.setItem(
                "usuario",
                JSON.stringify(userData)
            );
        } catch (error) {
            console.error(
                "Error al guardar la sesión:",
                error
            );

            throw error;
        }
    };

    // Eliminar los datos guardados al cerrar sesión.
    const logout = async () => {
        try {
            setUser(null);
            await AsyncStorage.removeItem("usuario");
        } catch (error) {
            console.error(
                "Error al cerrar la sesión:",
                error
            );

            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                cargandoSesion,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
