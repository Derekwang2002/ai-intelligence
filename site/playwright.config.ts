import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests/browser',timeout:30000,use:{baseURL:'http://127.0.0.1:4321',headless:true},workers:2,reporter:'list',webServer:{command:'npm run dev -- --host 127.0.0.1',url:'http://127.0.0.1:4321',reuseExistingServer:!process.env.CI}});
