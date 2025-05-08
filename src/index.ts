import server from "./server";
import preciosRoutes from "./routes/preciosRoutes";

// Añadir rutas de precios
server.use('/api/precios', preciosRoutes);

const port = process.env.PORT || 4000;

server.listen(port, () => {
    console.log(`REST API funcionando en el puerto ${port}`);
});