module.exports = {
  apps: [
    {
      name: 'pulsework-crm',
      script: 'npx',
      args: 'vite preview --host 0.0.0.0 --port 3000',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
