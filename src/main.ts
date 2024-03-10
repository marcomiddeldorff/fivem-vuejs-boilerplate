/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import './styles/style.css';
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins

createApp(App).mount("#app");
