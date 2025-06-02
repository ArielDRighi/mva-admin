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
      watch: false,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_restarts: 3
    },
    {
      name: "mva-backend",
      script: "npm",
      args: "start",
      cwd: "/root/mva-backend",
      env: {
        PORT: 3002,
        NODE_ENV: "production"
      },
      watch: false,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_restarts: 3
    }
  ]
};
