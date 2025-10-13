# App Mobile - Gestión de Comercio

Una aplicación móvil desarrollada con React Native y Expo para que los dueños de comercio gestionen productos e ingredientes con una interfaz simple.

## 🚀 Características

- ✅ Gestión de Productos: Crear productos (nombre y cantidad)
- ✅ Gestión de Ingredientes: Crear ingredientes con datos básicos
- ✅ Interfaz Moderna: Diseño intuitivo y responsive

## 🛠️ Tecnologías

- React Native
- Expo
- TypeScript

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
├── screens/             # Pantallas principales
│   ├── HomeScreen.tsx         # Dashboard principal
│   ├── ProductosScreen.tsx    # Gestión de productos (solo agregar)
│   └── IngredientesScreen.tsx # Gestión de ingredientes (solo agregar)
├── styles/              # Estilos separados
├── types/               # Definiciones de TypeScript
├── utils/               # Funciones auxiliares
└── navigation/          # Configuración de navegación (futuro)
```

## 📱 Pantallas Implementadas

- Inicio con accesos rápidos
- Pantalla de Productos con modal para agregar
- Pantalla de Ingredientes con modal para agregar

## 🚀 Comandos

```bash
npm install
npm start
```

## Estado Actual

- Sin base de datos. Los formularios simulan guardado y cierran el modal.
- Toda la UI se mantiene. Solo están activas las acciones de agregar.
