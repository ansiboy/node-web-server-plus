requirejs.config({
    paths: {
        "maishu-chitu": "/node_modules/maishu-chitu/dist/index.min",
        "maishu-chitu-react": "/node_modules/maishu-chitu-react/dist/index.min",
        "maishu-chitu-service": "/node_modules/maishu-chitu-service/dist/index.min",
        "react": "/node_modules/react/umd/react.development",
        "react-dom": "/node_modules/react-dom/umd/react-dom.development"
    }
})

requirejs(["./application"])