module.exports = {
  apps: [
    {
      name: "rastino",
      script: ".next/standalone/server.js",
      interpreter: "node",
      cwd: "/home/sorena/multi-llm-hub",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: "650M",
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      kill_timeout: 8000,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "0.0.0.0",
        RASTINO_PROJECT_ROOT: "/home/sorena/multi-llm-hub",
      },
      error_file: "/home/sorena/.pm2/logs/rastino-error.log",
      out_file: "/home/sorena/.pm2/logs/rastino-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
