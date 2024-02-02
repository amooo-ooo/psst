import './app.css'
import './styles/chat.scss'
import './styles/message.scss'
import './styles/contacts.scss'
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app'),
})

export default app
