module.exports = {
  apps: [
    {
      name: "mva-frontend",
      script: "npm",
      args: "start",
      cwd: "/root/mva-admin",
      env: {
        PORT: 3001,
        NODE_ENV: "production"
      },
      watch: false
    },
    {
      name: "mva-backend",
      script: "npm",
      args: "start",
      cwd: "/root/mva-backend",  // cambia esta ruta a la ruta real de tu backend
      env: {
        PORT: 3000,
        NODE_ENV: "production"
      },
      watch: false
    }
  ]
};
