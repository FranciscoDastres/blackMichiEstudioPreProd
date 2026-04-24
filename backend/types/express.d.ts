declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        nombre: string;
        email: string;
        rol: string;
        auth_id: string;
      };
    }
  }
}

export {};
